export type Severity = "critica" | "atencao" | "leve";

export type Diagnosis = {
  titulo: string;
  severidade: Severity;
  resumo: string;
  podeRodar: string;
  seguro: boolean;
  passos: string[];
  tecnico: { rotulo: string; valor: string }[];
};

const base: Record<string, Diagnosis> = {
  injecao: {
    titulo: "Luz da injeção eletrônica acesa",
    severidade: "atencao",
    resumo:
      "A central identificou uma falha de combustão intermitente no cilindro 3, normalmente ligada a velas ou bobina desgastadas. Não é um risco imediato, mas o consumo aumenta e o catalisador pode ser danificado se você rodar assim por muitos dias.",
    podeRodar:
      "Pode seguir dirigindo com moderação até 200 km, evitando acelerações fortes. Agende a revisão nos próximos 3 dias.",
    seguro: true,
    passos: [
      "Evite arrancadas bruscas e mantenha giro abaixo de 3.000 rpm",
      "Se a luz começar a piscar, pare em local seguro imediatamente",
      "Abasteça em posto de confiança na próxima parada",
    ],
    tecnico: [
      { rotulo: "Código provável", valor: "P0303 — Falha de ignição cilindro 3" },
      { rotulo: "Sistema", valor: "Powertrain / Ignição" },
      { rotulo: "Peças sugeridas", valor: "Kit de velas iridium, bobina individual" },
      { rotulo: "Tempo estimado de serviço", valor: "1h30" },
      { rotulo: "Faixa de orçamento", valor: "R$ 680 – R$ 940" },
    ],
  },
  naoLiga: {
    titulo: "Veículo não dá partida",
    severidade: "critica",
    resumo:
      "O padrão descrito (painel acende, motor não gira) aponta para bateria com carga abaixo de 11,4 V ou falha no motor de partida. O veículo está imobilizado.",
    podeRodar: "Não é possível seguir viagem. Assistência 24h recomendada agora.",
    seguro: false,
    passos: [
      "Desligue ar-condicionado, faróis e som antes de nova tentativa",
      "Tente a partida uma única vez por 5 segundos",
      "Permaneça dentro do veículo se estiver em via movimentada",
    ],
    tecnico: [
      { rotulo: "Código provável", valor: "B1318 — Tensão de bateria baixa" },
      { rotulo: "Sistema", valor: "Elétrica / Partida" },
      { rotulo: "Peças sugeridas", valor: "Bateria 60Ah, teste de alternador" },
      { rotulo: "Tempo estimado de serviço", valor: "45 min" },
      { rotulo: "Faixa de orçamento", valor: "R$ 520 – R$ 1.180" },
    ],
  },
  superaquecimento: {
    titulo: "Temperatura do motor elevada",
    severidade: "critica",
    resumo:
      "Temperatura acima da faixa segura indica perda de líquido de arrefecimento ou falha na eletroventoinha. Continuar rodando pode empenar o cabeçote.",
    podeRodar: "Pare imediatamente em local seguro e desligue o motor.",
    seguro: false,
    passos: [
      "Encoste com segurança e acione o pisca-alerta",
      "Não abra o reservatório quente — risco de queimadura",
      "Aguarde 20 minutos antes de qualquer verificação",
    ],
    tecnico: [
      { rotulo: "Código provável", valor: "P0217 — Superaquecimento do motor" },
      { rotulo: "Sistema", valor: "Arrefecimento" },
      { rotulo: "Peças sugeridas", valor: "Válvula termostática, sensor de temperatura, fluido" },
      { rotulo: "Tempo estimado de serviço", valor: "2h30" },
      { rotulo: "Faixa de orçamento", valor: "R$ 890 – R$ 1.640" },
    ],
  },
  freio: {
    titulo: "Ruído anormal no sistema de freios",
    severidade: "atencao",
    resumo:
      "Chiado metálico ao frear geralmente indica pastilhas próximas do limite de desgaste. A frenagem ainda responde, mas a distância de parada aumenta.",
    podeRodar: "Pode rodar com atenção redobrada, mantendo distância maior do carro à frente.",
    seguro: true,
    passos: [
      "Evite frenagens bruscas e descidas longas",
      "Verifique o nível do fluido de freio",
      "Agende a troca em até 7 dias",
    ],
    tecnico: [
      { rotulo: "Código provável", valor: "Desgaste mecânico — sem DTC" },
      { rotulo: "Sistema", valor: "Freios dianteiros" },
      { rotulo: "Peças sugeridas", valor: "Jogo de pastilhas dianteiras, retífica de discos" },
      { rotulo: "Tempo estimado de serviço", valor: "1h" },
      { rotulo: "Faixa de orçamento", valor: "R$ 610 – R$ 980" },
    ],
  },
  generico: {
    titulo: "Análise do relato do motorista",
    severidade: "leve",
    resumo:
      "Com base na sua descrição, não há sinal de falha crítica ativa. A central sugere uma checagem eletrônica completa na próxima visita para confirmar o comportamento relatado.",
    podeRodar: "Seguro para dirigir normalmente. Monitore se o sintoma se repetir.",
    seguro: true,
    passos: [
      "Anote quando o sintoma acontece (frio, quente, em movimento)",
      "Grave um áudio do ruído se possível",
      "Leve o resumo abaixo à concessionária",
    ],
    tecnico: [
      { rotulo: "Código provável", valor: "Nenhum DTC ativo" },
      { rotulo: "Sistema", valor: "Diagnóstico geral" },
      { rotulo: "Peças sugeridas", valor: "A definir após scanner Ford IDS" },
      { rotulo: "Tempo estimado de serviço", valor: "40 min" },
      { rotulo: "Faixa de orçamento", valor: "R$ 0 – R$ 220 (diagnóstico)" },
    ],
  },
};

export function diagnose(input: string): Diagnosis {
  const t = input.toLowerCase();
  if (/(não liga|nao liga|não pega|nao pega|partida|bateria)/.test(t)) return base.naoLiga;
  if (/(superaquec|temperatura|fervendo|fumaça|fumaca)/.test(t)) return base.superaquecimento;
  if (/(freio|pastilha|chiado|rangendo)/.test(t)) return base.freio;
  if (/(injeç|injec|motor|luz|check engine|painel)/.test(t)) return base.injecao;
  return base.generico;
}

export const severityLabel: Record<Severity, string> = {
  critica: "Crítico — parada imediata",
  atencao: "Atenção — reparo programado",
  leve: "Baixo risco",
};
