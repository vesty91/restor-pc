import {
  getNasFilePath,
  getProductBySlug,
  type OutilPack,
  type OutilTool,
} from "@/lib/data/outils";
import { sendPurchaseEmail } from "@/lib/fulfillment/email";
import { generateLicenseKey, generateSharePassword } from "@/lib/fulfillment/keys";
import { createNasOneTimeShare } from "@/lib/fulfillment/nas";
import { getSupabaseAdmin } from "@/lib/fulfillment/supabase";

export type FulfillInput = {
  email: string;
  toolSlug: string;
  /** Stripe session id or atelier-xxx */
  orderRef: string;
  source: "stripe" | "atelier";
  sendEmail?: boolean;
  /** Force un nouvel envoi meme si deja envoye */
  forceEmail?: boolean;
};

export type FulfillResult = {
  licenseKey: string;
  downloadUrl: string;
  downloadPassword: string;
  expireTimes: number;
  toolTitle: string;
  scriptId: string;
  orderId: string;
  emailId?: string | null;
  emailError?: string | null;
};

async function trySendAndRecord(opts: {
  orderId: string;
  email: string;
  toolTitle: string;
  licenseKey: string;
  downloadUrl: string;
  downloadPassword: string;
  expireTimes: number;
  force?: boolean;
  alreadySentAt?: string | null;
}): Promise<{ emailId: string | null; emailError: string | null }> {
  if (!opts.force && opts.alreadySentAt) {
    return { emailId: null, emailError: null };
  }

  const sb = getSupabaseAdmin();
  try {
    const { id } = await sendPurchaseEmail({
      to: opts.email,
      toolTitle: opts.toolTitle,
      licenseKey: opts.licenseKey,
      downloadUrl: opts.downloadUrl,
      downloadPassword: opts.downloadPassword,
      expireTimes: opts.expireTimes,
    });
    await sb
      .from("tool_orders")
      .update({
        email_sent_at: new Date().toISOString(),
        email_id: id,
        email_error: null,
      })
      .eq("id", opts.orderId);
    return { emailId: id, emailError: null };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "email_failed";
    console.error("purchase email failed", opts.orderId, msg);
    await sb
      .from("tool_orders")
      .update({ email_error: msg.slice(0, 500) })
      .eq("id", opts.orderId);
    return { emailId: null, emailError: msg };
  }
}

export async function fulfillToolOrder(input: FulfillInput): Promise<FulfillResult> {
  const product = getProductBySlug(input.toolSlug);
  if (!product) throw new Error(`Produit inconnu: ${input.toolSlug}`);

  const email = input.email.trim().toLowerCase();
  if (!email || !email.includes("@")) throw new Error("Email invalide");

  const sb = getSupabaseAdmin();

  const { data: existing } = await sb
    .from("tool_orders")
    .select(
      "id, license_key, share_url, share_password, expire_times, tool_title, script_id, email_sent_at, email_id, email_error"
    )
    .eq("order_ref", input.orderRef)
    .maybeSingle();

  if (existing?.license_key && existing.share_url && existing.share_password) {
    let emailId = existing.email_id as string | null;
    let emailError = existing.email_error as string | null;
    if (input.sendEmail !== false) {
      const sent = await trySendAndRecord({
        orderId: existing.id,
        email,
        toolTitle: existing.tool_title || product.title,
        licenseKey: existing.license_key,
        downloadUrl: existing.share_url,
        downloadPassword: existing.share_password,
        expireTimes: existing.expire_times ?? 1,
        force: input.forceEmail === true,
        alreadySentAt: existing.email_sent_at,
      });
      emailId = sent.emailId ?? emailId;
      emailError = sent.emailError;
    }
    return {
      licenseKey: existing.license_key,
      downloadUrl: existing.share_url,
      downloadPassword: existing.share_password,
      expireTimes: existing.expire_times ?? 1,
      toolTitle: existing.tool_title || product.title,
      scriptId: existing.script_id || product.scriptId,
      orderId: existing.id,
      emailId,
      emailError,
    };
  }

  const licenseKey = generateLicenseKey();
  const sharePassword = generateSharePassword();
  const expireTimes = 1;
  const scriptId = product.scriptId;
  const maxMachines = 1;

  const { error: licErr } = await sb.from("script_licenses").insert({
    license_key: licenseKey,
    script_id: scriptId,
    status: "active",
    note: `${input.source}:${input.toolSlug}:${email}`,
    max_machines: maxMachines,
  });
  if (licErr) throw new Error(`Licence insert: ${licErr.message}`);

  const share = await createNasOneTimeShare({
    filePath: getNasFilePath(product),
    password: sharePassword,
    expireTimes,
  });

  const { data: orderRow, error: ordErr } = await sb
    .from("tool_orders")
    .insert({
      order_ref: input.orderRef,
      source: input.source,
      email,
      tool_slug: input.toolSlug,
      tool_title: product.title,
      script_id: scriptId,
      license_key: licenseKey,
      share_id: share.id,
      share_url: share.url,
      share_password: share.password,
      expire_times: expireTimes,
      status: "fulfilled",
    })
    .select("id")
    .single();

  if (ordErr) throw new Error(`Order insert: ${ordErr.message}`);

  let emailId: string | null = null;
  let emailError: string | null = null;
  if (input.sendEmail !== false) {
    const sent = await trySendAndRecord({
      orderId: orderRow.id,
      email,
      toolTitle: product.title,
      licenseKey,
      downloadUrl: share.url,
      downloadPassword: share.password,
      expireTimes,
      force: true,
    });
    emailId = sent.emailId;
    emailError = sent.emailError;
  }

  return {
    licenseKey,
    downloadUrl: share.url,
    downloadPassword: share.password,
    expireTimes,
    toolTitle: product.title,
    scriptId,
    orderId: orderRow.id,
    emailId,
    emailError,
  };
}

export function isPack(product: OutilTool | OutilPack): product is OutilPack {
  return "isPack" in product && product.isPack === true;
}
