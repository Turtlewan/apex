# Deep Dive: Memory — semantic recall vs flat model for APEX

**Date:** 2026-06-16 (planning session 46) · **Mode:** Council (ADR-010) · **Feeds:** audit backlog #1
**Inputs:** `docs/research/memory-recall/` (WS-A/B/C + synthesis) + 3 blind council voices

## Context Read
APEX memory today: `MEMORY.md` flat index (~22 one-line entries → small fact-files), ~2–5K tokens
loaded each session; plus a slower-growing handoff (`docs/handoff/`) + ADR corpus searched by grep.
Research established the semantic-infra payoff threshold (~50K loaded tokens) is ~10× above APEX's
current load, the benchmark wins for semantic memory are disputed/overfit, and generated context
infra can *reduce* success (ETH arXiv:2602.11988).

## Approaches Considered

### Option A — Keep flat model, trigger-gated revisit
**What:** No change now. Flat fully-loaded index + grep over handoffs/ADRs. Documented trigger re-opens it.
**Pros:** 100% recall (everything's in-context); deterministic, hand-auditable, git-diffable; zero new
infra; preserves the pure-markdown/no-app-code identity.
**Cons:** Grep is vocabulary-exact — a conceptual query ("did we ever decide anything about rate
limiting?") can miss on the growing corpus; no automatic relevance ranking.
**Risks:** Complacency — not noticing when the corpus actually crosses the trigger.
**Effort:** none.

### Option B — Full semantic/vector layer now (e.g. claude-mem)
**What:** Background embedding service + per-session top-k injection + end-of-session AI compression.
**Pros:** Relevance ranking; scales to thousands of memories; local embeddings possible.
**Cons:** Persistent daemon + vector store (un-greppable, un-diffable — breaks git-as-changelog);
embeddings weak on exactly this corpus's content (ADR numbers, SHAs, paths, dates); top-k can only
match-or-undershoot full-load recall; compression = lossy silent write to durable memory; the
session-end pass hits the capped credit pool.
**Risks:** Silent omission of the one decision that mattered; compression drift compounding over sessions.
**Effort:** high + ongoing maintenance.

### Option C — Cheap middle (council-surfaced), only if a recall miss is observed
**What:** Tiered loading (always-load index + on-demand fact-files) + tag/alias frontmatter so grep
hits conceptual queries + optional hybrid keyword search over handoffs/ADRs. No daemon, no embeddings,
no compression.
**Pros:** Fixes the *only* real weakness (vocabulary-mismatch grep misses) at ~zero new infra; stays
markdown/deterministic/auditable; same proven pattern as the existing index.
**Cons:** Still keyword-class, not true semantic; manual tag upkeep.
**Risks:** Low — additive, reversible.
**Effort:** low.

## Recommendation
**Choose Option A now, with Option C — not B — as the defined first escalation.**

All three blind voices (given only the neutral question) reached **no-go on B**: two returned
`depends-on`, but both depends-ons resolved to "only if a recall failure is actually observed, and
even then a cheap fix, not the vector layer." None argued for adopting. This independently confirms
the research verdict and removes the anchoring risk — the answer holds even for voices that never saw it.

The council also **improved** my original proposal in two ways: (1) it rejected the flat-vs-vector
**binary** — there's a cheap middle (C) that my "claude-mem is the adopt-lite path" framing skipped;
(2) it relocated the concern from the 22-entry index (a non-problem) to the **handoff/ADR corpus**,
where any future pain will actually appear. So claude-mem is demoted from "default adopt-lite" to
"only if even C fails at scale."

## Trade-offs You're Accepting
Keyword-class recall, not semantic — APEX cannot retrieve a memory by *meaning* if the words don't
match. At current scale that's free (everything's loaded anyway); the bet is that the corpus stays
small/single-user long enough that C lands before it ever bites.

## Implementation Implications
**No spec now.** Record the decision + the refined trigger in status.md / an ADR. The trigger
(unchanged from research, escalation path corrected):
- MEMORY.md → ~80–100 entries, or per-session memory load → ~25K tokens, **or**
- a *recurring, named* recall miss over handoffs/ADRs (grep vocabulary failure).
→ First escalation is **Option C** (tags/aliases + tiered load + hybrid keyword). Only if C is
demonstrably insufficient at scale does claude-mem (local-embeddings, re-verify maturity) come back.

## Risks to Monitor
The handoff/ADR corpus, not MEMORY.md, is the first mover — watch for grep misses there. Also watch
that nobody reflexively reaches for B ("everyone's adding vector memory") before C is even tried.

## Opposing View (strongest independent dissent — the Critic)
"Recall" was never defined. Before *any* change, name the actual failure: (a) relevant memory exists
but isn't surfaced, (b) memory is stale/contradictory and pollutes context, or (c) grep misses on
vocabulary. Only (c) points anywhere near retrieval — and a vector layer would *worsen* (a)/(b) by
surfacing more, fuzzier content. If a memory problem ever appears, the first move is to **measure
which of (a)/(b)/(c) it is**, not to pick a retrieval mechanism. → folded into the trigger as
"a *named* recall miss."
