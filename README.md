# SiteForge AI — AI Website Builder

SiteForge AI is a full-stack, AI-driven website builder that generates complete, production-ready, multi-page websites from natural-language prompts. Users can preview their sites across responsive viewports, converse with an AI editor to refine styling and content, persist projects with full revision histories, and export usable source-code applications.

---

## Architecture & Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide icons, Framer Motion.
- **Backend**: Node.js, Express, Vite middleware mode in development.
- **AI Model Integration**: Google GenAI SDK (`@google/genai`) using `gemini-3.8-flash` via server-side proxy (`/api/generate-website`, `/api/edit-website`, `/api/ai/status`).
- **Canonical Schema**: Single source of truth in `src/types/schema.ts` with strict Zod runtime validation (`WebsiteDocumentSchema`).
- **Rendering Engine**: Controlled component-based renderer supporting 15 section types (`hero`, `features`, `about`, `services`, `statistics`, `testimonials`, `pricing`, `gallery`, `team`, `process`, `faq`, `contact`, `cta`, `footer`, `header`) with theme contrast computation and isolated Error Boundaries.
- **Persistence**: Browser-local storage (`localStorage`) with quota recovery, automatic chat pruning, and memory fallback.
- **Export Engine**: In-browser client & server ZIP generator creating runnable React 19 + Vite projects, multi-page static HTML packages, and JSON specifications.

---

## Prerequisites

- [Node.js](https://nodejs.org/) >= 18.0.0 (Node 20+ recommended)
- `npm` (or `pnpm` / `bun`)
- A valid Gemini API Key from Google AI Studio (configured as an environment secret)

---

## Environment Variables

Copy `.env.example` to `.env` (never commit secrets to version control):

```bash
cp .env.example .env
```

| Variable | Description | Required | Default |
| :--- | :--- | :--- | :--- |
| `GEMINI_API_KEY` | Google Gemini API key for server-side generation & editing | Yes | None |
| `PORT` | Local and production web server port | No | `3000` |
| `NODE_ENV` | Environment mode (`development` or `production`) | No | `development` |
| `GEMINI_MODEL` | Gemini model alias | No | `gemini-3.8-flash` |
| `APP_URL` | Canonical hosting URL | No | `http://localhost:3000` |

---

## Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your web browser.

---

## Production Build & Run

1. **Build the production assets**:
   ```bash
   npm run build
   ```
   This compiles and bundles client-side assets into the `dist/` directory.

2. **Start the production server**:
   ```bash
   npm start
   ```
   The Express server will serve static production assets from `dist/` and handle all `/api/*` endpoints on port 3000.

---

## Automated Test Suites

SiteForge AI includes 54 automated unit and integration tests across 7 suites:

```bash
npm test
```

### Test Suites Included:
1. `test/validator.test.ts`: Canonical schema enforcement, missing fields, rogue section sanitization, route uniqueness, and safe URLs.
2. `test/renderer.test.ts`: Theme computation, contrast safety, complete 15-section-type rendering, and optional field fallbacks.
3. `test/editing.test.ts`: Targeted conversational modifications (colors, headings, section additions, deletions, re-orderings, version rollback).
4. `test/preview.test.ts`: Viewport dimensions (Desktop 1440px, Tablet 768px, Mobile 390px), orientation switching, auto-fit scaling math, and multi-page routing.
5. `test/persistence.test.ts`: Stable IDs, revision tracking, project duplication, JSON backup import/export, and corrupted storage recovery.
6. `test/export.test.ts`: React 19 + Vite packaging, static HTML multi-page synthesis, zero-dependency validation, and physical filesystem extraction.
7. `test/security.test.ts`: SSRF defense (IPv4/IPv6/integer IPs/metadata hosts), XSS prevention, Zip Slip path traversal sanitization, secret stripping, and request bounds.

---

## Deployment Instructions

### Option 1: Google Cloud Run (Recommended for AI Studio)
SiteForge AI is optimized for containerized Cloud Run hosting:
1. Set the container start command to: `npm start`
2. Ensure the `PORT` environment variable is set to `3000` (or injected by Cloud Run).
3. Inject the `GEMINI_API_KEY` secret securely via Cloud Run environment secrets.
4. Set `NODE_ENV=production`.

### Option 2: Docker Container
A standard multi-stage Node.js Dockerfile:
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./server.ts
COPY --from=builder /app/server ./server
COPY --from=builder /app/src ./src
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
CMD ["npm", "start"]
```

---

## Security Architecture

- **Zero Client-Side Secrets**: All Gemini calls run through server-side proxy routes (`/api/generate-website`, `/api/edit-website`). No API keys or tokens are ever sent to the browser or included in exported archives.
- **SSRF Defense**: Strict blocking of internal hostnames (`localhost`, `127.0.0.1`, `::1`, `169.254.169.254`, `metadata.google.internal`, and private IPv4 subnets).
- **Safe Output Rendering**: AI responses are parsed into typed Zod data trees and rendered through controlled React components. Dynamic script execution (`eval`, `new Function`) is prohibited.
- **Zip Slip Defense**: Archive entry paths are sanitized to strip `..` directory traversal sequences, drive letters, and null bytes.
- **Iframe Isolation**: Preview canvas uses restricted iframe sandboxing (`allow-same-origin allow-scripts`) with top navigation and modals blocked.
