# ADR-004: Skill-system structure — single-file default, triple-write registry, Iron Law

**Date:** 2026-05-31 _(back-filled — conventions accreted across sessions 1–9, codified in apex-skill-author; documented as part of the ADR-001 dogfood pass)_
**Status:** Accepted
**Sources:** `docs/research/skill-authoring-best-practices.md`, `docs/research/model-specific-skill-authoring.md`

## Context

APEX *is* a set of Claude Code skills — the system is built out of the same artifacts it
governs. Skills are authored by Claude (planning) and consumed by both backends (ADR-002).
Without structural rules the skill set would rot in predictable ways: skills that duplicate
what the model already knows, drift between a `SKILL.md` and a parallel `impl.md`, become
undiscoverable, or grow past the point where loading them is worth the context cost. A capable
model copies a skill's *structure* correctly but reliably gets the *judgment* wrong (skips
testing, over-writes, defaults to the wrong backend).

## Decision

- **Single-file `SKILL.md` is the default.** Add an `impl.md` *only* when there are genuine
  coding-mode enforcement patterns (working code, NEVER/ALWAYS rules, verification commands
  DeepSeek must follow). A draft `impl.md` that duplicates the SKILL.md is the signal it
  shouldn't exist.
- **Triple-write on every create/update** — a skill is not "done" until all three are updated:
  `registry/domains.md` (routing), `SKILLS.md` (human index), `SKILL-HISTORY.md` (change log,
  newest-first).
- **Author to the executor's capability floor** — `impl.md` is tuned to DeepSeek V4 Flash
  (no judgment calls, short checkpointed tool chains); `SKILL.md` is tuned to Claude (judgment
  prose, but name the scope explicitly).
- **The Iron Law** — no skill is created or edited without a failing baseline test first
  (RED → GREEN → REFACTOR for documentation). Owned by `apex-skill-author`.
- **Hard cap of 500 lines / 5k tokens per `SKILL.md`** — loaded content is a recurring
  per-session cost; over the cap, detail moves to a referenced file with a load condition.

## Consequences

**Good:**
- Skills encode *judgment the model lacks*, not what it already knows — every line earns its
  context cost.
- The triple-write keeps routing, discovery, and history in sync.
- The Iron Law stops skills from documenting what the model already does while missing the gap.

**Bad:**
- Authoring overhead is real: a baseline test plus three registry updates per change.
- The single-file default occasionally forces a judgment call about whether enforcement
  patterns are "genuine" enough to warrant an `impl.md`.

**Neutral:**
- APEX diverges from minimalist skill specs (which need only `name`+`description`) by adding
  `version`/`last_updated`/`sources`/`staleness_threshold`/`backend` frontmatter — deliberate,
  to drive the staleness-refresh and backend-routing systems.
