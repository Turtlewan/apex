---
spec: adr032-predraft-architecture-pass
status: draft
risk: low
coder_effort: medium
autonomy_level: L2
---

# Spec: Pre-draft Sol architecture pass — ADR-032 amendment + apex-plan procedure

**Identity:** Adds a mandatory pre-draft Sol ARCHITECTURE pass over the host's plan brief for every Deep Details spec — the ADR-032 decision text, the dispatch recipe in the plan-check reference, and the trigger line in apex-plan's spec-authoring section.
<!-- → why: see docs/technical/adr/ADR-032-gpt56-role-split.md and docs/research/artemis-retro-2026-07-29.md § P4(b). -->

## Intent
- **Intent:** a Deep Details plan is architecture-reviewed by a cold Sol read BEFORE the spec author is dispatched, and the mechanism is written where the planning host actually reads it.
- **Invariants:** the post-readiness cold read stays COLD — no task, prompt, or doc line routes this pass's findings, the host's answers to them, or the fact that it ran into that read, and its prompt is instructed not to OPEN the sidecar either · the pre-draft pass never writes the plan or the spec · the pre-draft pass is mandatory for EVERY Deep Details spec with no economy exemption, while the post-readiness pass keeps its existing skip-trivial rule unchanged; neither substitutes for the other · this spec adds no new counter, row schema, or cap — it cites the Convergence-control terms the prerequisite spec ships, and the `— (pre-draft)` digest value is a VALUE convention inside that spec's existing row schema · every build edit is an INSERTION into BODY text with exactly one exception, named in Task 2(a): the single prompt-shape closing line rewritten in place. The apex-plan frontmatter `version` / `last_updated` lines are explicitly EXCEPTED from the insertion-only claim — the host bumps them at close-out, outside the build.
- **Non-goals:** any edit to the regions the prerequisite spec owns (§ Dispatched spec review, the readiness-gate fence, the plan-check paragraph, § Session start, § Closing the session, the cold-read dispatch recipe and effort bullets, `## Tier 1 deliberation`) — the cold read's prompt-SHAPE sentence block is NOT among them and is edited by Task 2(a) · restating the sidecar / round-lifecycle / cap definitions instead of citing them · an apex-governance edit · the spec template · the `SKILL-HISTORY.md` / `SKILLS.md` rows (host's pen at close-out) · changing the post-readiness cold read's effort or disposition.

## Assumptions
- The prerequisite spec `retro-planning-gates` has BUILT and its Convergence-control block is live in `apex-plan/SKILL.md`, so the terms this spec cites (`### Convergence control`, the row lifecycle, non-VOID reviewer-family rows, the plan-check EXEMPTion, pass-or-park) resolve to real text → impact: Stop
- Each task's files live in exactly ONE tree (`C:/users/user/apex` or `C:/Users/User/.claude`), because `codex exec -C <root>` takes a single root → impact: Stop
- All three target files are git-tracked in their tree (verified live 2026-07-30: `git ls-files --error-unmatch` returns each path), so the pure-insertion diff assertions are runnable → impact: Stop
- `codex-dispatch.ps1` accepts a free-string `-Task` and validates `-Effort` against `{low,medium,high,xhigh,max,ultra}` and `-Schema` against `{completion,endgate,review}` (verified live: param block lines 9-17, 59-60, 77-78) → impact: Caution
- `apex-plan/SKILL.md` is 246 physical lines before the prerequisite spec's additions (verified live 2026-07-30: `@(Get-Content <file>).Count` → 246), so a 5-line insertion stays well under the 500-line cap → impact: Low
- `apex-governance/SKILL.md` carries the heading `## Approval gate` (line 149) and its banner's final line is the literal `Approve? [y / n / edit]` — verified live 2026-07-30; the citation in the three inserted blocks uses that heading name → impact: Caution

Simplicity check: yes — considered putting the whole mechanism in the ADR only, with no procedure text. Rejected on a mechanical ground: the ADR is not loaded at planning time, and the only live pointer into the plan-check reference sits in the POST-readiness paragraph, so a pre-draft step described nowhere upstream of the author dispatch would never fire. The trigger line and the recipe are what make the decision executable; the ADR alone is doctrine with no caller.

## Prerequisites
- `retro-planning-gates` — **ordering edge, binding.** It owns `apex-plan/SKILL.md`'s § Dispatched spec review, readiness-gate fence, plan-check paragraph, § Session start and § Closing the session, and owns `references/sol-plan-check.md`'s prompt-construction lines 11-12, the `-Effort` flag on line 14, the effort bullets on lines 31-32, and an append inside `## Tier 1 deliberation`. This spec builds AFTER it and edits only regions that spec does not touch: § Writing the spec, the cold read's prompt-SHAPE sentence block (lines 20-25), and a new section appended at the END of the reference. **The ordering edge is what keeps Task 2(a) safe** — an out-of-order build would rewrite a prompt-shape line the prerequisite spec has not yet re-anchored. It also ships the sidecar and Convergence-control terms this spec cites rather than restates.
- Environment setup required: none.

