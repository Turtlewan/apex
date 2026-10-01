---
spec: spec-author-routing
status: draft
autonomy_level: L2
---

# Spec: Spec author routing
<!-- Governing contract: references/spec-contract.md. -->

**Identity:** Route apex-plan spec creation and revision through the wrapper's gpt-6-sol author mode, retain a promotion-time trial record, and correct the plan-check and model-routing text.
<!-- -> why: see docs/technical/adr/ADR-048-role-redesign.md. -->

## Intent

- **Intent:** The planning host sends every draft write to a fresh author dispatch and records author and review outcomes at promotion.
- **Invariants:** The host never edits a draft; same-repo author runs are sequential; the Sol cold read remains gpt-5.6-sol at xhigh and is independent; a Claude apex-spec-reviewer supplies the cross-family spec review.
- **Non-goals:** Sibling specs own apex-orchestrate, apex-code, and the session hook. The host owns SKILL-HISTORY.md and creation of the trial log at integration.

## Assumptions

- `C:\Users\User\.claude` contains the shipped wrapper `skills/apex-code/scripts/codex-dispatch.ps1` with `-AuthorSpec`, `-Model gpt-6-sol`, and `-ExpectedDigest` -> impact: Stop.
- The host will create `C:\users\user\apex\docs\research\spec-author-trial.md` with its header at this wave's first promotion, before the first append -> impact: Stop.
- The three target files retain the verified text anchors below at build start -> impact: Caution; recheck exact old-line anchors before editing.

Simplicity check: A single spec covers the three files owned by this routing slice; sibling specs own their disjoint files.

## Prerequisites

- Specs that must be complete first: `docs/changes/done/wrapper-model-author.md` (wrapper author mode, shipped in the build repo at `0a805d7`). Sibling specs `routing-build-asides` and `routing-session-hook` depend on this spec and integrate after it, in one commit batch at session end.
- Environment setup required: an attended host for owner escalation; the build worktree is `C:\Users\User\.claude`.

## Files to Change

| File | Operation | Notes |
|------|-----------|-------|
| `C:\Users\User\.claude\skills\apex-plan\SKILL.md` | modify | Author dispatch and revision, trial-log append, version 2.5.0 and build-date `last_updated` |
| `C:\Users\User\.claude\skills\apex-plan\references\sol-plan-check.md` | modify | Independent cold-read label and author-owned amendments |
| `C:\Users\User\.claude\skills\apex-plan\references\model-routing.md` | modify | Opus 5.5 host pin and gpt-6-sol author route |
| `C:\users\user\apex\docs\research\spec-author-trial.md` | create | HOST at first promotion; header plus first row; not a coder file |
| `C:\users\user\apex\docs\changes\spec-author-routing.md` | modify | HOST records the build date in Progress at build start; not a coder file |
| `C:\users\user\apex\docs\technical\adr\ADR-048-role-redesign.md` | reference only | Cited as a source; not modified |

Grep evidence: In the listed files, `Select-String -SimpleMatch` found `model: opus` 1, `ADR-045` 1, `FRESH drafter` 1, `review.log` 4, and `Closing the session` 1 in `apex-plan/SKILL.md`; `independent cross-family read` 1, `planning applies accepted amendments itself` 1, `spec amended` 1, `resolution table lands` 1, and `Effort xhigh` 2 in `sol-plan-check.md`; `Fable 5` 1, `Opus keeps the spec-author` 1, and `Pin every Claude-side dispatch` 1 in `model-routing.md`.
Grep evidence: Consumer search with `rg --no-ignore --hidden -o -F -g '*.md' -g '!**/fixtures/**'` over `C:\Users\User\.claude\skills` and `hooks` found `sol-plan-check.md` 2, `model-routing.md` 1, and `apex-plan/SKILL.md` 1. The referenced callers are the plan skill and its `adr-and-status-procedures.md` reference; no consumer file is in this spec's write set.

## Tasks

