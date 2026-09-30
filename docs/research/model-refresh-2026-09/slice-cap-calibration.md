# Slice-cap calibration from Artemis history

_Date: 2026-09-30. Read-only analysis for `docs/drafts/role-redesign.md` item 36, which covers items 13–19 and the
planning-gate rule "at most ~5–7 slices, otherwise split first". This builds on
`artemis-rework-evidence.md` (same folder) and does not repeat its root-cause work._

## 1. Answer

- **Plan cap: keep it soft and make it a single number. The tripwire is 7+ slices: "a plan with more than 6 slices
  is split first".** Confidence: **low to medium.** Artemis never had plan-level slices as such. The closest
  thing, spec families written from one design, shows no failure that can be traced to how many members a family
  had. Families of 6–7 specs were built cleanly in about a day. The one large programme (18 specs) was organised
  by its planner as 4 slices, and the largest slice was cut into 6 parts. So 6 is the largest size seen that
  worked without strain. It is not a measured failure point.
- **The stronger finding is about how big one slice is, not how many slices there are.** Across 322 built specs,
  Artemis task count is a **weak** predictor of trouble (AUC 0.55). Trouble stays flat at about 19–21% from 1 to 6
  tasks and first steps up at **7 tasks** (31% vs 19%, relative risk 1.62). **Files touched is the best predictor
  available** (AUC 0.66), with spec length close behind (0.64). Trouble reaches 27% at 16–25 files and **42% at 26
  or more**, against about 15% below 11 files. Specs that stalled and were never built are larger by files and
  length, not by task count.
- **Recommended units:**
  - count **slices** for the plan cap (6);
  - give each slice a **predicted-files** figure in the slices table, with a secondary soft tripwire: a slice
    predicted to touch **more than ~15 files**, or needing **more than 6 build tasks**, is split before its spec is
    written.
  - The item-8 `git diff --stat` comparison is how both thresholds get recalibrated on the new process.
- **What a cap will not fix:** the three worst Artemis specs (43, 36 and 28 review rounds) had 3–7 tasks and 4–19
  files. They were average-sized. Their loops came from unsettled design at high risk with no stop rule. Item 15's
  3-round cap and item 13's pass-or-park address that. A slice cap does not.

## 2. How Artemis units were mapped to "slices"

Artemis ran the old process: one spec per change, a `## Tasks` list inside it, and waves of Codex task dispatches.
It had no plan artefact with slices, apart from three early families that carried a `slice:` frontmatter field
(`v2-*`, `cb-*` "capability-build", `cr-*` "client-revival").

| New-process concept | Nearest Artemis unit | Used for |
|---|---|---|
| Plan (Big change) | A **spec family** written from one design (`cb-1..5a`, `cap-deps-1a..3d`, `durability-1..4`, `host-verbs-*`) | Calibrating the plan's slice count (section 5) |
| Slice (item 18: one just-in-time spec, built, then the next) | One **Artemis spec** | Calibrating slice size (sections 3–4) |
| Build tasks inside a slice | Artemis `Task N` entries, and ledger task keys | The size measure "tasks" |

The mapping works because item 18 makes each Big slice its own spec, built before the next one is written. That is
the Artemis spec-and-build unit. The tempting alternative, treating Artemis tasks as slices, is wrong: tasks share
one spec, one review loop and one set of anchors, so they do not carry the per-slice spec review and fresh anchors
that the new design gives a slice.

## 3. Method and data

- **Specs:** every file with a task list in `artemis/docs/changes/done/` (685), `docs/changes/` (10 ready),
  `docs/drafts/` and `docs/changes/archived/`. Measured for each: spec lines; spec task count (distinct `Task N` /
  `T-N` ids in headings or checklist items); rows in `## Files to Change`.
- **Review sidecars:** the 43 `*.review.log` files. Rounds are the rows of the `| Round |` table, or `## Round N`
  sections in the later author-sidecar format. Where `artemis-rework-evidence.md` §3 gives a better count, that
  count is used instead.
- **Run ledger:** `%LOCALAPPDATA%\apex\progress\codex-run-ledger.jsonl`, collapsed by `run_id`, joined on `spec`.
  This covers dispatches from 2026-07-12 onwards.
  - Build task keys are normalised to a base id (`task3r2` becomes `3`), so repair suffixes count as rework.
  - `review`-phase rows are split in two. **Plan reads** are tasks named `plan-check*`, `arch-check`, `spec-*` or
    `rN` (Sol cold reads and arch reads). **Per-task code reviews** are the rest.
  - The union of the `authorized` file lists gives the ledger's files-touched figure.
- **Sample:** 322 built specs with both a task count and build rows, plus 17 drafts with task lists that were never
  built, or never finished (survivorship check, §4.4).
- **Size measures:**
  - **T** is the larger of the spec task count and the distinct ledger base task keys (the second catches tasks
    added during the build);
  - **F** is the larger of the Files-to-Change rows and the ledger authorized union;
  - **L** is spec lines.
- **"Trouble"** is a binary outcome. A spec counts as trouble if any of these holds:
  - 5 or more plan reads;
  - extra build dispatches ≥ 0.5 per task;
  - 5 or more logged review rounds.
- **Continuous outcomes:**
  - extra build dispatches, which is dispatches minus distinct base tasks;
  - non-`done` build dispatches;
  - plan reads;
  - code reviews per task.

## 4. Findings

### 4.1 By task count (n = 322 built specs)

| Tasks | n | Trouble % | Extra dispatches per task | Mean plan reads (specs that had any) | Specs with ≥5 reads (of specs that had any) |
|---|---|---|---|---|---|
| 1–2 | 91 | 21 | 0.18 | 3.7 | 19% |
| 3–4 | 121 | 17 | 0.26 | 3.9 | 14% |
| 5 | 34 | 21 | 0.25 | 4.5 | 25% |
| 6 | 21 | 19 | 0.27 | 2.3 | 0% |
| **7** | 20 | **30** | 0.24 | **8.6** | 25% |
| 8–9 | 16 | 25 | **0.37** | 5.8 | 20% |
| **10+** | 19 | **37** | **0.38** | **11.9** | **57%** |

Threshold scan, trouble rate at or above the cut vs below it:

| Cut | Trouble at or above % | Trouble below % | Relative risk |
|---|---|---|---|
| ≥5 | 25 | 19 | 1.35 |
| ≥6 | 28 | 19 | 1.45 |
| ≥7 | 31 | 19 | 1.62 |
| ≥10 | 37 | 20 | 1.83 |
| ≥11 | 43 | 20 | 2.13 |

- **The step is at 7.** Up to 6 tasks the trouble rate is flat, and extra dispatches per task stay at about
  0.25 (a spec with more tasks is more likely to have *some* retry, simply because it has more tasks).
- From 8 tasks upwards, the rework rate per task rises by about half, to 0.37–0.38.
- Specs with 7 or more tasks are 17% of specs, but they account for **44% of all extra build dispatches and 52%
  of all plan reads**.

### 4.2 By files touched and by spec length

| Files | n | Trouble % | Extra dispatches per task |
|---|---|---|---|
| 0–3 | 80 | 12 | 0.13 |
| 4–6 | 77 | 17 | 0.13 |
| 7–10 | 43 | 23 | 0.25 |
| 11–15 | 41 | 17 | 0.23 |
| 16–25 | 41 | 27 | 0.39 |
| 26+ | 40 | **42** | **0.51** |

| Cut | Trouble at or above vs below | Relative risk |
|---|---|---|
| Files ≥8 | 29% vs 14% | 2.03 |
| Files ≥20 | 41% vs 17% | 2.43 |
| Files ≥30 | 56% vs 18% | 3.08 |
| Lines ≥500 | 31% vs 14% | 2.24 |
| Lines ≥700 | 34% vs 16% | 2.16 |

**Predictive power for trouble (AUC):** tasks 0.546, files 0.661, files per task 0.655, lines 0.641.

**Spearman rank correlations** with the continuous outcomes:

| Measure | Extra dispatches | Non-`done` dispatches | Plan reads | Code reviews per task |
|---|---|---|---|---|
| Tasks | 0.32 | 0.55 | 0.13 | −0.16 |
| Files (Files-to-Change rows) | 0.39 | 0.52 | 0.14 | 0.29 |
| Files (ledger authorized union) | 0.41 | 0.61 | 0.25 | 0.21 |
| Lines | 0.17 | −0.03 | 0.16 | 0.41 |

- **Files is the best single predictor** of build rework.
- **Lines best predicts code reviews per task.** Longer specs drew more review cycles per task.

### 4.3 Task count × files (trouble %, with n)

| Tasks | 0–6 files | 7–15 files | 16+ files |
|---|---|---|---|
| 1–2 | 14% (66) | 43% (14) | 36% (11) |
| 3–4 | 16% (64) | 14% (36) | 29% (21) |
| 5 | 18% (11) | 15% (13) | 30% (10) |
| 6 | 0% (5) | 22% (9) | 29% (7) |
| 7 | 40% (5) | 0% (5) | 40% (10) |
| 8–9 | 0% (4) | 50% (2) | 30% (10) |
| 10+ | 0% (2) | 20% (5) | 50% (12) |

