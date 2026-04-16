import type { Metadata } from "next";
// import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

// const inter = Inter({
//   variable: "--font-inter",
//   subsets: ["latin"],
//   weight: ["400", "500", "600", "700"],
// });

export const metadata: Metadata = {
  title: "零壹 | 用 AI 帮助普通人成长",
  description:
    "帮助 99% 的普通人掌握 AI 应用能力。零门槛学习，场景实战，从「会聊天」到「会应用」，通过实践成长为建造者。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <link href="/fonts.css" rel="stylesheet" />
      </head>
      <body
        className="font-sans text-slate-500 antialiased overflow-x-hidden bg-cream"
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
