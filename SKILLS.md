# APEX Skills Index

This file is the fast-load index for the APEX skill system. Every APEX skill lives
at `~/.claude/skills/apex-*/SKILL.md` (planning) and `impl.md` (coding).

**Load this file first** to find which skill to invoke — then invoke only the skill
you need. This prevents burning context on skills you won't use.

> **Skill history:** see [SKILL-HISTORY.md](./SKILL-HISTORY.md) for creation dates, versions, and sources.
> **Backend routing:** see [BACKEND-ROUTING.md](./BACKEND-ROUTING.md)

---

## Quick reference

| Skill | Invoke when | File |
|-------|-------------|------|
| **apex-orchestrate** | Session start — orient, route, detect mode | always auto-loaded |
| **apex-init** | No `docs/status.md` found — bootstrap new project | auto via orchestrate |
| **apex-plan** | Planning / designing / speccing | auto via orchestrate |
| **apex-code** | Coding / implementing / building | auto via orchestrate |
| **apex-debug** | Bug / root cause / broken / not working | auto via orchestrate |
| **apex-research** | Research any topic before deciding | invoke explicitly |
| **apex-skill-author** | Creating or editing any APEX skill | invoke explicitly |
| **apex-architecture** | Codebase architecture, DDD, ADRs | topic keyword |
| **apex-system-design** | Distributed systems, CAP, queues, caching | topic keyword |
| **apex-security** | OWASP Top 10:2025, threat model, supply-chain, escalation gates (stack-neutral) | topic keyword |
| **apex-devops** | CI/CD pipelines, Docker, GitHub Actions | topic keyword |
| **apex-iac** | Terraform, Pulumi, Ansible, IaC | topic keyword |
| **apex-k8s** | Kubernetes, Helm, ArgoCD, GitOps | topic keyword |
| **apex-devcontainer** | Dev container, isolated Claude env | topic keyword |
| **apex-aws** | AWS architecture, CDK, IAM, ECS | topic keyword |
| **apex-azure** | Azure architecture, Bicep, Entra, AKS | topic keyword |
| **apex-gcp** | GCP architecture, Cloud Run, GKE, WIF | topic keyword |
| **apex-backend** | REST APIs & services (stack-neutral: Fastify/Prisma or FastAPI/pydantic) | topic keyword |
| **apex-frontend** | React 19 + Compiler, web-stack (Next → apex-nextjs) | topic keyword |
| **apex-mobile** | React Native, Expo, EAS Build, OTA | topic keyword |
| **apex-data** | Databases, schema design, migrations (stack-neutral: Prisma/Alembic/SwiftData) | topic keyword |
| **apex-ai-systems** | LLM, RAG, AI SDK patterns | topic keyword |
| **apex-auth** | Authentication flows, sessions, OAuth2, passkeys, RBAC, multi-tenant auth | topic keyword |
| **apex-jobs** | Background jobs — queue/worker, retry/backoff, cron, DLQ, graceful shutdown; stack-neutral (BullMQ/arq/APScheduler illustration) | topic keyword |
| **apex-realtime** | Real-time push — stack-neutral (SSE default for streaming / WebSocket for bidi); Socket.io / sse-starlette / native | topic keyword |
| **apex-search** | Search and retrieval — keyword + vector hybrid (RRF), chunking, idempotent ingest; stack-neutral (pgvector/sqlite-vec illustration) | topic keyword |
| **apex-stack** | Tech stack selection — framework, database, ORM, auth, deploy for any new project | topic keyword |
| **apex-storage** | File storage — stack-neutral (object store MinIO/S3/R2 or local filesystem), MIME-from-bytes, UUID keys, time-limited private access | topic keyword |
| **apex-nextjs** | Next.js 15+ App Router, Server Components, Server Actions, caching | stack skill via `stack_skills` |
| **apex-python** | Typed Python / FastAPI — uv, ruff, mypy --strict, pydantic-settings, async boundaries | stack skill via `stack_skills` |
| **apex-swift** | Swift 6 / SwiftUI (macOS/iOS/iPadOS) — strict concurrency, @Observable, SwiftData | stack skill via `stack_skills` _(v0.1.0 — recipe pending Mac validation)_ |
| **apex-observability** | OpenTelemetry, Sentry, Grafana, logging | topic keyword |
| **apex-performance** | Profiling, Core Web Vitals, optimisation (stack-neutral: Prisma/SQLAlchemy eager-load) | topic keyword |
| **apex-accessibility** | WCAG 2.2 AA, EAA, a11y, screen readers (web + native) | topic keyword |
| **apex-testing** | TDD strategy, test pyramid, Playwright/axe-core (commands from the stack recipe) | topic keyword |
| **apex-design-system** | shadcn CLI v4, Radix/Base UI, Tailwind v4, web-stack | topic keyword |
| **apex-ui-ux-design** | UI review, interactive states, a11y gaps (web + native; 2026 calm/AI-native) | topic keyword |
| **apex-github** | GitHub setup, issue tracking, PR workflow | topic keyword |
| **apex-homelab** | Home Assistant, ESPHome, IoT, smart home | topic keyword |
| **apex-google** | Google OAuth2, Sign in with Google, Gmail/Calendar/Drive (stack-neutral: googleapis/google-api-python-client) | topic keyword |

