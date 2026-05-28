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
| **apex-architecture** | Codebase architecture, DDD, ADRs | topic keyword |
| **apex-system-design** | Distributed systems, CAP, queues, caching | topic keyword |
| **apex-security** | OWASP, auth, threat model | topic keyword |
| **apex-devops** | CI/CD pipelines, Docker, GitHub Actions | topic keyword |
| **apex-iac** | Terraform, Pulumi, Ansible, IaC | topic keyword |
| **apex-k8s** | Kubernetes, Helm, ArgoCD, GitOps | topic keyword |
| **apex-devcontainer** | Dev container, isolated Claude env | topic keyword |
| **apex-aws** | AWS architecture, CDK, IAM, ECS | topic keyword |
| **apex-azure** | Azure architecture, Bicep, Entra, AKS | topic keyword |
| **apex-gcp** | GCP architecture, Cloud Run, GKE, WIF | topic keyword |
| **apex-backend** | REST APIs, Node.js, Prisma, Postgres | topic keyword |
| **apex-frontend** | React, Next.js, TypeScript | topic keyword |
| **apex-mobile** | React Native, Expo, EAS Build, OTA | topic keyword |
| **apex-data** | Databases, schema design, migrations | topic keyword |
| **apex-ai-systems** | LLM, RAG, AI SDK patterns | topic keyword |
| **apex-auth** | Authentication flows, sessions, OAuth2, passkeys, RBAC, multi-tenant auth | topic keyword |
| **apex-jobs** | Background job queues — BullMQ, workers, cron jobs, retry/backoff, dead letter queues | topic keyword |
| **apex-realtime** | Real-time push — Socket.io, SSE, user-scoped rooms, Redis adapter, AI streaming | topic keyword |
| **apex-search** | Search and retrieval — PostgreSQL FTS, pgvector, hybrid RRF, RAG chunking pipeline | topic keyword |
| **apex-stack** | Tech stack selection — framework, database, ORM, auth, deploy for any new project | topic keyword |
| **apex-storage** | File storage — MinIO (local), S3/R2 (cloud), presigned URLs, MIME validation | topic keyword |
| **apex-observability** | OpenTelemetry, Sentry, Grafana, logging | topic keyword |
| **apex-performance** | Profiling, Core Web Vitals, optimisation | topic keyword |
| **apex-accessibility** | WCAG AA, a11y, screen readers | topic keyword |
| **apex-testing** | Vitest, Playwright, testing strategy | topic keyword |
| **apex-design-system** | shadcn/ui, Tailwind, Storybook | topic keyword |
| **apex-ui-ux-design** | UI review, interactive states, a11y gaps | topic keyword |
| **apex-github** | GitHub setup, issue tracking, PR workflow | topic keyword |
| **apex-homelab** | Home Assistant, ESPHome, IoT, smart home | topic keyword |
| **apex-google** | Google OAuth2, Sign in with Google, Gmail/Calendar/Drive APIs | topic keyword |

---

## Orchestration skills (auto-loaded)

**apex-orchestrate** — Main session orchestrator. Reads `docs/status.md`, detects mode
(planning/coding), surfaces in-flight work, routes to domain specialists. Runs first
in every session. Contains pause/resume workflows and governance hard-blocks.

**apex-init** — Bootstrap a new project. Creates `docs/`, `PROJECT.md`, `REQUIREMENTS.md`,
`ROADMAP.md`, `CHANGELOG.md`, `README.md`, and initial `docs/status.md`. Invoked by
orchestrate when no `docs/status.md` exists.

**apex-plan** — Planning workflow. Guides spec creation, ADR writing, decision-making.
Produces `docs/changes/<name>.md` specs for coding mode to execute.

**apex-code** — Coding workflow. Reads specs from `docs/changes/`, implements, moves
completed specs to `docs/changes/done/`, writes handoff docs.

**apex-debug** — Bug investigation workflow. Scientific method for root cause analysis.
Produces hypotheses, verification steps, fix recommendations.

**apex-handoff** — Session end workflow. Writes `docs/handoff/YYYY-MM-DD.md` with build
summary, files changed, current state, and next steps.

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
isolated Claude Code environment. Includes the `~/.claude` copy-on-start pattern for
mounting skills into containers.

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

**apex-backend** — REST API design, Node.js/TypeScript, Prisma ORM, PostgreSQL,
authentication patterns (JWT, sessions), input validation (Zod).

**apex-frontend** — React, Next.js 15 App Router, TypeScript, TanStack Query, Zustand,
component patterns, routing, server components.

**apex-mobile** — React Native, Expo managed workflow, Expo Router, EAS Build + Submit,
EAS Update (OTA), SecureStore, push notifications, app store preparation.

**apex-ai-systems** — LLM integration, RAG pipelines, AI SDK (Vercel), tool use,
prompt engineering, streaming, evaluation patterns.

