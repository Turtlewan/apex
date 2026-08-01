---
spec: build-orchestrator-contract
status: draft
autonomy_level: L2
risk: high
coder_effort: high
max_parallel_codex: 1
---

# Spec: Build-orchestrator agent contract — ship the agent, retire the interim executor, fix the dispatch channel

**Identity:** Creates the `apex-build-orchestrator` agent (reasoning-only, `model: opus`), switches every APEX document that names the host as build-time interim executor over to dispatching it, and fixes the detached-runner channel as the standard for long dispatches.
<!-- → why: see docs/technical/adr/ADR-046-doctrine-audit-resolutions.md (D1), docs/technical/adr/ADR-045-four-role-split.md, docs/research/issue13-kill-ceiling-rootcause-2026-07-30.md. -->

## Intent
- **Intent:** a build's scheduling, routing, and adjudication run inside a dispatched `model: opus` agent over a fixed structured protocol, and every document that still describes the host doing that job names the agent instead.
- **Invariants:**
  - The agent holds `tools: Read, Glob, Grep` and nothing else — it emits directives; it never edits a file, runs a command, or launches a process.
  - Every orchestrator turn ends with exactly ONE fenced JSON block of a declared `kind`; the host acts on nothing else.
  - The orchestrator receives only bounded results (exit codes, `.final` fields, a bounded verify tail, porcelain status) — never a raw transcript or a whole log (ADR-015).
  - The host refuses any directive that crosses a hard block (integration-branch commit without the draft→show→approve exchange, push to main, teardown outside ADR-046 D8, an unconfirmed critical-path dispatch, an audit-directory write) or that fails the deterministic pre-launch structural validation (cap arithmetic, file-disjointness), and returns a refusal event instead of executing it.
  - No document in either tree describes the host as the build's in-force interim executor; a host takeover exists only as an attended, recorded D1-EXCEPTION.
  - The ADR-029 high-risk carve-out keeps its parallel-pool exclusion untouched — high-risk work never enters an unattended pool; only the process channel it runs on is restated, keyed on attendance (owner ruling, 2026-07-31), and nothing here widens the carve-out.
- **Non-goals:** any wrapper, script, hook, or settings change · restating the ADR-046 D8 teardown algorithm anywhere (pointer only) · the retro P1(a) capacity lease and every other wrapper-side item (owned by `retro-wrapper-hygiene`) · the D6 docs-agent permissions follow-up · a Codex-dispatching `apex-build-wave` workflow variant · every `apex-plan/SKILL.md` section except § Wave plan and its frontmatter version.

