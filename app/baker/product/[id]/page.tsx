"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

interface Category {
  id: number | string;
  name: string;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id; 

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentRole, setCurrentRole] = useState("admin");

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

  useEffect(() => {
    const role = localStorage.getItem("userRole")?.toLowerCase() || "admin";
    setCurrentRole(role);

    const token = localStorage.getItem("accessToken") || localStorage.getItem("token");

    async function fetchCategories() {
      try {
        const response = await fetch(`${BASE_URL}/categories`, {
          method: "GET",
          headers: { "Authorization": `Bearer ${token}` }
        });
        const responseData = await response.json();
        if (response.ok) {
          setCategories(responseData.data || responseData || []);
        }
      } catch (err) {
        console.error(err);
      }
    }

    async function fetchProductDetail() {
      if (!id) return;
      try {
        const response = await fetch(`${BASE_URL}/products/${id}`, {
          method: "GET",
          headers: { "Authorization": `Bearer ${token}` }
        });
        const result = await response.json();
        if (response.ok && result.data) {
          const product = result.data;
          setName(product.name || "");
          setPrice(product.price?.toString() || "");
          setStock(product.stock?.toString() || "");
          setCategoryId(product.category?.id?.toString() || product.categoryId?.toString() || "");
          setDescription(product.description || "");
        }
      } catch (err) {
        console.error(err);
      }
    }
    
    if (BASE_URL) {
      fetchCategories();
      fetchProductDetail();
    }
  }, [id, BASE_URL]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem("accessToken") || localStorage.getItem("token");

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

      // 🎯 SOLUSI JITU: Dibuat Number murni bertipe data Integer sebelum dikirim agar tidak eror PATCH 500
      const cleanCategoryId = categoryId.toString().replace(/[^0-9]/g, "");
      if (cleanCategoryId) {
        formData.append("categoryId", Number(cleanCategoryId).toString()); 
      }

      const response = await fetch(`${BASE_URL}/products/${id}`, {
        method: "PATCH",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Produk berhasil diperbarui!");
        router.push(`/${currentRole}/product`); 
      } else {
        const errorMessage = Array.isArray(result.message) ? result.message[0] : result.message;
        toast.error(errorMessage || "Gagal memperbarui produk.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Terjadi error koneksi server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 bg-white min-h-screen text-slate-800">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link href={`/${currentRole}/product`} className="text-blue-600 text-sm hover:underline">
            ← Kembali ke Daftar Produk
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 mt-2">Edit Produk</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Nama Kue</label>
            <input
              type="text" required
              className="w-full px-4 py-2.5 border rounded-xl bg-white text-slate-900"
              value={name} onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Harga (Rp)</label>
              <input
                type="number" required
                className="w-full px-4 py-2.5 border rounded-xl bg-white text-slate-900"
                value={price} onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Stok</label>
              <input
                type="number" required
                className="w-full px-4 py-2.5 border rounded-xl bg-white text-slate-900"
                value={stock} onChange={(e) => setStock(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Kategori Produk</label>
            <select
              required className="w-full px-4 py-2.5 border rounded-xl bg-white text-slate-900"
              value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
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
              required rows={3}
              className="w-full px-4 py-2.5 border rounded-xl bg-white text-slate-900"
              value={description} onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Foto Kue (Biarkan kosong jika tidak ingin diubah)</label>
            <input
              type="file" accept="image/*"
              className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-blue-50"
              onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
            />
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition"
          >
            {loading ? "Memperbarui data..." : "Simpan Perubahan Produk"}
          </button>
        </form>
      </div>
    </div>
  );
}