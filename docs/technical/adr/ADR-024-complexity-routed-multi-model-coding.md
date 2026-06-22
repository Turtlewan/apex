# ADR-024: Complexity-routed multi-model coding (4-model, 2-backend)

**Date:** 2026-06-21
**Status:** Accepted — **coder set amended by [ADR-026](./ADR-026-codex-third-model-family.md) (2026-06-22):** the menu collapses 4→3 `{flash, pro, codex}`; Sonnet/Opus are retired as coders (Opus → planner + reviewer-of-Codex-tasks); GPT-5.5/Codex becomes the image tier + text ceiling, and the `pro`→ceiling escalation now targets `codex`. Routing rubric here still applies; substitute Codex for the retired Claude coder tiers.
**Supersedes/extends:** ADR-019 (coder_tier flash/pro/split) — generalises the 2-tier DeepSeek dial to a 4-model, 2-backend routing layer.
**Related:** ADR-016 (LiteLLM as eventual backend rewire), ADR-015 (one-retry escalation cap), ADR-020 (capability-routed UI escalation), ADR-023 (pre-authorise before dispatch).
**Research:** `docs/research/model-routing/` (WS-A capability/cost · WS-B mechanism · WS-C routing literature · WS-D billing/rate-limit + README synthesis).

## Context

APEX coding ran a single model per build (DeepSeek V4 Flash default, Pro via the `coder_tier` dial). The user asked for per-build-item routing: Opus (planner) scores each item's complexity and routes it to the cost-optimal coder among **Opus 4.8, Sonnet 4.6, DeepSeek V4 Flash, V4 Pro** — quality as a hard floor, batched to minimise model switches, planning stays Opus. Research surfaced three structural constraints that reshape a flat 4-model ladder into a two-backend specialist model:

- **C1 — Backend wall:** `ANTHROPIC_BASE_URL` is session-level; Claude {Opus, Sonnet} and DeepSeek {Flash, Pro} cannot be mixed per-task in one session. Within-backend `model:` switching is free (zero restart). [VERIFIED]
- **C2 — Image gate:** both DeepSeek models are text-only via API; any visual build-item must route to Claude. [VERIFIED]
- **C3 — Pool contention:** interactive Claude Code shares the planning subscription pool; Opus's weekly cap is APEX's scarcest resource. "Claude is free at the margin" is false unless run headless. [VERIFIED structure]

## Options considered

| Fork | Options | Decision |
|------|---------|----------|
| Routing model | Flat 4-model ladder · **Two-backend specialist (pick backend, then model-in-backend)** | Two-backend specialist |
| F1 — Claude-batch execution | **Interactive + manual backend swap** · Headless `claude -p` (isolated pool, capped) · LiteLLM gateway (seamless, infra) | Interactive (v1); headless = later upgrade if pool contention bites; gateway = end-state (ADR-016) |
| F2 — Opus as coder | Sonnet-only · Headless-capped · **Complexity-gated (high threshold), interactive** | Complexity-gated — Opus only when item complexity genuinely warrants |
| F3 — Escalation on verify-fail | **Auto within backend, gate to cross** · Fully auto · Always gated | Auto within backend; approval gate before DeepSeek→Claude crossing |
| Routing strategy | Pure cascade (cheap-first, escalate) · **Route-first + escalate-on-fail safety net** | Route-first (upfront), per WS-C — avoids paying cheap-generation on every task |
| Routing unit | **Per-task** · per-wave · per-spec | Per-task — batching makes switch-count = backend-crossings regardless, so finest granularity costs no extra switches; matches ADR-019 split |
| Sonnet's lane | mid-tier text+image · **image-only** | Image-only — Pro strictly dominates Sonnet on every text axis at ~1/17th the cost |
| Opus for text | **Proactive ceiling = Pro; Opus via gated escalation only** · proactive Opus allowed | Opus earned reactively on a real Pro verify-fail, not guessed upfront — captures the ~8pp edge with zero waste on tasks Pro passes |

## Decision

Adopt a **route-first, two-backend, complexity-routed coding layer** as an extension of `coder_tier`. The routing **unit is the task** (one concern layer — finest cost precision; batching makes its switch-count identical to coarser units). Opus scores each task at **plan time** (zero marginal cost — it already writes Files-to-Change) via a **two-step selection**:

**Step 1 — eligibility filter (hard gates, no judgment):** project model menu ∩ {image input needed? → drop Flash + Pro (C2)} ∩ {output > ~64K expected? → drop Sonnet} → the *eligible set*.

**Step 2 — cheapest eligible model that clears the complexity bar.** Cost order (hybrid basis) is monotonic: **Flash < Pro < Sonnet < Opus**. Complexity = Opus judgment against an explicit rubric — logic novelty · blast radius/coupling · risk domain · horizon · size · (brownfield) file-health — **not a point-formula**. The collapsed tree:

- **Text task** → **Flash** (routine) / **Pro** (hard kernel: novel logic, security/concurrency, high blast radius, large multi-file). **Pro is the proactive text ceiling** — Opus is *not guessed* for text (Pro is near-Opus on pure coding at ~1/29th the cash cost and pool-neutral). Opus is reached for text **only via gated escalation** when Pro fails verification.
- **Image task** → **Sonnet** (moderate) / **Opus** (complex / large-output / long-horizon). **Sonnet is an image-only tier**: for text it is strictly dominated by Pro (SWE 79.6 < 80.6, agentic 59.1 < 67.9, output 64K < 384K, $15 ≫ $0.87), so a text task never picks it.

**Quality floor = the Verification Recipe** (runs every build anyway). On fail → escalate **one tier**, **auto within a backend**, **approval-gated before crossing into the Claude pool** (F3); capped at one retry (ADR-015). **Batch by (backend, model)** before dispatch → switch count = backend crossings only (≤1/build); within-backend model switches are free (C1), so per-task granularity adds cost precision **without** adding switches.

**Complexity signals** (computable at spec-write time from `## Files to Change`, per WS-C / Triage arxiv 2604.07494): code-health of touched files, file count, domain-risk keywords.

**Per-project model menu:** user-declared manually; the router picks only within the declared set. **Cost basis:** hybrid — optimise marginal cash (DeepSeek = real £, but cash-cheap; Claude interactive = scarce planning capacity) with rate-limit awareness. **Quality floor:** risk-tiered.

## Consequences

- **Positive:** DeepSeek stays the cash-cheap, planning-pool-neutral bulk coder; Claude is reserved for what DeepSeek structurally can't do (visual) or where Pro's agentic ceiling is short (Opus 74.6 vs Pro 67.9). Route-first avoids cascade waste; verification (already run) is the floor; ≤1 switch/build honours "minimise switches." Batch-level routing carries a ~24% quality edge over per-query (arxiv 2603.26796). Extends existing machinery — no new subsystem.
- **Negative / accepted tradeoffs:** v1's interactive Claude batch has **no `--max-budget-usd` cap** and **shares the planning pool** (F1) — tolerable only while Claude batches stay small/rare; heavy visual builds can eat planning capacity. Mitigated by small batches + high Opus threshold; headless path is the drop-in fix if it bites.
- **Risks:** rate-limit absolute numbers are COMMUNITY-tagged (verify against Settings > Usage live); misrouting sends a hard task to a weak model (bounded by the verify-floor + one-tier escalation); Fable 5 export-control-blocked (2026-06-12) so the planned second pass is gated on that lifting.

## Sources
- `docs/research/model-routing/` (WS-A–D + README), artificialanalysis.ai, api-docs.deepseek.com, docs.claude.com, support.claude.com, arxiv 2604.07494 / 2603.26796 / 2506.10525.
