import type { Metadata, Viewport } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";

// ✅ استخدم الـ Wrapper الجديد
import SessionProviderWrapper from "../components/SessionProviderWrapper";


const cairo = Cairo({
  subsets: ["arabic"],
  display: "swap",
  variable: "--font-cairo",
});

export const metadata: Metadata = {
  title: "منصة الخدمات الذكية | Smart Services Platform",
  description: "خدماتك اليومية في متناول يدك",
};

// ⚠️ ملاحظة: في Next.js 15 لازم تحط viewport في export مستقل:
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable} suppressHydrationWarning>
      <body className={`${cairo.className} antialiased light-page`}>
        <SessionProviderWrapper>
          {children}
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
