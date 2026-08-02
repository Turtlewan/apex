---
spec: orchestrator-activation
status: draft
autonomy_level: L2
risk: high
coder_effort: high
max_parallel_codex: 1
---

# Spec: Activate the v1 build-orchestrator — route attended builds to the passed agent

**Identity:** Puts the already-passed `apex-build-orchestrator` agent onto new sessions: the build route dispatches it for ATTENDED builds, every consumer clause that names the host as build-time interim executor is NARROWED (not retired) to match v1 scope, and the two ADRs, the registry, and the `~/.claude` commit follow.
<!-- → why: see docs/technical/adr/ADR-046-doctrine-audit-resolutions.md (D1), docs/technical/adr/ADR-045-four-role-split.md. -->

## Intent
- **Intent:** the two passed artifacts stop being inert. A new session's build route dispatches the agent for an attended build, and every document in both trees states the v1 split accurately.
- **Invariants:**
  - **No artifact is re-authored here.** `agents/apex-build-orchestrator.md` and `apex-code/references/orchestrator-protocol-schema.json` exist, passed Sol CLEAN at r17, and are read-only inputs to this spec. No task creates, edits, or restates their content. They appear in § Files to Change under the operation **track + commit (content unchanged)** because Task 7 stages them — staging is not authoring, and the invariant is enforced mechanically by pinning their committed blob IDs (`0b4ea05647a1206e19db2f99245001fd3c11b3b8`, `d87a02803a20554d285535a5cda12fde8b62ffd3`), not by a line count or a diff eyeball.
  - The interim-executor clause **narrows, it does not retire**: the dispatched agent owns the ATTENDED build phase; the host remains executor for **close-out on every build** and for **unattended (AFK) builds**.
  - No document claims the agent owns close-out, the Sonnet fallback, or an unattended build.
  - The `hooks/` edit is a critical-path write and takes a live attended confirmation at build time.
