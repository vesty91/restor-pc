import { redirect } from "next/navigation";

/** Ancienne URL → nouvel espace admin */
export default function AtelierRedirect() {
  redirect("/admin");
}
