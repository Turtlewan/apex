# Plan brief draft: Stage 5 Unattended queue drain (research, read-only)

Paths: SK = C:\Users\User\.claude\skills\apex-code ; D = C:\Users\User\apex\docs

## Problem
Today one Engine run = one spec, started by the host. Role-redesign items 43-45 want a detached drainer: owner registers one
scheduled task; it watches a queue file; per spec it runs the Engine, parks failures and continues independents, waits out
quota and resumes, and ends with batched commit approval + attended Critic review. Also fold in the receipt gate
(absorbing dispatch-receipt-preflight, exempting -AuthorSpec) and engine-build-output-residue (a prerequisite: today any repo
whose verify makes declared ignored dirs parks).

## Current state (anchors)
Engine (SK\scripts\apex-engine.ps1, 1589 lines; helpers engine-plan/-git/-dispatch.ps1):
- Single spec per process: params SpecPath/Repo/Resume/Teardown (apex-engine.ps1:3-19). No queue concept anywhere.
- Durable state: engine-state.json per run dir under StateRoot (default %LOCALAPPDATA%\apex) (:89, :1251, :1325); schema
  SK\references\engine-state-schema.json (331 lines); exclusive engine.lock (:80-104); Save-RunnerState/Add-RunnerTransition.
- Resume: -Resume <32-hex run id> (:1447-1509); statuses resumable running/partial/parked/paused/awaiting-review (:1455);
  re-checks spec digest (:1494-1497), integration worktree + branch tip (:1500-1504); reconciles live child via Resume-RunnerAttempt
  (:738-763, PID+start-time liveness, -Adopt of wrapper run). Crash-window adoption via commit_intent (wave 2a).
- Parking: Set-RunnerParked (:321) at ~40 sites; per-task park keeps worktree; exit 1 parked, exit 2 awaiting-review
  (risk-high pause, wave 2b; resume needs -ReviewVerdict/-ReviewDigest/-ReviewRecord, :1518-1535).
- Quota: Test-RunnerQuotaResult (:505-550, JSON + plain-text; plain-stderr regex still line-start anchored per status.md follow-ups)
  -> sets run status `paused`, diagnosis 'quota or rate limit' (:637-640). It ONLY pauses and returns; there is NO wait-for-reset
  loop, no reset-time parse, no auto-resume. Other retry logic: capacity exit 79 up to 10 retries (:606-607), exit 80 adopt retry
  (:614-632), 60s EngineRetryDelaySeconds (:46-52).
- Critical files: exit 10 requires -Attended + confirmation note (:344) => unattended run parks any spec touching critical files.
- Residue gate: Get-RunnerUntrackedIgnoredPaths (:222-240, `git status --ignored`), per-wave inventory (:256-270), unexpected =
  not in pre-wave inventory and not in manifest -> exit 69 (:273-290, :813-818). Only tool-cache paths exempt (Test-RunnerToolCachePath :210).
- Engine writes no ledger/family-gate/review rows (handoff 2026-10-04 wave 2b; deferred list names "queue/watcher/unattended drain").
- Builds integrate uncommitted; hand-off into repo, spec archived by Engine/host; commits are host work.

AFK pieces: SK\references\afk-endgate.md (77 lines): one Opus apex-critic whole-run pass per AFK run, host-dispatched via Agent tool
with model opus, diff `git diff <run_base_sha>..HEAD`; findings P1 -> fix loop, P2/note -> morning triage. Reusable as-is for the drain's
end-of-run review but run is per queue, so run_base_sha must be recorded per spec or per drain.
orchestrator-protocol-schema.json description (line 5): "UNATTENDED/AFK BUILDS ARE OUT OF V1" - applies to the retired orchestrator; Engine path is separate.

Design source D\drafts\role-redesign.md: item 43 (:276-277) scheduled task watches queue file, host only writes queue file, never launches;
item 44 failed spec parked, dependents skipped, independents continue, quota -> wait for reset + resume, NEVER fall back to another model;
item 45 (:281) builds finish integrated+uncommitted, Critic reviews at attended close-out, no headless `claude -p` (capped credit pool).
Line 204 rollout stage 5 = Engine; line 270s item 41/37. D\drafts\role-redesign.md:~232 "dispatch-receipt-preflight may be absorbed by the Engine; decide before building it."

