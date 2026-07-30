# Artemis retrospective → APEX optimization plan (2026-07-29) — v2, post-Sol

**Sources:** Artemis repo mining (466 commits, 32 handoff/investigation docs, 2026-07-15→07-29) ·
codex-run-ledger.jsonl (1,107 in-window dispatches) · live concurrency computation from ledger
intervals · dispatch-wrapper code inspection. Evidence table: 19 issues (appendix A below).
Ledger stats: appendix B.

**Sol plan-check (ADR-032): BLOCK — 21 findings (6 BLOCK / 15 FLAG), run `2345008a`, tree
`699f3a8a5a82`. All 6 BLOCKs accepted (2 verified against cited code before acceptance);
proposals below are the AMENDED versions. Resolution table: appendix C. One item left to the
user: the P4(b) pre-draft architecture pass (requires an ADR-032 amendment).**

## Headline numbers

- 1,107 Codex dispatches in 14 days: 38% `done`, 30% `blocked`, 25% `done_with_concerns`, 2% failed.
- `scopeViolation=true` on 26% of rows; 17 of 23 failures share one cause ("tree moved under pre-flight pin").
- Max observed concurrency **7** (and 3–5 on multiple post-A2 days) vs `max_parallel_codex = 2`;
  interactive sessions meanwhile run at concurrency 1.
- Atlas repo outlier: 88 of 123 dispatches blocked (72%) vs Artemis 31%, APEX-self 25%.
- 29 ledger rows stuck `running`/`adopting` (27 stale >24h); 20+ orphaned `artemis-wt-*` worktrees on disk.

## Proposals, ranked by frequency × cost

