"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

interface UserDetail {
  id: number | string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  createdAt?: string;
}

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params?.id; // Mengambil ID dari URL rute

  // State untuk menampung setiap properti dari objek user
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("CUSTOMER");
  const [createdAt, setCreatedAt] = useState("");
  
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  // 1. FETCH DETAIL DATA LENGKAP USER BERDASARKAN ID
  useEffect(() => {
    if (!userId) return;

    const fetchUserDetail = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("accessToken") || localStorage.getItem("token");

        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/users/${userId}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        const responseData = await res.json();

        if (res.ok) {
          // Mengantisipasi jika data dibungkus objek .data atau berbentuk objek langsung
          const userData: UserDetail = responseData.data || responseData;
          
          // Memasukkan seluruh data lengkap ke dalam masing-masing state form
          setName(userData.name || "-");
          setEmail(userData.email || "-");
          setPhone(userData.phone || "Tidak ada nomor telepon");
          setRole(userData.role?.toUpperCase() || "CUSTOMER");
          
          // Memformat ISO String 'createdAt' menjadi tampilan tanggal yang rapi
          if (userData.createdAt) {
            const dateObj = new Date(userData.createdAt);
            setCreatedAt(
              dateObj.toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }) + " WIB"
            );
          } else {
            setCreatedAt("-");
          }
        } else {
          toast.error(responseData.message || "Gagal mengambil data detail pengguna.");
          router.push("/admin/users");
        }
      } catch (error) {
        console.error("Error fetching user detail:", error);
        toast.error("Terjadi galat jaringan saat memuat data.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetail();
  }, [userId, router]);

  // 2. FUNGSI UPDATE MENGGUNAKAN METHOD PATCH
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitLoading(true);
      const token = localStorage.getItem("accessToken") || localStorage.getItem("token");

      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/users/${userId}`, {
        method: "PATCH", // Menggunakan PATCH sesuai konfigurasi backend kamu
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          role: role // Payload role baru yang akan di-update
        })
      });

      const responseData = await res.json().catch(() => ({}));

      if (res.ok) {
        toast.success(`Berhasil memperbarui peran hak akses ${name}!`);
        router.push("/admin/users");
        router.refresh();
      } else {
        toast.error(responseData.message || "Gagal menyimpan perubahan.");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Terjadi gangguan sistem saat mengedit data.");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto my-12 bg-white p-8 rounded-2xl border border-slate-100 text-center text-slate-400 font-medium animate-pulse shadow-sm">
        Sedang mengambil profil lengkap akun dari server...
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto my-6 space-y-6">
      {/* Link Kembali */}
      <Link 
        href="/admin/users" 
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors"
      >
        ← Kembali ke Manajemen Pengguna
      </Link>

      {/* Box Form Card */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-6">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Ubah Hak Akses</h1>
          <p className="text-xs text-slate-400 mt-0.5">Formulir pembaruan status peran operasional akun.</p>
        </div>

        <form onSubmit={handleUpdate} className="space-y-4">
          
          {/* Kolom 1: Nama & Email (Grid 2 Kolom) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nama Pengguna</label>
              <input
                type="text"
                value={name}
                disabled
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-500 font-medium cursor-not-allowed"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Terdaftar</label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-500 font-medium cursor-not-allowed"
              />
            </div>
          </div>

          {/* Kolom 2: Nomor Telepon & Tanggal Dibuat (Grid 2 Kolom) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nomor Telepon (Phone)</label>
              <input
                type="text"
                value={phone}
                disabled
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-500 font-medium cursor-not-allowed"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tanggal Registrasi</label>
              <input
                type="text"
                value={createdAt}
                disabled
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-500 font-medium cursor-not-allowed"
              />
            </div>
          </div>

          <hr className="border-slate-100 my-2" />

          {/* Dropdown Pilihan Role (Bisa Diedit) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Hak Akses Sistem (Role)</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-3 border border-slate-200 rounded-xl text-sm bg-white text-slate-800 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all font-semibold cursor-pointer shadow-sm"
            >
              <option value="CUSTOMER">CUSTOMER</option>
              <option value="BAKER">BAKER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>

          {/* Tombol Simpan / Batal */}
          <div className="flex gap-3 pt-4">
            <Link
              href="/admin/users"
              className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl text-center text-xs hover:bg-slate-200 transition-all"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={submitLoading}
              className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl text-xs hover:bg-blue-700 transition-all disabled:bg-blue-300 disabled:cursor-not-allowed shadow-sm shadow-blue-100 cursor-pointer"
            >
              {submitLoading ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}