# Codex run-ledger stratification — 2026-07-30

Source: `C:\Users\User\AppData\Local\apex\progress\codex-run-ledger.jsonl` (1,521 rows, 1,491 distinct run_ids, window 2026-07-12 → 2026-07-30). Read-only analysis; all row text treated as untrusted data.

## 0. Corpus hygiene (affects every cohort's headline number)

- **30 run_ids have duplicate rows** (same run written twice, second copy often with empty `unresolved`/`worktree`). All per-cohort numbers below are deduped to one row per run_id unless noted.
- **Harness self-test rows** pollute the ledger: specs `verdict` (104), `cap-test` (33), `a`/`a-b`/`f5`/`f10` (23 each, worktrees under `Temp\apex-review-findings`), `v` (18), `clean` (13), `dispatcher-test*`. These are APEX testing itself, not production builds. Excluded from "real" numbers.
- Status distribution (raw): done 664, blocked 425, done_with_concerns 317, failed 39, running 28, scope-violation 13, adopted-blocked(+scope1) 13, abandoned-dead 7, stalled 7, aborted 4, killed 3, adopting 1.
- Repo mix (raw rows): temp worktrees under AppData 429, artemis 295+~120 in `artemis-*` clones, Atlas 123, .claude 103+7, apex 44.

---

## A1. done_with_concerns (317 raw; 25 self-test; **292 real**, 272 build / 20 review)

Concern-level clustering of `unresolved[]` strings (first-match precedence; a row can contribute several concerns):

| # | Cluster | Count | Real defect or noise? |
|---|---------|------:|----------------------|
| 1 | **Host must rerun full test suite** — the 4 `tests/test_launcher.py` tmp-path failures ("temporary workshop root must be outside the repository" vs sandbox forcing TEMP inside the repo), or generic "rerun full pytest/ruff outside the sandbox" | **117** | **Noise per item, real systemic gap.** Not code defects — but every one of these builds ships *unverified at the full-suite gate* until the host reruns. The same 4 launcher tests appear dozens of times. |
| 2 | **Scratch/cleanup policy-blocked** — `.codex-scratch`, `.scratch`, `.apex-tmp`, `.sandbox-cache` etc. remain because sandbox denies recursive deletion | **94** | **Pure noise.** Gitignored verification caches. Also the root cause of most critical_violation false positives (see A2). |
| 3 | **Vitest / npm client tests cannot start in sandbox** (`node_modules` absent, Vite config load blocked, `npm test` needs host) | **33** | Noise per item (known deterministic sandbox block — see memory `codex-sandbox-flake-client-builds`), but = client code shipped with **zero test evidence** until host verify. |
| 4 | **"Coder reported done_with_concerns but named no unresolved items. Treat this build as unverified."** | **30** | **Real protocol defect** — coder-report honesty gap; the wrapper correctly downgrades to unverified, but 30 builds landed in this state. |
| 5 | Blank `unresolved` (empty duplicate ledger rows) | 22 | Ledger-write noise (the dup-row bug above). |
| 6 | Review verdict 'FLAG' — N findings to adjudicate (phase=review) | 19 | **Real** — genuine adjudication queue items (plan-check r2–r7 rounds, post-build reviews, Atlas FLAG gates). |
| 7 | **Scope-lock conflicts** — out-of-scope test files must change, gitignored new file needs host force-add (`.claude` repo blanket ignore), authorization gaps | 13 | **Real** — spec Files-to-change gaps (matches memory `spec-files-to-change-include-tests`). |
| 8 | WSL2 / Artemis harness unavailable in sandbox (keyring, isolate, installer 3-PASS) | 9 | Environmental; real only in that install verification is deferred. |
| 9 | Pre-existing dirty files from other lanes left untouched | 6 | Noise (shared-worktree hygiene note). |
| 10 | Windows PowerShell execution policy blocks literal command | 2 | Environmental. |
| 11 | Other (locked exe, mypy needs host env, out-of-scope formatting, misc.) | 20 | Mixed; mostly environment/host-dependency. |

