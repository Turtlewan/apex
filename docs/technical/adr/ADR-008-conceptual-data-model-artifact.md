# ADR-008: Conceptual data model as a first-class early artifact

**Date:** 2026-06-01
**Status:** Accepted
**Builds on:** [ADR-001](./ADR-001-per-project-documentation-contract.md) (per-project documentation contract), [ADR-004](./ADR-004-skill-system-structure.md) (skill system structure)

## Context

APEX's ground-up bootstrap (`apex-init`) seeds PROJECT.md, REQUIREMENTS.md, ROADMAP.md, and the
System Overview stub — but captures **no data model**. Physical schema (tables/columns/indexes/
migrations) is designed per phase via `apex-data` when each slice is built. That deferral is
correct — it follows YAGNI and the SP3 "let it emerge" decision; you cannot pin column types before
the stack is confirmed.

But "database structure" is really three altitudes, and only two had a home:

| Altitude | What | Home (before this ADR) |
|----------|------|------------------------|
| **Conceptual** | The entities the system holds + how they relate (the nouns) | **none** |
| **Logical** | Ownership, boundaries, bounded contexts | `apex-architecture` |
| **Physical** | Tables, columns, types, indexes, migrations | `apex-data`, per phase |

The **conceptual** layer fell between requirements (which capture scope, not entities) and per-phase
physical schema. For a CRUD app that is fine. For a data-heavy app it is a real risk: emergent
per-phase schema with no anchoring conceptual model **drifts into incoherence** — phase 3's tables
don't fit phase 1's assumptions, because no single artifact ever described the whole entity set.

## Decision

Add a first-class **conceptual data-model artifact** to the ground-up flow, and the loop that keeps
it live:

- **Artifact:** `docs/technical/architecture/data-model.md` (beside `overview.md`) — **entities,
  relationships, invariants. Conceptual only.** It explicitly is *not* physical schema; DDL and
  migrations stay per-feature in specs (`apex-data`) and must *reconcile with* this model.
- **`apex-init` seeds the stub** for data-bearing projects (inferred from the confirmed stack having
  a persistence layer). Stateless projects (static site, pure CLI with no stored data) skip it and
  record "no persistent data model" in REQUIREMENTS. The stub carries the marker
  `<!-- apex:data-model:stub -->`, parallel to the overview stub.
- **`apex-plan`** captures the conceptual model early for data-bearing projects, and its
  doc-coverage check gains a signal when `data-model.md` is still a stub while data/schema work is in
  play (informational, mirrors the overview-stub signal — never blocks).
- **`apex-data`** reconciles every physical-schema change against `data-model.md`, and updates the
  model when a feature introduces a new entity. This is the coherence mechanism.
- **`apex-architecture`** owns the conceptual-model technique (entities/boundaries) and points to the
  artifact as its recorded home.

## Consequences

**Good:**
- Per-phase physical schema stays coherent against a single conceptual anchor, instead of being
  stitched together blindly across phases.
- The conceptual model survives session boundaries (a persistent artifact loaded like the others) —
  the entity set isn't re-derived from memory each session.
- Does **not** violate SP3: physical schema still emerges per phase; only the conceptual anchor is
  captured upfront.

**Bad:**
- One more artifact to keep current; a rotted stub misleads (mitigated by the doc-coverage signal).
- A light reconcile step is added to `apex-data`'s per-phase work.

**Neutral:**
- The conceptual-only boundary must be policed or the doc bloats into a schema dump — the stub
  language enforces it ("not physical schema").
- Scope-gated, so stateless projects pay no ceremony tax.
