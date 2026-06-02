"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface CartItem {
  productId: number;
  quantity: number;
}

export default function CustomerOrderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [currentRole, setCurrentRole] = useState("customer");

  // State Form Input Sesuai Kebutuhan Backend
  const [phoneNumber, setPhoneNumber] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("BANK TRANSFER");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  
  // Dummy data / state untuk menampung item keranjang (sesuaikan dengan state management/localStorage-mu)
  const [cartItems, setCartItems] = useState<CartItem[]>([
    { productId: 4, quantity: 1 } // Contoh default agar tidak eror kosong di backend
  ]);

  useEffect(() => {
    const role = localStorage.getItem("userRole")?.toLowerCase() || "customer";
    setCurrentRole(role);
    
    // Opsional: Jika kamu menyimpan data kue di localStorage keranjang, ambil di sini:
    // const savedCart = localStorage.getItem("cart");
    // if (savedCart) setCartItems(JSON.parse(savedCart));
  }, []);

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
    if (!token) {
      toast.error("Sesi Anda habis. Silakan login ulang!");
      router.push("/login");
      setLoading(false);
      return;
    }

    // Standardisasi nilai Enum metode pembayaran untuk backend
    let cleanPaymentMethod = "BANK_TRANSFER"; 
    if (paymentMethod.includes("E-WALLET")) {
      cleanPaymentMethod = "E_WALLET";
    } else if (paymentMethod.includes("CASH ON DELIVERY")) {
      cleanPaymentMethod = "COD";
    }

    try {
      const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
      
      // 🎯 PAYLOAD BERSIH: Tanpa customerName, Ditambah array items murni
      const payload = {
        phoneNumber: phoneNumber,
        deliveryDate: `${deliveryDate}T${deliveryTime}:00.000Z`, // Format ISO String
        paymentMethod: cleanPaymentMethod,
        deliveryAddress: deliveryAddress,
        items: cartItems.map(item => ({
          productId: Number(item.productId), // Pastikan bertipe data integer angka
          quantity: Number(item.quantity)
        }))
      };

      const response = await fetch(`${BASE_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Pesanan kue Anda berhasil dibuat!");
        // Bersihkan keranjang jika ada
        // localStorage.removeItem("cart");
        router.push(`/${currentRole}/dashboard`); 
      } else {
        const errorMessage = Array.isArray(result.message) ? result.message[0] : result.message;
        toast.error(errorMessage || "Gagal memproses pesanan.");
      }
    } catch (error) {
      console.error("Error order:", error);
      toast.error("Terjadi gangguan jaringan pada sistem checkout.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 bg-slate-50 min-h-screen text-slate-800 flex justify-center items-center">
      <div className="max-w-md w-full bg-white p-6 rounded-3xl border border-slate-200 shadow-xl">
        
        {/* Header Formulir */}
        <div className="mb-6 text-center">
          <h1 className="text-xl font-bold text-slate-900">Formulir Pesanan Kue</h1>
          <p className="text-xs text-slate-500 mt-1">Lengkapi detail pengiriman pesanan Anda</p>
        </div>

        {/* Form Utama */}
        <form onSubmit={handleCheckout} className="space-y-4">
          
          {/* Kolom Nomor Telepon */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Nomor Telepon / WA</label>
            <input
              type="tel"
              required
              placeholder="Contoh: 0812345466"
              autoComplete="new-password"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition shadow-sm"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>

          {/* Grid Tanggal & Waktu Pengantaran */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Tanggal Kirim</label>
              <input
                type="date"
                required
                autoComplete="off"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition shadow-sm cursor-pointer"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Jam Kirim</label>
              <input
                type="time"
                required
                autoComplete="off"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition shadow-sm cursor-pointer"
                value={deliveryTime}
                onChange={(e) => setDeliveryTime(e.target.value)}
              />
            </div>
          </div>

          {/* Metode Pembayaran */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Metode Pembayaran</label>
            <select
              required
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition shadow-sm cursor-pointer"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="BANK TRANSFER">BANK TRANSFER</option>
              <option value="E-WALLET">E-WALLET (OVO / DANA)</option>
              <option value="CASH ON DELIVERY">CASH ON DELIVERY (COD)</option>
            </select>
          </div>

          {/* Alamat Lengkap */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Alamat Lengkap Pengiriman</label>
            <textarea
              required
              rows={3}
              placeholder="Tulis alamat rumah lengkap..."
              autoComplete="new-password"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition shadow-sm resize-none"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
            />
          </div>

          {/* Tombol Aksi Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition disabled:bg-blue-300 disabled:cursor-not-allowed text-sm shadow-md mt-2"
          >
            🚀 {loading ? "Sedang Memproses Orderan..." : "Checkout & Bayar Sekarang"}
          </button>
        </form>

      </div>
    </div>
  );
}