- [ ] **Task 1: Route draft writes and retain promotion measurements** -- file: `C:\Users\User\.claude\skills\apex-plan\SKILL.md` -- done when: the host has explicit create, revise, exit, owner-escalation, and promotion-log procedures.
  - At Session start step 3, lines 37-38, replace the line beginning ``   patch the spec in place, or pull it back to `docs/drafts/`.`` with an instruction to pull it back to `docs/drafts/` and apply the fixes through an `-AuthorSpec` revise dispatch; retain deletion of the drained progress record.
  - At lines 113-118, replace the paragraph beginning `Template:` and ``**You do not draft it yourself (ADR-045).** Resolve the open decisions, then dispatch a `model: opus` `` through `hand the author and grade against.` with an ADR-048 author contract. The host assembles a prompt pack containing the adjudicated plan brief, the exact template path `~/.claude/skills/apex-orchestrate/templates/spec-template.md`, target `docs/drafts/<short-name>.md`, and the three rules at lines 150-160 (no why inline except Intent, mechanism in each task, one concern per task). For an absent draft it calls `& "$env:USERPROFILE\.claude\skills\apex-code\scripts\codex-dispatch.ps1" -AuthorSpec -Model gpt-6-sol -Task author -Spec <short-name> -Authorized "docs/drafts/<short-name>.md" -Worktree <repo> -BaseSha <HEAD> -Effort high -Prompt $pack` in create mode. A zero exit means the wrapper left exactly that one regular draft file.
  - After line 118, state that every later write to an existing draft, including reviewer fixes, readiness fixes, cold-read amendments, the post-cap fresh draft, and owner-directed fixes, is a new stateless gpt-6-sol `-AuthorSpec` call with the same arguments plus `-ExpectedDigest (git -C <repo> hash-object "docs/drafts/<short-name>.md")` and a prompt containing the requested changes. The host never edits the draft itself. Author dispatches into one repo run sequentially; do not pass `-AllowSharedWorktree`, which author mode refuses.
  - Replace the generic post-cap `FRESH drafter` instruction at lines 235 and 243-245 with a fresh `-AuthorSpec` revise dispatch against the same draft path and the closed round-3 fix list; keep the lifetime cap, same-path constraint, readiness gate, and cold read. At line 265 replace `fix in place and re-run from the top` with an author revise dispatch followed by a full readiness rerun.
  - In Writing the spec, add this author exit rule and refer to the exit-code table in `apex-code`'s `Codex dispatch` section by name for diagnosis: exit 0 -> review the draft. Exit 75 whose output says STILL RUNNING -> wait for the coder's `.final`, then run the wrapper's printed `-Adopt -RunId <id>` command without `-AuthorSpec` so the skipped scope, tree-pin, encoding, and verdict gates run; route adoption exit 0 to review and every other result to the OWNER. Never act on the call's timeout. Any other non-zero author exit, including an `[adopt] REFUSED (exit 75)` -> the host reads the wrapper's printed diagnosis and the `.final`/concerns, then brings them to the OWNER with a recommendation. The host never edits the draft, never deletes or reverts files, and never re-dispatches without the owner's decision. Recognize quota-out by a usage-limit/429/quota message in the `.final` or log, or Codex failing to launch -> owner. Only the owner may approve a `model: sonnet` Agent (non-wrapper) author fallback; record the chosen model and never fall back silently. Before and after that Agent dispatch, record `git hash-object` for every file under `docs/drafts` and the full `git status --porcelain --ignored -uall -- docs/drafts` list; accept only when the target draft is the sole new or changed content and no other path appears. For revise, also check that the pre-dispatch draft hash matches the expected digest. Retain the pre-draft Sol architecture pass and post-readiness cold read. Bump frontmatter `version: 2.4.1` to `2.5.0` and `last_updated: 2026-08-02` to the recorded build date; add `docs/technical/adr/ADR-048-role-redesign.md` to `sources` and keep `description` unchanged.
  - While an author run is in flight, the host makes NO writes to the target repo, including sidecar row completion, status.md, and plan files, until the coder's `.final` exists or the wrapper confirms no coder launched, not merely until the wrapper call returns. Concurrent host writes are attributed to the author and cause a false exit 65.
  - The wrapper refuses author mode with exit 74 when the target repo's `docs/drafts` has no tracked file. Route that refusal to the OWNER; do not seed a file automatically.
  - The HOST creates `docs/drafts/<short-name>.review.log` at whichever comes first: the pre-draft arch-check row or the first author dispatch. New rows are only APPENDED, never overwritten or recreated; phase-2 completion fills pending cells of the existing row. For each author dispatch, append a two-phase row. At dispatch, fill Round = `author`, Dispatched (UTC), Reviewer = `author:<model>:<create|revise>`, and Spec digest = the `-ExpectedDigest` for a revise or `- (create)`; set Verdict and Disposition to `pending`. After a wrapper run, complete that same row with Verdict = the wrapper exit. For wrapper author rows, Disposition = `launched` only if the ledger has a dispatch row AND a child process started; exits 72/74/76/79/80/71 before launch and exit 69 at the launch boundary are `not-launched`, even if exit 69 has a ledger row. For an owner-approved Sonnet Agent dispatch, use Reviewer = `author:sonnet:<create|revise>`, Verdict = `agent`, and Disposition = `launched` only after its child process starts. The host completes the row only after the run, subject to the write freeze. Review rows follow. In Convergence control, replace `created by the HOST at round 1` with the whichever-comes-first rule, replace `One row per round` with `One row per author dispatch or review round`, and replace `A missing sidecar means round 1` with `Zero non-VOID integer reviewer-family rows means round 1`. Define Round-column tokens: `arch-N` = pre-draft architecture pass; `N` (an integer) = reviewer-family round; `sol-N` = Sol cold read; `delib-N` = Sol deliberation; `author` = author dispatch; `owner` = an owner decision. Author rows never count toward the reviewer-family round cap or the Sol round count.

  - At lines 335-340, replace the Deep Details / Light sentence that moves the draft and deletes `<short-name>.review.log` with an ordered procedure: before deleting the sidecar at promotion, append one row to `C:\users\user\apex\docs\research\spec-author-trial.md`; then delete the sidecar and continue the existing promotion close-out. Keep the current status and Bug Fix instructions outside this change.
  - State the log columns exactly: `date | repo | spec | author models | reviewer-family rounds | Sol rounds | intent drift | notes`. Use the promotion date and repo path. Derive author models only from sidecar Round `author` rows with Disposition = `launched` and Reviewer = `author:<model>:<create|revise>`; preserve the order of multiple launched create rows and count repeated models, then list revise rows in order with counts, for example `gpt-6-sol create x2; revise gpt-6-sol x1`. Reviewer-family rounds = non-VOID integer `N` rows (one row per multi-lens pass). Sol rounds = non-VOID `sol-N` and `delib-N` rows; `arch-N` rows are excluded. A legacy spec promoted with no sidecar logs author models = `unknown (no sidecar)` and zero round counts. Set intent drift to `y` only when the owner flags a mismatch at the confirmation digest, otherwise `n`. Append a new row for a re-promotion of the same repo/spec, with `re-promote` in notes; do not overwrite an earlier row. As an explicit HOST integration step at this wave's first promotion, create `C:\users\user\apex\docs\research\spec-author-trial.md` with the Markdown header `| date | repo | spec | author models | reviewer-family rounds | Sol rounds | intent drift | notes |` and separator before the first append; the HOST verifies that header with `Select-String -LiteralPath C:\users\user\apex\docs\research\spec-author-trial.md -SimpleMatch -Pattern '| date | repo | spec | author models | reviewer-family rounds | Sol rounds | intent drift | notes |'` before appending. This file is outside the build write set.

