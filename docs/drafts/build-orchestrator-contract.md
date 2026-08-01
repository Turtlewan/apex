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
  - The host refuses any directive that crosses a hard block (integration-branch commit without the draft→show→approve exchange, push to main, teardown outside ADR-046 D8, an unconfirmed critical-path dispatch, an audit-directory write) or that fails the deterministic pre-launch structural validation — **cap arithmetic, file-disjointness, and `authorized` ⊆ `Files to Change`, all three** — and returns a refusal event instead of executing it.
  - No document in either tree describes the host as the build's in-force interim executor; a host takeover exists only as an attended, recorded D1-EXCEPTION.
  - The ADR-029 high-risk carve-out keeps its parallel-pool exclusion untouched — high-risk work never enters an unattended pool; only the process channel it runs on is restated, keyed on attendance (owner ruling, 2026-07-31), and nothing here widens the carve-out.
- **Non-goals:** any wrapper, script, hook, or settings change · restating the ADR-046 D8 teardown algorithm anywhere (pointer only) · the retro P1(a) capacity lease and every other wrapper-side item (owned by `retro-wrapper-hygiene`) · the D6 docs-agent permissions follow-up · a Codex-dispatching `apex-build-wave` workflow variant · every `apex-plan/SKILL.md` section except § Wave plan and its frontmatter version.

## Assumptions
- `retro-wrapper-hygiene` **has built and integrated (2026-08-01)**, so `apex-code/SKILL.md`, `references/parallel-codex.md`, `ADR-046-doctrine-audit-resolutions.md`, `SKILLS.md`, and `SKILL-HISTORY.md` carry its edits; this spec's amendment pass was re-grounded against that post-integration wrapper — the lease-before-gates ordering in `codex-dispatch.ps1` and the live `codex-completion-schema.json` / `codex-review-schema.json` shapes — and every anchor quoted in the task bodies is re-greped against the post-integration text before editing → impact: Stop
- The event shapes in Task 1 are **derived from the producer-surfaces research doc at docs/research/orchestrator-producer-surfaces-2026-08-01.md**, the complete producer-surface evidence pack read off the live post-`retro-wrapper-hygiene` tree. It is **planning evidence, not a build target**: a TRACKED research doc, git-committed at planning time (session close) by the host, so it is on disk and citable before this spec dispatches and it is deliberately absent from `## Files to Change` — no task creates or edits it. That file is the citable source for every field, enum, and exit in this spec; where a shape here and the pack disagree, the pack wins and this spec is the thing corrected. Its § A rows are pinned to that day's `codex-dispatch.ps1`. Because it is cited and never changed, every citation of it inside this spec's `## Acceptance Criteria`, `## Permissions`, and task `files:` segments is written as its **bare basename**, `orchestrator-producer-surfaces-2026-08-01.md`, with its directory named in words rather than joined to it — the validator's FILES-COMPLETENESS check classifies any whitespace-delimited token that carries BOTH a directory separator and a file extension as a file path, in plain prose exactly as inside a backtick span, and would then demand a `## Files to Change` row for a file this spec must not touch. The same rule applies to any other cited-but-untouched artifact (the ledger-append hook, for one) → impact: Stop
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

- [ ] **Task 1**: Create the orchestrator agent contract, exactly as the block below — files: C:\Users\User\.claude\agents\apex-build-orchestrator.md — done when: the file exists with frontmatter `name`, `description`, `tools: Read, Glob, Grep`, `model: opus`, and a body carrying the two output shapes, the **six** input event shapes, the enumerated build-state block, the exit-code translation table, the resume loop with its attendance-split recovery, the refusal contract including the host's structural validation and its structured-output enforcement, and the channel rule.

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
   field the tag does not guarantee. There are **six** kinds, below. Two of them carry a wrapper
   `exit_code`, and the same number means different things on each: a BUILD-phase exit arrives as a
   `dispatch_result`, the identical number from a REVIEW-phase dispatch arrives as a
   `reviewer_result`. The tag, not the code, tells you what you are holding. A sixth kind,
   `agent_result`, carries producers that have no exit code at all.

```json
{ "kind": "dispatch_result", "task_id": "3", "repo": "<repo root>", "exit_code": 0,
  "run_id": "<ledger run_id — REQUIRED>",
  "log_path": "<dispatch log path from the ledger row>",
  "status": "<the ledger row's terminal status, verbatim — incl. adopted-* and +scope<N> forms>",
  "scope_violation": true|false,
  "encoding_violation": true|false,
  "critical_violation": true|false|null,
  "tree_moved_flag": true|false,
  "final": { "status": "done|done_with_concerns|blocked", "changed_files": ["..."],
             "commands_run": [ { "command": "<the command as run>",
                                 "result": "pass|fail|not_run",
                                 "detail": "<string, or null>" } ],
             "deviations": ["..."], "unresolved": ["..."],
             "blocker": "<string, or null>" }|null,
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

**`final` is `<completion-schema object, or null>`.** It is null EXACTLY when no `.final` report
exists, which is three cases and no fourth:

1. **A pre-launch tree-moved exit 69** — the wrapper refused before the coder ran, so no report was
   ever written.
2. **An adoption that found no report** — the `adopted-blocked` status: the run was recovered, but
   there was no `.final` on disk to recover with it.
3. **Abandon success** — `-AbandonRunId` prints the closed ledger row instead of a report, and the
   event reaches you as a `dispatch_result` with `status: "abandoned-unadopted"`, `exit_code: 0`, and
   `final: null`. That is the carrier for a successful abandon; it is not a `refusal`.

**When `final` is null, `status` is the authority** — adjudicate on the ledger row's terminal string.
A null `final` is never "the build produced nothing to judge".

**The four violation flags are independent facts, and the exit code hides three of them.** The
wrapper records `scope_violation`, `encoding_violation`, `critical_violation` and `tree_moved_flag` in
the ledger row **unconditionally**, whichever condition won the exit code. The exit is chosen by a
single precedence chain — **67 > 69 > 66 > 65 > 77 > 73 > 68** — so an exit **67 masks a simultaneous
scope, encoding, or critical violation**: the code says "blocked", the row says "blocked AND out of
scope". **Read all four flags on EVERY `dispatch_result`, whatever the exit code says.** A tree that
is both blocked and scope-violating is not merely blocked, and routing it as a plain 67 accepts a
violation. `critical_violation` is `null`, not `false`, on a read-only or review row — the wrapper
records that field only on build rows with workspace write access, so `null` means "not applicable",
never "clean".

`status` is the ledger row's own terminal string, not a restatement of the exit: `done` ·
`done_with_concerns` · `blocked` · `failed` · `abandoned-unadopted` · `adopted-void` ·
`adopted-done` · `adopted-done_with_concerns` · `adopted-blocked`, where an adopted row may carry a
`+scope<N>` suffix (`adopted-done+scope65`). Match it as a prefix, never by equality against the bare
nine. An `adopted-*` status means the work was recovered through the wrapper's adoption path and its
verdict re-derived — adjudicate it exactly as you would the equivalent fresh build outcome.

`run_id` and `log_path` reach you **from the ledger row, not from the wrapper's stdout**: the
completion path prints only `[dispatch] report: <final_path>` (plus a concerns line and a banner) and
never prints either identifier. The host matches the row by worktree, spec, and task to fill them.
That is why you must never invent, reconstruct, or infer a `run_id` — there is no text on stdout it
could have been read from.

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
  "reviewer": "apex-reviewer|apex-wave-reviewer|codex-review|opus-endgate|human",
  "family": "anthropic|openai|human",
  "exit_code": 0|67|68|69|null,
  "tree_moved": true|false,
  "reviewed_run_id": "<run_id the review covers>",
  "result": "<the producer's own return, VERBATIM — the sub-shape keyed by `reviewer`, below>",
  "truncated": ["<field name>", "..."] }
```

**There is no common verdict field, because there is no producer that emits one.** Read `reviewer`
first, then the matching sub-shape. Each carries its producer's fields **exactly as that producer
emits them** — different key names, different enums, different types. The host does not translate
them, and neither should you expect it to. The derivation and its citations live in
`~/apex/docs/research/orchestrator-producer-surfaces-2026-08-01.md` § B.

`reviewer: "apex-reviewer"` — the Claude-side post-build reviewer. Top-level key is `status`, not
`verdict`:

```json
"result": { "status": "clean|findings",
            "findings": [ { "type": "missed_requirement|bug|risky_pattern|spec_divergence",
                            "severity": "low|medium|high",
                            "file": "<path>", "description": "<string>",
                            "suggestion": "<string>" } ] }
```

`reviewer: "apex-wave-reviewer"` — the high-risk wave reviewer. It returns **plain text, not JSON**,
carried verbatim in one string:

```json
"result": { "text": "VERDICT: BLOCK|FLAG|CLEAN, then a FINDINGS: block of [BLOCK] {file}:{line} — {what} — {evidence} lines; a CLEAN result is the single line VERDICT: CLEAN and nothing else" }
```

`reviewer: "codex-review"` — the cross-family reviewer, and the **only** one dispatched through the
wrapper. This sub-shape mirrors `codex-review-schema.json`:

```json
"result": { "verdict": "BLOCK|FLAG|CLEAN",
            "findings": [ { "severity": "BLOCK|FLAG|CLEAN", "file": "<path>",
                            "line": "<integer, or null>",
                            "criterion": "<criterion this finding is cited to, or null>",
                            "rationale": "<=200 chars" } ] }
```

`reviewer: "opus-endgate"` — the mandatory AFK end-of-run adversarial pass.
`~/.claude/skills/apex-code/references/afk-endgate.md` is canonical for it and this file does not
restate it. Its `verdict` is **free text, not an enum**, and its third severity class is literally the
lowercase word `note`, never `P3`:

```json
"result": { "verdict": "<free text — NOT an enum>",
            "findings": [ { "severity": "P1|P2|note", "issue": "<string>",
                            "file": "<path>", "why": "<string>" } ] }
```

`reviewer: "human"` — an attended human review:

```json
"result": { "verdict": "<free text>", "notes": "<string, or null>" }
```

**Adjudication guidance — for your verdicts, never for rewriting a field.** When you weigh findings
across these vocabularies, treat **`high` / `BLOCK` / `P1`** as blocking, **`medium` / `FLAG` / `P2`**
as concerns, and **`low` / a `CLEAN`-severity finding / `note`** as informational. That is how to
reason, not a mapping anyone applies to the data: the fields keep their producer's names and values
all the way to you, and you must quote them in that form when you cite one. Never record a
translated severity as if the producer emitted it. A P1 in particular is a production bug that
`apex-code` routes through fix-and-reverify before the handoff — treat it as blocking and never emit
`run_family_gate` over an unresolved end-gate P1.

At most **<=30 findings** reach you per event; the host truncates beyond that and names `result` in
`truncated` when it does.

**`exit_code` applies ONLY to `reviewer: "codex-review"`.** That is the one reviewer
that runs through the wrapper, so it is the one that has an exit code: **67** BLOCK · **68** FLAG, or
CLEAN carrying findings · **0** CLEAN with zero findings · **69** the tree moved — and its `.final`
uses the **REVIEW** schema, not the completion schema. A `-Phase review` dispatch is forced read-only,
so 65, 66, 73 and 77 are **structurally unreachable** there; a review that returns an unrecognized
verdict exits 67. Every **agent** reviewer — `apex-reviewer`, `apex-wave-reviewer`, `opus-endgate`,
`human` — carries **`exit_code: null`**: no wrapper ran, so there is no code to read. That is why the
enum on this tag is `0|67|68|69|null`, with `null` covering all four agent-dispatched kinds.

**`tree_moved` applies to ALL reviewer kinds — agent reviewers included — and is never forced false.**
The host pins the tree before it opens ANY review gate and pin-verifies when that gate closes
(`apex-code/SKILL.md:323`), so an agent reviewer's verdict can be voided by a moved pin exactly as a
wrapper reviewer's can. An agent-reviewer result whose pin moved therefore arrives with
`tree_moved: true` and adjudicates **`void` → `request_verify`** (re-pin, re-run the review) — the same
adjudication a build-phase 69 gets, reached without any exit code at all. Where an exit code does
exist, `tree_moved: true` simply restates exit 69.

