# ADR-018: APEX is the sole coding workflow — competing dev-systems disabled, good ideas absorbed

**Date:** 2026-06-12
**Status:** Accepted

## Context

A research pass (`docs/research/coding-capability/`, 3 parallel workstreams) audited everything that
loads or can fire on the **DeepSeek coding backend**, mirroring the earlier design-capability pass.
It found that several **competing coding workflows sit in the weak coder's reach with nothing gating
them out**, and the harness actively forces their consideration:

- The `superpowers` **plugin** injects `using-superpowers` on **every session, both backends**, with
  *"if there's even a 1% chance a skill applies you ABSOLUTELY MUST invoke it / YOU DO NOT HAVE A
  CHOICE."* `apex-code` carries no counter-directive (WS-2 hijack verdict: **live, not theoretical**).
- Reachable rivals include `superpowers:test-driven-development`, `executing-plans`,
  `subagent-driven-development`, `writing-plans`, `brainstorming`, `finishing-a-development-branch`,
  the `gsd-*` cluster (66 folders — a full parallel dev system with its own `.planning/` state), and
  `controlled-yolo` / `full-output-enforcement`.
- **Two rivals execute permanently-forbidden git operations** — `finishing-a-development-branch` runs
  `git merge` + `git branch -d`, and it auto-fires at the end of superpowers execution chains.
- WS-3 confirms with primary 2025–26 sources that this **measurably harms a DeepSeek-class coder**:
  joint compliance at conflict points collapses to ~35% (weakest model 10.8%); constraint-stacking
  costs ~30 pts on coding benchmarks; small models decay *exponentially*; and **prohibition-type
  rules decay fastest** — so the correct fix is structural **removal**, not adding "don't" rules.

The APEX cluster itself audited internally clean (consistent with the session-32 stocktake). The
damage is the third-party pile — and after APEX's prior ECC / donor / Odysseus / DOX absorption
passes, those rivals offer almost nothing left to harvest.

## Options considered

| Option | Score | Reasoning |
|--------|-------|-----------|
| Keep rivals, add a forceful "don't invoke other skills" rule to apex-code | Low | WS-3: prohibition rules decay fastest on weak models — unreliable; also pays the token + trigger cost |
| Keep rivals, rely on model judgment | Lowest | WS-2: no harness gate exists; the 1%-MUST directive outranks workflow prose for a literal coder |
| **Remove rivals; absorb the few genuinely additive ideas into APEX first** | **High** | Structural fix; superpowers is a plugin (one-line disable kills injection + all conflicts); reversible |

## Decision

**APEX is the sole coding workflow on this machine.** Competing dev-systems and coding-process skills
are **disabled/removed**; their genuinely additive ideas are **absorbed into the relevant APEX skill
first** (absorb-then-remove). Concretely:

1. **Disable the `superpowers` plugin** (`settings.json` → `enabledPlugins` → `false`). One line
   removes the `using-superpowers` injection hijack vector **and** all conflicting + duplicate SP
   skills (incl. the forbidden-git-op skill). Affects both modes by design — APEX is the system.
2. **Archive the `gsd-*` cluster** to `skills-archived/`, retaining `gsd-map-codebase` (the only
   capability APEX optionally reuses — brownfield mapping). gsd's `apex-plan` reference is already
   "if installed" / gracefully degrading.
3. **Remove standalone conflict skills** — `full-output-enforcement` (opposes surgical scope),
   `write-feature-spec` (apex-plan covers); fold `controlled-yolo`'s internet-exposure-defer nuance
   into apex-governance, then archive it (opt-in-only, low risk).
4. **Backstop, positive not prohibition:** one commission-form line in `apex-code` — "APEX is the
   sole coding workflow; in coding mode follow apex-code only" — and a note in global CLAUDE.md §5
   that competing dev-systems are intentionally disabled. The removal is the real fix; this is belt-and-braces.

**Harvest finding:** the only non-trivial idea worth preserving was `gsd-map-codebase`; everything
else was already absorbed in prior passes or is pure conflict/duplication.

## Consequences

- **Positive:** removes the only forbidden-git-op vectors; eliminates the measured weak-coder
  degradation surface; frees ~5,400 tokens/session; one coherent workflow for DeepSeek to follow.
- **Negative:** loses superpowers/gsd in *planning* mode too (acceptable — they competed with
  apex-plan); brownfield mapping now depends on the single retained `gsd-map-codebase` until/unless
  ported natively into APEX.
- **Risks:** disabling the plugin may leave an orphaned SessionStart hook entry — **verify on the
  live env** (WS-2 gap, unverified on Windows). Archive (not delete) keeps every move reversible.

## Sources

- `docs/research/coding-capability/` — README + ws-1-conflict-matrix · ws-2-load-vectors · ws-3-weak-coder-evidence
- WS-3 primary sources: arXiv 2605.27784 · 2605.06445 · 2507.11538 · 2604.20911 · 2601.20404 / 2601.16746
- Memory: `apex-sole-coding-workflow`
