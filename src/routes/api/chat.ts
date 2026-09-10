import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const BodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(4000),
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

Seja objetivo: no máximo ~250 palavras.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) {
          return new Response(JSON.stringify({ error: "Serviço de IA não configurado." }), {
            status: 500,
            headers: { "content-type": "application/json" },
          });
        }

        let parsed;
        try {
          parsed = BodySchema.parse(await request.json());
        } catch {
          return new Response(JSON.stringify({ error: "Requisição inválida." }), {
            status: 400,
            headers: { "content-type": "application/json" },
          });
        }

        const vehicle = parsed.vehicle ?? "Ford Ranger XLT 2023, placa RGR-4C21";

        const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "Lovable-API-Key": apiKey,
            "X-Lovable-AIG-SDK": "fetch",
          },
          body: JSON.stringify({
            model: "google/gemini-3.8-flash",
            stream: true,
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              { role: "system", content: `Veículo do motorista: ${vehicle}.` },
              ...parsed.messages,
            ],
          }),
        });

        if (!res.ok || !res.body) {
          const detail = await res.text().catch(() => "");
          const message =
            res.status === 429
              ? "Muitas solicitações agora. Tente novamente em alguns segundos."
              : res.status === 402
                ? "Os créditos de IA do app acabaram. Adicione créditos para continuar."
                : `Não foi possível falar com a IA (${res.status}). ${detail.slice(0, 200)}`;
          return new Response(JSON.stringify({ error: message }), {
            status: res.status,
            headers: { "content-type": "application/json" },
          });
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
