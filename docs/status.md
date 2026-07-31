# Project: APEX — Coding/Development System
_A system of Claude Code skills: orchestration, planning, coding, and the gates between them._

stack: Markdown / Claude Code skills
autonomy_level: L2

> **This file is LIVE STATE ONLY. It is rewritten, never appended to. Hard cap: 100 lines.**
> History does not live here: what changed → `git log` · what the build learned → `docs/handoff/` ·
> why a decision was made → `docs/technical/adr/` · durable user/project facts → memory.
> A row whose work is done gets **deleted**, not marked done. Model/provider routing lives in
> `~/.claude/hooks/apex-session-context.md` (hook-injected), not here. See ADR-037.

_Last updated:_ 2026-08-01

<!-- CODING:START -->
## In-Flight
| What | State | File | Next |
|------|-------|------|------|
| **wrapper-hygiene build: CLOSED, awaiting owner sign-off** | 14 tasks + 6 repair rounds, full suite green in worktree AND integrated live `~/.claude`; Opus review BLOCK→fixed→delta FLAG (advisories → owner queue); family gate exit 0; worktree branch commit `c4249c1`; handoff `docs/handoff/2026-08-01.md` + spec archived to done/ | staged in both trees | owner: approve the TWO commit drafts (in chat) + 4 adjudication items (handoff § Owner adjudication) |
| build-orchestrator-contract | PARKED (Sol r4: 36/43; ONE line — :306-307 "carry neither" contradicts the identity partition) | `docs/drafts/build-orchestrator-contract.md` | wave-3: one-line fix + widened sweep + single Sol re-check → promote |

<!-- CODING:END -->

<!-- PLANNING:START -->
## Pending Specs
| Spec | Summary |
|------|---------|

## Open Questions

- **Owner queue:** (1) approve ~/.claude commit (14 wrapper files + SKILL.md 2.15.0) · (2) approve
  apex commit (wave-2 sweep deletions + task-10 ADR-040/046 + SKILL-HISTORY + handoff + archival +
  status; path-EXCLUDES concurrent session's `gpt-5.6-family-adoption.md`) · (3) adjudicate 4 items
  in handoff § Owner adjudication: -AllowSharedWorktree/exit-80 spec amendment · spec's
  `branch -[dD]` acceptance-grep narrowing · delta-review low advisories (gate row_kind skip breadth,
  -Adopt stdout diff tail, lease fixture fidelity, exit-81 stream) · teardown mutex-across-git debt.
- **Wave-3 queue** (unblocked now the wrapper build closed): preflight baseline digest→green cache
  + cheap-gates-first ordering (`docs/research/preflight-baseline-cache-plan-2026-07-31.md`) ·
  sandbox-TEMP fix (`docs/research/sandbox-temp-research-2026-07-30.md`) · P2(b/c) AGENTS.md verify
  contracts + per-worktree venv · family-gate integrated-tree digest binding · apex-plan:156
  residual (owned by orchestrator spec) · orchestrator spec one-line fix (row above).
- Queued analyses: `attended` telemetry definition (shipped in wrapper spec — verify in practice) ·
  effort-policy bakeoff evidence (P7 a3) · post-ship scope-check re-census (~10 build days after wave 2).
- **Harness kill anomaly (2026-07-31/08-01):** background dispatches externally killed 4/9 (whole
  tree; owner says not them; cause unknown); foreground 10-min timeout also kills the tree;
  schtasks/Start-Process detachment classifier-blocked. Mitigations in memory + handoff. Watch.
- Remaining catalogued debt: scopelock's 2 pre-existing failures · `tasks/` runtime-exclusion
  (P5(d) shipped — verify) · manual cleanups owed: `%TEMP%\apex-wt-wrapper` + `%TEMP%\apex-wt-adr032`
  worktrees (tear down after commits land; branch deletion = owner, D8) · `%TEMP%\apex-wt-c45` +
  branch `wave-c45` · bulk `artemis-wt-*` · `%TEMP%\codex-*-plan-check*` Sol reports (~15) · ledger
  orphan `3b651688` (P5 shipped: adopt/abandon now possible) · scratchpad snapshots (post-r5kill,
  post-r6kill) auto-expire with session.
- A concurrent session is active in this repo and ~/.claude (its `docs/drafts/gpt-5.6-family-adoption.md`
  edit and `hooks/apex-ledger-append.ps1` are theirs — do not touch, do not commit).
<!-- PLANNING:END -->
