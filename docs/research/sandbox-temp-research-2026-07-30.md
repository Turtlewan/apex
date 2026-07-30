# Why the codex sandbox forces TEMP in-repo, and what an out-of-repo writable TEMP takes

Research for APEX retro wave 2, 2026-07-30. Read-only; evidence cited by file:line.

## TL;DR causal chain

1. **Codex Windows sandbox (restricted token) denies writes to the user profile**, including the
   default `%TEMP%` (`C:\Users\User\AppData\Local\Temp`). Only the workspace (cwd) plus configured
   writable roots are writable. On Windows `TMPDIR` is normally unset, so the "TMPDIR is a default
   writable root" escape hatch never engages — **workspace-write on Windows ships with NO writable
   temp at all**.
2. **The wrapper does not touch TEMP** — the child inherits the parent env unchanged and gets only
   `--sandbox workspace-write`.
3. **The coder model works around the denial by re-pointing TEMP/TMP into the worktree**
   (`$env:TEMP = <worktree>\.codex-scratch\tmp` etc.), and — critically — **this workaround has
   been codified as a standing instruction in the target repo's AGENTS.md**, which is what makes it
   happen on *every* run rather than occasionally.
4. Downstream: pytest `tmp_path` (rooted at `tempfile.gettempdir()`, which reads `TMPDIR`→`TEMP`→`TMP`)
   lands inside the repo → the 4 `tests/test_launcher.py` cases assert "workshop root must be outside
   the repository tree" and fail → ~117 host-must-rerun concerns; scope-check flags the leftover
   scratch dirs (147/168 critical_violation FPs); sandbox-SID-owned leftovers are unreadable to the
   host and can't be deleted (94 "cleanup policy-blocked" concerns).

## 1. The wrapper: codex-dispatch.ps1

`C:\Users\User\.claude\skills\apex-code\scripts\codex-dispatch.ps1` (2089 lines):

- **Env vars passed to the child: NONE.** The launch uses `ProcessStartInfo` (lines 1558-1568) with
  `UseShellExecute = $false` and never touches `$startInfo.EnvironmentVariables` — the codex child
  inherits the wrapper's own environment verbatim, i.e. the normal user `TEMP=C:\Users\User\AppData\Local\Temp`.
  Grep confirms no `TEMP`/`TMP`/`TMPDIR` assignment anywhere on the launch path.
