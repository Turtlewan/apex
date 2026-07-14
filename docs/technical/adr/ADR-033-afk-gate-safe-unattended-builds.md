# ADR-033 — AFK gate + safe unattended builds

**Status:** **Partially REVERTED (2026-07-14).** The **AFK gate half (the `afk-permission-mode` spec — flag
file, `!afk` terminal arming, `afk-gate.js` PreToolUse hook, `apex-afk` skill) is REMOVED.** The three safety
mechanisms (A1 end-of-run pass, A2 silent-regression lenses, A3 invariant freshness, A4 durable dispatcher)
**stand and remain in force**. See § Reversal below.

**Amended by [ADR-034](./ADR-034-sol-default-coder.md) (2026-07-13):** the A1 standing end-of-run adversarial
pass still runs on every AFK build, but on **Opus, not Sol** — Sol became the default coder, and the end-gate
must not review its own run (evaluator-independence). Recipe: `apex-code/references/afk-endgate.md`.
**Supersedes/extends:** ADR-032 (role split), ADR-015 (dispatch return contract / one-retry), ADR-028/029 (parallel waves)

## Context

Two independent failures block trustworthy overnight/unattended ("AFK") builds, both surfaced by
real Artemis runs:

1. **The permission gate halts unattended runs.** An AFK build must sometimes run an operation the
   Claude Code safety *classifier* can't clear — the recurring case is bouncing a dev server
   (`Stop-Process -Force` / `taskkill /F /PID` on the port owner). apex-code's AFK Build Mode already
   runs in `dontAsk`, but **`dontAsk` converts the classifier's "ask" into a *deny*** for
   classifier-uncertain commands — so the kill is *denied*, the redeploy never happens, and the night
   ends "half-done" (code built, never shipped). Artemis logged "classifier denied the serve-kill"
   across ≥3 nights. Neither `dontAsk` nor an ad-hoc command allowlist (PIDs vary) fixes this.

2. **Green gates ship P1 bugs.** An Opus×Sol retro on an Artemis overnight run
   (`docs/findings/artemis-run-retro-cadence-gaps-2026-07-12.md`) found the per-spec cadence
   (freshness → build → mypy/pytest/vitest → commit) has **no adversarial step**: 20+ commits, all
   gates green, yet a later ad-hoc Sol pass found 3 P1 safety bugs already committed, and a 07-10
   unshielded-await fix *regressed* because its audit wasn't a standing lens.

Removing the stops (1) without adding a safety net (2) yields the worst outcome: a run that
confidently ships P1 bugs all night unattended.

## Decision

Ship "safe unattended builds" as two halves — remove the stops, add the net.

### Permission half
- **`afk-gate` PreToolUse hook** (global, on `Write|Edit|Bash`): when an AFK flag is armed, return
  `permissionDecision: "allow"` for the call **unless** it matches the destructive **never-list**, in
  which case return `deny`. A hook `allow` is authoritative — it overrides both the interactive "ask"
  *and* the `dontAsk` classifier-deny that is the actual bug. Fires whenever the flag is set
  (mode-independent), so AFK works **regardless of session/project**. Reversible: delete the flag.
- **Never-list stays hard-deny even under AFK** — `rm -rf`, `git push` to main/master, `git merge`,
  `git reset --hard`, `git clean -f`, destructive checkout, `DROP/TRUNCATE/DELETE FROM`. The existing
  `destructive-command-guard.js` detection is the source of truth; AFK removes *stops*, never the
  catastrophe floor. A process-kill is recoverable and is NOT on the list → auto-allowed.
- **"afk mode" is a routable trigger** (`apex-afk` skill): arms the flag, sets autonomy **L4**
  (commit-to-branch; no push — push-to-main is a permanent hard block), sets a token/runtime budget
  ceiling, drains the ready spec queue, runs the end-gate (below), then disarms + writes the handoff.
  Arming may cost one approval; everything after is silent.

### Safety half (from the Artemis cadence retro — APEX-owned)
- **A1 — standing end-of-run Sol adversarial pass** (owner-ratified 2026-07-12): the last step of every
  AFK run, before handoff, is a mandatory `gpt-5.6-sol` read-only cross-check over the run's full diff
  → findings table; host triages P1/P2, parks the rest. Standing codex-quota spend, accepted.
- **A2 — regression-class checklist** applied to every codex diff at integration (await-before-yield,
  unshielded `create_task`+await, dropped safety metadata, late optimistic guard).
- **A3 — invariant-freshness** in pre-build re-verify: a spec drafted before a program shift lists
  superseded invariants; UX lockouts trace to the current ADR before build.
- **A4 — one durable codex dispatcher**: stdin-closed, run ledger (PID/worktree/spec/base-SHA/phase),
  no-output watchdog, idempotent resume/adopt.

### Security-review hardening (2026-07-12, apex-security BLOCK×4 resolved)
- **Fail-closed arming.** Armed = flag present AND a parseable **future** `expires=` AND a valid token;
  any missing/unparseable/past field → treated as OFF. The launcher writes the flag atomically.
- **Injection-resistant arming.** Primary arm path is the terminal `afk` launcher (a shell write that
  never enters the CC tool layer). Additionally, `afk-gate` returns `ask` on ANY tool-layer Write/Edit
  targeting `afk.on` — armed or not — so injected/fetched content cannot self-arm silently (it surfaces
  a human prompt; under `dontAsk` it denies). CLAUDE.md §6 self-defense: arming is a privilege
  escalation and must not be triggerable by untrusted content.
