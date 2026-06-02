"use client";

import Sidebar from "@/components/Sidebar";
import { useEffect, useState } from "react";
import { toast } from "sonner"; 

interface Category {
  id: string; 
  name: string;
}

export default function BakerCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [newCategoryName, setNewCategoryName] = useState<string>("");
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>("");

  const getAuthToken = () => {
    return localStorage.getItem("accessToken");
  };

  // ===================================================================
  // 1. READ: GET {{BASE-URL}}/categories
  // ===================================================================
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/categories`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (res.ok) {
        setCategories(data.data || data || []);
      } else {
        toast.error("Gagal mengambil daftar kategori.");
      }
    } catch (error) {
      console.error("Fetch categories error:", error);
      toast.error("Gagal terhubung ke server backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // ===================================================================
  // 2. CREATE: POST {{BASE-URL}}/categories
  // ===================================================================
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getAuthToken();

    if (!token) return toast.error("Token tidak ditemukan. Silakan login kembali.");
    if (!newCategoryName.trim()) return toast.error("Nama kategori tidak boleh kosong.");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/categories`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newCategoryName }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Kategori baru berhasil ditambahkan oleh Baker!");
        setNewCategoryName(""); 
        fetchCategories(); 
      } else {
        toast.error(data.message || "Gagal menambahkan kategori.");
      }
    } catch (error) {
      console.error("Create category error:", error);
      toast.error("Terjadi kesalahan jaringan.");
    }
  };

  // ===================================================================
  // 3. UPDATE: PATCH {{BASE-URL}}/categories/:id
  // ===================================================================
  const handleUpdateCategory = async (id: string) => {
    const token = getAuthToken();

    if (!token) return toast.error("Sesi login habis.");
    if (!editingName.trim()) return toast.error("Nama kategori tidak boleh kosong.");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/categories/${id}`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: editingName }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Nama kategori berhasil diperbarui!");
        setEditingId(null); 
        fetchCategories(); 
      } else {
        toast.error(data.message || "Gagal mengubah kategori.");
      }
    } catch (error) {
      console.error("Update category error:", error);
      toast.error("Terjadi kesalahan jaringan.");
    }
  };

  // ===================================================================
  // 4. DELETE: DEL {{BASE-URL}}/categories/:id
  // ===================================================================
  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Apakah kamu yakin ingin menghapus kategori kue ini?")) return;
    
    const token = getAuthToken();
    if (!token) return toast.error("Sesi login habis.");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/categories/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Kategori berhasil dihapus dari sistem.");
        fetchCategories(); 
      } else {
        toast.error(data.message || "Gagal menghapus kategori.");
      }
    } catch (error) {
      console.error("Delete category error:", error);
      toast.error("Terjadi kesalahan jaringan.");
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800">
      <Sidebar />
      <main className="flex-1 p-6 lg:p-8 pt-20 lg:pt-8 transition-all duration-300 lg:pl-64">
        {/* Judul Halaman Sesuai Akses Baker */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Categories Menu (Baker Panel)</h1>
          <p className="text-sm text-slate-500 mt-1">Halaman khusus Baker untuk mengelola klasifikasi menu kue.</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
          {/* Form Tambah Kategori */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-base font-bold text-slate-800 mb-4">Buat Kategori Kue Baru</h2>
            <form onSubmit={handleCreateCategory} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1.5 uppercase tracking-wider">Nama Kategori</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Roti Gembong, Cake Potong"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 text-sm text-slate-900"
                />
              </div>
              <button type="submit" className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition shadow-sm">
                + Simpan Kategori
              </button>
            </form>
          </div>

          {/* Tabel Daftar Kategori */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 xl:col-span-2">
            <h2 className="text-base font-bold text-slate-800 mb-4">Daftar Klasifikasi Kue saat Ini</h2>
            {loading ? (
              <div className="py-8 text-center text-sm text-slate-400 font-medium">Sedang menyinkronkan data...</div>
            ) : categories.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-400 font-medium">Belum ada data kategori.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs text-slate-400 font-semibold uppercase tracking-wider">
                      <th className="pb-3 w-16 text-center">No</th>
                      <th className="pb-3">Nama Kategori</th>
                      <th className="pb-3 text-right pr-4">Aksi Kontrol</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-slate-50 text-slate-600">
                    {categories.map((category, index) => (
                      <tr key={category.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 text-center font-medium text-slate-400">{index + 1}</td>
                        <td className="py-4 font-semibold text-slate-800">
                          {editingId === category.id ? (
                            <input
                              type="text"
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              className="px-3 py-1.5 border border-blue-500 bg-white rounded-lg focus:outline-none text-sm w-full max-w-xs text-slate-900"
                              autoFocus
                            />
                          ) : (
                            category.name
                          )}
                        </td>
                        <td className="py-4 text-right pr-4">
                          {editingId === category.id ? (
                            <div className="flex justify-end gap-2">
                              <button onClick={() => handleUpdateCategory(category.id)} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold">Simpan</button>
                              <button onClick={() => setEditingId(null)} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold">Batal</button>
                            </div>
                          ) : (
                            <div className="flex justify-end gap-4">
                              <button onClick={() => { setEditingId(category.id); setEditingName(category.name); }} className="text-blue-600 hover:text-blue-800 font-bold text-xs">Edit Nama</button>
                              <button onClick={() => handleDeleteCategory(category.id)} className="text-rose-600 hover:text-rose-800 font-bold text-xs">Hapus</button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}