"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

interface BakerOrder {
  id: string;
  pickupDate: string;
  pickupTime: string;
  status: string;
  note?: string;
  items: any[];
}

export default function BakerDashboard() {
  const [tasks, setTasks] = useState<BakerOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchBakerTasks = async () => {
    setLoading(true);
    const token = localStorage.getItem("accessToken");
    try {
      // Menarik data orderan masuk yang siap/sedang dikerjakan di dapur
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/orders?status=PENDING&page=1&limit=10`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setTasks(data.data || data || []);
    } catch {
      toast.error("Gagal sinkronisasi data antrean dapur.");
    } finally {
      setLoading(false);
    }
  };

  const markAsReady = async (id: string) => {
    const token = localStorage.getItem("accessToken");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/orders/${id}/status`, {
        method: "PATCH",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ status: "READY" }), // Tandai kue matang/siap diambil
      });
      if (res.ok) {
        toast.success("Kue selesai dipanggang! Status diperbarui menjadi READY.");
        fetchBakerTasks();
      }
    } catch {
      toast.error("Gagal merubah kesiapan kue.");
    }
  };

  useEffect(() => { fetchBakerTasks(); }, []);

  return (
    <main className="p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8 space-y-6 text-xs">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dapur Produksi Kue</h1>
        <p className="text-slate-400">Daftar pesanan kue masuk yang harus segera dipanggang.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <p className="text-slate-400">Loading data produksi...</p>
        ) : tasks.length === 0 ? (
          <p className="text-slate-400 bg-white p-6 rounded-xl border border-dashed text-center col-span-2">Antrean oven kosong. Tidak ada pesanan kue pending.</p>
        ) : (
          tasks.map((t) => (
            <div key={t.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3 flex flex-col justify-between">
              <div className="space-y-1">
                <span className="px-2 py-0.5 bg-amber-50 text-amber-600 border border-amber-100 rounded-md font-bold text-[10px]">BUTUH DIPANGGANG</span>
                <p className="font-bold text-slate-900 mt-2">Batas Pengambilan: {t.pickupDate} ({t.pickupTime})</p>
                <p className="text-slate-400 italic">Catatan Pembeli: "{t.note || 'Tidak ada catatan'}"</p>
              </div>
              <button onClick={() => markAsReady(t.id)} className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all">
                ✔ Selesai Dimasak & Siap Ambil
              </button>
            </div>
          ))
        )}
      </div>
    </main>
  );
}