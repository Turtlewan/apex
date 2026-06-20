# Spec: DeepSeek builds run in `dontAsk` mode, not `auto` — classifier-SPOF fix

**Identity:** Resolve the permission-classifier ↔ DeepSeek-backend single point of failure. The auto-mode safety classifier routes through `ANTHROPIC_BASE_URL`, so on a coding session (where `ANTHROPIC_BASE_URL` → DeepSeek proxy) the classifier runs on the same backend as the coder — a DeepSeek blip blocks **protected-path writes** (`.claude/`, `.git/`, …, which route to the classifier *even when an allow rule matches*) and any non-allowlisted Bash. Fix: run the DeepSeek build path in **`dontAsk`** mode, which never invokes the classifier; `permissions.allow` pre-approves the spec's actions and `permissions.deny` retains the destructive floor (deny rules apply in every mode). Resolves the status.md Open Question (session 53). Verification basis: `docs/research/ui-workflow-absorption/write-allowlist-classifier-spof.md` + Claude Code docs (`/permission-modes`, `/auto-mode-config`, issue #69002 — independent classifier-model pinning is unshipped).

## Files to change

1. `~/.claude/skills/apex-code/SKILL.md` (modify) — add a permission-mode policy to AFK Build Mode + the Permissions pre-authorisation section.
2. `~/apex/SKILL-HISTORY.md` (modify) — prepend one history row.

## Exact changes

### Task 1 — apex-code/SKILL.md: AFK Build Mode pre-flight step

In `### AFK Build Mode` → `Pre-flight:`, insert a new numbered step after step 3 ("Read ## Permissions section…"), renumbering the rest:

```
4. Set permission mode for the DeepSeek build path. The build (interactive AFK, headless `-p`,
   and `wave_dispatch: workflow` waves) must run in **`dontAsk`** mode — NOT `auto`. Rationale:
   auto mode's safety classifier routes through `ANTHROPIC_BASE_URL`, so on a coding session it
   runs on DeepSeek; a DeepSeek blip then blocks protected-path writes (`.claude/`, `.git/`, …,
   which route to the classifier even when allow-listed) and non-allowlisted Bash. `dontAsk`
   never calls the classifier — it executes only `permissions.allow` matches + read-only Bash,
   and denies the rest (no prompt). `permissions.deny` still applies (every mode), so the
   destructive-command floor is intact. Launch headless/workflow builds with
   `--permission-mode dontAsk`; for an interactive session, cycle off `auto`.
```

### Task 2 — apex-code/SKILL.md: wire the spec's `## Permissions` into the allowlist

In `## Permissions pre-authorisation (AFK build)`, after step 1 (the parse step, ending at `network: set of permitted network operations`), insert:

```
1a. `dontAsk` enforces this list at the harness level, so the spec's `## Permissions` MUST be
    mirrored into `permissions.allow` (in `.claude/settings.local.json` or `~/.claude/settings.json`)
    before the build: every `file_writes` path as `Write(<path>)`/`Edit(<path>)`, every `commands`
    entry as `Bash(<exact command>)`, plus the union of the bound `stack_skills` Verification Recipe
    commands (check/typecheck/lint/test/build). An action absent from `permissions.allow` is DENIED
    silently in `dontAsk` — an incomplete allowlist surfaces as a worker failure, not a prompt, so
    the allowlist must be complete for the build's verification loop. Keep `permissions.deny` as the
    destructive floor (it overrides allow in every mode).
```

### Task 3 — SKILL-HISTORY.md row (prepend, newest first)

```
| 2026-06-20 | apex-code | skills/apex-code/SKILL.md | <bump minor> | updated (SKILL) | **Classifier-SPOF mitigation** — DeepSeek build path (AFK + headless + `wave_dispatch: workflow`) runs in `dontAsk` permission mode, not `auto`: auto's safety classifier routes through `ANTHROPIC_BASE_URL` → DeepSeek, so a DeepSeek blip blocked protected-path writes (`.claude/` route to the classifier even when allow-listed) + non-allowlisted Bash (observed building express-waves-as-workflow). `dontAsk` never calls the classifier; spec `## Permissions` mirrored into `permissions.allow`, `permissions.deny` keeps the destructive floor. | docs/research/ui-workflow-absorption/write-allowlist-classifier-spof.md; CC /permission-modes, /auto-mode-config, issue #69002 |
```

## Acceptance criteria

1. `grep -n "dontAsk" ~/.claude/skills/apex-code/SKILL.md` → returns the new pre-flight step **and** the pre-authorisation note (≥2 hits). → verify: both present.
2. `grep -n "auto" ~/.claude/skills/apex-code/SKILL.md` near the new step shows the rationale names auto-mode's classifier as the SPOF (NOT a recommendation to use auto). → verify: read the step; it mandates `dontAsk`.
3. AFK Build Mode pre-flight steps are contiguously renumbered (no duplicate "4."). → verify: read `### AFK Build Mode`.
4. SKILL-HISTORY.md has the new row at the top of the table with the bumped version matching the frontmatter bump in apex-code/SKILL.md. → verify: read both.
5. apex-code/SKILL.md frontmatter `version` bumped (minor) and `last_updated: 2026-06-20`. → verify: read frontmatter.

## Commands to run

```bash
grep -n "dontAsk\|permission mode\|classifier" ~/.claude/skills/apex-code/SKILL.md
grep -n "1a\.\|permissions.allow" ~/.claude/skills/apex-code/SKILL.md
head -8 ~/apex/SKILL-HISTORY.md
```

## Notes (not part of execution)

- **Operational trade-off to confirm with the user:** `dontAsk` denies (doesn't prompt) anything off the allowlist, so the auto-accept "edits land without prompts" UX holds **only if the allowlist is complete**; an omission is a silent worker failure, not a prompt. The mitigation trades auto-mode's classifier convenience for a complete static allowlist + the existing `permissions.deny` floor.
- **Iron Law:** the behavioural rule (mode policy) is APEX-specific routing, not model-redundant — but baseline-test the renumbering/placement on apply. The factual basis (classifier routes via `ANTHROPIC_BASE_URL`; protected-path writes route to the classifier even when allow-listed; `dontAsk` skips the classifier) is doc-verified above.
- **First validation:** a real `wave_dispatch: workflow` build launched with `--permission-mode dontAsk` — confirm workers write `.claude/` paths and run verification commands with no classifier call (and survive a simulated DeepSeek blip).
