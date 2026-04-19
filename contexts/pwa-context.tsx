"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { X, Share, PlusSquare, Download } from "lucide-react";

interface PwaContextType {
  deferredPrompt: any;
  isInstallable: boolean;
  handleInstall: () => void;
  isOffline: boolean;
}

const PwaContext = createContext<PwaContextType>({
  deferredPrompt: null,
  isInstallable: false,
  handleInstall: () => {},
  isOffline: false,
});

export function usePwa() {
  return useContext(PwaContext);
}

export function PwaProvider({ children }: { children: React.ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [showIosPrompt, setShowIosPrompt] = useState(false);

  useEffect(() => {
    // 1. Service Worker Registration
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", function () {
        navigator.serviceWorker.register("/service-worker.js").then(
          (registration) => {
            console.log("Service Worker registered with scope: ", registration.scope);
          },
          (err) => {
            console.log("Service Worker registration failed: ", err);
          }
        );
      });
    }

    // 2. Offline Detection
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    if (typeof window !== "undefined") {
      setIsOffline(!navigator.onLine);
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);
    }

    // 3. Desktop/Android Install Prompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      const hasAccepted = localStorage.getItem("pwa_install_accepted");
      if (!hasAccepted) {
        setDeferredPrompt(e);
        setIsInstallable(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // 4. iOS Detection
    const isIos = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      return /iphone|ipad|ipod/.test(userAgent);
    };
    
    // Check if running in standalone
    const isStandalone = () => {
      return ('standalone' in window.navigator) && !!(window.navigator as any).standalone;
    };

    if (isIos() && !isStandalone()) {
      const iosPromptShown = localStorage.getItem("ios_prompt_shown");
      if (!iosPromptShown) {
        // Delay slightly for UX
        setTimeout(() => setShowIosPrompt(true), 3000);
      }
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      localStorage.setItem("pwa_install_accepted", "true");
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  const closeIosPrompt = () => {
    setShowIosPrompt(false);
    localStorage.setItem("ios_prompt_shown", "true");
  };

  return (
    <PwaContext.Provider value={{ deferredPrompt, isInstallable, handleInstall, isOffline }}>
      {children}

      {/* Offline Banner */}
      {isOffline && (
        <div className="fixed top-0 left-0 w-full z-[100] bg-yellow-600/95 text-white text-xs font-medium py-2 px-4 text-center shadow-md flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          Você está offline — alguns dados podem estar desatualizados
        </div>
      )}

      {/* iOS Install Bottom Sheet */}
      {showIosPrompt && (
        <>
          <div className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm" onClick={closeIosPrompt} />
          <div className="fixed bottom-0 left-0 w-full bg-[#141414] border-t border-[#2A2A2A] p-6 z-[101] rounded-t-2xl animate-in slide-in-from-bottom duration-300">
            <button onClick={closeIosPrompt} className="absolute top-4 right-4 text-neutral-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <div className="flex flex-col items-center text-center space-y-4 pt-2">
              <img src="/logo.svg" alt="Focus OS" className="w-16 h-16" />
              <h3 className="text-lg font-display text-white font-bold">Instalar Focus OS</h3>
              <p className="text-sm text-neutral-400">Instale este aplicativo na sua tela de inicio para acesso rapido e experiencia nativa.</p>
              
              <div className="bg-[#1A1A1A] rounded-lg p-4 w-full flex flex-col gap-3 text-sm text-neutral-300">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded bg-[#2A2A2A]">1</span>
                  <span>Toque no botão <Share className="inline w-4 h-4 mx-1" /> na barra do Safari</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded bg-[#2A2A2A]">2</span>
                  <span>Selecione <strong>Adicionar à Tela de Início</strong> <PlusSquare className="inline w-4 h-4 mx-1" /></span>
                </div>
              </div>
              
              <button 
                onClick={closeIosPrompt}
                className="w-full mt-4 py-3 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 transition"
              >
                Entendi
              </button>
            </div>
          </div>
        </>
      )}
    </PwaContext.Provider>
  );
}
