## Intent

apex-stack guides the "what technology should I build this with" decision at project start —
before apex-init, before any code. It asks structured questions about app type, constraints,
and feature requirements, then outputs an opinionated stack preset with a lock-in analysis
and a written ADR. Distinct from apex-architecture (structures chosen code) and
apex-system-design (designs distributed patterns) — this skill answers: "what runtime,
framework, database, ORM, and auth do I use?"

## Key decisions

### SKILL.md content

**When to activate — exact trigger phrases:**
- "what stack should I use"
- "starting a new project" / "new app"
- "which framework / database / ORM should I choose"
- "should I use X or Y" for any technology category
- invoked automatically before apex-init on a new project

**7 questions to ask (in this order — order matters):**
1. What type of app? (SaaS / API-only / real-time / content / mobile-first / data-heavy / enterprise)
2. Deployment target? (Vercel / Railway / Fly.io / AWS / Azure / GCP / Cloudflare / bare metal)
3. Team language familiarity? (TypeScript / Python / Go / other)
4. Timeline? (prototype/MVP vs production-grade)
5. Hard constraints? (compliance: HIPAA/SOC2, existing infra, budget cap)
6. Key features needed? (real-time, file uploads, AI/LLM, payments, search — tick list)
7. Expected scale in year 1? (hundreds / thousands / millions of users)

**Decision table — 8 presets (write as a Markdown table):**

| Profile | Framework | Database | ORM | Auth | Deploy |
|---------|-----------|----------|-----|------|--------|
| SaaS fullstack | Next.js 15 App Router | PostgreSQL | Prisma | Auth.js v5 or Clerk | Vercel + Railway/Neon |
| API-only service | Hono or Fastify | PostgreSQL | Drizzle | JWT (custom) | Railway or Fly.io |
| Real-time app | Next.js 15 + Supabase realtime | PostgreSQL (via Supabase) | Prisma | Supabase Auth | Vercel + Supabase |
| Mobile + API | Expo (React Native) + Hono | PostgreSQL | Drizzle | JWT (custom) | Railway or Fly.io |
| Content / blog | Astro or Next.js | PostgreSQL or SQLite | Prisma or Drizzle | Simple JWT or none | Vercel |
| Edge / global | Remix or Next.js | SQLite / Turso / D1 | Drizzle | Lucia | Cloudflare Pages |
| AI-first app | Next.js 15 + AI SDK | PostgreSQL + pgvector | Prisma | Auth.js v5 | Vercel + Neon |
| Enterprise / B2B | Next.js 15 + Hono or NestJS | PostgreSQL | Prisma | Auth.js v5 + SAML | AWS or Azure |

**Lock-in table (separate from preset table — required alongside every recommendation):**

| Component | Lock-in | Swap cost | Note |
|-----------|---------|-----------|------|
| Framework (Next.js, Remix…) | 🔴 High | Near-rewrite | Most consequential choice |
| Database engine | 🔴 High | Full data migration | Default to PostgreSQL |
| Hosted auth (Clerk, Supabase Auth) | 🟡 Medium | Data export + re-integration | Check pricing at scale before committing |
| Auth library (Auth.js, Lucia) | 🟡 Medium | Refactor session logic | Lower exit cost than hosted |
| ORM (Prisma vs Drizzle) | 🟡 Medium | Schema compat work | Both TypeScript-first; Drizzle is lighter |
| API style (REST vs tRPC) | 🟡 Medium | Frontend contract refactor | tRPC only viable in full-TS monorepo |
| Deployment platform | 🟢 Low | Dockerfile + env vars | Avoid platform-specific edge features |
| Payment provider | 🟡 Medium | Customer migration | Stripe is default |
| Email provider | 🟢 Low | Swap API calls | 1-2 hour swap |

**Hard blocks:**
- Never recommend MongoDB for apps with relational data — PostgreSQL handles documents via JSONB
- Never recommend a hosted auth provider (Clerk, Supabase Auth) without noting its pricing at 10k+ MAU
- Never recommend tRPC for projects that are not TypeScript end-to-end
- Never output a stack recommendation without the lock-in table

**Review checklist:**
- [ ] Stack preset selected and all 5 components documented (framework, database, ORM, auth, deploy)
- [ ] Lock-in table reviewed — high lock-in items confirmed intentionally, not by default
- [ ] Hosted services priced at expected scale (MAU × price per seat)
- [ ] ADR written to docs/technical/adr/ADR-001-stack.md
- [ ] Any gaps in apex-* coverage flagged (e.g. "apex-payments not yet a skill")

**Frontmatter for SKILL.md:**
```yaml
skill: apex-stack
backend: claude
version: 1.0.0
last_updated: 2026-05-28
sources:
  - State of JS 2024 — stateofjs.com
  - Next.js Docs — nextjs.org/docs
  - Prisma Docs — prisma.io/docs
  - Drizzle Docs — orm.drizzle.team
  - Hono Docs — hono.dev
  - Auth.js Docs — authjs.dev
staleness_threshold: 30d
```

---

### impl.md content

The impl.md runs in coding mode when scaffolding a new project based on the chosen preset.

