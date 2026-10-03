# Project: APEX — Coding/Development System
_A system of Claude Code skills: orchestration, planning, coding, and the gates between them._

stack: Markdown / Claude Code skills
autonomy_level: L2

> **This file is LIVE STATE ONLY. It is rewritten, never appended to. Hard cap: 100 lines.**
> History does not live here: what changed → `git log` · what the build learned → `docs/handoff/` ·
> why a decision was made → `docs/technical/adr/` · durable user/project facts → memory.
> A row whose work is done gets **deleted**, not marked done. Model/provider routing lives in
> `~/.claude/hooks/apex-session-context.md` (hook-injected), not here. See ADR-037.

_Last updated:_ 2026-10-02

<!-- CODING:START -->
## In-Flight
| What | State | File | Next |
|------|-------|------|------|
| `engine-core` (stage 5 wave 1) | BUILT 2026-10-03 — all 4 tasks family-gate PASS; hand-off into ~/.claude done; spec archived to done/; handoff Session 4 appended. Main fence 14/14 GREEN (engine-test green on a quiet ledger; its isolation case flakes when a concurrent session writes the real ledger — follow-up queued). | docs/changes/done/engine-core.md | OWNER: approve commits (~/.claude + apex), then forced teardown of 5 `.claude-wt/engine-core-*` worktrees + 5 `codex/engine-core-*` branches. Delete this row after. |

<!-- CODING:END -->

<!-- PLANNING:START -->
## Queue (owner-ordered 2026-10-01; work top-down after "resume")
1. **Owner chores:** stop selecting Fable via /model · enable Windows Developer Mode (symlink tests).
2. **Stage 4: Critic consolidation + review sized to risk** (priority; memory `review-ceremony-sized-to-risk`): Sonnet Low/Med, Opus High, retire 3 reviewer agents; doc-only/Low → 1 Claude review, no Sol cold read; simplify on repeated finding class; no prose splits.
3. **Stage 2: Builder A/B** gpt-6-sol vs gpt-5.6-sol (wrapper `-Model` already ships both).
4. **Stage 3: Scribe** on gpt-6-luna (measure per-task quota first; fallback gpt-6-sol low).
5. **Stage 5: Engine** — wave 1 `engine-core` BUILT 2026-10-03 (Engine v1: single-repo, low/medium-risk, not routed by default). NEXT: wave 2 (risk:high pause-after-wave review first; cutover; unattended queue drain: detached runner loop, per-spec park-and-continue, quota wait-resume, batched commit approval; absorbs dispatch-receipt-preflight).
6. **Stage 6: system map + planning gate** (role-redesign items 6–14).
7. **Follow-ups (fold into 4/5):** engine-core (round-3 notes): engine-test "machine-ledger isolation" case fails whenever ANY concurrent Codex dispatch writes the real ledger (needs a hermetic check, not byte-compare of the machine file) · plain-stderr quota regex still line-start anchored · crash-window ladder test starts plan at high (not low→high→xhigh as briefed) · wrapper -Adopt needs full run_id (8-char prefix → misleading "No Codex ledger row matches") · apex-orchestrate/SKILL.md:57 still "Opus 5" for the orchestrator (→5.5; retired anyway by Engine cutover) · stage-4 (handoff 2026-10-02): apex-plan doc-only Sol-skip sites omit `risk: high` precedence · owner `!` scripts must propagate exit codes · Critic dispatch prompts name files (no git) · artemis client has NO lifestyle/nutrition DTO (map sweep) · obligations: 50 stale ledger rows + 2 Atlas `git branch -d` (scratch followups/) · map-sweep finds (2026-10-02): 3 `apex-*` hooks are vendored get-shit-done (gsd 1.41.2; + 261-file get-shit-done/ tree) — absorb-then-remove per APEX-sole-workflow · `hooks/apex-ledger-append.ps1` untracked but permissioned in settings.json · APEX-README/CONTRIBUTING describe pre-ADR-036 world · wave-2 (handoff 2026-10-01 § Wave 2): apex-orchestrate/SKILL.md:57 "Opus 5"→5.5 · apex-research external-repo-study-template.md:53 "(Opus/Fable)" · wrapper encoding scan skips tracked-but-ignored files (~/.claude "0 scanned") · hook/settings specs: plan owner-run dispatch+integration (classifier blocks host self-modification) · ~60 old artemis/Atlas -ListObligations rows · tree-pin exclude `.credentials.json`+`cache/` · scope-check marker-named-dir deletion · tree-pin.ps1 displaced comment · GetAttributes catch fail-closed · dispatch-author-test hardening (adopt replay branch etc., handoff 2026-10-01) · raise -NoOutputTimeoutMin for big generations · `-Adopt -RunId` on an already-adopted row throws misleading "No Codex ledger row matches" instead of a clean exit-75 refusal.
8. **~1 week after wave 2:** re-run spend-by-role; read trial log vs item-17 trigger (wave-2 rounds inflated by process).

## Pending Specs
| Spec | Summary |
|------|---------|
| `role-redesign` (drafts/, design draft pre-spec, 2026-09-27) | Direction B role redesign to cut Anthropic spend: Steward/Architect/Builder/Critic/Scribe + Engine, planning gate (Opus 5.5 plans, gpt-6-sol checks), per-repo `system-map.md` read before every non-trivial change. Design COMPLETE (items 1–41); ADR-048; stage 1 wave 1 built 2026-10-01 (next: spec-author-routing). Absorbs dispatch-receipt-preflight into the Engine (item 37). Supersedes the model-routing-refresh open question below. |
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
