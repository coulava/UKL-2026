"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

// Interface sesuai struktur skema data dari Postman
interface DashboardSummary {
  totalRevenue: number;
  totalOrders: number;
  totalProductsSold: number;
  totalCustomers: number;
}

interface OrderReport {
  id: string;
  invoiceNumber: string;
  customerName: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

export default function ReportsPage() {
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(false);
  
  // State Data Real dari Backend
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [orders, setOrders] = useState<OrderReport[]>([]);

  // State Filter Query Params 
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("BAKING"); 

  // 1. Fetch Ringkasan Dashboard (Endpoint: /reports/dashboard)
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoadingSummary(true);
        const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
        const base = process.env.NEXT_PUBLIC_BASE_URL;

        const res = await fetch(`${base}/reports/dashboard`, {
          method: "GET",
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        if (!res.ok) throw new Error(`Status error: ${res.status}`);
        const responseData = await res.json();
        
        // Membaca data jika dibungkus .data atau langsung objek utama
        setSummary(responseData.data || responseData || null);
      } catch (error) {
        console.error("Gagal memuat ringkasan laporan:", error);
        toast.error("Gagal mengambil data ringkasan dashboard.");
      } finally {
        setLoadingSummary(false);
      }
    };

    fetchSummary();
    handleFetchFilteredOrders(); // Muat data tabel pertama kali saat komponen mount
  }, []);

  // 2. Fetch Laporan Transaksi dengan Filter (Endpoint: /reports/orders)
  const handleFetchFilteredOrders = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setLoadingOrders(true);
      const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
      const base = process.env.NEXT_PUBLIC_BASE_URL;
      
      // Penyusunan Query Params dinamis
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      if (status) params.append("status", status);

      const res = await fetch(`${base}/reports/orders?${params.toString()}`, {
        method: "GET",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!res.ok) throw new Error(`Status error: ${res.status}`);
      const responseData = await res.json();
      
      const list: OrderReport[] = responseData.data || responseData.orders || responseData || [];
      setOrders(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error("Gagal memuat daftar transaksi laporan:", error);
      toast.error("Gagal memuat data filter transaksi.");
    } finally {
      setLoadingOrders(false);
    }
  };

  const formatRupiah = (num: number) => {
    return "Rp " + (num ?? 0).toLocaleString("id-ID");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 antialiased">
      {/* HEADER HALAMAN */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Laporan Toko DailyBake</h1>
        <p className="text-sm text-slate-500 mt-1">
          Pantau omzet pendapatan, total penjualan kue, dan filter riwayat transaksi pesanan secara real-time.
        </p>
      </div>

      {/* SECTION 1: RINGKASAN DATA (CARDS) */}
      {loadingSummary ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-100 rounded-xl border border-slate-100" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card Pendapatan */}
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Pendapatan</span>
            <h3 className="text-xl font-black text-slate-800 mt-2">{summary ? formatRupiah(summary.totalRevenue) : "Rp 0"}</h3>
          </div>
          {/* Card Pesanan */}
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Jumlah Pesanan</span>
            <h3 className="text-xl font-black text-slate-800 mt-2">{(summary?.totalOrders ?? 0)} Transaksi</h3>
          </div>
          {/* Card Produk Terjual */}
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Kue Terjual</span>
            <h3 className="text-xl font-black text-slate-800 mt-2">{(summary?.totalProductsSold ?? 0)} Pcs</h3>
          </div>
          {/* Card Pelanggan */}
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pelanggan Aktif</span>
            <h3 className="text-xl font-black text-slate-800 mt-2">{(summary?.totalCustomers ?? 0)} Pengguna</h3>
          </div>
        </div>
      )}

      {/* SECTION 2: FORM FILTER TRANSAKSI */}
      <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-4">
          ⚙️ Filter Laporan Transaksi
        </span>
        
        <form onSubmit={handleFetchFilteredOrders} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
          {/* Tanggal Mulai */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500">Tanggal Mulai</label>
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none transition-all"
            />
          </div>

          {/* Tanggal Selesai */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500">Tanggal Selesai</label>
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none transition-all"
            />
          </div>

          {/* Status Pesanan */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500">Status Transaksi</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none font-medium text-slate-700 transition-all cursor-pointer"
            >
              <option value="PENDING">PENDING</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="BAKING">BAKING (Proses Oven)</option>
              <option value="READY">READY (Siap Ambil)</option>
              <option value="COMPLETED">COMPLETED (Selesai)</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          {/* Tombol Terapkan */}
          <button
            type="submit"
            className="w-full text-xs font-bold uppercase tracking-wider bg-sky-400 hover:bg-sky-500 text-white py-2.5 px-4 rounded-lg transition-colors shadow-sm shadow-sky-400/10 cursor-pointer active:scale-[0.98]"
          >
            Cari Laporan
          </button>
        </form>
      </div>

      {/* SECTION 3: TABEL LAPORAN HASIL FILTER */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <th className="px-6 py-4">Nomor Invoice</th>
                <th className="px-6 py-4">Nama Pelanggan</th>
                <th className="px-6 py-4">Tanggal Pesan</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Total Tagihan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loadingOrders ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400 text-xs animate-pulse font-medium">
                    🔄 Mengekstrak data transaksi dari database server...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400 text-xs font-medium">
                    📭 Tidak ditemukan data transaksi untuk kriteria filter ini.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs font-bold text-slate-700">
                      {order.invoiceNumber || `INV-#${order.id}`}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      {order.customerName || "Customer Baker"}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString("id-ID") : "-"}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        order.status === "COMPLETED" || order.status === "DONE"
                          ? "bg-emerald-50 text-emerald-700" 
                          : order.status === "BAKING" || order.status === "CONFIRMED"
                          ? "bg-sky-50 text-sky-700" 
                          : "bg-slate-100 text-slate-600"
                      }`}>
                        ● {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-slate-800">
                      {formatRupiah(order.totalAmount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}