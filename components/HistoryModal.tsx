"use client";

import React from "react";
import { X, Trash2, ArrowRight, Video, Calendar, ShoppingBag, CheckCircle2, Clock } from "lucide-react";
import { SavedVideoItem } from "@/types";

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedVideos: SavedVideoItem[];
  onSelectVideo: (item: SavedVideoItem) => void;
  onDeleteVideo: (id: string) => void;
}

export function HistoryModal({
  isOpen,
  onClose,
  savedVideos,
  onSelectVideo,
  onDeleteVideo,
}: HistoryModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-850">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-shopee/20 border border-shopee/30 flex items-center justify-center text-shopee">
              <Video className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white leading-tight">Meus Vídeos Gerados</h2>
              <p className="text-[11px] text-slate-400">
                {savedVideos.length} {savedVideos.length === 1 ? "vídeo salvo" : "vídeos salvos"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Video List */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {savedVideos.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500 mx-auto">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <p className="text-xs font-semibold text-slate-300">Nenhum kit de vídeo gerado ainda</p>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                Cole o link de um produto da Shopee ou envie uma foto na tela inicial para criar seu primeiro roteiro!
              </p>
            </div>
          ) : (
            savedVideos.map((video) => {
              const isPosted = video.status === "Postado na Shopee";
              return (
                <div
                  key={video.id}
                  className="bg-slate-800/80 border border-slate-700/80 hover:border-slate-600 rounded-2xl p-3 flex items-center gap-3 transition-all group"
                >
                  {/* Thumbnail */}
                  {video.productImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={video.productImage}
                      alt={video.productTitle}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-700 shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0 text-shopee">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                  )}

                  {/* Title & Metadata */}
                  <div
                    onClick={() => {
                      onSelectVideo(video);
                      onClose();
                    }}
                    className="flex-1 min-w-0 cursor-pointer"
                  >
                    <h3 className="text-xs font-bold text-white truncate group-hover:text-shopee transition-colors">
                      {video.productTitle}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border flex items-center gap-0.5 ${
                          isPosted
                            ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                            : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                        }`}
                      >
                        {isPosted ? <CheckCircle2 className="w-2.5 h-2.5" /> : <Clock className="w-2.5 h-2.5" />}
                        {video.status}
                      </span>
                      <span className="text-[10px] text-slate-400 truncate max-w-[120px]">
                        {video.kit?.estilo_aplicado || video.estiloAplicado || video.videoStyle}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => {
                        onSelectVideo(video);
                        onClose();
                      }}
                      className="p-2 rounded-xl bg-slate-700/60 hover:bg-shopee text-slate-300 hover:text-white transition-all active:scale-95"
                      title="Abrir prompts"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteVideo(video.id)}
                      className="p-2 rounded-xl bg-slate-700/30 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-all active:scale-95"
                      title="Excluir"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
