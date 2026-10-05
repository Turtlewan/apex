---
spec: dispatch-pipeline-fixes
status: draft
autonomy_level: L2
risk: high
coder_effort: high
max_parallel_codex: 1
---

# Spec: Dispatch pipeline fixes
<!-- Governing contract: references/spec-contract.md. -->

**Identity:** Repair recipe population, scope and tree-pin treatment of declared build outputs, dispatch events, integration instructions, and the restore guard.

## Intent
- **Intent:** Make a filled AGENTS.md recipe dispatchable; enumerate new files as leaves; exclude only committed, declared, ignored, untracked build outputs from scope and tree pins; emit complete dispatch events; document and enforce safe integration.
- **Invariants:** Undeclared or host-curated paths remain checked; malformed declarations fail closed; snapshot format 2 refuses old snapshots; undeclared tree-pin digests remain identical; scope and tree-pin parsers are byte-identical; T7 requires attended critical-file confirmation.
- **Non-goals:** Engine residue scan in `apex-engine.ps1:222-238,917`; `engine-plan.ps1` verify-fence divergence; external repositories' AGENTS.md edits; `checkout-index -f` or `stash drop` guard rules. HOST records the Engine issue as `engine-build-output-residue`.

## Assumptions
- `C:/Users/User/.claude` is the build repo at HEAD `940d1f5`; all source line anchors in Tasks 1-7 refer to that commit. If HEAD differs, stop. -> impact: Stop.
- PowerShell 5.1, Git, Node, Python, and the build repo's fourteen-command `AGENTS.md` Verify fence are available. -> impact: Stop.
- HOST can perform Tasks 8-12 after coder verification and can make the live deployment only after the quiescence checks below. -> impact: Stop.

Simplicity check: one coordinated spec; phases are Wave 1, Wave 2, and HOST close-out.

## Prerequisites
- Specs that must be complete first: none.
- Environment setup required: attended build from `C:/Users/User/.claude` at `940d1f5`; preserve pre-existing dirty files; use hermetic TEMP repos with isolated `GIT_CONFIG_GLOBAL`. The Engine residue follow-up is not a prerequisite for the manual integration fallback.

## Files to Change
Grep evidence (run 2026-10-05): `rg -n 'Verify commands|apex:agents:verify|Get-DirtySet|Get-PathState|derivedCacheExclusions|Get-TreeFingerprint|scope_exit|scope_check|git checkout|P5\(c\)|restore|version:' C:/Users/User/.claude/skills C:/Users/User/.claude/hooks` and `rg --files --no-ignore C:/Users/User/.claude/skills/apex-code/scripts C:/Users/User/.claude/hooks`. Hits include `AGENTS-template.md:28-40`, `apex-init/SKILL.md:52-54,117-119`, `agents-md-population.md:11-13`, `apex-stack/SKILL.md:146`, `apex-baseline-check.ps1:1-22,268-271`, `codex-scope-check.ps1:158-195,296,757-767,822-837,898-913`, `tree-pin.ps1:197-280`, `codex-dispatch.ps1:823-824,2438,2492-2502,4187-4192,4346`, `parallel-codex.md:52-89`, `destructive-detect.js:410-415`, and their named test files. Run `rg -n 'D1|D2|D8|P5\(c\)|restore|apex-code|apex-governance' C:/Users/User/apex/docs/technical/adr C:/Users/User/apex/SKILL-HISTORY.md C:/Users/User/apex/SKILLS.md` for HOST consumers. The HOST `docs/status.md` row is prescribed by the brief and is deliberately not read during spec authoring.

| File | Operation | Notes |
|------|-----------|-------|
| skills/apex-orchestrate/templates/AGENTS-template.md | modify | T1 exact recipe and optional Build outputs section. |
| skills/apex-orchestrate/SKILL.md | modify | T1 version 2.4.1 and date. |
| skills/apex-init/SKILL.md | modify | T1 population text, version 1.7.3 and date. |
| skills/apex-plan/references/agents-md-population.md | modify | T1 population and Build outputs guidance. |
| skills/apex-plan/SKILL.md | modify | T1 version 2.7.1 and date. |
| skills/apex-stack/SKILL.md | modify | T1 population text, version 1.2.4 and date. |
| skills/apex-code/scripts/apex-baseline-check.ps1 | modify | T2 grammar and diagnostic. |
| skills/apex-code/scripts/baseline-check-test.ps1 | modify | T2 template and near-miss cases. |
| skills/apex-code/scripts/codex-scope-check.ps1 | modify | T3 leaf enumeration, snapshot v2, declared exclusions. |
| skills/apex-code/scripts/scope-check-test.ps1 | modify | T3 fixture matrix and expectation updates. |
| skills/apex-code/scripts/snapshot-scale-test.ps1 | modify | T3 comment and ignored 600-file performance/rename variant. |
| skills/apex-code/scripts/tree-pin.ps1 | modify | T4 declared exclusions and lockstep block. |
| skills/apex-code/scripts/tree-pin-test.ps1 | modify | T4 pin, digest, malformed, and lockstep cases. |
| skills/apex-code/scripts/codex-dispatch.ps1 | modify | T5 event values, scope output, leaf porcelain. |
| skills/apex-code/scripts/dispatch-events-test.ps1 | modify | T5 event mapping and wrapper tests. |
| skills/apex-code/references/orchestrator-protocol-schema.json | modify | T5 field descriptions only. |
| skills/apex-code/references/parallel-codex.md | modify | T6 Engine and manual integration procedure. |
| skills/apex-code/SKILL.md | modify | T6 Build outputs pointer, version 2.20.0 and date. |
| skills/apex-governance/SKILL.md | modify | T6 doctrine, version 2.3.2 and date. |
| skills/apex-governance/levels/L3.md | modify | T6 rollback and integration doctrine. |
| hooks/lib/destructive-detect.js | modify | T7 worktree-writing restore detection; CRITICAL. |
| hooks/destructive-guard-test.py | modify | T7 Bash and PowerShell cases; CRITICAL. |
| C:/Users/User/apex/docs/technical/adr/ADR-044-round8-deferred-designs.md | modify | HOST T8 dated D1 amendment. |
| C:/Users/User/apex/docs/technical/adr/ADR-046-doctrine-audit-resolutions.md | modify | HOST T9 D2/D8 amendment. |
| C:/Users/User/apex/docs/technical/adr/ADR-012-deterministic-enforcement-hooks.md | modify | HOST T10 never-list amendment. |
| C:/Users/User/apex/SKILL-HISTORY.md | modify | HOST T11 skill and hook rows. |
| C:/Users/User/apex/SKILLS.md | modify | HOST T11 wording check and correction if needed. |
| C:/Users/User/apex/docs/status.md | modify | HOST T12 only; this authoring dispatch must not read or write it. |