- [ ] **Task 2: Correct the cold read and return accepted amendments to the author** -- file: `C:\Users\User\.claude\skills\apex-plan\references\sol-plan-check.md` -- done when: the cold read is classified correctly and no instruction makes planning edit a draft directly.
  - At lines 3-5, replace `One independent cross-family read per spec` with `One independent, fresh, stateless read per spec`. Add immediately after that opening that for a gpt-6-sol-authored spec, the Claude `apex-spec-reviewer` is the cross-family check; the gpt-5.6-sol cold read is an independent same-family read. Keep the skip-trivial rule, the `-Phase review` wrapper dispatch at lines 13-15, and the `-Effort xhigh` command and standing xhigh floor at lines 32-34 unchanged. Do not route this read to gpt-6-sol in this wave.

  - At lines 30-31, keep the line-30 prefix ``- `--sandbox read-only` + no profile: Sol can inspect the repo, writes nothing.`` and replace only from `**Sol never` onward with: ``**Sol never edits the spec.** Accepted amendments go to the author in an `-AuthorSpec` revise dispatch with `-ExpectedDigest` (apex-plan, Writing the spec); planning does not edit the draft.``
  - At lines 57-65, preserve the deliberation cap and resolution states, but change `**amend** (accept; change the spec)`, `accepted (spec amended)`, and ``The resolution table lands in the spec's `## Intent` block as invariants.`` to say that accepted changes and Intent invariants are sent to the author through an `-AuthorSpec` revise dispatch with `-ExpectedDigest`. The host still adjudicates findings and never edits the draft. The pre-draft instruction at lines 114-118 still adjudicates findings into the plan before any draft exists.
  - At the cold-read row instruction (lines 35-40), the deliberation row instruction (lines 69-73), and the pre-draft arch-check row instructions (lines 92-96 and 126-140), use Round tokens `sol-N`, `delib-N`, and `arch-N` respectively. The pre-draft arch-check creates the sidecar only when absent; otherwise every pass APPENDS to it. No row is overwritten or recreated. Match apex-plan's Round-column token definitions and counting rules.

- [ ] **Task 3: Correct model routing** -- file: `C:\Users\User\.claude\skills\apex-plan\references\model-routing.md` -- done when: the host pin and author role match ADR-048.
  - At lines 3-6, replace `The session model is Fable 5 (expensive)` and the inheritance clause with `The session model is Opus 5.5 at medium effort` and ``an Agent/Task dispatch that omits `model:` inherits Opus 5.5``; keep the explicit-pin requirement and the fork warning.
  - At lines 14-15, replace the current clause starting `Opus keeps the spec-author, build-orchestrator, and high-risk-reviewer roles` and ending `coder.` with ``Specs are authored by gpt-6-sol through the wrapper's `-AuthorSpec` (apex-plan, Writing the spec; ADR-048). Opus keeps the build-orchestrator and high-risk-reviewer roles; it is not a coder.`` Preserve the surrounding coder fallback rubric.

## Wave plan

Wave 1: [Task 1, Task 2, Task 3]. The three task files are disjoint and have no task dependency.

## Permissions

The following NON-CRITICAL actions may run during build. The three target skill files are not hook, settings, or host-state files. This section does not authorize edits to the sibling specs' files or the central trial log. Critical paths still require live attended confirmation under apex-governance; this spec grants none.

### File Operations

| Action | Paths |
|--------|-------|
| Create | (none) |
| Modify | `skills/apex-plan/SKILL.md`, `skills/apex-plan/references/sol-plan-check.md`, `skills/apex-plan/references/model-routing.md` in `C:\Users\User\.claude` |
| Delete | (none) |

### Commands

| Command | Purpose |
|---------|---------|
| `Get-Content -LiteralPath <target>` | Read build files and check skill caps |
| `Get-ChildItem -LiteralPath C:\Users\User\.claude\skills -Directory -Filter apex-*` | Enumerate skill caps |
| `powershell.exe -NoProfile -File $baselineCheck -Full -Worktree $buildRepo` | Run the build repo's verify fence; variables are set in the acceptance command below |
| `git -c safe.directory=C:/Users/User/.claude -C C:\Users\User\.claude status --porcelain --ignored -uall` | Record the full build-tree status before and after, excluding named runtime paths in the comparison |
| `git -c safe.directory=C:/Users/User/.claude -C C:\Users\User\.claude hash-object <file>` | Record content hashes for every working-tree file under the build directory before and after |
| `git -c safe.directory=C:/Users/User/.claude -C C:\Users\User\.claude show HEAD:<path>` | Read HEAD lines for the line-sequence comparison |
| `Select-String -LiteralPath C:\users\user\apex\docs\research\spec-author-trial.md -SimpleMatch -Pattern <header>` | HOST checks the central log header at first promotion, outside BUILD acceptance |

### Git Operations

| Operation | Scope |
|-----------|-------|
| `git status`, `git hash-object`, `git show` | Read-only full-tree scope and line checks in `C:\Users\User\.claude` |
| `git add -f` | Host integration only: the three named `~/.claude` target files, which the repo's `*` ignore rule hides |
| `git commit` | Host integration only, after approval; the builder stages and commits nothing |

