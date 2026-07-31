---
spec: retro-planning-gates
status: draft
risk: medium
coder_effort: medium
autonomy_level: L2
---

# Spec: Planning-side retro gates — reachability, review convergence, digest binding, Files-to-Change evidence, review effort xhigh

**Identity:** Applies the Artemis-retro P3 / P4(a) / P4(e) / P6 / P7(a) planning-side changes to apex-plan's readiness gate and review loop, the spec template, and the two review-dispatch recipes.
<!-- → why: see docs/research/artemis-retro-2026-07-29.md (P-sections, Sol-amended). -->

## Intent
- **Intent:** the planning gates catch shipped-but-not-wired boundaries, spec review converges inside 3 rounds per spec lifetime, and no verdict is adjudicated against text it never read.
- **Invariants:** the round counter lives OUTSIDE the draft file (a re-draft cannot reset it) · a review verdict is bound to a spec digest recorded before dispatch and re-checked at adjudication · deny-unknown-fields is never mandated by any gate · the frontmatter key name `declared_runtime_paths` is frozen and its CHECKING side is not implemented here · no wrapper, pre-flight, hook, or script file is edited by this spec.
- **Non-goals:** the wrapper-side declared-runtime-paths check and every other wrapper change (sibling spec `retro-wrapper-hygiene`) · the validator corpus/migration sweep (sibling spec `retro-validator-versioning`) · the P4(b) pre-draft Sol architecture pass (needs an ADR-032 amendment, user-owned) · retro P1 / P2 / P5 / P7(b,c) items · changing the coding-side `coder_effort` default · changing the BUILD-side review effort, which stays `high`.

