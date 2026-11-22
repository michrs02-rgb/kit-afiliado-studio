"use client";

import React, { useEffect, useState } from "react";
import { Download, X, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosTip, setShowIosTip] = useState(false);

  useEffect(() => {
    // Check if already installed in standalone mode
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) return;

    // Detect iOS
    const ua = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(ua);
    setIsIos(isAppleDevice);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    } else if (isIos) {
      setShowIosTip(true);
    }
  };

  if (!showPrompt && !showIosTip) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto z-40 animate-fade-in">
      <div className="bg-slate-900/95 border border-shopee/40 rounded-2xl p-3 shadow-2xl backdrop-blur-md flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-shopee/20 border border-shopee/40 flex items-center justify-center text-shopee shrink-0">
            <Smartphone className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-white leading-tight truncate">
              Instalar como App
            </p>
            <p className="text-[10px] text-slate-400 truncate">
              {showIosTip ? "Toque em Compartilhar e 'Adicionar à Tela de Início'" : "Acesso rápido e tela cheia no seu celular"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {!showIosTip && (
            <button
              onClick={handleInstallClick}
              className="px-3 py-1.5 rounded-xl bg-shopee hover:bg-shopee-hover text-white text-xs font-bold transition-all active:scale-95 flex items-center gap-1 shadow-md shadow-shopee/30"
            >
              <Download className="w-3 h-3" />
              <span>Instalar</span>
            </button>
          )}

          <button
            onClick={() => {
              setShowPrompt(false);
              setShowIosTip(false);
            }}
            className="w-7 h-7 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
