# Research: Per-build-item model routing for APEX coding (4-model, 2-backend)

**Date:** 2026-06-21
**Confidence:** HIGH on mechanism + pricing (primary/official); MEDIUM on rate-limit absolute numbers (structure VERIFIED, absolute numbers COMMUNITY) and some agentic benchmarks (COMMUNITY).
**Re-research after:** 2026-07-05 (AI/LLM tooling, 14-day clock; rate-limit + Sonnet/Fable availability move fast).
**Decision at stake:** an ADR + a build initiative — extend `coder_tier` (ADR-019) from 2 DeepSeek tiers to a 4-model / 2-backend routing layer for the coding phase. Planning stays Opus.
**Workstreams:** `ws-a-capability-cost.md` · `ws-b-routing-mechanism.md` · `ws-c-routing-literature.md` · `ws-d-billing-ratelimit.md`.

---

## Summary

The user's framing — "Opus scores each build-item's complexity and routes it to the cost-optimal coder among {Opus 4.8, Sonnet 4.6, DeepSeek V4 Flash, V4 Pro}" — survives research, **but with three structural corrections** that turn a flat 4-model ladder into a **two-backend specialist model**:

1. **The backend line is a hard wall inside one session.** `ANTHROPIC_BASE_URL` is session-level, not per-subagent — Anthropic models {Opus, Sonnet} and DeepSeek models {Flash, Pro} cannot be mixed as per-task choices in one session. *Within* a backend, model switching is free (zero-restart `model:` override). Crossing needs a restart, a headless subprocess, or an LLM gateway.
2. **"Claude is free at the margin" is false in the binding sense.** Interactive Claude Code shares the planning subscription pool; Opus's weekly cap is the scarcest resource APEX has. So Claude-as-coder is *expensive in planning capacity* unless run **headless** (separate ~$100/mo credit pool, budget-cappable).
3. **Image is a hard gate.** Both DeepSeek models are text-only via API. Any visual build-item (mockup/screenshot/Figma) *must* go to Claude.

**Net:** DeepSeek stays the **default bulk coder** (cash-cheap *and* planning-pool-neutral); Claude is the **specialist** invoked only for what DeepSeek structurally can't do (visual work) or where Pro's agentic ceiling isn't enough (top-end escalation). The router is mostly choosing a **backend** (driven by image-need + top-tier-agentic-need), then a **model within backend** (the existing risk-tier logic, now 2 models per side). This naturally minimises switches — most builds stay entirely on DeepSeek; only visual-bearing builds add a small Claude batch.

---

## The four binding constraints (cited)

| # | Constraint | Source | Tag |
|---|-----------|--------|-----|
| C1 | `ANTHROPIC_BASE_URL` is session-level; no per-subagent endpoint override. Within-backend `model:` switch is free (zero restart). | WS-B, docs.claude.com | VERIFIED |
| C2 | DeepSeek V4 Flash + Pro are text-only via API (no image content type). | WS-A, api-docs.deepseek.com | VERIFIED |
| C3 | Interactive Claude Code shares the single Max subscription pool with planning; Opus weekly cap ~15–35 hrs (Max 5×, community est.); agent-teams ~7× tokens. | WS-D, support.claude.com | VERIFIED structure / COMMUNITY numbers |
| C4 | Headless `claude -p` draws from a separate ~$100/mo Agent-SDK credit pool, supports `--max-budget-usd` + `--max-turns`; can set its own base URL + model. | WS-D + WS-B | COMMUNITY (pool) / VERIFIED (flags) |

## 4-model coding matrix (WS-A)

| Dimension | Opus 4.8 | Sonnet 4.6 | V4 Flash | V4 Pro |
|---|---|---|---|---|
| SWE-bench Verified | **88.6%** | 79.6% | ~79.0% | 80.6% (Max) |
| Terminal-Bench (agentic) | **74.6%** | 59.1% | n/a | 67.9% |
| Image input | **YES** | **YES** | NO | NO |
| Input $/Mtok | $5.00 | $3.00 | **$0.14** | $0.435 |
| Output $/Mtok | $25.00 | $15.00 | **$0.28** | $0.87 |
| Cache-hit input $/Mtok | $0.50 | $0.30 | **$0.0028** | $0.003625 |
| Max output | 128K | 64K | 131K | **384K** |
| Backend | Anthropic | Anthropic | DeepSeek | DeepSeek |

