import type { Metadata } from "next";
// 1. Impor font Plus Jakarta Sans dari Google
import { Plus_Jakarta_Sans } from "next/font/google"; 
import "./globals.css";
import { Toaster } from "sonner"; // jika Anda pakai sonner toast

// 2. Konfigurasi font dan subset-nya
const jakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta", // Membuat CSS variable baru
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bakery Shop System",
  description: "Aplikasi Oven Kue Terbaik",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* 3. Masukkan class font ke dalam bodi */}
      <body className={`${jakartaSans.className} antialiased bg-gray-50 text-black`}>
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}