## Execution manifest
```json apex-manifest
{
  "version": 1,
  "repos": { "claude": "C:/Users/User/.claude" },
  "tasks": [
    { "id": "1", "repo": "claude", "files": [{ "path": "skills/apex-orchestrate/templates/AGENTS-template.md", "op": "modify" }, { "path": "skills/apex-orchestrate/SKILL.md", "op": "modify" }, { "path": "skills/apex-init/SKILL.md", "op": "modify" }, { "path": "skills/apex-plan/references/agents-md-population.md", "op": "modify" }, { "path": "skills/apex-plan/SKILL.md", "op": "modify" }, { "path": "skills/apex-stack/SKILL.md", "op": "modify" }], "depends_on": [], "effort": "low" },
    { "id": "2", "repo": "claude", "files": [{ "path": "skills/apex-code/scripts/apex-baseline-check.ps1", "op": "modify" }, { "path": "skills/apex-code/scripts/baseline-check-test.ps1", "op": "modify" }], "depends_on": ["1"], "effort": "medium" },
    { "id": "3", "repo": "claude", "files": [{ "path": "skills/apex-code/scripts/codex-scope-check.ps1", "op": "modify" }, { "path": "skills/apex-code/scripts/scope-check-test.ps1", "op": "modify" }, { "path": "skills/apex-code/scripts/snapshot-scale-test.ps1", "op": "modify" }], "depends_on": [], "effort": "xhigh" },
    { "id": "4", "repo": "claude", "files": [{ "path": "skills/apex-code/scripts/tree-pin.ps1", "op": "modify" }, { "path": "skills/apex-code/scripts/tree-pin-test.ps1", "op": "modify" }], "depends_on": ["1", "3"], "effort": "high" },
    { "id": "5", "repo": "claude", "files": [{ "path": "skills/apex-code/scripts/codex-dispatch.ps1", "op": "modify" }, { "path": "skills/apex-code/scripts/dispatch-events-test.ps1", "op": "modify" }, { "path": "skills/apex-code/references/orchestrator-protocol-schema.json", "op": "modify" }], "depends_on": [], "effort": "high" },
    { "id": "6", "repo": "claude", "files": [{ "path": "skills/apex-code/references/parallel-codex.md", "op": "modify" }, { "path": "skills/apex-code/SKILL.md", "op": "modify" }, { "path": "skills/apex-governance/SKILL.md", "op": "modify" }, { "path": "skills/apex-governance/levels/L3.md", "op": "modify" }], "depends_on": [], "effort": "medium" },
    { "id": "7", "repo": "claude", "files": [{ "path": "hooks/lib/destructive-detect.js", "op": "modify" }, { "path": "hooks/destructive-guard-test.py", "op": "modify" }], "depends_on": [], "effort": "medium" }
  ]
}
```

