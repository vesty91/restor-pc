import { readFile } from "fs/promises";
import { join } from "path";
import { ImageResponse } from "next/og";

export const alt = "Restor-PC — Dépannage informatique Yerres";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const logoData = await readFile(
    join(process.cwd(), "public/brand/restor-pc-logo.png")
  );
  const logoSrc = `data:image/png;base64,${logoData.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(145deg, #05080f 0%, #0a1628 50%, #003a7a 160%)",
          padding: 64,
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <img
          src={logoSrc}
          width={520}
          height={154}
          alt="Restor-PC"
          style={{
            objectFit: "contain",
            objectPosition: "left",
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              fontSize: 48,
              fontWeight: 700,
              letterSpacing: -2,
              maxWidth: 900,
              lineHeight: 1.1,
            }}
          >
            Diagnostic précis. Réparation soignée.
          </div>
          <div style={{ fontSize: 24, color: "rgba(255,255,255,0.7)", maxWidth: 700 }}>
            Atelier Yerres (91) · 3 rue Auber · Configurateur PC
          </div>
        </div>
      </div>
    ),
    size
  );
}