Representative row (cluster 1+2, the modal shape):
> `[2026-07-24] spec=durability-1-snapshot-restore-core task=task-5` — "The host must arbitrate the four known launcher tests requiring out-of-repository tmp_path access. || Workspace-local .codex-scratch cleanup was blocked by sandbox policy."

Verdict: **~85% of done_with_concerns volume is two environmental signatures** (sandbox TEMP-in-repo pytest arbitration + scratch cleanup), not defects. The real-signal minority is clusters 4, 6, 7 (~62 concerns).

---

## A2. critical_violation (263 rows carry the field; **168 true**; all phase=build; 107 artemis, 61 temp worktrees)

Which gate fired: **the post-exec scope guard in every case** — `scopeViolation=true` on all 168; `scope_exit=1` on 165, `scope_exit=66` on 3. Zero `tree_moved`, zero `digest_mismatch`, one `encoding_violation`.

| Cluster | Count | Verdict |
|---------|------:|---------|
| **Gitignored-scratch false positive** — terminal status `done`/`done_with_concerns`; scope guard flagged untracked verification caches (`.codex-scratch`, `.apex-tmp`, `.sandbox-cache`, tmp pytest dirs) or the sandbox-TEMP pytest signature; build itself fine | **147 (87.5%)** | **Noise.** 143/147 texts explicitly mention scratch/sandbox/pytest arbitration. This is the known gitignored-cache FP class, and it is the overwhelming majority. |
| **Genuine scope conflict** — terminal `blocked`/`adopted-blocked+scope1`, blocker names out-of-scope files that *must* change for the spec's own acceptance criteria | **13** | **Real.** Spec-authoring defects. Examples below. |
| Blocked, but blocker is the sandbox full-suite env problem (not scope) | ~7 | Env noise escalated to blocked. |
| failed (1), encoding_violation (1) | 2 | Singleton infrastructure events. |

Representative genuine rows:
> `spine-hardening-1|task-b` (blocked): "contract requires schedule_ledger.close() during teardown, while seven existing tests outside Task B's writable scope access that ledger after TestClient exits… editing those tests violates the scope lock."
> `tasks-module-core|task-2` (blocked): "spec requires extending CURATE_VERBS, while an existing whole-tree test asserts the old tuple exactly. That test file is explicitly outside the authorized T2 scope."
> `project-stall-watchdog|task-1`/`task-1-fix` (blocked twice): full-suite criterion requires editing out-of-scope `tests/capabilities/test_watcher_runner.py` / stale `tests/test_app.py`.

Verdict: **~12/13 genuine hits are the same defect type** — acceptance criterion "full suite green" collides with test files omitted from the authorized file set. The 87.5% FP rate means `critical_violation` as currently computed is nearly uninformative without the terminal-status filter.

---

## A3. Retry chains

Raw same-`spec|task` key multi-dispatch: 218 keys — but this **conflates** (a) review-phase rows sharing the build's task key, (b) duplicate ledger writes, (c) self-test loops (`cap-test|t3` n=31, `a|b-c` n=23…). After excluding self-tests, deduping run_ids, and restricting to **phase=build**: 588 real build dispatches, **67 truly retried keys** (48×2, 11×3, 6×4, 2×5). Terminal outcomes: **50 done, 13 done_with_concerns, 2 blocked, 1 running, 1 abandoned-dead** — churn almost always converges.

Cause of each non-terminal dispatch in those chains (95 non-terminal rows):

| Cause | Count |
|-------|------:|
| done_with_concerns → re-dispatched (host-verify pending, "fix"/"re-verify" runs) | **39** |
| done → re-dispatched anyway (adjudication fixes, adoption re-runs) | 18 |
| **failed: "tree moved under the pre-flight pin"** | **17** |
| launch/stall/killed/abandoned-dead/aborted (incl. Sonnet early-return era) | 12 |
| genuine scope-conflict blocked | 6 |
| blocked-other / sandbox-verify / failed-other | 4 |