```json
{ "kind": "agent_result", "task_id": "3|null", "repo": "<repo root>",
  "agent": "apex-coder|apex-docs-product-agent|apex-docs-technical-agent",
  "run_id": "<the in-session ledger run_id for apex-coder; null for both docs agents>",
  "result": "<the agent's own return, VERBATIM — the sub-shape keyed by `agent`, below>",
  "truncated": ["<field name>", "..."] }
```

**`agent_result` is how every producer that has no exit code reaches you.** These agents run as
subagents, not through the wrapper: there is no `.final`, no wrapper ledger row, and no exit code, so
none of them can arrive as a `dispatch_result` and none of them enters the exit-code table.

`agent: "apex-coder"` — the Sonnet fallback coder:

```json
"result": { "files_changed": ["..."],
            "task_summaries": [ { "task": "N", "status": "done|blocked",
                                  "files": ["..."], "summary": "<string>" } ],
            "decisions": [ { "task": "<id>", "decision": "<string>", "reason": "<string>",
                             "review_needed": true|false } ],
            "blocked_actions": [ { "action": "<string>", "task": "<id>",
                                   "reason": "<string>" } ] }
```

A fallback build still has a run identity: the host appends an **in-session ledger row** for it —
fresh `run_id`, `phase` build, `builder_family` `anthropic`, `end_tree_digest` from the tree-pin
helper's `-Digest` mode or the literal `unverifiable` — and **that** `run_id` is what `agent_result`
carries, what a later review cites in `reviewed_run_id`, and what the family gate selects on. Treat a
`task_summaries[].status` of `blocked` as you would a build `blocked`, and read `decisions` and
`blocked_actions` the way you read `deviations` and `blocker` on a `.final`.

`agent: "apex-docs-product-agent"` — note the third status value:

```json
"result": { "status": "completed|completed_with_skips|failed",
            "inline_docs_added": ["..."], "changelog_updated": true|false,
            "readme_updated": true|false, "readme_section": "<string>",
            "skipped_off_scope": ["..."] }
```

`agent: "apex-docs-technical-agent"` — it returns **one free-text sentence**, not JSON, so it is
carried as a string and must never be parsed as an object:

```json
"result": { "text": "<the agent's single returned sentence, verbatim>" }
```

```json
{ "kind": "family_gate_result", "spec": "<spec-name>", "task_id": "3",
  "worktree_key": "<the worktree key the gate was invoked with>",
  "exit_code": 0|12|13,
  "detail": "<the gate's printed line; the EMPTY STRING on exit 0, because success is silent>" }
```

**The family gate is strictly PER-TASK.** `apex-family-gate.ps1` takes `-Spec`, `-Task` and
`-WorktreeKey` as **mandatory** parameters and vouches for the newest terminal-success build row
matching that triple. So `task_id` is **required on this tag** — there is no null option and no
spec-level invocation, because the script has no spec-level notion at all. Its three exits:
**0** vouched (a cross-family review row bound by `reviewed_run_id` with a matching tree digest, or an
attended human-review row) — and **exit 0 prints nothing**, so `detail` is the empty string, not a
success message; **12** a valid build row exists but no acceptable review is bound to it; **13** it
cannot vouch at all (ledger missing or malformed, no build row, the row is not terminal, or an
unknown `builder_family`), with the printed line naming which.

**A spec-level pass is a quantifier, not an event.** "The spec passed the family gate" means exactly:
the gate was invoked once for every task in the spec and **every** invocation exited 0. You may emit
`complete` only when a `family_gate_result` with `exit_code: 0` is recorded in the build-state block
for **every** task — one missing task is one unvouched task, and there is no aggregate result that
could tell you otherwise.

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

A `dispatch_result` always carries a `run_id`. Its `final`, by contrast, is
`<completion-schema object, or null>` — null in exactly the three cases listed with the
`dispatch_result` shape above, where `status` is the authority instead.

