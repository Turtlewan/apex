# ADR-037: Three context files — CLAUDE.md, AGENTS.md, status.md

**Date:** 2026-07-14
**Status:** Accepted
**Supersedes:** ADR-005 / ADR-006 (the `stack_skills` Verification Recipe binding) — completes what ADR-036 started
**Related:** ADR-031 (Codex context propagation), ADR-036 (knowledge layer removed), ADR-038 (single session)

## Context

`docs/status.md` reached **641 lines / 108 KB** — so large that reading it hit the tool's 25k-token
cap, meaning **the orchestrator could no longer read its own state file in one call.** Its template
is 25 lines. Artemis's status.md had independently rotted to **634 lines**. Identical failure in two
projects is a design flaw, not a discipline problem.

The rot decomposed cleanly:
- **Line 10 alone was 30,918 characters** — a single `_Last updated by planning mode:_ ` field
  holding fifteen session narratives. The template specifies that field as *a date*.
- The **In-Flight table** held 21 rows, most marked `✅ committed` and never deleted.
- **~600 lines below Pending Specs** were fourteen initiative write-ups, a "Notes" section, "Future
  Discussions (parked)", and three "Deferred to next session" blocks from June 5, 8, and 9 — **none
  of which exist in the template at all.**

Meanwhile the CLAUDE.md chain was 358 lines (269 global + 89 project) and **self-documented its own
redundancy**: four separate "Pipeline enforcement:" notes admitting each rule was *also* enforced in
apex-plan/apex-code. §5 alone was 108 lines duplicating apex-code, apex-plan, and apex-handoff —
which are the canonical homes and say so.

And APEX had **no AGENTS.md at all**, despite Codex being its primary coder.

Research (three parallel agents, vendor docs + community practice) established the constraints:

- **Anthropic:** *"Target under 200 lines per CLAUDE.md file. Longer files consume more context and
  reduce adherence."* Named anti-pattern: *"The over-specified CLAUDE.md — Claude ignores half of it
  because important rules get lost in the noise."* Their ❌-exclude list explicitly names *"self-evident
  practices"* — which is precisely what CLAUDE.md §1–4 were.
- **Anthropic:** `@import` is **eager**, not lazy — *"Splitting into imports does not reduce
  context."* So bloat cannot be solved by splitting into imports. A trap worth naming.
- **Anthropic:** rules that must hold with zero exceptions belong in **hooks**, because *"CLAUDE.md
  instructions are advisory; hooks are deterministic."*
- **OpenAI Codex:** `project_doc_max_bytes` defaults to **32 KiB**, and content past it is **silently
  truncated with no warning** (openai/codex#7138). A too-long AGENTS.md doesn't error — it just
  quietly stops being followed.
- **Empirical:** LLM-generated AGENTS.md files **reduced task success in 5 of 8 tested settings** and
  added 2.45–3.92 steps per task. Verbose, best-practice-restating instructions *actively hurt*.
  Thoughtworks Radar names the failure mode: **"agent instruction bloat."**
- **Universal:** state files rot for exactly one reason — **appending instead of rewriting.**

The decisive structural fact: **Codex never reads `status.md`.** The dispatch pack tells it *"Follow
AGENTS.md"* and nothing else. status.md is a Claude-only artifact, and our primary coder is blind
to it.

## Decision

**Three files, three jobs, three hard caps.**

| File | Read by | Holds | Cap |
|---|---|---|---|
| `~/.claude/CLAUDE.md` | Claude, always | Cross-project preferences only | **≤200 lines** |
| `<repo>/AGENTS.md` | **Codex** natively every `codex exec` · Cursor · `apex-code` on demand | The coder's contract: **the Verification Recipe**, conventions, layout, hard rules, sandbox quirks | **<32 KiB** |
| `<repo>/docs/status.md` | Both (provider-agnostic) | **Live state only** — in-flight, queued, undecided | **≤100 lines** |

History lives in `git log` (what changed), `docs/handoff/` (what the build learned),
`docs/technical/adr/` (why), and memory (durable facts). **Never in status.md.**

**Three rules make it hold:**

1. **status.md is rewritten, never appended.** A finished row is **deleted**, not marked done — git
   already has it. A resolved question is deleted, not annotated.
2. **The Verification Recipe's single home is AGENTS.md.** Not status.md, which Codex cannot see.
   This replaces the dead `stack_skills` binding from ADR-005/006.
3. **No `@AGENTS.md` import into CLAUDE.md.** The import is eager, so it would load the *coder's*
   contract ("never create `.venv` in the sandbox", "redirect `UV_CACHE_DIR`") into every planning
   conversation, where it is pure noise. `apex-code` **reads AGENTS.md as a file** when a build
   starts — lazy loading, for free.

**Enforcement is a hook, not prose.** `hooks/context-cap-guard.js` fires on every Write/Edit to one
of the three files and reports a cap breach with the reason it matters. The prose rule already
existed — status.md's own header said *"current state only, no rolling session-log Notes"* — and it
reached 641 lines anyway. Prose rules are advisory and they decayed. This one is deterministic.

## Consequences

**Good**
- status.md: **641 → 73 lines.** Global CLAUDE.md: **269 → ~95.** Project CLAUDE.md: **89 → 30.**
  Always-loaded context drops from ~5.3k tokens to roughly ~1.5k.
- The knowledge-layer cut (ADR-036) killed most of the Open Questions outright — the residual
  DeepSeek scrub across ~50 impl.md files, the apex-swift recipe, the Opus-4.8 sweep of ~36 skills,
  `apex-payments`/`apex-email`, the stack-binding manifest. Twenty questions became six.
- Codex finally gets a correct contract in this repo, where it previously had none.
- The two files no longer duplicate each other, so **there is nothing to drift.** Drift only happens
  when two files hold the *same* thing — which is what the old setup did.

**Bad / accepted**
- Two files to maintain per repo instead of one. Accepted: they hold genuinely different things for
  genuinely different readers, and the alternative (eager import) taxes every planning session with
  build-time contract it cannot use.
- The 100-line status.md cap will bite. That is the point — when it bites, the answer is to *move
  something to its proper home*, not to raise the cap.
- Deleting In-Flight rows on completion means status.md carries no record of what was done. Correct:
  that is `git log`'s job, and the duplication is what rotted the file.

**Neutral**
- Symlinking `CLAUDE.md → AGENTS.md` was rejected: on Windows it needs Administrator or Developer
  Mode and breaks on a plain `git clone`. Irrelevant here anyway, since we deliberately do not want
  one file.
- Artemis's AGENTS.md (92 lines, recipe inline, never used `stack_skills`) was already doing this
  correctly. Practice was ahead of the design; this ADR makes the design catch up.
