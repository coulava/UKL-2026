"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const url = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/logout`;

      // Menembak endpoint logout sesuai data Postman kamu
      await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error("Gagal menembak API logout:", error);
    } finally {
      // Sesuai kriteria UKL: Hapus semua session token sampai bersih
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userRole");

      toast.success("Berhasil keluar akun", {
        className: "bg-blue-100 text-green-700",
      });

      setTimeout(() => {
        router.replace("/login");
      }, 1200);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-lg transition-all cursor-pointer disabled:bg-rose-300 text-sm"
    >
      {loading ? "Leaving..." : "Logout"}
    </button>
  );
}