**apex-stack** — Tech stack selection for new projects. Asks 7 structured questions (app type,
deployment target, language familiarity, timeline, constraints, features, scale), then outputs
an opinionated preset from 8 named profiles (SaaS fullstack, API-only, real-time, mobile+API,
content, edge, AI-first, enterprise). Always includes a lock-in analysis table. Produces ADR-001.

**apex-auth** — Authentication implementation. Covers signup/login/logout, password reset,
magic links, OAuth2 social providers, MFA, passkeys/WebAuthn, session management (stateful
vs JWT refresh rotation), RBAC, multi-tenant auth (per-tenant roles, invite flows, tenant
isolation), and route protection patterns. Library decision table: Auth.js, Better Auth,
Lucia, Clerk, Supabase Auth.

**apex-jobs** — Background job queue implementation. Primary: BullMQ + Redis (persistent
server, AWS ElastiCache at scale). Covers queue/worker setup, job options (attempts,
backoff, delay, priority), cron/repeatable jobs, job chaining (FlowProducer), dead letter
queues, graceful shutdown, Bull Board monitoring dashboard. Alternative: pg-boss for
PostgreSQL-backed jobs without Redis.

**apex-realtime** — Real-time server-to-client push. Primary: Socket.io + Redis adapter
(multi-instance safe). Covers user-scoped rooms, socket auth middleware, external event
→ broadcast flow (finance feeds, Home Assistant webhooks, Telegram), SSE for AI token
streaming, reconnection handling, and catch-up REST pattern for missed events.

**apex-storage** — File upload and storage. Local-first with MinIO (Docker, S3-compatible),
zero-code migration to AWS S3 or Cloudflare R2 via env var swap. Covers generic file
uploads, server-side MIME validation (bytes not filename), UUID-based storage keys,
presigned GET URLs for private files, soft-delete pattern, and multipart uploads for
large files.

**apex-search** — Search and RAG retrieval. PostgreSQL full-text search + pgvector hybrid
search (RRF reranking) as the default stack — no extra infra. Covers chunking strategies,
embedding generation (Ollama local or OpenAI), HNSW index setup, hybrid search queries,
idempotent ingest pipeline, and handoff to apex-ai-systems for LLM context injection.
Optional: Typesense for typo-tolerant full-text with facets.

**apex-data** — Schema design, migrations (Prisma/Drizzle), indexing strategies,
query optimisation, connection pooling, multi-tenancy patterns.

---

## Architecture & Design

**apex-architecture** — Codebase architecture, Domain-Driven Design, bounded contexts,
CQRS, ADR authoring, dependency analysis, modularisation.

**apex-system-design** — Distributed systems design: CAP theorem, consistency models,
caching strategies (cache-aside/write-through), message queues (SQS/Kafka),
rate limiting (token bucket), circuit breakers, distributed locking.

**apex-ui-ux-design** — Pre-coding UI spec review: interactive states, accessibility gaps,
design quality, mobile responsiveness, loading/error/empty states.

**apex-design-system** — shadcn/ui component library, Tailwind v4 design tokens,
Storybook stories, component API design.

---

## Quality & Operations

**apex-security** — OWASP Top 10, threat modelling, authentication (JWT/OAuth2/OIDC),
authorisation, input validation, secrets management, security headers.

**apex-observability** — OpenTelemetry instrumentation, Sentry error tracking,
structured logging, Grafana dashboards, alerting, SLIs/SLOs.

**apex-performance** — Core Web Vitals, bundle analysis, database query profiling,
caching strategies, CDN, lazy loading, React performance patterns.

**apex-accessibility** — WCAG 2.1 AA compliance, ARIA patterns, keyboard navigation,
screen reader testing, colour contrast, focus management.

**apex-testing** — Test strategy, Vitest unit tests, Playwright E2E, testing pyramid,
mocking patterns, coverage targets.

---

## Specialised

**apex-github** — Repository setup, branch protection, issue taxonomy (type/priority/status/area
labels), Conventional Commits, GitHub Projects v2, release management (semver +
Keep a Changelog), Dependabot, CodeQL, secret scanning.

**apex-homelab** — Home Assistant hub, ESPHome ESP32 firmware, Zigbee/MQTT/Matter
protocols, presence detection (mmWave radar), automation design, REST/WebSocket
API integration, local-first design, IoT VLAN security.

**apex-google** — Google OAuth2 / OIDC (Sign in with Google), Google Workspace API integration
(Gmail, Calendar, Drive), service account patterns, scope selection, token storage rules,
`googleapis` npm client, `google-auth-library`. Distinct from `apex-gcp` (infrastructure).

**apex-research** — Deep research workflow: tiered sources (Context7 official docs →
WebSearch → WebFetch), confidence tagging ([VERIFIED]/[ASSUMED]/[COMMUNITY]),
parallel research agents, ADR output format, staleness tracking.

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
