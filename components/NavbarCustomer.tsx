"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function NavbarCustomer() {
  const pathname = usePathname();
  const router = useRouter();
  
  // State untuk mengontrol buka/tutup hamburger menu di HP
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    router.replace("/login");
  };

  const navItems = [
    { name: "Etalase Kue", slug: "/customer/dashboard" },
    { name: "Pesanan Saya", slug: "/customer/orders" },
  
  ];

  return (
    <>
      {/* NAVBAR UTAMA */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-100 shadow-sm px-4 sm:px-6 lg:px-8 flex items-center justify-between z-50">
        
        {/* SISI KIRI: Logo Brand */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-black text-blue-600 tracking-tight">DailyBake</span>
          <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-md uppercase tracking-wider hidden sm:inline-block">
            Customer
          </span>
        </div>

        {/* SISI TENGAH: Menu Navigasi Horizontal (Sembunyi di HP, Muncul di Desktop/md) */}
        <nav className="hidden md:flex items-center gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.slug || pathname.startsWith(item.slug + "/");
            return (
              <Link
                key={item.slug}
                href={item.slug}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                  isActive
                    ? "bg-blue-50 text-blue-600 shadow-sm"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* SISI KANAN: Tombol Keluar (Sembunyi di HP, Muncul di Desktop/md) */}
        <div className="hidden md:block">
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-rose-50 border border-rose-100 hover:bg-rose-600 text-rose-600 hover:text-white rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer"
          >
            Keluar
          </button>
        </div>

        {/* TOMBOL HAMBURGER (Hanya muncul di HP/Layar Kecil) */}
        <div className="flex md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
            aria-label="Toggle Menu"
          >
            {isOpen ? (
              // Icon Tanda Silang (X) saat menu terbuka
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            ) : (
              // Icon Garis Tiga (Hamburger) saat menu tertutup
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* DROPDOWN MENU SELULAR (Hanya tampil di HP jika state isOpen = true) */}
      {isOpen && (
        <div className="fixed top-16 left-0 right-0 bg-white border-b border-slate-100 shadow-md p-4 space-y-3 z-40 md:hidden animate-in fade-in slide-in-from-top-5 duration-200">
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.slug || pathname.startsWith(item.slug + "/");
              return (
                <Link
                  key={item.slug}
                  href={item.slug}
                  onClick={() => setIsOpen(false)} // Otomatis tutup menu setelah link diklik
                  className={`w-full px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>
          
          <hr className="border-slate-100" />
          
          {/* Tombol Logout Versi Mobile */}
          <button
            onClick={handleLogout}
            className="w-full py-3 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl text-sm font-bold hover:bg-rose-600 hover:text-white transition-all text-center block cursor-pointer"
          >
            Keluar Aplikasi
          </button>
        </div>
      )}
    </>
  );
}