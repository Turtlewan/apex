---
status: ready
mode: light
gated_on: a DeepSeek coding session (coding-session-gated — runnable on Windows; the cloud DeepSeek backend is wired here). Requires user approval to edit settings.json.
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
- **Hooks live in `~/.claude/hooks/`** (NOT `~/.claude/scripts/hooks/` — that dir does not exist). The
  sibling write-guard is `~/.claude/hooks/backend-pretool-write.ps1` (**PowerShell**), and existing
  `.js` hooks (`gsd-*.js`) run there via the installed `node` (`C:/Program Files/nodejs/node.exe`). A
  `.js` hook is viable; do NOT try to mirror the PowerShell sibling's structure line-for-line — mirror
  the `.js` hooks' stdin/stdout/exit-0 contract instead.
- `--force-with-lease` and `--force-if-includes` handling: copy gateguard's exact logic (a bare
  `--force` combined with `--force-if-includes` is still destructive).
- Read-only git introspection (`git status`, `git diff --name-only`, etc.) must pass — reuse
  gateguard's `isReadOnlyGitIntrospection` allowlist.
- Quoted strings: a commit message containing "drop table" must NOT trigger — gateguard's
  `stripQuotedStrings` already handles this; keep it.

## Files to touch
- `~/.claude/hooks/destructive-command-guard.js` — new hook (detection lifted from gateguard,
  hard-`deny` logic, coding-mode env gate, recovery hatch). _(Dir is `~/.claude/hooks/`, confirmed live.)_
- `~/.claude/settings.json` — wire as a PreToolUse hook with a `Bash` matcher, alongside the existing
  `Bash`-matcher entry. **Requires the user's explicit approval to edit settings.json** (per the Phase 3
  per-hook approval gate).

## Acceptance criteria (step → verify)

Validate in a **coding-mode (deepseek) session** (`ANTHROPIC_BASE_URL` contains `deepseek`). Drive the
hook directly by piping a tool-call JSON to it and reading the decision — do NOT actually run the
destructive commands. Helper: `echo '<json>' | node ~/.claude/hooks/destructive-command-guard.js`
where `<json>` is a PreToolUse payload with `tool_name: "Bash"` and the command under test.

1. **Denies push to main** → payload command `git push origin main` → output `permissionDecision: deny`.
2. **Denies push to master via refspec** → `git push origin HEAD:master` → `deny`.
3. **Denies force-push** → `git push --force origin feature` → `deny`; but `git push --force-with-lease origin feature` → **allow** (not denied).
4. **Denies `rm -rf`** → `rm -rf build/` → `deny`.
5. **Denies bare SQL destructors** → each of `DROP TABLE users`, `TRUNCATE users`, `DELETE FROM users` → `deny`.
6. **Denies `git reset --hard` / `git clean -f` / `git commit --no-verify`** → each → `deny`.
7. **Allows read-only git introspection** → `git status`, `git diff --name-only` → **allow** (not denied).
8. **Quote-stripping false-positive guard** → `git commit -m "drop table fix"` → **allow** (the quoted "drop table" must NOT trigger).
9. **Coding-mode gate** → with `ANTHROPIC_BASE_URL` unset (planning), `git push origin main` → hook is a **no-op / allow** (must not fire in planning mode).
10. **Recovery hatch** → with `APEX_DESTRUCT_GUARD=off` set, `rm -rf build/` → **allow** (guard disabled for the deliberate one-off).

## Commands to run

```sh
# In a deepseek coding session. Construct the JSON per the live PreToolUse contract (confirm field
# names against the Claude Code hook API first — see Gotchas). Example skeleton:
echo '{"tool_name":"Bash","tool_input":{"command":"git push origin main"}}' | node ~/.claude/hooks/destructive-command-guard.js
echo '{"tool_name":"Bash","tool_input":{"command":"git status"}}' | node ~/.claude/hooks/destructive-command-guard.js
```
