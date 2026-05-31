# ADR-001: Per-project documentation contract — enforced System Overview + ADR log

**Date:** 2026-05-31
**Status:** Accepted

## Context

APEX-built projects come out under-documented in the one dimension that survives a
model/tooling switch: the system's *what* and *why*. The driver is portability — keeping a
project's reasoning from dying in conversation context or thin, drained handoffs. Audience is
humans first; model-switch insurance (scenario A — keep APEX running, swap the LLM underneath)
is a free byproduct of the same artifact.

The capability to do this already exists, but never fires:
- **Homes exist** — `apex-init` already scaffolds `docs/technical/adr/` and
  `docs/technical/architecture/` on every new project.
- **Doc types are described** — `apex-docs-technical` (ADR/architecture/runbook/setup),
  `apex-docs-product` (Divio four-type model).
- **Routing rules exist** — `apex-plan` is meant to write an ADR per architectural decision;
  `apex-handoff`'s triage-drain says "architectural decisions → ADR during triage" and bans a
  standing `decisions.md` log.

Yet **zero ADRs and zero overviews exist on any project, including APEX itself.** The rules are
advisory, never fire, and nothing verifies them. Advisory is therefore proven insufficient.

## Decision

Every APEX-built project maintains a two-layer, human-readable documentation pair:

1. **System Overview** — `docs/technical/architecture/overview.md`: a single readable Divio
   "Explanation" — what the system does, how it's structured, and the handful of decisions that
   shaped it (each linking to its ADR). The story.
2. **ADR decision log** — `docs/technical/adr/ADR-NNN-*.md`: the append-only *why* + rejected
   alternatives, in the existing Context → Decision → Consequences format. The footnotes.

Production model: **enforced-capture, no blocking gate.** Required workflow steps plus a visible
coverage audit — but nothing halts a build:
- `apex-plan` readiness gate **requires** an ADR for each architectural decision and an overview
  update when the architecture changed.
- `apex-handoff` drain **requires** each build-time architectural decision (tagged in the
  handoff's "Decisions Made") to terminate as an ADR.
- `apex-plan` session-start surfaces a lightweight doc-coverage check (overview exists and is
  non-stub; decisions not yet ADR'd; overview staleness) — informational, mirroring
  `apex-refresh --audit`. It never blocks.
- ADR and Overview **authoring stays in planning (Claude)**, not coding (DeepSeek) — the
  rationale/narrative is judgment-heavy, DeepSeek's weak area (author-to-capability-floor). Coding
  only flags architectural decisions for the drain.

Scope: a single top-level overview (per-component architecture docs deferred to scale-up).
Operational docs (runbooks, DR, monitoring) are out of scope for this contract — a later
maturity tier.

## Consequences

**Good:**
- A project's *what + why* survives a model swap and onboards a human cold.
- APEX stops describing documentation it never produces.
- Dogfooded on APEX itself — this ADR is the first one the project has ever had.

**Bad:**
- Adds required steps to planning's readiness gate and handoff drain — more per-session discipline.
- No hard gate means a determined skip is still possible; accepted, with the visible coverage
  audit as the backstop.

**Neutral:**
- Implemented as 4 skill edits (`apex-init`, `apex-plan`, `apex-handoff`, `apex-docs-technical`),
  no new skill.
- The coverage audit folds into `apex-plan` session-start rather than a standalone command.
