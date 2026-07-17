# ADR-043 — Guard kill-switches require a reason and leave an audit trace; drop the raw `codex exec` allow-entry

- **Status:** Accepted
- **Date:** 2026-07-17
- **Refines:** ADR-038 (guards run in every session), ADR-041 (wrapper hardening). Touches the four APEX PreToolUse guard hooks and `settings.json`.
- **Source:** round-8 four-way cross-family review of the guard hooks + `settings.json`.

## Context

Two findings share the property that a protection can be turned off — or was never on — without the human operator having intended it, and without any record.

**Silent kill-switches.** `APEX_DESTRUCT_GUARD=off` disables every CLAUDE.md hard block (`rm -rf`, `DROP TABLE`, force-push to main); `APEX_CODEX_GUARD=off` disables the raw-`codex exec` block. Each reads its env var and, on a disable value, returns "allow" with no reason required, no confirmation, and no trace. An env var set once (in a profile, a launcher, a stale shell) then silently disarms a safety control for every later session — the exact `APEX_MODE`-never-set failure ADR-038 was written to end, re-created as an opt-out with no memory. The two guards also carry **divergent** disable vocabularies (`off/0/false` vs `off/disabled/0/false`) parsed by two copied code paths — and a divergent copy of a safety check is how the SQL never-list once tested the wrong side of the quote-stripping and matched nothing.

**A raw-exec allow-entry undercutting the mandatory wrapper.** `settings.json permissions.allow` carried `Bash(codex exec:*)`, pre-approving the precise raw path that `codex-dispatch-guard.js` exists to forbid — every raw `codex exec` auto-approved past the permission prompt, weakening the guard's backstop to a single hook.

Threat model is unchanged: a **careless** operator, not a hostile one. Neither change adds evasion hardening; both protect the human from an unremembered disable and an unintended pre-approval.

## Decision

**1 — a disable is honored only with a reason, and every disable attempt is audited.** A guard's disable env var (`APEX_DESTRUCT_GUARD`, `APEX_CODEX_GUARD`) is honored **only if** `APEX_GUARD_DISABLE_REASON` is also set to a non-empty value. A disable value with no reason is **ignored — the guard stays on** (fail closed). On any disable *attempt* — honored or refused-for-no-reason — a single-line JSON record is appended to `~/.claude/hooks/guard-audit.log`: timestamp, guard name, the reason (or `null`), `honored` true/false, and the tool/command being decided. If the audit line cannot be written, the disable is **not** honored (a disable with no trace is exactly what this prevents).

**One shared helper, not two copies.** The decision + audit live in a single module, `~/.claude/hooks/lib/guard-disable.js`, called by both guards with one disable vocabulary. Per ADR-042's one-shared-definition rule: divergent copies fail open, so there is exactly one.

**2 — remove `Bash(codex exec:*)` from `settings.json permissions.allow`.** Raw `codex exec` now hits the normal permission prompt instead of auto-approving, restoring the hook + permission layering. This affects only **direct** `codex exec` Bash tool calls (the raw path the guard blocks); `codex-dispatch.ps1` spawns Codex as a PowerShell child process, not as a Bash tool call, so the wrapper is unaffected.

## Consequences

- Turning a guard off now requires **intent** (a reason var, set deliberately alongside the disable) and always leaves a **trace** — a stale or forgotten disable var no longer silently disarms a control, and an attempted disable-without-reason is both refused and recorded.
- `guard-audit.log` is a new append-only artifact under `~/.claude/hooks/`; it holds only disable-attempt records and is created lazily on first attempt.
- Both guards share one disable vocabulary and one audit format; the destruct guard's deny message, which points at `APEX_DESTRUCT_GUARD=off`, now also implies the reason var is required.
- Raw `codex exec` costs one permission prompt; the wrapper path (`powershell -File codex-dispatch.ps1 …`) is untouched and still needs no approval.
- The fail-closed contract now covers **malformed shape**, not only parse/timeout errors: a parseable event whose expected field is the wrong type (a `file_path` object, a non-string `command`) is denied, while a genuinely empty event (absent/empty command or `file_path`) is still allowed. Every fail-closed path — including a held-open stdin that times out — emits the real `hookSpecificOutput.permissionDecision: 'deny'` object Claude Code acts on, never bare printed text, and the tests assert on that decision field.
