import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  ArrowUp,
  Paperclip,
  Sparkles,
  Truck,
  CheckCircle2,
  Loader2,
  CalendarClock,
  AlertTriangle,
} from "lucide-react";

const suggestions = [
  "Luz da injeção acesa",
  "Carro não liga",
  "Superaquecimento",
  "Ruído estranho no freio",
];

const VEHICLE = "Ford Ranger XLT 2023, placa RGR-4C21";

type Message = { role: "user" | "assistant"; content: string };
type TowState = "idle" | "sending" | "sent";
type ScheduleState = "idle" | "sending" | "sent";

export function AssistantTab() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tow, setTow] = useState<TowState>("idle");
  const [schedule, setSchedule] = useState<ScheduleState>("idle");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, streaming]);

  async function run(text: string) {
    const content = text.trim();
    if (!content || streaming) return;

    const history: Message[] = [...messages, { role: "user", content }];
    setMessages([...history, { role: "assistant", content: "" }]);
    setInput("");
    setError(null);
    setStreaming(true);

    try {
      const res = await fetch("/api/public/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: history, vehicle: VEHICLE }),
      });

      if (!res.ok || !res.body) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Não foi possível obter a resposta da IA.");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let answer = "";

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data:")) continue;
          const payload = line.slice(5).trim();
          if (!payload || payload === "[DONE]") continue;
          try {
            const json = JSON.parse(payload);
            const delta: string = json.choices?.[0]?.delta?.content ?? "";
            if (delta) {
              answer += delta;
              setMessages((prev) => {
                const next = [...prev];
                next[next.length - 1] = { role: "assistant", content: answer };
                return next;
              });
            }
          } catch {
            /* fragmento incompleto */
          }
        }
      }

      if (!answer) {
        setMessages((prev) => {
          const next = [...prev];
          next[next.length - 1] = {
            role: "assistant",
            content:
              "Não consegui gerar uma análise agora. Descreva o sintoma com mais detalhes ou acione a assistência abaixo.",
          };
          return next;
        });
      }
    } catch (e) {
      setMessages((prev) => prev.slice(0, -1));
      setError(e instanceof Error ? e.message : "Falha na conexão com a IA.");
    } finally {
      setStreaming(false);
    }
  }

  function requestTow() {
    setTow("sending");
    window.setTimeout(() => setTow("sent"), 1400);
  }

  function requestSchedule() {
    setSchedule("sending");
    window.setTimeout(() => setSchedule("sent"), 1200);
  }

  const started = messages.length > 0;
  const lastIsAssistant = messages[messages.length - 1]?.role === "assistant";

  return (
    <div className="mx-auto w-full max-w-3xl px-5 pb-28 pt-10 sm:pt-16">
      <div className="text-center animate-rise">
        <div className="mx-auto mb-5 flex h-11 w-11 items-center justify-center rounded-2xl ford-gradient glow">
          <Sparkles className="h-5 w-5 text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-semibold sm:text-4xl">Bem-vindo, Vitor</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Assistente de emergência e diagnóstico do seu Ford, em tempo real.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void run(input);
        }}
        className="mt-8 rounded-3xl surface p-4 transition-shadow focus-within:glow"
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void run(input);
            }
          }}
          rows={2}
          placeholder="Como posso ajudar com o seu Ford hoje? Ou descreva/anexe o alerta do painel..."
          className="w-full resize-none bg-transparent text-[15px] leading-relaxed text-foreground outline-none placeholder:text-muted-foreground"
        />
        <div className="mt-3 flex items-center justify-between">
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Anexar foto do painel"
          >
            <Paperclip className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">Gemini · Diagnóstico</span>
            <button
              type="submit"
              className="flex h-9 w-9 items-center justify-center rounded-full ford-gradient text-primary-foreground transition-transform hover:scale-105 disabled:opacity-40"
              disabled={!input.trim() || streaming}
              aria-label="Enviar"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          </div>
        </div>
      </form>

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => void run(s)}
            disabled={streaming}
            className="rounded-full border border-border bg-card/60 px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground disabled:opacity-50"
          >
            {s}
          </button>
        ))}
      </div>

      <div className="mt-10 space-y-4">
        {messages.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="flex justify-end animate-rise">
              <p className="max-w-[85%] rounded-2xl rounded-br-md bg-secondary px-4 py-3 text-sm">
                {m.content}
              </p>
            </div>
          ) : (
            <article key={i} className="rounded-3xl surface p-6 animate-rise">
              {m.content ? (
                <div className="space-y-3 text-sm leading-relaxed text-muted-foreground [&_h1]:text-lg [&_h1]:font-semibold [&_h1]:text-foreground [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-foreground [&_h3]:font-semibold [&_h3]:text-foreground [&_li]:ml-4 [&_li]:list-disc [&_ol_li]:list-decimal [&_strong]:text-foreground">
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                  {streaming && i === messages.length - 1 && (
                    <span className="inline-block h-4 w-[2px] animate-pulse bg-primary align-middle" />
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analisando sinais do veículo...
                </div>
              )}
            </article>
          ),
        )}
      </div>

      {error && (
        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm animate-rise">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <span>{error}</span>
        </div>
      )}

      {started && lastIsAssistant && !streaming && (
        <div className="mt-4 space-y-4">
          <div className="rounded-3xl surface p-6 animate-rise">
            {tow === "sent" ? (
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success/20">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="font-semibold">Assistência Ford a caminho</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Chamado #FRD-48213 confirmado na central. Chegada estimada em 32 minutos —
                    acompanhe pelo SMS enviado ao seu celular.
                  </p>
                </div>
              </div>
            ) : (
              <button
                onClick={requestTow}
                disabled={tow === "sending"}
                className={`flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.01] ${
                  tow === "sending" ? "bg-primary/70" : "ford-gradient glow pulse-ring"
                }`}
              >
                {tow === "sending" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Truck className="h-4 w-4" />
                )}
                {tow === "sending"
                  ? "Enviando localização para a central..."
                  : "Solicitar Guincho Ford / Assistência 24h"}
              </button>
            )}
          </div>

          <div className="rounded-3xl surface p-6 animate-rise">
            {schedule === "sent" ? (
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success/20">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="font-semibold">Diagnóstico agendado</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Resumo da conversa enviado à concessionária para adiantar orçamento e peças.
                    Você receberá a confirmação do horário por SMS.
                  </p>
                </div>
              </div>
            ) : (
              <button
                onClick={requestSchedule}
                disabled={schedule === "sending"}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border px-5 py-4 text-sm font-semibold transition-colors hover:bg-secondary"
              >
                {schedule === "sending" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CalendarClock className="h-4 w-4" />
                )}
                {schedule === "sending"
                  ? "Enviando pedido de agendamento..."
                  : "Agendar Diagnóstico na Concessionária"}
              </button>
            )}
          </div>

          <p className="text-center text-xs text-muted-foreground">
            As orientações do Ford Copilot AI são preliminares. Confirme sempre com uma oficina
            autorizada Ford.
          </p>
        </div>
      )}

      <div ref={endRef} />
    </div>
  );
}
