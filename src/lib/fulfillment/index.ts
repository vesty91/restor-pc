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
};

export type FulfillResult = {
  licenseKey: string;
  downloadUrl: string;
  downloadPassword: string;
  expireTimes: number;
  toolTitle: string;
  scriptId: string;
  orderId: string;
};

export async function fulfillToolOrder(input: FulfillInput): Promise<FulfillResult> {
  const product = getProductBySlug(input.toolSlug);
  if (!product) throw new Error(`Produit inconnu: ${input.toolSlug}`);

  const email = input.email.trim().toLowerCase();
  if (!email || !email.includes("@")) throw new Error("Email invalide");

  const sb = getSupabaseAdmin();

  // Idempotence Stripe / atelier
  const { data: existing } = await sb
    .from("tool_orders")
    .select("id, license_key, share_url, share_password, expire_times, tool_title, script_id")
    .eq("order_ref", input.orderRef)
    .maybeSingle();

  if (existing?.license_key && existing.share_url && existing.share_password) {
    if (input.sendEmail !== false) {
      await sendPurchaseEmail({
        to: email,
        toolTitle: existing.tool_title || product.title,
        licenseKey: existing.license_key,
        downloadUrl: existing.share_url,
        downloadPassword: existing.share_password,
        expireTimes: existing.expire_times ?? 1,
      });
    }
    return {
      licenseKey: existing.license_key,
      downloadUrl: existing.share_url,
      downloadPassword: existing.share_password,
      expireTimes: existing.expire_times ?? 1,
      toolTitle: existing.tool_title || product.title,
      scriptId: existing.script_id || product.scriptId,
      orderId: existing.id,
    };
  }

  const licenseKey = generateLicenseKey();
  const sharePassword = generateSharePassword();
  const expireTimes = 1;
  const filePath = getNasFilePath(product);
  const scriptId = product.scriptId;
  const maxMachines = scriptId === "*" ? 1 : 1; // pack aussi 1 PC

  const { error: licErr } = await sb.from("script_licenses").insert({
    license_key: licenseKey,
    script_id: scriptId,
    status: "active",
    note: `${input.source}:${input.toolSlug}:${email}`,
    max_machines: maxMachines,
  });
  if (licErr) throw new Error(`Licence insert: ${licErr.message}`);

  const share = await createNasOneTimeShare({
    filePath,
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

  if (input.sendEmail !== false) {
    await sendPurchaseEmail({
      to: email,
      toolTitle: product.title,
      licenseKey,
      downloadUrl: share.url,
      downloadPassword: share.password,
      expireTimes,
    });
  }

  return {
    licenseKey,
    downloadUrl: share.url,
    downloadPassword: share.password,
    expireTimes,
    toolTitle: product.title,
    scriptId,
    orderId: orderRow.id,
  };
}

export function isPack(product: OutilTool | OutilPack): product is OutilPack {
  return "isPack" in product && product.isPack === true;
}
