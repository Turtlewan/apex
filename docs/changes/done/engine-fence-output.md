---
spec: engine-fence-output
status: draft
autonomy_level: L2
risk: medium
---

# Spec: Engine fence output and attended confirmation
<!-- Governing contract: skills/apex-code/references/spec-contract.md (the validator's contract doc owns the version; never restate a number here). -->

**Identity:** Preserve failed Engine baseline fence output, surface attributed verification tails, and prepend attended owner confirmation to dispatched coder prompts.

## Intent
- **Intent:** Retain the diagnostics from every nonzero baseline fence, including isolation and parked exits, and convey the run's existing owner confirmation to coders.
- **Invariants:** Full UTF-8 logs never overwrite earlier logs; attribution, retry routing, state schema, and frozen plan prompts retain their existing contracts.
- **Non-goals:** Attribution changes; flaky drain-test repair; the full-recipe coder prompt in engine-plan.ps1; state schema changes; skill version or skill-index changes.

## Assumptions
- Mode: Deep Details; risk: medium. The build root is the checkout/worktree supplied to the dispatched task; resolve every relative build path from that root, including in linked worktrees. A different working directory from the manifest's repository is supported, not a stop condition. → impact: Stop only if the named relative files or functions are absent.
- The Engine exposes `Invoke-RunnerGate`, `Find-RunnerWaveFailure`, `Invoke-RunnerWave`, `Start-RunnerAttempt`, and `Write-RunnerSummary`; `acceptance_output_tail` is already permitted on attempts. → impact: Stop.
- The run directory is `Split-Path -Parent $script:EngineStatePath`, not the shared `$script:EngineStateRoot`. Runtime fence artifacts belong under that run directory, outside the build worktree. → impact: Stop.
- The HOST runs the build-root AGENTS.md verify fence in native Windows PowerShell, including engine-test.ps1 (approximately 25 minutes). Coders run only Task 1's tagged checks below; they never run engine-test.ps1, including its `-AcceptanceOnly` mode, or the full verify recipe in the sandbox. → impact: Stop if native HOST verification is unavailable; Task 1 can still finish its own checks.
- Map section touched (C:/Users/User/.claude/docs/system-map.md): Engine (attended build runner). → impact: Caution; the HOST Scribe map update covers it at close-out.

Simplicity check: One coder task owns both production scripts and their tests; three HOST steps perform the adjudicated bookkeeping and native verification.

## Prerequisites
none

## Files to Change
| File | Operation | Notes |
|------|-----------|-------|
| skills/apex-code/scripts/apex-engine.ps1 | modify | Fence logging, diagnosis paths, retry tails, confirmation prefix |
| skills/apex-code/scripts/engine-test.ps1 | modify | Native regression cases and updated retry expectations; same coder task |
| C:/Users/User/apex/SKILL-HISTORY.md | modify | HOST H1: prepend script-only apex-code row |
| C:/Users/User/apex/CHANGELOG.md | modify | HOST H2: Unreleased Changed bullet |

## Execution manifest
```json apex-manifest
{
  "version": 1,
  "repos": { "claude": "C:/Users/User/.claude" },
  "tasks": [
    {
      "id": "1",
      "repo": "claude",
      "files": [
        { "path": "skills/apex-code/scripts/apex-engine.ps1", "op": "modify" },
        { "path": "skills/apex-code/scripts/engine-test.ps1", "op": "modify" }
      ],
      "depends_on": []
    }
  ]
}
```

## Tasks
- [ ] **Task 1** — Implement D1-D4 with A1-A2 and their regression tests — files: `skills/apex-code/scripts/apex-engine.ps1`, `skills/apex-code/scripts/engine-test.ps1` — done when: the mechanisms and native cases below are present and this task's tagged checks pass; running the native cases is HOST H3, not a coder completion dependency.

  1. In apex-engine.ps1, add `Write-RunnerFenceLog` beside `Invoke-RunnerGate`, with parameters `WaveNumber`, `Scope`, `Output`, and optional `Timestamp` defaulting to `[DateTime]::UtcNow.ToString('yyyyMMddTHHmmssfffZ')`. Accept scope `combined` or `task-<id>` from the existing manifest task ID. Create `fence` beneath `Split-Path -Parent $script:EngineStatePath` on demand. Write the entire captured `Output` string using UTF-8 without a BOM; return only the created file's full path. Name the file `wave-<N>-<Scope>-<Timestamp>.log`. Use exclusive creation (`FileMode.CreateNew`); on an existing-name collision try `-2`, `-3`, and successive integers immediately before `.log`. Never truncate or replace an existing file. Propagate non-collision I/O errors through the existing Engine exception/park path. The optional timestamp is a helper parameter, not a new Engine CLI parameter.
  2. Extend `Invoke-RunnerGate` with optional scope defaulting to `combined`. Immediately after `Invoke-RunnerScript $script:EngineBaselineScript` returns, call `Write-RunnerFenceLog` for **every nonzero** baseline exit, including 1, 3, 4, and other nonzero codes, before tree-pin verification or residue checks can return. Preserve full `baseline.output` in the log. The baseline gate result also exposes transient `output_tail` containing its last 40 lines, joined with LF using the same line-selection mechanism as `Invoke-RunnerAcceptanceCheck`; add no persisted schema fields. Successful baselines create no fence log. Stage/pin failures before a baseline runs create no baseline log.
  3. At the combined call in `Invoke-RunnerWave`, use `combined`; at the per-task call inside `Find-RunnerWaveFailure`, pass `task-<taskPlan.id>` explicitly. Preserve the existing failure-ID selection, per-task restore/copy/gate ordering, exit-code classification, effort ladder, and integrity checks. Log nonzero baseline output even if a subsequent integrity check supersedes the baseline gate result.
  4. Add `Get-RunnerWaveFenceLogPaths(WaveNumber)` to enumerate only that wave's log files in the current run's `fence` directory, matching the exact prefix `wave-<N>-` including the trailing dash so wave 1 never matches wave 10/11; return full paths in deterministic filename order, or an empty list when absent. At the ambiguous partial assignment in `Invoke-RunnerWave`, append ` -- fence logs: <path>; <path>` containing all logs written for that wave, including combined and isolation runs. Append the same suffix to any parked baseline diagnosis and to run-level partial diagnoses following a baseline failure, including effort exhaustion and its resume branches. Keep task/attempt diagnosis values used as control-flow discriminants unchanged. Use the on-disk wave inventory across retries/resume, with no new state schema fields; add the suffix once per diagnosis. If another gate parks after a nonzero baseline was logged, include the available wave log paths in that parked diagnosis too. `Write-RunnerSummary` needs no code change because it already prints the full diagnosis with those same complete paths; retain the current `Diagnosis:` summary line.
  5. At `$failureGate` selection and `$currentAttempt.PSObject.Properties.Remove('acceptance_output_tail')` in `Invoke-RunnerWave`, use only the gate from this pass: the isolated task's `$failureGates` entry when present, otherwise the combined gate for a directly attributed single task. For exactly one attributed failure, store that baseline gate's `output_tail` in the attempt's existing `acceptance_output_tail`. Preserve acceptance-gate tails and their `failing_task_id` guard. Clear stale tails for failures without a current attributed baseline/acceptance output. Keep attempt diagnosis `verification failure`. In `Start-RunnerAttempt`, replace the retry label for both gate types with exactly `Previous verification output (last 40 lines):`; append the saved tail using the existing retry mechanism. Do not mutate `$TaskPlan.prompt`, its digest, or the frozen plan.
  6. In `Start-RunnerAttempt`, before assembling dispatch parameters, prepend this exact first line to the local `$prompt` only when the run is `-Attended` AND `CriticalFilesConfirmedNote` (`$script:EngineConfirmation`) is nonempty under the existing `IsNullOrWhiteSpace` confirmation predicate:

     `OWNER LIVE CONFIRMATION (attended): the owner confirmed critical-file writes for this run: <note>. Any spec requirement for live confirmation of these files is satisfied.`

     Substitute the actual note for `<note>`; place the task prompt after a newline. Apply this to every dispatched attempt, including retries and resumed dispatches supplied the note. Emit no prefix for absent, empty, or whitespace-only notes, or for any run without `-Attended`, even when its note is nonempty. Retain existing attended/confirmation dispatch switches and critical-file gates; do not infer or persist new confirmation state. The prefix remains first when the verification tail is appended.
  7. In engine-test.ps1, extend `New-TestGateBaseline`, the existing gate-code matrix, `Invoke-TestScenario` fixtures, the acceptance retry case, and the stale-tail single/isolation cases. `Invoke-TestScenario` (~engine-test.ps1:490-499) gains passthrough for `-Attended` and a critical-files confirmation note so the confirmation cases can run; the fake baseline (~engine-test.ps1:40-53) gains an env-driven long-output mode (more than 40 lines, a per-invocation sentinel, and the required non-ASCII sample) used only by the new cases. Add native assertions covering all of the following; restore replaced functions/environment variables in `finally` and keep the CODER task's own new test-case fixtures under temporary roots outside repository source trees. These fixture/deletion/location restrictions bind only those new cases; HOST native verification runs engine-test.ps1 and every other command in the build repo's AGENTS.md `## Verify commands` fence unchanged, with its own fixture creation/deletion permitted outside the coder scope rules (including apex-map-check-test.ps1's build-root `.codex-scratch` fixtures):
     - Red combined output longer than 40 lines writes one full log with an early sentinel absent from the tail and a final tail sentinel. Verify UTF-8 round trip with non-ASCII text constructed from character codes, exact full content, millisecond UTC filename, and run-directory location. Baseline 0 writes no log; 3, 4, and another nonzero code each write a log. Pin/stage failure before baseline creates none; a nonzero baseline followed by integrity failure still retains its log.
     - A deterministic timestamp collision leaves the original and `-2` file contents unchanged and creates `-3` on the next collision.
     - Multi-task ambiguous failure with multiple isolated failures records combined and every failing isolation log; the saved diagnosis, transition, and captured console summary name every actual log path. An ambiguous case with no isolated failure still names the combined log. Each log is labeled `combined` or the correct `task-<id>` and contains that invocation's sentinel.
     - Park codes 3/4 (and the existing other-code case) retain their code/routing and name existing logs in saved diagnosis and console summary. An integrity park after a logged baseline includes its path. Effort-exhaustion partial/resume summaries retain wave log paths without changing the task/attempt discriminants.
     - Direct single-task attribution and multi-task isolation with exactly one failing task both journal the attributed baseline's last 40 lines in `acceptance_output_tail`. Only that task retries. Read its next dispatch-args `Prompt` and assert the new label and current tail sentinel; exclude early lines and unrelated combined/other-task sentinels from the isolated tail. Verify the frozen prompt/digest remain unchanged and the saved tail survives resume.
     - Update existing acceptance retry expectations to the new label. Update stale-tail cases to expect the **current baseline** tail on the second failed attempt and in the next prompt, while excluding `attempt-one-stale-tail-sentinel`; do not retain assertions that baseline tails are empty.
     - An attended nonempty note makes the exact confirmation line first in every dispatched prompt across multiple tasks and retry/resume, with the supplied note and existing confirmation switches intact. Absent, empty, and whitespace-only notes produce no confirmation line. Add a note-only run with a nonempty `CriticalFilesConfirmedNote` and no `-Attended`, asserting no confirmation line in its dispatched prompts. Include a retry containing both the first-line confirmation and the verification-output label/tail.

- [ ] **Task 2 (HOST) — H1 history** — Prepend the newest apex-code script-only row, naming both changed scripts, the implemented fence-output and confirmation behavior, the build date, the current apex-code version marked `SKILL.md unchanged`, and `engine-fence-output` as the source spec — files: `C:/Users/User/apex/SKILL-HISTORY.md` — done when: the newest history row records Task 1's script changes without a skill version bump.
- [ ] **Task 3 (HOST) — H2 changelog** — Add an Unreleased / Changed bullet for full failed-fence logs, diagnostic paths, retry tails, and attended confirmation prompts — files: `C:/Users/User/apex/CHANGELOG.md` — done when: that bullet records Task 1's behavior.
- [ ] **Task 4 (HOST) — H3 native verification** — From the selected build root, run its AGENTS.md `## Verify commands` fence natively, including engine-test.ps1; record exits and new regression assertions in the HOST report — files: (none) — done when: the complete native fence and Task 1's regression cases pass. Do not modify the flaky drain test or waive its failure; report any failure for HOST adjudication.

## Wave plan
Wave 1: [task 1] | HOST close-out: [task 2 / H1, task 3 / H2, task 4 / H3]. Only Task 1 is dispatched to a coder; HOST steps stay outside the execution manifest.

## Permissions

The following NON-CRITICAL actions will run autonomously during build. Approving this spec approves all of them.
Critical paths — .env · migrations · auth/authz/crypto · CI config · dependency manifests and lockfiles · infra-as-code · secrets/keys/certs · host-state (`status.md`, root AGENTS.md, root CLAUDE.md, docs/changes/, docs/handoff/, the run ledger) · the permission settings and the hooks — are NEVER pre-authorised by this section. They need a live attended confirmation at build time, and an AFK run parks them (D3, ADR-046; apex-governance is canonical). (Sole exception: the docs agents' three host's-pen artifacts — the handoff, `status.md`, and spec archival — under D6.)

docs/audit/ is different and stricter: TIER-1, refused outright on a path match. No confirmation authorises a write there — not attended, not by any switch, not by this section. (D5's append-only exception is doctrine pending a content-aware classifier change; it is not a live permission.)

The dispatch scope lock forbids reading or writing the planning host's status document. No task edits skills, the skill index, the state schema, other specs, or any unlisted repository file. Preserve pre-existing dirty files. The Engine's existing integration commits remain build mechanics; coders perform no Git operations.

The fixture, deletion, and outside-repository restrictions below apply only to the CODER task's own new test cases. HOST native verification runs engine-test.ps1 and every other command in the build repo's AGENTS.md `## Verify commands` fence unchanged; those suites' own fixture creation/deletion is permitted and outside the coder scope rules, including apex-map-check-test.ps1's build-root `.codex-scratch` fixtures.

### File Operations
| Action | Paths |
|--------|-------|
| Create | No source files; runtime fence logs under the existing Engine run directory; temporary fast-check fixtures outside the build root |
| Modify | Task 1: `skills/apex-code/scripts/apex-engine.ps1`, `skills/apex-code/scripts/engine-test.ps1`; HOST only: `C:/Users/User/apex/SKILL-HISTORY.md`, `C:/Users/User/apex/CHANGELOG.md` |
| Delete | Only the fast check's own temporary fixture directory |

### Commands
| Command | Purpose |
|---------|---------|
| Task 1's exact tagged PowerShell blocks below | Coder fast syntax and log-helper checks only |
| HOST: native build-root AGENTS.md verify fence | Full repository verification, including the Engine suite |

### Git Operations
| Operation | Scope |
|-----------|-------|
| Coder | None; no add, commit, push, checkout, reset, stash, or read-only Git commands |
| HOST | Read-only scope inspection; Engine integration commits remain existing build mechanics |

### Environment Access
| Variable | Purpose |
|----------|---------|
| `TEMP` | Isolated fast-check fixtures |
| Existing `APEX_ENGINE_TEST_*` and `ENGINE_TEST_*` suite variables | HOST-native fixtures; restore previous values |

### Network
| Action | Purpose |
|--------|---------|
| (none) | No network access required |

## Specialist Context
### Security
Fence output is written only beneath the current run's state directory using exclusive file creation. Confirmation text uses the existing supplied note and confirmation predicate.

### Performance
Tagged checks parse two scripts and exercise one extracted file helper; they launch no Engine, coder, baseline recipe, or native test suite. Full engine-test.ps1 remains HOST-native only.

### Accessibility
(none)

## Documentation
| Doc type | File | Action |
|----------|------|--------|
| Inline | skills/apex-code/scripts/apex-engine.ps1 | Document log scope/collision behavior and current-pass tail selection beside the changed functions |
| History | C:/Users/User/apex/SKILL-HISTORY.md | HOST H1: prepend script-only row; SKILL.md unchanged |
| Changelog | C:/Users/User/apex/CHANGELOG.md | HOST H2: Unreleased Changed bullet |
| Map | C:/Users/User/.claude/docs/system-map.md | The Engine (attended build runner) section may need a post-build line about fence logs; HOST Scribe decides |
| ADR | (none) | No new ADR |

## Acceptance Criteria
- [ ] Task 1 - Parse both changed scripts and locate the implemented Engine functions → verify: this fast check throws on syntax errors or absent functions.
```powershell apex-accept
$ErrorActionPreference = 'Stop'
$engineAst = $null
foreach ($relative in @('skills/apex-code/scripts/apex-engine.ps1', 'skills/apex-code/scripts/engine-test.ps1')) {
    $tokens = $null
    $parseErrors = $null
    $ast = [System.Management.Automation.Language.Parser]::ParseFile((Join-Path (Get-Location).Path $relative), [ref]$tokens, [ref]$parseErrors)
    if (@($parseErrors).Count -gt 0) { throw ($relative + ': ' + ($parseErrors -join '; ')) }
    if ($relative -eq 'skills/apex-code/scripts/apex-engine.ps1') { $engineAst = $ast }
}
foreach ($name in @('Write-RunnerFenceLog', 'Get-RunnerWaveFenceLogPaths', 'Invoke-RunnerGate', 'Find-RunnerWaveFailure', 'Invoke-RunnerWave', 'Start-RunnerAttempt', 'Write-RunnerSummary')) {
    $found = @($engineAst.FindAll({ param($node) $node -is [System.Management.Automation.Language.FunctionDefinitionAst] -and $node.Name -ceq $name }, $true))
    if ($found.Count -ne 1) { throw ('Expected one Engine function: ' + $name) }
}
```

- [ ] Task 1 - Exercise the production log writer without dispatching the Engine → verify: full UTF-8 output, scope names, collision suffixes, and no overwrite pass in a temporary directory.
```powershell apex-accept
$ErrorActionPreference = 'Stop'
$fixture = Join-Path $env:TEMP ('apex-fence-accept-' + [Guid]::NewGuid().ToString('N'))
[void][IO.Directory]::CreateDirectory($fixture)
try {
    $script:EngineStatePath = Join-Path $fixture 'engine-state.json'
    $tokens = $null
    $parseErrors = $null
    $source = Join-Path (Get-Location).Path 'skills/apex-code/scripts/apex-engine.ps1'
    $ast = [System.Management.Automation.Language.Parser]::ParseFile($source, [ref]$tokens, [ref]$parseErrors)
    if (@($parseErrors).Count -gt 0) { throw 'Engine syntax failed' }
    $writer = @($ast.FindAll({ param($node) $node -is [System.Management.Automation.Language.FunctionDefinitionAst] -and $node.Name -ceq 'Write-RunnerFenceLog' }, $true))
    if ($writer.Count -ne 1) { throw 'Fence writer missing' }
    Invoke-Expression $writer[0].Extent.Text
    $stamp = '20261021T010203004Z'
    $payload = ((1..45 | ForEach-Object { 'fence-line-' + $_ }) -join "`n") + "`n" + [char]0x4E2D + '-tail-sentinel'
    $first = Write-RunnerFenceLog -WaveNumber 7 -Scope 'combined' -Output $payload -Timestamp $stamp
    $second = Write-RunnerFenceLog -WaveNumber 7 -Scope 'combined' -Output 'second' -Timestamp $stamp
    $third = Write-RunnerFenceLog -WaveNumber 7 -Scope 'combined' -Output 'third' -Timestamp $stamp
    $isolated = Write-RunnerFenceLog -WaveNumber 7 -Scope 'task-1' -Output 'isolated' -Timestamp $stamp
    $directory = Join-Path $fixture 'fence'
    $expected = @(('wave-7-combined-' + $stamp + '.log'), ('wave-7-combined-' + $stamp + '-2.log'), ('wave-7-combined-' + $stamp + '-3.log'), ('wave-7-task-1-' + $stamp + '.log'))
    $paths = @($first, $second, $third, $isolated)
    $contents = @($payload, 'second', 'third', 'isolated')
    $utf8 = New-Object Text.UTF8Encoding($false, $true)
    for ($index = 0; $index -lt $paths.Count; $index++) {
        $wanted = Join-Path $directory $expected[$index]
        if ([string]$paths[$index] -cne [IO.Path]::GetFullPath($wanted)) { throw 'Fence filename or directory mismatch' }
        $bytes = [IO.File]::ReadAllBytes($wanted)
        if ($utf8.GetString($bytes) -cne $contents[$index]) { throw 'Fence output was changed or overwritten' }
        if ($bytes.Length -ge 3 -and $bytes[0] -eq 239 -and $bytes[1] -eq 187 -and $bytes[2] -eq 191) { throw 'Unexpected UTF-8 BOM' }
    }
} finally {
    if (Test-Path -LiteralPath $fixture) { Remove-Item -LiteralPath $fixture -Recurse -Force }
}
```

- [ ] Task 1 - Implement the native regression matrix in the same task as production → verify: HOST H3 exercises combined/isolation logs, ambiguous/parked/partial paths, current attributed tails and retry prompts, and confirmation present/absent cases listed in Task 1. Coder completion requires the cases to be authored and its two tagged checks to pass, not the HOST run.
- [ ] Task 2 - HOST H1 prepends the script-only history row → verify: the newest row names both modified scripts, engine-fence-output, the build date, and the current version with SKILL.md unchanged.
- [ ] Task 3 - HOST H2 adds the Unreleased Changed bullet → verify: the bullet covers all four behavior changes.
- [ ] Task 4 - HOST H3 runs the complete build-root AGENTS.md verify fence natively → verify: every command exits zero, including engine-test.ps1; retain the new assertion results and any failure output in the HOST report. Coders do not execute this criterion. No command reads or writes the planning host's status document.
- [ ] Scope — nothing written outside `## Files to Change` → verify: HOST runs `git status --porcelain -uall` separately in the build root and bookkeeping repository; it lists each scoped changed path and every other path was already dirty before this build (name those paths in the report). Coders report only their two relative file edits and run no Git commands. This Scope criterion compares repository paths only and ignores HOST verification suites' disposable fixtures/temp roots, including build-root `.codex-scratch` fixtures. Runtime logs and the CODER task's own new test-case fixtures stay outside repository source trees; HOST native verification and its own fixture creation/deletion remain unchanged and outside the coder scope rules.
- [ ] Reachability — the real `Invoke-RunnerWave` combined gate and `Find-RunnerWaveFailure` isolation gates reach the log writer, and `Start-RunnerAttempt` passes the prefix/tail to actual dispatch arguments → verify: HOST-native scenario tests read created logs, saved attempt/diagnosis state, captured summary output, and dispatched args `Prompt`; helper-only assertions do not satisfy this HOST criterion.

## Progress
_(The build writes here — do not edit manually)_
