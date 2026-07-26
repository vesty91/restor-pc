import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["ssh2"],
  async redirects() {
    return [
      {
        source: "/conseils/depannage-informatique-domicile-paris",
        destination: "/conseils/depannage-informatique-domicile-yerres",
        permanent: true,
      },
      {
        source: "/services/assistance-distance",
        destination: "/services/depannage-informatique",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
