"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

interface Category {
  id: number | string;
  name: string;
}

export default function CreateProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentRole, setCurrentRole] = useState("admin");

  // State Form komponen input
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  // 🌍 Menggunakan konstanta global env pilihanmu
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

  useEffect(() => {
    const role = localStorage.getItem("userRole")?.toLowerCase() || "admin";
    setCurrentRole(role);

    async function fetchCategories() {
      try {
        const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
        const response = await fetch(`${BASE_URL}/categories`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        const responseData = await response.json();
        
        if (response.ok) {
          setCategories(responseData.data || responseData || []);
        }
      } catch (err) {
        console.error("Gagal mengambil data kategori:", err);
      }
    }
    
    fetchCategories();
  }, [BASE_URL]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
    if (!token) {
      toast.error("Sesi Anda habis. Silakan login ulang!");
      router.push("/login");
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("price", price.toString());
      formData.append("stock", stock.toString());
      formData.append("description", description);
      formData.append("isAvailable", "true");
      
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const cleanCategoryId = categoryId.toString().replace(/[^0-9]/g, "");
      if (!cleanCategoryId) {
        toast.error("Silakan pilih kategori terlebih dahulu");
        setLoading(false);
        return;
      }
      formData.append("categoryId", cleanCategoryId);

      const response = await fetch(`${BASE_URL}/products`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Produk baru berhasil disimpan!");
        router.push(`/${currentRole}/product`); 
      } else {
        const errorMessage = Array.isArray(result.message) ? result.message[0] : result.message;
        toast.error(errorMessage || "Gagal menambah produk.");
      }
    } catch (error) {
      console.error("Error saat menyimpan produk:", error);
      toast.error("Terjadi kesalahan jaringan atau server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 bg-white min-h-screen text-slate-800">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link href={`/${currentRole}/product`} className="text-blue-600 text-sm hover:underline flex items-center gap-1">
            ← Kembali ke Daftar Produk
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 mt-2">Tambah Produk Baru ({currentRole.toUpperCase()})</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Nama Kue / Produk</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl bg-white text-slate-900"
              placeholder="Contoh: Cheese Cake Strawberry"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Harga (Rp)</label>
              <input
                type="number"
                required
                min="0"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl bg-white text-slate-900"
                placeholder="30000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Stok Awal</label>
              <input
                type="number"
                required
                min="0"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl bg-white text-slate-900"
                placeholder="10"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Kategori Produk</label>
            <select
              required
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl bg-white text-slate-900"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">-- Pilih Kategori Kue --</option>
              {categories.map((cat) => (
                <option key={cat.id.toString()} value={cat.id.toString()}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Deskripsi Kue</label>
            <textarea
              required
              rows={3}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl bg-white text-slate-900"
              placeholder="Jelaskan detail produk..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Foto Produk (Gambar)</label>
            <input
              type="file"
              accept="image/*"
              required
              className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition disabled:bg-blue-300"
          >
            {loading ? "Sedang Mengirim ke Server..." : "Simpan Produk Baru"}
          </button>
        </form>
      </div>
    </div>
  );
}