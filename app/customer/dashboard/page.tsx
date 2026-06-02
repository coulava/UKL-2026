"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

// Definisikan tipe data sesuai skema database/Postman kamu
interface Product {
  id: string;
  name: string;
  category: {
    id: string;
    name: string;
  } | string; // Mengantisipasi jika relasi berupa objek atau string biasa
  price: number;
  stock: number;
  image?: string;
  rating?: number;
}

export default function CustomerDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(["Semua"]);
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // 1. Fetch data dari API saat halaman pertama kali dibuka
  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        // Gunakan endpoint yang sesuai dengan koleksi Postman kamu
        const response = await fetch("http://localhost:3000/products", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            // Tambahkan Authorization jika endpoint produk di-protect
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });

        if (!response.ok) {
          throw new Error("Gagal mengambil data produk dari server");
        }

        const data = await response.json();
        
        // Sesuaikan dengan struktur response API kamu (misal: data.data atau data saja)
        const productList: Product[] = data.data || data || [];
        setProducts(productList);

        // Ambil daftar kategori unik secara dinamis dari data produk yang masuk
        const dynamicCategories = new Set<string>();
        productList.forEach((p) => {
          const catName = typeof p.category === "object" ? p.category.name : p.category;
          if (catName) dynamicCategories.add(catName);
        });
        
        setCategories(["Semua", ...Array.from(dynamicCategories)]);
      } catch (error: any) {
        console.error(error);
        toast.error(error.message || "Terjadi kesalahan koneksi ke server");
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  // 2. Fungsi Add to Cart / Buat Pesanan Baru (Sinkron ke POST /orders di Postman)
  const handleAddToCart = async (productId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Silakan login terlebih dahulu");
        return;
      }

      // Payload disesuaikan dengan contoh body Postman kamu (pickupDate, items, dll)
      const payload = {
        pickupDate: new Date().toISOString().split("T")[0], // default hari ini
        pickupTime: "12:00",
        paymentMethod: "BANK_TRANSFER",
        items: [
          {
            productId: productId,
            quantity: 1,
          },
        ],
      };

      const response = await fetch("http://localhost:3000/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Gagal menambahkan pesanan");

      toast.success("Kue berhasil ditambahkan ke pesanan!");
    } catch (error: any) {
      toast.error(error.message || "Gagal memproses pesanan");
    }
  };

  // 3. Filter Client-side untuk Pencarian & Tombol Kategori
  const filteredProducts = products.filter((product) => {
    const catName = typeof product.category === "object" ? product.category.name : product.category;
    const matchesCategory = selectedCategory === "Semua" || catName === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* BANNER PROMOSI */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-8 sm:p-12 shadow-xl">
        <div className="relative z-10 max-w-md space-y-4">
          <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Live Database Connected 🥐
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Kehangatan Oven Pembuat Kue Terbaik di Kotamu
          </h1>
          <p className="text-blue-100 text-sm sm:text-base">
            Silakan pilih menu kue segar dari dapur kami yang terhubung langsung dengan sistem antrean masak.
          </p>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Etalase Varian Kue</h2>
          <p className="text-xs text-slate-500 mt-0.5">Menampilkan produk riil langsung dari database toko</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Input Search */}
          <div className="relative min-w-[240px]">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.602 10.602Z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Cari kue kesukaanmu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 transition-colors shadow-sm"
            />
          </div>

          {/* Pil Filter Kategori */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                  selectedCategory === cat ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* STATE VIEW DATA */}
      {loading ? (
        // Loading Skeleton Sederhana
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white border border-slate-100 rounded-2xl h-64 p-4 space-y-4">
              <div className="bg-slate-200 h-32 rounded-xl" />
              <div className="h-4 bg-slate-200 rounded w-2/3" />
              <div className="h-4 bg-slate-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
          <p className="text-slate-500 font-medium text-sm">Tidak ada produk kue aktif yang tersedia saat ini.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const currentCategory = typeof product.category === "object" ? product.category.name : product.category;
            return (
              <div
                key={product.id}
                className="group bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col justify-between"
              >
                {/* Gambar Kue */}
                <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                  <img
                    src={product.image || "https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=500&auto=format&fit=crop"} // Fallback image jika API tidak me-return gambar
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-slate-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm">
                    {currentCategory}
                  </span>
                </div>

                {/* Detail Info Kue */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-amber-500 font-bold">
                      <div className="flex items-center gap-1">
                        <span>⭐</span>
                        <span>{product.rating || "5.0"}</span>
                      </div>
                      <span className="text-slate-400 font-normal">Stok: {product.stock}</span>
                    </div>
                    <h3 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {product.name}
                    </h3>
                  </div>

                  {/* Harga & Tombol Beli */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                    <span className="text-base font-black text-slate-900">
                      Rp {product.price.toLocaleString("id-ID")}
                    </span>
                    <button
                      onClick={() => handleAddToCart(product.id)}
                      className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition-all duration-200 active:scale-90"
                      title="Tambahkan ke Pesanan"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}