### Environment Access

| Variable | Purpose |
|----------|---------|
| `USERPROFILE` | Resolve the build repo and wrapper path in documented host commands |
| Build date recorded in Progress | HOST writes the date to `C:\users\user\apex\docs\changes\spec-author-routing.md` at build start; every date comparison uses that value |

### Network

| Action | Purpose |
|--------|---------|
| (none) | Markdown-only build |

## Specialist Context

### Security

(none)

### Performance

Author dispatches sharing one repo remain sequential; review-only plan checks retain their existing concurrency rule.

### Accessibility

(none)

## Documentation

| Doc type | File | Action |
|----------|------|--------|
| Skill | `skills/apex-plan/SKILL.md` | Routing, trial logging, version and date |
| Reference | `skills/apex-plan/references/sol-plan-check.md` | Independent read and author revision |
| Reference | `skills/apex-plan/references/model-routing.md` | Host and author roles |
| Host integration | `C:\users\user\apex\SKILL-HISTORY.md` | Host applies the apex-plan 2.5.0 row; not a coder file |
| Host integration | `C:\users\user\apex\docs\research\spec-author-trial.md` | Host creates header at first promotion; not a coder file |
| Host integration | `C:\users\user\apex\docs\changes\spec-author-routing.md` | Host records the build date and exact-line manifest in Progress at build start; not a coder file |
| Index | `C:\users\user\apex\SKILLS.md` | No change; description and skill set are unchanged |

## Acceptance Criteria

- [ ] Every acceptance criterion below inherits the exact-line gate for all three edited files; structural checks are additional. Before the build, the HOST writes in this spec's Progress section the build date and an edit manifest for each target file: every entry contains the complete exact old HEAD line sequence and its complete intended new line sequence, including unchanged anchor text for an insertion. Each old sequence must identify one unique HEAD occurrence; use a longer exact sequence if one line is ambiguous. Record the manifest before any build edit; do not derive expected text from the finished file. The PowerShell comparison reads each file's HEAD lines with `git show HEAD:<path>`, locates edits by exact old text rather than fixed line numbers, substitutes the manifest's exact new lines, and compares the resulting sequence with `Get-Content` using ordinal, case-sensitive full-line equality (`-ceq`) and equal line counts. Every edited line must equal its intended full line; every other line must equal HEAD in the same order. A missing, duplicate, overlapping, or unmatched anchor fails. No substring, wildcard, or line-number-only check can satisfy any edited-line criterion.

  ```powershell
  # Repeat for each target: $relPath is repo-relative; $edits comes from Progress.
  # Each edit has Old = [string[]] and New = [string[]].
  $headLines = @(git -c safe.directory=C:/Users/User/.claude -C $buildRepo show "HEAD:$relPath")
  if ($LASTEXITCODE -ne 0) { throw "HEAD read failed: $relPath" }
  foreach ($edit in $edits) {
    if ($edit.Old.Count -eq 0) { throw 'empty old anchor' }
    $hits = @(
      for ($i = 0; $i -le $headLines.Count - $edit.Old.Count; $i++) {
        $equal = $true
        for ($j = 0; $j -lt $edit.Old.Count; $j++) {
          if ($headLines[$i + $j] -cne $edit.Old[$j]) { $equal = $false; break }
        }
        if ($equal) { $i }
      }
    )
    if ($hits.Count -ne 1) { throw "old anchor is missing or ambiguous: $relPath" }
    $edit.Start = $hits[0]
  }
  $ordered = @($edits | Sort-Object Start)
  $expected = [System.Collections.Generic.List[string]]::new()
  $cursor = 0
  foreach ($edit in $ordered) {
    if ($edit.Start -lt $cursor) { throw "overlapping edits: $relPath" }
    while ($cursor -lt $edit.Start) { $expected.Add($headLines[$cursor]); $cursor++ }
    foreach ($line in $edit.New) { $expected.Add($line) }
    $cursor += $edit.Old.Count
  }
  while ($cursor -lt $headLines.Count) { $expected.Add($headLines[$cursor]); $cursor++ }
  $actual = @(Get-Content -LiteralPath (Join-Path $buildRepo $relPath))
  if ($actual.Count -ne $expected.Count) { throw "line count differs: $relPath" }
  for ($i = 0; $i -lt $actual.Count; $i++) {
    if ($actual[$i] -cne $expected[$i]) { throw "full line differs: $relPath at $i" }
  }
  ```
