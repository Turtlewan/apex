# Session-66 model-usage amendments — assessment against Wave B1/B2/C ledger data

_2026-07-19. Assessed early (park was ~2026-07-25) on user instruction, using the round-8
B1/B2/B3 + C1/C2/C3 build ledger as the "more GPT-5.6 data" the park was waiting for.
Companion to `docs/research/gpt56-vs-claude-model-usage/README.md`. Decisions below are
RECOMMENDATIONS — adoption changes model-routing docs and needs user ratification._

## The data (machine-global ledger, round-8 waves, wrapper build dispatches only)

- **36 dispatches**, 31 terminal-done (done/done_with_concerns), 5 non-done: 3 exit-67 blocked
  (2 were spec defects fixed in-spec and re-dispatched clean; 1 transient), 1 duplicate blocked
  re-run, 1 `adopted-blocked` (the session-clear-killed run, synthetic).
- **Durations (done runs, n=24): median 3.8 min, p90 ≈ 8 min, max 16.2 min** (the 19-case test
  task c2/task-7). Micro-fix dispatches (one-line/one-file): 0.9–1.3 min.
- **Opus fallback fired: 0 times.** Codex quota never exhausted across two full waves.
- **Effort-escalation ladder fired: 0 times.** Every task succeeded at its dispatched effort
  (high for build tasks, medium for fixes). No bump to max/ultra ever occurred.
- **Concurrency in practice: 1.** Both waves ran sequentially in a single shared worktree
  (exit-71 one-coder-per-worktree rule); the parallel path went unused.

## A1 — Sonnet 5 as the Claude-side CODING fallback [was MED-HIGH]

**Recommend: ADOPT (ratify + doc edit).** The fallback never fired, so there is no build
evidence either way — the case rests, as in session 66, on pool economics: Opus fallback burns
the scarce Max pool on mechanical coding that Sonnet 5 handles, and the cross-family review
structure (Claude reviews Codex; Codex reviews Claude) is unchanged by which Claude tier codes.
Risk is low precisely because the path is rare. Scope: coding fallback ONLY — Opus keeps the
spec-author and high-risk reviewer roles. Files on adoption: `~/.claude/CLAUDE.md` routing
table, apex-code SKILL.md fallback lines.

## A2 — wave concurrency 3→2 + token/$ guardrails [was HIGH]

**Recommend: ADOPT the cap change; DROP the guardrail half as moot.** Practice collapsed to
sequential-in-one-worktree anyway (the isolation contract makes parallel worktrees expensive),
so lowering `max_parallel_codex` 3→2 codifies reality at zero observed cost. The token/$
guardrail motivation predates the split billing reality: Codex spends its own subscription, not
the Anthropic pool, and in-session workers are already bounded by the dispatch-return contract.
No evidence a $-guardrail would have changed any round-8 decision.

## A4 — cheap-worker tier [was: needs own ADR + eval]

**Recommend: KEEP PARKED.** The natural candidates (0.9–1.3 min micro-fixes) already run
fine — on Codex's separate quota, so a cheap tier saves nothing there. A cheap CLAUDE tier
(e.g. Haiku for doc moves/mechanical edits) would only matter if Claude-side worker volume
grows; today those workers are few (reviewers, spec drafts) and quality-sensitive. Revisit if
the Anthropic-pool worker spend ever becomes the binding constraint.

## `ultra` effort rung — eval design (not run)

**Recommend: event-triggered eval, no synthetic benchmark.** 36 real dispatches produced zero
escalations, so there is no natural corpus, and a manufactured one would measure the
manufacturer. Design: the first N (=3) production tasks that genuinely escalate past `high`
become the eval seeds — each is re-run once at `max` and once at `ultra` (fresh worktrees,
same prompt), diffs + verify outcomes compared, and the rung is kept only if `ultra` wins ≥2/3.
Until an escalation happens, the rung costs nothing (it never fires) — cutting it now would be
change without information, keeping it un-evaled is safe BECAUSE it is unreachable in practice.

## Net proposal to ratify

1. A1: Sonnet 5 becomes the Claude coding fallback (Opus unchanged elsewhere).
2. A2: `max_parallel_codex` default 3→2; guardrail half closed as moot.
3. A4: stays parked with a named revisit trigger (Anthropic-pool worker spend becomes binding).
4. `ultra`: stays, with the event-triggered eval armed as designed above (first 3 escalations).
