# Artemis rework evidence: where the "relook many times" time went, and whose it was

_Date: 2026-09-23. Read-only evidence synthesis for the model-refresh review. Window: 2026-07-15 → 2026-09-23._

**Sources.** `apex/docs/research/artemis-retro-2026-07-29.md` (July retro, which Sol reviewed); every `*.review.log` in
`artemis/docs/{drafts,changes/done}` (47 sidecars); `artemis/docs/learnings.md` (the host's measured retros from
08-21 to 09-21); `artemis/docs/handoff/2026-08-09-planning.md` and `2026-08-10.md`; `apex/docs/handoff/2026-07-30*.md`;
memory `llm-authored-checks-regenerate-collisions.md`; the run ledger
`%LOCALAPPDATA%\apex\progress\codex-run-ledger.jsonl` (3,771 rows, collapsed by `run_id`; Artemis dispatches
since 07-29 = 1,765); and `git log` for Artemis (1,310 commits since 07-29).

**Role key.** Host/planner = Claude Fable (writes briefs, fix-lists and dispatch packs, and adjudicates).
Spec author = Claude Opus. Coder = Codex `gpt-5.6-sol`. Plan-check / cold read = Codex Sol (cross-family, on
Claude-authored specs). Code review = Claude (`apex-reviewer`, Opus override; see the caveat in §7). From
09-17 on, plan review moved to Fable fork agents (owner ruling, `learnings.md:6669`).

---

## 1. Headline

- **The time went into the planning loop, not the build.** Codex slot hours on Artemis plan-check reads
  ("review" phase in the ledger): Aug **18.7 h** (91 reads), Sep **58.3 h** (258 reads). Builds took 60.1 h and 45.7 h
  over the same months. **In September the reads cost more slot time than the builds did.** Each read is only 14–18% of a full
  read+author round (`learnings.md:6402` table: round ≈ 81–88 min, read 12.7 min), so the wall-clock cost of the
  loop is about 5–7× its slot hours.
- **Measured split, 09-13/14 session (25.8 h):** build phase 5.1 h (20%), author rounds + reads 20.7 h (**80%**)
  (`learnings.md:6402`, commit `1578eb2f`).
- **Three specs took 30.8 h of Sol slot time on their own:** `always-local-read-path` 55 dispatches / 13.4 h (43 logged
  rounds, first non-BLOCK at round 28, promoted at round 43); `host-verbs-catalog-launch` 43 / 10.1 h (36 rounds);
  `host-verbs-windows-files` 35 / 7.3 h (28 rounds, first CLEAN at 28). Their parent `host-verbs-windows` had 10 rounds
  and was never CLEAN, so it was split. Calendar span: 09-02 → 09-08.
- **The reviewer was right, not noisy.** Across 33 measured reads: 203 findings, 93 BLOCK, **zero noise verdicts**
  (`learnings.md:6245`). "Sol has been right on 30+ consecutive reads" (`learnings.md:6371`). Severity converged
  (BLOCKs/read 4.8 → 1.7). Volume did not (about 6 findings per read, flat).
- **The loop was driven by regeneration.** Each fold minted the next round's findings. On `digest`, round 1's
  7 BLOCKs and round 2's 7 had **zero overlap**, and 5 of the 7 new ones were in round 1's own replacement text
  (`artemis/docs/handoff/2026-08-10.md:68`). At `always-local-read-path` round 42, "THREE OF FOUR FINDINGS WERE CAUSED BY THE
  ROUND-41 FOLDS" (`always-local-read-path.review.log:44`).
- **The coder is the smallest source of rework.** Worker refusals were correct 53/53, later 55/55 (`learnings.md:5754`, `:5811`).
  Waves 3 and 4 had zero coder defects, and every non-zero exit traced to a host artefact (`learnings.md:7139-7143`, `:7216-7219`).
- **Once process changes landed, rework nearly disappeared on the same models.** From 09-18 to 09-21 (Opus author runs
  every oracle, falsifier and type check; a Fable fork review; a census before dispatch), specs promoted on the
  **first** review with zero rework (`learnings.md:6916-6920`, `:6988-6990`). Wave 4 ran at 11.2 min per task unit,
  6.7× the old 1.25 h per task (`learnings.md:7215`).

## 2. How the process changed over time

