import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import Header from "@/components/Header"; // <--- Import Header

// Cấu hình font Inter
const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter", // Tạo biến CSS để Tailwind v4 dùng
});

export const metadata: Metadata = {
  title: "Leanova - Nền tảng học trực tuyến",
  description: "Học mọi lúc, mọi nơi cùng Leanova",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <AntdRegistry>
          {/* Chèn Header vào trước children */}
          <Header />

          {/* Khung nội dung chính của các trang */}
          <main className="min-h-screen bg-white">
            {children}
          </main>
        </AntdRegistry>
      </body>
    </html>
  );
}