# Compare-and-absorb: agent0ai/DOX

_Planning-mode absorption pass, 2026-06-09. Report-first per [[absorption-pass-protocol]]. No skill edits made._

**Source:** https://github.com/agent0ai/dox (Agent Zero org). Pure-Markdown, zero-dependency.
**Identity:** read via README.md + root AGENTS.md (raw). License/SHA not pinned (quick study, not a clone-ceremony pass — single-idea repo, no decision-grade dedup at stake).

## What DOX is

A **hierarchical `AGENTS.md` documentation framework**. One idea, executed cleanly:

1. **Hierarchy** — `AGENTS.md` at repo root + `AGENTS.md` in any subdirectory that's a "durable boundary". Each parent indexes its direct children and states what it owns vs delegates.
2. **Read-before-edit traversal** — before touching a path, walk root→target reading every `AGENTS.md` on the route; nearest doc is the local contract.
3. **Conflict rule** — "closer docs control local details, but **child docs cannot weaken parent DOX**" (asymmetric override).
4. **Mandatory update pass** — every meaningful change (purpose/scope/ownership/contracts/workflows/IO/permissions) requires updating the affected `AGENTS.md`.
5. **Style contract** — "concise, current, and operational"; "delete stale content immediately rather than explaining history".
6. **Bootstrap** — drop the root `AGENTS.md` in, or tell the agent "Initialize DOX tree for this project now" → it auto-generates the child files + indexes.

## Dedup map — DOX mechanism → APEX equivalent

| DOX mechanism | APEX already has | Verdict |
|---|---|---|
| Hierarchical instruction files | CLAUDE.md chain (global → project), 2-level | **DUP** (APEX keys context by *domain/skill*, not by *directory* — a deliberate design difference, see below) |
| Index that points to deeper docs | System Overview as living capability index (ADR-014), token-guardrailed, merge-on-archive | **DUP** |
| Read-before-edit traversal | planning→spec→coding loop; surgical scope lock; spec lists exact files per task | **DUP** |
| Update-docs-after-meaningful-change | thin handoff + status.md hygiene + System Overview merge-on-archive + SKILL-HISTORY contract | **DUP** |
| "Delete stale content immediately; contracts over history" | status.md "current state only, no rolling log"; handoff = "what git can't reconstruct"; ADR-014 terse index | **DUP — verbatim same philosophy** |
| Auto-generate the doc tree ("Initialize DOX tree") | **deliberately rejected** — see collision below | **REJECT (evidence-backed)** |
| Conflict rule: child cannot weaken parent | CLAUDE.md says "project overrides global where they conflict" + permanent hard blocks are non-overridable | **PARTIAL gap** (APEX has the override direction + hard-block floor, but no general "child can't weaken parent" asymmetry — minor) |

## The collision (this is the headline)

DOX's flagship feature — **auto-generating a tree of per-directory context files** — is precisely the
failure mode your own session-29 research (`agentmd-context-files-study.md`, arXiv:2602.11988) found
**measurably harmful**: LLM-auto-generated context files *reduced* task success (−0.5% to −2%) and added
a **~20% cost tax**. Only *human-written, non-redundant* files helped (+4%, still +~20% cost).

DOX is the maximalist version of the thing APEX has principled, primary-source-grounded reasons to avoid:
- More files, appended on traversal = more always-on tokens on the hot path. APEX spent Phase 2 (`apex-context-budget`) and the ~70% tripwire *fighting* exactly this.
- Auto-generated (vs hand-curated) = the indicted quadrant of the study.
- Your two parked watch-items already say: (a) "never add an auto-generate-CLAUDE.md feature"; (b) add an "is this inferable from the repo?" deletion criterion. DOX violates both by design.

**APEX already embodies DOX's *good* disciplines** (concise/current/operational, delete-stale, read-before-edit, index-don't-inline) and has a **stronger, evidence-based position on its one novel mechanism** (the auto-grown tree).

## What's genuinely worth considering (thin)

Only one candidate clears the dedup + cost bar, and it's small:

- **R1 — "child cannot weaken parent" asymmetry in the CLAUDE.md chain.** Today APEX says project CLAUDE.md *overrides* global where they conflict, with hard blocks as a non-negotiable floor. DOX's sharper framing — *local docs refine but cannot relax inherited rules* — is a cleaner statement of the floor. Could be a one-line clarification in global CLAUDE.md §priority / `apex-governance`. **Token cost: ~1 line. Value: marginal** (APEX's hard-block list already enforces the only cases that matter). Likely **note-only**.

Everything else is a dup of something APEX does, or the rejected auto-gen mechanism.

## Token-cost watchlist

- Adopting DOX's directory-tree model would be a **net context regression** — it multiplies always-on files against the exact tax `apex-context-budget` exists to suppress. Flag any future "let's add per-folder AGENTS.md" impulse straight to this finding.

## Recommendation

**Reject as a system; absorb nothing structural.** DOX is a clean articulation of principles APEX
already holds, wrapped around one mechanism APEX has deliberately and evidence-backedly declined.

- **Validating signal:** an independent, popular project converged on APEX's *style* contract
  ("concise, current, operational; delete stale immediately") — confidence that those rules are right.
- **Optional micro-distill:** R1 (one-line "child can't weaken parent" in the override hierarchy) —
  user's call; defensible to skip.
- **Reaffirm parked watch-items** (a) never auto-generate context files, (b) "is this inferable from
  the repo?" deletion criterion in `apex-context-budget`/`apex-refresh` — DOX is a concrete example of
  the anti-pattern, worth citing when those items are eventually actioned.

## Sources
- agent0ai/dox — README.md + root AGENTS.md (raw, 2026-06-09) [VERIFIED]
- `docs/research/agentmd-context-files-study.md` / arXiv:2602.11988 [VERIFIED — primary]