- [ ] Task 1 -> verify with the exact-line gate: the create command contains `-AuthorSpec -Model gpt-6-sol -Task author`, the named target and authorized path, worktree, base SHA, high effort, and prompt. Every later draft edit uses a fresh revise dispatch with `-ExpectedDigest`, including Session start, reviewer, readiness, cold-read, post-cap, and owner fixes. The host never edits the draft. The recorded build date, not verification-time `Get-Date`, is the full expected `last_updated` line; version is 2.5.0, ADR-048 is a source, and the description block is byte-identical to HEAD.
- [ ] Task 1 -> verify with the exact-line gate: exit 0 routes to review. Exit 75 with STILL RUNNING waits for the coder's `.final`, then runs the printed `-Adopt -RunId <id>` command without `-AuthorSpec` to execute skipped scope, tree-pin, encoding, and verdict gates; adoption exit 0 routes to review and every other adoption result routes to the OWNER. All other non-zero author exits, including `[adopt] REFUSED (exit 75)`, route to the OWNER with the wrapper diagnosis and `.final`/concerns. The host freezes target-repo writes while the coder runs, does not edit, delete, or revert the draft, and does not redispatch without the owner's decision. Usage-limit/429/quota and launch failure route to the OWNER. If `docs/drafts` has no tracked file, exit 74 routes to the OWNER without automatic seeding.
- [ ] Task 1 -> verify with the exact-line gate: an owner-approved `model: sonnet` Agent fallback records before/after `git hash-object` for every file under `docs/drafts` plus full `git status --porcelain --ignored -uall -- docs/drafts` lists; only the target draft has new or changed content, and no other path appears. A revise also checks the pre-dispatch target hash against `-ExpectedDigest`. A wrapper's two-phase `author` sidecar row is `launched` only with a ledger dispatch row AND a started child; exits 72/74/76/79/80/71 before launch and 69 at the launch boundary are `not-launched`. A Sonnet Agent row is `launched` only after its child starts. The sidecar creation, append-only rows, and Round tokens follow Task 1.
- [ ] Task 1 -> verify with the exact-line gate: the edited skill text directs the HOST to count the sidecar into the eight-column trial row before deletion. Author models come only from launched `author` rows; multiple launched create rows and revisions remain in order with model counts, including `gpt-6-sol create x2; revise gpt-6-sol x1`. A legacy no-sidecar row uses `unknown (no sidecar)` and zero round counts. Reviewer-family and Sol counts, intent drift, and re-promotion follow Task 1. The central trial-log file and its header check are HOST promotion steps, not BUILD acceptance criteria.
- [ ] Task 2 -> verify with the exact-line gate: the gpt-5.6-sol cold read is independent, fresh, stateless, and same-family for a gpt-6-sol-authored spec; Claude `apex-spec-reviewer` is the cross-family reviewer. The read remains xhigh and uses `-Phase review`. Accepted cold-read and deliberation amendments, including Intent invariants, go to the author through `-AuthorSpec` revise with `-ExpectedDigest`; the host adjudicates without editing the draft. Rows use `sol-N`, `delib-N`, and `arch-N`, and the pre-draft sidecar is created only if absent, then appended.
- [ ] Task 3 -> verify with the exact-line gate: the session model is Opus 5.5 at medium effort; an unpinned Agent/Task inherits Opus 5.5; explicit model pins remain required. gpt-6-sol authors specs through `-AuthorSpec`; Opus retains build orchestration and high-risk review.
- [ ] Caps and pointers -> verify: `Get-ChildItem -LiteralPath C:\Users\User\.claude\skills -Directory -Filter apex-* | ForEach-Object { $p = Join-Path $_.FullName 'SKILL.md'; if ((Get-Content -LiteralPath $p).Count -gt 500) { throw $p } }` completes; `$refs = Get-ChildItem -LiteralPath C:\Users\User\.claude\skills -Recurse -File -Filter '*.md' | Select-String -Pattern '~/\.claude/skills/apex-[a-z-]+' -AllMatches | ForEach-Object { $_.Matches.Value } | Sort-Object -Unique; foreach ($ref in $refs) { if (-not (Test-Path -LiteralPath ($ref -replace '^~', 'C:\Users\User'))) { throw $ref } }` completes.
- [ ] Build repo verify fence -> verify: the PowerShell command below exits 0.

  ```powershell
  $buildRepo = 'C:\Users\User\.claude'
  $baselineCheck = Join-Path $buildRepo 'skills/apex-code/scripts/apex-baseline-check.ps1'
  powershell.exe -NoProfile -File $baselineCheck -Full -Worktree $buildRepo
  ```
- [ ] Scope -> verify: before the build the HOST records `git -c safe.directory=C:/Users/User/.claude -C C:\Users\User\.claude status --porcelain --ignored -uall` for the full tree and `git hash-object` for every working-tree file under the build directory, including all target directories, ignored files, and untracked files. Record the same status list and per-path hashes after the build. Exclude only tree-pin/scope-check runtime paths from both comparisons: `sessions`, `projects`, `backups`, `jobs`, `shell-snapshots`, `todos`, `file-history`, `history.jsonl`, `.last-update-result.json`, `cache`, `.credentials.json`, `plugins`, and `skills/synced` markers. Exclude `.git` metadata from file enumeration. After filtering, no new path may appear and only the three authorized build-file paths may have a changed content hash or status. Every other pre-existing dirty path remains byte-identical; report it. The builder does not stage or commit.
- [ ] Reachability -> verify: from the real apex-plan `## Writing the spec` caller, trace the documented create and revise commands to the wrapper's `-AuthorSpec` and `-ExpectedDigest` parameters; from `## Closing the session`, trace the append before the existing sidecar deletion. The PowerShell command below finds both wrapper parameters.

  ```powershell
  $wrapper = 'C:\Users\User\.claude\skills\apex-code\scripts\codex-dispatch.ps1'
  Select-String -LiteralPath $wrapper -SimpleMatch -Pattern '[switch]$AuthorSpec', '[string]$ExpectedDigest'
  ```

## Progress

Build date: 2026-10-01 (HOST, recorded at build start before any build edit).

Edit manifest (HOST): per file, `Old` = exact HEAD line sequence (unique), `New` = exact intended line sequence. The acceptance gate's `$edits` for a target = that file's `edits` array.