- The 16+ files column is at or near 30% at every task count, and reaches 50% at 10+ tasks.
- A narrow spec with many tasks is not reliably worse.
- **The breadth of the change drives trouble more than how finely it is cut into tasks.** This is why the
  recommendation pairs the slice count with a per-slice files figure.

### 4.4 Survivorship: the specs that never got built

These are the 17 drafts with task lists that never built or never finished. They include
`host-verbs-windows`, which parked after 10 rounds and was split, and `curate-batch-arity` and
`local-answer-or-decline`, both BLOCK at their round cap.

| Measure | Stalled drafts | Built specs |
|---|---|---|
| Median tasks | 5 | 4 |
| 20 or more files | 9 of 17 | 59 of 322 (18%) |
| 7 or more tasks | 4 of 17 | 17% |
| Median lines | about 1,140 | about 430 |

Excluding these drafts understates the effect of size. What mainly separates them from built specs is **breadth
(files) and spec length**, not task count.

### 4.5 Growth during the build

In 32 of 322 built specs, the ledger records at least 2 more task keys than the spec listed. The clearest case is
`calendar-create-comprehension`: 4 planned tasks became 10, over about 10 hours, and the branch was deleted.
Measuring size only at planning time misses this. That is why the item-8 `git diff --stat` comparison of actual
against predicted size should also feed the slice-size calibration.

### 4.6 The long loops were not driven by size

| Spec | Tasks | Files | Lines | Rounds | Driver (from `artemis-rework-evidence.md`) |
|---|---|---|---|---|---|
| always-local-read-path | 6 (12 ledger keys) | 19 | 1,191 | 43 | consent design at risk:high, host-pinned folds, no stop rule |
| host-verbs-catalog-launch | 4 (7) | 6 | 713 | 36 | Win32 precision, "read until clear" ruling |
| host-verbs-windows-files | 3 (7) | 4 | 790 | 28 | Win32 precision, fold artefacts |
| host-verbs-windows (parent) | 6 | 10 | 1,616 | 10, then split | "new Win32-precision holes on a 1,400-line surface" |
| relative-offset-dates | 2 | 8 | 4,917 | 17 reads | close-out harness carried inside the spec |
| retype-with-time-drops-rescue-note | 1 (3) | 4 | 2,946 | 20 reads | a single defect class re-found 4 times |

- Every one of these specs is under the 7-task step, and most are under 10 files.
- Their shared signs are **high risk, an unsettled contract or design, and spec length** (4 of 6 are over 1,100
  lines). They do not share a high slice or task count.
- Splitting `host-verbs-windows` did not rescue it: its two children still took 36 and 28 rounds. **Splitting a
  spec whose design is unsettled makes more loops, not shorter ones.** This supports item 13's "decision → owner"
  class, and the item-15 cap, over any size rule.

### 4.7 Process era

Split at 2026-09-18, when fork review, execute-everything authoring and the census landed:

| Era | n | Trouble at 1–2 tasks | 3–4 tasks | 5 tasks | 6+ tasks |
|---|---|---|---|---|---|
| Before 2026-09-18 | 255 | 24% (70) | 19% (86) | 24% (29) | 30% (70) |
| From 2026-09-18 | 67 | 10% (21) | 14% (35) | 0% (5) | 0% (6) |

(Remaining trouble after 09-18 is mostly build re-dispatch from harness and host artefacts, per
`artemis-rework-evidence.md` §5.) After 09-18 very few specs had more than 5 tasks (6 of 67). So the new process cannot yet say where its own step
is. On the old process, the step was at 7 tasks and at about 15–20 files.

## 5. Plan-level evidence: spec families

| Family (one design) | Members | Outcome |
|---|---|---|
| `cb-*` capability-build (`slice:` field) | 5 specs + 1 fix spec (`cb-4.1`) | All built and proven live in about a day (handoff 2026-07-01); `cb-4.1` was a UX-honesty fix, not structural rework |
| `cr-*` client-revival (`slice:` field) | 6 | All 6 specs added 2026-06-30, before the ledger; no rework data, and no split or park on record |
| `cap-deps-1a..3d` | 7 | Built 2026-07-24: 24 dispatches, **0 extra** |
| `durability-1..4` (+2 related) | 6 | 4 built with 1 extra dispatch in 27; 2 shelved 2026-09-08 for scope, not failure |
| `v2-*` programme | 18 specs | Organised by its planner as **4 slices**. The largest slice (memory) was cut into **6 parts**. Specs added 06-30 → 07-09, before the ledger |
| `host-verbs-*` | parent + 3 split children | Parent parked after 10 rounds and split. Children took 36 / 28 rounds, and one stayed a draft (`host-loop-tools-and-confirm`, parked). The split made more loops, not fewer (§4.6) |

- **Reading:** no Artemis family failed *because* it had too many members.
- The largest families that went cleanly had **6–7 members**.
- When a programme grew larger, the planner naturally regrouped it into about 4 slices of 6 or fewer.
- The evidence is thin:
  - these families mostly **pre-date the ledger**, so their rework is not measured;
  - family membership had to be inferred from naming, and some families (`agent-loop-*`, 17 specs) were built
    over weeks rather than planned as one unit.
- That is why the plan cap carries low-to-medium confidence while the slice-size finding carries medium.

## 6. Recommendation for items 13–19

1. **Plan cap:** "at most **6** slices; 7 or more means split the plan first". This keeps the soft tripwire,
   picks the one number that fits both the family evidence (6–7 worked) and the within-spec step (trouble jumps
   at 7), and removes the ambiguity of a range.
2. **Per-slice size in the slices table (item 14):** for each slice, show predicted files touched alongside size and
   risk. **A soft slice tripwire: more than ~15 files, or more than 6 build tasks, means split the slice** before
   its just-in-time spec is written (item 18). Files is the primary unit, because it is the best predictor
   measured (AUC 0.66 vs 0.55 for tasks). Tasks are a secondary check.
3. **No length cap on the plan.** The design already says the tripwire is not a line cap, and that holds. Length
   predicted trouble in Artemis specs because it carried implementation precision, which the new plan leaves out.
   A *spec* length signal (over ~700 lines, trouble 34% vs 16%) belongs to the Critic's round budget, not the
   plan.
4. **Do not treat splitting as the fix for a looping slice whose design is unsettled.** Route it through item 13's
   decision class to the owner instead (§4.6).