## Assumptions
- `retro-wrapper-hygiene` **has built and integrated (2026-08-01)**, so `apex-code/SKILL.md`, `references/parallel-codex.md`, `ADR-046-doctrine-audit-resolutions.md`, `SKILLS.md`, and `SKILL-HISTORY.md` carry its edits; this spec's amendment pass was re-grounded against that post-integration wrapper — the lease-before-gates ordering in `codex-dispatch.ps1` and the live `codex-completion-schema.json` / `codex-review-schema.json` shapes — and every anchor quoted in the task bodies is re-greped against the post-integration text before editing → impact: Stop
- The tracked historical test corpus under `skills/apex-code/scripts/fixtures/` (notably `spec-corpus/`, which contains 16 `interim executor` lines) is a **historical record, never edited**, and is excluded from every sweep in this spec via `--exclude-dir=fixtures` → impact: Stop
- The **thirteen** live D1-interim clauses listed in the grep-evidence block below — **ten in `~/.claude`** (eight exact `interim executor` hits, plus `apex-governance/levels/L3.md` and `apex-plan/SKILL.md`) and **three in this repo** (the architecture overview and the two ADR homes) — are the complete set across BOTH trees; archived specs under `docs/changes/done/` and dated handoffs are historical records and are never edited → impact: Stop
- `retro-planning-gates` has already built and integrated, and none of its tasks touched `apex-plan/SKILL.md` § Wave plan (`:154-159`), so that clause is unowned and this spec takes it; its § Wave plan text and frontmatter `version` are re-read post-integration before Task 9 edits them → impact: Stop
- The § Wave plan interim clause WRAPS across two source lines (`:156-157`), so every check for its removal is multi-line-aware; a single-line grep for the full sentence returns zero even when the clause is present → impact: Stop
- `retro-validator-versioning` and `adr032-predraft-architecture-pass` also write `SKILLS.md` and `SKILL-HISTORY.md` (host's-pen registry writes), so the top rows of both files can move between this spec's dispatch and its integration; the host re-reads the top of both tables immediately before Task 7 integrates and re-anchors the new row if they have moved → impact: Caution
- The build target spans two trees (`C:\Users\User\.claude` and `C:\users\user\apex`), so each task is dispatched against exactly one of them with `-SpecSourcePath` pointing at this spec → impact: Stop
- `~/.claude`'s blanket `*` gitignore means integration stages the named authorized files with `git add -f` → impact: Caution
- Tasks 8 and 8b run attended with a working `codex` CLI and free capacity; the issue-13 results they confirm are harness-version-pinned and can change under a harness upgrade → impact: Stop for Tasks 8 and 8b, Caution for the rest
- `~/.claude/hooks/apex-session-context.md` already states the post-ship arrangement (host mechanics only) and carries no interim clause, so it needs no edit — and it sits on a critical `hooks/` path that would refuse an unattended dispatch → impact: Low

Simplicity check: yes — considered keeping scheduling with the host permanently and deleting D1's target state instead. Rejected: D1 is ratified and ADR-045's host role rule is owner-set, so the cheaper edit would require re-litigating two accepted ADRs rather than shipping the contract they both name.

## Prerequisites
- `retro-wrapper-hygiene` — **ordering edge, binding.** File overlap on `apex-code/SKILL.md`, `apex-code/references/parallel-codex.md`, `ADR-046-doctrine-audit-resolutions.md`, `SKILLS.md`, and `SKILL-HISTORY.md`. This spec builds strictly after it integrates; the two must never share a wave.
- `retro-planning-gates` — **ordering edge, binding** (upgraded from an ownership boundary). It owns `~/.claude/skills/apex-plan/SKILL.md`'s readiness-gate and dispatched-spec-review sections and the spec template; this spec edits the same file's § Wave plan clause, which that spec's tasks never touch. Build strictly after it and rebase Task 9 onto its text; never share a wave. The spec template stays untouched here.
- `retro-scope-check-narrowing` — **ordering edge, binding.** Shared file `~/.claude/skills/apex-code/references/dispatch-pack.md`, disjoint regions: that spec edits the Constraints slot at `:22-25` and inserts a section after `:43`; this spec edits only the completion-routing clause at `:98`. Build after it and rebase; not eligible for cross-spec parallel build with it. That spec already carries the mirror declaration in its own Files-to-Change evidence, so no edit to it is needed here.
- `retro-validator-versioning` and `adr032-predraft-architecture-pass` — **ordering NOTES, not dependency edges.** Neither blocks this spec, but both write `SKILLS.md` and `SKILL-HISTORY.md`, so Task 7's integration directive re-reads and re-anchors against whatever is at the tip. Do not co-schedule Task 7's integration with either spec's registry write.
- Environment: attended session (risk: high → ADR-029 supervision gate: one task at a time under live host monitoring) with a working `codex` CLI for Task 8.

## Files to Change
| File | Operation | Notes |
|------|-----------|-------|
| C:\Users\User\.claude\agents\apex-build-orchestrator.md | create | The agent contract: role, bounded inputs, the two JSON output shapes, the resume loop, refusal handling (T1) |
| C:\Users\User\.claude\skills\apex-orchestrate\SKILL.md | modify | Build route row switches to dispatching the agent; transitional paragraph deleted; frontmatter version (T2) |
| C:\Users\User\.claude\skills\apex-code\SKILL.md | modify | § Wave analysis ownership note; frontmatter version (T3) |
| C:\Users\User\.claude\skills\apex-code\references\parallel-codex.md | modify | Dispatched-orchestrator naming + the P1(b) dispatch-channel section (T4) |
| C:\Users\User\.claude\skills\apex-code\references\dispatch-pack.md | modify | Completion-routing interim clause (T5) |
| C:\Users\User\.claude\skills\apex-code\references\workflow-dispatch.md | modify | Fallback-trigger interim clause (T5) |
| C:\Users\User\.claude\skills\apex-plan\references\model-routing.md | modify | Fallback-trigger interim clause (T5) |
| C:\Users\User\.claude\skills\apex-plan\SKILL.md | modify | § Wave plan interim clause (wraps `:156-157`) + ONE frontmatter `version` patch bump covering this edit and the model-routing edit (T9) |
| C:\Users\User\.claude\skills\apex-governance\levels\L3.md | modify | AFK pipeline row: target-state parenthetical retired (T5) |
| C:\Users\User\.claude\skills\apex-governance\SKILL.md | modify | Frontmatter `version` patch bump only — no body change (T5) |
| C:\Users\User\.claude\agents\apex-coder.md | modify | Two interim-executor clauses (T5) |
| C:\Users\User\.claude\agents\apex-docs-technical-agent.md | modify | `coder_summary` assembly clause (T5) |
| C:\users\user\apex\docs\technical\adr\ADR-046-doctrine-audit-resolutions.md | modify | D1 amendment: interim clause fulfilled and retired (T6) |
| C:\users\user\apex\docs\technical\adr\ADR-045-four-role-split.md | modify | Activation note on the D1 amendment section (T6) |
| C:\users\user\apex\SKILLS.md | modify | Agents count and the new agent row (T7) |
| C:\users\user\apex\SKILL-HISTORY.md | modify | One row for this change set (T7) |
| C:\users\user\apex\docs\research\issue13-kill-ceiling-rootcause-2026-07-30.md | modify | Two confirmation-run records appended under § Caveats — detached channel (T8), foreground channel (T8b) |
| C:\users\user\apex\docs\technical\architecture\overview.md | modify | Host role bullet: interim-executor clause reworded (T10) |
| C:\users\user\apex\docs\technical\adr\ADR-041-wrapper-hardening-scope-cap-pin.md | modify | One annotation banner under the `**Deferred:**` bullet; historical text NOT rewritten (T6c) |
| C:\users\user\apex\docs\technical\adr\ADR-044-round8-deferred-designs.md | modify | One annotation banner under the § Decision Item 1 paragraph (`:187`); historical text NOT rewritten (T6d) |
| C:\users\user\apex\docs\technical\harness-known-limits.md | modify | Two Wave-B2 limit cells: adjudication owner corrected (T11) |

Grep evidence — BOTH trees, live, 2026-07-30, before the three prerequisite specs integrate (re-run at pre-flight):

```
cd ~/.claude && grep -rn --include="*.md" --exclude-dir=fixtures -io "interim executor" skills agents hooks workflows   # 8 hits
cd ~/.claude && grep -rn --include="*.md" --exclude-dir=fixtures -i  "interim" skills agents hooks workflows            # 12 hits
cd ~/.claude && grep -rn --include="*.md" "run_in_background" skills agents                      # 3 hits
cd ~/apex    && grep -rn --include="*.md" -i "interim executor" .                                # 3 live + archive hits
cd ~/apex    && grep -rn --include="*.md" -i "interim" docs/technical docs/product *.md          # live docs only
```

- `~/.claude`, `interim executor` ×8: `agents/apex-coder.md:8`, `agents/apex-coder.md:28`, `agents/apex-docs-technical-agent.md:16`, `skills/apex-code/SKILL.md:60`, `skills/apex-code/references/dispatch-pack.md:98`, `skills/apex-code/references/workflow-dispatch.md:24`, `skills/apex-orchestrate/SKILL.md:56`, `skills/apex-plan/references/model-routing.md:63`. All eight are edited here.
- `~/.claude`, alternate phrasings ×2, both in scope: `skills/apex-governance/levels/L3.md:5` (`interim: the host executes the pipeline`) and `skills/apex-plan/SKILL.md:156-157` (`interim: the\nhost performs them as executor` — the clause WRAPS, so match it multi-line or by its fragments).
- `~/apex`, live docs ×3, all in scope: `docs/technical/architecture/overview.md:41-42` (`performed by\n  the host as **interim executor**` — also wrapped, and the bold markers split the phrase, so a plain single-line `interim executor` grep misses it), `docs/technical/adr/ADR-045-four-role-split.md:74-75`, `docs/technical/adr/ADR-046-doctrine-audit-resolutions.md:61-62`.
- **Count: 13 live D1-interim clauses** — the eight above, plus `L3.md:5`, `apex-plan/SKILL.md:156-157`, `overview.md:41-42`, `ADR-045:74-77`, `ADR-046:61-62`. All thirteen are in scope.
- **Adjudication-ownership phrasings, swept separately** (`grep -rni "adjudicat" ~/.claude/skills ~/.claude/agents ~/apex/docs/technical`): **four** live consumers assign build adjudication to the host — `docs/technical/harness-known-limits.md:88` (`Host adjudication covers it`) and `:89` (`or host adjudication`), both corrected by T11; `docs/technical/adr/ADR-041-wrapper-hardening-scope-cap-pin.md:77` (`interim, the host adjudicates`), which gets T6c's banner rather than a rewrite because a decided ADR is a historical record; and `docs/technical/adr/ADR-044-round8-deferred-designs.md:187` (§ Decision Item 1, `the host must adjudicate before accepting the diff`), which gets T6d's banner for the same reason — **annotated, not rewritten**. All four are now swept; none is left bare.
- **Adjudication hits deliberately excluded, with the reason:** `apex-code/SKILL.md:321` and `apex-governance/SKILL.md:197` (`human adjudication` of split review findings — a review-consensus rule, not build ownership) · `codex-review.md:8` and `dispatch-pack.md:55` (already name the orchestrator) · `ADR-046:36` and `:45` (the ownership rule itself, correct as written) · `overview.md:76` (host reviews, not adjudicates) · `docs/changes/*.md` planning-time `host adjudication` of spec-shape decisions in `retro-scope-check-narrowing`, `retro-planning-gates`, and `adr032-predraft-architecture-pass` (planning ownership, untouched by D1) · `apex-code/REVIEW-ENSEMBLE-DESIGN.md` (a parked design) · `docs/research/*` (evidence documents).
- `~/apex`, deliberately NOT edited: `docs/changes/done/doctrine-sweep.md` (an archived, executed spec — a historical record), `docs/handoff/2026-07-30.md:148` (a dated handoff — likewise). Neither is live doctrine.
- Out-of-scope `interim` hits that are D6/permissions, not D1: `skills/apex-code/SKILL.md:103` (`Interim mechanics:` — docs-agent write path) and `skills/apex-governance/SKILL.md:169` (D6 host's pen). Both stay untouched; only the governance frontmatter version line changes in that file.
- `run_in_background` ×3: `references/parallel-codex.md:4` and `:32` (both rewritten by T4); `skills/apex-research/references/external-repo-study-template.md:54` is a research-agent fan-out checklist, unrelated to Codex dispatch — out of scope.
- Already target-state, no edit needed (verified by reading): `hooks/apex-session-context.md:40-44`, `skills/apex-code/references/codex-review.md:8`, `skills/apex-orchestrate/templates/AGENTS-template.md:22`, `skills/apex-orchestrate/templates/spec-template.md:86`, `skills/apex-governance/levels/L4.md`, `skills/apex-governance/levels/L5.md`.
- `grep -rn "apex-build-orchestrator" ~/.claude ~/apex` → 0 hits: the agent name is new and unclaimed.

## Tasks

- [ ] **Task 1**: Create the orchestrator agent contract, exactly as the block below — files: C:\Users\User\.claude\agents\apex-build-orchestrator.md — done when: the file exists with frontmatter `name`, `description`, `tools: Read, Glob, Grep`, `model: opus`, and a body carrying the two output shapes, the five input event shapes, the enumerated build-state block, the exit-code translation table, the resume loop with its attendance-split recovery, the refusal contract including the host's structural validation, and the channel rule.

````markdown
---
name: apex-build-orchestrator
description: "Owns a build's task selection, wave sequencing, dispatch parameters, exit-code routing, verify adjudication, retry/fallback/fork calls, and integration order. Reasoning only — the host executes every mechanic."
tools: Read, Glob, Grep
model: opus
---

You are the apex-build-orchestrator. You **decide**; the host **executes**. You have no Bash, no
Edit, no Write, and no Agent tool by design: you never launch a process, never touch a file, and
never run a git or verify command. A turn of yours that contains an instruction to yourself to "run"
something is a defect — emit the directive and stop.

## What you own (ADR-045 as amended; ADR-046 D1)

Task selection · wave sequencing · per-task dispatch parameters (worktree, branch, authorized paths,
effort, channel) · routing on every wrapper exit code · adjudication of every verify result ·
retry, effort-escalation, Sonnet-fallback and fork calls · integration order · close-out.

The host owns mechanics only: launching and monitoring subprocesses per your plan, executing the git
operations you direct, running the verify recipe, and returning raw results. It does not choose,
re-route, or adjudicate. The coder never adjudicates its own output.

## Inputs you are given (bounded — ADR-015)

1. `spec_path` and the spec's full text (Intent, Prerequisites, Files to Change, Tasks, Wave plan,
   Acceptance Criteria). The spec's wave plan is a **proposal**: its dependencies bind you, its
   grouping does not.
2. The target repo's `AGENTS.md` verify contract — the `## Verify commands` block, verbatim.
3. Live tree facts: HEAD sha, `git status --porcelain`, existing worktrees and `codex/*` branches,
   `max_parallel_codex`, `coder_effort` default, attended/AFK flag, and the build-state block from
   any earlier turn of this build.
4. Result events. These are a **tagged union on `kind`** — read `kind` first, and never assume a
   field the tag does not guarantee. There are **five** kinds, below. Two of them carry an
   `exit_code`, and the same number means different things on each: a BUILD-phase exit arrives as a
   `dispatch_result`, the identical number from a REVIEW-phase dispatch arrives as a
   `reviewer_result`. The tag, not the code, tells you what you are holding.

```json
{ "kind": "dispatch_result", "task_id": "3", "repo": "<repo root>", "exit_code": 0,
  "run_id": "<ledger run_id — REQUIRED>",
  "final": { "status": "done|done_with_concerns|blocked", "changed_files": ["..."],
             "commands_run": [ { "command": "<the command as run>",
                                 "result": "pass|fail|not_run",
                                 "detail": "<string, or null>" } ],
             "deviations": ["..."], "unresolved": ["..."],
             "blocker": "<string, or null>" },
  "concerns_md": "<verbatim <final>.concerns.md, <=10 KB, or null>",
  "scope_check": "<wrapper scope-check output, <=50 lines, or null>",
  "truncated": ["<field name>", "..."],
  "porcelain": "<git status --porcelain of that worktree, <=200 lines>" }
```

`final` mirrors the live completion schema (`codex-completion-schema.json`) exactly: every field is
required and `additionalProperties` is false, so read them all and invent none. Two shapes bite if
you assume otherwise — **`commands_run` is an array of OBJECTS**, not of command strings, so a
command that did not run is visible as `"result": "not_run"` rather than by absence; and **`blocker`
is not always null** — it is set on a `blocked` status, and also when the wrapper refutes a `done`
claim.

```json
{ "kind": "refusal", "task_id": "3|null", "repo": "<repo root>|null",
  "exit_code": "<wrapper exit code, or null for a host-generated refusal>",
  "rule": "<the rule or gate that fired>", "detail": "<=200 chars",
  "tail": "<stderr or dispatch-log tail, <=50 lines, or null>",
  "run_id": "<the id this refusal's output NAMES — referent varies by code; null where none>",
  "final": null }
```

```json
{ "kind": "integration_verify", "scope": "task|wave|spec", "repo": "<repo root>",
  "task_ids": ["3", "4"], "integration_branch": "<branch>", "head_sha": "<sha>",
  "recipe": ["<command>", "..."], "exit_codes": [0, 1],
  "tail": "<=50 lines of combined output",
  "porcelain": "<git status --porcelain, <=200 lines>" }
```

```json
{ "kind": "reviewer_result", "task_ids": ["3"],
  "reviewer": "apex-reviewer|codex-review|human|opus-endgate",
  "family": "anthropic|openai|human", "verdict": "BLOCK|FLAG|CLEAN",
  "exit_code": 0|67|68|69, "tree_moved": true|false,
  "findings": [ { "severity": "BLOCK|FLAG|CLEAN", "file": "<path>", "line": "<integer, or null>",
                  "criterion": "<criterion this finding is cited to, or null>",
                  "rationale": "<=200 chars" } ],
  "endgate": { "findings": [ { "severity": "P1|P2|note", "issue": "<string>", "file": "<path>",
                               "why": "<string>" } ],
               "verdict": "<string>" },
  "truncated": ["<field name>", "..."],
  "reviewed_run_id": "<run_id the review covers>" }
```

This mirrors the live review schema (`codex-review-schema.json`). `apex-reviewer` on the Claude side
returns the same `BLOCK|FLAG|CLEAN` vocabulary, so **one shape serves both families** — never branch
your reading of a `reviewer_result` on `family`. At most **<=30 findings** reach you per event; the
host truncates beyond that and flags the truncation when it resumes you.

**A review dispatch exits through the wrapper too.** A read-only review pass (`-Phase review`) runs
under the same wrapper as a build and returns its own exit code: **67** BLOCK · **68** FLAG-only ·
**0** CLEAN · **69** the tree moved — and its `.final` uses the **REVIEW** schema, not the completion
schema. Those codes therefore arrive on `reviewer_result`, carried in its `exit_code`, and never as a
`dispatch_result`. `tree_moved` restates exit 69 as a boolean; a `reviewer_result` with
`tree_moved: true` adjudicates as **`void` → `request_verify`** (re-pin, re-run the review), exactly
as a build-phase 69 does.

**The AFK end-gate arrives on this tag.** `reviewer: opus-endgate` is the standing mandatory
end-of-run adversarial pass for unattended multi-task builds;
`~/.claude/skills/apex-code/references/afk-endgate.md` is canonical for it and this file does not
restate it. Its own § Output contract uses different field names (`issue`, `why`) and its own
severity vocabulary, so the host carries that result **verbatim** in the `endgate` sub-object
(`null` for every other reviewer) and fills the standard fields by this fixed mapping:
**P1 → BLOCK** · **P2 → FLAG** · **`note` → CLEAN, informational only**.
The event `verdict` is the highest severity so mapped. (The end-gate's third finding class is
literally `note`, not `P3` — carry its own field names, `issue` and `why`, verbatim in `endgate`.)

```json
{ "kind": "family_gate_result", "spec": "<spec-name>", "task_id": "3|null",
  "exit_code": 0, "detail": "0 pass | 12 same-family refusal | 13 unverifiable" }
```

`refusal` is how every gate that produced no completion report reaches you — pre-dispatch refusals,
live workers, and the watchdog alike. Two fields, one rule each:

- **`final` is ALWAYS null on this tag.** There is no completion report to read, ever. Do not look
  for `status`, `changed_files`, or `blocker` on a refusal.
- **`run_id` carries the id the wrapper's refusal output NAMES**, and its referent varies by code —
  it is NOT this attempt's own run identity. The wrapper never prints the refused attempt's own id,
  and the host never scrapes the ledger to reconstruct one, so where the table below says `null`
  there is simply no id to give you. Read the exit code, then the table; never assume from the tag.

| Exit | What `run_id` names |
|------|---------------------|
| **80** | the BLOCKING unresolved row — the row `request_abandon` (or `adopt`) must act on |
| **75** | the adopt-target row |
| **82** | the abandon-target row |
| **78** | the REVIEWED build's run |
| **124** | this run's own id — the run was already launched, so it is known from launch context |
| **71, 72, 74, 76, 79, 81, 83** | `null` — the wrapper surfaces no id on these paths |

A `dispatch_result` always carries both `run_id` and `final`.

**`exit_code` is null on a host-generated refusal.** Not every refusal comes from the wrapper. Two
classes are produced by the host itself and never ran a wrapper, so there is no code to report and
`exit_code` is `null`: **host-policy refusals** (the hard-block directives in § Directives the host
will refuse) and **structural-validation refusals** (cap arithmetic, wave file-disjointness, and the
authorized-outside-spec subset check). On those the `rule` field carries a value from this small
named set, and nothing else: `hard-block-commit-unapproved` · `hard-block-push-main` ·
`hard-block-merge` · `hard-block-teardown-outside-d8` · `hard-block-critical-unconfirmed` ·
`hard-block-audit-write` · `structural-cap` · `structural-disjointness` ·
`structural-authorized-outside-spec`. **Null-exit_code refusals never map through the exit table** —
there is no code to translate and no verdict row to read — and the only legal responses to one are to
**re-plan** within the rules or to **park**. Read `rule`, not a code, on these.

`integration_verify` is the carrier for the authoritative post-integration pass — the second of the
two verify cadences. Adjudicate it as its own event; a green per-task pass inside a worktree never
stands in for it.

**"Raw" means the bounded fixed result fields above, unadjudicated** — an exit code, the `.final`
fields, `concerns_md`, `scope_check`, a bounded tail, porcelain output. Every one of them is capped:
a tail or `scope_check` at <=50 lines, porcelain at <=200 lines, `concerns_md` verbatim but at
<=10 KB (a truncation is flagged in the resume `notes`), findings at <=30 per event. If a cap bit,
you decide on what arrived — you never get the untruncated original. **Which fields were cut is a
field, not a promise:** `dispatch_result` and `reviewer_result` each carry `truncated`, an array
naming exactly the fields the host cut to fit these caps, empty when nothing was cut. Read it before
you conclude that something is absent — an empty `concerns_md` and a truncated one are different
facts. `pending_events[]` in the build-state block carries every event verbatim, so a resume adds no
further truncation of its own.

It never means a transcript. Where `apex-code/SKILL.md`
says the host "returns the raw results", it means exactly this set and nothing wider. You are
**never** given a transcript, a whole `--json` log, or a reviewer's working notes. If you believe you
need one, say so in `notes` and decide on what you have; do not ask for it.

Read before your first plan: `~/.claude/skills/apex-code/SKILL.md` (the wrapper exit-code table and
the verify contract) and `~/.claude/skills/apex-code/references/parallel-codex.md` (isolation,
integration, channel). Those documents are canonical; this file does not restate them.

## What you return — exactly one fenced JSON block per turn

Nothing else is read. Prose outside the block is discarded.

```json
{
  "kind": "wave_plan",
  "spec": "<spec-name>",
  "repos": {
    "<repo root>": { "head": "<sha>", "verify_contract": "<path to that repo's AGENTS.md>" }
  },
  "waves": [
    {
      "wave": 1,
      "tasks": [
        {
          "task_id": "3",
          "repo": "<repo root — which tree this task builds in>",
          "base_sha": "<sha this task's worktree is cut from>",
          "worktree": "<absolute worktree path>",
          "branch": "codex/<spec>-<task_id>",
          "authorized": ["<worktree-relative path>", "..."],
          "effort": "low|medium|high|xhigh|max|ultra",
          "channel": "detached|background|foreground"
        }
      ]
    }
  ],
  "notes": "<=200 chars, optional"
}
```

**Two-tree specs.** A spec whose Files to Change span two repositories produces tasks that are
**tree-homogeneous** — one `repo` each — and **per-repo integration steps**: each repo integrates,
runs its own `## Verify commands` recipe from its own `repos[].verify_contract`, and yields its own
`integration_verify` event. Never plan one integration across both trees, and never assume a `head`
from one repo applies to the other.

```json
{
  "kind": "adjudication",
  "spec": "<spec-name>",
  "adjudications": [
    {
      "task_id": "<spec task number, or null for a spec-scoped directive>",
      "verdict": "pass|fail|blocked|void|out_of_scope",
      "next_action": "integrate|redispatch|escalate_effort|fallback_sonnet|fork|park|request_verify|request_review|run_docs_agents|run_family_gate|queue|adopt|request_abandon|request_confirmation|teardown|complete",
      "params": {
        "repo": "<repo root>",
        "worktree": "<absolute path for a redispatch, else null>",
        "branch": "codex/<spec>-<task_id>",
        "authorized": ["<worktree-relative path>", "..."],
        "effort": "low|medium|high|xhigh|max|ultra",
        "channel": "detached|background|foreground",
        "run_id": "<required for adopt and request_abandon — copied from the triggering event's run_id; else null>",
        "reason": "<=200 chars>"
      }
    }
  ],
  "notes": "<=200 chars, optional"
}
```

Rules for both shapes: `task_id` matches the spec's task numbering, or is `null` for a
spec-scoped directive (`request_review` over the whole spec, `run_docs_agents`, `run_family_gate`,
`teardown`, `complete`) · `authorized` is
worktree-relative, never absolute · one wave's tasks must be file-disjoint · a wave never exceeds
`max_parallel_codex` (an `ultra` task counts double) · a `redispatch` carries `repo`, `worktree` and
`channel` in `params`, because choosing where and how a retry runs is your decision, not the host's.

**`verdict: void` means the verdict describes a tree that no longer exists** — a `tree-moved` case,
and the only action for it is `request_verify` (re-pin, re-run the gate). **A live worker is not a
void verdict:** exit 75 means your call died and the coder did not, so the action is `queue` — wait
for `.final` — never `request_verify`, which would open a gate against a tree still being written.

Actions that hand work back to the host with a precondition:

- `queue` — capacity or an in-flight worker; the host holds the task and re-reports. Use it for
  `at-capacity-no-lease` and `call-died-coder-alive`.
- `adopt` — recover an orphaned run's work through the wrapper's adoption path. `params.run_id`
  required.
- `request_abandon` — release a stuck ledger row. `params.reason` required, and **`params.run_id` is
  taken verbatim from the `run_id` of the triggering `refusal` event** — on exit 80 the wrapper
  prints the BLOCKING unresolved row's id and the event carries it verbatim, so that id names the row
  to abandon and never this attempt's own run. Never reconstruct the id from a log, a path, or
  memory. The wrapper gates abandonment behind its `-Attended` switch, so the host executes it **only when
  attended**; AFK, the host returns a `refusal` and you `park`.
- `request_confirmation` — a critical-file, host-state, or owner gate needs a live human "yes"
  before the dispatch can proceed. Attended, the host asks; AFK, the host parks the task.
- `request_review` — open the post-build review chain for a task or the spec.
- `run_docs_agents` — dispatch the **product** docs agent (`apex-docs-product-agent`) and only it.
  Legal only once a `reviewer_result` for that scope has come back.
- `run_family_gate` — run the completion gate for a task or spec. Legal only after the reviews it
  certifies exist.
- `complete` — the terminal directive. Legal only after a `family_gate_result` with `exit_code: 0`.
  It has the host discharge the wrapper's `-ListObligations` obligations, then dispatch the
  **technical** docs agent (`apex-docs-technical-agent`), which writes the handoff and archives the
  spec into `docs/changes/done/`; the host reviews that docs output and the build closes.

## Close-out ordering

The chain is fixed by `apex-code/SKILL.md` § Post-build and you sequence it, you do not redesign it:
the **reviewer runs first and always**; the **product docs agent (`apex-docs-product-agent`) runs
only after the reviewer has returned** (a docs write during an open review moves the tree and voids
the verdict); the **family gate runs at completion** and its certification must pass
**before the spec is archived**; and the terminal step is the host discharging `-ListObligations`
obligations and then dispatching the **technical docs agent (`apex-docs-technical-agent`)**, which
writes the handoff AND archives the spec — after which the host reviews the docs output.

So the directive order is `request_review` → `run_docs_agents` → `run_family_gate` → `complete`,
where `run_docs_agents` dispatches the PRODUCT docs agent only, and `complete` is the terminal
directive that — once `family_gate_result` is exit 0 — has the host discharge `-ListObligations`
obligations and dispatch the TECHNICAL docs agent for the handoff and the archival, then close. You
never emit `complete` for a spec whose `family_gate_result` is non-zero.

**An UNATTENDED multi-task build has one extra rung.** There, `run_family_gate` is preceded by the
**mandatory AFK end-gate**: once `run_docs_agents` has returned and before you emit
`run_family_gate`, emit a spec-scoped `request_review` and the host dispatches the read-only Opus
end-gate over the whole-run diff. `~/.claude/skills/apex-code/references/afk-endgate.md` is
canonical for that pass — this is a pointer, not a restatement. Its result reaches you as a
`reviewer_result` with `reviewer: "opus-endgate"`, its findings mapped onto the standard severities
as § Inputs defines. Treat a mapped BLOCK as a BLOCK: never emit `run_family_gate` over an
unresolved end-gate P1. An attended build does not have this rung.

The build-state block's **`phase`** field persists exactly where in that chain the build stands —
`build | review | docs | family_gate | archive` (where `docs` is the product agent's rung and
`archive` is the technical agent's) — so a resumed or fresh instance re-enters at the right rung
instead of re-running or skipping one. Read `phase` before emitting any close-out
directive, and never emit a directive for a rung earlier than the recorded `phase`.

## Exit code → verdict

Translate mechanically; `apex-code/SKILL.md`'s exit-code table is the canonical semantics and this
table does not restate it. `reason` is the fixed string in column three. Column four says which
event tag carries that code: a `dispatch_result` carries both a `run_id` and a `final`; a `refusal`
carries `final: null` always, and whether it carries a `run_id` — and WHOSE id that is — is given by
the referent table in § Inputs. Read that table, not this sentence, when you need to know whether an
id is present and what it points at.

| Exit | Verdict | Fixed reason | Arrives as |
|------|---------|--------------|------------|
| 0 | pass | `done` | dispatch_result |
| 65 | out_of_scope | `scope-violation-spec-defect` | dispatch_result |
| 66 | out_of_scope | `authorized-list-wrong` | dispatch_result |
| 67 | blocked | `coder-blocked-hard-stop` | dispatch_result |
| 68 | pass | `done-with-concerns` | dispatch_result |
| 69 | void | `tree-moved` | dispatch_result |
| 71 | fail | `shared-worktree-refused` | refusal |
| 72 | fail | `preflight-red-baseline` | refusal |
| 73 | fail | `mojibake-double-encoded` | dispatch_result |
| 74 | fail | `refused-scope-lock-contract` | refusal |
| 75 | fail | `call-died-coder-alive` | refusal |
| 76 | blocked | `critical-file-gate-refused` | refusal |
| 77 | blocked | `post-hoc-critical-write` | dispatch_result |
| 78 | void | `review-digest-binding-refused` | refusal |
| 79 | fail | `at-capacity-no-lease` | refusal |
| 80 | fail | `unresolved-row-holds-worktree` | refusal |
| 81 | fail | `declared-runtime-paths-refused` | refusal |
| 82 | fail | `adopt-abandon-refused-no-mutation` | refusal |
| 83 | fail | `attended-confirmation-required` | refusal |
| 124 | fail | `watchdog-no-output` | refusal |

**This table is the BUILD phase's.** For a **review-phase** dispatch, exits **0, 67, 68 and 69**
arrive as a `reviewer_result` — not a `dispatch_result` — and are read there: 0 CLEAN, 67 BLOCK, 68
FLAG-only, 69 tree-moved. A `tree_moved` `reviewer_result` adjudicates as `void` → `request_verify`
(re-pin, re-run the review). And a **null-`exit_code`** refusal never enters this table at all
(§ Inputs): read its `rule`, then re-plan or `park`.

Default action per code, where it is forced: 75 → `queue` · 79 → `queue` · **124 → `queue`** (the
watchdog flags silence and deliberately leaves the child ALIVE, so the worker is still running —
await it, or `adopt` its `run_id`; never `request_verify` against a tree it may still be writing) ·
83 → `request_confirmation` attended, `park` AFK · 80 → `request_abandon` attended, `park`
AFK · 69 and 78 → `request_verify` · 67 → `fork` or `park`, never `redispatch` unadjusted.
Everything else is yours.

**79, and the re-queue trap.** The canonical `apex-code/SKILL.md` row routes 79 to QUEUE for both of
its conditions — a transient at-capacity refusal AND an invalid capacity contract — so `queue` is the
forced first action either way. But if the same 79 recurs immediately with
an unchanged capacity config, `park` and surface it instead of re-queueing forever: the
invalid-contract sub-case is
permanent until a human edits the frontmatter, and no amount of waiting clears it.

**76 is not one gate but five, and only some are confirmable.** Attended, emit
`request_confirmation` **ONLY when the refusal's `rule` names a confirmable critical-file path** —
a `-ScopeUnlocked` build lacking `-CriticalFilesConfirmed`, or a classifier exit 10 without that
switch. The other three paths are NEVER-confirmable: the classifier script is missing, the
classifier returned exit 11 (the docs/audit hard block), or the classifier errored and failed
closed. No human "yes" exists for those, so asking for one only stalls the build — instead re-plan
the dispatch to drop the offending path, or `park`. AFK, 76 → `park` always.

Codes 79–83 exist only after the wrapper-hygiene changes ship; on a wrapper that predates them they
are unreachable, not a different mapping. An exit code absent from this table is `fail` with reason
`unmapped-exit-<code>`, and you say so in `notes`.

If a turn requires no decision, return
`{"kind":"adjudication","spec":"<spec>","adjudications":[],"notes":"awaiting <event>"}`. Never end a
turn with prose only, and never end one with a promise to wait, watch, or poll — you have no way to
observe anything, and the host is what resumes you.

## The loop

You emit a plan or an adjudication and your turn ends. The host executes, then resumes you by
message with the next bounded result. That is the whole protocol; you hold no timers.

**The build-state block** travels with every resume and is the complete state of the build. It
carries, and nothing else: `spec_path` · `spec_digest` (the hash the plan was cut from) ·
`completed_waves[]`, each with per-task `verdict` and `integration_state`
(`not_integrated|integrated|reverted`) · which task branches are integrated · `pending_waves[]` ·
`base_sha` per worktree · `repo` per task · `run_ids[]` from the ledger, per task ·
**`phase`** (`build|review|docs|family_gate|archive` — the close-out rung this build has reached) ·
`refusal_history[]` · `nudge_count` · **`pending_events[]`** — an ORDERED LIST of every event that
has not been adjudicated yet, each carried **verbatim** (its `kind`, exit code, verify tail, refusal
`rule` and `detail`), in arrival order. It is a list, not a single slot, because a wave can deliver
several results before an adjudication turn comes round. That last field is what makes a fresh
instance lossless: without it, the resume would drop exactly the results the previous turn was
mid-way through judging. If a field you need is absent, say so in
`notes` and decide on what is present.

**Known failure mode, handled.** An orchestrator subagent may end a turn early or without a JSON
block — the recorded pattern across the 2026-07-06 → 2026-07-30 build sessions (see the
sonnet-orchestrator early-return recovery pipeline in `docs/handoff/` for those dates). Recovery, in
order:

1. **One nudge, budgeted per build:** the host sends a `SendMessage` resume to this same agent id,
   carrying the build-state block, asking for the missing JSON block. Not an exception path — a
   standard step.
2. **One fresh-instance re-dispatch:** a new orchestrator instance, same contract, same build-state
   block. Because every fact arrives in the message, a fresh instance resumes with no loss.
3. **Then it splits on attendance.** **AFK: park and surface** — the build stops and waits for a
   human; the host does not adjudicate. **Attended: the host may take over**, and when it does the
   takeover is recorded as a **D1-EXCEPTION** row plus a handoff entry. The recording is what keeps
   the exception from re-licensing routine host adjudication (ADR-042's attended-substitution
   spirit: an attended human is a valid substitute, but only on the record).

   **Who writes that row, and how.** The host appends it with the mutex-guarded ledger-append
   helper `~/.claude/hooks/apex-ledger-append.ps1`, invoked in its preferred form
   (`-LineBase64 <base64 of the JSON row>`; `-Line` and `-LedgerPath` also exist, and it exits 0
   appended / 2 refused on bad input / 3 mutex not acquired). **Never a bare `Add-Content`:** a bare
   append races the wrapper's ledger rewrite, and a row that lands between the wrapper's read and
   its `[System.IO.File]::Replace` is silently dropped — the helper serializes against that rewrite
   under the same named `ApexCodexRunLedger` mutex, which is mandatory, not advisory. The run ledger
   is host state, so this write happens **only attended** — which this takeover branch already
   guarantees.

```json
{ "row_kind": "exception", "ts": "<utc-o>", "reason": "<why the takeover happened>",
  "scope": "<exactly what the host took over — spec, tasks, or one adjudication>",
  "operator": "<who was at the machine>" }
```

A `row_kind: "exception"` row is a record, not a run: like the wrapper's other non-dispatch row
kinds (`lease_close`, `obligation`), it is excluded from build-row selection by the `row_kind` rule,
so it can never be picked as a dispatch row or satisfy `apex-family-gate.ps1`.

## Directives the host will refuse

The host returns a `refusal` event — never the action — for: an integration-branch commit that has
not been through draft → show → approve; a push to a main branch; a `git merge`; a teardown that
does not satisfy ADR-046 § D8 (its algorithm is canonical there — read it, do not restate it); a
dispatch whose authorized set names a critical path without live attended confirmation, or names the
audit directory at all; and any write outside the spec's `## Files to Change`.

**One exception to that last rule, and only one:** the D6 close-out writer set — the handoff doc,
the `docs/status.md` rewrite, and archival of the spec into `docs/changes/done/` — is permitted
outside `## Files to Change`, exactly as `apex-code/SKILL.md` § Post-build permits it. Those three
artifacts and nothing else; every other off-list write is still refused.

**Structural validation, before any wave launches.** The host also runs a deterministic check over
your wave plan and refuses the whole wave back to you on violation: (a) **cap arithmetic** — the
wave's slot count, counting an `ultra` task as two, must not exceed `max_parallel_codex` (rule
`structural-cap`); (b) **file-disjointness** — no path appears in two tasks' `authorized` sets in the
same wave (rule `structural-disjointness`); (c) **authorized ⊆ spec** — every task's `authorized` set
must be a SUBSET of the paths in the spec's `## Files to Change`, path-normalized before comparison
(`authorized` is worktree-relative, the spec's rows are absolute, so both are reduced to the same
repo-relative form first). A plan naming any path outside that table is refused with rule
`structural-authorized-outside-spec`. This is mechanics, not judgment: it is arithmetic, set
intersection, and set inclusion over the plan you emitted, with no discretion in it, so it neither
reads on your ownership nor substitutes for it. All three refuse as **null-`exit_code`** refusals
(§ Inputs), so the only responses are re-plan or `park`.

On any refusal, re-plan within the rules; never re-issue the same directive.

## Channel and supervision

**Channel is keyed on ATTENDANCE, not on duration alone** (owner ruling, 2026-07-31).

- **Attended + long → `detached`.** The mechanism is a **runner script** — which itself launches the
  wrapper — executed as a **normal background task**, writing a **completion marker file** the host
  watches with `Monitor`. (Direct process detachment is classifier-blocked on this harness; the
  runner-script route is the one that works — `~/apex/docs/handoff/2026-08-01.md`.) The owner at the
  machine supplies ADR-029's supervision, the session stays interactive, and the detached runner is
  immune to the observed stop mechanism — whose occurrences correlated with attended machine use,
  which is exactly when you would otherwise be exposed.
- **Unattended / AFK → the harness-owned channel**, a `foreground` wrapper call. Stated honestly:
  on the current harness a foreground call past the ~10-minute tool ceiling **migrates to
  background** rather than dying — confirmed on a real >=12-minute foreground dispatch recorded
  under § Caveats of `~/apex/docs/research/issue13-kill-ceiling-rootcause-2026-07-30.md`, not
  assumed — and it stays harness-owned and synchronously collected either
  way, which is what makes it the right unattended choice, not a fallback.
- **Attended + short → `foreground`**, or `background` when the host wants its turn free.

ADR-029's high-risk carve-out is unchanged in its other half: high-risk work **never enters an
unattended parallel pool**. An attended high-risk long run is `detached` with the owner present; a
short one is literal `foreground`. The attendance flag is in your inputs — read it before you set
`channel`, and never infer it from duration.
````

- [ ] **Task 2**: Switch the orchestrator skill's build route from interim execution to dispatching the agent: replace the `build · implement · execute · start build` route-table row with the row below, delete the `**Transitional (2026-07-29):**` paragraph entirely, leave the "Both dispatches are the ADR-045 role split" paragraph's mechanics sentence intact, and bump the frontmatter `version` minor — files: C:\Users\User\.claude\skills\apex-orchestrate\SKILL.md — done when: the file contains the new row verbatim, no `interim executor` string, and no `Transitional` paragraph.

```
| build · implement · execute · start build | **apex-code** — dispatch a `model: opus` **`apex-build-orchestrator`** (Opus 5; ADR-045 as amended) and give it the spec, the repo's `AGENTS.md` verify contract, and the live tree facts. It owns task selection, wave sequencing, dispatch parameters, exit-code routing, verify adjudication, retries, and integration order; you execute its wave plan as mechanics and return bounded results. |
```

- [ ] **Task 3**: Retire the interim clause in the build skill's wave-analysis ownership note — replace the `**Who does this (ADR-046 D1).**` paragraph with the text below, leave the two traps and the sequential-when-unsure rule untouched, and bump the frontmatter `version` minor — files: C:\Users\User\.claude\skills\apex-code\SKILL.md — done when: the paragraph reads as below and the file no longer contains `interim executor`.

```
**Who does this (ADR-046 D1).** Wave grouping, dispatch sequencing, and completion routing are **orchestrator-owned** and are performed by the dispatched `apex-build-orchestrator` agent (`~/.claude/agents/apex-build-orchestrator.md`). The analysis below is what that agent applies; the host executes the resulting plan and returns bounded results. **"Raw results" throughout this skill means the bounded fixed result fields — exit code, `.final` fields, a bounded verify tail, porcelain output — unadjudicated; never a transcript or a whole log. The agent contract defines that set.** Producing them is host mechanics, in three parts: the host **assembles the bounded result events** from the wrapper's stdout, the `.final` report, and the run's ledger row, in the event shapes the agent contract declares; it runs the deterministic pre-launch **structural validation** — cap arithmetic, wave file-disjointness, and the subset check that every task's `authorized` set lies inside the spec's `## Files to Change` (path-normalized) — over every wave plan the agent emits, and returns a refusal event instead of launching when a wave violates it; and it persists the **build-state block** across turns and resumes the agent with it verbatim. None of the three is a judgement call, and none of them re-routes the agent's decision.
```

- [ ] **Task 4**: In the parallel-dispatch reference, (a) rewrite the opening paragraph so the dispatched orchestrator is named as the owner, (b) add a `## Dispatch channel` section directly after the `## Isolation = git-worktree-per-task` block, both exactly as below, (c) delete the now-superseded paragraph that begins `Launch every task in the sub-wave with` — its wait-then-integrate rule, log-path rule, and observability pointer are all carried by the new section — and (d) append to the EXISTING `## Supervision gate — parallel-safe is not parallel-eligible` section, as its final paragraph, the attendance-key paragraph given below; leave that section's existing text, `## Cap`, `## Integrate`, `## Teardown`, `## Failure / fallback`, and the rest of the cross-spec half unchanged — files: C:\Users\User\.claude\skills\apex-code\references\parallel-codex.md — done when: the file names the dispatched orchestrator in its opening paragraph, carries the `## Dispatch channel` section and the supervision-gate paragraph verbatim, contains no `interim` D1 wording, and mentions `run_in_background` exactly once (inside the `background` bullet). **Precondition:** the foreground-migration claim the unattended half of this section rests on is the one **Task 8b** confirms, and Task 8b lands before this task in the wave plan — a `re-opened` verdict from Task 8b blocks this task until its unattended-channel sentences are revised.

```
Load when a dependency (sub-)wave has **2+ independent `▸codex` tasks** and `max_parallel_codex > 1`.
The wave plan comes from the dispatched **`apex-build-orchestrator`** agent (`~/.claude/agents/apex-build-orchestrator.md`); the host runs the tasks as **concurrent `codex exec` subprocesses** — **as mechanics only**: launching and monitoring them strictly from that wave plan and returning status/exit codes to it. Task selection, sequencing, routing, verification, retries, and close-out are the orchestrator's (ADR-045 as amended 2026-07-29; ADR-046 D1).
```

```
## Dispatch channel (P1(b))

Attended parallel waves are **GO**. Issue 13 is closed: on the 2026-07-30 harness there is no
start-anchored and no idle kill ceiling (probes E1–E6, ~100 min surviving including a 40-min idle
session), and a foreground tool timeout **migrates** the call to background instead of killing it —
confirmed on a real >=12-minute foreground dispatch, recorded under § Caveats of the evidence doc
named below. The old foreground-only constraint on attended waves is retired.

**But the "was stopped" kill class is unresolved** (three occurrences, no consistent timing, one on a
real 35-min workload whose wrapper died while its codex child kept writing) — and its occurrences
correlated with the owner being at the machine. So the channel is keyed on **ATTENDANCE**, not on
duration alone (owner ruling, 2026-07-31), and the orchestrator sets it per task:

- **`detached` — the ATTENDED long-run channel.** A **runner script** — which itself launches the
  wrapper — executed as a **normal background task**; the runner writes a **completion marker file**
  and the host watches that marker with `Monitor`. Direct `Start-Process` / `schtasks` detachment is
  **classifier-blocked** on this harness and is NOT the mechanism; the runner-script-through-a-
  background-task route is what worked (`~/apex/docs/handoff/2026-08-01.md`). Proven on real builds;
  invisible to whatever issues the stops — which matters precisely in an attended session, where the
  owner is present to supervise and where the stop class was observed.
- **`foreground` — the UNATTENDED / AFK channel, and the attended-short one.** A plain wrapper call
  the harness owns. Honestly stated: past the ~10-minute tool ceiling the harness **migrates** the
  call to background instead of killing it — confirmed, not assumed, by a real >=12-minute plain
  foreground dispatch whose record sits under § Caveats of the evidence doc below — and it remains
  harness-owned and synchronously collected, so an unattended long run is safe here, and this is the
  right unattended choice rather than a fallback.
- **`background` — host-native `run_in_background`** on the wrapper invocation, for short attended
  dispatches where the host wants its turn free.

**Attendance, not duration, decides.** Attended + long → `detached` (owner supervises live).
Unattended → `foreground`, the harness-owned channel, at any duration. Attended + short →
`foreground` or `background`. Read the attendance flag; never infer the channel from a stopwatch.

**Version-pinned:** the probe results — including the foreground-migrates-to-background behaviour the
unattended channel rests on — hold for the harness build they were run on. A harness upgrade re-opens
the question: re-confirm with a ≥12-min real dispatch before relying on the harness-owned channel for
a long unattended run again.
Evidence: `~/apex/docs/research/issue13-kill-ceiling-rootcause-2026-07-30.md`.

Either way, wait for every subprocess in the sub-wave to exit before integrating, and give the user
each task's log path so they can tail them in parallel (the host reads only each `.final`). Full
observability recipe + teardown → `references/codex-observability.md`.
```

The paragraph appended to `## Supervision gate — parallel-safe is not parallel-eligible`:

```
**Channel under this gate (owner ruling, 2026-07-31).** The gate's parallel-pool exclusion is
unchanged: high-risk work never enters an unattended pool. What the gate does NOT dictate is the
process channel, which is keyed on **attendance** (§ Dispatch channel): an ATTENDED long dispatch —
high-risk included — runs **detached**, because the owner present at the machine is what supplies
this gate's supervision, the session stays interactive, and the detached runner is immune to the
observed stop class. An UNATTENDED run uses the **harness-owned foreground call** at any duration
(past the ~10-min ceiling the harness migrates it to background, still harness-owned and
synchronously collected — confirmed on a real >=12-min foreground dispatch, see § Dispatch channel).
An attended SHORT high-risk dispatch stays literal foreground. So
"foreground and sequential" above means supervised and sequential; it never requires a long run to
sit inside a blocking call.
```

- [ ] **Task 5**: Sweep the `~/.claude` consumers of the interim-executor clause — in each file replace the clause as listed below, changing nothing else; in the governance skill change only the frontmatter `version` (patch bump), leaving its body untouched. Only the ownership sentences change: `apex-coder`'s own fallback-path wave-grouping and worker-spawning behaviour is unaffected by this spec, and the `apex-plan` frontmatter `version` covering this file's `model-routing.md` edit is bumped once in Task 9, not here — files: C:\Users\User\.claude\skills\apex-code\references\dispatch-pack.md, C:\Users\User\.claude\skills\apex-code\references\workflow-dispatch.md, C:\Users\User\.claude\skills\apex-plan\references\model-routing.md, C:\Users\User\.claude\skills\apex-governance\levels\L3.md, C:\Users\User\.claude\skills\apex-governance\SKILL.md, C:\Users\User\.claude\agents\apex-coder.md, C:\Users\User\.claude\agents\apex-docs-technical-agent.md — done when: none of these files contains `interim executor` or `interim: the host`, and each replacement below is present verbatim.

Each pair below is a literal find/replace on that file. Backticks shown are part of the text.

````text
--- skills/apex-code/references/dispatch-pack.md
FIND:    **Interim:** until the build-orchestrator agent contract ships, the host performs that routing itself as **interim executor** — a recorded transition state, not doctrine.
REPLACE: The orchestrator is the dispatched `apex-build-orchestrator` agent; the host relays the signal and executes the rung it names.

--- skills/apex-code/references/workflow-dispatch.md
FIND:    terminal verify-failure routing by the executor (the orchestrator, or the host as interim executor)
REPLACE: terminal verify-failure routing by the `apex-build-orchestrator`

--- skills/apex-plan/references/model-routing.md
FIND:    terminal verify-failure routing by the executor (the orchestrator, or the host as interim executor)
REPLACE: terminal verify-failure routing by the `apex-build-orchestrator`

--- skills/apex-governance/levels/L3.md
FIND:    **(target state, ADR-045 as amended; interim: the host executes the pipeline from the orchestrator's wave plan until the agent contract ships — ADR-046 D1)**
REPLACE: **(the host executes the pipeline from the orchestrator's wave plan — ADR-045 as amended, ADR-046 D1)**

--- agents/apex-coder.md (first occurrence, the description paragraph)
FIND:    terminal verify-failure routing by the executor (the orchestrator, or the host as interim executor)
REPLACE: terminal verify-failure routing by the `apex-build-orchestrator`

--- agents/apex-coder.md (§ Step 2 ownership paragraph)
FIND:    Ownership of the scheduling doctrine is unchanged: orchestrator-owned is the target, with the host as interim executor until the build-orchestrator agent contract ships.
REPLACE: Ownership of the scheduling doctrine is unchanged: it is owned by the dispatched `apex-build-orchestrator`.

--- agents/apex-docs-technical-agent.md
FIND:    **the host, as interim executor (ADR-046 D1), assembles it from the wrapper's `.final` completion reports**
REPLACE: **the host assembles it from the wrapper's `.final` completion reports as build mechanics (ADR-046 D1)**
````

- [ ] **Task 6**: Amend both ADRs. (a) In ADR-046, append to § D1 immediately before `### D2` an `**Amendment — <build date>: interim executor retired**` paragraph recording that the build-orchestrator agent contract shipped at `~/.claude/agents/apex-build-orchestrator.md`; that D1's interim clause is fulfilled and retired; that the ownership assignment and the host's mechanics-only role are unchanged; that the host additionally runs a deterministic pre-launch structural validation (cap arithmetic, wave file-disjointness) and refuses a violating wave back to the orchestrator, which is mechanics, not adjudication; that **dispatch channel is keyed on attendance** (owner ruling, 2026-07-31) — attended long dispatches run detached with the owner supplying ADR-029's supervision, unattended runs use the harness-owned foreground call at any duration, and ADR-029's parallel-pool exclusion for high-risk work is unchanged; and that a host takeover of orchestrator duties now exists **only** as an attended, recorded **D1-EXCEPTION** — a ledger row `{row_kind:'exception', ts, reason, scope, operator}`, excluded from dispatch and family-gate selection by the `row_kind` rule, plus a handoff entry — while an AFK build parks and surfaces instead. Then mark the ORIGINAL interim paragraph (`Until the build-orchestrator agent contract ships…`, `:61-62`) with a leading `**Superseded — <build date>, see the amendment below:**` marker, following ADR-045's annotation precedent; leave its wording otherwise intact so the historical record survives, and do not delete it. (b) In ADR-045, edit the D1-amendment sentence at `:74-77` **in place** — the one beginning `Until the orchestrator's agent contract ships` — replacing it with a sentence in the past tense that marks it superseded, names the agent file, and cites this amendment; follow that ADR's own annotation precedent for superseded text rather than appending a second paragraph. (c) In ADR-041, add a one-line banner directly under the `**Deferred:**` bullet at `:72-77` reading `**Annotation (<build date>):** "the host adjudicates" here is the pre-D1 arrangement; build-result adjudication is now the dispatched `apex-build-orchestrator`'s (ADR-046 D1). Historical text retained.` — a banner only; the bullet's own wording is NOT rewritten. (d) In ADR-044, the § Decision **Item 1** paragraph at `:187` still ends `the host must adjudicate before accepting the diff` — the last unswept adjudication consumer. Add a one-line banner directly UNDER that paragraph reading `**Annotation (<build date>):** post-hoc critical-violation adjudication is the dispatched `apex-build-orchestrator`'s (ADR-046 D1); the host executes its directive. Attended confirmation remains the recovery. Historical text retained.` — banner only, in the same pattern as (c)'s ADR-041 banner: the original paragraph's wording is NOT touched, not one word. Use the session date supplied in the dispatch pack, or `2026-07-30` if none is supplied — files: C:\users\user\apex\docs\technical\adr\ADR-046-doctrine-audit-resolutions.md, C:\users\user\apex\docs\technical\adr\ADR-045-four-role-split.md, C:\users\user\apex\docs\technical\adr\ADR-041-wrapper-hardening-scope-cap-pin.md, C:\users\user\apex\docs\technical\adr\ADR-044-round8-deferred-designs.md — done when: ADR-046 § D1 carries the amendment with the structural-validation and D1-EXCEPTION clauses AND the superseded marker on the original interim paragraph, ADR-045's sentence is rewritten in place with a supersession marker, ADR-041 and ADR-044 each carry their banner with their original text unchanged, and no other decision text is reworded.

- [ ] **Task 7**: Double-write the registry. This task is coder-dispatched against the `apex` worktree directly — it is ordinary repository bookkeeping in the spec's own scope lock, not one of the three host's-pen artifacts (handoff, live status file, spec archival) that D6 reserves, so the sibling specs' host-pen convention does not apply to it. In `SKILLS.md` change the `## Agents (5)` heading to `## Agents (6)` and add the row below as the first row of the agents table. In `SKILL-HISTORY.md` add one row at the top of the table, dated the build date, listing skills `apex-code, apex-orchestrate, apex-governance, apex-plan`, every file this spec changed under `~/.claude`, event `updated`, a What-Changed summary naming the agent creation, the interim-executor retirement, and the dispatch-channel doctrine, and sources `docs/technical/adr/ADR-046-doctrine-audit-resolutions.md · docs/technical/adr/ADR-045-four-role-split.md · docs/research/issue13-kill-ceiling-rootcause-2026-07-30.md`. **RECORD the version numbers Tasks 2, 3, 5, and 9 already wrote — read each SKILL.md frontmatter and copy the value. Bump nothing here.** **Integration directive for this task, executed by the host as mechanics in this order:** (1) `git -C <apex> log -1 --format=%H -- SKILLS.md SKILL-HISTORY.md` and read the first five lines of each table; (2) if either top row differs from what this task's worktree branched onto, rebase the worktree onto the current tip and **RE-APPEND this spec's row as the newest row** — a move of the one existing row within the rewrite, never a second copy, and never left buried under a row that landed later; (3) only then the path-scoped `git checkout` integration. Step (2) is what keeps the done-condition below true after a race: this spec's row is the newest row, and the versions it records are read from it as the newest row. `retro-validator-versioning` and `adr032-predraft-architecture-pass` write these same two files, so step (2) is not optional — files: C:\users\user\apex\SKILLS.md, C:\users\user\apex\SKILL-HISTORY.md — done when: the agents table has six data rows and a matching count in its heading, the history table's newest row is the one described, and its version numbers equal the live frontmatter values.

```
| **apex-build-orchestrator** | apex-code (host dispatch) | Wave scheduling, dispatch parameters, exit-code routing, verify adjudication, integration order — reasoning only |
```

- [ ] **Task 8**: **Host-executed, attended — never dispatched to a coder** (it launches a real `codex exec`, and a nested dispatch inside a sandboxed coder is not a supported path). Run ONE real dummy dispatch through `codex-dispatch.ps1` in a throwaway scratch worktree. The channel is `detached` **by the attendance rule, not as an exception**: this task is attended and long, which is exactly the case the rule assigns to the detached runner. **The mechanism is fixed:** a **runner script** — which itself launches `codex-dispatch.ps1` — executed as a **normal background task**, a **completion marker file** written by that runner, and `Monitor` on the marker; owner present and the host tailing the dispatch log throughout. Direct `Start-Process` / `schtasks` detachment is classifier-blocked on this harness (`docs/handoff/2026-08-01.md`) and must NOT be used. **The dummy is deterministic, not open-ended** — dispatch it with this EXACT prompt text, verbatim: `Emit exactly one line to stdout every 30 seconds, of the form "heartbeat <n>/25 <UTC ISO-8601 timestamp>", beginning at n=1 and continuing through n=25. Sleep 30 seconds between lines. Do NOT create, edit, or delete any file. Do NOT run any other command. After the 25th line, print "heartbeat complete" and exit.` — and this EXACT wrapper argument list: `-Spec build-orchestrator-contract -Task 8-detached-channel-probe -Phase build -Worktree <the throwaway scratch worktree> -Effort low -Schema completion`, plus EITHER `-Authorized <the single scratch file the probe may touch>` OR, when the probe writes nothing at all, `-ScopeUnlocked -ScopeUnlockedReason "issue-13 detached-channel probe: heartbeat only, no file writes"`. 25 iterations × 30 s bounds the run below at **≥12 minutes wall clock** (the issue-13 doc's stated threshold, which the heartbeat probes could not exercise because they never filled a 64-KB stdout pipe). If the prompt finishes early, re-run with a larger iteration count; a short run proves nothing. Then append to § Caveats of the issue-13 research doc a `**Real-codex confirmation (<date>)**` bullet whose seven fields are: harness build · run id · wall-clock duration in minutes, computed as `ended - started` from that ledger row's own timestamps (never estimated) · terminal ledger row status · whether the `--json` log's last line parses as a complete final event · whether the `.final` file exists · `verdict: confirmed` — files: C:\users\user\apex\docs\research\issue13-kill-ceiling-rootcause-2026-07-30.md — done when: the run reached natural completion, all four mechanical checks pass (terminal ledger status, complete final log event, `.final` present, computed duration ≥ 12 min), and the appended bullet carries all seven fields. **A `re-opened` outcome is NOT a completion of this task** — it means the kill class reproduced on a real dispatch, which invalidates the Task 4 channel doctrine as written: stop, record the evidence, and surface it as a spec-level blocker. **Scope note:** this task confirms only the ATTENDED/`detached` half of the channel doctrine. The unattended half — the claim that a plain foreground call past the ~10-minute tool ceiling MIGRATES rather than dies — is not assumed here; it is confirmed separately by **Task 8b**, and until 8b returns `verdict: confirmed` that claim stands unconfirmed.

- [ ] **Task 8b**: **Host-executed, attended — never dispatched to a coder** (same reason as Task 8: it launches a real `codex exec`, and a nested dispatch inside a sandboxed coder is not a supported path). Run the SAME deterministic ≥12-minute heartbeat dummy as Task 8 — its exact prompt text and wrapper argument list are given verbatim in Task 8's body and are reused unchanged except that `-Task` becomes `8b-foreground-channel-probe` — through `codex-dispatch.ps1` in a throwaway scratch worktree, but this time as a **PLAIN FOREGROUND wrapper call**: no runner script, no background task, no completion marker, no `Monitor`. That is precisely the harness-owned channel the attendance rule assigns to an unattended run, and this task is the only place in this spec where a foreground long call is deliberate rather than an error. **Expected outcome:** the harness MIGRATES the call past its ~10-minute tool ceiling and the run reaches natural completion, with all four mechanical checks passing — terminal ledger row status (not `running`, `adopting`, `stalled`, or `killed`); computed duration `ended - started` from that row's OWN timestamps ≥ 12.0 minutes (computed, never estimated); the `.final` file present at the wrapper's reported path; the `--json` log's last line parsing as a complete final event rather than truncating mid-event. Then append to § Caveats of the issue-13 research doc a `**Real-codex foreground confirmation (<date>)**` bullet — a marker deliberately DISTINCT from Task 8's `**Real-codex confirmation (<date>)**`, so neither task's acceptance extract can swallow the other's bullet — in the SAME seven-field format as Task 8's, but for the foreground channel: harness build · run id · wall-clock duration in minutes computed as `ended - started` from that ledger row's own timestamps · terminal ledger row status · whether the `--json` log's last line parses as a complete final event · whether the `.final` file exists · `verdict: confirmed`. **STOP CONDITION — this is the point of the task.** The 2026-08-01 handoff records a foreground 10-minute timeout that KILLED the whole process tree. If that reproduces here — the tree is killed at the ceiling rather than the call migrating — then the unattended-channel doctrine is **invalidated as written**: do NOT continue and do NOT record a confirmation. Record the evidence in the same § Caveats as a bullet whose seventh field is `verdict: re-opened`, and surface it as a **spec-level blocker**. Because this task runs in wave 2 — before Task 1 or Task 4 has written a line of doctrine — a `re-opened` verdict PARKS the spec with nothing yet to roll back: the unattended-channel sentences planned for Task 4's `## Dispatch channel` and for Task 1's agent-contract § Channel must be re-drafted in this spec before the sweep resumes — files: C:\users\user\apex\docs\research\issue13-kill-ceiling-rootcause-2026-07-30.md — done when: the plain foreground call completed past the tool ceiling without the tree being killed, all four mechanical checks pass, and the appended `Real-codex foreground confirmation` bullet carries all seven fields ending `verdict: confirmed`. A `re-opened` outcome is NOT a completion of this task.

- [ ] **Task 9**: Retire the § Wave plan interim clause in the planning skill and bump its version once. Replace the sentence that currently spans two lines — `Final task selection and sequencing are **orchestrator-owned** (ADR-046 D1; interim: the` / `host performs them as executor until that agent contract ships).` — with: `Final task selection and sequencing are **orchestrator-owned** — the dispatched `apex-build-orchestrator` (ADR-046 D1).` Leave the surrounding proposal/binding-dependency sentences and every other section of the file untouched, and bump the frontmatter `version` PATCH exactly once, covering both this edit and Task 5's `model-routing.md` edit — files: C:\Users\User\.claude\skills\apex-plan\SKILL.md — done when: the wrapped clause is gone (checked across line breaks), the orchestrator phrasing is present, and the diff contains exactly one changed `version` line plus the § Wave plan sentence.

- [ ] **Task 10**: Reword the architecture overview's host-role bullet — replace the clause that wraps `:41-42`, `scheduling, routing, and verify adjudication are orchestrator-owned, performed by the host as **interim executor** until that agent contract ships (ADR-046 D1)`, with `scheduling, routing, and verify adjudication are owned by the dispatched `apex-build-orchestrator` (ADR-045 as amended; ADR-046 D1)`; change nothing else in the file, including the Build-orchestrator bullet below it — files: C:\users\user\apex\docs\technical\architecture\overview.md — done when: the file contains no `interim` string and names `apex-build-orchestrator` in the host-role bullet.

- [ ] **Task 11**: Correct the two adjudication-owner cells in the harness limits doc — in the Round-8 Wave B2 limits table, change `critical_violation` absent + loud WARN. Host adjudication covers it.` to `…absent + loud WARN. The build orchestrator adjudicates it (ADR-046 D1); an attended host confirmation is the recovery.`, and change `recovery is attended `-CriticalFilesConfirmed` or host adjudication` to `recovery is attended `-CriticalFilesConfirmed`, adjudicated by the build orchestrator (ADR-046 D1)`; change no other row, and do not touch the Wave A table above them — files: C:\users\user\apex\docs\technical\harness-known-limits.md — done when: neither cell says `host adjudication`, both name the orchestrator, and the file's row count is unchanged.

## Wave plan
Wave 1: [Task 8] | Wave 2: [Task 8b] | Wave 3: [Task 1] | Wave 4: [Task 2] | Wave 5: [Task 3] | Wave 6: [Task 4] | Wave 7: [Task 5] | Wave 8: [Task 6] | Wave 9: [Task 9] | Wave 10: [Task 10] | Wave 11: [Task 11] | Wave 12: [Task 7]

**Fully sequential — one task per wave.** `max_parallel_codex: 1` plus the ADR-029 supervision gate (`risk: high`) already forbids a parallel pool, so any multi-task wave here would be a grouping the orchestrator has to unpick before it can dispatch; the plan states the real order instead.

Dependencies are binding. **Both channel probes run FIRST, before any doctrine text exists.** Task 8 confirms the attended/`detached` half of the channel doctrine and Task 8b the unattended/harness-owned-foreground half; a `re-opened` verdict from either invalidates claims that Task 1's § Channel and Task 4's `## Dispatch channel` would otherwise already be asserting. Probing ahead of the agent contract means such a verdict simply PARKS the spec — nothing has been written, so there is nothing to roll back and nothing to revise in place. The probes have no dependency on Task 1: they exercise the wrapper and the harness, not the agent. **Task 1 lands third**, because Tasks 2–6 and 9–11 name the agent or its ownership. Task 7 lands last, because it records the frontmatter versions Tasks 2, 3, 5, and 9 wrote.

Tree split: Tasks 1–5 and 9 build in `~/.claude`; Tasks 6, 7, 8, 8b, 10, and 11 build in `apex` — two trees, so integration runs per repo, each against its own verify recipe. This spec builds **attended**, so by the attendance rule (owner ruling, 2026-07-31) its long dispatches run `detached` with the owner present and the host tailing the log, and its short ones run literal `foreground` — the sole deliberate exception being Task 8b, whose subject matter IS the plain foreground channel. Were the spec ever run unattended, every dispatch would instead use the harness-owned foreground call.

## Permissions

The following NON-CRITICAL actions will run autonomously during build. Approving this spec approves all of them.
Critical paths — environment files · migrations · auth/authz/crypto · CI config · dependency manifests and lockfiles · infra-as-code · secrets/keys/certs · host-state (the live status file, root AGENTS.md, root CLAUDE.md, the `docs/changes/` and `docs/handoff/` directories, the run ledger) · the permission settings and the hooks — are NEVER pre-authorised by this section. They need a live attended confirmation at build time, and an AFK run parks them (D3, ADR-046; apex-governance is canonical). (Sole exception: the docs agents' three host's-pen artifacts under D6.)
The `docs/audit/` directory is different and stricter: TIER-1, refused outright on a path match. No confirmation authorises a write there — not attended, not by any switch, not by this section.

### File Operations
| Action | Paths |
|--------|-------|
| Create | C:\Users\User\.claude\agents\apex-build-orchestrator.md · transient artifacts under the out-of-repo scratch root, none committed: Task 8's detached runner script, its completion marker file, and the throwaway scratch worktree; Task 8b's throwaway scratch worktree (no runner script or marker — it is a plain foreground call); the reachability probe's synthetic toy spec and its probe transcript; the D1-exception fixture row file and its fixture ledger; the acceptance-check extracts `apex-t8-bullet.txt` and `apex-t8b-bullet.txt` |
| Modify | C:\Users\User\.claude\skills\apex-orchestrate\SKILL.md, C:\Users\User\.claude\skills\apex-code\SKILL.md, C:\Users\User\.claude\skills\apex-code\references\parallel-codex.md, C:\Users\User\.claude\skills\apex-code\references\dispatch-pack.md, C:\Users\User\.claude\skills\apex-code\references\workflow-dispatch.md, C:\Users\User\.claude\skills\apex-plan\references\model-routing.md, C:\Users\User\.claude\skills\apex-plan\SKILL.md, C:\Users\User\.claude\skills\apex-governance\levels\L3.md, C:\Users\User\.claude\skills\apex-governance\SKILL.md, C:\Users\User\.claude\agents\apex-coder.md, C:\Users\User\.claude\agents\apex-docs-technical-agent.md, C:\users\user\apex\docs\technical\adr\ADR-046-doctrine-audit-resolutions.md, C:\users\user\apex\docs\technical\adr\ADR-045-four-role-split.md, C:\users\user\apex\docs\technical\adr\ADR-041-wrapper-hardening-scope-cap-pin.md, C:\users\user\apex\docs\technical\adr\ADR-044-round8-deferred-designs.md, C:\users\user\apex\docs\technical\harness-known-limits.md, C:\users\user\apex\SKILLS.md, C:\users\user\apex\SKILL-HISTORY.md, C:\users\user\apex\docs\research\issue13-kill-ceiling-rootcause-2026-07-30.md, C:\users\user\apex\docs\technical\architecture\overview.md |
| Delete | At teardown, only artifacts this spec created under the out-of-repo scratch root: Task 8's runner script, marker file, and scratch worktree; Task 8b's scratch worktree; the reachability toy spec and probe transcript; the D1-exception fixture row and fixture ledger; `apex-t8-bullet.txt` and `apex-t8b-bullet.txt`. No tracked file in either repo is deleted by this spec. |

### Commands
| Command | Purpose |
|---------|---------|
| the dispatch wrapper `codex-dispatch.ps1` | Per-task coder dispatch, and the Task 8 (detached) and Task 8b (plain foreground) confirmation runs |
| the validator `apex-spec-validate.ps1` | Spec validation at pre-flight |
| `grep`, `wc`, `node --check`, both trees' AGENTS.md verify recipes | Acceptance-criteria checks and the authoritative verify pass |
| `git worktree add`, `git status --porcelain`, `git diff` | Isolation and integration mechanics |

### Git Operations
| Operation | Scope |
|-----------|-------|
| `git add -f` | Only the name-listed authorized files of each task, worktree-relative |
| `git commit` | Per-task: `build(build-orchestrator-contract): task <n>` on the transient task branch; per-spec: drafted, shown, and approved before it executes |
| `git rebase` | Task 7 race-recovery only: rebase that task's worktree onto the registry files' current tip before re-appending its row |
| `git checkout <branch> -- <paths>` | Path-scoped integration of each task's authorized files, and the Task 7 race-recovery re-integration. Never `git merge` |

### Environment Access
| Variable | Purpose |
|----------|---------|
| `USERPROFILE` | Resolves the wrapper and the `~/.claude` build tree |
| `LOCALAPPDATA` / `APEX_STATE_DIR` | Ledger and dispatch-log location for the Task 8 and Task 8b confirmation runs |

### Network
| Action | Purpose |
|--------|---------|
| (none) | No package installation, no fetches |

## Specialist Context
### Security
The new agent is granted `Read, Glob, Grep` only. Any later widening of that tools line — especially to `Bash`, `Edit`, `Write`, or `Agent` — converts a reasoning agent into an unsupervised executor and voids the host-refusal chokepoint that keeps hard blocks enforceable. Treat the tools line as a security boundary, not a convenience setting.

### Performance
(none)

### Accessibility
(none)

## Documentation
| Doc type | File | Action |
|----------|------|--------|
| ADR | docs/technical/adr/ADR-046-doctrine-audit-resolutions.md | Amend D1 (Task 6) |
| ADR | docs/technical/adr/ADR-045-four-role-split.md | Amend the D1 section in place (Task 6) |
| ADR | docs/technical/adr/ADR-041-wrapper-hardening-scope-cap-pin.md | Annotation banner only (Task 6c) |
| ADR | docs/technical/adr/ADR-044-round8-deferred-designs.md | Annotation banner only (Task 6d) |
| Architecture | docs/technical/architecture/overview.md | Host-role bullet reworded (Task 10) |
| Registry | SKILLS.md, SKILL-HISTORY.md | Double-write (Task 7) |
| Inline | (none) | No source files change |

## Acceptance Criteria

**Reachability (spec level).** This spec adds one exposed boundary — the orchestrator agent — and it
is reachable only if the parent route actually dispatches it and the agent actually answers in the
declared schema. Both halves are asserted below: a live round-trip probe, and the parent-side wiring
check that proves the route names the agent file rather than describing it.

- [ ] **Reachability, live round-trip (Tasks 1 and 2)** — after the build, the host dispatches the NEW agent ONCE as an adjudication dry-run against a synthetic two-task toy spec written to the scratch directory (two independent file-disjoint tasks, one repo, no real build, nothing dispatched to a coder). Round trip 1: the agent returns a `wave_plan`. Round trip 2: the host resumes it with a synthetic `dispatch_result` (`exit_code: 65`) and it returns an `adjudication` → verify: turn 1's block parses as JSON, has `kind: "wave_plan"`, and every task object carries `task_id`, `repo`, `base_sha`, `worktree`, `branch`, `authorized`, `effort`, `channel`; turn 2's block parses as JSON, has `kind: "adjudication"`, and its single entry has `verdict: "out_of_scope"` with a `next_action` from the declared enum. Both turns return exactly one fenced JSON block and no prose outside it. The toy spec and the probe transcript are scratch artifacts — neither is committed.
- [ ] **Reachability, parent wiring (Task 2)** — the route does not merely mention the agent, it names the file that exists → verify:

```
cd ~/.claude && grep -n 'apex-build-orchestrator' skills/apex-orchestrate/SKILL.md | grep -c 'build · implement'   # >=1 (the route row itself)
cd ~/.claude && test -f agents/$(grep -o 'apex-build-orchestrator' skills/apex-orchestrate/SKILL.md | head -1).md   # exit 0
cd ~/.claude && grep -c '^name: apex-build-orchestrator$' agents/apex-build-orchestrator.md   # 1 (route name == agent frontmatter name)
```

- [ ] **Task 1** — the agent file exists and is reasoning-only → verify:

```
test -f ~/.claude/agents/apex-build-orchestrator.md
grep -c '^tools: Read, Glob, Grep$' ~/.claude/agents/apex-build-orchestrator.md   # 1
grep -c '^model: opus$' ~/.claude/agents/apex-build-orchestrator.md               # 1
grep -cE '^tools:.*(Bash|Edit|Write|Agent)' ~/.claude/agents/apex-build-orchestrator.md  # 0
grep -c '"kind": "wave_plan"' ~/.claude/agents/apex-build-orchestrator.md         # >=1
grep -c '"kind": "adjudication"' ~/.claude/agents/apex-build-orchestrator.md      # >=1
grep -c 'task_id' ~/.claude/agents/apex-build-orchestrator.md                     # >=1
grep -ci 'nudge' ~/.claude/agents/apex-build-orchestrator.md                      # >=1
grep -c 'refusal' ~/.claude/agents/apex-build-orchestrator.md                     # >=1
```

- [ ] **Task 1** — the input events are a tagged union on `kind`, and the refusal tag carries the `run_id` REFERENT table — not a blanket "neither field" claim, and not a pre/post-identity partition → verify:

```
cd ~/.claude/agents && for p in '"kind": "dispatch_result"' '"kind": "refusal"' '"kind": "integration_verify"' '"kind": "reviewer_result"' '"kind": "family_gate_result"'; do grep -c "$p" apex-build-orchestrator.md; done   # each 1
cd ~/.claude/agents && grep -ci 'neither run_id nor final' apex-build-orchestrator.md       # 0 (the superseded generalization)
cd ~/.claude/agents && grep -c '`final` is ALWAYS null on this tag' apex-build-orchestrator.md   # 1
cd ~/.claude/agents && grep -ci 'post-identity' apex-build-orchestrator.md                  # 0 (the superseded partition)
cd ~/.claude/agents && grep -ci 'pre-identity' apex-build-orchestrator.md                   # 0
cd ~/.claude/agents && grep -ci 'identity hoist' apex-build-orchestrator.md                 # 0 (term absent from the wrapper)
cd ~/.claude/agents && grep -c 'What `run_id` names' apex-build-orchestrator.md             # 1 (the referent table header)
cd ~/.claude/agents && grep -c 'referent varies by code' apex-build-orchestrator.md         # 2 (the field comment and the rule)
cd ~/.claude/agents && grep -cE '^\| \*\*80\*\* \| the BLOCKING unresolved row' apex-build-orchestrator.md   # 1
cd ~/.claude/agents && grep -cE '^\| \*\*71, 72, 74, 76, 79, 81, 83\*\* \|' apex-build-orchestrator.md       # 1
cd ~/.claude/agents && for r in '**75**' '**82**' '**78**' '**124**'; do grep -cF -- "$r" apex-build-orchestrator.md; done   # each >=1
cd ~/.claude/agents && grep -c '"event":' apex-build-orchestrator.md                        # 0 (no stale key)
cd ~/.claude/agents && grep -c 'integration_branch' apex-build-orchestrator.md              # >=1
cd ~/.claude/agents && grep -c 'reviewed_run_id' apex-build-orchestrator.md                 # >=1
# the intro still declares FIVE kinds, and warns that one exit code can arrive on two tags
cd ~/.claude/agents && grep -c 'kinds, below' apex-build-orchestrator.md                     # 1
cd ~/.claude/agents && grep -c 'The tag, not the code, tells you what you are holding' apex-build-orchestrator.md   # 1
```

- [ ] **Task 1** — `dispatch_result.final` mirrors the live completion schema, `commands_run` in its OBJECT form → verify:

```
cd ~/.claude/agents && grep -c '"command":' apex-build-orchestrator.md                     # >=1
cd ~/.claude/agents && grep -c '"result": "pass|fail|not_run"' apex-build-orchestrator.md  # >=1
cd ~/.claude/agents && grep -c '"commands_run": \["..."\]' apex-build-orchestrator.md      # 0 (the superseded string-array form)
cd ~/.claude/agents && grep -c '"blocker": null' apex-build-orchestrator.md                # 0 (blocker is not always null)
cd ~/.claude/agents && grep -ci 'codex-completion-schema.json' apex-build-orchestrator.md  # >=1
cd ~/.claude/agents && grep -ci 'array of OBJECTS' apex-build-orchestrator.md              # 1
```

- [ ] **Task 1** — `reviewer_result` mirrors the live review schema and one shape serves both reviewer families → verify:

```
cd ~/.claude/agents && grep -c '"verdict": "BLOCK|FLAG|CLEAN"' apex-build-orchestrator.md   # 1
cd ~/.claude/agents && grep -c '"severity": "BLOCK|FLAG|CLEAN"' apex-build-orchestrator.md  # 1
cd ~/.claude/agents && grep -c 'clean|findings|BLOCK' apex-build-orchestrator.md            # 0 (superseded verdict enum)
cd ~/.claude/agents && grep -c '"severity": "low|medium|high"' apex-build-orchestrator.md   # 0 (superseded severity enum)
cd ~/.claude/agents && grep -c '"criterion":' apex-build-orchestrator.md                    # 1
cd ~/.claude/agents && grep -c '"rationale":' apex-build-orchestrator.md                    # 1
cd ~/.claude/agents && grep -ci 'codex-review-schema.json' apex-build-orchestrator.md       # >=1
cd ~/.claude/agents && grep -ci 'one shape serves both families' apex-build-orchestrator.md # 1
```

- [ ] **Task 1** — a host-generated refusal is representable: `exit_code` may be `null`, `rule` comes from a named set, and such a refusal never routes through the exit table → verify:

```
cd ~/.claude/agents && grep -c '"exit_code": "<wrapper exit code, or null for a host-generated refusal>"' apex-build-orchestrator.md   # 1
cd ~/.claude/agents && grep -c '"exit_code": 79' apex-build-orchestrator.md                          # 0 (the superseded fixed-code form)
cd ~/.claude/agents && grep -c 'is null on a host-generated refusal' apex-build-orchestrator.md      # 1
cd ~/.claude/agents && grep -c 'never map through the exit table' apex-build-orchestrator.md         # 1
cd ~/.claude/agents && grep -ci 'the only legal responses to one are to' apex-build-orchestrator.md  # 1
cd ~/.claude/agents && for r in hard-block-commit-unapproved hard-block-push-main hard-block-merge hard-block-teardown-outside-d8 hard-block-critical-unconfirmed hard-block-audit-write structural-cap structural-disjointness structural-authorized-outside-spec; do grep -c -- "$r" apex-build-orchestrator.md; done   # each >=1
```

- [ ] **Task 1** — review-phase exits ride `reviewer_result`, and the AFK end-gate is representable on it → verify:

```
cd ~/.claude/agents && grep -c '"exit_code": 0|67|68|69' apex-build-orchestrator.md               # 1
cd ~/.claude/agents && grep -c '"tree_moved": true|false' apex-build-orchestrator.md              # 1
cd ~/.claude/agents && grep -c 'A review dispatch exits through the wrapper too' apex-build-orchestrator.md   # 1
cd ~/.claude/agents && grep -c 'This table is the BUILD phase' apex-build-orchestrator.md         # 1
cd ~/.claude/agents && grep -c 'tree_moved' apex-build-orchestrator.md                            # 4
cd ~/.claude/agents && grep -c 'opus-endgate' apex-build-orchestrator.md                          # 3
cd ~/.claude/agents && grep -c 'afk-endgate.md' apex-build-orchestrator.md                        # 2
cd ~/.claude/agents && grep -c 'P1 → BLOCK' apex-build-orchestrator.md                            # 1
cd ~/.claude/agents && grep -c 'P2 → FLAG' apex-build-orchestrator.md                             # 1
cd ~/.claude/agents && grep -c 'CLEAN, informational only' apex-build-orchestrator.md             # 1
cd ~/.claude/agents && grep -c '"severity": "P1|P2|note"' apex-build-orchestrator.md              # 1
cd ~/.claude/agents && grep -c 'mandatory AFK end-gate' apex-build-orchestrator.md                # 1
cd ~/.claude/agents && grep -c 'unresolved end-gate P1' apex-build-orchestrator.md                # 1
```

- [ ] **Task 1** — the bounded-input caps are stated numerically, not merely as "bounded" → verify:

```
cd ~/.claude/agents && grep -c '<=50 lines' apex-build-orchestrator.md      # >=3
cd ~/.claude/agents && grep -c '<=200 lines' apex-build-orchestrator.md     # >=2
cd ~/.claude/agents && grep -c '<=10 KB' apex-build-orchestrator.md         # >=2
cd ~/.claude/agents && grep -c '<=30 findings' apex-build-orchestrator.md   # 1
cd ~/.claude/agents && grep -c 'concerns_md' apex-build-orchestrator.md     # >=2 (shape + the "raw" enumeration)
cd ~/.claude/agents && grep -c 'scope_check' apex-build-orchestrator.md     # >=2
# truncation is a FIELD, not a promise: both result tags carry it, and the caps prose points at it
cd ~/.claude/agents && grep -c '"truncated": \["<field name>", "..."\]' apex-build-orchestrator.md   # 2
cd ~/.claude/agents && grep -c 'Which fields were cut is a' apex-build-orchestrator.md              # 1
cd ~/.claude/agents && grep -c 'naming exactly the fields the host cut' apex-build-orchestrator.md  # 1
cd ~/.claude/agents && grep -c 'empty when nothing was cut' apex-build-orchestrator.md              # 1
cd ~/.claude/agents && grep -c 'adds no' apex-build-orchestrator.md                                  # 1 (pending_events[] is verbatim)
```

- [ ] **Task 1** — a spec-scoped adjudication is representable (`task_id: null`) → verify:

```
cd ~/.claude/agents && grep -c 'or null for a spec-scoped directive' apex-build-orchestrator.md   # 1 (the adjudication shape)
cd ~/.claude/agents && grep -ci 'spec-scoped directive' apex-build-orchestrator.md                # 2 (shape + the rules sentence)
cd ~/.claude/agents && grep -c "matches the spec's task numbering, or is \`null\` for a" apex-build-orchestrator.md   # 1
```

- [ ] **Task 1** — the close-out ordering matches apex-code's live contract, with the product/technical docs-agent split explicit → verify:

```
cd ~/.claude/agents && grep -c '## Close-out ordering' apex-build-orchestrator.md      # 1
cd ~/.claude/agents && grep -ci 'reviewer runs first' apex-build-orchestrator.md       # >=1
cd ~/.claude/agents && grep -ci 'before the spec is archived' apex-build-orchestrator.md   # >=1
cd ~/.claude/agents && for a in request_review run_docs_agents run_family_gate complete; do grep -c "$a" apex-build-orchestrator.md; done   # each >=2
cd ~/.claude/agents && grep -c 'request_review` → `run_docs_agents` → `run_family_gate` → `complete' apex-build-orchestrator.md   # 1
cd ~/.claude/agents && grep -c 'run_docs_agents` dispatches the PRODUCT docs agent only' apex-build-orchestrator.md   # 1
cd ~/.claude/agents && grep -c 'apex-docs-product-agent' apex-build-orchestrator.md    # >=2
cd ~/.claude/agents && grep -c 'apex-docs-technical-agent' apex-build-orchestrator.md  # >=2
cd ~/.claude/agents && grep -c 'ListObligations' apex-build-orchestrator.md            # >=2
cd ~/.claude/agents && grep -ci 'archives the spec' apex-build-orchestrator.md         # >=1
```

- [ ] **Task 1** — close-out progress is persisted so a resumed instance re-enters at the right rung → verify:

```
# the FENCED build-state field is canonical and carries the unspaced token; the § Close-out prose
# deliberately spaces its separators, so the unspaced form must appear exactly ONCE
cd ~/.claude/agents && grep -c 'build|review|docs|family_gate|archive' apex-build-orchestrator.md   # 1
cd ~/.claude/agents && grep -c 'build | review | docs | family_gate | archive' apex-build-orchestrator.md   # 1 (the prose form)
cd ~/.claude/agents && grep -ci 'never emit a directive for a rung earlier' apex-build-orchestrator.md   # 1
```

- [ ] **Task 1** — the two-tree fields are present and per-repo integration is stated → verify:

```
cd ~/.claude/agents && grep -c '"repos": {' apex-build-orchestrator.md          # 1
cd ~/.claude/agents && grep -c 'verify_contract' apex-build-orchestrator.md     # >=2
cd ~/.claude/agents && grep -c '"base_sha": "<sha this task' apex-build-orchestrator.md   # 1
cd ~/.claude/agents && grep -ci 'per-repo integration steps' apex-build-orchestrator.md   # >=1
```

- [ ] **Task 1** — the extended action enum and its preconditions are present, and exit 75 routes to `queue` not `request_verify` → verify:

```
cd ~/.claude/agents && for a in queue adopt request_abandon request_confirmation request_review; do grep -c "$a" apex-build-orchestrator.md; done   # each >=2
cd ~/.claude/agents && grep -c '75 → `queue`' apex-build-orchestrator.md              # 1
cd ~/.claude/agents && grep -ci 'never .request_verify' apex-build-orchestrator.md    # >=1
cd ~/.claude/agents && grep -c '`-Attended`' apex-build-orchestrator.md               # >=1 (the wrapper's abandon gate is named)
cd ~/.claude/agents && grep -czoi 'host executes it \*\*only when[[:space:]]*attended\*\*' apex-build-orchestrator.md   # matches (wrap-tolerant)
cd ~/.claude/agents && grep -c 'params.run_id' apex-build-orchestrator.md             # >=2 (adopt and request_abandon both require it)
cd ~/.claude/agents && grep -c '"run_id": "<required for adopt and request_abandon' apex-build-orchestrator.md   # 1
```

- [ ] **Task 1** — both live-worker codes (75 and 124) are carried as refusals and route to `queue` → verify:

```
cd ~/.claude/agents && grep -cE '^\| 75 \| fail \| `call-died-coder-alive` \| refusal \|$' apex-build-orchestrator.md   # 1
cd ~/.claude/agents && grep -cE '^\| 124 \| fail \| `watchdog-no-output` \| refusal \|$' apex-build-orchestrator.md     # 1
cd ~/.claude/agents && grep -cE '^\| (75|124) \|.*dispatch_result' apex-build-orchestrator.md   # 0
cd ~/.claude/agents && grep -c '124 → `queue`' apex-build-orchestrator.md                       # 1
cd ~/.claude/agents && grep -ci 'leaves the child ALIVE' apex-build-orchestrator.md             # 1
# tag partition: 8 dispatch_result rows (0,65,66,67,68,69,73,77) + 12 refusal rows = 20
cd ~/.claude/agents && grep -cE '^\| [0-9]+ \|.*\| dispatch_result \|$' apex-build-orchestrator.md   # 8
cd ~/.claude/agents && grep -cE '^\| [0-9]+ \|.*\| refusal \|$' apex-build-orchestrator.md           # 12
```

- [ ] **Task 1** — the forced default actions match the canonical routing, including 79's re-queue trap and 76's confirmable / never-confirmable split → verify:

```
cd ~/.claude/agents && grep -c '75 → `queue`' apex-build-orchestrator.md                          # 1
cd ~/.claude/agents && grep -c '79 → `queue`' apex-build-orchestrator.md                          # 1
cd ~/.claude/agents && grep -c '124 → `queue`' apex-build-orchestrator.md                         # 1
cd ~/.claude/agents && grep -c '83 → `request_confirmation` attended' apex-build-orchestrator.md   # 1
cd ~/.claude/agents && grep -c '76 and 83' apex-build-orchestrator.md                             # 0 (the merged forced rule is gone)
cd ~/.claude/agents && grep -ci 'an unchanged capacity config' apex-build-orchestrator.md         # 1
cd ~/.claude/agents && grep -ci 'permanent until a human edits the frontmatter' apex-build-orchestrator.md   # 1
cd ~/.claude/agents && grep -ci 'never-confirmable' apex-build-orchestrator.md                    # 1
cd ~/.claude/agents && grep -c 'AFK, 76 → `park` always' apex-build-orchestrator.md               # 1
cd ~/.claude/agents && grep -ci 'the dispatch to drop the offending path' apex-build-orchestrator.md   # 1
cd ~/.claude/agents && grep -ci 'CriticalFilesConfirmed' apex-build-orchestrator.md               # >=1
```

- [ ] **Task 1** — `request_abandon` names where its identifier comes from AND what that identifier refers to → verify:

```
cd ~/.claude/agents && grep -c "taken verbatim from the \`run_id\` of the triggering \`refusal\` event" apex-build-orchestrator.md   # 1
cd ~/.claude/agents && grep -ci "prints the BLOCKING unresolved row's id" apex-build-orchestrator.md   # 1
cd ~/.claude/agents && grep -ci "never this attempt's own run" apex-build-orchestrator.md      # 1
cd ~/.claude/agents && grep -ci 'never reconstruct the id' apex-build-orchestrator.md          # 1
cd ~/.claude/agents && grep -c 'copied from the triggering event' apex-build-orchestrator.md   # 1
```

- [ ] **Task 1** — the channel rule is keyed on attendance, with no surviving duration-only rule → verify:

```
cd ~/.claude/agents && grep -c 'keyed on ATTENDANCE' apex-build-orchestrator.md              # 1
cd ~/.claude/agents && grep -ci 'attended + long' apex-build-orchestrator.md                 # >=1
cd ~/.claude/agents && grep -ci 'harness-owned channel' apex-build-orchestrator.md           # >=1
cd ~/.claude/agents && grep -ci 'migrates to' apex-build-orchestrator.md                     # >=1 (the honest AFK note)
cd ~/.claude/agents && grep -ci 'never enters an' apex-build-orchestrator.md                 # 1 (ADR-029 other half)
cd ~/.claude/agents && grep -ci 'never infer it from duration' apex-build-orchestrator.md    # 1
cd ~/.claude/agents && grep -ci 'foreground-equivalent' apex-build-orchestrator.md           # 0
# the detached MECHANISM matches the newest evidence: runner script → background task → marker → Monitor
cd ~/.claude/agents && grep -c 'runner script' apex-build-orchestrator.md                    # 1
cd ~/.claude/agents && grep -c 'normal background task' apex-build-orchestrator.md           # 1
cd ~/.claude/agents && grep -c 'completion marker file' apex-build-orchestrator.md           # 1
cd ~/.claude/agents && grep -c 'Monitor' apex-build-orchestrator.md                          # 1
cd ~/.claude/agents && grep -c 'Start-Process' apex-build-orchestrator.md                    # 0 (direct detachment is classifier-blocked; it is never the mechanism)
cd ~/.claude/agents && grep -c 'classifier-blocked' apex-build-orchestrator.md               # 1
```

- [ ] **Task 1** — the D6 close-out exception is stated on the off-list refusal rule → verify:

```
cd ~/.claude/agents && grep -ci 'one exception to that last rule' apex-build-orchestrator.md   # 1
cd ~/.claude/agents && grep -c 'docs/changes/done/' apex-build-orchestrator.md                 # >=1
```

- [ ] **Task 1** — the D1-EXCEPTION row schema is defined and excluded from selection → verify:

```
cd ~/.claude/agents && grep -c '"row_kind": "exception"' apex-build-orchestrator.md   # 1
cd ~/.claude/agents && for f in '"ts"' '"reason"' '"scope"' '"operator"'; do grep -c "$f" apex-build-orchestrator.md; done   # each >=1
cd ~/.claude/agents && grep -c 'lease_close' apex-build-orchestrator.md               # >=1 (cross-reference)
cd ~/.claude/agents && grep -ci 'excluded from build-row selection' apex-build-orchestrator.md   # 1
```

- [ ] **Task 1** — a fixture exception row parses and is rejected by the selection rule → verify: write the schema's example row to a scratch file, parse it (`ConvertFrom-Json`), and confirm it has all four fields plus `row_kind: exception`, and that a `row_kind`-filtered selection over a fixture ledger containing that row plus one real build row returns only the build row.
- [ ] **Task 1** — "raw" is defined once and the definition is pointed at from the build skill → verify:

```
cd ~/.claude/agents && grep -ci 'raw.*means the bounded fixed result fields' apex-build-orchestrator.md   # 1
cd ~/.claude && grep -ci 'never a transcript or a whole log' skills/apex-code/SKILL.md                     # 1
```

- [ ] **Task 1** — the build-state block is enumerated field by field, and unadjudicated events are an ORDERED LIST carried verbatim, not a single slot → verify:

```
cd ~/.claude/agents && for f in spec_digest completed_waves integration_state pending_waves base_sha run_ids phase refusal_history nudge_count pending_events; do grep -c "$f" apex-build-orchestrator.md; done   # each >=1
cd ~/.claude/agents && grep -c 'pending_events\[\]' apex-build-orchestrator.md          # >=1 (plural, list-valued)
cd ~/.claude/agents && grep -ci 'an ORDERED LIST of every event' apex-build-orchestrator.md   # 1
cd ~/.claude/agents && grep -ci 'in arrival order' apex-build-orchestrator.md           # 1
cd ~/.claude/agents && grep -ci 'It is a list, not a single slot' apex-build-orchestrator.md   # 1
cd ~/.claude/agents && grep -ci 'carried \*\*verbatim\*\*' apex-build-orchestrator.md   # 1
```

- [ ] **Task 1** — the exit-code translation table is complete and maps only to the five verdicts → verify:

```
cd ~/.claude/agents && for c in '| 0 |' '| 65 |' '| 66 |' '| 67 |' '| 68 |' '| 69 |' '| 71 |' '| 72 |' '| 73 |' '| 74 |' '| 75 |' '| 76 |' '| 77 |' '| 78 |' '| 79 |' '| 80 |' '| 81 |' '| 82 |' '| 83 |' '| 124 |'; do grep -c -- "$c" apex-build-orchestrator.md; done   # each 1
cd ~/.claude/agents && grep -cE '^\| (0|6[5-9]|7[1-9]|8[0-3]|124) \| (pass|fail|blocked|void|out_of_scope) \| `[a-z0-9-]+` \| (dispatch_result|refusal) \|$' apex-build-orchestrator.md   # 20
cd ~/.claude/agents && grep -cE '^\| 79 \| fail \| `at-capacity-no-lease` \| refusal \|$' apex-build-orchestrator.md   # 1 (79 is inside the range, not skipped)
cd ~/.claude/agents && grep -c 'unmapped-exit-' apex-build-orchestrator.md   # >=1
```

- [ ] **Task 1** — the adjudication params carry the redispatch target, and the host's structural validation is stated as mechanics → verify:

```
cd ~/.claude/agents && grep -c '"worktree": "<absolute path for a redispatch, else null>"' apex-build-orchestrator.md   # 1
cd ~/.claude/agents && grep -c '"channel": "detached|background|foreground"' apex-build-orchestrator.md   # 2
cd ~/.claude/agents && grep -ci 'cap arithmetic' apex-build-orchestrator.md        # >=1
cd ~/.claude/agents && grep -ci 'file-disjointness' apex-build-orchestrator.md     # >=1
cd ~/.claude/agents && grep -ci 'mechanics, not judgment' apex-build-orchestrator.md   # 1
# check (c): the authorized set must be a SUBSET of the spec's Files to Change
cd ~/.claude/agents && grep -c 'authorized ⊆ spec' apex-build-orchestrator.md      # 1
cd ~/.claude/agents && grep -c 'must be a SUBSET of the paths' apex-build-orchestrator.md   # 1
cd ~/.claude/agents && grep -c 'structural-authorized-outside-spec' apex-build-orchestrator.md   # 2 (the named set + check (c))
cd ~/.claude/agents && grep -c 'set inclusion' apex-build-orchestrator.md          # 1
```

- [ ] **Task 1** — recovery is a named mechanism with both attendance branches → verify:

```
cd ~/.claude/agents && grep -c 'SendMessage' apex-build-orchestrator.md       # >=1
cd ~/.claude/agents && grep -c 'D1-EXCEPTION' apex-build-orchestrator.md      # >=1
cd ~/.claude/agents && grep -ci 'park and surface' apex-build-orchestrator.md # >=1
cd ~/.claude/agents && grep -c 'ADR-042' apex-build-orchestrator.md           # >=1
cd ~/.claude/agents && grep -ci 'proven pipeline step' apex-build-orchestrator.md   # 0
# the exception row names its WRITER: the mutex-guarded helper, never a bare append
cd ~/.claude/agents && grep -c 'apex-ledger-append.ps1' apex-build-orchestrator.md            # 1
cd ~/.claude/agents && grep -c 'hooks/apex-ledger-append.ps1' apex-build-orchestrator.md      # 1 (the path, not just the name)
cd ~/.claude/agents && grep -c 'LineBase64' apex-build-orchestrator.md                        # 1
cd ~/.claude/agents && grep -c 'Never a bare `Add-Content`' apex-build-orchestrator.md        # 1
cd ~/.claude/agents && grep -c 'bare' apex-build-orchestrator.md                              # 1 (both uses sit on one line)
cd ~/.claude/agents && grep -c 'ApexCodexRunLedger' apex-build-orchestrator.md                # 1
cd ~/.claude/agents && grep -c 'only attended' apex-build-orchestrator.md                     # 1
```

- [ ] **Task 1** — the contract points at the ADR-046 D8 teardown algorithm instead of restating it → verify:

```
cd ~/.claude && grep -c 'git worktree remove' agents/apex-build-orchestrator.md   # 0 (algorithm not restated)
cd ~/.claude && grep -c 'git branch -D' agents/apex-build-orchestrator.md         # 0
cd ~/.claude && grep -c 'D8' agents/apex-build-orchestrator.md                    # >=1 (pointer only)
```

- [ ] **Task 2** — the build route dispatches the agent, and the frontmatter `version` is strictly greater than its pre-build value → verify:

```
cd ~/.claude && grep -c 'apex-build-orchestrator' skills/apex-orchestrate/SKILL.md   # >=1
cd ~/.claude && grep -ci 'interim executor' skills/apex-orchestrate/SKILL.md         # 0
cd ~/.claude && grep -c 'Transitional' skills/apex-orchestrate/SKILL.md              # 0
cd ~/.claude && git diff -U0 -- skills/apex-orchestrate/SKILL.md | grep -c '^+version:'   # 1
```

- [ ] **Task 3** — the wave-analysis note names the agent, the untouched D6 clause survives, and the frontmatter `version` minor is bumped → verify:

```
cd ~/.claude && grep -ci 'interim executor' skills/apex-code/SKILL.md        # 0
cd ~/.claude && grep -c 'apex-build-orchestrator' skills/apex-code/SKILL.md  # >=1
cd ~/.claude && grep -c 'Interim mechanics' skills/apex-code/SKILL.md        # 1
cd ~/.claude && git diff -U0 -- skills/apex-code/SKILL.md | grep -c '^+version:'   # 1
```

- [ ] **Task 3** — the parent-side producing mechanism is stated, so the agent's bounded inputs have a named source → verify:

```
cd ~/.claude && grep -c 'assembles the bounded result events' skills/apex-code/SKILL.md   # 1
cd ~/.claude && grep -ci 'structural validation' skills/apex-code/SKILL.md                # >=1
cd ~/.claude && grep -c 'build-state block' skills/apex-code/SKILL.md                     # >=1
cd ~/.claude && grep -ci 'resumes the agent with it verbatim' skills/apex-code/SKILL.md   # 1
# the subset check is mirrored here, so both documents describe the same three-part validation
cd ~/.claude && grep -c 'the subset check that every task' skills/apex-code/SKILL.md      # 1
cd ~/.claude && grep -c 'Files to Change` (path-normalized)' skills/apex-code/SKILL.md    # 1
```

- [ ] **Task 4** — the channel doctrine is in place, the opening paragraph names the dispatched orchestrator, and the ADR-029 supervision gate keeps its own text with the attendance paragraph appended → verify:

```
cd ~/.claude/skills/apex-code/references && grep -c '## Dispatch channel' parallel-codex.md  # 1
cd ~/.claude/skills/apex-code/references && for p in 'runner script' 'background task' marker Monitor detached Version-pinned apex-build-orchestrator; do grep -c "$p" parallel-codex.md; done   # each >=1
cd ~/.claude/skills/apex-code/references && grep -c 'Start-Process' parallel-codex.md        # 1 (named ONLY to record that it is classifier-blocked — never as the mechanism)
cd ~/.claude/skills/apex-code/references && grep -c 'classifier-blocked' parallel-codex.md   # 1
cd ~/.claude/skills/apex-code/references && grep -c '## Supervision gate — parallel-safe is not parallel-eligible' parallel-codex.md   # 1 (ADR-029 section still present)
cd ~/.claude/skills/apex-code/references && grep -c 'Channel under this gate (owner ruling, 2026-07-31)' parallel-codex.md   # 1 (appended paragraph)
cd ~/.claude/skills/apex-code/references && grep -ci 'keyed on \*\*attendance\*\*' parallel-codex.md   # >=1
cd ~/.claude/skills/apex-code/references && grep -ci 'never enters an unattended pool' parallel-codex.md   # 1 (gate's other half intact)
cd ~/.claude/skills/apex-code/references && grep -ci 'harness-owned' parallel-codex.md              # >=2 (unattended channel, both sections)
cd ~/.claude/skills/apex-code/references && grep -ci 'foreground-equivalent' parallel-codex.md      # 0 (superseded precedence wording is gone)
cd ~/.claude/skills/apex-code/references && grep -c 'run_in_background' parallel-codex.md    # 1
cd ~/.claude/skills/apex-code/references && grep -c 'Launch every task in the sub-wave' parallel-codex.md   # 0
```

- [ ] **Task 5** — the sweep is complete across both trees, with no residual anywhere → verify:

```
# --exclude-dir=fixtures: skills/apex-code/scripts/fixtures/spec-corpus/ is a tracked HISTORICAL
# test corpus (16 'interim executor' lines), never edited and out of this spec's scope
cd ~/.claude && grep -rn --include="*.md" --exclude-dir=fixtures -io "interim executor" skills agents hooks workflows   # 0 hits
cd ~/.claude && grep -rnz --include="*.md" --exclude-dir=fixtures -i "interim: *the" skills agents                      # 0 hits (-z spans line wraps)
cd ~/.claude && grep -rn --include="*.md" --exclude-dir=fixtures "apex-build-orchestrator" skills agents                # >=7 files
# apex tree: derived form — ADR-045/046 RETAIN annotated historical occurrences, so require annotation, not absence
cd ~/apex && grep -rn --include="*.md" -i "interim executor" docs/technical *.md | grep -civE 'retired|superseded'   # 0
cd ~/apex && grep -rn --include="*.md" -i "interim" docs/technical/architecture                  # 0 hits
```

- [ ] **Task 5** — the governance body is untouched: the file's diff shows exactly one changed line and that line is the frontmatter `version` → verify:

```
cd ~/.claude && git diff -U0 -- skills/apex-governance/SKILL.md | grep -c '^+version:'   # 1
cd ~/.claude && git diff --numstat -- skills/apex-governance/SKILL.md                    # 1 added, 1 deleted
```

- [ ] **Task 6** — both ADRs record the activation and neither still asserts an in-force D1 interim arrangement → verify:

```
cd ~/apex/docs/technical/adr && grep -ci 'interim executor retired' ADR-046-doctrine-audit-resolutions.md   # 1
cd ~/apex/docs/technical/adr && grep -c 'D1-EXCEPTION' ADR-046-doctrine-audit-resolutions.md                # >=1
cd ~/apex/docs/technical/adr && grep -c "row_kind:'exception'" ADR-046-doctrine-audit-resolutions.md        # >=1
cd ~/apex/docs/technical/adr && grep -ci 'structural validation' ADR-046-doctrine-audit-resolutions.md      # >=1
cd ~/apex/docs/technical/adr && grep -ci 'keyed on attendance' ADR-046-doctrine-audit-resolutions.md        # 1
cd ~/apex/docs/technical/adr && grep -c '2026-07-31' ADR-046-doctrine-audit-resolutions.md                  # >=1 (the owner ruling is dated)
cd ~/apex/docs/technical/adr && grep -c 'apex-build-orchestrator' ADR-045-four-role-split.md                # >=1
cd ~/apex/docs/technical/adr && grep -ci 'until the orchestrator' ADR-045-four-role-split.md                # 0
cd ~/apex/docs/technical/adr && grep -ciE 'superseded|no longer in force' ADR-045-four-role-split.md        # >=1
```

- [ ] **Task 6** — the ADR-046 zero-hit check is the DERIVED form: every surviving `interim executor` occurrence is annotated, none is bare → verify (a flat zero-hit grep is wrong here — the amendment heading and the retained historical paragraph both legitimately contain the phrase):

```
# every line carrying the phrase must also carry an annotation token
cd ~/apex/docs/technical/adr && grep -in 'interim executor' ADR-046-doctrine-audit-resolutions.md | grep -civE 'retired|superseded'   # 0
cd ~/apex/docs/technical/adr && grep -c '**Superseded —' ADR-046-doctrine-audit-resolutions.md   # >=1
cd ~/apex/docs/technical/adr && grep -ci 'until the build-orchestrator agent contract ships' ADR-046-doctrine-audit-resolutions.md   # 1 (historical text retained, not deleted)
```

- [ ] **Task 6** — ADR-041 gets a banner, not a rewrite → verify:

```
cd ~/apex/docs/technical/adr && grep -c 'the host adjudicates — clearing a 65' ADR-041-wrapper-hardening-scope-cap-pin.md   # 1 (original wording intact)
cd ~/apex/docs/technical/adr && grep -c '**Annotation (' ADR-041-wrapper-hardening-scope-cap-pin.md                         # 1
cd ~/apex/docs/technical/adr && grep -c 'apex-build-orchestrator' ADR-041-wrapper-hardening-scope-cap-pin.md                # >=1
cd ~/apex && git diff --numstat -- docs/technical/adr/ADR-041-wrapper-hardening-scope-cap-pin.md   # 1 added, 0 deleted
```

- [ ] **Task 6** — ADR-044's Item 1 gets a banner, not a rewrite: the last adjudication consumer is annotated and its original sentence survives byte-for-byte → verify:

```
cd ~/apex/docs/technical/adr && grep -c 'the host must adjudicate before accepting the diff' ADR-044-round8-deferred-designs.md   # 1 (original wording intact)
cd ~/apex/docs/technical/adr && grep -c '**Annotation (' ADR-044-round8-deferred-designs.md          # 1
cd ~/apex/docs/technical/adr && grep -c 'apex-build-orchestrator' ADR-044-round8-deferred-designs.md # >=1
cd ~/apex/docs/technical/adr && grep -c 'Attended confirmation remains the recovery' ADR-044-round8-deferred-designs.md   # 1
cd ~/apex && git diff --numstat -- docs/technical/adr/ADR-044-round8-deferred-designs.md            # 1 added, 0 deleted
```

- [ ] **Task 7** — the double-write is consistent: the agents heading count matches six data rows, and the newest history row names the agent and cites all three sources → verify:

```
cd ~/apex && grep -c '## Agents (6)' SKILLS.md                    # 1
cd ~/apex && grep -c 'apex-build-orchestrator' SKILLS.md          # >=1
cd ~/apex && grep -c 'apex-build-orchestrator' SKILL-HISTORY.md   # >=1
# row count: data rows between the "## Agents (6)" heading and the next "## " heading, minus header+separator
cd ~/apex && awk '/^## Agents \(6\)/{f=1;next} /^## /{f=0} f&&/^\|/{n++} END{print n-2}' SKILLS.md   # 6
```

- [ ] **Task 7** — the recorded versions match the live frontmatter (no second bump), read from THIS spec's row as the newest row → verify: for each of `apex-code`, `apex-orchestrate`, `apex-governance`, and `apex-plan`, the version string in the newest history row equals that skill's live frontmatter `version`.
- [ ] **Task 7** — the race branch, if it fired, moved the row rather than duplicating it → verify: `grep -c 'apex-build-orchestrator' SKILL-HISTORY.md` is 1 across the whole file, that row is the first data row of the table, and no row from `retro-validator-versioning` or `adr032-predraft-architecture-pass` sits above it.
- [ ] **Task 8** — the real-codex confirmation ran to natural completion and is recorded: a `.final` was written, the ledger row is terminal (not `running`, `stalled`, or `killed`), the `--json` log ends on a complete final event rather than truncating mid-event, and the appended § Caveats bullet carries all seven recorded fields → verify:

```
# scope every field check to the APPENDED bullet, not the whole document
B="$SCRATCH/apex-t8-bullet.txt"   # session scratch dir, never the repo
# marker → next BLANK LINE (not marker → EOF), so this extract holds Task 8's bullet ALONE
cd ~/apex/docs/research && awk '/\*\*Real-codex confirmation/{f=1} f&&/^[[:space:]]*$/{exit} f' issue13-kill-ceiling-rootcause-2026-07-30.md > "$B"
grep -c 'Real-codex confirmation' "$B"                                    # 1
grep -c 'Real-codex foreground confirmation' "$B"                         # 0 (Task 8b's bullet is NOT in this extract)
for f in 'harness build' 'run id' 'duration' 'ledger status' 'final event' '.final' 'verdict'; do grep -ci -- "$f" "$B"; done   # each >=1
grep -c 'verdict: confirmed' "$B"                                          # 1 (re-opened is a blocker, not a pass)
# duration is a NUMERIC comparison against the ledger-derived value, not a presence test:
# D = (ended - started) in minutes, computed from that run_id's own ledger timestamps
awk 'match($0,/duration: *[0-9]+(\.[0-9]+)?/){d=substr($0,RSTART+10,RLENGTH-10)+0; print (d>=12) ? "PASS " d : "FAIL " d}' "$B"   # PASS
# and the recorded number must equal the ledger-derived D (bullet must not be hand-rounded upward)
```

- [ ] **Task 8** — the run itself passed its four mechanical checks → verify: the ledger row for that `run_id` has a terminal status (not `running`, `adopting`, `stalled`, or `killed`); the numeric difference `ended - started` on that row is **≥ 12.0 minutes** (computed, then compared — never eyeballed from the log); the `.final` file exists at the wrapper's reported path; and the last line of the `--json` log parses as a complete final agent event (not a truncated object).
- [ ] **Task 8** — the channel used matches the attendance rule → verify: the run was launched via the detached runner — a runner script started as a normal background task, a completion marker file, and a `Monitor` wait all exist for it, and no direct `Start-Process`/`schtasks` detachment was attempted — with the owner attended, which is what the rule assigns to an attended long dispatch; not a foreground call, and not an exception recorded anywhere.
- [ ] **Task 8b** — the plain-foreground confirmation ran to natural completion past the tool ceiling and is recorded: the harness MIGRATED the call rather than killing the process tree, a `.final` was written, the ledger row is terminal, the `--json` log ends on a complete final event, and the appended § Caveats bullet carries all seven recorded fields → verify:

```
# scope every field check to the 8b bullet ALONE, not to Task 8's bullet and not to the whole document
B="$SCRATCH/apex-t8b-bullet.txt"   # session scratch dir, never the repo
# marker → next BLANK LINE (not marker → EOF), so this extract holds Task 8b's bullet ALONE
cd ~/apex/docs/research && awk '/\*\*Real-codex foreground confirmation/{f=1} f&&/^[[:space:]]*$/{exit} f' issue13-kill-ceiling-rootcause-2026-07-30.md > "$B"
grep -c 'Real-codex foreground confirmation' "$B"                         # 1
for f in 'harness build' 'run id' 'duration' 'ledger status' 'final event' '.final' 'verdict'; do grep -ci -- "$f" "$B"; done   # each >=1
grep -c 'verdict: confirmed' "$B"                                          # 1 (re-opened is a blocker, not a pass)
grep -c 'verdict: re-opened' "$B"                                          # 0
# duration is a NUMERIC comparison against the ledger-derived value, not a presence test:
# D = (ended - started) in minutes, computed from that run_id's own ledger timestamps
awk 'match($0,/duration: *[0-9]+(\.[0-9]+)?/){d=substr($0,RSTART+10,RLENGTH-10)+0; print (d>=12) ? "PASS " d : "FAIL " d}' "$B"   # PASS
```

- [ ] **Task 8b** — the run itself passed its four mechanical checks on the foreground channel → verify: the ledger row for that `run_id` has a terminal status (not `running`, `adopting`, `stalled`, or `killed`); the numeric difference `ended - started` on that row is **≥ 12.0 minutes** (computed, then compared — never eyeballed); the `.final` file exists at the wrapper's reported path; and the last line of the `--json` log parses as a complete final agent event.
- [ ] **Task 8b** — the channel actually exercised was the harness-owned one → verify: NO runner script, NO background task, NO completion-marker file, and NO `Monitor` wait exist for this run — it was a plain foreground wrapper call, which is the only way the migration claim is tested rather than bypassed.
- [ ] **Task 8b** — the STOP condition is honoured → verify: if the process tree was killed at the ~10-minute ceiling instead of migrating, the appended bullet's seventh field reads `verdict: re-opened`, no `Real-codex foreground confirmation` bullet claims `confirmed`, and the spec is surfaced as BLOCKED with Task 4's `## Dispatch channel` unattended sentences and Task 1's § Channel unattended bullet listed as requiring revision. A `re-opened` outcome fails this task and blocks the spec; it never passes as a completion.
- [ ] **Task 11** — the two limit cells name the orchestrator and no other row moved → verify:

```
cd ~/apex && grep -ci 'host adjudication' docs/technical/harness-known-limits.md   # 0
cd ~/apex && grep -c 'ADR-046 D1' docs/technical/harness-known-limits.md           # 2
cd ~/apex && git diff --numstat -- docs/technical/harness-known-limits.md          # 2 added, 2 deleted
```

- [ ] **Task 8** — the version-pin caveat is carried forward into the dispatch-channel doctrine → verify:

```
cd ~/apex && grep -ci 'version-pinned' docs/research/issue13-kill-ceiling-rootcause-2026-07-30.md   # >=1
cd ~/.claude && grep -ci 'version-pinned' skills/apex-code/references/parallel-codex.md             # >=1
```

- [ ] **Task 9** — the wrapped § Wave plan clause is gone, the orchestrator phrasing is present, and exactly one version line changed → verify (the first check is multi-line-aware; a plain line-oriented grep for the sentence returns 0 whether or not the clause is present, so it cannot be used):

```
cd ~/.claude && grep -cz 'interim: *the[[:space:]]*host performs them as executor' skills/apex-plan/SKILL.md   # 0
cd ~/.claude && grep -cz 'orchestrator-owned' skills/apex-plan/SKILL.md                    # >=1
cd ~/.claude && grep -c 'apex-build-orchestrator' skills/apex-plan/SKILL.md                # >=1
cd ~/.claude && git diff -U0 -- skills/apex-plan/SKILL.md | grep -c '^+version:'           # 1
cd ~/.claude && grep -c 'dependencies are binding' skills/apex-plan/SKILL.md               # unchanged from pre-build
```

- [ ] **Task 9** — the single bump covers both apex-plan edits → verify: `model-routing.md` carries the Task 5 replacement, and `skills/apex-plan/SKILL.md` shows exactly one `version` change for the pair.
- [ ] **Task 10** — the architecture overview names the agent and carries no interim clause → verify:

```
cd ~/apex/docs/technical/architecture && grep -ci 'interim' overview.md                 # 0
cd ~/apex/docs/technical/architecture && grep -c 'apex-build-orchestrator' overview.md  # >=1
cd ~/apex/docs/technical/architecture && grep -c 'Build orchestrator (Opus 5)' overview.md   # 1 (bullet below left untouched)
```

- [ ] Whole spec — both trees verify green and no changed skill file exceeds its 500-line cap → verify: run each tree's own AGENTS.md `## Verify commands` recipe in that tree; both exit 0.

```
cd ~/.claude && wc -l skills/apex-*/SKILL.md | sort -rn | head -3   # each <=500
```

- [ ] Whole spec — no surviving blanket claim about refusal field presence, and no surviving pre/post-identity partition language, anywhere in the shipped surface; every prose statement defers to the referent table → verify (widened derived sweep — run it, do not spot-check remembered sites; each hit must either BE the table or point at it):

```
powershell -NoProfile -Command "Select-String -Path ~/.claude/agents/apex-build-orchestrator.md,~/.claude/skills/apex-code/SKILL.md,~/.claude/skills/apex-code/references/*.md -Pattern 'carr(y|ies) neither|neither run_id nor final|no run_id.*no final|pre-identity|post-identity|identity hoist|identity partition'"   # 0 matches
cd ~/.claude/agents && grep -c 'the referent table in § Inputs' apex-build-orchestrator.md   # 1 (the exit table defers)
cd ~/.claude/agents && grep -c "carries \`final: null\` always" apex-build-orchestrator.md   # 1
```

- [ ] Whole spec — the spec itself validates → verify: the validator `apex-spec-validate.ps1` exits 0 against this spec's promoted path.

## Progress
_(The build writes here — do not edit manually)_
