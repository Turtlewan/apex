# ADR-036: Remove the knowledge layer — APEX carries workflow, not knowledge

**Date:** 2026-07-14
**Status:** Accepted
**Supersedes:** ADR-005 / ADR-006 (stack-skill Verification Recipe binding) in part — see § Consequences
**Related:** ADR-007 (per-domain agent retirement — this completes it), ADR-027 (frontier coder)

## Context

APEX shipped **50 skills**, of which **36 were domain specialists** — `apex-security`,
`apex-frontend`, `apex-k8s`, `apex-auth`, `apex-python`, `apex-aws`, and so on. Together with their
`impl.md` files and references they were ~12,000 of APEX's ~17,700 lines. A keyword registry
(`registry/domains.md`) matched user messages to them and loaded them into context.

They were built for **DeepSeek** — a weak coder that needed rails: explicit NEVER/ALWAYS rule files,
OWASP checklists, "hash with bcrypt cost 12", "use `min-h-[100dvh]` not `h-screen`". That scaffolding
was rational when the coder couldn't be trusted to know the basics.

**The coder is now Codex `gpt-5.6-sol`, with Opus as fallback.** It knows all of it cold.

APEX's own evidence had been saying so for months, and we kept not acting on it:
- The **Iron Law** (baseline-test before writing) was applied to every *new* skill and **never
  retroactively to the 17,700 lines already there**.
- Session 69: a proposed `apex-hostbuild` skill was **killed by its own RED baseline** — two bare
  Opus probes reproduced the entire decision rule cold, including under adversarial pressure.
- The agent-skills absorption pass **cut three sections as model-redundant** (elicitation,
  deprecation, AI-perf anti-patterns).
- The Impeccable pass **rejected all four prose rules** — reproduced cold by bare agents.
- ADR-021 (memory), ADR-011 (no learning engine), ADR-027 (one frontier coder beats a routing tree)
  are all the same finding from different angles: **the model already has it.**

Every one of those was a local verdict. None of them were generalised. The result was a ratchet with
no pawl — every session added an ADR, a skill version, a status paragraph; nothing was ever removed.

## Decision

**Delete the entire domain-knowledge layer.** 36 skills, the keyword registry, and the four
domain-tooling agents are gone.

APEX now carries **only what a frontier model cannot derive**:
1. **Workflow** — the plan→spec→build→verify→handoff loop, wave dispatch, mode routing.
2. **State** — this project's status, specs, decisions, history.
3. **Gates** — autonomy levels, hard blocks, evaluator-independence, the write-guard.

The test for any future skill: *would a bare frontier agent, with no skill loaded, produce this?*
If yes, it does not belong in APEX. Domain expertise is not written down — it is **applied at
drafting** and **stress-tested at review**.

**14 skills remain:** the spine (orchestrate, plan, code, handoff, init, governance), process
(debug, research, deep-dive, stack), and meta (skill-author, refresh, context-budget,
coding-principles).

## Consequences

**Good**
- ~12,000 lines and 36 skills deleted. Per-session context tax drops sharply — the registry, the
  skill descriptions, and the matched-skill loads all shrink.
- The Iron Law is now applied *consistently* rather than only to new work.
- Review gates got **better, not worse**. They were parametrised by a domain rulebook and required
  every finding to cite a skill rule. They are now anchored on **evidence** — a file:line, a quoted
  spec clause, a concrete failing scenario. This matches where their value actually came from: the
  Sol plan-check gate's two real BLOCKs (launcher pins the model, ExecutionPolicy, routing gap) came
  from independent adversarial reading, **not** from any domain rule.

**Bad / accepted**
- **The Verification Recipe loses its global home.** ADR-005/006 bound `stack_skills: [apex-python]`
  so `apex-code` could read `## Verification Recipe` from the skill. That binding is dead. The
  recipe was never model knowledge anyway — `uv sync → ruff → mypy --strict → pytest -q` is
  something any coder derives. What *isn't* derivable is **how this specific repo verifies itself**,
  which is a **per-project fact** and now lives in the project: `status.md` → `## Verification
  Recipe`, mirrored into `AGENTS.md` for dispatched Codex tasks. `apex-code`'s existing fallback
  (spec's `## Commands to run`) already covered the no-binding case.
- **A genuinely obscure domain gotcha now has no home.** Accepted. If the model gets something
  wrong, that is a bug report against its output — the fix goes in the project's `AGENTS.md` or the
  spec, not a new global skill. Re-creating the layer one skill at a time is the failure mode to
  watch for.
- Four agents deleted (`apex-security-agent`, `apex-figma-agent`, and the two domain review stubs).
  The two **doc** agents were kept — they are process (write the handoff, archive the spec, update
  CHANGELOG), not knowledge.

**Neutral**
- Everything is in git. `git revert` restores the layer if this proves wrong.
- The design *workflow* from `apex-ui-ux-design` — the persisted artifacts (app-flow, design-brief),
  the ask-first aesthetic gate, the cheap-mockup loop, the visual review gate — was **salvaged** to
  `apex-plan/references/design-workflow.md`. It is user preference and project machinery, not
  knowledge, and would not have regenerated. Its three reference files moved with it.
- `apex-stack` survives but no longer binds global stack skills; it now writes the Verification
  Recipe into the project.