## Files to Change
| File | Operation | Notes |
|------|-----------|-------|
| `C:/users/user/apex/docs/technical/adr/ADR-032-gpt56-role-split.md` | modify | Dated amendment banner + new `### 1b` decision subsection + one Consequences bullet (T1) |
| `C:/Users/User/.claude/skills/apex-plan/references/sol-plan-check.md` | modify | Sidecar exclusion into the cold read's prompt-shape closing line, T2(a); new `## Pre-draft architecture pass` section appended at END of file, T2(b) |
| `C:/Users/User/.claude/skills/apex-plan/SKILL.md` | modify | One trigger paragraph in § Writing the spec, FIRST block under the heading — above the author-dispatch paragraph (T3) |

Grep evidence (live tree, 2026-07-30):
- `grep -rn "arch-check" ~/.claude` → 0 hits. The task label is new and unclaimed; nothing keys off it.
- `grep -rn "sol-plan-check" ~/.claude --include=*.md` → 1 consumer hit, `apex-plan/SKILL.md:217` (a path pointer inside the post-readiness plan-check paragraph). It quotes no BODY text of the reference, so neither the appended section nor the one-line prompt-shape rewrite in T2(a) needs a consumer update — and that paragraph is the prerequisite spec's, not this one's.
- `grep -rnE "plan-check|plan check" ~/.claude/skills --include=*.md` → **9 hits in 3 files**: 4 in `apex-plan/references/sol-plan-check.md` (the file this spec edits — its own title and body), 4 in `apex-plan/SKILL.md` (`:170,216,217,221`), 1 in `apex-skill-author/references/agents-skills-projection.md:19` (a projection-table row naming the rubric, no gate text). Consumer scope on the corrected numbers: the only hits OUTSIDE the two files this spec already owns are that one projection row — no skill restates the gate, so no other file needs an amendment-following edit.
- `grep -rn "ADR-032" ~/.claude --include=*.md` → 11 hits across apex-code (3 references + SKILL.md sources), apex-governance (sources + a cross-family policy line), the spec template, `apex-plan/references/model-routing.md:101`, and apex-plan (sources + the plan-check paragraph). Every one is about the review-ROUTING or fallback-coder halves of the ADR; none restates §1's gate, so §1b lands without contradicting any of them.
- `grep -rn "ADR-032" /c/users/user/apex/docs/technical/adr` → 6 sibling ADRs (033, 034, 038, 042, 045) carry pointers/supersession notes to ADR-032's coder and escalation clauses only; none references §1, so the amendment needs no sibling banner.
- `git ls-files --error-unmatch` over the three target paths → all three tracked (`C:/Users/User/.claude` is a real git tree behind its blanket `*` ignore).

## Tasks
- [ ] **Task 1**: Amend ADR-032 — three pure insertions, no existing line reworded: (a) the dated amendment banner block below, inserted immediately after the existing fallback-coder banner block (the `> **Fallback coder amended by ...**` blockquote) and before `## Context`; (b) the `### 1b` subsection below, inserted after §1's last bullet (`- Skip for Light / Bug Fix modes ...`) and before the `### 2. Cross-model deliberation` heading; (c) the Consequences bullet below, appended as the last bullet of `## Consequences` — files: C:/users/user/apex/docs/technical/adr/ADR-032-gpt56-role-split.md — done when: all three blocks are present verbatim, §1's own heading and five bullets are byte-identical to their pre-edit text, and `git diff -U0` on the file shows no removed lines.

(a) — the amendment banner:

```
> **Amended 2026-07-30 (owner decision; Artemis-retro P4(b)):** every **Deep Details** spec also gets a **pre-draft architecture pass** — a cold Sol read of the HOST'S PLAN, dispatched BEFORE the spec author (§1b below). It is ADDITIONAL to the §1 post-readiness cold read, which is unchanged — still cold, still governed by §1's own rule. Procedure: `apex-plan/references/sol-plan-check.md` § Pre-draft architecture pass.
```

(b) — the new decision subsection:

