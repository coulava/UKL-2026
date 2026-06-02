import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "sonner" 

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased text-slate-800 bg-slate-50`}>
        
        {/* Children murni tanpa gangguan wrapper global */}
        {children} 
        
        {/* Toaster notifikasi sukses/gagal */}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  )
}