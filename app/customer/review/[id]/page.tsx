// app/customer/reviews/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

interface ReviewDetail {
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

export default function ReviewDetailPage() {
  const params = useParams();
  const router = useRouter();
  const reviewId = params.id; 

  const [review, setReview] = useState<ReviewDetail | null>(null);
  const [productName, setProductName] = useState<string>("Memuat nama kue...");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviewAndProduct = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
        
        const reviewRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/reviews/${reviewId}`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });
        const reviewData = await reviewRes.json();
        
        if (reviewRes.ok) {
          const currentReview = reviewData.data || reviewData;
          setReview(currentReview);

          const productRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/products`, {
            method: "GET",
          });
          const productData = await productRes.json();
          
          if (productRes.ok) {
            const allProducts: ProductItem[] = productData.data || productData || [];
            const matchedProduct = allProducts.find(p => p.id === currentReview.productId);
            setProductName(matchedProduct ? matchedProduct.name : `Produk ID: ${currentReview.productId}`);
          }
        } else {
          toast.error("Gagal memuat detail ulasan");
        }
      } catch (error) {
        toast.error("Terjadi gangguan koneksi.");
      } finally {
        setLoading(false);
      }
    };

    if (reviewId) fetchReviewAndProduct();
  }, [reviewId]);

  return (
    <div className="max-w-xl mx-auto px-4 mt-8 antialiased">
      {/* Tombol Kembali */}
      <button 
        onClick={() => router.push("/customer/reviews")}
        className="mb-4 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1 cursor-pointer select-none"
      >
        ← Kembali ke Daftar Ulasan
      </button>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="h-44 bg-slate-50 border border-slate-100 rounded-2xl animate-pulse" />
      ) : !review ? (
        <div className="p-8 text-center text-slate-400 bg-white border border-slate-100 rounded-2xl text-xs font-medium">
          Ulasan tidak ditemukan atau telah dihapus.
        </div>
      ) : (
        /* Card Utama Detail Review */
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex justify-between items-start border-b border-slate-50 pb-3">
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">Rincian Ulasan Anda</h2>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Ulasan riil yang berhasil dikirim ke dapur DailyBake</p>
            </div>
            <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded-md font-mono font-bold tracking-wider shrink-0 shadow-sm">
              REV-#{review.id}
            </span>
          </div>

          {/* Metadata Transaksi */}
          <div className="text-xs space-y-2.5 text-slate-600 bg-slate-50/60 p-4 rounded-xl border border-slate-100/70 font-medium">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">ID Pesanan (Order)</span>
              <span className="font-bold text-slate-700">#{review.orderId}</span>
            </div>
            <div className="flex justify-between items-center border-t border-slate-100 pt-2">
              <span className="text-slate-400">Varian Produk</span>
              <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md text-[11px]">
                🧁 {productName}
              </span>
            </div>
            <div className="flex justify-between items-center border-t border-slate-100 pt-2">
              <span className="text-slate-400">Penilaian Bintang</span>
              <span className="text-sky-500 font-bold flex items-center gap-1">
                {"★".repeat(review.rating)}
                <span className="text-slate-400 font-semibold text-[11px]">({review.rating}/5)</span>
              </span>
            </div>
          </div>

          {/* Blok Isi Komentar */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Catatan Komentar Rasa:</span>
            <div className="p-4 bg-blue-50/20 text-slate-800 font-medium italic border border-blue-50/40 rounded-xl text-sm leading-relaxed">
              "{review.comment}"
            </div>
          </div>

        </div>
      )}
    </div>
  );
}