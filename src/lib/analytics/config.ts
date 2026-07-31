/** ID de mesure GA4 (public). Absent = analytics désactivé. */
export function getGaMeasurementId(): string | null {
  const raw = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();
  if (!raw) return null;
  // Format attendu : G-XXXXXXXXXX
  if (!/^G-[A-Z0-9]+$/i.test(raw)) return null;
  return raw;
}

export function isGaConfigured(): boolean {
  return getGaMeasurementId() !== null;
}
