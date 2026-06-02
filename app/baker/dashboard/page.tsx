"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

interface Order {
  id: number;
  pickupDate: string;
  pickupTime: string;
  recipientName: string;
  paymentMethod: "CASH" | "BANK_TRANSFER" | "E_WALLET";
  status: "PENDING" | "CONFIRMED" | "BAKING" | "READY" | "COMPLETED" | "CANCELLED"; //
  paymentStatus: "UNPAID" | "PAID"; //
  notes?: string;
}

export default function BakerDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Ambil data pesanan dari server
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/orders`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const responseData = await res.json();
        const list = responseData.data || responseData || [];
        setOrders(list);
      } else {
        toast.error("Gagal mengambil data antrean dapur.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Masalah jaringan database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // 2. Fungsi Utama: Update Alur Produksi Kue
  const handleUpdateStatus = async (orderId: number, targetStatus: string, currentPaymentStatus: string) => {
    try {
      const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
      
      const payload = {
        status: targetStatus, //
        paymentStatus: currentPaymentStatus, //
        note: `Produksi dialihkan ke tahap ${targetStatus} oleh chef.` //
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success(`🚀 Nota #${orderId} berhasil diubah ke status: ${targetStatus}`);
        fetchOrders();
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || "Gagal memperbarui status produksi.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Gagal menghubungkan ke server.");
    }
  };

  // 3. Fungsi FIX: Verifikasi Uang Masuk yang Menghindari Eror Siklus "PENDING ke PENDING"
  const handleConfirmPayment = async (orderId: number, currentStatus: string) => {
    try {
      const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
      
      // LOGIKA ANTI-EROR: Jika status masih PENDING, paksa naikkan ke CONFIRMED agar diterima backend
      const targetStatus = currentStatus === "PENDING" ? "CONFIRMED" : currentStatus;

      const payload = {
        status: targetStatus, // Menggunakan status aman
        paymentStatus: "PAID", // Set Lunas!
        note: "Pembayaran terverifikasi masuk. Status disesuaikan oleh kasir." //
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success(`💰 Nota #${orderId} sukses dikonfirmasi LUNAS!`);
        fetchOrders();
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || "Gagal mengubah status keuangan.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Gagal mengirim data verifikasi kasir.");
    }
  };

  // 4. Logika Pengendali Tombol Produksi Oven Kue
  const renderStatusButton = (order: Order) => {
    // Proteksi Transfer: Sembunyikan tombol oven jika belum bayar (Khusus BANK & E-WALLET)
    const isTransferButUnpaid = 
      (order.paymentMethod === "BANK_TRANSFER" || order.paymentMethod === "E_WALLET") && 
      order.paymentStatus === "UNPAID";

    switch (order.status) {
      case "PENDING":
        return (
          <button
            onClick={() => handleUpdateStatus(order.id, "CONFIRMED", order.paymentStatus)}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 px-4 rounded-xl cursor-pointer text-xs shadow-sm transition-all"
          >
            ✔️ Terima & Setujui Pesanan
          </button>
        );

      case "CONFIRMED":
        if (isTransferButUnpaid) {
          return (
            <div className="w-full text-center bg-red-50 text-red-600 py-3 px-4 rounded-xl border border-red-200 font-semibold text-[10px] shadow-sm leading-normal">
              🛑 PROSES DITAHAN! Menunggu pelanggan transfer & Admin mengklik tombol "Konfirmasi Sudah Bayar" di atas.
            </div>
          );
        }
        return (
          <button
            onClick={() => handleUpdateStatus(order.id, "BAKING", order.paymentStatus)} //
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl cursor-pointer text-xs shadow-sm transition-all"
          >
            🔥 Masukkan ke Dalam Oven (Mulai Panggang)
          </button>
        );

      case "BAKING":
        return (
          <button
            onClick={() => handleUpdateStatus(order.id, "READY", order.paymentStatus)} //
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 px-4 rounded-xl cursor-pointer text-xs shadow-sm transition-all"
          >
            📦 Kue Matang & Siap Diambil
          </button>
        );

      case "READY":
        return (
          <button
            onClick={() => handleUpdateStatus(order.id, "COMPLETED", "PAID")} //
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-4 rounded-xl cursor-pointer text-xs shadow-sm transition-all"
          >
            🤝 Serahkan Kue & Selesaikan Pesanan
          </button>
        );

      case "COMPLETED":
        return (
          <div className="w-full text-center bg-gray-100 text-gray-500 py-2.5 px-4 rounded-xl font-bold text-xs border border-gray-200">
            ✅ Pesanan Selesai Diambil
          </div>
        );

      case "CANCELLED":
        return (
          <div className="w-full text-center bg-red-50 text-red-400 py-2.5 px-4 rounded-xl font-bold text-xs border border-red-100">
            ❌ Pesanan Dibatalkan
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-black p-6">
      <div className="max-w-6xl mx-auto pt-6">
        
        <div className="mb-6">
          <h1 className="text-xl font-black text-slate-800">Dapur Produksi Kue</h1>
          <p className="text-xs text-gray-500">Kelola alur panggangan oven kue serta konfirmasi pembayaran masuk dari pelanggan</p>
        </div>

        {loading ? (
          <div className="text-xs text-gray-400">Memuat data nota dapur...</div>
        ) : orders.length === 0 ? (
          <div className="bg-white p-8 text-center rounded-2xl border border-gray-200 text-gray-400 text-xs shadow-sm">
            Tidak ada pesanan masuk hari ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between text-xs">
                
                <div>
                  {/* Bagian Atas Card */}
                  <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
                    <span className="font-bold text-slate-800">Nota #{order.id}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide ${
                      order.status === "PENDING" ? "bg-amber-100 text-amber-700" :
                      order.status === "CONFIRMED" ? "bg-blue-100 text-blue-700" :
                      order.status === "BAKING" ? "bg-purple-100 text-purple-700" :
                      order.status === "READY" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                    }`}>
                      • {order.status}
                    </span>
                  </div>

                  {/* Detail Pengambilan & Pembayaran */}
                  <div className="space-y-1.5 text-gray-600 mb-4">
                    <p>📅 <span className="font-bold text-slate-700">Tanggal Ambil:</span> {new Date(order.pickupDate).toLocaleDateString("id-ID")}</p>
                    <p>⏰ <span className="font-bold text-slate-700">Jam Pengambilan:</span> {order.pickupTime} WIB</p>
                    <p>👤 <span className="font-bold text-slate-700">Pemesan:</span> {order.recipientName}</p>
                    <p className="flex items-center gap-1.5 flex-wrap">
                      💳 <span className="font-bold text-slate-700">Metode:</span> {order.paymentMethod} 
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-black tracking-wider ${
                        order.paymentStatus === "PAID" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}>
                        ({order.paymentStatus})
                      </span>
                    </p>

                    {/* TOMBOL FIX PEMBAYARAN MANUAL */}
                    {order.paymentStatus === "UNPAID" && order.status !== "COMPLETED" && order.status !== "CANCELLED" && (
                      <button
                        onClick={() => handleConfirmPayment(order.id, order.status)}
                        className="mt-3 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-3 rounded-xl transition-all cursor-pointer text-[10px] block text-center shadow-sm"
                      >
                        💵 Konfirmasi Sudah Bayar (Validasi Kasir)
                      </button>
                    )}
                  </div>

                  {/* Informasi Catatan Tambahan */}
                  <div className="mb-5 p-2.5 bg-yellow-50/60 border border-yellow-100 rounded-xl text-gray-500 text-[11px]">
                    ⚠️ <span className="font-bold text-amber-800">Catatan Pembeli:</span> "{order.notes || "Tanpa Catatan"}"
                  </div>
                </div>

                {/* Tombol Alur Oven */}
                <div>
                  {renderStatusButton(order)}
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}