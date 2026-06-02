"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface User {
  id: number | string;
  name: string;
  email: string;
  role: string;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // 1. FUNGSI AMBIL DATA (FETCH USERS)
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken") || localStorage.getItem("token");

      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/users`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      const responseData = await res.json();

      if (res.ok) {
        const actualData = responseData.data || responseData;
        setUsers(Array.isArray(actualData) ? actualData : []);
      } else {
        toast.error(responseData.message || "Gagal menyinkronkan data pengguna.");
      }
    } catch (error) {
      console.error("Gagal memuat data pengguna:", error);
      toast.error("Terjadi masalah jaringan saat menghubungi database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 2. FUNGSI HAPUS USER (DELETE USER)
  const handleDeleteUser = async (id: number | string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus pengguna "${name}"?`)) return;

    try {
      const token = localStorage.getItem("accessToken") || localStorage.getItem("token");

      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/users/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      const responseData = await res.json().catch(() => ({}));

      if (res.ok) {
        toast.success(`Akun ${name} berhasil dihapus!`);
        fetchUsers(); // Refresh data biar berkurang jadi 10 orang
      } else {
        toast.error(responseData.message || "Gagal menghapus pengguna dari database.");
      }
    } catch (error) {
      console.error("Error delete user:", error);
      toast.error("Terjadi kesalahan sistem saat menghapus user.");
    }
  };

  // Filter pencarian berdasarkan nama atau email
  const filteredUsers = users.filter(
    (user) =>
      (user.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (user.email?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Judul Halaman */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Manajemen Pengguna</h1>
        <p className="text-sm text-slate-500 mt-1">
          Kelola peran hak akses akun staf Dapur Baker, Admin, dan Customer (Total terdeteksi: {users.length} akun).
        </p>
      </div>

      {/* Kontrol Akses: Kolom Pencarian */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <input
          type="text"
          placeholder="Cari nama atau email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:w-72 px-4 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-400/20 focus:border-sky-400 transition-all"
        />
      </div>

      {/* Tabel Data */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <th className="px-6 py-4">Nama Pengguna</th>
                <th className="px-6 py-4">Email Terdaftar</th>
                <th className="px-6 py-4">Role Hak Akses</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                    Memuat data pengguna dari database...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                    Tidak ada pengguna yang cocok dengan pencarian.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800">{user.name || "-"}</td>
                    <td className="px-6 py-4 text-slate-500">{user.email}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                          user.role?.toUpperCase() === "ADMIN"
                            ? "bg-purple-50 text-purple-700"
                            : user.role?.toUpperCase() === "BAKER"
                            ? "bg-sky-50 text-sky-700"
                            : "bg-blue-50 text-blue-700"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {/* 🎯 FIXED TOMBOL EDIT: Pindah ke rute form edit user */}
                        <button 
                          onClick={() => router.push(`/admin/users/edit/${user.id}`)}
                          className="p-1.5 rounded-md border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all cursor-pointer"
                          title="Ubah Data"
                        >
                          📝
                        </button>
                        
                        {/* 🎯 FIXED TOMBOL HAPUS: Menjalankan fungsi API DELETE */}
                        <button 
                          onClick={() => handleDeleteUser(user.id, user.name || "User")}
                          className="p-1.5 rounded-md border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all cursor-pointer"
                          title="Hapus Pengguna"
                        >
                          🗑️
                        </button>
                      </div>
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