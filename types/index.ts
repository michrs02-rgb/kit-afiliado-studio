export type VideoStyle =
  | "Close-up & Unboxing UGC"
  | "Demonstração em Uso Real"
  | "Tour de Ambiente Decorado"
  | "Desejo"
  | "Review"
  | "Teste"
  | string;

export type VoiceProfile =
  | "Voz Feminina Natural"
  | "Voz Masculina Natural"
  | "Marina AI (Energética)"
  | "Lucas AI (Direto ao ponto)";

export interface ChecklistState {
  generatedStudio: boolean;
  downloadedVideo: boolean;
  postedShopee: boolean;
  // Retrocompatibilidade opcional
  generatedFlow?: boolean;
  joinedHeadlines?: boolean;
}

export interface GeneratedKit {
  prompt_unico_15s: string;
  estilo_aplicado?: string;
  headlines: string[];
  legenda: string;
  // Campos legados para retrocompatibilidade
  prompt_parte_1?: string;
  prompt_parte_2?: string;
}

export interface SavedVideoItem {
  id: string;
  productTitle: string;
  productUrl?: string;
  productImage?: string | null;
  videoStyle?: VideoStyle;
  estiloAplicado?: string;
  voiceProfile: VoiceProfile;
  kit: GeneratedKit;
  createdAt: string;
  status: "Em andamento" | "Postado na Shopee";
  checklist: ChecklistState;
}

export interface DailyGoalData {
  date: string; // YYYY-MM-DD
  count: number;
}
