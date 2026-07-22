import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Restor-PC — Dépannage informatique Yerres",
    short_name: "Restor-PC",
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: "#0b1220",
    theme_color: "#0060cb",
    lang: "fr",
    icons: [
      {
        src: "/brand/restor-pc-logo.png",
        sizes: "401x119",
        type: "image/png",
      },
      {
        src: "/icon",
        sizes: "32x32",
        type: "image/png",
      },
    ],
  };
}
