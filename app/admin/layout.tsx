"use client";

import Sidebar from "@/components/Sidebar";
import { useState, useEffect } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false); // 🎯 State kendali ukuran lebar sidebar
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleResize = () => {
      if (typeof window !== "undefined") {
        if (window.innerWidth >= 1024) {
          setSidebarOpen(true);
        } else {
          setSidebarOpen(false);
        }
      }
    };

    handleResize(); 
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!mounted) {
    return <div className="min-h-screen bg-slate-50" />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 relative overflow-hidden">
      
      {/* BACKGROUND REDUP (Khusus HP) */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/20 z-40 lg:hidden transition-opacity duration-300"
        />
      )}
      
      {/* 🎯 KONTAINER SIDEBAR: Menggunakan 'fixed h-screen' agar posisinya terkunci / tidak ikut ter-scroll */}
      <div className={`
        fixed inset-y-0 left-0 z-50 bg-white border-r border-slate-100 transition-all duration-300 ease-in-out h-screen shrink-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        ${isCollapsed ? "w-16" : "w-56"}
      `}>
        <Sidebar 
          isOpenMobile={sidebarOpen} 
          setIsOpenMobile={setSidebarOpen}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />
      </div>
      
      {/* 🎯 AREA UTAMA: Otomatis bergeser ke kiri (padding-left/pl) mengikuti ukuran lebar sidebar secara elastis */}
      <div className={`
        flex-1 flex flex-col min-w-0 min-h-screen transition-all duration-300 ease-in-out
        ${sidebarOpen ? (isCollapsed ? "lg:pl-16" : "lg:pl-56") : "pl-0"}
      `}>
        
        {/* 🛠️ FIX 1: HEADER TOPBAR diubah menjadi fixed di mobile agar hamburger mengunci di atas, dan left-0 right-0 agar lebar penuh */}
        <header className={`
          fixed lg:sticky top-0 left-0 right-0 z-30 h-16 bg-white border-b border-slate-100 flex items-center px-4 lg:px-8 shrink-0 justify-between transition-all duration-300 ease-in-out
          ${sidebarOpen ? (isCollapsed ? "lg:left-16" : "lg:left-56") : "left-0"}
        `}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 transition lg:hidden flex items-center justify-center cursor-pointer"
            title="Buka Menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          
          <span className="font-bold text-slate-700 text-xs tracking-wide uppercase hidden lg:inline">
            DailyBake Management System
          </span>
          
          <div className="text-xs font-semibold text-emerald-500 bg-emerald-50 px-2.5 py-1 rounded-md">
            ● System Online
          </div>
        </header>

        {/* 🛠️ FIX 2: TEMPAT RENDERING KONTEN HALAMAN */}
        {/* Ditambahkan 'pt-20 lg:pt-8' agar konten di HP tidak amblas tertutup oleh header yang kita buat fixed melayang */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}