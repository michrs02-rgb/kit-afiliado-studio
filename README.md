# Kit do Afiliado Studio 🛍️🎬

Aplicação Web Full-Stack PWA (Progressive Web App) mobile-first voltada 100% para afiliados da **Shopee Vídeos**, integrando o poder do **Google Gemini** (`@google/genai`) para extração inteligente e geração de **1 único prompt contínuo de 15 segundos** perfeitamente otimizado para o modelo **Gemini Omni 1.2 Flash** no **Google AI Studio**.

---

## 🚀 Funcionalidades Principais

1. **Header & Meta Diária Automática**:
   - Badge dinâmico: `"X/5 vídeos hoje"`.
   - Persistência em `localStorage` com **reset automático diário** a cada novo dia.
   - Animação de confetes ao atingir a meta ou postar um vídeo.

2. **Entrada do Link e Extração de Produto**:
   - Aceita links curtos (`s.shopee.com.br`, `shope.ee`) e links diretos da Shopee.
   - Botão rápido de **"Colar"** com leitura da área de transferência (`navigator.clipboard.readText`).
   - Rota `/api/extract` com resolução de redirecionamentos HTTP (`redirect: 'follow'`) e extração de título oficial e fotos de alta resolução.
   - Botão **"Salvar Foto"** via `/api/download-image` (sem bloqueio de CORS).
   - Botão **"Selecionar / Trocar Foto"** para envio de prints e fotos manuais com suporte multimodal na IA.

3. **Configuração de Estilo e Voz**:
   - **Estilos**:
     - *Desejo* (foco estético e impulso de compra)
     - *Review* (análise de detalhes e qualidade real)
     - *Teste* (demonstração prática resolvendo uma dor)
   - **Vozes / Apresentador**:
     - *Voz Feminina Natural*
     - *Voz Masculina Natural*
     - *Marina AI (Energética)*
     - *Lucas AI (Direto ao ponto)*

4. **Geração Multimodal com Gemini (`/api/generate-kit`)**:
   - **Prompt Único de 15 Segundos (Google AI Studio)**:
     - Modelo: Gemini Omni 1.2 Flash (9:16, 15s, 720p).
     - Single continuous take (plano contínuo sem cortes) em estilo UGC POV realista com mãos brasileiras.
     - 0s a 4s: Gancho visual e apresentação imediata do produto.
     - 4s a 11s: Demonstração real e destaque de qualidade/acabamento.
     - 11s a 15s: Chamada para ação direcionando para a sacolinha laranja da Shopee.
     - Narração completa em português do Brasil embutida entre aspas e calculada para caber confortavelmente em 15s.
   - **Headlines**: 3 opções de textos fixos de até 5 palavras em CAIXA ALTA com emoji inicial.
   - **Legenda Pronta**: Com gancho, benefícios em tópicos, CTA da sacolinha e 5 hashtags estratégicas (#achadinhos, #shopee, etc.).

5. **Checklist Shopee Vídeos & Histórico**:
   - 1. Gerar vídeo de 15s no Google AI Studio (Use Gemini Omni 1.2 Flash, 9:16, 15s, 720p + foto do produto)
   - 2. Baixar o MP4 pronto com áudio (O vídeo já sai completo de 15s sem precisar editar)
   - 3. Postar na Shopee Vídeos com a sacolinha (soma automaticamente à meta diária e dispara celebração de confetes).
   - Modal com histórico de todos os kits gerados salvos em `localStorage`.

6. **PWA Instalável**:
   - `manifest.json`, ícones SVG (192px e 512px) e banner de instalação na tela inicial no celular e Chrome Desktop.

---

## 🛠️ Tecnologias Utilizadas

- **Next.js 15 (App Router)**
- **TypeScript**
- **Tailwind CSS** (Tema Dark Slate `#0f172a` com destaques Laranja Shopee `#ee4d2d`)
- **SDK Oficial Google Gemini (`@google/genai`)**
- **Lucide Icons**
- **Canvas-Confetti**

---

## 📦 Como Rodar Localmente

1. Clone o repositório ou navegue até a pasta:
   ```bash
   cd "Kit Afiliado"
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure a variável de ambiente:
   Crie um arquivo `.env.local` na raiz com sua chave do Google Gemini (obtenha gratuitamente no [Google AI Studio](https://aistudio.google.com/)):
   ```env
   GEMINI_API_KEY=sua_chave_aqui
   ```

4. Execute o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

5. Abra [http://localhost:3000](http://localhost:3000) no navegador (ou acesse pelo IP do computador no celular para testar a experiência PWA nativa).

---

## ☁️ Deploy na Vercel

1. Suba o projeto para o GitHub.
2. Importe o repositório na [Vercel](https://vercel.com).
3. Em **Environment Variables**, adicione:
   - `GEMINI_API_KEY`: sua chave da API do Gemini.
4. Clique em **Deploy**.
