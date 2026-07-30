---
spec: retro-validator-versioning
status: draft
autonomy_level: L2
risk: low
coder_effort: medium
---

# Spec: Spec-validator contract versioning, fixture corpus, and a defined migration sweep

**Identity:** Gives `apex-spec-validate.ps1` a declared contract version, a checked-in fixture corpus exercised by `spec-validate-test.ps1`, and a report-only sweep script that lints a target repo's live specs against the current contract — with zero change to validation semantics.
→ why: see docs/research/artemis-retro-2026-07-29.md § P6 (final bullet).

## Intent
- **Intent:** A future change to the spec contract can be shipped with a version bump, a corpus regression run, and a migration report over live specs, instead of silently refusing a backlog at dispatch time.
- **Invariants:**
  - Pass/fail behaviour of the four checks is bit-identical before and after: for every fixture, the pre-change validator (`git show HEAD:` copy) and the post-change validator produce the same exit code and the same set of `FAIL <check>` names.
  - The `Write-Output` finding lines and the exit-code contract (0 valid, 1 findings) are untouched, so `codex-dispatch.ps1`'s captured `$specFindings` and its exit-72 refusal path are unchanged.
  - The sweep never writes: it reads specs and prints a report.
  - No build step creates, edits, moves, or deletes any file under the apex repo's `docs/drafts/`. The byte- and mtime-identity of the live draft `gpt-5.6-family-adoption.md` is verified by the HOST at close-out, not by the coder — a coder cannot hash the file without reading it. Not opening it at all is a coder instruction in Task 1, not a machine-verified invariant.
- **Non-goals:** No new checks, no relaxed checks, no version bump beyond declaring the current contract as `1.0.0`, no migration applied to any live spec, no change to the readiness gate or to `codex-dispatch.ps1`.

## Assumptions
- `skills/apex-code/scripts/apex-spec-validate.ps1` and `spec-validate-test.ps1` are unchanged from the state read at authoring (19 `Assert-Case` calls, hardcoded `ALL 19 CASES PASS` at line 213) → impact: Stop
- In Windows PowerShell 5.1, `Write-Host` from a script invoked in-process as `@(& $script -SpecPath $p)` does not enter the captured success stream, so a banner cannot pollute `codex-dispatch.ps1`'s `$specFindings` (probed at authoring: a two-line script emitting one `Write-Host` and one `Write-Output` yields a captured count of 1 with `$LASTEXITCODE` preserved). This holds for in-process `@(& ...)` invocation ONLY — a child `powershell.exe -File` process writes the banner to its stdout, which is why Task 3's sweep filters captured child output to the findings pattern → impact: Stop (if false, the banner must be emitted only under `-Version`)
- `skills/apex-code/scripts/apex-spec-validate.ps1` is tracked in the `~/.claude` git repo, so `git show HEAD:<path>` yields the pre-change validator for the before/after comparison → impact: Stop
- The `~/.claude` AGENTS.md verify block already runs `spec-validate-test.ps1`, so corpus cases join the repo's verify path with no AGENTS.md edit → impact: Caution
- Six archived specs (~290 KB total, of which `doctrine-sweep.md` is ~189 KB) may be copied verbatim into the fixture tree → impact: Low
- The apex repo's `docs/drafts/` currently holds exactly one file, owned by another live session; the sweep is exercised only against the fixture tree in this build → impact: Stop

Simplicity check: yes — considered adding only a `-Version` switch and skipping the corpus. Rejected: the retro's failure mode is a contract change refusing a whole backlog, which a version string alone does not detect; the corpus plus the sweep are the two mechanisms that make the next contract change observable before it ships. Split-rule exception, justified: the Files-to-Change row count exceeds three, but 11 of the rows are verbatim fixture COPIES and synthetic fixtures carrying no logic — the operative file count is 3 (the validator, the test suite, the sweep script) plus one reference doc. Splitting would separate the corpus from the only script it tests, which is the coupling the spec exists to create.

## Prerequisites
- Specs that must be complete first: **retro-planning-gates** — it owns `skills/apex-orchestrate/templates/spec-template.md` and adds the version-less pointer line naming the contract document. This spec does not touch the template; the two are file-disjoint only because that edit lives there.
- Environment: Windows PowerShell 5.1; the two-tree layout (`~/.claude` is the build worktree, `~/apex` holds docs); `git` available in `~/.claude` for `git show HEAD:`