Detachment/kill risk: status.md:84-86 harness kill anomaly (bg dispatches killed 4/9, foreground 10-min timeout kills tree, "schtasks/Start-Process
detachment classifier-blocked"); handoff 2026-08-01.md:48; handoff 2026-10-01.md:118 (auto-mode classifier denies host dispatch and host
integration of self-modifying work); memory bg-shell-low-memory-reap (CC kills idle bg shells under low RAM; env
CLAUDE_CODE_DISABLE_BG_SHELL_PRESSURE_REAP=1; <=2 concurrent Codex); sonnet-orchestrator-early-return (orchestrators end turns early); afk-gate-reverted
(do NOT build a second permission system - use autonomy mode + acceptEdits + permissions.allow). Design item 43 already routes around the classifier:
the OWNER registers the scheduled task with one `!` command, the host never launches. Engine's own state/resume makes a kill recoverable.

## dispatch-receipt-preflight (D\drafts\dispatch-receipt-preflight.md, 550 lines, status draft, L2; review log 9 lines; ADR-047 draft exists)
Spec: new spec-preflight.ps1 (-Generate at promotion / -Verify at dispatch), receipt schema, wrapper gate refusing -Phase build with no current
receipt (new exit 84, -SkipReceiptCheck sole bypass, -SkipBaselineCheck must not disarm), marker file in progress dir, orchestrator-protocol enum +84,
13 files, 8 tasks. Review log: 2 Sol plan-check rounds BLOCK (11 BLOCK each), then host-adjudicated repair, NEVER re-verified post-repair.
Still valid vs today's code:
- Wrapper -Phase accepts build/review; build gate must sit outside the `Phase build && workspace-write` pre-flight region (assumption; re-verify line refs).
- Exit 84 free; but orchestrator-protocol-schema refusal enum (SK\references\orchestrator-protocol-schema.json:69) = 71,72,74,75,76,78,79,80,81,82,83,124,null - needs 84 (still true).
- -AuthorSpec exists (codex-dispatch.ps1:56, :104-144: forces Phase build, Task author, one Authorized docs/drafts/<name>.md, refuses -SkipBaselineCheck at :110)
  and spec target is a DRAFT with no receipt => the gate MUST exempt -AuthorSpec (owner rule). The draft predates -AuthorSpec entirely (written 2026-08-10).
- Engine ALSO calls the wrapper -Phase build per task (engine-dispatch.ps1:130, :919) - the draft only considered the host; Engine would need to pass
  -SkipReceiptCheck or have its own receipt step; design item 21/"Engine (code) ... receipt preflight" (role-redesign roles table) says receipt belongs to Engine.
