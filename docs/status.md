# Project: APEX — Coding/Development System
_A system of Claude Code skills: orchestration, planning, coding, and the gates between them._

stack: Markdown / Claude Code skills
autonomy_level: L2

> **This file is LIVE STATE ONLY. It is rewritten, never appended to. Hard cap: 100 lines.**
> History does not live here: what changed → `git log` · what the build learned → `docs/handoff/` ·
> why a decision was made → `docs/technical/adr/` · durable user/project facts → memory.
> A row whose work is done gets **deleted**, not marked done. Model/provider routing lives in
> `~/.claude/hooks/apex-session-context.md` (hook-injected), not here. See ADR-037.

_Last updated:_ 2026-09-30

<!-- CODING:START -->
## In-Flight
| What | State | File | Next |
|------|-------|------|------|
| Role redesign | design COMPLETE 2026-09-30 (items 1–37) | `docs/drafts/role-redesign.md` | prerequisites all resolved 2026-09-30 → apex-plan → ADR-048 + staged specs (cheap swaps first, spec author first) |

<!-- CODING:END -->

<!-- PLANNING:START -->
## Pending Specs
| Spec | Summary |
|------|---------|
| `role-redesign` (drafts/, design draft pre-spec, 2026-09-27) | Direction B role redesign to cut Anthropic spend: Steward/Architect/Builder/Critic/Scribe + Engine, planning gate (Opus 5.5 plans, gpt-6-sol checks), per-repo `system-map.md` read before every non-trivial change. Design COMPLETE 2026-09-30 (items 1–37); prerequisites all resolved 2026-09-30; ready for apex-plan. Absorbs dispatch-receipt-preflight into the Engine (item 37). Supersedes the model-routing-refresh open question below. |
| `dispatch-receipt-preflight` (drafts/, 2 plan-check rounds + adjudication done) | Receipt gate: `spec-preflight.ps1` -Generate at promotion / -Verify at dispatch; wrapper exit 84; 13 files. Sidecar has full round record. Follow-ups queued: `receipt-authoring-contract` · artemis AGENTS.md worktree/import-origin rule · family-gate pairing · artemis 9-spec receipt migration (owner decision). ADR-047 drafted. **PARKED 2026-09-30: folded into the role-redesign Engine (item 37), not built standalone.** |

## Open Questions

- **Model-routing refresh — now carried by `docs/drafts/role-redesign.md` (2026-09-27); this entry is history, delete once the draft is promoted. PARKED by owner 2026-09-23, revisit ~2026-09-26+.** Research in
  `docs/research/model-refresh-2026-09/` (landscape · artemis-rework-evidence · gpt6-sol-luna-comments).
  Host rec: Fable 5→5.1 host; Opus 5→5.5 for spec author/build orchestrator/apex-reviewer/
  apex-spec-reviewer (currently sonnet — ledger says opus-5, mismatch unresolved; verify `opus` alias
  resolves to 5.5); coder: keep gpt-5.6-sol, A/B `gpt-6-sol` (CLI ≥0.155) once practitioner reports
  mature (quota burn + scope); no Astra (scope-overreach reports), no Luna. Artemis rework was ~80%
  process (no review stop rule, unexecuted author/host fixes), not model — propose ADR: executed
  Claude review first + single Sol cross-family pass + third-strike/defect-class counting.
  Owner decisions owed: (1) ChatGPT plan tier (2) approve Claude swaps → apex-plan (3) review-loop ADR.
  On revisit: re-run the GPT-6 Sol/Luna comments sweep first.
  **2026-09-27 owner direction (resume 2026-09-28):** goal = cut Anthropic token spend. Proposal:
  Astra host · gpt-6-sol replaces Opus roles + codes · cross-family (Claude) review tiered by
  difficulty. Checked: codex 0.157.1, gpt-6-astra/gpt-6-sol in catalog (live call unprobed — owner
  `! codex exec -m <id>`). Astra-as-Claude-Code-host unsupported → owner picked option 1: Claude
  host, Astra as dispatched deliberator. Open: cheapest Claude host (Sonnet?), approve review tiers
  (low=Astra-reviews-Sol · med=+Sonnet · high=Opus required + Claude spec check), then apex-plan
  one spec + ADR-032/034/042 amendment (wrapper `-Model` param; Opus roles → wrapper dispatches).