---

## Orchestration skills (auto-loaded)

**apex-orchestrate** — Main session orchestrator. Reads `docs/status.md`, detects mode
(planning/coding), surfaces in-flight work, routes to domain specialists. Runs first
in every session. Contains pause/resume workflows and governance hard-blocks.

**apex-init** — Bootstrap a new project. Creates `docs/`, `PROJECT.md`, `REQUIREMENTS.md`,
`ROADMAP.md`, `CHANGELOG.md`, `README.md`, initial `docs/status.md`, and the System Overview
stub at `docs/technical/architecture/overview.md`. Invoked by orchestrate when no
`docs/status.md` exists.

**apex-plan** — Planning workflow. Guides spec creation, ADR writing, decision-making.
Front-loads build-changing decisions via upfront targeted elicitation, and drains the
read-once handoff to inbox-zero at session start. Produces `docs/changes/<name>.md` specs
for coding mode to execute.

**apex-code** — Coding workflow. Reads specs from `docs/changes/`, implements, moves
completed specs to `docs/changes/done/`, writes handoff docs. At a fork (spec can't run as
written) classifies small/big/gray mechanically — fix-in-place / route-to-planning /
pause-and-ask-at-L2 — with capture-at-halt to `docs/progress/` and park-and-continue for
isolable tasks. Verifies each task by running the active stack's `## Verification Recipe` (read
via the `stack_skills` binding, ADR-006) — stack-agnostic, no baked-in npm — with a
one-hypothesis verify-fail recovery loop and context7 at the write step.

**apex-debug** — Bug investigation workflow. Scientific method for root cause analysis.
Produces hypotheses, verification steps, fix recommendations. Routes the bug record to one
durable home per fact (root cause → commit body, prevention → test, high-risk → code comment,
signal → handoff, unfixed → GitHub Issue via apex-github).

**apex-handoff** — Bidirectional handoff protocol. Writes a *thin* read-once handoff
(`docs/handoff/YYYY-MM-DD.md`: Decisions / Specialist Flags / Blocked Actions / discoveries —
narrative only, since git + status.md own what-changed and live state); defines the
triage-drain (inbox-zero) read rule and the status.md In-Flight State enum
(`partial`/`blocked`/`parked`).

---

## Infrastructure & DevOps

**apex-devops** — CI/CD pipelines, Docker, containerisation, GitHub Actions workflows.
Covers the deployment pipeline layer. Use `apex-iac` for resource provisioning.

**apex-iac** — Terraform, Pulumi, Ansible, AWS CDK, SAM. Deep IaC patterns: remote state,
module structure, workspaces, drift detection, Infracost. Use when provisioning cloud
resources declaratively.

**apex-k8s** — Kubernetes workloads, Helm charts, ArgoCD GitOps, HPA, network policies,
RBAC, External Secrets Operator. Everything for running workloads on K8s.

**apex-devcontainer** — Dev Container spec (`devcontainer.json`), Features, lifecycle hooks,
isolated Claude Code environment, `~/.claude` copy-on-start pattern. **Stack-neutral** hygiene
invariants (non-root, `secrets:` not ENV, named dep-volume, UID sync) with a `## Stack assumptions`
note; language Feature + dep-volume + install command per-stack (Node ↔ Python uv).

---

## Cloud providers

**apex-aws** — AWS Well-Architected (6 pillars), compute selection (Lambda/ECS/EKS/EC2),
CDK v2 patterns, IAM execution roles, S3/DynamoDB/RDS, OIDC federation for CI,
Control Tower multi-account structure.

