---
status: ready
mode: light
gated_on: Mac coding environment exists (cannot be validated on Windows planning)
---

# Coding-mode destructive-command hard-block (PreToolUse hook)

## Intent
Add the one piece of deterministic enforcement APEX's coding side currently lacks: a PreToolUse hook
that **hard-blocks** (true `deny`, always) never-list destructive commands when running in coding mode.
Closes the residual "prose-only enforcement" gap for the weak coding model (DeepSeek), where prose
hard-blocks are least reliable. Decision + rejected alternatives: `docs/technical/adr/ADR-012-deterministic-enforcement-hooks.md`.

## Key decisions
- **Hard-block, not a speed-bump.** Unlike ECC's gateguard (deny-first-attempt-then-allow), this
  returns `permissionDecision: deny` on *every* attempt for never-list commands. No retry path, no
  fact-checklist, no model compliance required — that is the entire point (it guards the model least
  likely to honor prose).
- **Never-list (deny always):** push to `main`/`master`, `git push --force` / force-push refspec
  (NOT `--force-with-lease`), `DROP TABLE` / `TRUNCATE` / `DELETE FROM` (bare), `rm -rf`,
  `git commit --no-verify`, `git reset --hard`, `git clean -f`. Mirror APEX's prose hard-blocks.
- **Coding-mode only.** No-op unless `ANTHROPIC_BASE_URL` contains `deepseek` (read env in the hook).
  Planning mode is already covered by the existing write-guard; this must not fire there.
- **Reuse, don't reinvent, the parser.** Lift the command-detection functions from ECC's
  `gateguard-fact-force.js` (clone at `C:\Users\User\ecc-tmp\scripts\hooks\gateguard-fact-force.js`):
  `isDestructiveBash`, `isDestructiveGit`, `isDestructiveRm`, `splitCommandSegments`,
  `stripQuotedStrings`, `explodeSubshells`, `commandBasename`, `findGitSubcommand`. These are
  well-tested (quote-stripping, subshell-aware, force-push edge cases). Take the detection; **discard**
  gateguard's state/speed-bump machinery (no `markChecked`/`isChecked`, no per-file first-touch).
- **Recovery hatch.** Honor an env disable (e.g. `APEX_DESTRUCT_GUARD=off`) so a deliberate one-off
  isn't permanently wedged — matches gateguard's `ECC_GATEGUARD=off` pattern.
- **Add push-to-main detection** (gateguard lacks it): deny `git push` whose target ref resolves to
  `main`/`master` (e.g. `git push origin main`, `git push origin HEAD:main`). This is APEX's #1 hard block.

## Gotchas / edge cases
- The harness PreToolUse contract: read tool call JSON on stdin; return
  `{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"..."}}`
  on stdout, exit 0. **Confirm the exact field names against the live Claude Code hook API at build
  time** — they may have moved since this spec was written; do not transcribe blindly.
- Mirror the existing APEX write-guard hook's structure/encoding for consistency (it's the sibling hook
  in the same `~/.claude/scripts/hooks/` dir).
- `--force-with-lease` and `--force-if-includes` handling: copy gateguard's exact logic (a bare
  `--force` combined with `--force-if-includes` is still destructive).
- Read-only git introspection (`git status`, `git diff --name-only`, etc.) must pass — reuse
  gateguard's `isReadOnlyGitIntrospection` allowlist.
- Quoted strings: a commit message containing "drop table" must NOT trigger — gateguard's
  `stripQuotedStrings` already handles this; keep it.

## Files to touch
- `~/.claude/scripts/hooks/destructive-command-guard.js` — new hook (detection lifted from gateguard,
  hard-`deny` logic, coding-mode env gate, recovery hatch).
- `~/.claude/settings.json` — wire as a PreToolUse hook with a `Bash` matcher. **Requires the user's
  explicit approval to edit settings.json** (per the Phase 3 per-hook approval gate).
- (validation) a probe: confirm a never-list command is denied and a routine command passes, run in a
  coding-mode (deepseek) session on the Mac.
