# Alex Mecklin — Portfolio Website

Personal portfolio site: experience, projects, CV, and an AI chat assistant
that answers questions about me. Built with a focus on recruiter
accessibility — clean design, intuitive navigation, mobile-optimized layout.

🔗 **Live site:** [alexmecklin.com](https://alexmecklin.com)

**New here or setting this up from scratch?** Read [`AGENTS.md`](AGENTS.md)
first — it is the standing contract this repo's agents (human-directed or
not) work under: branch and PR policy, the test bar, and where CI stops and
Vercel's own deploy takes over. [`SETUP.md`](SETUP.md) has the actual
provisioning steps.

## Overview

A single-page Next.js app with smooth-scrolling navigation between sections:

- **About** — introduction with a skills overview
- **Ask AI** — a chat assistant that answers questions about my background,
  backed by a separate Cloudflare Worker
- **Experience** — timeline view of work history with company logos, parsed
  straight out of my LaTeX CV so the two never drift apart
- **Projects** — grid of personal projects
- **CV** — downloadable resume
- **Contact** — email, phone, LinkedIn, GitHub

## Tech Stack

### Frontend

- **Next.js (App Router) + TypeScript** — framework and language
- **React 19**
- **MUI (Material UI) v9** — components and theming, with
  `@mui/material-nextjs` for App Router SSR
- **Framer Motion** — entrance animations
- **Vercel** — hosting, with automatic deploys from this repo's Git
  integration: every push gets a preview, every merge to `main` goes to
  production

### Backend (AI chat)

- **Cloudflare Workers** (`worker/`, TypeScript) — a small edge API that
  proxies chat requests. Deployed separately from the website itself, since
  it's Cloudflare infrastructure rather than a Vercel one — see
  [Deployment](#deployment).
- **OpenRouter API** — LLM inference
- **Server-Sent Events (SSE)** — streamed responses

## Project Structure

```
app/                          # Next.js App Router
├── layout.tsx                 # Root layout, metadata, MUI SSR cache provider
└── page.tsx                   # Entry point; renders PortfolioApp
components/
├── Navbar.tsx                  # Fixed navigation with mobile drawer
├── Section.tsx                 # Section wrapper + divider used between them
├── PortfolioApp.tsx             # Theme setup and page layout
└── sections/
    ├── About.tsx, Experience.tsx, Projects.tsx, CV.tsx, Contact.tsx, Chat.tsx
    └── CompanyLogo.tsx          # Renders a logo from public/logos/, or nothing
hooks/
└── useIsMobile.ts               # Responsive breakpoint hook
data/
├── projects.ts, personal.tsx    # Project cards, contact info, CV reference
└── latexResume.ts               # Raw LaTeX CV content
lib/                            # Pure logic, unit-tested independently of the UI
├── parseLatexExperience.ts      # Extracts Experience entries out of the LaTeX CV
├── truncateDescription.ts       # Word-boundary truncation for the mobile view
├── companyLogo.ts               # Company name -> logo filename
└── chatStream.ts                # SSE chunk parsing for the chat stream
tests/                          # Vitest — the pure `lib/` functions, the page
                                 # render, and the CI pipeline's own shape
public/                         # Static assets: favicons, profile photo, CV,
                                 # company logos

worker/                         # Cloudflare Worker (chat backend), deployed
├── src/index.ts                 # separately — see Deployment below
├── src/systemPrompt.ts
└── wrangler.toml
```

## Local Development

### Website

```bash
npm install
npm run dev          # http://localhost:3000
```

```bash
npm run lint && npm run typecheck && npm test && npm run build
```

This is exactly what CI runs on every pull request and every push to `main`.

### Chat backend (Cloudflare Worker)

```bash
cd worker
npx wrangler dev
```

**Required environment variable:** `OPENROUTER_API_KEY`, set in the Cloudflare
dashboard under the worker's Settings → Variables (not in this repo, and not
in GitHub — see [`SETUP.md`](SETUP.md)).

## Deployment

Two independent, non-competing deploy paths:

- **The website** deploys via **Vercel's Git integration** — connect the repo
  once (see [`SETUP.md`](SETUP.md)) and every push gets a preview, every merge
  to `main` goes to production automatically. Nothing in
  `.github/workflows/` deploys it; a workflow that also ran `vercel deploy`
  would just race the platform's own deploy and ship everything twice.
- **The chat worker** (`worker/`) is Cloudflare infrastructure that Vercel
  doesn't touch, so it has its own deploy job: `main.yml`'s `deploy-worker`
  job, which runs only after the `verify` job (lint, typecheck, test, build)
  passes, and only if the `CLOUDFLARE_API_TOKEN` repository secret is set —
  otherwise it skips with a notice rather than failing.

### CI

```
.github/workflows/
├── pull-request.yml   # lint, typecheck, test, build — every pull request
└── main.yml           # the same checks on push to main, plus the worker deploy
```

`tests/pipeline.test.ts` asserts on the shape of both workflows (installs from
the lockfile, runs all four checks, never deploys the Next.js app itself) so
that shape can't quietly regress.

Custom domain DNS lives in Cloudflare, pointed at Vercel with the proxy
(orange cloud) off — see [`SETUP.md`](SETUP.md) for the exact records.

## Design Principles

**Typography:**

- Section headers: `h2` (2.2rem desktop / 1.6rem mobile)
- Subsection headers: `h5` (1.4rem desktop / 1.1rem mobile)
- Body text: `body1` (0.95rem desktop / 0.85rem mobile)
- All sizing controlled via the MUI theme — no ad hoc font-size overrides

**Color palette:**

- Primary: `#0a1929` (navy)
- Accent: `#1565c0` (blue)
- Text: `#4a5568` (gray)
- Backgrounds: `#f8f9fb` / `#ffffff`

**Responsive strategy:** mobile-first collapsible content, single-column grid
layouts on small screens, icons and spacing scaling down proportionally.