- **Wrapper-hygiene build SHIPPED 2026-08-01** (commits `d5d872f` ~/.claude · `ecd4a25` apex; handoff
  `docs/handoff/2026-08-01.md`). **Owner queue — 4 adjudication items** (details handoff § Owner
  adjudication; recommended: fold all into one small wave-3 "wrapper-hygiene follow-ups" spec):
  (1) -AllowSharedWorktree/exit-80 spec amendment (narrow live-sibling exclusion to running/stalled)
  (2) spec's `branch -[dD]` acceptance-grep narrowing, then remove the ([char]45) evasion
  ALL SIX OWNER ITEMS CLOSED by wrapper-follow-ups (shipped 2026-08-02). OWED TO OWNER at next
  attended moment: (a) one-line AGENTS.md ~/.claude verify-fence addition (events suite — parked
  host-state) (b) ~/.claude commit: 7 integrated wrapper files + 2 orchestrator artifacts +
  registry (git add -f by name; check concurrent-session dirt first) (c) adopt-sweep the 7
  dispatcher-test orphans — NOW RECOVERABLE via the shipped -Adopt -RunId any-phase fix.
- **Wave-3 queue** (unblocked now the wrapper build closed): preflight baseline digest→green cache
  + cheap-gates-first ordering (`docs/research/preflight-baseline-cache-plan-2026-07-31.md`) ·
  sandbox-TEMP fix (`docs/research/sandbox-temp-research-2026-07-30.md`) · P2(b/c) AGENTS.md verify
  contracts + per-worktree venv · family-gate integrated-tree digest binding · apex-plan:156
  residual (owned by orchestrator spec) · orchestrator spec re-alignment (row above; was "one-line
  fix" — invalidated by Sol r5).
- Queued analyses: `attended` telemetry definition (shipped in wrapper spec — verify in practice) ·
  effort-policy bakeoff evidence (P7 a3) · post-ship scope-check re-census (~10 build days after wave 2).
- **Harness kill anomaly (2026-07-31/08-01):** background dispatches externally killed 4/9 (whole
  tree; owner says not them; cause unknown); foreground 10-min timeout also kills the tree;
  schtasks/Start-Process detachment classifier-blocked. Mitigations in memory + handoff. Watch.
- Remaining catalogued debt: scopelock's 2 pre-existing failures · `tasks/` runtime-exclusion
  (P5(d) shipped — verify). Cleanup DONE 2026-08-01: all 5 apex-wt-* worktrees removed (adr032's
  transplanted ADR edits stashed on `codex/adr032`), 368 Sol plan-check temp files deleted;
  c45/artemis worktrees were already gone. 2026-08-01 late: both apex-worktree orphans
  (audit-step2-m2b-m3 task10 ×2) resolved via -Adopt → adopted-blocked (abandon refuses exit-82 on
  the dirty tree; adopt is the working recovery for dead orphans). STILL OWED: ~24 orphans on
  OTHER worktrees — ~9 hold ~/.claude and will exit-80-wedge any dispatch there under the new
  strict wrapper (adopt-sweep at a clean moment) · ledger orphan `3b651688` abandon (exit-82,
  dirty ~/.claude) · owner branch deletions (D8): `codex/retro-wrapper-hygiene`, `codex/adr032`,
  `codex/retro-planning-gates`, `codex/retro-scope-check`, `codex/retro-valver`, `wave-c45`.
- A concurrent session is active in this repo and ~/.claude (its `docs/drafts/gpt-5.6-family-adoption.md`
  edit and `hooks/apex-ledger-append.ps1` are theirs — do not touch, do not commit).
<!-- PLANNING:END -->
