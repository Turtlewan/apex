---
spec: sandbox-temp-env
status: draft
autonomy_level: L2
risk: medium
---

# Spec: Provision Codex sandbox temp and cache paths
<!-- Governing contract: ~/.claude/skills/apex-code/references/spec-contract.md (the validator's contract doc owns the version; never restate a number here). -->

**Identity:** Add per-dispatch Codex temp environment, a shared uv cache, provisioning refusal, and final-result cleanup to the dispatch wrapper.

**Mode:** Deep Details. **Build repo:** `C:/Users/User/.claude`. **Split waiver:** Owner explicitly waived the >3-file split rule for this spec.

## Intent
- **Intent:** Make pytest temporary files writable for sandboxed Codex coders; inherited Windows temp paths currently fail, and the coder profile overrides inherited `PYTEST_ADDOPTS`. During this build, the build itself still uses the old wrapper, so the sandbox's default temp may be unwritable; the coder's suite run is advisory and the native run is authoritative.
- **Risk: medium.** This changes active launches' environment and the workspace-write provisioning gate; retain the wrapper's exit, event, scope, and report contracts.
- **Invariants:** The temp lifecycle (directory creation, child TEMP/TMP/TMPDIR/UV_CACHE_DIR, the two `-c` settings, cleanup) is active only when `$CodexExecutable -eq 'codex'` or `$env:APEX_SANDBOX_TEMP_ROOT` is non-empty. A fake executable with ROOT unset behaves exactly as today: no temp directories, child environment overrides, or extra arguments; existing suites (dispatch-test, dispatch-preflight-test, dispatch-author-test, engine-dispatch-test, engine-test, apex-drain-test, and others) need no change and make no temp-lifecycle host-state writes. When active: one temp directory per existing run ID; shared persistent uv cache; exit 72 for unsupported roots in any active lifecycle and for unprovisioned real workspace-write launches; cleanup only after final wrapper exit 0.
- **Non-goals:** Dispatch-pack scratch doctrine and its scope-check test, Engine code, npm/esbuild sandbox blocks, artemis instructions, host-native baseline temp, and moving report/scratch paths.

## Assumptions
- Map sections touched (C:/Users/User/.claude/docs/system-map.md): Codex dispatch wrapper; Repository contract and verify fence; apex-code skill and build references. -> impact: Caution; the HOST Scribe map update covers them at close-out.
- Live verification on 2026-10-21 used `codex exec -p apex-coder --sandbox workspace-write`: process `TEMP`/`TMP`/`TMPDIR` under the sandbox temp root reached the child and its `TMPDIR` was writable. A sibling directory required an explicit writable root. The TOML literal-string array form and CLI override of the profile's pytest setting worked. -> impact: Stop if the HOST smoke contradicts these observations.
- The wrapper still builds launch arguments through `ConvertTo-ProcessArgument`, uses `ProcessStartInfo` with `UseShellExecute = $false`, creates its existing `$runId`, routes refusals through `Write-DispatchRefusalLine`, and records its final result through `Exit-Dispatch` / `$script:pendingExitCode`. -> impact: Stop if any named integration point is absent.
- The coder profile sets `PYTEST_ADDOPTS` to `-p no:cacheprovider`; leave the profile unchanged and override that setting in launch arguments. -> impact: Caution; inspect the final child argv during H3.
- Windows PowerShell 5.1, Git, NTFS ACL inspection, `LOCALAPPDATA`, and the local `CodexSandboxUsers` identity are available on the HOST. The HOST provisions the selected root before real workspace-write dispatches. -> impact: Stop for the live smoke if unavailable.
- Current apex-code version is `2.27.1`, and its SKILL.md has 500 lines. Apply `2.28.0` and `last_updated: 2026-10-21`; keep the edit net-neutral or negative in lines. -> impact: Stop if the starting version changed; reconcile with the host before editing.
- Root AGENTS.md is critical host state. T2 runs only after the build workflow's live attended confirmation for that edit; an unattended run parks. -> impact: Stop for unattended T2.
- Capture the initial dirty paths in both trees; preserve concurrent host work. Do not read, write, edit, or create the planning host's status document. -> impact: Stop on a scope conflict.

Simplicity check: retain the existing launcher, run ID, refusal code, report locations, and final-exit routing; add no profile edit, Engine edit, dependency, or new exit/event schema.

## Prerequisites
none

## Files to Change
| File | Operation | Notes |
|------|-----------|-------|
| skills/apex-code/scripts/codex-dispatch.ps1 | modify | T1: temp/cache paths, child environment and CLI overrides, provisioning gate, final-exit cleanup |
| skills/apex-code/scripts/dispatch-sandbox-temp-test.ps1 | create | T1: isolated PowerShell 5.1 wrapper/fake-child regression suite |
| AGENTS.md | modify | T2: append the new suite to the heading-adjacent verify fence in the build repo |
| skills/apex-code/SKILL.md | modify | T2: exit 72 provisioning guidance, minor version/date bump, <=500 lines |
| C:/Users/User/apex/SKILL-HISTORY.md | modify | H1, HOST only: apex-code 2.28.0 history row |
| C:/Users/User/apex/CHANGELOG.md | modify | H2, HOST only: Unreleased bullet |

Relative paths in this table and coder tasks resolve under `C:/Users/User/.claude`. H3/H4 produce only disposable runtime artifacts and verification evidence; neither edits a repository file.

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
        { "path": "skills/apex-code/scripts/codex-dispatch.ps1", "op": "modify" },
        { "path": "skills/apex-code/scripts/dispatch-sandbox-temp-test.ps1", "op": "create" }
      ],
      "depends_on": []
    },
    {
      "id": "2",
      "repo": "claude",
      "files": [
        { "path": "AGENTS.md", "op": "modify" },
        { "path": "skills/apex-code/SKILL.md", "op": "modify" }
      ],
      "depends_on": ["1"]
    }
  ]
}
```

## Tasks
- [ ] **Task 1** — T1: implement and regression-test the sandbox temp lifecycle — files: `skills/apex-code/scripts/codex-dispatch.ps1`, `skills/apex-code/scripts/dispatch-sandbox-temp-test.ps1` — done when: the new suite passes all cases below against the actual wrapper.

  **Root and provisioning gate:**
  - Activate the temp lifecycle (directory creation, child TEMP/TMP/TMPDIR/UV_CACHE_DIR, the two `-c` settings, cleanup) only when `$CodexExecutable -eq 'codex'` or `$env:APEX_SANDBOX_TEMP_ROOT` is non-empty. With a fake executable and ROOT unset, preserve today's launch exactly: no temp directories, child environment overrides, or extra arguments. Leave existing suites unchanged; they make no temp-lifecycle host-state writes.
  - Resolve `$sandboxTempRoot` from nonempty `$env:APEX_SANDBOX_TEMP_ROOT`; otherwise use `Join-Path $env:LOCALAPPDATA 'codex-sandbox-tmp'` only for an active lifecycle or an applicable provisioning check. For an active lifecycle, derive `$sandboxRunTemp = Join-Path $sandboxTempRoot $runId` and `$sandboxUvCache = Join-Path $sandboxTempRoot 'uv-cache'` from the wrapper's existing run ID. Use absolute paths for child values and writable roots. Route active path-resolution/directory-creation failures, including unset LOCALAPPDATA, through the existing launch-setup failure catch that records the ledger row `failed` and calls `Exit-Dispatch 1`; add no new exit path.
  - For every active lifecycle, validate the resolved root before provisioning, directory creation, or launch: require an absolute plain path matching `^[A-Za-z]:\\[A-Za-z0-9_.\\-]+$` (letters, digits, underscore, dot, hyphen, and backslash separators only; no spaces, quotes, apostrophes, or other characters), and require it to lie outside every Git worktree using the wrapper's existing `Assert-NotInsideRepo`-style guard (~codex-dispatch.ps1:452-466) or the same detection. Apply this validation to workspace-write and read-only, real and test roots. On a violation, call `Write-DispatchRefusalLine` with exactly `[dispatch] REFUSED (exit 72): sandbox temp root unsupported: <root> (<reason>)` and use the existing `Exit-Dispatch 72` path; launch no child.
  - Place the provisioning gate unconditionally immediately after the `if ($Phase -eq 'build' -and $Sandbox -eq 'workspace-write') { ... }` pre-flight block closes (~codex-dispatch.ps1:3199-3351), before the dispatch reservation lock (~:3594) and before creating root/run/cache directories. Evaluate it only on `$Sandbox -eq 'workspace-write'` and either `$CodexExecutable -eq 'codex'` or `$env:APEX_SANDBOX_TEMP_FORCE_CHECK -eq '1'`; never place it inside the `-SkipBaselineCheck` branch or tie its evaluation to Phase.
  - Require an existing directory and inspect its ACL with `Get-Acl -LiteralPath`. A qualifying ACE has `AccessControlType` Allow, an identity whose final account component is `CodexSandboxUsers`, `($ace.FileSystemRights -band [System.Security.AccessControl.FileSystemRights]::Modify) -eq [System.Security.AccessControl.FileSystemRights]::Modify`, and `InheritanceFlags` containing both ContainerInherit and ObjectInherit. Require at least one qualifying Allow ACE; any Deny ACE for that identity makes the root not provisioned. Missing root, no qualifying ACE, any such Deny ACE, or an ACL-read failure takes the same refusal branch. Do not create the missing root before this check or grant ACLs in the wrapper.
  - Call `Write-DispatchRefusalLine` with exactly `[dispatch] REFUSED (exit 72): sandbox temp root not provisioned: <root>`, print the resolved one-time owner setup command `New-Item -ItemType Directory -Force '<root>'; icacls '<root>' /remove:d 'CodexSandboxUsers'; icacls '<root>' /grant 'CodexSandboxUsers:(OI)(CI)M'`, then use the existing `Exit-Dispatch 72` path. Substitute the validated resolved root in the refusal line and every setup-command path. Launch no child. The lease is already open at this gate; `Exit-Dispatch 72` closes it through the existing outer `finally` backstop. Add no exit code or event-schema field.
  - Read-only launches skip this gate even with FORCE_CHECK=1. Fake executables skip it unless FORCE_CHECK=1.

  **Launch configuration:**
  - When the lifecycle is active, in every Phase and both sandboxes, create the run directory and shared uv-cache directory if absent using the resolved paths. Keep the existing `.final`, `-ScratchDirectory`, log, pin, and state paths.
  - When the lifecycle is active, add the following logical key/value pairs to the raw argument sequence before the existing `ConvertTo-ProcessArgument` mapping: `-c`, `shell_environment_policy.set.PYTEST_ADDOPTS="-p no:cacheprovider --basetemp=<root-fwd>/<runId>/pytest"`; and, only for workspace-write, `-c`, `sandbox_workspace_write.writable_roots=['<root-fwd>/uv-cache']`. Form `<root-fwd>` by replacing every backslash in the resolved root with a forward slash for both settings; preserve the basetemp token through pytest's POSIX `shlex` splitting of `PYTEST_ADDOPTS`, which strips backslashes. Construct valid TOML: retain the pytest basic string and writable-roots literal-string array. Pass each complete setting as one argument through the same conversion path as existing arguments. Do not replace the existing reasoning-effort override.
  - When the lifecycle is active, set `$startInfo.EnvironmentVariables['TEMP']`, `['TMP']`, and `['TMPDIR']` to the run directory; set `['UV_CACHE_DIR']` to the shared uv-cache directory before `Start()`. Keep native backslash paths in all four child environment values. Set these on the child process only. The pytest override is a CLI setting, not only an inherited process variable.

  **Final-result cleanup:**
  - Initialise `$sandboxRunTempCreated = $false` and `$sandboxRunTemp = $null` before the wrapper's outer `try`. Integrate cleanup and retention messaging in the wrapper's outer `finally` (~:4476), which already reads `$script:pendingExitCode`; early exits must never read an unset temp variable. Use that final-result authority, not `$process.ExitCode`, `.final` status alone, or a preliminary success branch.
  - In that outer `finally`, when `[string]$script:pendingExitCode -ceq '0'` and this invocation created the run directory, resolve and verify that the deletion target is the exact `<root>\<runId>` child under the selected root, then remove it recursively using `Remove-Item -LiteralPath`. Catch cleanup failures and print a warning without changing the pending exit or masking teardown.
  - For every other final code, in that same outer `finally`, retain any created run directory and print its full path. Never delete the root or shared uv-cache; leave the report and scratch locations untouched.

  **Regression suite in the same task:**
  - Write a standalone Windows PowerShell 5.1 suite. Generate its fake child script inside its disposable fixture area; do not add another repository helper. Launch the real wrapper through `-CodexExecutable powershell.exe` and `-CodexExecutableArgumentPrefix` following the existing dispatch-test/fakecodex pattern. The fake consumes raw `$args` and stdin, records argv plus the four child environment values to a fixture capture file, creates markers in the run directory and uv-cache only when the lifecycle is active, and writes a schema-valid report to the received `-o` path. Model `dispatch-test-fakecodex.ps1`'s `FAKE_CODEX_INSCOPE_ONLY` / `FAKE_CODEX_STATUS` semantics: the final-0 case writes one in-scope file and reports matching `changed_files`; the blocked case reports `status: blocked`, a nonempty `blocker`, `commands_run` with `result: not_run`, and nonempty `unresolved`, producing wrapper final 67. Both child processes exit 0. The read-only case writes a review-shape report (`verdict` / `findings`, no `status`).
  - Create the test-owned temporary area natively under `[System.IO.Path]::GetTempPath()`. Isolate fixture repositories, `APEX_STATE_DIR`, `-ScratchDirectory`, and capture files beneath that area; point `APEX_SANDBOX_TEMP_ROOT` to a subdirectory of the area outside every fixture worktree. Keep the area and temp root outside scope and tree-pin checks. Use an explicit authorized scope and the existing deliberate test bootstrap pattern. Do not invoke a real Codex process, grant the real sandbox group ACLs, modify a profile, use a network service, or call unrelated suites.
  - Test a fake executable with ROOT and FORCE_CHECK unset: captured TEMP equals the inherited value (no override), the other child temp/cache values remain inherited, no lifecycle directories are created, and argv has no extra `-c` settings beyond today's arguments (retain the existing reasoning-effort pair).
  - Test workspace-write with FORCE_CHECK unset: TEMP/TMP/TMPDIR equal `<root>\<wrapper-runId>`; UV_CACHE_DIR equals `<root>\uv-cache`; directories exist during the fake's execution; argv contains the complete `-c` pair `shell_environment_policy.set.PYTEST_ADDOPTS="-p no:cacheprovider --basetemp=<root-fwd>/<wrapper-runId>/pytest"`; the writable-roots override is the complete `-c` pair `sandbox_workspace_write.writable_roots=['<root-fwd>/uv-cache']`. Assert both settings use forward slashes throughout their paths. Correlate the run ID with the wrapper's existing ledger/capture evidence rather than a second generated ID. Only if `python` is on PATH, use Python's `shlex.split` on the recorded `PYTEST_ADDOPTS` value (decoded from the captured CLI setting) and assert that it yields the intact `--basetemp=<root-fwd>/<wrapper-runId>/pytest` token; otherwise skip that assertion with a printed note.
  - Test read-only: the same native-backslash environment values and forward-slash pytest CLI setting are present, and the writable-roots setting is absent. Use `-Phase review -Schema review`, a tree pin through the wrapper's existing `-TreePinScript` pattern, and a valid review-shape report (`verdict` / `findings`, no `status`); preserve the existing pin/report protocol.
  - Test FORCE_CHECK=1 plus a missing root: final 72, exact refusal line, exact resolved setup command `New-Item -ItemType Directory -Force '<root>'; icacls '<root>' /remove:d 'CodexSandboxUsers'; icacls '<root>' /grant 'CodexSandboxUsers:(OI)(CI)M'`, no capture/launch marker, and no root creation. Test FORCE_CHECK=1 plus an existing root without a qualifying ACE: final 72 and no fake launch. Build the latter fixture with a test-owned ACL lacking that group while retaining the test user's access; do not depend on the parent root's inherited ACL.
  - Test an active lifecycle with a root containing a space and with a root inside a fixture Git worktree: each returns final 72 with the exact unsupported-root refusal line including the resolved root and reason, and no capture/launch marker. Cover both workspace-write and read-only; keep FORCE_CHECK unset to prove root validation is independent of provisioning.
  - Test read-only plus FORCE_CHECK=1 plus a missing root: the fake launches and no provisioning refusal occurs. The normal workspace-write fake case with FORCE_CHECK unset also proves the fake bypass.
  - Test final wrapper 0: the captured run directory and its marker are gone, and the shared cache marker and external `.final` report survive. Test a child that exits 0 but reports `blocked`: wrapper final 67, run directory/marker retained, retained full path printed, and shared cache/report survive.
  - Restore all changed process environment values in `finally`. Verify the absolute cleanup target remains inside the test-owned area before deleting that area; leave no fixtures, modified repository files, or shared host-state writes. Fail the suite with nonzero exit on any failed assertion; return 0 only when all assertions pass.

  **Coder verification (only this suite):**
  The coder's in-sandbox run is advisory. Report a sandbox temp failure as such, not as blocked-on-code. The native run (Engine acceptance / HOST H4) is authoritative.
  ```powershell
  powershell.exe -NoProfile -File skills/apex-code/scripts/dispatch-sandbox-temp-test.ps1
  if ($LASTEXITCODE -ne 0) { throw 'sandbox temp suite failed' }
  ```

- [ ] **Task 2** — T2: register the new suite and document the exit-72 recovery — files: `AGENTS.md`, `skills/apex-code/SKILL.md` — done when: the recipe contains the exact command, the exit table names provisioning and the emitted setup command, and the version/date/cap checks pass. Depends on T1.
  - In build-repo AGENTS.md, insert exactly one `powershell.exe -NoProfile -File skills/apex-code/scripts/dispatch-sandbox-temp-test.ps1` line into the existing fence immediately following `## Verify commands`; retain its heading-adjacent fence format and every existing verify command.
  - In SKILL.md, replace the existing exit-code table's 72 row in place: retain the baseline/spec causes and remedies, add unsupported sandbox temp roots for any active lifecycle and the workspace-write sandbox temp root missing/ACL-not-provisioned cause, and direct the owner to choose a supported absolute plain-path root outside Git worktrees for an unsupported-root refusal or run the printed one-time `New-Item` / `icacls` command that removes `CodexSandboxUsers` Deny ACEs before granting Modify for a provisioning refusal. Keep the existing no-child-launch contract and preflight ledger semantics.
  - Replace `version: 2.27.1` with `version: 2.28.0` and set `last_updated: 2026-10-21`. Keep the total line count <=500 and no greater than its pre-edit count; perform the table edit on the existing line.
  - Coder verification: run only the Task 2 structural acceptance check below; do not run the full verify fence inside the sandbox.