Worst real chains (build-only, n≥4): `lifestyle-module|wave1` (5: spec-file-absent block → dwc → done ×2 cycles), `morning-briefing|wave1` (5), `newsletter-digest|task3`, `lifestyle-module|wave2/4`, `review-node|task1/wave2` (all 4–5, all 2026-07-23, all the dwc→done→dwc→done alternation), `reads-1a-calendar-ask|task1` (3 consecutive `aborted` then done), `tasks-module-core|task-5/6/7` (2× tree-moved-pin each, then dwc, then done), `curate-duplicate-mentions|w1` (tree-moved then done). The tree-moved-pin failures cluster on 07-22/07-23 shared-worktree wave days (17 of 17 within 07-22→07-29).

Dominant churn cause: **the sandbox-verification gap** (dwc + done re-dispatch = 57/95 = 60%), with **tree-moved-under-pin** second (18%), stalls/aborts third (13%), genuine scope conflicts a small tail (6%). Quota appears **zero** times in blocker/error text.

---

## B. Atlas blocked rows (88 of 123 = 72%)

Stratification is degenerate — one spec, one phase, one gate, one blocker template:

| Dimension | Value |
|-----------|-------|
| Spec | `constitution-review` — **123/123 Atlas rows** |
| Phase | review — **123/123** (zero build dispatches into Atlas, ever) |
| Exit code | `scope_exit=0` on all 88 blocked rows; sandbox `read-only`; schema `codex-review-schema.json` |
| Blocker text | **All 88**: "Review verdict 'BLOCK' — N finding(s), at least one BLOCK. Read them; do not commit." N: min 1, max 29, mean 8.06, total 709 findings |
| Gate | The review-verdict gate (reviewer returned BLOCK), not any pre-flight/contract gate |
| Dates | 2026-07-22 14:57 → 2026-07-24 09:35 (a single ~2-day document-review campaign) |

Ranked "blocker causes": there is exactly **one** cause class — iterative draft-review BLOCK verdicts on constitution chapters. Per-chapter sequences all converge to done (`B…B→D`): ch4 (1 round), ch6–ch9 (3 each), ch14 (9), ch20 (12 incl. killed/adopted re-runs), ch22 (8). Non-blocked remainder: 20 done (final gates), 5 done_with_concerns (FLAG), 5 adopted-blocked (adoption of killed runs, e.g. R61/R61b "re-dispatch of killed R61 run"), 4 running, 1 adopting.

**AGENTS.md-contract hypothesis: REFUTED.** Zero Atlas rows mention AGENTS.md; zero exit-72/UNPARSEABLE anywhere in the ledger; no pre-flight refusals — every blocked row is a *completed* review that returned BLOCK, which is the loop working as designed on a prose document. The 72% figure is a **denominator artifact**: counting each review round of an intentionally iterative draft→review→redraft loop as a "dispatch" makes convergence look like failure. The real observation is loop *cost*: ~5.5 rounds/chapter, 88 blocked rounds and 709 findings to land ~17 chapters, with finding counts decaying slowly (e.g. ch22 stuck at 10-10-10-10 across four rounds before decaying — suggests findings weren't fully fed back between rounds there).

---

## Cross-cutting: the single biggest lever

One environmental signature — **the sandbox forces TEMP inside the repo, which the 4 `tests/test_launcher.py` cases reject, plus Vitest unable to start** — accounts for: ~150 of 373 dwc concerns (clusters 1+3), the escalation of ~7 cv rows to blocked, and 57 of 95 retry-churn dispatches (dwc/done re-runs whose only purpose was closing the verify gap). Fix candidates: sandbox-profile a writable out-of-repo TEMP for pytest, or an env-guard skip marker on those 4 launcher tests inside the sandbox, plus the already-doctrinal host-native vitest step. Secondary levers: (a) forbid `done_with_concerns` with an empty unresolved list at the completion-schema level (30 unverified builds), (b) filter `critical_violation` by terminal status before surfacing (87.5% FP), (c) dedupe ledger writes (30 dup run_ids, 22 blank rows).
