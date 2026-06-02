"use client";

import { useState, useEffect } from "react";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Simulasi ambil data atau silakan hubungkan dengan fetch API Railway kamu
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Ganti URL dengan endpoint asli backend kamu jika sudah siap
        // const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/admin/users`);
        // const data = await res.json();
        
        // Data sementara biar tampilan langsung muncul rapi:
        const dummyData: User[] = [
          { id: 1, name: "Agnes", email: "agnes@gmail.com", role: "CUSTOMER" },
          { id: 2, name: "Mala", email: "mala@gmail.com", role: "BAKER" },
          { id: 3, name: "Baker DailyBake", email: "baker@dailybake.com", role: "BAKER" },
          { id: 4, name: "coulava", email: "ody@gmail.com", role: "CUSTOMER" },
        ];
        setUsers(dummyData);
      } catch (error) {
        console.error("Gagal memuat data pengguna:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Filter pencarian berdasarkan nama atau email
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Judul Halaman */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Manajemen Pengguna</h1>
        <p className="text-sm text-slate-500 mt-1">
          Kelola peran hak akses akun staf Dapur Baker, Admin, dan Customer.
        </p>
      </div>

      {/* Kontrol Akses: Kolom Pencarian */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <input
          type="text"
          placeholder="Cari nama atau email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:w-72 px-4 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 transition-all"
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
                    Memuat data pengguna...
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
                    <td className="px-6 py-4 font-bold text-slate-800">{user.name}</td>
                    <td className="px-6 py-4 text-slate-500">{user.email}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                          user.role === "ADMIN"
                            ? "bg-purple-50 text-purple-700"
                            : user.role === "BAKER"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-blue-50 text-blue-700"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {/* Tombol Edit */}
                        <button 
                          onClick={() => alert(`Edit ${user.name}`)}
                          className="p-1.5 rounded-md border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all"
                          title="Ubah Data"
                        >
                          📝
                        </button>
                        {/* Tombol Hapus */}
                        <button 
                          onClick={() => alert(`Hapus ${user.name}`)}
                          className="p-1.5 rounded-md border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all"
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