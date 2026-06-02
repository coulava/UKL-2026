"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function RegisterPage() {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>(""); 
  const [phone, setPhone] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    let response: Response | null = null;

    try {
      const request = {
        name,
        email,
        phone,
        password,
      };

      const url = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/register`;

      response = await fetch(url, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(request),
      });

      const responseData = await response.json();

      if (!response.ok) {
        toast.error(responseData.message || "Gagal melakukan registrasi", {
          className: "bg-rose-50 text-rose-600",
        });
        return;
      }

      toast.success("Register Berhasil!", {
        description: "Akun Gmail Anda berhasil terdaftar. Mengalihkan...",
        className: "bg-green-100 text-green-700",
      });

      setTimeout(() => {
        router.replace("/login");
      }, 1500);

    } catch (error) {
      console.error("Error during registration:", error);
      toast.error("Tidak dapat terhubung ke server backend.", {
        className: "bg-rose-50 text-rose-600",
      });
    } finally {
      if (!response || !response.ok) {
        setLoading(false);
      }
    }
  }

  return (
    <div className="w-full min-h-screen flex bg-blue-200 justify-center items-center px-4 py-8 antialiased">
      <div className="bg-slate-100 text-gray-700 rounded-3xl w-full sm:w-10/12 md:w-8/12 lg:w-5/12 xl:w-4/12 p-6 sm:p-8 shadow-xl transition-all duration-300">
        <h1 className="font-black text-2xl text-center text-slate-900 tracking-tight mb-6">Create Account</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold mb-1.5 text-gray-600 uppercase tracking-wide">Full Name</label>
            <input
              type="text"
              placeholder="Masukkan nama lengkap"
              className="w-full p-4 text-xs border border-slate-200 bg-white text-slate-900 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1.5 text-gray-600 uppercase tracking-wide">Email Address (Gmail)</label>
            <input
              type="email"
              placeholder="contoh@gmail.com"
              className="w-full p-4 text-xs border border-slate-200 bg-white text-slate-900 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1.5 text-gray-600 uppercase tracking-wide">Phone Number</label>
            <input
              type="text"
              placeholder="Contoh: 08123456789"
              className="w-full p-4 text-xs border border-slate-200 bg-white text-slate-900 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1.5 text-gray-600 uppercase tracking-wide">Password</label>
            <input
              type="password"
              placeholder="Masukkan password baru"
              className="w-full p-4 text-xs border border-slate-200 bg-white text-slate-900 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full p-4 mt-2 border-none rounded-full text-center text-white text-xs font-bold bg-blue-500 hover:bg-blue-600 transition-all duration-200 shadow-md cursor-pointer disabled:bg-blue-300 disabled:cursor-not-allowed active:scale-[0.99]"
          >
            {loading ? "Registering..." : "Register Account"}
          </button>
          
          <div className="flex justify-center items-center gap-1 mt-6 text-xs font-medium text-slate-500">
            <span>Have an account?</span>
            <Link href="/login" className="text-blue-600 font-bold hover:underline transition-all">
              Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}