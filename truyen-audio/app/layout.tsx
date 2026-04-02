import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Providers from "@/components/Providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Truyện Audio",
  description: "Nền tảng nghe truyện audio trực tuyến",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('error', function(e) {
                console.error('[Global Error]', e.error || e.message);
                // Reduced severity: don't wipe the page, just log it.
                // MobileDebugLogger will catch this and show it in the bug menu.
              });
              window.addEventListener('unhandledrejection', function(e) {
                console.error('[Unhandled Promise]', e.reason);
              });
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#0f0f23] text-gray-200">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