## Assumptions
- The three target files carry the anchors quoted in the task bodies verbatim (`apex-plan/SKILL.md` readiness-gate fence at ~L193-214, § Dispatched spec review at ~L166-183, plan-check paragraph at ~L216; `references/sol-plan-check.md` L14 + L31; the template's `## Permissions` boilerplate at ~L96) → impact: Stop
- The sibling spec `retro-wrapper-hygiene` uses the identical frontmatter key spelling `declared_runtime_paths` (list) → impact: Stop
- No other pending spec edits these three files in the same batch → impact: Caution
- `git hash-object` is available in every planning session's shell and works on untracked files → impact: Low

Simplicity check: yes — considered leaving the round counter in the draft's own frontmatter (no sidecar). Rejected on a mechanical ground, not taste: a digest recorded inside the file it hashes is invalidated by the act of recording it, and a fresh drafter rewrites the frontmatter, which is exactly the reset Sol's amendment forbids. One sidecar carries both facts.

## Prerequisites
- `retro-wrapper-hygiene` — ownership edge, not an ordering edge. It owns every wrapper / pre-flight / script file, including the CHECKING side of `declared_runtime_paths`. The two specs are file-disjoint and may build in either order.
- `retro-validator-versioning` — reverse edge: THIS spec owns the spec template outright (a confirmed collision), so that sibling no longer touches it. Its contract-document pointer line ships here as Task 3(d); the sibling depends on this spec for that line and must not edit the template itself.
- Environment setup required: none.

## Files to Change
| File | Operation | Notes |
|------|-----------|-------|
| `C:\Users\User\.claude\skills\apex-plan\SKILL.md` | modify | Readiness-gate checkboxes + plan-check effort word (T1); § Dispatched spec review digest step, convergence block, session-start parenthetical, closing-session teardown (T2) |
| `C:\Users\User\.claude\skills\apex-plan\references\sol-plan-check.md` | modify | SPEC-DIGEST prompt header, effort `xhigh`, sidecar/exemption bullets, Tier-1 deliberation binding (T1) |
| `C:\Users\User\.claude\skills\apex-orchestrate\templates\spec-template.md` | modify | Reachability slot, `declared_runtime_paths:` key, Permissions-boilerplate reword, contract pointer line (T3) |

Grep evidence (live tree, 2026-07-30):
- `grep -rn "spec-template" ~/.claude/skills --include=*.md --include=*.ps1 --include=*.js` → 2 hits: `apex-orchestrate/SKILL.md:55` (author-dispatch contract), `apex-plan/SKILL.md:105` (template pointer). Both are pointers to the path; neither quotes template BODY text, so the template edits need no consumer update.
- `grep -rn "sol-plan-check" ~/.claude/skills --include=*.md` → 1 skill hit: `apex-plan/SKILL.md:217` (pointer); `apex-plan/SKILL.md:216` separately restates `effort max`, so it is in scope (T4).
- `grep -rni "effort" <the three target files + codex-review.md>` → the complete max/high set is `apex-plan/SKILL.md:216`, `sol-plan-check.md:14`, `sol-plan-check.md:31`, `codex-review.md:30`. Only the first three are in scope: `codex-review.md:30` is the BUILD-side review and stays `-Effort high` (host adjudication — the retro's duration evidence is plan-check outliers; the effort bakeoff revisits review effort with data). `apex-plan/SKILL.md:161` and `spec-template.md:14` are `coder_effort` (build side) and stay untouched.
- `grep -n "status" <template>` → the `## Permissions` critical-paths boilerplate at ~L96 and the D6 exception sentence at ~L96 both carry the literal `docs/status.md`, a slash+`.md` token inside the `Permissions` section that FILES-COMPLETENESS scans; every spec derived from the template inherits the failure (reproduced: this draft failed the validator on exactly those two tokens before the same reword was applied here) → T5.
- `grep -rn "apex-spec-validate" ~/.claude` → the validator is invoked from `apex-plan/SKILL.md:191` (gate backstop) and `codex-dispatch.ps1:1046` (pre-flight); its regression suite is `spec-validate-test.ps1` in the same scripts directory.
- `grep -rn "declared_runtime_paths" ~/.claude` → 0 hits; the key is new and unclaimed.

## Tasks
- [ ] **Task 1**: The gate lines and the plan-check dispatch recipe — (a) insert the three checkboxes below into the apex-plan readiness-gate fence, immediately after the `[ ] Sufficiency` entry and before `[ ] Batch-joinable`, matching the block's existing two-column alignment; (b) in `SKILL.md` change the L216 phrase `schema'd, effort max —` to `schema'd, effort xhigh —`; (c) in `references/sol-plan-check.md` change the L14 flag `-Effort max` to `-Effort xhigh`, prepend the digest header to the prompt construction at L11-12, and replace the L31-32 effort bullet with the two bullets below; (d) extend that file's `## Tier 1 deliberation` protocol per the third block below — files: `C:\Users\User\.claude\skills\apex-plan\SKILL.md`, `C:\Users\User\.claude\skills\apex-plan\references\sol-plan-check.md` — done when: the gate fence carries the three entries verbatim with the pre-existing entries unchanged, no DEFAULT `max` remains on either plan-check path (the explicit per-spec upward override to `max` stays legal and is stated as such), and all three blocks below are in place.

```
[ ] Reachability  — every exposed boundary this spec adds or changes carries a SPEC-LEVEL
                    reachability criterion (one per boundary is fine) naming the wiring that makes
                    it reachable from a real caller. NEVER per task — entry wiring spans tasks, and
                    a shared integration file per task manufactures the file overlap that kills
                    wave parallelism. Typed client/server boundary → the criterion's mechanism is a
                    ROUND-TRIP test (encode → transport → decode → assert field equality), which is
                    what catches a silent DTO drop. deny-unknown-fields is a per-repo choice; this
                    gate never mandates it. Like Coverage and Sufficiency, this line is LLM-JUDGED
                    at gate time — apex-spec-validate.ps1 does not and cannot enforce it.
[ ] Files evidence— the author GREPPED the live tree before listing ## Files to Change: a
                    `Grep evidence:` line under the table records each pattern run and its hit
                    count, for consumers of every changed file and for every path listed. Prose
                    assurance ("checked the tree", "verified paths") FAILS this line — the check is
                    for the evidence, not the claim. LLM-judged, like the line above.
[ ] Review rounds — the spec's review-round sidecar shows FEWER THAN 3 non-VOID reviewer-family
                    rows (`pending` rows count; completed Disposition=VOID rows do not — § Row
                    lifecycle) before any further apex-spec-reviewer dispatch. At 3
                    that dispatch is refused and the spec routes to the closed-fix-list fresh-draft
                    path (§ Dispatched spec review → Convergence control), which also owns the
                    same-path/no-rename constraint. The mandatory Sol plan-check is EXEMPT from this
                    count and still runs on the post-cap path.
```

(c) — the plan-check dispatch recipe in `references/sol-plan-check.md`:

```powershell
$digest = (git hash-object <spec-path>)   # record this in the round row BEFORE dispatching
$prompt = "SPEC-DIGEST: $digest`n`n" + "<prompt below>" + "`n`n---`nSPEC:`n`n" + (Get-Content -Raw <spec-path>)
```

```
- Effort `xhigh` — the standing DEFAULT (retro P7(a); the drop from `max` pre-authorized in this
  file has been taken, and xhigh's named use case is review). A per-spec rubric may still override
  UPWARD to `max` for a known-hard spec — that remains legal; never below `xhigh`.
- Every plan-check dispatch appends its own digest-bound row to
  `docs/drafts/<short-name>.review.log` (apex-plan § Convergence control). Plan-check rows are
  EXEMPT from the 3-round reviewer-family cap — the plan-check is mandatory and must stay available
  after the cap — but the `SPEC-DIGEST` header line is still mandatory, and a verdict whose digest
  no longer matches at adjudication is VOID. Plan-check repair cycling is bounded by the announced
  pass-or-park rule, not by that cap.
```

(d) — appended to `## Tier 1 deliberation`:

```
Every deliberation dispatch — `codex exec resume` or the fresh-dispatch fallback — appends its own
digest-bound row to the same `docs/drafts/<short-name>.review.log`, carrying the `SPEC-DIGEST` line
and auto-VOIDing on a digest mismatch exactly as the cold read does. The ≤2-round Tier 1 cap
(ADR-015) still bounds deliberation. **No plan-check-family dispatch may occur outside the sidecar
record** — an unrecorded round is a protocol violation, not a shortcut.
```

- [ ] **Task 2**: Wire the convergence machinery into apex-plan § Dispatched spec review — (a) add the `### Convergence control` subsection below, inserted after the line `Every BLOCK resolved in the spec; every FLAG resolved or explicitly accepted with reasoning.`; (b) add the two-sentence digest step below to the apex-spec-reviewer DISPATCH paragraph (the one beginning `Dispatch \`apex-spec-reviewer\` (Agent tool). Pass \`spec\``), so the Claude-side path is digest-bound too; (c) amend § Session start item 2 so sidecars are not mistaken for drafts; (d) add the sidecar-deletion step to § Closing the session — files: `C:\Users\User\.claude\skills\apex-plan\SKILL.md` — done when: all four edits are present verbatim, session-start item 2 reads `2. Read \`docs/drafts/\` — unfinished specs (\`*.review.log\` sidecars are review-round records, not drafts).`, and the § Closing the session Deep-Details bullet gains `delete the spec's \`<short-name>.review.log\` sidecar (host's pen — the round record dies with the promotion)` in its move-the-spec step. Extension constraint: the sidecar is NOT `.md` — a Markdown sibling in the drafts directory would be picked up as a spec by spec tooling (the validator corpus/migration sweep in `retro-validator-versioning`), and `.log` is on the validator's exempt-extension list.

(b) — appended to the apex-spec-reviewer dispatch paragraph:

```
**Before dispatching, the host runs `git hash-object <draft>`, writes the value into the round's
sidecar row, and passes it as the FIRST line of the reviewer prompt: `SPEC-DIGEST: <sha>`.** At
adjudication the host re-runs `git hash-object <draft>`; if it no longer matches the recorded row,
the verdict is VOID and its findings are discarded unread (§ Convergence control).
```

(a) — the new subsection:

```
### Convergence control — 3 rounds, per SPEC LIFETIME

Every reviewed spec gets a **review-round record**: a sidecar `docs/drafts/<short-name>.review.log`
(deliberately not `.md` — spec tooling must never pick it up), created by the HOST at round 1, never
by the author or the reviewer, deleted when the spec promotes to `docs/changes/`. One row per round:

| Round | Dispatched (UTC) | Reviewer | Spec digest | Verdict | Disposition |

**One ROUND = one review PASS**, however many lenses that pass dispatches in parallel: a 3-lens
apex-spec-reviewer fan-out is ONE row, and the `Reviewer` cell carries the comma-joined lens list
(`security, migration safety, mechanism`). The Sol plan-check is its own pass and gets its own row.

**Row lifecycle — TWO PHASES. This is the single definition; every rule below refers to it.**
1. **At DISPATCH** the host APPENDS the row with `Round`, `Dispatched (UTC)`, `Reviewer` (the lens
   list), and `Spec digest` filled, and `Verdict` / `Disposition` both set to `pending`.
2. **At ADJUDICATION**, and only after ALL lenses of that pass have returned, the host COMPLETES the
   same row: `Verdict` = worst-of, `Disposition` = the outcome.

**Cap semantics, in the same breath:** a `pending` row COUNTS toward the <3 precondition — so a
second dispatch launched while the first is still out cannot slip past the cap — and a COMPLETED row
with `Disposition = VOID` does not count. Everything else counts. "Non-VOID rows" below means exactly
this: every row except a completed VOID one.

**Multi-lens aggregation** (phase 2 of the lifecycle): adjudication waits for ALL lenses of the pass,
then writes `Verdict` = WORST-OF its lenses (BLOCK > FLAG > CLEAN). If ANY lens returns against a
digest that no longer matches, the WHOLE row completes as VOID — no partial adjudication, no
cherry-picking a clean lens — and, being a completed VOID row, it does not count.

- **Cap: 3 rounds per spec LIFETIME — apex-spec-reviewer FAMILY only.** The counter is the sidecar's
  count of non-VOID reviewer-family rows as defined by the lifecycle above (`pending` counts, a
  completed VOID does not); it lives outside the draft, so a re-draft does not reset it. Reviewer-family rounds 4+ are not dispatched. The Sol plan-check appends its
  own digest-bound row and is EXEMPT from this count (it is mandatory at the gate and must stay
  available after the cap); its own cycling is bounded by the announced pass-or-park rule.
- **Host precondition — read before you dispatch.** Before ANY reviewer-family dispatch, the host
  READS `docs/drafts/<short-name>.review.log` and counts its non-VOID reviewer-family rows per the
  lifecycle definition (`pending` rows included). **At ≥3 the dispatch is REFUSED** — no reviewer is
  launched — and the spec routes to the post-cap path below. A missing sidecar means round 1: append
  the phase-1 row, then dispatch.
- **The post-cap path is not a dead end.** Fresh draft against the closed fix-list → readiness gate
  → Sol cold read (still mandatory, still dispatched) → promotion. An exhausted reviewer-family cap
  never blocks that path; it only stops further apex-spec-reviewer passes.
- **Same-path constraint.** A post-cap fresh draft MUST target the identical
  `docs/drafts/<short-name>.md`. Renaming a spec while it is under review is PROHIBITED, because the
  sidecar is keyed by the name and a rename silently resets the counter. If a rename is truly
  required, it is a manual carry-over step: MOVE the sidecar alongside the spec, keeping its rows —
  never recreate it, never start a new one.
- **At the cap**, stop reviewing and hand a FRESH drafter a **CLOSED fix-list**: the exact
  unresolved findings as of round 3, frozen. No new lenses, no additions after handoff. The next
  draft is graded against that list and the readiness gate only.
- **Write barrier — an explicit gate precondition.** A round is dispatched only AFTER the
  completion notification for the last edit to the draft has arrived. Never dispatch while an
  author or editor worker on that draft is in flight; a mid-edit read is the known VOID-round cause.
- **Digest binding** (the two lifecycle phases, again): in phase 1 the host runs
  `git hash-object <draft>` and writes the value into the row's `Spec digest` cell as it appends the
  row, then passes the SAME value as the first line of the review prompt: `SPEC-DIGEST: <sha>`. In
  phase 2 the host re-runs `git hash-object <draft>` and compares it to that cell. **Mismatch → the
  verdict is VOID**: the findings are discarded unread, the row COMPLETES with Disposition
  `VOID (digest moved)`, and — as a completed VOID row — it does not count against the cap; the write
  barrier, not the cap, is what stops cycling. Never adjudicate a verdict whose digest did not match.
- **Recorded residual.** The digest binds the file the HOST hashed at dispatch, not the exact bytes
  the reviewer read; a path-based reviewer could in principle read a file edited in between. The
  write barrier plus hash-at-dispatch / re-hash-at-adjudication closes the practical race. Byte-proof
  would need reviewer-side hashing, which a read-only Agent-tool reviewer cannot return — accepted.
```

- [ ] **Task 3**: Own the spec template outright — four edits, one file: (a) the commented `declared_runtime_paths:` key block below, in the frontmatter after the `max_parallel_codex` block; (b) the reachability slot below, at the end of the `## Acceptance Criteria` section; (c) in the `## Permissions` boilerplate, replace the token `docs/status.md` with the backticked bare form `` `status.md` `` in BOTH places it appears (the critical-paths sentence and the D6 sole-exception sentence), changing nothing else in that paragraph — it is the FILES-COMPLETENESS collision every derived spec inherits; (d) one VERSION-LESS pointer line directly under the `# Spec: {title}` heading block reading `<!-- Governing contract: references/spec-contract.md (the validator's contract doc owns the version; never restate a number here). -->` — files: `C:\Users\User\.claude\skills\apex-orchestrate\templates\spec-template.md` — done when: all four edits are present, the `## Permissions` section contains no slash-bearing `.md` token, its two sentences still name host-state and the D6 exception with the same meaning, the surrounding critical-path list is byte-identical apart from those two substitutions, and the pointer line carries no version number of any kind.

```
# declared_runtime_paths:    # optional — repo-relative paths this build depends on at RUNTIME that
#   - path/to/runtime/asset  #   git may not track; the dispatch pre-flight checks DECLARED paths only
#                            #   (a check cannot discover an undeclared invisible dependency).
```

```
<!-- Reachability (readiness-gate item): SPEC-LEVEL, or one line per exposed boundary — never per
     task. Name the wiring, not the mechanism. Typed client/server boundary → ROUND-TRIP test.
     deny-unknown-fields is a per-repo choice, never mandated by this slot. -->
- [ ] Reachability — {boundary/entry point} is reached end-to-end from {real caller} → verify:
      {the wiring test/command — for a typed boundary, the ROUND-TRIP test asserting field equality}
```

## Wave plan
Wave 1: [Task 2, Task 3] | Wave 2: [Task 1]

<!-- The only real predecessor is Task 2: its § Convergence control block is the anchor that Task 1's
     `[ ] Review rounds` gate line and its plan-check pointer both cite. Task 1 absorbs the whole
     plan-check recipe and Task 3 the whole template precisely so no same-file pair needs an
     artificial ordering; Task 3 is independent of both. -->


## Permissions

The following NON-CRITICAL actions will run autonomously during build. Approving this spec approves all of them.
Critical paths — .env · migrations · auth/authz/crypto · CI config · dependency manifests and lockfiles · infra-as-code · secrets/keys/certs · host-state (the live `status.md`, root AGENTS.md, root CLAUDE.md, docs/changes/, docs/handoff/, the run ledger) · the permission settings and the hooks — are NEVER pre-authorised by this section. They need a live attended confirmation at build time, and an AFK run parks them (D3, ADR-046; apex-governance is canonical). (Sole exception: the docs agents' three host's-pen artifacts — the handoff, the live `status.md`, and spec archival — under D6.)
docs/audit/ is different and stricter: TIER-1, refused outright on a path match. No confirmation authorises a write there — not attended, not by any switch, not by this section. (D5's append-only exception is doctrine pending a content-aware classifier change; it is not a live permission.)

### File Operations
| Action | Paths |
|--------|-------|
| Create | Acceptance-suite fixtures only, OUTSIDE the repo, under `$env:TEMP\apex-spec-probe\`: `probe-spec.md` (from the edited template) and `probe-spec-pre-edit.md` (from the pre-edit template, for the prove-it-goes-red step). Deleted by the same step that creates them. |
| Modify | `C:\Users\User\.claude\skills\apex-plan\SKILL.md` · `C:\Users\User\.claude\skills\apex-plan\references\sol-plan-check.md` · `C:\Users\User\.claude\skills\apex-orchestrate\templates\spec-template.md` |
| Delete | The two probe fixtures and their root, all under `$env:TEMP\apex-spec-probe\`: `probe-spec.md`, `probe-spec-pre-edit.md`, then the `apex-spec-probe` directory itself. Nothing inside either repo tree. |

### Commands
| Command | Purpose |
|---------|---------|
| `powershell.exe -NoProfile -File spec-validate-test.ps1` (cwd = the apex-code scripts directory) | Run the validator regression suite unchanged |
| `powershell.exe -NoProfile -File apex-spec-validate.ps1 -SpecPath <spec>` (same cwd) | Validate this spec and both probe fixtures |
| `git hash-object <file>` | Compute a spec digest when exercising the round record |
| `git status` | Confirm the reverted reference file is untouched |
| `Select-String` (read-only) over: the three changed files listed above · the two probe fixtures under the temp root · and the UNCHANGED verification target `codex-review.md` in the apex-code references directory, which the whole-spec criterion reads to prove it was not modified | Every acceptance-criteria assertion |
| `New-Item` / `Copy-Item` / `Remove-Item` scoped to the probe directory named above | Create and tear down the two probe fixtures |

The governing verify suite for this repo pair (root AGENTS.md `## Verify commands`) runs unchanged and in full; approving this spec approves all six:

```
node --check hooks/destructive-command-guard.js
node --check hooks/lib/destructive-detect.js
python hooks/destructive-guard-test.py
powershell.exe -NoProfile -File skills/apex-code/scripts/baseline-check-test.ps1
powershell.exe -NoProfile -File skills/apex-code/scripts/spec-validate-test.ps1
powershell.exe -NoProfile -File skills/apex-code/scripts/dispatch-preflight-test.ps1
```

### Git Operations
| Operation | Scope |
|-----------|-------|
| (none — the host commits) | |

### Environment Access
| Variable | Purpose |
|----------|---------|
| `$env:TEMP` | Root for the `apex-spec-probe` fixture directory — the only write location outside the three changed files |

### Network
| Action | Purpose |
|--------|---------|
| (none) | |

## Specialist Context
### Security
(none)

### Performance
(none)

### Accessibility
(none)

## Documentation
| Doc type | File | Action |
|----------|------|--------|
| Skill history | SKILL-HISTORY.md | **Host's pen at spec close-out — not a build task.** Two rows dated the close-out date, newest first: apex-plan (`SKILL.md` + `references/sol-plan-check.md`, version `2.3.0`, Event `updated`) and apex-orchestrate (`templates/spec-template.md`, Version `— (template only)`), Sources citing the retro research doc. The host also bumps the apex-plan frontmatter `version` / `last_updated` at close-out. |
| ADR | (none) | No new architectural decision — the retro doc is the ratified source; the P4(b) ADR-032 amendment is explicitly out of scope |
| Changelog | (none) | Skill-system change; the skill-history registry is the record |

## Acceptance Criteria
- [ ] **Task 1** → verify (gate lines): `Select-String` over `apex-plan/SKILL.md` finds `[ ] Reachability`, `[ ] Files evidence`, and `[ ] Review rounds` inside the readiness-gate fence, plus `ROUND-TRIP test` and `Grep evidence:` in that fence; the Reachability entry carries the `LLM-JUDGED` calibration sentence naming the validator as NOT enforcing it; the Review-rounds entry states `FEWER THAN 3 NON-VOID reviewer-family` and the Sol-plan-check EXEMPTION; `deny-unknown-fields` matches only never-mandated phrasing.
- [ ] **Task 1** → verify (effort): `Select-String -Pattern 'Effort max|effort max'` over `apex-plan/SKILL.md` and `references/sol-plan-check.md` returns nothing; `Select-String -Pattern 'xhigh'` over the reference returns both the dispatch flag and the DEFAULT bullet, and that bullet states the per-spec upward override to `max` remains legal.
- [ ] **Task 1** → verify (plan-check binding): `Select-String` over `references/sol-plan-check.md` finds `SPEC-DIGEST: $digest` in the dispatch snippet, a bullet stating plan-check rows are EXEMPT from the reviewer-family cap while the digest header stays mandatory, and — inside the `## Tier 1 deliberation` section specifically — the deliberation-binding text containing `SPEC-DIGEST`, the ≤2-round cap, and `No plan-check-family dispatch may occur outside the sidecar record`.
- [ ] **Task 2** → verify: `Select-String` over `apex-plan/SKILL.md` finds the heading `### Convergence control — 3 rounds, per SPEC LIFETIME`, plus `SPEC-DIGEST:`, `git hash-object`, `CLOSED fix-list`, `Write barrier`, and `does NOT consume the cap`; the sidecar path `<short-name>.review.log` appears with an explicit "created by the HOST" clause and the not-`.md` rationale; session-start item 2 mentions `*.review.log`; a `Select-String` for the old dot-review-dot-md spelling returns nothing.
- [ ] **Task 2** → verify (cap precondition + no-rename): the Convergence-control block contains a bullet stating the host READS the sidecar and counts NON-VOID reviewer-family rows before ANY reviewer-family dispatch, with `REFUSED` at `≥3`; and a bullet stating a post-cap fresh draft targets the identical drafts-directory path `<short-name>.md`, that renaming under review is `PROHIBITED`, and that a required rename MOVES the sidecar with its rows rather than recreating it.
- [ ] **Task 2** → verify (family scoping + no deadlock): the cap bullet names the apex-spec-reviewer FAMILY and marks the Sol plan-check EXEMPT; a separate bullet spells the post-cap path `fresh draft → readiness gate → Sol cold read → promotion` and states the exhausted cap does not block it.
- [ ] **Task 2** → verify (Claude-side path is digest-bound): extract the paragraph that begins `Dispatch \`apex-spec-reviewer\` (Agent tool). Pass \`spec\`` and confirm the digest step is INSIDE that extracted region — it contains `git hash-object`, `SPEC-DIGEST:`, and `VOID`. A hit elsewhere in the file does not satisfy this criterion.
- [ ] **Task 2** → verify (round definition + aggregation): the block states one ROUND = one review PASS regardless of parallel lens count, ONE row per pass with a comma-joined `Reviewer` cell, the Sol plan-check on its own row, that adjudication waits for ALL lenses with `Verdict` = worst-of (BLOCK > FLAG > CLEAN), and that one mismatched-digest lens VOIDs the WHOLE row.
- [ ] **Task 2** → verify (row lifecycle is stated once and referenced, not restated three ways): the block contains a single `Row lifecycle` definition — phase 1 APPENDS at dispatch with Round / Dispatched (UTC) / Reviewer / Spec digest and `Verdict` + `Disposition` = `pending`; phase 2 COMPLETES the same row after ALL lenses return — plus the cap sentence stating a `pending` row COUNTS toward the <3 precondition and a completed `Disposition = VOID` row does not. Then confirm the cap bullet, the host-precondition bullet, the multi-lens bullet, the digest-binding bullet, and the `[ ] Review rounds` gate line each REFER to that definition rather than redefining it, and that no passage contradicts it.
- [ ] **Task 2** → verify (recorded residual): the digest-binding bullet list ends with the residual line naming the write barrier plus hash-at-dispatch / re-hash-at-adjudication as the practical closure and reviewer-side hashing as the unavailable byte-proof.
- [ ] **Task 2** → verify (sidecar teardown): the § Closing the session Deep-Details bullet names deleting `<short-name>.review.log` on promotion to `docs/changes/`, attributed to the host.
- [ ] **Task 3** → verify: the template's frontmatter contains a commented `declared_runtime_paths:` key with exactly one line of usage doc and NO checking logic; the `## Acceptance Criteria` section ends with a `Reachability` slot naming ROUND-TRIP; `Select-String` over the whole template for `deny-unknown-fields` matches only never-mandated phrasing; the version-less contract pointer line (naming the `spec-contract.md` reference) sits under the title block, and `Select-String -Pattern '\d+\.\d+' ` over that line returns nothing.
- [ ] **Task 3** → verify (boilerplate collision): `Select-String` over the template's `## Permissions` section finds no slash-bearing `.md` token, while `status.md` appears twice in backticked bare form; "host-state" and "sole exception" are still present in those two sentences.
- [ ] **Task 3** → verify (validator contract, per a read of `apex-spec-validate.ps1`): build `probe-spec.md` in the probe directory from the EDITED template with `{...}` placeholders filled, run the validator on it → exit 0 with no `FAIL FILES-COMPLETENESS` naming the status-doc token; build `probe-spec-pre-edit.md` from the PRE-EDIT template the same way and confirm it reproduces that finding — prove it goes red first. Exit 0 is expected because FILES-COMPLETENESS scans only the `Files to Change`, `Tasks` (`files:` segment), `Acceptance Criteria`, and `Permissions` sections (script lines ~245-266) — frontmatter is never scanned — and STRUCTURE checks a fixed eleven-heading list plus four non-empty-section rules (lines ~343-420) that the new slot and pointer line leave intact.
- [ ] **Task 3** → verify (no regression): run `spec-validate-test.ps1` → exit 0, output shows no failing case.
- [ ] **Whole spec** → verify: the six root-AGENTS.md verify commands all pass; the validator on this spec file exits 0; `Select-String -Pattern 'deny-unknown-fields'` over all three changed files matches only never-mandated phrasing; and the apex-code reference `codex-review.md` is unmodified — `git status` shows it untouched and `Select-String -Pattern 'Effort'` over it still returns `-Effort high`.

## Progress
_(The build writes here — do not edit manually)_
