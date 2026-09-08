import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MessageSquareWarning, History } from "lucide-react";
import { AssistantTab } from "@/components/copilot/AssistantTab";
import { HistoryTab } from "@/components/copilot/HistoryTab";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ford Copilot AI — Diagnóstico e Assistência 24h" },
      {
        name: "description",
        content:
          "Assistente Ford com diagnóstico inteligente do painel, guincho 24h e histórico de manutenções com descontos do Ford Club.",
      },
      { property: "og:title", content: "Ford Copilot AI — Diagnóstico e Assistência 24h" },
      {
        property: "og:description",
        content:
          "Diagnóstico instantâneo do painel, assistência 24h e histórico validado pela rede Ford com vantagens progressivas.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const tabs = [
  { id: "assistente", label: "Assistente IA", icon: MessageSquareWarning },
  { id: "historico", label: "Histórico & Club", icon: History },
] as const;

function Index() {
  const [tab, setTab] = useState<"assistente" | "historico">("assistente");

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-5 py-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-14 items-center justify-center rounded-full ford-gradient text-[11px] font-semibold italic tracking-wide text-primary-foreground">
              Ford
            </span>
            <span className="text-sm font-semibold">Copilot AI</span>
          </div>
          <span className="text-xs text-muted-foreground">Ranger XLT · RGR-4C21</span>
        </div>
      </header>

      <main>{tab === "assistente" ? <AssistantTab /> : <HistoryTab />}</main>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-3xl gap-2 px-5 py-3">
          {tabs.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${
                  active
                    ? "ford-gradient text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary"
                }`}
              >
                <t.icon className="h-4 w-4" />
                {t.label}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
