import NavbarCustomer from "@/components/NavbarCustomer";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Masukkan Navbar Customer di sini */}
      <NavbarCustomer />

      {/* Konten utama halaman customer diberi jarak atas pt-16 agar tidak tertutup navbar */}
      <div className="flex-1 pt-16">
        {children}
      </div>
    </div>
  );
}