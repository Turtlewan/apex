# APEX — System Overview

APEX is a system of [Claude Code](https://claude.com/claude-code) skills that turns every
AI-assisted development session into a structured, reproducible workflow. It covers the full
lifecycle — planning specs, executing builds, debugging, reviewing, and handing off — and it
preserves state across session boundaries so no context is lost when a session ends.

It is built for a single solo developer using Claude Code as a primary development partner,
and it is **self-hosting**: APEX is itself a set of skills, specced, built, and maintained
through the same pipeline it provides. There is no application code, no build step, and no
test runner — every file is Markdown (a skill or a planning document).

## What it does

APEX sits between the developer and Claude Code and gives every session a known shape:

1. **Orient** — at session start an orchestrator reads the project's live state, surfaces any
   in-flight work, sets the autonomy level, and routes to the right skill.
2. **Plan** — judgment work (turning a request into a complete, unambiguous spec; writing
   ADRs; design and research) is done by the host.
3. **Build** — literal execution of a frozen spec is dispatched to a coder (see below).
4. **Hand off** — the build leaves a handoff doc; planning leaves a spec. State that must
   survive lives in durable artifacts, not in the conversation.

APEX carries **workflow, state, and gates — not domain knowledge**. The 36 domain skills that
once loaded on demand were deleted in [ADR-036](../adr/ADR-036-remove-knowledge-layer.md):
written-down knowledge a frontier model already has measurably degrades its output. Fourteen
workflow skills remain.

## How it's structured

**One session plans, builds, and verifies** ([ADR-038](../adr/ADR-038-single-session.md)).
There are no modes, no `APEX_MODE`, no environment-detected backend swap, and no write-guard —
the mode split and its hooks were all removed. Work is divided by **role**, not by session:

- **Host (Fable)** — reasons, plans, and challenges. Dispatches every worker below; makes no
  mechanical edits and writes no code, but owns the project's state-keeping (status.md,
  handoff, memory).
- **Spec author (Opus)** — a `model: opus` worker drafts specs and ADRs from the host's plan.
- **Build orchestrator (Sonnet)** — a `model: sonnet` worker runs waves and routes exit codes.
- **Coder (Codex `gpt-5.6-sol`)** — dispatched per task as a `codex exec` subprocess (own auth,
  own quota). Verify-fail escalation climbs the reasoning-effort dial (`…→max→ultra`), then
  falls back to **Opus** (fresh `model: opus` worker) if Codex quota is exhausted.
- **Review is cross-family, both directions** — Codex checks the host's plans/specs; Claude
  reviews Codex's code. An agent never reviews its own output
  ([ADR-032](../adr/ADR-032-gpt56-role-split.md)/[ADR-034](../adr/ADR-034-sol-default-coder.md)/[ADR-042](../adr/ADR-042-critical-file-confirmation-and-achievable-cross-family.md)).

Roles communicate only through files, and every fact has exactly **one home**:

| Artifact | Source of truth for |
|----------|--------------------|
| git history | what changed, commits, SHAs |
| `docs/status.md` | durable live state — in-flight work, pending specs, open questions, parked items |
| handoff doc (`docs/handoff/`) | narrative "what the build learned that git can't show" — a read-once inbox |
| spec (`docs/changes/`) | the forward work definition (planning → build) |
| memory | cross-session user/project facts |
| ADR (`docs/technical/adr/`) | the *why* behind architectural decisions |

The skills themselves live outside the project repo, under `~/.claude/skills/apex-*/`, with a
human-readable index (`SKILLS.md`) plus a change log (`SKILL-HISTORY.md`) in this repo. There is
**no registry** — it duplicated the index and routed nothing (removed with the knowledge layer,
ADR-036). Skill loading is by frontmatter `description`; a skill is a `SKILL.md` plus optional
`references/` loaded on demand. Only `apex-coding-principles` still carries an `impl.md`.

## Shaping decisions

The handful of decisions that define APEX's architecture — each links to its ADR for the full
*why* and the alternatives that were rejected:

| Decision | Why (→ ADR) |
|----------|-------------|
| One session, no modes — host plans/builds/verifies; role split replaces the backend split | [ADR-038](../adr/ADR-038-single-session.md) · [ADR-045](../adr/ADR-045-four-role-split.md) |
| One home per fact; thin handoff drained to inbox-zero; spec = execution script | [ADR-003](../adr/ADR-003-pipeline-artifact-model.md) |
| Three-file doctrine — CLAUDE.md (prefs) · AGENTS.md (build contract) · status.md (live state) | [ADR-037](../adr/ADR-037-three-context-files.md) |
| Knowledge layer removed — 14 workflow skills, no domain skills, no registry | [ADR-036](../adr/ADR-036-remove-knowledge-layer.md) |
| Every APEX-built project maintains this Overview + an ADR log (enforced-capture) | [ADR-001](../adr/ADR-001-per-project-documentation-contract.md) |
| Codex is the primary coder (per-task `codex exec` subprocess), Opus the inline fallback; DeepSeek archived | [ADR-027](../adr/ADR-027-codex-primary-opus-fallback-deepseek-archived.md) |
| Codex context propagation — thin AGENTS.md + selective generated `.agents/skills/` cards + per-task dispatch pack with JSON completion contract | [ADR-031](../adr/ADR-031-codex-context-propagation.md) |
| GPT-5.6 role split — Sol plan-checks + codes; cross-family review routing; Sol escalation rung | [ADR-032](../adr/ADR-032-gpt56-role-split.md) |
| Two-tier critical-file confirmation and the executable cross-family completion gate reading recorded ledger facts | [ADR-042](../adr/ADR-042-critical-file-confirmation-and-achievable-cross-family.md) |

## Where to look next

- **PROJECT.md** — vision and success criteria.
- **CLAUDE.md** — the operating instructions the session follows.
- **AGENTS.md** — the coder's build contract for this repo.
- **SKILLS.md** — the index of every skill.
- **`docs/technical/pin-change-sweep.md`** — the checklist to run when any model pin or
  architecture doctrine changes, so this overview and its peers don't rot.
- **`docs/research/`** — the design notes the ADRs distil.