- **Non-goals:** any wrapper, script, hook-script, or settings change · producer-side event emission itself (the wrapper writing the event files ships in the prerequisite `wrapper-follow-ups` spec; this spec only states that the host CONSUMES what that wrapper emits) · the `parallel-codex.md` dispatch-channel section and its probe-gated doctrine (channel probes are evidence for Task 4's conditional only) · ADR-041/ADR-044 adjudication-owner annotation banners (deferred: both describe critical-violation adjudication, whose v1 owner split is already recorded in the ADR-046 amendment this spec writes) · the D1-EXCEPTION **ledger row** producer and the technical docs agent's `build_exceptions` input (the passed agent records a takeover as a **handoff entry**, not a ledger row — a ledger-row producer would be inventing a mechanism v1 does not have).

## Assumptions
- Both passed artifacts are on disk and untracked in `~/.claude`: `agents/apex-build-orchestrator.md` (digest `0b4ea056`) and `skills/apex-code/references/orchestrator-protocol-schema.json` (digest `d87a0280`, **five** `$defs`: `dispatch_result`, `refusal`, `wave_plan`, `adjudication`, `build_state`). Re-verify both at pre-flight; a missing file or a changed digest invalidates every task → impact: Stop
- The superseded scaffold `docs/drafts/build-orchestrator-contract.md` is **planning evidence only** — mined for its verified find/replace anchors and never edited, promoted, or executed. Its ten-`$defs` / six-event-kind shape claims are **stale** and are not carried into this spec → impact: Stop
- Every FIND string below was re-greped live on 2026-08-01 (evidence block). Line numbers have MOVED since the scaffold was written (`dispatch-pack.md` 98→112, `apex-plan/SKILL.md` 156→164), so each pair is anchored on its **text**, never on its line number; the build re-greps each FIND before editing → impact: Stop
- `~/.claude/hooks/apex-session-context.md` is **plain-ASCII by convention** (it writes `--`, not an em dash). Edits preserve that; introducing non-ASCII there is a defect → impact: Caution
- The tracked fixture corpus under `skills/apex-code/scripts/fixtures/` is a historical record, excluded from every sweep via `--exclude-dir=fixtures` → impact: Stop
- Archived specs under `docs/changes/done/` and dated files under `docs/handoff/` are historical records and are never swept → impact: Stop
- `~/.claude`'s blanket `*` gitignore means every stage there is `git add -f` by name → impact: Caution
- Two live channel probes ran on the evening of 2026-08-01. **Probe A** — a detached-equivalent dispatch (the runner launched through a background task; 14.5 min wall, ledger row `done`, `.final` CLEAN 26/26) — **PASSED**. **Probe B** — a plain foreground dispatch — hit the 600s tool ceiling and was **MIGRATED to background by the harness** rather than killed; that migration is the behaviour observed live, and the probe was still completing at this spec's authoring. Neither verdict had been appended to issue-13 § Caveats as of authoring, so Task 4 reads the appended bullets at build time and assumes neither verdict → impact: Stop for Task 4's conditional clause, Low for the rest
- The prerequisite `wrapper-follow-ups` spec ships producer-side event emission: every BUILD-PHASE terminal of the wrapper writes one schema-valid event file and prints `[event] <path>`. Task 3's text describes the host as a READER of those files; if that spec has not integrated, Task 3's paragraph is wrong on arrival → impact: Stop for Task 3
- A concurrent session holds edits in this repo and in `~/.claude` (`docs/drafts/gpt-5.6-family-adoption.md`, `hooks/apex-ledger-append.ps1`). Task 7 checks for it before staging anything → impact: Stop for Task 7

Simplicity check: yes — considered a single sweep task over both trees. Rejected: the route row, the hook, and the `apex-code` ownership paragraph each carry a distinct v1 semantic and one of them sits on a critical path, so collapsing them would hide the attended-confirmation gate inside a bulk edit.

## Prerequisites
- **`wrapper-follow-ups` — ordering edge, binding (Task 3).** That spec (the wave-3 fold of the four owner adjudication items **plus producer-side event emission**) edits `~/.claude/skills/apex-code/SKILL.md`: the exit-79 row at `:169` and an `§ Events` pointer added to the same file. This spec's Task 3 rewrites the § Wave analysis ownership paragraph in that same file **and states the post-emission reality — the host READS the wrapper's event file rather than reconstructing it — so that spec's Task 7 must have integrated first or Task 3's text is false on arrival.** **Build strictly AFTER `wrapper-follow-ups` integrates, rebase Task 3's worktree onto its text before editing, and never share a wave with it.** If it has not been drafted at build time, this spec may proceed only once the host confirms no queued spec holds an edit to `apex-code/SKILL.md`.
- **Channel-probe bullets appended (Task 4) — a HOST action before this spec builds.** The host appends the 2026-08-01 probe A (detached-equivalent) and probe B (foreground-migration) bullets, each with its confirmed-or-re-opened verdict, to issue-13 § Caveats. Task 4 reads them at build time and branches on what is actually there; it never assumes a verdict.
- **A clean `~/.claude` moment (Task 7).** No concurrent session holding uncommitted `~/.claude` edits, no in-flight dispatch, no unresolved ledger rows on that worktree.
- Environment: attended session (`risk: high` → ADR-029 supervision gate, one task at a time under live host monitoring). Task 8 needs the `jsonschema` python module for its validation battery.

## Files to Change
| File | Operation | Notes |
|------|-----------|-------|
| C:\Users\User\.claude\skills\apex-orchestrate\SKILL.md | modify | Build route row → dispatch the agent for attended builds; `Transitional (2026-07-29)` paragraph deleted; `version` + `last_updated` (T1) |
| C:\Users\User\.claude\hooks\apex-session-context.md | modify | ADR-045 routing-table build-orchestrator row + the `Tightened 2026-07-29` paragraph's ownership sentence (T2) — **CRITICAL PATH** |
| C:\Users\User\.claude\skills\apex-code\SKILL.md | modify | § Wave analysis `Who does this (ADR-046 D1)` paragraph; `version` + `last_updated` (T3) |
| C:\Users\User\.claude\skills\apex-code\references\dispatch-pack.md | modify | Completion-routing interim clause (T4) |
| C:\Users\User\.claude\skills\apex-code\references\workflow-dispatch.md | modify | Fallback-trigger interim clause (T4) |
| C:\Users\User\.claude\skills\apex-plan\references\model-routing.md | modify | Fallback-trigger interim clause (T4) |
| C:\Users\User\.claude\skills\apex-plan\SKILL.md | modify | § Wave plan interim clause (WRAPS two lines) + one `version` patch bump and `last_updated`, covering this edit and the model-routing edit (T4) |
| C:\Users\User\.claude\skills\apex-governance\levels\L3.md | modify | AFK pipeline row: interim parenthetical → v1 statement that L3 (AFK) keeps the host path (T4) |
| C:\Users\User\.claude\skills\apex-governance\SKILL.md | modify | Frontmatter `version` patch bump + `last_updated` only — no body change (T4) |
| C:\Users\User\.claude\agents\apex-coder.md | modify | Two interim-executor clauses (T4) |
| C:\Users\User\.claude\agents\apex-docs-technical-agent.md | modify | `coder_summary` assembly clause only (T4) |
| C:\Users\User\.claude\skills\apex-orchestrate\templates\AGENTS-template.md | modify | **CONDITIONAL** — `:22` "foreground and sequential" high-risk rule; amendment shape decided by the probe bullets (T4) |
| C:\users\user\apex\docs\technical\architecture\overview.md | modify | Host-role bullet: interim clause narrowed (T4) |
| C:\users\user\apex\docs\technical\harness-known-limits.md | modify | Two Wave-B2 adjudication-owner cells (T4) |
| C:\users\user\apex\docs\technical\adr\ADR-046-doctrine-audit-resolutions.md | modify | § D1 V1-PARTIAL amendment + superseded marker on the original interim paragraph (T5) |
| C:\users\user\apex\docs\technical\adr\ADR-045-four-role-split.md | modify | Interim sentence rewritten in place with a supersession marker (T5) |
| C:\users\user\apex\SKILLS.md | modify | Agents heading count 5→6 + the new row (T6) |
| C:\users\user\apex\SKILL-HISTORY.md | modify | One row for this change set (T6) |
| C:\Users\User\.claude\agents\apex-build-orchestrator.md | track + commit (content unchanged) | Passed artifact — staged by name in T7. Its blob ID must stay `0b4ea05647a1206e19db2f99245001fd3c11b3b8` |
| C:\Users\User\.claude\skills\apex-code\references\orchestrator-protocol-schema.json | track + commit (content unchanged) | Passed artifact — staged by name in T7. Its blob ID must stay `d87a02803a20554d285535a5cda12fde8b62ffd3` |

Grep evidence — both trees, live, 2026-08-01 (re-run at pre-flight):

```
cd ~/.claude && grep -rn --include="*.md" --exclude-dir=fixtures -i "interim executor" skills agents hooks workflows   # 8 hits
cd ~/.claude && grep -rn --include="*.md" --exclude-dir=fixtures -i "interim" skills agents hooks workflows           # superset: the 8 plus the 2 in-scope alternates plus the 2 out-of-scope D6 hits
cd ~/apex    && grep -rn --include="*.md" -i "interim" docs/technical                                                 # live docs
cd ~/apex    && grep -rni "host adjudicat" docs/technical                                                             # ownership phrasings
cd ~/.claude && grep -rn "apex-build-orchestrator" skills agents hooks                                                # 0 — unclaimed
```

- `~/.claude`, `interim executor` ×8, **all edited here**: `skills/apex-code/SKILL.md:60` (T3) · `skills/apex-code/references/dispatch-pack.md:112` · `skills/apex-code/references/workflow-dispatch.md:24` · `skills/apex-plan/references/model-routing.md:63` · `skills/apex-orchestrate/SKILL.md:56` (T1) · `agents/apex-coder.md:8` · `agents/apex-coder.md:28` · `agents/apex-docs-technical-agent.md:16`.
- `~/.claude`, alternate phrasings ×2, both in scope: `skills/apex-governance/levels/L3.md:5` (`interim: the host executes the pipeline`) · `skills/apex-plan/SKILL.md:164-165` (`interim: the` / `host performs them as executor` — **the clause WRAPS**, so match it multi-line or by fragments; a single-line grep for the whole sentence returns 0 whether or not it is present).
- `~/.claude`, out of scope, D6/permissions not D1 — untouched: `skills/apex-code/SKILL.md:103` and `skills/apex-governance/SKILL.md:169` (both `Interim mechanics:` — the docs-agent write path).
- `~/.claude`, no interim clause, edited for a different reason: `hooks/apex-session-context.md:32` and `:41-44` (the routing-table row and the `Tightened 2026-07-29` paragraph, whose closing sentence assigns **close-out** to the orchestrator — wrong under v1) (T2).
- `~/apex`, live docs in scope: `docs/technical/architecture/overview.md:41-42` (`performed by` / `the host as **interim executor**` — **wrapped**, and the bold markers split the phrase) · `docs/technical/adr/ADR-045-four-role-split.md:74-75` (T5) · `docs/technical/adr/ADR-046-doctrine-audit-resolutions.md:61-67` (T5).
- `~/apex`, adjudication-owner cells in scope: `docs/technical/harness-known-limits.md:88` (`Host adjudication covers it.`) and `:89` (`or host adjudication`).
- `~/apex`, deliberately NOT edited: `ADR-046:253` and `:265` (the audit's own summary of what D1 decided — historical) · `ADR-041:77` and `ADR-044:187` (non-goal, see § Intent) · `ADR-012/016/027/044` unrelated `interim` uses · `docs/changes/done/**` and `docs/handoff/**`.

## Tasks

- [ ] **Task 1**: Switch the orchestrator skill's build route to dispatching the agent for attended builds. Replace the `| build · implement · execute · start build |` route-table row with the row below, **delete the `**Transitional (2026-07-29):**` paragraph entirely**, leave every other route row untouched, and bump the frontmatter `version` minor and set `last_updated` to the build date — files: C:\Users\User\.claude\skills\apex-orchestrate\SKILL.md — done when: the new row is present verbatim, the file contains neither `interim executor` nor `Transitional`, and both frontmatter lines changed.

```
| build · implement · execute · start build | **apex-code**. **ATTENDED builds:** dispatch the `model: opus` **`apex-build-orchestrator`** agent (`~/.claude/agents/apex-build-orchestrator.md`; Opus 5, ADR-045 as amended) with three inputs: (a) the spec's **absolute path** AND (b) its **full text** — path alone is not enough, the agent has no tool that guarantees it can open it; and (c) **one per-repo input block for EVERY repo the spec touches** — the repo root, the absolute path of that repo's `AGENTS.md` verify contract, that repo's HEAD sha, **and that `AGENTS.md`'s `## Verify commands` FENCED BLOCK, copied in VERBATIM**. The agent contract requires the verify commands themselves, not a pointer to them: it has no tool guaranteed to open the file, so a path alone leaves it adjudicating verify results against commands it cannot read. Copy the fence contents exactly — no summary, no reformatting, no command dropped. The per-repo blocks are what the schema's `repos` map is keyed on, so a single-repo build supplies exactly one and a multi-repo build supplies one per repo; a plan can only declare a repo that arrived this way. Add the live tree facts: `git status --porcelain`, existing worktrees and `codex/*` branches, `max_parallel_codex`, the `coder_effort` default, and the build date. It owns the **BUILD PHASE** — task selection, wave sequencing, dispatch parameters, exit-code routing, verify adjudication, retries/escalation/forks, integration order — and you execute its wave plan as mechanics and return bounded results. **Close-out is NOT its scope:** when it emits `complete`, you run the review → docs → family-gate → archival chain per `apex-code/SKILL.md` § Post-build. **UNATTENDED (AFK) builds keep the current host path** — the v1 agent is attended-only and is not dispatched for them. |
```

- [ ] **Task 2**: **CRITICAL PATH — `hooks/` write. This task requires a LIVE ATTENDED CONFIRMATION at build time and parks under an unattended run; it is never pre-authorised by § Permissions.** In the ADR-045 routing table, replace the `| Build orchestrator |` row with row (a) below; then in the `Tightened 2026-07-29 (ADR-046 D1):` paragraph replace its final sentence, `Task selection, sequencing, routing, verification adjudication, retries, and close-out are orchestrator-owned.`, with sentence (b) below. **Preserve the file's plain-ASCII convention** — write `--`, never an em dash, and no other non-ASCII character. **Both rows carry the ship date as the token `<build date>`; substitute the build date supplied in the dispatch pack, exactly as every other task in this spec does — never a date hard-coded at authoring time.** Change nothing else in the file — files: C:\Users\User\.claude\hooks\apex-session-context.md — done when: both replacements are present verbatim apart from `<build date>`, which reads as the dispatch pack's build date; the file no longer states that close-out is orchestrator-owned; no `<build date>` token survives in the file; and the file is still pure ASCII.

```
| Build orchestrator | Opus 5 -- the dispatched `apex-build-orchestrator` agent owns the BUILD PHASE of an ATTENDED build: task selection, wave sequencing, dispatch parameters, exit-code routing, verify adjudication, integration order (owner amendment 2026-07-29; v1 shipped <build date>). Close-out and unattended/AFK builds stay HOST-executed per `~/.claude/skills/apex-code/SKILL.md`. |
```

```
Task selection, sequencing, routing, verification adjudication, and retries are orchestrator-owned. V1 (shipped <build date>): on an ATTENDED build those duties run inside the dispatched `apex-build-orchestrator` agent, which emits one directive per turn and executes nothing; CLOSE-OUT -- the review chain, the docs agents, the family gate, spec archival -- is HOST-executed per `~/.claude/skills/apex-code/SKILL.md` and is not in that agent's protocol; and an UNATTENDED/AFK build keeps the current host path until v2.
```

- [ ] **Task 3**: **Rebase this task's worktree onto the post-`wrapper-follow-ups` tip of `apex-code/SKILL.md` before editing** (that spec edits the exit-79 row at `:169` and adds an `§ Events` pointer to the same file — see § Prerequisites; never co-schedule). Replace the § Wave analysis `**Who does this (ADR-046 D1).**` paragraph with the FOUR-paragraph block below, leave the parallel-eligibility rule and everything after it untouched, and bump the frontmatter `version` minor and set `last_updated` to the build date. **The block states the post-`wrapper-follow-ups` reality — the wrapper emits, the host reads — so if that spec has not integrated, STOP rather than writing a claim the wrapper does not yet satisfy.** Part (2) enumerates the host-only structural checks exactly as the passed agent contract fixes them (`~/.claude/agents/apex-build-orchestrator.md`, § Structural validation and § Structured-output validation); do not shorten the list — files: C:\Users\User\.claude\skills\apex-code\SKILL.md — done when: the four paragraphs read as below, the file no longer contains `interim executor`, the unrelated `Interim mechanics:` clause at `:103` is unchanged, and both frontmatter lines changed.

```
**Who does this (ADR-046 D1) — v1.** Wave grouping, dispatch sequencing, and completion routing are **orchestrator-owned**. On an **ATTENDED** build they are performed by the dispatched `apex-build-orchestrator` agent (`~/.claude/agents/apex-build-orchestrator.md`), whose protocol shapes are normative in `references/orchestrator-protocol-schema.json`; the analysis below is what that agent applies, and you execute its plan. On an **UNATTENDED (AFK)** build the agent is not dispatched and you perform this analysis yourself until v2. **CLOSE-OUT is host-executed on every build** — § Post-build below is canonical for it, and the agent's terminal `complete` directive is what hands it over. **"Raw results" throughout this skill means the bounded fixed result fields — exit code, `.final` fields, a bounded verify tail, porcelain output — unadjudicated; never a transcript or a whole log.** Getting them to the agent is host mechanics, in three parts.

**(1) Event pass-through, not reconstruction.** At a **BUILD-PHASE terminal the wrapper writes the event file itself** and prints one `[event] <path>` line (§ Events). You READ that file, validate it against the `$def` its `kind` names, and pass it through **unchanged**: no field is re-derived from stdout, from a log, or from a filename, and the `truncated` array the producer wrote is already the record of what it cut. A file that fails validation, or a terminal that printed no `[event]` line, is a wrapper defect — surface it; do not patch the event by hand. **Reconstruction from stdout, the ledger row and `.final` survives in exactly two places:** review-phase results, and any terminal named on the **emission exclusion list** — the kinds that have no producer yet (`reviewer_result`, `family_gate_result`, `agent_result`, `integration_verify`) — until v2 gives them one.

**(2) Deterministic structural validation** — host-only, because none of it is expressible in JSON Schema. Run it over the wave plan before any wave launches, and over every turn: **(a) cap arithmetic** — a wave's slot count, an `ultra` task counting double, must not exceed `max_parallel_codex`, **and the TOTAL task count summed across every wave must not exceed 64** (the schema caps `waves` at 64 and each wave's `tasks` at 16 *independently*, which alone would admit a 1024-task plan; JSON Schema cannot multiply, so this arithmetic is yours) — rule `structural-cap`. **(b) File-disjointness, per-repo** — within a wave, no task's `authorized` path may **EQUAL**, be an **ANCESTOR** of, or be a **DESCENDANT** of another task's, so a directory and a file inside it collide exactly as two identical paths do; the comparison is per-repo, so equal relative paths in two different repos do NOT collide — rule `structural-disjointness`. **(c) `authorized` ⊆ `## Files to Change`** — every task's authorized set is a subset of the spec's table, both reduced to the same repo-relative form first (`authorized` is worktree-relative, the spec's rows absolute) — rule `structural-authorized-outside-spec`. **(d) Executability minimums** — no empty `authorized` set (the schema's `minItems: 1` refuses it first, and the wrapper would refuse it downstream as **exit 74**), no empty `repos`, no empty `waves`, no empty wave. **(e) Repo referential integrity** — every task's `repo` EQUALS one of that same plan's `repos[].repo` values, and every `repos[].verify_contract` is an **absolute path that exists on disk**; JSON Schema can neither cross-reference one part of an instance from another nor touch the filesystem, so this check is the mechanism. **(f) Terminal arithmetic on an `adjudication`** — **at most ONE `complete` per turn**, and **no `complete` at all** while any task still lacks a terminal verdict, while ANY task is **PARKED**, while any task's `build_state.tasks[].integration.ok` is anything other than `true`, or while any task's `integration.tree_digest` is `null` or `"unverifiable"` rather than hex (an unpinned tree needs `request_verify` first, then `park` if it comes back unpinned again) — and no two items naming the same `task_id` in one turn. **(g) Schema validation of the turn itself** — **exactly one** fenced JSON block per turn, parsing as JSON, its `kind` one of the two declared output kinds, validating against that `$def` in `references/orchestrator-protocol-schema.json`; the schema file is the chokepoint and the fenced examples in the agent file are not. A malformed turn is refused with rule **`structural-malformed-output`** and re-asked once; a second failure escalates to the fresh-instance rung. Every violation returns a **null-`exit_code` refusal** naming its rule, so the only responses are re-plan or `park`; none of it re-routes a decision or reads the agent's reasoning.

**(3) Build-state persistence:** carry the `build_state` block across turns and resume the agent with it verbatim. None of the three is a judgement call.
```

- [ ] **Task 4**: Sweep the remaining interim-executor consumers in **both** trees. Each pair below is a literal find/replace on that file; change nothing else. In `apex-governance/SKILL.md` change only the frontmatter `version` (patch bump) and `last_updated`. In `apex-plan/SKILL.md` bump the frontmatter `version` PATCH exactly once and set `last_updated`, covering both its own § Wave plan edit and the `model-routing.md` edit. **CONDITIONAL sub-edit — `AGENTS-template.md:22`:** read `~/apex/docs/research/issue13-kill-ceiling-rootcause-2026-07-30.md` § Caveats first. Two probes ran on the evening of 2026-08-01 and the host appends both bullets to § Caveats before this spec builds (see § Prerequisites): **probe A**, the detached-equivalent runner launched through a background task — 14.5 min, ledger `done`, `.final` CLEAN 26/26, PASSED; and **probe B**, a plain foreground dispatch that hit the 600s tool ceiling and was MIGRATED to background by the harness, which is the migration behaviour observed live. **If § Caveats carries BOTH bullets and BOTH record `verdict: confirmed`**, apply pair (i) — the attendance-keyed doctrine covering both channels, version-pinned to this harness build. **If only the detached (probe A) bullet is present with a confirmed verdict — the probe B bullet absent, still open, or recording `verdict: re-opened`** — apply pair (ii) instead: the detached-only narrowing, which cites probe A alone and makes no foreground claim. **Never write the migration claim without probe B's bullet backing it** — files: C:\Users\User\.claude\skills\apex-code\references\dispatch-pack.md, C:\Users\User\.claude\skills\apex-code\references\workflow-dispatch.md, C:\Users\User\.claude\skills\apex-plan\references\model-routing.md, C:\Users\User\.claude\skills\apex-plan\SKILL.md, C:\Users\User\.claude\skills\apex-governance\levels\L3.md, C:\Users\User\.claude\skills\apex-governance\SKILL.md, C:\Users\User\.claude\agents\apex-coder.md, C:\Users\User\.claude\agents\apex-docs-technical-agent.md, C:\Users\User\.claude\skills\apex-orchestrate\templates\AGENTS-template.md, C:\users\user\apex\docs\technical\architecture\overview.md, C:\users\user\apex\docs\technical\harness-known-limits.md — done when: none of these files contains `interim executor`, `interim: the host`, or `host adjudication`; each unconditional replacement is present verbatim; exactly one of pair (i) or pair (ii) is present in `AGENTS-template.md`; no file names the agent as the Sonnet-fallback executor (the three fallback-trigger clauses route to `park` plus the attended operator); and the governance skill's diff shows exactly its two frontmatter lines.

````text
--- skills/apex-code/references/dispatch-pack.md
FIND:    **Interim:** until the build-orchestrator agent contract ships, the host performs that routing itself as **interim executor** — a recorded transition state, not doctrine.
REPLACE: **V1:** on an ATTENDED build the orchestrator is the dispatched `apex-build-orchestrator` agent and the host relays the signal and executes the rung it names; on an UNATTENDED build the host performs that routing itself until v2 (ADR-046 D1).

--- skills/apex-code/references/workflow-dispatch.md
FIND:    terminal verify-failure routing by the executor (the orchestrator, or the host as interim executor)
REPLACE: terminal verify-failure routing. **No orchestrator executes this path.** The v1 `apex-build-orchestrator` has no fallback action at all: on a quota-out or a terminal verify-failure it emits `park` with what it observed, and the ATTENDED OPERATOR then takes the in-session Sonnet path as a host/owner procedure; on an unattended build the host parks it the same way (ADR-046 D1)

--- skills/apex-plan/references/model-routing.md
FIND:    terminal verify-failure routing by the executor (the orchestrator, or the host as interim executor)
REPLACE: terminal verify-failure routing. **No orchestrator executes this path.** The v1 `apex-build-orchestrator` has no fallback action at all: on a quota-out or a terminal verify-failure it emits `park` with what it observed, and the ATTENDED OPERATOR then takes the in-session Sonnet path as a host/owner procedure; on an unattended build the host parks it the same way (ADR-046 D1)

--- agents/apex-coder.md (occurrence 1, the description paragraph)
FIND:    terminal verify-failure routing by the executor (the orchestrator, or the host as interim executor)
REPLACE: terminal verify-failure routing. **No orchestrator executes this path.** The v1 `apex-build-orchestrator` has no fallback action at all: on a quota-out or a terminal verify-failure it emits `park` with what it observed, and the ATTENDED OPERATOR then takes the in-session Sonnet path as a host/owner procedure; on an unattended build the host parks it the same way (ADR-046 D1)

--- agents/apex-coder.md (occurrence 2, § Step 2 ownership paragraph)
FIND:    Ownership of the scheduling doctrine is unchanged: orchestrator-owned is the target, with the host as interim executor until the build-orchestrator agent contract ships.
REPLACE: Ownership of the scheduling doctrine is unchanged: it is the dispatched `apex-build-orchestrator`'s on an attended build, and the host's as executor on an unattended one (v1, ADR-046 D1).

--- skills/apex-governance/levels/L3.md
FIND:    **(target state, ADR-045 as amended; interim: the host executes the pipeline from the orchestrator's wave plan until the agent contract ships — ADR-046 D1)**
REPLACE: **(ADR-045 as amended; ADR-046 D1. L3 is an AFK level, and the v1 `apex-build-orchestrator` agent is ATTENDED-ONLY — it is not dispatched here: the host executes this pipeline from its own wave plan until v2.)**

--- agents/apex-docs-technical-agent.md
FIND:    **the host, as interim executor (ADR-046 D1), assembles it from the wrapper's `.final` completion reports**
REPLACE: **the host assembles it from the wrapper's `.final` completion reports as build mechanics (ADR-046 D1)**

--- skills/apex-plan/SKILL.md (the clause WRAPS two source lines — match multi-line)
FIND:    Final task selection and sequencing are **orchestrator-owned** (ADR-046 D1; interim: the
         host performs them as executor until that agent contract ships).
REPLACE: Final task selection and sequencing are **orchestrator-owned** — the dispatched `apex-build-orchestrator` on an attended build, the host as executor on an unattended one (ADR-046 D1).

--- docs/technical/architecture/overview.md (the clause WRAPS two source lines — match multi-line)
FIND:    scheduling, routing, and verify adjudication are orchestrator-owned, performed by
         the host as **interim executor** until that agent contract ships (ADR-046 D1).
REPLACE: scheduling, routing, and verify adjudication are orchestrator-owned — on an ATTENDED
         build they are the dispatched `apex-build-orchestrator`'s (ADR-045 as amended;
         ADR-046 D1); on an unattended build, and for close-out on every build, the host
         executes them.

--- docs/technical/harness-known-limits.md (cell 1)
FIND:    `critical_violation` absent + loud WARN. Host adjudication covers it.
REPLACE: `critical_violation` absent + loud WARN. On an attended build the dispatched `apex-build-orchestrator` adjudicates it and parks (ADR-046 D1); unattended, the host does.

--- docs/technical/harness-known-limits.md (cell 2)
FIND:    recovery is attended `-CriticalFilesConfirmed` or host adjudication
REPLACE: recovery is attended `-CriticalFilesConfirmed`, adjudicated by the dispatched `apex-build-orchestrator` on an attended build and by the host on an unattended one (ADR-046 D1)

--- (i) CONDITIONAL: templates/AGENTS-template.md — BOTH probe bullets confirmed
FIND:    runs **foreground and sequential even when it is dependency-independent and file-disjoint**; it never joins the pool.
REPLACE: runs **supervised and sequential even when it is dependency-independent and file-disjoint**; it never joins the pool. **Channel is keyed on ATTENDANCE, not duration** (owner ruling, 2026-07-31): an attended long dispatch runs on the detached runner with the owner present, and an attended short one stays literal foreground — and a foreground call that outlives the harness tool ceiling is MIGRATED to background by the harness rather than killed (probe B). Both claims are observations **version-pinned to the harness build the 2026-08-01 probes ran on** (issue-13 § Caveats), never properties of the harness: re-probe before relying on either against a newer build.

--- (ii) CONDITIONAL: templates/AGENTS-template.md — probe B bullet absent, open, or re-opened
FIND:    runs **foreground and sequential even when it is dependency-independent and file-disjoint**; it never joins the pool.
REPLACE: runs **supervised and sequential even when it is dependency-independent and file-disjoint**; it never joins the pool. **Channel is keyed on ATTENDANCE, not duration** (owner ruling, 2026-07-31): an attended long dispatch runs on the detached runner with the owner present, and an attended short one stays literal foreground — an observation **version-pinned to the harness build the 2026-08-01 detached probe ran on** (issue-13 § Caveats), never a property of the harness. What a foreground call does at the harness tool ceiling is unconfirmed and this rule makes no claim about it.
````

- [ ] **Task 5**: Amend both ADRs to record the v1-partial activation. (a) In `ADR-046`, append to § D1, immediately before the `The build-orchestrator **agent contract**` paragraph, an `**Amendment — <build date>: D1 V1-PARTIAL — attended build phase shipped**` paragraph recording: that the agent contract shipped as `~/.claude/agents/apex-build-orchestrator.md` (digest `0b4ea056`) with its normative shape contract `~/.claude/skills/apex-code/references/orchestrator-protocol-schema.json` (digest `d87a0280`, five `$defs`); that the agent owns the **BUILD PHASE of ATTENDED builds only** — task selection, wave sequencing, dispatch parameters, exit-code routing, verify adjudication, retry/escalation/fork, integration order; that **CLOSE-OUT** (reviewer chain, docs agents, family gate, spec archival) and **UNATTENDED/AFK builds** remain **HOST-executed**, so D1's interim clause is **narrowed, not retired**; that **producer-side event emission is IN v1, not deferred** — the wrapper writes the event file at every BUILD-PHASE terminal and the host passes it through unchanged rather than reconstructing it (`apex-code/SKILL.md` § Wave analysis), and what remains for **v2 is the remaining event KINDS** — review-phase results, the endgate, `agent_result`, and `integration_verify` — which have no producer yet, not emission itself; that the host's build-time role stays mechanics only, adding event **pass-through** (read the emitted file, validate it against the `$def` its `kind` names, forward it unchanged), the deterministic pre-launch structural validation, and build-state persistence — none of which is adjudication; that the structural checks the HOST owns are the ones JSON Schema cannot express — cap arithmetic, per-repo wave file-disjointness, `authorized` ⊆ `Files to Change`, executability minimums, **task-repo membership in the plan's own `repos` map plus an absolute `verify_contract` path that exists on disk**, and the at-most-one-`complete` rule — while **branch SHAPE is schema-enforced and is therefore NOT a host check**; and that a host takeover of orchestrator duties exists only as an attended **D1-EXCEPTION recorded in the session handoff doc** (v1 has no ledger-row carrier for it). Then prefix the ORIGINAL interim paragraph (`Until the build-orchestrator agent contract ships…`) with `**Superseded in part — <build date>, see the amendment below:**`, leaving its wording otherwise intact. (b) In `ADR-045`, edit the sentence at `:74-75` beginning `Until the orchestrator's agent contract ships` **in place**, in the same annotation style, so it reads in the past tense, names the agent file, states the attended-build-phase / host-close-out-and-AFK split, and cites the ADR-046 amendment. Reword no other decision text. (c) **Annotate the three surviving close-out-ownership claims — retain every word of the original, append a marker after it.** Each marker is the literal sentence `**[CLOSE-OUT NARROWED (v1 activation), <build date>: in v1 CLOSE-OUT -- reviewer chain, docs agents, family gate, spec archival -- is HOST-executed per `~/.claude/skills/apex-code/SKILL.md` § Post-build and is not in the agent's protocol; the word "close-out" in this clause is superseded to that extent, and v2 may restore it. See ADR-046 § D1 V1-PARTIAL.]**`, appended in each ADR's own annotation style: in `ADR-045` after the `## Amendment — 2026-07-29: build-dispatch ownership (D1)` opening sentence (`The **Build orchestrator** row owns task selection, sequencing, routing, verification adjudication, retries, and close-out, exclusively.`), and additionally extend that file's header `**Amended:**` line with `; <build date> -- v1 activation, close-out narrowed (ADR-046 D1 V1-PARTIAL)`; in `ADR-046` after the § D1 **Decided** sentence ending `Amendment text lands in ADR-045.` and after the § D1 **Consequences** sentence ending `retries, and close-out decisions are the orchestrator's.` **Three markers total, all appended, none replacing text** — files: C:\users\user\apex\docs\technical\adr\ADR-046-doctrine-audit-resolutions.md, C:\users\user\apex\docs\technical\adr\ADR-045-four-role-split.md — done when: ADR-046 § D1 carries the V1-PARTIAL amendment and the superseded prefix on the original paragraph, ADR-045's sentence is rewritten in place with a supersession marker, the three `CLOSE-OUT NARROWED (v1 activation)` markers are present with their original clauses intact, and both files name the agent file.