5. **Recalibrate on real data:** log each Big plan's slice count, and each slice's predicted vs actual files
   (item 8's diff-stat guard), Critic rounds and build re-dispatches. Revisit the 6-slice and 15-file thresholds
   after about 10 Big plans.

## 7. Caveats

- **Process mismatch.** Artemis had no plan-level slices, so plan-cap evidence comes from inferred families,
  mostly before the ledger existed. The mapping is argued in §2, not proven.
- **Confounding.** Before 09-18, both risk tier and review regime changed over time (see `artemis-rework-evidence.md`
  §2). Bigger specs clustered in the loop-heavy months. The era split (§4.7) shows the new regime removed most
  trouble at the sizes it built, but it built few large specs.
- **Measurement.**
  - Task counts come from regex over mixed spec formats.
  - Ledger task keys include odd labels, so T is taken as the larger of the two counts.
  - Review-log round counts are lower bounds for the section-format sidecars.
  - The Claude code-review rounds are not in the ledger. Only Codex per-task reviews are counted.
  - Plan reads include Sol arch-checks.
- **Small cells.** The bands at 6 tasks and above have 16–21 specs each, and cells in §4.3 have n ≤ 14. The step
  at 7 is consistent across trouble rate, plan reads and the threshold scan, but it is not statistically tight.
- **Trouble** is a constructed composite. Changing its cut-offs moves the rates, but the ordering of predictors
  (files > lines > tasks) held for every continuous outcome except code reviews per task, where lines led.

## Appendix: per-spec table

This table covers the 322 built specs and 17 unbuilt drafts, sorted by task count in descending order.
- **Files** is the larger of the Files-to-Change rows and the ledger authorized union.
- **Plan reads** are Codex plan-check, arch and cold reads.
- **Extra dispatches** are build dispatches beyond one per base task.
- **Trouble = Y** follows the §3 definition, and every never-built draft counts as trouble.

Data was generated from the spec files, the review sidecars and the run ledger as of 2026-09-30.

| Spec | First ledger date | Spec tasks | Ledger task keys | Files | Spec lines | Review-log rounds | Plan reads (ledger) | Per-task code reviews (ledger) | Build dispatches | Extra dispatches | Non-`done` dispatches | Trouble | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| backup-completeness | 2026-08-16 | 7 | 19 | 28 | 305 | - | 0 | 2 | 25 | 6 | 21 |  |  |
| briefing-rearrange-and-surfaces | 2026-08-09 | 16 | 0 | 26 | 1339 | - | 1 | 0 | 0 | 0 | 0 | Y | unbuilt draft |
| ollama-legs-to-cloud | 2026-08-30 | 15 | 15 | 48 | 1427 | - | 7 | 19 | 22 | 7 | 3 | Y |  |
| ask-navigate-client | 2026-07-17 | 8 | 13 | 16 | 433 | - | 2 | 0 | 13 | 0 | 12 |  |  |
| always-local-read-path | 2026-09-02 | 6 | 12 | 19 | 1191 | 43 | 43 | 12 | 28 | 16 | 6 | Y | park noted |
| bare-create-clock-reply-cards | 2026-09-24 | 12 | 5 | 5 | 842 | - | 0 | 5 | 5 | 0 | 1 |  |  |
| data-root-out-of-tree | 2026-08-17 | 12 | 11 | 33 | 734 | - | 0 | 4 | 25 | 14 | 15 | Y |  |
| health-coach | 2026-08-20 | 12 | 12 | 53 | 3253 | - | 0 | 13 | 22 | 10 | 1 | Y |  |
| task-date-parse-and-disclosure | 2026-08-07 | 4 | 12 | 8 | 527 | - | 0 | 6 | 16 | 4 | 16 |  |  |
| tasks-surface-and-due-dates | 2026-07-29 | 12 | 5 | 32 | 1332 | - | 0 | 1 | 5 | 0 | 5 |  |  |
| curate-duplicate-mentions | 2026-07-29 | 11 | 3 | 8 | 486 | - | 0 | 6 | 4 | 1 | 3 |  |  |
| gcal-write-back-full | 2026-08-01 | 8 | 11 | 22 | 325 | - | 0 | 11 | 14 | 3 | 4 |  |  |
| tasks-module-core | 2026-07-19 | 9 | 11 | 32 | 1012 | - | 6 | 9 | 22 | 11 | 15 | Y |  |
| telegram-comprehension-dead-ends | 2026-09-10 | 8 | 11 | 35 | 233 | - | 3 | 11 | 12 | 1 | 10 |  |  |
| telegram-inbound-ask-and-gates | 2026-07-17 | 5 | 11 | 30 | 251 | - | 20 | 5 | 11 | 0 | 7 | Y |  |
| calendar-create-comprehension | 2026-09-09 | 4 | 10 | 11 | 487 | - | 0 | 0 | 15 | 5 | 8 | Y |  |
| cap-deps-3b-consent-record-and-workshop-card | 2026-07-24 | 5 | 10 | 13 | 134 | - | 0 | 1 | 10 | 0 | 8 |  |  |
| curate-batch-arity | 2026-08-05 | 10 | 0 | 23 | 1233 | 3 | 3 | 0 | 0 | 0 | 0 | Y | unbuilt draft, park noted |
| live-test-fixes-2026-07-30 | 2026-07-30 | 10 | 7 | 15 | 336 | - | 0 | 3 | 7 | 0 | 6 |  |  |
| ollama-provider-retire | 2026-09-02 | 10 | 10 | 51 | 993 | - | 2 | 11 | 13 | 3 | 11 |  |  |
| reminder-ping-answerable | 2026-09-09 | 5 | 10 | 5 | 383 | - | 0 | 10 | 13 | 3 | 3 |  |  |
| phraser-style-contract | 2026-08-09 | 6 | 9 | 3 | 1103 | 1 | 3 | 8 | 11 | 2 | 8 |  | unbuilt draft, park noted |
| task-deadline-and-scheduled-day | 2026-08-09 | 9 | 1 | 6 | 334 | - | 3 | 0 | 1 | 0 | 1 |  |  |
| agent-loop-consent-gate | 2026-09-08 | 6 | 8 | 13 | 1075 | - | 0 | 8 | 26 | 18 | 16 | Y |  |
| build-triage-and-proposal-bridge | 2026-07-17 | 5 | 8 | 42 | 2571 | - | 19 | 7 | 16 | 8 | 6 | Y |  |
| cognee-legs-behind-the-consent-gate | 2026-09-24 | 8 | 4 | 5 | 1246 | - | 0 | 4 | 4 | 0 | 0 |  |  |
| durability-3-offbox-encrypted-3-2-1 | 2026-07-24 | 4 | 8 | 11 | 189 | - | 0 | 1 | 8 | 0 | 5 |  |  |
| email-surface-client | 2026-08-09 | 8 | 0 | 24 | 1150 | - | 1 | 0 | 0 | 0 | 0 | Y | unbuilt draft |
| gmail-sync-repair | 2026-08-19 | 8 | 8 | 52 | 2946 | - | 0 | 8 | 15 | 7 | 6 | Y |  |
| newsletter-digest | 2026-07-23 | 7 | 8 | 28 | 159 | - | 1 | 7 | 13 | 5 | 8 | Y |  |
| reads-1a-calendar-ask | 2026-07-15 | 8 | 8 | 19 | 359 | - | 3 | 0 | 11 | 3 | 10 |  |  |
| reads-1b-remainder | 2026-07-24 | 7 | 8 | 35 | 495 | - | 0 | 1 | 8 | 0 | 6 |  |  |
| reads-mail-redaction | 2026-07-25 | 8 | 5 | 27 | 320 | - | 0 | 3 | 5 | 0 | 4 |  |  |
| telegram-ask-parity | 2026-07-24 | 5 | 8 | 19 | 360 | - | 0 | 2 | 8 | 0 | 6 |  |  |
| telegram-hermetic-harness | 2026-08-25 | 8 | 5 | 19 | 828 | - | 0 | 4 | 7 | 2 | 3 |  |  |
| telegram-notice-edit-in-place | 2026-09-20 | 8 | 2 | 6 | 833 | 1 | 0 | 2 | 2 | 0 | 0 |  |  |
| telegram-surface-parity | 2026-07-31 | 6 | 8 | 45 | 964 | - | 0 | 8 | 8 | 0 | 1 |  |  |
| tonight-default-hour-with-card | 2026-09-20 | 7 | 8 | 27 | 2072 | 2 | 0 | 3 | 11 | 3 | 6 |  |  |
| always-on-daily-driver | 2026-07-16 | 6 | 7 | 19 | 328 | - | 4 | 0 | 7 | 0 | 3 |  |  |
| calendar-module-core | 2026-07-18 | 4 | 7 | 61 | 2222 | - | 18 | 5 | 12 | 5 | 7 | Y |  |
| cap-deps-3c-forge-gate-consent | 2026-07-24 | 4 | 7 | 26 | 431 | - | 3 | 2 | 7 | 0 | 5 |  |  |
| cognee-capture-paths | 2026-08-18 | 7 | 7 | 22 | 553 | - | 0 | 7 | 12 | 5 | 6 | Y |  |
| curate-surplus-guard | 2026-08-05 | 4 | 7 | 4 | 506 | - | 2 | 1 | 7 | 0 | 1 |  |  |
| deferred-answers | 2026-08-15 | 7 | 7 | 33 | 324 | - | 0 | 8 | 12 | 5 | 7 | Y |  |
| durability-1-snapshot-restore-core | 2026-07-24 | 7 | 7 | 10 | 302 | - | 0 | 1 | 7 | 0 | 5 |  |  |
| durability-4-retention-and-capabilities-git | 2026-07-24 | 4 | 7 | 12 | 213 | - | 0 | 2 | 8 | 1 | 6 |  |  |
| host-verbs-catalog-launch | 2026-09-05 | 4 | 7 | 6 | 713 | 36 | 36 | 7 | 7 | 0 | 6 | Y | park noted, split |
| host-verbs-windows-files | 2026-09-05 | 3 | 7 | 4 | 790 | 28 | 28 | 7 | 7 | 0 | 6 | Y | park noted, split |
| lifestyle-module | 2026-07-23 | 7 | 4 | 24 | 245 | - | 1 | 4 | 15 | 11 | 8 | Y |  |
| newsletter-consent-ingest | 2026-09-03 | 7 | 7 | 8 | 911 | - | 2 | 7 | 8 | 1 | 7 |  |  |
| newsletter-synthesis-w3 | 2026-08-03 | 6 | 7 | 28 | 940 | 3 | 1 | 7 | 9 | 2 | 7 |  | park noted |
| remove-dead-phraser-plumbing | 2026-08-09 | 7 | 1 | 6 | 557 | - | 3 | 0 | 1 | 0 | 1 |  |  |
| revert-rewinds-derive-watermark | 2026-07-31 | 7 | 1 | 9 | 176 | - | 0 | 1 | 1 | 0 | 1 |  |  |
| review-surface-mn-r | 2026-07-27 | 7 | 1 | 19 | 180 | - | 0 | 0 | 3 | 2 | 3 |  |  |
| shopping-list-itemisation | 2026-08-09 | 7 | 0 | 24 | 1069 | 1 | 3 | 0 | 0 | 0 | 0 | Y | unbuilt draft, park noted |
| spend-date-windows | 2026-08-09 | 7 | 3 | 20 | 357 | 2 | 3 | 1 | 3 | 0 | 3 |  | park noted |
| summaryless-reminder-asks-what-for | 2026-09-24 | 7 | 4 | 5 | 1874 | - | 0 | 4 | 4 | 0 | 0 |  |  |
| surface-elicitation | 2026-07-24 | 7 | 6 | 34 | 590 | - | 0 | 1 | 7 | 1 | 5 |  |  |
| weekday-dates-confirm-card | 2026-09-10 | 4 | 7 | 9 | 191 | - | 2 | 8 | 7 | 0 | 0 |  |  |
| al-7c-quiet-gate | 2026-07-14 | 6 | 6 | 14 | 201 | - | 0 | 0 | 6 | 0 | 6 |  |  |
| briefing-front-page-renderer | 2026-08-03 | 5 | 6 | 9 | 773 | - | 2 | 5 | 8 | 2 | 3 |  |  |
| fix-p1-persistent-isolate-containment | 2026-07-14 | 6 | 1 | 0 | 302 | - | 0 | 0 | 1 | 0 | 0 |  |  |
| forget-is-a-soft-delete-with-undo | 2026-08-01 | 5 | 6 | 49 | 859 | - | 0 | 0 | 6 | 0 | 1 |  |  |
| gcal-write-hardening | 2026-08-02 | 5 | 6 | 14 | 345 | - | 0 | 0 | 7 | 1 | 1 |  |  |
| host-control-config | 2026-09-04 | 6 | 6 | 12 | 786 | - | 3 | 6 | 7 | 1 | 7 |  |  |
| host-verbs-windows | 2026-09-04 | 6 | 0 | 10 | 1616 | 10 | 8 | 0 | 0 | 0 | 0 | Y | unbuilt draft, park noted, split |
| learned-rules-sweep-parked-items | 2026-08-01 | 5 | 6 | 20 | 650 | - | 0 | 6 | 6 | 0 | 0 |  |  |
| local-answer-or-decline | 2026-08-06 | 6 | 0 | 11 | 1546 | 1 | 5 | 0 | 0 | 0 | 0 | Y | unbuilt draft, park noted |
| mcp4c-ask-consent-seam | 2026-07-14 | 6 | 1 | 0 | 293 | - | 0 | 0 | 1 | 0 | 0 |  |  |
| navigate-needs-a-corroborating-fact | 2026-08-09 | 6 | 2 | 5 | 1198 | 1 | 3 | 1 | 2 | 0 | 1 |  | park noted |
| nutrition-cache-back | 2026-08-08 | 4 | 6 | 12 | 216 | - | 0 | 0 | 7 | 1 | 5 |  |  |
| nutrition-source-precedence | 2026-08-09 | 6 | 0 | 34 | 888 | 1 | 3 | 0 | 0 | 0 | 0 | Y | unbuilt draft, park noted |
| per-meal-macros | 2026-08-09 | 3 | 6 | 14 | 923 | 1 | 3 | 6 | 8 | 2 | 3 |  | park noted |
| provenance-remediation | 2026-07-29 | 6 | 1 | 16 | 455 | - | 0 | 2 | 1 | 0 | 1 |  |  |
| ref-2b-side-effect-signal-wiring | 2026-07-14 | 6 | 1 | 0 | 206 | - | 0 | 0 | 1 | 0 | 0 |  |  |
| reminder-delivery | 2026-08-27 | 6 | 6 | 14 | 772 | 6 | 2 | 7 | 6 | 0 | 6 | Y | park noted |
| reminder-provenance-marker | 2026-08-28 | 6 | 6 | 9 | 858 | - | 1 | 6 | 10 | 4 | 5 | Y |  |
| research-runner | 2026-07-24 | 5 | 6 | 29 | 183 | - | 0 | 2 | 6 | 0 | 3 |  |  |
| review-node | 2026-07-23 | 6 | 5 | 23 | 326 | - | 2 | 5 | 14 | 9 | 7 | Y |  |
| staleness-sweep-stops-false-reds | 2026-09-25 | 6 | 6 | 6 | 754 | - | 0 | 6 | 6 | 0 | 1 |  |  |
| sync-staleness-honesty | 2026-08-20 | 6 | 6 | 25 | 1736 | - | 0 | 6 | 8 | 2 | 2 |  |  |
| temporal-resolution | 2026-08-20 | 5 | 6 | 68 | 960 | - | 0 | 6 | 17 | 11 | 7 | Y |  |
| watch-3d-feed-watcher | 2026-07-14 | 6 | 3 | 12 | 454 | - | 0 | 0 | 4 | 1 | 4 |  |  |
| ask-phrase-fail-fast-path | 2026-08-02 | 5 | 5 | 11 | 143 | - | 0 | 5 | 5 | 0 | 5 |  |  |
| backup-capture-hardening | 2026-08-18 | 5 | 5 | 29 | 417 | - | 0 | 4 | 5 | 0 | 2 |  |  |
| calendar-ask-edits | 2026-08-21 | 4 | 5 | 25 | 4371 | - | 0 | 5 | 8 | 3 | 2 | Y |  |
| calendar-today-marker | 2026-08-08 | 5 | 3 | 4 | 172 | - | 0 | 0 | 3 | 0 | 3 |  |  |
| cap-deps-3a-gate-substrate | 2026-07-24 | 5 | 5 | 11 | 138 | - | 0 | 1 | 5 | 0 | 4 |  |  |
| capabilities-track-owner-data | 2026-08-02 | 4 | 5 | 15 | 439 | - | 0 | 6 | 6 | 1 | 1 |  |  |
| capability-embedder-retire | 2026-09-01 | 5 | 5 | 8 | 182 | - | 0 | 10 | 12 | 7 | 5 | Y |  |
| chat-path-sees-previous-turns | 2026-09-21 | 4 | 5 | 18 | 958 | 1 | 0 | 5 | 5 | 0 | 1 |  |  |
| client-markdown-rendering | 2026-08-09 | 5 | 0 | 6 | 1140 | 1 | 4 | 0 | 0 | 0 | 0 | Y | unbuilt draft, park noted |
| curate-extract-honesty-fence | 2026-08-02 | 3 | 5 | 36 | 561 | - | 0 | 0 | 5 | 0 | 0 |  |  |
| curate-extractor-fork | 2026-07-29 | 5 | 1 | 4 | 357 | - | 0 | 0 | 1 | 0 | 1 |  |  |
| domain-always-local | 2026-07-27 | 5 | 1 | 16 | 195 | - | 0 | 0 | 1 | 0 | 1 |  |  |
| evening-window-bare-hour-and-card-words | 2026-09-24 | 5 | 5 | 4 | 1248 | - | 0 | 5 | 5 | 0 | 0 |  |  |
| finance-display | 2026-07-23 | 5 | 5 | 14 | 193 | - | 1 | 5 | 7 | 2 | 5 |  |  |
| fix-brain-shutdown-zombie | 2026-07-23 | 5 | 3 | 6 | 130 | - | 0 | 3 | 6 | 3 | 5 | Y |  |
| general-path-follow-up-resolver | 2026-09-02 | 5 | 5 | 4 | 279 | - | 0 | 5 | 11 | 6 | 2 | Y |  |
| harness-surface-registry | 2026-08-23 | 4 | 5 | 41 | 1257 | - | 0 | 12 | 15 | 10 | 5 | Y |  |
| host-loop-tools-and-confirm | 2026-09-04 | 5 | 0 | 13 | 1134 | 6 | 4 | 0 | 0 | 0 | 0 | Y | unbuilt draft, park noted |
| live-defects-2026-08-06 | 2026-08-06 | 4 | 5 | 21 | 692 | - | 0 | 0 | 5 | 0 | 0 |  |  |
| local-answer-1a | 2026-08-08 | 4 | 5 | 6 | 591 | - | 0 | 0 | 5 | 0 | 4 |  |  |
| local-answer-1b | 2026-08-08 | 4 | 5 | 7 | 917 | - | 0 | 0 | 5 | 0 | 5 |  |  |
| mcp4a-mcp-grant-scopes | 2026-07-14 | 5 | 1 | 0 | 215 | - | 0 | 0 | 1 | 0 | 0 |  |  |
| memory-write-cheap-pipeline | 2026-07-29 | 5 | 1 | 5 | 299 | - | 0 | 0 | 2 | 1 | 2 |  |  |
| newsletter-daily-synthesis | 2026-07-30 | 5 | 5 | 32 | 515 | - | 0 | 0 | 6 | 1 | 2 |  |  |
| past-time-ask-says-it-went-by | 2026-09-23 | 5 | 5 | 5 | 1646 | - | 0 | 5 | 5 | 0 | 0 |  |  |
| purge-forever-finishes-a-forget | 2026-08-01 | 4 | 5 | 32 | 546 | - | 0 | 5 | 5 | 0 | 0 |  |  |
| record-date-anchoring | 2026-08-02 | 5 | 5 | 7 | 135 | - | 0 | 10 | 7 | 2 | 6 |  |  |
| reentry-carry-hardening | 2026-09-11 | 3 | 5 | 6 | 301 | - | 3 | 3 | 5 | 0 | 2 |  |  |
| research-runner-core | 2026-07-23 | 5 | 5 | 20 | 1024 | - | 11 | 5 | 7 | 2 | 7 | Y |  |
| review-accept-completion-signal | 2026-07-27 | 3 | 5 | 9 | 207 | - | 0 | 0 | 6 | 1 | 5 |  |  |
| selector-ask-kind | 2026-07-28 | 5 | 4 | 9 | 513 | - | 0 | 0 | 4 | 0 | 3 |  |  |
| surface-glass-collapse | 2026-08-08 | 5 | 5 | 11 | 164 | - | 0 | 2 | 5 | 0 | 5 |  |  |
| telegram-slow-answer-ping | 2026-09-21 | 5 | 2 | 4 | 776 | 0 | 0 | 2 | 2 | 0 | 0 |  |  |
| today-and-lifestyle-ask-follow-the-phase | 2026-09-26 | 5 | 5 | 8 | 842 | - | 0 | 5 | 5 | 0 | 1 |  |  |
| trivial-traffic-fast-path | 2026-09-09 | 3 | 5 | 11 | 557 | - | 0 | 4 | 8 | 3 | 4 | Y |  |
| workshop-amend-hardening | 2026-07-17 | 4 | 5 | 8 | 238 | - | 3 | 0 | 5 | 0 | 5 |  |  |
| abandoned-calendar-ask-saves-note | 2026-09-11 | 3 | 4 | 10 | 387 | - | 4 | 4 | 4 | 0 | 1 |  |  |
| al-7c-quiet-settings-ui | 2026-07-14 | 4 | 4 | 12 | 322 | - | 0 | 0 | 4 | 0 | 4 |  |  |
| ambiguous-next-weekday-asks | 2026-08-09 | 4 | 4 | 27 | 802 | 1 | 4 | 4 | 4 | 0 | 0 |  | unbuilt draft, park noted |
| answerer-replay-hides-by-data-domain | - | 4 | 0 | 22 | 1274 | - | 0 | 0 | 0 | 0 | 0 | Y | unbuilt draft |
| ask-latency-observability | 2026-07-27 | 4 | 4 | 9 | 659 | - | 0 | 3 | 10 | 6 | 6 | Y |  |
| ask-miss-telemetry | 2026-08-24 | 4 | 4 | 35 | 831 | - | 0 | 5 | 13 | 9 | 7 | Y |  |
| ask-reachable-role-budget-coverage | 2026-08-09 | 4 | 1 | 5 | 242 | - | 4 | 0 | 2 | 1 | 2 |  |  |
| ask-reply-phrasing-variance | 2026-07-31 | 4 | 1 | 12 | 308 | - | 0 | 0 | 1 | 0 | 1 |  |  |
| ask-research-guard | 2026-07-27 | 4 | 1 | 5 | 283 | - | 2 | 0 | 1 | 0 | 1 |  |  |
| ask-ux-honesty | 2026-08-21 | 4 | 4 | 40 | 731 | - | 0 | 5 | 6 | 2 | 1 | Y |  |
| autopause-alert-both-surfaces-plain-sentence | 2026-09-25 | 4 | 4 | 4 | 811 | - | 0 | 4 | 4 | 0 | 0 |  |  |
| autopause-reaches-a-surface | 2026-09-24 | 4 | 4 | 22 | 1003 | - | 0 | 4 | 6 | 2 | 0 | Y |  |
| calendar-ask-create | 2026-08-22 | 4 | 4 | 28 | 790 | - | 0 | 13 | 19 | 15 | 5 | Y |  |
| calendar-surface-redesign | 2026-07-29 | 4 | 1 | 11 | 658 | - | 0 | 1 | 2 | 1 | 0 |  |  |
| codex-lean-argv-hardening | 2026-09-21 | 4 | 4 | 12 | 533 | 1 | 0 | 4 | 4 | 0 | 0 |  |  |
| confirm-card-lifetime-by-consequence | 2026-09-24 | 4 | 4 | 17 | 1590 | - | 0 | 4 | 4 | 0 | 0 |  |  |
| day-overview-read | 2026-09-10 | 3 | 4 | 6 | 223 | - | 3 | 4 | 4 | 0 | 4 |  |  |
| deferred-answer-quiet-hold | 2026-08-16 | 4 | 4 | 19 | 338 | - | 0 | 4 | 4 | 0 | 2 |  |  |
| desktop-chat-sees-previous-turns | 2026-09-23 | 4 | 4 | 22 | 712 | - | 0 | 4 | 4 | 0 | 0 |  |  |
| digest-survives-truncation | 2026-08-09 | 4 | 0 | 11 | 395 | 1 | 4 | 0 | 0 | 0 | 0 | Y | unbuilt draft, park noted |
| dismissal-after-re-ask-lapse | 2026-09-21 | 3 | 4 | 5 | 1030 | 1 | 0 | 3 | 6 | 2 | 4 | Y |  |
| duplicate-and-due-asked-serially | 2026-07-31 | 4 | 2 | 10 | 329 | - | 0 | 2 | 2 | 0 | 2 |  |  |
| durability-2-secrets-bundle-and-reconnect | 2026-07-24 | 3 | 4 | 5 | 173 | - | 0 | 1 | 4 | 0 | 3 |  |  |
| email-surface-data | 2026-07-29 | 4 | 2 | 18 | 596 | - | 0 | 3 | 2 | 0 | 2 |  |  |
| embedded-reminder-phrasing | 2026-09-01 | 4 | 4 | 2 | 216 | - | 0 | 4 | 9 | 5 | 2 | Y |  |
| finance-surface-redesign | 2026-07-29 | 4 | 1 | 11 | 645 | - | 0 | 1 | 1 | 0 | 1 |  |  |
| fix-ask-honesty-and-reader-fallback | 2026-07-23 | 4 | 2 | 14 | 136 | - | 0 | 2 | 3 | 1 | 3 |  |  |
| fix-p1-egress-in-consent-key | 2026-07-14 | 4 | 1 | 0 | 157 | - | 0 | 0 | 1 | 0 | 0 |  |  |
| general-answers-pass-the-reading-choke-point | - | 4 | 0 | 11 | 1444 | - | 0 | 0 | 0 | 0 | 0 | Y | unbuilt draft |
| guards-that-underprotect | 2026-07-31 | 4 | 1 | 31 | 294 | - | 0 | 1 | 1 | 0 | 1 |  |  |
| honesty-fence-irregular-verbs | 2026-08-09 | 4 | 1 | 17 | 628 | - | 3 | 0 | 1 | 0 | 1 |  |  |
| isolate-learned-stores-from-tests | 2026-08-09 | 4 | 1 | 6 | 219 | 1 | 3 | 1 | 1 | 0 | 1 |  | park noted |
| launcher-hardening | 2026-07-17 | 3 | 4 | 6 | 170 | - | 2 | 0 | 4 | 0 | 2 |  |  |
| map2c-graph-canvas-and-mount | 2026-07-14 | 4 | 1 | 0 | 300 | - | 0 | 0 | 1 | 0 | 0 |  |  |
| map3c-node-visual-language | 2026-07-14 | 4 | 1 | 0 | 305 | - | 0 | 0 | 1 | 0 | 0 |  |  |
| map4a-forming-node-in-place | 2026-07-14 | 4 | 1 | 0 | 248 | - | 0 | 0 | 1 | 0 | 0 |  |  |
| map4b-happening-surface | 2026-07-14 | 4 | 1 | 0 | 202 | - | 0 | 0 | 1 | 0 | 0 |  |  |
| mcp2b-remote-mcp-client | 2026-07-14 | 4 | 1 | 0 | 222 | - | 0 | 0 | 1 | 0 | 0 |  |  |
| mcp5b-mount-gateway-commands | 2026-07-14 | 4 | 1 | 0 | 140 | - | 0 | 0 | 1 | 0 | 0 |  |  |
| meals-are-calendar-events | 2026-09-11 | 3 | 4 | 4 | 216 | - | 2 | 3 | 4 | 0 | 1 |  |  |
| memory-durable-ledger-fix | 2026-07-14 | 4 | 1 | 0 | 166 | - | 0 | 0 | 1 | 0 | 0 |  |  |
| merge-selector-and-intent-router | 2026-09-21 | 4 | 4 | 20 | 710 | 1 | 0 | 5 | 4 | 0 | 0 |  |  |
| morning-briefing | 2026-07-23 | 4 | 3 | 10 | 295 | - | 1 | 3 | 9 | 6 | 4 | Y |  |
| nav-addressable-spine-domains | 2026-07-28 | 4 | 4 | 4 | 321 | - | 0 | 0 | 4 | 0 | 2 |  |  |
| nav-surfaces-and-relevance | 2026-07-27 | 4 | 1 | 11 | 230 | - | 0 | 0 | 2 | 1 | 2 |  |  |
| navigate-fails-closed-on-a-substring | 2026-09-25 | 4 | 4 | 3 | 852 | - | 0 | 4 | 4 | 0 | 0 |  |  |
| project-cancel-client-leg | 2026-07-28 | 4 | 4 | 9 | 277 | - | 0 | 0 | 4 | 0 | 1 |  |  |
| project-failed-state-and-detector | 2026-07-27 | 4 | 4 | 15 | 317 | - | 0 | 0 | 4 | 0 | 3 |  |  |
| project-stall-watchdog | 2026-07-22 | 2 | 4 | 14 | 574 | - | 7 | 2 | 5 | 1 | 4 | Y |  |
| q-derive-ingest-budget | 2026-07-27 | 4 | 1 | 4 | 151 | - | 0 | 0 | 1 | 0 | 1 |  |  |
| records-view-substrate | 2026-07-23 | 4 | 4 | 16 | 408 | - | 3 | 2 | 4 | 0 | 3 |  |  |
| ref-3-eval-axis-calibration | 2026-07-14 | 4 | 1 | 0 | 300 | - | 0 | 0 | 1 | 0 | 0 |  |  |
| research-runner-part-b | 2026-07-23 | 4 | 4 | 13 | 193 | - | 2 | 4 | 4 | 0 | 4 |  |  |
| rewriter-consent-gate-and-stream-parity | 2026-09-24 | 4 | 4 | 29 | 1163 | - | 0 | 4 | 4 | 0 | 0 |  |  |
| rewriter-hides-by-data-domain-not-path | 2026-09-25 | 4 | 4 | 28 | 1503 | - | 0 | 4 | 4 | 0 | 0 |  |  |
| sanitizer-failure-is-visible | 2026-09-25 | 4 | 4 | 5 | 540 | - | 0 | 4 | 4 | 0 | 0 |  |  |
| selector-port-per-call-resolution | 2026-09-01 | 4 | 4 | 7 | 178 | - | 0 | 4 | 9 | 5 | 1 | Y |  |
| shopping-list-surplus-collision | 2026-08-09 | 4 | 0 | 22 | 595 | 0 | 1 | 0 | 0 | 0 | 0 | Y | unbuilt draft, park noted |
| staleness-sweep-cap-class-and-builtin-tests | 2026-09-25 | 4 | 4 | 7 | 1178 | - | 0 | 4 | 4 | 0 | 0 |  |  |
| stray-reply-drops-delete-and-says-so | 2026-09-25 | 4 | 4 | 6 | 1013 | - | 0 | 4 | 5 | 1 | 1 |  |  |
| telegram-serve-wiring | 2026-07-17 | 4 | 4 | 13 | 205 | - | 7 | 6 | 6 | 2 | 5 | Y |  |
| turn-one-create-has-no-past-instant-guard | 2026-09-21 | 4 | 4 | 4 | 957 | 1 | 0 | 4 | 4 | 0 | 0 |  |  |
| watch-1-promotion-engine | 2026-07-14 | 4 | 1 | 0 | 397 | - | 0 | 0 | 1 | 0 | 0 |  |  |
| accept-row-clears-on-durability | 2026-07-31 | 3 | 3 | 15 | 377 | - | 0 | 2 | 3 | 0 | 3 |  |  |
| ask-navigate-question-gate | 2026-08-24 | 3 | 3 | 5 | 348 | - | 0 | 3 | 13 | 10 | 10 | Y |  |
| bare-hour-promotion-refuses-non-clock-numbers | 2026-09-25 | 3 | 3 | 3 | 643 | - | 0 | 3 | 3 | 0 | 0 |  |  |
| bare-numeric-pair-read-as-hour-writes-unattended | 2026-09-25 | 3 | 3 | 6 | 1082 | - | 0 | 3 | 3 | 0 | 0 |  |  |
| calendar-sync-scope-and-mint-reason | 2026-07-31 | 3 | 2 | 6 | 444 | - | 0 | 3 | 3 | 1 | 2 |  |  |
| cap-deps-3d-client-gate-card | 2026-07-24 | 3 | 2 | 9 | 163 | - | 0 | 1 | 2 | 0 | 2 |  |  |
| capability-stderr-reaches-the-log | 2026-07-30 | 3 | 1 | 7 | 253 | - | 0 | 0 | 1 | 0 | 1 |  |  |
| card-correction-hears-the-owner | 2026-09-24 | 3 | 3 | 4 | 1093 | - | 0 | 3 | 3 | 0 | 1 |  |  |
| cascade-verdict-eviction | 2026-07-28 | 3 | 3 | 7 | 344 | - | 0 | 0 | 3 | 0 | 2 |  |  |
| cloud-reasoning-off-switch | 2026-09-03 | 3 | 3 | 6 | 830 | - | 3 | 6 | 7 | 4 | 7 | Y |  |
| cloud-reasoning-off-switch-client | 2026-09-03 | 3 | 3 | 8 | 386 | - | 3 | 3 | 3 | 0 | 0 |  |  |
| coach-intake-is-additive | 2026-09-25 | 3 | 3 | 3 | 528 | - | 0 | 3 | 3 | 0 | 1 |  |  |
| coach-intake-offer-once-per-day | 2026-09-25 | 3 | 3 | 4 | 505 | - | 0 | 3 | 4 | 1 | 1 |  |  |
| coach-macro-overrides-per-phase | 2026-09-26 | 3 | 3 | 7 | 948 | - | 0 | 3 | 3 | 0 | 0 |  |  |
| codex-lean-argv-and-instructions-file | 2026-09-20 | 3 | 3 | 11 | 717 | 1 | 0 | 3 | 4 | 1 | 1 |  |  |
| confirm-card-copy | 2026-09-11 | 2 | 3 | 4 | 215 | - | 0 | 3 | 3 | 0 | 3 |  |  |
| confirm-card-says-the-day-in-your-words | 2026-09-21 | 3 | 3 | 15 | 527 | 1 | 0 | 3 | 3 | 0 | 0 |  |  |
| create-follow-ups-c | 2026-08-23 | 3 | 3 | 26 | 813 | - | 0 | 5 | 10 | 7 | 5 | Y |  |
| curate-remove-delete-verbs | 2026-09-01 | 3 | 3 | 3 | 186 | - | 0 | 3 | 7 | 4 | 1 | Y |  |
| dash-and-dotted-numbers-in-reminder-name | 2026-09-25 | 3 | 3 | 7 | 1137 | - | 0 | 3 | 3 | 0 | 0 |  |  |
| dismissal-vocabulary-widening | 2026-07-30 | 3 | 3 | 4 | 207 | - | 0 | 0 | 3 | 0 | 3 |  |  |
| dispatch-policy-for-the-class | 2026-08-09 | 3 | 3 | 13 | 1320 | 3 | 4 | 1 | 3 | 0 | 3 |  | park noted |
| email-extractors-move-into-builtin | 2026-09-25 | 3 | 3 | 20 | 1137 | - | 0 | 4 | 4 | 1 | 1 |  |  |
| extractor-health-sees-upstream | 2026-09-25 | 3 | 3 | 16 | 669 | - | 0 | 3 | 3 | 0 | 0 |  |  |
| failover-eligibility | 2026-08-08 | 3 | 3 | 7 | 484 | - | 0 | 0 | 3 | 0 | 2 |  |  |
| grant-surface-create | 2026-07-27 | 2 | 3 | 8 | 229 | - | 0 | 0 | 3 | 0 | 3 |  |  |
| host-resolve-no-raise | 2026-09-07 | 2 | 3 | 4 | 198 | - | 0 | 3 | 3 | 0 | 3 |  |  |
| installer-acl-inheritance | 2026-07-31 | 3 | 1 | 9 | 196 | - | 0 | 1 | 2 | 1 | 2 |  |  |
| launcher-make-current | 2026-07-16 | 3 | 3 | 20 | 494 | - | 1 | 0 | 3 | 0 | 2 |  |  |
| map1-activity-projection | 2026-07-14 | 3 | 1 | 0 | 459 | - | 0 | 0 | 1 | 0 | 0 |  |  |
| map3a-activity-gateway-bridge | 2026-07-14 | 3 | 1 | 0 | 324 | - | 0 | 0 | 1 | 0 | 0 |  |  |
| map3b-activity-read-hook | 2026-07-14 | 3 | 1 | 0 | 165 | - | 0 | 0 | 1 | 0 | 0 |  |  |
| mcp2a-mcp-server-store | 2026-07-14 | 3 | 1 | 0 | 191 | - | 0 | 0 | 1 | 0 | 0 |  |  |
| mcp4b-mcp-confirm-run | 2026-07-14 | 3 | 1 | 0 | 205 | - | 0 | 0 | 1 | 0 | 0 |  |  |
| mcp5a-mount-gate-routes | 2026-07-14 | 3 | 1 | 0 | 218 | - | 0 | 0 | 1 | 0 | 0 |  |  |
| mcp5c-mount-panel-ui | 2026-07-14 | 3 | 1 | 0 | 186 | - | 0 | 0 | 1 | 0 | 0 |  |  |
| mcp6a-always-allow-brain | 2026-07-14 | 3 | 1 | 0 | 150 | - | 0 | 0 | 1 | 0 | 0 |  |  |
| mcp6b-always-allow-gateway | 2026-07-14 | 3 | 1 | 0 | 107 | - | 0 | 0 | 1 | 0 | 0 |  |  |
| model-router-monotonic-patch-scope | 2026-09-12 | 2 | 3 | 2 | 245 | - | 0 | 3 | 3 | 0 | 1 |  |  |
| navigate-refusal-uses-route-not-stale-flag | 2026-09-20 | 3 | 3 | 3 | 642 | 1 | 0 | 3 | 8 | 5 | 6 | Y |  |
| numeric-date-cloud-reader-on-the-miss | 2026-09-24 | 3 | 3 | 2 | 954 | - | 0 | 3 | 3 | 0 | 0 |  |  |
| offset-minutes-reminder-writes-mangled-name | 2026-09-25 | 3 | 3 | 4 | 509 | - | 0 | 3 | 3 | 0 | 0 |  |  |
| offset-word-count-unlicensed-follower-declines-to-ask | 2026-09-14 | 3 | 3 | 6 | 1665 | - | 3 | 3 | 3 | 0 | 1 |  |  |
| ollama-config-sweep | 2026-09-02 | 3 | 3 | 9 | 660 | - | 2 | 3 | 3 | 0 | 2 |  |  |
| pending-navigation-matcher-tightening | 2026-08-13 | 3 | 3 | 17 | 740 | - | 0 | 3 | 10 | 7 | 4 | Y |  |
| pr2a-page-reader-loop-tool | 2026-07-14 | 3 | 1 | 0 | 299 | - | 0 | 0 | 1 | 0 | 0 |  |  |
| quoted-text-stays-in-the-title | 2026-09-25 | 3 | 3 | 4 | 1200 | - | 0 | 3 | 3 | 0 | 0 |  |  |
| read-path-month-windows-and-honest-limits | 2026-09-24 | 3 | 3 | 2 | 927 | - | 0 | 3 | 3 | 0 | 0 |  |  |
| read-service-foundations | 2026-07-27 | 3 | 2 | 4 | 141 | - | 0 | 0 | 2 | 0 | 2 |  |  |
| retype-with-time-drops-rescue-note | 2026-09-13 | 1 | 3 | 4 | 2946 | - | 20 | 3 | 3 | 0 | 0 | Y |  |
| review-flags-intake-and-dispatch | 2026-08-08 | 2 | 3 | 4 | 448 | - | 0 | 0 | 3 | 0 | 2 |  |  |
| selector-pick-tolerates-a-bad-route | 2026-09-23 | 3 | 3 | 15 | 647 | - | 0 | 3 | 3 | 0 | 0 |  |  |
| stall-watchdog | 2026-07-24 | 3 | 3 | 29 | 156 | - | 0 | 1 | 3 | 0 | 2 |  |  |
| stop-offering-build-by-chat | - | 3 | 0 | 15 | 1822 | - | 0 | 0 | 0 | 0 | 0 | Y | unbuilt draft |
| suite-runtime | 2026-07-31 | 3 | 1 | 7 | 179 | - | 0 | 1 | 2 | 1 | 2 |  |  |
| telegram-card-turn-resolves-the-notice | 2026-09-23 | 3 | 3 | 3 | 569 | - | 0 | 3 | 6 | 3 | 3 | Y |  |
| telegram-shows-how-i-read-this | 2026-09-25 | 3 | 3 | 7 | 610 | - | 0 | 3 | 3 | 0 | 0 |  |  |
| test-skills-hash-a-bench-not-the-repo | 2026-09-23 | 3 | 3 | 9 | 369 | - | 0 | 3 | 3 | 0 | 1 |  |  |
| trivial-candidate-tracker | 2026-09-11 | 3 | 3 | 6 | 442 | - | 2 | 3 | 3 | 0 | 0 |  |  |
| turn-one-split-eats-a-decimal-then-the-reply-writes | 2026-09-26 | 3 | 3 | 4 | 584 | - | 0 | 0 | 5 | 2 | 3 | Y |  |
| undo-scope-honesty | 2026-08-08 | 3 | 3 | 5 | 186 | - | 0 | 0 | 3 | 0 | 3 |  |  |
| watch-2r-watcher-runner | 2026-07-14 | 3 | 1 | 0 | 212 | - | 0 | 0 | 1 | 0 | 0 |  |  |
| weather-default-location | 2026-07-31 | 3 | 1 | 3 | 292 | - | 0 | 0 | 3 | 2 | 2 | Y |  |
| bare-hour-day-word-daily-and-times-write-unattended | 2026-09-25 | 2 | 2 | 2 | 687 | - | 0 | 2 | 2 | 0 | 0 |  |  |
| briefing-horizon-net | 2026-08-25 | 2 | 2 | 2 | 177 | - | 1 | 2 | 2 | 0 | 0 |  |  |
| calendar-create-natural-phrasing | 2026-08-26 | 2 | 2 | 12 | 398 | - | 0 | 2 | 2 | 0 | 2 |  |  |
| client-lifecycle | 2026-08-19 | 2 | 2 | 10 | 537 | - | 0 | 2 | 4 | 2 | 3 | Y |  |
| coach-asked-at-fails-open-on-bad-numbers | 2026-09-25 | 2 | 2 | 3 | 391 | - | 0 | 2 | 2 | 0 | 0 |  |  |
| commitment-email-extractor | 2026-08-25 | 2 | 2 | 5 | 189 | - | 3 | 2 | 3 | 1 | 0 | Y |  |
| create-duplicate-scan-knows-all-day | 2026-09-25 | 2 | 2 | 2 | 431 | - | 0 | 2 | 2 | 0 | 0 |  |  |
| cross-surface-lapse-stays-silent | 2026-09-21 | 2 | 2 | 24 | 659 | 2 | 0 | 2 | 2 | 0 | 0 |  |  |
| day-word-read-from-inside-the-reminder-text | 2026-09-25 | 2 | 2 | 4 | 769 | - | 0 | 2 | 2 | 0 | 0 |  |  |
| de1a-draft-email-compose | 2026-07-14 | 2 | 1 | 0 | 206 | - | 0 | 0 | 1 | 0 | 0 |  |  |
| de1b-draft-email-ask-wiring | 2026-07-14 | 2 | 1 | 0 | 168 | - | 0 | 0 | 1 | 0 | 0 |  |  |
| derive-optin-ui | 2026-07-23 | 2 | 2 | 10 | 244 | - | 2 | 2 | 3 | 1 | 3 | Y |  |
| disclosure-dropped-on-invoke-card-paths | 2026-09-21 | 1 | 2 | 17 | 620 | 1 | 0 | 2 | 2 | 0 | 0 |  |  |
| fix-map-node-corner-collapse | 2026-07-15 | 2 | 2 | 4 | 102 | - | 0 | 0 | 2 | 0 | 2 |  |  |
| followup-veto-demonstrative-outranks-verb | 2026-09-20 | 2 | 2 | 2 | 542 | 1 | 0 | 2 | 3 | 1 | 1 | Y |  |
| followup-veto-guards | 2026-09-24 | 2 | 2 | 15 | 627 | - | 0 | 2 | 2 | 0 | 0 |  |  |
| map2a-graph-layout-core | 2026-07-14 | 2 | 1 | 0 | 269 | - | 0 | 0 | 1 | 0 | 0 |  |  |
| map2b-graph-camera | 2026-07-14 | 2 | 1 | 0 | 202 | - | 0 | 0 | 1 | 0 | 0 |  |  |
| mcp3-tool-adapter | 2026-07-14 | 2 | 1 | 0 | 150 | - | 0 | 0 | 1 | 0 | 0 |  |  |
| mcp6c-always-allow-card | 2026-07-14 | 2 | 1 | 0 | 101 | - | 0 | 0 | 1 | 0 | 0 |  |  |
| meal-reply-clock-variance | 2026-09-12 | 1 | 2 | 4 | 261 | - | 0 | 1 | 2 | 0 | 1 |  |  |
| model-output-error-carries-raw-text | 2026-08-09 | 1 | 2 | 2 | 110 | - | 0 | 2 | 2 | 0 | 1 |  |  |
| numeric-day-reader-card-echoes-gone-by | 2026-09-25 | 2 | 2 | 2 | 410 | - | 0 | 2 | 2 | 0 | 1 |  |  |
| numeric-title-plus-dayword-writes-unattended | 2026-09-25 | 2 | 2 | 4 | 501 | - | 0 | 2 | 2 | 0 | 0 |  |  |
| per-meal-macro-pricing | 2026-08-09 | 2 | 1 | 8 | 423 | 0 | 1 | 1 | 1 | 0 | 0 |  | park noted |
| pr1-page-reader-tool | 2026-07-14 | 2 | 1 | 0 | 368 | - | 0 | 0 | 1 | 0 | 0 |  |  |
| pr2b-page-reader-registration-and-invoke | 2026-07-14 | 2 | 1 | 0 | 268 | - | 0 | 0 | 1 | 0 | 0 |  |  |
| reader-dotted-clock-drops-minutes | 2026-09-25 | 2 | 2 | 3 | 456 | - | 0 | 2 | 2 | 0 | 0 |  |  |
| ref-1-full-rubric-fast-full-mode | 2026-07-14 | 2 | 1 | 0 | 214 | - | 0 | 0 | 1 | 0 | 0 |  |  |
| ref-2a-tiered-routing-and-do-overs | 2026-07-14 | 2 | 1 | 0 | 273 | - | 0 | 0 | 1 | 0 | 0 |  |  |
| refresh-body-cap-rework | 2026-07-15 | 2 | 2 | 5 | 76 | - | 0 | 0 | 2 | 0 | 1 |  |  |
| relative-offset-dates | 2026-09-13 | 2 | 2 | 8 | 4917 | - | 17 | 2 | 2 | 0 | 0 | Y |  |
| reminder-auto-create | 2026-08-27 | 1 | 2 | 36 | 759 | 5 | 4 | 2 | 3 | 1 | 1 | Y | park noted |
| reply-side-reads-a-relative-offset | 2026-09-17 | 2 | 2 | 4 | 760 | - | 0 | 2 | 2 | 0 | 0 |  |  |
| research-clarify-what-about-is-an-answer | 2026-09-25 | 2 | 2 | 2 | 398 | - | 0 | 2 | 2 | 0 | 0 |  |  |
| resume-leg-declines-without-telling-the-owner | 2026-09-17 | 2 | 2 | 4 | 1218 | - | 1 | 2 | 2 | 0 | 1 |  |  |
| resume-re-ask-loop-guard | 2026-09-20 | 2 | 2 | 5 | 1020 | 1 | 0 | 2 | 2 | 0 | 0 |  |  |
| scrub-owner-identifiers-from-tracked-files | 2026-09-26 | 2 | 1 | 14 | 736 | - | 0 | 1 | 1 | 0 | 0 |  |  |
| selector-args-and-route-enum | 2026-09-25 | 2 | 2 | 18 | 761 | - | 0 | 2 | 2 | 0 | 0 |  |  |
| telegram-reminder-calendar-flow | 2026-08-27 | 2 | 2 | 21 | 557 | - | 0 | 2 | 7 | 5 | 7 | Y |  |
| topic-day-card-and-topic-tonight-suggestion | - | 2 | 0 | 3 | 838 | - | 0 | 0 | 0 | 0 | 0 | Y | unbuilt draft |
| trivial-candidate-followups | 2026-09-11 | 2 | 2 | 6 | 327 | - | 3 | 2 | 2 | 0 | 0 |  |  |
| trivial-candidates-erase-phrase | 2026-09-17 | 2 | 2 | 4 | 598 | - | 0 | 3 | 3 | 1 | 1 | Y |  |
| trivial-candidates-erase-surface | 2026-09-13 | 2 | 2 | 5 | 1435 | - | 10 | 2 | 2 | 0 | 0 | Y |  |
| unread-day-in-title-writes-today | 2026-09-25 | 2 | 2 | 4 | 680 | - | 0 | 2 | 2 | 0 | 0 |  |  |
| validate-domain-tag-sanitize | 2026-09-02 | 1 | 2 | 8 | 180 | - | 0 | 2 | 3 | 1 | 2 | Y |  |
| voice-1a-client-capture-module | 2026-07-14 | 2 | 1 | 0 | 242 | - | 0 | 0 | 1 | 0 | 0 |  |  |
| voice-1b-ptt-hold-mic-button | 2026-07-14 | 2 | 1 | 0 | 254 | - | 0 | 0 | 1 | 0 | 0 |  |  |
| watch-2s-watcher-store | 2026-07-14 | 2 | 1 | 0 | 321 | - | 0 | 0 | 1 | 0 | 0 |  |  |
| weight-log-fact-and-echo | 2026-07-27 | 2 | 1 | 7 | 214 | - | 0 | 0 | 1 | 0 | 1 |  |  |
| ask-read-fallback-and-pending-copy | 2026-08-27 | 1 | 1 | 17 | 396 | - | 0 | 1 | 1 | 0 | 1 |  |  |
| ask-stream-answer-persist | 2026-08-26 | 1 | 1 | 18 | 442 | - | 0 | 1 | 3 | 2 | 2 | Y |  |
| calendar-ask-copy-no-proposal | 2026-09-13 | 1 | 1 | 3 | 660 | - | 2 | 1 | 1 | 0 | 0 |  |  |
| calendar-card-title-mangling | 2026-09-13 | 1 | 1 | 4 | 1053 | - | 3 | 1 | 1 | 0 | 0 |  |  |
| calendar-create-llm-reader | 2026-09-18 | 1 | 1 | 5 | 1048 | 1 | 0 | 1 | 1 | 0 | 0 |  |  |
| calendar-edit-ttl-horizon-tolerance | 2026-09-17 | 1 | 1 | 28 | 250 | - | 1 | 1 | 1 | 0 | 0 |  |  |
| calendar-pending-dismissal-acknowledged | 2026-09-17 | 1 | 1 | 4 | 696 | - | 0 | 1 | 1 | 0 | 0 |  |  |
| calendar-turn-one-numeric-scan-time-part | 2026-09-13 | 1 | 1 | 4 | 949 | - | 0 | 1 | 1 | 0 | 0 |  |  |
| calendar-turn-one-unreadable-date-declines | 2026-09-12 | 1 | 1 | 4 | 969 | - | 4 | 1 | 1 | 0 | 0 |  |  |
| coach-fuelling-phase-day-one | 2026-09-25 | 1 | 1 | 1 | 290 | - | 0 | 1 | 1 | 0 | 0 |  |  |
| curate-extract-owner-text | 2026-08-25 | 1 | 1 | 20 | 388 | - | 0 | 1 | 1 | 0 | 1 |  |  |
| curate-unclear-fence-owner-text | 2026-08-26 | 1 | 1 | 23 | 211 | - | 0 | 1 | 1 | 0 | 1 |  |  |
| deferred-frame-timer-tolerance | 2026-09-16 | 1 | 1 | 1 | 571 | - | 3 | 1 | 1 | 0 | 0 |  |  |
| dropped-calendar-reply-tells-the-owner | 2026-09-17 | 1 | 1 | 4 | 574 | - | 0 | 1 | 1 | 0 | 1 |  |  |
| erase-task-shutdown-cancellation | 2026-09-17 | 1 | 1 | 2 | 346 | - | 0 | 1 | 1 | 0 | 0 |  |  |
| fix-install-keeps-bench | 2026-07-17 | 1 | 1 | 3 | 146 | - | 0 | 1 | 1 | 0 | 1 |  |  |
| followup-rewrite-skips-pending-state | 2026-09-20 | 1 | 1 | 4 | 710 | 1 | 0 | 1 | 1 | 0 | 1 |  |  |
| lapsed-ask-witness-ages-the-row | 2026-09-11 | 1 | 1 | 1 | 162 | - | 0 | 1 | 1 | 0 | 0 |  |  |
| named-day-epsilon-imported-whole | 2026-09-17 | 1 | 1 | 3 | 345 | - | 1 | 1 | 2 | 1 | 2 | Y |  |
| non-calendar-destination-tail | 2026-09-11 | 1 | 1 | 3 | 236 | - | 4 | 1 | 1 | 0 | 0 |  |  |
| offset-reply-with-contradictory-date-declines | 2026-09-20 | 1 | 1 | 13 | 568 | 1 | 0 | 1 | 2 | 1 | 1 | Y |  |
| preposition-led-date-tail-declines | 2026-09-17 | 1 | 1 | 4 | 890 | - | 0 | 1 | 1 | 0 | 0 |  |  |
| refresh-ingest-hardening | 2026-07-23 | 1 | 1 | 8 | 418 | - | 5 | 1 | 1 | 0 | 1 | Y |  |
| reply-numeric-scan-time-part | 2026-09-17 | 1 | 1 | 6 | 492 | - | 0 | 1 | 1 | 0 | 0 |  |  |
| resolver-deletes-trailing-digit-from-summary | 2026-09-17 | 1 | 1 | 5 | 1102 | - | 0 | 1 | 3 | 2 | 2 | Y |  |
| sandbox-dnsmasq-pidfile | 2026-08-27 | 1 | 1 | 15 | 218 | - | 0 | 1 | 1 | 0 | 1 |  |  |
| secrets-index-temp-file-dotted-prefix | 2026-08-10 | 1 | 1 | 2 | 103 | - | 0 | 1 | 2 | 1 | 2 | Y |  |
| table-delim-re-widen | 2026-09-02 | 1 | 1 | 8 | 160 | - | 0 | 1 | 1 | 0 | 1 |  |  |
| take-back-matching-inside-the-try | 2026-09-17 | 1 | 1 | 3 | 358 | - | 2 | 1 | 1 | 0 | 0 |  |  |
| telegram-catalog-annotate-close-out | 2026-09-17 | 1 | 1 | 1 | 285 | - | 0 | 1 | 1 | 0 | 0 |  |  |
| telegram-catalog-gap-pins | 2026-09-13 | 1 | 1 | 2 | 827 | - | 8 | 1 | 1 | 0 | 0 | Y |  |
| telegram-expired-tap-second-copy | 2026-09-17 | 1 | 1 | 3 | 449 | - | 0 | 1 | 1 | 0 | 0 |  |  |
| telegram-harness-no-wsl-probe | 2026-09-17 | 1 | 1 | 2 | 324 | - | 0 | 1 | 1 | 0 | 0 |  |  |
| telegram-nontext-reply | 2026-08-26 | 1 | 1 | 19 | 400 | - | 0 | 1 | 4 | 3 | 3 | Y |  |
| title-day-resumed-create-is-confirmed | 2026-09-21 | 1 | 1 | 15 | 552 | 0 | 0 | 1 | 1 | 0 | 0 |  |  |
| today-write-guard-comment-carded-clause | 2026-09-17 | 1 | 1 | 2 | 327 | - | 0 | 1 | 1 | 0 | 0 |  |  |
| trivial-candidate-hop-submit-fail-soft | 2026-09-17 | 1 | 1 | 3 | 486 | - | 1 | 1 | 3 | 2 | 2 | Y |  |
| trivial-candidate-prune-real-store-hop | 2026-09-12 | 1 | 1 | 2 | 158 | - | 0 | 1 | 1 | 0 | 0 |  |  |
| trivial-candidate-stale-arm-tolerance | 2026-09-12 | 1 | 1 | 2 | 276 | - | 0 | 1 | 1 | 0 | 0 |  |  |
| trivial-candidate-store-off-the-loop-thread | 2026-09-14 | 1 | 1 | 3 | 584 | - | 2 | 1 | 1 | 0 | 0 |  |  |
| trivial-candidate-store-pins | 2026-09-12 | 1 | 1 | 2 | 464 | - | 0 | 1 | 1 | 0 | 0 |  |  |
| trivial-candidates-erase-allow-header | 2026-09-17 | 1 | 1 | 2 | 439 | - | 0 | 1 | 1 | 0 | 0 |  |  |