- [ ] **Task 3 (HOST)** — H1: insert a newest-first history row dated 2026-10-21 for apex-code 2.28.0, naming sandbox temp/cache launch configuration, provisioning exit 72, cleanup, and the new suite — files: `C:/Users/User/apex/SKILL-HISTORY.md` — done when: the row names `sandbox-temp-env` and matches the shipped version. Run after T2.
- [ ] **Task 4 (HOST)** — H2: append an Unreleased bullet naming the sandbox temp/cache fix, provisioning/setup refusal, cleanup, and apex-code 2.28.0 — files: `C:/Users/User/apex/CHANGELOG.md` — done when: the bullet names `sandbox-temp-env` and the shipped behaviour. Run after T2.
- [ ] **Task 5 (HOST)** — H3: create a disposable scratch repo with a pytest test accepting `tmp_path`, writing and reading a file beneath it; dispatch one real wrapper workspace-write build with that test in its authorized set and a prompt to run pytest — files: (none; disposable runtime fixtures only) — done when: the child runs pytest successfully and the wrapper's final exit is 0.
  - On the HOST, provision the selected sandbox root with the exact setup command emitted by the wrapper if needed. Use the real `codex` executable, FORCE_CHECK unset, the real apex-coder profile, and a scratch-repo verify command that runs the installed pytest locally without network installation.
  - Have the test assert both its temporary path and pytest's actual basetemp (`tmp_path_factory.getbasetemp()`) lie beneath the sandbox root's run directory and record the child's TEMP/TMP/TMPDIR/UV_CACHE_DIR and actual pytest base temp in the dispatch evidence. Verify the shared cache path, CLI profile override, successful tmp_path write/read, final report, and successful-run directory cleanup. Keep report/scratch evidence outside the run directory.
  - Perform all scratch-repo setup, authorization, state isolation, and disposal natively. Record the command, result, wrapper run ID, and evidence paths in the build report. Do not replace this smoke with a fake-child test.
