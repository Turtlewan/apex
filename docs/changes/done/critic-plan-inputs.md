---
spec: critic-plan-inputs
status: draft
autonomy_level: L2
risk: high
coder_effort: high
coder_model: gpt-6.1-sol
max_parallel_codex: 2
---

# Spec: Critic plan-slice inputs
<!-- Governing contract: ~/.claude/skills/apex-code/references/spec-contract.md. -->

**Identity:** Carry bounded plan-slice inputs into spec and code Critic reviews, including the AFK whole-build pass.

## Intent
- **Intent:** Let the Critic judge a plan slice against its cross-slice contracts and cited map sections in both review modes.
- **Invariants:** Plan-slice inputs are optional and follow C2 below exactly. The Critic treats the plan path as a reference only and never opens the plan file. The apex-code skill remains exactly 500 lines.
- **Non-goals:** Planning intake, gate creation or adjudication, plan artifact creation, map writing, and changes to other dispatchers. This spec builds the Critic receiver in `agents/apex-critic.md`, the code-mode dispatch in `skills/apex-code/SKILL.md`, and the AFK endgate pack. The sibling `planning-intake` spec builds the spec-mode producer in the spec-author and spec-mode Critic packs (`skills/apex-plan/SKILL.md` ~:121 and ~:246), which send the C6 clean slice brief and C2 plan-slice inputs; it lists this spec as a prerequisite so the receiver exists before those inputs are sent.

## Assumptions
- `skills/apex-code/SKILL.md` starts at `version: 2.25.0` and exactly 500 lines. -> impact: Stop
- The existing `apex-critic` dispatch sections and AFK endgate invocation and prompt anchors quoted below are present. -> impact: Stop
- A slice spec is identified by the C5 `## Intent` line; non-slice specs retain their existing Critic pack. -> impact: Caution

- The sibling `planning-intake` spec lists this receiver spec as a prerequisite and builds the spec-mode producer for the C6 clean slice brief and C2 plan-slice inputs. -> impact: Caution

Simplicity check: edit the three existing dispatch and review instructions in place.

## Prerequisites
none

## Files to Change
| File | Operation | Notes |
|------|-----------|-------|
| agents/apex-critic.md | modify | Task 1 optional plan-slice inputs in both modes and explicit scope exclusions. |
| skills/apex-code/SKILL.md | modify | Task 2 C5-triggered code-mode dispatch inputs and in-place version bump; exactly 500 lines. |
| skills/apex-code/references/afk-endgate.md | modify | Task 3 C5-triggered AFK whole-build Critic pack and prompt. |
| C:/Users/User/apex/SKILL-HISTORY.md | modify | HOST Task 4 newest apex-code and apex-critic agent row. |
| C:/Users/User/apex/CHANGELOG.md | modify | HOST Task 5 Unreleased Added bullet. |

## Execution manifest
```json apex-manifest
{
  "version": 1,
  "repos": { "claude": "C:/Users/User/.claude" },
  "tasks": [
    { "id": "1", "repo": "claude", "files": [{ "path": "agents/apex-critic.md", "op": "modify" }], "depends_on": [] },
    { "id": "2", "repo": "claude", "files": [{ "path": "skills/apex-code/SKILL.md", "op": "modify" }], "depends_on": [] },
    { "id": "3", "repo": "claude", "files": [{ "path": "skills/apex-code/references/afk-endgate.md", "op": "modify" }], "depends_on": [] }
  ]
}
```

## Tasks
The coder writes these shared contracts verbatim where each task calls for them. C1, C3, and C4 do not apply to this spec.

- C2 the Critic's optional input block is named **plan-slice inputs** = (a) the plan path `docs/plans/<plan>.md`, (b) that slice's section text, (c) the plan's cross-slice contracts section text, (d) the map sections the slice cites, all pasted into the prompt by the dispatcher. Gate findings, `gate-N` rows, adjudication history and the rest of the plan narrative are never plan-slice inputs. The plan path is a reference only: the Critic never opens the plan file and relies on the pasted section texts.
- C5 spec-to-slice association: a slice spec's `## Intent` block carries the line `plan: docs/plans/<plan>.md · slice: <slice-id>`; the plan's slices table maps each slice-id to its spec name.
- C6 clean slice brief: for a Big plan slice, the spec-author pack and every Critic pack (spec mode) carry the slice brief (slice intent, cross-slice contracts, cited map sections) in place of the full adjudicated plan brief; gate findings and adjudication are removed.

