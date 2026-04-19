import type React from "react"
import type { Metadata, Viewport } from "next"
import { Syne, DM_Sans, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { ModulesProvider } from "@/contexts/modules-context"
import { PwaProvider } from "@/contexts/pwa-context"
import { ToastProvider } from "@/components/reports/toast-notification"

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
  title: "Focus OS | Sistema de Gestão de Projetos",
  description: "Sistema operacional interno de gestão de projetos da Focus - Desenvolvimento de Software, Apps e Automações",
  generator: 'v0.app',
  applicationName: "FOCUS OS",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FOCUS OS",
    startupImage: [
      {
        url: "/splash/apple-splash-2048-2732.png",
        media: "(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)"
      },
      {
        url: "/splash/apple-splash-1668-2388.png",
        media: "(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)"
      },
      {
        url: "/splash/apple-splash-1536-2048.png",
        media: "(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)"
      },
      {
        url: "/splash/apple-splash-1125-2436.png",
        media: "(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)"
      },
      {
        url: "/splash/apple-splash-1242-2688.png",
        media: "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)"
      },
      {
        url: "/splash/apple-splash-828-1792.png",
        media: "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)"
      },
      {
        url: "/splash/apple-splash-1170-2532.png",
        media: "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)"
      },
      {
        url: "/splash/apple-splash-1179-2556.png",
        media: "(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)"
      },
      {
        url: "/splash/apple-splash-1284-2778.png",
        media: "(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3)"
      },
      {
        url: "/splash/apple-splash-1290-2796.png",
        media: "(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)"
      }
    ]
  },
  formatDetection: {
    telephone: false
  },
  icons: {
    icon: [
      { url: "/logo.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" }
    ],
    shortcut: "/logo.svg",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }
    ]
  },
  manifest: "/manifest.json",
}

export const viewport: Viewport = {
  themeColor: "#ff6b00",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover"
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className="dark">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Focus OS" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="120x120" href="/icons/icon-120x120.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/icons/icon-167x167.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-180x180.png" />
      </head>
      <body className={`${syne.variable} ${dmSans.variable} ${jetbrainsMono.variable} font-sans bg-[#0A0A0A] text-white antialiased overscroll-none`}>
        <ToastProvider>
          <PwaProvider>
            <ModulesProvider>
              {children}
            </ModulesProvider>
          </PwaProvider>
        </ToastProvider>
      </body>
    </html>
  )
}