- [ ] **Task 6 (HOST)** — H4: execute every command from the build repo's updated heading-adjacent `## Verify commands` fence natively, with cwd `C:/Users/User/.claude`, and check each exit — files: (none; verification only) — done when: the complete recipe passes, including the new suite and the HOST-native Engine/drain suites. Run after T2; complete H1-H4 before close-out.

## Wave plan
Wave 1: [task 1] | Wave 2: [task 2, after attended critical-file confirmation] | HOST close-out: [H1, H2, H3, H4].

Manifest `depends_on` is authoritative for coder scheduling. The Engine runs the full build-repo verify fence natively after each wave. Coder tasks run only their own checks; they must never run `engine-test.ps1` or `apex-drain-test.ps1` in the sandbox. HOST tasks remain outside the execution manifest.

## Permissions

The following NON-CRITICAL actions will run autonomously during build. Approving this spec approves all of them.
Critical paths — .env · migrations · auth/authz/crypto · CI config · dependency manifests and lockfiles · infra-as-code · secrets/keys/certs · host-state (`status.md`, root AGENTS.md, root CLAUDE.md, docs/changes/, docs/handoff/, the run ledger) · the permission settings and the hooks — are NEVER pre-authorised by this section. They need a live attended confirmation at build time, and an AFK run parks them (D3, ADR-046; apex-governance is canonical). (Sole exception: the docs agents' three host's-pen artifacts — the handoff, `status.md`, and spec archival — under D6.)