### P1 — Enforce `max_parallel_codex` in the dispatch wrapper; parallelize the attended path
Evidence: cap exceeded on 5 of 9 post-A2 build days (max 7); cap exists only as skill prose; the
machine-protection rationale (each dispatch runs a full local toolchain) is defeated. Conversely
attended sessions serialize to 1 (foreground-blocking dispatch is the only turn-surviving pattern
for subagent orchestrators; exit-71 refusals when per-task worktrees aren't pre-made).
**Change (amended per Sol BLOCKs 1, 3–5):**
(a) **Atomic capacity lease in the wrapper**, not a count-then-launch: the ledger reservation is
taken under the existing selection lock BEFORE pre-flight and held to terminal state, so the full
toolchain lifecycle occupies the slot and concurrent wrappers cannot race past the cap. At
capacity → distinct "at capacity" exit code the caller queues on. Cap semantics defined explicitly:
counts full-toolchain build rows only (read-only review/plan-check rows excluded); `ultra` counts
double (ADR-034); per-spec `max_parallel_codex` frontmatter override honored up to the global
machine ceiling; exit-72 refusals still create no row (ADR-040).
(b) **Attended waves use the already-documented host-native background path** (parallel-codex.md:
host runs concurrent `codex exec` subprocesses via harness-native `run_in_background`, one worktree
per task) — this survives turns for the HOST (unlike subagent backgrounding) and needs no new
workflow. The orchestrator keeps verify/close-out. NOT routed through `apex-build-wave` (that
workflow is Claude-fallback-only by design (the fallback coder is Sonnet 5 — A1/ADR-045; it was Opus when this note was written) — its workers implement directly and never dispatch
Codex; Sol BLOCK verified against apex-build-wave.js:18-21). A Codex-dispatching workflow variant
stays out of scope until the 8–10-min background-kill ceiling (issue 13) is root-caused —
foreground workflow workers at p90=27-min task durations would manufacture orphans.
(c) **ADR-029 carve-out preserved:** high-risk/auth/security/data specs stay sequential and
foreground with live supervision; the parallel path applies to routine specs only.
(d) apex-code + parallel-codex.md document all of the above; issue-13 root-cause investigation is a
named prerequisite task.

### P2 — Verify-signal integrity cluster (the false-green/false-red killers)
Evidence: issues 3, 4, 7, 9 — near-daily scope-check exit-65 noise on gitignored caches ("trains
people to ignore a real signal"); ruff check vs ruff format --check conflated as one "baseline"
(3× dispatch blackouts); stale AGENTS.md duration claim (600→3489 tests) → false "hung" diagnoses →
a coder force-killed the live production brain; ~1,440 phantom mypy errors in fresh venv-less
worktrees (3×).
**Change (amended per Sol FLAGs):** (a) scope-check: narrow ADR-044-style exclusions — exact
ignored-only derived-cache paths with root/status guards and fail-closed lockstep tests, NOT a
blanket cache-dir class (an ignored path can hide a hook; the by-design rationale stands);
(b) AGENTS.md verify contract: list each gate as a distinct runnable command INSIDE the existing
fenced block (fence-adjacency is load-bearing — ADR-040/exit-72), and DROP performance/duration
prose claims entirely (no auto-refresh mechanism exists that respects ADR-031/044 attended-only
state; omission is the safe structure); (c) worktree provisioning: each worktree gets its OWN venv
(shared immutable dependency caches only — a linked main-tree venv makes editable installs import
the wrong tree and races concurrent syncs); (d) already-shipped Stop-Process ban stays.

### P3 — Reachability criterion in specs (kill the "shipped but not wired" class)
Evidence: issues 10, 11 — four "tests prove the mechanism, not the reachability" incidents in two
days, six silent-DTO-drop incidents; each cost a follow-up dispatch or debug cycle.
**Change (amended per Sol FLAG):** reachability criterion at SPEC level (or per exposed boundary),
not per task — entry wiring spans tasks, and a shared integration-test file per task would create
file overlap that suppresses wave parallelism; apex-plan readiness gate adds the "reachability"
checkbox at that granularity. For typed client/server boundaries the enforced mechanism is the
ROUND-TRIP test (it detects the cited DTO-drop class); deny-unknown-fields is a per-repo choice,
not mandated (it can break additive protocol compatibility and misses pre-serialization drops).

### P4 — Spec-review convergence control
Evidence: issue 1 — 60+ adjudication rounds across 4 spec families in 4 days, quota exhaustion,
forced same-family review deviation; issue 6 — Sol BLOCKing at architecture level 8× on one spec
(and being right).
**Change (amended per Sol FLAGs):** (a) cap review rounds at 3 PER SPEC LIFETIME (counter does NOT
reset on a fresh draft — unbounded cycling otherwise), fresh drafter gets a CLOSED fix-list (the
proven session-79b resolution), and the completion-notification WRITE BARRIER becomes an explicit
gate precondition (a review must never launch against a mid-edit file — the known VOID-round
cause); (b) pre-draft Sol ARCHITECTURE pass: **left to the user** — it adds a second Sol dispatch
(quota) and needs an ADR-032 amendment defining its relationship to the post-readiness cold read
(which stays cold and stays mandatory either way); (c) batch verdict adjudication stays;
(d) plan-check effort drops max→xhigh (see P7);
(e) **spec reviews are digest-bound** (mirrors the build side's tree digests): the dispatch records
the spec file's hash at review time; adjudication auto-VOIDs the verdict on hash mismatch — phantom
findings about superseded text die mechanically instead of procedurally.

### P5 — Ledger + worktree lifecycle hygiene
Evidence: 29 orphan running/adopting rows; issue 8 (wedge retries self-amplified to 6 orphan rows,
session forced onto fallback); 20+ stale worktrees; issue 2 (live app's lock file breaks the
tree-pin hash → dispatch structurally blocked while the app runs, 3 days).
**Change (amended per Sol BLOCKs 5–6 + FLAG):** (a) **adopt-first, never auto-close**: dead
running/adopting rows are NOT reaped to terminal (that destroys the adoption path and its missed
gates — scope/critical/digest/pin/encoding); instead a dead row transitions to a recoverable
`orphaned` state that the adopt flow still selects, and pre-flight surfaces it with the adopt
command; (b) wedge detection: never redispatch onto a worktree_key with an unresolved row — adopt
or explicitly orphan first, refuse to amplify; (c) worktree teardown is OWNED BY THE CREATOR in a
verified close-out step (wrapper/workflow finally-path), with an explicit unresolved-cleanup
obligation recorded when the destructive guard defers it to the user — the existing prose checklist
already failed (20+ stale trees); (d) runtime-exclusion lists gain the EXACT `tasks/` entry only —
the `*.lock` wildcard is DROPPED: tree-pin.ps1:128-153 already degrades app-held locked files to a
metadata fingerprint (verified; added after the 07-27 incident), and a wildcard would hide real
lock-file changes from the pin.

### P6 — Smaller fixes (amended per Sol FLAGs)
- Log confusion (issue 17): consumers resolve the AUTHORITATIVE log via the ledger row's `log_path`
  field instead of reconstructing paths; stale docs/progress log reference in parallel-codex.md
  updated. (Naming one path doesn't remove twin writers; resolution does.)
- `apex-family-gate` no-spawn case routes to the EXISTING ADR-042 fallback (digest-bound attended
  human-review row; AFK parks) — no new gate relaxation.
- 529-overload backoff/retry guidance for Claude-side dispatches (issue 19).
- PS 5.1 byte-exactness: byte-safe helper functions / wrapper-owned file channels at the actual
  call sites (mechanism beats instruction) — not an AGENTS.md rule aimed at coders who are
  forbidden to commit anyway (issue 12).
- Files-to-Change authoring: spec author greps the live tree for consumers/paths before listing
  (issue 14, ≥5 incidents) — readiness-gate line item.
- Gitignored-runtime reachability (issue 15): specs declare a prerequisite/path contract;
  pre-flight runs deterministic `git ls-files` / `check-ignore` against DECLARED paths (a check
  cannot discover an undeclared invisible dependency — declaration first).
- Atlas 72% blocked: STRATIFY the blocked rows (exit code, blocker text, gate) before choosing a
  fix — outlier established, cause not yet (my AGENTS.md hypothesis is exactly that, a hypothesis).
- `attended` telemetry: DEFINE it — new caller-reported wrapper parameter + ledger field (the
  wrapper has no such parameter today, so all-false rows are absence-of-telemetry, not a bug);
  distinct from the provenance-bearing human-review gate.
- NEW (Sol, issue 5 had no proposal): spec-validator changes get versioning + a migration sweep of
  live drafts + a corpus test over the backlog — this plan itself changes template/readiness
  contracts and must not reproduce the whole-backlog exit-72 refusal.

### P7 — Duration fixes (added post-review from the duration segmentation)
Evidence: Artemis review-phase median 18.7 min/p90 45.2; ten of twelve longest runs are plan-check
rounds at 54–63 min (effort max); build median 10 min driven by a 3,489-test/9:51 full suite paid
on EVERY verify iteration; 60–71-min build outliers correlate with `adopted-blocked` (kill-ceiling
overruns + adoption overhead).
**Change:** (a) plan-check/review effort max→**xhigh** — doubly supported: sol-plan-check.md
pre-authorizes the drop when gate spend crowds build quota (met), AND OpenAI's own reasoning guide
names xhigh's use case as "security and code review" (primary source, post-GA;
`docs/research/sol-effort-levels-2026-07-29` rows). Coding default: **medium** (provisional) for routine
specs — both strong sources point there (OpenAI: medium IS the agentic-coding default; Sonar:
medium achieves the highest functional success rate), and the existing verify-fail escalation
ladder (medium→high→xhigh→max→ultra) is the safety net that makes a lower default cheap to be
wrong about: an under-thought task gets auto-bumped on its failed verify, while a high default
overpays on every task medium would have handled. Per-spec rubric still overrides upward for
known-hard tasks. Caveats recorded: benchmarks measure single-attempt success while APEX pays
retry costs on failure; sources conflict on the review-vs-build asymmetry; no review-specific
benchmark exists; METR flagged Sol gaming coding evals — so:
(a2) **the wrapper records `effort` on every ledger row** (new field — today it isn't recorded, so
no local correlation is possible), and (a3) a 10-spec effort bakeoff on real routine specs
(**medium vs high**, scored on verified-completions-per-hour INCLUDING retry/escalation cost)
confirms or reverts the provisional default with OUR data within a few weeks of normal volume.
(b) two-tier verify in AGENTS.md fenced contract: impacted-subset gate per task, full suite once
at wave end + pre-commit; (c) issue-13 kill-ceiling root-cause is a named prerequisite (also gates
P1(b)'s future workflow variant).

## Non-proposals (looked at, rejected)
- Raising/removing the cap: 5–7 concurrent full toolchains on one box correlates with the sandbox
  flake period; enforce 2 first, re-measure, then revisit.
- Blanket scope-check cache exclusions and `*.lock` pin exclusions: both weaken gates whose
  behavior is by-design or already fixed (see P2a, P5d).

## Follow-up analyses Sol showed are missing (queued, not yet run)
- Stratify the 281 `done_with_concerns`, 159 `critical_violation`, and 186 retried task keys by
  phase/repo/true-vs-false signal — the ranked list above covers the *named* friction, and these
  cohorts are large enough to hide a bigger lever.

## Appendix C — Sol finding resolutions (21)
BLOCK P1a race/lease → accepted, P1 rewritten (atomic lease, reservation before pre-flight).
FLAG P1a semantics → accepted (cap-counting rules defined). BLOCK P1b workflow misuse → accepted,
verified vs apex-build-wave.js (Claude-fallback-only — Sonnet 5 per A1/ADR-045); host-native background path instead. BLOCK
P1b kill ceiling → accepted (workflow variant deferred behind issue-13 root-cause). BLOCK P1b
supervision → accepted (ADR-029 carve-out restored). FLAG P2a exclusions → accepted (ADR-044
narrow guards). FLAG P2b AGENTS.md → accepted (fence mechanics, drop perf claims). FLAG P2c venv →
accepted (per-worktree venv). FLAG P3 granularity/DTO → accepted (spec-level; round-trip is the
mechanism). FLAG P4a convergence → accepted (write barrier + lifetime counter + closed fix-list).
FLAG P4b pre-draft pass → USER DECIDES (needs ADR-032 amendment). BLOCK P5ab reap-vs-adopt →
accepted (recoverable orphan state, adopt-first). FLAG P5c teardown → accepted (creator-owned
close-out). BLOCK P5d lock wildcard → accepted, verified vs tree-pin.ps1:128-153 (dropped; exact
tasks/ kept). FLAG P6 log/attended → accepted (log_path resolution; attended = new defined
telemetry). FLAG P6 family-gate → accepted (route to ADR-042 fallback). FLAG P6 PS bytes →
accepted (helpers at call sites). FLAG P6 gitignored → accepted (declared-prerequisite contract).
FLAG P6 Atlas → accepted (stratify first). FLAG issue-5 omission → accepted (validator
versioning+migration added). FLAG unexamined cohorts → accepted (queued analyses section).

## Appendix A — 19-issue evidence table
(as mined; ISSUE | EVIDENCE | FREQ | COST | ROOT CAUSE)

1. Spec-review gauntlet 60+ rounds/4 days — git log r1→r20 build-triage etc.; quota exhausted · repeated · days lost · no convergence rule
2. Live app lock file blocks dispatch — learnings.md #22 hash-object exit 128 · 3 days · full-day blocks · pin reads app-held lock
3. Stale AGENTS.md duration claim → coder killed live brain — 07-27-night handoff · repeated + 1 severe · production outage · doc rot
4. Scope-check exit-65 noise on gitignored caches — "usually NOISE... every Python build" · near-daily · per-dispatch adjudication · by-design counting
5. Validator drift exit-72 — whole backlog refused once; bold `Task N` mismatch · repeated · backlog restructure · contract drift without migration
6. Sol architecture-level BLOCKs — 8× routing spec, "right every time" · repeated · full re-spec · plan-level gaps reach spec stage
7. Fresh worktree phantom mypy (~1,440 errors) — 3× · misread builds · no venv provisioning
8. Ledger wedge self-amplified to 6 orphans — session 8 · once, session-blocking · fallback w/o cross-family review · retry re-dispatches onto stale row
9. ruff check vs format --check conflated — 3 commits · morning blackouts · two gates reported as one
10. Tests prove mechanism not reachability — 4×/2 days · follow-up dispatches · direct-construction tests
11. gateway.rs silent DTO drop — 6× · debug cycles · no deny_unknown_fields/round-trip
12. PS 5.1 quoting corruption — 2+ mechanisms · redone commits/patches · byte-exactness vs PS semantics
13. Background kills at 8–10 min, second ceiling unconfirmed — repeated post-fix · lost runs · watchdog + unknown ceiling
14. Files-to-Change under-listing — ≥5× · blocks/rework · no consumer grep at authoring
15. Gitignored capabilities/library invisible to worktrees — once, structural · mirror-repo workaround · disk≠tree conflation
16. Cross-session machine collisions — 2 incidents · ~2h misdiagnosis; refused dispatch · no cross-session isolation
17. Two log files, truncated twin mistaken as authoritative — repeated · 2 misdirected investigations · dual logging paths
18. family-gate exit-12 with no spawn capability — once · 3 builds unarchived · capability assumption
19. 529 Overloaded killed 4 recon attempts — once · 3 investigations undone · provider-side

## Appendix B — ledger stats (window 07-15→07-29)
1,107 dispatches (Artemis 522, APEX-self 426, Atlas 123). Status: done 420 · blocked 337 ·
done_with_concerns 281 · failed 23 · orphaned running/adopting 29 all-time. scopeViolation 291 ·
critical_violation 159 · tree_moved 21. Durations (805 closed rows): median 6.5 min, p90 27.2,
p99 56.1, max 63. Claude-side fallback builds in-window: 38 rows. Retries: 186/759 task keys
dispatched >1×; worst real tasks 5–8 dispatches. Daily max concurrency (real specs): 2,2,5,7,3 |
3,5,5,1,1 | 4,3,2 (07-15→07-29, no builds 07-20/21). `attended` flag: false on all rows.
