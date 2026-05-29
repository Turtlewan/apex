# Design Note: APEX Pipeline Artifact Model

**Date:** 2026-05-29 (session 8)
**Status:** Design note — analysis/decisions only, no skill or CLAUDE.md changes made yet.
**Supersedes:** `handoff-efficiency.md` (which only covered the return path).
**Revisit:** when ready to implement — see *Concrete capturable changes* at the end.

## Purpose

Capture the full planning↔coding pipeline artifact model worked out in session 8,
so a future session can implement without re-deriving it. Covers both directions
(coding→planning return path and planning→coding forward path), the amend model, and
the two autonomy/cost knobs.

---

## Load-bearing principles (everything else follows from these three)

1. **One home per fact.** Each fact lives in exactly one artifact, decided by *what
   kind* of fact it is. Duplication is the root cause of the bloat and drift we found.
2. **Author to the executor's capability floor.** Coding runs on **DeepSeek V4 Flash**,
   which executes literally and does not fill gaps with judgment. This is the *same rule*
   already codified in `apex-skill-author` for `impl.md` — here it generalizes to **specs**.
3. **git is the changelog.** What changed is reconstructable from `git log`/`git diff`
   (load-bearing dependency: good commit discipline — per-spec commits, conventional
   messages). No other artifact should duplicate the file-level record.

## Artifact ownership model

| Artifact | Source of truth for | Read by | Written by |
|---|---|---|---|
| **git history** | what changed, SHAs, commits | both (`git log`) | git |
| **status.md** | durable *live* state: In-Flight, Pending Specs, Open Questions, Parked | both, at session start | both |
| **handoff doc** | *narrative only* — what the build learned that git can't show; an **inbox**, read once | planning only | coding only |
| **spec** (`docs/changes/`) | the forward work definition (planning→coding) | coding (via orchestrator) | planning |
| **memory** | cross-session user/project facts | both (auto) | both |
| **ADR** (`docs/technical/adr/`) | *why* — durable architectural decisions | humans, on demand | planning |

Fact-home routing rule: behaviour-changing convention → CLAUDE.md; cross-session
context/preference → memory; live work state → status.md; historical event → git +
handoff; architectural *why* → ADR.

---

## 1. Return path (coding → planning)

**The handoff is thin: "what the build learned that git can't reconstruct."** Drop the
file-changed table (→ `git log`), current-state detail (→ status.md), specs-completed
list (→ status.md + `done/`). Keep only: Decisions + rationale, Specialist Flags,
Blocked Actions, and *discoveries* under What's Next.

**Triage is a drain, not a glance — the missing discipline.** Read-once is only safe if
reading = emptying. Today `apex-handoff` says planning *"parses and surfaces"* handoff
items — surfacing ≠ landing, so an item read-and-not-filed is **lost**. Required rule:
every handoff item terminates in exactly one of → Pending Spec / Open Question / folded
into existing / explicitly discarded. **Inbox-zero before closing the session.**

**Three layers, each with one job** (don't duplicate the reason across them):
- **`progress.md`** — live build log; *capture-at-halt* writes the block/park reason here
  *during* the build (existing "write every 2 tool calls" pattern), so a crash loses nothing.
- **handoff** — the session-end *distillation* of those, drained next session.
- **In-Flight (status.md)** — terse position pointer only: `spec · {state} · stopped-at task N`.
  State enum needs three values: `partial`, `blocked`, `parked`.

**In-Flight is the durable-live channel.** The happy path barely touches it (clear it);
every unhappy path *lives* in it. That is why the handoff can stay thin — it never carries
in-progress state.

**Handoff lifecycle:** drained → stays git-tracked in `docs/handoff/`, never auto-read
again (only the latest is read, only until drained) → accumulation is storage, not context.
No standing `decisions.md` log (it would re-create the bloat); architectural decisions →
ADR during triage.

---

## 2. Amend model

**Two amend types, split by intent (not by who-can-edit):**
- *Implementation amend* — make the spec's intent **work** (UI positions, fix a
  specced-but-broken function, fill in detail). → **coding**, in coding mode.
- *Spec amend* — change the spec's intent (wrong approach, scope, new decision).
  → **planning** (`drafts/` bounce + re-gate, or `apex-debug` for a genuine bug).