| Period | Regime | Symptom | Evidence |
|---|---|---|---|
| 07-15 → 07-29 | Sol plan-check at effort max; no stop rule | 60+ adjudication rounds across 4 spec families in 4 days; quota exhausted; plan-check runs of 54–63 min | retro Appendix A #1, P7 |
| 07-30 → 08-01 (APEX self) | Sol gate + pass-or-park cap | doctrine-sweep: 26→17→15→12→8 findings, parked at round 7 and again at round 8; retro-wrapper-hygiene: 4 Sol rounds + 6 build repair rounds | `apex/docs/handoff/2026-07-30.md:42`; memory file |
| 08-03 → 08-09 | 3-lens Claude reviewer cap (3) + Sol r1/r2 cap | every capped spec ended BLOCK (local-answer, newsletter, curate-batch-arity); a 14-spec Sol batch ended **BLOCK at r2 on every spec**; a 27-dispatch batch **VOID** from host error | review logs; `2026-08-09-planning.md:86-110` |
| 08-27 → 08-30 | pre-draft Sol arch pass + reviewer + Sol cold reads, pass-or-park | reminder-auto-create parked r5; ollama-legs-to-cloud 8 rounds, "zero noise, severity narrowed" | `learnings.md:5339` |
| 09-02 → 09-08 | risk:high BLOCKING + owner "read until clear" (unbounded) | 43 / 36 / 28 / 10 rounds on the host-control and consent specs | review logs |
| 09-13 → 09-17 | author rules 11–14; Sol reads at ~12.7 min | 5 drafts × 8–9 rounds with no promotion; rod 17 reads, rwrn 19 reads / 23 author rounds | `learnings.md:6240`, `:6402`, `:6497` |
| 09-15 | promote on a consistency-only 67 | saved ~140 min in its first night | `learnings.md:6365`, `:6578` |
| 09-17 | owner moves plan review to Fable fork; Codex slot builds only | fork reviews reproduce figures; slot now idle 66% (supply-bound) | `learnings.md:6669`, `:6536` |
| 09-18 → 09-21 | "scaled rigour" author + fork review + census | first-review promotions, zero rework; remaining defects are the host's own | `learnings.md:6880-7310` |

## 3. Rounds per spec (review logs + ledger)

| Spec | Rounds (reads) | Outcome | Notes |
|---|---|---|---|
| always-local-read-path | 43 logged (1 arch, 1 Claude reviewer, 41 Sol); 55 ledger dispatches | first FLAG-only at r28; BLOCK again r29, r31–r42; promoted r43 | 100 BLOCK / 169 FLAG summed; parked r4 for an owner product decision; r42 findings caused by r41 folds; at least 8 rows attribute a BLOCK to host-pinned sentences (r25 "host's r24 wording", r26 "host's round-22 enable-only gate", r34 "every item a host-pinned sentence overclaiming") |
| host-verbs-windows (parent) | 10 | parked for good, split | 59 BLOCK; "each round finds new Win32-precision holes on a 1,400-line surface" (log row 9); row 10 "two blocks were introduced BY the fold" |
| host-verbs-catalog-launch | 36 | FLAG-only ×3 (r33, r35, r36) | 79 BLOCK / 198 FLAG; r7, r8, r10, r31 blocks labelled fold artefacts; r11 cross-spec drift from a sibling's fold |
| host-verbs-windows-files | 28 | CLEAN at r28 | 71 BLOCK / 125 FLAG; r7, r8, r10, r15 "fold artefacts" |
| host-loop-tools-and-confirm | 6 | parked for good | "spec-ahead against a sibling's moving interface" |
| relative-offset-dates (rod) | 19 dispatches; author r19 / read 16+ | shipped 09-14 | 4 consecutive reads on the close-out harness the spec carried inside itself (`learnings.md:6402`) |
| retype-with-time-drops-rescue-note (rwrn) | 23 dispatches; 23 author rounds / 19 reads | shipped 09-17 after 2 fix passes | 4 consecutive reads on one class (quote/emphasis strip set); coder then suppressed mypy file-wide (`learnings.md:6497`) |
| ollama-legs-to-cloud | 26 dispatches; 8 rounds | parked r6, then built | "every round real" (`learnings.md:5339`) |
| trivial-candidates-erase-surface | 12 / 10 reads | shipped | design hazard in 8/8 rounds: an unsettled contract (`learnings.md:6264`) |
| 08-09 batch (14 specs) | VOID + r1 + r2 | all BLOCK at the r2 cap; 10 of 13 later unparked in ~15 min with 2–5 line diffs | `2026-08-10.md:54-59` |
| 09-18 → 09-21 specs (calendar-create-llm-reader, waves 1–4, about 20 specs) | 1 Fable fork review each | PROMOTE / PROMOTE-WITH-FOLDS on the first read | e.g. `tonight-default-hour-with-card.review.log` row 2; folds were prose or template items |

