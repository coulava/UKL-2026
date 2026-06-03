"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

interface OrderItem {
  productId: string | number;
  productName?: string;
  quantity: number;
  price?: number;
  product?: {
    id: number;
    name: string;
    price: number;
  };
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

interface ProductItem {
  id: number;
  name: string;
}

const STATUS_STYLE: Record<string, { badge: string; label: string; desc: string; dot: string }> = {
  PENDING:   { badge: "bg-sky-50 text-sky-700 border-sky-200/60", label: "Menunggu Konfirmasi", desc: "Pesanan Anda sedang menunggu persetujuan dari dapur.", dot: "bg-sky-500" },
  CONFIRMED: { badge: "bg-indigo-50 text-indigo-700 border-indigo-200/60", label: "Dikonfirmasi", desc: "Pesanan telah dikonfirmasi dan masuk antrean.", dot: "bg-indigo-500" },
  BAKING:    { badge: "bg-orange-50 text-orange-700 border-orange-200/60", label: "Sedang Dipanggang", desc: "Kue pilihan Anda sedang diproses di dalam oven.", dot: "bg-orange-500" },
  READY:     { badge: "bg-emerald-50 text-emerald-700 border-emerald-200/60", label: "Siap Diambil", desc: "Kue sudah matang sempurna & siap dijemput!", dot: "bg-emerald-500" },
  COMPLETED: { badge: "bg-slate-50 text-slate-600 border-slate-200", label: "Selesai", desc: "Transaksi selesai. Selamat menikmati kue Anda!", dot: "bg-slate-400" },
  CANCELLED: { badge: "bg-rose-50 text-rose-600 border-rose-200", label: "Dibatalkan", desc: "Maaf, pesanan ini telah dibatalkan.", dot: "bg-rose-500" },
};

const STEP_ORDER = ["PENDING", "CONFIRMED", "BAKING", "READY", "COMPLETED"];

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  useEffect(() => {
    async function loadInitialData() {
      setLoading(true);
      await Promise.all([fetchMyOrders(), fetchProductsData()]);
      setLoading(false);
    }
    loadInitialData();
  }, []);

