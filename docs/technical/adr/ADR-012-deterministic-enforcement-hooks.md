# ADR-012: Deterministic-enforcement hooks — reject gateguard, defer one destructive-command block
**Date:** 2026-06-02
**Status:** Accepted

## Context
ECC absorption Phase 3 proposed porting ECC's hook-enforcement cluster to fix APEX's named
"prose-only enforcement" gap: **gateguard** (fact-forcing PreToolUse gate), **safety-guard**
(Freeze + Careful), and **design-quality-check** (frontend anti-slop). The gap is real — in *coding*
mode APEX has zero deterministic enforcement (the existing write-guard hook is planning-only), so
hard-blocks and scope-lock are pure prose, trusted to the weakest model (DeepSeek).

We read ECC's actual `gateguard-fact-force.js` before deciding. The read changed the picture:

1. **gateguard is a speed-bump, not a gate.** It denies the *first* edit per file, emits a fact
   checklist as the denial reason, and **allows the next attempt unconditionally — no content
   verification.** Its mechanism is interruption + prompt-injection + *voluntary compliance*; it
   forces the checklist into context, never the behaviour.
2. **Efficacy scales with instruction-following** → strongest on the strong model (Claude), least
   certain on DeepSeek, which is exactly the model APEX would point it at.
3. **It no-ops in subagents** (`if (inSubagent) return allow`). APEX does its edits inside dispatched
   `code-worker` subagents — so ported as-is it would barely fire.
4. **The investigation it forces is already done upstream.** APEX's planning/coding split means the
   strong model investigates (importers, surface, intent) at planning time and writes the result into
   the spec (an execution script). gateguard would ask the weak model to re-derive what the spec
   already contains. ECC needs gateguard *because it has no planning/coding split*; APEX does.
5. APEX already has **real (non-voluntary) downstream nets** gateguard lacks: the stack Verification
   Recipe (deterministic build/typecheck/lint/test — code must pass) and santa-method dual review
   (ADR-010).

## Decision
- **Reject gateguard's fact-forcing (P3.1).** Redundant with the planning/coding split and APEX's
  downstream gates; nudge-weak on DeepSeek; no-ops in APEX's subagent edit architecture.
- **Drop design-quality-check (P3.3).** Its judgment home is planning, already shipped in Phase 1
  (`apex-ui-ux-design` AI-slop checklist + scored visual-audit rubric). A PostToolUse regex can only
  pattern-match, not judge.
- **Defer Freeze (P3.2 scope-lock).** Real value but fragile — the hook must parse the active spec's
  `Files to Change` + status.md In-Flight at runtime; best validated against a live Mac build.
- **Keep ONE piece — a deterministic destructive-command hard-block for coding mode.** This is what
  actually fills the named gap: a true `deny`-always (NOT gateguard's speed-bump) for the never-list
  (push to main/master, force-push, `DROP TABLE`, `rm -rf`, `git commit --no-verify`). It works
  *because* it needs no model compliance — the inverse of gateguard's weakness. Reuse gateguard's
  well-built command parser (`isDestructiveBash`/`isDestructiveGit`/`isDestructiveRm` — quote-stripping,
  subshell-aware, force-push edge cases) as the detection layer. Spec queued
  (`docs/changes/coding-destructive-command-guard.md`); **build + validate when the Mac coding env is
  live** (it targets that environment and is unvalidatable on Windows planning).

**Amendment 2026-10-05 (dispatch-pipeline-fixes):** the never-list also blocks worktree-writing
`git restore` in both modes: plain path, `--source`, `-W`/`--worktree`, and the both-mode forms.
Staged-only restore (`--staged`/`-S` without worktree) is explicitly allowed. Path checkout
(`git checkout <sha> -- <p>`) stays blocked. Fail-closed: a quoted token, backslash, `$`, backtick,
or leading `@` before `--` in a restore command blocks it.

## Consequences
**Good.** APEX avoids three hooks that its architecture makes redundant or mistargeted, keeping the
hook layer lean (2 hooks, not 5). The one retained piece is the only one that delivers *actual*
deterministic enforcement and guards the weak coding model where prose is least reliable.

**Bad / accepted.** The "prose-only enforcement" gap is only *narrowed*, not closed today — the
deterministic block is deferred until the Mac exists, so coding-side enforcement stays prose-only in
the interim. Acceptable: there is no live coding env yet, and normal spec-driven builds don't issue
never-list commands (specs are execution scripts; git ops are autonomy-gated).

**Closes ECC absorption.** Of ECC's ~8 candidate mechanisms, APEX adopted those that filled real gaps
as markdown/skill upgrades (context-budget, council, santa-method, stocktake+rules-distill,
skill-comply→Iron Law, prompt-defense, strategic-compact, design details) and **rejected both
hook-heavy mechanisms after deep reads** (instinct engine → ADR-011; gateguard → this ADR) because
APEX's planning/coding split + verification recipe + dual review already serve what they were for.
Imported the judgment; rejected the bloat.