```
### 1b. Pre-draft architecture pass (amendment, 2026-07-30)

For every **Deep Details** spec, before the `model: opus` spec author is dispatched (ADR-045),
dispatch a cold Sol read of the plan itself — there is no spec yet, and that is the point.

- **Mandatory for every Deep Details spec — no economy exemption** (owner decision, 2026-07-30).
  The asymmetry with §1 is deliberate and stands: §1's post-readiness read KEEPS its existing
  economy rule ("skip Light / Bug Fix modes and trivial single-domain specs") unchanged, and this
  pass does not inherit it.
- **Input = the plan brief ONLY:** a required **`risk:` field, assigned by the host at plan time**
  (the approval gate below keys off it), the problem statement, the proposed structure, and the file
  map (path + operation + one-line role), plus whatever repo evidence Sol reads for itself. Never
  the host's self-review notes, never prior reviewer findings.
- **Digest-bound, like every plan-check-family dispatch.** The prompt's FIRST line is
  `SPEC-DIGEST: <value>` — the literal `— (pre-draft)` sentinel on an initial pass; on a re-plan
  against a live draft, the real `git hash-object` of that draft, **and that draft is attached to
  the prompt after the brief**, because the hash must bind what the reviewer actually reads.
- **Output = schema'd BLOCK / FLAG / CLEAN findings scoped to ARCHITECTURE:** wrong decomposition,
  a structure that cannot produce the stated outcome, a missing or misplaced boundary, a file map
  that fights the repo's existing seams, a simpler structure that meets the same goal. Spec wording,
  criteria phrasing and task mechanics belong to the §1 read, not this one.
- **Effort `xhigh`.**
- **Disposition: advisory for routine specs, blocking for `risk: high`** — read from the brief's
  required `risk:` field. The blocking path is an **approval gate**, not an advisory review: on an
  unresolved arch-pass BLOCK for a `risk: high` plan the host prints the **apex-governance § Approval gate** banner and requires the explicit
  `Approve? [y / n / edit]` answer **BEFORE any spec-author dispatch**. No author is dispatched on
  that plan until the gate is answered. The host adjudicates every finding into the PLAN before
  drafting. **Sol never writes the plan and never edits the spec** (the §1 no-auto-amend rule,
  unchanged).
- **Independent of the §1 cold read; neither replaces the other.** The pre-draft pass is mandatory
  for every Deep Details spec; the post-readiness read runs per §1's existing rule (mandatory except
  its trivial-single-domain economy skip). They are separate dispatches. The §1 read **never receives this pass's findings, the
  host's answers to them, or any note that it ran** — the post-readiness first read stays cold
  (apex-governance § Evaluator independence). That extends to DISCOVERY, not just delivery: the §1
  cold-read prompt carries an explicit instruction **not to open `docs/drafts/*.review.log`**,
  because the sidecar carries prior findings — including this pass's.
- **Round record — ALWAYS.** This pass is plan-check FAMILY and every run leaves a row. When it
  dispatches, the host creates — or appends to — `docs/drafts/<short-name>.review.log` (the
  short-name is fixed at plan time, before any draft exists) with a normal row on apex-plan
  § Convergence control's terms: EXEMPT from the 3-round reviewer-family cap, bounded by the
  announced pass-or-park rule. The `Spec digest` cell carries the literal `— (pre-draft)` when no
  draft exists yet, or the real `git hash-object` digest when re-planning against a live draft.
  That is a VALUE CONVENTION inside the existing row schema — not a schema change — and it moves
  no counting rule. **While the cell holds the `— (pre-draft)` sentinel the digest-mismatch/VOID
  check is a DEFINED NO-OP:** there is no file to re-hash, so the check is inapplicable, not
  failed — and it reactivates the moment a real hash is recorded (a re-plan against a live draft).
- **A sidecar with no matching draft is NORMAL, never "abandoned".** Between this pass and the
  author's first draft, a sidecar without a `.md` sibling is the expected state; nothing
  auto-classifies it as abandoned and nothing sweeps it. A later plan reusing the same short-name
  APPENDS to the existing sidecar — lifetime records stay conservatively intact. Cleanup happens
  only at promotion to `docs/changes/` (the deletion step in apex-plan § Closing the session) or by
  explicit owner action.
```

(c) — the Consequences bullet:

```
- Up to two Sol dispatches per Deep Details spec (the second subject to §1's economy rule): the
  pre-draft architecture pass always, the post-readiness cold read per §1. Both draw the ChatGPT
  quota; the plan-check effort drop `max` → `xhigh` (retro P7(a)) offsets part of the added spend.
  Same watch item as §1: revisit effort before dropping a gate.
```

- [ ] **Task 2**: Two edits in the plan-check reference. **(a) Deliver the cold-read exclusion into the prompt-shape text itself** — inside `## The cold read (the gate)`, in the prompt-shape sentence block (live lines 20-25, between the closing `powershell` fence and the `- **Input = spec + repo evidence only.**` bullet), replace the closing line `the spec, do not rewrite it."*` with `the spec, do not rewrite it. Do not open docs/drafts/*.review.log."*`. That block is free of the prerequisite spec: `retro-planning-gates`' regions in this file are the prompt-construction lines 11-12, the `-Effort` flag on line 14, the effort bullets on lines 31-32, and an append inside `## Tier 1 deliberation` — verified live 2026-07-30 against its Task 1(c)/(d) bodies. This is the ONLY in-place line rewrite in this spec. **(b) Append the `## Pre-draft architecture pass` block below to the END of the file** — after its last existing line (the closing line of `## Tier 2 — blind dual-draft`), inserting nothing else above it, so every other pre-existing section keeps its text and its order — files: C:/Users/User/.claude/skills/apex-plan/references/sol-plan-check.md — done when: the prompt-shape sentence carries the exclusion, the appended block is the file's last section, every pre-existing heading keeps its relative order, and `git diff -U0` on the file shows EXACTLY ONE removed line — the pre-edit prompt-shape closing line.

````
## Pre-draft architecture pass (ADR-032 §1b)

Runs BEFORE the spec author is dispatched, on EVERY Deep Details spec — additional to the cold read
above, never a replacement. Same wrapper, same read-only Sol; different input, different lens: it
judges the PLAN, and no spec exists yet. **The cold read's skip-trivial economy rule does NOT apply
here:** this pass has no exemption, while that rule stays unchanged for the cold read itself.

```powershell
# $planBrief = a REQUIRED `risk:` field (host-assigned at plan time) + problem statement +
#   proposed structure + file map (path, operation, one-line role). Nothing else: no host
#   self-review notes, no prior reviewer findings.
# ROW FIRST, THEN DISPATCH — create or append docs/drafts/<short-name>.review.log with the
#   plan-check-family row, carrying the same digest value used below.
$digest = '— (pre-draft)'   # initial pass: no draft exists, so there is nothing to hash
# Re-plan against a LIVE draft instead: $digest = (git hash-object <draft>), and APPEND that draft
#   to $prompt after the brief — the hash must bind what the reviewer actually reads.
$prompt = "SPEC-DIGEST: $digest`n`n" + "<prompt below>" + "`n`n---`nPLAN BRIEF:`n`n" + $planBrief
& "$env:USERPROFILE\.claude\skills\apex-code\scripts\codex-dispatch.ps1" `
  -Spec <short-name> -Task 'arch-check' -Phase review -Worktree <project-repo> `
  -BaseSha <repo HEAD> -Schema review -Effort xhigh -SkipScopeCheck -Prompt $prompt
# Exit contract (codex-dispatch.ps1:1793-1795, :2052-2053): 0 = CLEAN · 68 = done_with_concerns
#   (FLAG-only) · 67 = BLOCK. Findings are in the printed .final report path.
# Concurrent read-only checks into one repo: add -AllowSharedWorktree
#   -AllowSharedWorktreeReason 'concurrent read-only plan-checks; no writes possible'.
```

Prompt shape: *"You are an independent architecture reviewer. What follows is a PLAN, not a spec —
no spec has been written yet. Review the proposed structure against the repo for: wrong
decomposition, a structure that cannot produce the stated outcome, missing or misplaced boundaries,
a file map that fights the repo's existing seams, and simpler structures that meet the same goal.
Findings as BLOCK (the plan will build the wrong thing) / FLAG (planning should decide) / CLEAN,
each with file/line + rationale. Judge the plan, do not write it."*

- **Disposition:** advisory for routine specs; **blocking for `risk: high`**. The blocking path is
  an **approval gate**: on an unresolved arch-pass BLOCK for a `risk: high` plan, print the
  **apex-governance § Approval gate** banner and get the explicit `Approve? [y / n / edit]` answer
  **BEFORE any spec-author dispatch**. Adjudicate findings into the PLAN before dispatching the
  author. Sol never writes the plan and never edits the spec.
- **The cold read stays cold.** Never pass this pass's findings, the host's answers to them, or the
  fact that it ran into the post-readiness dispatch above — evaluator independence. The pre-draft
  pass is mandatory for every Deep Details spec; the post-readiness read runs per §1's existing rule
  (mandatory except its trivial-single-domain economy skip). Neither substitutes for the other.
- **The cold-read prompt excludes the sidecar — discovery, not just delivery.** The prompt shape in
  § The cold read above now ends with `Do not open docs/drafts/*.review.log.` The sidecar carries
  prior findings, this pass's among them, so a cold reader that opens it is no longer cold.
- **Round record — ALWAYS.** Plan-check FAMILY. Every arch-check dispatch creates or appends to
  `docs/drafts/<short-name>.review.log` (short-name fixed at plan time) with a normal row on
  apex-plan § Convergence control's terms — EXEMPT from the 3-round reviewer-family cap, bounded by
  pass-or-park. `Spec digest` = the literal `— (pre-draft)` when no draft exists yet, or the real
  `git hash-object` digest when re-planning against a live draft: a value convention inside the
  existing row schema, not a schema change, and no counting rule moves. **While the cell holds the
  `— (pre-draft)` sentinel the digest-mismatch/VOID check is a DEFINED NO-OP** — no file exists to
  re-hash, so the check is inapplicable, not failed — and it reactivates the moment a real hash is
  recorded.
- **A sidecar with no matching draft is NORMAL, never "abandoned".** Between this pass and the
  author's first draft, a `.review.log` with no `.md` sibling is the expected state: nothing
  auto-classifies it as abandoned and nothing sweeps it. A later plan reusing the same short-name
  APPENDS to the existing sidecar — lifetime records stay conservatively intact. Cleanup happens
  only at promotion to `docs/changes/` (§ Closing the session's deletion step) or by explicit owner
  action.
- **Dispatch is digest-bound.** The prompt's first line is `SPEC-DIGEST: <value>` — the sentinel on
  an initial pass, the real `git hash-object` of the draft on a re-plan, with that draft attached to
  the prompt after the brief so the hash binds what the reviewer actually reads.
````

- [ ] **Task 3**: Add the trigger to apex-plan § Writing the spec — insert the paragraph below as its own paragraph immediately after the `## Writing the spec` heading line and its following blank line, so it PRECEDES the paragraph that begins `Template:` and contains `Resolve the open decisions, then dispatch a` spec-author worker; reading order must match execution order, and the pass runs before the author is dispatched. Change nothing else in the file, and in particular touch no line in § Dispatched spec review, the readiness-gate fence, the plan-check paragraph, § Session start or § Closing the session — files: C:/Users/User/.claude/skills/apex-plan/SKILL.md — done when: the paragraph is the FIRST prose block under § Writing the spec and sits above the author-dispatch paragraph, the file is under its 500-line cap, and `git diff -U0` on the file shows no removed lines.

```
**FIRST, before you dispatch the author (Deep Details only): the pre-draft Sol architecture pass** —
a cold `gpt-5.6-sol` read of the PLAN BRIEF (problem statement, proposed structure, file map), not
of a spec. ADR-032 §1b; recipe in `references/sol-plan-check.md` § Pre-draft architecture pass.
Advisory by default; for `risk: high` it is an **approval gate** — an unresolved BLOCK means you
print the **apex-governance § Approval gate** banner and get the explicit `Approve? [y / n / edit]`
answer BEFORE any spec-author dispatch. Adjudicate its findings into the plan before drafting. It
never replaces the post-readiness cold read below, and that read never sees its output.
```

## Wave plan
Wave 1: [Task 1, Task 2] | Wave 2: [Task 3]

<!-- TWO trees, not three: Task 1 is the apex tree; Tasks 2 and 3 are BOTH in the ~/.claude tree, so
     they are sequenced across waves rather than dispatched concurrently into one worktree. Task 1
     is tree-disjoint from both and joins wave 1. No task reads another's output — each body carries
     verbatim the text it inserts, including the section name Task 3 points at. -->

## Permissions

The following NON-CRITICAL actions will run autonomously during build. Approving this spec approves all of them.
Critical paths — .env · migrations · auth/authz/crypto · CI config · dependency manifests and lockfiles · infra-as-code · secrets/keys/certs · host-state (the live `status.md`, root AGENTS.md, root CLAUDE.md, docs/changes/, docs/handoff/, the run ledger) · the permission settings and the hooks — are NEVER pre-authorised by this section. They need a live attended confirmation at build time, and an AFK run parks them (D3, ADR-046; apex-governance is canonical). (Sole exception: the docs agents' three host's-pen artifacts — the handoff, the live `status.md`, and spec archival — under D6.)
docs/audit/ is different and stricter: TIER-1, refused outright on a path match. No confirmation authorises a write there — not attended, not by any switch, not by this section. (D5's append-only exception is doctrine pending a content-aware classifier change; it is not a live permission.)

### File Operations
| Action | Paths |
|--------|-------|
| Create | (none) |
| Modify | `C:/users/user/apex/docs/technical/adr/ADR-032-gpt56-role-split.md` · `C:/Users/User/.claude/skills/apex-plan/references/sol-plan-check.md` · `C:/Users/User/.claude/skills/apex-plan/SKILL.md` |
| Delete | (none) |

### Commands
| Command | Purpose |
|---------|---------|
| `Select-String -Path <file> -Pattern <regex>` | Every per-task done-when and acceptance-criteria assertion |
| `@(Get-Content <file>).Count` | Line-cap check, physical lines (`SKILL.md` ≤500). `Measure-Object -Line` undercounts and is NOT authorized. |
| `git -C <tree> diff -U0 -- <file>` · `git -C <tree> status` · `git -C <tree> ls-files` | Read-only pure-insertion and scope assertions in both trees. No staging, no commit, no branch operation. |
| The `~/.claude` tree's AGENTS.md verify recipe | Enumerated verbatim in the second fence below — the builder runs exactly those six |
| The spec validator, exact invocation | Enumerated verbatim in the third fence below |

**Scope-lock note (host vs builder).** The `~/.claude` recipe is BUILDER-runnable and every builder-side acceptance criterion is satisfiable inside the permissions declared here. The apex-tree recipe is **HOST-executed at close-out, outside any build dispatch's scope lock** — it reads the live `status.md` and the root CLAUDE.md, which no dispatch may pull into scope. Same convention as the sibling retro specs.

```bash
# apex tree — AGENTS.md ## Verify commands — HOST-EXECUTED AT CLOSE-OUT, not by any dispatch
wc -l ~/.claude/skills/apex-*/SKILL.md | sort -rn | head -3
grep -roE '~/\.claude/skills/apex-[a-z-]+' ~/.claude/skills/ | sort -u
wc -l docs/status.md
wc -l ~/.claude/CLAUDE.md
wc -c AGENTS.md
```

```
# ~/.claude tree — AGENTS.md ## Verify commands — BUILDER-RUN
node --check hooks/destructive-command-guard.js
node --check hooks/lib/destructive-detect.js
python hooks/destructive-guard-test.py
powershell.exe -NoProfile -File skills/apex-code/scripts/baseline-check-test.ps1
powershell.exe -NoProfile -File skills/apex-code/scripts/spec-validate-test.ps1
powershell.exe -NoProfile -File skills/apex-code/scripts/dispatch-preflight-test.ps1
```

```
# The spec validator, exact invocation (HOST-executed at close-out on this spec file)
powershell.exe -NoProfile -File "$env:USERPROFILE\.claude\skills\apex-code\scripts\apex-spec-validate.ps1" -SpecPath "C:\users\user\apex\docs\drafts\adr032-predraft-architecture-pass.md"
```

### Git Operations
| Operation | Scope |
|-----------|-------|
| (none — the host commits) | |

### Environment Access
| Variable | Purpose |
|----------|---------|
| (none) | |

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
| Skill history | SKILL-HISTORY.md (apex tree) | Host-pen row for **apex-plan**, dated the close-out date: `SKILL.md` (the § Writing the spec trigger) + `references/sol-plan-check.md` (the cold-read prompt exclusion and the new pre-draft section), Event `updated`, Sources citing ADR-032. The host also bumps the apex-plan frontmatter `version` / `last_updated` in the `~/.claude` tree at close-out — the one edit excepted from this spec's insertion-only claim. |
| Skill index | SKILLS.md (apex tree) | Host-pen check: confirm the apex-plan index line still describes the skill accurately once the trigger and the new reference section land; update only if it no longer does |
| ADR | ADR-032-gpt56-role-split.md (apex tree) | **Build-written, not host-pen** — Task 1 amends it in place as a dispatched task; it is the decision record for this change, and no new ADR number is taken |
| Changelog | (none) | Skill-system change; the skill-history registry is the record |

Routing rationale: the two registry rows are host-pen at close-out because this spec's scope lock is exactly the three files in `## Files to Change`, and the double-write happens after the build closes — not because the coder cannot reach them. ADR-032 is the deliberate exception: it is a dispatched task in the apex tree, inside the scope lock.

