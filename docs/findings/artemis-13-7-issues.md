# 13-7 issues — status.md: an unowned shared-write file (B1–B3) + a stale-record gap (B4)

_Source: Artemis's 2026-07-13 marathon planning + 19-stage AFK build run (`artemis/docs/handoff/2026-07-13-late.md`,
flags section). **Four** failures, all landing on the same file — `docs/status.md` — and all **APEX-cadence** gaps,
not Artemis product bugs. Backlog only; the owner will harden from here._

**Two unrelated mechanisms — do not conflate them when hardening.** B1–B3 are *concurrency*: status.md has
multiple writers and no declared owner. B4 is *staleness*: a fact changed in the world and nothing forced the
canonical record to catch up. They share a file, not a cause. A fix for either leaves the other fully live.

_Verified against APEX source 2026-07-13 (session 69). Two of the write-up's original proposals do not survive
that check — see the notes inline under B1._

## The core lesson

`docs/status.md` is the one file that **three writers touch concurrently** during an AFK run — the coding agent
(codex), the orchestrator, and the planning host — and **no APEX rule assigns it an owner**. Every other file in
a build has exactly one writer, enforced by the spec's `## Files to Change` scope-lock. status.md has none: it is
never listed in a spec (correctly — it isn't spec output), which is precisely why nothing guards it.

The result on this run was a three-way collision that cost real planning work and produced a false accusation
against the build.

## The three failures

### B1 — Codex writes `docs/status.md` outside its scope-lock (P1)
During the build, codex **repeatedly regenerated `status.md`** with a machine-synthesised planning narrative. No
spec listed the file; codex wrote it anyway. This is a genuine scope-lock violation, and the scope-lock did not
stop it — the lock is expressed as a list of files a spec *may* touch, with no mechanism that blocks a write to a
file outside it.

Two candidate hardenings were originally proposed. **Both were checked against APEX source and neither survives
as written** (session 69):

- ~~**Cheap:** every codex dispatch's brief carries an explicit *exclusion* — "never write `docs/status.md`".~~
  **This already exists and is what failed.** `apex-code/references/dispatch-pack.md:18` already gives codex
  *"Files for this task (authorized set — **touch nothing else**)"*, and line 23 already states *"Surgical scope:
  only the files listed above; `git diff --stat` must show only those."* Codex had an inclusion list, an explicit
  prohibition, and a stated diff check — and wrote status.md anyway. Naming one more forbidden file is a *second*
  prose rule for the model that ignored the first (cf. the standing `removal-over-prohibition` rule: prohibition
  rules decay fastest).
- ~~**Real:** a PreToolUse-style deny on writes outside the spec's file list.~~ **A hook cannot see these writes.**
  `apex-code/SKILL.md:174` is explicit: *"the Codex subprocess does **NOT** ride Claude Code's `permissions.deny`
  floor — `workspace-write` is its only guardrail."* Codex writes as an OS subprocess; PreToolUse fires only on
  Claude Code's own tool calls. `afk-gate.js` cannot gate this either.

**What actually works — the post-dispatch diff check, which is already half-built.** The dispatch pack *tells*
codex its `git diff --stat` must show only the authorized files; nothing ever verifies it. Have the host check
what the spec already promises: after each `▸codex` task, `git diff --name-only` against that task's authorized
set; any extra path is a scope violation. Deterministic, no model in the loop, one step in the verify loop — and
it generalises to *every* out-of-scope write, of which status.md is just the instance that happened to hurt.

**Constraint from B2 (below): the check must revert only the offending paths, never the file wholesale.**

### B2 — The orchestrator's blanket revert destroys concurrent host edits (P1)

> **Verified (session 69): this is not an APEX bug — but it constrains B1's fix.** APEX has no blanket-revert
> rule. Its only `git checkout -- <files>` is the ADR-028/029 *integration* mechanic, already scoped to the task's
> authorized files. The after-every-stage revert came from Artemis's own independently-evolved AFK pipeline (the
> one session 68's reconciliation found running in place of ADR-033's). It survives here as a **design constraint
> on B1**, because the obvious implementation of B1's scope check walks straight back into this trap.

Having noticed B1, the AFK orchestrator **reverted `status.md` after every stage**. But the planning host was
editing the same file *concurrently* — so each revert also wiped the host's legitimate planning edits. The
orchestrator then compared the reverted file against what it expected, found the host's newly-written ADR
references (056–065), and **reported them as codex "fabrications."** They were real; the ADRs were on disk and
correct the whole time.

So the mitigation for B1 was more damaging than B1: it destroyed real work *and* generated a false finding that a
less careful reviewer would have acted on.

The rule this needs: **an orchestrator must never blanket-revert a file — it may only revert the codex diff.**
`git checkout -- <file>` is the wrong instrument when a third party is writing the same file; scope the revert to
the hunks codex introduced, or (better) don't revert at all and let B1's enforcement prevent the write.

### B3 — status.md commits its own instructions into obsolescence (P2)

