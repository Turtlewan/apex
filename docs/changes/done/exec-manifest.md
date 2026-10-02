---
spec: exec-manifest
status: draft
autonomy_level: L2
risk: medium
max_parallel_codex: 2
---

# Spec: Execution manifest
<!-- Governing contract: references/spec-contract.md. -->

**Identity:** Add a JSON execution manifest to APEX specs and validate its task, file, operation, and dependency contract.
<!-- Decision record: docs/technical/adr/ADR-048-role-redesign.md. -->

## Intent
- **Intent:** Give the stage-5 Engine a deterministic task graph and file-operation map in one `json apex-manifest` block per opted-in spec.
- **Invariants:** A present manifest agrees exactly with coder tasks and Files to Change; a spec without `## Execution manifest` retains its current validation result; `## Wave plan` remains human-readable while `depends_on` is the machine dependency source.
- **Non-goals:** Implementing the Engine, requiring manifests on all existing specs, or rewriting the spec corpus.

## Assumptions
- `C:/Users/User/.claude` is the build repo for all five coder tasks; the three APEX paths are HOST-only writes → impact: Stop.
- The live validator contract starts at 1.0.0; the new optional manifest check is a minor contract addition, 1.1.0 → impact: Stop.
- `critic-consolidation` completes before this build; its edits to the template and planning skill are present when Tasks 4 and 5 begin → impact: Stop.

Simplicity check: One optional JSON section and one validator extension use PowerShell 5.1's JSON parser. This is one contract change across tightly coupled files: the validator, its tests, its contract reference, the template that documents it, and one author-guidance paragraph. Splitting it would create cross-spec prerequisites for a single contract, so this is a deliberate exception to the >3-files split rule for OWNER confirmation at the digest.

## Prerequisites
- Specs that must be complete first: `C:/Users/User/apex/docs/changes/critic-consolidation.md` (including its edits to `skills/apex-orchestrate/templates/spec-template.md` and `skills/apex-plan/SKILL.md`).
- Environment setup required: PowerShell 5.1, read/write access to the build repo for coder tasks, and HOST access to the APEX close-out files.

Grep evidence: `rg --no-ignore -c 'SpecContractVersion|taskHeadingRegex|Files to Change' skills/apex-code/scripts/apex-spec-validate.ps1` → 11 matching lines.
Grep evidence: `rg --no-ignore -c 'Assert-Case|\$good|expected.tsv' skills/apex-code/scripts/spec-validate-test.ps1` → 38 matching lines.
Grep evidence: `rg --no-ignore -n 'RegenerateExpected|CorpusManifestPath|expected\.tsv' skills/apex-code/scripts/spec-validate-test.ps1` → only `CorpusManifestPath` points to `fixtures/spec-corpus/expected.tsv`; no `RegenerateExpected` parameter.
Grep evidence: `rg --no-ignore -n 'Root|Path|Exclude|PASS |FAIL |SWEEP contract' skills/apex-code/scripts/spec-contract-sweep.ps1` → the sweep takes `Root`, `Path`, and `Exclude` and reports validator results; it has no regeneration switch.
Grep evidence: `Test-Path (Join-Path 'skills/apex-code/scripts/fixtures/spec-corpus' 'expected.tsv')` → `True`.
Grep evidence: `rg --no-ignore -n 'RegenerateExpected|tests/spec-validator/' skills/apex-code/references/spec-contract.md` → the current contract procedure invokes the missing switch and names an obsolete fixture directory.
Grep evidence: `rg --no-ignore -c 'Contract version|## Structure|## Changing the contract' skills/apex-code/references/spec-contract.md` → 4 matching lines.
Grep evidence: `rg --no-ignore -c '## Files to Change|## Tasks|## Wave plan' skills/apex-orchestrate/templates/spec-template.md` → 7 matching lines.
Grep evidence: `rg --no-ignore -c '## Writing the spec|Files to Change|## Wave plan' skills/apex-plan/SKILL.md` → 4 matching lines.
Grep evidence: `rg -c 'apex-code|apex-plan|apex-orchestrate' SKILL-HISTORY.md` → 142 matching lines.
Grep evidence: `rg -c 'Engine|### Rollout' docs/technical/adr/ADR-048-role-redesign.md` → 13 matching lines.
Grep evidence: `rg -c 'spec \(`docs/changes/`\)|Build orchestrator' docs/technical/architecture/overview.md` → 2 matching lines.