## Acceptance Criteria
- [ ] **Task 1** → verify (banner + subsection): `Select-String` over `adr/ADR-032-gpt56-role-split.md` finds a blockquote line containing `Amended 2026-07-30` and `pre-draft architecture pass`, and a heading line exactly `### 1b. Pre-draft architecture pass (amendment, 2026-07-30)`; the `### 1b` block contains `plan brief ONLY`, `Effort \`xhigh\``, `advisory for routine specs, blocking for \`risk: high\``, and `Sol never writes the plan and never edits the spec`.
- [ ] **Task 1** → verify (independence + discovery): inside the `### 1b` block, `Select-String` finds a bullet stating the §1 read never receives this pass's findings, the host's answers, or any note that it ran, naming `apex-governance § Evaluator independence`; a sentence stating the pre-draft pass is mandatory for every Deep Details spec while the post-readiness read runs per §1's existing rule, and that neither substitutes for the other; and the DISCOVERY sentence stating the §1 cold-read prompt carries an explicit instruction not to open `docs/drafts/*.review.log`.
- [ ] **Task 1** → verify (approval gate): the `### 1b` Disposition bullet names `apex-governance § Approval gate`, carries the literal `Approve? [y / n / edit]`, and states the gate is answered `BEFORE any spec-author dispatch` for an unresolved arch-pass BLOCK on a `risk: high` plan. A bullet that says only "blocking" without the banner citation and the before-dispatch precondition FAILS this criterion.
- [ ] **Task 1** → verify (sentinel no-op): the `### 1b` round-record bullet states that while the `Spec digest` cell holds the `— (pre-draft)` sentinel the digest-mismatch/VOID check is a DEFINED NO-OP — inapplicable, not failed, because there is no file to re-hash — and that it reactivates the moment a real hash is recorded.
- [ ] **Task 1** → verify (round record cites, does not restate): the `### 1b` round-record bullet names `§ Convergence control`, `EXEMPT`, the `3-round reviewer-family cap` and `pass-or-park`, states the row is written on EVERY run (`ALWAYS`) into `docs/drafts/<short-name>.review.log`, and gives the `Spec digest` value convention — the literal `— (pre-draft)` with no draft, the real `git hash-object` digest on a re-plan — calling it a value convention inside the existing row schema, NOT a schema change. Negative half, scoped: `Select-String` over that bullet finds no `pending` and no per-column table, and `VOID` appears EXACTLY ONCE — in the sentinel no-op sentence (`digest-mismatch/VOID check is a DEFINED NO-OP`), which is its one legitimate mention. A second `VOID` occurrence, or one outside that sentence, fails.
- [ ] **Task 1** → verify (mandatory vs skip-trivial asymmetry): the `### 1b` block contains a bullet stating the pass is mandatory for every Deep Details spec with `no economy exemption`, AND that §1's post-readiness read keeps its existing skip-trivial rule unchanged; separately, §1's own `Skip for Light / Bug Fix modes ... trivial single-domain specs` bullet is still present and byte-identical.
- [ ] **Task 1** → verify (risk field + digest binding): the `### 1b` input bullet names a required `risk:` field assigned by the host at plan time, and the Disposition bullet states the gate reads it; a separate bullet states the prompt's FIRST line is `SPEC-DIGEST: <value>` with the `— (pre-draft)` sentinel on an initial pass and the real `git hash-object` on a re-plan, AND that the draft is attached to the prompt after the brief.
- [ ] **Task 1** → verify (orphan rule, no sweep promise): the `### 1b` block contains the bullet stating a sidecar with no matching draft is NORMAL between the pass and the author's first draft, is never auto-classified as abandoned, that a later plan reusing the same short-name APPENDS to the existing sidecar, and that cleanup happens only at promotion or by explicit owner action; `Select-String` over the whole `### 1b` block for `doc-coverage` and for `swept` returns NOTHING.
- [ ] **Task 1** → verify (Consequences + pure insertion): `## Consequences` ends with a bullet containing `Up to two Sol dispatches per Deep Details spec`, the parenthetical `the second subject to §1's economy rule`, and `xhigh`; `git -C C:/users/user/apex diff -U0 -- docs/technical/adr/ADR-032-gpt56-role-split.md | Select-String '^-[^-]'` returns nothing; the §1 heading `### 1. Sol plan-check gate (apex-plan, after the readiness gate)` and its `Skip for Light / Bug Fix modes` bullet are both still present.
- [ ] **Task 2** → verify (section present and correct): `Select-String` over `references/sol-plan-check.md` finds the heading `## Pre-draft architecture pass (ADR-032 §1b)`, and within it `-Task 'arch-check'`, `-Effort xhigh`, `-Schema review`, `-Phase review`, `PLAN BRIEF:`, the prompt-shape sentence containing `a PLAN, not a spec`, and the three bullets (`Disposition:`, `The cold read stays cold.`, `Round record.`).
- [ ] **Task 2(a)** → verify (exclusion is IN the cold read's own prompt shape): `Select-String` over `references/sol-plan-check.md` finds `Do not open docs/drafts/*.review.log.` on a line whose `LineNumber` is GREATER than the `## The cold read (the gate)` heading and LESS than the `- **Input = spec + repo evidence only.**` bullet — i.e. inside the prompt-shape sentence block, NOT in the appended section. A hit only inside `## Pre-draft architecture pass` FAILS this criterion. The same line still ends the prompt-shape quote (`do not rewrite it.` precedes it on that line).
- [ ] **Task 2** → verify (placement is last, prerequisite text intact, one-line rewrite only): the `LineNumber` of `## Pre-draft architecture pass` is GREATER than the `LineNumber` of `## Tier 2` and of every other `^## ` heading in the file; the headings `## The cold read (the gate)`, `## Disposition`, `## Tier 1 deliberation`, `## Tier 2` still appear in that order; and `git -C C:/Users/User/.claude diff -U0 -- skills/apex-plan/references/sol-plan-check.md | Select-String '^-[^-]'` returns EXACTLY ONE line — the pre-edit prompt-shape closing line ending `do not rewrite it."*`. Two or more removed lines fail.
- [ ] **Task 2** → verify (sidecar append is IN the written procedure): within the `## Pre-draft architecture pass` section, `Select-String` finds the sidecar append stated as a step of the dispatch itself — the recipe block carries a `ROW FIRST, THEN DISPATCH` line naming `docs/drafts/<short-name>.review.log` and the literal `— (pre-draft)` digest value, and the `Round record — ALWAYS.` bullet repeats it as prose. A section describing the pass without the sidecar step FAILS this criterion.
- [ ] **Task 2** → verify (cites, does not restate): the `Round record — ALWAYS.` bullet names `§ Convergence control`, `EXEMPT`, `pass-or-park`, and `<short-name>.review.log`, states the row is written on every run, and gives both `Spec digest` values (`— (pre-draft)` / real `git hash-object` digest) as a value convention, not a schema change; `Select-String` over the new section returns no `Row lifecycle` and no `3 rounds per spec LIFETIME` restatement.
- [ ] **Task 2** → verify (sentinel no-op): the same bullet states the digest-mismatch/VOID check is a DEFINED NO-OP while the cell holds the `— (pre-draft)` sentinel (inapplicable, not failed) and reactivates on a real hash. Scoped negative: within the appended section `VOID` appears EXACTLY ONCE, in that sentence.
- [ ] **Task 2** → verify (orphan rule, no sweep promise): the appended section carries the bullet stating a sidecar with no matching draft is NORMAL, never auto-classified as abandoned, that a same-short-name re-plan APPENDS to the existing sidecar, and that cleanup happens only at promotion (§ Closing the session's deletion step) or by explicit owner action; `Select-String` over the appended section for `doc-coverage` and for `swept` returns NOTHING.
- [ ] **Task 2** → verify (exit-code contract + digest binding in the recipe): the recipe fence states `0 = CLEAN`, `68 = done_with_concerns` (FLAG-only) and `67 = BLOCK`, citing `codex-dispatch.ps1:1793-1795, :2052-2053`; and it sets `SPEC-DIGEST: $digest` as the prompt's first line with `— (pre-draft)` as the initial value plus the re-plan branch that uses `git hash-object` AND appends the draft to the prompt after the brief.
- [ ] **Task 2** → verify (mandatory, no economy exemption): the appended section's opening paragraph states the pass runs on EVERY Deep Details spec and that the cold read's skip-trivial economy rule does NOT apply to it while staying unchanged for the cold read; the pre-existing intro sentence of the file (`skip only trivial single-domain specs`) is untouched.
- [ ] **Task 2** → verify (risk field): the recipe fence's `$planBrief` comment names a REQUIRED `risk:` field assigned by the host at plan time, and the `Disposition:` bullet keys the approval gate off it.
- [ ] **Task 2** → verify (approval gate): the section's `Disposition:` bullet names `apex-governance § Approval gate`, carries the literal `Approve? [y / n / edit]`, and states the answer is required `BEFORE any spec-author dispatch`.
- [ ] **Task 2** → verify (the appended section cross-references the delivered exclusion): the section's cold-read bullet states the prompt shape above now carries `Do not open docs/drafts/*.review.log.` and gives the reason (the sidecar holds prior findings, this pass's among them). This is a cross-reference; the criterion that the instruction actually LANDED in the prompt shape is the Task 2(a) criterion above.
- [ ] **Task 3** → verify (placement, reading order = execution order): in `apex-plan/SKILL.md`, the `LineNumber` of the line containing `the pre-draft Sol architecture pass` is GREATER than that of the heading `## Writing the spec` and **LESS than** that of the line containing `Resolve the open decisions, then dispatch a` — the trigger precedes the author-dispatch paragraph, it is not merely inside the section; the paragraph contains `ADR-032 §1b`, `PLAN BRIEF`, and the clause that the post-readiness cold read never sees its output.
- [ ] **Task 3** → verify (approval gate cited in the trigger): the same paragraph names `apex-governance § Approval gate`, carries the literal `Approve? [y / n / edit]`, and states the answer is required `BEFORE any spec-author dispatch` on an unresolved BLOCK for `risk: high`.
- [ ] **Task 3** → verify (no collision with the prerequisite spec, cap): `git -C C:/Users/User/.claude diff -U0 -- skills/apex-plan/SKILL.md | Select-String '^-[^-]'` returns nothing, and the same diff's added-line hunks all fall inside the § Writing the spec line range — no hunk touches `## Dispatched spec review`, the readiness-gate fence, the plan-check paragraph, `## Session start`, or `## Closing the session`; `@(Get-Content <file>).Count` ≤ 500.
- [ ] **Whole spec, BUILDER side** → verify (satisfiable inside the declared permissions alone): `git -C C:/users/user/apex status --porcelain` and `git -C C:/Users/User/.claude status --porcelain` together show exactly the three files above as modified by this build (pre-existing dirt named in the report, untouched); and the `~/.claude` tree's six AGENTS.md verify commands, enumerated in `## Permissions`, all pass. No builder criterion reads the live `status.md` or the root CLAUDE.md.
- [ ] **Whole spec** → verify (no unconditional both-passes-mandatory phrasing survives): `Select-String -Path <this spec> -Pattern '[Bb]oth (passes )?(are )?mandatory|Two mandatory'` returns exactly ONE line — this criterion's own line, which carries the pattern literally. Any other hit, in a task body or an inserted block, contradicts §1's preserved trivial-single-domain economy rule and fails.
- [ ] **Whole spec, HOST close-out** → verify (outside the dispatch scope lock): the apex-tree AGENTS.md verify recipe, enumerated in `## Permissions`, passes — including its `status.md` and CLAUDE.md line-cap reads; and the exact validator invocation in the third `## Permissions` fence, run on this spec file, exits 0.

## Progress
_(The build writes here — do not edit manually)_
