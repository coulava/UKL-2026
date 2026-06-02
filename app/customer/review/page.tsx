// app/customer/reviews/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface ReviewItem {
  id: number;
  orderId: number;
  productId: number;
  rating: number;
  comment: string;
}

interface ProductItem {
  id: number;
  name: string;
}

export default function CustomerReviewsPage() {
  const router = useRouter();
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]); 
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // State Modal Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [productId, setProductId] = useState(""); // Menyimpan ID kue dari dropdown
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  // 1. Ambil Semua Ulasan (GET /reviews)
  const fetchMyReviews = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/reviews`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const responseData = await res.json();
      if (res.ok) setReviews(responseData.data || responseData || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Ambil Daftar Produk Kue untuk Dropdown
  const fetchActiveProducts = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/products`, {
        method: "GET",
      });
      const responseData = await res.json();
      if (res.ok) setProducts(responseData.data || responseData || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchMyReviews();
    fetchActiveProducts();
  }, []);

  // 3. Kirim Ulasan Baru (POST /reviews)
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi tambahan di sisi klien sebelum menembak API backend
    if (!orderId) {
      toast.error("ID Pesanan wajib diisi!");
      return;
    }
    if (!productId) {
      toast.error("Silakan pilih varian kue terlebih dahulu!");
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/reviews`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: Number(orderId),
          productId: Number(productId), // Mengirimkan ID angka asli ke backend Railway secara background
          rating: Number(rating),
          comment: comment.trim(),
        }),
      });

      if (res.ok) {
        toast.success("Ulasan kue berhasil diterbitkan!");
        setIsModalOpen(false);
        // Reset form setelah sukses
        setOrderId(""); 
        setProductId(""); 
        setComment("");
        // Muat ulang daftar ulasan terbaru
        fetchMyReviews();
      } else {
        const err = await res.json();
        toast.error(err.message || "Gagal mengirim ulasan.");
      }
    } catch (error) {
      toast.error("Terjadi masalah koneksi ke server.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 space-y-6 mt-6">
      {/* Header Halaman */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Ulasan Kue</h1>
          <p className="text-xs text-slate-500 mt-1">Kelola feedback rasa kue riil Anda</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer shadow-md transition-all active:scale-95"
        >
          + Tulis Ulasan
        </button>
      </div>

      <hr className="border-slate-100" />

      {/* Konten Utama Daftar Ulasan */}
      {loading ? (
        <div className="h-24 bg-slate-100/70 animate-pulse rounded-2xl border border-slate-100" />
      ) : reviews.length === 0 ? (
        <div className="p-12 text-center bg-white border border-dashed rounded-2xl text-slate-400 text-sm">
          Belum ada ulasan kue yang Anda tulis.
        </div>
      ) : (
        <div className="grid gap-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white p-5 rounded-2xl border border-slate-100 flex justify-between items-center shadow-sm hover:shadow-md transition-shadow">
              <div className="space-y-1">
                <p className="text-xs font-mono font-bold text-slate-400">Review ID: #{review.id}</p>
                <div className="flex text-sky-400 text-xs">{"★".repeat(review.rating)}</div>
                <p className="text-sm font-medium text-slate-700">"{review.comment}"</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL POPUP FORM REVIEW */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div>
              <h3 className="text-base font-black text-slate-800">Tulis Ulasan Kue Baru</h3>
              <p className="text-xs text-slate-400 mt-0.5">Pastikan status pesanan kue Anda telah bernilai COMPLETED</p>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              
              {/* 1. INPUT ORDER ID */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">ID Pesanan (Order ID)</label>
                <input 
                  type="number" 
                  placeholder="Contoh: 1" 
                  value={orderId} 
                  onChange={(e) => setOrderId(e.target.value)} 
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-blue-500 text-slate-700 font-medium bg-slate-50/30" 
                  required 
                />
              </div>

              {/* 2. DROPDOWN PRODUK KUE (BERSIH - KHUSUS ROLE CUSTOMER) */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Pilih Kue Yang Dibeli</label>
                <select
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-blue-500 font-medium text-slate-700 cursor-pointer bg-white"
                  required
                >
                  <option value="">-- Pilih Varian Kue --</option>
                  {products.map((prod) => (
                    <option key={prod.id} value={prod.id}>
                      {prod.name} {/* ID database disembunyikan agar ramah pengguna */}
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. RATING MAKSIMAL BINTANG 5 */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Beri Rating Kepuasan</label>
                <select 
                  value={rating} 
                  onChange={(e) => setRating(Number(e.target.value))} 
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl cursor-pointer bg-white font-medium text-slate-700"
                >
                  <option value={5}>⭐⭐⭐⭐⭐ (5/5) - Sempurna</option>
                  <option value={4}>⭐⭐⭐⭐ (4/5) - Enak</option>
                  <option value={3}>⭐⭐⭐ (3/5) - Biasa</option>
                </select>
              </div>

              {/* 4. ISI KOMENTAR TEKSTUR RASA */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Komentar Rasa Kue</label>
                <textarea 
                  placeholder="Ceritakan tekstur krim, kelembutan roti, atau rasa kue di sini..." 
                  value={comment} 
                  onChange={(e) => setComment(e.target.value)} 
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-blue-500 text-slate-700 resize-none font-medium" 
                  rows={3} 
                  required 
                />
              </div>

              {/* SEKSI ACTION BUTTONS */}
              <div className="flex justify-end gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="text-xs font-bold text-slate-500 px-4 py-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={submitting} 
                  className="px-4 py-2 bg-blue-600 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md cursor-pointer hover:bg-blue-700 disabled:bg-slate-300 transition-all"
                >
                  {submitting ? "Mengirim..." : "Kirim Ulasan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}