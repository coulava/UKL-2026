"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

interface Product {
  id: number | string;
  name: string;
  price: number | string;
  stock: number;
  description: string;
  isAvailable: boolean;
  image?: string;
}

export default function ProductList() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentRole, setCurrentRole] = useState("baker");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const role = localStorage.getItem("role")?.toLowerCase() || "baker";
    setCurrentRole(role);
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/products`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const responseData = await response.json();

      if (response.ok) {
        setProducts(responseData.data || responseData || []);
      } else {
        toast.error("Gagal mengambil daftar produk.");
      }
    } catch (err) {
      console.error("Error fetch products:", err);
      toast.error("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number | string) {
    if (!confirm("Apakah Anda yakin ingin menghapus produk ini?")) return;

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/products/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success("Produk berhasil dihapus!");
        fetchProducts();
      } else {
        toast.error("Gagal menghapus produk.");
      }
    } catch (err) {
      console.error("Error delete product:", err);
      toast.error("Terjadi kesalahan sistem saat menghapus.");
    }
  }

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 md:p-8 bg-slate-50/50 min-h-screen text-slate-800 font-sans overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Atas (Responsif Alur Kolom ke Baris) */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Manajemen Produk ({currentRole.toUpperCase()})
            </h1>
            <p className="text-slate-500 mt-1 text-sm">Kelola dan pantau stok kue harian produksi tokomu.</p>
          </div>
          <Link
            href={`/${currentRole}/product/create`}
            className="bg-blue-600 text-white px-5 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-sm shadow-blue-200 text-sm inline-flex items-center justify-center gap-2 active:scale-95 w-full sm:w-auto"
          >
            <span className="text-lg font-normal">+</span> Tambah Produk Baru
          </Link>
        </div>

        {/* Bar Pencarian */}
        <div className="flex gap-2 max-w-md mb-8">
          <input
            type="text"
            placeholder="Cari nama produk..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-900 text-sm shadow-inner outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
          />
          <button className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-sm">
            Cari
          </button>
        </div>

        {/* State Memuat Data & Data Kosong Utama */}
        {loading && (
          <div className="bg-white p-12 rounded-2xl border border-slate-100 text-center text-slate-400 font-medium animate-pulse shadow-sm">
            Sedang memuat data kue dari server...
          </div>
        )}

        {!loading && filteredProducts.length === 0 && (
          <div className="bg-white p-12 rounded-2xl border border-slate-100 text-center text-slate-400 font-medium shadow-sm">
            Tidak ada produk kue ditemukan.
          </div>
        )}

        {/* ==================== 📱 1. LAYOUT KHUSUS HP (CARD GRID SYSTEM) ==================== */}
        {!loading && filteredProducts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
            {filteredProducts.map((product) => {
              const numPrice = typeof product.price === 'string' ? parseInt(product.price.replace(/[^0-9]/g, '')) : product.price;
              
              // 🎯 FORMULA FIX GAMBAR: Menggabungkan base URL dengan path relatif dari Postman
              const imageUrl = product.image
                ? `${process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "")}${product.image}`
                : "";

              return (
                <div key={product.id} className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
                  <div>
                    {/* Wadah Foto Card HP */}
                    <div className="relative w-full h-48 bg-slate-50 border-b border-slate-100 flex items-center justify-center overflow-hidden">
                      {product.image ? (
                        <img 
                          src={imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "https://placehold.co/600x400?text=Gambar+Rusak";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 font-extrabold flex items-center justify-center text-xl uppercase">
                          {product.name.substring(0, 2)}
                        </div>
                      )}
                    </div>

                    {/* Informasi Teks Card HP */}
                    <div className="p-4 space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-bold text-slate-900 text-base leading-snug">{product.name}</h3>
                        <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border shrink-0 tracking-wide uppercase ${
                          product.stock > 0 ? "bg-green-50 text-green-700 border-green-100" : "bg-red-50 text-red-700 border-red-100"
                        }`}>
                          {product.stock > 0 ? "Tersedia" : "Habis"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-normal line-clamp-2 leading-relaxed">
                        {product.description || "Tidak ada deskripsi kue."}
                      </p>
                    </div>
                  </div>

                  {/* Bagian Footer Card (Harga, Stok & Tombol Navigasi Aksi) */}
                  <div className="p-4 bg-slate-50 border-t border-slate-100 space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Harga kue</span>
                        <span className="font-extrabold text-blue-600 text-base">Rp {numPrice ? numPrice.toLocaleString("id-ID") : "0"}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Stok Sisa</span>
                        <span className="font-bold text-slate-700">{product.stock} pcs</span>
                      </div>
                    </div>

                    {/* Tombol CRUD di HP */}
                    <div className="flex gap-2 pt-1">
                      <Link
                        href={`/${currentRole}/product/${product.id}`}
                        className="flex-1 py-2.5 bg-blue-50 text-blue-600 font-bold rounded-xl hover:bg-blue-600 hover:text-white text-center text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5"
                      >
                        Ubah Kue
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="flex-1 py-2.5 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-600 hover:text-white text-center text-xs transition-all active:scale-95"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ==================== 💻 2. LAYOUT KHUSUS LAPTOP/DESKTOP (TABLE SYSTEM) ==================== */}
        {!loading && filteredProducts.length > 0 && (
          <div className="hidden md:block w-full bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 text-slate-500 text-sm font-bold border-b border-slate-200/80">
                  <th className="px-6 py-5">Nama & Foto Produk</th>
                  <th className="px-6 py-5 text-right w-44">Harga</th>
                  <th className="px-6 py-5 text-center w-36">Stok</th>
                  <th className="px-6 py-5 text-center w-36">Status</th>
                  <th className="px-6 py-5 text-center w-36">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredProducts.map((product) => {
                  const numPrice = typeof product.price === 'string' ? parseInt(product.price.replace(/[^0-9]/g, '')) : product.price;
                  
                  // 🎯 FORMULA FIX GAMBAR LAPTOP
                  const imageUrl = product.image
                    ? `${process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "")}${product.image}`
                    : "";

                  return (
                    <tr key={product.id} className="hover:bg-slate-50/40 transition-all align-middle">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-5">
                          {/* Bingkai lingkaran/kotak foto */}
                          <div className="relative w-20 h-20 border border-slate-100 rounded-2xl overflow-hidden shrink-0 flex items-center justify-center bg-slate-50 shadow-sm">
                            {product.image ? (
                              <img 
                                src={imageUrl}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  // Fallback pengaman lapis kedua jika server gagal di-ping
                                  e.currentTarget.src = `https://daily-bake-production.up.railway.app/${product.image?.replace(/^\//, "")}`;
                                }}
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 font-extrabold flex items-center justify-center text-sm uppercase tracking-wider">
                                {product.name.substring(0, 2)}
                              </div>
                            )}
                          </div>

                          <div className="max-w-md">
                            <p className="font-bold text-slate-900 text-base mb-1">{product.name}</p>
                            <p className="text-sm text-slate-500 leading-relaxed font-normal line-clamp-2">{product.description || "-"}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5 text-right font-bold text-slate-900 text-base">
                        Rp {numPrice ? numPrice.toLocaleString("id-ID") : "0"}
                      </td>

                      <td className="px-6 py-5 text-center font-semibold text-slate-600 text-sm">
                        {product.stock} pcs
                      </td>

                      <td className="px-6 py-5 text-center">
                        <span className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide inline-block border ${
                          product.stock > 0 ? "bg-green-50 text-green-700 border-green-100" : "bg-red-50 text-red-700 border-red-100"
                        }`}>
                          {product.stock > 0 ? "Tersedia" : "Habis"}
                        </span>
                      </td>

                      <td className="px-6 py-5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            href={`/${currentRole}/product/${product.id}`}
                            className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-sm active:scale-95"
                            title="Edit Produk"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                            </svg>
                          </Link>

                          <button
                            onClick={() => handleDelete(product.id)}
                            className="p-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all shadow-sm active:scale-95"
                            title="Hapus Produk"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}