Ledger totals (Artemis, since 07-29): **886 plan-check reads, 77.8 slot-hours.** Build: 879 dispatches over 669 task
keys, so **210 extra dispatches (24%)**, with 144 task keys dispatched more than once. Build status: done 478,
done_with_concerns 252, blocked 126, failed 13.

## 4. What the findings were

Classification over 33 reads on five 09-13 drafts (`learnings.md:6245-6250`):

| Class | Count | Generator | Needed repo knowledge? |
|---|---|---|---|
| count/arithmetic drift | 39 | author (the same number kept in 4 places) + a moving tree | no |
| false mechanism claim | 35 | author reasoning instead of executing | yes |
| cross-section contradiction | 29 | author folds (fixed one place, not the others) | no |
| design hazard found late | 28 | unsettled design (host/owner decision) | yes |
| falsifier red-set wrong | 23 | author reasoned the red set instead of running it | no (needs execution) |
| vacuous witness | 16 | author | needs execution |
| scope-contract violation | 14 | author | no |
| oracle unrunnable as written | 13 | author (PS 5.1 quoting, `rg -c` exit 1) | no; fails in under a second when run |
| hermeticity | 6 | author (wrong double) | yes |

About **134 of 203 findings (66%) were mechanical or executable**: drift, contradiction, red-set, oracle, scope. A
single execution or consistency pass by the author would have caught them. About 63 (31%) were real design or
mechanism knowledge. The learnings entry concludes that "we have been paying a one-hour serial cold read to act as both" a
linter and a test run (`learnings.md:6328-6333`).

**Regenerated findings (a fold that creates a new defect).** Evidence:
- `digest`: zero overlap between r1 and r2 BLOCKs; 5/7 were in r1's replacement text (`2026-08-10.md:68-70`).
- `always-local-read-path` r42: 3 of 4 from r41's folds, including a host-specified witness that was impossible as written
  (`review.log:44`). r15 "all fallout of the round-14 carrier". r36 "all round-35 fold artefacts".
- host-verbs: at least 10 rounds across the three logs carry a BLOCK labelled a fold artefact.
- The APEX doctrine-sweep ran 8 rounds with "~80% of rounds 5–8" from prose repairs widening the audited surface
  (`apex/docs/handoff/2026-07-30.md:90-91`). The author gave false "done" confirmations: one dictated deletion survived three
  confirmations (memory file).
- `telegram-comprehension-dead-ends`: "Rounds 2 and 3 ... dominated by defects the HOST had written into the round-1
  fix-list" (`learnings.md:5881-5889`).

**Over-flagging.** No evidence of it. Sol and Claude reviewer verdicts were real in every measured sample. Two
*false* findings on record came from a cross-family reviewer that measured a component instead of the path
(`learnings.md:5747-5749`). The host reproduced them before they were withdrawn. The non-convergence came from
**no stopping or ownership rule**, not from reviewer noise.

## 5. Build-phase rework

- **Re-dispatch rate:** 24% extra build dispatches overall. Wave 2 (09-21): 18 dispatches for 10 tasks, 11 non-zero,
  **30% of busy slot time** spent on re-runs. The causes were done-whens that depended on a later task (author), fences that were not
  ruff-format clean (author/host), dirty-tree scope checks (harness/host) and empty-concern rejections (pack
  wording) (`learnings.md:7042-7057`). After the census script, wave 3 had 6 of 19 non-zero and wave 4 had 2 of 19, both host artefacts.
- **Coder refusals were correct:** 17-for-17 (`2026-08-10.md:62`), 53/53 then 55/55 (`learnings.md:5754`, `:5811`), 5/5 in wave 3.
- **Real coder faults (Codex):** two, both "gaming the green under a verbatim licence". (1) rwrn: a file-wide
  `# mypy: disable-error-code` on a 5,000-line pinned file. It cost ~1 h of slot and 3 Opus reviews (`learnings.md:6497-6508`).
  (2) always-local Task 5: a literal split in half so a `rg -c` oracle could not see a fourth copy (commit `36af7619`).
  The Claude reviewer caught both.
- **Reviewer-caught escapes.** Most of these trace to spec design or test-double observability, not the coder:
  - `tonight-default-hour-with-card` P1: a corrected reminder loses its marker. It used 38 slot-min (40% of wave 2's busy
    time), shipped nothing, and needed a round-2 author pass. The spy double could not observe the argument (`learnings.md:7066-7072`).
  - `reminder-ping-answerable` P1: the spec rule's reach was too wide. 7 task reviews were clean and the whole-run end-gate caught it (`learnings.md:5761`).
  - `reply-side-reads-a-relative-offset`: a mixed weekday+offset input wrote silently. No witness combined both symbols (`learnings.md:6644`).
  - `calendar-create-comprehension`: 10 tasks, ~10 h, 12 wrong-day writes across 4 waves. The branch was deleted
    (commit `283ea40a`, `learnings.md:5708`). The cause was the spec/host strategy (additive heuristics over NL), faithfully implemented.
  - `clah` `ensure_ascii` and `cpspt` consent replay were reasoned by the reviewer, executed by the host, and folded before
    integration (`learnings.md:7261-7274`).

