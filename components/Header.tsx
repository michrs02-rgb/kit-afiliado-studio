"use client";

import React from "react";
import { ShoppingBag, History, Sparkles, CheckCircle2 } from "lucide-react";

interface HeaderProps {
  dailyCount: number;
  dailyTarget?: number;
  onOpenHistory: () => void;
  savedCount: number;
}

export function Header({ dailyCount, dailyTarget = 5, onOpenHistory, savedCount }: HeaderProps) {
  const isGoalReached = dailyCount >= dailyTarget;
  const progressPercent = Math.min(100, Math.round((dailyCount / dailyTarget) * 100));

  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-shopee to-shopee-light shadow-lg shadow-shopee/25 ring-1 ring-white/20">
            <ShoppingBag className="w-5 h-5 text-white" />
            <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-400 border border-slate-900"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-bold text-white tracking-tight leading-none">
                Kit do Afiliado
              </h1>
              <span className="text-[10px] uppercase font-black px-1.5 py-0.5 rounded bg-shopee/20 text-shopee border border-shopee/30">
                Studio
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium leading-tight mt-0.5">
              Shopee Vídeos + Google AI Studio
            </p>
          </div>
        </div>

        {/* Right Actions: Daily Goal & History */}
        <div className="flex items-center gap-2">
          {/* Daily Goal Badge */}
          <div
            title={`Meta de hoje: ${dailyCount} de ${dailyTarget} vídeos`}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-xs font-semibold transition-all ${
              isGoalReached
                ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400 shadow-sm shadow-emerald-500/20"
                : "bg-slate-800/90 border-slate-700/80 text-slate-200"
            }`}
          >
            {isGoalReached ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-shopee animate-pulse" />
            )}
            <span className="font-bold">{dailyCount}</span>
            <span className="text-slate-400 font-normal">/{dailyTarget}</span>
            <span className="hidden sm:inline text-slate-400 text-[11px] font-normal">hoje</span>
          </div>

          {/* History Button */}
          <button
            onClick={onOpenHistory}
            className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white transition-all active:scale-95"
            aria-label="Meus vídeos gerados"
            title="Meus vídeos gerados"
          >
            <History className="w-4 h-4" />
            {savedCount > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-shopee rounded-full border-2 border-slate-900">
                {savedCount > 99 ? "99+" : savedCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Subtle Progress Line */}
      <div className="w-full bg-slate-800/80 h-1 rounded-full mt-2.5 overflow-hidden">
        <div
          className={`h-full transition-all duration-500 rounded-full ${
            isGoalReached ? "bg-emerald-400" : "bg-gradient-to-r from-shopee to-amber-400"
          }`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </header>
  );
}
