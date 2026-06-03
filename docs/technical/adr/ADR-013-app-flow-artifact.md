# ADR-013: App-flow as a first-class scope-gated artifact

**Date:** 2026-06-03
**Status:** Accepted
**Builds on:** [ADR-001](./ADR-001-per-project-documentation-contract.md) (per-project documentation contract), [ADR-008](./ADR-008-conceptual-data-model-artifact.md) (conceptual data-model artifact — the pattern this mirrors)
**Source:** `docs/research/donor-analysis/` — convergent gap #1 (Kiro `design.md` app-flow, BMAD UX/EXPERIENCE artifact, GSD `UI-SPEC.md`). Resolves the SP0 "Appflow" open question.

## Context

APEX persists PRD (PROJECT/REQUIREMENTS), TRD (ADRs + stack binding), conceptual data model
(ADR-008), and the implementation plan (specs). **UI/UX is the one altitude with no persisted
artifact** — it lives as planning-mode judgment and dies with the session. Three independent donor
systems (Kiro, BMAD, GSD) each persist a screen-map / user-journey document, and the absence is
already logged as the open **SP0 doc-coverage question**: does a UI-heavy app (Artemis) warrant a
first-class app-flow artifact.

"UI" is two altitudes, and only one belongs in a persisted doc:

| Altitude | What | Persist? |
|----------|------|----------|
| **Flow** | Screens/routes, the navigation map, primary user journeys, screen states + transitions | **Yes — the gap** |
| **Visual** | Layout, spacing, colour, component styling, taste | **No** — stays judgment + Figma (per the no-reflexive-render principle); pixels are not a durable spec |

The **flow** layer is conceptual UX (the nouns/edges of the interface), exactly parallel to the
conceptual data model: it anchors per-phase UI specs so screen 3 doesn't contradict screen 1's
navigation assumptions, and it survives session boundaries.

## Decision

Add a first-class **app-flow artifact**, scope-gated to UI-bearing projects, following the ADR-008
data-model pattern:

- **Artifact:** `docs/technical/architecture/app-flow.md` (beside `overview.md` / `data-model.md`) —
  **screen/route map, primary user journeys, screen states + transitions. Flow only.** It explicitly
  is *not* visual design; layout/styling stay judgment and Figma, and detailed per-screen behaviour
  stays in the feature spec.
- **`apex-init` seeds the stub** for UI-bearing projects (inferred from the confirmed stack having a
  frontend/screen surface). Headless / API-only / pure-CLI projects skip it and record "no UI flow"
  in REQUIREMENTS. Stub marker `<!-- apex:app-flow:stub -->`, parallel to the overview/data-model
  stubs.
- **`apex-plan`** captures the app-flow early for UI-bearing projects; its doc-coverage check gains a
  signal when `app-flow.md` is still a stub while a UI/screen spec is in play (informational, mirrors
  the overview/data-model signals — never blocks). The readiness gate references it for UI specs (a
  UI spec should name which app-flow screen(s)/journey it implements).
- **`apex-ui-ux-design`** owns the app-flow technique (screen-map + journey mapping) and points to the
  artifact as its recorded home. Visual judgment is unchanged and stays un-persisted.

## Consequences

**Good:**
- Per-phase UI specs stay coherent against one navigation/journey anchor instead of drifting.
- The screen-map survives session boundaries — the interface shape isn't re-derived each session.
- Resolves SP0's doc-coverage gap with APEX's existing scope-gated-artifact pattern (no new machinery,
  no borrowed UI-SPEC format).

**Bad:**
- One more artifact to keep current; a rotted stub misleads (mitigated by the doc-coverage signal).

**Neutral / token-cost:**
- **Low.** `app-flow.md` is on-demand — loaded only by UI specs and UI reviews, never added to the
  always-on CLAUDE.md chain. Scope-gated, so non-UI projects pay no ceremony tax.
- The flow-only boundary must be policed or the doc bloats into a visual-design dump — the stub
  language enforces it ("flow only, not visual design").