- [ ] **Task 1** - In `agents/apex-critic.md`, amend only `### mode: spec` and `### mode: code` so both accept optional plan-slice inputs, judge a slice against its cross-slice contracts and cited map sections, and keep the planning exclusions explicit. - files: `agents/apex-critic.md` - done when both modes authorize the same bounded optional input block and exclude all other plan narrative.
  - In `### mode: spec`, replace the current anchor `Review the current full draft against the supplied author prompt pack's plan brief and the live named files. Those inputs are the complete authority for the review.` with instructions to review against the author pack's plan brief, or the C6 clean slice brief for a plan slice, plus live named files and any supplied C2 plan-slice inputs. Write C2 verbatim in this mode, including its exclusion and reference-only sentences. Direct the Critic to judge the slice against its cross-slice contracts and cited map sections using only the pasted section texts; never open the plan file.
  - Replace the spec-mode scope anchor `Other planning narrative and all review sidecars are out of scope.` with wording that keeps the existing status, roadmap, research, handoff, ADR, other-spec, and review-sidecar exclusions and expressly excludes `gate findings`, `gate-N` rows, `adjudication history`, and `the rest of the plan narrative`; the explicitly supplied prior-round findings file remains permitted for a fix check.
  - In `### mode: code`, follow the bullet anchor `- optionally, the coding-principles reference.` with an optional input block that writes C2 verbatim, including its exclusion and reference-only sentences. Amend the anchor `Review the changed files against those supplied requirements.` to direct comparison with the slice's cross-slice contracts and cited map sections when supplied, using only the pasted section texts; never open the plan file. Replace the scope anchor `Never read planning narrative or review sidecars.` with wording that retains the authorized changed files, criteria/spec, coding-principles reference, and fix-check prior findings and current full diff, while explicitly excluding `gate findings`, `gate-N` rows, `adjudication history`, and `the rest of the plan narrative`.
  - In `### mode: code`, replace the current concerns bullet anchor `- the coder's concerns pasted verbatim, including an explicit statement when there are none; and` with `- the coder's concerns pasted verbatim, including an explicit statement when there are none, except that the AFK whole-build pass (`skills/apex-code/references/afk-endgate.md`) supplies no coder concerns and the Critic reviews that pass without them; and`. Keep Task 3's AFK pack free of coder concerns.
- [ ] **Task 2** - In `skills/apex-code/SKILL.md`, add the C2 inputs to the normal code-mode Critic dispatch for a C5 plan slice and bump the frontmatter version in place, with net zero line changes. - files: `skills/apex-code/SKILL.md` - done when the dispatch names every C2 input, uses the C5 Intent line as trigger, and the file remains exactly 500 lines.
  - Replace `version: 2.25.0` with `version: 2.26.0` on the same frontmatter line.
  - Reflow only the non-blank lines 380-382, anchored by "review only that wave's changed files and criteria. Otherwise review once after the whole build.", "Include the applicable spec criteria, full diff for the scope, and `<final>.concerns.md` verbatim.", and "Apply all four silent-regression lenses in `references/silent-regression-lenses.md`." Keep the spec criteria, scope diff, verbatim concerns, and four lenses. In those three lines, require that when `## Intent` contains the C5 line `plan: docs/plans/<plan>.md · slice: <slice-id>`, the dispatcher also pastes the four C2 parts under the label `plan-slice inputs`: the plan path `docs/plans/<plan>.md`, that slice's section text, the plan's cross-slice contracts section text, and the map sections the slice cites. Include this sentence verbatim: "The plan path is a reference only: the Critic never opens the plan file and relies on the pasted section texts." Long lines are allowed. Line 383 stays blank, preserving the paragraph break before "Each wave or whole-build scope has a three-round cap"; do not add a line elsewhere to offset an added line here.
