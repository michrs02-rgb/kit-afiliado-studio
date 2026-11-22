"use client";

import React, { useState, useRef } from "react";
import {
  Link2,
  ClipboardPaste,
  Sparkles,
  Download,
  ImagePlus,
  RefreshCw,
  Edit3,
  Mic,
  AlertCircle,
  Check,
  Search,
  Wand2,
} from "lucide-react";
import { VoiceProfile } from "@/types";

interface LinkInputSectionProps {
  onGenerateKit: (params: {
    productTitle: string;
    voiceProfile: VoiceProfile;
    productImage: string | null;
    imageBase64: string | null;
    productUrl: string;
  }) => Promise<void>;
  isLoading: boolean;
  loadingStepText?: string;
}

const VOICE_PROFILES: { id: VoiceProfile; label: string; desc: string }[] = [
  { id: "Voz Feminina Natural", label: "Voz Feminina Natural", desc: "Autêntica, acolhedora e sincera" },
  { id: "Voz Masculina Natural", label: "Voz Masculina Natural", desc: "Descontraída e confiável" },
  { id: "Marina AI (Energética)", label: "Marina AI (Energética)", desc: "Rápida, entusiasmada e vibrante" },
  { id: "Lucas AI (Direto ao ponto)", label: "Lucas AI (Direto ao ponto)", desc: "Pragmática e sem enrolação" },
];