## Tasks
- [ ] **Task 1** - Template population: at `AGENTS-template.md:28-40` make the heading exactly `## Verify commands`; retain the marker and stub until filled, and use the literal population instruction `one fence directly under the heading` (blank lines only) when replacing both, with notes below the closing fence and grammar at `apex-baseline-check.ps1` header. The unfilled template remains UNPARSEABLE (3). Add optional `## Build outputs` after Verify with an empty fence (opening and closing triple-backtick lines) immediately below (valid zero entries), then prose instructing repo-relative ignored output directories, effective only when committed, with grammar at `codex-scope-check.ps1` header. At `apex-init/SKILL.md:52-54,117-119`, `agents-md-population.md:11-13`, `apex-stack/SKILL.md:146` and `apex-plan/SKILL.md:55-56,369` and `apex-orchestrate/SKILL.md:57`, make population replace marker and stub, keep the exact heading and adjacent fence, and put notes after it. In apex-init/SKILL.md, agents-md-population.md, apex-stack/SKILL.md, and apex-orchestrate/SKILL.md use the instruction `one fence directly under the exact heading` `## Verify commands` (blank lines only), with notes after the closing fence. Add the `Build outputs` population bullet: list every ignored directory verify generates, root and nested, never `**`; leave empty if verify creates none. From HEAD bump patch versions of orchestrate 2.4.0 to 2.4.1, init 1.7.2 to 1.7.3, plan 2.7.0 to 2.7.1, stack 1.2.3 to 1.2.4; set `last_updated` to build date, preserve 500-line caps. - files: skills/apex-orchestrate/templates/AGENTS-template.md, skills/apex-orchestrate/SKILL.md, skills/apex-init/SKILL.md, skills/apex-plan/references/agents-md-population.md, skills/apex-plan/SKILL.md, skills/apex-stack/SKILL.md — done when: self-contained `rg` checks find the exact `## Verify commands` heading, the literal population instruction `one fence directly under the heading` (blank lines only), the adjacent empty `## Build outputs` fence, and zero `Verify commands (` headings; the four mandated prose files contain the exact-heading fence instruction, their old `replace the stub` wording is absent, and `agents-md-population.md` contains the `Build outputs` bullet and `**` prohibition; T2 owns filled-template conformance.
- [ ] **Task 2** - Recipe diagnostic: add one Recipe grammar block in `apex-baseline-check.ps1:1-22`: exact `## Verify commands` or `## Preflight commands` with 0-3 leading spaces and trailing whitespace only; first nonblank line is a fence with info `''|cmd|bat|powershell|pwsh|bash|sh`; one fence before next heading; each nonblank, non-`#` fenced line is one command; prose only after the close. Keep strict matching at `:67-79`. At NO_RECIPE `:268-271` scan lines outside fences using `:52-63` logic for `^\s{0,3}##\s*(Verify|Preflight) commands\b.+` and print `[baseline] NO_RECIPE -- found near-miss heading at line N: '<text>'; the heading must be exactly '## <candidate>'` before exit 4. In `baseline-check-test.ps1:49-53,114-121` capture output and add filled real-template (one `echo ok>marker.txt` command, notes below: exit 0 and marker), unfilled template (3), suffix only (4 plus line diagnostic), suffix inside fence (no diagnostic), and unchanged decoy. - files: skills/apex-code/scripts/apex-baseline-check.ps1, skills/apex-code/scripts/baseline-check-test.ps1 — done when: `baseline-check-test.ps1` exits 0 with all five cases.
- [ ] **Task 3** - Scope classification: at `codex-scope-check.ps1:158-195` make Get-DirtySet call A `status --porcelain --untracked-files=all` for tracked and `??` leaves, and call B the existing `status --porcelain --ignored=traditional` filtered to `!!` only, both through Invoke-Git, never `traditional + -uall`. At `:296,562,848-849,876,937` pass status to Get-PathState; for `??` leaves compute in-process SHA-256 as `work:raw:<hex> index:-` without ls-files, retain tracked `git hash-object`, and treat `??` to `A ` as changed. Replace repeated scans at `:825-831,842-844,859-861,901-907,921-923` with one `$nowByNorm` hashtable. Add `format = 2` at `:566-573` and after `:616` throw `snapshot for '<task>' predates scope snapshot format 2 (leaf enumeration); re-run -Snapshot` for absent/other format (dispatcher still routes build 77 at `:4210-4215` and adopt 65 at `:2503-2511`). Add the byte-identical `# BEGIN build-outputs lockstep` / `# END build-outputs lockstep` pure-function block shared with T4: `ConvertFrom-BuildOutputsSection -Text` returns entries and warning, and `Test-IsDeclaredBuildOutputPath -Path -Entries`; keep the HEAD AGENTS fetch via local Invoke-Git adapter outside that block. Fetch committed AGENTS using `ls-tree --name-only <snap.head> -- AGENTS.md` then `show <snap.head>:AGENTS.md`; absent heading or file means zero entries. Count exact `## Build outputs` headings only outside Markdown fences; more than one exact heading empties the whole list with the single unparseable warning (fail closed). Exact `## Build outputs`, first nonblank line fence (info empty or `text`), one fence, prose only below; empty fence valid, max 32 entries; invalid line empties the whole list with one `[scope] WARNING: AGENTS.md '## Build outputs' unparseable (line N: <reason>); no build-output exclusions applied`. Reject `**`, `?`, `[`, `]`, `{`, `}`, `!`, `.`/`..`/`.git` segments, empty segments, leading or trailing `/`, backslashes, drive/absolute forms, and `*` in final segment; `*` matches within one segment only. OrdinalIgnoreCase segment-prefix match requires path segment count at least pattern segment count and never matches an ancestor. Factor ignored/untracked transition at `:822-837,898-913` into `Test-IsIgnoredUntrackedTransition`; apply to unchanged root-derived list `:757-767` and to declared paths only when `$applyDerivedCacheExclusions`, not host-curated, and ignored/untracked in both lockstep branches. Inventory failure at `:802-806` disables the declared class too. A git failure in either committed-AGENTS fetch (`ls-tree` or `show`) disables only the declared class, prints `[scope] WARNING: ... build-output declarations unavailable (<reason>); declared class disabled`, and continues checking every other class; do not treat a failed fetch as an absent file. Print a separate `[scope] N declared build-output path(s) excluded (AGENTS.md '## Build outputs' at HEAD; ignored + untracked + declared; every other ignored path is still checked).` Header states grammar, content-blindness, the full-content hashing cost of `-uall` `??` leaves, and that an ignored precondition inside a declared prefix may come from an untracked nested `.gitignore` or `.git/info/exclude`. In `scope-check-test.ps1` add fixtures A/B/B0/C/D/E/F/G1/G2/H/K/M/V exactly as Acceptance Criteria, an ignored `/projects/` variant curated by an indexed descendant, a nested-repository `??` container fixture, and committed-AGENTS `ls-tree` and `show <head>:AGENTS.md` failure shim cases at runtime-13, each preserving its rebaselined result and asserting the same disable-and-warn behaviour; rebaseline expectations at `:426,440,517,533,594,675,700,715,1061,1074,1094-1108` to leaves and format-2 throw; retain derived-cache 1-14 and lockstep `:1110-1216`; derived-cache 14 is guard-logic coverage using a format-2 snapshot with `statuses` stripped and the same attribution, plus a declared-class twin. Make absent format a separate throw case and update the `:1110-1112` comment. For a `??` row that is a container or ends in `/`, retain recursive Get-ContentHash directory digest with `index:-`. In `snapshot-scale-test.ps1`, keep the 600-leaf `??` case and add a committed `.gitignore` variant with an ignored 600-file directory (`!!` collapsed), <15s assertion, and rename-inside detection. - files: skills/apex-code/scripts/codex-scope-check.ps1, skills/apex-code/scripts/scope-check-test.ps1, skills/apex-code/scripts/snapshot-scale-test.ps1 — done when: both suites exit 0 and old snapshots fail closed with the named message.
- [ ] **Task 4** - Tree pin: copy T3's pure build-outputs lockstep block verbatim into `tree-pin.ps1`, keeping its own HEAD AGENTS adapter outside it (`Invoke-Git:66`); parse each pinned root's `HEAD:AGENTS.md` with the existence check; a git failure during `ls-tree` or `show` throws (fail closed), with a fetch-failure test. In `Get-TreeFingerprint:238-280`, after tool-cache filtering `:264-276` skip declared `!!` rows; in untracked `??` collapsed directories digested at `:123-146`, skip files equal to or below declared `!!` rows. No declaration preserves the exact old fingerprint and `treepin-v2` format. Print malformed-section warning only for `-Pin`/`-Verify`; `-Digest` prints exactly one 64-hex digest (`apex-engine.ps1:571-573,1019-1027`). In `tree-pin-test.ps1` add declared/undeclared ignored output, new `??` project with ignored bin and source write, tracked bin edit, malformed warning and digest silence, real template zero entries, and byte-equal marker extraction plus scratch-copy mutation probe; have the lockstep test read the sibling working-tree `codex-scope-check.ps1` via `Join-Path $PSScriptRoot 'codex-scope-check.ps1'` relative to `tree-pin-test.ps1`'s own script directory, with no commit, ref, or SHA lookup. HOST compare old `940d1f5` tree-pin `-Digest` on real `~/.claude` with new by running old,new,old,new back-to-back; each new digest must equal an adjacent old digest. - files: skills/apex-code/scripts/tree-pin.ps1, skills/apex-code/scripts/tree-pin-test.ps1 — done when: tree-pin tests exit 0 and undeclared digest comparison is identical.
- [ ] **Task 5** - Dispatch events: at `codex-dispatch.ps1:823-824` translate raw scope exit `$null`/0 to null without truncation, 1 and 65 to 65, 66 to 66, other values to null plus `scope_exit` in truncated. At `:4187-4192,2492-2502` capture stream 6 with `6>&1`, stringify each object using `ForEach-Object { [string]$_ }`, read `$LASTEXITCODE` immediately, then reprint and join for the event. At `:4346,2438` use `status --porcelain -uall`; keep raw ledger exit `:4308,4381,4387`. In `orchestrator-protocol-schema.json:14,21` describe `repo` as the dispatch `-Worktree` path and `scope_exit` translation; retain enum. In `dispatch-events-test.ps1:256-289,407-408` parameterize ScopeExit for `$null`, 0, 1, 65, 66, 2; assert event mapping, nonempty `scope_check` containing `[scope]`, and untracked leaf in porcelain; validate against schema. - files: skills/apex-code/scripts/codex-dispatch.ps1, skills/apex-code/scripts/dispatch-events-test.ps1, skills/apex-code/references/orchestrator-protocol-schema.json — done when: `dispatch-events-test.ps1` exits 0.
- [ ] **Task 6** - Integration procedure: replace `parallel-codex.md:52,55,59,72,89` checkout prescriptions with one procedure: primary Engine `Copy-EngineTaskFiles` (`engine-git.ps1:287-330`), `Restore-EngineWave`, `Stage-EngineWave`, op-aware, path-safe and SHA-256 verified; manual fallback is attended HOST Bash only, commit task worktree on `codex/<spec>-<task>`, precheck each main path with `git hash-object --path <p> <p>` against base blob (or absent for create), run `git diff --binary <base> codex/<spec>-<task> -- <non-delete paths> | git apply --check --index` then the same pipe with `git apply --index`, capture `git diff --cached --name-only --no-renames <base>` as BEFORE immediately before each task apply (including any `git rm` for deletions), before each `git rm` for a declared deletion assert that the path exists at base and is absent in the task branch/worktree (as in `engine-git.ps1:307-310` and `ADR-046:220-221`); abort integration if it remains present there; then use `git rm` for that deletion, capture the staged set again as AFTER immediately after that task, assert AFTER minus BEFORE equals exactly that task's path set with no removals, and postcheck each non-delete path's `git hash-object --path <p> <main file>` equals the task file's filtered hash (including `core.autocrlf=true`); deleted paths remain absent. Note raw `git show <sha>:<p> > <p>` is not equivalent; retire P5(c) integration allowance (teardown only). State Engine integration currently parks repos whose `## Build outputs` verify creates ignored dirs until `engine-build-output-residue` ships; use manual fallback for them. At `apex-code/SKILL.md:144-150` point to Build outputs and bump 2.19.0 to 2.20.0; at `apex-governance/SKILL.md:87,89` and `levels/L3.md:24` name Engine byte copy / `git apply` pipe and owner's `!` handback for rollback restore. Bump governance 2.3.1 to 2.3.2; set both dates to build date and hold caps. - files: skills/apex-code/references/parallel-codex.md, skills/apex-code/SKILL.md, skills/apex-governance/SKILL.md, skills/apex-governance/levels/L3.md — done when: old checkout prescriptions have zero grep hits and the `--index` pipe plus filtered hash and staged-set assertion are documented.
- [ ] **Task 7** - CRITICAL restore guard: after `destructive-detect.js:410-415` add an ES5 pure-string `restore` branch scanning args to `--`. `--staged` or a short cluster containing `S` sets staged; `--worktree` or cluster `W` sets worktree; process options in order with last-wins staged/worktree state; stop a short cluster at `s` because its inline value follows. Recognize unique long-option prefixes with `^--w(o(r(k(t(r(e(e)?)?)?)?)?)?)?$` for worktree and `^--st(a(g(e(d)?)?)?)?$` for staged; ambiguous `--s` sets neither; `--no-` plus any unique `staged` prefix clears staged, and `--no-` plus any worktree prefix clears worktree; `--so...` and `--source[=...]` consume their value. Any quoted token before `--` in a restore command blocks it. Return `worktree || !staged`, blocking source/path/plain/-SW/both-mode restores and allowing staged-only, including `--sta` and `-S`. Add Bash and PowerShell cases at `destructive-guard-test.py:6-118`: block `git restore --source=abc -- p`, `git restore p`, `git restore -SW p`, `git restore --source abc --staged --worktree -- p`, `git -C wt restore -W p`, `git restore --staged --worktr -- p`, `git restore --w p`, PowerShell `git restore --source=HEAD~1 -- p`, `git restore --staged --no-staged -- p`, `git restore --staged --no-st -- p`, and `git restore --staged "--worktree" p`; allow `git restore --staged p`, `git restore -S p`, `git restore --sta p`; preserve blocked `git checkout <sha> -- <p>` at `:82`. No fs/network/deps. - files: hooks/lib/destructive-detect.js, hooks/destructive-guard-test.py — done when: both `node --check` commands and Python guard suite exit 0; live attended `-CriticalFilesConfirmed` is required at build.
- [ ] **Task 8 (HOST)** - At `ADR-044-round8-deferred-designs.md:16-37,54` add a dated D1 amendment: per-repo `## Build outputs` from HEAD is a third class only when declared, ignored, untracked, and not host-curated; tree-pin shares it; parser duplication has a text-identity lockstep test; global basename exclusions are rejected, `**` is invalid, and exclusion is content-blind. State that an untracked nested `.gitignore` or `.git/info/exclude` can create the ignored precondition within a declared prefix. Record two-call `-uall` leaf enumeration with unchanged `!!` rows and snapshot format 2. - files: C:/Users/User/apex/docs/technical/adr/ADR-044-round8-deferred-designs.md — done when: dated amendment contains all terms and owner Option 2 (2026-10-05).
- [ ] **Task 9 (HOST)** - At `ADR-046-doctrine-audit-resolutions.md:108-111,246,249-252,280-282` amend D2 Consequences and D8 to name Engine byte copy or the indexed `git apply` pipe as integration and narrow P5(c) to teardown. - files: C:/Users/User/apex/docs/technical/adr/ADR-046-doctrine-audit-resolutions.md — done when: no D2/D8 instruction prescribes checkout path integration.
- [ ] **Task 10 (HOST)** - Amend the never-list in `ADR-012-deterministic-enforcement-hooks.md:38-43` to include worktree-writing `git restore`, retain staged-only allowance and blocked path checkout. - files: C:/Users/User/apex/docs/technical/adr/ADR-012-deterministic-enforcement-hooks.md — done when: both restore modes and staged-only exception are explicit.
- [ ] **Task 11 (HOST)** - Prepend dated `SKILL-HISTORY.md:4` rows for apex-code 2.20.0, apex-orchestrate 2.4.1, apex-init 1.7.3, apex-plan 2.7.1, apex-stack 1.2.4, apex-governance 2.3.2, and a hooks note, each naming its touched paths and this spec. Check `SKILLS.md:29-63` entries against the changed descriptions/versions and correct any stale wording. - files: C:/Users/User/apex/SKILL-HISTORY.md, C:/Users/User/apex/SKILLS.md — done when: each edited skill has a dated row and SKILLS.md has no stale routing text.
- [ ] **Task 12 (HOST)** - In `docs/status.md` close item 3b and record owner AGENTS.md action list: autoclicker plus worktrees v1-1/v1-2, Ari plus wt-02/03, orion-v2, claude-cockpit exact headings/fences; autoclicker commits `## Build outputs` entries `src/*/bin`, `src/*/obj`, `tests/*/bin`, `tests/*/obj`, `TestResults`, `tests/*/TestResults`. Record follow-up `engine-build-output-residue` and the `engine-plan.ps1` parser divergence. HOST alone performs this after coder verification. - files: C:/Users/User/apex/docs/status.md — done when: item 3b and both action lists are present.

