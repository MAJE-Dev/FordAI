<div align="center">

# 🚗 Ford AI
*Aplicação web interativa desenvolvida para o desafio acadêmico do 3º ano de Engenharia de Software (FIAP).*

<p>
  <a href="https://ford-ai.vercel.app/" target="_blank">
    <img src="https://img.shields.io/badge/🚀_Acessar_Aplicação_Online-003366?style=for-the-badge&logo=ford&logoColor=white" alt="Deploy Link"/>
  </a>
</p>

</div>

---

### 💡 Sobre o Projeto
Este repositório abriga o desenvolvimento de uma solução digital voltada para o ecossistema automotivo da **Ford**. Criado com foco em experiência do usuário, design limpo e alta performance, o projeto simula funcionalidades avançadas de interação com veículos conectados.

### 🛠️ Tecnologias Utilizadas
O projeto foi construído utilizando tecnologias modernas de front-end para garantir agilidade, fluidez e um design impecável:
* **TypeScript** — Tipagem estática e segurança no código.
* **JavaScript (ES6+)** — Dinamismo e lógica da aplicação.
* **CSS / Tailwind** — Estilização moderna, responsiva e alinhada ao conceito visual da marca.
* **Lovable & React** — Agilidade de prototipagem e componentização inteligente.

### ✨ Principais Funcionalidades
* 🖥️ Interface inspirada no ecossistema Ford (Pixel Perfect).
* 📱 Design totalmente responsivo para desktop e dispositivos móveis.
* ⚡ Navegação fluida e integrada com componentes modernos.

---

### 💻 Como Rodar o Projeto Localmente

Se você preferir clonar e rodar a aplicação na sua máquina, siga os passos abaixo (certifique-se de ter o **Node.js** e o **npm** instalados):

```bash
# Clone o repositório
git clone https://github.com/MAJE-Dev/FordAI.git

# Entre na pasta do projeto
cd nome-do-repositorio

# Instale as dependências
npm i

# Inicie o servidor de desenvolvimento
npm run dev
```

---

### ☁️ Deploy na Vercel (com o chat de IA funcionando)

O chat com IA depende de uma chave de API que existe apenas no servidor. Para ela funcionar no domínio `ford-ai.vercel.app`:

1. No painel da Vercel, abra **Project → Settings → Environment Variables**.
2. Adicione a variável **`GEMINI_API_KEY`** com uma chave gratuita do [Google AI Studio](https://aistudio.google.com/apikey) (opcional: `GEMINI_MODEL`, padrão `gemini-2.5-flash`). Dentro do Lovable, a `LOVABLE_API_KEY` também é aceita.
3. Configure o build:
   - **Framework Preset:** Other
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Faça o **Redeploy** em Deployments → Redeploy.

> ⚠️ Importante: este projeto usa TanStack Start e o chat é respondido por uma rota de servidor (`/api/public/chat`). Se o deploy da Vercel servir apenas arquivos estáticos, a IA não funcionará mesmo com a chave — nesse caso, a alternativa é publicar pelo Lovable (botão **Publish**) e conectar um domínio próprio em **Project Settings → Domains**, onde tudo funciona sem configuração extra.

Sem nenhuma chave (ou se a IA estiver indisponível/sem créditos), o chat não fica mudo: responde com orientações de contingência para os problemas mais comuns (luz da injeção, carro não liga, superaquecimento, ruído no freio, óleo, etc.). Para analisar a **foto anexada** é necessária a chave de IA (modelo com visão, como o Gemini).
