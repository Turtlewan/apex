# ADR-006: Buildability layer — verification inversion and the layered Verification Recipe

**Date:** 2026-05-31
**Status:** Accepted
**Builds on:** [ADR-005](./ADR-005-stack-best-practice-skills.md) (stack best-practice skills), [ADR-004](./ADR-004-skill-system-structure.md) (skill structure)

## Context

ADR-005 establishes that selection weighs **AI-buildability** heavily and that stack skills
exist to *raise* it. This ADR defines the machinery that actually does the raising.

Building competently in a stack the developer does not know depends on one thing above all: a
**tight, stack-specific, legible verification loop** — the AI writes, runs checks, reads a
precise error, fixes, repeats, and converges. Today APEX cannot give it that:

- **The verification knowledge is scattered across three wrong homes, all npm-biased.**
  `apex-testing/impl.md` hardcodes `npm test` / `npm run test:coverage`; `apex-code`'s L3
  says a generic "test/lint/build" with no commands; and the *only* concrete commands come
  from whatever planning hand-typed into each spec's `## Commands to run`. Switch a project
  off JS and apex-testing is simply wrong, and planning must re-key pytest/mypy into every
  spec, forever.
- **No verification is stack-aware.** There is no `mypy`, `cargo test`, or `manage.py`
  anywhere in the system — the runner assumes JS/npm.
- **context7 is never invoked** by the build flow, so the "write it right" lever sits unused.

The root error: APEX baked stack-specific commands *into the runner* (like hardcoding
`npm test` into GitHub Actions itself) instead of letting each stack declare its own.

## Decision

- **Invert the dependency — mechanism vs config.** The runner owns the *procedure*; the stack
  skill owns the *commands*.
  - **`apex-code` / `apex-testing` become stack-agnostic runners** — they own the loop:
    run the recipe each task, and on failure read the error → one hypothesis → fix → re-run.
    They contain **no** stack-specific commands.
  - **Each stack skill declares a `## Verification Recipe`** in its `impl.md` — the exact
    `check / typecheck / lint / test / build` commands for that stack. This is the single
    highest-value section a stack skill carries.
- **The recipe is layered: language ⊂ framework.** Language-level commands (`mypy`, `ruff`,
  `tsc`, `cargo check` — typecheck/lint/format) and framework-level commands (`manage.py
  check`, `next build`) are distinct. **Verifiability is a language property** (static vs
  dynamic typing), so the language layer carries most of the buildability weight and is where
  it can be *bought back* — e.g. enforcing `mypy --strict` raises a dynamic language's
  feedback quality toward a typed one's.
- **Composition is via the `stack_skills` binding** (ADR-005). Coding mode loads every bound
  stack skill; the effective recipe is the union of their layers (language checks + framework
  checks). `stack_skills: apex-python, apex-django` → recipe = Python checks **+** Django checks.
- **`apex-code` reads the recipe from the active stack skill(s)** via the binding and runs it
  as the verify step — replacing the spec-carried, npm-biased commands. Specs carry only the
  per-feature *delta* (a new test), not the baseline recipe.
- **`apex-code` invokes context7** at the per-task write step for the active stack, so
  "write it right" actually happens and the loop needs fewer iterations.

## Consequences

**Good:**
- De-npm-ifies the entire verification path — non-JS stacks become buildable through the same
  code path, which is the precondition for ADR-005's merit-based, cross-ecosystem selection.
- The verify recipe is written once per stack and inherited by every project on it, instead of
  re-keyed into every spec.
- Gives the AI a genuine self-correction signal in a stack the developer does not know — the
  skill carries the competence the human lacks.
- The layered recipe localises the highest-value buildability lever (enforce-types-to-buy-
  verifiability) at the language layer, benefiting every framework on that language at once.

**Bad:**
- `apex-code` and `apex-testing` need reworking from npm-assuming to recipe-driven — a
  non-trivial change to load-bearing skills.
- A project with no stack skill for its stack has no recipe; the runner must fall back
  (spec-carried commands, or a generic best-effort) and flag the gap — another reason the
  coverage gate (ADR-005) matters.
- Recipe drift: a stack skill's commands rot with the framework's tooling — the same staleness
  burden ADR-005 already flags for stack skills, now load-bearing for the build loop.

**Neutral:**
- The verify-fail recovery loop reuses existing `apex-debug` discipline (one hypothesis at a
  time); this ADR wires it to verification failures, not only to spec forks.
- Loop granularity stays at the task level (not per-edit) — a deliberate balance between
  feedback tightness and runner overhead; revisit if convergence proves too slow.