- [ ] **Task 6**: Double-write the registry. In `SKILLS.md` change the `## Agents (5)` heading to `## Agents (6)` and add the row below as the first row of the agents table. In `SKILL-HISTORY.md` add one row at the top of the table, dated the build date, listing skills `apex-code, apex-orchestrate, apex-governance, apex-plan`, every `~/.claude` file this spec changed, event `updated`, a What-Changed summary naming the v1 activation (attended build phase to the dispatched agent; close-out and AFK host-executed), and sources `docs/technical/adr/ADR-045-four-role-split.md · docs/technical/adr/ADR-046-doctrine-audit-resolutions.md · docs/drafts/build-orchestrator-contract.review.log · docs/research/orchestrator-producer-surfaces-2026-08-01.md`. **RECORD the version numbers Tasks 1, 3, and 4 already wrote — read each SKILL.md frontmatter and copy the value. Bump nothing here.** The row's position in the table is not a requirement; what matters is that it is present **exactly once**, unique-matched by the string `apex-build-orchestrator` — files: C:\users\user\apex\SKILLS.md, C:\users\user\apex\SKILL-HISTORY.md — done when: the agents heading reads `(6)`, the row below is present, `SKILL-HISTORY.md` carries this spec's row exactly once, and each version in that row equals the live frontmatter of the named skill.