- **Sandbox flags** (line 1518-1522):
  ```
  'exec', '-p', 'apex-coder', '--sandbox', $Sandbox, '-m', $coderModel,
  '-c', "model_reasoning_effort=$Effort", '-C', $Worktree, '--json', '--output-schema',
  $schemaPath, '-o', $finalPath, '--color', 'never'
  ```
  `$Sandbox` defaults to `workspace-write` (line 66); reviews are forced to `read-only` (lines 120-123).
  **No `--add-dir`, no writable-roots `-c` override, no env flags.** There is also a `-p apex-coder`
  profile reference (would layer `$CODEX_HOME/apex-coder.config.toml`) — no such profile file exists
  in `C:\Users\User\.codex\` (only `config.toml`), so it layers nothing.
- The wrapper's OWN state was hardened against exactly this class of bug (lines 160-196: ledger,
  gate snapshots and tree pins moved to `%LOCALAPPDATA%\apex`, `Assert-NotInsideRepo` at line 178
  refuses a state dir inside any git tree, comment at lines 191-194 records that the gate helpers'
  `$env:TEMP` default once put snapshots into the judged tree). **The same discipline was never
  extended to the coder child's TEMP.**
- `-ScratchDirectory $env:TEMP` (line 67) is wrapper-side scratch, not passed to the child.

## 2. Codex CLI config and installed help

`C:\Users\User\.codex\config.toml`:
- Line 6-7: `[windows] sandbox = "elevated"` — selects the elevated Windows restricted-token
  sandbox (binary strings show `windows_sandbox_level`, `elevated`/`unelevated`,
  `codex.windows_sandbox.elevated_setup_*`, `CreateProcessAsUserW failed`, `codex-windows-sandbox-setup.exe`).
- **No `sandbox_mode`, no `[sandbox_workspace_write]` section, no `writable_roots`** — everything
  sandbox-shaped comes from the wrapper's `--sandbox` flag plus codex defaults.
- `[shell_environment_policy.set]` sets only NODE_REPL/browser vars; no `inherit` restriction, so
  TEMP/TMP/TMPDIR set by a parent would reach the coder's shells (binary contains the core env-name
  list `...LOCALAPPDATA APPDATA TEMP TMP TMPDIR POWERSHELL PWSH`).

`codex --version` → `codex-cli 0.144.1`. `codex exec --help` is blocked by the APEX
raw-codex-exec hook, but `codex --help` and `codex sandbox --help` run:
- Top-level option: **`--add-dir <DIR>` — "Additional directories that should be writable alongside
  the primary workspace"**.
- `-c <key=value>` config overrides (already used by the wrapper for `model_reasoning_effort`).
- `codex sandbox` — "Run commands within a Codex-provided sandbox … Full command args to run under
  Windows restricted token sandbox".

Config keys confirmed by strings in
`C:\Users\User\AppData\Roaming\npm\node_modules\@openai\codex\node_modules\@openai\codex-win32-x64\vendor\x86_64-pc-windows-msvc\bin\codex.exe`
(source path `core\src\windows_sandbox.rs` also present):
- `sandbox_workspace_write` with sub-keys **`writable_roots`, `network_access`,
  `exclude_tmpdir_env_var`, `exclude_slash_tmp`**.
- Doc strings (verbatim excerpts):
  - "Additional folders (beyond cwd and possibly TMPDIR) that should be writable from within the sandbox."
  - "When set to `true`, will NOT include the per-user `TMPDIR` environment variable among the
    default writable roots. Defaults to `false`." (`exclude_tmpdir_env_var`)
  - "When set to `true`, will NOT include the `/tmp` among the default writable roots on UNIX." (`exclude_slash_tmp`)
  - "`sandbox_mode` is `workspace-write`: The sandbox permits reading files, and editing files in
    `cwd` and `writable_roots`. Editing files in other directories requires approval."
- So the **default writable set = cwd + `$TMPDIR` (if set) + `/tmp` (UNIX only)**. Windows has no
  `/tmp`, and `TMPDIR` is conventionally unset on Windows → cwd only. `%TEMP%` is NOT among the
  defaults on any platform.

## 3. Who actually pins TEMP in-repo: the repo AGENTS.md + the model

`C:\Users\User\artemis\AGENTS.md:73-76`:
> ## Sandbox environment quirks (do these FIRST, they hit every run)
> - Default user cache/temp paths are permission-blocked in the Codex sandbox. Immediately redirect
>   to workspace-local scratch: `UV_CACHE_DIR`, `TEMP`/`TMP`, and `TLDEXTRACT_CACHE`. Remove the
>   scratch dirs when done (if deletion is policy-blocked, say so in the final report).

Live evidence, `C:\Users\User\artemis\docs\progress\codex-A.log:36`:
```
powershell.exe -Command $env:UV_CACHE_DIR='C:\Users\User\artemis\.codex-scratch\uv';
  $env:TEMP='C:\Users\User\artemis\.codex-scratch\tmp'; $env:TMP=$env:TEMP; ... uv run pytest -q ...