> **Verified (session 69) — and APEX's own status.md is the evidence.** `apex-handoff/SKILL.md:32-34` declares
> commit state is *not* APEX's fact to carry (*"What files changed, SHAs → `git log` / `git diff`"*), then line 124
> defines a `🟡 uncommitted` column in status.md that the global CLAUDE.md commit discipline **mandates** writing.
> APEX routes commit-state out of the handoff and re-imports it into status.md. The In-Flight table already carries
> **two hand-written workarounds** for this exact hazard — *"this row's ✅ rides the next commit"*, twice. Someone
> has been patching around B3 by hand rather than naming it.

The RESUME block ended the session saying *"the 9 ADRs + program docs are on disk — **all UNCOMMITTED**, commit
them."* True when written. Then the wrap-up commit swept up `status.md` **together with** the very ADRs it was
describing — so the file shipped an instruction that its own commit had already satisfied. The next session (this
one) read it, believed durable design work was at risk, and went to commit files that were already committed.

This is not codex's doing and not a revert artifact — it's a structural hazard of a status file that (a) describes
uncommitted state and (b) is itself committed alongside that state. Any "X is uncommitted" line in status.md is
**false the moment the commit that includes status.md lands**.

Candidate rule: status.md must not carry commit-state claims about files. Commit state is git's to answer
(`git status`), and the one-home-per-fact routing already says so — this is a leak of git's fact into the status
file. Either forbid the claim, or make the session-end sequence commit status.md *last, separately*, after the
content commit, so it can describe a settled world.

## B4 — canonical records froze at `gpt-5.5` while practice moved to GPT-5.6 (P2, filed not fixed)

**A different failure from B1–B3 — keep it distinct when hardening.** B1–B3 are all *concurrency*: status.md has
multiple writers and no owner. B4 is *staleness*: a fact changed in the world, the draft that would have recorded
it was blocked on access, and nothing forced the canonical docs to catch up once the block lifted. Same file
touched, unrelated mechanism.

**The rot is in the records, not the config.** The live surface is correct — `coder_models: [codex]` (menu
`{codex, opus}`), `backends: gpt-5.6-sol`. The stale `{flash,pro,codex}` menu survives only in
`docs/changes/done/codex-ceiling-coder.md`, an archived spec (correct to leave). What is actually stale:

| Site | Kind | Verdict |
|------|------|---------|
| `ADR-030:14,23` — "Keep `gpt-5.5` as the single build model" | decision record, past tense | **Correct as-is.** An ADR records what was decided *then*; editing it falsifies history. |
| `ADR-020:5` — "under ADR-027 the coder **is** Codex (`gpt-5.5`, native vision)" | present-tense claim about the live system | **Defect.** Wrong twice over (5.5 → terra → sol). |
| `ADR-026` header — `Status: **Accepted (design)**` | missing supersession pointer | **Defect.** ADR-027 says it "Promotes ADR-026", but ADR-026 still reads as live-accepted. |
| `docs/status.md` session-60 note — "one frontier model (`gpt-5.5`…)" | rolling session log aged into misinformation | **Defect — and already forbidden.** |

**Cause, precisely.** `docs/drafts/gpt-5.6-family-adoption.md` was never promoted because it was access-gated, so
the canonical docs froze at 5.5 while real builds moved to the 5.6 family. But the gate is not the whole story:
when the gate **did** lift (session 64, "access gate LIFTED"), the swap updated ~20 files of **live pins** and
touched **zero records**. The catch-up procedure did not miss because it was blocked — it missed because *it only
ever looks at config*. The same failure recurred on 2026-07-13's Terra→Sol swap: `overview.md` (a living doc
carrying a stale pin) was caught only because the operator happened to grep for it, not because any rule required
it.

**The missing mechanism** is a model-pin sweep that covers the *record* class, not just the config class —
distinguishing (a) decision records, which must never be edited, from (b) present-tense claims about the live
system and (c) living docs (`overview.md`, status.md frontmatter), which must be forced to catch up on any pin
change. Note this generalises past model pins to any fact that lives in both config and prose.

Artemis has already corrected its own copy. APEX handles its side. **Filed, not fixed.**

## Why B1–B3 belong together

They are the same root cause seen from three angles: **status.md is written by multiple agents with no ownership
model.** B1 is an unauthorised writer. B2 is a mitigation that assumed a single writer. B3 is the file making
claims about a world that changes underneath it in the same commit.

A fix that only addresses B1 (exclude status.md from the codex brief) leaves B2's revert pattern live for the next
file two agents share, and leaves B3 entirely. The durable framing is to give status.md a **single declared owner
per run** (the planning host), make every other writer's access explicitly denied, and forbid the file from making
claims git already owns.

**But the owner model alone enforces nothing** against a subprocess that ignores prose — that is exactly what B1
proved. Declaring an owner is necessary and insufficient. Landing shape (session 69):

1. **Host-side scope check after every `▸codex` task** — `git diff --name-only` vs the task's authorized set; any
   extra path is a violation. Reverts **only the offending paths** (B2's constraint). Fixes B1 for *all*
   out-of-scope writes, not just status.md. Deterministic, no model in the loop.
2. **Forbid commit-state claims in status.md** — delete the `🟡 uncommitted` column and the CLAUDE.md discipline
   step that writes it. `git status` is the answer, and one-home-per-fact already says so. Fixes B3 by *removing*
   the contradiction rather than documenting around it.

Two small, mostly-deleting changes. No new hook, no new enforcement layer. **B4 is untouched by both** — see above.
