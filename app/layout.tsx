import type React from "react"
import type { Metadata, Viewport } from "next"
import { Syne, DM_Sans, JetBrains_Mono } from "next/font/google"
import "./globals.css"

const syne = Syne({ 
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap"
})

const dmSans = DM_Sans({ 
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap"
})

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap"
})

export const metadata: Metadata = {
  title: "FOCUS PROJECT OS | Sistema de Gestao de Projetos",
  description: "Sistema operacional interno de gestao de projetos da Focus - Desenvolvimento de Software, Apps e Automacoes",
  generator: 'v0.app'
}

export const viewport: Viewport = {
  themeColor: "#F97316",
  width: "device-width",
  initialScale: 1
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={`${syne.variable} ${dmSans.variable} ${jetbrainsMono.variable} font-sans bg-[#0A0A0A] text-white antialiased`}>
        {children}
      </body>
    </html>
  )
}
