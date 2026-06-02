"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface ProductList {
  id: number;
  name: string;
  price: number;
  image?: string;
}

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [products, setProducts] = useState<ProductList[]>([]);
  const [loading, setLoading] = useState(true);

  // Mengubah default state paymentMethod ke nilai Enum backend yang sah: "CASH"
  const [checkoutForm, setCheckoutForm] = useState({
    recipientName: "",
    recipientPhone: "",
    recipientAddress: "",
    pickupDate: "",
    pickupTime: "",
    paymentMethod: "CASH", 
    notes: ""
  });

  // 1. Mengambil kamus produk lengkap dari server untuk sinkronisasi nama kue
  const fetchAllProducts = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/products`, { method: "GET" });
      if (res.ok) {
        const responseData = await res.json();
        const list = responseData.data || responseData || [];
        setProducts(list);
      }
    } catch (err) {
      console.error("Gagal memuat referensi daftar produk:", err);
    }
  };

  // 2. Mengambil data keranjang belanja (Cart)
  const fetchCartData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/cart`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        const items = Array.isArray(data) ? data : (data?.items || data?.data || []);
        setCartItems(items);
      }
    } catch (err) {
      console.error("Gagal sinkronisasi data keranjang:", err);
      toast.error("Gagal memuat keranjang terbaru");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function initPage() {
      await fetchAllProducts();
      await fetchCartData();
    }
    initPage();
  }, []);

  // 3. Mengatur Tambah / Kurang kuantitas item (+/-)
  const handleUpdateQuantity = async (productId: number, currentQty: number, delta: number) => {
    const targetQty = currentQty + delta;
    if (targetQty <= 0) {
      handleRemoveItem(productId);
      return;
    }

    try {
      const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ productId: Number(productId), quantity: delta })
      });
      if (res.ok) fetchCartData();
    } catch (err) {
      console.error(err);
    }
  };

  // 4. Menghapus Item Kue dari Keranjang
  const handleRemoveItem = async (productId: number) => {
    try {
      const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/cart/product/${productId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success("Kue dihapus dari keranjang");
        fetchCartData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 5. Mengosongkan Seluruh Keranjang Belanja
  const handleClearCart = async () => {
    try {
      const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/cart/clear`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success("Keranjang belanja dikosongkan");
        setCartItems([]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Helper Pencocokan Informasi Nama & Harga Kue Otomatis dari Frontend
  const getProductDetails = (productId: number) => {
    const matched = products.find((p) => Number(p.id) === Number(productId));
    return {
      name: matched ? matched.name : `Kue Varian #${productId}`,
      price: matched ? matched.price : 0,
      image: matched?.image || "https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=150&auto=format&fit=crop"
    };
  };

  const totalPrice = cartItems.reduce((sum, item) => {
    const detail = getProductDetails(item.productId);
    return sum + detail.price * item.quantity;
  }, 0);

  // 6. Fungsi Kirim Pesanan Checkout (PERBAIKAN UTAMA URL ENDPOINT & PAYLOAD)
  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return toast.error("Keranjang belanja kosong!");

    // Menghapus properti 'items' dan membentuk format murni sesuai skema Swagger Anda
    const payload = {
      pickupDate: checkoutForm.pickupDate,         // Format teks "YYYY-MM-DD"
      pickupTime: checkoutForm.pickupTime,         // Format teks "HH:mm"
      paymentMethod: checkoutForm.paymentMethod,   // Bernilai pasti: "CASH" / "BANK_TRANSFER" / "E_WALLET"
      recipientName: checkoutForm.recipientName,
      recipientPhone: checkoutForm.recipientPhone,
      recipientAddress: checkoutForm.recipientAddress,
      notes: checkoutForm.notes || "Tanpa Catatan"
    };

    try {
      const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
      
      // PERBAIKAN: Alamat ditujukan langsung ke /orders/checkout (Bukan ke /orders lagi)
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/orders/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success("🚀 Pesanan berhasil dikirim ke antrean dapur!");
        router.push("/customer/orders");
      } else {
        const errorRes = await res.json();
        toast.error(errorRes.message || "Gagal memproses pesanan.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Terjadi masalah koneksi jaringan ke server.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-black p-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 pt-6">
        
        {/* PANEL SISI KIRI: ETALASE DAFTAR BARANG BELANJA */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-lg font-bold">Keranjang Belanja</h1>
            {cartItems.length > 0 && (
              <button onClick={handleClearCart} className="text-xs text-red-500 hover:underline cursor-pointer">
                Kosongkan Keranjang
              </button>
            )}
          </div>

          {loading ? (
            <div className="text-xs text-gray-400">Menyelaraskan data etalase dapur...</div>
          ) : cartItems.length === 0 ? (
            <div className="text-center py-12 text-gray-500 text-xs">Keranjang Anda masih kosong.</div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => {
                const detailKue = getProductDetails(item.productId);
                return (
                  <div key={item.productId} className="flex items-center justify-between border-b border-gray-100 pb-4 text-xs">
                    <div className="flex items-center gap-3">
                      <img src={detailKue.image} alt={detailKue.name} className="w-12 h-12 object-cover rounded-xl bg-slate-100 shadow-sm" />
                      <div>
                        <h4 className="font-bold text-slate-800">{detailKue.name}</h4>
                        <p className="text-gray-400 text-[10px]">Rp {detailKue.price.toLocaleString("id-ID")}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button onClick={() => handleUpdateQuantity(item.productId, item.quantity, -1)} className="w-6 h-6 bg-slate-100 rounded-full font-bold hover:bg-slate-200 cursor-pointer">-</button>
                      <span className="font-bold text-center w-4">{item.quantity}</span>
                      <button onClick={() => handleUpdateQuantity(item.productId, item.quantity, 1)} className="w-6 h-6 bg-slate-100 rounded-full font-bold hover:bg-slate-200 cursor-pointer">+</button>
                      <button onClick={() => handleRemoveItem(item.productId)} className="text-gray-400 hover:text-red-500 ml-2 cursor-pointer">🗑️</button>
                    </div>
                  </div>
                );
              })}
              <div className="pt-4 flex justify-between font-black text-sm border-t border-gray-100">
                <span>Total Belanja:</span>
                <span className="text-blue-600">Rp {totalPrice.toLocaleString("id-ID")}</span>
              </div>
            </div>
          )}
        </div>

        {/* PANEL SISI KANAN: FORMULIR INFORMASI PENGAMBILAN */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm h-fit text-xs">
          <h2 className="text-sm font-bold mb-4 border-b border-gray-100 pb-2">Informasi Pengambilan</h2>
          <form onSubmit={handleCheckout} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 mb-1">Nama Penerima</label>
              <input type="text" required value={checkoutForm.recipientName} onChange={(e) => setCheckoutForm({...checkoutForm, recipientName: e.target.value})} className="w-full border border-gray-200 rounded-xl p-2 outline-none focus:border-blue-500" placeholder="Contoh: Budi" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 mb-1">Nomor Telepon WhatsApp</label>
              <input type="text" required value={checkoutForm.recipientPhone} onChange={(e) => setCheckoutForm({...checkoutForm, recipientPhone: e.target.value})} className="w-full border border-gray-200 rounded-xl p-2 outline-none focus:border-blue-500" placeholder="Contoh: 08123666777" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 mb-1">Alamat Lengkap</label>
              <textarea required value={checkoutForm.recipientAddress} onChange={(e) => setCheckoutForm({...checkoutForm, recipientAddress: e.target.value})} className="w-full border border-gray-200 rounded-xl p-2 h-16 outline-none focus:border-blue-500" placeholder="Contoh: Jl. Sawojajar No. 12, Malang" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-1">Tanggal Ambil</label>
                <input type="date" required value={checkoutForm.pickupDate} onChange={(e) => setCheckoutForm({...checkoutForm, pickupDate: e.target.value})} className="w-full border border-gray-200 rounded-xl p-2 outline-none" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-1">Jam Ambil</label>
                <input type="time" required value={checkoutForm.pickupTime} onChange={(e) => setCheckoutForm({...checkoutForm, pickupTime: e.target.value})} className="w-full border border-gray-200 rounded-xl p-2 outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 mb-1">Metode Pembayaran</label>
              {/* PERBAIKAN: Menyesuaikan option value dengan string ENUM DATABASE BACKEND */}
              <select value={checkoutForm.paymentMethod} onChange={(e) => setCheckoutForm({...checkoutForm, paymentMethod: e.target.value})} className="w-full border border-gray-200 rounded-xl p-2 bg-white outline-none">
                <option value="CASH">Bayar Tunai / Ambil di Toko (CASH)</option>
                <option value="BANK_TRANSFER">Transfer Bank (BANK_TRANSFER)</option>
                <option value="E_WALLET">Dompet Digital / Scan QRIS (E_WALLET)</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 mb-1">Catatan Khusus (Opsional)</label>
              <input type="text" value={checkoutForm.notes} onChange={(e) => setCheckoutForm({...checkoutForm, notes: e.target.value})} className="w-full border border-gray-200 rounded-xl p-2 outline-none" placeholder="Contoh: Kurangi manis / bungkus terpisah" />
            </div>

            <button type="submit" disabled={cartItems.length === 0} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl transition-all disabled:bg-gray-200 disabled:text-gray-400 mt-4 text-center cursor-pointer">
              🚀 KIRIM PESANAN SEKARANG
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}