**apex-azure** — Azure WAF (5 pillars), compute selection (Container Apps/AKS/App Service),
Bicep + Terraform patterns, Managed Identity, Key Vault references, Entra ID/PIM,
Workload Identity Federation for CI.

**apex-gcp** — GCP Architecture Framework (6 pillars), Cloud Run, GKE Autopilot,
Workload Identity Federation, Secret Manager, Cloud SQL, Artifact Registry,
org policies, BigQuery best practices.

---

## Application development

**apex-backend** — REST API & service design. **Stack-neutral** principles (HTTP semantics,
validate-at-boundary, services-not-handlers, transactions, timeouts, consistent error contract) with
a `## Stack assumptions` swap-table; validation lib + ORM are per-stack — Zod+Prisma (TS) /
pydantic+SQLAlchemy (Python/FastAPI). Pagination, idempotency, doubt-driven review for high-stakes endpoints.

**apex-frontend** — Generic React web frontend: React 19 (Actions/`useActionState`/
`useOptimistic`/`use()`, ref-as-prop), React Compiler (stop hand-memoizing), TypeScript,
client state, composition, Tailwind v4, Web Vitals. Web-stack — Next.js depth → apex-nextjs,
native UI → apex-swift.

**apex-nextjs** — Stack skill for Next.js 15+ App Router depth. Server/Client component
boundaries, Server Action security (auth-checked + Zod-validated + revalidatePath), explicit
cache intent, server-only Data Access Layer, route file conventions. Loaded via `stack_skills`
binding; provides the `## Verification Recipe` (tsc → lint → build) read by apex-code.

**apex-python** — Stack skill for typed Python services. `uv` project tooling, `mypy --strict`
(the verifiability buy-back for dynamic Python), FastAPI async boundaries, `pydantic-settings`
typed config, schema/entity separation. The language/stack spine a RAG engine composes
`apex-ai-systems`/`apex-search` onto. Loaded via `stack_skills` binding; provides the
`## Verification Recipe` (uv sync → ruff → mypy --strict → pytest) read by apex-code.

**apex-swift** — Stack skill for Swift 6 + SwiftUI across macOS / iOS / iPadOS. Swift 6 strict
concurrency (the compiler-enforced verifiability gate), `@MainActor @Observable` view-models,
SwiftData, NavigationStack, shared SPM module + platform-conditional UI. The native Apple
client/hub layer; the RAG engine is the separate `apex-python` sidecar. _v0.1.0 — recipe authored
from research but **not yet run** (needs a Mac); validate on first Xcode build, then → 1.0.0._
Loaded via `stack_skills` binding; recipe = `swift build`/`test` + `xcodebuild` per platform + lint.

**apex-mobile** — React Native, Expo managed workflow, Expo Router, EAS Build + Submit,
EAS Update (OTA), SecureStore, push notifications, app store preparation.

**apex-ai-systems** — LLM integration, RAG pipelines, AI SDK (Vercel), tool use,
prompt engineering, streaming, evaluation patterns.

**apex-stack** — Tech stack selection for new projects. Asks 7 structured questions (app type,
deployment target, language familiarity + AI-reliance, timeline, constraints, features, scale),
then selects **merit-based across ecosystems** (Python/Go/Ruby/JVM/.NET/Rust/JS — never JS-by-
default), weighing **AI-buildability and verifiability** heavily per ADR-005/006. Cross-ecosystem
candidate menu + lock-in table; names the ruled-out runner-up. Runs the **coverage gate** (registry
check → writes the `stack_skills` binding, or records a gap and proceeds). Produces ADR-001.

**apex-auth** — Authentication. **Stack-neutral** invariants (OWASP argon2id, session-derived
tenant scoping, passkey counter check, OAuth state, generic auth errors, refresh rotation) with a
`## Stack assumptions` swap-table. Covers signup/login/logout, password reset, magic links, OAuth2,
MFA, passkeys/WebAuthn, sessions vs JWT, RBAC, multi-tenant (invite flows, isolation), route
protection. Library choice is per-stack: **Better Auth** (TS) / **FastAPI Users** (Python) /
**AuthenticationServices** (Apple); Lucia deprecated. Node+TS worked code in
`references/nodejs-typescript.md`.

