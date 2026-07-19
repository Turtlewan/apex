# ADR-005: Stack best-practice skills — a global skill family, a coverage gate, and project binding

**Date:** 2026-05-31
**Status:** Superseded — the stack-skill family and its per-project binding were removed with the knowledge layer by [ADR-036](./ADR-036-remove-knowledge-layer.md); the Verification Recipe now lives in each repo's `AGENTS.md` ([ADR-037](./ADR-037-three-context-files.md)). Decision text below is a dated record.
**Extends:** [ADR-004](./ADR-004-skill-system-structure.md) (skill-system structure)

## Context

APEX has three kinds of skills today: **capability** skills (`apex-auth` — how to do a
feature), **specialist** planning skills (`apex-frontend` — a discipline's review lens), and
**cloud/infra** skills (`apex-aws`). `apex-stack` *selects* a stack, but nothing carries the
reusable, opinionated best-practices for the language/framework/tool that was chosen — how to
write good Next.js, FastAPI, or Django. That coverage falls to the base model's general
knowledge or to broad specialists; neither encodes the *enforce-this-every-time* idioms a
dedicated skill would.

It is also a **flow** gap. Stack selection produces a bare `stack:` string in `status.md` and
then nothing checks whether that stack has skill coverage. Every later spec re-discovers
relevant skills reactively via keyword detection — there is no persistent "skills in play" for
the project. This is the concrete head of the parked *"Stack-skill ↔ project binding"* umbrella.

## Decision

- **New skill family: stack skills** — `apex-<stack>` (e.g. `apex-nextjs`, `apex-fastapi`,
  `apex-django`). Reusable, opinionated best-practices for one language/framework/tool. Global
  like every APEX skill (`~/.claude/skills/`); any project on that stack benefits. Distinct
  from capability and specialist families. The meat lives in **`impl.md`** (patterns coding
  mode enforces); `SKILL.md` carries the thinner planning-side "what to weigh."
- **Altitude is emergent, not a matrix.** Author a stack skill where the opinions live —
  usually the framework (`apex-django`), language-level (`apex-python`) only when there are
  genuine language-wide opinions worth enforcing. Do not pre-build a coverage grid.
- **Coverage gate in `apex-stack`.** After the stack is chosen, check the registry for an
  `apex-<stack>` skill matching the chosen components. **Default when none exists:
  record-the-gap-and-proceed** on base-model knowledge — the gate surfaces the gap but never
  derails a build to author a skill. Authoring, if wanted, is a separate explicit step via
  `apex-skill-author`.
- **Project binding: a `stack_skills:` field in `status.md`** names the stack skills in play
  so specs stop re-discovering them. Minimal by design; a richer manifest (pinned versions,
  `docs/technical/stack.md`) stays parked under the umbrella.
- **Build threshold.** A stack skill is worth creating only when **(a)** the stack recurs
  across projects **and (b)** there are patterns the base model gets wrong or that should be
  enforced consistently. Otherwise the gate records "no skill — proceeding on base knowledge."

## Consequences

**Good:**
- The stack's idioms get one reusable home; every project on that stack inherits enforced
  best-practices instead of re-deriving them.
- The coverage gate makes the gap *visible at stack-selection time* instead of silently absent.
- `stack_skills:` gives the project a persistent "skills in play" — closes part of the
  umbrella's re-discovery gap.

**Bad:**
- Stack skills are the fastest-rotting content in APEX (framework versions move monthly) —
  they need version pins + `apex-refresh` discipline or they will mislead.
- Family-proliferation risk: without the build-threshold, every stack combo spawns a skill.
  The record-and-defer default is the brake.
- Composition is unresolved: when a stack skill and a capability skill both apply (a Next.js
  project doing auth) they may assume different things (cf. `apex-search` assuming pgvector).
  Precedence between families is deferred to the umbrella.

**Neutral:**
- Extends ADR-004 rather than revising it — the new family obeys the same single-file-default,
  triple-write, and Iron Law rules. It is a new *category*, not a new mechanism.
- The coverage gate is informational like `apex-plan`'s doc-coverage check — it surfaces,
  it never blocks.
