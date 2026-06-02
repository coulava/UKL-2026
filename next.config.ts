import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "daily-bake-production.up.railway.app", // 🎯 Domain backend Railway kamu tanpa https://
        port: "",
        pathname: "/uploads/**", // 🎯 Mengizinkan Next.js membaca semua file di folder uploads
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000", // Sesuaikan dengan port backend lokalmu jika ada
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;