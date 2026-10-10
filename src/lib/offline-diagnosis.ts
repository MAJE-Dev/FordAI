// Respostas de contingência: usadas quando nenhuma chave de IA está configurada
// ou o provedor de IA está indisponível, para o chat nunca ficar mudo.

const FOOTER =
  "Use os botões abaixo para **Solicitar Guincho Ford / Assistência 24h** ou **Agendar Diagnóstico na Concessionária**.";

type Topic = { match: RegExp; answer: string };

const TOPICS: Topic[] = [
  {
    match:
      /superaquec|temperatura|ferv|ponteiro.*(alto|vermelho)|radiador|arrefecimento|fumaça.*capô/i,
    answer: `Calma, vamos resolver isso com segurança. Superaquecimento exige atenção imediata.

**Situação** — O motor está operando acima da temperatura ideal e pode sofrer danos se continuar rodando.

**Possíveis causas**
- Nível baixo ou vazamento no líquido de arrefecimento
- Válvula termostática travada ou bomba d'água com defeito
- Eletroventilador (ventoinha) ou radiador obstruído/com falha
- Junta do cabeçote comprometida (caso mais grave)

**Nível de risco** — **Crítico**: rodar superaquecido pode empenar o cabeçote e fundir o motor.

**Pode continuar rodando?** — **Não.** Encoste em local seguro e desligue o motor assim que possível.

**O que fazer agora**
1. Pare em local seguro, ligue o pisca-alerta e desligue o motor.
2. **Não abra** a tampa do reservatório com o motor quente — o líquido está pressurizado e pode causar queimaduras.
3. Aguarde ao menos 30 minutos para esfriar.
4. Se o nível estiver baixo, só complete com o líquido indicado no manual; não force a volta ao trânsito.
5. Prefira acionar o guincho a arriscar o motor.`,
  },
  {
    match: /freio|frear|pedal.*(mole|baixo|duro)|rangid|chiad|apito.*roda/i,
    answer: `Ruído no freio nunca deve ser ignorado, mas dá para entender a origem com calma.

**Situação** — O sistema de frenagem está emitindo um som anormal, o que geralmente indica desgaste ou sujeira nos componentes.

**Possíveis causas**
- Pastilhas de freio gastas (o indicador de desgaste "apita")
- Discos de freio desgastados, empenados ou com ranhuras
- Sujeira, umidade ou falta de lubrificação nas pinças
- Fluido de freio baixo ou contaminado

**Nível de risco** — **Atenção**; vira **Crítico** se o pedal estiver mole/baixo ou o carro puxar para um lado ao frear.

**Pode continuar rodando?** — Com ruído leve e freio firme, apenas por curtas distâncias até uma oficina, com velocidade reduzida e distância ampliada do carro da frente. Se o pedal afundar ou a luz de freio acender: **não rode**.

**O que fazer agora**
1. Evite descidas longas e frenagens bruscas.
2. Confira se a luz de freio no painel está acesa.
3. Agende a revisão de pastilhas, discos e fluido o quanto antes.`,
  },
  {
    match:
      /n[ãa]o (liga|pega|d[áa] partida)|n[ãa]o funciona.*motor|estartando|motor de arranque|bateria.*(fraca|arria)|clique|morreu|n[ãa]o ligou/i,
    answer: `Vamos por partes — carro que não liga costuma ter causa simples de identificar.

**Situação** — O motor não está completando a partida. O comportamento ao girar a chave/apertar o botão ajuda a apontar a causa.

**Possíveis causas**
- Bateria descarregada ou terminais oxidados (sintoma: painel fraco, só "cliques")
- Motor de arranque ou relé com falha (sintoma: nenhum som ao dar partida)
- Falta de combustível ou bomba de combustível com defeito (motor gira, mas não pega)
- Chave/transponder não reconhecido pelo sistema anti-furto

**Nível de risco** — **Atenção**: não há risco imediato parado, mas você fica sem mobilidade.

**Pode continuar rodando?** — Não se aplica enquanto não ligar. Se pegar com "chupeta", não desligue até chegar a uma oficina.

**O que fazer agora**
1. Verifique se há combustível e se o câmbio está em P/neutro com o pedal pressionado.
2. Observe os terminais da bateria (oxidação branca/azulada).
3. Tente de novo em intervalos de ~10 s; não insista por longos períodos para não danificar o arranque.
4. Se persistir, chame a assistência 24h em vez de tentar reparos.`,
  },
  {
    match:
      /inje[çc][ãa]o|check engine|luz.*(motor|amarela|laranja)|mil\b|falha.*motor|motor.*(falhando|tremendo|sacudindo)|p0\d{3}/i,
    answer: `Tranquilo: a luz de injeção acesa nem sempre significa pane grave, mas precisa ser avaliada.

**Situação** — A central eletrônica (ECU) registrou uma falha em algum sistema de motor/emissões e acendeu o alerta.

**Possíveis causas**
- Tampa do tanque mal fechada (causa comum e simples)
- Sensor de oxigênio (sonda lambda), MAF ou sensor de fase com defeito
- Velas, bobinas ou bicos injetores com falha (P030x — falha de ignição)
- Catalisador ou sistema de emissões comprometido

**Nível de risco** — **Atenção** se a luz estiver fixa; **Crítico** se piscar (falha de ignição que pode danificar o catalisador).

**Pode continuar rodando?** — Luz fixa e carro rodando normalmente: sim, por curtas distâncias até uma oficina. Luz **piscando**, perda de força ou trepidação: pare e chame assistência.

**O que fazer agora**
1. Confira se a tampa do tanque está bem fechada.
2. Evite acelerações fortes e cargas pesadas.
3. Faça a leitura dos códigos de falha (scanner) em uma concessionária Ford para o diagnóstico exato.`,
  },
  {
    match: /óleo|oleo|press[ãa]o.*(óleo|oleo)|luz.*(óleo|oleo)/i,
    answer: `Alerta de óleo é sério — vale agir já.

**Situação** — O painel indica baixa pressão ou nível de óleo do motor, que pode levar a desgaste severo em pouco tempo.

**Possíveis causas**
- Nível de óleo baixo por consumo ou vazamento
- Bomba de óleo ou sensor de pressão com defeito
- Filtro de óleo obstruído ou óleo inadequado/degradado

**Nível de risco** — **Crítico**.

**Pode continuar rodando?** — **Não.** Rodar sem pressão de óleo pode fundir o motor em minutos.

**O que fazer agora**
1. Encoste com segurança e desligue o motor.
2. Aguarde alguns minutos e confira a vareta de óleo.
3. Mesmo completando o óleo, se a luz persistir, não ligue — chame o guincho.`,
  },
  {
    match: /fuma[çc]a|cheiro.*(combust|gasolina|queimad)|vazamento|pneu|furou|estourou/i,
    answer: `Priorize a segurança: pare o veículo em local seguro o quanto antes.

**Situação** — O sintoma relatado pode indicar vazamento, falha mecânica ou problema nos pneus, e exige parada preventiva.

**Possíveis causas**
- Vazamento de combustível, óleo ou líquido de arrefecimento
- Componente superaquecido (freio, motor, escapamento)
- Pneu danificado ou calibragem incorreta

**Nível de risco** — **Crítico** até que a causa seja descartada.

**Pode continuar rodando?** — **Não** até um profissional verificar.

**O que fazer agora**
1. Pare em local seguro, ligue o pisca-alerta e desligue o motor.
2. Afaste-se do veículo; sem fumar ou criar chamas se houver cheiro de combustível.
3. Acione a assistência 24h.`,
  },
];