export function LinkInputSection({ onGenerateKit, isLoading, loadingStepText }: LinkInputSectionProps) {
  const [url, setUrl] = useState("");
  const [productTitle, setProductTitle] = useState("");
  const [productImage, setProductImage] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [voiceProfile, setVoiceProfile] = useState<VoiceProfile>("Voz Feminina Natural");

  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isDownloadingImage, setIsDownloadingImage] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-extract or manual extract when link is provided
  const handleExtractFromUrl = async (targetUrl: string) => {
    const cleanUrl = targetUrl.trim();
    if (!cleanUrl) {
      setExtractError("Insira ou cole um link da Shopee antes de extrair.");
      return;
    }

    setIsExtracting(true);
    setExtractError(null);

    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: cleanUrl }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Não foi possível extrair os dados do anúncio.");
      }

      if (data.title) {
        setProductTitle(data.title);
      }
      const extractedImg = data.image || data.imageUrl;
      if (extractedImg) {
        setProductImage(extractedImg);
        // Pre-convert external image to base64 via proxy to feed Gemini multimodal
        try {
          const dlRes = await fetch(`/api/download-image?url=${encodeURIComponent(extractedImg)}`);
          if (dlRes.ok) {
            const blob = await dlRes.blob();
            const reader = new FileReader();
            reader.onloadend = () => {
              if (typeof reader.result === "string") {
                setImageBase64(reader.result);
              }
            };
            reader.readAsDataURL(blob);
          }
        } catch {
          // If proxy conversion fails, Gemini will use title
        }
      } else if (data.fallbackMode) {
        setExtractError("Título do anúncio capturado. Anexe uma foto ou print da galeria abaixo para a IA analisar o visual.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro na extração";
      setExtractError(msg);
    } finally {
      setIsExtracting(false);
    }
  };

  // Paste from clipboard & auto-extract
  const handlePasteClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setUrl(text);
          setCopiedNotification(true);
          setTimeout(() => setCopiedNotification(false), 2000);
          handleExtractFromUrl(text);
        }
      }
    } catch {
      const input = document.getElementById("shopee-link-input");
      if (input) input.focus();
    }
  };

  // Handle manual photo upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setProductImage(result);
        setImageBase64(result);
        if (!productTitle) {
          setProductTitle("Produto Shopee");
        }
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Download Image (CORS Safe)
  const handleDownloadImage = async () => {
    if (!productImage) return;

    setIsDownloadingImage(true);
    try {
      let downloadUrl = productImage;
      if (productImage.startsWith("http")) {
        downloadUrl = `/api/download-image?url=${encodeURIComponent(productImage)}`;
      }

      const res = await fetch(downloadUrl);
      if (!res.ok) throw new Error("Erro ao baixar");
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `produto-shopee-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      console.error("Falha ao salvar foto:", err);
      window.open(productImage, "_blank");
    } finally {
      setIsDownloadingImage(false);
    }
  };

  // Trigger video generation
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const titleToUse = productTitle.trim() || (url ? "Produto Shopee" : "");
    if (!titleToUse) {
      setExtractError("Informe o título do produto ou cole um link da Shopee para continuar.");
      return;
    }

    onGenerateKit({
      productTitle: titleToUse,
      voiceProfile,
      productImage,
      imageBase64,
      productUrl: url,
    });
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* CARD 1: Cole seu link de afiliado Shopee */}
        <div className="bg-slate-800/95 border border-slate-700/90 rounded-2xl p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <label
              htmlFor="shopee-link-input"
              className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5"
            >
              <Link2 className="w-4 h-4 text-shopee" />
              Cole seu link de afiliado Shopee
            </label>
            <span className="text-[11px] font-normal text-slate-400 lowercase">
              s.shopee.com.br ou shope.ee
            </span>
          </div>

          {/* Input com botão rápido Colar */}
          <div className="relative flex items-center">
            <input
              id="shopee-link-input"
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setExtractError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleExtractFromUrl(url);
                }
              }}
              placeholder="Cole o link da Shopee aqui (ex: https://s.shopee.com.br/...)"
              className="w-full bg-slate-900/90 text-white placeholder-slate-500 text-xs sm:text-sm rounded-xl pl-3.5 pr-20 py-3 border border-slate-700 focus:outline-none focus:border-shopee focus:ring-1 focus:ring-shopee transition-all"
            />

            <button
              type="button"
              onClick={handlePasteClipboard}
              className="absolute right-1.5 px-2.5 py-1.5 text-xs font-semibold text-shopee bg-shopee/10 hover:bg-shopee/20 border border-shopee/30 rounded-lg flex items-center gap-1 transition-all active:scale-95"
            >
              {copiedNotification ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Colado!</span>
                </>
              ) : (
                <>
                  <ClipboardPaste className="w-3.5 h-3.5" />
                  <span>Colar</span>
                </>
              )}
            </button>
          </div>

          {/* Botão Laranja Destacado: Extrair Produto */}
          <button
            type="button"
            onClick={() => handleExtractFromUrl(url)}
            disabled={isExtracting || !url.trim()}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-shopee to-shopee-light hover:brightness-110 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-shopee/30 transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isExtracting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Buscando Produto na Shopee...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Extrair Produto</span>
              </>
            )}
          </button>

          {/* Feedback de Extração em Andamento */}
          {isExtracting && (
            <div className="flex items-center gap-2 text-xs text-amber-400/90 bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-xl animate-pulse">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
              <span>Conectando à Shopee e capturando fotos e título oficial...</span>
            </div>
          )}

          {/* Alerta de Erro na Extração */}
          {extractError && (
            <div className="flex items-start gap-2 text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <div className="flex-1">
                <p className="leading-tight">{extractError}</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Você também pode digitar o nome do produto no card abaixo e anexar uma foto ou print da galeria.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* CARD 2: Produto & Imagem de Referência */}
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-shopee" />
              Produto & Imagem de Referência
            </span>
            {productImage && (
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Foto Carregada
              </span>
            )}
          </div>

          <div className="flex gap-3">
            {/* Box da Imagem */}
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-slate-900 border border-slate-700 overflow-hidden shrink-0 flex items-center justify-center group">
              {productImage ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={productImage}
                    alt={productTitle || "Produto Shopee"}
                    className="w-full h-full object-cover"
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[10px] cursor-pointer transition-opacity"
                  >
                    <ImagePlus className="w-4 h-4 mb-0.5 text-shopee" />
                    <span>Trocar</span>
                  </div>
                </>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-full flex flex-col items-center justify-center p-2 text-center cursor-pointer hover:bg-slate-850 transition-colors"
                >
                  <ImagePlus className="w-6 h-6 text-slate-500 mb-1" />
                  <span className="text-[10px] text-slate-400 leading-tight">
                    {isExtracting ? "Carregando foto..." : "Foto ou Print do Produto"}
                  </span>
                </div>
              )}
            </div>

            {/* Título & Ações */}
            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <div>
                <label className="text-[11px] font-medium text-slate-400 flex items-center justify-between mb-1">
                  <span>Nome do Produto</span>
                  <button
                    type="button"
                    onClick={() => setIsEditingTitle(!isEditingTitle)}
                    className="text-shopee hover:underline text-[10px] flex items-center gap-0.5"
                  >
                    <Edit3 className="w-2.5 h-2.5" />
                    {isEditingTitle ? "Concluir" : "Editar"}
                  </button>
                </label>

                {isEditingTitle ? (
                  <textarea
                    rows={2}
                    value={productTitle}
                    onChange={(e) => setProductTitle(e.target.value)}
                    placeholder="Ex: Fone Bluetooth Sem Fio..."
                    className="w-full bg-slate-900 text-white text-xs rounded-lg p-2 border border-slate-600 focus:outline-none focus:border-shopee resize-none"
                    autoFocus
                  />
                ) : (
                  <p
                    onClick={() => setIsEditingTitle(true)}
                    className={`text-xs font-semibold text-white line-clamp-3 cursor-pointer hover:text-slate-200 ${
                      !productTitle && "italic text-slate-500 font-normal"
                    }`}
                  >
                    {productTitle || "Cole o link acima e clique em 'Extrair Produto' para ver o título e foto..."}
                  </p>
                )}
              </div>

              {/* Botões de Ação na Imagem */}
              <div className="flex flex-wrap items-center gap-1.5 pt-2">
                {productImage && (
                  <button
                    type="button"
                    onClick={handleDownloadImage}
                    disabled={isDownloadingImage}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-700/80 hover:bg-slate-700 text-slate-200 text-[11px] font-medium border border-slate-600 transition-all active:scale-95"
                    title="Baixar imagem no celular para usar no Google AI Studio"
                  >
                    <Download className={`w-3 h-3 ${isDownloadingImage ? "animate-bounce text-shopee" : ""}`} />
                    <span>Salvar Foto</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium border border-slate-700 transition-all active:scale-95"
                >
                  <ImagePlus className="w-3 h-3 text-shopee" />
                  <span>{productImage ? "Trocar Foto" : "Subir Foto / Print"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Input oculto para selecionar foto */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {/* CARD 3: Indicador de Seleção Inteligente de Estilo pela IA */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3.5 shadow-md flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-shopee/15 border border-shopee/30 flex items-center justify-center text-shopee shrink-0">
            <Wand2 className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white">Estilo Visual Automático</span>
              <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                IA Vision
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
              A IA analisa a foto e escolhe automaticamente entre Close-up UGC, Demonstração em Uso Real ou Tour Decorado.
            </p>
          </div>
        </div>

        {/* CARD 4: Seletor de Voz / Apresentador */}
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 shadow-xl space-y-2.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Mic className="w-3.5 h-3.5 text-shopee" />
              Seletor de Voz / Apresentador
            </span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {VOICE_PROFILES.map((voice) => {
              const isSelected = voiceProfile === voice.id;
              return (
                <button
                  key={voice.id}
                  type="button"
                  onClick={() => setVoiceProfile(voice.id)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all active:scale-[0.98] ${
                    isSelected
                      ? "bg-shopee/15 border-shopee text-white ring-1 ring-shopee"
                      : "bg-slate-900/70 border-slate-700 text-slate-300 hover:border-slate-600"
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-bold text-white truncate">{voice.label}</p>
                    <p className="text-[10px] text-slate-400 truncate">{voice.desc}</p>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                      isSelected ? "border-shopee bg-shopee" : "border-slate-600 bg-slate-800"
                    }`}
                  >
                    {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Botão Principal: GERAR VÍDEO SHOPEE */}
        <button
          type="submit"
          disabled={isLoading || isExtracting}
          className="w-full group relative flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-gradient-to-r from-shopee via-shopee to-shopee-light hover:brightness-110 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-shopee/30 transition-all active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-white" />
              <span>{loadingStepText || "GERANDO KIT COM GEMINI..."}</span>
            </div>
          ) : (
            <>
              <Sparkles className="w-5 h-5 transition-transform group-hover:scale-125" />
              <span>GERAR VÍDEO SHOPEE</span>
            </>
          )}
        </button>

        <p className="text-center text-[11px] text-slate-500">
          Otimizado com Gemini Omni 1.2 Flash para vídeo contínuo de 15s no Google AI Studio
        </p>
      </form>
    </div>
  );
}
