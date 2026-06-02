"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Order {
  id: string;
  pickupDate: string;
  pickupTime: string;
  paymentMethod: string;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  status: "PENDING" | "READY" | "COMPLETED" | "FAILED";
  paymentStatus: "PENDING" | "SUCCESS" | "FAILED";
  note?: string;
  items: any[];
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>("COMPLETED");
  const [startDate, setStartDate] = useState<string>("2026-06-01");
  const [endDate, setEndDate] = useState<string>("2026-06-30");

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updateStatus, setUpdateStatus] = useState<string>("");
  const [updatePaymentStatus, setUpdatePaymentStatus] = useState<string>("");
  const [updateNote, setUpdateNote] = useState<string>("");

  const fetchOrders = async () => {
    setLoading(true);
    const token = localStorage.getItem("accessToken");
    try {
      const q = new URLSearchParams({ status: statusFilter, startDate, endDate, page: "1", limit: "10" });
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/orders?${q.toString()}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setOrders(data.data || data || []);
    } catch {
      toast.error("Gagal sinkronisasi data order.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    const token = localStorage.getItem("accessToken");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/orders/${selectedOrder.id}/status`, {
        method: "PATCH",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ status: updateStatus, paymentStatus: updatePaymentStatus, note: updateNote }),
      });
      if (res.ok) {
        toast.success("Status order diperbarui!");
        setSelectedOrder(null);
        fetchOrders();
      }
    } catch {
      toast.error("Gagal update status.");
    }
  };

  useEffect(() => { fetchOrders(); }, [statusFilter, startDate, endDate]);

  return (
    <main className="p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Customer Orders (Admin)</h1>
        <p className="text-xs text-slate-400">Monitoring status pembayaran & kesiapan pesanan.</p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 flex flex-wrap gap-4 items-end text-xs">
        <div className="flex flex-col gap-1">
          <span className="font-bold text-slate-400 uppercase">Status</span>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="p-2 border rounded-lg bg-slate-50">
            <option value="PENDING">PENDING</option>
            <option value="READY">READY</option>
            <option value="COMPLETED">COMPLETED</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <span className="font-bold text-slate-400 uppercase">Mulai</span>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="p-2 border rounded-lg bg-slate-50" />
        </div>
        <div className="flex flex-col gap-1">
          <span className="font-bold text-slate-400 uppercase">Selesai</span>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="p-2 border rounded-lg bg-slate-50" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 font-bold text-slate-400 uppercase">
              <th className="p-4">Nama Penerima</th>
              <th className="p-4">Rencana Ambil</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-slate-50/50">
                <td className="p-4 font-bold text-slate-900">{o.recipientName}</td>
                <td className="p-4 text-slate-600">{o.pickupDate} ({o.pickupTime})</td>
                <td className="p-4 text-center">
                  <span className="px-2 py-0.5 rounded-full border text-[10px] font-bold bg-amber-50 text-amber-600">{o.status}</span>
                </td>
                <td className="p-4 text-center">
                  <button onClick={() => { setSelectedOrder(o); setUpdateStatus(o.status); setUpdatePaymentStatus(o.paymentStatus); }} className="px-2.5 py-1 bg-blue-50 text-blue-600 font-bold border border-blue-100 rounded-lg">Aksi</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Update Status */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleUpdateStatus} className="bg-white p-6 rounded-2xl max-w-sm w-full space-y-4 shadow-xl border text-xs">
            <h3 className="font-bold text-sm text-slate-900">Ubah Status Transaksi</h3>
            <div className="space-y-1">
              <label className="font-bold text-slate-400 block">Status Order</label>
              <select value={updateStatus} onChange={(e) => setUpdateStatus(e.target.value)} className="w-full p-2 border rounded-xl">
                <option value="PENDING">PENDING</option>
                <option value="READY">READY</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-400 block">Status Pembayaran</label>
              <select value={updatePaymentStatus} onChange={(e) => setUpdatePaymentStatus(e.target.value)} className="w-full p-2 border rounded-xl">
                <option value="PENDING">PENDING</option>
                <option value="SUCCESS">SUCCESS</option>
                <option value="FAILED">FAILED</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setSelectedOrder(null)} className="px-3 py-1.5 border rounded-xl">Batal</button>
              <button type="submit" className="px-3 py-1.5 bg-[#0B192C] text-white rounded-xl font-bold">Simpan</button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}