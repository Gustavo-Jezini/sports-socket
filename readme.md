# Sports Socket — REST + WebSocket for live match updates

Node.js API focused on **real-time sports match updates**. The app uses **WebSockets** to push events instantly (score, commentary, match status) and uses **HTTP (REST)** only where synchronous/request-response makes sense (initial bootstrap, listing, and creating matches).

This project showcases a clean and practical backend architecture that **combines REST + sockets** — a common pattern in products that need “true real-time” experiences.

---

## Highlights

- **WebSocket as the main event channel**: connected clients receive updates as they happen.
- **REST only where it matters**: creation/listing and initial load.
- **Postgres + Drizzle ORM**: versioned migrations and evolvable schema.
- **Payload validation** (Zod): safer inputs coming from clients.
- **Docker-first**: run locally with a Postgres container via `docker compose`.

---

## When to use REST vs WebSocket (practical view)

**REST (HTTP)** is great for:

- Fetching the current state on the first screen load
- Creating/updating resources (e.g., creating a match)
- On-demand queries (e.g., listing matches)

**WebSocket** is ideal for:

- Broadcasting “match created” to all connected clients
- Updating the score **without polling**
- Publishing new commentary in real time
- Pushing live game events (status changes, relevant updates, etc.)

> WebSockets don’t replace REST — they **complement** it.

---

## Architecture (code map)

- `src/index.js`: HTTP server entry point
- `src/ws/server.js`: WebSocket server and event broadcasting
- `src/routes/`: REST endpoints
- `src/validation/`: payload validation (Zod)
- `src/db/`: DB connection and schema

---

## Run it (recommended): Docker + local Postgres

This project uses `DATABASE_URL` (read in `src/db/db.js` and `drizzle.config.js`). Docker Compose spins up a local Postgres instance for development.

### 1) Start the database

```bash
docker compose up -d
```

### 2) Install dependencies

```bash
npm install
```

### 3) Run migrations

```bash
npm run db:migrate
```

### 4) Start the API

```bash
npm run dev
```

---

## Test the WebSocket (wscat)

Use `wscat` to connect and watch messages arrive.

### Install wscat (global)

```bash
sudo npm i -g wscat
```

### Connect

```bash
wscat -c ws://localhost:8080
```

---

## Run without Docker (optional)

If you already have a local Postgres (or want to use Neon), just configure `.env`.

### 1) Configure environment variables

Create a `.env` file at the repository root:

```bash
DATABASE_URL=postgresql://user:password@localhost:5432/sports_socket
```

### 2) Install dependencies, run migrations, and start

```bash
npm install
npm run db:migrate
npm run dev
```

---

## API (high-level)

REST endpoints live in `src/routes/` and are used for:

- creating matches
- listing matches
- loading initial data

Meanwhile, the WebSocket publishes events like:

- `match created`
- `score updated`
- `commentary added`
- live events / status changes

If you want, check request examples in `client.http`.

---

## Quality and good practices

- **Validation**: Zod ensures consistent payloads.
- **Versioned database**: migrations live in `drizzle/`.
- **Separation of concerns**: REST routes, WS layer, and utilities are organized.

---

## Roadmap ideas

- Authentication and channel permissions (e.g., “only admins can update the score”)
- Rooms per match (`match:{id}`) to avoid global broadcast
- Retry/reconnect + “last event id” to recover missed events
- Observability (structured logs + tracing)

---

## About

Built to demonstrate a real-time backend with **WebSockets + Postgres**, with a simple, readable architecture that’s ready to evolve.