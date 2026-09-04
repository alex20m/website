# Setup

Standing up this website's hosting and its chat backend. Written so that
**someone holding the tokens — or an agent — can run it top to bottom without
opening a browser**, except for the few steps under
[Has to be done by hand](#has-to-be-done-by-hand).

There is no database and no auth here — it's a static-ish marketing site plus
one small edge API — so this is shorter than the skeleton's own `SETUP.md`.
Roughly 15 minutes end to end, plus DNS propagation if the domain is new.

## Prerequisites

| You need | For | Notes |
| --- | --- | --- |
| This GitHub repository | Everything | Vercel's Git integration deploys from it |
| A Vercel account | Hosting the website | `VERCEL_TOKEN` from Account Settings → Tokens |
| A Cloudflare account | DNS for the custom domain, and hosting the chat worker | `CLOUDFLARE_API_TOKEN`, scoped narrowly (see step 4 and step 5) |
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

There is no database and no per-environment application variable to set —
the only environment variable the website itself reads is the one already
baked into `components/sections/Chat.tsx` (the worker's public URL), which is
not a secret.

## 3. Deploys

Connect the repository to the Vercel project and leave automatic deploys
**on**. Every pull request gets a preview; every merge to `main` goes to
production.

Nothing in `.github/workflows/` deploys the website, and
`tests/pipeline.test.ts` fails if that changes — two routes to production
would race each other and deploy everything twice.

Check it came up:

```bash
curl -I https://website-<your-vercel-slug>.vercel.app
```

## 4. A custom domain

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

**`"proxied": false` is not optional.** An orange-clouded record puts
Cloudflare's proxy in front of a host that already terminates its own TLS —
the visible symptom is certificate issuance that never completes, or a
redirect loop, and neither obviously points back at the proxy toggle.

Verification is DNS-dependent, so `vercel domains verify alexmecklin.com` is
the one step where "run it again in a few minutes" is a legitimate answer.

## 5. The chat worker

The worker is separate infrastructure — Cloudflare Workers, not Vercel — so
it is provisioned and deployed on its own track.

```bash
cd worker
npx wrangler@4.129.0 deploy   # first deploy, from your machine, to create the resource
```

Then set its one secret in the Cloudflare dashboard (Workers & Pages →
`portfolio-chat-worker` → Settings → Variables and Secrets) — the Wrangler CLI
also has `wrangler secret put`, but this repo has not driven it that way yet:

```bash
npx wrangler secret put OPENROUTER_API_KEY
```

From then on, deploys are automatic: `main.yml`'s `deploy-worker` job runs
`wrangler deploy` after every push to `main` whose checks pass, using a GitHub
Actions repository secret rather than your own machine's credentials:

```bash
gh secret set CLOUDFLARE_API_TOKEN --repo alex20m/website
```

That token needs **Workers Scripts: Edit** on the account the worker lives in
— narrower than a full account token. If the secret is not set, the job
notices and skips the deploy with a notice instead of failing.

Verify the worker is live and enforcing its CORS allowlist:

```bash
curl -i -X OPTIONS https://portfolio-chat-worker.alex-mecklin.workers.dev \
  -H "Origin: https://alexmecklin.com"
# expect: 200, with Access-Control-Allow-Origin echoing that origin

curl -i -X OPTIONS https://portfolio-chat-worker.alex-mecklin.workers.dev \
  -H "Origin: https://evil.example"
# expect: 403 — origins outside ALLOWED_ORIGINS in worker/src/index.ts are refused
```

If the website's own domain ever changes, `ALLOWED_ORIGINS` in
`worker/src/index.ts` has to change with it — the worker will otherwise
refuse the site's own chat requests with a CORS 403 that has nothing to do
with Cloudflare being down.

## Has to be done by hand

- **Minting the first token** — `VERCEL_TOKEN`, `CLOUDFLARE_API_TOKEN`, the
  OpenRouter API key. The credential every CLI needs cannot itself be created
  by one.
- **Billing and accepting terms** on Vercel, Cloudflare and OpenRouter, where
  those providers gate it on a human deliberately.

## Environment variables

| Name | What it is | Who supplies it | Where |
| --- | --- | --- | --- |
| `OPENROUTER_API_KEY` | Auth for the LLM the chat assistant calls | You, via `wrangler secret put` | Cloudflare Worker only — never in this repo or in GitHub |
| `CLOUDFLARE_API_TOKEN` | Lets `deploy-worker` deploy the worker | You, scoped to Workers Scripts: Edit | GitHub Actions repository secret |

Nothing here needs a variable inside the Next.js app itself — no database, no
auth provider, and the worker's public URL is not a secret.

## Checklist

- [ ] `npm run lint && npm run typecheck && npm test && npm run build` passes locally
- [ ] Vercel project created and linked, Git integration connected with automatic deploys on
- [ ] Custom domain verified on Vercel, DNS record in Cloudflare with the proxy off
- [ ] Chat worker deployed once by hand; `OPENROUTER_API_KEY` set on it in the Cloudflare dashboard
- [ ] `CLOUDFLARE_API_TOKEN` set as a GitHub Actions repository secret
- [ ] The two `curl -X OPTIONS` checks above both return the expected status

## Troubleshooting

**The chat assistant just hangs, or every message errors** — check the
worker's own logs (`npx wrangler tail` from `worker/`) before assuming the
frontend is at fault; a missing `OPENROUTER_API_KEY` on the worker fails
every request with a 500 that never reaches the browser's network tab.

**`deploy-worker` shows as skipped in the Actions run** — expected when
`CLOUDFLARE_API_TOKEN` isn't set as a repository secret yet; the job logs a
notice rather than failing. Set the secret and re-run.

**The chat feature works locally but not on the deployed site** — almost
always the CORS allowlist in `worker/src/index.ts`; check what `Origin` the
production site actually sends against `ALLOWED_ORIGINS`.

**A Vercel preview deploy looks fine but the custom domain doesn't** — the
domain is a separate, DNS-dependent step from the deploy itself;
`vercel domains verify alexmecklin.com` tells you whether it's a wrong record
or just not propagated yet.