**Three-zone routing at a "not-optimum" fork** (autonomy_level governs the ask-line;
at **L2** = gray-zone asks):
- clearly small → coding fixes, logs deviation in handoff
- clearly big → coding halts → planning (`apex-debug` / re-spec)
- gray / ambiguous → **pause, ask the user to route**

**AFK behaviour at a gray fork:** **park-and-continue if the parked task is isolable**
(keep running independent tasks in the wave); **halt the wave only if everything downstream
depends on the decision.** Never "coding guesses."

**Lifecycle backward edges** (the pipeline gains two):
- substantive spec amend → back to `drafts/` → re-gate → `changes/`
- trivial correction → patch in place in `changes/`
- partial + amend → **don't reopen**; close the done scope (→ `done/`, it's in git), re-spec
  the remaining/changed scope as a **new** spec; In-Flight pointer moves to it.

**A blocked spec stays in `changes/` marked `blocked`** until planning picks it up —
relocation to `drafts/` is itself a planning judgment (patch vs full re-draft), so coding
must not do it.

**Capture-at-halt is a hard requirement.** Folder location is context-cost-neutral (same
spec body either way); cheap re-engagement depends entirely on coding writing a good
"blocked because X, needs decision Y" at the moment it stops. Without it, planning must
re-read the whole spec to reconstruct — the expensive path.

## 3. Happy / unhappy channel map

| Situation | git | spec location | In-Flight | handoff (thin) |
|---|---|---|---|---|
| Happy — complete | per-spec commit | → `done/` | cleared | decisions (if any) + what's-next |
| Partial — clean resume | `wip:` commit | stays `changes/` | `partial · stopped-at N` | none (coding resumes off In-Flight) |
| Small impl amend | commit | stays `changes/` → `done/` | — | deviation logged |
| Gray fork | parked task uncommitted | stays `changes/` | `parked · needs-routing` | the question (asked live / flagged) |
| Big / blocked | committed-so-far | `changes/` (`blocked`) | `blocked · reason→progress/handoff` | flag: needs planning |
| Partial + amend | done part committed | done → `done/`, new spec → `drafts/` | pointer → new spec | note the split |

---

## 4. Forward path (planning → coding)

**Goal = execution-signal density, NOT brevity.** "Minimum context" is the wrong frame:
a vague short spec is *worse* for Flash than a longer explicit one, because Flash can't
fill gaps. Lean means *strip what the executor doesn't use, maximize what it does.*

**A spec is an execution script, not a design document:** rich on the *what* (exact files,
copy-paste-ready code, per-task verify), stripped of the *why* (rationale, alternatives,
background). This is principle #2 pointed forward.

**The no-why line is hard. Why never belongs inline in a coding spec.** What survives is
**identity** ("Add the password-reset email flow to the auth module" — one line, for
routing/review/recall), which is *not* rationale. The litmus when tempted to add a why:

> Does it change what gets built?
> - **No** → pure motivation → cut it (home = ADR / planning discussion).
> - **Yes** → the *what* is underspecified → don't add the why, **make the *what* explicit.**

Either way the why never lands; it's either irrelevant or a crutch for a gap to close
directly. The spec carries at most a one-line identity **+ a single link** to where the why
lives — a pointer, never the content.

**Other forward-path levers:**
- **List-files-per-task** — every task names its exact files. A task that says "update the
  auth flow" forces the worker to *explore* = context cost + judgment, Flash's two weakest
  areas. Non-negotiable.
- **Cross-cutting conventions live in `impl.md`, never copied into specs.** The worker's
  context = its one task + its files + the relevant skill's `impl.md`. Spec = task-specific
  delta; skill = shared baseline.
- **Chunking is mostly solved at the agent layer** — `apex-coder` reads the spec and hands
  each `code-worker` *one isolated task* + its file list, so no worker carries the whole
  spec. The split rule (>3 files / >2 phases) keeps the spec digestible for the orchestrator.

## 5. The completeness burden + elicitation (key consequence)

A literal executor means **all judgment must be resolved before the spec freezes**, and the
only place that can happen is planning. Planning can no longer delegate ambiguity downstream.