  async function fetchMyOrders() {
    const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
    const base = process.env.NEXT_PUBLIC_BASE_URL;
    try {
      const res = await fetch(`${base}/orders/my`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const responseData = await res.json();
      
      console.log("=== DATA RIWAYAT ORDERS DARI BE ===", responseData);

      const list: Order[] = responseData.data || responseData.orders || responseData || [];
      setOrders(Array.isArray(list) ? list : []);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Gagal memuat riwayat pesanan");
    }
  }

  async function fetchProductsData() {
    const base = process.env.NEXT_PUBLIC_BASE_URL;
    try {
      const res = await fetch(`${base}/products`, { method: "GET" });
      if (res.ok) {
        const responseData = await res.json();
        const list: ProductItem[] = responseData.data || responseData || [];
        setProducts(list);
      }
    } catch (err) {
      console.error(err);
    }
  }

  const getCleanProductName = (item: OrderItem) => {
    if (item.product?.name) return item.product.name;
    if (item.productName) return item.productName;
    const matched = products.find((p) => p.id === Number(item.productId));
    return matched ? matched.name : `Kue Varian #${item.productId}`;
  };

  const activeOrders = orders.filter((o) => !["COMPLETED", "CANCELLED"].includes(o.status));
  const historyOrders = orders.filter((o) => ["COMPLETED", "CANCELLED"].includes(o.status));

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-10 antialiased selection:bg-sky-100 text-black bg-gray-50 min-h-screen">
      
      {/* Header */}
      <div className="space-y-1 pt-4">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Pesanan Saya</h1>
        <p className="text-xs text-slate-500 font-medium">Pantau jalannya pembuatan dan riwayat belanja kue Anda</p>
        <div className="h-1 w-12 bg-blue-600 rounded-full mt-1" />
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white border border-slate-200 rounded-2xl h-44 w-full" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && orders.length === 0 && (
        <div className="py-16 text-center bg-white border border-dashed border-slate-200 rounded-2xl max-w-md mx-auto shadow-sm text-xs">
          <span className="text-3xl block mb-3">🧁</span>
          <h3 className="font-bold text-slate-800 text-sm">Belum Ada Transaksi</h3>
          <p className="text-slate-400 max-w-xs mx-auto mt-1">Dapur kami sudah siap! Yuk pilih varian kue kesukaanmu di menu etalase.</p>
        </div>
      )}

      {/* 1. SEKSI PESANAN AKTIF */}
      {!loading && activeOrders.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-3.5 bg-blue-600 rounded-full" />
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sedang Berjalan ({activeOrders.length})</h2>
          </div>

          <div className="space-y-5">
            {activeOrders.map((order) => {
              const info = STATUS_STYLE[order.status] || { badge: "bg-slate-50", label: order.status, desc: "", dot: "bg-slate-400" };
              const stepIdx = STEP_ORDER.indexOf(order.status);
              return (
                <div key={order.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-slate-300 transition-all duration-200 space-y-4 text-xs">
                  
                  {/* Row Atas */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center flex-wrap gap-2">
                        <span className="font-bold text-slate-900 text-sm">Nota #{order.id}</span>
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold border uppercase tracking-wider flex items-center gap-1 ${info.badge}`}>
                          <span className={`w-1 h-1 rounded-full ${info.dot}`} />
                          {info.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-medium">{info.desc}</p>
                    </div>
                    {order.totalPrice != null && (
                      <div className="text-left sm:text-right shrink-0">
                        <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Total </span>
                        <span className="font-black text-blue-600 text-sm whitespace-nowrap block">
                          Rp {order.totalPrice.toLocaleString("id-ID")}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Stepper Progress */}
                  {order.status !== "CANCELLED" && (
                    <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-100">
                      <div className="flex items-center justify-between gap-1 w-full overflow-x-auto scrollbar-none py-1">
                        {STEP_ORDER.map((step, idx) => {
                          const isDone = idx <= stepIdx;
                          const isCurrent = idx === stepIdx;
                          const isLast = idx === STEP_ORDER.length - 1;
                          return (
                            <div key={step} className="flex items-center flex-1 justify-center last:flex-none">
                              <div className="flex flex-col items-center text-center gap-1 relative">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border-2 transition-all duration-300 ${isCurrent ? "bg-blue-600 border-blue-600 text-white shadow-sm ring-4 ring-blue-50" : isDone ? "bg-blue-50 border-blue-100 text-blue-700" : "bg-white border-slate-200 text-slate-300"}`}>
                                  {isDone && idx < stepIdx ? "✓" : idx + 1}
                                </div>
                                <span className={`text-[8px] font-extrabold uppercase tracking-wider ${isCurrent ? "text-blue-600" : isDone ? "text-slate-600" : "text-slate-300"}`}>
                                  {step === "PENDING" ? "Antre" : step === "CONFIRMED" ? "Setuju" : step === "BAKING" ? "Oven" : step === "READY" ? "Siap" : "Selesai"}
                                </span>
                              </div>
                              {!isLast && (
                                <div className={`flex-1 h-[2px] mx-2 -mt-4 min-w-[15px] rounded-full transition-all duration-300 ${idx < stepIdx ? "bg-blue-400" : "bg-slate-200"}`} />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="flex flex-wrap gap-y-2 items-center justify-between text-[11px] font-semibold text-slate-500 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                    <div className="flex flex-wrap gap-x-3 gap-y-1">
                      {order.pickupDate && <span className="flex items-center gap-1">📅 {order.pickupDate} {order.pickupTime && `(${order.pickupTime})`}</span>}
                      {order.paymentMethod && <span className="text-slate-300">|</span>}
                      {order.paymentMethod && <span className="flex items-center gap-1">💳 {order.paymentMethod}</span>}
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${order.paymentStatus === "PAID" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"}`}>
                      {order.paymentStatus === "PAID" ? "Paid" : "Unpaid"}
                    </span>
                  </div>

                  {/* Daftar Kue */}
                  {order.items && order.items.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">Kue Yang Dipesan:</span>
                      <div className="flex flex-wrap gap-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="text-[11px] bg-white border border-slate-200 text-slate-700 px-2.5 py-1 rounded-xl font-medium shadow-sm flex items-center gap-1">
                            <span>🧁 {getCleanProductName(item)}</span>
                            <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md font-bold text-[9px]">×{item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Link Toggle */}
                  <div className="pt-1">
                    <button 
                      onClick={() => setActiveOrder(activeOrder?.id === order.id ? null : order)}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer select-none"
                    >
                      {activeOrder?.id === order.id ? "Sembunyikan rincian alamat ↑" : "Lihat rincian penerima lengkap ↓"}
                    </button>
                  </div>

                  {/* Panel Dropdown Alamat */}
                  {activeOrder?.id === order.id && (
                    <div className="bg-slate-50 rounded-xl p-3 text-[11px] text-slate-600 space-y-2 border border-slate-100">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-medium">
                        {order.recipientName && <p><span className="font-bold text-slate-400 block text-[9px] uppercase">Nama Penerima</span> {order.recipientName}</p>}
                        {order.recipientPhone && <p><span className="font-bold text-slate-400 block text-[9px] uppercase">No. Telepon</span> {order.recipientPhone}</p>}
                        {order.recipientAddress && <p className="sm:col-span-2"><span className="font-bold text-slate-400 block text-[9px] uppercase">Alamat</span> {order.recipientAddress}</p>}
                        {order.notes && <p className="sm:col-span-2 bg-blue-50/40 p-2 rounded-lg text-slate-700 border border-blue-100/50"><span className="font-bold text-blue-600 block text-[9px] uppercase">Catatan Pembeli:</span> "{order.notes}"</p>}
                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. SEKSI RIWAYAT MASA LALU */}
      {!loading && historyOrders.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-3.5 bg-slate-400 rounded-full" />
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Riwayat Selesai ({historyOrders.length})</h2>
          </div>

          <div className="grid gap-3 text-xs">
            {historyOrders.map((order) => {
              const info = STATUS_STYLE[order.status] || { badge: "bg-slate-50", label: order.status, dot: "bg-slate-400" };
              return (
                <div key={order.id} className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-200">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 text-sm">Order #{order.id}</span>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wide border ${info.badge}`}>{info.label}</span>
                    </div>
                    
                    <div className="text-[11px] text-slate-400 font-medium flex gap-3">
                      {order.pickupDate && <span>📅 {order.pickupDate}</span>}
                      {order.paymentMethod && <span>• {order.paymentMethod}</span>}
                    </div>

                    {order.items && order.items.length > 0 && (
                      <p className="text-[11px] text-slate-500 font-medium pt-0.5">
                        <span className="text-slate-400">Keranjang: </span>
                        {order.items.map((i) => `${getCleanProductName(i)} (×${i.quantity})`).join(", ")}
                      </p>
                    )}
                  </div>

                  {/* Kanan: Hanya menampilkan Harga Total */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 shrink-0">
                    {order.totalPrice != null && (
                      <span className="font-black text-slate-800 text-sm whitespace-nowrap block">
                        Rp {order.totalPrice.toLocaleString("id-ID")}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
    </div>
  );
}