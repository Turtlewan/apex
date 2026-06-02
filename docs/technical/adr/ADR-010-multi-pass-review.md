# ADR-010: Multi-pass review — santa-method dual wave-review + council anti-anchoring

**Date:** 2026-06-02
**Status:** Accepted
**Builds on:** [ADR-007](./ADR-007-dispatched-domain-review.md) (dispatched domain review)

## Context

ECC absorption Phase 4 (`docs/research/ecc-analysis.md` §7 #5–6, §11 P4). Two ECC mechanisms
target a weakness shared by every single-pass reviewer:

- **santa-method** — two context-isolated reviewers, identical rubric, *both must pass* or fix-loop.
  Breaks the stochastic-miss problem: a single LLM review pass is non-deterministic, so one roll
  catches violation X and misses Y while a second independent roll does the reverse. One pass ships
  whatever that single roll dropped.
- **council** — for ambiguous go/no-go decisions, an in-context Architect proposes, then three
  fresh-context voices (Skeptic / Pragmatist / Critic) each receive *only the question* — no
  proposal, no conversation history — so they cannot anchor to the answer already on the table.
  Richer than `apex-deep-dive`'s lone, same-context "Opposing View" paragraph.

APEX's reviewers are already fresh-context and isolated (ADR-007), so the gap santa-method closes
is not bias-from-the-build-conversation (already solved) but **single-pass stochastic escape**. The
gap council closes is **proposal anchoring** in live planning, where the planner rationalises its own
draft and the user would never think to stop and run a separate deep dive.

Both double (or quadruple) cost, so each is gated.

## Decision

### 1. Santa-method dual-pass wave review (coding side only)

- **Surface: coding-side wave review only.** The planning-side `apex-spec-reviewer` stays
  single-pass. A missed wave-review violation is a *shipped-code* defect (terminal); a missed
  spec-review gap has a second net downstream (the wave review itself). Spend the doubled budget
  where the failure is terminal.
- **Scope = the already-reviewed set.** `apex-code` wave review already fires only for
  **auth / security / data** (its trigger table). That set *is* the critical subset, so **every wave
  that gets reviewed gets dual-pass** — no new carve-out. testing/accessibility are not wave-reviewed
  on the coding side and are unaffected.
- **Mechanism.** For each matched domain, dispatch **two** `apex-wave-reviewer` instances in parallel
  (independent isolated contexts, identical inputs). The `apex-wave-reviewer` agent definition is
  unchanged — it is already stateless and single-domain; "dual" is purely a dispatch-count change in
  `apex-code`.
- **Union semantics.** The domain's verdict is the **worst of the two passes**: BLOCK if *either*
  blocks; else FLAG if *either* flags; else CLEAN only if *both* are CLEAN. Findings lists are unioned
  (dedupe overlaps).
- **Fix-loop unchanged.** A unioned BLOCK enters the existing one-retry cap: re-run the offending
  task + recipe, re-dispatch **both** passes once. A second unioned BLOCK → BIG fork to planning.
  No second retry.
- **Override via spec `risk:` metadata.** `risk: low` downgrades a reviewed wave to single-pass (the
  planner judged it low-stakes despite touching a critical path). `risk: high` is the default for the
  reviewed set (force-on is a no-op there, but the field is honoured for clarity and future surfaces).

### 2. Council anti-anchoring decision mode

- **Home: a mode of `apex-deep-dive`.** Adds a council step that, after the Architect (in-context)
  states the proposal, dispatches three **`general-purpose`** subagents — Skeptic, Pragmatist,
  Critic — each given **only the decision question**, no proposal and no conversation history. No new
  agent files (consistent with ADR-007's one-generic-dispatch leanness); the three stances are prompt
  templates inside `apex-deep-dive`.
- **Triggers.** (a) Explicit — any `/apex-deep-dive` invocation may run council when the decision is a
  genuine go/no-go; and (b) `apex-plan` **offers** council at the research-gate fork **only when the
  uncertainty is judgment, not facts** (≥2 viable approaches, load-bearing/architectural, no clear
  default). Facts-uncertainty still routes to web research. `apex-plan` never auto-*runs* council —
  it offers; the user opts in.
- **Synthesis.** The Architect reconciles the four voices and surfaces where the independent voices
  *disagreed with the proposal* — that disagreement is the signal. Replaces the single "Opposing View"
  section when council runs.

## Consequences

**Good:**
- Dual-pass materially cuts escaped violations on the highest-stakes (auth/security/data) shipped code,
  at a cost bounded by the already-narrow wave-review trigger.
- Council gives load-bearing planning decisions structural anti-anchoring instead of a same-context
  rebuttal the model wrote to agree with itself.
- Both reuse existing machinery — BLOCK/FLAG/CLEAN verdicts, the one-retry cap, the research-gate
  interrupt, `general-purpose` dispatch — so no new severity model, agent roster, or contract beyond
  the union rule and the council step.

**Bad:**
- Dual-pass doubles reviewer spawns on reviewed waves (up to 2× per matched domain; a wave matching
  two domains dispatches four). Mitigated by the narrow trigger and `risk: low` escape.
- Council adds three subagent spawns per invocation and one more place planning can interrupt;
  mitigated by the judgment-only offer gate and opt-in.
- Review/decision quality remains bounded by the domain `impl.md` (dual-pass) and the framing of the
  question (council) — two passes of a thin rule set still review thinly.

**Neutral:**
- `apex-reviewer` (the full-spec post-build pipeline reviewer) is out of scope — this ADR touches the
  per-wave domain reviewer only.
- The `risk:` spec field is introduced here for wave-review gating; it is optional and defaults to the
  reviewed-set behaviour when absent.
