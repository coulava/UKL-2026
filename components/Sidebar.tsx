"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface MenuItem {
  title: string;
  subtitle: string;
  slug: string;
}

interface SidebarProps {
  isOpenMobile?: boolean;
  setIsOpenMobile?: (open: boolean) => void;
  isCollapsed?: boolean;
  setIsCollapsed?: (collapsed: boolean) => void;
}

export default function Sidebar({ isOpenMobile, setIsOpenMobile, isCollapsed = false, setIsCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<string>("customer");

  useEffect(() => {
    const savedRole = localStorage.getItem("userRole")?.toLowerCase() || "customer";
    setRole(savedRole);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  const menuConfig: Record<string, MenuItem[]> = {
    admin: [
      { title: "Dashboard", subtitle: "Ringkasan toko", slug: "/admin/dashboard" },
      { title: "Users", subtitle: "Staf & pelanggan", slug: "/admin/users" },
      { title: "Categories", subtitle: "Kategori kue", slug: "/admin/categories" },
      { title: "Reports", subtitle: "Laporan toko", slug: "/admin/reports" },
      { title: "Products", subtitle: "Kelola kue", slug: "/admin/product" },
      { title: "Orders", subtitle: "Semua pesanan", slug: "/admin/orders" },
    ],
    baker: [
      { title: "Dashboard", subtitle: "Ringkasan baker", slug: "/baker/dashboard" },
      { title: "Products", subtitle: "Kelola kue", slug: "/baker/product" },
      { title: "Orders", subtitle: "Semua pesanan", slug: "/baker/orders" },
      { title: "Reports", subtitle: "Laporan baker", slug: "/baker/reports" },
    ],
    customer: [
      { title: "Etalase", subtitle: "Lihat semua kue", slug: "/customer/dashboard" },
      { title: "Pesanan", subtitle: "Riwayat pesanan", slug: "/customer/orders" },
    ],
  };

  const menuAktif = menuConfig[role] || menuConfig["customer"];

  return (
    // 🛠️ FIX UTAMA: Menambahkan 'fixed' untuk mobile & 'lg:relative' untuk desktop, serta 'z-50 top-0 left-0' agar mengunci di atas layar
    <aside className="fixed lg:relative inset-y-0 left-0 z-50 flex flex-col justify-between h-screen bg-white border-r border-slate-100 shrink-0 w-full">
      
      {/* Tombol ciut/lebar desktop */}
      <button
        onClick={() => setIsCollapsed?.(!isCollapsed)}
        className="absolute -right-3 top-7 z-50 w-6 h-6 rounded-full bg-white border border-slate-200 shadow-sm hidden lg:flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
        aria-label={isCollapsed ? "Expand" : "Collapse"}
      >
        <span className="text-[10px] font-bold leading-none">
          {isCollapsed ? "›" : "‹"}
        </span>
      </button>

      {/* 🛠️ Tombol X di HP: Ditambahkan z-50 agar selalu berada di paling depan */}
      {setIsOpenMobile && (
        <button
          onClick={() => setIsOpenMobile(false)}
          className="absolute right-3 top-4 lg:hidden w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-600 font-bold text-xs z-50"
        >
          ✕
        </button>
      )}

      {/* Konten Atas Wrapper */}
      <div className="flex flex-col h-full overflow-hidden">
        {/* Header Brand */}
        <div className={`border-b border-slate-100 transition-all duration-300 ${isCollapsed ? "px-3 py-4" : "px-5 py-5"}`}>
          {isCollapsed ? (
            <div className="w-8 h-8 rounded-lg bg-sky-400 flex items-center justify-center mx-auto">
              <span className="text-white text-xs font-black">D</span>
            </div>
          ) : (
            <div>
              <h1 className="text-sm font-black text-slate-800 tracking-tight">DailyBake</h1>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mt-0.5 block">
                {role} panel
              </span>
            </div>
          )}
        </div>

        {/* 🛠️ Menu Items: Ditambahkan 'overflow-y-auto' dan 'flex-1' agar area ini saja yang bisa di-scroll jika menu terlalu panjang */}
        <nav className={`flex-1 overflow-y-auto flex flex-col gap-0.5 py-3 transition-all duration-300 ${isCollapsed ? "px-2" : "px-3"}`}>
          {!isCollapsed && (
            <span className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-300">
              Navigasi
            </span>
          )}

          {menuAktif.map((item) => {
            const isActive = pathname === item.slug || pathname.startsWith(item.slug + "/");

            return (
              <Link
                key={item.slug}
                href={item.slug}
                title={isCollapsed ? item.title : undefined}
                onClick={() => {
                  if (window.innerWidth < 1024) setIsOpenMobile?.(false);
                }}
                className={`
                  group relative flex flex-col rounded-lg transition-all duration-150 
                  ${isCollapsed ? "items-center py-3 px-1" : "px-3 py-2.5"} 
                  ${isActive ? "bg-sky-50 text-sky-700" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"}
                `}
              >
                {isActive && !isCollapsed && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-sky-400 rounded-r-full" />
                )}

                {isCollapsed ? (
                  <>
                    <span className={`text-xs font-bold ${isActive ? "text-sky-600" : "text-slate-400 group-hover:text-slate-600"}`}>
                      {item.title.slice(0, 2).toUpperCase()}
                    </span>
                    <span className="pointer-events-none absolute left-full ml-3 px-2.5 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 shadow-lg z-50">
                      {item.title}
                    </span>
                  </>
                ) : (
                  <>
                    <span className={`text-sm font-semibold leading-tight ${isActive ? "text-sky-700" : ""}`}>
                      {item.title}
                    </span>
                    <span className={`text-[11px] mt-0.5 ${isActive ? "text-sky-500" : "text-slate-400"}`}>
                      {item.subtitle}
                    </span>
                  </>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Logout Button */}
      <div className={`border-t border-slate-100 py-3 bg-white transition-all duration-300 ${isCollapsed ? "px-2" : "px-3"}`}>
        <button
          onClick={handleLogout}
          title={isCollapsed ? "Keluar" : undefined}
          className={`
            group relative w-full flex rounded-lg text-sm font-medium text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all duration-150 
            ${isCollapsed ? "justify-center py-3 px-1" : "px-3 py-2.5 items-center gap-3"}
          `}
        >
          {isCollapsed ? (
            <>
              <span className="text-xs font-bold">KL</span>
              <span className="pointer-events-none absolute left-full ml-3 px-2.5 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 shadow-lg z-50">
                Keluar Aplikasi
              </span>
            </>
          ) : (
            <>
              <div className="w-6 h-6 rounded-md bg-slate-100 group-hover:bg-red-100 flex items-center justify-center transition-colors">
                <span className="text-[10px] font-black text-slate-400 group-hover:text-red-400">→</span>
              </div>
              <span>Logout</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}