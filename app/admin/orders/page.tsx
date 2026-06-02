"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";

interface OrderItem {
  productId: string | number;
  productName?: string;
  quantity: number;
  price?: number;
}

interface Order {
  id: number;
  status: "PENDING" | "CONFIRMED" | "BAKING" | "READY" | "COMPLETED" | "CANCELLED";
  paymentStatus?: "UNPAID" | "PAID";
  paymentMethod?: string;
  pickupDate?: string;
  pickupTime?: string;
  recipientName?: string;
  recipientPhone?: string;
  recipientAddress?: string;
  notes?: string;
  totalPrice?: number;
  items?: OrderItem[];
  createdAt?: string;
}

const STATUS_LIST = ["PENDING", "CONFIRMED", "BAKING", "READY", "COMPLETED", "CANCELLED"] as const;
const STATUS_STYLE: Record<string, string> = {
  PENDING:   "bg-yellow-50 text-yellow-700 border-yellow-200",
  CONFIRMED: "bg-blue-50 text-blue-700 border-blue-200",
  BAKING:    "bg-orange-50 text-orange-700 border-orange-200",
  READY:     "bg-green-50 text-green-700 border-green-200",
  COMPLETED: "bg-slate-100 text-slate-500 border-slate-200",
  CANCELLED: "bg-red-50 text-red-600 border-red-200",
};
const NEXT_STATUS: Record<string, string[]> = {
  PENDING:   ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["BAKING", "CANCELLED"],
  BAKING:    ["READY"],
  READY:     ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [modalOrder, setModalOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [newPaymentStatus, setNewPaymentStatus] = useState("");
  const [note, setNote] = useState("");
  const [updating, setUpdating] = useState(false);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchOrders();
  }, []);

  async function fetchOrders() {
    setLoading(true);
    const token = localStorage.getItem("accessToken");
    const base = process.env.NEXT_PUBLIC_BASE_URL;
    const params = new URLSearchParams();
    if (filterStatus !== "all") params.set("status", filterStatus);
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    try {
      const res = await fetch(`${base}/orders?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      const list: Order[] = data.data || data.orders || data || [];
      setOrders(Array.isArray(list) ? list : []);
    } catch (err: any) {
      toast.error(err.message || "Gagal memuat pesanan");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateStatus() {
    if (!modalOrder || !newStatus) return;
    setUpdating(true);
    const token = localStorage.getItem("accessToken");
    const base = process.env.NEXT_PUBLIC_BASE_URL;
    try {
      const body: Record<string, string> = { status: newStatus, note };
      if (newPaymentStatus) body.paymentStatus = newPaymentStatus;
      const res = await fetch(`${base}/orders/${modalOrder.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      toast.success(`Order #${modalOrder.id} diperbarui`);
      setModalOrder(null);
      hasFetched.current = false;
      fetchOrders();
    } catch (err: any) {
      toast.error(err.message || "Gagal update");
    } finally {
      setUpdating(false);
    }
  }

  const filtered = orders.filter((o) => {
    const matchStatus = filterStatus === "all" || o.status === filterStatus;
    const q = searchQuery.toLowerCase();
    const matchSearch = String(o.id).includes(q) || (o.recipientName?.toLowerCase().includes(q) ?? false);
    return matchStatus && matchSearch;
  });

  const counts = STATUS_LIST.reduce((acc, s) => { acc[s] = orders.filter((o) => o.status === s).length; return acc; }, {} as Record<string, number>);
  const totalRevenue = orders.filter((o) => o.paymentStatus === "PAID").reduce((sum, o) => sum + (o.totalPrice ?? 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-100 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Manajemen Pesanan</h1>
          {/* <p className="text-sm text-slate-400 mt-0.5">{orders.length} pesanan · Rp {totalRevenue.toLocaleString("id-ID")} revenue terbayar</p> */}
        </div>
        <button onClick={() => { hasFetched.current = false; fetchOrders(); }}
          className="self-start px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
          Refresh
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {STATUS_LIST.map((s) => (
          <button key={s} onClick={() => setFilterStatus(filterStatus === s ? "all" : s)}
            className={`rounded-xl p-3 border text-left transition-all ${filterStatus === s ? STATUS_STYLE[s] + " shadow-sm" : "bg-white border-slate-100 hover:border-slate-200"}`}>
            <p className="text-lg font-black text-slate-800">{counts[s] ?? 0}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{s}</p>
          </button>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="relative">
          <span className="absolute inset-y-0 left-3 flex items-center text-slate-400 pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.602 10.602Z"/>
            </svg>
          </span>
          <input type="text" placeholder="Cari ID atau nama..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-sky-400 transition-colors w-56"/>
        </div>
        <div className="flex items-center gap-2">
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-sky-400 transition-colors"/>
          <span className="text-slate-400 text-sm">–</span>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-sky-400 transition-colors"/>
          <button onClick={() => { hasFetched.current = false; fetchOrders(); }}
            className="px-4 py-2 text-xs font-bold text-white bg-sky-400 hover:bg-sky-500 rounded-xl transition-colors">
            Terapkan
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="animate-pulse bg-white border border-slate-100 rounded-2xl h-28"/>)}</div>}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <div className="py-16 text-center bg-white border border-dashed border-slate-200 rounded-2xl">
          <p className="text-slate-400 text-sm">Tidak ada pesanan ditemukan.</p>
        </div>
      )}

      {/* Table — desktop */}
      {!loading && filtered.length > 0 && (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] uppercase tracking-widest text-slate-400 bg-slate-50">
                  <th className="px-5 py-3.5 font-bold">Order</th>
                  <th className="px-5 py-3.5 font-bold">Penerima</th>
                  <th className="px-5 py-3.5 font-bold">Pickup</th>
                  <th className="px-5 py-3.5 font-bold">Total</th>
                  <th className="px-5 py-3.5 font-bold">Status</th>
                  <th className="px-5 py-3.5 font-bold">Bayar</th>
                  <th className="px-5 py-3.5 font-bold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <span className="font-black text-slate-800">#{order.id}</span>
                      {order.notes && <p className="text-[11px] text-slate-400 italic mt-0.5 max-w-[120px] truncate">{order.notes}</p>}
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-700">{order.recipientName || "—"}</p>
                      {order.recipientPhone && <p className="text-[11px] text-slate-400">{order.recipientPhone}</p>}
                    </td>
                    <td className="px-5 py-4 text-slate-500">
                      {order.pickupDate || "—"}
                      {order.pickupTime && <span className="text-slate-400"> · {order.pickupTime}</span>}
                    </td>
                    <td className="px-5 py-4 font-bold text-slate-800">
                      {order.totalPrice != null ? `Rp ${order.totalPrice.toLocaleString("id-ID")}` : "—"}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${STATUS_STYLE[order.status]}`}>{order.status}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${order.paymentStatus === "PAID" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-50 text-slate-400 border-slate-200"}`}>
                        {order.paymentStatus || "—"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <button onClick={() => { setModalOrder(order); setNewStatus(NEXT_STATUS[order.status]?.[0] || ""); setNewPaymentStatus(""); setNote(""); }}
                        disabled={NEXT_STATUS[order.status]?.length === 0}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${NEXT_STATUS[order.status]?.length > 0 ? "bg-sky-400 text-white hover:bg-sky-500" : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}>
                        {NEXT_STATUS[order.status]?.length > 0 ? "Update" : "Done"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {filtered.map((order) => {
              const canUpdate = NEXT_STATUS[order.status]?.length > 0;
              return (
                <div key={order.id} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-black text-slate-800">#{order.id}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${STATUS_STYLE[order.status]}`}>{order.status}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${order.paymentStatus === "PAID" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-50 text-slate-400 border-slate-200"}`}>{order.paymentStatus || "UNPAID"}</span>
                      </div>
                      <div className="text-xs text-slate-500 space-y-0.5">
                        {order.recipientName && <p>👤 {order.recipientName}</p>}
                        {order.pickupDate && <p>📅 {order.pickupDate}{order.pickupTime ? ` · ${order.pickupTime}` : ""}</p>}
                        {order.totalPrice != null && <p className="font-bold text-slate-700">Rp {order.totalPrice.toLocaleString("id-ID")}</p>}
                      </div>
                    </div>
                    <button onClick={() => { setModalOrder(order); setNewStatus(NEXT_STATUS[order.status]?.[0] || ""); setNewPaymentStatus(""); setNote(""); }}
                      disabled={!canUpdate}
                      className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold ${canUpdate ? "bg-sky-400 text-white hover:bg-sky-500" : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}>
                      {canUpdate ? "Update" : "Done"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Modal */}
      {modalOrder && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6 border border-slate-100">
            <div className="flex items-center justify-between pb-3 mb-5 border-b border-slate-100">
              <div>
                <h3 className="font-black text-slate-800">Update Pesanan</h3>
                <p className="text-xs text-slate-400">Order #{modalOrder.id} · {modalOrder.recipientName}</p>
              </div>
              <button onClick={() => setModalOrder(null)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">✕</button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Status Sekarang</p>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${STATUS_STYLE[modalOrder.status]}`}>{modalOrder.status}</span>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Ubah Status Pesanan</p>
                <div className="flex flex-wrap gap-2">
                  {NEXT_STATUS[modalOrder.status].map((s) => (
                    <button key={s} onClick={() => setNewStatus(s)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${newStatus === s ? STATUS_STYLE[s] + " shadow-sm" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Status Pembayaran (opsional)</p>
                <div className="flex gap-2">
                  {["UNPAID", "PAID"].map((ps) => (
                    <button key={ps} onClick={() => setNewPaymentStatus(newPaymentStatus === ps ? "" : ps)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${newPaymentStatus === ps ? ps === "PAID" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-600 border-slate-200" : "bg-white text-slate-400 border-slate-200 hover:border-slate-300"}`}>
                      {ps}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Catatan</p>
                <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Misal: Pembayaran sudah dikonfirmasi"
                  rows={3} className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-sky-400 resize-none"/>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-slate-100">
              <button onClick={() => setModalOrder(null)} className="px-4 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl">Batal</button>
              <button onClick={handleUpdateStatus} disabled={updating || !newStatus}
                className="px-5 py-2.5 text-sm font-bold text-white bg-sky-400 hover:bg-sky-500 rounded-xl disabled:opacity-50">
                {updating ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}