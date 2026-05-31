# ADR-003: Pipeline artifact model — one home per fact, thin draining handoff

**Date:** 2026-05-31 _(back-filled — decision worked out in session 8, implemented session 9; documented as part of the ADR-001 dogfood pass)_
**Status:** Accepted
**Design note:** `docs/research/pipeline-artifact-model.md`

## Context

The planning↔coding loop (ADR-002) produces several artifacts: git history, `status.md`,
the handoff doc, specs, memory, and ADRs. Early on these overlapped — the handoff repeated
what changed (already in git), current state (already in `status.md`), and which specs
finished (already in `done/`). That duplication was the root cause of two failures:

1. **Bloat and drift** — the same fact recorded in two places diverged; readers trusted the
   wrong copy.
2. **Lost items** — the handoff was treated as a read-once glance. "Surfacing" an item is not
   "landing" it, so items read but not filed silently disappeared.

DeepSeek's literal execution (ADR-002) also means a spec carrying *why*-rationale invites the
executor to act on it; specs needed to be stripped to *what*.

## Decision

**One home per fact**, decided by the *kind* of fact:

| Fact | Home |
|------|------|
| What changed, SHAs | git history |
| Durable live state (In-Flight, Pending Specs, Open Questions, Parked) | `status.md` |
| Narrative "what the build learned that git can't show" | handoff doc (read-once inbox) |
| Forward work definition | spec (`docs/changes/`) |
| Cross-session user/project facts | memory |
| Architectural *why* | ADR |

Supporting rules:
- **git is the changelog** — no other artifact duplicates the file-level record (depends on
  per-spec conventional commits).
- **The handoff is thin and drained to inbox-zero** — every item terminates in exactly one of:
  Pending Spec, Open Question, Folded, or Discarded, *this session*.
- **The spec is an execution script, not a design doc** — one-line identity, no *why* inline,
  every task names its exact files. The *why* lives in the ADR; the convention lives in the
  skill's `impl.md`.

## Consequences

**Good:**
- No fact has two homes, so nothing drifts; readers always know where to look.
- Thin handoffs are cheap to read; the drain guarantees nothing is lost.
- Stripped specs are safe to hand to a literal executor.

**Bad:**
- More per-session discipline: planning must drain the handoff and front-load every decision
  the spec needs before it freezes.
- Strict separation means a single logical change can touch several artifacts (spec + ADR +
  status.md), each with its own update rule.

**Neutral:**
- Drained handoffs stay git-tracked but are never auto-read again — accumulation is storage,
  not context.