```json
{
 "build_date": "2026-10-01",
 "files": [
  {
   "path": "skills/apex-plan/SKILL.md",
   "edits": [
    {
     "Old": [
      "version: 2.4.1",
      "last_updated: 2026-08-02"
     ],
     "New": [
      "version: 2.5.0",
      "last_updated: 2026-10-01"
     ]
    },
    {
     "Old": [
      "  - docs/technical/adr/ADR-037-three-context-files.md"
     ],
     "New": [
      "  - docs/technical/adr/ADR-037-three-context-files.md",
      "  - docs/technical/adr/ADR-048-role-redesign.md"
     ]
    },
    {
     "Old": [
      "   patch the spec in place, or pull it back to `docs/drafts/`. Delete the record once drained."
     ],
     "New": [
      "   pull the spec back to `docs/drafts/` and apply the fixes through an `-AuthorSpec` revise",
      "   dispatch (see Writing the spec). Delete the record once drained."
     ]
    },
    {
     "Old": [
      "Template: `~/.claude/skills/apex-orchestrate/templates/spec-template.md`.",
      "**You do not draft it yourself (ADR-045).** Resolve the open decisions, then dispatch a `model: opus`",
      "spec-author worker with the plan, the template path, and the target path",
      "`docs/drafts/{short-name}.md` â€” never straight to `docs/changes/`. The author drafts; you review its",
      "draft against the rules below and the readiness gate. The rest of this section is the contract you",
      "hand the author and grade against."
     ],
     "New": [
      "Template: `~/.claude/skills/apex-orchestrate/templates/spec-template.md`.",
      "**You do not draft it yourself (ADR-045, ADR-048).** Resolve the open decisions, then dispatch the",
      "spec author: gpt-6-sol through the wrapper's author mode. The host assembles a prompt pack (`$pack`)",
      "containing the adjudicated plan brief, the exact template path",
      "`~/.claude/skills/apex-orchestrate/templates/spec-template.md`, the target",
      "`docs/drafts/<short-name>.md` (never straight to `docs/changes/`), and the three rules below (no why",
      "inline except Intent, mechanism in each task, one concern per task). For an absent draft, create:",
      "",
      "```powershell",
      "& \"$env:USERPROFILE\\.claude\\skills\\apex-code\\scripts\\codex-dispatch.ps1\" -AuthorSpec -Model gpt-6-sol -Task author -Spec <short-name> -Authorized \"docs/drafts/<short-name>.md\" -Worktree <repo> -BaseSha <HEAD> -Effort high -Prompt $pack",
      "```",
      "",
      "A zero exit means the wrapper left exactly that one regular draft file. The author drafts; you",
      "review its draft against the rules below and the readiness gate. The rest of this section is the",
      "contract you hand the author and grade against.",
      "",
      "**Every later write to an existing draft is a new author dispatch** -- reviewer fixes, readiness",
      "fixes, cold-read amendments, the post-cap fresh draft, and owner-directed fixes alike. Each is a",
      "fresh, stateless gpt-6-sol `-AuthorSpec` call with the same arguments plus",
      "`-ExpectedDigest (git -C <repo> hash-object \"docs/drafts/<short-name>.md\")` and a prompt containing",
      "the requested changes. The host never edits the draft itself. Author dispatches into one repo run",
      "sequentially; do not pass `-AllowSharedWorktree`, which author mode refuses.",
      "",
      "**Author exits** (diagnose against the exit-code table in `apex-code`'s `Codex dispatch` section):",
      "- **0** -> review the draft.",
      "- **75 with STILL RUNNING in the output** -> wait for the coder's `.final`, then run the wrapper's",
      "  printed `-Adopt -RunId <id>` command without `-AuthorSpec`, so the skipped scope, tree-pin,",
      "  encoding, and verdict gates run. Adoption exit 0 -> review; every other adoption result -> the",
      "  OWNER. Never act on the call's timeout.",
      "- **Any other non-zero exit**, including `[adopt] REFUSED (exit 75)` -> read the wrapper's printed",
      "  diagnosis and the `.final`/concerns, then bring them to the OWNER with a recommendation. The host",
      "  never edits the draft, never deletes or reverts files, and never re-dispatches without the",
      "  owner's decision.",
      "- **Quota-out** (a usage-limit/429/quota message in the `.final` or log, or Codex failing to",
      "  launch) -> the OWNER. Only the owner may approve a `model: sonnet` Agent (non-wrapper) author",
      "  fallback; record the chosen model and never fall back silently. Before and after that Agent",
      "  dispatch, record `git hash-object` for every file under `docs/drafts` and the full",
      "  `git status --porcelain --ignored -uall -- docs/drafts` list; accept only when the target draft",
      "  is the sole new or changed content and no other path appears. For a revise, also check that the",
      "  pre-dispatch draft hash matches the expected digest.",
      "- **74 because the target repo's `docs/drafts` has no tracked file** -> the OWNER; do not seed a",
      "  file automatically.",
      "",
      "**Write freeze.** While an author run is in flight, the host makes NO writes to the target repo --",
      "including sidecar row completion, status.md, and plan files -- until the coder's `.final` exists or",
      "the wrapper confirms no coder launched, not merely until the wrapper call returns. Concurrent host",
      "writes are attributed to the author and cause a false exit 65.",
      "",
      "**Author rows in the sidecar.** The HOST creates `docs/drafts/<short-name>.review.log` at whichever",
      "comes first: the pre-draft arch-check row or the first author dispatch. Rows are only APPENDED,",
      "never overwritten or recreated; phase-2 completion fills the pending cells of the existing row. Each",
      "author dispatch gets a two-phase row. At dispatch: Round = `author`, Dispatched (UTC), Reviewer =",
      "`author:<model>:<create|revise>`, Spec digest = the `-ExpectedDigest` for a revise or `- (create)`,",
      "Verdict and Disposition = `pending`. After a wrapper run, complete the same row (subject to the",
      "write freeze) with Verdict = the wrapper exit and Disposition = `launched` only if the ledger has a",
      "dispatch row AND a child process started; exits 72/74/76/79/80/71 before launch and exit 69 at the",
      "launch boundary are `not-launched`, even when exit 69 left a ledger row. An owner-approved Sonnet",
      "Agent dispatch uses Reviewer = `author:sonnet:<create|revise>`, Verdict = `agent`, and Disposition",
      "= `launched` only after its child process starts. Review rows follow."
     ]
    },
    {
     "Old": [
      "(deliberately not `.md` â€” spec tooling must never pick it up), created by the HOST at round 1, never",
      "by the author or the reviewer, deleted when the spec promotes to `docs/changes/`. One row per round:"
     ],
     "New": [
      "(deliberately not `.md` â€” spec tooling must never pick it up), created by the HOST at whichever comes first (the pre-draft arch-check row or the first author dispatch), never",
      "by the author or the reviewer, deleted when the spec promotes to `docs/changes/`. One row per author dispatch or review round:"
     ]
    },
    {
     "Old": [
      "(`security, migration safety, mechanism`). The Sol plan-check is its own pass and gets its own row."
     ],
     "New": [
      "(`security, migration safety, mechanism`). The Sol plan-check is its own pass and gets its own row.",
      "",
      "**Round-column tokens:** `arch-N` = pre-draft architecture pass; `N` (an integer) = reviewer-family",
      "round; `sol-N` = Sol cold read; `delib-N` = Sol deliberation; `author` = author dispatch; `owner` =",
      "an owner decision. Author rows never count toward the reviewer-family round cap or the Sol round",
      "count."
     ]
    },
    {
     "Old": [
      "  launched â€” and the spec routes to the post-cap path below. A missing sidecar means round 1: append"
     ],
     "New": [
      "  launched â€” and the spec routes to the post-cap path below. Zero non-VOID integer reviewer-family rows means round 1: append"
     ]
    },
    {
     "Old": [
      "- **The post-cap path is not a dead end.** Fresh draft against the closed fix-list â†’ readiness gate"
     ],
     "New": [
      "- **The post-cap path is not a dead end.** A fresh `-AuthorSpec` revise dispatch against the same draft path and the closed fix-list â†’ readiness gate"
     ]
    },
    {
     "Old": [
      "- **At the cap**, stop reviewing and hand a FRESH drafter a **CLOSED fix-list**: the exact",
      "  unresolved findings as of round 3, frozen. No new lenses, no additions after handoff. The next",
      "  draft is graded against that list and the readiness gate only."
     ],
     "New": [
      "- **At the cap**, stop reviewing and send a fresh `-AuthorSpec` revise dispatch, against the same",
      "  draft path, a **CLOSED fix-list**: the exact unresolved findings as of round 3, frozen. No new",
      "  lenses, no additions after handoff. The next draft is graded against that list and the readiness",
      "  gate only."
     ]
    },
    {
     "Old": [
      "any fails, fix in place and re-run from the top."
     ],
     "New": [
      "any fails, send the fixes through an author revise dispatch, then re-run the full gate from the top."
     ]
    },
    {
     "Old": [
      "- **Deep Details / Light:** move the spec `docs/drafts/` â†’ `docs/changes/`, delete the spec's",
      "  `<short-name>.review.log` sidecar (host's pen â€” the round record dies with the promotion), then rewrite the",
      "  `<!-- PLANNING -->` block of `docs/status.md` â€” Pending Specs (scan `docs/changes/`, not `done/`)",
      "  and Open Questions (carry unresolved, add new, **delete resolved**). Update `_Last updated:_`."
     ],
     "New": [
      "- **Deep Details / Light:** in order: (1) append one row to",
      "  `C:\\users\\user\\apex\\docs\\research\\spec-author-trial.md` from the spec's sidecar (next bullet);",
      "  (2) move the spec `docs/drafts/` -> `docs/changes/`; (3) delete the spec's `<short-name>.review.log`",
      "  sidecar (host's pen -- the round record dies with the promotion); (4) rewrite the",
      "  `<!-- PLANNING -->` block of `docs/status.md` â€” Pending Specs (scan `docs/changes/`, not `done/`)",
      "  and Open Questions (carry unresolved, add new, **delete resolved**). Update `_Last updated:_`.",
      "- **Trial log row** (ADR-048), appended before the sidecar is deleted. Columns exactly:",
      "  `date | repo | spec | author models | reviewer-family rounds | Sol rounds | intent drift | notes`.",
      "  Use the promotion date and repo path. Author models come only from sidecar `author` rows with",
      "  Disposition = `launched` and Reviewer = `author:<model>:<create|revise>`: list launched create rows",
      "  in order, counting repeated models, then revise rows in order with counts, for example",
      "  `gpt-6-sol create x2; revise gpt-6-sol x1`. Reviewer-family rounds = non-VOID integer `N` rows (one",
      "  row per multi-lens pass). Sol rounds = non-VOID `sol-N` and `delib-N` rows; `arch-N` rows are",
      "  excluded. A legacy spec promoted with no sidecar logs author models = `unknown (no sidecar)` and",
      "  zero round counts. Intent drift = `y` only when the owner flags a mismatch at the confirmation",
      "  digest, otherwise `n`. A re-promotion of the same repo/spec appends a new row with `re-promote` in",
      "  notes; never overwrite an earlier row. If the log does not exist yet, create it with the header",
      "  `| date | repo | spec | author models | reviewer-family rounds | Sol rounds | intent drift | notes |`",
      "  and its separator, and verify that header with `Select-String -SimpleMatch` before the first append."
     ]
    }
   ]
  },
  {
   "path": "skills/apex-plan/references/sol-plan-check.md",
   "edits": [
    {
     "Old": [
      "Runs after the readiness gate, before a Deep Details spec moves to `docs/changes/`. One",
      "independent cross-family read per spec; skip only trivial single-domain specs (same economy",
      "rule as dispatched domain review). Light / Bug Fix modes skip entirely."
     ],
     "New": [
      "Runs after the readiness gate, before a Deep Details spec moves to `docs/changes/`. One",
      "independent, fresh, stateless read per spec; skip only trivial single-domain specs (same economy",
      "rule as dispatched domain review). Light / Bug Fix modes skip entirely. For a gpt-6-sol-authored",
      "spec (ADR-048), the Claude `apex-spec-reviewer` is the cross-family check; this gpt-5.6-sol cold",
      "read is an independent same-family read."
     ]
    },
    {
     "Old": [
      "- `--sandbox read-only` + no profile: Sol can inspect the repo, writes nothing. **Sol never",
      "  edits the spec** — planning applies accepted amendments itself."
     ],
     "New": [
      "- `--sandbox read-only` + no profile: Sol can inspect the repo, writes nothing. **Sol never",
      "  edits the spec.** Accepted amendments go to the author in an `-AuthorSpec` revise dispatch with",
      "  `-ExpectedDigest` (apex-plan, Writing the spec); planning does not edit the draft."
     ]
    },
    {
     "Old": [
      "- Every plan-check dispatch appends its own digest-bound row to"
     ],
     "New": [
      "- Every plan-check dispatch appends its own digest-bound row (Round token `sol-N`) to"
     ]
    },
    {
     "Old": [
      "1. The host answers each finding into the *same* Sol conversation — **amend** (accept; change the",
      "   spec) or **rebut with evidence** — via `codex exec resume <session-id>` (session id from the"
     ],
     "New": [
      "1. The host answers each finding into the *same* Sol conversation — **amend** (accept; the change",
      "   goes to the author through an `-AuthorSpec` revise dispatch with `-ExpectedDigest`; the host",
      "   never edits the draft) or **rebut with evidence** — via `codex exec resume <session-id>` (session id from the"
     ]
    },
    {
     "Old": [
      "   `accepted` (spec amended) · `withdrawn` (Sol retracts — the resolution table MUST cite the"
     ],
     "New": [
      "   `accepted` (amendment sent to the author) · `withdrawn` (Sol retracts — the resolution table MUST cite the"
     ]
    },
    {
     "Old": [
      "3. The resolution table lands in the spec's `## Intent` block as invariants."
     ],
     "New": [
      "3. The resolution table's invariants go to the author through an `-AuthorSpec` revise dispatch with",
      "   `-ExpectedDigest`, which lands them in the spec's `## Intent` block; the host adjudicates and",
      "   never edits the draft."
     ]
    },
    {
     "Old": [
      "digest-bound row to the same `docs/drafts/<short-name>.review.log`, carrying the `SPEC-DIGEST` line"
     ],
     "New": [
      "digest-bound row (Round token `delib-N`) to the same `docs/drafts/<short-name>.review.log`, carrying the `SPEC-DIGEST` line"
     ]
    },
    {
     "Old": [
      "# ROW FIRST, THEN DISPATCH — create or append docs/drafts/<short-name>.review.log with the",
      "#   plan-check-family row, carrying the same digest value used below."
     ],
     "New": [
      "# ROW FIRST, THEN DISPATCH — create docs/drafts/<short-name>.review.log only if absent, else APPEND",
      "#   the plan-check-family row (Round token `arch-N`), carrying the same digest value used below."
     ]
    },
    {
     "Old": [
      "- **Round record — ALWAYS.** Plan-check FAMILY. Every arch-check dispatch creates or appends to",
      "  `docs/drafts/<short-name>.review.log` (short-name fixed at plan time) with a normal row on"
     ],
     "New": [
      "- **Round record — ALWAYS.** Plan-check FAMILY. Every arch-check dispatch creates (only when absent) or appends to",
      "  `docs/drafts/<short-name>.review.log` (short-name fixed at plan time) with a normal `arch-N` row on"
     ]
    },
    {
     "Old": [
      "  recorded."
     ],
     "New": [
      "  recorded. No row is ever overwritten or recreated; Round tokens and counting follow apex-plan",
      "  § Convergence control."
     ]
    }
   ]
  },
  {
   "path": "skills/apex-plan/references/model-routing.md",
   "edits": [
    {
     "Old": [
      "**Pin every Claude-side dispatch.** The session model is Fable 5 (expensive) — an `Agent`/`Task`",
      "dispatch that omits `model:` silently inherits it, not the cheap default, so always pass `model:`"
     ],
     "New": [
      "**Pin every Claude-side dispatch.** The session model is Opus 5.5 at medium effort — an `Agent`/`Task`",
      "dispatch that omits `model:` inherits Opus 5.5, not the cheap default, so always pass `model:`"
     ]
    },
    {
     "Old": [
      "choice. Opus keeps the spec-author, build-orchestrator, and high-risk-reviewer roles — it is not a",
      "coder."
     ],
     "New": [
      "choice. Specs are authored by gpt-6-sol through the wrapper's `-AuthorSpec` (apex-plan, Writing the",
      "spec; ADR-048). Opus keeps the build-orchestrator and high-risk-reviewer roles; it is not a coder."
     ]
    }
   ]
  }
 ]
}
```