- **Fail-closed allowlist, not a denylist (2nd review round).** Under AFK, the armed Bash grant is an
  **allowlist**: `deny` on destructive/exfil/RCE; `allow` ONLY for a documented safe-command-class set
  (build/test/lint runners, git-non-destructive, process-management, file read/move); **fall through** for
  everything else → the normal `dontAsk` gate denies it. A denylist was tried first and rejected — it
  leaked (pipe-to-shell RCE, GET-exfil), and enumerating every bad command is a losing game; an allowlist
  is fail-closed by construction. Write/Edit auto-allowed EXCEPT critical-file paths (env, migrations,
  auth/guard/middleware, all CI configs, package manifests/lockfiles, credential dotfiles, secret/credential
  paths) which fall through. The arm guard covers BOTH channels — Write/Edit and Bash writes of `afk.on`.
  A forged arm can therefore neither wipe, exfiltrate, RCE, poison dependencies, touch critical files, nor
  run any unlisted command.
- **Verified, not assumed.** The "allow overrides dontAsk-deny; deny-wins across hooks" semantics are
  proven by an integration test through the real hook runner with both hooks registered, before the
  spec leaves drafts (not unit-piping each hook alone). `afk-gate` is self-contained on the never-list
  (returns `deny` itself), so correctness does not depend on cross-hook precedence.
- **Enforced ceiling.** `expires=` is the hook-enforced runtime ceiling (auto-disarm). Token/spend
  budget stays a residual gap, covered by the A4 watchdog + the delete-the-flag kill-switch (accepted).

## Consequences
- Unattended runs run prompt-free **and** are checked by an adversarial pass + standing regression
  lenses. Blast radius is bounded by the never-list + a token/cost budget + worktree isolation
  (ADR-029 AFK default) + the L4+ audit log.
- **Residual risk:** the armed `afk-gate` is effectively self-granted bypass. Mitigated by: explicit
  arming (not default-on), the hard never-list, the budget ceiling + kill-switch (delete the flag),
  full audit, and reversibility. This is a deliberate, bounded trade for unattended continuity.

## Alternatives rejected
- **Global `bypassPermissions` default** — removes the gate for *every* session incl. daytime
  interactive work; far larger standing blast radius than an armed, scoped flag.
- **`dontAsk` alone** — is already in use and is the source of the deny; it cannot affirmatively allow.
- **Per-command allowlist for the restart** — brittle (PIDs vary; inline `Stop-Process` one-liners
  aren't prefix-matchable safely). A named restart script + allowlist is a fine *hygiene* add but does
  not generalise to the next unforeseen AFK-necessary op.
- **Skip A1 (checklist only)** — the retro shows the checklist classes are necessary but a fresh
  adversarial read caught what no checklist enumerated; the standing pass is the net.

---

## Reversal (2026-07-14) — the AFK gate is removed; the safety net stays

**What was removed:** `hooks/afk-gate.js`, its `settings.json` PreToolUse registration, the AFK-armed
bypass block in `hooks/backend-pretool-write.ps1`, the `apex-afk` skill + registry row, the `afk` PowerShell
arming function, and the `~/.claude/afk.on` flag. (The `lib/destructive-detect.js` extraction stays — the
destructive-command guard depends on it; its AFK-only helpers are now uncalled.)

**Why.** The gate made unattended runs *worse*, not safer, and the mechanism was self-defeating:

1. **Armed ≠ unattended.** The gate was a **fail-closed allowlist**: armed, it auto-approved ~24 read/copy/git
   commands (`ls`/`cat`/`grep`/`git`/`cp`) and non-critical writes; *everything else fell through to the normal
   prompt*. **No build or test command was on the list** — no `pytest`, `npm`, `python`, `node`, `uv`, `cargo` —
   and none are in `settings.json`'s `permissions.allow` either. So every armed run **stalled at its own
   Verification Recipe**, which is the one thing an unattended build must be able to do. Arming bought a
   halt, not a run.

2. **`isCriticalPath` held back ordinary build targets.** Auth code, migrations, package manifests and CI
   configs are *normal* things a spec changes. Routing them to a prompt guarantees an overnight stall on
   real work. (It also substring-matched `auth` inside `author`, so `apex-skill-author/**` was "critical".)

3. **The security review pushed it the wrong way.** The round-2 BLOCK correctly noted a Bash *denylist* is
   leaky and flipped it to an allowlist — which is right for a sandbox and wrong for a mode whose entire
   purpose is "the owner armed this at the terminal and left." The threat model was inverted: arming is a
   physical, injection-proof act by the machine's owner, so the gate should default to *go* and stop only
   at the irreversible.

4. **It solved a problem the system already solved.** Sessions 65, 68 and 69 each drained a full spec queue
   unattended with **no AFK flag at all** — via `acceptEdits` + the APEX/`~/.claude` write-guard exemption +
   `permissions.allow`. The original AFK — *the autonomy mode in `apex-governance` (Build/AFK vs Edit): "run
   the list, don't ask questions"* — was already sufficient. ADR-033's gate added ceremony on top of a
   working path and broke it.

**What still stands (unaffected by this reversal):** A1 the standing end-of-run **Opus** adversarial pass ·
A2 silent-regression lenses · A3 invariant-freshness pre-flight · A4 the durable Codex dispatcher
(`scripts/codex-dispatch.ps1`). These were the *safety net* half of ADR-033 and never depended on the flag.
The Context section's failure #2 (green gates ship P1 bugs) remains real and remains addressed.

**Do not re-propose a permission-flag gate** without first showing that the plain path (autonomy mode +
`acceptEdits` + `permissions.allow`) actually fails. It did not; the gate was the thing that failed.
If an unattended run genuinely needs a command the classifier won't clear, add that command to
`permissions.allow` — a targeted, inspectable, always-on grant — rather than a second permission system.
