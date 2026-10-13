# Project: APEX — Coding/Development System
_A system of Claude Code skills: orchestration, planning, coding, and the gates between them._

stack: Markdown / Claude Code skills
autonomy_level: L2

> **This file is LIVE STATE ONLY. It is rewritten, never appended to. Hard cap: 100 lines.**
> History does not live here: what changed → `git log` · what the build learned → `docs/handoff/` ·
> why a decision was made → `docs/technical/adr/` · durable user/project facts → memory.
> A row whose work is done gets **deleted**, not marked done. Model/provider routing lives in
> `~/.claude/hooks/apex-session-context.md` (hook-injected), not here. See ADR-037.

_Last updated:_ 2026-10-13

<!-- CODING:START -->
## In-Flight
| What | State | File | Next |
|------|-------|------|------|
| OWNER teardown of leftover worktrees/branches (all builds COMMITTED) | New 2026-10-11: drain-plan (`drain-plan-fix1`, `drain-plan-scribe`), engine-linked-worktree (`elw-salvage`, after HOST Engine `-Teardown 43437db9... -Discard -Reason`). Prior: engine-hardening, engine-high-risk-pause, engine-followups-ab, dispatch-pipeline-fixes, wrapper-model-luna, scribe-stage3, engine-build-outputs, engine-recipe-parity, engine-event-schema, engine-cutover (~/.claude 9f94073). New 2026-10-07: engine-task-dash (5d32a59), engine-run-timeout (ad4d4b9), codex-observability-ladder (504e016 + 80924f9), engine-acceptance-gate (16226b5), engine-accept-smoke (90199f3) | docs/changes/done/ | forced teardown of worktrees under `C:\Users\User\.claude-wt` (`engine-acceptance-gate-{fix1,scribe}`, `engine-accept-smoke-scribe`, `coder-default-gpt61-scribe`, `engine-task-dash-{m1,scribe}`, `engine-run-timeout-{m1,m2,scribe}`, `codex-observability-ladder-fix1`, plus prior-build `.claude-wt/*` worktrees above) and their matching `codex/*` branches (guard blocks host forced deletes). Delete row after. |

<!-- CODING:END -->

