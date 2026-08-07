# CoachAI Football

Plataforma de IA para treinadores de futebol planejarem treinos, times e temporadas — inspirada em [app.coachai.cfd](https://app.coachai.cfd).

Aplicação Next.js completa (App Router + TypeScript + Tailwind CSS v4 + Prisma/SQLite) com:

- **Autenticação** própria (cadastro/login com sessão em cookie).
- **Painel** com métricas do mês (treinos criados, objetivos, jogadores acompanhados, horas economizadas).
- **Times e jogadores** com gerador de escudo em SVG, estilo de jogo e prioridades da temporada.
- **Criador de treino** (wizard de 5 passos) e **Assistente de IA** (chat) que geram um plano de treino completo via OpenAI, com diagramas táticos de campo em SVG.
- **Histórico** de todos os treinos gerados.
- Tema claro/escuro.

## Rodando localmente

```bash
npm install
cp .env.example .env   # preencha OPENAI_KEY e SESSION_SECRET
npx prisma db push
npm run dev
```

Acesse `http://localhost:3000`, crie uma conta e comece a planejar treinos. Sem uma `OPENAI_KEY` válida, a geração de treinos retorna um erro amigável (o restante do app funciona normalmente).

---

## Script original: teste Telegram + OpenAI

Código para testar a conexão das chaves do bot do telegram e da api da openai (`main.py`).
## > Vídeo explicando o código:
[![](https://markdown-videos-api.jorgenkh.no/youtube/oFf8wNW8spg)](https://youtu.be/oFf8wNW8spg)

[Link do vídeo aqui](https://youtu.be/oFf8wNW8spg)

---

Made by **Matheus Tem Pass**👋