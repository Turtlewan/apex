# ADR-026 — Codex (GPT-5.5) as a third independent model family: reviewer + ceiling coder

Status: **Accepted (design)** — execution phased (P1 reviewer pilot → P2 ceiling coder, gated on P1).
Date: 2026-06-22 (session 60). Supersedes parts of ADR-019; narrows ADR-020; discharges the ADR-025
soft-pool guard; realizes ADR-015's cross-model review. Research: `docs/research/codex-migration/`.

## Context
The ADR-024/025 router routes coding across `{DeepSeek Flash, DeepSeek Pro, Sonnet 4.6, Opus 4.8}`,
planning stays Opus. Three standing pains:
1. **Opus-as-coder starves planning** — interactive Claude coding (ADR-025) draws the *same Max pool*
   as planning; the Opus weekly cap is the scarcest resource. The "soft pool guard" is mode discipline,
   not enforcement.
2. **Image gate** (ADR-020) — DeepSeek is text-only, so visual work needs a Claude detour.
3. **Cross-model review** (ADR-015) was designed but tagged Mac-gated (assumed two co-located
   Claude-family backends).

OpenAI **Codex** (`gpt-5.5`) is reachable as a genuinely independent family via `codex exec` — its own
process + auth (`~/.codex/auth.json`), which **does not read `ANTHROPIC_BASE_URL`**. So a DeepSeek-backed
apex-code session can call it directly for review or for a build task. (Cost/parity basis: WS-A–D.)

## Decision
1. **Sanction Codex (`gpt-5.5`) as a third APEX model family** — distinct from Anthropic and DeepSeek.
2. **Codex as independent reviewer** — realizes ADR-015 on any host: post-build, gated per-spec,
   `codex exec --sandbox read-only --json --output-schema`, BLOCK/FLAG/CLEAN, **advisory only** (never
   auto-applies; no `@codex fix it`).
3. **GPT-5.5 replaces Opus as the coding ceiling and Sonnet as the image tier** (Codex is sighted).
   Coder menu collapses to `{flash, pro, codex}`. **Opus exits the coder set** → planning + reviewer
   only. This **resolves the ADR-025 pool-starvation** (the ceiling no longer spends the scarce Opus
   pool) and makes ADR-020's image gate **moot** (the coder can see).
4. **Family-aware review routing — reviewer family ≠ builder family, per task** (preserves
   evaluator-independence, ADR-010 / Odysseus anti-collusion):
   - DeepSeek-built task → **Codex** reviews.
   - Codex-built task → **Claude (Opus)** reviews (Opus's load shifts from coding → light read-only review).
5. **Guardrails for Codex-built tasks** (which run in Codex's own agent loop, outside apex-code's
   Karpathy/scope/wave enforcement) move into the `codex exec` prompt + the repo's `AGENTS.md`. Scope
   this to the ceiling/escalation case (typically a single sequential hard task) — parallel Codex
   coding requires the Workflow rebuild and is **out of scope** here.

## Consequences
- **Simplification:** router shrinks 4→3 coders; image-gate special-case retired; soft-pool guard
  discharged. Three vendors, no task built+reviewed by one family.
- **Costs/risks:** new hard dependency on the Codex CLI (install + model-ID churn — pin `gpt-5.5`); a
  second build-side billing pool (ChatGPT window or API key); Codex-built tasks bypass apex-code
  enforcement (mitigated by prompt + AGENTS.md, kept scoped to the ceiling); `~/.codex` dir hygiene
  (a non-Codex tool currently shares it).
- **Standing invariant added:** *builder family ≠ reviewer family* for any spec under cross-family review.

## Alternatives rejected
- **Keep Opus as coder** — strictly worse: pricier, pool-starving, blind. Rejected.
- **Codex reviews everything incl. its own builds** — same-family self-review; breaks independence.
- **Full migration to Codex now** — large, premature; pilot-first (research README recommendation).