## Files to Change
| File | Operation | Notes |
|------|-----------|-------|
| `skills/apex-code/scripts/apex-spec-validate.ps1` | modify | Declare contract version; add a `-Version` parameter set; emit a host-stream banner. No check logic touched. |
| `skills/apex-code/scripts/spec-validate-test.ps1` | modify | Add the corpus loop, the sweep case, and a case counter replacing the hardcoded total. |
| `skills/apex-code/scripts/spec-contract-sweep.ps1` | create | Report-only sweep over a target repo's spec directories. |
| `skills/apex-code/scripts/fixtures/spec-corpus/expected.tsv` | create | Generated manifest: relative path, expected exit code, expected check names. |
| `skills/apex-code/scripts/fixtures/spec-corpus/docs/changes/m2a-baseline-commit-hook.md` | create | Verbatim copy of the archived spec. |
| `skills/apex-code/scripts/fixtures/spec-corpus/docs/changes/round8-d1-treepin-digest.md` | create | Verbatim copy of the archived spec. |
| `skills/apex-code/scripts/fixtures/spec-corpus/docs/changes/round8-c4-coverage-hardening.md` | create | Verbatim copy of the archived spec. |
| `skills/apex-code/scripts/fixtures/spec-corpus/docs/changes/round8-b1-specsource.md` | create | Verbatim copy of the archived spec. |
| `skills/apex-code/scripts/fixtures/spec-corpus/docs/changes/round8-w3-dispatch-wrapper.md` | create | Verbatim copy of the archived spec. |
| `skills/apex-code/scripts/fixtures/spec-corpus/docs/changes/doctrine-sweep.md` | create | Verbatim copy of the archived spec — the large-spec stress case (23 tasks, dense Files-to-Change table and acceptance-criteria set). |
| `skills/apex-code/scripts/fixtures/spec-corpus/docs/drafts/corpus-clean.md` | create | Synthetic fixture, expected clean. |
| `skills/apex-code/scripts/fixtures/spec-corpus/docs/drafts/corpus-missing-heading.md` | create | Synthetic fixture, expected STRUCTURE finding. |
| `skills/apex-code/scripts/fixtures/spec-corpus/docs/drafts/corpus-unlisted-file.md` | create | Synthetic fixture, expected FILES-COMPLETENESS finding. |
| `skills/apex-code/scripts/fixtures/spec-corpus/docs/drafts/corpus-uncovered-task.md` | create | Synthetic fixture, expected TASK-CRITERIA-COVERAGE finding. |
| `skills/apex-code/scripts/fixtures/spec-corpus/docs/drafts/corpus-unresolved-marker.md` | create | Synthetic fixture, expected NO-UNRESOLVED-MARKERS finding. |
| `skills/apex-code/references/spec-contract.md` | create | The versioned contract document and the contract-change procedure. |

