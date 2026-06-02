"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner"; 

interface Category {
  id: string; 
  name: string;
}

export default function AdminCategories() {
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
        toast.success("Kategori baru berhasil ditambahkan oleh Admin!");
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
    <div className="w-full text-slate-800 font-sans">
      {/* Menggunakan padding standard p-4 sampai p-8 tanpa pl-64 lagi karena sudah di-handle Layout global */}
      <main className="p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Header Dashboard Title */}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
              Categories Menu
            </h1>
            <p className="text-sm text-slate-400 font-normal mt-0.5">
              Halaman khusus Admin untuk mengelola klasifikasi menu kue toko DailyBake.
            </p>
          </div>

          {/* Grid Layout Antara Input Form & Tabel Ringkasan */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* SISI KIRI: Form Tambah Kategori */}
            <div className="bg-white p-5 md:p-6 rounded-[20px] border border-slate-100 shadow-sm space-y-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Buat Kategori Baru</h2>
                <p className="text-xs text-slate-400 mt-0.5">Kelompokkan produk kuemu agar lebih rapi.</p>
              </div>
              
              <form onSubmit={handleCreateCategory} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Nama Kategori
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Kue Basah, Pastry"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm outline-none shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-400"
                  />
                </div>
                
                <button 
                  type="submit" 
                  className="w-full py-2.5 bg-[#0B192C] text-white text-xs font-bold rounded-xl shadow-sm hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Simpan Kategori
                </button>
              </form>
            </div>

            {/* SISI KANAN: Tabel Klasifikasi Data */}
            <div className="bg-white p-5 md:p-6 rounded-[24px] border border-slate-100 shadow-sm lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Daftar Klasifikasi Kue</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Daftar kategori aktif yang tersambung di database.</p>
                </div>
                <span className="px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-full text-[11px] font-bold text-slate-500">
                  {categories.length} Categories
                </span>
              </div>

              {loading ? (
                <div className="py-12 text-center text-sm text-slate-400 font-medium animate-pulse">
                  Sedang menyinkronkan data kategori...
                </div>
              ) : categories.length === 0 ? (
                <div className="py-12 text-center text-sm text-slate-400 font-medium bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                  Belum ada data kategori tersimpan di sistem.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-50">
                  <table className="w-full text-left border-collapse min-w-[400px]">
                    <thead>
                      <tr className="bg-slate-50/70 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                        <th className="px-5 py-4 w-20 text-center">No</th>
                        <th className="px-5 py-4">Nama Kategori Kue</th>
                        <th className="px-5 py-4 text-center w-48">Aksi Kontrol</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-slate-50 text-slate-600">
                      {categories.map((category, index) => (
                        <tr key={category.id} className="hover:bg-slate-50/40 transition-colors">
                          <td className="px-5 py-4 text-center font-bold text-slate-400">
                            {String(index + 1).padStart(2, "0")}
                          </td>
                          <td className="px-5 py-4 font-semibold text-slate-900">
                            {editingId === category.id ? (
                              <input
                                type="text"
                                value={editingName}
                                onChange={(e) => setEditingName(e.target.value)}
                                className="px-3 py-1.5 border border-blue-500 bg-white rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500/10 text-sm w-full max-w-xs text-slate-900"
                                autoFocus
                              />
                            ) : (
                              category.name
                            )}
                          </td>
                          <td className="px-5 py-4 text-center">
                            {editingId === category.id ? (
                              <div className="flex justify-center gap-2">
                                <button 
                                  onClick={() => handleUpdateCategory(category.id)} 
                                  className="px-3 py-1.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-colors"
                                >
                                  Simpan
                                </button>
                                <button 
                                  onClick={() => setEditingId(null)} 
                                  className="px-3 py-1.5 bg-slate-50 text-slate-500 border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-100 transition-colors"
                                >
                                  Batal
                                </button>
                              </div>
                            ) : (
                              <div className="flex justify-center gap-3">
                                <button 
                                  onClick={() => { setEditingId(category.id); setEditingName(category.name); }} 
                                  className="px-2.5 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-md text-[11px] font-bold hover:bg-blue-100 transition-all flex items-center gap-1"
                                >
                                  Edit
                                </button>
                                <button 
                                  onClick={() => handleDeleteCategory(category.id)} 
                                  className="px-2.5 py-1 bg-rose-50 text-rose-600 border border-rose-100 rounded-md text-[11px] font-bold hover:bg-rose-100 transition-all flex items-center gap-1"
                                >
                                  Hapus
                                </button>
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
        </div>
      </main>
    </div>
  );
}