**`exit_code` is null on a host-generated refusal.** Not every refusal comes from the wrapper. Three
classes are produced by the host itself and never ran a wrapper, so there is no code to report and
`exit_code` is `null`: **host-policy refusals** (the hard-block directives in § Directives the host
will refuse), **structural-validation refusals** (cap arithmetic, wave file-disjointness, and the
authorized-outside-spec subset check), and **structured-output refusals** (your own last block failed
the host's deterministic validation — see § Directives the host will refuse). On those the `rule`
field carries a value from this small named set, and nothing else: `hard-block-commit-unapproved` ·
`hard-block-push-main` · `hard-block-merge` · `hard-block-teardown-outside-d8` ·
`hard-block-critical-unconfirmed` · `hard-block-audit-write` · `structural-cap` ·
`structural-disjointness` · `structural-authorized-outside-spec` · `structural-malformed-output`.
**Null-exit_code refusals never map through the exit table** —
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
facts. `agent_result` carries `truncated` on the same rule. `pending_events[]` in the build-state
block carries every event verbatim, so a resume adds no further truncation of its own.

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
worktree-relative, never absolute · one wave's tasks must be file-disjoint — no task's `authorized`
path equal to, an ancestor of, or a descendant of another task's, compared per-repo · a wave never exceeds
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
  attended**; AFK, the host returns a `refusal` and you `park`. **A SUCCESSFUL abandon comes back as a
  `dispatch_result`, not a refusal:** the wrapper prints the closed row rather than a report, so the
  event carries `status: "abandoned-unadopted"`, `exit_code: 0`, and `final: null`. That is
  `-AbandonRunId` success's carrier — read `status`, because there is no `.final` to read.
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
| 78 | fail | `review-digest-binding-refused` | refusal |
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
AFK · 69 → `request_verify` · 67 → `fork` or `park`, never `redispatch` unadjusted.
Everything else is yours.

**The four violation flags are verdict-INDEPENDENT obligations: they ADD to the exit verdict's
action, they never replace it.** On ANY `dispatch_result`, whatever the exit code says — a true
`scope_violation` adds the out-of-scope handling · a true `encoding_violation` adds the mojibake
handling · a `critical_violation` that is non-null TRUE (`null` means "not applicable", never
"clean") adds `request_confirmation` attended and `park` AFK · a true `tree_moved_flag` adds
`request_verify`. Each of those is emitted **in addition to** whatever the exit table's row already
required, so one event can owe two actions. **Exit 67 never absorbs them.** The precedence chain
picked 67 for the *code*; the ledger row still recorded every flag that fired, and a 67 carrying a
true `scope_violation` is a tree that is blocked AND out of scope, owing both responses.

**78 has no single forced action — route it by CAUSE.** Exit 78 is the review-digest binding refusal,
and it fires for three unrelated reasons that want three different responses. Read the refusal's
`detail`, then:

- **A bad or unknown `ReviewedRunId`** — the review named a run the ledger does not have, or named the
  wrong one. Correct the id and **re-dispatch the review**; `request_verify` here would re-run a build
  gate that was never in question.
- **The binding helper is unavailable** — the gate could not run at all. **`park` and surface it**:
  nothing you re-plan makes a missing helper present, and re-dispatching only burns the loop.
- **A digest mismatch, or an unverifiable digest** — the tree the review covers is not the tree on
  disk. **`request_verify`** (re-pin, then re-run), or route it to an **attended human-review row**,
  which `apex-code/SKILL.md:168` accepts as a vouching review in its own right.

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
`family_gate_results` (a map `task_id` → `exit_code`, one entry per task the gate has run on — this
is what `complete` is checked against) · `reviewer_results` (per task or per spec, the reviewer type
and its verdict-or-status **only**) · `docs_status` (the product agent's `status` value, and the
technical agent's `done|not_run`) · `rung_notes` (<=200 chars, what is part-done INSIDE the current
rung — which tasks of this rung are already gated, which review is outstanding) ·
`refusal_history[]` · `nudge_count` · **`pending_events[]`** — an ORDERED LIST of every event that
has not been adjudicated yet, each carried **verbatim** (its `kind`, exit code, verify tail, refusal
`rule` and `detail`), in arrival order. It is a list, not a single slot, because a wave can deliver
several results before an adjudication turn comes round. That last field is what makes a fresh
instance lossless: without it, the resume would drop exactly the results the previous turn was
mid-way through judging.

**The four summary fields stay bounded on purpose: verdicts, statuses and exit codes only, never a
findings body.** `family_gate_results`, `reviewer_results`, `docs_status` and `rung_notes` exist so a
fresh instance knows *which rungs are discharged*, not so it can re-adjudicate them. An unadjudicated
finding lives in `pending_events[]`, verbatim, until you judge it; once judged, only its outcome is
kept. Never copy finding text into the summary fields — that is how a build-state block grows without
bound across a long build. If a field you need is absent, say so in
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
{ "row_kind": "exception", "ts": "<utc-o>", "spec": "<the build's spec name>",
  "task_scope": "<the task ids this row covers, comma-separated — or the literal \"spec\">",
  "reason": "<why the takeover happened>",
  "scope": "<exactly what the host took over — spec, tasks, or one adjudication>",
  "operator": "<who was at the machine>",
  "resolution": "open|resolved" }
```

**Three of those seven fields are selectors, not prose.** `spec` is what the technical docs agent's
`build_exceptions` input selects on — it is handed exactly the rows whose `spec` matches the build
being closed, and no others. `task_scope` names the task ids the takeover covered, or the literal
`spec` for a spec-wide one. `resolution` is `open` while the taken-over adjudication is still
outstanding and `resolved` once it has been closed out, and it is what routes the row in the handoff:
`open` renders into **Blocked Actions**, `resolved` into **Decisions Made**.

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
`structural-cap`); (b) **file-disjointness** — within a wave, no task's `authorized` path may **EQUAL**,
be an **ANCESTOR** of, or be a **DESCENDANT** of another task's `authorized` path, so a directory and
a file inside it collide just as two identical paths do; the comparison is **per-repo**, so equal
relative paths in two different repos do NOT collide (rule `structural-disjointness`);
(c) **authorized ⊆ spec** — every task's `authorized` set
must be a SUBSET of the paths in the spec's `## Files to Change`, path-normalized before comparison
(`authorized` is worktree-relative, the spec's rows are absolute, so both are reduced to the same
repo-relative form first). A plan naming any path outside that table is refused with rule
`structural-authorized-outside-spec`. This is mechanics, not judgment: it is arithmetic, set
intersection, and set inclusion over the plan you emitted, with no discretion in it, so it neither
reads on your ownership nor substitutes for it. All three refuse as **null-`exit_code`** refusals
(§ Inputs), so the only responses are re-plan or `park`.

**Structured-output validation, on every turn you take.** Before acting on anything you emit, the host
validates the turn deterministically: **exactly one** fenced JSON block is present · it parses as
JSON · its `kind` is one of the two declared output kinds · every field that kind requires is present
· every enum-valued field holds a declared member · and there is **no unknown top-level field**.
**The fenced JSON shapes in this file are NORMATIVE, not illustrative:** the host checks each block
against the fenced shape declared for its `kind` — field presence, enum membership, and rejection of
unknown top-level keys — as deterministic mechanics read straight off this document, and no separate
schema artifact ships (that is an explicit non-goal). This file IS the schema. A
turn that fails any one of those checks is not executed. The host returns a **null-`exit_code`
refusal** with rule **`structural-malformed-output`** and `detail` naming which check failed, and asks
you once more. If the re-ask also fails validation, the build escalates to the **fresh-instance rung**
of the recovery ladder in § The loop — a new instance, same contract, same build-state block. This is
a parser, not a critic: it never reads your reasoning and never re-routes a decision, it only refuses
a turn it cannot mechanically execute. Emit one block, in shape, every time, and it never fires.

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

- [ ] **Task 2**: Switch the orchestrator skill's build route from interim execution to dispatching the agent: replace the `build · implement · execute · start build` route-table row with the row below, delete the `**Transitional (2026-07-29):**` paragraph entirely, leave the "Both dispatches are the ADR-045 role split" paragraph's mechanics sentence intact, and bump the frontmatter `version` minor **and set `last_updated` to the build date** — files: C:\Users\User\.claude\skills\apex-orchestrate\SKILL.md — done when: the file contains the new row verbatim, no `interim executor` string, no `Transitional` paragraph, and both the `version` and `last_updated` frontmatter lines changed.

```
| build · implement · execute · start build | **apex-code** — dispatch a `model: opus` **`apex-build-orchestrator`** (Opus 5; ADR-045 as amended) and give it the spec, the repo's `AGENTS.md` verify contract, and the live tree facts. It owns task selection, wave sequencing, dispatch parameters, exit-code routing, verify adjudication, retries, and integration order; you execute its wave plan as mechanics and return bounded results. |
```

- [ ] **Task 3**: Retire the interim clause in the build skill's wave-analysis ownership note — replace the `**Who does this (ADR-046 D1).**` paragraph with the text below, leave the two traps and the sequential-when-unsure rule untouched, and bump the frontmatter `version` minor **and set `last_updated` to the build date** — files: C:\Users\User\.claude\skills\apex-code\SKILL.md — done when: the paragraph reads as below, the file no longer contains `interim executor`, and both the `version` and `last_updated` frontmatter lines changed.

```
**Who does this (ADR-046 D1).** Wave grouping, dispatch sequencing, and completion routing are **orchestrator-owned** and are performed by the dispatched `apex-build-orchestrator` agent (`~/.claude/agents/apex-build-orchestrator.md`). The analysis below is what that agent applies; the host executes the resulting plan and returns bounded results. **"Raw results" throughout this skill means the bounded fixed result fields — exit code, `.final` fields, a bounded verify tail, porcelain output — unadjudicated; never a transcript or a whole log. The agent contract defines that set.** Producing them is host mechanics, in four parts: the host **assembles the bounded result events** from the wrapper's stdout, the `.final` report, and the run's ledger row, in the event shapes the agent contract declares — and because the wrapper's stdout prints neither, `run_id` and `log_path` are read from the ledger row, never scraped, along with the four violation flags the exit code can mask; it runs the deterministic pre-launch **structural validation** — cap arithmetic, wave file-disjointness (within a wave, no task's authorized path may EQUAL, be an ANCESTOR of, or be a DESCENDANT of another task's authorized path, compared per-repo, so equal relative paths in different repos do not collide), and the subset check that every task's `authorized` set lies inside the spec's `## Files to Change` (path-normalized) — over every wave plan the agent emits, and returns a refusal event instead of launching when a wave violates it; it runs a deterministic **structured-output validation** over every orchestrator turn (exactly one fenced JSON block, parseable, a known `kind`, all required fields present, every enum value declared, no unknown top-level field) and on failure returns a null-code refusal with rule `structural-malformed-output`, re-asks once, and then escalates to the fresh-instance rung rather than interpreting a malformed turn; and it persists the **build-state block** across turns and resumes the agent with it verbatim. None of the four is a judgement call, and none of them re-routes the agent's decision. **Serial does not exempt the channel:** for ANY attended-long dispatch — serial ones included — the host loads `references/parallel-codex.md` § Dispatch channel and follows the runner recipe there; that reference's 2+-task load trigger governs parallel WAVE mechanics, not this recipe, so a single long attended task loads it too.
```

- [ ] **Task 4**: In the parallel-dispatch reference, (a) rewrite the opening paragraph so the dispatched orchestrator is named as the owner, (b) add a `## Dispatch channel` section directly after the `## Isolation = git-worktree-per-task` block, both exactly as below, (c) delete the now-superseded paragraph that begins `Launch every task in the sub-wave with` — its wait-then-integrate rule, log-path rule, and observability pointer are all carried by the new section — and (d) append to the EXISTING `## Supervision gate — parallel-safe is not parallel-eligible` section, as its final paragraph, the attendance-key paragraph given below; leave that section's existing text, `## Cap`, `## Integrate`, `## Teardown`, `## Failure / fallback`, and the rest of the cross-spec half unchanged — files: C:\Users\User\.claude\skills\apex-code\references\parallel-codex.md — done when: the file names the dispatched orchestrator in its opening paragraph, carries the `## Dispatch channel` section and the supervision-gate paragraph verbatim, contains no `interim` D1 wording, and mentions `run_in_background` exactly once (inside the `background` bullet). **Precondition:** the foreground-migration claim the unattended half of this section rests on is the one **Task 8b** confirms, and Task 8b lands before this task in the wave plan — a `re-opened` verdict from Task 8b blocks this task until its unattended-channel sentences are revised. **The phrase `confirmed (see issue-13 § Caveats foreground bullet)` may be written here ONLY if Task 8b's appended bullet carries its eighth field — the harness's own migration notice, quoted verbatim.** That notice is the only observable proof the call migrated rather than merely finishing; without it "migrated" is an inference from the run having completed, which a run that never hit the ceiling would also satisfy. If field 8 is absent, treat Task 8b as `re-opened` regardless of what its seventh field says, and do not write the clause.

```
Load when a dependency (sub-)wave has **2+ independent `▸codex` tasks** and `max_parallel_codex > 1`.
The wave plan comes from the dispatched **`apex-build-orchestrator`** agent (`~/.claude/agents/apex-build-orchestrator.md`); the host runs the tasks as **concurrent `codex exec` subprocesses** — **as mechanics only**: launching and monitoring them strictly from that wave plan and returning status/exit codes to it. Task selection, sequencing, routing, verification, retries, and close-out are the orchestrator's (ADR-045 as amended 2026-07-29; ADR-046 D1).
```

````
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
  call to background instead of killing it — confirmed (see issue-13 § Caveats foreground bullet),
  not assumed, by a real >=12-minute plain
  foreground dispatch whose record sits under § Caveats of the evidence doc below — and it remains
  harness-owned and synchronously collected, so an unattended long run is safe here, and this is the
  right unattended choice rather than a fallback.
- **`background` — host-native `run_in_background`** on the wrapper invocation, for short attended
  dispatches where the host wants its turn free.

**Attendance, not duration, decides.** Attended + long → `detached` (owner supervises live).
Unattended → `foreground`, the harness-owned channel, at any duration. Attended + short →
`foreground` or `background`. Read the attendance flag; never infer the channel from a stopwatch.

### The detached recipe

**This is the recipe for EVERY attended long dispatch — serial ones included.** It is not a
parallel-wave device: a single long task dispatched on its own uses it unchanged, because what makes
it the right channel is attendance and duration, not how many tasks are in flight. Three parts, and
all three are required — a runner without a marker leaves the host with nothing to wait on.

**1. The runner script.** A small `.ps1` written to the scratch root (never into either repo) that
invokes the wrapper and then, unconditionally, writes the marker. Shape:

```powershell
# <scratch>/run-<spec>-<task>.ps1
& "<path to codex-dispatch.ps1>" -Spec <spec> -Task <task> -Phase build `
    -Worktree <worktree> -BaseSha <sha> -Schema completion -Effort <effort> `
    -Prompt <prompt> -SpecSourcePath <spec path> -Authorized <paths>
"$LASTEXITCODE" | Set-Content -Encoding utf8 "<scratch>/<spec>-<task>.done"
```

The exit-code capture must sit **outside** any `try`, so a wrapper crash still produces a marker; a
run that dies without writing one is indistinguishable from a run still going.

**2. The marker convention.** One file per dispatch at `<scratch>/<spec>-<task>.done`, whose entire
content is the wrapper's exit code as text. Path derived from spec and task so concurrent dispatches
cannot collide; content is the exit code so the host reads the outcome from the marker itself and
needs no second lookup to know whether to proceed.

**3. The wait.** Launch the runner as a **normal background task**, then `Monitor` the marker path
until it exists. The host does not poll in a sleep loop and does not hold a blocking call open for the
duration — that is the whole point of the channel. When the marker appears, read the exit code from
it, then read the ledger row (matched by worktree/spec/task) for `run_id`, `log_path`, and the
violation flags, which the wrapper's stdout never prints.

**Version-pinned:** the probe results — including the foreground-migrates-to-background behaviour the
unattended channel rests on — hold for the harness build they were run on. A harness upgrade re-opens
the question: re-confirm with a ≥12-min real dispatch before relying on the harness-owned channel for
a long unattended run again.
Evidence: `~/apex/docs/research/issue13-kill-ceiling-rootcause-2026-07-30.md`.

Either way, wait for every subprocess in the sub-wave to exit before integrating, and give the user
each task's log path so they can tail them in parallel (the host reads only each `.final`). Full
observability recipe + teardown → `references/codex-observability.md`.
````

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

- [ ] **Task 5**: Sweep the `~/.claude` consumers of the interim-executor clause — in each file replace the clause as listed below, changing nothing else; in the governance skill change only the frontmatter `version` (patch bump) **and its `last_updated` line**, leaving its body untouched. Only the ownership sentences change: `apex-coder`'s own fallback-path wave-grouping and worker-spawning behaviour is unaffected by this spec, and the `apex-plan` frontmatter `version` covering this file's `model-routing.md` edit is bumped once in Task 9, not here — files: C:\Users\User\.claude\skills\apex-code\references\dispatch-pack.md, C:\Users\User\.claude\skills\apex-code\references\workflow-dispatch.md, C:\Users\User\.claude\skills\apex-plan\references\model-routing.md, C:\Users\User\.claude\skills\apex-governance\levels\L3.md, C:\Users\User\.claude\skills\apex-governance\SKILL.md, C:\Users\User\.claude\agents\apex-coder.md, C:\Users\User\.claude\agents\apex-docs-technical-agent.md — done when: none of these files contains `interim executor` or `interim: the host`, each replacement below is present verbatim, `apex-docs-technical-agent.md` declares a `build_exceptions` input, and the governance skill's diff shows exactly two changed lines — its `version` and its `last_updated`.

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

--- agents/apex-docs-technical-agent.md (edit 1 of 2, the coder_summary clause)
FIND:    **the host, as interim executor (ADR-046 D1), assembles it from the wrapper's `.final` completion reports**
REPLACE: **the host assembles it from the wrapper's `.final` completion reports as build mechanics (ADR-046 D1)**

--- agents/apex-docs-technical-agent.md (edit 2 of 2, a NEW declared input, inserted as a new bullet immediately BEFORE the reviewer_findings bullet)
FIND:    - reviewer_findings: output from apex-reviewer (findings or clean)
REPLACE: - build_exceptions: the `row_kind: "exception"` (D1-EXCEPTION) ledger rows recorded for THIS build, or an empty list. Each row carries `ts`, `spec`, `task_scope`, `reason`, `scope`, `operator`, `resolution`. Rows are selected by `spec` match — you are handed exactly the rows whose `spec` equals this build's spec name, and no others. Render every one of them into the handoff, routed by `resolution`: a row with `resolution: open` becomes a **Blocked Actions** entry — the adjudication the takeover left outstanding, named with its `task_scope` — and a row with `resolution: resolved` becomes a **Decisions Made** entry naming the host takeover and exactly what was taken over, from its `reason` and `scope`. These rows are the ONLY producer for a host takeover — a takeover appears in no `.final` field and in no `apex-coder` summary — so if this list is non-empty and the handoff does not mention it, the takeover has gone unrecorded, which is the one thing the D1-EXCEPTION mechanism exists to prevent.
- reviewer_findings: output from apex-reviewer (findings or clean)
````

- [ ] **Task 6**: Amend both ADRs. (a) In ADR-046, append to § D1 immediately before `### D2` an `**Amendment — <build date>: interim executor retired**` paragraph recording that the build-orchestrator agent contract shipped at `~/.claude/agents/apex-build-orchestrator.md`; that D1's interim clause is fulfilled and retired; that the ownership assignment and the host's mechanics-only role are unchanged; that the host additionally runs a deterministic pre-launch structural validation over every wave plan — **all three checks named: cap arithmetic, wave file-disjointness — within a wave, no task's authorized path may EQUAL, be an ANCESTOR of, or be a DESCENDANT of another task's authorized path, compared per-repo so equal relative paths in different repos do not collide — and `authorized` ⊆ the spec's `Files to Change`** — and refuses a violating wave back to the orchestrator, which is mechanics, not adjudication; that **dispatch channel is keyed on attendance** (owner ruling, 2026-07-31) — attended long dispatches run detached with the owner supplying ADR-029's supervision, unattended runs use the harness-owned foreground call at any duration, and ADR-029's parallel-pool exclusion for high-risk work is unchanged; and that a host takeover of orchestrator duties now exists **only** as an attended, recorded **D1-EXCEPTION** — a ledger row `{row_kind:'exception', ts, spec, task_scope, reason, scope, operator, resolution}` whose `spec` selects it into the technical docs agent's `build_exceptions` input and whose `resolution` (`open|resolved`) routes it to Blocked Actions or Decisions Made, excluded from dispatch and family-gate selection by the `row_kind` rule, plus a handoff entry — while an AFK build parks and surfaces instead. Then mark the ORIGINAL interim paragraph (`Until the build-orchestrator agent contract ships…`, `:61-62`) with a leading `**Superseded — <build date>, see the amendment below:**` marker, following ADR-045's annotation precedent; leave its wording otherwise intact so the historical record survives, and do not delete it. (b) In ADR-045, edit the D1-amendment sentence at `:74-77` **in place** — the one beginning `Until the orchestrator's agent contract ships` — replacing it with a sentence in the past tense that marks it superseded, names the agent file, and cites this amendment; follow that ADR's own annotation precedent for superseded text rather than appending a second paragraph. (c) In ADR-041, add a one-line banner directly under the `**Deferred:**` bullet at `:72-77` reading `**Annotation (<build date>):** "the host adjudicates" here is the pre-D1 arrangement; build-result adjudication is now the dispatched `apex-build-orchestrator`'s (ADR-046 D1). Historical text retained.` — a banner only; the bullet's own wording is NOT rewritten. (d) In ADR-044, the § Decision **Item 1** paragraph at `:187` still ends `the host must adjudicate before accepting the diff` — the last unswept adjudication consumer. Add a one-line banner directly UNDER that paragraph reading `**Annotation (<build date>):** post-hoc critical-violation adjudication is the dispatched `apex-build-orchestrator`'s (ADR-046 D1); the host executes its directive. Attended confirmation remains the recovery. Historical text retained.` — banner only, in the same pattern as (c)'s ADR-041 banner: the original paragraph's wording is NOT touched, not one word. Use the session date supplied in the dispatch pack, or `2026-07-30` if none is supplied — files: C:\users\user\apex\docs\technical\adr\ADR-046-doctrine-audit-resolutions.md, C:\users\user\apex\docs\technical\adr\ADR-045-four-role-split.md, C:\users\user\apex\docs\technical\adr\ADR-041-wrapper-hardening-scope-cap-pin.md, C:\users\user\apex\docs\technical\adr\ADR-044-round8-deferred-designs.md — done when: ADR-046 § D1 carries the amendment with the structural-validation and D1-EXCEPTION clauses AND the superseded marker on the original interim paragraph, ADR-045's sentence is rewritten in place with a supersession marker, ADR-041 and ADR-044 each carry their banner with their original text unchanged, and no other decision text is reworded.

- [ ] **Task 7**: Double-write the registry. This task is coder-dispatched against the `apex` worktree directly — it is ordinary repository bookkeeping in the spec's own scope lock, not one of the three host's-pen artifacts (handoff, live status file, spec archival) that D6 reserves, so the sibling specs' host-pen convention does not apply to it. In `SKILLS.md` change the `## Agents (5)` heading to `## Agents (6)` and add the row below as the first row of the agents table. In `SKILL-HISTORY.md` add one row at the top of the table, dated the build date, listing skills `apex-code, apex-orchestrate, apex-governance, apex-plan`, every file this spec changed under `~/.claude`, event `updated`, a What-Changed summary naming the agent creation, the interim-executor retirement, and the dispatch-channel doctrine, and sources `docs/technical/adr/ADR-046-doctrine-audit-resolutions.md · docs/technical/adr/ADR-045-four-role-split.md · docs/research/issue13-kill-ceiling-rootcause-2026-07-30.md`. **RECORD the version numbers Tasks 2, 3, 5, and 9 already wrote — read each SKILL.md frontmatter and copy the value. Bump nothing here.** **Integration directive for this task, executed by the host as mechanics in this order:** (1) `git -C <apex> log -1 --format=%H -- SKILLS.md SKILL-HISTORY.md` and read the first five lines of each table; (2) if either top row differs from what this task's worktree branched onto, rebase the worktree onto the current tip, then **locate this spec's row wherever it now sits** — it is unique-matched by the agent-name string `apex-build-orchestrator`, which no other spec writes — and path-scope-integrate it; (3) only then the path-scoped `git checkout` integration. **The row's POSITION in the table is not a requirement.** A sibling spec's row landing above it is a normal outcome of two specs writing the same table, not a defect, and nothing downstream reads position: the version numbers this task records are read from **this spec's row, found by its agent-name string**, never from "the newest row". What step (2) must guarantee is only that the row is present **exactly once** — a rebase that leaves a second copy is the real failure. `retro-validator-versioning` and `adr032-predraft-architecture-pass` write these same two files, so step (2) is not optional — files: C:\users\user\apex\SKILLS.md, C:\users\user\apex\SKILL-HISTORY.md — done when: the agents table has six data rows and a matching count in its heading, `SKILL-HISTORY.md` carries this spec's row exactly once at any position, and the version numbers in that row equal the live frontmatter values.

```
| **apex-build-orchestrator** | apex-code (host dispatch) | Wave scheduling, dispatch parameters, exit-code routing, verify adjudication, integration order — reasoning only |
```

- [ ] **Task 8**: **Host-executed, attended — never dispatched to a coder** (it launches a real `codex exec`, and a nested dispatch inside a sandboxed coder is not a supported path). Run ONE real dummy dispatch through `codex-dispatch.ps1` in a throwaway scratch worktree. The channel is `detached` **by the attendance rule, not as an exception**: this task is attended and long, which is exactly the case the rule assigns to the detached runner. **The mechanism is fixed:** a **runner script** — which itself launches `codex-dispatch.ps1` — executed as a **normal background task**, a **completion marker file** written by that runner, and `Monitor` on the marker; owner present and the host tailing the dispatch log throughout. Direct `Start-Process` / `schtasks` detachment is classifier-blocked on this harness (`docs/handoff/2026-08-01.md`) and must NOT be used. **The dummy is deterministic, not open-ended** — dispatch it with this EXACT prompt text, verbatim: `Emit exactly one line to stdout every 30 seconds, of the form "heartbeat <n>/25 <UTC ISO-8601 timestamp>", beginning at n=1 and continuing through n=25. Sleep 30 seconds between lines. Do NOT create, edit, or delete any file. Do NOT run any other command. After the 25th line, print "heartbeat complete" and exit.` — and this EXACT wrapper argument list, which is the wrapper's full caller contract and not an abbreviation of it — every parameter below is required on a dispatch: `-Spec build-orchestrator-contract -Task 8-detached-channel-probe -Phase build -Worktree <the throwaway scratch worktree> -BaseSha <that scratch worktree's HEAD sha, read with `git -C <worktree> rev-parse HEAD` immediately before launch> -Schema completion -Effort low -Prompt <the heartbeat prompt text above, passed verbatim as one argument> -SpecSourcePath <this spec's promoted path, per the spec-wide assumption> -Attended:$true -CriticalFilesConfirmed`, plus EITHER `-Authorized <the single scratch file the probe may touch>` OR, when the probe writes nothing at all, `-ScopeUnlocked -ScopeUnlockedReason "issue-13 detached-channel probe: heartbeat only, no file writes"`. **`-Attended:$true` and `-CriticalFilesConfirmed` are mandatory on this invocation, not optional hardening.** The wrapper requires `-CriticalFilesConfirmed` on every `-ScopeUnlocked` build, and the live attended confirmation it stands for is the operator running this probe by hand; `-Attended:$true` is passed explicitly because **attendance is the routing fact under test** — the ledger row's attendance telemetry must read `true`, never null, or the run cannot evidence an attendance-keyed channel rule at all. **Omitting `-BaseSha` or `-Prompt` is not a shorthand — the wrapper refuses the dispatch**, so a probe that "failed to launch" for either reason is an argument-list defect, not evidence about the channel. 25 iterations × 30 s bounds the run below at **≥12 minutes wall clock** (the issue-13 doc's stated threshold, which the heartbeat probes could not exercise because they never filled a 64-KB stdout pipe). If the prompt finishes early, re-run with a larger iteration count; a short run proves nothing. Then append to § Caveats of the issue-13 research doc a `**Real-codex confirmation (<date>)**` bullet whose **TEN** fields are: harness build · run id · wall-clock duration in minutes, computed as `ended - started` from that ledger row's own timestamps (never estimated) · terminal ledger row status · whether the `--json` log's last line parses as a complete final event · whether the `.final` file exists · `verdict: confirmed` · **`invocation:` the full wrapper invocation line exactly as executed, verbatim** · **`worktree head:` the launch-time HEAD sha of the scratch worktree** · **`prompt first line:` the heartbeat prompt's first line**. Those last three exist because the runner script, the marker file, and the scratch worktree are all deleted at teardown: without them nothing on disk records what was actually run, and the bullet stops being a reproducible record the moment the artifacts go. **At completion the host appends TWO ledger rows for this task — part of the task, not bookkeeping after it.** (1) An **in-session build row** for this task's edit to the research doc: fresh `run_id`, `phase` `build`, `builder_family` `anthropic`, the apex `worktree_key`, and `end_tree_digest` computed with the tree-pin helper's `-Digest` mode (or the literal `unverifiable`), exactly as `apex-code/SKILL.md:360-375` prescribes for in-session work. (2) An **attended human-review row**: `phase` `human-review`, `attended` `true`, and `reviewed_run_id` bound to that build row's `run_id` — this work is attended and host-verified, and the attended human-review row is the family gate's human-review vouching path. Both rows carry this task's real id, `8-detached-channel-probe`, so the per-task completion rule holds for Task 8 under the same triple the gate selects on — files: C:\users\user\apex\docs\research\issue13-kill-ceiling-rootcause-2026-07-30.md — done when: the run reached natural completion, all four mechanical checks pass (terminal ledger status, complete final log event, `.final` present, computed duration ≥ 12 min), the appended bullet carries all **ten** fields, and both ledger rows exist with the human-review row's `reviewed_run_id` equal to the build row's `run_id`. **A `re-opened` outcome is NOT a completion of this task** — it means the kill class reproduced on a real dispatch, which invalidates the Task 4 channel doctrine as written: stop, record the evidence, and surface it as a spec-level blocker. **Scope note:** this task confirms only the ATTENDED/`detached` half of the channel doctrine. The unattended half — the claim that a plain foreground call past the ~10-minute tool ceiling MIGRATES rather than dies — is not assumed here; it is confirmed separately by **Task 8b**, and until 8b returns `verdict: confirmed` that claim stands unconfirmed.

- [ ] **Task 8b**: **Host-executed, attended — never dispatched to a coder** (same reason as Task 8: it launches a real `codex exec`, and a nested dispatch inside a sandboxed coder is not a supported path). Run the SAME deterministic ≥12-minute heartbeat dummy as Task 8 — its exact prompt text and wrapper argument list are given verbatim in Task 8's body and are reused unchanged except that `-Task` becomes `8b-foreground-channel-probe` and `-BaseSha` is read from THIS task's own scratch worktree (`-Prompt`, `-Schema`, `-Effort`, `-SpecSourcePath`, `-Attended:$true`, `-CriticalFilesConfirmed` and the `-Authorized`/`-ScopeUnlocked` choice are all identical — and `-Attended:$true` is passed here too even though the channel is the unattended one, because the operator IS at the machine for this probe and the attendance telemetry must record the fact rather than null) — through `codex-dispatch.ps1` in a throwaway scratch worktree, but this time as a **PLAIN FOREGROUND wrapper call**: no runner script, no background task, no completion marker, no `Monitor`. That is precisely the harness-owned channel the attendance rule assigns to an unattended run, and this task is the only place in this spec where a foreground long call is deliberate rather than an error. **Expected outcome:** the harness MIGRATES the call past its ~10-minute tool ceiling and the run reaches natural completion, with all four mechanical checks passing — terminal ledger row status (not `running`, `adopting`, `stalled`, or `killed`); computed duration `ended - started` from that row's OWN timestamps ≥ 12.0 minutes (computed, never estimated); the `.final` file present at the wrapper's reported path; the `--json` log's last line parsing as a complete final event rather than truncating mid-event. Then append to § Caveats of the issue-13 research doc a `**Real-codex foreground confirmation (<date>)**` bullet — a marker deliberately DISTINCT from Task 8's `**Real-codex confirmation (<date>)**`, so neither task's acceptance extract can swallow the other's bullet — in Task 8's TEN-field format **plus one field this task alone carries, making ELEVEN**: harness build · run id · wall-clock duration in minutes computed as `ended - started` from that ledger row's own timestamps · terminal ledger row status · whether the `--json` log's last line parses as a complete final event · whether the `.final` file exists · `verdict: confirmed` · as **field 8**, `migration notice: "<the harness's own notice, quoted verbatim>"` — the tool result in which the harness recorded that this call was moved to the background · and then, as fields **9, 10 and 11**, Task 8's three reproducibility fields, identical in form: `invocation:` the full wrapper invocation line exactly as executed, verbatim · `worktree head:` the launch-time HEAD sha of THIS task's scratch worktree · `prompt first line:` the heartbeat prompt's first line. Those three survive the teardown that deletes this task's scratch worktree, which is the only reason the record stays reproducible. **Field 8 is the observable signal, and it is the point of the task.** A run that simply finished proves only that it finished; the migration notice is the harness stating that the ceiling was reached and the call was migrated rather than killed, which is the actual claim under test. **If no such notice was emitted, the eighth field is not to be fabricated, paraphrased, or filled with an inference from the run's completion** — record `migration notice: ABSENT` and treat the outcome as `re-opened` under the stop condition below, whatever the other seven fields say. **STOP CONDITION — this is the point of the task.** The 2026-08-01 handoff records a foreground 10-minute timeout that KILLED the whole process tree. If that reproduces here — the tree is killed at the ceiling rather than the call migrating — then the unattended-channel doctrine is **invalidated as written**: do NOT continue and do NOT record a confirmation. Record the evidence in the same § Caveats as a bullet whose seventh field is `verdict: re-opened`, and surface it as a **spec-level blocker**. Because this task runs in wave 2 — before Task 1 or Task 4 has written a line of doctrine — a `re-opened` verdict PARKS the spec with nothing yet to roll back: the unattended-channel sentences planned for Task 4's `## Dispatch channel` and for Task 1's agent-contract § Channel must be re-drafted in this spec before the sweep resumes. **At completion the host appends TWO ledger rows for this task, on the same rule as Task 8 — part of the task, not bookkeeping after it.** (1) An **in-session build row** for this task's edit to the research doc: fresh `run_id`, `phase` `build`, `builder_family` `anthropic`, the apex `worktree_key`, and `end_tree_digest` computed with the tree-pin helper's `-Digest` mode (or the literal `unverifiable`), per `apex-code/SKILL.md:360-375`. (2) An **attended human-review row**: `phase` `human-review`, `attended` `true`, `reviewed_run_id` bound to that build row's `run_id` — the work is attended and host-verified, and that row is the family gate's human-review vouching path. Both rows carry this task's real id, `8b-foreground-channel-probe`, so the per-task completion rule holds for Task 8b under the same triple the gate selects on — files: C:\users\user\apex\docs\research\issue13-kill-ceiling-rootcause-2026-07-30.md — done when: the plain foreground call completed past the tool ceiling without the tree being killed, all four mechanical checks pass, the appended `Real-codex foreground confirmation` bullet carries all **eleven** fields — the seventh reading `verdict: confirmed`, the eighth carrying the harness's migration notice verbatim and not `ABSENT`, and fields 9–11 carrying the invocation line, the launch-time worktree HEAD sha, and the prompt's first line — and both ledger rows exist with the human-review row's `reviewed_run_id` equal to the build row's `run_id`. A `re-opened` outcome is NOT a completion of this task, and neither is a `confirmed` verdict whose eighth field is `ABSENT`.

- [ ] **Task 9**: Retire the § Wave plan interim clause in the planning skill and bump its version once. Replace the sentence that currently spans two lines — `Final task selection and sequencing are **orchestrator-owned** (ADR-046 D1; interim: the` / `host performs them as executor until that agent contract ships).` — with: `Final task selection and sequencing are **orchestrator-owned** — the dispatched `apex-build-orchestrator` (ADR-046 D1).` Leave the surrounding proposal/binding-dependency sentences and every other section of the file untouched, and bump the frontmatter `version` PATCH exactly once **and set `last_updated` to the build date**, covering both this edit and Task 5's `model-routing.md` edit — files: C:\Users\User\.claude\skills\apex-plan\SKILL.md — done when: the wrapped clause is gone (checked across line breaks), the orchestrator phrasing is present, and the diff contains exactly the `version` line, the `last_updated` line, and the § Wave plan sentence.

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
cd ~/.claude/agents && for p in '"kind": "dispatch_result"' '"kind": "refusal"' '"kind": "integration_verify"' '"kind": "reviewer_result"' '"kind": "family_gate_result"' '"kind": "agent_result"'; do grep -c "$p" apex-build-orchestrator.md; done   # each 1 (SIX kinds)
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
# the intro declares SIX kinds, and warns that one exit code can arrive on two tags
cd ~/.claude/agents && grep -c 'There are \*\*six\*\* kinds, below' apex-build-orchestrator.md   # 1
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

- [ ] **Task 1** — `dispatch_result.final` is NULLABLE, with the three no-report cases enumerated and `status` named as the authority when it is null → verify (the superseded contract claimed a `dispatch_result` always carries a `final`, which pre-launch 69, report-less adoption, and abandon-success all falsify):

```
cd ~/.claude/agents && grep -c '<completion-schema object, or null>' apex-build-orchestrator.md   # 2 (the field declaration + the refusal-contrast sentence)
cd ~/.claude/agents && grep -c 'always carries both' apex-build-orchestrator.md            # 0 (the superseded always-present claim)
cd ~/.claude/agents && grep -ci 'three cases and no fourth' apex-build-orchestrator.md     # 1
cd ~/.claude/agents && grep -ci 'pre-launch tree-moved exit 69' apex-build-orchestrator.md # 1 (null case 1)
cd ~/.claude/agents && grep -c 'adopted-blocked` status' apex-build-orchestrator.md        # 1 (null case 2)
cd ~/.claude/agents && grep -c 'abandoned-unadopted"`, `exit_code: 0`' apex-build-orchestrator.md   # 2 (null case 3 + the request_abandon carrier)
cd ~/.claude/agents && grep -c '`status` is the authority' apex-build-orchestrator.md      # 2
cd ~/.claude/agents && grep -ci 'not a `refusal`' apex-build-orchestrator.md               # 1 (abandon success is a dispatch_result)
```

- [ ] **Task 1** — `dispatch_result` carries the ledger facts the exit code masks, and names the ledger as the source of `run_id`/`log_path` → verify (the wrapper records all four violation flags unconditionally, so an exit 67 can hide a scope, encoding, or critical violation — the contract must say so):

```
cd ~/.claude/agents && for f in '"scope_violation"' '"encoding_violation"' '"critical_violation"' '"tree_moved_flag"' '"log_path"'; do grep -c "$f" apex-build-orchestrator.md; done   # each >=1
cd ~/.claude/agents && grep -c 'true|false|null' apex-build-orchestrator.md                       # 1 (critical_violation is tri-state)
cd ~/.claude/agents && grep -c '67 > 69 > 66 > 65 > 77 > 73 > 68' apex-build-orchestrator.md      # 1 (the precedence chain, in order)
cd ~/.claude/agents && grep -ci 'masks a simultaneous' apex-build-orchestrator.md                 # 1
cd ~/.claude/agents && grep -c 'Read all four flags on EVERY' apex-build-orchestrator.md          # 1
cd ~/.claude/agents && grep -ci 'never "clean"' apex-build-orchestrator.md                        # 1 (null critical_violation is not false)
cd ~/.claude/agents && grep -c 'from the ledger row, not from' apex-build-orchestrator.md         # 1
cd ~/.claude/agents && grep -ci 'never invent, reconstruct, or infer a' apex-build-orchestrator.md   # 1
# the ledger status vocabulary, including the adopted forms and the scope suffix
cd ~/.claude/agents && grep -c 'adopted-done_with_concerns' apex-build-orchestrator.md            # 1
cd ~/.claude/agents && grep -c 'adopted-done+scope65' apex-build-orchestrator.md                  # 1
cd ~/.claude/agents && grep -ci 'Match it as a prefix' apex-build-orchestrator.md                 # 1
# and the flags are ADDITIVE routing obligations, not something the exit verdict can swallow
cd ~/.claude/agents && grep -c 'verdict-INDEPENDENT obligations' apex-build-orchestrator.md       # 1
cd ~/.claude/agents && grep -c 'Exit 67 never absorbs them' apex-build-orchestrator.md            # 1
cd ~/.claude/agents && grep -ci 'in addition to' apex-build-orchestrator.md                       # 1
```

- [ ] **Task 1** — `reviewer_result` is PRODUCER-TYPED: each of the five reviewers carries its own fields verbatim, and no normalized verdict field is invented → verify (the four producers emit four different vocabularies and no normalizer exists anywhere in `apex-code` — see § B of the producer-surfaces research doc `orchestrator-producer-surfaces-2026-08-01.md`, which lives under the research directory of this repo and is cited by basename because it is planning evidence, not a build target):

```
cd ~/.claude/agents && grep -c 'apex-reviewer|apex-wave-reviewer|codex-review|opus-endgate|human' apex-build-orchestrator.md   # 1 (the reviewer enum, all five)
cd ~/.claude/agents && grep -c 'There is no common verdict field' apex-build-orchestrator.md   # 1
cd ~/.claude/agents && grep -c 'orchestrator-producer-surfaces-2026-08-01' apex-build-orchestrator.md   # 1 (the derivation is cited)
# apex-reviewer's OWN vocabulary — status/type/low-medium-high, not BLOCK|FLAG|CLEAN
cd ~/.claude/agents && grep -c '"status": "clean|findings"' apex-build-orchestrator.md      # 1
cd ~/.claude/agents && grep -c 'missed_requirement|bug|risky_pattern|spec_divergence' apex-build-orchestrator.md   # 1
cd ~/.claude/agents && grep -c '"severity": "low|medium|high"' apex-build-orchestrator.md   # 1 (its real enum — NOT zero)
cd ~/.claude/agents && for f in '"description":' '"suggestion":' '"type":'; do grep -c "$f" apex-build-orchestrator.md; done   # each 1
# apex-wave-reviewer is PLAIN TEXT, carried as one string
cd ~/.claude/agents && grep -c 'apex-wave-reviewer' apex-build-orchestrator.md              # 3
cd ~/.claude/agents && grep -c 'plain text, not JSON' apex-build-orchestrator.md            # 1
# codex-review's schema
cd ~/.claude/agents && grep -c '"verdict": "BLOCK|FLAG|CLEAN"' apex-build-orchestrator.md   # 1
cd ~/.claude/agents && grep -c '"severity": "BLOCK|FLAG|CLEAN"' apex-build-orchestrator.md  # 1
cd ~/.claude/agents && grep -c '"criterion":' apex-build-orchestrator.md                    # 1
cd ~/.claude/agents && grep -c '"rationale":' apex-build-orchestrator.md                    # 1
cd ~/.claude/agents && grep -ci 'codex-review-schema.json' apex-build-orchestrator.md       # 1
# opus-endgate's own field names and its free-text verdict
cd ~/.claude/agents && grep -c '"severity": "P1|P2|note"' apex-build-orchestrator.md        # 1
cd ~/.claude/agents && for f in '"issue":' '"why":'; do grep -c "$f" apex-build-orchestrator.md; done   # each 1
cd ~/.claude/agents && grep -c 'free text — NOT an enum' apex-build-orchestrator.md        # 1
# the invented shapes are GONE: no normalized top-level verdict, no endgate sub-object
cd ~/.claude/agents && grep -c '"family": "anthropic|openai|human", "verdict"' apex-build-orchestrator.md   # 0
cd ~/.claude/agents && grep -c '"endgate": {' apex-build-orchestrator.md                    # 0 (superseded sub-object)
cd ~/.claude/agents && grep -ci 'one shape serves both families' apex-build-orchestrator.md # 0 (superseded claim)
cd ~/.claude/agents && grep -c 'P1 → BLOCK' apex-build-orchestrator.md                      # 0 (no field rewriting)
# guidance, explicitly NOT a field rewrite
cd ~/.claude/agents && grep -c 'Adjudication guidance' apex-build-orchestrator.md           # 1
cd ~/.claude/agents && grep -c 'never for rewriting a field' apex-build-orchestrator.md     # 1
cd ~/.claude/agents && grep -ci 'never record a' apex-build-orchestrator.md                 # 1
```

- [ ] **Task 1** — the wrapper-only `exit_code` on `reviewer_result` is scoped to `codex-review` and its enum admits `null` for the four agent-dispatched kinds, while `tree_moved` applies to EVERY reviewer kind and is never forced false → verify (the host pin-verifies around agent reviewers too, so an agent-reviewer result with a moved pin arrives `tree_moved: true` and adjudicates void → request_verify):

```
cd ~/.claude/agents && grep -c '"exit_code": 0|67|68|69|null' apex-build-orchestrator.md    # 1 (null for the four agent kinds)
cd ~/.claude/agents && grep -c '"exit_code": 0|67|68|69,' apex-build-orchestrator.md        # 0 (the superseded non-nullable enum)
cd ~/.claude/agents && grep -c '"tree_moved": true|false' apex-build-orchestrator.md        # 1
cd ~/.claude/agents && grep -c 'applies ONLY to' apex-build-orchestrator.md                 # 1 (exit_code, and exit_code alone)
cd ~/.claude/agents && grep -c 'exit_code: null' apex-build-orchestrator.md                 # 1
cd ~/.claude/agents && grep -c 'applies to ALL reviewer kinds' apex-build-orchestrator.md   # 1
cd ~/.claude/agents && grep -ci 'never forced false' apex-build-orchestrator.md             # 1
cd ~/.claude/agents && grep -c 'tree_moved: false' apex-build-orchestrator.md               # 0 (no kind is pinned to false)
cd ~/.claude/agents && grep -c 'SKILL.md:323' apex-build-orchestrator.md                    # 1 (the pin-before-any-review-gate citation)
cd ~/.claude/agents && grep -c 'structurally unreachable' apex-build-orchestrator.md        # 1 (65/66/73/77 on a review phase)
cd ~/.claude/agents && grep -c 'A review dispatch exits through the wrapper too' apex-build-orchestrator.md   # 0 (superseded blanket claim)
```

- [ ] **Task 1** — the SIXTH kind `agent_result` carries the three exit-codeless producers verbatim → verify:

```
cd ~/.claude/agents && grep -c '"agent": "apex-coder|apex-docs-product-agent|apex-docs-technical-agent"' apex-build-orchestrator.md   # 1
cd ~/.claude/agents && grep -c 'no exit code at all' apex-build-orchestrator.md             # 1
cd ~/.claude/agents && for f in files_changed task_summaries blocked_actions; do grep -c "$f" apex-build-orchestrator.md; done   # each >=1
cd ~/.claude/agents && grep -c '"status": "completed|completed_with_skips|failed"' apex-build-orchestrator.md   # 1
cd ~/.claude/agents && grep -c 'inline_docs_added' apex-build-orchestrator.md               # 1
cd ~/.claude/agents && grep -c 'single returned sentence' apex-build-orchestrator.md        # 1 (technical agent is free text)
cd ~/.claude/agents && grep -c 'in-session ledger row' apex-build-orchestrator.md           # 1 (the fallback coder's run identity)
cd ~/.claude/agents && grep -ci 'unverifiable' apex-build-orchestrator.md                   # 2 (the digest sentinel + the 78 digest cause)
```

- [ ] **Task 1** — `family_gate_result` matches the per-task gate, and spec-level completion is a quantifier over it → verify (`apex-family-gate.ps1` takes `-Spec`, `-Task`, `-WorktreeKey` all mandatory, exits 0/12/13, and prints nothing on 0):

```
cd ~/.claude/agents && grep -c '"exit_code": 0|12|13' apex-build-orchestrator.md            # 1
cd ~/.claude/agents && grep -c '"kind": "family_gate_result", "spec": "<spec-name>", "task_id": "3",' apex-build-orchestrator.md   # 1 (required)
cd ~/.claude/agents && grep -c 'family_gate_result", "spec": "<spec-name>", "task_id": "3|null"' apex-build-orchestrator.md       # 0 (the null option is gone from THIS tag)
cd ~/.claude/agents && grep -c 'worktree_key' apex-build-orchestrator.md                    # 1
cd ~/.claude/agents && grep -c 'strictly PER-TASK' apex-build-orchestrator.md               # 1
cd ~/.claude/agents && grep -ci 'success is silent' apex-build-orchestrator.md              # 1
cd ~/.claude/agents && grep -c 'quantifier, not an event' apex-build-orchestrator.md        # 1
cd ~/.claude/agents && grep -c 'for \*\*every\*\* task' apex-build-orchestrator.md          # 1
cd ~/.claude/agents && grep -c '"detail": "0 pass | 12 same-family refusal | 13 unverifiable"' apex-build-orchestrator.md   # 0 (superseded shape)
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

- [ ] **Task 1** — the AFK end-gate rung is present and a P1 blocks the family gate → verify:

```
cd ~/.claude/agents && grep -c 'This table is the BUILD phase' apex-build-orchestrator.md         # 1
cd ~/.claude/agents && grep -c 'tree_moved' apex-build-orchestrator.md                            # 8 (incl. the 2 tree_moved_flag uses and the all-kinds rule)
cd ~/.claude/agents && grep -c 'opus-endgate' apex-build-orchestrator.md                          # 4
cd ~/.claude/agents && grep -c 'afk-endgate.md' apex-build-orchestrator.md                        # 2
cd ~/.claude/agents && grep -c 'mandatory AFK end-gate' apex-build-orchestrator.md                # 1
cd ~/.claude/agents && grep -c 'unresolved end-gate P1' apex-build-orchestrator.md                # 2 (the guidance rule + the close-out rung)
```

- [ ] **Task 1** — exit 78 routes by CAUSE, not to a single forced action → verify (78 fires for three unrelated reasons and `request_verify` is right for only one of them):

```
cd ~/.claude/agents && grep -c 'route it by CAUSE' apex-build-orchestrator.md                     # 1
cd ~/.claude/agents && grep -c '69 and 78' apex-build-orchestrator.md                             # 0 (the merged forced rule is gone)
cd ~/.claude/agents && grep -c '69 → `request_verify`' apex-build-orchestrator.md                 # 1 (69 keeps its forced action)
cd ~/.claude/agents && grep -ci 'bad or unknown' apex-build-orchestrator.md                       # 1 (cause 1 → re-dispatch the review)
cd ~/.claude/agents && grep -ci 'binding helper is unavailable' apex-build-orchestrator.md        # 1 (cause 2 → park)
cd ~/.claude/agents && grep -ci 'digest mismatch' apex-build-orchestrator.md                      # 1 (cause 3 → request_verify or human review)
cd ~/.claude/agents && grep -c 'SKILL.md:168' apex-build-orchestrator.md                          # 1 (the human-review row is cited)
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
cd ~/.claude/agents && grep -c '"truncated": \["<field name>", "..."\]' apex-build-orchestrator.md   # 3 (dispatch_result, reviewer_result, agent_result)
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
cd ~/.claude/agents && for f in '"ts"' '"spec"' '"task_scope"' '"reason"' '"scope"' '"operator"' '"resolution"'; do grep -c "$f" apex-build-orchestrator.md; done   # each >=1 (SEVEN fields)
cd ~/.claude/agents && grep -c '"resolution": "open|resolved"' apex-build-orchestrator.md   # 1
cd ~/.claude/agents && grep -ci 'three of those seven fields are selectors' apex-build-orchestrator.md   # 1
cd ~/.claude/agents && grep -ci 'selects on' apex-build-orchestrator.md               # >=1 (`spec` is build_exceptions' selector)
cd ~/.claude/agents && grep -c 'lease_close' apex-build-orchestrator.md               # >=1 (cross-reference)
cd ~/.claude/agents && grep -ci 'excluded from build-row selection' apex-build-orchestrator.md   # 1
```

- [ ] **Task 1** — a fixture exception row parses and is rejected by the selection rule → verify: write the schema's example row to a scratch file, parse it (`ConvertFrom-Json`), and confirm it has all **seven** fields — `ts`, `spec`, `task_scope`, `reason`, `scope`, `operator`, `resolution` — plus `row_kind: exception`, with `resolution` holding one of `open` / `resolved`; that filtering the fixture by `spec` returns it only for its own spec name; and that a `row_kind`-filtered selection over a fixture ledger containing that row plus one real build row returns only the build row.
- [ ] **Task 1** — "raw" is defined once and the definition is pointed at from the build skill → verify:

```
cd ~/.claude/agents && grep -ci 'raw.*means the bounded fixed result fields' apex-build-orchestrator.md   # 1
cd ~/.claude && grep -ci 'never a transcript or a whole log' skills/apex-code/SKILL.md                     # 1
```

- [ ] **Task 1** — the build-state block is enumerated field by field, and unadjudicated events are an ORDERED LIST carried verbatim, not a single slot → verify:

```
cd ~/.claude/agents && for f in spec_digest completed_waves integration_state pending_waves base_sha run_ids phase refusal_history nudge_count pending_events; do grep -c "$f" apex-build-orchestrator.md; done   # each >=1
# resume-state completeness: the close-out rungs are recoverable too, and stay BOUNDED
cd ~/.claude/agents && for f in family_gate_results reviewer_results docs_status rung_notes; do grep -c "$f" apex-build-orchestrator.md; done   # each >=1
cd ~/.claude/agents && grep -c 'The four summary fields stay bounded on purpose' apex-build-orchestrator.md   # 1
cd ~/.claude/agents && grep -c 'findings body' apex-build-orchestrator.md               # 1
cd ~/.claude/agents && grep -ci 'not so it can re-adjudicate them' apex-build-orchestrator.md   # 1
cd ~/.claude/agents && grep -ci 'Never copy finding text into the summary fields' apex-build-orchestrator.md   # 1
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
# check (b): disjointness is equal / ancestor / descendant, compared PER-REPO
cd ~/.claude/agents && grep -c 'be an \*\*ANCESTOR\*\* of' apex-build-orchestrator.md            # 1 (the structural check (b) definition)
cd ~/.claude/agents && grep -ci 'an ancestor of, or a descendant of' apex-build-orchestrator.md  # 1 (the wave-plan rules mirror)
cd ~/.claude/agents && grep -ci 'relative paths in two different repos' apex-build-orchestrator.md   # 1 (the per-repo carve-out; the sentence wraps before this fragment)
# check (c): the authorized set must be a SUBSET of the spec's Files to Change
cd ~/.claude/agents && grep -c 'authorized ⊆ spec' apex-build-orchestrator.md      # 1
cd ~/.claude/agents && grep -c 'must be a SUBSET of the paths' apex-build-orchestrator.md   # 1
cd ~/.claude/agents && grep -c 'structural-authorized-outside-spec' apex-build-orchestrator.md   # 2 (the named set + check (c))
cd ~/.claude/agents && grep -c 'set inclusion' apex-build-orchestrator.md          # 1
```

- [ ] **Task 1** — the host's structured-output enforcement is declared, with its named rule and its escalation → verify (a malformed turn is refused deterministically, never interpreted):

```
cd ~/.claude/agents && grep -c 'structural-malformed-output' apex-build-orchestrator.md      # 2 (the named rule set + the enforcement paragraph)
cd ~/.claude/agents && grep -c 'Structured-output validation' apex-build-orchestrator.md     # 1
cd ~/.claude/agents && grep -c 'exactly one fenced JSON block' apex-build-orchestrator.md    # 1
cd ~/.claude/agents && grep -c 'no unknown top-level field' apex-build-orchestrator.md       # 1
cd ~/.claude/agents && grep -c 'are NORMATIVE, not illustrative' apex-build-orchestrator.md  # 1 (the fenced shapes ARE the schema)
cd ~/.claude/agents && grep -ci 'no separate' apex-build-orchestrator.md                     # 1 (no schema artifact ships — a non-goal)
cd ~/.claude/agents && grep -c 'If the re-ask also fails validation' apex-build-orchestrator.md   # 1 (the sentence wraps — anchor on a fragment that does not)
cd ~/.claude/agents && grep -c 'fresh-instance rung' apex-build-orchestrator.md              # 1
cd ~/.claude/agents && grep -ci 'a parser, not a critic' apex-build-orchestrator.md          # 1
# and it is stated on the host side too, so both documents describe the same enforcement
cd ~/.claude && grep -c 'structural-malformed-output' skills/apex-code/SKILL.md              # 1
cd ~/.claude && grep -ci 'structured-output validation' skills/apex-code/SKILL.md            # 1
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
cd ~/.claude/agents && grep -c 'bare' apex-build-orchestrator.md                              # 2 (the two `Add-Content` uses share a line; "the bare nine" statuses is the other)
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
cd ~/.claude && git diff -U0 -- skills/apex-orchestrate/SKILL.md | grep -c '^+version:'        # 1
cd ~/.claude && git diff -U0 -- skills/apex-orchestrate/SKILL.md | grep -c '^+last_updated:'   # 1
```

- [ ] **Task 3** — the wave-analysis note names the agent, the untouched D6 clause survives, and the frontmatter `version` minor is bumped → verify:

```
cd ~/.claude && grep -ci 'interim executor' skills/apex-code/SKILL.md        # 0
cd ~/.claude && grep -c 'apex-build-orchestrator' skills/apex-code/SKILL.md  # >=1
cd ~/.claude && grep -c 'Interim mechanics' skills/apex-code/SKILL.md        # 1
cd ~/.claude && git diff -U0 -- skills/apex-code/SKILL.md | grep -c '^+version:'        # 1
cd ~/.claude && git diff -U0 -- skills/apex-code/SKILL.md | grep -c '^+last_updated:'   # 1
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
# the disjointness definition is mirrored here too, in the same equal/ancestor/descendant, per-repo form
cd ~/.claude && grep -ci 'compared per-repo' skills/apex-code/SKILL.md                    # 1
cd ~/.claude && grep -ci 'be an ANCESTOR of, or be a DESCENDANT of' skills/apex-code/SKILL.md   # 1
# the serial-load pointer: an attended LONG dispatch loads the channel reference even when it is alone
cd ~/.claude && grep -ci 'Serial does not exempt the channel' skills/apex-code/SKILL.md   # 1
cd ~/.claude && grep -c 'parallel-codex.md` § Dispatch channel' skills/apex-code/SKILL.md # 1
cd ~/.claude && grep -ci 'serial ones included' skills/apex-code/SKILL.md                 # 1
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

- [ ] **Task 4** — the detached recipe is SELF-CONTAINED and declared as the recipe for all attended long dispatches, serial included → verify (a reader must be able to execute the channel from this section alone, without reconstructing it from a handoff):

```
cd ~/.claude/skills/apex-code/references && grep -c '### The detached recipe' parallel-codex.md   # 1
cd ~/.claude/skills/apex-code/references && grep -ci 'serial ones included' parallel-codex.md     # 1
cd ~/.claude/skills/apex-code/references && grep -ci 'parallel-wave device' parallel-codex.md     # 1 (the sentence wraps before this fragment)
# part 1 — the runner script, with its wrapper invocation shown
cd ~/.claude/skills/apex-code/references && grep -c 'codex-dispatch.ps1' parallel-codex.md        # >=1
cd ~/.claude/skills/apex-code/references && grep -c 'LASTEXITCODE' parallel-codex.md              # 1
cd ~/.claude/skills/apex-code/references && grep -ci 'outside\*\* any `try`' parallel-codex.md    # 1
# part 2 — the marker convention: path AND content are both stated
cd ~/.claude/skills/apex-code/references && grep -c '<spec>-<task>.done' parallel-codex.md        # >=1
cd ~/.claude/skills/apex-code/references && grep -ci 'the wrapper.s exit code as text' parallel-codex.md   # 1
# part 3 — the wait, and the ledger read that follows it
cd ~/.claude/skills/apex-code/references && grep -ci 'does not poll in a sleep loop' parallel-codex.md     # 1
cd ~/.claude/skills/apex-code/references && grep -ci 'read the ledger row' parallel-codex.md      # 1
```

- [ ] **Task 4** — the foreground-migration claim is written ONLY on Task 8b's eighth-field evidence → verify: if the § Caveats `Real-codex foreground confirmation` bullet carries a `migration notice:` field whose value is not `ABSENT`, then `grep -c 'confirmed (see issue-13 § Caveats foreground bullet)' parallel-codex.md` is 1; if that field is absent or reads `ABSENT`, the same grep must be **0** and the task is blocked pending a re-drafted unattended-channel paragraph. The two halves are checked together — a `1` with no evidence field is a failure of this criterion, not a pass.

- [ ] **Task 5** — the sweep is complete across both trees, with no residual anywhere → verify:

```
# --exclude-dir=fixtures: skills/apex-code/scripts/fixtures/spec-corpus/ is a tracked HISTORICAL
# test corpus (16 'interim executor' lines), never edited and out of this spec's scope
cd ~/.claude && grep -rn --include="*.md" --exclude-dir=fixtures -io "interim executor" skills agents hooks workflows   # 0 hits
cd ~/.claude && grep -rnz --include="*.md" --exclude-dir=fixtures -i "interim: *the" skills agents                      # 0 hits (-z spans line wraps)
cd ~/.claude && grep -rn --include="*.md" --exclude-dir=fixtures "apex-build-orchestrator" skills agents                # >=7 files
# apex tree: derived form — ADR-045/046 RETAIN annotated historical occurrences, so require annotation,
# not absence; and the annotation legitimately sits on the PRECEDING line, so this is context-tolerant
# for the same reason the Task 6 check is (a same-line grep would demand an undocumented reflow)
cd ~/apex && bare=0; while IFS=: read -r f n _; do \
    s=$(( n > 1 ? n - 1 : 1 )); \
    sed -n "${s},$((n+1))p" "$f" | grep -qiE 'retired|superseded' || bare=$((bare+1)); \
  done < <(grep -rn --include="*.md" -i "interim executor" docs/technical *.md); echo "$bare"   # 0
cd ~/apex && grep -rn --include="*.md" -i "interim" docs/technical/architecture                  # 0 hits
```

- [ ] **Task 5** — the governance body is untouched: the file's diff shows exactly the two frontmatter lines, `version` and `last_updated` → verify:

```
cd ~/.claude && git diff -U0 -- skills/apex-governance/SKILL.md | grep -c '^+version:'        # 1
cd ~/.claude && git diff -U0 -- skills/apex-governance/SKILL.md | grep -c '^+last_updated:'   # 1
cd ~/.claude && git diff --numstat -- skills/apex-governance/SKILL.md                         # 2 added, 2 deleted
```

- [ ] **Task 5** — the technical docs agent has a DECLARED producer for D1-EXCEPTION rows, so a host takeover reaches the handoff → verify (the exception row is neither a `.final` field nor an `apex-coder` summary, so without this input it has no route into the handoff at all):

```
cd ~/.claude && grep -c 'build_exceptions' agents/apex-docs-technical-agent.md                     # 1
cd ~/.claude && grep -c 'row_kind: "exception"' agents/apex-docs-technical-agent.md               # 1
cd ~/.claude && grep -ci 'the ONLY producer for a host takeover' agents/apex-docs-technical-agent.md   # 1
cd ~/.claude && grep -c 'Decisions Made' agents/apex-docs-technical-agent.md                      # >=2 (the existing mapping + the exception mapping)
cd ~/.claude && grep -c 'Blocked Actions' agents/apex-docs-technical-agent.md                     # >=2
# the three selector fields: `spec` selects the rows, `resolution` routes them, `task_scope` names them
cd ~/.claude && grep -c 'task_scope' agents/apex-docs-technical-agent.md                          # >=1
cd ~/.claude && grep -c 'selected by `spec` match' agents/apex-docs-technical-agent.md            # 1
cd ~/.claude && grep -c 'resolution: open' agents/apex-docs-technical-agent.md                    # 1
cd ~/.claude && grep -c 'resolution: resolved' agents/apex-docs-technical-agent.md                # 1
# the input is declared in the Inputs list, above reviewer_findings
cd ~/.claude && awk '/^## Inputs/{f=1} f&&/^- build_exceptions:/{b=NR} f&&/^- reviewer_findings:/{r=NR} END{print (b>0 && b<r) ? "PASS" : "FAIL"}' agents/apex-docs-technical-agent.md   # PASS
```

- [ ] **Task 6** — both ADRs record the activation and neither still asserts an in-force D1 interim arrangement → verify:

```
cd ~/apex/docs/technical/adr && grep -ci 'interim executor retired' ADR-046-doctrine-audit-resolutions.md   # 1
cd ~/apex/docs/technical/adr && grep -c 'D1-EXCEPTION' ADR-046-doctrine-audit-resolutions.md                # >=1
cd ~/apex/docs/technical/adr && grep -c "row_kind:'exception'" ADR-046-doctrine-audit-resolutions.md        # >=1
cd ~/apex/docs/technical/adr && grep -ci 'structural validation' ADR-046-doctrine-audit-resolutions.md      # >=1
cd ~/apex/docs/technical/adr && grep -ci 'compared per-repo' ADR-046-doctrine-audit-resolutions.md          # 1 (disjointness defined, not just named)
cd ~/apex/docs/technical/adr && grep -ci 'be an ANCESTOR of, or be a DESCENDANT of' ADR-046-doctrine-audit-resolutions.md   # 1
cd ~/apex/docs/technical/adr && grep -ci 'keyed on attendance' ADR-046-doctrine-audit-resolutions.md        # 1
cd ~/apex/docs/technical/adr && grep -c '2026-07-31' ADR-046-doctrine-audit-resolutions.md                  # >=1 (the owner ruling is dated)
cd ~/apex/docs/technical/adr && grep -c 'apex-build-orchestrator' ADR-045-four-role-split.md                # >=1
cd ~/apex/docs/technical/adr && grep -ci 'until the orchestrator' ADR-045-four-role-split.md                # 0
cd ~/apex/docs/technical/adr && grep -ciE 'superseded|no longer in force' ADR-045-four-role-split.md        # >=1
```

- [ ] **Task 6** — the ADR-046 zero-hit check is the DERIVED form: every surviving `interim executor` occurrence is annotated, none is bare → verify (a flat zero-hit grep is wrong here — the amendment heading and the retained historical paragraph both legitimately contain the phrase):

```
# CONTEXT-TOLERANT, and deliberately so: a `**Superseded — …:**` marker naturally sits on the line
# BEFORE the paragraph it marks, so a same-line grep would fail on correct markdown and force an
# undocumented reflow. Every occurrence of the phrase must have an annotation token within ONE line
# either side of it; the count of occurrences that do not is the thing that must be zero.
cd ~/apex/docs/technical/adr && F=ADR-046-doctrine-audit-resolutions.md; bare=0; \
  for n in $(grep -in 'interim executor' "$F" | cut -d: -f1); do \
    s=$(( n > 1 ? n - 1 : 1 )); \
    sed -n "${s},$((n+1))p" "$F" | grep -qiE 'retired|superseded' || bare=$((bare+1)); \
  done; echo "$bare"   # 0 (no bare occurrence)
# and the phrase must still be PRESENT, so the loop above cannot pass vacuously
cd ~/apex/docs/technical/adr && grep -ci 'interim executor' ADR-046-doctrine-audit-resolutions.md   # >=2 (amendment heading + retained paragraph)
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

- [ ] **Task 7** — the double-write is consistent: the agents heading count matches six data rows, and this spec's history row names the agent and cites all three sources → verify:

```
cd ~/apex && grep -c '## Agents (6)' SKILLS.md                    # 1
cd ~/apex && grep -c 'apex-build-orchestrator' SKILLS.md          # >=1
cd ~/apex && grep -c 'apex-build-orchestrator' SKILL-HISTORY.md   # >=1
# row count: data rows between the "## Agents (6)" heading and the next "## " heading, minus header+separator
cd ~/apex && awk '/^## Agents \(6\)/{f=1;next} /^## /{f=0} f&&/^\|/{n++} END{print n-2}' SKILLS.md   # 6
```

- [ ] **Task 7** — the recorded versions match the live frontmatter (no second bump), read from THIS spec's row located by its agent-name string → verify: for each of `apex-code`, `apex-orchestrate`, `apex-governance`, and `apex-plan`, the version string in the row matched by `apex-build-orchestrator` equals that skill's live frontmatter `version`.
- [ ] **Task 7** — the race branch, if it fired, left ONE copy of the row; its position is not asserted → verify (a sibling spec's row landing above this one is a normal outcome of two specs writing the same table, and nothing reads position):

```
cd ~/apex && grep -c 'apex-build-orchestrator' SKILL-HISTORY.md   # 1 (exactly once in the whole file — a duplicate is the real failure)
```
- [ ] **Task 8** — the real-codex confirmation ran to natural completion and is recorded: a `.final` was written, the ledger row is terminal (not `running`, `stalled`, or `killed`), the `--json` log ends on a complete final event rather than truncating mid-event, and the appended § Caveats bullet carries all **ten** recorded fields → verify:

```
# scope every field check to the APPENDED bullet, not the whole document
B="$SCRATCH/apex-t8-bullet.txt"   # session scratch dir, never the repo
# marker → next BLANK LINE (not marker → EOF), so this extract holds Task 8's bullet ALONE
cd ~/apex/docs/research && awk '/\*\*Real-codex confirmation/{f=1} f&&/^[[:space:]]*$/{exit} f' issue13-kill-ceiling-rootcause-2026-07-30.md > "$B"
grep -c 'Real-codex confirmation' "$B"                                    # 1
grep -c 'Real-codex foreground confirmation' "$B"                         # 0 (Task 8b's bullet is NOT in this extract)
for f in 'harness build' 'run id' 'duration' 'ledger status' 'final event' '.final' 'verdict' 'invocation:' 'worktree head:' 'prompt first line:'; do grep -ci -- "$f" "$B"; done   # each >=1 (TEN fields)
grep -c 'verdict: confirmed' "$B"                                          # 1 (re-opened is a blocker, not a pass)
# the three durability fields make the record reproducible after the runner/worktree artifacts are deleted
grep -cE 'invocation: *.*codex-dispatch\.ps1' "$B"                         # 1 (the invocation line as EXECUTED, not paraphrased)
grep -cE 'worktree head: *[0-9a-f]{7,40}' "$B"                             # 1 (launch-time HEAD sha of the scratch worktree)
grep -ci 'prompt first line: *Emit exactly one line to stdout' "$B"        # 1 (the heartbeat prompt's first line)
# duration is a NUMERIC comparison against the ledger-derived value, not a presence test:
# D = (ended - started) in minutes, computed from that run_id's own ledger timestamps
awk 'match($0,/duration: *[0-9]+(\.[0-9]+)?/){d=substr($0,RSTART+10,RLENGTH-10)+0; print (d>=12) ? "PASS " d : "FAIL " d}' "$B"   # PASS
# and the recorded number must equal the ledger-derived D (bullet must not be hand-rounded upward)
```

- [ ] **Task 8** — the run itself passed its four mechanical checks → verify: the ledger row for that `run_id` has a terminal status (not `running`, `adopting`, `stalled`, or `killed`); the numeric difference `ended - started` on that row is **≥ 12.0 minutes** (computed, then compared — never eyeballed from the log); the `.final` file exists at the wrapper's reported path; and the last line of the `--json` log parses as a complete final agent event (not a truncated object).
- [ ] **Tasks 8 and 8b** — each probe was launched with the wrapper's FULL caller contract, not an abbreviation → verify: the recorded invocation for each run carries every one of `-Spec`, `-Task`, `-Phase`, `-Worktree`, `-BaseSha`, `-Schema`, `-Effort`, `-Prompt`, `-SpecSourcePath`, `-Attended:$true`, `-CriticalFilesConfirmed`, and exactly one of `-Authorized` / `-ScopeUnlocked` (with `-ScopeUnlockedReason` when the latter is used); the `-BaseSha` value equals `git -C <that run's worktree> rev-parse HEAD` taken at launch; the ledger row's attendance telemetry reads `true` and not null for both runs; and the two runs differ only in `-Task` and `-BaseSha`. A run that failed to launch for a missing `-BaseSha` or `-Prompt` is an argument-list defect and is re-run, never recorded as channel evidence; a `-ScopeUnlocked` run launched without `-CriticalFilesConfirmed` is the same kind of defect.
- [ ] **Tasks 8 and 8b** — each host-executed probe closed with BOTH in-session ledger rows, so the per-task family gate can vouch for it under its real task id → verify, for `8-detached-channel-probe` and for `8b-foreground-channel-probe` in turn: the ledger holds an in-session **build** row for that task with `phase` `build`, `builder_family` `anthropic`, the apex `worktree_key`, a fresh `run_id`, and an `end_tree_digest` that is a 64-hex digest or the literal `unverifiable`; it holds an **attended human-review** row for the same task with `phase` `human-review`, `attended` `true`, and `reviewed_run_id` equal to that build row's `run_id`; and `apex-family-gate.ps1 -Spec build-orchestrator-contract -Task <that task id> -WorktreeKey <the apex worktree key>` exits 0. Both rows are appended with the mutex-guarded helper `apex-ledger-append.ps1` under the `~/.claude` hooks directory (an existing host hook, cited by basename because this spec neither creates nor edits it), never a bare `Add-Content`.
- [ ] **Tasks 8 and 8b** — the two rows are actually on disk in the run ledger, matched mechanically per task → verify:

```
# resolve the ledger the same way the wrapper does; %TEMP%\apex\progress is the last fallback
L="${APEX_STATE_DIR:-$LOCALAPPDATA/apex}/progress/codex-run-ledger.jsonl"
for t in 8-detached-channel-probe 8b-foreground-channel-probe; do \
  grep -c "\"task\":\"$t\".*\"phase\":\"build\".*\"builder_family\":\"anthropic\"" "$L"; \
  grep -c "\"task\":\"$t\".*\"phase\":\"human-review\".*\"attended\":true" "$L"; \
done   # each >=1 — one in-session build row and one attended human-review row per probe task
# and the review row must BIND to the build row, not float free
grep -c '"phase":"human-review".*"reviewed_run_id":"insession-' "$L"   # >=2
```
- [ ] **Task 8** — the channel used matches the attendance rule → verify: the run was launched via the detached runner — a runner script started as a normal background task, a completion marker file, and a `Monitor` wait all exist for it, and no direct `Start-Process`/`schtasks` detachment was attempted — with the owner attended, which is what the rule assigns to an attended long dispatch; not a foreground call, and not an exception recorded anywhere.
- [ ] **Task 8b** — the plain-foreground confirmation ran to natural completion past the tool ceiling and is recorded: the harness MIGRATED the call rather than killing the process tree, a `.final` was written, the ledger row is terminal, the `--json` log ends on a complete final event, and the appended § Caveats bullet carries all **eleven** recorded fields → verify:

```
# scope every field check to the 8b bullet ALONE, not to Task 8's bullet and not to the whole document
B="$SCRATCH/apex-t8b-bullet.txt"   # session scratch dir, never the repo
# marker → next BLANK LINE (not marker → EOF), so this extract holds Task 8b's bullet ALONE
cd ~/apex/docs/research && awk '/\*\*Real-codex foreground confirmation/{f=1} f&&/^[[:space:]]*$/{exit} f' issue13-kill-ceiling-rootcause-2026-07-30.md > "$B"
grep -c 'Real-codex foreground confirmation' "$B"                         # 1
for f in 'harness build' 'run id' 'duration' 'ledger status' 'final event' '.final' 'verdict' 'migration notice' 'invocation:' 'worktree head:' 'prompt first line:'; do grep -ci -- "$f" "$B"; done   # each >=1 (ELEVEN fields)
# fields 9-11 are the durability set, identical in form to Task 8's
grep -cE 'invocation: *.*codex-dispatch\.ps1' "$B"                         # 1 (the invocation line as EXECUTED)
grep -cE 'worktree head: *[0-9a-f]{7,40}' "$B"                             # 1 (launch-time HEAD sha of THIS task's scratch worktree)
grep -ci 'prompt first line: *Emit exactly one line to stdout' "$B"        # 1
grep -c 'verdict: confirmed' "$B"                                          # 1 (re-opened is a blocker, not a pass)
grep -c 'verdict: re-opened' "$B"                                          # 0
# field 8 is the observable signal — the harness's OWN migration notice, quoted. `ABSENT` fails.
grep -ci 'migration notice: *ABSENT' "$B"                                  # 0
grep -cE 'migration notice: *"[^"]+"' "$B"                                 # 1 (a quoted verbatim notice, not a paraphrase)
# duration is a NUMERIC comparison against the ledger-derived value, not a presence test:
# D = (ended - started) in minutes, computed from that run_id's own ledger timestamps
awk 'match($0,/duration: *[0-9]+(\.[0-9]+)?/){d=substr($0,RSTART+10,RLENGTH-10)+0; print (d>=12) ? "PASS " d : "FAIL " d}' "$B"   # PASS
```

- [ ] **Task 8b** — the run itself passed its four mechanical checks on the foreground channel → verify: the ledger row for that `run_id` has a terminal status (not `running`, `adopting`, `stalled`, or `killed`); the numeric difference `ended - started` on that row is **≥ 12.0 minutes** (computed, then compared — never eyeballed); the `.final` file exists at the wrapper's reported path; and the last line of the `--json` log parses as a complete final agent event.
- [ ] **Task 8b** — the channel actually exercised was the harness-owned one → verify: NO runner script, NO background task, NO completion-marker file, and NO `Monitor` wait exist for this run — it was a plain foreground wrapper call, which is the only way the migration claim is tested rather than bypassed.
- [ ] **Task 8b** — the STOP condition is honoured → verify: if the process tree was killed at the ~10-minute ceiling instead of migrating, **or if the harness emitted no migration notice at all**, the appended bullet's seventh field reads `verdict: re-opened` and its eighth reads `migration notice: ABSENT` where applicable, no `Real-codex foreground confirmation` bullet claims `confirmed`, and the spec is surfaced as BLOCKED with Task 4's `## Dispatch channel` unattended sentences and Task 1's § Channel unattended bullet listed as requiring revision. A `re-opened` outcome fails this task and blocks the spec; it never passes as a completion. **A `confirmed` verdict with an absent eighth field is the same failure** — the run completing is not evidence that it migrated, only that it finished.
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
cd ~/.claude && git diff -U0 -- skills/apex-plan/SKILL.md | grep -c '^+last_updated:'      # 1
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
