# ADR-017: Persist a per-project design brief (tokens + art-direction + forbidden-patterns)

**Date:** 2026-06-12
**Status:** Accepted (partially amends [ADR-013](./ADR-013-app-flow-artifact.md))
**Research:** [`docs/research/design-capability/`](../../research/design-capability/) (WS-1…4, 2026-06-12)

## Context

ADR-013 decided that for UI-bearing projects the **flow** is persisted (`app-flow.md`) but **visual
design stays un-persisted** — live planning judgment plus optional Figma, deliberately not a doc.
That was correct under the assumption that a vision-capable, design-sensible model holds the visual
intent in-context through the build.

That assumption breaks in the APEX planning/coding split: the **coding model (DeepSeek) is
image-less and literal**. It cannot see what it builds and cannot carry visual judgment — so any
visual decision the planner wants honoured must reach the coder as **explicit text**, or it is lost
and the coder fills the gap with training-median "AI slop" (documented mode-collapse; WS-1). The
design-capability research found the highest-evidence levers for steering a literal coder are
exactly: named design tokens, an art-direction statement, and a project-specific **forbidden-pattern
list** ("don'ts pull more weight than do's"; WS-1/WS-4).

## Options considered

| Option | Score | Reasoning |
|--------|-------|-----------|
| Keep ADR-013 as-is (no persisted visual doc) | ✗ | Leaves the image-less coder with no token/forbidden context → slop; the lever with the best evidence is unavailable |
| Persist tokens only | ✗ | Smallest amendment, but drops the forbidden-pattern list — the single highest-evidence mechanism |
| **Persist tokens + art-direction + forbidden-patterns (chosen)** | ✓ | Captures the two best levers; all three are stable, project-wide invariants with a single home and slow decay |
| Also persist per-screen visual intent | ✗ | Duplicates `app-flow.md` (screens) + Figma (visuals), double-homed; per-screen notes age fastest → rots into misinformation the blind coder can't sanity-check |

## Decision

For UI-bearing projects, persist a small **`docs/technical/architecture/design-brief.md`** holding
**only** the stable, single-homed visual decisions: **design tokens**, a 2–4 sentence **art
direction** (which also records the chosen feel → style-library selection), and a project-specific
**forbidden-pattern list**. Owned by `apex-ui-ux-design`, seeded scope-gated by `apex-init`, checked
at `apex-plan`'s readiness gate, loaded as build context by `apex-code`.

**This amends ADR-013 only at the token/direction/constraint boundary.** Per-screen layouts and
component visuals **remain un-persisted judgment** (ADR-013 intact there), verified after the build
by the visual review gate (screenshots → scored audit → fix-spec), not frozen in a doc.

## Consequences

- **Positive:** the image-less coder gets the visual invariants explicitly → fewer slop defaults,
  consistent tokens, project-specific don'ts enforced; the art-direction line also drives
  on-demand style-library selection ([[design-style-on-demand]]).
- **Negative:** one more per-project artifact to author (~30–60 min) and keep honest; a partial
  reversal of ADR-013's clean "no visual doc" line.
- **Risks:** scope creep into per-screen specs (mitigated by the explicit scope-gate + the template's
  "stop if it's growing per-screen sections" note); brief drifting stale (mitigated — tokens/don'ts
  are slow-changing invariants, and the visual review gate feeds repeat offenders back into the
  forbidden list).

## Sources
`docs/research/design-capability/` WS-1 (LLM design quality — forbidden-list + brief evidence),
WS-4 (process — DESIGN.md pattern, evaluator-independence), WS-3 (skill audit gaps). ADR-013.