## Wave plan
Wave 1: 1 -> 3 -> 5 -> 6 -> 7 | Wave 2: 2 -> 4. Dispatch one Codex task at a time (`max_parallel_codex: 1`; `risk: high` per `AGENTS-template.md:22` and `parallel-codex.md:99-103`); manifest dependencies govern. HOST after verify: [8, 9, 10, 11, 12].

## Deploy order
1. HOST records that no dispatch or Engine run is live: no ledger row is `running`, no Engine state is `running` or `awaiting-review`, and no background Codex process remains. Do not hand off updated scripts into live `~/.claude` until all three checks pass.
2. After Wave 1, HOST integrates it into a committed transient integration tip in an isolated worktree and branches both Wave-2 task worktrees from that tip. This gives T4's sibling working-tree `codex-scope-check.ps1` Wave-1 content for its lockstep test. Dispatches during the build use live old scripts while coders work in task worktrees; snapshot and check for a task must use the same old generation. Integrate T3 scope and T5 event changes together at the quiescent hand-off. Any stray old snapshot meets the named format-2 refusal.
3. Compare `tree-pin.ps1 -Digest` old,new,old,new back-to-back on undeclared `~/.claude` before switching; each new result must equal an adjacent old result. Land T7 in the live hook at hand-off; subsequent HOST rollback restore uses the owner's `!` handback. Run HOST autocrlf scratch-repo check of T6's indexed Bash pipe and declared-deletion guard, then authoritative full verify and HOST Tasks 8-12.