## Tasks
- [ ] **Task 1: Build the fixture corpus and generate its expected-verdict manifest** — files: `skills/apex-code/scripts/fixtures/spec-corpus/docs/changes/m2a-baseline-commit-hook.md`, `skills/apex-code/scripts/fixtures/spec-corpus/docs/changes/round8-d1-treepin-digest.md`, `skills/apex-code/scripts/fixtures/spec-corpus/docs/changes/round8-c4-coverage-hardening.md`, `skills/apex-code/scripts/fixtures/spec-corpus/docs/changes/round8-b1-specsource.md`, `skills/apex-code/scripts/fixtures/spec-corpus/docs/changes/round8-w3-dispatch-wrapper.md`, `skills/apex-code/scripts/fixtures/spec-corpus/docs/changes/doctrine-sweep.md`, `skills/apex-code/scripts/fixtures/spec-corpus/docs/drafts/corpus-clean.md`, `skills/apex-code/scripts/fixtures/spec-corpus/docs/drafts/corpus-missing-heading.md`, `skills/apex-code/scripts/fixtures/spec-corpus/docs/drafts/corpus-unlisted-file.md`, `skills/apex-code/scripts/fixtures/spec-corpus/docs/drafts/corpus-uncovered-task.md`, `skills/apex-code/scripts/fixtures/spec-corpus/docs/drafts/corpus-unresolved-marker.md`, `skills/apex-code/scripts/fixtures/spec-corpus/expected.tsv` — done when: the six `docs/changes/` fixtures are byte-identical copies of the same-named files under the apex repo's `docs/changes/done/`; the five `docs/drafts/` fixtures are synthetic specs derived from the template, one clean and four each tripping exactly one distinct check (one per check: STRUCTURE, FILES-COMPLETENESS, TASK-CRITERIA-COVERAGE, NO-UNRESOLVED-MARKERS); and `expected.tsv` is GENERATED by a loop that invokes the current unmodified validator once per fixture and records `<relative path>` TAB `<exit code>` TAB `<semicolon-joined sorted distinct FAIL check names, or ->`, one row per fixture, LF line endings, UTF-8 without BOM. The manifest is derived mechanically from validator output — never hand-written from reading the fixtures. Corpus selection criteria: the archived copies cover the distinct real-world failure modes the contract has met (including the non-bold task-heading form that caused the historic backlog refusal) plus one large-spec stress case, and the synthetic drafts isolate one check each. Do not read, copy, or open the apex repo's `docs/drafts/` directory or any file in it — the corpus is sourced only from the archived-spec directory.
- [ ] **Task 2: Add the contract version and the `-Version` query to the validator** — files: `skills/apex-code/scripts/apex-spec-validate.ps1` — done when: a single `$SpecContractVersion = '1.0.0'` declaration exists near the top; `[CmdletBinding(DefaultParameterSetName = 'Validate')]` is set, `$SpecPath` is mandatory only in the `Validate` set, and a `[Parameter(ParameterSetName = 'Version')][switch]$Version` prints exactly `apex-spec-validate contract 1.0.0` on the success stream and exits 0 without reading any file; a validate run emits the banner `[spec-validate] contract 1.0.0` through `Write-Host` (host/information stream) before the checks run; and no line inside the four check blocks (FILES-COMPLETENESS, NO-UNRESOLVED-MARKERS, TASK-CRITERIA-COVERAGE, STRUCTURE), no regex, no `Add-Finding` call, no `Write-Output` line, and no `exit` value is otherwise altered.
- [ ] **Task 3: Write the report-only sweep script** — files: `skills/apex-code/scripts/spec-contract-sweep.ps1` — done when: it accepts `-Root <repo path>` (mandatory), `-Path <string[]>` (default `docs/drafts`, `docs/changes`), and `-Exclude <string[]>` (default empty, matched case-insensitively against both the file name and the root-relative path); it enumerates `*.md` non-recursively in each existing path under `-Root`, invokes `apex-spec-validate.ps1` from `$PSScriptRoot` as a child `powershell.exe -NoProfile -File` process once per spec, and prints one line per spec — `PASS <relative path>`, `FAIL <relative path>: <findings joined by '; '>`, or `SKIP <relative path> (excluded)` — where the captured child-process output is FILTERED to lines matching the findings pattern `^FAIL <check>: ` before joining, so every other line the child emits on stdout (the contract banner above all) is discarded and can never reach a report line — followed by `SWEEP contract <version> - <n> specs, <p> pass, <f> fail, <e> error`; the `<version>` is obtained at runtime by invoking the validator's `-Version` switch and parsing its single output line — the sweep NEVER hardcodes or restates a version literal, so `$SpecContractVersion` in the validator remains the single source of truth; a child process exiting with any code other than 0 or 1 is recorded as an `ERROR <relative path>: exit <code>` row — an infrastructure failure, never reported as PASS and never as an evidence-free FAIL — counted separately in the summary and not folded into the pass or fail counts; it exits 0 whenever a report was produced regardless of findings or errors, and exits 2 when `-Root` does not exist or none of the `-Path` entries exist under it; and the file contains no write, create, or delete call — a grep for `Set-Content|Add-Content|Out-File|New-Item|Remove-Item|Move-Item|WriteAllText|WriteAllLines|>>` over it returns no match.
- [ ] **Task 4: Wire the corpus and the sweep into the test suite** — files: `skills/apex-code/scripts/spec-validate-test.ps1` — done when: the 19 existing `Assert-Case` calls and their fixtures are untouched; the suite gains a `-CorpusManifestPath` parameter defaulting to the tracked manifest under the fixture directory, so a run with no arguments is byte-identical in behaviour and output to today's plus the new cases, and the negative test can point a run at a scratch-mutated copy; a new corpus block reads the manifest at `-CorpusManifestPath`, runs the validator against each listed fixture, and fails the suite on any exit-code or check-name-set mismatch, reporting the fixture path and both verdicts; a new sweep case runs `spec-contract-sweep.ps1` against the corpus root and asserts exit 0, one report line per non-excluded fixture, a summary whose pass/fail counts equal those derivable from `expected.tsv`, and that a SHA-256 hash of every corpus file taken before and after the sweep is unchanged; a second sweep case asserts `-Exclude` emits `SKIP` for the named fixture and drops it from the counts; a third asserts exit 2 for a non-existent `-Root`; the hardcoded `ALL 19 CASES PASS` literal is replaced by a counter incremented per assertion so future additions need no literal edit; and the suite exits 0.
- [ ] **Task 5: Document the contract as versioned** — files: `skills/apex-code/references/spec-contract.md` — done when: the reference states contract version `1.0.0`, enumerates the four checks in their fixed order with their exact `FAIL <check>` labels, lists the eleven required `##` headings and the four non-empty-section rules, records the fence-exclusion rule and the exempt extensions (`.exe`, `.dll`, `.bat`, `.cmd`, `.com`, `.log`, `.jsonl`, `.lock`, `.tmp`), documents the enforced semantics a spec author can actually trip — a token counts as a path only with a directory component and a 1-5 character alphanumeric extension, matching is case-insensitive and separator-normalized on component boundaries with a bare basename never matching a path, the unresolved-marker token set is reproduced verbatim from the validator's check-2 regex — the three uppercase marker words, the bare triple question mark, and the angle-bracketed placeholder token — and is stated to be matched case-insensitively with word-boundary guards; that enumeration MUST sit inside a fenced code block in the reference, because fenced content is the one region the checks ignore and a bare listing would make the contract document fail its own contract, a task heading is recognized only in the bolded `Task N` form and coverage is bidirectional (a declared task with no criterion and a criterion naming an undeclared task both fail), and an unterminated code fence is itself a STRUCTURE failure — names the two consumers (the apex-plan promotion gate and the `codex-dispatch.ps1` pre-flight backstop) and points at ADR-040, and defines the contract-change procedure as an ordered, runnable list: (1) bump `$SpecContractVersion`; (2) regenerate `expected.tsv`; (3) `git diff` the regenerated manifest against its previously committed version and justify EVERY changed row individually as an intended behaviour change, recording each justification in the changing spec or its commit message before committing the manifest — an unexplained changed row is a regression to fix, not a new expectation to accept, and a wholesale regenerate-and-commit is forbidden precisely because it would launder a semantic break into a green suite; (4) run `spec-validate-test.ps1`; (5) run `spec-contract-sweep.ps1` against each live repo's spec directories and act on the report before shipping; the procedure explicitly enumerates the TWO places a version is written — `$SpecContractVersion` in the validator (the source of truth) and the version line in this reference — and states that the spec template's pointer line is deliberately VERSION-LESS so it never becomes a third site to drift, with the sweep and this document being the mechanisms that catch drift instead.

