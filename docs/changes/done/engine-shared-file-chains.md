---
spec: engine-shared-file-chains
status: draft
autonomy_level: L2
risk: medium
coder_model: codex
coder_effort: high
max_parallel_codex: 3
---

# Spec: Engine shared-file chains
<!-- Governing contract: skills/apex-code/references/spec-contract.md (the validator's contract doc owns the version; never restate a number here). -->

**Identity:** Add declared sequential shared-file chains to manifest validation and Engine planning, with comment-safe Intent risk scanning.

## Intent
Declared chains let sequential tasks on one file use the Engine by dispatching their combined work to one coder.
Only exact canonical file identities may be shared; ancestor/descendant overlaps remain ineligible for Engine execution.
Chain contraction must preserve an acyclic dependency graph, task instructions, acceptance checks, and durable plan compatibility.
Unchained validation and unchained plans/prompts retain their existing behavior, apart from the explicit contract-version bump and Intent comment fix.
HTML comments do not declare Intent risk; the original Intent still travels to prompts unchanged.
Owner-approved split waiver: ten build files, one concern, one wave; routing/template edits are single-line replacements, and the contract reference stays with documentation.
Non-goals: parallel execution within a chain, multi-repo Engine support, HOST manual-path mechanics, task-state semantics beyond the merged task, or changes to apex-engine.ps1.

## Assumptions
- The build root is the checkout/worktree of the build repository into which each task is dispatched. Every build path below is relative to that root; its absolute location may differ from the manifest's canonical repo root. No task checks cwd against that canonical location. -> impact: Stop if the dispatched tree lacks the named files.
- The source anchors are `Get-EnginePlan`, `Get-EngineTaskDeclarations`, `Get-EngineAcceptanceLines`, the validator's `EXEC-MANIFEST` block, and schema `properties.plan.oneOf[0].properties.waves.items.properties.tasks.items`. -> impact: Stop if an anchor is absent.
- Windows PowerShell 5.1 and the current build-root `AGENTS.md` verification commands are available to HOST natively. -> impact: Stop if unavailable; do not substitute a sandboxed engine-test run.
- `skills/apex-code/SKILL.md` has 500 lines at dispatch. Its single-line routing replacement must preserve that count. -> impact: Stop if the baseline differs.
- HOST captures the integration base SHA, existing dirty/untracked paths in both repositories, and the corpus TSV hash before building. -> impact: Stop if those baselines are unavailable at HOST verification.

Simplicity check: three file-disjoint coder tasks in one wave; apply the split waiver declared in Intent. HOST bookkeeping stays outside the manifest.

## Prerequisites
none

## Files to Change
| File | Operation | Notes |
|------|-----------|-------|
| skills/apex-code/scripts/engine-plan.ps1 | modify | Validate and contract chains; filter comments for risk scanning only |
| skills/apex-code/scripts/engine-plan-test.ps1 | modify | Chain, schema, compatibility, and Intent regressions; focused test selector |
| skills/apex-code/references/engine-state-schema.json | modify | Optional plan-task members array |
| skills/apex-code/scripts/apex-spec-validate.ps1 | modify | Add chain contract and bump validator contract to 1.3.0 |
| skills/apex-code/scripts/spec-validate-test.ps1 | modify | Chain contract and legacy compatibility regressions; focused test selector |
| skills/apex-code/references/spec-contract.md | modify | Contract 1.3.0 and execution-manifest chain rules |
| skills/apex-code/SKILL.md | modify | Eligibility/manual routing replacement; exactly 500 lines |
| skills/apex-code/references/parallel-codex.md | modify | Declared-chain eligibility and undeclared-sharing manual routing |
| skills/apex-orchestrate/templates/spec-template.md | modify | Manifest authoring guidance for declared chains |
| skills/apex-orchestrate/SKILL.md | modify | Undeclared-sharing HOST manual routing |
| C:/Users/User/apex/SKILL-HISTORY.md | modify | HOST H1: one event row for each affected skill |
| C:/Users/User/apex/CHANGELOG.md | modify | HOST H2: Unreleased Changed bullet |

## Execution manifest
<!-- One entry per coder task. HOST tasks stay outside the manifest. -->
```json apex-manifest
{
  "version": 1,
  "repos": { "claude": "C:/Users/User/.claude" },
  "tasks": [
    {
      "id": "1", "repo": "claude", "effort": "high",
      "files": [
        { "path": "skills/apex-code/scripts/engine-plan.ps1", "op": "modify" },
        { "path": "skills/apex-code/scripts/engine-plan-test.ps1", "op": "modify" },
        { "path": "skills/apex-code/references/engine-state-schema.json", "op": "modify" }
      ],
      "depends_on": []
    },
    {
      "id": "2", "repo": "claude", "effort": "high",
      "files": [
        { "path": "skills/apex-code/scripts/apex-spec-validate.ps1", "op": "modify" },
        { "path": "skills/apex-code/scripts/spec-validate-test.ps1", "op": "modify" }
      ],
      "depends_on": []
    },
    {
      "id": "3", "repo": "claude", "effort": "medium",
      "files": [
        { "path": "skills/apex-code/references/spec-contract.md", "op": "modify" },
        { "path": "skills/apex-code/SKILL.md", "op": "modify" },
        { "path": "skills/apex-code/references/parallel-codex.md", "op": "modify" },
        { "path": "skills/apex-orchestrate/templates/spec-template.md", "op": "modify" },
        { "path": "skills/apex-orchestrate/SKILL.md", "op": "modify" }
      ],
      "depends_on": []
    }
  ]
}
```

## Tasks
- [ ] **Task 1** — Contract chains in the planner and preserve durable plan shape — files: skills/apex-code/scripts/engine-plan.ps1, skills/apex-code/scripts/engine-plan-test.ps1, skills/apex-code/references/engine-state-schema.json — done when: the Task 1 tagged check passes, the planner regression cases below are implemented in this task's test file, and members is optional in the plan-task schema.

  1. In `Get-EnginePlan`, restructure the existing task loop (currently lines 793-854) into pass 1: per-member validation/parsing into member records; contraction: merge chains into tasks; pass 2: rebuild ownership/index collections from merged tasks as in step 5. Pass 1 retains path-shape, Git-metadata-segment, `.gitattributes`, op, duplicate-ID, and effort/weight checks, including the per-member `weight > MaxParallel` refusal (currently line 814), and retains the `$pathOwner` duplicate-path ownership refusal at its current position in the per-task loop (currently lines 827-831), preserving the first refusal reason for every manifest. The only change to pass-1 ownership handling is that a second listing of a canonical path does not refuse when the current owner and the new task have the same non-empty `chain` value; record those shared listings for contraction. All other duplicate-path listings retain the existing refusal at that position. Retain per-source-task duplicate-path rejection using a member-local canonical-path set. Retain declaration parsing and original-ID acceptance binding before contraction. Parse optional manifest `chain` without string coercion: a present value must be a string matching the case-sensitive regex `^[a-z0-9][a-z0-9-]*$`; null, empty, whitespace, uppercase, arrays, and numbers refuse. Keep chain names in planner-local metadata; do not emit a `chain` property on plan tasks.
  2. Add a planner-local chain-order/contraction helper after pass 1 and before the pass-2 `$pathOwner` ownership checks. Group members by exact chain name, using normalized task IDs. Within each group, exactly one member has zero in-chain dependencies, every other member has exactly one, and each member has at most one in-chain successor. Walk successors from the head and require that the walk visits every member exactly once. Additional out-of-chain dependencies remain permitted. A single-member chain is valid. Reject multiple heads, branches, joins, disconnected members, cycles, and additional non-predecessor in-chain edges. These checks must also run when the supplied `ValidatorPath` is a permissive test stub.
  3. Group file identities with `ConvertTo-EngineCanonicalManifestPath` and ordinal case-insensitive comparison. For a path listed by multiple members of one chain, require the first listing in chain order to use `create` or `modify`, and every subsequent listing to use `modify`. Refuse first-member `delete`, later `delete`, and later `create`. A path used by just one member keeps any currently valid op, including `delete`. Preserve per-source-task duplicate-path rejection before unioning.
  4. Emit one merged task per chain, at the first encountered manifest position occupied by that chain; its `id` is the chain head's ID, even when manifest order differs from chain order. Union `files` in chain order, preserving file order within each member, first spelling, and first op for repeated canonical identities. Emit `members` as ordered normalized member-ID strings, including for a single-member chain. Leave `members` absent on unchained tasks.
  5. For each merged task, set `depends_on` to the stable union of member dependencies outside its own chain. Rewrite every dependency on any chain member to that chain's merged ID, including references from other chains; de-duplicate in first-seen order. Remove only dependencies internal to that same chain. In pass 2, rebuild `$taskById`, `$pathOwner`, `$operations`, and `$allPaths` from the resulting tasks in their emitted order, preserving file order. Run the existing duplicate-path refusal on these resulting tasks, then the existing overlap loop and later checks unchanged, including `Test-EnginePathOverlap` ancestor/descendant refusal across all distinct resulting paths, including paths within a merged task. Preserve the directory, regular-file-ancestor, reparse-point, Git-metadata, authorization, and existence guards. Unchained manifests must produce byte-identical plans outside the explicit Intent comment-risk fix.
  6. Only when at least one manifest task carries `chain`, after pass 1 and before chain ordering, contraction, or any dependency rewriting, run the existing unknown/self-dependency validation against the original member IDs (currently lines 867-873), preserving `task <id> has an invalid dependency <dependency>` and rejecting unknown IDs before any rewriting. Then check the original, uncontracted graph: if cyclic, return the existing generic message `execution manifest dependency graph contains a cycle`. Only when that original graph is acyclic and the contracted graph is cyclic, return `chain <name> requires interleaving with task <id>` before the existing generic wave-layer cycle refusal, naming an involved chain and an original task outside that chain on the cycle. For multiple candidates, use manifest encounter order. Exercise `1 -> 2` as a chain, external Task 3 depending on 1, and Task 2 depending on 3. For a manifest with no `chain`, do not run these checks early: retain today's check order exactly (path overlap, filesystem and git-status guards, then the cycle check last; currently lines 857-964), including the existing positions of unknown/self-dependency validation, so its refusal reason is unchanged.
  7. Set merged `effort` to the maximum resolved member effort in `low < medium < high < xhigh < max < ultra`; resolve absent member effort using existing frontmatter/default behavior first. The merged task's slot weight is 2 when its merged effort is `ultra`, otherwise 1 (the same rule as the existing planner, currently line 813). Preserve the pass-1 per-member MaxParallel refusal. Set `text` to parts in chain order joined with exactly one blank line (PowerShell ``"`n`n"``). Each part is exactly the header line `Part <k> (Task <id>):` with one-based k, then ``"`n"``, then that member's declaration text; add no other separators or trimming. Set `done_when` to the members' non-empty parsed `done_when` values in chain order joined with exactly `; then `; skip empty values. A member with no `done when:` match yields `''` under the existing parser, and the merged result is `''` when all values are empty.
  8. Stable-union `acceptance` strings and `acceptance_checks` in member order. Preserve each check's `id`, `label`, and `body`, attributing its `task` to the merged ID; preserve distinct check IDs even if bodies match. Spec-level checks remain spec-level. Generate the merged prompt/digest through `New-EnginePrompt` after contraction. Unchained task ordering, fields, acceptance, prompts, and serialization remain byte-identical for unchanged inputs outside the comment-risk fix.
  9. At the Intent risk-scan loop in `Get-EnginePlan`, start from the full spec text, not the already-extracted Intent body. Create a scan-only copy of the full spec text by removing every complete `<!-- ... -->` span with a non-greedy, single-line-mode regex, including spans across lines and multiple spans on a line. Leave an unterminated `<!--` and everything after it as-is. Extract the `## Intent` section from that comment-stripped full text using the same section-extraction function, then apply the existing non-goal exclusion and risk regex to that extracted scan-only Intent. Do not replace `$intent` in plan metadata or prompt inputs, alter spec digest input, or strip comments from section data used elsewhere.
  10. In `engine-state-schema.json`, add `members` to `properties.plan.oneOf[0].properties.waves.items.properties.tasks.items.properties` as `{ "type": "array", "items": { "type": "string" } }`. Do not add it to `required`, relax `additionalProperties: false`, or add chain state/status fields.
  11. In `engine-plan-test.ps1`, extend `New-Task`/`New-SpecText` fixture construction to express chain metadata and one Files-to-Change row per identically spelled shared file (after `/` normalization) with its first member's op. Valid chain fixtures must use identical shared-path spellings; keep the planner's canonical merge unchanged as defence in depth only. Add optional `[switch]$ChainsOnly`, default off. The focused branch runs only new fast chain/Intent/schema cases, retains failure counting, cleanup and nonzero failure exit, and skips the legacy suite. The default invocation runs both existing and new cases. Use the existing permissive validator fixture for defence-in-depth negatives; include a real-validator compatible positive fixture in the default suite using a modify/modify shared path. Task 1's worktree does not contain Task 2's validator changes, so a create/modify chain would hit today's operation-mismatch rule until integration; exercise create/modify with the permissive fixture in Task 1.
  12. Add regression assertions for: two-member shared-create/modify and shared-modify/modify chains; an additional unique file and unique delete; reversed manifest order and a shared path first listed after the head; single-member and multiple independent chains; external dependencies and dependents of head/non-head rewired; maximum effort including resolved defaults; byte-exact merged text built as ``('Part 1 (Task 1):' + "`n" + $member1Text + "`n`n" + 'Part 2 (Task 2):' + "`n" + $member2Text)``, with no extra separators or trimming; byte-exact done_when expectations `@('first', 'second')` -> `'first; then second'`, `@('', 'second')` -> `'second'`, `@('first', '', 'second')` -> `'first; then second'`, `@('first', '')` -> `'first'`, and `@('', '')` -> `''`, including a member with no `done when:` match; unioned acceptance and check attribution, members and generated prompt/digest. Assert schema `members` type/items/optionalness and that every merged plan-task property name exists in schema properties. Add negative cases for every shape/op refusal above, case-variant shared identities, sharing outside a chain, ancestor/descendant paths within and across chains, unknown/self-dependencies checked on original IDs, original cycles retaining the generic cycle message, and contracted-graph interleaving only for an acyclic original graph. Add an unchained manifest with both an ancestor/descendant path overlap and a dependency cycle; assert that it still refuses with today's first reason, the overlap message. Add an unchained manifest where Tasks 1 and 2 both modify one file and Task 3 has effort `ultra`, with `MaxParallel 1`; assert the existing duplicate-path message, not the weight message. Add same-line/multiline Intent comment cases containing `risk: high`; specifically, with frontmatter risk medium, Intent containing `<!-- risk: high` + newline + `## hidden heading` + newline + `-->` followed by plain prose with no risk declaration must plan successfully. Assert unchanged comment-bearing Intent in prompts, visible prose `risk: high` still refusing a medium frontmatter, and an unterminated `<!--` followed by prose `risk: high` still refusing. Add an embedded pre-change unchained fixture expectation for serialized plan and prompt bytes, normalizing only temporary fixture-root values identically in expected/actual output; retain raw prompt-digest assertions. Keep fixture expectations inside this test file.

- [ ] **Task 2** — Add additive chain validation under EXEC-MANIFEST — files: skills/apex-code/scripts/apex-spec-validate.ps1, skills/apex-code/scripts/spec-validate-test.ps1 — done when: the Task 2 tagged check passes, chain and legacy regression cases are implemented in this task's test file, and the validator reports contract 1.3.0.

  1. Change `$SpecContractVersion` from `1.2.0` to `1.3.0`. Inside `EXEC-MANIFEST`, use `Test-ManifestObjectProperty`/`Get-ManifestObjectProperty` to distinguish absent `chain` from present null. Require present values to be strings matching `^[a-z0-9][a-z0-9-]*$` case-sensitively; report `FAIL EXEC-MANIFEST` with task identity for invalid values. Store optional chain metadata on the internal `$manifestTasks` records without changing manifest ID/declaration equality, Files completeness, ordinary task dependency validation, or finding order for legacy inputs.
  2. Immediately after `$manifestTaskById` is built (currently around line 996), before file-record operation comparisons, build exact-name chain groups and derive order by in-chain predecessor/successor edges using only dependency IDs present in `$manifestTaskById`. Require one head, exactly one immediate in-chain predecessor on every other member, no branching successor, and a walk visiting all members once. Permit outside dependencies and a single-member chain. Report violations with the chain name using `Add-Finding -Check 'EXEC-MANIFEST'`; for a chain with a shape violation, skip its first-op exception and retain ordinary operation comparisons. Keep the existing unknown-dependency finding loop at its current position (currently lines 1152-1158), preserving legacy finding order; do not move that loop ahead of the chain computation or file checks.
  3. Add a small validator helper for the new chain rules that canonicalizes paths exactly as `ConvertTo-EngineCanonicalManifestPath` (engine-plan.ps1, currently lines 125-132): split on `/`, trim trailing `.` and ` ` from each segment, lowercase invariant, then rejoin with `/`. Use this canonical form for chain shared-path detection, first-listing op, later-member modify, shared-delete refusal, and the step-4 chain overlap comparisons. Preserve repo-root qualification for identities across repo keys. Use the helper only in the new chain rules; leave `ConvertTo-ManifestIdentity`, existing file/row identities, and all existing validator identity rules unchanged. When two members of the same chain list paths equal under this planner-canonical form but not equal as written after `/` normalization (ordinal, case-sensitive comparison), emit an EXEC-MANIFEST finding with the exact text `chain <name> lists one file with different spellings: <a>, <b>`, substituting the chain name and the two slash-normalized spellings in chain order. Identical spellings are the only permitted shared form, so one Files-to-Change row per shared file always matches. For each path shared by multiple members of the same chain, apply first-listing `create|modify` and later-listing `modify`; reject any shared-path delete, including the first listing. Keep unique-path ops unchanged. At `$manifestFileRecords`/`$matchingRows` operation comparison, compare the Files-to-Change row to the first listing's op for that chain-shared identity; later member `modify` must not generate a false mismatch against a first `create` row. Continue all existing row/ownership and operation checks for other records.
  4. Chains share exact identities only. Reject ancestor/descendant identities involving chain-bearing tasks, including within one chain, with an EXEC-MANIFEST finding. Use component-boundary, case-insensitive comparison; `a` and `ab` are not ancestors. Do not add a path-overlap check to wholly unchained task sets. Do not introduce an exact-path ownership refusal for a chain member sharing with a task outside that chain or between different chains; Engine planning retains those refusals. Existing operation-mismatch checks on outside owners continue to apply.
  5. In addition to the unchanged original DAG check, contract each valid chain to one node, drop only its internal edges, rewrite other references to its node, and check that graph for cycles. Do not contract a chain already reported invalid for a step-2 shape violation: skip contraction and the contracted-graph acyclicity check for that chain, so a malformed chain yields only its shape finding(s), with no interleaving finding. An interleaving finding must use EXEC-MANIFEST and name an involved chain. Retain the original cycle diagnostics on manifests with no chain field. Do not change manifest version, repo restrictions, task-ID matching, check order, or acceptance-check grammar.
  6. In `spec-validate-test.ps1`, extend `New-ManifestFixture` to express chain fixtures and first-op Files-to-Change rows. Add optional `[switch]$ChainsOnly`, default off, running only the new hermetic chain/legacy fixtures with existing failure/cleanup semantics; skip corpus, sweep, and version-reference equality checks in that focused mode. Default invocation still runs every old and new hermetic case, the ordinary corpus test against the existing expected TSV, and existing sweep tests.
  7. Add positives for optional-field absence, a singleton chain, independent chains, reversed manifest order, first listing by a later member, outside dependencies, shared create/modify and modify/modify with identical shared-path spellings, and a unique delete. Add chain members listing `src./shared.txt` and `src/shared.txt`; assert an EXEC-MANIFEST finding with the exact text `chain <name> lists one file with different spellings: src./shared.txt, src/shared.txt` (substitute the fixture's chain name). Add a case-variant spelling pair and assert the same prescribed spelling finding with its actual paths. Add EXEC-MANIFEST negatives for null/empty/whitespace/non-string/uppercase/invalid chain names; multiple heads; branches; joins; disconnected/cyclic groups; extra earlier in-chain dependency; shared first delete; later create/delete; wrong Files-to-Change first op; chain ancestor/descendant overlap; and the original-DAG-valid contracted-cycle example from Task 1's mechanism. Add a two-head chain negative fixture and assert that it produces the shape finding and no interleaving finding. Explicitly assert that wholly unchained shared-file and ancestor-overlap fixtures retain their pre-change findings/output (except the contract-version banner), and same-op exact sharing between a chain and outside task still validates. Assert unchanged FILES-COMPLETENESS, coder/manifest ID equality and ordinary-cycle fixtures. Embed expected findings in the test file; do not edit the corpus or its expected TSV.

- [ ] **Task 3** — Publish chain contract and route declared chains to the Engine — files: skills/apex-code/references/spec-contract.md, skills/apex-code/SKILL.md, skills/apex-code/references/parallel-codex.md, skills/apex-orchestrate/templates/spec-template.md, skills/apex-orchestrate/SKILL.md — done when: the Task 3 tagged documentation check passes, contract version is 1.3.0, the five named documentation changes are present, and apex-code/SKILL.md remains exactly 500 lines.

  1. In `spec-contract.md`, set the `Contract version` line to `**1.3.0**`. Under `## Execution manifest`, add field 6: optional `chain`, nonempty string matching `^[a-z0-9][a-z0-9-]*$`. The new field line must begin with the literal text "6. `chain`", matching fields 1-5 (for example, "5. `effort`") so the tagged check matches. Document the ordered predecessor/successor sequence, singleton allowance, permitted outside dependencies, first-listing shared create/modify then modify, first-op Files-to-Change row, exact canonical case-insensitive identities, chain ancestor/descendant refusal, and contracted DAG acyclicity with chain-naming findings. Include these exact sentences in field 6: `A singleton chain is valid.`, `The first listing in chain order uses create or modify; every later listing uses modify.`, and `Chains permit exact sharing of canonical, case-insensitive file identities only.` Add this prescribed sentence to field 6: `A merged chain's acceptance checks all run after the whole chain is built, so every member's checks must hold against the final state of the chain.` Include the exact planner finding text `chain <name> requires interleaving with task <id>` for a cycle introduced only by contraction, and state that validator interleaving findings name an involved chain. State that wholly unchained validation is unchanged and exact sharing outside a chain remains a planner refusal, not a new validator ownership rule. Update the existing per-file operation equality paragraph with the shared-chain first-op exception; retain the contract-change procedure.
  2. On the eligibility/manual-path line of `skills/apex-code/SKILL.md` (anchor `Eligible attended builds use the Engine:`), replace `file-disjoint tasks` with `file-disjoint tasks or declared chains`, and replace `shared-file tasks` in the manual list with `undeclared shared-file tasks`. Make the replacement on the existing line, with no added/deleted lines; the file remains exactly 500 lines. Leave frontmatter unchanged.
  3. On the opening manual-procedure paragraph of `references/parallel-codex.md`, change the exclusion to `undeclared shared-file tasks`, state eligibility as `file-disjoint tasks or declared chains`, and qualify the separate-wave manual sentence as applying to undeclared shared-file tasks. Keep the paragraph on its existing line.
  4. In the template's Execution manifest guidance comment (anchor `Include one entry per coder task`), add on an existing comment line: `Tasks must be file-disjoint or use a declared chain when they must share a file.` Preserve manifest sample syntax, all headings, acceptance-check grammar, and the version-less contract pointer. Do not change the template's Intent comment as part of this task.
  5. In `skills/apex-orchestrate/SKILL.md`, on the attended HOST manual-path routing row, replace `shared-file tasks` with `undeclared shared-file tasks (tasks sharing a file without a declared chain)` on the same line. Leave frontmatter unchanged.

- [ ] **Task 4 (HOST)** — H1 skill history — files: C:/Users/User/apex/SKILL-HISTORY.md — done when: newest-first event rows for apex-code and apex-orchestrate name engine-shared-file-chains, enumerate their changed paths, record the existing skill versions without a version bump, and describe the chain/schema/risk-scan or routing/template changes respectively.
- [ ] **Task 5 (HOST)** — H2 changelog — files: C:/Users/User/apex/CHANGELOG.md — done when: one Unreleased Changed bullet names engine-shared-file-chains, optional manifest chains merged into one Engine task, contract 1.3.0, and HTML-comment-safe Intent risk scanning.
- [ ] **Task 6 (HOST)** — H3 native integration verification — files: (none) — done when: the untagged HOST full verify fence, structural checks, corpus test and report-only sweeps below complete on integrated Tasks 1-5, every executable check passes, corpus outcomes match the unmodified expected TSV, and every live-spec finding is recorded and adjudicated without out-of-scope edits.
- [ ] **Task 7 (HOST)** — H4 scope audit — files: (none) — done when: base-relative tracked changes plus untracked paths in the integration build tree and HOST bookkeeping repository match only authorized changes after accounting for the captured pre-existing dirty paths; the before/after ignored-untracked snapshot difference under build-root skills/apex-code and skills/apex-orchestrate is empty; the report names those pre-existing paths.

## Wave plan
Wave 1: [task 1, task 2, task 3]. The three coder file sets are disjoint; manifest dependencies are authoritative. HOST Tasks 4-5 follow integration; Task 6 follows Tasks 4-5; Task 7 follows Task 6. Coders run only their own task's tagged checks. HOST runs native full verification and bookkeeping. Coders perform no Git operations; Engine integration commits remain Engine mechanics.

## Permissions

The following NON-CRITICAL actions will run autonomously during build. Approving this spec approves all of them.
Critical paths — .env · migrations · auth/authz/crypto · CI config · dependency manifests and lockfiles · infra-as-code · secrets/keys/certs · host-state (`status.md`, root AGENTS.md, root CLAUDE.md, docs/changes/, docs/handoff/, the run ledger) · the permission settings and the hooks — are NEVER pre-authorised by this section. They need a live attended confirmation at build time, and an AFK run parks them (D3, ADR-046; apex-governance is canonical). (Sole exception: the docs agents' three host's-pen artifacts — the handoff, `status.md`, and spec archival — under D6.)

docs/audit/ is different and stricter: TIER-1, refused outright on a path match. No confirmation authorises a write there — not attended, not by any switch, not by this section. (D5's append-only exception is doctrine pending a content-aware classifier change; it is not a live permission.)

### File Operations
| Action | Paths |
|--------|-------|
| Create | (none; temporary test fixtures are cleaned up by the test harness) |
| Modify | Only the ten relative build paths and two absolute HOST bookkeeping paths in Files to Change, by their owning tasks |
| Delete | (none) |

### Commands
| Command | Purpose |
|---------|---------|
| `powershell.exe -NoProfile -File skills/apex-code/scripts/engine-plan-test.ps1 -ChainsOnly` | Task 1 focused regressions |
| `powershell.exe -NoProfile -File skills/apex-code/scripts/spec-validate-test.ps1 -ChainsOnly` | Task 2 focused hermetic regressions |
| Task 3 tagged fence | Documentation presence, versions, and caps |
| Untagged HOST fences below; current build-root AGENTS.md Verify commands fence | Native integrated verification, corpus/sweeps, structural and scope checks |

### Git Operations
| Operation | Scope |
|-----------|-------|
| Coder Git operations | None |
| HOST read-only diff and untracked enumeration | Base-relative scope audit only; commands below |
| Engine integration commits | Existing Engine build mechanics; no coder authorization to stage, commit, push, reset, stash, or restore |

### Environment Access
| Variable | Purpose |
|----------|---------|
| `TEMP` | Existing isolated test fixtures and cleanup |
| Existing test-harness environment variables | Existing fixture isolation; restore values on exit |

### Network
| Action | Purpose |
|--------|---------|
| (none) | No new network access |

## Specialist Context
### Security
Preserve existing manifest authorization, metadata-path, reparse, directory, and file-ancestor guards. Chain merging grants only the union of member file authorizations.

### Performance
Focused `-ChainsOnly` modes run fast hermetic regressions only; no corpus sweeps, repository-wide recipe, engine-test, dispatch, or live model calls. Default test invocations retain their complete suites.

### Accessibility
(none)

## Documentation
| Doc type | File | Action |
|----------|------|--------|
| Contract | skills/apex-code/references/spec-contract.md | Task 3: field 6, rules, first-op exception, version 1.3.0 |
| Skill routing | skills/apex-code/SKILL.md | Task 3: declared-chain eligibility and undeclared-sharing manual route |
| Reference | skills/apex-code/references/parallel-codex.md | Task 3: eligibility/manual wording |
| Template | skills/apex-orchestrate/templates/spec-template.md | Task 3: chain authoring guidance |
| Orchestrator routing | skills/apex-orchestrate/SKILL.md | Task 3: undeclared-sharing manual route |
| History | C:/Users/User/apex/SKILL-HISTORY.md | HOST Task 4: two skill event rows |
| Changelog | C:/Users/User/apex/CHANGELOG.md | HOST Task 5: Unreleased Changed bullet |

## Acceptance Criteria
- [ ] Task 1 - Planner chain/risk/schema regressions pass; merged tasks expose only schema-defined properties, members is optional, unchained plan/prompt compatibility and defence-in-depth refusals are asserted -> verify:
```powershell apex-accept
powershell.exe -NoProfile -File skills/apex-code/scripts/engine-plan-test.ps1 -ChainsOnly
if ($LASTEXITCODE -ne 0) { throw 'Task 1 focused planner regressions failed' }
```

- [ ] Task 2 - Chain EXEC-MANIFEST cases pass, legacy validation remains unchanged, and validator contract version is 1.3.0 -> verify:
```powershell apex-accept
powershell.exe -NoProfile -File skills/apex-code/scripts/spec-validate-test.ps1 -ChainsOnly
if ($LASTEXITCODE -ne 0) { throw 'Task 2 focused validator regressions failed' }
$version = & powershell.exe -NoProfile -File skills/apex-code/scripts/apex-spec-validate.ps1 -Version
if ($LASTEXITCODE -ne 0) { throw 'Validator version command failed' }
if (($version -join "`n") -cnotmatch '^apex-spec-validate contract 1\.3\.0\s*$') { throw 'Validator contract version mismatch' }
```

- [ ] Task 3 - All documentation anchors carry the new contract/routing and the capped skill retains exactly 500 lines -> verify:
```powershell apex-accept
$contract = Get-Content -Raw -Encoding UTF8 'skills/apex-code/references/spec-contract.md'
if (-not $contract.Contains('Contract version: **1.3.0**')) { throw 'Contract reference version mismatch' }
if ($contract -cnotmatch '(?m)^6\. `chain`') { throw 'Missing manifest field 6' }
foreach ($term in @(
    'A singleton chain is valid.',
    'The first listing in chain order uses create or modify; every later listing uses modify.',
    'Chains permit exact sharing of canonical, case-insensitive file identities only.',
    'final state of the chain',
    'chain <name> requires interleaving with task <id>'
)) {
    if (-not $contract.Contains($term)) { throw ('Missing contract term: ' + $term) }
}
$codePath = 'skills/apex-code/SKILL.md'
$code = Get-Content -Raw -Encoding UTF8 $codePath
if (@(Get-Content -Encoding UTF8 $codePath).Count -ne 500) { throw 'apex-code line count changed' }
if (-not $code.Contains('file-disjoint tasks or declared chains')) { throw 'Missing Engine eligibility' }
if (-not $code.Contains('No manifest, undeclared shared-file tasks,')) { throw 'Missing manual routing' }
$parallel = Get-Content -Raw -Encoding UTF8 'skills/apex-code/references/parallel-codex.md'
if (-not $parallel.Contains('file-disjoint tasks or declared chains') -or -not $parallel.Contains('undeclared shared-file tasks')) { throw 'Parallel reference routing mismatch' }
$template = Get-Content -Raw -Encoding UTF8 'skills/apex-orchestrate/templates/spec-template.md'
if (-not $template.Contains('Tasks must be file-disjoint or use a declared chain when they must share a file.')) { throw 'Template chain guidance missing' }
$orchestrate = Get-Content -Raw -Encoding UTF8 'skills/apex-orchestrate/SKILL.md'
if (-not $orchestrate.Contains('undeclared shared-file tasks (tasks sharing a file without a declared chain)')) { throw 'Orchestrator manual routing mismatch' }
```

- [ ] Task 4 - HOST history has separate apex-code and apex-orchestrate event rows with changed paths and existing skill versions -> verify: inspect the new rows in `C:/Users/User/apex/SKILL-HISTORY.md` against the ten integrated build changes.
- [ ] Task 5 - HOST changelog describes chains, contract 1.3.0 and the Intent comment fix -> verify: inspect the new Unreleased Changed bullet in `C:/Users/User/apex/CHANGELOG.md`.
- [ ] Task 6 - HOST runs the complete current build-root AGENTS.md Verify commands fence natively after integration; every command exits zero. The fence below reproduces the current recipe; if that recipe changes before dispatch, HOST runs the current complete fence as well. Coders do not run this fence. `engine-test.ps1` runs only in the native HOST session -> verify:
```powershell
$ErrorActionPreference = 'Stop'
node --check hooks/destructive-command-guard.js
if ($LASTEXITCODE -ne 0) { throw 'destructive-command-guard syntax failed' }
node --check hooks/lib/destructive-detect.js
if ($LASTEXITCODE -ne 0) { throw 'destructive-detect syntax failed' }
python hooks/destructive-guard-test.py
if ($LASTEXITCODE -ne 0) { throw 'destructive-guard tests failed' }
foreach ($test in @(
    'baseline-check-test.ps1', 'spec-validate-test.ps1',
    'dispatch-preflight-test.ps1', 'dispatch-events-test.ps1',
    'tree-pin-test.ps1', 'scope-check-test.ps1', 'dispatch-author-test.ps1',
    'engine-plan-test.ps1', 'engine-git-test.ps1', 'engine-dispatch-test.ps1',
    'apex-drain-plan-test.ps1'
)) {
    & powershell.exe -NoProfile -File (Join-Path 'skills/apex-code/scripts' $test)
    if ($LASTEXITCODE -ne 0) { throw ('HOST test failed: ' + $test) }
}
foreach ($case in @('core', 'recovery', 'resume', 'safety')) {
    powershell.exe -NoProfile -File skills/apex-code/scripts/apex-drain-test.ps1 -Case $case
    if ($LASTEXITCODE -ne 0) { throw ('Drain case failed: ' + $case) }
}
powershell.exe -NoProfile -File skills/apex-code/scripts/apex-drain-close-test.ps1
if ($LASTEXITCODE -ne 0) { throw 'Drain close tests failed' }
powershell.exe -NoProfile -File skills/apex-plan/scripts/apex-map-check-test.ps1
if ($LASTEXITCODE -ne 0) { throw 'Map check tests failed' }
powershell.exe -NoProfile -File skills/apex-plan/scripts/apex-size-guard-test.ps1
if ($LASTEXITCODE -ne 0) { throw 'Size guard tests failed' }
powershell.exe -NoProfile -File skills/apex-code/scripts/engine-test.ps1
if ($LASTEXITCODE -ne 0) { throw 'Native Engine tests failed' }
```

- [ ] Task 6 - HOST completes the contract-change procedure with the original expected TSV: the default spec-validate-test invocation above runs hermetic and ordinary corpus tests; corpus sweep outcomes match that TSV, including expected FAIL rows; every live-repository sweep report is inspected and dispositioned. No expected TSV edits or out-of-scope spec repairs are permitted -> verify from the integration build root:
```powershell
$corpus = 'skills/apex-code/scripts/fixtures/spec-corpus'
$expected = Join-Path $corpus 'expected.tsv'
if ((Get-FileHash -LiteralPath $expected -Algorithm SHA256).Hash -cne $ExpectedTsvHashBeforeBuild) { throw 'Expected TSV changed' }
powershell.exe -NoProfile -File skills/apex-code/scripts/spec-contract-sweep.ps1 -Root $corpus
if ($LASTEXITCODE -ne 0) { throw 'Corpus sweep failed' }
powershell.exe -NoProfile -File skills/apex-code/scripts/spec-contract-sweep.ps1 -Root 'C:/Users/User/apex'
if ($LASTEXITCODE -ne 0) { throw 'APEX live-spec sweep requires HOST disposition' }
foreach ($liveRoot in $OtherLiveRepoRoots) {
    & powershell.exe -NoProfile -File skills/apex-code/scripts/spec-contract-sweep.ps1 -Root $liveRoot
    if ($LASTEXITCODE -ne 0) { throw ('Live-spec sweep requires HOST disposition: ' + $liveRoot) }
}
```
  HOST sets `$ExpectedTsvHashBeforeBuild` from the pre-build hash and `$OtherLiveRepoRoots` to its inventory of other live repositories (empty only when there are none). The sweep is report-only and can exit zero with FAIL/ERROR rows: inspect every per-spec result and summary, compare corpus rows to the existing TSV, reject ERROR rows, and adjudicate live-spec findings including baseline failures. Stop and return any unmet criterion to planning without widening this spec's scope.

- [ ] Task 6 - HOST structural checks pass: all skill entrypoints are at most 500 lines; apex-code remains exactly 500; root CLAUDE.md is at most 200 lines; AGENTS.md is at most 32768 bytes; named skill/agent/reference pointers resolve. The planning-host-owned status document is excluded from reads, writes and this verification -> verify from the integration build root:
```powershell
$skills = @(Get-ChildItem -Path 'skills/apex-*/SKILL.md' -File)
if ($skills.Count -eq 0) { throw 'No skill entrypoints found' }
foreach ($skill in $skills) {
    if (@(Get-Content -LiteralPath $skill.FullName -Encoding UTF8).Count -gt 500) { throw ('Skill cap exceeded: ' + $skill.Name) }
}
if (@(Get-Content -Encoding UTF8 'skills/apex-code/SKILL.md').Count -ne 500) { throw 'apex-code line count changed' }
if (@(Get-Content -Encoding UTF8 'CLAUDE.md').Count -gt 200) { throw 'Root CLAUDE cap exceeded' }
if ((Get-Item -LiteralPath 'C:/Users/User/apex/AGENTS.md').Length -gt 32768) { throw 'AGENTS cap exceeded' }
```
  HOST additionally resolves every skill/agent/reference pointer named by the changed files against the build root, including existing tilde-style skill links, and reports dangling pointers as failures. Do not rewrite existing links merely to change their spelling.

- [ ] Task 7 - HOST scope audit includes Engine-committed waves, untracked files, and ignored-untracked files under skills/apex-code and skills/apex-orchestrate. Capture `$BuildBase` and `$ApexBase` before dispatch, and retain the pre-existing dirty/untracked inventory. Before the build, HOST sets `$BuildRoot` to the actual integration build root (C:/Users/User/.claude for the primary checkout; a dispatched checkout/worktree may differ) and records the ignored-untracked snapshot in `$IgnoredUntrackedSnapshot`, a file outside both repositories (for example, under `$env:TEMP`). Retain that file through the post-build comparison. Run this before dispatch, only as HOST, never in an apex-accept block:
```powershell
$IgnoredUntrackedSnapshot = Join-Path $env:TEMP ('engine-shared-file-chains-ignored-' + [guid]::NewGuid().ToString('N') + '.txt')
$ignoredUntrackedBefore = @(git -C $BuildRoot ls-files --others --ignored --exclude-standard -- skills/apex-code skills/apex-orchestrate)
if ($LASTEXITCODE -ne 0) { throw 'Build ignored-untracked baseline failed' }
Set-Content -LiteralPath $IgnoredUntrackedSnapshot -Value $ignoredUntrackedBefore -Encoding UTF8
```
  After the build, execute the following only as HOST, in the integrated build root, never in an apex-accept block -> verify:
```powershell
git diff --name-only $BuildBase --
if ($LASTEXITCODE -ne 0) { throw 'Build scope diff failed' }
git ls-files --others --exclude-standard
if ($LASTEXITCODE -ne 0) { throw 'Build untracked enumeration failed' }
if (-not (Test-Path -LiteralPath $IgnoredUntrackedSnapshot -PathType Leaf)) { throw 'Missing ignored-untracked baseline' }
$ignoredUntrackedAfter = @(git -C $BuildRoot ls-files --others --ignored --exclude-standard -- skills/apex-code skills/apex-orchestrate)
if ($LASTEXITCODE -ne 0) { throw 'Build ignored-untracked enumeration failed' }
$ignoredUntrackedBefore = @(Get-Content -LiteralPath $IgnoredUntrackedSnapshot -Encoding UTF8)
if ([string]::Join("`n", $ignoredUntrackedBefore) -cne [string]::Join("`n", $ignoredUntrackedAfter)) { throw 'Build ignored-untracked snapshot difference is not empty' }
git -C 'C:/Users/User/apex' diff --name-only $ApexBase --
if ($LASTEXITCODE -ne 0) { throw 'HOST bookkeeping scope diff failed' }
git -C 'C:/Users/User/apex' ls-files --others --exclude-standard
if ($LASTEXITCODE -ne 0) { throw 'HOST untracked enumeration failed' }
```
  Compare the union of tracked base-relative changes and untracked paths with Files to Change, excluding only individually recorded pre-existing changes. The build repo ignores `*`, so the ordinary untracked enumeration omits ignored files. Require an empty before/after ignored-untracked snapshot difference: no new ignored-untracked files may appear under skills/apex-code or skills/apex-orchestrate. All ten build paths and two HOST paths must be accounted for; report pre-existing dirty paths separately. Do not use git status as the scope gate, change the index, restore concurrent work, or move/archive the spec.

- [ ] Reachability - Manifest `chain` reaches EXEC-MANIFEST validation, Get-EnginePlan contraction, merged task prompts/acceptance checks, and the durable plan-task schema -> verify: HOST default planner tests include a real-validator positive chain fixture; assert one merged task with ordered members, rewired dependents, combined prompt/checks, and schema-defined property names. Native full engine-test verifies the existing Engine consumer without apex-engine.ps1 edits.

## Progress
_(The build writes here — do not edit manually)_
