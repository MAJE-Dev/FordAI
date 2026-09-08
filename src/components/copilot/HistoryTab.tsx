import { useState } from "react";
import {
  BadgeCheck,
  CalendarCheck,
  Gauge,
  Loader2,
  MapPin,
  Percent,
  ShieldCheck,
  TrendingUp,
  Wrench,
} from "lucide-react";
import ranger from "@/assets/ranger.jpg";

const health = [
  { peca: "Freios dianteiros", valor: 46, nota: "Troca prevista em ~4.200 km" },
  { peca: "Bateria", valor: 78, nota: "Tensão estável em 12,6 V" },
  { peca: "Óleo e filtros", valor: 88, nota: "Próxima troca em 6.900 km" },
  { peca: "Pneus", valor: 61, nota: "Rodízio recomendado na próxima revisão" },
];

const historico = [
  {
    data: "12 mar 2026",
    titulo: "Revisão de 40.000 km",
    local: "Ford Vitória Motors — São Paulo/SP",
    detalhe: "Troca de óleo sintético, filtros de ar e cabine, alinhamento e balanceamento.",
    ia: "Padrão de desgaste dentro do esperado para uso urbano.",
  },
  {
    data: "28 out 2025",
    titulo: "Substituição de pastilhas traseiras",
    local: "Ford Sul Brasil — Curitiba/PR",
    detalhe: "Pastilhas originais Motorcraft e retífica dos discos traseiros.",
    ia: "Frenagens intensas detectadas; sugerida condução preventiva.",
  },
  {
    data: "05 abr 2025",
    titulo: "Revisão de 30.000 km",
    local: "Ford Vitória Motors — São Paulo/SP",
    detalhe: "Inspeção de suspensão, arrefecimento e atualização de software da central.",
    ia: "Nenhuma anomalia registrada nos módulos eletrônicos.",
  },
];

export function HistoryTab() {
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5 px-5 pb-28 pt-8">
      <section className="overflow-hidden rounded-3xl surface animate-rise">
        <img
          src={ranger}
          alt="Ford Ranger cadastrada no Ford Copilot AI"
          width={1280}
          height={720}
          loading="lazy"
          className="h-44 w-full object-cover sm:h-56"
        />
        <div className="p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">Ford Ranger XLT 3.0 V6</h2>
              <p className="mt-1 text-sm text-muted-foreground">Placa RGR-4C21 · 2024 · Diesel</p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-success/15 px-3 py-1 text-xs font-semibold text-success">
              <ShieldCheck className="h-3.5 w-3.5" />
              Histórico validado
            </span>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3">
            {[
              { icon: Gauge, label: "Odômetro", value: "43.180 km" },
              { icon: Wrench, label: "Revisões", value: "6 na rede" },
              { icon: TrendingUp, label: "Saúde geral", value: "82%" },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl bg-secondary/60 p-3">
                <s.icon className="h-4 w-4 text-primary" />
                <p className="mt-2 text-xs text-muted-foreground">{s.label}</p>
                <p className="text-sm font-semibold">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-3xl surface p-6 animate-rise">
        <h3 className="text-sm font-semibold">Análise preditiva das peças</h3>
        <div className="mt-4 space-y-4">
          {health.map((h) => (
            <div key={h.peca}>
              <div className="flex items-baseline justify-between text-sm">
                <span className="font-medium">{h.peca}</span>
                <span className="text-muted-foreground">{h.valor}%</span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    h.valor < 50 ? "bg-warning" : "bg-success"
                  }`}
                  style={{ width: `${h.valor}%` }}
                />
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">{h.nota}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl surface p-6 animate-rise">
        <h3 className="text-sm font-semibold">Histórico de manutenções</h3>
        <ol className="mt-5 space-y-6 border-l border-border pl-6">
          {historico.map((h) => (
            <li key={h.titulo} className="relative">
              <span className="absolute -left-[31px] flex h-5 w-5 items-center justify-center rounded-full ford-gradient">
                <BadgeCheck className="h-3 w-3 text-primary-foreground" />
              </span>
              <p className="text-xs text-muted-foreground">{h.data}</p>
              <p className="mt-1 font-medium">{h.titulo}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{h.local}</p>
              <p className="mt-2 text-sm text-muted-foreground">{h.detalhe}</p>
              <p className="mt-2 rounded-xl bg-secondary/60 px-3 py-2 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Análise IA:</span> {h.ia}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section className="overflow-hidden rounded-3xl reward-gradient p-6 text-accent-foreground animate-rise">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-background/25 px-3 py-1 text-xs font-semibold">
          <Percent className="h-3.5 w-3.5" />
          Ford Club · Nível Prata
        </span>
        <h3 className="mt-4 text-2xl font-semibold">18% de desconto acumulado</h3>
        <p className="mt-2 text-sm opacity-90">
          Mantendo todo o histórico centralizado e autorizado na rede Ford, você sobe de nível e
          ganha descontos progressivos em peças originais e mão de obra. Em troca, a Ford aprende
          com os dados do seu veículo para evoluir motores, componentes e futuras revisões.
        </p>
        <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-background/25">
          <div className="h-full w-[62%] rounded-full bg-background/80" />
        </div>
        <p className="mt-2 text-xs opacity-80">
          Mais 2 revisões na rede para chegar ao nível Ouro (25% de desconto).
        </p>
      </section>

      <button
        onClick={() => {
          setState("loading");
          window.setTimeout(() => setState("done"), 1300);
        }}
        disabled={state !== "idle"}
        className="flex w-full items-center justify-center gap-2 rounded-2xl ford-gradient px-5 py-4 text-sm font-semibold text-primary-foreground glow transition-transform hover:scale-[1.01]"
      >
        {state === "loading" && <Loader2 className="h-4 w-4 animate-spin" />}
        {state === "idle" && <CalendarCheck className="h-4 w-4" />}
        {state === "done" && <MapPin className="h-4 w-4" />}
        {state === "idle" && "Agendar revisão com desconto na concessionária mais próxima"}
        {state === "loading" && "Buscando concessionárias próximas..."}
        {state === "done" && "Agendado · Ford Vitória Motors, 22 set às 09h30"}
      </button>
    </div>
  );
}
