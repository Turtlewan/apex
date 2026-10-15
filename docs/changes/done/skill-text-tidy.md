---
spec: skill-text-tidy
status: draft
autonomy_level: L2
risk: low
coder_effort: medium
coder_model: gpt-6.1-sol
max_parallel_codex: 2
---

# Spec: Tidy post-v5 skill text
<!-- Governing contract: ~/.claude/skills/apex-code/references/spec-contract.md. -->

**Identity:** Light spec for three file-disjoint skill text edits and their HOST bookkeeping.

## Intent
- **Intent:** Make the debug handoff, plan pre-draft gate, and orchestrate in-flight wording match the live post-v5 routes.
- **Invariants:** Each coder task edits only its named skill file. The apex-plan file's pre-existing double-encoded text and all text outside the specified edits remain byte-identical.
- **Non-goals:** Changes to routing behavior, other skill files, or planning state.

## Assumptions
- `critic-pack-dedupe` is applied to the live `skills/apex-plan/SKILL.md`, which has `version: 2.9.1` and `last_updated: 2026-10-15`. → impact: Stop
- The three live skill files contain the exact anchors prescribed in Tasks 1–3. → impact: Stop

Simplicity check: one coder task per skill file, with one history row and one changelog bullet owned by HOST.

## Prerequisites
- `critic-pack-dedupe`

## Files to Change
| File | Operation | Notes |
|------|-----------|-------|
| skills/apex-debug/SKILL.md | modify | Task 1 blank lines, Stage 6 record text, and metadata. |
| skills/apex-plan/SKILL.md | modify | Task 2 pre-draft recipe sentence and metadata. |
| skills/apex-orchestrate/SKILL.md | modify | Task 3 in-flight sentence and metadata. |
| C:/Users/User/apex/SKILL-HISTORY.md | modify | HOST Task 4 newest history row. |
| C:/Users/User/apex/CHANGELOG.md | modify | HOST Task 5 first Unreleased Added bullet. |

## Execution manifest
```json apex-manifest
{
  "version": 1,
  "repos": { "claude": "C:/Users/User/.claude" },
  "tasks": [
    { "id": "1", "repo": "claude", "files": [{ "path": "skills/apex-debug/SKILL.md", "op": "modify" }], "depends_on": [] },
    { "id": "2", "repo": "claude", "files": [{ "path": "skills/apex-plan/SKILL.md", "op": "modify" }], "depends_on": [] },
    { "id": "3", "repo": "claude", "files": [{ "path": "skills/apex-orchestrate/SKILL.md", "op": "modify" }], "depends_on": [] }
  ]
}
```

## Tasks
- [ ] **Task 1** - Tidy debug handoff text - files: `skills/apex-debug/SKILL.md` - done when both blank lines, the Stage 6 paragraph, the bug sentence, and the metadata replacements are in place, with all other bytes unchanged.
  - Insert exactly one blank line immediately before each of these existing lines, leaving each line byte-identical:
    ```text
    After root-cause confirmation and before any fix, pass the specific root-cause statement to `apex-plan` § Intake for size/risk labels and route selection.
    Stage 4 builds through the Light or Deep Details route Intake selects; a contract-changing fix is Big and goes through the Big gate.
    ```
  - In `### Stage 6 — Prevent & record (one home per fact)`, insert this paragraph directly under the heading, before `Each piece of the bug record gets ONE durable home`, followed by one blank line:
    ```text
    The fix lands through the spec Intake selected: the regression test below is one of that spec's acceptance criteria, and the confirmed root-cause statement goes in the spec's Intent and in its commit message body.
    ```
  - Replace this complete two-line sentence, preserving all surrounding lines:
    ```text
    A bug fixed in-session with a regression test gets **no issue** (git + test only — avoid
    created-and-closed noise).
    ```
    with this sentence (line wrapping may change):
    ```text
    A bug fixed through its spec with a regression test gets **no issue** (git + test only — avoid created-and-closed noise).
    ```
  - Replace `version: 1.5.0` with `version: 1.5.1`, and `last_updated: 2026-10-14` with `last_updated: 2026-10-15`. The absence literal is `A bug fixed in-session`.
