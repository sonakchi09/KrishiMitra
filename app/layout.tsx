import type { Metadata } from 'next'
import './globals.css'
import Header from '../components/Header'
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "KrishiMitra – Farmer's AI Companion",
  description: 'Livestock health, crop disease diagnosis for Odisha farmers',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body>
        <Header />
        <main>{children}</main>
      </body>
    </html>
  )
}
