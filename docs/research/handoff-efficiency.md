# Design Note: Handoff Efficiency & Artifact Ownership

**Date:** 2026-05-29 (session 8)
**Status:** Design note — analysis only, no skill or CLAUDE.md changes made.
**Revisit:** when ready to implement (see *Implementation scope* below).

## Purpose

Capture the artifact-ownership model for the planning↔coding loop and the
redundancy findings behind the parked "handoff efficiency at project scale" item,
so a future session can implement without re-deriving the analysis.

## Core finding — the handoff doc has one reader, and ~half of it is redundant

Coding mode was already tightened (apex-code v1.2.0+) and **never reads handoffs**:
- `apex-code` session start runs `git log --oneline -10` instead of reading handoff
  prose (`apex-code/SKILL.md:19`).
- Reads `status.md` but stops at the CODING block (`:20`).
- Explicit rule: *"Never load docs/handoff/, other pending specs, or ambient project
  documentation"* (`:25`).

The **only consumer** of a handoff doc is planning-mode session start
(`apex-plan/SKILL.md:22`; reinforced by `apex-handoff/SKILL.md:42-49`).

What the handoff contains vs. where that information is already authoritative:

| Handoff section | Already authoritative elsewhere? |
|---|---|
| Files Changed table + SHAs | **Yes** — `git log` / `git diff --stat` |
| Current State (build/test) | **Yes** — belongs in `status.md` |
| Specs Completed | **Yes** — `status.md` + `docs/changes/done/` |
| Decisions Made (+ rationale) | **No** — unique |
| Specialist Flags | **No** — unique |
| Blocked Actions | **No** — unique |
| What's Next (reasoning) | **No** — unique |

Roughly half the handoff duplicates git and `status.md`, and planning re-ingests all
of it every session.

## The asymmetric-migration insight

The `git log` + status.md-only treatment was applied to **coding mode only**. Planning
mode still reads the full handoff. The parked "apex-plan session-start tightening" item
is really *one half of a migration that only got applied to one side*. The right framing
is not "planning should read less" but "what is each artifact for?"

## Proposed artifact-ownership model

| Artifact | Source of truth for | Read by | Written by |
|---|---|---|---|
| **git history** | what changed, SHAs, commits | both (`git log`) | git |
| **status.md** | durable state: in-flight, pending specs, open questions, build status | both, at session start | both |
| **handoff doc** | *narrative only* — decisions + rationale, specialist flags, blocked actions, next-step thinking; append-only per-session history | planning only | coding only |
| **memory** | cross-session user/project facts | both (auto) | both |

Rationale for keeping the handoff at all (vs. folding into status.md): `status.md` is the
*current* curated state and is rewritten each session; the handoff is the *append-only
record* of decisions/rationale you don't want to lose when status.md is overwritten. Keep
it — but slim it to the four unique sections.

## Proposed target state

**Slim handoff doc** — only the non-redundant narrative sections:
```
## Decisions Made      (with rationale; the "Yes ⚠️" ones planning must review)
## Specialist Flags
## Blocked Actions
## What's Next
```
Drop: Files Changed table (→ `git log`), Current State detail (→ `status.md`),
Specs Completed list (→ `status.md` + `done/`). The uncommitted-risk case the file
table covered is already handled by the In-Flight table + WIP commits
(`apex-handoff/SKILL.md:82-89`).

**Tighten apex-plan session start** to:
```
1. Read docs/status.md          (primary durable state)
2. git log --oneline -10        (what landed — authoritative, no prose)
3. Read latest slim handoff     (narrative: decisions/flags/blocks/next)
```

## Implementation scope (when revisited)

Files this would touch:
- `~/.claude/CLAUDE.md` — **root cause**: the coding-session handoff spec mandates the
  `| File | What changed | Status |` table. Slimming the handoff requires editing this
  first. It is the user's private global instruction file — a deliberate decision.
- `apex-handoff/SKILL.md` — redefine handoff sections + reader/writer ownership.
- `apex-plan/SKILL.md` — session-start read order (above).
- `apex-orchestrate/templates/handoff-from-coding.md` — slim the template.
- Possibly `apex-code/SKILL.md` — session-end (what it writes) if the write side changes.

Each skill edit goes through `apex-skill-author` + the Iron Law.

## Open decisions for the implementing session

1. **Edit global CLAUDE.md?** Required to slim the handoff format. Confirm the user wants
   their private global file changed (vs. keeping the heavy format and only tightening reads).
2. **Keep handoff as append-only history?** Recommended yes (decisions/rationale are
   history). Alternative: fold unique sections into a status.md "Decisions log" and drop
   handoff docs entirely — simpler, but loses per-session granularity.
3. **Planning→coding direction** (from the `parked-discussion-handover` memory) — spec
   token-efficiency, minimum-context-for-DeepSeek, large-spec chunking — was deferred out
   of this note's scope. apex-code is already disciplined (reads only the spec + listed
   files); the bigger win is the coding→planning side above. Decide whether to fold this
   direction in when implementing.

## Related
- Memory: `parked-discussion-handover` (planning→coding context minimisation)
- `apex-handoff/SKILL.md`, `apex-plan/SKILL.md`, `apex-code/SKILL.md`
- Global `~/.claude/CLAUDE.md` backend-gated workflow section
