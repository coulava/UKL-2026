"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

// Spesifikasi Tipe Data Produk dari Backend
interface Product {
  id: number;
  name: string;
  description: string;
  image?: string;
}

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Efek scroll untuk Navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 2. Ambil data produk dari database backend
  useEffect(() => {
    const fetchLandingProducts = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/products`, {
          method: "GET",
        });

        if (res.ok) {
          const responseData = await res.json();
          const list = responseData.data || responseData || [];
          // Ambil maksimal 3 produk teratas
          setProducts(list.slice(0, 3));
        } else {
          console.error("Gagal memuat produk backend.");
        }
      } catch (err) {
        console.error("Masalah koneksi ke API produk:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLandingProducts();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      
      {/* FIXED NAVBAR */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white/90 backdrop-blur-md shadow-sm py-4" : "bg-transparent py-6"
      }`}>
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-sky-500 flex items-center justify-center">
              <span className="text-white text-xs font-black">D</span>
            </div>
            <span className="text-sm font-black text-slate-900 tracking-tight">DailyBake</span>
          </div>
          
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-xs font-bold text-slate-600 hover:text-sky-600 transition">
              Masuk
            </Link>
            <Link href="/register" className="text-xs font-bold bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-xl transition shadow-sm">
              Daftar Sekarang
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="pt-32 pb-20 px-6 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-sky-500 bg-sky-50 px-3 py-1 rounded-full">
            ✨ Freshly Baked Everyday
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight">
            Kehangatan Oven Kue Terbaik, Langsung ke Tangan Anda.
          </h1>
          <p className="text-xs md:text-sm text-slate-500 leading-relaxed max-w-md">
            Nikmati kelembutan panggangan premium DailyBake dengan sistem pre-order yang transparan. Pesan hari ini, ambil dalam kondisi hangat besok!
          </p>
          <div className="pt-2 flex items-center gap-4">
          </div>
        </div>

        {/* 🛠️ FIX 2: Mengganti box gradien warna dengan visual foto kue realistik beresolusi tinggi */}
        <div className="relative flex justify-center">
          <div className="w-full max-w-md aspect-square rounded-3xl overflow-hidden shadow-xl border border-slate-100">
            <img 
              src="https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800" 
              alt="Premium Bakery & Pastry DailyBake" 
              className="w-full h-full object-cover transform hover:scale-105 transition duration-700 ease-in-out"
            />
          </div>
        </div>
      </section>

      {/* MENU SECTION (Hanya Gambar & Nama Kue) */}
      <section id="menu" className="bg-white py-20 px-6 border-y border-slate-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-2 mb-12">
            <h2 className="text-2xl font-black text-slate-900">Menu Best Seller </h2>
            <p className="text-xs text-slate-400">Kue Best Seller dari Dailybake</p>
          </div>

          {loading ? (
            <div className="text-center py-12 text-xs text-slate-400 tracking-wide animate-pulse">
              🔄 Menghubungkan ke database dapur DailyBake...
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-400 border border-dashed rounded-2xl p-6">
              Belum ada produk yang diunggah di database.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
                <div key={product.id} className="bg-slate-50 p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4 flex flex-col justify-between">
                  <div>
                    {/* Gambar Produk */}
                    <div className="w-full aspect-video bg-sky-100 rounded-xl flex items-center justify-center text-3xl overflow-hidden">
                      {product.image ? (
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      ) : (
                        "🧁"
                      )}
                    </div>
                    
                    {/* Nama & Deskripsi */}
                    <div className="mt-4">
                      <h4 className="font-bold text-sm text-slate-800 line-clamp-1 text-center">{product.name}</h4>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 h-8 leading-relaxed text-center">
                        {product.description || "Premium freshly baked product."}
                      </p>
                    </div>
                  </div>

                  {/* Bagian bawah dikosongkan/bersih dari info harga & tombol beli */}
                  <div className="pt-2 border-t border-slate-100 mt-2 text-center">
                    <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">
                      DailyBake Quality Checked
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <div className="text-center space-y-2 mb-16">
          <h2 className="text-2xl font-black text-slate-900">3 Langkah Mudah Menikmati Kue</h2>
          <p className="text-xs text-slate-400">Alur transaksi praktis tanpa perlu antre lama di toko</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center relative">
          <div className="space-y-3 p-4">
            <div className="w-10 h-10 rounded-full bg-sky-500 text-white font-black flex items-center justify-center mx-auto text-xs shadow-md">1</div>
            <h3 className="font-bold text-sm text-slate-800">Pilih & Pesan</h3>
            <p className="text-[11px] text-slate-400 leading-relaxed">Pilih aneka ragam roti favorit Anda lewat etalase digital, isi formulir dan jam pengambilan sesuai keinginan Anda.</p>
          </div>

          <div className="space-y-3 p-4">
            <div className="w-10 h-10 rounded-full bg-sky-500 text-white font-black flex items-center justify-center mx-auto text-xs shadow-md">2</div>
            <h3 className="font-bold text-sm text-slate-800">Pantau Proses Dapur</h3>
            <p className="text-[11px] text-slate-400 leading-relaxed">Pantau secara real-time status kue Anda dari dashboard. Anda tahu persis kapan kue mulai dimasukkan ke dalam oven.</p>
          </div>

          <div className="space-y-3 p-4">
            <div className="w-10 h-10 rounded-full bg-sky-500 text-white font-black flex items-center justify-center mx-auto text-xs shadow-md">3</div>
            <h3 className="font-bold text-sm text-slate-800">Ambil Hangat-Hangat</h3>
            <p className="text-[11px] text-slate-400 leading-relaxed">Datang ke toko fisik kami tepat waktu, tunjukkan nota transaksi, dan bawa pulang kue lezat Anda dalam keadaan fresh!</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-8 px-6 border-t border-slate-800">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 DailyBake Management System. All rights reserved.</p>
          <div className="flex gap-4 text-[11px]">
            <a href="#" className="hover:text-white transition">Kebijakan Privasi</a>
            <a href="#" className="hover:text-white transition">Syarat & Ketentuan</a>
          </div>
        </div>
      </footer>

    </div>
  );
}