- [ ] **Task 2** - Restore the plan pre-draft pointer and gate - files: `skills/apex-plan/SKILL.md` - done when one sentence is appended to the named paragraph, the version is bumped, and all other bytes remain unchanged.
  - In `## Writing the spec`, append the sentence below immediately after the final sentence of this existing paragraph, on the same paragraph:
    Existing paragraph (anchor, unchanged):
    ```text
    Big uses C1 § Planning gate check instead of the pre-draft pass. Non-Big Medium/High Deep Details retains the pre-draft pass and its independent post-readiness cold read. Low and doc-only skip under the existing tier rule. The Big gate output never enters the cold read.
    ```
    Sentence to append (same paragraph, after its final sentence, separated by one space):
    ```text
    Pre-draft pass recipe: `references/sol-plan-check.md` § Pre-draft architecture pass; for High an unresolved BLOCK is an approval gate — print the **apex-governance § Approval gate** banner and get the explicit `Approve? [y / n / edit]` answer before any spec-author dispatch.
    ```
  - Replace `version: 2.9.1` with `version: 2.9.2`. Keep `last_updated: 2026-10-15` and all pre-existing double-encoded text byte-identical.
- [ ] **Task 3** - Name the orchestrate in-flight antecedent - files: `skills/apex-orchestrate/SKILL.md` - done when the sentence and metadata are replaced, with all other bytes unchanged.
  - In `## 2. Surface in-flight work — before taking the new request`, replace `Never quietly build on top of it; never delete it.` with `Never quietly build on top of in-flight work; never delete it.` The absence literal is `Never quietly build on top of it;`.
  - Replace `version: 2.7.0` with `version: 2.7.1`, and `last_updated: 2026-10-14` with `last_updated: 2026-10-15`.
- [ ] **Task 4 (HOST)** - Prepend one skill history row - files: `C:/Users/User/apex/SKILL-HISTORY.md` - done when the newest data row is exactly the following row and occurs once:
  ```text
  | 2026-10-15 | apex-debug, apex-plan, apex-orchestrate | `skills/apex-debug/SKILL.md`, `skills/apex-plan/SKILL.md`, `skills/apex-orchestrate/SKILL.md` | apex-debug 1.5.1, apex-plan 2.9.2, apex-orchestrate 2.7.1 | updated | skill-text-tidy: debug Stage 6 routes the fix through its spec and list-break blank lines; plan restores the pre-draft recipe pointer and High approval gate; orchestrate names in-flight work explicitly | docs/changes/skill-text-tidy.md |
  ```
- [ ] **Task 5 (HOST)** - Add one changelog bullet - files: `C:/Users/User/apex/CHANGELOG.md` - done when the following exact bullet is the first under `## [Unreleased]` / `### Added` and occurs once:
  ```text
  - Skill text tidy (2026-10-15, skill-text-tidy, apex-debug 1.5.1, apex-plan 2.9.2, apex-orchestrate 2.7.1): post-v5 wording fixes — debug fix-through-spec record, plan pre-draft recipe pointer and High approval gate, orchestrate in-flight antecedent.
  ```

## Wave plan
Wave 1: [task 1, task 2] | Wave 2: [task 3] | HOST: Task 4, then Task 5. All coder tasks are dependency-independent and file-disjoint; the second wave respects `max_parallel_codex: 2`.

## Permissions
Coder Tasks 1–3 own only their respective manifest paths. HOST owns the two bookkeeping paths outside the manifest. No network or Git write operation is authorized by this spec.

### File Operations
| Action | Paths |
|--------|-------|
| Modify (coder Task 1) | skills/apex-debug/SKILL.md |
| Modify (coder Task 2) | skills/apex-plan/SKILL.md |
| Modify (coder Task 3) | skills/apex-orchestrate/SKILL.md |
| Modify (HOST Task 4) | C:/Users/User/apex/SKILL-HISTORY.md |
| Modify (HOST Task 5) | C:/Users/User/apex/CHANGELOG.md |

### Commands
| Command | Purpose |
|---------|---------|
| `Get-Content -Raw -Encoding UTF8` | Check whitespace-normalized literals and raw blank lines. |
| Build repository Verify commands fence | Run the complete build-repository recipe. |

### Git Operations
| Operation | Scope |
|-----------|-------|
| (none) | No staging or commits by the coder. |

### Environment Access
| Variable | Purpose |
|----------|---------|
| (none) | No environment variable required. |

### Network
| Action | Purpose |
|--------|---------|
| (none) | No network operation. |

## Specialist Context
### Security
(none)

### Performance
(none)

### Accessibility
(none)

