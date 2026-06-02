"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function RegisterPage() {
  const [name, setName] = useState<string>((""));
  const [email, setEmail] = useState<string>(""); // Menggunakan email/gmail baku
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
    <div className="w-full h-dvh flex bg-blue-300 justify-center items-center">
      <div className="bg-slate-100 text-gray-700 rounded-2xl w-full md:w-1/2 lg:w-1/3 p-5">
        <h1 className="font-bold text-2xl text-center p-2">Register</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Full Name"
            className="w-full p-5 border rounded-full mb-4 focus:outline-blue-400"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={loading}
          />
          <input
            type="email"
            placeholder="Email Address (Gmail)"
            className="w-full p-5 border rounded-full mb-4 focus:outline-blue-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
          <input
            type="text"
            placeholder="Phone Number"
            className="w-full p-5 border rounded-full mb-4 focus:outline-blue-400"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            disabled={loading}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-5 border rounded-full mb-4 focus:outline-blue-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full p-5 border rounded-full text-center text-white font-bold bg-blue-500 cursor-pointer hover:bg-blue-600 disabled:bg-blue-300"
          >
            {loading ? "Registering..." : "Register"}
          </button>
          
          <div className="flex justify-center items-center mt-4">
            <Link href="/login" className="text-blue-500 underline text-sm hover:text-blue-600">
              Have an account? Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}