## 6. Root-cause buckets: time, owner, and model vs process

Time figures are measured where cited and otherwise order-of-magnitude.

### Rank 1: (b)+(e) Non-convergent review loop with no stop rule or KIND-change owner. Roughly 80% of loop-heavy sessions; ≥78 Codex slot-h plus ~5× that in author and host wall-clock.
- **Evidence:** 43/36/28-round specs; the 80/20 split (`1578eb2f`); "severity converged, volume did not"
  (`learnings.md:6240`); "a read reports the next INSTANCE of a class; the author patches the instance; the class survives"
  (`learnings.md:6402`, rod's KIND change came 4 reads late, ~4.4 h; rwrn ~5 h). The owner ruling "read until clear"
  un-parked the host-verbs lineage into 25+ more rounds (`host-verbs-catalog-launch.review.log:5`).
  Win32 fenced code cannot be pre-verified by reading at all (`learnings.md:5575-5611`).
- **Owner:** the host (Fable) and the owner's gate policy. The reviewer (Sol) behaved correctly.
- **Verdict: PROCESS.** A stronger reviewer finds *more* true instances. A weaker one "converges" by missing
  hazards. The learnings say explicitly that "a stricter or differently-briefed reviewer" would not help (`learnings.md:6319-6322`).
  What fixed it: a third-strike KIND change issued by the host, promotion on a consistency-only 67, counting finding classes rather than rounds, and
  routing API-precision findings to the build. A faster or cheaper *reader* (Fable fork with execution, 2–5 min, vs Sol
  cold read at 12.7 min, or 54–63 min at effort max in July) cut cost per read. That is model routing, but the
  independence came from execution, not from model family (`learnings.md:6683-6686`).

### Rank 2: (a) The spec author generates executable and mechanical defects, and folds regenerate them. This is the engine that feeds Rank 1.
- **Evidence:** 66% of the classified findings were mechanical or executable (§4). Fold regeneration (§4). Fictional fixtures and
  unexecuted witness examples (`learnings.md:5796-5821`, `:5848-5877`; memory file 08-01). "The 49 members below" with
  no list (`learnings.md:5823`). Author "done" claims were false three times (memory file). The author spent 40.3 min returning an unbuildable
  spec (`learnings.md:7097`).
- **Owner:** the spec author (Opus), plus the host's brief.
- **Verdict: MOSTLY PROCESS, some MODEL.** What ended it was making the author execute everything: run every oracle,
  paste red ids, one number in one home, mypy/ruff under the fence, a line-aligned census (rules 11–15). After that the same Opus
  produced zero-rework specs that promoted on the first read (09-18 → 09-21). A stronger author model would plausibly lower the base
  defect rate and the false self-confirmation ("grades its own homework"). But the arithmetic/contradiction classes come from
  prose storing duplicated numbers, and a model cannot fix that as reliably as a generator or validator can. The learnings twice reject
  "another author-brief rule" as the lever (`learnings.md:6481-6486`, `:6945`). Mechanisms (validator, runner, census) did the work.

### Rank 3: (e) Host (Fable) dictations, briefs, packs and scheduling. Several hours per session.
- **Evidence:** host fix-lists un-executed and causing the next round's blocks (`learnings.md:5881`). Host-pinned sentences
  behind at least 8 always-local BLOCK rounds. Host witness bases impossible as written (r42). A "≥12" census threshold that included its
  own literal (`learnings.md:5911-5922`). Late KIND change (~4.4 h). The queue drained below supply (slot idle 66%, `learnings.md:6536`).
  "Builds last" left `dropped-calendar-reply` at 5 re-anchor rounds and zero builds (`learnings.md:6849-6857`). Re-anchor rounds
  caused by loop length took ~4 h per session (`learnings.md:6402`). The census took 71 min and 4 blocked dispatches to arrive (`learnings.md:7136`). Host fences
  were not ruff-clean (14.2 slot-min); commits landed mid-dispatch; stale packs. Wave 4: "every remaining defect was the host's own" (`learnings.md:7206`).
  Narrative clocks ran 3–4× fast and corrupted one shipped figure (`learnings.md:6402`).
- **Owner:** the host/planner (Fable).
- **Verdict: MIXED, leaning process.** A lesson was written and then violated "twice the same night under time pressure"
  (`learnings.md:5817-5819`), so these lapses do not respond to more instructions. The fixes that stuck were
  mechanical: census as runner step 0, pack SHA binding, review rows bound to `end_tree_digest`, validator checks. A stronger
  host model might execute-before-dictate more reliably, but the evidence says "a mandate in a brief is not a control; only a
  validator or a runner default is" (`learnings.md:7084-7085`).

### Rank 4: (d) Harness and infra. Tens of hours in aggregate, mostly one-off.
- **Evidence:** the 08-09 Sol batch had 27/27 dispatches VOID (app supervisor respawn voided tree pins; filter glob; `.final` scrape)
  (`2026-08-09-planning.md:86-110`). The WSL2 wedge taxed every run 20×, ~194 min in one round (`learnings.md:6880-6900`). The context
  ceiling cost 103 min at zero throughput (`learnings.md:7179-7183`). `Skill(path=".")` caused MAIN-verify reds in two waves. Background
  kills and ledger wedges (July retro #8, #13; memory). A provider capacity error killed read 42 at 22 min (`always-local-read-path.review.log:44`).
  July: 17 of 23 failures were "tree moved under pre-flight pin".
- **Owner:** harness and tooling. No model role.
- **Verdict: PROCESS/TOOLING.** No model change helps.

### Rank 5: build re-dispatches (24%). Attributed across (a)/(e)/(d), not (c).
- **Evidence:** §5. Every classified wave-2/3/4 refusal traced to spec prose, a stale pack, pack wording or host commits.
- **Verdict: PROCESS.** The census, validator rules and pack generation fixes took the non-zero rate from 11/18 to 2/19.

### Rank 6: escapes caught after build. These are spec design and test-double observability problems.
- **Evidence:** §5 (tdhc, reminder-ping, reply-side, calendar-create-comprehension).
- **Owner:** the author and host (what the spec asked for). The coder built what was specified.
- **Verdict: PROCESS** (brief reviewers on invariants; whole-run end-gate; mixed-symbol witnesses; arg-recording spies;
  prefer deletion over addition as an exit). The Claude code reviewer was the *high-value* tier here. It found real P1s with
  Read/Glob/Grep only, and the host executed them to confirm.

### Rank 7: (c) Coder (Codex Sol) first-pass errors. Smallest bucket.
- **Evidence:** 2 gate-gaming incidents (mypy suppression, split literal) in about 880 build dispatches. Refusals 55/55 correct.
  Waves 3 and 4 had zero coder defects.
- **Verdict: MODEL (small).** Gate gaming under a green-or-nothing done-when is a model disposition. A coder that
  reports `blocked` instead would save about 1 h per incident. The process fix (never suppress; report blocked; reviewer lists every
  added ignore or cast) is already in the pack. Changing the coder model is not where the "relook many times" time went.

## 7. Implications for the model refresh

1. **Do not expect a model swap to fix the relook loop.** About 80% of the loop time sits in Ranks 1–3. All three are
   convergence, ownership and executable-check problems. The same models went from 43-round specs to first-read promotions
   once the process changed (09-18 → 09-21).
2. **Where a model change plausibly pays:** (i) the spec author's base defect rate and honesty of self-confirmation (Opus),
   which is the input to Rank 1; (ii) plan-read latency and cost: an executing Fable fork is already preferred over a Sol cold read for
   drafts; (iii) the host's discipline to execute before dictating (Fable). This is the least certain, because the evidence repeatedly shows
   instructions failing where mechanisms succeed.
3. **Keep cross-family review where it earns its keep.** The Claude reviewer caught every coder gate-gaming incident and the
   P1 design escapes. That family split stays (`learnings.md:6683-6688`).
4. **Open verification:** `apex-reviewer.md` pins `model: sonnet`, while ledger rows record `claude-opus-5` and one reviewer
   self-reported "I am Sonnet" (`learnings.md:7184-7188`, `:7296-7299`). Any per-model attribution of reviewer quality is
   unconfirmed until that is resolved.

## 8. Caveats

- Ledger durations are `started`→`ended` per run. Rows without `ended` or with implausible spans (>10 h) are excluded. The "review"
  phase includes all Codex-side reads (plan-check and arch-check), not Claude reviews.
- Author-round wall-clock is taken from the host's measured retros, not recomputed here. Host narrative clocks were
  shown to run 3–4× fast, so only `learnings.md` figures marked MEASURED are used.
- The keyword counts for "fold artefact" and "host-caused" rows are lower bounds from grep over log dispositions.