const GENERIC = `Obrigado por contar o que está acontecendo com o seu Ford. Para uma análise mais precisa preciso de alguns detalhes.

**Situação** — Ainda não consegui identificar com segurança o sistema envolvido.

**Para me ajudar, informe**
- Qual luz acendeu no painel (cor e símbolo) ou qual ruído você ouve
- Quando acontece: ao ligar, acelerar, frear ou em marcha lenta
- Se houve perda de força, fumaça ou cheiro estranho

**Nível de risco** — **Atenção** até entender melhor o sintoma.

**Pode continuar rodando?** — Se não houver fumaça, superaquecimento, falha de freio/direção ou luz vermelha no painel, apenas por curtas distâncias, com cautela.

**O que fazer agora**
1. Se algum alerta vermelho estiver aceso, pare em local seguro.
2. Anexe uma foto do painel ou descreva melhor o sintoma.`;

const IMAGE_NOTE = `Recebi a sua foto, mas neste momento não consigo analisar imagens (a IA de visão está indisponível). Para ajudar, descreva também **qual luz acendeu e a cor dela**.

Orientação geral sobre luzes do painel:
- **Vermelha** (óleo, bateria, temperatura, freio): pare em local seguro assim que possível.
- **Amarela/laranja** (injeção, ABS, airbag, pressão dos pneus): atenção, procure uma oficina em breve.
- **Verde/azul**: apenas informativa.

`;

export function offlineDiagnosis(userText: string, hasImage: boolean): string {
  const topic = TOPICS.find((t) => t.match.test(userText));
  const body = topic?.answer ?? GENERIC;
  return `${hasImage ? IMAGE_NOTE : ""}${body}

_Resposta de contingência: a IA online não está disponível agora._

${FOOTER}`;
}
