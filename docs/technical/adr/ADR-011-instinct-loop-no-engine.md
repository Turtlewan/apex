# ADR-011: Instinct / continuous-learning loop — no engine, gated rail only
**Date:** 2026-06-02
**Status:** Accepted

## Context
ECC's `continuous-learning-v2` ("instincts") was flagged in `docs/research/ecc-analysis.md` as the fix
for APEX's biggest gap — "manual learning." Its design: Pre/PostToolUse hooks → `observations.jsonl` →
a Haiku observer → confidence-scored instinct files → auto-apply at ≥0.7 → `/evolve` clusters ≥3 into
skills. ECC absorption Phase 6 was scheduled to port this onto APEX memory, gated by a deep-dive (0b).

The 0b deep-dive ran in apex-deep-dive **Council mode** (ADR-010). Three fresh-context voices, each given
only the question (no proposal), converged independently against the engine. Full analysis:
`docs/findings/instinct-loop-deep-dive.md`.

Two facts reframed the decision:
1. **The local memory dir is machine-local.** A lesson learned on the Mac/DeepSeek coding side cannot
   reach the Windows/planning side through `~/.claude/.../memory/`. The only cross-machine channel is
   committed Markdown — which the handoff doc already is.
2. **APEX is attended and single-user.** ECC's confidence/cluster machinery exists to gate an
   *unattended, automatic* loop. APEX already routes every build lesson through handoff → apex-plan
   drain → (Phase-5) `apex-refresh --stocktake` → Iron-Law-gated `apex-skill-author`. A human reads the
   handoff every session.

## Decision
**Do not build ECC's instinct engine** (no capture hook, no `observations.jsonl`, no confidence scoring,
no auto-apply, no `/evolve` clustering, no `~/.claude/homunculus` analog, no DeepSeek build).

Instead, make the learning loop an **explicit convention on the rail that already exists**: apex-plan's
handoff-drain (`apex-plan` v1.13.0). A build lesson folds into a `feedback` **memory**; when the same
lesson recurs across multiple handoffs (the memory's recall is the tally — no separate ledger), it
becomes a promotion candidate for `apex-refresh --stocktake` or a direct `apex-skill-author` edit.
**Promotion is always human-gated; the Iron Law's failing-baseline test stays in force.**

Phase 6 is closed: redefined from "implement the instinct engine (largest item)" to this one-line
convention, now landed.

## Consequences
**Good.** No new store, hook, or engine — avoids the bloat APEX fights. The human gate is preserved as a
*feature*, not a gap: it's what stops the weaker coding model from poisoning the shared skill set (the
Council's central objection). No DeepSeek build needed; the change is markdown-only and already shipped.

**Bad / accepted.** No automatic capture — it relies on the session-end drain discipline actually
running. Recurrence is tracked by human recall of `feedback` memories, not a counter; at APEX's
single-user volume that is sufficient, but it would not scale to a high-throughput or multi-user system.
If APEX ever becomes unattended or multi-project, revisit this ADR — the engine's cost/benefit flips.

**Residual risk (Council Critic).** APEX still has no formal "is the system improving?" metric. The
mitigation is that every instinct-sourced promotion must pass the Iron Law's failing-baseline test —
the closest thing to a held-out check. If that gate is ever skipped for instinct edits, this risk lands
in full.
