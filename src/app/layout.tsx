import type { Metadata, Viewport } from "next";
import { Inter, Sora } from "next/font/google";
import { cookies } from "next/headers";
import { BRAND } from "@/lib/constants";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const sora = Sora({ variable: "--font-sora", subsets: ["latin"], display: "swap", weight: ["500", "600", "700", "800"] });

export const metadata: Metadata = {
  metadataBase: new URL(BRAND.url),
  title: {
    default: `${BRAND.name} — MRCP Part 1 Question Bank, Past Papers & Mock Exams`,
    template: `%s | ${BRAND.name}`,
  },
  description: BRAND.description,
  keywords: ["MRCP Part 1", "MRCP question bank", "MRCP past papers", "MRCP mock exam", "MRCP revision", "best of five"],
  openGraph: {
    type: "website",
    siteName: BRAND.name,
    title: `${BRAND.name} — MRCP Part 1 revision that tells you when you are ready`,
    description: BRAND.description,
    url: BRAND.url,
  },
  twitter: { card: "summary_large_image", title: BRAND.name, description: BRAND.description },
  icons: { icon: "/icon.svg" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafaf7" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1520" },
  ],
  width: "device-width",
  initialScale: 1,
};

const themeScript = `(function(){try{var t=document.documentElement.getAttribute('data-theme')||'system';var d=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);}catch(e){}})();`;

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const jar = await cookies();
  const theme = jar.get("medascend_theme")?.value ?? "system";
  return (
    <html lang="en" data-theme={theme} className={`${inter.variable} ${sora.variable} h-full`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col bg-bg text-fg">{children}</body>
    </html>
  );
}
