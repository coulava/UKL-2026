"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

interface Product {
  id: string | number;
  name: string;
  category: {
    id: string;
    name: string;
  } | string;
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
  const [cartCount, setCartCount] = useState(0); 

  // State untuk menyimpan jumlah item yang dipilih per produk di client side sebelum klik beli
  // Contoh format data: { "produk_id_1": 2, "produk_id_2": 1 }
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});

  // Fungsi mengatur angka counter di internal card produk
  const changeLocalQty = (productId: string | number, delta: number, maxStock: number) => {
    const currentQty = quantities[productId] || 1;
    const newQty = currentQty + delta;
    if (newQty < 1) return;
    if (newQty > maxStock) {
      toast.error(`Stok dapur terbatas! Maksimal pembelian ${maxStock} pcs.`);
      return;
    }
    setQuantities({ ...quantities, [productId]: newQty });
  };

  const updateCartCount = async () => {
    try {
      const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/cart`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const items = Array.isArray(data) ? data : (data?.items || data?.data || []);
        
        const total = items.reduce((sum: number, item: any) => {
          const qty = Number(item.quantity) || 0;
          return sum + qty;
        }, 0);
        
        setCartCount(total);
      }
    } catch (error) {
      console.error("Gagal memperbarui badge keranjang:", error);
    }
  };

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const token = localStorage.getItem("accessToken") || localStorage.getItem("token");

        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/products`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });

        if (!response.ok) {
          throw new Error("Gagal mengambil data produk dari server");
        }

        const data = await response.json();
        const productList: Product[] = data.data || data || [];
        setProducts(productList);

        const dynamicCategories = new Set<string>();
        productList.forEach((p) => {
          const catName = typeof p.category === "object" ? p.category.name : p.category;
          if (catName) dynamicCategories.add(catName);
        });

        setCategories(["Semua", ...Array.from(dynamicCategories)]);
      } catch (error: any) {
        toast.error(error.message || "Terjadi kesalahan koneksi ke server");
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
    updateCartCount(); 
  }, []);

  // Mengirim data produk besertakan jumlah dinamis (bisa 2, 3, dst) ke POST /cart Backend
  const handleAddToCart = async (product: Product) => {
    if (product.stock <= 0) {
      toast.error(`Maaf, stok kue ${product.name} sedang habis di dapur!`);
      return;
    }

    // Mengambil jumlah item yang dipilih user, default-nya 1 jika tidak diubah
    const chosenQuantity = quantities[product.id] || 1;

    try {
      const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
      if (!token) {
        toast.error("Silakan login terlebih dahulu!");
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: Number(product.id), 
          quantity: Number(chosenQuantity), // Mengirimkan kuantitas asli pilihan user (misal: 2)
        }),
      });

      if (!response.ok) {
        throw new Error("Gagal menambahkan item ke keranjang server");
      }

      toast.success(`🧁 ${chosenQuantity}x ${product.name} dimasukkan ke keranjang belanja!`);
      
      // Reset pilihan counter di card produk kembali ke angka 1 setelah sukses beli
      setQuantities({ ...quantities, [product.id]: 1 });
      updateCartCount(); 
    } catch (error: any) {
      toast.error(error.message || "Terjadi kesalahan sistem.");
    }
  };

  const filteredProducts = products.filter((product) => {
    const catName = typeof product.category === "object" ? product.category.name : product.category;
    const matchesCategory = selectedCategory === "Semua" || catName === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 text-xs relative text-black bg-gray-50 min-h-screen">

      {/* BANNER PROMOSI */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-8 sm:p-12 shadow-xl">
        <div className="relative z-10 max-w-md space-y-4">
          <span className="bg-white/20 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Yummy 🥐
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Kehangatan Oven Pembuat Kue Terbaik di Kotamu
          </h1>
          <p className="text-blue-100 text-xs">
            Silakan pilih menu kue segar dari dapur kami yang terhubung langsung dengan sistem antrean masak.
          </p>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Etalase Varian Kue</h2>
          <p className="text-[11px] text-slate-500 mt-0.5">Menampilkan produk riil langsung dari database toko</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[240px]">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">🔍</span>
            <input
              type="text"
              placeholder="Cari kue kesukaanmu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 transition-colors shadow-sm"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all duration-200 ${
                  selectedCategory === cat ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* VIEW CARD PRODUK KUE */}
      {loading ? (
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
          <p className="text-slate-500 font-medium">Tidak ada produk kue aktif yang tersedia saat ini.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const currentCategory = typeof product.category === "object" ? product.category.name : product.category;
            const isOutOfStock = product.stock <= 0;
            
            // Ambil kuantitas lokal terpilih (default 1)
            const itemQty = quantities[product.id] || 1;

            return (
              <div
                key={product.id}
                className="group bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col justify-between"
              >
                <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                  <img
                    src={product.image || "https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=500&auto=format&fit=crop"}
                    alt={product.name}
                    className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${isOutOfStock ? "grayscale opacity-60" : ""}`}
                  />
                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-slate-800 text-[9px] font-bold px-2.5 py-0.5 rounded-full shadow-sm uppercase tracking-wide">
                    {currentCategory}
                  </span>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <div className="flex items-center gap-1 text-sky-500">
                        <span>⭐</span>
                        <span>{product.rating || "5.0"}</span>
                      </div>
                      <span className={`font-bold ${isOutOfStock ? "text-red-500" : "text-slate-400"}`}>
                        {isOutOfStock ? "Habis" : `Stok: ${product.stock} pcs`}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-1 text-sm">
                      {product.name}
                    </h3>
                  </div>

                  {/* HARGA & PANEL INPUT KUANTITAS DI ETALASE */}
                  <div className="flex flex-col gap-2 pt-2 border-t border-slate-50">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black text-slate-900 shrink-0">
                        Rp {Number(product.price || 0).toLocaleString("id-ID")}
                      </span>

                      {/* Tombol Min-Plus Jumlah Sebelum Masuk Keranjang */}
                      {!isOutOfStock && (
                        <div className="flex items-center gap-2 bg-slate-100 px-2 py-1 rounded-lg">
                          <button 
                            type="button"
                            onClick={() => changeLocalQty(product.id, -1, product.stock)}
                            className="font-bold text-slate-600 hover:text-black w-4 text-center cursor-pointer"
                          >
                            -
                          </button>
                          <span className="font-bold text-slate-800 w-4 text-center text-[10px]">{itemQty}</span>
                          <button 
                            type="button"
                            onClick={() => changeLocalQty(product.id, 1, product.stock)}
                            className="font-bold text-slate-600 hover:text-black w-4 text-center cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={isOutOfStock}
                      className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-[10px] font-bold transition-all duration-200 cursor-pointer ${
                        isOutOfStock 
                          ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                          : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                      }`}
                    >
                      {isOutOfStock ? "Stok Habis" : `+ Masukkan Keranjang (${itemQty})`}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FLOATING CART BUTTON */}
      <a 
        href="/customer/cart" 
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-2xl transition-all hover:scale-110 flex items-center justify-center group z-50 cursor-pointer"
      >
        🛒
        {cartCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center animate-bounce border-2 border-white">
            {cartCount}
          </span>
        )}
      </a>
    </div>
  );
}