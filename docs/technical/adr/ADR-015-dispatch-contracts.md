# ADR-015: Dispatch contracts — bounded returns + bounded evaluator-optimizer

**Date:** 2026-06-08
**Status:** Accepted

## Context

A scoped research pass (session 28) checked APEX's subagent-dispatch mechanics against
**first-party** Anthropic orchestration guidance and 2025/2026 ensemble research — the first time
this surface was measured against primary sources rather than third-party donor systems. Findings:
`docs/research/subagent-dispatch-improvements.md` (+ `dispatch-study/agent{1,2,3}-*.md`).

The pass validated most of the design (fan-out trigger, hard fork boundary, plan-to-memory
checkpoint = `status.md` In-Flight, rule-based verifier = Verification Recipe, worst-of-N on the
security subset). Two findings needed a durable decision:

1. **Output direction is uncodified.** Every current dispatch site *does* return bounded output —
   `code-worker` (status enum), wave/spec reviewers (verdict + cited findings), council voices
   (POSITION/REASONING/RISK template), `apex-research` (write-to-disk + ≤compact summary), stocktake
   (per-skill verdict). But this is **per-site convention, not a named system invariant**. There is
   no canonical rule for a *new* dispatch site to inherit, and the "deep/exploratory agent persists
   full output to disk, returns only a pointer" half lives only inside `apex-research`. (The research
   agent's specific claim that *council voices could flood* the orchestrator was **incorrect** — they
   have a tight return template. The real gap is the missing *principle*, not live flooding.)

2. **Evaluator-optimizer depth.** Anthropic's named workflow set includes an evaluator-optimizer
   loop (generate → structured critique → revise → repeat to a cap). APEX's BLOCK path already is a
   **single-round, rule-evaluated** version (union the finding → prepend to re-run → re-run recipe →
   re-dispatch both passes → one retry only). The question: extend it to multiple autonomous rounds?

## Options considered

**Candidate 1 — output contract**
| Option | Reasoning |
|--------|-----------|
| Do nothing | Practice is already universal; risk is only future drift. Cheap to fix, so codify. |
| **Name a dispatch return contract invariant** ✅ | One principle in `apex-orchestrate` + cross-ref in `apex-skill-author`; future sites inherit it; generalises the persist-then-pointer half. Additive, ~no recurring token cost. |

**Candidate 2 — evaluator-optimizer rounds**
| Option | Score | Reasoning |
|--------|-------|-----------|
| Add multi-round autonomous critique (≈3) | ✗ | Literature's >1-round gain is on *hard* tasks; a self-critique loop on 98%-accurate tasks dropped to **57%** — net-negative on APEX's variable-baseline coding tasks. Same-model critique shares blindspots. Each round re-dispatches *both* passes (2× cost). Erodes the ADR-011 human-gate-stops-weak-coder-drift safety. |
| **Keep the single rule-evaluated retry** ✅ | ✓ | Already an evaluator-optimizer with the *recommended* (rule-based) evaluator + a hard cap. Second BLOCK → BIG fork → planning keeps the human gate. No behavior change; record the rationale so the cap is not relitigated. |

## Decision

1. **Dispatch return contract (invariant).** Every dispatched child is given a **bounded return
   contract**. A child that explores widely (research, stocktake, any deep/exploratory dispatch)
   **writes its full output to disk and returns only a ≤1–2k-token summary or a pointer**; the
   orchestrator never absorbs a child's raw working output. Lives in `apex-orchestrate`
   (dispatch-principles home), cross-referenced from `apex-skill-author` so new dispatch sites
   inherit it. Sits alongside the *evaluator-independence* invariant (Odysseus A1) as a named
   dispatch rule.

2. **Bounded evaluator-optimizer.** APEX's BLOCK-retry is its evaluator-optimizer and stays
   **capped at one rule-evaluated round**; a second BLOCK escalates to planning. No autonomous
   multi-round critique. (Recorded here so the cap is understood as deliberate, not an omission.)

## Consequences

- **Positive:** future dispatch sites inherit one return rule; the persist-then-pointer pattern is
  generalised beyond `apex-research`; the retry cap's rationale has a durable home; protects the
  30–40% main-window target against context rot.
- **Negative / accepted:** candidate 1 codifies existing practice (low marginal value today) — the
  payoff is preventive, realised mostly when Artemis adds dispatch sites.
- **Risks:** minimal — additive convention, no runtime behavior change.
- **Parked (not in this ADR):** cross-model-family second review pass (real signal past N=2 needs a
  *different* family, not a same-family third pass) → revisit when the Mac host co-locates Claude +
  DeepSeek. And the honest tension that multi-agent is a weak fit for *coding* fan-out (its payoff is
  throughput/isolation, not answer quality) — recorded so coding-side parallelism isn't over-invested.

## Sources
- `docs/research/subagent-dispatch-improvements.md` (this session's synthesis)
- Anthropic — "Building effective agents", "How we built our multi-agent research system",
  "Effective context engineering for AI agents" (anthropic.com/engineering/*)
