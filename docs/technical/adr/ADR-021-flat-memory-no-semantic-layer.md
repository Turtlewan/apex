# ADR-021: Memory recall — keep flat markdown model, no semantic/vector layer
**Date:** 2026-06-16
**Status:** Accepted

## Context
An "agentic OS" walkthrough (audited in `docs/research/agentic-os-video-audit.md`) names semantic
memory ("level 3" — `claude-mem`/`mem-search`, semantic search over markdown) as the upgrade most
worth making. The video-audit flagged it as APEX's single highest-leverage, non-deployment-gated gap:
APEX has the hook-injection layer (SessionStart) and a flat file memory, but no meaning-based recall.

A research pass (`docs/research/memory-recall/` — 3 Phase-2 Sonnet agents) and a Council-mode deep-dive
(`docs/findings/memory-recall-deep-dive.md` — 3 blind voices) examined whether to adopt one. Decisive
facts:
1. **Scale.** APEX's whole memory surface — `MEMORY.md` (~22 one-line entries) + small fact-files — is
   ~2–5K tokens loaded per session. Semantic-infra payoff begins ~50K loaded tokens (context-rot onset,
   Liu TACL 2024; Chroma 2025) — ~10× above current load. Everything is already in context → full-load
   gives 100% recall; top-k injection can only match-or-undershoot it. [VERIFIED]
2. **Benchmarks don't support it at this scale.** Simple RAG beat complex semantic memory on LongMemEval
   ("overkill"); mem0/MemPalace headline scores are disputed/overfit; structured memory only reliably
   wins *at scale* APEX is nowhere near. [VERIFIED]
3. **Infra can hurt.** ETH arXiv:2602.11988 — generated context files *reduced* agent success ~3% and
   raised cost >20%. [VERIFIED]
4. **Fit.** A vector layer means a persistent daemon + binary index (un-greppable, un-diffable — breaks
   git-as-changelog), embeddings weak on this corpus's content (ADR numbers, SHAs, paths, dates), and a
   lossy end-of-session compression pass that hits the **capped credit pool** ([[claude-agent-sdk-billing-split]]).

The Council (each voice given only the neutral question) converged **no-go** and corrected the proposal
on two points: (a) "flat vs vector" is a **false binary** — a cheap markdown-native middle exists; (b)
the 22-entry index is a non-problem — any future pain appears in the **handoff/ADR corpus**, and "recall
failure" must be *named* (not-surfaced / stale-polluting / grep-vocabulary-miss) before picking a fix.

## Decision
**Keep the flat, fully-loaded, grep-able memory model. Do not adopt a semantic/vector layer.**

The decision is **trigger-gated**, with a corrected escalation ladder. Revisit only when **any** holds:
- `MEMORY.md` exceeds ~80–100 entries, or per-session memory load approaches ~25K tokens; **or**
- a *recurring, named* recall miss over `docs/handoff/` + ADRs (a grep vocabulary-mismatch failure,
  case (c) — not a curation problem).

When the trigger fires, escalate to **Option C first** (markdown-native, ~zero infra): tag/alias
frontmatter so grep hits conceptual queries + tiered loading (always-load index + on-demand fact-files)
+ optional hybrid keyword search over the handoff/ADR corpus. A full semantic tool (claude-mem —
local-embeddings, re-verify maturity first) is considered **only if Option C is demonstrably
insufficient at scale**. It is no longer the default "adopt-lite" path.

## Consequences
**Good.** Zero new infrastructure; preserves the pure-markdown / no-app-code / git-diffable / hand-
auditable identity. 100% deterministic recall at current scale. The decision is now *known and
evidenced* rather than an open worry — a tripwire replaces vague anxiety.

**Bad / accepted.** Recall stays keyword-class, not semantic — APEX cannot retrieve a memory by meaning
when the words don't match. At single-user scale this is free (everything loads anyway); the bet is the
corpus stays small enough that Option C lands before it bites.

**Residual risk (Council Critic).** The trigger relies on someone noticing and *naming* a recall miss
rather than reflexively reaching for a vector layer because "everyone's adding one." Mitigation: the
trigger explicitly requires a named failure case, and Option C is the mandated first response.

## Sources
`docs/research/memory-recall/` (WS-A claude-mem · WS-B frameworks · WS-C evidence, 6 primary) ·
`docs/findings/memory-recall-deep-dive.md` · `docs/research/agentic-os-video-audit.md`.