## Permissions
Coder tasks may modify only their manifest paths. HOST owns Tasks 8-12 after coder verification. The two hook files in Task 7 are critical: build needs live attended `-CriticalFilesConfirmed`; this section cannot pre-authorize them, and an AFK run parks. Host-state files also follow the live critical-file policy.

### File Operations
| Action | Paths |
|--------|-------|
| Modify (coder) | The twenty-two `claude` manifest files, Tasks 1-7 only. |
| Modify (HOST) | The six APEX files in Tasks 8-12. |
| Create/Delete | (none) |

### Commands
| Command | Purpose |
|---------|---------|
| Build repo `AGENTS.md` `## Verify commands` fence | Fourteen-command authoritative build fence. |
| `powershell.exe -NoProfile -File skills/apex-code/scripts/snapshot-scale-test.ps1` and named extra suites below | Additional regression coverage. |
| `node --check (Join-Path hooks 'destructive-command-guard.js')`; `node --check hooks/lib/destructive-detect.js`; `python hooks/destructive-guard-test.py` | Hook syntax and behavior. |
| `git ls-files -co --exclude-standard`, `git ls-files`, `git hash-object` | Per-file scope hashes. |
| `git show 940d1f5:skills/apex-code/scripts/tree-pin.ps1` | TEMP old-pin comparison. |

### Git Operations
| Operation | Scope |
|-----------|-------|
| Fixture commits/worktrees | Hermetic TEMP repos only. |
| Task integration | HOST follows Engine or indexed Bash fallback after quiescence; no direct checkout path restore. |
| Main repo commit/push | Outside this spec's coder work; HOST close-out policy applies. |

### Environment Access
| Variable | Purpose |
|----------|---------|
| `TEMP` | Hermetic repos and old tree-pin script. |
| `GIT_CONFIG_GLOBAL` | Isolate fixture Git config. |
| `APEX_STATE_DIR` | Isolate dispatch event/ledger fixtures. |

### Network
| Action | Purpose |
|--------|---------|
| None | All verification uses local fixtures. |

## Specialist Context
### Security
PowerShell 5.1 only: no `??`, `?.`, ternary, `&&`/`||`, or `Test-Json`; `-ceq`/`-ccontains` for identities; `@()` before `.Count` and `return ,$x` for arrays; local EAP Continue in try/finally around native calls and read `$LASTEXITCODE` immediately; Git through each script's fail-closed Invoke-Git; UTF-8 without BOM; ASCII-only source in `codex-scope-check.ps1:367-369`; no new dot-sourced module. `Write-Host` is stream 6 in-process and stdout in a child `powershell -File`; `-Digest` stays silent except its digest. JS classifier uses ES5 var/function syntax and no filesystem/network calls.

### Performance
The 600-untracked-leaf scale suite remains under 15 seconds and preserves rename detection; no per-leaf Git process storm.

### Accessibility
(none)