```
| **apex-build-orchestrator** | apex-code (host dispatch, attended builds) | Build-phase wave scheduling, dispatch parameters, exit-code routing, verify adjudication, integration order — reasoning only; close-out and AFK stay host-executed |
```

- [ ] **Task 7**: **HOST-EXECUTED, never dispatched to a coder.** At a clean `~/.claude` moment, commit the activation there. **First, the concurrent-session conflict check — this gates the whole task:** run `git -C ~/.claude status --porcelain` and confirm that no file outside this spec's authorized `~/.claude` set is modified; `docs/status.md` records another session holding `hooks/apex-ledger-append.ps1`, so **if that file or any other unowned file is dirty, STOP and surface it — do not stage, do not commit, do not stash**. Then `git add -f` **by name** (the tree's blanket `*` gitignore means nothing stages implicitly): the two passed artifacts, **tracked and committed with their content unchanged**, plus every `~/.claude` file Tasks 1–4 changed. **The artifacts are staged, never edited: pin them by blob ID.** After committing, `git -C ~/.claude ls-tree HEAD -- agents/apex-build-orchestrator.md skills/apex-code/references/orchestrator-protocol-schema.json` must report blob `0b4ea05647a1206e19db2f99245001fd3c11b3b8` and blob `d87a02803a20554d285535a5cda12fde8b62ffd3` respectively. **On a mismatch the build STOPS as FAILED and the tree is left exactly as it is for the owner — do NOT revert, reset, amend, or re-commit.** A revert is an unauthorised second write to history and contradicts this task's exactly-one-commit rule; the mismatch is evidence the owner needs to inspect in place, so record the observed blob IDs in § Progress, surface the failure, and stop. Draft the commit message, **show it to the owner, and commit only on approval**; record the short SHA — files: C:\Users\User\.claude\agents\apex-build-orchestrator.md, C:\Users\User\.claude\skills\apex-code\references\orchestrator-protocol-schema.json — done when: the conflict check passed and is recorded, `git -C ~/.claude status --porcelain` shows no unowned file staged, both artifacts are tracked at exactly the two blob IDs above, exactly one commit was made after owner approval, and its short SHA is recorded in § Progress.

