# Deep Dive (Council): Instinct / Continuous-Learning Loop — build-here vs defer

> **Context note (2026-07-19):** the "Windows=planning / Mac=DeepSeek-coding split" this dive
> assumes is gone — modes removed (ADR-038), DeepSeek archived (ADR-027). The ADR-011
> build-here-vs-defer decision it fed is unaffected; only the backend framing is dated.

**Date:** 2026-06-02 (session 26) · **Mode:** apex-deep-dive Council (ADR-010) · **Gates:** ECC absorption Phase 6
**Question:** Should APEX build the ECC instinct / continuous-learning loop, or defer it — and if built, what design given the Windows=planning / Mac=DeepSeek-coding split (storage format, capture trigger, promotion → apex-skill-author)?

## Context Read
- `docs/research/ecc-analysis.md` §3 (hook surface), §6 (continuous-learning-v2 row), §10 Tier-2 #4, §11 Phase 0b/6.
  ECC's mechanism: Pre/PostToolUse hooks → `observations.jsonl` → Haiku observer → atomic instinct
  files (`~/.claude/homunculus/`, frontmatter `{id,trigger,confidence,domain}`) → confidence 0.3–0.9
  (auto-apply ≥0.7) → `/evolve` clusters ≥3 → promotes to skill/command/agent.
- APEX state: manual memory dir (`~/.claude/projects/.../memory/`, machine-local) + thin handoff docs
  (repo-tracked, read-once, drained by apex-plan) + `apex-refresh --stocktake` with folded-in
  rules-distill cross-read (Phase 5, just shipped) + apex-skill-author Iron Law (failing baseline
  test before any skill edit).

## The anchored proposal (Architect, in-context)
Port ECC's loop adapted onto APEX memory: an `observe` capture hook on the coding (Mac/DeepSeek) side
writes confidence-scored entries; an `/evolve`-style promotion clusters recurring entries and routes
them through apex-skill-author. Highest capability gain; fills APEX's #1 gap (manual learning).

## Council — four voices (three fresh-context, anti-anchoring)

| Voice | Position | Strongest point |
|-------|----------|-----------------|
| **Skeptic** | depends-on (auto = no-go) | The capture source is the *weak* model on the build machine — it writes the loudest events, not the most generalisable. The weak side authoring the knowledge base **inverts the system's quality gradient**. |
| **Pragmatist** | capture-as-convention=go; auto-feedback=no-go | The two primitives already exist (memory dir + refresh). The file-based round-trip through committed Markdown **IS the loop** — it needs a capture *habit* at one end and the existing refresh/promotion gate at the other, not a new engine. |
| **Critic** | depends-on (named owner + regression baseline) | "Continuous learning" is the wrong frame — there's no gradient/validation set, just auto-appends to a prompt corpus two models read literally. **No one defined "improves," so no one can detect degrading.** A review queue gets ~90% of the value with none of the silent-drift risk. |
| **Architect** | go (full engine) | ANCHORED — countered below. |

**Convergence (the stop signal):** all three independent voices, given only the question, rejected the
ungated automatic engine and converged on **gated capture + human/test-gated promotion**. Their shared
objections: (1) it defeats the Iron Law (auto-writes skills with no failing baseline test); (2) the weaker
coding model poisons the shared knowledge base; (3) unbounded accretion of one-off corrections → the
coder gets *more rigid*, mislabelled as "smarter"; (4) no degradation metric across the two-model split.

## Decision: DEFER the engine — build the thin gated ledger

Reject ECC's hook→confidence→auto-apply machinery. The genuinely missing piece is **not** automation —
it's a *cross-session recurrence signal* so a 3×-recurring gotcha gets promoted while a one-off doesn't.
Everything else (capture, promotion, the Iron-Law gate) already exists post-Phase-5.

### Design (the version we'd actually build)

- **Channel = the git repo, NOT the local memory dir.** Critical correction to the original Phase 6
  framing: `~/.claude/.../memory/` is *machine-local*. A lesson learned on the Mac/DeepSeek side cannot
  reach the Windows/planning side through it. The only cross-machine channel is committed Markdown —
  which is exactly what the handoff doc already is.
- **Capture trigger = session-end, prose, no hook.** Coding mode's handoff already captures
  `Specialist Flags` + `What's Next (discoveries)`. Add one repo-tracked ledger `docs/instincts.md`:
  end of each session, append any gotcha/correction as a one-line tally entry
  `| lesson | domain | sessions-seen (tally) | status |`. A convention/prompt line in the handoff
  workflow — not new machinery.
- **Recurrence gate = N≥3 (manual).** A lesson stays a candidate until seen in ≥3 sessions. This is the
  cheap stand-in for ECC's confidence≥0.7 + cluster≥3, with a human reading the tally.
- **Promotion path = the existing one.** apex-plan's handoff-drain already reviews discoveries;
  `apex-refresh --stocktake` already cross-reads for 2+-skill principle promotions; apex-skill-author
  already gates every skill edit behind a failing baseline test. A promoted instinct rides these rails —
  no new promotion engine, and the Iron Law gate is preserved (the council's #1 requirement).
- **No auto-apply, ever.** Promotion is always human-initiated through apex-skill-author. Removes the
  silent-drift failure surface all three voices flagged.

## Trade-offs accepted
- No automatic capture — relies on the session-end discipline actually happening (Pragmatist's
  "unread dumping ground" risk). Mitigation: it's one line in a workflow that already runs every session.
- Slower than ECC's auto-loop — but APEX is a personal, single-user system; the realistic yield is a
  handful of reusable gotchas/month, well within manual cadence.

## Implementation implications (revises Phase 6)
Phase 6 shrinks from "implement the instinct engine (largest item, may route to DeepSeek)" to a small
**planning-mode, markdown-only** change:
1. New repo-tracked `docs/instincts.md` ledger (template + N≥3 gate).
2. One capture line added to the coding-mode handoff workflow (global CLAUDE.md §5 / apex-handoff).
3. One promotion line in apex-plan's handoff-drain ("instinct ledger entries at N≥3 → stocktake/skill-author candidate").
No hook, no confidence engine, no DeepSeek build, no `~/.claude/homunculus` analog.

## Risks to monitor
- Ledger goes stale/unread → the value evaporates (it becomes write-only). Tripwire: if `apex-refresh
  --stocktake` runs and the ledger has >10 un-triaged entries, that's the rot signal.
- Over-promotion: resist promoting at N<3 under "this feels important" — the recurrence gate is the
  whole defense against accreting one-offs into standing constraints.

## Opposing View (strongest independent dissent — Critic, supersedes single-voice)
Even the gated ledger ships without a definition of "improves" or a regression baseline — so we still
can't tell promotion-that-helps from prompt-rot. The honest mitigation is that every promotion passes
the Iron Law's failing-baseline test (it must demonstrably fix a real gap before landing), which is the
closest thing APEX has to a held-out check. If that gate is ever skipped for instinct-sourced edits, the
Critic's objection lands in full.