- [ ] **Task 3** - In `skills/apex-code/references/afk-endgate.md`, extend the whole-build Critic pack and adversarial prompt for a C5 plan slice. - files: `skills/apex-code/references/afk-endgate.md` - done when the AFK dispatch and prompt include the C2 inputs for a plan slice alongside the run spec and whole-run diff, and retain the outside-input exclusion.
  - In `## Invocation (read-only, host-dispatched)`, replace the anchor `so give it the run spec + whole-run diff and nothing else.` with a conditional: when the run spec's `## Intent` contains the C5 line `plan: docs/plans/<plan>.md · slice: <slice-id>`, also paste the four C2 parts under the label `plan-slice inputs`: the plan path `docs/plans/<plan>.md`, that slice's section text, the plan's cross-slice contracts section text, and the map sections the slice cites. Keep `nothing else` for material outside the run spec, whole-run diff, and conditional C2 inputs; retain the `earlier Critic findings` and `coder summary` exclusions and the permitted prior-round findings for fix checks.
  - In `## Adversarial prompt (fill the placeholders)`, follow the anchor "> `<paste the applicable run specification and task intent>`" with a conditional `plan-slice inputs` slot containing the plan path `docs/plans/<plan>.md`, that slice's section text, the plan's cross-slice contracts section text, and the map sections the slice cites, with the plan path marked reference only. Keep the existing whole-run changed-files slot `<paste git diff <run_base_sha>..HEAD>` and review instructions.
- [ ] **Task 4 (HOST)** - Prepend one `critic-plan-inputs` row to `C:/Users/User/apex/SKILL-HISTORY.md` naming `skills/apex-code/SKILL.md` at `2.26.0`, `skills/apex-code/references/afk-endgate.md`, and `agents/apex-critic.md` as an agent with no version field. - files: `C:/Users/User/apex/SKILL-HISTORY.md` - done when the newest data row records the three edited files and the apex-code version.
- [ ] **Task 5 (HOST)** - Add one `critic-plan-inputs` bullet under `### Added` of `## [Unreleased]` in `C:/Users/User/apex/CHANGELOG.md`, naming the optional bounded Critic plan-slice inputs in spec mode, code mode, and the AFK whole-build pass. - files: `C:/Users/User/apex/CHANGELOG.md` - done when exactly one such bullet appears in that subsection.

## Wave plan
Wave 1: [1, 2, 3] | HOST: [4, 5]. High builds run sequentially.

## Permissions
Coder tasks own only their file-disjoint manifest paths. HOST owns the two bookkeeping files outside the manifest. No network or live-repository Git write operation.

### File Operations
| Action | Paths |
|--------|-------|
| Modify (coder Task 1) | agents/apex-critic.md |
| Modify (coder Task 2) | skills/apex-code/SKILL.md |
| Modify (coder Task 3) | skills/apex-code/references/afk-endgate.md |
| Modify (HOST Task 4) | C:/Users/User/apex/SKILL-HISTORY.md |
| Modify (HOST Task 5) | C:/Users/User/apex/CHANGELOG.md |

### Commands
| Command | Purpose |
|---------|---------|
| `Get-Content -Raw -Encoding UTF8` | HOST normalizes whitespace and checks the exact required and excluded literals in each named file. |
| Build repository Verify commands fence | HOST runs the full structural and script verification recipe. |

### Git Operations
| Operation | Scope |
|-----------|-------|
| (none) | No staging or commits. |

### Environment Access
| Variable | Purpose |
|----------|---------|
| (none) | No environment variable required. |

### Network
| Action | Purpose |
|--------|---------|
| (none) | No network operation. |

## Specialist Context
### Security
Critic inputs are prompt content only. The dispatchers paste the bounded C2 text and do not grant the Critic access to the plan's gate record or other planning narrative.

### Performance
(none)

### Accessibility
(none)