**NEVER do:**
- Install packages without verifying they are actively maintained (no release in > 12 months = flag it)
- Use package names from this skill verbatim without checking npm — names change (e.g. `next-auth` → `@auth/core`)
- Hardcode any secret or API key in scaffold files — .env.example from day 0
- Skip writing the ADR — first commit must include docs/technical/adr/ADR-001-stack.md

**ALWAYS do:**
- Write ADR-001-stack.md before any application code
- Verify exact package name and latest major version on npm before installing
- Create .env.example with all required variable keys (values empty, not real secrets)
- Add a "Stack" section to PROJECT.md (or create it) listing the chosen preset

**Code example — ADR-001 template DeepSeek should output:**
```markdown
# ADR-001: Technology Stack
**Date:** YYYY-MM-DD
**Status:** Accepted

## Context
[App type] requiring [key features]. Team: [language familiarity].
Deployment target: [platform]. Scale expectation: [year-1 estimate].

## Decision

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Framework | Next.js 15 | [reason] |
| Database | PostgreSQL | [reason] |
| ORM | Prisma | [reason] |
| Auth | Auth.js v5 | [reason] |
| Deploy | Vercel + Railway | [reason] |

## Lock-in accepted
- [High lock-in choice]: accepted because [reason]

## Consequences
[trade-offs noted, options ruled out and why]
```

**Verification checklist:**
- [ ] ADR written to docs/technical/adr/ADR-001-stack.md
- [ ] All chosen packages confirmed on npm: exists, active, correct current name
- [ ] .env.example created with all required keys (no real values)
- [ ] PROJECT.md has a "Stack" section
- [ ] No secrets hardcoded in any file

**Frontmatter for impl.md:**
```yaml
skill: apex-stack
backend: deepseek
version: 1.0.0
last_updated: 2026-05-28
sources:
  - State of JS 2024 — stateofjs.com
  - Next.js Docs — nextjs.org/docs
  - Prisma Docs — prisma.io/docs
  - Drizzle Docs — orm.drizzle.team
  - Hono Docs — hono.dev
  - Auth.js Docs — authjs.dev
staleness_threshold: 30d
```

---

### Registry row to add in `~/.claude/registry/domains.md`

```
| stack | apex-stack/SKILL.md | apex-stack/impl.md | — | tech stack, framework selection, database choice, ORM, which framework, project start, new project, stack decision, Next.js vs, Prisma vs Drizzle, Clerk vs Auth.js, what stack |
```

### SKILLS.md additions in `~/apex/SKILLS.md`

Quick reference table row (under the existing table):
```
| **apex-stack** | Tech stack selection — framework, database, ORM, auth, deploy for any new project | topic keyword |
```

New entry under the **Application development** section (after apex-ai-systems):
```
**apex-stack** — Tech stack selection for new projects. Asks 7 structured questions (app type,
deployment target, language familiarity, timeline, constraints, features, scale), then outputs
an opinionated preset from 8 named profiles (SaaS fullstack, API-only, real-time, mobile+API,
content, edge, AI-first, enterprise). Always includes a lock-in analysis table. Produces ADR-001.
```

### SKILL-HISTORY.md row to prepend in `~/apex/SKILL-HISTORY.md`

```
| 2026-05-28 | apex-stack | SKILL + impl | 1.0.0 | created | Tech stack selection skill — 8 app-type presets, lock-in table, 7 structured questions, ADR-001 output | State of JS 2024, Next.js Docs, Prisma Docs, Drizzle Docs, Hono Docs, Auth.js Docs |
```

## Gotchas / edge cases

- **Package name drift**: `next-auth` was renamed to `@auth/core` + `next-auth` (v5 beta). The impl.md must warn DeepSeek to verify current npm names, not copy from skill verbatim.
- **Supabase dual role**: Supabase appears in both the real-time preset (as a realtime provider) and as a hosted auth option. The SKILL.md must make clear these are separate choices — you can use Supabase realtime without Supabase Auth.
- **tRPC scope restriction**: tRPC only works if both client and server are TypeScript in the same repo. If the mobile preset (Expo) is in a separate repo from the API, tRPC doesn't apply. The hard block must mention this.
- **Deployment ≠ hosting**: Vercel is a deploy target but also a feature provider (edge middleware, image optimization). If the user later self-hosts or moves to Railway, those features need replacing. Note this under Vercel's lock-in row.
- **NestJS at edge**: NestJS uses reflect-metadata decorators and does not run in Cloudflare Workers or Vercel edge runtime. Don't recommend it for edge profiles — only for AWS/Azure/Railway.
- **SKILL-HISTORY.md prepend**: coding mode must prepend (not append) to SKILL-HISTORY.md. The file is sorted newest-first.
- **staleness**: 30d threshold is intentional — JS ecosystem presets can drift within a month. If the skill is loaded and `last_updated` is >30 days ago, planning mode should note it may be stale.

## Files to touch

- `~/.claude/skills/apex-stack/SKILL.md` — create (new skill, planning-mode guidance)
- `~/.claude/skills/apex-stack/impl.md` — create (new skill, coding-mode patterns)
- `~/.claude/registry/domains.md` — add `stack` row (see exact row above)
- `~/apex/SKILLS.md` — add quick-ref table row + Application development entry
- `~/apex/SKILL-HISTORY.md` — prepend creation row (see exact row above)
