import { useState } from "react";
import {
  ArrowUp,
  Paperclip,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  Truck,
  CheckCircle2,
  Loader2,
  ClipboardCheck,
  Copy,
} from "lucide-react";
import { diagnose, severityLabel, type Diagnosis } from "@/lib/diagnostics";

const suggestions = [
  "Luz da injeção acesa",
  "Carro não liga",
  "Superaquecimento",
  "Ruído estranho no freio",
];

type TowState = "idle" | "sending" | "sent";

export function AssistantTab() {
  const [input, setInput] = useState("");
  const [question, setQuestion] = useState<string | null>(null);
  const [thinking, setThinking] = useState(false);
  const [result, setResult] = useState<Diagnosis | null>(null);
  const [tow, setTow] = useState<TowState>("idle");
  const [copied, setCopied] = useState(false);

  function run(text: string) {
    if (!text.trim()) return;
    setQuestion(text);
    setInput("");
    setResult(null);
    setTow("idle");
    setThinking(true);
    window.setTimeout(() => {
      setResult(diagnose(text));
      setThinking(false);
    }, 900);
  }

  function requestTow() {
    setTow("sending");
    window.setTimeout(() => setTow("sent"), 1400);
  }

  function copyReport() {
    if (!result) return;
    const text = [
      `Resumo técnico Ford Copilot AI — ${result.titulo}`,
      ...result.tecnico.map((t) => `${t.rotulo}: ${t.valor}`),
    ].join("\n");
    navigator.clipboard?.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

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
          run(input);
        }}
        className="mt-8 rounded-3xl surface p-4 transition-shadow focus-within:glow"
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              run(input);
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
              disabled={!input.trim()}
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
            onClick={() => run(s)}
            className="rounded-full border border-border bg-card/60 px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
          >
            {s}
          </button>
        ))}
      </div>

      {question && (
        <div className="mt-10 flex justify-end animate-rise">
          <p className="max-w-[85%] rounded-2xl rounded-br-md bg-secondary px-4 py-3 text-sm">
            {question}
          </p>
        </div>
      )}

      {thinking && (
        <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground animate-rise">
          <Loader2 className="h-4 w-4 animate-spin" />
          Analisando sinais do veículo...
        </div>
      )}

      {result && (
        <div className="mt-6 space-y-4">
          <article className="rounded-3xl surface p-6 animate-rise">
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                  result.seguro
                    ? "bg-warning/15 text-warning"
                    : "bg-destructive/15 text-destructive"
                }`}
              >
                {result.seguro ? (
                  <ShieldCheck className="h-3.5 w-3.5" />
                ) : (
                  <ShieldAlert className="h-3.5 w-3.5" />
                )}
                {severityLabel[result.severidade]}
              </span>
            </div>
            <h2 className="mt-4 text-xl font-semibold">{result.titulo}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{result.resumo}</p>

            <div
              className={`mt-5 rounded-2xl border p-4 text-sm ${
                result.seguro
                  ? "border-success/30 bg-success/10 text-foreground"
                  : "border-destructive/30 bg-destructive/10 text-foreground"
              }`}
            >
              <p className="font-semibold">
                {result.seguro ? "Pode continuar rodando" : "Pare o veículo"}
              </p>
              <p className="mt-1 text-muted-foreground">{result.podeRodar}</p>
            </div>

            <ul className="mt-5 space-y-2">
              {result.passos.map((p) => (
                <li key={p} className="flex gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {p}
                </li>
              ))}
            </ul>
          </article>

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
            <div className="flex items-center justify-between gap-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <ClipboardCheck className="h-4 w-4 text-primary" />
                Resumo técnico para a concessionária
              </h3>
              <button
                onClick={copyReport}
                className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                <Copy className="h-3.5 w-3.5" />
                {copied ? "Copiado" : "Copiar"}
              </button>
            </div>
            <dl className="mt-4 divide-y divide-border">
              {result.tecnico.map((t) => (
                <div key={t.rotulo} className="flex justify-between gap-6 py-3 text-sm">
                  <dt className="text-muted-foreground">{t.rotulo}</dt>
                  <dd className="text-right font-medium">{t.valor}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-xs text-muted-foreground">
              Enviado automaticamente à concessionária escolhida para adiantar orçamento e peças.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