**apex-jobs** — Background job queue implementation. **Stack-neutral** concepts — queue/worker
separation, retry + exponential backoff, idempotent handlers, cron/repeatable jobs, dead letter
queues, graceful shutdown, durable backing. Concrete examples illustrate **BullMQ + Redis + Node**
and adapt to the bound stack (Python arq / Celery / APScheduler, or a SQLite-backed queue for a
local single-user app) via a `## Stack assumptions` swap-table; the BullMQ/TS worked code lives in
`references/bullmq-typescript.md`. Backing options: Redis / Postgres (pg-boss) / SQLite.

**apex-realtime** — Real-time push. **Stack-neutral** invariants (auth-before-connect,
identity-from-token, room-scoped emits, named events, clean close, reconnect + REST catch-up) with a
`## Stack assumptions` transport matrix: **SSE = 2026 default for server→client streaming** (incl.
LLM tokens) / **WebSocket** for bidirectional; pub/sub backplane only for multi-instance (a
single-user hub needs none). Library per-stack — Socket.io (TS) / sse-starlette + native WebSocket
(Python) / URLSessionWebSocketTask (Swift). Socket.io+SSE TS code in `references/socketio-typescript.md`.

**apex-storage** — File upload and storage. **Stack-neutral** core (MIME-from-bytes, opaque
UUID keys, store-before-DB-record, time-limited private access, soft-delete + async GC, env-var
config) with a `## Stack assumptions` swap-table. Object-store backends (MinIO/S3/R2) share one
SDK — zero-code migration via env var swap; a **local-filesystem** backend (single-user hub) is a
distinct code path (no SDK/presign — authenticated streaming route + path-traversal guard). The
S3-SDK + TypeScript worked examples live in `references/s3-typescript.md`.

**apex-search** — Search and RAG retrieval. **Stack-neutral** concepts — keyword + vector hybrid
search (RRF reranking), chunking strategies, embedding generation (Ollama local or OpenAI),
dimension-locking, idempotent ingest, and handoff to apex-ai-systems for LLM context injection.
Concrete DDL/code illustrates **Postgres + pgvector + TypeScript** and adapts to the bound stack
(e.g. SQLite + sqlite-vec + Python) via a `## Stack assumptions` swap-table; the TS/pgvector worked
examples live in `references/postgres-typescript.md`. Optional: Typesense for typo-tolerant facets.

**apex-data** — Schema design & migrations. **Stack-neutral** safety invariants (expand/contract,
nullable-then-backfill, FK indexing, immutable migrations, explicit cascade) with a `## Stack
assumptions` swap-table; migration tool is per-stack — Prisma (TS) / Alembic+SQLAlchemy or SQLModel
(Python) / SwiftData or GRDB (Apple). Indexing strategies, query optimisation, multi-tenancy.

---

## Architecture & Design

**apex-architecture** — Codebase architecture, Domain-Driven Design, bounded contexts,
CQRS, ADR authoring, dependency analysis, modularisation.

**apex-system-design** — Distributed systems design: CAP theorem, consistency models,
caching strategies (cache-aside/write-through), message queues (SQS/Kafka),
rate limiting (token bucket), circuit breakers, distributed locking.

**apex-ui-ux-design** — Pre-coding UI spec review: interactive states, accessibility gaps,
design quality, responsiveness, loading/error/empty states. Surface-neutral — web
(Tailwind/CSS) default, native (SwiftUI / Liquid Glass) via § Stack assumptions. Carries
current 2026 practice: calm UI, AI-native/conversational UX, motion-as-structure.

**apex-design-system** — shadcn/ui (CLI v4 + MCP + registries) on Radix (unified package) or
Base UI, Tailwind v4 design tokens (`@theme`, container queries), Storybook, component API
design. Web-stack — native design systems → apex-swift.

---

## Quality & Operations

**apex-security** — **OWASP Top 10:2025** (incl. A03 Software Supply Chain, A10 Exceptional
Conditions), threat modelling, BLOCK/FLAG escalation gates, authn/authz, input validation, secrets,
security headers, dependency/supply-chain integrity. **Stack-neutral** principles; crypto/validation/
audit tooling per-stack (Node `crypto`/bcrypt/Zod ↔ Python `secrets`/argon2/pydantic) via § Stack assumptions.

**apex-observability** — OpenTelemetry instrumentation, Sentry error tracking,
structured logging, Grafana dashboards, alerting, SLIs/SLOs.