## Files to Change
| File | Operation | Notes |
|------|-----------|-------|
| skills/apex-code/scripts/apex-spec-validate.ps1 | modify | Optional manifest parser and checks; contract version. |
| skills/apex-code/scripts/spec-validate-test.ps1 | modify | Hermetic manifest pass/fail cases. |
| skills/apex-code/references/spec-contract.md | modify | Contract 1.1.0 and manifest rules. |
| skills/apex-orchestrate/templates/spec-template.md | modify | Execution manifest section and example. |
| skills/apex-plan/SKILL.md | modify | Spec-author manifest instruction. |
| C:/Users/User/apex/SKILL-HISTORY.md | modify | HOST dated history rows. |
| C:/Users/User/apex/docs/technical/adr/ADR-048-role-redesign.md | modify | HOST stage-5 rollout note. |
| C:/Users/User/apex/docs/technical/architecture/overview.md | modify | HOST architecture map line. |

## Execution manifest
```json apex-manifest
{
  "version": 1,
  "repos": { "claude": "C:/Users/User/.claude" },
  "tasks": [
    { "id": "1", "repo": "claude", "files": [{ "path": "skills/apex-code/scripts/apex-spec-validate.ps1", "op": "modify" }], "depends_on": [] },
    { "id": "2", "repo": "claude", "files": [{ "path": "skills/apex-code/scripts/spec-validate-test.ps1", "op": "modify" }], "depends_on": ["1"] },
    { "id": "3", "repo": "claude", "files": [{ "path": "skills/apex-code/references/spec-contract.md", "op": "modify" }], "depends_on": ["1"] },
    { "id": "4", "repo": "claude", "files": [{ "path": "skills/apex-orchestrate/templates/spec-template.md", "op": "modify" }], "depends_on": ["3"] },
    { "id": "5", "repo": "claude", "files": [{ "path": "skills/apex-plan/SKILL.md", "op": "modify" }], "depends_on": ["4"] }
  ]
}
```

