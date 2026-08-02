import { randomBytes } from "crypto";

const KEY_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateLicenseKey(): string {
  const part = (n: number) => {
    const buf = randomBytes(n);
    let out = "";
    for (let i = 0; i < n; i++) {
      out += KEY_ALPHABET[buf[i]! % KEY_ALPHABET.length];
    }
    return out;
  };
  return `RPC-${part(4)}-${part(4)}-${part(4)}`;
}

export function generateSharePassword(length = 10): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const buf = randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) {
    out += alphabet[buf[i]! % alphabet.length];
  }
  return out;
}