- **Sonnet 4.6** = near-Pro on *pure* SWE (79.6) but weak agentic (Terminal 59.1, −15.5pp vs Opus) → lane is **well-scoped, shorter-horizon, image-bearing** tasks, not long-horizon autonomy.
- **V4 Pro** = near-Opus pure SWE (80.6), weaker agentic (67.9), cash-cheap, 384K output → hard-kernel + big multi-file text coding.
- **Fable 5** = 95% SWE but **export-control blocked since 2026-06-12**, $50/Mtok out → unavailable for routing now; re-check at re-research date.

## Routing approach (WS-C)

APEX specs are **pre-planned**, so difficulty is knowable before any model call → **static upfront-routing** fits (no cascade latency), with **verification-recipe pass as the quality floor** and **escalate-on-fail** as the safety net. Difficulty signals computable at spec-write time from `## Files to Change`: **code-health of touched files** (cyclomatic complexity, coupling, size, coverage), **file count**, **domain-risk keywords** (security/auth/concurrency/transaction/crypto). **Batch-level routing beats per-query by up to 24% on quality** (arxiv 2603.26796) — endorses both "batch to minimise switches" and backend-batching. Closest published analog: **Triage** (arxiv 2604.07494) routes SWE-bench tasks to Haiku/Sonnet/Opus tiers by per-file code health — the same tier shape APEX uses.

---

## Recommended design (v1) — extend `coder_tier` to a 4-model / 2-backend router

**Routing unit = the task** (one concern layer). Two-step selection, run by Opus at plan time:

**Step 1 — eligibility filter (hard gates):** project menu ∩ {image needed? → drop Flash+Pro} ∩ {output >~64K? → drop Sonnet} → eligible set.
**Step 2 — cheapest eligible model that clears the complexity bar** (cost order: Flash < Pro < Sonnet < Opus; complexity = Opus rubric judgment). Collapsed tree:

```
Image needed?
 ├─ NO  (text)  → Flash (routine) · Pro (hard kernel)     [Pro = proactive text ceiling; Opus only via gated escalation on Pro verify-fail]
 └─ YES (image) → Sonnet (moderate) · Opus (complex/large/long-horizon)   [Sonnet is image-only — Pro dominates it on text]
```

- **Quality floor** = the Verification Recipe per task. On fail → escalate one tier, **auto within a backend**, **approval-gated before crossing into the Claude pool**.
- **Batch by (backend, model)** → switch count = backend crossings only (≤1/build); within-backend switches free (C1), so per-task granularity adds cost precision without adding switches.

**Per-project model menu (user-set, manual):** each project declares which of the 4 are allowed; the router picks only within that set. Default example menus to be designed in the spec phase.

**This is an *extension* of existing machinery, not a new subsystem:** ADR-019 `coder_tier` (flash/pro/split) generalises to a model-menu + routing policy; the Verification Recipe already exists as the floor; Opus already writes Files-to-Change (the difficulty signal source).

---

## RESOLVED DECISIONS (2026-06-21) — see ADR-024

- **F1 — Claude-batch execution = interactive + manual backend swap** (v1). Zero infra; accepted tradeoff = no `--max-budget-usd` cap + shares the planning pool, tolerable while Claude batches stay small/rare. Headless `claude -p` (isolated pool, capped) = drop-in upgrade if contention bites; LiteLLM gateway (seamless 4-way) = end-state (ADR-016).
- **F2 — Opus as coder = complexity-gated** (not Sonnet-only, not unrestricted). Router picks Opus only when item complexity genuinely warrants; high threshold reserves the scarce Opus pool.
- **F3 — Escalation = auto within a backend, approval-gated before crossing DeepSeek→Claude** (real pool spend).
- **Routing unit = per-task** — batching makes switch-count = backend-crossings regardless, so finest granularity is free of switch cost.
- **Sonnet = image-only tier** — strictly dominated by Pro on text (SWE/agentic/output/cost), so a text task never picks it.
- **Pro = proactive text ceiling** — Opus reached for text only via gated escalation on a real Pro verify-fail, not guessed upfront (captures the ~8pp SWE edge with zero waste on tasks Pro passes).

---

## Sources
- WS-A capability/cost: artificialanalysis.ai, api-docs.deepseek.com, platform.claude.com, docs.anthropic.com
- WS-B mechanism: docs.claude.com (subagents, model config, headless), APEX `apex-code` / `apex-build-wave.js` / `apex-governance`
- WS-C literature: RouteLLM, FrugalGPT, AdaptiveLLM (arxiv 2506.10525), IRT-Router, Triage (arxiv 2604.07494), batch-routing (arxiv 2603.26796)
- WS-D billing: support.claude.com (11647753, 11145838), api-docs.deepseek.com/quick_start/pricing
- Prior internal: `docs/research/model-comparison/`, `docs/research/pro-mode-audit/`, ADR-016, ADR-019
