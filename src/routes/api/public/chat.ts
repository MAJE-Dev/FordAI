import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { offlineDiagnosis } from "@/lib/offline-diagnosis";

const MAX_IMAGE_CHARS = 4_000_000;

const BodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(4000),
        // Foto do painel/veículo (data URL jpeg/png/webp), só aceita em mensagens do usuário.
        image: z
          .string()
          .max(MAX_IMAGE_CHARS)
          .regex(/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/)
          .optional(),
      }),
    )
    .min(1)
    .max(40),
  vehicle: z.string().max(120).optional(),
});

const SYSTEM_PROMPT = `Você é o "Ford Copilot AI", consultor técnico automotivo especializado em veículos Ford.

Idioma: sempre português do Brasil. Tom profissional, prestativo e acolhedor. Se o motorista relatar um alerta de painel assustador, comece tranquilizando-o em uma frase curta.

Ao receber um sintoma, analise-o junto ao contexto do veículo informado e responda em markdown, nesta estrutura:
1. **Situação** — o que provavelmente está acontecendo, em linguagem simples.
2. **Possíveis causas** — lista de 2 a 4 causas prováveis, com os códigos/sistemas envolvidos quando fizer sentido.
3. **Nível de risco** — Crítico, Atenção ou Baixo risco, com uma frase de justificativa.
4. **Pode continuar rodando?** — resposta direta (sim/não) e por quanto tempo ou até onde.
5. **O que fazer agora** — passos práticos e seguros.

Regras de segurança: nunca dê um diagnóstico definitivo nem oriente reparos que possam comprometer a segurança; sempre recomende a verificação profissional em uma oficina autorizada Ford. Em caso de fumaça, cheiro de combustível, superaquecimento, falha de freio ou direção, oriente parar o veículo em local seguro.

Encerre SEMPRE a resposta com a linha exata:
Use os botões abaixo para **Solicitar Guincho Ford / Assistência 24h** ou **Agendar Diagnóstico na Concessionária**.

Se o motorista enviar uma foto, descreva o que vê (luzes do painel, cor e símbolo, componentes visíveis) antes de analisar; se a imagem não for legível ou não for de um veículo, peça outra foto.

Seja objetivo: no máximo ~250 palavras.`;

type ChatMessage = z.infer<typeof BodySchema>["messages"][number];

const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });

// Converte a mensagem para o formato OpenAI; fotos só vão na última mensagem do usuário
// para não reenviar megabytes a cada turno.
function toUpstream(messages: ChatMessage[]) {
  return messages.map((m, i) => {
    const isLast = i === messages.length - 1;
    if (m.role === "user" && m.image && isLast) {
      return {
        role: "user",
        content: [
          { type: "text", text: m.content },
          { type: "image_url", image_url: { url: m.image } },
        ],
      };
    }
    return { role: m.role, content: m.content };
  });
}

type Provider = { url: string; headers: Record<string, string>; model: string };

// GEMINI_API_KEY (Google AI Studio) funciona em qualquer host, ex.: Vercel.
// LOVABLE_API_KEY é usada quando o app roda no Lovable.
function pickProvider(): Provider | null {
  const gemini = process.env["GEMINI_API_KEY"] ?? process.env["GOOGLE_API_KEY"];
  if (gemini) {
    return {
      url: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
      headers: { authorization: `Bearer ${gemini}` },
      model: process.env["GEMINI_MODEL"] ?? "gemini-2.5-flash",
    };
  }
  const lovable = process.env["LOVABLE_API_KEY"];
  if (lovable) {
    return {
      url: "https://ai.gateway.lovable.dev/v1/chat/completions",
      headers: {
        authorization: `Bearer ${lovable}`,
        "Lovable-API-Key": lovable,
        "X-Lovable-AIG-SDK": "fetch",
      },
      model: "google/gemini-3.8-flash",
    };
  }
  return null;
}

// Emite a resposta de contingência no mesmo formato SSE do provedor, para o cliente não mudar.
function offlineStream(text: string) {
  const encoder = new TextEncoder();
  const chunks = text.match(/[\s\S]{1,24}/g) ?? [];
  let i = 0;
  const body = new ReadableStream<Uint8Array>({
    async pull(controller) {
      if (i >= chunks.length) {
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
        return;
      }
      const delta = { choices: [{ delta: { content: chunks[i++] } }] };
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(delta)}\n\n`));
      await new Promise((r) => setTimeout(r, 15));
    },
  });
  return new Response(body, {
    headers: { "content-type": "text/event-stream", "cache-control": "no-cache" },
  });
}

export const Route = createFileRoute("/api/public/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let parsed;
        try {
          parsed = BodySchema.parse(await request.json());
        } catch {
          return json({ error: "Requisição inválida." }, 400);
        }

        const last = parsed.messages[parsed.messages.length - 1];
        const lastUser = [...parsed.messages].reverse().find((m) => m.role === "user");
        const fallback = () =>
          offlineStream(offlineDiagnosis(lastUser?.content ?? "", Boolean(last?.image)));

        const provider = pickProvider();
        if (!provider) return fallback();

        const vehicle = parsed.vehicle ?? "Ford Ranger XLT 2023, placa RGR-4C21";

        let res: Response;
        try {
          res = await fetch(provider.url, {
            method: "POST",
            headers: { "content-type": "application/json", ...provider.headers },
            body: JSON.stringify({
              model: provider.model,
              stream: true,
              messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "system", content: `Veículo do motorista: ${vehicle}.` },
                ...toUpstream(parsed.messages),
              ],
            }),
          });
        } catch {
          return fallback();
        }

        if (!res.ok || !res.body) {
          if (res.status === 429) {
            return json(
              { error: "Muitas solicitações agora. Tente novamente em alguns segundos." },
              429,
            );
          }
          // 402 (sem créditos), chave inválida, modelo indisponível etc.: não deixa o motorista sem resposta.
          console.error(
            "[chat] upstream error",
            res.status,
            (await res.text().catch(() => "")).slice(0, 300),
          );
          return fallback();
        }

        return new Response(res.body, {
          headers: {
            "content-type": "text/event-stream",
            "cache-control": "no-cache",
            connection: "keep-alive",
          },
        });
      },
    },
  },
});