## Wave plan
Wave 1: [Task 1, Task 5] | Wave 2: [Task 2] | Wave 3: [Task 3] | Wave 4: [Task 4]

Task 1 must record the manifest against the unmodified validator, so it integrates before Task 2. Task 3's sweep queries the validator's `-Version` switch at runtime, so it needs Task 2 already integrated. Task 4 consumes both the manifest (Task 1) and the sweep script (Task 3).

## Permissions

The following NON-CRITICAL actions will run autonomously during build. Approving this spec approves all of them.
Critical paths — env files, migrations, auth/authz/crypto, CI config, dependency manifests and lockfiles, infra-as-code, secrets/keys/certs, host-state (the status doc, root AGENTS.md, root CLAUDE.md, the promoted-spec directory, the handoff directory, the run ledger) — are NEVER pre-authorised by this section. They need a live attended confirmation at build time, and an AFK run parks them (D3, ADR-046; apex-governance is canonical). (Sole exception: the docs agents' three host's-pen artifacts — the handoff, the status doc, and spec archival — under D6.)
The audit directory is different and stricter: TIER-1, refused outright on a path match. No confirmation authorises a write there — not attended, not by any switch, not by this section. (D5's append-only exception is doctrine pending a content-aware classifier change; it is not a live permission.)

### File Operations
| Action | Paths |
|--------|-------|
| Create | `skills/apex-code/scripts/spec-contract-sweep.ps1`, `skills/apex-code/references/spec-contract.md`, everything under the corpus fixture directory listed in Files to Change |
| Modify | `skills/apex-code/scripts/apex-spec-validate.ps1`, `skills/apex-code/scripts/spec-validate-test.ps1` |
| Delete | (none) |

### Commands
| Command | Purpose |
|---------|---------|
| `powershell.exe -NoProfile -File skills/apex-code/scripts/apex-spec-validate.ps1 -SpecPath <fixture>` | Generate and re-check manifest verdicts |
| `powershell.exe -NoProfile -File skills/apex-code/scripts/apex-spec-validate.ps1 -Version` | Query the contract version |
| `powershell.exe -NoProfile -File skills/apex-code/scripts/spec-validate-test.ps1` | Run the suite plus the corpus and sweep cases |
| `powershell.exe -NoProfile -File skills/apex-code/scripts/spec-contract-sweep.ps1 -Root <corpus root>` | Exercise the sweep against the fixture tree only |
| `git show HEAD:skills/apex-code/scripts/apex-spec-validate.ps1` | Materialise the pre-change validator for the before/after comparison |

### Git Operations
| Operation | Scope |
|-----------|-------|
| `git add` | (none — the coder never commits; the host integrates) |
| `git commit` | (none) |

### Environment Access
| Variable | Purpose |
|----------|---------|
| `TEMP` | Scratch location for the pre-change validator copy and hash captures |

### Network
| Action | Purpose |
|--------|---------|
| (none) | No package installation or network access |

## Specialist Context
### Security
The sweep executes no spec content and interpolates no spec text into a shell command; it passes each path as a `-SpecPath` argument to a child process.

### Performance
The corpus adds eleven validator invocations plus the sweep runs to the suite; the largest fixture is ~189 KB, so keep the corpus at these eleven fixtures and re-measure suite wall time if a further large spec is ever added.

### Accessibility
(none — no frontend change)

## Documentation
| Doc type | File | Action |
|----------|------|--------|
| Inline | `skills/apex-code/scripts/spec-contract-sweep.ps1` | Comment-based help with SYNOPSIS, DESCRIPTION, and the exit-code contract |
| Contract | `skills/apex-code/references/spec-contract.md` | Create (Task 5) |
| Skill history | SKILL-HISTORY.md | Host-pen row for **apex-code**: contract version 1.0.0 declared, `-Version` query, fixture corpus, sweep script, contract reference |
| Skill history | SKILL-HISTORY.md | Host-pen row for **apex-orchestrate**: the template's version-less contract pointer — written by the sibling retro-planning-gates spec, noted here so the double-write is not orphaned if the two land together |
| Skill index | SKILLS.md | Host-pen check: confirm the apex-code index line still describes the skill accurately after the corpus and sweep land; update only if it no longer does |
| ADR | (none) | ADR-040 already owns the validator decision; no new ADR |

All three rows are host-pen because the build worktree is `~/.claude` and these files live in the `~/apex` tree, which the coder cannot write.

## Acceptance Criteria
- [ ] Task 1 — run the validator once per fixture listed in `expected.tsv` → verify: every fixture path in the manifest exists, the manifest has exactly eleven rows (six archived copies, five synthetic drafts), and each row's exit code and check-name set match the live validator output for that fixture.
- [ ] Task 1 — build-side, only if `git` resolves against the apex repo from the build environment: run `git status --porcelain` there → verify: no created, modified, renamed, or deleted entry under `docs/drafts/`. If git cannot reach that tree from the sandbox, record the check as not-runnable and defer wholly to the host criterion below — never substitute a coder-side read of the directory.
- [ ] Task 1 — **HOST verifies at close-out, not the coder:** the host captures SHA-256 and mtime of `gpt-5.6-family-adoption.md` before dispatch and again after the build → verify: both are unchanged. This criterion is deliberately outside the coder's reach, because hashing the file requires reading it and the coder is instructed not to open it.
- [ ] Task 2 — run `powershell.exe -NoProfile -File skills/apex-code/scripts/apex-spec-validate.ps1 -Version` → verify: stdout is exactly `apex-spec-validate contract 1.0.0` and the exit code is 0.
- [ ] Task 2 — bit-identical semantics: write `git show HEAD:skills/apex-code/scripts/apex-spec-validate.ps1` to a temp file `before-validator.ps1`, then run both it and the modified validator over all eleven corpus fixtures, capturing exit code plus the sorted `FAIL <check>` lines → verify: the two verdict sets are identical for every fixture, and the only textual difference in either run's output is the banner line the modified validator adds.
- [ ] Task 2 — in-process capture: from a PowerShell session, run `$out = @(& skills/apex-code/scripts/apex-spec-validate.ps1 -SpecPath <a failing corpus fixture>)` → verify: no element of `$out` contains the banner text, and every element still matches `^FAIL <check>: `.
- [ ] Task 3 — run `powershell.exe -NoProfile -File skills/apex-code/scripts/spec-contract-sweep.ps1 -Root <corpus root>` → verify: exit 0; one `PASS`/`FAIL` line per corpus fixture; the summary line's counts equal the manifest's; and SHA-256 hashes of every corpus file are identical before and after the run.
- [ ] Task 3 — inspect every `FAIL` line the sweep emits for the corpus → verify: no report line contains the substring `contract 1.0.0` or `[spec-validate]`, and each line's finding text consists only of `FAIL <check>: <evidence>` fragments joined by `; `.
- [ ] Task 3 — run the sweep with a non-existent `-Root`, and again with `-Exclude` naming one fixture → verify: exit 2 for the first; for the second, exit 0, a `SKIP` line for the named fixture, and a total one lower than the unfiltered run.
- [ ] Task 3 — force an infrastructure failure (point the sweep at a scratch tree whose spec the validator cannot read, or stub a validator returning exit 3) → verify: that spec is reported as an `ERROR` row carrying the child's exit code, it appears in neither the pass nor the fail count, the summary reports an error count of 1, and the sweep still exits 0.
- [ ] Task 3 — version binding: change `$SpecContractVersion` in a scratch copy of the validator and run the sweep against it → verify: the summary line reports the changed value, and a grep of `skills/apex-code/scripts/spec-contract-sweep.ps1` for a version-shaped literal returns no match.
- [ ] Task 4 — run `powershell.exe -NoProfile -File skills/apex-code/scripts/spec-validate-test.ps1` with no arguments → verify: exit 0, the default manifest path resolves to the tracked manifest, the final line reports a computed case total of 19 original cases plus the corpus and sweep cases with no hardcoded literal remaining, and the 19 original case names all report PASS.
- [ ] Task 4 — copy the manifest to a scratch file, mutate one row's expected exit code, and re-run the suite with `-CorpusManifestPath` pointing at that copy → verify: the suite exits 1 and names the mismatching fixture with both the expected and the actual verdict; the tracked manifest is unmodified.
- [ ] Task 5 — read `skills/apex-code/references/spec-contract.md` → verify: it states version 1.0.0, lists the four check labels and the eleven required headings exactly as the validator enforces them, and its contract-change procedure names `expected.tsv`, `skills/apex-code/scripts/spec-validate-test.ps1`, and `skills/apex-code/scripts/spec-contract-sweep.ps1` as ordered steps.
- [ ] Task 5 — read the contract-change procedure text → verify: a distinct numbered step between manifest regeneration and running the suite requires diffing the regenerated manifest against its previously committed version and justifying every changed row as an intended behaviour change before commit, and states that an unexplained changed row is a regression rather than a new expectation.
- [ ] Task 5 — read the enforced-semantics section → verify: it documents path-token recognition and the suffix-matching rule, the exact unresolved-marker tokens and their case-insensitivity, the bolded task syntax with bidirectional coverage, and unterminated-fence failure — each stated as the validator actually enforces it.
- [ ] Task 5 — read the version-site paragraph → verify: it names both `$SpecContractVersion` and this reference as the two version sites, and states the template pointer is version-less by design. No file under `skills/apex-orchestrate/` is modified by this spec.

## Progress
_(The build writes here — do not edit manually)_
