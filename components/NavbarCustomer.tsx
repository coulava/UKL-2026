"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function NavbarCustomer() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.clear();
    router.replace("/login");
  };

  // Navigasi menu dinamis untuk customer sesuai dengan isi list Sidebar kemarin
  const navItems = [
    { name: "Etalase Kue", slug: "/customer/dashboard" },
    { name: "Pesanan Saya", slug: "/customer/orders" },
    { name: "Ulasan Kue", slug: "/customer/reviews" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-100 shadow-sm px-4 sm:px-6 lg:px-8 flex items-center justify-between z-50">
      {/* SISI KIRI: Logo Brand */}
      <div className="flex items-center gap-2">
        <span className="text-lg font-black text-blue-600 tracking-tight">DailyBake</span>
        <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-md uppercase tracking-wider hidden sm:inline-block">
          Customer
        </span>
      </div>

      {/* SISI TENGAH: Menu Navigasi Horizontal */}
      <nav className="flex items-center gap-1 sm:gap-2">
        {navItems.map((item) => {
          const isActive = pathname === item.slug || pathname.startsWith(item.slug + "/");
          return (
            <Link
              key={item.slug}
              href={item.slug}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
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

      {/* SISI KANAN: Tombol Aksi Keluar */}
      <div>
        <button
          onClick={handleLogout}
          className="px-3 py-2 bg-rose-50 border border-rose-100 hover:bg-rose-600 text-rose-600 hover:text-white rounded-xl text-xs font-bold transition-all duration-200"
        >
          Keluar
        </button>
      </div>
    </header>
  );
}