**apex-performance** — Core Web Vitals (LCP/INP/CLS), bundle analysis, DB query profiling, caching,
CDN, lazy loading. **Stack-neutral** invariants (eager-load not N+1, index hot columns, paginate,
cache, don't block the loop) with a `## Stack assumptions` note; eager-load API per-stack (Prisma
`include` ↔ SQLAlchemy `selectinload`).

**apex-accessibility** — WCAG 2.2 AA compliance (incl. target size, dragging alternative,
accessible authentication), EAA/EN 301 549 legal context, ARIA patterns, keyboard
navigation, screen reader testing (web + SwiftUI/Android via § Stack assumptions), colour
contrast, focus management. Automation catches ~40% → manual screen-reader pass required.

**apex-testing** — Framework-agnostic test strategy: TDD/RED-GREEN, the test pyramid, DAMP
naming, regression tests, Playwright E2E, axe-core a11y, coverage targets. Concrete test
commands come from the bound stack's Verification Recipe (apex-code runs them), not hardcoded npm.

---

## Specialised

**apex-github** — Repository setup, branch protection, issue taxonomy (type/priority/status/area
labels), Conventional Commits, GitHub Projects v2, release management (semver +
Keep a Changelog), Dependabot, CodeQL, secret scanning. Issues *is* the unfixed-bug backlog
(fixed-with-test → no issue), gated by a security/visibility rail (never auto-file security/
auth/data-loss details; check repo visibility before filing).

**apex-homelab** — Home Assistant hub, ESPHome ESP32 firmware, Zigbee/MQTT/Matter
protocols, presence detection (mmWave radar), automation design, REST/WebSocket
API integration, local-first design, IoT VLAN security.

**apex-google** — Google OAuth2 / OIDC (Sign in with Google), Workspace API integration (Gmail,
Calendar, Drive), service accounts, scope selection, token-storage rules. **Stack-neutral** platform
invariants (use `sub` not email, verify ID token server-side, encrypt refresh tokens, minimal scopes)
with a `## Stack assumptions` swap-table; client per-stack — `googleapis` (Node) / `google-api-python-client`
(Python). Node+TS worked code in `references/nodejs-typescript.md`. Distinct from `apex-gcp` (infra).

**apex-research** — Deep research workflow: pre-flight scoping questions, tiered sources
(Context7 official docs → WebSearch → WebFetch) with confidence derived from tier
([VERIFIED]/[ASSUMED]/[COMMUNITY]), parallel research agents, output hand-off
(inline / `docs/research/` / ADR), and staleness tracking. Single-file, planning-only.

**apex-skill-author** — How to create and update APEX skills: the Iron Law (baseline-test
before writing), skill-type taxonomy → test style, research-first grounding via
`apex-research`, frontmatter contract (incl. the `description` rule), the triple-write
(registry + index + history), SKILL-vs-impl split, content rules, the 500-line cap, and
authoring each file to its executor's capability floor (no judgment calls in `impl.md` for
DeepSeek Flash; explicit scope in `SKILL.md` for Claude), and the **stack-skill family**
(`apex-<framework>` — distinct category, always SKILL+impl, mandatory `apex-research`, and a
runnable `## Verification Recipe` empirically validated against a real project, not doc-sourced).
Single-file, planning-only. The source of truth for skill authoring.

**apex-animation** — Motion/GSAP animations, `prefers-reduced-motion` compliance,
performance-safe animation patterns.

**apex-figma** — Fetch Figma design context via MCP, translate to project components
following design tokens and existing conventions.

---

## Session workflow reference

```
New session
  └── apex-orchestrate reads docs/status.md
        ├── In-flight work? → surface and ask
        ├── Planning mode (Anthropic)
        │     └── apex-plan → writes docs/changes/*.md specs
        └── Coding mode (DeepSeek)
              └── apex-code → executes specs, writes handoff

Pause: saves draft/checkpoint to docs/status.md In-Flight table
Resume: reads In-Flight table, continues from checkpoint
```

## Hard blocks (enforced by orchestrator)

These are **permanent** regardless of autonomy level:
- `push to main` → push to branch + create PR instead
- `merge the PR` → merge via GitHub UI after your review
- `drop the users table` → use a migration

---

_Updated: 2026-05-28 | Skills count: 35 APEX + 40 GSD + 15 misc_