docs/audit/ is different and stricter: TIER-1, refused outright on a path match. No confirmation authorises a write there — not attended, not by any switch, not by this section. (D5's append-only exception is doctrine pending a content-aware classifier change; it is not a live permission.)

### File Operations
| Action | Paths |
|--------|-------|
| Create | `skills/apex-code/scripts/dispatch-sandbox-temp-test.ps1` |
| Modify | `skills/apex-code/scripts/codex-dispatch.ps1`, `skills/apex-code/SKILL.md`; root `AGENTS.md` only after live attended confirmation |
| Modify (HOST only) | `C:/Users/User/apex/SKILL-HISTORY.md`, `C:/Users/User/apex/CHANGELOG.md` |
| Delete | No repository files; exact per-run directory after final 0 and test-owned disposable fixtures only |

### Commands
| Command | Purpose |
|---------|---------|
| `powershell.exe -NoProfile -File skills/apex-code/scripts/dispatch-sandbox-temp-test.ps1` | T1's isolated fake-child suite |
| Task 2's tagged structural check | Verify recipe insertion, skill version/date/table/cap |
| Updated build-repo verify fence, unchanged except the added suite | Engine after each wave and H4, HOST-native only |
| Real wrapper dispatch and local pytest invocation | H3, HOST-native launch with sandboxed child |
| Emitted `New-Item` / `icacls` owner setup command | H3 provisioning on the HOST; never executed by the wrapper or fake suite |
| `git status --porcelain -uall` | Read-only scope comparison against the initial dirty paths in both repos |

### Git Operations
| Operation | Scope |
|-----------|-------|
| Read-only status/diff | Both repositories; preserve initial unrelated dirt |
| Mutating operations | No add, commit, push, checkout, reset, or stash in either working repository |

### Environment Access
| Variable | Purpose |
|----------|---------|
| `APEX_SANDBOX_TEMP_ROOT` | Optional sandbox temp root override; nonempty value activates the lifecycle for fakes; isolated fixture root outside fixture worktrees in the suite |
| `LOCALAPPDATA` | Default sandbox temp root parent |
| `APEX_SANDBOX_TEMP_FORCE_CHECK` | Value `1` enables the provisioning test seam for fake executables |
| `TEMP`, `TMP`, `TMPDIR`, `UV_CACHE_DIR` | Per-child environment values; test restoration in finally |
| `PYTEST_ADDOPTS` | Override through the launch CLI's shell environment policy |
| `APEX_STATE_DIR` and test-local fake capture/status variables | Isolated fixture state; restore process values after the suite |

### Network
| Action | Purpose |
|--------|---------|
| Real Codex service access (HOST H3 only) | One live wrapper smoke dispatch |
| Fake-child suite | No network access or dependency installation |

## Specialist Context
### Security
Inspect root ACLs without mutating them in the wrapper. Require the named Allow ACE, the full Modify bitmask, and both inheritance flags; any Deny ACE for that identity makes the root not provisioned. Preserve gate/refusal and event contracts. Scope recursive deletion to the verified exact run directory; never delete the shared cache. Keep root AGENTS.md behind attended critical-file confirmation.

### Performance
Reuse the persistent shared uv-cache; create only the run directory and missing cache directory per launch. Add no network work to the fake-child suite.

### Accessibility
(none — no interface changes)

## Documentation
| Doc type | File | Action |
|----------|------|--------|
| Build instructions | `C:/Users/User/.claude/AGENTS.md` | T2: register the new verification command |
| Skill contract | `C:/Users/User/.claude/skills/apex-code/SKILL.md` | T2: expand exit 72 row and bump version/date |
| Skill history | `C:/Users/User/apex/SKILL-HISTORY.md` | H1: HOST adds apex-code 2.28.0 row |
| Changelog | `C:/Users/User/apex/CHANGELOG.md` | H2: HOST adds Unreleased bullet |

No skill-set change; no index edit. No new ADR or other documentation edits in this spec.

## Acceptance Criteria
All tagged checks run with cwd `C:/Users/User/.claude` (integration root); use relative paths and do not change location. These checks verify the build after its tasks; they are not commands for the draft author to implement or execute the change.

- [ ] Task 1 - Implement the complete sandbox temp lifecycle and its same-task fake-child regressions -> verify: the isolated suite exits 0 natively (Engine acceptance / HOST H4; the coder's in-sandbox run is advisory) and asserts native-backslash environment values/forward-slash argv, the conditional Python `shlex.split` check (printed skip note when Python is absent from PATH), workspace-write/read-only differences, both provisioning refusals and the Deny-removal setup command, space-containing and fixture-worktree root refusals in both sandboxes, read-only provisioning exemption, fake bypass, fake with ROOT unset preserving inherited TEMP and today's argv with no extra `-c` settings, final-0 deletion, final-67 retention, and cache/report preservation.
```powershell apex-accept
powershell.exe -NoProfile -File skills/apex-code/scripts/dispatch-sandbox-temp-test.ps1
if ($LASTEXITCODE -ne 0) { throw 'sandbox temp regression suite failed' }
```

- [ ] Task 2 - Register the exact suite and update the versioned exit-72 instructions -> verify: one command in the heading-adjacent fence, retained HOST-native suite entries, apex-code 2.28.0/date, <=500 skill lines, and provisioning/setup language in the existing 72 row.
```powershell apex-accept
$ErrorActionPreference = 'Stop'
$agents = Get-Content -Raw -Encoding UTF8 -LiteralPath 'AGENTS.md'
$recipeMatch = [regex]::Match($agents, '(?ms)^## Verify commands\r?\n\s*\r?\n```[^\r\n]*\r?\n(?<body>.*?)^```\s*$')
if (-not $recipeMatch.Success) { throw 'heading-adjacent verify fence missing' }
$recipe = $recipeMatch.Groups['body'].Value
$expected = 'powershell.exe -NoProfile -File skills/apex-code/scripts/dispatch-sandbox-temp-test.ps1'
$hits = @($recipe -split '\r?\n' | Where-Object { $_ -ceq $expected })
if ($hits.Count -ne 1) { throw 'sandbox temp suite must appear exactly once in verify fence' }
foreach ($nativeSuite in @('engine-test.ps1', 'apex-drain-test.ps1')) {
    if (-not $recipe.Contains($nativeSuite)) { throw ('existing HOST-native suite removed: ' + $nativeSuite) }
}
$skillLines = @(Get-Content -Encoding UTF8 -LiteralPath 'skills/apex-code/SKILL.md')
$skill = $skillLines -join "`n"
if ($skillLines.Count -gt 500) { throw 'apex-code SKILL.md exceeds 500 lines' }
if ($skill -notmatch '(?m)^version: 2\.28\.0\r?$') { throw 'apex-code minor version missing' }
if ($skill -notmatch '(?m)^last_updated: 2026-10-21\r?$') { throw 'apex-code date missing' }
$rows = @($skillLines | Where-Object { $_ -match '^\| 72 \|' })
if ($rows.Count -ne 1) { throw 'exit 72 table row missing or duplicated' }
foreach ($term in @('baseline', 'spec', 'sandbox temp', 'provision', 'New-Item', 'icacls')) {
    if ($rows[0] -notmatch [regex]::Escape($term)) { throw ('exit 72 row missing: ' + $term) }
}
```

- [ ] Task 3 - H1 (HOST): land the dated apex-code 2.28.0 history row -> verify: inspect the new row in `C:/Users/User/apex/SKILL-HISTORY.md`; it names this spec, the four behaviours, and the new suite. Untagged HOST check.
- [ ] Task 4 - H2 (HOST): land the Unreleased changelog bullet -> verify: inspect `C:/Users/User/apex/CHANGELOG.md` for this spec, version, temp/cache behaviour, provisioning refusal, and cleanup. Untagged HOST check.
- [ ] Task 5 - H3 (HOST), Reachability: a real workspace-write wrapper dispatch reaches pytest using the actual apex-coder profile -> verify: the sandbox tmp_path write/read test passes, pytest base temp lies beneath the wrapper's run directory, the wrapper finishes 0, that directory is removed, and the shared cache and external report survive; attach command/run-ID/evidence. Untagged HOST check.
- [ ] Task 6 - H4 (HOST): run the full updated build-repo verify fence natively -> verify: every command exits 0; record the full result, including the new suite and HOST-native Engine/drain commands. Untagged HOST check.
- [ ] Scope — nothing written outside `## Files to Change` -> verify: `git status --porcelain -uall` in each repo lists every changed owned path (`??` = created, ` M` = modified), and every other path it shows was already dirty before this build; name those paths in the report. No index operations, status-document access, spec move, or archival.

## Progress
_(The build writes here — do not edit manually)_