## Tasks
- [x] **Task 1** — In `skills/apex-code/scripts/apex-spec-validate.ps1`, add a fifth `EXEC-MANIFEST` check after the four existing checks, active only when the unfenced `## Execution manifest` heading exists. Use the script's existing current-section tracking: the first fenced block inside that section must have the info string `json apex-manifest`; parse it with `ConvertFrom-Json`, and emit `FAIL EXEC-MANIFEST` with exit 1 for zero or more than one fenced block inside the section, a wrong info string there, malformed JSON, noninteger or non-1 `version`; missing/invalid `repos`, `tasks`, `files`, `depends_on`, `repo`, `path`, `op`, or optional `effort`; or duplicate manifest task IDs ignoring case. A `json apex-manifest` fence outside the section does not count. Accept IDs matching a Tasks number with optional letter suffix, canonicalize lowercase, and classify a task as host/owner-run iff its bold title contains the exact case-sensitive token `(HOST)` or the case-sensitive whole word `OWNER` (word-boundary match, including `OWNER-run` and `(critical, OWNER-run)` but excluding `HOMEOWNER` and `(HOSTILE)`); all other recognized Tasks entries are coder tasks. Do not silently de-duplicate repeated coder-task IDs in the `## Tasks` list: when a manifest is present, fail `EXEC-MANIFEST` for duplicate coder IDs ignoring case. Check a one-to-one match between coder IDs and manifest IDs; each manifest task's nonempty path set equals its own `files:` list; every manifest path has the same `create|modify|delete` operation in Files to Change; each Files-to-Change path is in a coder manifest task or exclusively in host/owner task `files:`; each task's repo key resolves in `repos`; dependencies resolve to coder IDs with no cycles. Require absolute forward-slash repo roots and canonical repo-relative forward-slash paths (no leading slash, drive, `.` or `..` segment, empty segment, or backslash); resolve manifest file identities through their repo roots and match absolute Files-to-Change paths directly or relative table paths only when they identify one repo path unambiguously, never by suffix alone. Accept optional effort only from `low|medium|high|xhigh|max|ultra`, defaulting to frontmatter `coder_effort` or `medium`. Update the `.DESCRIPTION` header from four to five checks, naming `EXEC-MANIFEST` fifth in the fixed order; keep its fence-ignorance statement accurate for the original four checks while noting that `EXEC-MANIFEST` reads the section fence. Keep the original four checks and their no-section results unchanged, and set `$SpecContractVersion` to `1.1.0`. — files: skills/apex-code/scripts/apex-spec-validate.ps1 — done when: malformed or inconsistent opted-in manifests fail, and absence of the section preserves all existing outcomes.
- [x] **Task 2** — In `skills/apex-code/scripts/spec-validate-test.ps1`, extend the existing in-memory `Assert-Case` fixture generator with a valid single-repo manifest, a valid two-repo manifest with absolute Files-to-Change paths, HOST-only and OWNER-only Files-to-Change coverage (including `OWNER-run` and `(critical, OWNER-run)` titles), case-insensitive letter-suffix IDs, valid effort plus default effort, and an explicit no-manifest copy of the existing good fixture that still exits 0 with its current output checks. Add a passing fixture instantiated from the template's example Tasks, Files-to-Change rows, and example manifest with concrete paths, proving those examples together pass the validator. Add distinct failing fixtures for zero and multiple manifest blocks, a fenced block inside `## Execution manifest` with a wrong info string, a stray `json apex-manifest` fence outside the section with no fence inside it, malformed JSON, noninteger/wrong version, missing or wrong-type required fields, malformed and duplicate manifest IDs, duplicate coder-task IDs in `## Tasks` while a manifest is present, missing and extra coder entries, an unmarked lowercase host title, false host/owner markers `HOMEOWNER` and `(HOSTILE)`, empty/unequal task files, missing Files-to-Change path, operation mismatch and invalid operation, orphan or ambiguous relative Files-to-Change path, unknown repo, unknown dependency, self and longer cycle, invalid effort, and noncanonical repo root and task path. Assert exit 1 and the `FAIL EXEC-MANIFEST` label for each. Derive both `$expectedSummary` and `$expectedExcludedSummary` contract versions from the validator's own `-Version` output instead of hard-coding `1.0.0`, so future contract bumps need no second edit; keep corpus fixtures and `expected.tsv` unchanged. — files: skills/apex-code/scripts/spec-validate-test.ps1 — done when: hermetic cases isolate every new failure rule, the template-instantiated example and no-manifest baseline pass, and the suite exits 0 after the contract bump.
- [x] **Task 3** — In `skills/apex-code/references/spec-contract.md`, bump the reference version to `1.1.0`, add `## Execution manifest` to the optional-section contract, document the `json apex-manifest` shape, exact host/owner title grammar, duplicate coder-task-ID rejection when a manifest is present, canonical IDs and paths, operations, effort fallback, set equality, Files-to-Change ownership, repo-key and DAG checks, `FAIL EXEC-MANIFEST` order, and unchanged no-section behavior. Reword the "four checks in this fixed order" sentence and ordered list under `## Fixed checks and findings` to include `EXEC-MANIFEST` fifth. In `## Changing the contract`, retain the regenerate-then-diff-then-justify audit intent and its "Wholesale regenerate-and-commit is forbidden" rule, but replace the nonexistent `spec-validate-test.ps1 -RegenerateExpected` command with the real report-only `spec-contract-sweep.ps1 -Root <corpus-root>` workflow: inspect its per-spec results, update only justified rows in `expected.tsv` under `skills/apex-code/scripts/fixtures/spec-corpus/` when expected outcomes truly change, then diff that live TSV with `git diff --` and justify each changed row. Use the sweep's actual `-Root` parameter in both sweep commands, replacing the existing `-RepoPath` example, and the live fixture directory; do not imply that the sweep writes the TSV. Add one sentence: for an additive, backward-compatible change such as a new optional section, run the hermetic test and ordinary corpus test against the existing `expected.tsv`; if both pass unmodified, no regenerate/diff/justify step is needed for that change. — files: skills/apex-code/references/spec-contract.md — done when: the reference names every enforced rule, both version sites agree, and the contract-change commands and paths exist.
- [x] **Task 4** — In `skills/apex-orchestrate/templates/spec-template.md`, insert `## Execution manifest` after `## Files to Change` with one short `json apex-manifest` example containing `version`, `repos`, and one entry per example coder task with `repo`, `files` path/op, and `depends_on`; make its example Files-to-Change rows, Tasks, and manifest agree when placeholders are instantiated as concrete paths. Convert the template's unbolded example task declarations to bold `**Task N**` titles recognized by the validator. State that HOST/OWNER tasks stay outside the manifest and that `## Wave plan` remains human-readable while manifest dependencies are authoritative to the Engine. Anchor the insertion to headings after `critic-consolidation`, not line numbers. — files: skills/apex-orchestrate/templates/spec-template.md — done when: a spec instantiated from the template examples passes the validator without changing its task or wave conventions.
- [x] **Task 5** — In the `## Writing the spec` section of `skills/apex-plan/SKILL.md`, extend the paragraph anchored at `Template:` to instruct the author to derive the execution manifest from the same decisions as Files to Change and the Tasks list, with one entry per coder task, explicit operation and dependency IDs, and no HOST/OWNER entries; keep the SKILL.md edit net-neutral or negative in physical lines and at most 500 lines. After `critic-consolidation`, bump its version from 2.6.0 to 2.7.0, set `last_updated` to the HOST's `Build date: YYYY-MM-DD` in `## Progress`, ensure ADR-048 in `sources`, and keep `description` unchanged. — files: skills/apex-plan/SKILL.md — done when: the drafting route tells authors how to produce the three matching views and its frontmatter is current.
- [x] **Task 6 (HOST)** — Prepend dated rows in `C:/Users/User/apex/SKILL-HISTORY.md` for the apex-code validator/contract change, apex-orchestrate template change, and apex-plan guidance change, citing ADR-048 and using the HOST's `Build date: YYYY-MM-DD` recorded in `## Progress` at build start; do not alter historical rows. — files: C:/Users/User/apex/SKILL-HISTORY.md — done when: each changed skill area has one new dated row.
- [x] **Task 7 (HOST)** — Under `### Rollout` item `5. Engine` in `C:/Users/User/apex/docs/technical/adr/ADR-048-role-redesign.md`, add a concise stage-5 implementation note that records the 2026-10-02 owner decision to make this spec's manifest the Engine input contract and links this spec; leave the decision and other rollout items intact. — files: C:/Users/User/apex/docs/technical/adr/ADR-048-role-redesign.md — done when: the Engine item names the manifest and owner decision.
- [x] **Task 8 (HOST)** — In the role/artifact map of `C:/Users/User/apex/docs/technical/architecture/overview.md`, add one line naming the spec execution manifest as the Engine's task/file/dependency input; leave the surrounding architecture description intact. — files: C:/Users/User/apex/docs/technical/architecture/overview.md — done when: the overview points readers to the new input contract.

