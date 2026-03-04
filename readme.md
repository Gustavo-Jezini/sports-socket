npm i ws
npm i --save-dev @types/node @types/ws

sudo npm i -g wscat
wscat -c ws://localhost:8080

criar conta em conectar com psql https://neon.com/docs/guides/drizzle
[Projects](https://console.neon.tech/app/projects)  -> dashboard -> connect

## Postgres local com Docker (substituindo Neon)

Este projeto usa `DATABASE_URL` (lida em `src/db/db.js` e `drizzle.config.js`).

### 1) Subir o banco

```bash
docker compose up -d
```

### 2) Rodar migrations do Drizzle

```bash
npm run db:migrate
```

### 3) Rodar a aplicação

```bash
npm run dev
```

### Voltar para Neon (opcional)

Troque o `DATABASE_URL` no `.env` para sua URL do Neon (ou copie de `NEON_DATABASE_URL`).

## WebSocktes + Rest
-  Nessa aplição e no mundo real, websockets não substituem api Rest, elas se complementam

### Rest
- Create the match
- Fetches the list of matches
- Load the app for the first time

### WebSocket
- Match created
- Score updated
- Commenttary added
- Live events pushed instantly


npm i zod

para validar todos os dados recebidos do front end