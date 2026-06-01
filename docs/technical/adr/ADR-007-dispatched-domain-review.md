# ADR-007: Dispatched domain review — a generic spec-reviewer with an enforce/review role-split

**Date:** 2026-06-01
**Status:** Accepted
**Builds on:** [ADR-004](./ADR-004-skill-system-structure.md) (skill system structure), [ADR-003](./ADR-003-pipeline-artifact-model.md) (pipeline artifact model)

## Context

APEX registered 18 per-domain `apex-*-agent` definitions intended to "review in planning,
enforce in coding." In practice neither half fired through them: the planning-review role was
never dispatched, and coding-side enforcement runs through `apex-coder` wave-workers loading the
domain `impl.md` inline. The per-domain roster was dead weight — the standing SP2 *agent-wiring*
open question.

Two mechanisms can apply domain knowledge to a draft spec:
- **Inline** — the planner loads domain `SKILL.md`s into its own window and self-reviews.
- **Dispatched** — a fresh-context agent reviews the draft against a domain skill and returns findings.

A baseline test (2026-06-01) settled which is worth wiring. A deliberately gap-planted
multi-domain spec (password-reset: auth/security/data/testing) was reviewed both ways with the
model held constant and the agents sandboxed from the repo's own planning docs:

- **Inline omni-review** caught most gaps but produced a flat, unranked 20-item list with no
  severity, and **missed the reversible-migration (`downgrade()`) requirement** entirely —
  it over-indexed on the salient security items.
- **Dispatched per-domain reviewers** returned findings classified **BLOCK / FLAG**, each cited
  to a specific skill rule (OWASP A02/A10, NIST 800-63B, the data skill's review-checklist),
  caught the migration gap the inline pass missed, and kept the planning window lean (the heavy
  domain knowledge loaded in disposable sub-contexts).

The honest finding: inline review is *not* incompetent — a strong model catches the salient gaps.
But dispatched, skill-anchored review wins on the three things that matter for an unattended (AFK)
pipeline: **(1)** gate-ready output (severity-classified, rule-cited — drops straight into the
readiness gate's BLOCK/FLAG resolution), **(2)** systematic coverage of the *non-salient* checklist
items inline review skips, and **(3)** window economy — the cost that compounds across a long
project (Artemis).

## Decision

- **Role-split.** *Enforce* knowledge loads **inline** where writing happens (coding-side,
  unchanged — `apex-coder` wave-workers load `impl.md`). *Review* knowledge is **dispatched** to a
  fresh-context agent (planning-side).
- **One generic parametrised reviewer — `apex-spec-reviewer`** — pointed at `apex-<domain>/SKILL.md`.
  **No per-domain agent roster.** The per-domain planning-review stubs are retired. Coding-side
  agents that carry real per-domain *tooling* are kept: `apex-security-agent` (Bash verification)
  and `apex-figma-agent` (MCP/image steps); the live post-build doc pipeline agents
  (`apex-docs-product-agent`, `apex-docs-technical-agent`) are untouched.
- **Wire the review role in `apex-plan` (Deep Details) first.** The planning window is where keeping
  context lean matters most, and where BLOCK/FLAG resolution already lives.
- **Trigger.** Auto-fire for the heavy set the spec touches — **security, auth, data, testing,
  accessibility**; the planner may judgment-fire any other touched domain; **skip trivial
  single-domain specs** (inline drafting already handles the salient single-domain case — don't pay
  the spawn).
- **Sandbox.** The reviewer reads only the one domain `SKILL.md` + the draft spec — never the repo's
  planning docs (status, ADRs, roadmap). This avoids the contamination that pollutes baseline tests
  and keeps the review anchored to the skill, not the project's own narrative.
- **Resolution.** Findings route into the existing readiness-gate *Specialist flags* section: BLOCK
  must be resolved in the spec; FLAG resolved or explicitly accepted — **before** the spec moves to
  `docs/changes/`.
- **Out of scope (still open):** a coding-side verify-dispatch (an independent post-wave domain
  review on the DeepSeek backend) — it needs its own baseline on that backend and DeepSeek's ability
  to orchestrate the sub-dispatch is unproven.

## Consequences

**Good:**
- Domain review becomes gate-ready (severity-classified, rule-cited) and systematically covers the
  non-salient items inline self-review skips.
- The planning window stays lean — heavy domain knowledge loads in throwaway sub-contexts; the win
  compounds as the project grows.
- One reviewer definition replaces a dead 18-agent roster — less to maintain, and adding a new domain
  skill needs no new agent.

**Bad:**
- A spawn per dispatched domain costs latency and tokens; mitigated by the skip-trivial trigger and
  the bounded auto-fire set.
- The review is only as good as the domain `SKILL.md` it reads — a thin or stale skill yields thin
  review, tying review quality to the SP5 sweep.
- DeepSeek cannot reliably make the fire-or-skip judgment, so the review role stays planning-side
  until the coding-side baseline is done.

**Neutral:**
- The 14 now-unreferenced per-domain stubs are left on disk this session and deleted in a follow-up
  cleanup (they touch no live path once the registry no longer routes to them).
- Reuses the existing BLOCK/FLAG escalation vocabulary (`apex-security`) and readiness-gate machinery
  — no new severity model introduced.
