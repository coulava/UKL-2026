"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState<string>(""); 
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false); 
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    let loginResponse: Response | null = null;

    try {
      // 1. Bersihkan input email dari spasi tak sengaja dan ubah ke huruf kecil
      const cleanEmail = email.trim().toLowerCase();

      const requestBody = {
        email: cleanEmail,
        password: password,
      };

     
       const url = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/login`; 

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      loginResponse = response;
      const responseData = await response.json();

      // 2. Jika status HTTP bernilai error (gagal login)
      if (!response.ok) {
        toast.error(responseData.message || "Email atau password salah.", {
          className: "bg-rose-50 text-rose-600",
        });
        return;
      }

      // 3. Jika sukses, amankan token JWT ke LocalStorage browser
      const accessToken = responseData?.accessToken;
      const refreshToken = responseData?.refreshToken;

      if (accessToken) localStorage.setItem("accessToken", accessToken);
      if (refreshToken) localStorage.setItem("refreshToken", refreshToken);

      // ===================================================================
      // 4. DETEKSI ROLE (Disinkronkan dengan huruf kecil untuk Sidebar)
      // ===================================================================
      let currentRole = 
        responseData?.user?.role || 
        responseData?.data?.role || 
        responseData?.role || 
        "customer";

      currentRole = currentRole.toLowerCase(); // Dipaksa jadi lowercase

      // LAPIS PENGAMAN KEDUA: Kunci akurat berdasarkan email resmi @dailybake.com
      // if (cleanEmail === "admin@dailybake.com") {
      //   currentRole = "admin";
      // } else if (cleanEmail === "baker@dailybake.com") {
      //   currentRole = "baker";
      // }

      // Simpan dua format key ke localstorage biar aman untuk semua komponen
      localStorage.setItem("role", currentRole); // Untuk komponen Sidebar baru
      localStorage.setItem("userRole", currentRole.toUpperCase()); // Untuk jaga-jaga komponen lama

      toast.success("Login Berhasil!", {
        description: `Selamat datang kembali! Masuk sebagai: ${currentRole.toUpperCase()}`,
        className: "bg-green-100 text-green-700",
      });

      // 5. Alihkan rute halaman ke folder dashboard masing-masing secara otomatis
      setTimeout(() => {
        if (currentRole === "admin") {
          router.replace("/admin/dashboard");
        } else if (currentRole === "baker") {
          router.replace("/baker/dashboard");
        } else {
          router.replace("/customer/dashboard");
        }
      }, 1500);

    } catch (error) {
      console.error("Error login:", error);
      toast.error("Tidak dapat terhubung ke server backend.", {
        className: "bg-rose-50 text-rose-600",
      });
    } finally {
      if (!loginResponse || !loginResponse.ok) {
        setLoading(false);
      }
    }
  }

  return (
    <div className="w-full h-dvh flex bg-blue-300 justify-center items-center">
      <div className="bg-slate-100 text-gray-700 rounded-2xl w-full md:w-1/2 lg:w-1/3 p-5 shadow-lg">
        <h1 className="font-bold text-2xl text-center p-2 text-slate-900">Login</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-gray-600">Email Address</label>
            <input
              type="email"
              placeholder="nama@gmail.com"
              className="w-full p-4 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-slate-900"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium mb-1 text-gray-600">Password</label>
            <div className="relative w-full">
              <input
                type={showPassword ? "text" : "password"} 
                placeholder="Masukkan Password"
                className="w-full p-4 pr-12 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-slate-900"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full p-4 border rounded-full text-center text-white font-bold bg-blue-500 cursor-pointer hover:bg-blue-600 transition disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {loading ? "Mohon Tunggu..." : "Login"}
          </button>
          
          <div className="flex justify-center items-center mt-4">
            <Link href="/register" className="text-blue-500 underline text-sm hover:text-blue-600">
              Belum punya akun? Registrasi Sekarang
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}