```
and line 50 shows the resulting failure shape:
`tmp_path = WindowsPath('C:/Users/User/artemis/.codex-scratch/tmp/pytest-of-User/pytest-22/...')`.
Same pattern in `codex-afk-2026-07-13-sol-endgate.log:118-121` (`.review-scratch-*\temp`), and
`:269` shows the cleanup residue: `warning: could not open directory '.sandbox-cache/tmp/pytest-of-User/': Permission denied`.

The failing tests: `C:\Users\User\artemis\src\artemis\capabilities\dev_harness.py:60-62`
(`workshop_root()` raises `WorkshopRootError("workshop root must be outside the repository tree")`
when the root is under the repo) and `C:\Users\User\artemis\tests\test_launcher.py:20-30`
(`_set_workshop_roots` builds the workshop under pytest `tmp_path`). Python's
`tempfile.gettempdir()` resolves `TMPDIR` → `TEMP` → `TMP`, so an in-repo TEMP makes `tmp_path`
in-repo, which those 4 tests correctly reject.

**Verdict on component attribution:** codex's Windows workspace-write policy *creates the
constraint* (no writable temp outside cwd), but the *in-repo pinning* is executed by the coder and
mandated by `artemis\AGENTS.md:74-76`. The wrapper is passive (inherits env, adds no roots). Config
key involved: absence of `sandbox_workspace_write.writable_roots` + unset `TMPDIR`.

## 4. Concrete mechanism for an out-of-repo writable TEMP

Wrapper change (all in codex-dispatch.ps1, launch path around lines 1518-1568):
1. Create a per-run dir under the already-validated state root, e.g.
   `$runTemp = Join-Path $apexStateRoot "codex-tmp\$runId"` (the `Assert-NotInsideRepo` guard at
   line 178 already covers `$apexStateRoot`).
2. Set child env: `$startInfo.EnvironmentVariables['TEMP'] = $runTemp; ['TMP'] = $runTemp;
   ['TMPDIR'] = $runTemp`. All three names are in codex's core env-inherit set, so they propagate
   into sandboxed shells; `TMPDIR` also makes the dir a **default writable root**
   (`exclude_tmpdir_env_var` defaults to false).
3. Belt-and-braces grant the root explicitly: append
   `-c "sandbox_workspace_write.writable_roots=[\"$runTemp\"]"` (guaranteed available on exec — the
   wrapper already passes `-c`) and/or `--add-dir $runTemp` (present in top-level help; exec help
   unverifiable locally because the hook blocks `codex exec --help` — verify once at rollout).
4. Post-exit: delete `$runTemp` (host owns it — no sandbox-SID deletion problem, unlike in-repo
   scratch) and keep it out of every gate's view (it is outside all repos by construction).
5. Doctrine sweep: remove the now-wrong `artemis\AGENTS.md:74-76` "redirect TEMP/TMP to
   workspace-local scratch" instruction (replace with "TEMP already points at a writable
   out-of-repo dir; do NOT redirect it"), and re-baseline the 4 launcher tests + the scratch-dir
   cleanup clause. M2b note: that edit itself needs a dispatch or host edit per the AGENTS.md
   contract.

## 5. What it newly exposes

- **A writable root the scope-check cannot see.** codex-scope-check diffs the worktree; writes into
  `$runTemp` are invisible to it. Mitigations: per-run unique dir (no cross-run contamination
  between wave-parallel dispatches), created empty + deleted by the wrapper after the gates run,
  and optionally inventoried (file count/bytes) into the ledger row for audit.
- **The state-root collision class returns in mirror form**: the coder now writes outside the tree
  being judged, into the harness's own state area. Keep `$runTemp` strictly under
  `$apexStateRoot\codex-tmp\<runId>` and never accept a caller-supplied path without
  `Assert-NotInsideRepo` (same rule, line 178) *plus* a not-inside-`$apexStateRoot`-critical-dirs
  check (don't let TEMP shadow `progress\` or `gates\`).
- Persistence/exfil surface is marginal: the coder could stage content in TEMP, but it already has
  network per `sandbox_workspace_write.network_access` policy and full read access; risk delta is
  mainly *audit blindness*, addressed by the cleanup + inventory.
- Review dispatches are unaffected (read-only sandbox, no writes), but giving them the same TEMP is
  harmless and removes the reviewer's own `.review-scratch-*` workaround
  (codex-afk-2026-07-13-sol-endgate.log:118).

## 6. Expected yield (from ledger-stratification-2026-07-30.md)

Lines 20-22, 35, 45, 101: ~150 of 373 done_with_concerns concerns (clusters 1+3), ~147
critical_violation false positives, ~7 blocked escalations, and 57 of 95 retry-churn dispatches
trace to this one signature. Vitest/npm remains separately host-native (deterministic esbuild/
node_modules sandbox block — memory `codex-sandbox-flake-client-builds`; out-of-repo TEMP does not
fix that, only the pytest/tmp and scratch-cleanup halves).
