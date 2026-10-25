# Project: APEX — Coding/Development System
_A system of Claude Code skills: orchestration, planning, coding, and the gates between them._

stack: Markdown / Claude Code skills
autonomy_level: L2

> **This file is LIVE STATE ONLY. It is rewritten, never appended to. Hard cap: 100 lines.**
> History does not live here: what changed → `git log` · what the build learned → `docs/handoff/` ·
> why a decision was made → `docs/technical/adr/` · durable user/project facts → memory.
> A row whose work is done gets **deleted**, not marked done. Model/provider routing lives in
> `~/.claude/hooks/apex-session-context.md` (hook-injected), not here. See ADR-037.

_Last updated:_ 2026-10-26

<!-- CODING:START -->
## In-Flight
| What | State | File | Next |
|------|-------|------|------|
| `sandbox-temp-env` (spec 1 of Artemis follow-ups; build repo ~/.claude) | plan parked by owner 2026-10-21 after review round 4 | docs/drafts/sandbox-temp-env.md (+ .review.log, round-1..4 findings) | Open finding: inside-repo check must not create the root (walk to nearest existing ancestor + `git rev-parse --show-toplevel`, map to exit 72); notes: plain-path rule vs spaces/8.3 names, SKILL.md 72-row ledger wording, ACE pass/Deny untested. Review cap spent (3 + owner extra) — resuming needs owner direction. |

<!-- CODING:END -->