- Receipt-at-promotion depends on apex-plan deleting the sidecar at promotion (apex-plan SKILL.md) - re-verify; apex-plan has changed with the four-role split (spec author = gpt-6.x-sol, ADR-048).
- Wrapper-hygiene state moved a lot (wrapper-model-luna spec, -Model, Engine waves): every codex-dispatch.ps1 line anchor in the draft is stale; file is now ~2850+ lines.
- Receipt probes/verdict projection need sidecar row grammar the planning flow does not yet emit (draft's own caveat: receipt-authoring-contract follow-up) => legacy specs all need bypass.
Recommendation: cut scope. Keep only the drain-relevant slice: per-spec receipt = spec digest + premise-file digests + terminal review verdict, verified by the DRAIN/Engine at queue-pop
(not inside the wrapper), so no wrapper exit-code/enum churn. Defer probes and receipt-authoring-contract. Needs a fresh plan-check; do not build the old draft.

## engine-build-output-residue (needs)
- Today: parallel-codex.md:64-65 states the limitation; SKILL.md:150 documents AGENTS.md `## Build outputs` (declared ignored dirs) but the Engine residue scan ignores the declaration.
- Need: engine-plan.ps1 (parse `## Build outputs` from AGENTS.md - note status.md follow-up: engine-plan AGENTS parser diverges from apex-baseline-check grammar; multi-root warning omits root)
  to surface declared paths in state; apex-engine.ps1 Get-RunnerUnexpectedResidue (:273) to exempt declared dirs; question: are declared dirs then NOT copied to integration (they are ignored build artefacts - leave untracked in the integration worktree and clean at teardown)? Teardown path (:1281) must remove them or they leak into hand-off. Tests in engine-test.ps1 (2213 lines, fixture w/ ignored dir). Update parallel-codex.md:64 limitation text.
- Must land BEFORE or WITH the drain: otherwise any Artemis/Atlas-style client repo with build outputs parks every queued spec.

## Proposed structure: 3 file-disjoint specs
Spec A `engine-build-output-residue` (risk medium): engine-plan.ps1, apex-engine.ps1 (residue fn only), engine-test.ps1 / engine-plan-test.ps1, parallel-codex.md. Independent, ship first.
Spec B `queue-drain-runner` (risk HIGH): the drainer. New skills/apex-code/scripts/apex-drain.ps1 (+ apex-drain-test.ps1, queue/state schema) that: reads a queue file (JSONL, one spec path+repo per row,
  host appends only); pops specs in order with dependency/skip rules; launches apex-engine.ps1 as child (powershell.exe -File, with -Attended NOT set); per spec status
  integrated/parked/skipped-dependent/paused-quota; on paused-quota parses reset time (fallback fixed backoff, cap) sleeps then `-Resume <run id>`; never switches model; own lock + drain-state.json for crash resume
  (re-evaluates child run state, uses existing -Resume/-Adopt); writes a drain report (queue summary, per-spec run id, run_base_sha, parked diagnoses, drafted commit messages).
  Plus one owner `!` registration script (schtasks /create) kept as an owner-run artifact. Also needs a minimal Engine change if a machine-readable
  exit/summary is wanted (apex-engine.ps1 Write-RunnerSummary) - keep that to a tiny additive edit OR have the drain read engine-state.json directly (preferred: zero Engine edits => disjoint from A).
Spec C `drain-close-out-and-receipt` (risk medium): drain-time receipt check (spec-preflight slice above, new file spec-preflight.ps1 + schema + test), host-side batched approval flow in apex-code SKILL.md / apex-orchestrate (morning report -> one batched commit approval, then AFK end-gate afk-endgate.md Opus pass over run_base_sha..HEAD), apex-plan promotion step to generate the receipt,
  AGENTS.md verify-fence addition, ADR-047 finalisation, SKILL-HISTORY.md/SKILLS.md double-write. Depends on B's report format.
  Optionally drop the receipt out of C to a separate follow-up if the owner wants the drain first.

## File map (path / op / role)
| Path (relative to ~/.claude unless stated) | Op | Spec | Role |
| skills/apex-code/scripts/engine-plan.ps1 | modify | A | parse Build outputs |
| skills/apex-code/scripts/apex-engine.ps1 | modify | A | residue exemption + teardown cleanup |
| skills/apex-code/scripts/engine-test.ps1, engine-plan-test.ps1 | modify | A | cases (proven-red) |
| skills/apex-code/references/parallel-codex.md | modify | A | drop limitation |
| skills/apex-code/scripts/apex-drain.ps1 | create | B | queue runner |
| skills/apex-code/scripts/apex-drain-test.ps1 | create | B | hermetic suite w/ fake engine |
| skills/apex-code/references/drain-queue-schema.json | create | B | queue + drain-state shape |
| (owner-run) register-drain-task.ps1 | create | B | schtasks registration, `!` command |
| AGENTS.md (verify fence) | modify | B,C | new suites (disjointness: one spec owns it per wave; serialize B then C) |
| skills/apex-code/scripts/spec-preflight.ps1 + spec-receipt-schema.json + test | create | C | receipt generate/verify |
| skills/apex-code/scripts/codex-dispatch.ps1 | modify (OPTIONAL) | C | only if gate stays in wrapper; recommendation: avoid, exempt -AuthorSpec by design |
| skills/apex-code/SKILL.md, skills/apex-plan/SKILL.md, apex-orchestrate SKILL.md | modify | C | drain flow, receipt at promotion, batched approval (apex-orchestrate/SKILL.md:57 "Opus 5" fix rides along) |
| C:\users\user\apex\docs\technical\adr\ADR-047, ADR-048 amend | modify | C | doctrine |
| C:\users\user\apex\SKILL-HISTORY.md, SKILLS.md | modify | C | double-write |
Skill/AGENT edits are planning-mode work (classifier gates .claude protected paths; dontAsk denies) - plan owner-run integration for those, per memory classifier-gates-protected-path-edits.

## Open owner decisions
1. Detachment mechanism: owner-registered scheduled task (item 43) vs `!`-launched detached process; confirm owner will run the one `!` registration command, and whether the task is repeating (poll queue every N min) or on-demand.
2. Quota wait policy: max wait cap (hours), reset-time source (parse Codex message vs fixed backoff), poll interval; after the cap -> park whole drain or remaining queue as `paused`? (item 44: no model fallback.)
3. Critical-file specs in an unattended drain: park (current behaviour, exit 10 needs -Attended) vs allow with pre-recorded confirmation in the queue row. Same for risk: high specs (Engine pauses awaiting-review exit 2) - skip, or treat as park and continue?
4. Dependency semantics between queued specs (explicit `depends_on` in queue row vs spec front-matter; "dependents skipped" needs a source).
5. Receipt: keep scope slimmed (spec digest + premise files + verdict), enforced by drain/Engine rather than the wrapper? Confirm -AuthorSpec exemption by design, and that legacy specs in docs/changes get a one-time bypass/migration.
6. End-of-drain: one whole-queue Opus end-gate (afk-endgate.md) vs per-spec; per-repo? Batched commit approval presentation (single morning list) - is the existing CLAUDE.md Git rule (hold drafted messages, approve together) sufficient?
7. Concurrency: serial specs (recommended; <=2 concurrent Codex per bg-reap memory and the max_parallel_codex cap) vs parallel specs across repos.
8. Whether to pin env CLAUDE_CODE_DISABLE_BG_SHELL_PRESSURE_REAP=1 (only relevant if any bg shell is used; the scheduled task is outside CC so not subject).

## Risks
- Detached process runs outside Claude Code: permissions/classifier do not apply to it, but it runs Codex with workspace-write unattended - a defect has a larger blast radius; relies on Engine's scope-lock, critical-file park, tree-pin digest checks. Hence risk HIGH for B.
- Quota wait: Test-RunnerQuotaResult signatures unconfirmed (plain 429 sample never seen; plain-stderr regex line-start anchored) - a missed signature turns quota into a process failure retry/park cascade across the whole queue. Needs a real-sample capture or conservative fallthrough (treat repeated consecutive process failures as quota-suspect -> pause, not park-all).
- Kills/reaps: whole-tree kills recorded 3/6 and 4/9; the drain must be crash-resumable (drain-state + engine-state + -Adopt); resumed engine already reconciles child by PID+start-time.
- Stale-ledger wedge (memory codex-dispatch-ledger-wedge): a pre-launch hang on stale running/adopting rows would stall the queue silently - drain needs a no-progress watchdog (log LastWriteTime) before declaring a spec hung.
- Residue spec (A) interplay: skip-then-park cascade if A not shipped; ship A first.
- Receipt draft staleness (all line anchors stale; 2 BLOCK rounds never re-verified): re-run Sol plan-check on the slimmed receipt spec.
- Test environment: Codex sandbox blocks vitest/esbuild - irrelevant here (PowerShell suites), but hermetic fake-codex drain tests must not touch the real ledger (known engine-test "machine-ledger isolation" flake when a concurrent real dispatch writes the ledger).

## Suggested risk
Spec A: medium. Spec B: HIGH (unattended autonomous writes + detached process; Engine pause-after-wave review applies to the build of B itself).
Spec C: medium (high if the wrapper gate is kept). Overall: high.