- [ ] **Task 8**: **HOST-EXECUTED post-activation smoke — the reachability probe. Scratch artifacts only; nothing is committed and no repo file changes.** Write a synthetic two-task toy spec to the scratch root (one repo, two independent file-disjoint tasks, a `## Files to Change` table whose paths cover both tasks' authorized sets, `max_parallel_codex: 1`). Dispatch `apex-build-orchestrator` **once** with the same input set the Task 1 route row declares: the toy spec's **absolute path** AND its **full text**, AND **one per-repo input block per repo it names** — here exactly one: this repo's root, the absolute path of its `AGENTS.md` verify contract, its HEAD sha, and that `AGENTS.md`'s `## Verify commands` **fenced block copied in verbatim** — plus live tree facts. **A probe that supplies fewer inputs than the route row does not test the route**, and a probe that passes the verify-contract path without the block itself is exactly that shortfall. **Round 1:** it returns one fenced JSON block of `kind: "wave_plan"`, and that plan's `repos` map must name the repo that was supplied. **Round 2:** resume the same agent with a synthetic `dispatch_result` event carrying `exit_code: 65` for one of the two tasks, plus a `build_state` block; it returns one fenced JSON block of `kind: "adjudication"` whose single item for that task has `verdict: "out_of_scope"`. **Schema-validate the two synthetic INPUT events BEFORE sending them** — the `dispatch_result` against its `$def` and the `build_state` block against its `$def`, with the same battery, zero errors each; an input that is not itself schema-valid makes round 2's output meaningless, and a malformed input is a probe defect, not an agent finding. Then validate BOTH returned turns mechanically against the shipped schema with the python `jsonschema` battery pattern — turn 1 against the `wave_plan` `$def`, turn 2 against the `adjudication` `$def`, each resolved from the schema's own `$defs` — and both must report **zero** errors. **Fabricating, hand-editing, or "cleaning up" either returned block invalidates the probe**: validate exactly what the agent emitted. A schema-invalid turn, a turn with prose outside the block, or a round-2 verdict other than `out_of_scope` is a FAILED smoke — record it and surface it as a spec-level blocker rather than re-asking until it passes — files: (none — scratch only) — done when: the two synthetic input events validated clean against their `$defs` before being sent, both rounds returned exactly one fenced JSON block, the two returned blocks validate against their `$defs` with zero errors, round 1's `repos` map names the supplied repo, round 2's verdict is `out_of_scope`, and the toy spec plus the probe transcript are deleted at teardown.

## Wave plan
Wave 1: [Task 1] | Wave 2: [Task 3] | Wave 3: [Task 4] | Wave 4: [Task 2] | Wave 5: [Task 5] | Wave 6: [Task 6] | Wave 7: [Task 8] | Wave 8: [Task 7]

**Fully sequential — one task per wave.** `max_parallel_codex: 1` plus the ADR-029 supervision gate (`risk: high`) already forbids a parallel pool. Task 2 (the `hooks/` critical path) sits after the skill edits so its attended confirmation is one deliberate moment; Task 8 smokes the wired route before Task 7 commits it.

## Permissions

The following NON-CRITICAL actions will run autonomously during build. Approving this spec approves all of them.
Critical paths — environment files · migrations · auth/authz/crypto · CI config · dependency manifests and lockfiles · infra-as-code · secrets/keys/certs · host-state (the live status file, root AGENTS.md, root CLAUDE.md, the `docs/changes/` and `docs/handoff/` directories, the run ledger) · the permission settings and **the hooks** — are NEVER pre-authorised by this section. **Task 2 writes C:\Users\User\.claude\hooks\apex-session-context.md and therefore requires a live attended confirmation at build time; an AFK run parks it** (D3, ADR-046; apex-governance is canonical). (Sole exception: the docs agents' three host's-pen artifacts under D6.)
The `docs/audit/` directory is different and stricter: TIER-1, refused outright on a path match. No confirmation authorises a write there.

### File Operations
| Action | Paths |
|--------|-------|
| Create | (no tracked file) · transient artifacts under the out-of-repo scratch root, none committed: Task 8's synthetic toy spec, its synthetic resume event, and the probe transcript |
| Modify | C:\Users\User\.claude\skills\apex-orchestrate\SKILL.md, C:\Users\User\.claude\hooks\apex-session-context.md, C:\Users\User\.claude\skills\apex-code\SKILL.md, C:\Users\User\.claude\skills\apex-code\references\dispatch-pack.md, C:\Users\User\.claude\skills\apex-code\references\workflow-dispatch.md, C:\Users\User\.claude\skills\apex-plan\references\model-routing.md, C:\Users\User\.claude\skills\apex-plan\SKILL.md, C:\Users\User\.claude\skills\apex-governance\levels\L3.md, C:\Users\User\.claude\skills\apex-governance\SKILL.md, C:\Users\User\.claude\agents\apex-coder.md, C:\Users\User\.claude\agents\apex-docs-technical-agent.md, C:\Users\User\.claude\skills\apex-orchestrate\templates\AGENTS-template.md, C:\users\user\apex\docs\technical\architecture\overview.md, C:\users\user\apex\docs\technical\harness-known-limits.md, C:\users\user\apex\docs\technical\adr\ADR-046-doctrine-audit-resolutions.md, C:\users\user\apex\docs\technical\adr\ADR-045-four-role-split.md, C:\users\user\apex\SKILLS.md, C:\users\user\apex\SKILL-HISTORY.md |
| Track (stage + commit, content unchanged — Task 7) | C:\Users\User\.claude\agents\apex-build-orchestrator.md, C:\Users\User\.claude\skills\apex-code\references\orchestrator-protocol-schema.json — staged by name, blob IDs pinned; NO write to either is authorised by this spec |
| Delete | At teardown, only Task 8's scratch artifacts: the toy spec, the synthetic event, the probe transcript. No tracked file in either repo is deleted. |

### Commands
| Command | Purpose |
|---------|---------|
| the dispatch wrapper `codex-dispatch.ps1` | Per-task coder dispatch |
| the validator `apex-spec-validate.ps1` | Spec validation at pre-flight |
| `grep`, `wc`, both trees' AGENTS.md verify recipes | Acceptance-criteria checks and the authoritative verify pass |
| `python -c` with the `jsonschema` module | Task 8's two-turn schema validation battery |
| `git worktree add`, `git status --porcelain`, `git diff` | Isolation, the Task 7 conflict check, integration mechanics |

### Git Operations
| Operation | Scope |
|-----------|-------|
| `git add -f` | Only the name-listed authorized files of each task; in Task 7, the two passed artifacts plus the swept `~/.claude` files, by name |
| `git commit` | Per-task: `build(orchestrator-activation): task <n>` on the transient task branch; per-spec and the Task 7 `~/.claude` commit: drafted, shown, and approved before they execute |
| `git rebase` | Task 3 only: rebase onto the post-`wrapper-follow-ups` tip of `apex-code/SKILL.md` before editing |
| `git checkout <branch> -- <paths>` | Path-scoped integration of each task's authorized files. Never `git merge` |

### Environment Access
| Variable | Purpose |
|----------|---------|
| `USERPROFILE` | Resolves the `~/.claude` build tree and the agent/schema paths |
| `LOCALAPPDATA` / `APEX_STATE_DIR` | Ledger location for dispatch bookkeeping |

### Network
| Action | Purpose |
|--------|---------|
| (none) | No package installation, no fetches |

## Specialist Context
### Security
The activated agent holds `Read, Glob, Grep` only. **No task in this spec edits that tools line**, and any later widening — especially to `Bash`, `Edit`, `Write`, or `Agent` — converts a reasoning agent into an unsupervised executor and voids the host-refusal chokepoint that keeps the hard blocks enforceable. Task 2's `hooks/` write is the one critical-path edit here and is gated on a live attended confirmation.

### Performance
(none)

### Accessibility
(none)

## Documentation
| Doc type | File | Action |
|----------|------|--------|
| ADR | docs/technical/adr/ADR-046-doctrine-audit-resolutions.md | D1 V1-PARTIAL amendment + superseded prefix (Task 5) |
| ADR | docs/technical/adr/ADR-045-four-role-split.md | Interim sentence rewritten in place (Task 5) |
| Architecture | docs/technical/architecture/overview.md | Host-role bullet narrowed (Task 4) |
| Registry | SKILLS.md, SKILL-HISTORY.md | Double-write (Task 6) |
| Inline | (none) | No source files change |

## Acceptance Criteria

- [ ] **Task 1** — the build route dispatches the agent and the transitional paragraph is gone → verify:

```
cd ~/.claude && grep -c 'apex-build-orchestrator' skills/apex-orchestrate/SKILL.md          # >=1
cd ~/.claude && grep -c 'UNATTENDED (AFK) builds keep the current host path' skills/apex-orchestrate/SKILL.md   # 1
cd ~/.claude && grep -ci 'Transitional\|interim executor' skills/apex-orchestrate/SKILL.md  # 0
cd ~/.claude && git diff -- skills/apex-orchestrate/SKILL.md | grep -c '^+last_updated:'    # 1
```

- [ ] **Task 2** — the hook states the v1 split, close-out is no longer orchestrator-owned, and the file is still ASCII → verify:

```
cd ~/.claude && grep -c 'Close-out and unattended/AFK builds stay HOST-executed' hooks/apex-session-context.md   # 1
cd ~/.claude && grep -c 'retries, and close-out are orchestrator-owned' hooks/apex-session-context.md            # 0
cd ~/.claude && grep -cP '[^\x00-\x7F]' hooks/apex-session-context.md                                            # 0
```

- [ ] **Task 2** — the write was attended → verify: the build log records a live attended confirmation for the `hooks/` path before the edit. Absent that record, the task is not complete however the file reads.

- [ ] **Task 3** — the ownership block is v1-narrowed and carries all three host-mechanics parts → verify:

```
cd ~/.claude && grep -c 'Who does this (ADR-046 D1) — v1' skills/apex-code/SKILL.md    # 1
cd ~/.claude && grep -c 'CLOSE-OUT is host-executed on every build' skills/apex-code/SKILL.md   # 1
cd ~/.claude && grep -c 'Event pass-through, not reconstruction' skills/apex-code/SKILL.md      # 1
cd ~/.claude && grep -c 'Deterministic structural validation' skills/apex-code/SKILL.md # 1
cd ~/.claude && grep -c 'Build-state persistence' skills/apex-code/SKILL.md             # 1
cd ~/.claude && grep -c 'interim executor' skills/apex-code/SKILL.md                    # 0
cd ~/.claude && grep -c 'Interim mechanics:' skills/apex-code/SKILL.md                  # 1 (the D6 clause, untouched)
```

- [ ] **Task 3** — the emission text matches the post-`wrapper-follow-ups` reality: the host READS the wrapper's event file for build-phase terminals and reconstructs only for the excluded kinds → verify:

```
cd ~/.claude && grep -c 'the wrapper writes the event file itself' skills/apex-code/SKILL.md    # 1
cd ~/.claude && grep -c 'emission exclusion list' skills/apex-code/SKILL.md                     # 1
cd ~/.claude && grep -c 'reviewer_result' skills/apex-code/SKILL.md                             # >=1
cd ~/.claude && grep -ci 'deferred v2 feature\|until the wrapper emits\|scraped from stdout' skills/apex-code/SKILL.md   # 0
cd ~/.claude && grep -c '## Events' skills/apex-code/SKILL.md                                   # 1 (wrapper-follow-ups' section, present = that spec integrated)
```

- [ ] **Task 3** — the host-only structural check list is complete, exactly as the passed contract fixes it → verify each of the seven, all in `skills/apex-code/SKILL.md`:

```
cd ~/.claude && grep -c 'must not exceed 64' skills/apex-code/SKILL.md                  # 1 (total-task ceiling)
cd ~/.claude && grep -c 'structural-cap' skills/apex-code/SKILL.md                      # 1
cd ~/.claude && grep -c 'ANCESTOR' skills/apex-code/SKILL.md                            # 1 (disjointness, ancestor/descendant)
cd ~/.claude && grep -c 'structural-disjointness' skills/apex-code/SKILL.md             # 1 (and the per-repo qualifier on the same line)
cd ~/.claude && grep -c 'structural-authorized-outside-spec' skills/apex-code/SKILL.md  # 1
cd ~/.claude && grep -c 'Executability minimums' skills/apex-code/SKILL.md              # 1
cd ~/.claude && grep -c 'Repo referential integrity' skills/apex-code/SKILL.md          # 1
cd ~/.claude && grep -c 'at most ONE `complete` per turn' skills/apex-code/SKILL.md     # 1
cd ~/.claude && grep -c 'PARKED' skills/apex-code/SKILL.md                              # 1 (no complete while any task is parked)
cd ~/.claude && grep -c 'unverifiable' skills/apex-code/SKILL.md                        # 1 (unpinned tree_digest)
cd ~/.claude && grep -c 'structural-malformed-output' skills/apex-code/SKILL.md         # 1 (exactly-one-block schema validation)
```

- [ ] **Task 4** — the sweep is complete in both trees and no clause reads as a full retirement → verify:

```
cd ~/.claude && grep -rn --include="*.md" --exclude-dir=fixtures -ci 'interim executor' skills agents hooks | grep -v ':0'   # no output
cd ~/.claude && grep -c 'interim: the host' skills/apex-governance/levels/L3.md      # 0
cd ~/.claude && grep -c 'ATTENDED-ONLY' skills/apex-governance/levels/L3.md          # 1
cd ~/apex    && grep -ci 'interim' docs/technical/architecture/overview.md           # 0
cd ~/apex    && grep -c 'Build orchestrator (Opus 5)' docs/technical/architecture/overview.md   # 1 (bullet below untouched)
cd ~/apex    && grep -ci 'host adjudication' docs/technical/harness-known-limits.md  # 0
```

- [ ] **Task 4** — the § Wave plan clause, which WRAPS two source lines, is gone (a single-line grep for the whole sentence returns 0 either way and cannot be used) → verify, against C:\Users\User\.claude\skills\apex-plan\SKILL.md:

```
powershell -NoProfile -Command "(Get-Content -Raw $env:USERPROFILE\.claude\skills\apex-plan\SKILL.md) -match 'interim: the\s+host performs them as executor'"   # False
cd ~/.claude && grep -c 'the dispatched `apex-build-orchestrator` on an attended build' skills/apex-plan/SKILL.md   # 1
```


- [ ] **Task 4** — the governance body is untouched: `git diff -- skills/apex-governance/SKILL.md` shows exactly two changed lines, `version` and `last_updated`.

- [ ] **Task 4** — the conditional landed on the right branch → verify: exactly one of the two AGENTS-template replacements is present. If issue-13 § Caveats carries BOTH the probe-A and probe-B bullets at `verdict: confirmed`, `grep -c 'MIGRATED to background by the harness' skills/apex-orchestrate/templates/AGENTS-template.md` returns 1 and `grep -c 'What a foreground call does at the harness tool ceiling is unconfirmed' …` returns 0; if only the probe-A bullet is confirmed, those two counts are reversed. Either way `grep -c 'version-pinned to the harness build' …` returns 1 and the file no longer contains `foreground and sequential even when`.

- [ ] **Task 4** — the fallback is never attributed to the agent → verify: in all three of `skills/apex-code/references/workflow-dispatch.md`, `skills/apex-plan/references/model-routing.md`, `agents/apex-coder.md`, `grep -c 'No orchestrator executes this path'` returns 1 and `grep -c 'ATTENDED OPERATOR then takes the in-session Sonnet path'` returns 1; and a recursive search of `skills` and `agents` for the phrase "on an attended build; the host on an unattended one" returns zero hits — no file names the agent as the fallback executor.

- [ ] **Task 5** — both ADRs record the v1-partial activation, and the original interim text survives annotated rather than deleted → verify:

```
cd ~/apex && grep -c 'D1 V1-PARTIAL' docs/technical/adr/ADR-046-doctrine-audit-resolutions.md         # 1
cd ~/apex && grep -c 'Superseded in part' docs/technical/adr/ADR-046-doctrine-audit-resolutions.md    # 1
cd ~/apex && grep -c 'Until the build-orchestrator agent contract ships' docs/technical/adr/ADR-046-doctrine-audit-resolutions.md  # 1 (retained)
cd ~/apex && grep -c 'apex-build-orchestrator' docs/technical/adr/ADR-045-four-role-split.md          # >=1
cd ~/apex && grep -c 'Until the orchestrator.s agent contract ships' docs/technical/adr/ADR-045-four-role-split.md   # 0 (rewritten in place)
```

- [ ] **Task 5** — every surviving close-out-ownership claim is annotated, and none was deleted → verify:

```
cd ~/apex && grep -c 'CLOSE-OUT NARROWED (v1 activation)' docs/technical/adr/ADR-045-four-role-split.md            # 1
cd ~/apex && grep -c 'CLOSE-OUT NARROWED (v1 activation)' docs/technical/adr/ADR-046-doctrine-audit-resolutions.md # 2
cd ~/apex && grep -c 'retries, and close-out, exclusively' docs/technical/adr/ADR-045-four-role-split.md           # 1 (original retained)
cd ~/apex && grep -c 'Amendment text lands in ADR-045' docs/technical/adr/ADR-046-doctrine-audit-resolutions.md    # 1 (original retained)
cd ~/apex && grep -c 'close-out decisions are the orchestrator' docs/technical/adr/ADR-046-doctrine-audit-resolutions.md  # 1 (original retained)
cd ~/apex && grep -c 'v1 activation, close-out narrowed' docs/technical/adr/ADR-045-four-role-split.md             # 1 (header Amended: line extended)
```

- [ ] **Task 5** — the amendment states v1 reality: emission is IN, only the remaining event kinds are v2, and no host check claims branch referential integrity → verify:

```
cd ~/apex && grep -ci 'pending v2 producer-side event emission' docs/technical/adr/ADR-046-doctrine-audit-resolutions.md   # 0
cd ~/apex && grep -ci 'branch referential integrity' docs/technical/adr/ADR-046-doctrine-audit-resolutions.md              # 0
cd ~/apex && grep -ci 'pass-through' docs/technical/adr/ADR-046-doctrine-audit-resolutions.md                              # >=1
cd ~/apex && grep -c 'verify_contract' docs/technical/adr/ADR-046-doctrine-audit-resolutions.md                            # >=1
cd ~/apex && grep -ci 'branch SHAPE is schema-enforced' docs/technical/adr/ADR-046-doctrine-audit-resolutions.md           # 1
```

- [ ] **Task 6** — the double-write is consistent → verify: `grep -c '## Agents (6)' SKILLS.md` returns 1, the agents table has six data rows, `grep -c 'apex-build-orchestrator' SKILL-HISTORY.md` returns 1, and for each of `apex-code`, `apex-orchestrate`, `apex-governance`, `apex-plan` the version string in the row matched by `apex-build-orchestrator` equals that skill's live frontmatter `version`.

- [ ] **Task 7** — the commit is clean, owner-approved, and the two artifacts are tracked at their pinned blob IDs → verify: the recorded conflict-check output shows no unowned dirty file in the `~/.claude` tree; `git -C ~/.claude log -1 --format=%h` matches the SHA recorded in § Progress; the owner-approval exchange is in the session record; and both artifacts are tracked at exactly their pre-build blobs. **A blob mismatch is a FAILED task recorded in place, never repaired:** the tree is left as it stands for the owner, and a revert, reset, amend, or second commit appearing in `git -C ~/.claude log` is itself a criterion failure.

```
cd ~/.claude && git ls-files --error-unmatch agents/apex-build-orchestrator.md skills/apex-code/references/orchestrator-protocol-schema.json   # exits 0
cd ~/.claude && git ls-tree HEAD -- agents/apex-build-orchestrator.md | awk '{print $3}'    # 0b4ea05647a1206e19db2f99245001fd3c11b3b8
cd ~/.claude && git ls-tree HEAD -- skills/apex-code/references/orchestrator-protocol-schema.json | awk '{print $3}'   # d87a02803a20554d285535a5cda12fde8b62ffd3
```


- [ ] **Reachability (spec level) — the route reaches a live agent that answers in the declared schema (Tasks 1 and 8)** → verify, both halves:
  - **Parent wiring** — the route names a file that exists whose frontmatter name matches, and it declares the full input set:

```
cd ~/.claude && grep -n 'apex-build-orchestrator' skills/apex-orchestrate/SKILL.md | grep -c 'build · implement'   # >=1
cd ~/.claude && test -f agents/apex-build-orchestrator.md                                       # exits 0
cd ~/.claude && grep -c '^name: apex-build-orchestrator$' agents/apex-build-orchestrator.md     # 1
cd ~/.claude && grep -c 'one per-repo input block for EVERY repo' skills/apex-orchestrate/SKILL.md   # 1
cd ~/.claude && grep -c 'absolute path of that repo' skills/apex-orchestrate/SKILL.md                # 1
cd ~/.claude && grep -c 'FENCED BLOCK, copied in VERBATIM' skills/apex-orchestrate/SKILL.md          # 1
cd ~/.claude && grep -c 'requires the verify commands themselves, not a pointer' skills/apex-orchestrate/SKILL.md   # 1
```

  - **Live round trip (Task 8):** the probe's single per-repo input block carried the repo root, the absolute verify-contract path, the HEAD sha, AND that `AGENTS.md`'s `## Verify commands` fenced block verbatim (the probe transcript shows the block text, byte-identical to the file's fence, before any turn); the two synthetic INPUT events validated against their `$defs` with zero errors before being sent; turn 1 parses as JSON with `kind: "wave_plan"` and its `repos` map names the supplied repo; turn 2 parses as JSON with `kind: "adjudication"` and its item's `verdict` is `out_of_scope`; both returned blocks validate against their `$def` in the shipped schema file with zero errors; and each turn contained exactly one fenced JSON block with no prose outside it.

- [ ] **Whole spec** — both trees verify green and no changed skill file exceeds its cap → verify: run each tree's own `AGENTS.md` `## Verify commands` recipe in that tree; both exit 0, and every changed skill file is ≤500 lines:

```
cd ~/.claude && wc -l skills/apex-*/SKILL.md | sort -rn | head -3    # each <=500
```

- [ ] **Whole spec** — no artifact was re-authored → verify: post-Task-7, `git -C ~/.claude diff --stat` shows zero uncommitted content change to either artifact, and the two `git ls-tree` blob IDs in the Task 7 criterion above still match — the blob pin, not a line count, is what proves it.

- [ ] **Whole spec** — the spec itself validates → verify: `apex-spec-validate.ps1` exits 0 against this spec's promoted path.

## Progress
_(The build writes here — do not edit manually)_
