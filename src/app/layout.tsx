import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "생일 선물 위시리스트",
  description: "받고 싶은 선물을 등록하고 친구들과 겹치지 않게 예약해요",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
