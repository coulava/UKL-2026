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

export default function BakerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOrder, setModalOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState("");
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
    try {
      const res = await fetch(`${base}/orders`, {
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
      const res = await fetch(`${base}/orders/${modalOrder.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus, note }),
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      toast.success(`Order #${modalOrder.id} → ${newStatus}`);
      setModalOrder(null);
      hasFetched.current = false;
      fetchOrders();
    } catch (err: any) {
      toast.error(err.message || "Gagal update status");
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

  const counts = STATUS_LIST.reduce((acc, s) => {
    acc[s] = orders.filter((o) => o.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-100 pb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Pesanan Masuk</h1>
          <p className="text-sm text-slate-400 mt-0.5">{orders.length} total pesanan</p>
        </div>
        <button onClick={() => { hasFetched.current = false; fetchOrders(); }}
          className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
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

      {/* Search */}
      <div className="relative max-w-xs">
        <span className="absolute inset-y-0 left-3 flex items-center text-slate-400 pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.602 10.602Z"/>
          </svg>
        </span>
        <input type="text" placeholder="Cari ID atau nama..." value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-sky-400 transition-colors"/>
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white border border-slate-100 rounded-2xl h-28"/>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <div className="py-16 text-center bg-white border border-dashed border-slate-200 rounded-2xl">
          <p className="text-slate-400 text-sm">Tidak ada pesanan ditemukan.</p>
        </div>
      )}

      {/* Cards */}
      {!loading && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((order) => {
            const canUpdate = NEXT_STATUS[order.status]?.length > 0;
            return (
              <div key={order.id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-black text-slate-800">Order #{order.id}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${STATUS_STYLE[order.status]}`}>
                        {order.status}
                      </span>
                      {order.paymentStatus && (
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${order.paymentStatus === "PAID" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-50 text-slate-500 border-slate-200"}`}>
                          {order.paymentStatus}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500">
                      {order.recipientName && <span>👤 {order.recipientName}</span>}
                      {order.recipientPhone && <span>📞 {order.recipientPhone}</span>}
                      {order.pickupDate && <span>📅 {order.pickupDate}{order.pickupTime ? ` · ${order.pickupTime}` : ""}</span>}
                      {order.paymentMethod && <span>💳 {order.paymentMethod}</span>}
                      {order.totalPrice != null && <span className="font-bold text-slate-700">Rp {order.totalPrice.toLocaleString("id-ID")}</span>}
                    </div>
                    {order.recipientAddress && <p className="text-xs text-slate-400">📍 {order.recipientAddress}</p>}
                    {order.notes && <p className="text-xs text-slate-400 italic">📝 {order.notes}</p>}
                    {order.items && order.items.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {order.items.map((item, idx) => (
                          <span key={idx} className="text-[11px] bg-slate-50 border border-slate-100 text-slate-600 px-2.5 py-1 rounded-lg font-medium">
                            {item.productName || `Produk #${item.productId}`} × {item.quantity}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button onClick={() => { setModalOrder(order); setNewStatus(NEXT_STATUS[order.status]?.[0] || ""); setNote(""); }}
                    disabled={!canUpdate}
                    className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all ${canUpdate ? "bg-sky-400 text-white hover:bg-sky-500" : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}>
                    {canUpdate ? "Update Status" : "Selesai"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {modalOrder && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6 border border-slate-100">
            <div className="flex items-center justify-between pb-3 mb-5 border-b border-slate-100">
              <div>
                <h3 className="font-black text-slate-800">Update Status</h3>
                <p className="text-xs text-slate-400">Order #{modalOrder.id}</p>
              </div>
              <button onClick={() => setModalOrder(null)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">✕</button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Status Sekarang</p>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${STATUS_STYLE[modalOrder.status]}`}>{modalOrder.status}</span>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Ubah ke</p>
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
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Catatan (opsional)</p>
                <textarea value={note} onChange={(e) => setNote(e.target.value)}
                  placeholder="Misal: Pesanan sudah dikonfirmasi"
                  rows={3} className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-sky-400 resize-none transition-colors"/>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-slate-100">
              <button onClick={() => setModalOrder(null)} className="px-4 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Batal</button>
              <button onClick={handleUpdateStatus} disabled={updating || !newStatus}
                className="px-5 py-2.5 text-sm font-bold text-white bg-sky-400 hover:bg-sky-500 rounded-xl transition-colors disabled:opacity-50">
                {updating ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}