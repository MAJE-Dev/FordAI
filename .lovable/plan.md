# Plano: fazer a IA funcionar no ford-ai.vercel.app

## Por que funciona no Lovable mas não na Vercel

O chat funciona aqui porque a chave da IA (`LOVABLE_API_KEY`) fica guardada no servidor do Lovable e é lida pelo código do backend no momento da resposta. No deploy da Vercel essa chave não existe, então o chat mostra "Serviço de IA não configurado".

## Opção A (recomendada): usar o endereço do Lovable como domínio do site

Em vez de hospedar na Vercel, publique pelo Lovable (botão **Publish**) e conecte o seu domínio em **Project Settings → Domains**. Assim:
- A IA funciona sem nenhuma configuração extra
- Não é preciso mexer em chaves nem configuração de build
- Deploy automático a cada publicação

Observação: o domínio `ford-ai.vercel.app` pertence à Vercel e não pode ser apontado para outro host — seria preciso usar um domínio próprio (ex: `ford-ai.com`) ou manter o endereço `*.lovable.app`.

## Opção B: configurar a chave na Vercel (continuar com auto deploy do GitHub)

1. No painel da Vercel: **Project → Settings → Environment Variables**
2. Adicionar a variável `LOVABLE_API_KEY` com a chave da IA (obtida nas configurações do projeto no Lovable)
3. Verificar as configurações de build na Vercel:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Preset: Other
4. Fazer redeploy (Deployments → Redeploy)

Atenção: este projeto usa TanStack Start, que roda código de servidor. A Vercel precisa executar as rotas de API (`/api/chat-public`) como funções serverless — se o deploy atual servir apenas arquivos estáticos, o chat nunca vai funcionar lá, mesmo com a chave. Nesse caso a Opção A é o caminho certo.

## Passos técnicos (Opção B, se escolhida)

1. Confirmar que a build da Vercel gera um servidor (não apenas site estático) — se necessário, ajustar o projeto para gerar saída compatível com Vercel Functions
2. Documentar a variável de ambiente `LOVABLE_API_KEY` no README do projeto
3. Testar o chat no domínio após redeploy