## Documentation
| Doc type | File | Action |
|----------|------|--------|
| Agent instruction | agents/apex-critic.md | Task 1 amends both review modes. |
| Skill instruction | skills/apex-code/SKILL.md | Task 2 amends code dispatch and version. |
| Reference | skills/apex-code/references/afk-endgate.md | Task 3 amends whole-build dispatch and prompt. |
| History | C:/Users/User/apex/SKILL-HISTORY.md | HOST prepends one row. |
| Changelog | C:/Users/User/apex/CHANGELOG.md | HOST adds one Unreleased Added bullet. |

## Acceptance Criteria
For every presence or absence literal below, HOST reads the named file as UTF-8 and normalizes whitespace before matching. Run literals containing `·` (U+00B7), `—` (U+2014), or `§` (U+00A7) from a UTF-8 PowerShell script file. Substitute each listed exact literal and its label into the applicable form; for Task 1, apply the presence literals separately to the `### mode: spec` and `### mode: code` sections of the normalized text. Double every apostrophe inside a single-quoted PowerShell literal (including substituted labels), as in `$t.Contains('that slice''s section text')` and `$t.Contains('the plan''s cross-slice contracts section text')`; alternatively use a double-quoted string with no `$`:

```powershell
$t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath <file>) -replace '\s+', ' '); if (-not $t.Contains('<literal>')) { throw '<label>' }
$t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath <file>) -replace '\s+', ' '); if ($t.Contains('<literal>')) { throw '<label>' } # absence
```

- [ ] Task 1 - both Critic modes accept only the optional C2 block and judge a slice against its contracts and map -> verify: apply the Task 1 presence literals listed below to each of the `### mode: spec` and `### mode: code` sections of `agents/apex-critic.md`, and the code-mode exception literal to only the `### mode: code` section; apply the absence literal to the whole normalized file. Check that the prior-round fix-check exception remains and no instruction asks for the full plan or gate output.
- [ ] Task 2 - normal code-mode dispatch includes C2 for a C5 Intent marker and the skill version changes in place -> verify: apply the Task 2 literals listed below to `skills/apex-code/SKILL.md`. Check that the C5 Intent marker is the condition, the plan path is reference only, line 383 stays blank before the three-round-cap paragraph, and the file is exactly 500 lines.
- [ ] Task 3 - the AFK whole-build dispatch and prompt carry C2 for a C5 slice, with bounded scope -> verify: apply the Task 3 literals listed below to `skills/apex-code/references/afk-endgate.md`. Check that the Critic-findings and coder-summary exclusions remain, the prompt provides conditional C2 without a concerns slot, and ordinary specs keep the run spec plus whole-run diff pack.

The exact match literals for the preceding three checks are:

