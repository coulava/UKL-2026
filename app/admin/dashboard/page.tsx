"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

interface UserData {
  id: number | string; // 🎯 FIX: Diubah agar fleksibel menerima tipe angka/string dari DB tanpa garis merah
  name: string;
  email: string;
  role: string;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [apiStatus, setApiStatus] = useState<"LOADING" | "CONNECTED" | "DISCONNECTED">("LOADING");

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);
      setApiStatus("LOADING");
      const token = localStorage.getItem("accessToken");
      
      if (!token) {
        toast.error("Sesi masuk habis, silakan login kembali.");
        setLoading(false);
        setApiStatus("DISCONNECTED");
        return;
      }

      try {
        const resUsers = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/users`, {
          method: "GET",
          headers: { 
            "Authorization": `Bearer ${token}`, 
            "Content-Type": "application/json" 
          }
        });

        const resProducts = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/products`, {
          method: "GET",
          headers: { 
            "Authorization": `Bearer ${token}`, 
            "Content-Type": "application/json" 
          }
        });

        if (!resUsers.ok || !resProducts.ok) {
          setApiStatus("DISCONNECTED");
        } else {
          const dataUsers = await resUsers.json();
          const listUsers = dataUsers?.data || dataUsers?.users || dataUsers || [];
          setUsers(Array.isArray(listUsers) ? listUsers : []);

          const dataProducts = await resProducts.json();
          const listProd = dataProducts?.data || dataProducts?.products || dataProducts || [];
          setTotalProducts(Array.isArray(listProd) ? listProd.length : 0);
          
          setApiStatus("CONNECTED");
        }
      } catch (error) {
        console.error("Dashboard Fetch Error:", error);
        setApiStatus("DISCONNECTED");
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  return (
    <div className="w-full text-gray-800">
      {/* 🎯 FIX Jarak: Tag <main> duplikat dan class `lg:pl-64` dihapus total agar layout kembali presisi dan rapi */}
      
      {/* Banner Welcome */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 rounded-2xl text-white shadow-md mb-8">
        <h1 className="text-2xl font-bold">Selamat Datang Di Dashboard Admin 👋</h1>
        <p className="text-blue-100 text-sm mt-1">
          Data di bawah ini disinkronkan langsung secara real-time dari database toko DailyBake.
        </p>
      </div>

      {/* Statistik Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">Total Pengguna Real</span>
          <h3 className="text-3xl font-bold text-gray-800 mt-2">
            {apiStatus === "DISCONNECTED" ? "0" : loading ? "..." : users.length} Orang
          </h3>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">Varian Kue Real</span>
          <h3 className="text-3xl font-bold text-gray-800 mt-2">
            {apiStatus === "DISCONNECTED" ? "0" : loading ? "..." : totalProducts} Jenis
          </h3>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">Status Akses API</span>
          <h3 className="mt-2 text-2xl font-bold">
            {apiStatus === "LOADING" && <span className="text-sky-500 animate-pulse">Checking...</span>}
            {apiStatus === "CONNECTED" && <span className="text-green-500">Connected</span>}
            {apiStatus === "DISCONNECTED" && <span className="text-red-500">Auth Required</span>}
          </h3>
        </div>
      </div>

      {/* Tabel Ringkasan Preview */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Aktivitas Pengguna Terbaru</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-sm text-gray-400 font-medium">
                <th className="pb-3">Nama</th>
                <th className="pb-3">Email</th>
                <th className="pb-3 text-center">Role Hak Akses</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-50 text-gray-600">
              {loading ? (
                <tr>
                  <td colSpan={3} className="py-6 text-center text-gray-400 animate-pulse">
                    Memuat ringkasan data...
                  </td>
                </tr>
              ) : users.length === 0 || apiStatus === "DISCONNECTED" ? (
                <tr>
                  <td colSpan={3} className="py-6 text-center text-red-400 font-medium">
                    Gagal memuat data. Sesi Anda kosong atau tidak diizinkan (Silakan login ulang).
                  </td>
                </tr>
              ) : (
                users.map((user, index) => (
                  <tr key={user.id ? user.id.toString() : `user-${index}`}>
                    <td className="py-3 font-medium text-gray-800">{user.name || "Tanpa Nama"}</td>
                    <td className="py-3">{user.email}</td>
                    <td className="py-3 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        user.role?.toUpperCase() === "ADMIN" ? "bg-rose-50 text-rose-600" :
                        user.role?.toUpperCase() === "BAKER" ? "bg-sky-50 text-sky-600" :
                        "bg-blue-50 text-blue-600"
                      }`}>
                        {user.role?.toUpperCase() || "CUSTOMER"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}