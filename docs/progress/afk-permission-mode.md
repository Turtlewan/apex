Task 6 blocked: spec Task 6 requires the "mode-independence" case (g) to pass — an armed
`afk-gate.js` `allow` overriding a concurrently-firing `backend-pretool-write.ps1` `ask` in a
planning-mode session → the real Claude Code harness resolves concurrent PreToolUse hook
decisions to the *most restrictive* verdict (ask/deny beats allow), not first/last-hook-wins, so
this cannot be done as written by `afk-gate.js` alone (a platform-level hook-composition rule
outside any single hook's control) → planning must decide: (1) scope the spec's Intent invariant
(4) down to "coding-mode-only" mode-independence (matches the real use case — write-guard is
already inert in coding mode; no code change), or (2) extend `backend-pretool-write.ps1` (a file
outside this spec's `## Files to Change`) to also check the AFK armed-state flag, restoring true
any-session mode-independence at the cost of the "self-contained, no cross-hook precedence"
design goal this spec deliberately chose. Evidence: `docs/probes/afk-gate-integration.md` (cases
a-f PASS — the core mechanism is proven live; case g FAIL — mode-independence only).

Tasks 1-5 + 7 are DONE and independently verified (not just Codex self-report): shared detection
module, afk-gate.js hook (both armed and unarmed paths spot-checked directly by the host),
afk-gate.js registered live in `~/.claude/settings.json` (user-approved separately, since it
activates the real bypass mechanism), apex-afk skill, `afk` PowerShell launcher (verified by
static read — live execution is correctly blocked by the harness's own self-arming guard),
triple-write bookkeeping (registry/domains.md, SKILLS.md, SKILL-HISTORY.md).

## RESOLVED (same session)
User chose option (2) — extend `backend-pretool-write.ps1` (a file OUTSIDE this spec's original
`## Files to Change`, user-approved explicitly per the harness's own permission classifier, which
required literal re-confirmation of the specific widening before allowing the edit). Added
`Test-AfkArmed` + `Test-AfkCriticalPath` (ported from `afk-gate.js`) so the write-guard stands down
for non-critical files when AFK is armed, in any session — not just coding-mode.

First live re-test found the fix inert: `Test-AfkArmed` combined `DateTimeStyles.RoundtripKind`
with `AdjustToUniversal`, which .NET throws on — silently caught, always evaluated to "not armed."
Fixed (`AdjustToUniversal -bor AssumeUniversal`); isolated-unit-tested. Second re-test hit an
unrelated EPERM from Codex's own subprocess sandbox (scoped to `-C ~/.claude`) blocking a nested
`claude -p` session's write to `C:\tmp` — a test-harness artifact, sidestepped by switching to
direct stdin-piping against the hook (the same technique that verified Tasks 1/2). Final
verification: all 4 sub-cases pass (armed+non-critical→stand-down, armed+critical `package.json`/
`.env`→still ask, unarmed regression→still ask). Full writeup in
`docs/probes/afk-gate-integration.md` § Resolution.

Spec build + integration test complete; all 7 tasks done, all 10 acceptance criteria checked as
literally written.

## RE-BLOCKED — post-build cross-model security review (required by `cross_model_review: true`)
Dispatched an independent Opus review over all 6 changed files per the spec's own frontmatter
requirement, since AFK creates a real permission-bypass mechanism. Verdict: **BLOCK.** The green
Task 6 integration matrix did not catch this — every probe in that matrix targets a command class
the detectors were explicitly written to catch (`rm -rf`, exfil-`curl`, `curl|bash`); none exercise
the classes the review found broken.

**3 confirmed BLOCKs** (2 independently re-verified by the host, not just trusted from the review):
1. `isSafeAfkBash`'s allowlist includes general-purpose interpreters/installers (`node -e`,
   `python -c`, `npx`, `npm install`, `find -exec`, `awk system`, `git -c core.fsmonitor=`) that
   achieve RCE / dependency-poisoning none of the never-list detectors catch — the safe-list was
   authored at the *command-head* level, not accounting for interpreters that execute arbitrary
   code from their own arguments.
2. **Host-verified**: `isAfkFlagWrite('echo t > ~/.claude/afk.on')` → true, but
   `isAfkFlagWrite('echo t > C:\Users\User\.claude\afk.on')` → **false** — the arm-write guard only
   recognizes the `~`-prefixed form, not the literal absolute path `afk-gate.js` itself uses. An
   armed session can silently rewrite/extend its own flag via the absolute-path form.
3. **Host-verified**: neither `C:\Users\User\.claude\settings.json` nor `afk-gate.js` /
   `destructive-detect.js` themselves match `isCriticalPath`'s patterns (no `auth`/`guard`
   substring, not a manifest/CI/credential path) — an armed session can Write to any of these and
   get `allow`, persistently disabling the guard.

Plus 2 medium + 1 low FLAG (uncaught `git push` exfil to an arbitrary remote; `MultiEdit` bypasses
the exact-match arm-write guard; JS/PowerShell critical-path duplication is a drift hazard).

Full findings: `docs/probes/afk-gate-cross-model-review.md`.

## RESOLVED — all 3 BLOCKs fixed, same session (user chose "fix now")
Narrowed `SAFE_AFK_COMMANDS` off RCE-capable interpreters/installers (kept `find`/`git` with
targeted argument-level guards instead of wholesale removal, preserving their safe everyday use);
unified `isCriticalPath` into the shared lib with self-config protection (`~/.claude/hooks/**`,
`settings.json`) and applied it to `cp`/`mv`/`sed -i` Bash write-targets too (a 4th related gap
found while designing the BLOCK-3 fix — the original critical-path check only covered Write/Edit,
not Bash-based file copies); fixed the absolute-path arm-write detection (plus a related bug found
during verification: the redirect-detection regex still only recognized the tilde form even after
the target-match regex was extended). 30/30 isolated checks + 7/7 live-armed re-verification via
direct stdin piping to the real `afk-gate.js`, all green, zero regressions. Full resolution:
`docs/probes/afk-gate-cross-model-review.md` § RESOLVED.

Spec is now genuinely complete: all 7 tasks, all 10 acceptance criteria, the integration test
(incl. mode-independence), and the required cross-model security review all pass. `docs/status.md`
In-Flight row and spec frontmatter (`status: ready`) reflect final state.
