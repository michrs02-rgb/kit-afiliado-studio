import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

export interface GenerateKitResponse {
  estilo_aplicado: string;
  prompt_unico_15s: string;
  headlines: string[];
  legenda: string;
}

// Garante o carregamento da chave do .env.local caso o ambiente do sistema contenha placeholder
function ensureApiKeyLoaded() {
  let key = process.env.GEMINI_API_KEY;
  if (!key || key === "SUA_CHAVE_NOVA_AQUI" || key.includes("SUA_CHAVE")) {
    try {
      const envPath = path.join(process.cwd(), ".env.local");
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, "utf-8");
        const match = content.match(/^GEMINI_API_KEY=(.*)$/m);
        if (match && match[1]?.trim()) {
          process.env.GEMINI_API_KEY = match[1].trim();
        }
      }
    } catch {
      // Ignora erro de leitura em produção/Vercel
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    ensureApiKeyLoaded();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "Chave de API do Google Gemini não configurada. Configure a variável GEMINI_API_KEY no arquivo .env.local ou nas variáveis da Vercel.",
        },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { productTitle, voiceProfile = "Voz Feminina Natural", imageBase64 } = body;

    if (!productTitle || typeof productTitle !== "string" || !productTitle.trim()) {
      return NextResponse.json(
        { error: "O título do produto é obrigatório para gerar o kit de vídeo." },
        { status: 400 }
      );
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // Voice personality instructions
    const voiceGuides: Record<string, { desc: string; voiceTag: string }> = {
      "Voz Feminina Natural": {
        desc: "Tom feminino acolhedor, autêntico, como uma amiga brasileira dando uma dica sincera do dia a dia.",
        voiceTag: "Voz feminina acolhedora e natural narrando em português do Brasil:",
      },
      "Voz Masculina Natural": {
        desc: "Tom masculino descontraído, direto, confiante e natural de quem testou e aprovou.",
        voiceTag: "Voz masculina descontraída e natural narrando em português do Brasil:",
      },
      "Marina AI (Energética)": {
        desc: "Voz feminina dinâmica, entusiasmada, rápida e vibrante ('Gente, para tudo e olha o que acabou de chegar!').",
        voiceTag: "Voz feminina energética e animada narrando em português do Brasil:",
      },
      "Lucas AI (Direto ao ponto)": {
        desc: "Voz masculina rápida, pragmática, sem enrolação, focando 100% no problema e na solução prática.",
        voiceTag: "Voz masculina rápida e direta narrando em português do Brasil:",
      },
    };

    const selectedVoice = voiceGuides[voiceProfile] || voiceGuides["Voz Feminina Natural"];

    const systemPrompt = `Você é o Diretor Criativo e Especialista Número 1 em Shopee Vídeos e IA de Vídeo Generativo no Google AI Studio (calibrado exclusivamente para o modelo Gemini Omni 1.2 Flash).
Sua missão é gerar exatamente 1 ÚNICO PROMPT CONTÍNUO DE 15 SEGUNDOS otimizado para o Gemini Omni 1.2 Flash no Google AI Studio, além de selecionar o estilo visual ideal e gerar headlines e legenda de alta conversão para Afiliados Shopee.

=========================================
SELEÇÃO INTELIGENTE DO ESTILO VISUAL:
=========================================
Analise minuciosamente a imagem anexada do produto (ou o título caso não haja imagem) e determine automaticamente qual destes 3 estilos visuais campeões da Shopee Vídeos melhor se adapta ao item:

1. "Close-up & Unboxing UGC":
   - Indicado para: eletrônicos, fones de ouvido, relógios/smartwatches, gadgets, capinhas, maquiagem, skincare, perfumes, joias, calçados e pequenos acessórios.
   - Enquadramento e Cena: Câmera próxima (estilo gravação de celular UGC / POV), mãos brasileiras em primeiro plano segurando, abrindo ou girando o produto sob luz natural suave de janela. NUNCA mostre rostos de pessoas.
   - Estrutura de 15 segundos:
     * [0s a 4s] Gancho visual aproximado com mãos brasileiras apresentando/abrindo o produto da foto em luz suave, destacando materiais, textura e acabamento real nos primeiros segundos.
     * [4s a 11s] Demonstração rápida de uso em mãos (ligando, testando encaixe, mostrando praticidade).
     * [11s a 15s] Aproximação final em mãos destacando o produto e chamada direta para a sacolinha laranja da Shopee.

2. "Demonstração em Uso Real":
   - Indicado para: eletroportáteis (ventiladores, liquidificadores, aspiradores, fritadeiras airfryer, cafeteiras), utensílios de cozinha, limpeza e utilidades domésticas funcionais.
   - Enquadramento e Cena: Plano médio-próximo dentro de um ambiente brasileiro real (sala, quarto ou bancada de cozinha com parede clara e piso de cerâmica ou madeira). NUNCA mostre rostos de pessoas (mostre apenas mãos brasileiras acionando o aparelho ou o aparelho em destaque).
   - Estrutura de 15 segundos:
     * [0s a 4s] Produto da foto posicionado no cômodo, mãos ligando ou acionando o aparelho imediatamente.
     * [4s a 11s] Aparelho funcionando na prática em tempo real, evidenciando potência, comodidade e utilidade imediata.
     * [11s a 15s] Enquadramento final no produto em funcionamento com convite direto para clicar na sacolinha laranja da Shopee.

3. "Tour de Ambiente Decorado":
   - Indicado para: móveis (cômodas, mesas, prateleiras, racks, sapateiras), organizadores de armário, iluminação decorativa, cortinas, quadros e decoração do lar.
   - Enquadramento e Cena: Movimento de câmera lento e contínuo (panorâmica suave ou aproximação gradual em travelling suave), sem cortes bruscos, destacando o item da foto montado e integrado a um cômodo brasileiro limpo, moderno e organizado. Sem rostos de pessoas.
   - Estrutura de 15 segundos:
     * [0s a 4s] Panorâmica suave do cômodo revelando o móvel/item decorativo montado com excelente aproveitamento de espaço.
     * [4s a 11s] Aproximação gradual destacando gavetas abrindo com facilidade, nichos, prateleiras ou detalhes do acabamento e design.
     * [11s a 15s] Plano aconchegante mostrando o ambiente harmonioso e chamada convidativa para a sacolinha laranja da Shopee.

=========================================
DIRETRIZES DO GEMINI OMNI 1.2 FLASH:
=========================================
1. Formato: Proporção vertical 9:16, 720p, 15 segundos.
2. Single continuous take (um único plano-sequência fluido de 15 segundos sem transições ou cortes bruscos de câmera).
3. Fidelidade visual: Descreva com precisão cirúrgica as cores, texturas e detalhes do produto exatamente como aparecem na imagem anexada.
4. Locução embutida: O prompt DEVE conter a locução completa em português do Brasil inserida entre aspas e precedida do marcador de voz:
   ${selectedVoice.voiceTag} "..."
5. Duração da fala: A narração deve ter entre 30 e 40 palavras, dimensionada para ser falada de maneira natural e caber com folga nos 15 segundos.
6. Fechamento obrigatório da fala: O final da locução deve direcionar o usuário para a sacolinha laranja (exemplo: "...o link tá na sacolinha laranja aqui embaixo, aproveita antes que acabe!").

=========================================
HEADLINES E LEGENDA SHOPEE:
=========================================
- headlines: Exatamente 3 headlines curtas para texto fixo na tela da Shopee Vídeos (máximo de 5 palavras, TODAS EM CAIXA ALTA, iniciando com 1 emoji impactante, ex: "🚨 MELHOR ACHADINHO DO MÊS").
- legenda: Texto persuasivo pronto para postar na Shopee com gancho instigante, 2 benefícios em tópicos, chamada para a sacolinha laranja e exatamente 5 hashtags virais (#achadinhos #shopee #shopeebrasil #achadinhosshopee #comprinhas).`;

    const userPrompt = `PRODUTO: "${productTitle}"
PERFIL DE VOZ SELECIONADO: ${voiceProfile} (${selectedVoice.desc})

Identifique visualmente o produto através da imagem ou título, selecione automaticamente o estilo visual correspondente ("Close-up & Unboxing UGC", "Demonstração em Uso Real" ou "Tour de Ambiente Decorado") e gere o prompt contínuo único de 15 segundos calibrado para o Gemini Omni 1.2 Flash no Google AI Studio, as 3 headlines e a legenda persuasiva.`;

    // Build parts for multimodal content if image is provided
    const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];

    if (imageBase64 && typeof imageBase64 === "string") {
      let mimeType = "image/jpeg";
      let base64Data = imageBase64;

      if (imageBase64.startsWith("data:")) {
        const matches = imageBase64.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
        if (matches && matches[1] && matches[2]) {
          mimeType = matches[1];
          base64Data = matches[2];
        }
      }

      parts.push({
        inlineData: {
          mimeType,
          data: base64Data,
        },
      });
      parts.push({
        text: `[IMAGEM OFICIAL DO PRODUTO] Analise esta foto: identifique a categoria exata (eletrônicos/beleza para Close-up UGC, eletroportáteis para Uso Real, ou móveis/decoração para Tour Decorado), além das cores reais, textura, formato e acabamento para reproduzir fielmente no prompt único de 15 segundos do Gemini Omni 1.2 Flash.`,
      });
    }

    parts.push({
      text: userPrompt,
    });

    const config = {
      systemInstruction: systemPrompt,
      temperature: 0.7,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          estilo_aplicado: {
            type: Type.STRING,
            description:
              "Estilo visual selecionado automaticamente pela IA: 'Close-up & Unboxing UGC', 'Demonstração em Uso Real' ou 'Tour de Ambiente Decorado'.",
          },
          prompt_unico_15s: {
            type: Type.STRING,
            description:
              "Prompt contínuo único de 15 segundos para o Gemini Omni 1.2 Flash no Google AI Studio (9:16, 720p, cena contínua sem cortes, sem rosto, 0s-4s gancho, 4s-11s demo/uso, 11s-15s CTA sacolinha laranja) com locução completa em português brasileiro entre aspas.",
          },
          headlines: {
            type: Type.ARRAY,
            description: "Exatamente 3 opções de headlines para texto fixo na Shopee Vídeos (máx 5 palavras, TODAS EM CAIXA ALTA, 1 emoji inicial).",
            items: {
              type: Type.STRING,
            },
          },
          legenda: {
            type: Type.STRING,
            description: "Legenda persuasiva completa com gancho, benefícios em tópicos, CTA da sacolinha laranja e 5 hashtags.",
          },
        },
        required: ["estilo_aplicado", "prompt_unico_15s", "headlines", "legenda"],
      },
    };

    const contents = [
      {
        role: "user",
        parts: parts as any,
      },
    ];

    const models = [
      "gemini-3.8-flash",
      "gemini-4-hydrogen",
      "gemini-3.8-flash-lite",
      "gemini-3.5-flash",
    ];

    const envModel = process.env.GEMINI_MODEL?.trim();
    const candidateModels = envModel
      ? [envModel, ...models.filter((m) => m !== envModel)]
      : models;

    let response: any = null;
    let lastError: any = null;

    for (const modelName of candidateModels) {
      try {
        response = await ai.models.generateContent({
          model: modelName,
          contents,
          config,
        });

        if (response && response.text) {
          break;
        }
      } catch (err: any) {
        lastError = err;
        const errMsg = err?.message || String(err);
        const status = err?.status || err?.statusCode || "";
        console.warn(
          `Falha ao gerar com modelo "${modelName}" (Status: ${status}, Erro: ${errMsg}). Tentando próximo modelo da fila...`
        );
      }
    }

    if (!response || !response.text) {
      throw lastError || new Error("Todos os modelos da fila falharam ao gerar a resposta.");
    }

    const outputText = response.text;
    if (!outputText) {
      throw new Error("A IA não retornou texto na resposta.");
    }

    const parsedData: GenerateKitResponse = JSON.parse(outputText);

    return NextResponse.json({
      success: true,
      kit: parsedData,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido ao gerar o kit com a IA";
    console.error("Erro na rota /api/generate-kit:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