```text
Task 1 presence (each mode):
**plan-slice inputs**
the plan path `docs/plans/<plan>.md`
that slice's section text
the plan's cross-slice contracts section text
the map sections the slice cites
all pasted into the prompt by the dispatcher
Gate findings, `gate-N` rows, adjudication history and the rest of the plan narrative are never plan-slice inputs.
The plan path is a reference only: the Critic never opens the plan file and relies on the pasted section texts.
Task 1 code-mode exception presence:
the AFK whole-build pass (`skills/apex-code/references/afk-endgate.md`) supplies no coder concerns and the Critic reviews that pass without them
Task 1 absence (whole file):
Never read planning narrative or review sidecars.

Task 2 presence:
version: 2.26.0
plan: docs/plans/<plan>.md · slice: <slice-id>
plan-slice inputs
the plan path `docs/plans/<plan>.md`
that slice's section text
the plan's cross-slice contracts section text
the map sections the slice cites
Include the applicable spec criteria, full diff for the scope, and `<final>.concerns.md` verbatim.
Apply all four silent-regression lenses in `references/silent-regression-lenses.md`.
Task 2 absence:
version: 2.25.0

Task 3 presence:
plan: docs/plans/<plan>.md · slice: <slice-id>
plan-slice inputs
the plan path `docs/plans/<plan>.md`
that slice's section text
the plan's cross-slice contracts section text
the map sections the slice cites
nothing else
earlier Critic findings
coder summary
<paste the applicable run specification and task intent>
<paste git diff <run_base_sha>..HEAD>
Task 3 absence:
so give it the run spec + whole-run diff and nothing else.
```
- [ ] Task 4 - HOST history bookkeeping is present -> verify: the newest data row in `C:/Users/User/apex/SKILL-HISTORY.md` names `critic-plan-inputs`, all three coder files, apex-code `2.26.0`, and the apex-critic agent.
- [ ] Task 5 - HOST changelog bookkeeping is present -> verify: `C:/Users/User/apex/CHANGELOG.md` has exactly one `critic-plan-inputs` bullet under `## [Unreleased]` / `### Added`.
- [ ] Build repository verify fence - HOST runs every command below from the build repository root -> verify: this is the current `## Verify commands` fence of the build repository's AGENTS file, copied verbatim, and all commands pass.
```
node --check hooks/destructive-command-guard.js
node --check hooks/lib/destructive-detect.js
python hooks/destructive-guard-test.py
powershell.exe -NoProfile -File skills/apex-code/scripts/baseline-check-test.ps1
powershell.exe -NoProfile -File skills/apex-code/scripts/spec-validate-test.ps1
powershell.exe -NoProfile -File skills/apex-code/scripts/dispatch-preflight-test.ps1
powershell.exe -NoProfile -File skills/apex-code/scripts/dispatch-events-test.ps1
powershell.exe -NoProfile -File skills/apex-code/scripts/tree-pin-test.ps1
powershell.exe -NoProfile -File skills/apex-code/scripts/scope-check-test.ps1
powershell.exe -NoProfile -File skills/apex-code/scripts/dispatch-author-test.ps1
powershell.exe -NoProfile -File skills/apex-code/scripts/engine-plan-test.ps1
powershell.exe -NoProfile -File skills/apex-code/scripts/engine-git-test.ps1
powershell.exe -NoProfile -File skills/apex-code/scripts/engine-dispatch-test.ps1
powershell.exe -NoProfile -File skills/apex-code/scripts/apex-drain-plan-test.ps1
powershell.exe -NoProfile -File skills/apex-code/scripts/apex-drain-test.ps1 -Case core
powershell.exe -NoProfile -File skills/apex-code/scripts/apex-drain-test.ps1 -Case recovery
powershell.exe -NoProfile -File skills/apex-code/scripts/apex-drain-test.ps1 -Case resume
powershell.exe -NoProfile -File skills/apex-code/scripts/apex-drain-test.ps1 -Case safety
powershell.exe -NoProfile -File skills/apex-code/scripts/apex-drain-close-test.ps1
powershell.exe -NoProfile -File skills/apex-plan/scripts/apex-map-check-test.ps1
powershell.exe -NoProfile -File skills/apex-plan/scripts/apex-size-guard-test.ps1
powershell.exe -NoProfile -File skills/apex-code/scripts/engine-test.ps1
```
- [ ] Scope - only the five `## Files to Change` paths are written -> verify: in both repositories (`C:/Users/User/.claude` and `C:/Users/User/apex`), before the build HOST saves the full `git status --porcelain -uall` list and `git hash-object` for every listed path that still exists on disk; a deleted path is recorded by its status entry alone and is never hashed. After the build and HOST bookkeeping, HOST saves the same list and hashes again. Pass when every path that is new in the after-list, or whose status or hash changed, is one of the five `## Files to Change` paths, and the two bookkeeping files differ from their before-content only by this spec's row/bullet. The wrapper/Engine scope gate (`codex-scope-check.ps1`) remains the evidence that each coder task wrote only its own file.
- [ ] Reachability - the normal and AFK code-mode dispatches feed the same optional C2 block accepted by `apex-critic` -> verify: HOST traces both callers' C5 trigger and four C2 values to the code-mode input list; traces the spec-mode input list to the slice review instruction; confirms ordinary specs omit the block.

## Progress
_(The build writes here — do not edit manually)_
