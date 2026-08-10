# AGENTS.md

Repo de gestión de bingos de clubes ("El bono de los clubes"). Todo el texto de UI, mensajes de API, comentarios y commits están en español (Argentina): mantener esa convención.

## Estructura

No es un monorepo: no hay `package.json` en la raíz. Hay dos apps independientes, cada una con su propio `pnpm-lock.yaml`:

- `server/` — API NestJS 11 + TypeORM + PostgreSQL + Firebase Admin. Entry: `src/main.ts`. Todos los endpoints van bajo el prefijo global `/api`, y Swagger se sirve en `/docs` (ver `server/src/main.ts`).
- `ui/` — React 19 + Vite + Tailwind 4 + Firebase Auth. Entry: `src/main.tsx`.

Gestor de paquetes obligatorio: **pnpm** (nunca npm/yarn). Ejecutar siempre dentro de `server/` o `ui/`.

## Comandos

Server (puerto 3090):
- `pnpm start:dev` — dev con watch.
- `pnpm build` — compila a `dist/` (entry real: `dist/src/main.js`, porque `datasource.ts` está en la raíz del paquete).
- `pnpm lint` — eslint con `--fix` (los cambios pueden llegar "arreglados" automáticamente).
- No hay tests: jest está configurado en `package.json` pero no existe ningún `*.spec.ts`.

UI (puerto 5173):
- `pnpm dev` — Vite dev server.
- `pnpm build` — `tsc -b && vite build`.
- `pnpm lint` — eslint `.`.

Para levantar el stack completo en dev: server en 3090 y `ui` con `VITE_API_URL` apuntando a `http://localhost:3090/api/` (default ya contemplado en `ui/src/lib/api.ts`).

## Base de datos y migraciones

- El esquema real está en SQL plano en `migrations/*.sql` (`001_init.sql`...`004_*`). Esa es la fuente de verdad.
- `synchronize: false` en TypeORM. Los scripts `pnpm migration:generate/run/revert` de `server/package.json` están **rotos** (apuntan a `dist/migrations/*.js`, que no existe). NO usarlos; agregar migraciones SQL nuevas como `migrations/NNN_desc.sql` y actualizar entidades a mano.
- Tablas: `clubes`, `bonos`, `bono_club` (asigna rangos de números por club), `ventas` (`UNIQUE (bono_id, numero)`, número 0–499, `tipo_pago` `contado|transferencia|cuotas`, `pago_verificado`), `cuotas` (FK a ventas con CASCADE), `sorteos`.

## Auth y roles

- Autenticación por Firebase: el servidor valida el Bearer token con `admin.auth().verifyIdToken` (`src/auth/strategies/firebase.strategy.ts`) usando `firebase-service-account.json`.
- Los usuarios viven en **Firestore** (colección `usuarios`, doc = `uid`): campos `nombre`, `email`, `rol`, `idClub`, `actividad`. El guard devuelve eso como `req.user`.
- Roles: `vendedor`, `admin`, `superadmin` (`src/constantes/index.ts`). Proteger con `@UseGuards(FirebaseGuard)` y `@Roles(...)` (RolesGuard). Los vendedores ven solo su club (`user.idClub`); los superadmin filtran por todo.
- Nuevos usuarios: `POST /auth/register` crea el doc en Firestore (no en Postgres). El alta en Firebase Auth debe hacerse manualmente primero.

## UI — convenciones

- Tailwind v4 vía plugin `@tailwindcss/vite`: **no hay `tailwind.config.*`**. Los tokens están en `@theme` de `src/index.css` y deben reflejar el frontmatter de `DESIGN.md` (colores, tipografías `Hanken Grotesk`/`JetBrains Mono`, espaciados). Usar las clases derivadas de tokens (`bg-background`, `text-primary`, `bg-secondary-container`, etc.).
- Iconos: Google **Material Symbols** (clase `material-symbols-outlined`), no una librería de iconos.
- Data fetching: axios directo vía `src/lib/api.ts` (inyecta el Bearer token de Firebase y `baseURL` desde `VITE_API_URL`). Sin SWR/React Query; los componentes usan `useEffect` + `api.get` con estados `loading/error`.
- Rutas en `src/App.tsx` con `ProtectedRoute` por rol; `AppLayout` muestra la navegación según `user.rol`.

## Variables de entorno y setup local

Ambos `.env` y `server/firebase-service-account.json` están en `.gitignore` y **son requeridos para correr**; hay que crearlos localmente:

- `server/.env`: `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`, `PORT`, `CORS_ORIGINS` (lista separada por comas).
- `ui/.env`: `VITE_API_URL`, `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`, `VITE_FIREBASE_MEASUREMENT_ID`.

## Deploy (docker-compose.yml)

- `docker-compose.yml` está en `.gitignore` pero igual está trackeado (fue forzado con `-f`); no sorprenderse.
- Levanta `bingo-clubes-server` (3090) y `bingo-clubes-ui` (3091, Apache sirviendo `dist` con `.htaccess` para SPA routing).
- El server se conecta a un contenedor Postgres externo `pg-recovery-temp` vía red `quipu_quipu-network` (requiere `docker network connect` si no está en esa red).
- Los `VITE_*` de la UI se pasan como build args (se hornean en el bundle; no hay env en runtime). El Dockerfile del server arranca con `node dist/src/main.js`.
- Deploy automático: `.github/workflows/deploy.yml` (repo monorepo, un solo workflow en la raíz). Al pushear a `main`, hace SSH al droplet (`DROPLET_HOST`/`DROPLET_USER`/`DROPLET_SSH_KEY`/`DROPLET_PORT`, secrets ya configurados en GitHub), `git pull` en `/var/www/bingo-clubes` y `docker compose build && docker compose up -d` recreando ambos containers.

## Gotchas

- `pnpm start:prod` en `server/package.json` apunta a `node dist/main`, que **no existe** (el entry real es `dist/src/main.js`). Usar la ruta correcta o el Dockerfile.
- `server/src/auth/strategies/firebase.strategy.ts` importa `../../../firebase-service-account.json` — si falta el archivo, el server no compila/levanta.
- El alias `@/*`→`src/*` está definido en `ui/tsconfig.app.json` pero no se usa en el código actual; seguir el estilo relativo.
