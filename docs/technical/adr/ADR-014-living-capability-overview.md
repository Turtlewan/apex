# ADR-014: System Overview as a living capability index (merge-on-archive)

**Date:** 2026-06-03
**Status:** Accepted
**Builds on:** [ADR-001](./ADR-001-per-project-documentation-contract.md) (per-project documentation contract), [ADR-003](./ADR-003-pipeline-artifact-model.md) (pipeline artifact model — the spec→done/ archive this hooks into)
**Source:** `docs/research/donor-analysis/` — convergent gap #2 (OpenSpec living-spec merge-on-archive; GSD milestone audit). Serves the portability-insurance goal (memory `per-project-what-why-docs`).

## Context

When a spec finishes, APEX moves it to `docs/changes/done/`. That archive is **write-only**: nothing
reads it back, and there is no guaranteed current-truth answer to "what does this system do today."
The System Overview (`overview.md`) is *meant* to be that answer, but today it is seeded as a stub and
has no mechanism that keeps it current as specs ship — so it rots silently. OpenSpec's defining move
is the inverse: on `archive`, the shipped behaviour is **merged back into a living capability spec**,
so the current-truth doc is always accurate.

APEX lacks that loop. The cost is real: each planning session re-derives "what exists" from git +
status.md + memory instead of reading one current doc — and a project handed to another developer (or
a future Artemis migration) has no maintained capability map. This is exactly the portability-insurance
gap already noted in memory.

**But this is the report's one HIGH token-cost item.** A naive "living spec set" (per-capability
scenario docs, all loaded to plan each change) is precisely the always-loaded-context trap. The design
must capture the *discipline* without the *weight*.

## Decision

Make **`overview.md` a living capability index, kept current by a merge-on-archive step** — and bound
its size by construction.

- **`overview.md` = a terse capability index, not a corpus.** Current-truth, bounded to ~1 page: a
  list of shipped capabilities (one line each: *what it does*, link to its ADR/spec), the system's
  shape, and the entity/flow anchors. **Not** a GIVEN/WHEN/THEN scenario set, not per-feature detail.
- **Merge-on-archive loop.** When a spec moves to `docs/changes/done/` (the existing per-spec
  coding-mode discipline), its shipped capability is folded into `overview.md` as one terse entry
  (added / modified / removed). This is the new step — the archive stops being write-only.
- **Optional delta markers.** A spec touching existing behaviour may tag changes `ADDED / MODIFIED /
  REMOVED` so the merge is mechanical (chiefly for brownfield/modify specs; greenfield specs just add).
- **Domain detail is on-demand, not global.** If a project grows past what a one-page index holds,
  per-domain capability detail lives in `docs/technical/architecture/capabilities/<domain>.md`, loaded
  **only** when a change touches that domain — never the whole set, never auto-loaded into planning.
- **Owner / trigger:** `apex-docs-technical` owns the overview format and the merge rule; the trigger
  attaches to the existing spec→`done/` archive step (`apex-code` in coding mode; the per-spec commit
  discipline in the global workflow). `apex-plan`'s doc-coverage check already flags a stale overview —
  it gains a sharper signal: overview not updated since the last `done/` archive.

## Consequences

**Good:**
- The archive loop closes: there is always a current-truth, one-glance "what does this system do" doc.
- Portability insurance — a handoff/migration target reads one maintained capability map, not git
  archaeology.
- Planning gets cheaper over time: "what exists" is read, not re-derived each session.

**Bad:**
- One more update step per shipped spec (small — one terse entry at archive time).
- Discipline-dependent: if the index isn't kept terse it bloats into the token trap. The "index not
  corpus" rule + the one-page bound + on-demand domain detail are the guardrails; police them.

**Token-cost:**
- **Low as designed** (terse bounded index, loaded like the other architecture docs) — **only HIGH if
  the guardrails are ignored** (a growing scenario corpus auto-loaded each plan). The whole design
  exists to keep it Low; the alternatives (always-load full capability set) are explicitly rejected.
