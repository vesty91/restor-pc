import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono, Syne } from "next/font/google";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { JsonLd } from "@/components/JsonLd";
import { MobileCtaBar } from "@/components/MobileCtaBar";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import { siteConfig, THEME_STORAGE_KEY } from "@/lib/site";
import "./globals.css";

const display = Syne({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const body = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — Dépannage informatique Yerres (91)`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: siteConfig.name,
    url: "/",
    title: `${siteConfig.name} — Dépannage informatique Yerres (91)`,
    description: siteConfig.description,
    images: [{ url: "/opengraph-image" }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — Dépannage informatique Yerres (91)`,
    description: siteConfig.description,
  },
  robots: { index: true, follow: true },
  other: {
    "theme-color": "#0060cb",
  },
};

const themeInitScript = `
(function(){
  try {
    var key=${JSON.stringify(THEME_STORAGE_KEY)};
    var stored=localStorage.getItem(key);
    var dark=stored==='dark'||(stored!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);
    if(dark){
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme='dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme='light';
    }
  } catch(e){}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${display.variable} ${body.variable} ${mono.variable} h-full`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col antialiased pb-20 md:pb-0">
        <ThemeProvider>
          <JsonLd />
          <a
            href="#contenu"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-paper focus:px-4 focus:py-2"
          >
            Aller au contenu
          </a>
          <AnnouncementBar />
          <Header />
          <main id="contenu" className="flex-1">
            {children}
          </main>
          <Footer />
          <MobileCtaBar />
          <ScrollToTop />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