## Wave plan
Dependencies bind through the manifest; no wave contains more than two file-disjoint coder tasks. Wave 1: [Task 1]. Wave 2: [Tasks 2, 3]. Wave 3: [Task 4]. Wave 4: [Task 5]. HOST close-out after the coder build and verification: [Tasks 6, 7, 8].

## Permissions

The five build-repo edits are coder tasks. Tasks 6–8 are HOST writes and are not coder dispatches.

### File Operations
| Action | Paths |
|--------|-------|
| Modify (coder) | skills/apex-code/scripts/apex-spec-validate.ps1, skills/apex-code/scripts/spec-validate-test.ps1, skills/apex-code/references/spec-contract.md, skills/apex-orchestrate/templates/spec-template.md, skills/apex-plan/SKILL.md |
| Modify (HOST) | C:/Users/User/apex/SKILL-HISTORY.md, C:/Users/User/apex/docs/technical/adr/ADR-048-role-redesign.md, C:/Users/User/apex/docs/technical/architecture/overview.md |
| Create/Delete | (none) |

### Commands
| Command | Purpose |
|---------|---------|
| `powershell.exe -NoProfile -File skills/apex-code/scripts/spec-validate-test.ps1` | Run the hermetic and corpus cases from the build repo root. |
| `powershell.exe -NoProfile -File skills/apex-code/scripts/apex-spec-validate.ps1 -SpecPath $specPath` | Validate this opted-in spec after the validator edit, with `$specPath` set to this draft's absolute path. |
| The ten commands in the build repo's `AGENTS.md` `## Verify commands` fence | Run in order from the build repo root. |
| `rg --no-ignore`, `Select-String`, `Test-Path`, `git status --porcelain -uall` | Presence/absence, file, and scope checks. |