<!-- PLANNING:START -->
## Queue (owner-ordered 2026-10-06: "queue everything"; research briefs + decisions in docs/research/role-redesign-remaining/; work top-down after "resume", each item starts when the one above ships)
1. **Owner chores:** stop selecting Fable via /model · enable Windows Developer Mode (symlink tests).
2. **Stage 3: Scribe** — BUILT 2026-10-06 (Luna low; first real Scribe run on the next product build — verify end to end).
3. **Stage 5: Unattended queue drain** — ADR-049 (amended 2026-10-11/12/13): drain-plan, engine-linked-worktree, engine-accept-timeout, drain-runner, git-path-decoding, drain-close-out, launcher-stdin all BUILT + committed. Later: receipt check (ADR-047). Owner: on-demand trigger, quota wait ≤5h then park.
4. **Stage 6: System map + planning gate** — 6a `system-map-core`, `planning-gate-check`, `critic-plan-inputs`, first maps (6e) all committed. `planning-intake`: v2, v3, v4 PARKED then deleted 2026-10-15. **v5 BUILT + committed 2026-10-15** (~/.claude 67b16b9, apex 96982b6). Follow-ups 2026-10-15, all applied live or pending fence, commits pending session-end approval: `critic-pack-dedupe` (apex-plan 2.9.1), `engine-args-utf8` (Engine/wrapper UTF-8 reads; fixes Engine-pack mojibake), `skill-text-tidy` (apex-debug 1.5.1, apex-plan 2.9.2, apex-orchestrate 2.7.1), `apex-plan-reencode` (2.9.3; 111 double-encoded runs repaired). Sibling `bugfix-mode-refs` BUILT + committed (~/.claude dc79c4b, apex 4e73b5a). 6c re-planned as `scribe-map-update-v2`: BUILT + committed 2026-10-14 (~/.claude dfbb780). Old parked v1 drafts deleted.
6. **~1 week after rollout:** re-run spend-by-role; read trial log vs item-17 trigger.
7. **Artemis trial evidence review** done 2026-10-20 → `docs/research/artemis-trial-2026-10.md` (9 owner questions open; top proposals: sandbox temp/cache fix in wrapper, Engine spec-shape acceptance, systemic review stop rule). Owner decisions recorded 2026-10-21 (report § Owner decisions). Spec order: 1 sandbox-temp-env (PARKED) · 2 `planning-review-rules` (Q1/Q2/Q3/Q7) BUILT 2026-10-21 (commit pending owner approval) · 3 Engine spec shapes (Q5) = 3a `engine-fence-output` + `spec-pack-build-root` BUILT + committed 2026-10-22 (~/.claude ffe8605, 2b50ec8; apex fe29b19), 3b = 3b-1 `engine-plan-parity` BUILT + committed 2026-10-22 (~/.claude 21453dc, apex 58e9337) + 3b-2 `engine-shared-file-chains` BUILT 2026-10-23 (Engine partial → finished natively; commits pending owner approval) · 4 `admin-cleanup` (Q6; High) BUILT 2026-10-26 (Engine 19ec3f96 review reject -> HOST manual repair, 9 rounds; native fence green; commits pending owner approval) + 4b `review-fixes` (Fable review C2 + classifier/confirmation fixes) BUILT + committed 2026-10-24 (~/.claude 72a4469, apex 43ac51e) · 5 Scribe retry + unattended close-out prep (Q8/Q9).
8. **Follow-ups (fold into 3–5 as they land):** 2026-10-15: engine-args-utf8 Critic notes — other unencoded Get-Content reads in engine-dispatch.ps1 (~549/753/1078/1173) and test files (ASCII today) · engine-dispatch-test.ps1 15 added lines LF in a CRLF copy · v5 sol-2 FLAGs (re-approval budget boundary, replacement-prerequisite remap, manifest-less repo check) — owner discussion · commit prerequisite specs before launching an Engine run that assumes them (worktrees branch from HEAD) · Engine parks while a sibling coder is still running (orphaned, wrapper `-`) · apex-plan SKILL.md never points at the system map/checker/size guard (only apex-init) · sol-plan-check.md:198 stale codex-dispatch.ps1 line pointers · apex-code SKILL.md:115 stale `-Paths a,b,c` warning · workflows/apex-build-wave.js status set vs code-worker.md `done|blocked` · 15 PS suites + 2 hook .test.js not in the ~/.claude verify fence · ~/.claude map 450 lines (> ~400 split guidance) · Critic notes: C2/C5/C6 spec-local labels in apex-critic.md/apex-code SKILL.md; spec-mode enumerated exclusions dropped the "other planning narrative" catch-all · planning-gate-check Sol FLAGs (gate inputs, timeout adopt path, hook-row High doc-only wording, mapless grounding) · critic-plan-inputs Sol FLAGs (C5 plan path resolved from spec-owning repo; scope audit vs concurrent status.md edits) · planning-intake discard-teardown wording · Atlas map gaps (no CI lint; missing referenced paths) · codify split-rule bookkeeping exception · SKILLS.md listing for references/system-map.md. 2026-10-13: `apex-drain-test.ps1 -Case safety` Read-TestJson sharing-violation race under load (retry; recurred 2026-10-20) · scope gate reports a collapsed ignored new folder (`!! skills/apex-plan/scripts`) as out of scope on re-dispatch in ~/.claude (exit 65 false positive) · Engine parks a coder silent >30 min running the full recipe and `-Resume` re-parks exit 124 (coder packs should run only their own suite) · drain-close plan strict-UTF-8-decodes the whole ledger before the run_id filter · apex-code SKILL.md at the 500-line cap · queue-mode Scribe spec · lockstep-block ordinal comparison (three files) · engine-acceptance-gate (2026-10-08): legacy untagged acceptance-line extraction now takes whole criteria (prompt_digest shift for new legacy runs) · spec-validate-test scratch lives in repo `.codex-scratch` (residue if interrupted) · teardown adopts dead rows before a later live-row refusal (idempotent) · Engine wave gate ~25 min (engine-test.ps1) — long runs must launch detached (2h bg cap) · engine-cutover (2026-10-07): dispatch-preflight/engine-test concurrency flakes (solo reruns pass) · AGENTS-template grammar pointers use APEX-repo paths (use installed ~/.claude/skills/... paths) · guard over-blocks staged-only restore naming a `\`/`@` path before `--` · tree-pin lockstep test compares decoded text not raw bytes · multi-root Build-outputs warning omits the root · T2 near-miss suggestion echoes bad casing / suggests Preflight under -Full · 10 pre-existing SKILL.md >500 lines · engine-hardening (handoff 2026-10-04): O(n²) overlap canonicalisation + drive-path label · residue inventory size · adopt marker check-then-write · machine-ledger test positive control · v1 state resumed mid-wave absorbs residue · engine-core (round-3 notes): stage-4 (handoff 2026-10-02): apex-plan doc-only Sol-skip sites omit `risk: high` precedence · owner `!` scripts must propagate exit codes · Critic dispatch prompts name files (no git) · artemis client has NO lifestyle/nutrition DTO (map sweep) · obligations: 50 stale ledger rows + 2 Atlas `git branch -d` (scratch followups/) · map-sweep finds (2026-10-02): 3 `apex-*` hooks are vendored get-shit-done (gsd 1.41.2; + 261-file get-shit-done/ tree) — absorb-then-remove per APEX-sole-workflow · `hooks/apex-ledger-append.ps1` untracked but permissioned in settings.json · APEX-README/CONTRIBUTING describe pre-ADR-036 world · wave-2 (handoff 2026-10-01 § Wave 2): apex-research external-repo-study-template.md:53 "(Opus/Fable)" · wrapper encoding scan skips tracked-but-ignored files (~/.claude "0 scanned") · hook/settings specs: plan owner-run dispatch+integration (classifier blocks host self-modification) · ~60 old artemis/Atlas -ListObligations rows · tree-pin exclude `.credentials.json`+`cache/` · scope-check marker-named-dir deletion · tree-pin.ps1 displaced comment · GetAttributes catch fail-closed · dispatch-author-test hardening (adopt replay branch etc., handoff 2026-10-01). 2026-10-20: Engine keeps no failing wave-fence output (two runs ended `ambiguous wave verification failure`; retain the failing fence tail in state) · Engine combined-wave fence went red twice under a live Engine run while the identical tree passed all 22 suites natively (suspected engine-test/drain interference, unproven) · gpt-5.6 mentions remain in skills/apex-code/references/codex-observability.md and REVIEW-ENSEMBLE-DESIGN.md (descriptive; tidy) · engine-plan-test.ps1:555 legacy-pin case asserts only `-not allowed` (also assert refusal text). 2026-10-21: Engine combined wave fence red for the third time with no output kept (stopped, went native; all 22 green natively except the known drain safety flake, solo green) · Engine coder prompts still make coders run the full verify recipe in the sandbox (~60 min per coder; drain WMI denied) despite spec "own check only" lines · author packs must state build root = dispatched worktree and relative build paths (two specs hard-coded the root; first Engine run blocked) · coders don't see the wrapper's -CriticalFilesConfirmed, so the owner's confirmation must also be stated in the coder prompt · bg-shell low-memory reaper killed a dispatch again (set CLAUDE_CODE_DISABLE_BG_SHELL_PRESSURE_REAP=1; launch long runs detached via WMI) · concurrent artemis3 session appends to apex docs/research/spec-author-trial.md cause author-mode exit 65 false positives · apex-critic.md: "Each receives the prior round's findings file" -> "Each fix check receives" (spec-prescribed wording). · critical-file classifier matches `auth` as a substring ("author" -> exit 76); match whole word · Light-mode template still requires every validator heading. 2026-10-23: engine-plan.ps1:769 spec-identity regex `^…$` accepts a trailing LF (chain regex fixed to `\A…\z`) · validator reports chain interleaving even when the source graph is already cyclic · Engine coder moved engine-plan-test scratch into the repo (`.codex-scratch`) to dodge sandbox TEMP, breaking a non-Git case (fixed) · task-3 ledger row `engine-shared-file-chains-3-a5ba5235` falsely records critical_files_confirmed (host error, see handoff 2026-10-23). 2026-10-26 (admin-cleanup, handoff 2026-10-26): `apex-cleanup-test.ps1` runs 59-67 s against the spec's 60 s (owner-accepted deviation; tighten back under 60 s) · production `Invoke-CleanupNative` still waits on the child with an unbounded `WaitForExit` · apex-scope temp leak: about 36,900 `apex-scope-*` folders in %TEMP% (find the leaking writer; run `apex-cleanup.ps1 -Apply` from an admin shell after the commit) · other PS 5.1 scripts that feed child stdin may get a UTF-8 BOM under chcp 65001 (audit codex-dispatch/engine helpers) · `Get-Command git.exe` returns two paths on this machine (mingw64in and cmd); take the first · a full cleanup inventory costs ~20 s on this machine (37,581 items); list mode ~3.5 min.

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
