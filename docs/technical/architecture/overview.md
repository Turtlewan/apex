# APEX — System Overview

APEX is a system of [Claude Code](https://claude.com/claude-code) skills that turns every
AI-assisted development session into a structured, reproducible workflow. It covers the full
lifecycle — planning specs, executing builds, debugging, reviewing, and handing off — and it
preserves state across session boundaries so no context is lost when a session ends.

It is built for a single solo developer using Claude Code as a primary development partner,
and it is **self-hosting**: APEX is itself a set of skills, specced, built, and maintained
through the same pipeline it provides. There is no application code, no build step, and no
test runner — every file is Markdown (a skill, a registry entry, or a planning document).

## What it does

APEX sits between the developer and Claude Code and gives every session a known shape:

1. **Orient** — at session start an orchestrator reads the project's live state, surfaces any
   in-flight work, detects which mode it is in, and routes to the right skill.
2. **Plan** — judgment work (turning a request into a complete, unambiguous spec; writing
   ADRs; design and research) happens in *planning mode*.
3. **Build** — literal execution of a frozen spec happens in *coding mode*.
4. **Hand off** — each side leaves the other a single file: planning leaves a spec, coding
   leaves a handoff doc. State that must survive lives in durable artifacts, not in the
   conversation.

Domain knowledge (auth, storage, search, frontend, cloud, etc.) lives in ~40 specialist
skills that load on demand when their keywords appear.

## How it's structured

APEX runs as **two modes detected from environment signals** (`APEX_MODE` / base URL) and
enforced by harness hooks:

- **Planning mode** runs on **Claude** (judgment) and may write only `.md` files.
- **Coding mode** runs on a Claude host (**Sonnet 5 default** — ADR-032) that dispatches each
  task to **Codex (`gpt-5.6-terra`)** as a subprocess; verify-fail escalation runs
  Terra-effort → Sol → **Opus** (fresh `model: opus` worker at quota-out) (ADR-027/032;
  DeepSeek archived) — and may write anything.

The two modes never share live process state. They communicate only through files, and every
fact has exactly **one home**:

| Artifact | Source of truth for |
|----------|--------------------|
| git history | what changed, commits, SHAs |
| `docs/status.md` | durable live state — in-flight work, pending specs, open questions, parked items |
| handoff doc (`docs/handoff/`) | narrative "what the build learned that git can't show" — a read-once inbox |
| spec (`docs/changes/`) | the forward work definition (planning → coding) |
| memory | cross-session user/project facts |
| ADR (`docs/technical/adr/`) | the *why* behind architectural decisions |

The skills themselves live outside the project repo, under `~/.claude/skills/apex-*/`, with a
routing registry at `~/.claude/registry/` and a human-readable index (`SKILLS.md`) plus a
change log (`SKILL-HISTORY.md`) in this repo. Each skill is a `SKILL.md` (loaded in planning)
and optionally an `impl.md` (loaded in coding when there are enforcement patterns to follow).

## Shaping decisions

The handful of decisions that define APEX's architecture — each links to its ADR for the full
*why* and the alternatives that were rejected:

| Decision | Why (→ ADR) |
|----------|-------------|
| Dual-backend, two-mode workflow — planning on Claude, coding on DeepSeek, hook-enforced | [ADR-002](../adr/ADR-002-dual-backend-two-mode-workflow.md) |
| One home per fact; thin handoff drained to inbox-zero; spec = execution script | [ADR-003](../adr/ADR-003-pipeline-artifact-model.md) |
| Skill structure — single-file default, triple-write registry, author-to-capability-floor, Iron Law | [ADR-004](../adr/ADR-004-skill-system-structure.md) |
| Every APEX-built project maintains this Overview + an ADR log (enforced-capture) | [ADR-001](../adr/ADR-001-per-project-documentation-contract.md) |
| Stack skills — a global best-practices family per language/framework, picked by merit-based, buildability-weighted selection and bound per project *(in implementation)* | [ADR-005](../adr/ADR-005-stack-best-practice-skills.md) |
| Buildability layer — stack skills declare the Verification Recipe; coding runners go stack-agnostic *(in implementation)* | [ADR-006](../adr/ADR-006-buildability-layer-verification-inversion.md) |
| Codex is the primary coder (per-task `codex exec` subprocess), Opus the inline fallback; DeepSeek archived | [ADR-027](../adr/ADR-027-codex-primary-opus-fallback-deepseek-archived.md) |
| Codex context propagation — thin AGENTS.md + selective generated `.agents/skills/` cards + per-task dispatch pack with JSON completion contract | [ADR-031](../adr/ADR-031-codex-context-propagation.md) |
| GPT-5.6 role split — Sol plan-checks (+ offer-only deliberation), Sonnet 5 hosts builds, cross-family review routing, Sol escalation rung | [ADR-032](../adr/ADR-032-gpt56-role-split.md) |

## Where to look next

- **PROJECT.md** — vision and success criteria.
- **BACKEND-ROUTING.md** — the full backend → mode → skill routing table.
- **CLAUDE.md** — the operating instructions both modes follow each session.
- **SKILLS.md** — the index of every skill.
- **`docs/research/`** — the design notes the ADRs distil (pipeline artifact model, skill
  authoring, model-specific authoring).
