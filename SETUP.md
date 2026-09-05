# Setup

Standing up this website's hosting and its chat backend. Written so that
**someone holding the tokens — or an agent — can run it top to bottom without
opening a browser**, except for the few steps under
[Has to be done by hand](#has-to-be-done-by-hand).

There is no database and no auth here — it's a static-ish marketing site with
one API route for the chat assistant, all part of the same Next.js app — so
this is shorter than the skeleton's own `SETUP.md`. Roughly 10 minutes end to
end, plus DNS propagation if the domain is new.

## Prerequisites

| You need | For | Notes |
| --- | --- | --- |
| This GitHub repository | Everything | Vercel's Git integration deploys from it |
| A Vercel account | Hosting the website and its chat API route | `VERCEL_TOKEN` from Account Settings → Tokens |
| A Cloudflare account | DNS for the custom domain only | `CLOUDFLARE_API_TOKEN`, scoped narrowly (see step 4) |
| An OpenRouter account | The chat assistant's LLM calls | An API key from openrouter.ai |

Set tokens in your environment rather than passing them inline, and never
echo one to check it is set — test it with a call that uses it.

```bash
export VERCEL_TOKEN=...
export CLOUDFLARE_API_TOKEN=...
```

## 1. The code

```bash
npm install
npm run lint && npm run typecheck && npm test && npm run build
```

All four pass before any service exists. If they do not, stop here.

## 2. The hosting project

Everything else attaches to this. `vercel link` writes
`.vercel/project.json`, which later commands read to know which project you
mean — always pass `--project` explicitly, or an unlinked directory silently
creates a new project named after the current folder instead of failing.

```bash
npx vercel link --yes --project website
npx vercel project ls
```

## 3. The chat backend's secret

The chat assistant (`app/api/chat/route.ts`) calls OpenRouter directly from
the same Next.js app — no separate service, so its one secret is a normal
Vercel environment variable rather than infrastructure of its own:

```bash
npx vercel env add OPENROUTER_API_KEY production
npx vercel env add OPENROUTER_API_KEY preview
```

Do this before the first deploy (or redeploy afterward) — a serverless
function only picks up an environment variable added after it was last
built on a fresh deploy.

## 4. Deploys

Connect the repository to the Vercel project and leave automatic deploys
**on**. Every pull request gets a preview; every merge to `main` goes to
production — chat backend included, since it deploys as part of the same
app rather than on its own track.

Nothing in `.github/workflows/` deploys the website, and
`tests/pipeline.test.ts` fails if that changes — two routes to production
would race each other and deploy everything twice.

Check it came up:

```bash
curl -I https://website-<your-vercel-slug>.vercel.app
```

## 5. A custom domain

Ask the platform what record it wants rather than hardcoding a target —
published CNAME targets do change:

```bash
npx vercel domains add alexmecklin.com website
npx vercel domains inspect alexmecklin.com
npx vercel domains verify alexmecklin.com
```

Then create the DNS record in Cloudflare — it has no first-party CLI for DNS,
so this is the REST API with a scoped token (`Zone:DNS:Edit` on the one
zone):

```bash
ZONE_ID=$(curl -s "https://api.cloudflare.com/client/v4/zones?name=alexmecklin.com" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" | jq -r '.result[0].id')

curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"type":"CNAME","name":"@","content":"<target from domains inspect>",
           "ttl":1,"proxied":false}'
```

The site is reachable at both the apex domain and `www.` — repeat the same
`vercel domains add` / DNS record steps for `www.alexmecklin.com`, pointed at
whatever target `vercel domains inspect` gives for it. Since the chat backend
is now same-origin (no separate worker with its own CORS allowlist to keep in
sync), there is nothing extra to configure for either domain to reach it.

**`"proxied": false` is not optional.** An orange-clouded record puts
Cloudflare's proxy in front of a host that already terminates its own TLS —
the visible symptom is certificate issuance that never completes, or a
redirect loop, and neither obviously points back at the proxy toggle.

Verification is DNS-dependent, so `vercel domains verify alexmecklin.com` is
the one step where "run it again in a few minutes" is a legitimate answer.

## 6. Web analytics

The `<Analytics />` component from `@vercel/analytics` is already in
`app/layout.tsx` and ships with every deploy — no environment variable, no
per-environment config. It only sends events once Web Analytics is turned on
for the project, which is a one-time toggle in the Vercel dashboard (Project
→ Analytics → Enable), not something the CLI or API exposes. After enabling
it and deploying, visit the production URL and navigate between a couple of
pages; data shows up in the Analytics tab within about 30 seconds if nothing
is blocking the collection request.

## Has to be done by hand

- **Minting the first token** — `VERCEL_TOKEN`, `CLOUDFLARE_API_TOKEN`, the
  OpenRouter API key. The credential every CLI needs cannot itself be created
  by one.
- **Billing and accepting terms** on Vercel, Cloudflare and OpenRouter, where
  those providers gate it on a human deliberately.
- **Enabling Web Analytics** on the Vercel project (Project → Analytics →
  Enable) — there is no CLI or API for this toggle.

## Environment variables

| Name | What it is | Who supplies it | Where |
| --- | --- | --- | --- |
| `OPENROUTER_API_KEY` | Auth for the LLM the chat assistant calls | You, via `vercel env add` | Vercel project environment variable (Production and Preview) — never in this repo or in GitHub |

`CLOUDFLARE_API_TOKEN` is only needed locally, for the one-time DNS record
setup in step 5 — it is not a GitHub Actions secret, since nothing in CI
touches Cloudflare.

## Checklist

- [ ] `npm run lint && npm run typecheck && npm test && npm run build` passes locally
- [ ] Vercel project created and linked, Git integration connected with automatic deploys on
- [ ] `OPENROUTER_API_KEY` set as a Vercel environment variable (Production and Preview)
- [ ] Custom domain verified on Vercel for both the apex and `www`, DNS records in Cloudflare with the proxy off
- [ ] Web Analytics enabled on the Vercel project

## Troubleshooting

**The chat assistant just hangs, or every message errors** — check the
function's logs (Vercel dashboard → project → Logs, filtered to
`/api/chat`, or `vercel logs`) before assuming the frontend is at fault; a
missing `OPENROUTER_API_KEY` fails every request with a 500 that never
reaches the browser's network tab. `app/api/chat/route.ts` also logs the
upstream status and body whenever OpenRouter itself rejects a request (wrong
model id, invalid key, rate limit), so an unexpected 502 is diagnosable from
the same logs rather than guesswork.

**The chat feature works locally but not on the deployed site, or vice
versa** — almost always `OPENROUTER_API_KEY` missing from one Vercel
environment (Production and Preview are separate) rather than anything in
the code; same-origin means there is no CORS allowlist to get out of sync
anymore.

**A Vercel preview deploy looks fine but the custom domain doesn't** — the
domain is a separate, DNS-dependent step from the deploy itself;
`vercel domains verify alexmecklin.com` tells you whether it's a wrong record
or just not propagated yet.