### Git Operations
| Operation | Scope |
|-----------|-------|
| Status only | Both repositories; leave staging and integration to the HOST. |

### Environment Access
| Variable | Purpose |
|----------|---------|
| `USERPROFILE` | Resolve the build repo for verification. |

### Network
| Action | Purpose |
|--------|---------|
| None | Local PowerShell and Markdown changes. |

## Specialist Context
### Security
(none)

### Performance
The validator remains an optional-section check until Engine cutover; preserve the no-section path and the existing four-check order.

### Accessibility
(none)

## Documentation
| Doc type | File | Action |
|----------|------|--------|
| Contract | skills/apex-code/references/spec-contract.md | Task 3 updates the mechanical contract. |
| Template | skills/apex-orchestrate/templates/spec-template.md | Task 4 adds the manifest example. |
| History | C:/Users/User/apex/SKILL-HISTORY.md | HOST performs Task 6. |
| ADR | C:/Users/User/apex/docs/technical/adr/ADR-048-role-redesign.md | HOST performs Task 7. |
| Architecture | C:/Users/User/apex/docs/technical/architecture/overview.md | HOST performs Task 8. |

## Acceptance Criteria
- [x] Task 1 — the validator accepts valid manifest shapes and rejects every declared inconsistency → verify: run `powershell.exe -NoProfile -File skills/apex-code/scripts/spec-validate-test.ps1` from the build repo root; all new cases pass, and the validator reports `1.1.0` through `-Version`; presence grep in its `.DESCRIPTION` finds five checks in fixed order with `EXEC-MANIFEST` fifth.
- [x] Task 2 — hermetic fixtures cover every new rejection and the absent-section baseline → verify: presence grep finds named passing single-repo, two-repo, HOST-only, OWNER-only (including `OWNER-run` and `(critical, OWNER-run)`), suffix-ID, effort-default, template-instantiated example, and no-manifest cases plus distinct failing zero/multiple-block, wrong-info-string-inside-section, stray-fence-outside-section, JSON, version, shape, malformed/duplicate-manifest-ID, duplicate-coder-task-ID, bijection, lowercase-host, `HOMEOWNER`/`(HOSTILE)` false-marker, files, operation, orphan, repo, dependency, cycle, effort, and path cases; each failing case asserts exit 1 and `FAIL EXEC-MANIFEST`; after the bump, the test command exits 0 without altering the corpus expected file, and both summary assertions derive the contract version from the validator's `-Version` output with no hard-coded contract version literal remaining in either assertion.
- [x] Task 3 — the documented contract matches the implementation → verify: presence grep finds version `1.1.0`, `## Execution manifest`, `json apex-manifest`, exact title markers, duplicate coder-task-ID rejection, all other validation rules, `FAIL EXEC-MANIFEST`, and no-section behavior; presence grep under `## Fixed checks and findings` finds five checks in fixed order with `FAIL EXEC-MANIFEST` fifth; presence grep under `## Changing the contract` finds the report-only sweep with its real `-Root` parameter, `expected.tsv` in the live `skills/apex-code/scripts/fixtures/spec-corpus/` directory, targeted expected-row edits, diff, row-by-row justification, and "Wholesale regenerate-and-commit is forbidden" rule, plus the additive-change sentence allowing that audit step to be skipped only when the hermetic and ordinary corpus tests pass against unmodified `expected.tsv`; no `-RegenerateExpected` or obsolete TSV path remains.
- [x] Task 4 — the template has a complete manifest example → verify: presence grep finds `## Execution manifest`, exactly one example `json apex-manifest` block, `repos`, `tasks`, `files`, `op`, `depends_on`, HOST/OWNER exclusion, the human-readable Wave plan statement, bold `**Task N**` example declarations, and matching example Files-to-Change paths and operations; the Task 2 fixture instantiated from those examples exits 0.
- [x] Task 5 — author guidance ties the three representations together → verify: presence grep within `## Writing the spec` finds the manifest, Files to Change, Tasks, operation, dependency, and HOST/OWNER exclusion instructions; frontmatter shows 2.7.0, `last_updated` equals the HOST's recorded build date, `sources` includes ADR-048, and `description` is unchanged; the file remains at most 500 lines and no longer than its post-prerequisite baseline.
- [x] Task 6 — HOST history rows are complete → verify: HOST records `Build date: YYYY-MM-DD` in `## Progress` at build start, then presence grep finds three rows with that date, the three affected skill areas, and ADR-048; existing rows remain unchanged.
- [x] Task 7 — the ADR records the input contract → verify: presence grep within `### Rollout` item `5. Engine` finds this spec, the execution manifest, and the 2026-10-02 owner decision.
- [x] Task 8 — the overview names the Engine input → verify: presence grep in the role/artifact map finds execution manifest and task, file, and dependency input in one added line.
- [x] Tasks 1–8 — build verification fence passes → verify: run only the ten commands in `AGENTS.md` under the `C:/Users/User/.claude` build repo's `## Verify commands` fence in order and record their outputs; check live skill pointers and the 500-line `SKILL.md` cap.
- [x] Tasks 1–5 — coder scope stays within the five listed build-repo paths → verify: `git status --porcelain -uall` in `C:/Users/User/.claude` shows only those five coder-written paths; every other dirty build-repo path was dirty before the build and is named in the report. No coder writes a HOST file. The HOST's `Build date:` write in this spec and Tasks 6–8 in the APEX repo are outside this coder scope lock.
- [x] Reachability — the dispatch pre-flight's existing validator call sees opted-in manifest failures → verify: the build repo verify fence's dispatch pre-flight test passes and a hermetic invalid-manifest fixture reaches exit 1 through the validator entry point; the no-manifest fixture retains its old result.

## Progress

_(At build start, HOST records `Build date: YYYY-MM-DD` here; use that value for any `last_updated`. This HOST write is APEX-repo bookkeeping outside the coder scope lock, which covers only the five build-repo paths in `C:/Users/User/.claude` under `## Files to Change`. The build writes subsequent progress.)_

Build date: 2026-10-02

Built 2026-10-02 (resumed session): W1 T1 · W2 T2-pass-1 ∥ T3 · W3 T4 (pulled forward, owner speed priority) · W4 T2-pass-2 ∥ T5 · critic round 1 flag (template fixture hand-copied) → fix → round 2 clean · all 10 verify suites green on main (88 spec-validate cases) · family gate exit 0 for tasks 1–5 · HOST tasks 6–8 written.
