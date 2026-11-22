"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { LinkInputSection } from "@/components/LinkInputSection";
import { ResultSection } from "@/components/ResultSection";
import { HistoryModal } from "@/components/HistoryModal";
import { PwaInstallPrompt } from "@/components/PwaInstallPrompt";
import {
  SavedVideoItem,
  ChecklistState,
  VoiceProfile,
  GeneratedKit,
} from "@/types";
import {
  getDailyGoal,
  incrementDailyGoal,
  getSavedVideos,
  saveVideoItem,
  deleteVideoItem,
} from "@/utils/storage";

export default function Home() {
  const [dailyCount, setDailyCount] = useState<number>(0);
  const [savedVideos, setSavedVideos] = useState<SavedVideoItem[]>([]);
  const [activeItem, setActiveItem] = useState<SavedVideoItem | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStepText, setLoadingStepText] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize data on client mount
  useEffect(() => {
    const goal = getDailyGoal();
    setDailyCount(goal.count);
    const videos = getSavedVideos();
    setSavedVideos(videos);
  }, []);

  // Handle Video Generation with API
  const handleGenerateKit = async ({
    productTitle,
    voiceProfile,
    productImage,
    imageBase64,
    productUrl,
  }: {
    productTitle: string;
    voiceProfile: VoiceProfile;
    productImage: string | null;
    imageBase64: string | null;
    productUrl: string;
  }) => {
    setIsLoading(true);
    setErrorMessage(null);
    setLoadingStepText("Consultando Gemini...");

    const steps = [
      "Consultando Gemini...",
      "Analisando imagem e selecionando estilo visual pela IA...",
      "Criando Prompt Único de 15s (Gemini Omni 1.2 Flash)...",
      "Sincronizando locução contínua para 15 segundos...",
      "Gerando headlines e legenda de alta conversão...",
    ];

    let stepIndex = 0;
    const interval = setInterval(() => {
      stepIndex = (stepIndex + 1) % steps.length;
      setLoadingStepText(steps[stepIndex]);
    }, 1800);

    try {
      const response = await fetch("/api/generate-kit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productTitle,
          voiceProfile,
          imageBase64: imageBase64 || undefined,
        }),
      });

      clearInterval(interval);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Falha ao gerar o kit de vídeo.");
      }

      const kit: GeneratedKit = data.kit;
      const estiloEscolhido = kit.estilo_aplicado || "Close-up & Unboxing UGC";

      const newItem: SavedVideoItem = {
        id: `vid_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        productTitle,
        productUrl,
        productImage,
        videoStyle: estiloEscolhido,
        estiloAplicado: estiloEscolhido,
        voiceProfile,
        kit,
        createdAt: new Date().toISOString(),
        status: "Em andamento",
        checklist: {
          generatedStudio: false,
          downloadedVideo: false,
          postedShopee: false,
        },
      };

      saveVideoItem(newItem);
      const updatedList = getSavedVideos();
      setSavedVideos(updatedList);
      setActiveItem(newItem);
    } catch (err: unknown) {
      clearInterval(interval);
      const msg = err instanceof Error ? err.message : "Erro inesperado ao gerar";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
      setLoadingStepText("");
    }
  };

  // Handle Checklist Updates
  const handleUpdateChecklist = (itemId: string, newChecklist: ChecklistState) => {
    if (!activeItem || activeItem.id !== itemId) return;

    const wasAlreadyPosted = activeItem.checklist.postedShopee;
    const isNowPosted = newChecklist.postedShopee;

    const newStatus = isNowPosted ? "Postado na Shopee" : "Em andamento";

    const updatedItem: SavedVideoItem = {
      ...activeItem,
      status: newStatus,
      checklist: newChecklist,
    };

    setActiveItem(updatedItem);
    saveVideoItem(updatedItem);

    const updatedList = getSavedVideos();
    setSavedVideos(updatedList);

    // If newly marked as posted: increment daily goal!
    if (!wasAlreadyPosted && isNowPosted) {
      const newCount = incrementDailyGoal();
      setDailyCount(newCount);
    }
  };

  // Delete Video from History
  const handleDeleteVideo = (id: string) => {
    const updated = deleteVideoItem(id);
    setSavedVideos(updated);
    if (activeItem && activeItem.id === id) {
      setActiveItem(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col antialiased selection:bg-shopee selection:text-white">
      {/* Centered Mobile-First App Wrapper */}
      <div className="w-full max-w-md mx-auto min-h-screen flex flex-col bg-slate-900 border-x border-slate-800 shadow-2xl relative">
        {/* Persistent Sticky Header */}
        <Header
          dailyCount={dailyCount}
          dailyTarget={5}
          onOpenHistory={() => setIsHistoryOpen(true)}
          savedCount={savedVideos.length}
        />

        {/* Global Error Banner if API failed */}
        {errorMessage && (
          <div className="mx-4 mt-3 p-3.5 bg-rose-500/15 border border-rose-500/30 rounded-2xl text-xs text-rose-300">
            <p className="font-bold mb-1">Atenção:</p>
            <p>{errorMessage}</p>
          </div>
        )}

        {/* Main Content View: Screen 1 vs Screen 2 */}
        <main className="flex-1 p-4 pb-20">
          {activeItem ? (
            <ResultSection
              item={activeItem}
              onBack={() => setActiveItem(null)}
              onUpdateChecklist={handleUpdateChecklist}
            />
          ) : (
            <LinkInputSection
              onGenerateKit={handleGenerateKit}
              isLoading={isLoading}
              loadingStepText={loadingStepText}
            />
          )}
        </main>

        {/* History Modal */}
        <HistoryModal
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          savedVideos={savedVideos}
          onSelectVideo={(video) => setActiveItem(video)}
          onDeleteVideo={handleDeleteVideo}
        />

        {/* PWA Mobile & Desktop Install Prompt */}
        <PwaInstallPrompt />
      </div>
    </div>
  );
}