## Documentation
| Doc type | File | Action |
|----------|------|--------|
| Skill history/index | C:/Users/User/apex/SKILL-HISTORY.md, C:/Users/User/apex/SKILLS.md | HOST Task 11. |
| ADR | C:/Users/User/apex/docs/technical/adr/ADR-044-round8-deferred-designs.md, C:/Users/User/apex/docs/technical/adr/ADR-046-doctrine-audit-resolutions.md, C:/Users/User/apex/docs/technical/adr/ADR-012-deterministic-enforcement-hooks.md | HOST Tasks 8-10. |
| Status | C:/Users/User/apex/docs/status.md | HOST Task 12 only. |

## Acceptance Criteria
- [ ] Task 1 - From `C:/Users/User/.claude` run `rg -n '^## Verify commands$' skills/apex-orchestrate/templates/AGENTS-template.md`, `rg -n 'one fence directly under the heading' skills/apex-orchestrate/templates/AGENTS-template.md`, and `rg -U '## Build outputs\r?\n\x60{3}\r?\n\x60{3}' skills/apex-orchestrate/templates/AGENTS-template.md` -> verify each finds the exact heading, adjacency instruction, and empty adjacent Build outputs fence respectively; `rg -n 'Verify commands \(' skills/apex-orchestrate/templates` has zero hits. Run `rg -l -F 'one fence directly under the exact heading' skills/apex-init/SKILL.md skills/apex-plan/references/agents-md-population.md skills/apex-stack/SKILL.md skills/apex-orchestrate/SKILL.md` and `rg -l -F '## Verify commands' skills/apex-init/SKILL.md skills/apex-plan/references/agents-md-population.md skills/apex-stack/SKILL.md skills/apex-orchestrate/SKILL.md` -> verify each lists all four paths; ``rg -n -F 'replace the `<!-- apex:agents:verify -->` stub' skills/apex-plan/references/agents-md-population.md`` -> verify zero hits; ``rg -n -F '`<!-- apex:agents:verify -->` stub in AGENTS.md' skills/apex-init/SKILL.md`` and ``rg -n -F '(leave the `<!-- apex:agents:verify -->` stub if the stack is' skills/apex-init/SKILL.md`` -> verify zero hits for both old init phrasings; ``rg -n -F '(or leaving the `<!-- apex:agents:verify -->` stub if the stack is' skills/apex-stack/SKILL.md`` -> verify zero hits for the old stack phrasing. Run `rg -n -F 'Build outputs' skills/apex-plan/references/agents-md-population.md` and `rg -n -i 'never.*\*\*' skills/apex-plan/references/agents-md-population.md` -> verify both hit. Run `rg -n '^(version|last_updated):' skills/apex-orchestrate/SKILL.md skills/apex-init/SKILL.md skills/apex-plan/SKILL.md skills/apex-stack/SKILL.md` -> verify patch values in T1 and build date.
- [ ] Task 2 - Run `powershell.exe -NoProfile -File skills/apex-code/scripts/baseline-check-test.ps1` -> verify exit 0 with template conformance, unfilled exit 3, suffix exit 4 and near-miss diagnostic, fenced near-miss silence, and unchanged decoy.
- [ ] Task 3 - Run `powershell.exe -NoProfile -File skills/apex-code/scripts/scope-check-test.ps1` -> verify exit 0: A four new-directory authorized leaves gives 0 and exactly four written leaves; a nested repository is represented by a `??` container, retains recursive directory content digest with `index:-`, and an internal file change changes that digest; B committed `src/*/bin`, `src/*/obj`, `tests/*/bin`, `tests/*/obj` plus four ignored outputs gives 0 and `4 declared build-output path(s) excluded`; B0 no declaration reports bin/obj and exits 1; an ignored `/projects/` collapsed token with an indexed descendant is curated and still checked; C unauthorized `Evil.cs` under `src/App`, D ignored undeclared `x` under `.hooks` under `src/App`, E modified tracked `run.sh` under `bin`, and F declared but unignored output each exit 1 with path named.
- [ ] Task 3 - In that suite verify G1 working-tree-only declaration and G2 authorized mid-run AGENTS edit each still report would-be-declared output; H each malformed `**/bin`, `src/*`, `../x`, `src/?/bin`, `.git/hooks`, `src/*/bin/`, `/bin`, `src\*\bin`, `C:/x`, `src//bin`, and prose-before-fence warns once and exits 1; an exact heading inside a Markdown fenced example is ignored (zero entries, no warning), while duplicate exact headings outside fences yield the single warning, zero entries, and a reported would-be-declared path; K `src/*/bin` matches neither `src/bin` nor `src/App/sub/bin` by segment count; M one valid plus one invalid entry warns and reports the valid entry's output too; V snapshot has `format=2` and a separate absent-format case throws the exact re-Snapshot message. Committed-AGENTS `ls-tree` and `show <head>:AGENTS.md` failure shims at runtime-13 each retain the rebaselined expectation and assert `[scope] WARNING: ... build-output declarations unavailable (<reason>); declared class disabled` while other scope classes continue. Rebaselined paths are only `.env` under `scratch/nested`, `draft.txt` under `host-scratch`, `b.txt` under `scratch/nested`, `delete.txt` under `scratch/nested`, `session-x.jsonl` under `projects` at 594/700/715, `a.jsonl` under `projects` at 675 (b.jsonl runtime churn), `log.txt` under `.codex-scratch` at 1061/1074; old-snapshot case throws with no written file. Derived-cache cases 1-13 remain green; case 14 uses format 2 with `statuses` stripped, preserves its attribution and guard-logic result, and has a declared-class twin; the `:1110-1112` comment names this purpose. Existing lockstep checks remain green. The scope-check header names untracked nested `.gitignore` and `.git/info/exclude` as ignored-precondition sources and notes full-content hashing cost for `-uall` `??` leaves.
- [ ] Task 3 - Run `powershell.exe -NoProfile -File skills/apex-code/scripts/snapshot-scale-test.ps1` -> verify exit 0, the 600-leaf `??` case and committed `.gitignore` ignored 600-file `!!` collapsed-directory variant each complete in <15s, with rename detection inside each; its comment names both cases.
- [ ] Task 4 - Run `powershell.exe -NoProfile -File skills/apex-code/scripts/tree-pin-test.ps1` -> verify exit 0: declared ignored `src/App/obj` write after Pin verifies 0, undeclared gives 69; in a new `??` project dir a declared ignored bin write verifies 0 and a source write gives 69; tracked bin modification gives 69; malformed declaration yields only a 64-hex Digest, Pin warning, undeclared behavior; real template yields zero entries/no warning; a heading inside a Markdown fenced example yields zero entries/no warning, and duplicate `## Build outputs` headings outside fences warn once on `-Pin`/`-Verify` (nothing on `-Digest`), apply no exclusions, and a write to the would-be-declared ignored path between Pin and Verify then verifies 69; git failure during committed-AGENTS `ls-tree` or `show` throws; lockstep blocks are byte-equal and a mutated scratch copy fails, reading the sibling working-tree `codex-scope-check.ps1` via `Join-Path $PSScriptRoot 'codex-scope-check.ps1'` without a commit, ref, or SHA.
- [ ] Task 4 - HOST writes `git show 940d1f5:skills/apex-code/scripts/tree-pin.ps1` to TEMP, runs old,new,old,new `-Digest -Worktree C:/Users/User/.claude` back-to-back with no declaration, and compares exact outputs -> verify all exit 0, each prints one 64-hex digest, and each new digest equals an adjacent old digest.
- [ ] Task 5 - Run `powershell.exe -NoProfile -File skills/apex-code/scripts/dispatch-events-test.ps1` -> verify exit 0: raw null/0 map null without truncation, 1/65 map 65, 66 maps 66, 2 maps null with truncated; real-wrapper completion event has nonempty `scope_check` containing `[scope]` and an untracked-dir leaf in porcelain; event passes schema; ledger raw exit unchanged.
- [ ] Task 6 - Run `rg -n 'git checkout (<branch>|codex/)[^\n]* -- ' skills/apex-code/references/parallel-codex.md` -> verify zero hits; `rg -n 'git apply --check --index|git apply --index|hash-object --path|diff --cached --name-only --no-renames|engine-build-output-residue' skills/apex-code/references/parallel-codex.md` -> verify all five strings present. HOST scratch repo sets `core.autocrlf=true` and integrates three task cases in sequence (one create, one modify, one declared delete): immediately before each task's integration, capture `git diff --cached --name-only --no-renames <base>` as BEFORE; for create and modify, execute the exact Bash `git diff --binary ... | git apply --check --index` then `| git apply --index`; capture AFTER immediately after each task and verify AFTER minus BEFORE equals exactly that task's path set with no removals, both applies exit 0, and filtered pre/post hashes equal task files. For the delete, verify base contains the path and task branch/worktree lacks it before `git rm`; deletion then integrates with the exact staged-set delta. Repeat with the path still present in the task branch/worktree -> integration refuses before `git rm`. `rg -n '^(version|last_updated):' skills/apex-code/SKILL.md skills/apex-governance/SKILL.md` gives 2.20.0 and 2.3.2 with build date; all SKILL.md files remain <=500 lines.
- [ ] Task 7 - Run `node --check (Join-Path hooks 'destructive-command-guard.js')`, `node --check hooks/lib/destructive-detect.js`, and `python hooks/destructive-guard-test.py` -> verify all exit 0, all eleven blocked and three allowed restore cases from Task 7 pass, including last-wins `--no-staged` and `--no-st`, and a quoted pre-`--` option; checkout path remains blocked, and attended `-CriticalFilesConfirmed` was recorded at build.
- [ ] Task 8 (HOST) - Run `rg -n 'Build outputs|snapshot format 2|content-blind|P5\(c\)|git apply --index|git restore|engine-build-output-residue|dispatch-pipeline-fixes' C:/Users/User/apex/docs/technical/adr C:/Users/User/apex/SKILL-HISTORY.md C:/Users/User/apex/SKILLS.md C:/Users/User/apex/docs/status.md` -> verify dated D1/D2/D8/never-list amendments (D1 states nested untracked `.gitignore` and `.git/info/exclude` ignored-precondition sources), seven history entries (six skills plus hooks), current index wording, item 3b closure, external AGENTS action list, and follow-up recorded. HOST checks `docs/status.md`; coder does not.
- [ ] Task 9 (HOST) - Run `rg -n 'git apply --index|P5\(c\)|byte copy' C:/Users/User/apex/docs/technical/adr/ADR-046-doctrine-audit-resolutions.md` -> verify D2/D8 name the indexed pipe and Engine byte copy, and P5(c) is teardown only.
- [ ] Task 10 (HOST) - Run `rg -n 'git restore|staged' C:/Users/User/apex/docs/technical/adr/ADR-012-deterministic-enforcement-hooks.md` -> verify worktree restore is on the never-list and staged-only remains allowed.
- [ ] Task 11 (HOST) - Run `rg -n 'dispatch-pipeline-fixes' C:/Users/User/apex/SKILL-HISTORY.md` -> verify six dated skill rows and one hooks note; review `SKILLS.md` against six skill descriptions and verify no stale wording.
- [ ] Task 12 (HOST) - Run `rg -n '3b|autoclicker|Ari|orion-v2|claude-cockpit|engine-build-output-residue' C:/Users/User/apex/docs/status.md` -> verify closed item 3b, exact-heading owner list, autoclicker Build outputs list, and follow-up; HOST alone reads this file.
- [ ] Build fence - From `C:/Users/User/.claude` run the PowerShell block below -> verify all 14 commands in the existing `AGENTS.md` `## Verify commands` fence exit 0, including baseline, spec validation, dispatch preflight/events/author, tree pin, scope, Engine plan/git/dispatch/runner, Python guard, and two Node syntax checks.
```powershell
$source = Get-Content -LiteralPath AGENTS.md -Raw -Encoding UTF8
$fence = [regex]::Match($source, '(?ms)^## Verify commands\r?\n.*?^```\r?\n(?<cmds>.*?)^```[ \t]*\r?$')
if (-not $fence.Success) { throw 'Verify commands fence missing' }
$commands = @($fence.Groups['cmds'].Value -split '\r?\n' | Where-Object { -not [string]::IsNullOrWhiteSpace($_) })
if ($commands.Count -ne 14) { throw "Expected 14 verify commands, got $($commands.Count)" }
foreach ($command in $commands) {
    & powershell.exe -NoProfile -Command $command
    if ($LASTEXITCODE -ne 0) { throw "Verify command failed ($LASTEXITCODE): $command" }
}
```
- [ ] Extra suites - From `C:/Users/User/.claude` run `powershell.exe -NoProfile -File skills/apex-code/scripts/snapshot-scale-test.ps1`, `careless-coder-test.ps1`, `encoding-check-test.ps1`, `wave-scope-test.ps1`, `sibling-guard-test.ps1`, `dispatch-scopelock-test.ps1`, `dispatch-test.ps1`, and `git-stderr-test.ps1` (same scripts directory for each) -> verify each exits 0.
- [ ] Deploy - HOST records no running ledger row, no Engine `running`/`awaiting-review` state, and no background Codex before live hand-off -> verify all three checks are empty; Wave-2 worktrees branch from a committed transient integration tip containing Wave 1, giving T4's sibling working-tree scope file Wave-1 content; T3/T5 integrate together, old,new,old,new undeclared tree-pin Digest comparisons satisfy adjacent equality, T7 hook is live only after attended confirmation, and old scope snapshots fail closed by name.
- [ ] Per-file scope - Run the first block below in one persistent PowerShell session before build and the second after HOST close-out -> verify `scope hashes OK`. The `claude` side hashes `git ls-files -co --exclude-standard` plus every manifest file; APEX hashes tracked files outside `docs/drafts`, `docs/changes`, `docs/handoff`, and `docs/status.md`, permitting only the five HOST files there. A disappearing path skipped within one enumeration is tolerated; a before-hashed path absent after is an out-of-scope deletion. Every Files-to-Change path exists after HOST close-out.
```powershell
$claudeRoot = 'C:/Users/User/.claude'
$apexRoot = 'C:/Users/User/apex'
$claudeExplicit = @(
 'skills/apex-orchestrate/templates/AGENTS-template.md','skills/apex-orchestrate/SKILL.md',
 'skills/apex-init/SKILL.md','skills/apex-plan/references/agents-md-population.md',
 'skills/apex-plan/SKILL.md','skills/apex-stack/SKILL.md',
 'skills/apex-code/scripts/apex-baseline-check.ps1','skills/apex-code/scripts/baseline-check-test.ps1',
 'skills/apex-code/scripts/codex-scope-check.ps1','skills/apex-code/scripts/scope-check-test.ps1',
 'skills/apex-code/scripts/snapshot-scale-test.ps1','skills/apex-code/scripts/tree-pin.ps1',
 'skills/apex-code/scripts/tree-pin-test.ps1','skills/apex-code/scripts/codex-dispatch.ps1',
 'skills/apex-code/scripts/dispatch-events-test.ps1','skills/apex-code/references/orchestrator-protocol-schema.json',
 'skills/apex-code/references/parallel-codex.md','skills/apex-code/SKILL.md',
 'skills/apex-governance/SKILL.md','skills/apex-governance/levels/L3.md',
 'hooks/lib/destructive-detect.js','hooks/destructive-guard-test.py'
)
$apexExplicit = @('docs/technical/adr/ADR-044-round8-deferred-designs.md',
 'docs/technical/adr/ADR-046-doctrine-audit-resolutions.md',
 'docs/technical/adr/ADR-012-deterministic-enforcement-hooks.md',
 'SKILL-HISTORY.md','SKILLS.md')
function Add-ScopeHashes($root, $paths, $map) {
 Push-Location $root
 try {
  foreach ($path in @($paths | Sort-Object -Unique)) {
   $key = $root + '/' + $path.Replace('\','/')
   if (-not (Test-Path -LiteralPath $path -PathType Leaf)) { continue }
   $hash = & git hash-object -- $path
   if ($LASTEXITCODE -ne 0) {
    if (-not (Test-Path -LiteralPath $path -PathType Leaf)) { continue }
    throw "git hash-object failed: $key"
   }
   $map[$key] = [string]$hash
  }
 } finally { Pop-Location }
}
function Get-HighRiskScopeHashes {
 $map = [Collections.Generic.Dictionary[string,string]]::new([StringComparer]::Ordinal)
 Push-Location $claudeRoot
 try {
  $listed = @(git ls-files -co --exclude-standard)
  if ($LASTEXITCODE -ne 0) { throw 'git ls-files failed in .claude' }
 } finally { Pop-Location }
 Add-ScopeHashes $claudeRoot @($listed + $claudeExplicit) $map
 Push-Location $apexRoot
 try {
  $tracked = @(git ls-files)
  if ($LASTEXITCODE -ne 0) { throw 'git ls-files failed in apex' }
 } finally { Pop-Location }
 $tracked = @($tracked | Where-Object {
  $_ -ne 'docs/status.md' -and $_ -notlike 'docs/drafts/*' -and
  $_ -notlike 'docs/changes/*' -and $_ -notlike 'docs/handoff/*'
 })
 Add-ScopeHashes $apexRoot @($tracked + $apexExplicit) $map
 return ,$map
}
$scopeBefore = Get-HighRiskScopeHashes
```
After HOST close-out, run this second block in the same session:
```powershell
$scopeAfter = Get-HighRiskScopeHashes
$allowed = @($claudeExplicit | ForEach-Object { $claudeRoot + '/' + $_ }) +
           @($apexExplicit | ForEach-Object { $apexRoot + '/' + $_ })
foreach ($path in $allowed) {
 if (-not (Test-Path -LiteralPath $path -PathType Leaf)) { throw "Missing scoped file: $path" }
}
if (-not (Test-Path -LiteralPath (Join-Path $apexRoot 'docs/status.md') -PathType Leaf)) {
 throw 'Missing HOST docs/status.md'
}
$paths = @(@($scopeBefore.Keys) + @($scopeAfter.Keys) | Sort-Object -Unique)
foreach ($path in $paths) {
 if ($allowed -ccontains $path) { continue }
 if (-not $scopeBefore.ContainsKey($path) -or -not $scopeAfter.ContainsKey($path) -or
     $scopeBefore[$path] -cne $scopeAfter[$path]) { throw "Out-of-scope file changed: $path" }
}
'scope hashes OK'
```
- [ ] Reachability - Run `powershell.exe -NoProfile -File skills/apex-code/scripts/dispatch-events-test.ps1` and `tree-pin-test.ps1` from the build repo -> verify the real wrapper records the scope verdict and leaf porcelain, while a pin spanning a declared ignored build write verifies 0 and an undeclared write verifies 69.

## Progress
_(The build writes here - do not edit manually)_