- **Planning resolves without the user:** codebase facts (reads files), clear technical
  defaults (defaults-not-menus), anything derivable from patterns/research.
- **Planning needs the user for:** product intent, preferences among technically-valid
  options (taste/business), edge-case priorities, "what does good look like." Judgment, not facts.

**Reframe:** we are **front-loading the gray-zone decisions** from build-time to
planning-time. The "coding asks at a fork" rule is the *safety net*; collaborating with
planning is the *primary mechanism* — every decision resolved in planning is a mid-build
fork that never happens. Economics favour it: a planning-time question is cheap (you're
there, nothing mid-flight); a build-time fork is expensive (stalls an AFK build, context
switch, possible re-spec). Asymmetric cost → heavier planning is the cheaper path.

**Implication:** `apex-plan` likely wants a stronger **upfront elicitation/discovery
front-end** — adaptive questioning to pull user intent *before* drafting, rather than
draft-then-validate. Well-suited to Claude (ambiguity-handling is its strength). Bounded by:
surface only decisions planning can't resolve itself **and** that change the build —
targeted (AskUserQuestion-style), not a questionnaire.

**Named cost:** this makes planning sessions more demanding of the user's time/attention.
That is the real price of a literal executor + reliable AFK builds.

## 6. The knobs (keep orthogonal)

- **`token_profile`** = which **optional agent passes** run (reviewer, docs, specialists).
  A coverage/cost dial. It must touch **neither spec content nor wave width.** Skipping the
  reviewer is genuinely cheaper (that work isn't done — tokens leave the bill); reducing
  *parallelism* is **not** a cost lever (it buys wall-clock time, and fan-out can even cost
  *more* tokens via cold-start duplication). Today it is barely wired (only: lean → skip
  reviewer). Trap to write down: **never make execution-signal a function of `token_profile`.**
- **`autonomy_level`** = how much coding decides vs. asks (the gray-zone ask-line). At L2 the
  gray zone pauses for the user. Independent of `token_profile`.

---

## Concrete capturable changes (when implemented)

Each skill edit goes through `apex-skill-author` + the Iron Law. Root edits hit the user's
private global `~/.claude/CLAUDE.md` — a deliberate decision to confirm at implementation.

1. **CLAUDE.md — handoff format:** replace the `| File | What changed | Status |` table spec
   with the thin handoff (Decisions / Flags / Blocks / discoveries-as-what's-next).
2. **CLAUDE.md — spec template:** tighten *Scope* from "one-paragraph summary" → **one-line
   identity (+ optional ADR/discussion link)**; add "no *why* inline; rich *what*;
   list-files-per-task" as spec authoring rules.
3. **`apex-plan` session start:** read order → status.md + `git log` + latest slim handoff
   (drop unconditional full-handoff read); add the **triage-drain / inbox-zero** obligation;
   add the **upfront elicitation front-end** (question before drafting).
4. **`apex-handoff`:** redefine handoff sections (thin), reader/writer ownership, the
   triage-drain rule, and the In-Flight `State` enum (`partial`/`blocked`/`parked`).
5. **`apex-code`:** capture-at-halt → `progress.md`; park-and-continue-if-isolable;
   three-zone routing + gray-zone ask at L2; blocked spec stays in `changes/`.
6. **`apex-orchestrate` handoff template:** slim to match #1/#4.
7. **status.md hygiene:** define a rotation rule — status.md holds *current state only*;
   no rolling session-log Notes; relocate durable facts to their one home; merge duplicate
   parked items.

## Open / deferred

- **Documentation & bug→fix recording** — separate parked item (status.md Future Discussions);
  bug-fix docs are currently ephemeral → no durable root-cause trail. Extends this model.
- **status.md Notes bloat** — captured as change #7; the diagnosis (history leaking into a
  state file) is in this doc.
- Forward path was the higher tokens-per-build half; now covered alongside the return path.

## Related
- `apex-skill-author/SKILL.md` (the "author to the executor's floor" rule, generalized here)
- `docs/research/model-specific-skill-authoring.md` (Flash floor evidence)
- `apex-handoff` / `apex-plan` / `apex-code` SKILLs; global `~/.claude/CLAUDE.md`
- Memory: `parked-discussion-handover` (the original planning→coding concern, now addressed)
