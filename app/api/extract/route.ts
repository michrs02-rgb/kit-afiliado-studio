import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

function cleanTitle(rawTitle: string): string {
  if (!rawTitle) return "";
  let title = rawTitle
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\|\s*Shopee\s*(Brasil|BR)?/gi, "")
    .replace(/-\s*Shopee\s*(Brasil|BR)?/gi, "")
    .replace(/Shopee\s*Brasil\s*:?/gi, "")
    .trim();
  title = title.replace(/[-|•·]\s*$/, "").trim();
  return title;
}

// Extrai o nome do produto diretamente da URL (entre shopee.com.br/ e -i.)
function extractTitleFromUrl(urlStr: string): string {
  try {
    const parsed = new URL(urlStr);

    // 1. Caso haja redirecionamento universal link com parâmetro de rota ou redir
    const redirParam =
      parsed.searchParams.get("redir") ||
      parsed.searchParams.get("target") ||
      parsed.searchParams.get("url");
    if (redirParam && redirParam.includes("-i.")) {
      const nestedTitle = extractTitleFromUrl(
        redirParam.startsWith("http") ? redirParam : `https://shopee.com.br${redirParam}`
      );
      if (nestedTitle) return nestedTitle;
    }

    const pathname = parsed.pathname;

    // 2. Formato clássico Shopee: /Nome-Do-Produto-i.12345.67890
    const dashMatch = pathname.match(/\/([^\/\?#]+)-i\.\d+/i);
    if (dashMatch && dashMatch[1]) {
      const rawSlug = dashMatch[1];
      const decoded = decodeURIComponent(rawSlug).replace(/[-_]+/g, " ").trim();
      if (decoded) return cleanTitle(decoded);
    }

    // 3. Formato alternativo com partes no pathname
    const parts = pathname.split("/").filter(Boolean);
    for (const part of parts) {
      if (part.includes("-i.")) {
        const slug = part.split("-i.")[0];
        const decoded = decodeURIComponent(slug).replace(/[-_]+/g, " ").trim();
        if (decoded) return cleanTitle(decoded);
      }
    }

    // 4. Se a última parte contiver texto legível
    const lastPart = parts[parts.length - 1];
    if (lastPart && !/^\d+$/.test(lastPart) && lastPart.length > 3) {
      const decoded = decodeURIComponent(lastPart).replace(/[-_]+/g, " ").trim();
      return cleanTitle(decoded);
    }
  } catch {
    // ignore
  }
  return "";
}

function extractMeta(html: string, property: string): string | null {
  const propertyRegex = new RegExp(
    `<meta[^>]+(?:property|name)=["'](?:og:|twitter:)?${property}["'][^>]+content=["']([^"']+)["']`,
    "i"
  );
  const match = html.match(propertyRegex);
  if (match && match[1]) return match[1];

  const contentFirstRegex = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["'](?:og:|twitter:)?${property}["']`,
    "i"
  );
  const match2 = html.match(contentFirstRegex);
  if (match2 && match2[1]) return match2[1];

  return null;
}

function extractJsonLd(html: string): { name?: string; image?: string } {
  try {
    const jsonLdMatches = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi);
    if (!jsonLdMatches) return {};

    for (const match of jsonLdMatches) {
      const content = match
        .replace(/<script type="application\/ld\+json">/i, "")
        .replace(/<\/script>/i, "")
        .trim();
      const parsed = JSON.parse(content);
      if (parsed["@type"] === "Product" || parsed.name) {
        let image = "";
        if (typeof parsed.image === "string") {
          image = parsed.image;
        } else if (Array.isArray(parsed.image) && parsed.image[0]) {
          image = typeof parsed.image[0] === "string" ? parsed.image[0] : parsed.image[0].url || "";
        }
        return {
          name: parsed.name,
          image,
        };
      }
    }
  } catch {
    // ignore
  }
  return {};
}

function extractRedirectFromHtml(html: string, baseUrl: string): string | null {
  // 1. Meta refresh: <meta http-equiv="refresh" content="0;url=https://...">
  const metaRefresh = html.match(/<meta[^>]*http-equiv=["']?refresh["']?[^>]*content=["']?[^"'>]*url=([^"'>\s]+)/i);
  if (metaRefresh && metaRefresh[1]) {
    try {
      return new URL(metaRefresh[1].replace(/['"]/g, ""), baseUrl).href;
    } catch {
      // ignore
    }
  }

  // 2. window.location ou location.replace ou location.href
  const jsLoc = html.match(/(?:window\.)?location(?:\.href|\.replace)?\s*(?:=|\()\s*["']([^"']+)["']/i);
  if (jsLoc && jsLoc[1]) {
    try {
      return new URL(jsLoc[1], baseUrl).href;
    } catch {
      // ignore
    }
  }

  // 3. Link de produto da Shopee dentro de scripts ou universal link
  const shopeeProductMatch = html.match(/https?:\/\/(?:www\.)?shopee\.com\.br\/[^\s"'<>\\]+-i\.\d+\.\d+[^\s"'<>\\]*/i);
  if (shopeeProductMatch && shopeeProductMatch[0]) {
    return shopeeProductMatch[0];
  }

  return null;
}

export async function POST(req: NextRequest) {
  // AbortController global de 4.8 segundos para NUNCA travar a requisição
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4800);

  let currentUrl = "";

  try {
    const body = await req.json().catch(() => ({}));
    currentUrl = (body.url || "").trim();

    if (!currentUrl) {
      clearTimeout(timeoutId);
      return NextResponse.json(
        { success: false, error: "URL não informada. Cole um link da Shopee." },
        { status: 400 }
      );
    }

    if (!currentUrl.startsWith("http://") && !currentUrl.startsWith("https://")) {
      currentUrl = "https://" + currentUrl;
    }

    const headers = {
      "User-Agent": USER_AGENT,
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    };

    let hops = 0;
    const MAX_HOPS = 6;
    let lastHtml = "";
    let isBlocked = false;

    // Loop de redirecionamento manual (até 6 saltos)
    while (hops < MAX_HOPS) {
      hops++;

      let response: Response;
      try {
        response = await fetch(currentUrl, {
          method: "GET",
          redirect: "manual",
          headers,
          signal: controller.signal,
          cache: "no-store",
        });
      } catch (fetchErr: unknown) {
        // Se abortou por timeout ou erro de rede, interrompe o loop
        break;
      }

      // Tratamento de Códigos de Redirecionamento HTTP (301, 302, 303, 307, 308)
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const locationHeader = response.headers.get("location");
        if (locationHeader) {
          try {
            currentUrl = new URL(locationHeader, currentUrl).href;
          } catch {
            currentUrl = locationHeader;
          }

          // Se a nova URL já for um produto final da Shopee (-i.), podemos continuar para carregar a página
          continue;
        }
      }

      // Bloqueio por Captcha / 403 / 429
      if (response.status === 403 || response.status === 429) {
        isBlocked = true;
        break;
      }

      // Se respondeu 200 OK
      if (response.status === 200) {
        lastHtml = await response.text();

        // Verifica se a página contém captcha ou tela de verificação
        if (
          lastHtml.includes("robot") ||
          lastHtml.includes("captcha") ||
          lastHtml.includes("security check") ||
          lastHtml.includes("recaptcha")
        ) {
          isBlocked = true;
        }

        // Verifica se o HTML contém redirecionamento (meta refresh, window.location ou universal link)
        const nextUrl = extractRedirectFromHtml(lastHtml, currentUrl);
        if (nextUrl && nextUrl !== currentUrl) {
          currentUrl = nextUrl;
          // Se encontrou um link de produto no HTML e já é a URL final, tenta mais 1 fetch dela se hops < MAX_HOPS
          continue;
        }

        // Se é 200 OK e não tem redirecionamento no HTML, chegamos ao destino final
        break;
      }

      // Outro status HTTP
      break;
    }

    clearTimeout(timeoutId);

    // 1. Extrai o nome do produto da URL final (slug antes de -i.)
    const titleFromUrl = extractTitleFromUrl(currentUrl);

    // 2. Extrai dados do HTML se disponível
    let titleFromHtml = "";
    let imageUrl: string | null = null;

    if (lastHtml && !isBlocked) {
      const jsonLd = extractJsonLd(lastHtml);
      const ogTitle = extractMeta(lastHtml, "title");
      const ogImage = extractMeta(lastHtml, "image");

      let pageTitle = "";
      const titleTagMatch = lastHtml.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (titleTagMatch && titleTagMatch[1]) {
        pageTitle = titleTagMatch[1].trim();
      }

      const bestHtmlTitle = jsonLd.name || ogTitle || pageTitle;
      if (bestHtmlTitle) {
        titleFromHtml = cleanTitle(bestHtmlTitle);
      }

      imageUrl = jsonLd.image || ogImage || null;

      // Se imagem não estiver em meta tags, busca imagem na CDN da Shopee dentro do HTML
      if (!imageUrl) {
        const cdnMatch = lastHtml.match(
          /https?:\/\/(?:down-br\.img\.susercontent\.com|cf\.shopee\.com\.br|down-cvs-br\.img\.susercontent\.com)\/file\/([a-zA-Z0-9_\-]+)/i
        );
        if (cdnMatch && cdnMatch[0]) {
          imageUrl = cdnMatch[0];
        }
      }
    }

    // Prioridade de título: Título limpo da URL ou Título do HTML
    const finalTitle = titleFromUrl || titleFromHtml || "Produto Shopee";

    // Se houve bloqueio ou não encontrou foto, retorna com fallbackMode: true imediatamente
    if (isBlocked || !imageUrl) {
      return NextResponse.json({
        success: true,
        title: finalTitle,
        image: imageUrl || null,
        imageUrl: imageUrl || null,
        resolvedUrl: currentUrl,
        fallbackMode: true,
      });
    }

    return NextResponse.json({
      success: true,
      title: finalTitle,
      image: imageUrl,
      imageUrl: imageUrl,
      resolvedUrl: currentUrl,
      fallbackMode: false,
    });
  } catch (error: unknown) {
    clearTimeout(timeoutId);

    // Em caso de erro ou abort timeout, tenta extrair o que for possível da URL
    const titleFromUrl = currentUrl ? extractTitleFromUrl(currentUrl) : "";
    return NextResponse.json({
      success: true,
      title: titleFromUrl || "Produto Shopee",
      image: null,
      imageUrl: null,
      resolvedUrl: currentUrl,
      fallbackMode: true,
    });
  }
}