<!-- PLANNING:START -->
## Queue (owner-ordered 2026-10-06: "queue everything"; research briefs + decisions in docs/research/role-redesign-remaining/; work top-down after "resume", each item starts when the one above ships)
1. **Owner chores:** stop selecting Fable via /model · enable Windows Developer Mode (symlink tests).
2. **Stage 3: Scribe** — BUILT 2026-10-06 (Luna low; first real Scribe run on the next product build — verify end to end).
3. **Stage 5: Unattended queue drain** — ADR-049 (amended 2026-10-11/12/13): drain-plan, engine-linked-worktree, engine-accept-timeout, drain-runner, git-path-decoding all BUILT + committed. `drain-close-out` BUILT 2026-10-13 (read-only `apex-drain-close.ps1 -Plan`, references/drain-close-out.md, apex-code 2.25.0, ADR-049 d9 amended: no per-spec Scribe for drained specs in v1) and `launcher-stdin` BUILT 2026-10-13 (Engine + drain Git launchers close stdin); both commit approval pending, then Engine `-Teardown 791d436c...` / `8d33b9b7... -Discard -Reason`. Later: receipt check (ADR-047). Owner: on-demand trigger, quota wait ≤5h then park.
4. **Stage 6: System map + planning gate** — 6a `system-map-core` BUILT 2026-10-13 (`apex-map-check.ps1`, `apex-size-guard.ps1`, references/system-map.md, apex-init 1.8.0; commit approval pending, then Engine `-Teardown 224f660e... -Discard -Reason`). Next: 6b `planning-gate` (risk high; plan brief written, pre-draft Sol arch pass in progress; an unresolved BLOCK needs owner approval) → 6c Scribe map update + Critic map-edit check → 6e first maps (~/.claude, artemis, Atlas; host-written). **Owner 2026-10-12:** gate checker gpt-6.1-sol xhigh (amends item 48); Medium specs keep the pre-draft Sol pass; staleness via `apex-map-check.ps1 -Stale`; Trivial size guard = host pre-commit script (amends item 33).
5. **Stage 2 close: builder default** — alternate gpt-6.1-sol / gpt-5.6-sol per task on the next real specs (packs naming exact verify commands); switch default only if 6.1 holds; set 6.1-sol effort defaults (high risk-high, medium routine) + note in builder-ab-2026-10.md.
6. **Stage 5 (owner-deferred): in-run fix adoption** — queued last; confirm still wanted before planning.
7. **~1 week after rollout:** re-run spend-by-role; read trial log vs item-17 trigger.
8. **OWNER AGENTS.md action list (from dispatch-pipeline-fixes):** make the heading exactly `## Verify commands` with one fence directly under it (notes below the closing fence) in autoclicker + its worktrees v1-1/v1-2, Ari + wt-02/wt-03, orion-v2, claude-cockpit; autoclicker also commits `## Build outputs` entries `src/*/bin`, `src/*/obj`, `tests/*/bin`, `tests/*/obj`, `TestResults`, `tests/*/TestResults` (committed HEAD only takes effect).
9. **Follow-ups (fold into 3–5 as they land):** 2026-10-13: `apex-drain-test.ps1 -Case safety` Read-TestJson sharing-violation race under load (retry) · scope gate reports a collapsed ignored new folder (`!! skills/apex-plan/scripts`) as out of scope on re-dispatch in ~/.claude (exit 65 false positive) · Engine parks a coder silent >30 min running the full recipe and `-Resume` re-parks exit 124 (coder packs should run only their own suite) · drain-close plan strict-UTF-8-decodes the whole ledger before the run_id filter · apex-code SKILL.md at the 500-line cap · queue-mode Scribe spec · lockstep-block ordinal comparison (three files) · engine-acceptance-gate (2026-10-08): legacy untagged acceptance-line extraction now takes whole criteria (prompt_digest shift for new legacy runs) · spec-validate-test scratch lives in repo `.codex-scratch` (residue if interrupted) · teardown adopts dead rows before a later live-row refusal (idempotent) · Engine wave gate ~25 min (engine-test.ps1) — long runs must launch detached (2h bg cap) · engine-cutover (2026-10-07): Engine default coder model still gpt-5.6-sol (capacity-error risk) · dispatch-preflight/engine-test concurrency flakes (solo reruns pass) · AGENTS-template grammar pointers use APEX-repo paths (use installed ~/.claude/skills/... paths) · guard over-blocks staged-only restore naming a `\`/`@` path before `--` · tree-pin lockstep test compares decoded text not raw bytes · multi-root Build-outputs warning omits the root · T2 near-miss suggestion echoes bad casing / suggests Preflight under -Full · 10 pre-existing SKILL.md >500 lines · gpt-6.1-sol effort defaults (high risk-high, medium routine) + effort note in builder-ab-2026-10.md · engine-hardening (handoff 2026-10-04): O(n²) overlap canonicalisation + drive-path label · residue inventory size · adopt marker check-then-write · machine-ledger test positive control · v1 state resumed mid-wave absorbs residue · engine-core (round-3 notes): stage-4 (handoff 2026-10-02): apex-plan doc-only Sol-skip sites omit `risk: high` precedence · owner `!` scripts must propagate exit codes · Critic dispatch prompts name files (no git) · artemis client has NO lifestyle/nutrition DTO (map sweep) · obligations: 50 stale ledger rows + 2 Atlas `git branch -d` (scratch followups/) · map-sweep finds (2026-10-02): 3 `apex-*` hooks are vendored get-shit-done (gsd 1.41.2; + 261-file get-shit-done/ tree) — absorb-then-remove per APEX-sole-workflow · `hooks/apex-ledger-append.ps1` untracked but permissioned in settings.json · APEX-README/CONTRIBUTING describe pre-ADR-036 world · wave-2 (handoff 2026-10-01 § Wave 2): apex-research external-repo-study-template.md:53 "(Opus/Fable)" · wrapper encoding scan skips tracked-but-ignored files (~/.claude "0 scanned") · hook/settings specs: plan owner-run dispatch+integration (classifier blocks host self-modification) · ~60 old artemis/Atlas -ListObligations rows · tree-pin exclude `.credentials.json`+`cache/` · scope-check marker-named-dir deletion · tree-pin.ps1 displaced comment · GetAttributes catch fail-closed · dispatch-author-test hardening (adopt replay branch etc., handoff 2026-10-01).

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
