"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  Copy,
  Check,
  Sparkles,
  Type as TypeIcon,
  MessageSquareQuote,
  ListChecks,
  ShoppingBag,
  ExternalLink,
  Volume2,
  Video,
  Download,
  CheckCircle2,
  Layers,
} from "lucide-react";
import { SavedVideoItem, ChecklistState } from "@/types";
import { triggerShopeeConfetti, triggerGoalCelebration } from "@/utils/confetti";

interface ResultSectionProps {
  item: SavedVideoItem;
  onBack: () => void;
  onUpdateChecklist: (itemId: string, newChecklist: ChecklistState) => void;
}

export function ResultSection({ item, onBack, onUpdateChecklist }: ResultSectionProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const checklist = item.checklist;

  // Suporte a itens novos e legados
  const promptText =
    item.kit.prompt_unico_15s ||
    (item.kit.prompt_parte_1 && item.kit.prompt_parte_2
      ? `${item.kit.prompt_parte_1}\n\n${item.kit.prompt_parte_2}`
      : item.kit.prompt_parte_1 || "");

  const estiloVisual = item.kit.estilo_aplicado || item.estiloAplicado || item.videoStyle || "Close-up & Unboxing UGC";

  const isStep1Done = Boolean(checklist.generatedStudio || checklist.generatedFlow);
  const isStep2Done = Boolean(checklist.downloadedVideo || checklist.joinedHeadlines);
  const isStep3Done = Boolean(checklist.postedShopee);

  const completedCount = [isStep1Done, isStep2Done, isStep3Done].filter(Boolean).length;

  const handleCopy = async (text: string, key: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (err) {
      console.error("Erro ao copiar:", err);
    }
  };

  const handleToggleChecklist = (stepKey: "generatedStudio" | "downloadedVideo" | "postedShopee") => {
    let isNowActive = false;
    if (stepKey === "generatedStudio") isNowActive = !isStep1Done;
    if (stepKey === "downloadedVideo") isNowActive = !isStep2Done;
    if (stepKey === "postedShopee") isNowActive = !isStep3Done;

    const updated: ChecklistState = {
      ...checklist,
      [stepKey]: isNowActive,
    };

    // If step 3 is newly checked: trigger celebration
    if (stepKey === "postedShopee" && isNowActive) {
      triggerShopeeConfetti();
      triggerGoalCelebration();
    }

    onUpdateChecklist(item.id, updated);
  };

  // Helper to highlight spoken dialogue in quotes inside prompt
  const renderPromptWithSpeechHighlight = (prompt: string) => {
    const parts = prompt.split(/(".*?")/g);
    return (
      <p className="text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-wrap">
        {parts.map((segment, index) => {
          if (segment.startsWith('"') && segment.endsWith('"')) {
            return (
              <span
                key={index}
                className="bg-shopee/20 text-amber-300 font-semibold px-1.5 py-0.5 rounded border border-shopee/30 inline-block my-0.5"
                title="Fala de narração em português brasileiro"
              >
                <Volume2 className="w-3.5 h-3.5 inline mr-1 text-shopee" />
                {segment}
              </span>
            );
          }
          return segment;
        })}
      </p>
    );
  };

  return (
    <div className="space-y-4 pb-12 animate-fade-in">
      {/* Top Bar with Back Button & Status */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-all active:scale-95"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar / Novo Vídeo</span>
        </button>

        <span
          className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
            item.status === "Postado na Shopee"
              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
              : "bg-amber-500/20 text-amber-300 border-amber-500/30"
          }`}
        >
          {item.status}
        </span>
      </div>

      {/* Product Summary Header Card */}
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-3.5 flex items-center gap-3">
        {item.productImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.productImage}
            alt={item.productTitle}
            className="w-14 h-14 rounded-xl object-cover border border-slate-700 shrink-0"
          />
        ) : (
          <div className="w-14 h-14 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0 text-shopee">
            <ShoppingBag className="w-6 h-6" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-bold text-white truncate leading-snug">
            {item.productTitle}
          </h2>
          <div className="flex flex-wrap items-center gap-1.5 mt-1">
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-shopee/15 text-shopee border border-shopee/30 flex items-center gap-1">
              <Layers className="w-3 h-3" />
              {estiloVisual}
            </span>
            <span className="text-[10px] text-slate-400 truncate">
              {item.voiceProfile}
            </span>
          </div>
        </div>
      </div>

      {/* CARD PRINCIPAL EM DESTAQUE: PROMPT ÚNICO DE 15 SEGUNDOS (GOOGLE AI STUDIO) */}
      <div className="bg-gradient-to-br from-slate-800/95 via-slate-800 to-slate-850 border border-shopee/40 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-3.5 relative overflow-hidden ring-1 ring-shopee/20">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-shopee/20 border border-shopee/40 text-shopee">
                <Sparkles className="w-3.5 h-3.5" />
              </span>
              <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
                PROMPT ÚNICO DE 15 SEGUNDOS (GOOGLE AI STUDIO)
              </h3>
            </div>

            {/* Etiquetas do cabeçalho: estilo_aplicado + especificações técnicas */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-shopee/15 border border-shopee/30 text-[10px] font-bold text-shopee">
                <Layers className="w-3 h-3" />
                {estiloVisual}
              </span>

              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-[10px] font-bold text-amber-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Gemini Omni 1.2 Flash • 9:16 • 15s • 720p
              </span>
            </div>
          </div>

          {/* Botões de Ação do Prompt */}
          <div className="flex items-center gap-2 shrink-0 pt-1 sm:pt-0">
            <button
              onClick={() => handleCopy(promptText, "prompt_unico")}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 shadow-md ${
                copiedKey === "prompt_unico"
                  ? "bg-emerald-500 text-white shadow-emerald-500/25"
                  : "bg-gradient-to-r from-shopee to-shopee-light hover:brightness-110 text-white shadow-shopee/25"
              }`}
            >
              {copiedKey === "prompt_unico" ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Prompt Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Prompt</span>
                </>
              )}
            </button>

            <a
              href="https://aistudio.google.com/prompts/new_chat"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-200 bg-slate-700/80 hover:bg-slate-700 hover:text-white border border-slate-600 transition-all active:scale-95"
              title="Abrir Google AI Studio em nova aba"
            >
              <span>Abrir Google AI Studio</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-300" />
            </a>
          </div>
        </div>

        {/* Bloco de Visualização do Prompt com realce de voz */}
        <div className="bg-slate-900/95 rounded-xl p-3.5 border border-slate-700/70 max-h-56 overflow-y-auto shadow-inner">
          {renderPromptWithSpeechHighlight(promptText)}
        </div>

        {/* Linha do Tempo e Estrutura dos 15 Segundos */}
        <div className="grid grid-cols-3 gap-1.5 text-[10px] pt-1">
          <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-2 text-center">
            <span className="block font-bold text-shopee">0s - 4s</span>
            <span className="text-slate-400">Gancho Visual</span>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-2 text-center">
            <span className="block font-bold text-amber-300">4s - 11s</span>
            <span className="text-slate-400">Demonstração Real</span>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-2 text-center">
            <span className="block font-bold text-emerald-400">11s - 15s</span>
            <span className="text-slate-400">CTA Sacolinha</span>
          </div>
        </div>
      </div>

      {/* CARD 2: Headlines para Shopee Vídeos (3 opções mantidas) */}
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TypeIcon className="w-4 h-4 text-shopee" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Headlines para Shopee Vídeos (3 opções)
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">Toque para copiar</span>
        </div>

        <div className="space-y-2">
          {item.kit.headlines.map((headline, idx) => {
            const headlineKey = `hl_${idx}`;
            const isCopied = copiedKey === headlineKey;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleCopy(headline, headlineKey)}
                className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all active:scale-[0.98] ${
                  isCopied
                    ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                    : "bg-slate-900/80 hover:bg-slate-900 border-slate-700 hover:border-shopee/50 text-white"
                }`}
              >
                <span className="text-xs font-black tracking-tight leading-snug">
                  {headline}
                </span>
                <span className="shrink-0 ml-2">
                  {isCopied ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                      <Check className="w-3 h-3" /> Copiado!
                    </span>
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-slate-400 group-hover:text-shopee" />
                  )}
                </span>
              </button>
            );
          })}
        </div>

        <p className="text-[11px] text-slate-400">
          Cole como texto fixo no topo da tela no editor da Shopee Vídeos para reter o público.
        </p>
      </div>

      {/* CARD 3: Legenda Pronta + Hashtags (mantida intacta) */}
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquareQuote className="w-4 h-4 text-shopee" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Legenda Pronta + Hashtags
            </h3>
          </div>

          <button
            onClick={() => handleCopy(item.kit.legenda, "caption")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
              copiedKey === "caption"
                ? "bg-emerald-500 text-white"
                : "bg-slate-700 hover:bg-slate-600 text-white"
            }`}
          >
            {copiedKey === "caption" ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar Texto</span>
              </>
            )}
          </button>
        </div>

        <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-700/60 text-xs text-slate-300 whitespace-pre-line leading-relaxed font-sans">
          {item.kit.legenda}
        </div>
      </div>

      {/* CARD 4: Checklist de Próximos Passos (Tela 2) */}
      <div className="bg-gradient-to-br from-slate-800/95 via-slate-800 to-slate-850 border border-slate-700/80 rounded-2xl p-4 shadow-2xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListChecks className="w-4 h-4 text-shopee" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Próximos Passos (Checklist)
            </h3>
          </div>
          <span className="text-[10px] uppercase font-bold text-shopee">
            {completedCount}/3 Concluídos
          </span>
        </div>

        <div className="space-y-2 pt-1">
          {/* Passo 1: Gerar vídeo de 15s no Google AI Studio */}
          <button
            type="button"
            onClick={() => handleToggleChecklist("generatedStudio")}
            className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
              isStep1Done
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-200"
                : "bg-slate-900/60 border-slate-700 text-slate-300 hover:border-slate-600"
            }`}
          >
            <div
              className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                isStep1Done
                  ? "bg-emerald-500 border-emerald-500 text-white"
                  : "border-slate-600 bg-slate-800"
              }`}
            >
              {isStep1Done && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </div>
            <div className="flex-1">
              <p
                className={`text-xs font-semibold ${
                  isStep1Done ? "line-through text-emerald-300/70" : "text-white"
                }`}
              >
                Passo 1: Gerar vídeo de 15s no Google AI Studio
              </p>
              <p className="text-[10px] text-slate-400">
                Use Gemini Omni 1.2 Flash, 9:16, 15s, 720p + foto do produto
              </p>
            </div>
            <Video className="w-4 h-4 text-slate-500 shrink-0" />
          </button>

          {/* Passo 2: Baixar o MP4 pronto com áudio */}
          <button
            type="button"
            onClick={() => handleToggleChecklist("downloadedVideo")}
            className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
              isStep2Done
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-200"
                : "bg-slate-900/60 border-slate-700 text-slate-300 hover:border-slate-600"
            }`}
          >
            <div
              className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                isStep2Done
                  ? "bg-emerald-500 border-emerald-500 text-white"
                  : "border-slate-600 bg-slate-800"
              }`}
            >
              {isStep2Done && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </div>
            <div className="flex-1">
              <p
                className={`text-xs font-semibold ${
                  isStep2Done ? "line-through text-emerald-300/70" : "text-white"
                }`}
              >
                Passo 2: Baixar o MP4 pronto com áudio
              </p>
              <p className="text-[10px] text-slate-400">
                O vídeo já sai completo de 15s sem precisar editar
              </p>
            </div>
            <Download className="w-4 h-4 text-slate-500 shrink-0" />
          </button>

          {/* Passo 3: Postar na Shopee Vídeos com a sacolinha */}
          <button
            type="button"
            onClick={() => handleToggleChecklist("postedShopee")}
            className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
              isStep3Done
                ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-200 shadow-md shadow-emerald-500/10"
                : "bg-gradient-to-r from-shopee/10 to-slate-900 border-shopee/40 text-slate-200 hover:border-shopee"
            }`}
          >
            <div
              className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                isStep3Done
                  ? "bg-emerald-500 border-emerald-500 text-white"
                  : "border-shopee bg-shopee/20"
              }`}
            >
              {isStep3Done && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </div>
            <div className="flex-1">
              <p
                className={`text-xs font-black ${
                  isStep3Done ? "text-emerald-400" : "text-white"
                }`}
              >
                Passo 3: Postar na Shopee Vídeos com a sacolinha
              </p>
              <p className="text-[10px] text-slate-400 flex items-center gap-1">
                {isStep3Done ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0 inline" />
                    <span>Vídeo postado e contabilizado na sua meta de hoje!</span>
                  </>
                ) : (
                  <span>Adicione a Headline, cole a Legenda e vincule o produto</span>
                )}
              </p>
            </div>
            <ShoppingBag className="w-4 h-4 text-shopee shrink-0" />
          </button>
        </div>
      </div>
    </div>
  );
}