## Documentation
| Doc type | File | Action |
|----------|------|--------|
| Skill instruction | skills/apex-debug/SKILL.md | Task 1 text and metadata. |
| Skill instruction | skills/apex-plan/SKILL.md | Task 2 text and metadata. |
| Skill instruction | skills/apex-orchestrate/SKILL.md | Task 3 text and metadata. |
| History | C:/Users/User/apex/SKILL-HISTORY.md | HOST prepends Task 4 row. |
| Changelog | C:/Users/User/apex/CHANGELOG.md | HOST adds Task 5 bullet. |

## Acceptance Criteria
Tagged checks run in the build-repository root. Every checked literal is prescribed verbatim in its task body. Presence and absence checks read UTF-8, normalize whitespace, and use `Contains`. Raw UTF-8 checks assert the two Task 1 blank lines. HOST checks own bookkeeping, exact edit boundaries, scope, and the full verify fence.

- [ ] Task 1 - Debug handoff, Stage 6 text, and metadata match Task 1 → verify: whitespace-normalized UTF-8 `Contains` checks confirm all prescribed presence and absence literals.
```powershell apex-accept
$em = [string][char]0x2014
$t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath 'skills/apex-debug/SKILL.md') -replace '\s+', ' ')
if (-not $t.Contains("The fix lands through the spec Intake selected: the regression test below is one of that spec's acceptance criteria, and the confirmed root-cause statement goes in the spec's Intent and in its commit message body.")) { throw 'Stage 6 paragraph' }
$bug = 'A bug fixed through its spec with a regression test gets **no issue** (git + test only ' + $em + ' avoid created-and-closed noise).'
if (-not $t.Contains($bug)) { throw 'spec bug sentence' }
if ($t.Contains('A bug fixed in-session')) { throw 'old bug sentence' }
if (-not $t.Contains('version: 1.5.1')) { throw 'debug version' }
if ($t.Contains('version: 1.5.0')) { throw 'old debug version' }
if (-not $t.Contains('last_updated: 2026-10-15')) { throw 'debug update date' }
if ($t.Contains('last_updated: 2026-10-14')) { throw 'old debug update date' }
```
- [ ] Task 1 - The two paragraphs start after one blank line each → verify: raw UTF-8 text contains a newline, a blank line, then each prescribed line start.
```powershell apex-accept
$raw = (Get-Content -Raw -Encoding UTF8 -LiteralPath 'skills/apex-debug/SKILL.md') -replace "`r`n", "`n"
if (-not $raw.Contains("`n`nAfter root-cause confirmation and before any fix, pass the specific root-cause statement")) { throw 'root-cause blank line' }
if (-not $raw.Contains("`n`nStage 4 builds through the Light or Deep Details route Intake selects")) { throw 'Stage 4 blank line' }
```
- [ ] Task 2 - The appended recipe sentence and version match Task 2 → verify: whitespace-normalized UTF-8 `Contains` checks confirm the prescribed presence and absence literals.
```powershell apex-accept
$em = [string][char]0x2014
$sect = [string][char]0x00A7
$t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath 'skills/apex-plan/SKILL.md') -replace '\s+', ' ')
$recipe = 'Pre-draft pass recipe: `references/sol-plan-check.md` ' + $sect + ' Pre-draft architecture pass; for High an unresolved BLOCK is an approval gate ' + $em + ' print the **apex-governance ' + $sect + ' Approval gate** banner and get the explicit `Approve? [y / n / edit]` answer before any spec-author dispatch.'
if (-not $t.Contains($recipe)) { throw 'pre-draft recipe sentence' }
if (-not $t.Contains('version: 2.9.2')) { throw 'plan version' }
if ($t.Contains('version: 2.9.1')) { throw 'old plan version' }
if (-not $t.Contains('last_updated: 2026-10-15')) { throw 'plan update date' }
```
- [ ] Task 3 - The in-flight wording and metadata match Task 3 → verify: whitespace-normalized UTF-8 `Contains` checks confirm the prescribed presence and absence literals.
```powershell apex-accept
$t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath 'skills/apex-orchestrate/SKILL.md') -replace '\s+', ' ')
if (-not $t.Contains('Never quietly build on top of in-flight work; never delete it.')) { throw 'in-flight sentence' }
if ($t.Contains('Never quietly build on top of it;')) { throw 'old in-flight sentence' }
if (-not $t.Contains('version: 2.7.1')) { throw 'orchestrate version' }
if ($t.Contains('version: 2.7.0')) { throw 'old orchestrate version' }
if (-not $t.Contains('last_updated: 2026-10-15')) { throw 'orchestrate update date' }
if ($t.Contains('last_updated: 2026-10-14')) { throw 'old orchestrate update date' }
```
- [ ] Task 4 - HOST history bookkeeping is present → verify: read `C:/Users/User/apex/SKILL-HISTORY.md` as UTF-8, normalize whitespace, and use `Contains` to confirm the exact Task 4 row; confirm it occurs once and is the newest data row.
- [ ] Task 5 - HOST changelog bookkeeping is present → verify: read `C:/Users/User/apex/CHANGELOG.md` as UTF-8, normalize whitespace, and use `Contains` to confirm the exact Task 5 bullet; confirm it occurs once and is the first bullet under `## [Unreleased]` / `### Added`.
- [ ] Exact edit boundaries - HOST compares all three coder diffs with the live baseline → verify: each `git diff --` for its skill file shows only the Task 1, 2, or 3 replacements and insertions prescribed above. All surrounding text and the apex-plan file's pre-existing double-encoded text remain byte-identical.
- [ ] Build repository verify fence - HOST runs every command below from the build repository root → verify: this is the current `## Verify commands` fence of the build repository's AGENTS file, copied verbatim, and all commands pass.
```
node --check hooks/destructive-command-guard.js
node --check hooks/lib/destructive-detect.js
python hooks/destructive-guard-test.py
powershell.exe -NoProfile -File skills/apex-code/scripts/baseline-check-test.ps1
powershell.exe -NoProfile -File skills/apex-code/scripts/spec-validate-test.ps1
powershell.exe -NoProfile -File skills/apex-code/scripts/dispatch-preflight-test.ps1
powershell.exe -NoProfile -File skills/apex-code/scripts/dispatch-events-test.ps1
powershell.exe -NoProfile -File skills/apex-code/scripts/tree-pin-test.ps1
powershell.exe -NoProfile -File skills/apex-code/scripts/scope-check-test.ps1
powershell.exe -NoProfile -File skills/apex-code/scripts/dispatch-author-test.ps1
powershell.exe -NoProfile -File skills/apex-code/scripts/engine-plan-test.ps1
powershell.exe -NoProfile -File skills/apex-code/scripts/engine-git-test.ps1
powershell.exe -NoProfile -File skills/apex-code/scripts/engine-dispatch-test.ps1
powershell.exe -NoProfile -File skills/apex-code/scripts/apex-drain-plan-test.ps1
powershell.exe -NoProfile -File skills/apex-code/scripts/apex-drain-test.ps1 -Case core
powershell.exe -NoProfile -File skills/apex-code/scripts/apex-drain-test.ps1 -Case recovery
powershell.exe -NoProfile -File skills/apex-code/scripts/apex-drain-test.ps1 -Case resume
powershell.exe -NoProfile -File skills/apex-code/scripts/apex-drain-test.ps1 -Case safety
powershell.exe -NoProfile -File skills/apex-code/scripts/apex-drain-close-test.ps1
powershell.exe -NoProfile -File skills/apex-plan/scripts/apex-map-check-test.ps1
powershell.exe -NoProfile -File skills/apex-plan/scripts/apex-size-guard-test.ps1
powershell.exe -NoProfile -File skills/apex-code/scripts/engine-test.ps1
```
- [ ] Scope - the build-repository `git diff` touches only the three skill files → verify: in `C:/Users/User/.claude`, `git diff --name-only` lists only `skills/apex-debug/SKILL.md`, `skills/apex-plan/SKILL.md`, and `skills/apex-orchestrate/SKILL.md`; compare with a pre-build snapshot and report any other pre-existing dirty paths. In `C:/Users/User/apex`, HOST changes only `SKILL-HISTORY.md` and `CHANGELOG.md`. Neither coder nor HOST reads or writes the planning state file for this check.
- [ ] Reachability - the edited guidance remains at its live entry points → verify: HOST reads the final `### Stage 6 — Prevent & record (one home per fact)`, `## Writing the spec`, and `## 2. Surface in-flight work — before taking the new request` sections as UTF-8 and confirms the Task 1–3 presence and absence literals in those sections.

## Progress
_(The build writes here — do not edit manually)_
