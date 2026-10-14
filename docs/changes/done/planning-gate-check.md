---
spec: planning-gate-check
status: draft
autonomy_level: L2
risk: high
coder_effort: high
coder_model: gpt-6.1-sol
max_parallel_codex: 2
---

# Spec: Planning gate check
<!-- Governing contract: ~/.claude/skills/apex-code/references/spec-contract.md. -->

**Identity:** Add the Big planning-gate review and durable plan-artifact protocol to the Sol plan-check reference, session checker row, and ADR.

## Intent
- **Intent:** Give Big plans a bounded owner-approved gate and a durable slice plan before spec authoring.
- **Invariants:** The gate replaces only Big's pre-draft architecture pass; non-Big Medium/High Deep Details keeps that pass; every eligible slice spec gets its own post-readiness cold read without gate output. The HOST alone owns the plan pointer and close-out records.
- **Non-goals:** Intake routing, Critic implementation, spec-template changes, first maps, Scribe map rewrites, and edits to live status state.

## Assumptions
- The reference still contains the quoted pre-draft trigger and cold-read tier anchors below. → impact: Stop
- The session-context Checker row is still one physical line and the file is 64 lines. → impact: Stop
- The sibling planning-intake spec may bump the apex-plan SKILL file before close-out; this spec never modifies that file. → impact: Caution

Simplicity check: One coder-owned reference edit and separate HOST edits to the hook and ADR.

## Prerequisites
none

## Files to Change
| File | Operation | Notes |
|------|-----------|-------|
| skills/apex-plan/references/sol-plan-check.md | modify | Task 1 Big gate, plan artifact, and pre-draft trigger/tier amendments. |
| C:/Users/User/.claude/hooks/apex-session-context.md | modify | HOST Task 2 Checker row replacement. |
| C:/Users/User/apex/docs/technical/adr/ADR-048-role-redesign.md | modify | HOST Task 3 binding-decision amendment. |
| C:/Users/User/apex/SKILL-HISTORY.md | modify | HOST Task 4 reference-only history row. |
| C:/Users/User/apex/CHANGELOG.md | modify | HOST Task 5 Unreleased Added bullet. |

## Execution manifest
```json apex-manifest
{
  "version": 1,
  "repos": { "claude": "C:/Users/User/.claude" },
  "tasks": [
    { "id": "1", "repo": "claude", "files": [
      { "path": "skills/apex-plan/references/sol-plan-check.md", "op": "modify" }
    ], "depends_on": [] }
  ]
}
```

## Tasks
- [ ] **Task 1** - In `skills/apex-plan/references/sol-plan-check.md`, insert `## Planning gate check` and `## Plan artifact` immediately before the current `## Pre-draft architecture pass (ADR-032 §1b)` heading. In Planning gate check, direct the HOST to create the C2 plan path in the spec-owning repo BEFORE the first gate dispatch, containing the one-screen Big plan brief, a slices table with columns slice-id / spec name / wave / size / risk / predicted files, one `### Slice <slice-id>` section per slice containing that slice's intent, predicted files, and cited map sections, cross-slice contracts, and an empty gate-record table with header `| Round | Dispatched (UTC) | Reviewer | Plan digest | Verdict | Disposition |`. The brief pastes the cited map sections of every target code repo; the wrapper runs in the spec-owning repo and may not see target code. Dispatch gpt-6.1-sol at xhigh through `codex-dispatch.ps1 -Spec <plan> -Task gate-check -Phase review -Worktree <spec-owning repo> -BaseSha <HEAD> -Schema review -Effort xhigh -SkipScopeCheck -Prompt $prompt`; set the one-screen brief as the review input and request design, contract, grounding, and decision findings, not wording findings. The prompt's first line is `SPEC-DIGEST: <git hash-object of the plan file at dispatch>`. Use `gate-N` Round tokens and the sidecar's two-phase row lifecycle: at dispatch append a row with Round, Dispatched (UTC), Reviewer, and Plan digest filled, with Verdict and Disposition both `pending`; at adjudication complete that same row with the returned JSON `verdict` field of `codex-review-schema.json` (BLOCK / FLAG / CLEAN as the schema defines it) and the outcome. A gate dispatch that the wrapper refuses, times out, or declares VOID (including a tree-pin VOID, exit 69), or that returns no parseable review JSON, completes its pending row with Disposition `VOID`; record Verdict as `—` when no valid review verdict exists. A VOID row does not count toward the two-read budget, and the HOST may re-dispatch the same read. Bind the digest to the plan content before appending its own pending gate row; at adjudication reconstruct the dispatch-time plan by omitting this gate row entirely, including its lifecycle cells, and compare its hash to the recorded Plan digest. Any hash mismatch at adjudication makes the read `VOID` and discards its findings unread. This planning gate is the one exception to `No plan-check-family dispatch may occur outside the sidecar record`: its record is the plan file's gate-record table. Keep `codex-review-schema.json` unchanged: `severity` carries `BLOCK` / `FLAG` / `CLEAN`, and `criterion` begins with `design:`, `contract:`, `grounding:`, or `decision:`. After each row's adjudication, require the HOST to rule on every non-VOID finding once in writing in the plan; allow a second read only when the approach changed, scoped to the changed section, maximum two reads per gate cycle; then pass or park both sides for the owner. The approval step renders the apex-governance § Approval gate banner with `Action:`, `Scope:`, `Risks:`, `Rollback:`, and `Approve? [y / n / edit]`; attach the one-screen brief containing goal, approach and rejected alternatives, system changes with cited map sections, slices table with slice-id / spec name / wave / size / risk / predicted files, check summary including rejected findings, and decisions with proposals. In Plan artifact, keep the approved brief, slices table, each `### Slice <slice-id>` section, cross-slice contracts and `gate-N` rows in the C2 plan path; gate rows never count toward a spec round cap. That slice's section text in C2 and the clean slice brief in C6 come from its `### Slice <slice-id>` section. Judge wave completion and the C4 pointer from the slices table's `wave` column. After the plan moves to `docs/plans/done/`, a slice spec's C5 line `plan: docs/plans/<plan>.md` resolves to `docs/plans/done/<plan>.md`. Implement C1-C6 verbatim from the contract block in Task 3. The HOST maintains the C4 In-Flight pointer row in the C4 status file of the spec-owning repo, advances it only after every slice spec of wave N archives to `docs/changes/done/`, and after the last slice archives moves the plan to `docs/plans/done/` and deletes the pointer. Replace the current Trigger paragraph, cold-read tier sentence, cold-read prompt sentence, and cold-read prompt self-description bullet quoted below: Big uses the planning gate instead of the pre-draft pass, non-Big Medium/High Deep Details keeps both pre-draft and post-readiness reads, and each eligible slice cold read remains independent and sees no gate output. Keep the rest of the pre-draft dispatch protocol and cold-read section intact, except the quoted self-description bullet. The old ending `Do not open docs/drafts/*.review.log or docs/plans/.` must be absent. - files: `skills/apex-plan/references/sol-plan-check.md` - done when both exact C1 headings and C2-C6 strings are present, the dispatch and review/disposition mechanisms are written, the cold-read prompt excludes `docs/plans/`, the self-description bullet names the new ending and says a cold reader opening a plan file would also see gate output, and the old universal tier sentence is gone.

  Task 1 pointer location and contract, verbatim:
  ```text
  C4 the In-Flight pointer row in docs/status.md: `plan · docs/plans/<plan>.md · next wave <N>`, HOST-maintained, one row per active plan. N = the earliest unfinished wave. The pointer advances only after every slice spec of wave N has archived to docs/changes/done/.
  The location is `docs/status.md` in the spec-owning repo.
  ```

  Current Trigger paragraph to replace, under `## Pre-draft architecture pass (ADR-032 §1b)`:
  ```text
  **Trigger:** Low and doc-only specs skip this pass; Medium and High retain it in addition to the
  cold read above, never as a replacement. An explicit `risk: high` overrides doc-only, and an
  unresolved High BLOCK remains blocking. Same wrapper, same read-only Sol; different input,
  different lens: it judges the PLAN, and no spec exists yet.
  ```

  Replacement Trigger paragraph:
  ```text
  **Trigger:** Big changes use § Planning gate check instead of this pass. For non-Big Deep Details
  specs, Low and doc-only skip this pass; Medium and High retain it in addition to their independent
  post-readiness cold read. An explicit `risk: high` overrides doc-only, and an unresolved High BLOCK
  remains blocking. Same wrapper, same read-only Sol; different input, different lens: it judges
  the PLAN, and no spec exists yet.
  ```

  Current tier sentence to replace, within `- **The cold read stays cold.**`:
  ```text
  The pre-draft
  pass and post-readiness read use the same tier trigger: Low and doc-only skip both; Medium and
  High retain both. Neither substitutes for the other.
  ```

  Replacement tier sentence:
  ```text
  Big changes use the planning gate instead of the pre-draft pass; non-Big Medium/High Deep Details
  specs retain both reads. Every eligible slice spec gets its own post-readiness cold read by its own
  tier, without gate findings or adjudication. Neither planning read substitutes for the cold read.
  ```

  Current cold-read prompt sentence to replace, under `## The cold read (the gate)`:
  ```text
  wrong thing) / FLAG (planning should decide) / CLEAN, each with file/line + rationale. Judge
  the spec, do not rewrite it. Do not open docs/drafts/*.review.log."*
  ```

  Replacement cold-read prompt sentence:
  ```text
  wrong thing) / FLAG (planning should decide) / CLEAN, each with file/line + rationale. Judge
  the spec, do not rewrite it. Do not open docs/drafts/*.review.log, docs/drafts/*.findings.json or docs/plans/."*
  ```

  Current cold-read prompt self-description bullet to replace:
  ```text
  - **The cold-read prompt excludes the sidecar — discovery, not just delivery.** The prompt shape in
    § The cold read above now ends with `Do not open docs/drafts/*.review.log.` The sidecar carries
    prior findings, this pass's among them, so a cold reader that opens it is no longer cold.
  ```

  Replacement cold-read prompt self-description bullet:
  ```text
  - **The cold-read prompt excludes the sidecar — discovery, not just delivery.** The prompt shape in
    § The cold read above now ends with `Do not open docs/drafts/*.review.log, docs/drafts/*.findings.json or docs/plans/.` The sidecar carries
    prior findings, this pass's among them, so a cold reader that opens it is no longer cold. A cold
    reader that opens a plan file would also see gate output.
  ```

- [ ] **Task 2 (HOST)** - In `C:/Users/User/.claude/hooks/apex-session-context.md`, replace the single Checker table row anchored by `| Checker | Claude \`apex-critic\`` with the exact row below, keeping it one physical line and keeping the file at 64 lines. - files: `C:/Users/User/.claude/hooks/apex-session-context.md` - done when the replacement row is exact.

  Current row to replace:
  ```text
  | Checker | Claude `apex-critic` serves both `mode: spec` and `mode: code`. Every Agent tool dispatch passes `model: sonnet` for Low, Medium, and doc-only reviews or `model: opus` for High; the Agent tool's `model:` parameter takes precedence over the agent file's default frontmatter `model: sonnet`. Both Sol reads (the pre-draft architecture pass and post-readiness cold read) run only for Deep Details specs at Medium or High risk; Low, doc-only, Light, and Bug Fix skip them. Codex-built code gets no extra Sol cross-family pass. An agent never reviews its own output. |
  ```

  Replacement row:
  ```text
  | Checker | Claude `apex-critic` serves both `mode: spec` and `mode: code`. Every Agent tool dispatch passes `model: sonnet` for Low, Medium, and doc-only reviews or `model: opus` for High; the Agent tool's `model:` parameter takes precedence over the agent file's default frontmatter `model: sonnet`. For Big changes, the planning-gate read uses gpt-6.1-sol at xhigh instead of the pre-draft architecture pass. Non-Big Medium/High Deep Details specs keep the pre-draft architecture pass; every eligible spec, including each eligible Big slice, gets its own post-readiness gpt-6.1-sol cold read by its own tier, without gate output. Low, doc-only, Light, and Bug Fix skip the spec-level Sol reads. Codex-built code gets no extra Sol cross-family pass. An agent never reviews its own output. |
  ```

- [ ] **Task 3 (HOST)** - In `C:/Users/User/apex/docs/technical/adr/ADR-048-role-redesign.md`, add a Stage 6 wave 2 amendment dated `2026-10-13` under the existing `6. System map + planning gate` line, before `**Stage 1 in detail**`. Record the brief's binding decisions: Big-only gpt-6.1-sol xhigh gate replaces the pre-draft pass; non-Big Medium/High Deep Details retains it; every eligible slice gets an independent post-readiness cold read without gate output; Trivial takes a one-task Light spec with only the map-read exemption and the HOST close-out size guard, with OVER returning to map read and normal review before commit; select maps from target code repos (manifest build repos), never cwd or the spec-owning repo, and skip repos without maps; unchanged per-spec split rule (>3 files or >2 phases) versus plan-level slice caps (~15 files / 6 tasks) and six-slice soft cap; HOST SKILL-HISTORY and CHANGELOG bookkeeping excluded from this three-spec split calculation and serialized with per-spec staging; readiness `Files evidence` / `Grep evidence:` line dropped; first maps and Scribe map rewrites deferred. Record C1-C6 verbatim from the block below without changing prior historical text. All C1-C6 apply to this spec; none are inapplicable. - files: `C:/Users/User/apex/docs/technical/adr/ADR-048-role-redesign.md` - done when the amendment explicitly contains all binding decisions and C1-C6 contracts without changing prior historical text.

  Required decision phrases (each must appear verbatim in the ADR amendment):
  ```text
  Big-only gpt-6.1-sol xhigh gate
  non-Big Medium/High Deep Details
  post-readiness cold read without gate output
  one-task Light spec
  OVER
  before commit
  target code repos
  never cwd or the spec-owning repo
  >3 files or >2 phases
  ~15 files / 6 tasks
  six-slice soft cap
  SKILL-HISTORY
  CHANGELOG
  Files evidence
  Grep evidence:
  first maps
  Scribe map rewrites
  ```

  Contract text for the amendment:
  ```text
  C1 headings in skills/apex-plan/references/sol-plan-check.md: `## Planning gate check` and `## Plan artifact`.
  C2 the Critic's optional input block is named **plan-slice inputs** = (a) the plan path `docs/plans/<plan>.md`, (b) that slice's section text, (c) the plan's cross-slice contracts section text, (d) the map sections the slice cites, all pasted into the prompt by the dispatcher. Gate findings, `gate-N` rows, adjudication history and the rest of the plan narrative are never plan-slice inputs. The plan path is a reference only: the Critic never opens the plan file and relies on the pasted section texts.
  C3 plan-gate finding transport: codex-review-schema.json unchanged; `severity` carries BLOCK/FLAG/CLEAN; the class is a prefix of `criterion`: `design:` `contract:` `grounding:` `decision:` (wording findings are not requested).
  C4 the In-Flight pointer row in docs/status.md: `plan · docs/plans/<plan>.md · next wave <N>`, HOST-maintained, one row per active plan. N = the earliest unfinished wave. The pointer advances only after every slice spec of wave N has archived to docs/changes/done/.
  C5 spec-to-slice association: a slice spec's `## Intent` block carries the line `plan: docs/plans/<plan>.md · slice: <slice-id>`; the plan's slices table maps each slice-id to its spec name.
  C6 clean slice brief: for a Big plan slice, the spec-author pack and every Critic pack (spec mode) carry the slice brief (slice intent, cross-slice contracts, cited map sections) in place of the full adjudicated plan brief; gate findings and adjudication are removed.
  ```
- [ ] **Task 4 (HOST)** - Prepend one `planning-gate-check` row at the top of the data rows in `C:/Users/User/apex/SKILL-HISTORY.md`, after the existing `One row per event` introduction. Name `skills/apex-plan/references/sol-plan-check.md`, `hooks/apex-session-context.md`, and the ADR amendment; record `apex-plan (reference only; SKILL.md version as current at close-out)` and name the spec path in the final cell. This spec does not bump apex-plan's SKILL.md version. - files: `C:/Users/User/apex/SKILL-HISTORY.md` - done when the newest row identifies this spec, the changed reference, and the version-neutral reference-only entry.
- [ ] **Task 5 (HOST)** - Add exactly one `planning-gate-check` bullet under the existing `## [Unreleased]` / `### Added` anchors in `C:/Users/User/apex/CHANGELOG.md`, naming the Big planning gate, plan artifact and pointer protocol, and independent slice cold read. - files: `C:/Users/User/apex/CHANGELOG.md` - done when exactly one such bullet appears in that subsection.

## Wave plan
Wave 1: [1] | HOST: [2, 3] + bookkeeping [4, 5].

## Permissions
Coder Task 1 edits only its manifest path. HOST performs Tasks 2-5 and serializes bookkeeping at close-out. No network access or live Git write is required for this build.

### File Operations
| Action | Paths |
|--------|-------|
| Modify (coder Task 1) | skills/apex-plan/references/sol-plan-check.md |
| Modify (HOST Task 2) | C:/Users/User/.claude/hooks/apex-session-context.md |
| Modify (HOST Task 3) | C:/Users/User/apex/docs/technical/adr/ADR-048-role-redesign.md |
| Modify (HOST Task 4) | C:/Users/User/apex/SKILL-HISTORY.md |
| Modify (HOST Task 5) | C:/Users/User/apex/CHANGELOG.md |

### Commands
| Command | Purpose |
|---------|---------|
| Build repository `AGENTS.md` Verify commands fence | HOST runs the full structural and script checks. |
| `Get-Content -Raw -Encoding UTF8 -LiteralPath`, `git hash-object`, and content diff | HOST checks normalized exact strings, absence, line caps, and this spec's content changes. |

### Git Operations
| Operation | Scope |
|-----------|-------|
| (none) | Build leaves integration to the host. |

### Environment Access
| Variable | Purpose |
|----------|---------|
| (none) | No environment access required. |

### Network
| Action | Purpose |
|--------|---------|
| (none) | No network operation. |

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
| Reference | skills/apex-plan/references/sol-plan-check.md | Task 1 adds the gate and plan protocol. |
| ADR | C:/Users/User/apex/docs/technical/adr/ADR-048-role-redesign.md | HOST Task 3 appends the Stage 6 amendment. |
| History | C:/Users/User/apex/SKILL-HISTORY.md | HOST Task 4 prepends one reference-only row. |
| Changelog | C:/Users/User/apex/CHANGELOG.md | HOST Task 5 adds one Unreleased Added bullet. |

## Acceptance Criteria
Every presence or absence literal below uses a fresh UTF-8 read with whitespace normalization. Substitute each listed literal and label into this exact form; for absence, invert the `if` condition. Run every check line containing `·`, `—` or `§` from a UTF-8 script file. Escape apostrophes in single-quoted literals by doubling them.
```powershell
$t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath <file>) -replace '\s+', ' '); if (-not $t.Contains('<literal>')) { throw '<label>' }
```
- [ ] Task 1 - Big gate and plan artifact contract is present → verify: HOST runs the UTF-8, whitespace-normalized literal checks below against `C:/Users/User/.claude/skills/apex-plan/references/sol-plan-check.md`. Each quoted argument to `Contains` is the exact literal to match. The absent old tier literal is `pass and post-readiness read use the same tier trigger: Low and doc-only skip both; Medium and High retain both.` The pre-draft wrapper protocol outside the named edits remains present by content diff.
  ```powershell
  $file = 'C:/Users/User/.claude/skills/apex-plan/references/sol-plan-check.md'
  $t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath $file) -replace '\s+', ' '); if (-not $t.Contains('## Planning gate check')) { throw 'gate heading' }
  $t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath $file) -replace '\s+', ' '); if (-not $t.Contains('## Plan artifact')) { throw 'artifact heading' }
  $t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath $file) -replace '\s+', ' '); if (-not $t.Contains('Dispatch gpt-6.1-sol at xhigh through')) { throw 'gate model' }
  $t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath $file) -replace '\s+', ' '); if (-not $t.Contains('-Task gate-check')) { throw 'gate task' }
  $t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath $file) -replace '\s+', ' '); if (-not $t.Contains('-Effort xhigh')) { throw 'gate effort' }
  $t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath $file) -replace '\s+', ' '); if (-not $t.Contains('SPEC-DIGEST: <git hash-object of the plan file at dispatch>')) { throw 'digest prompt' }
  $t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath $file) -replace '\s+', ' '); if (-not $t.Contains('| Round | Dispatched (UTC) | Reviewer | Plan digest | Verdict | Disposition |')) { throw 'gate columns' }
  $t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath $file) -replace '\s+', ' '); if (-not $t.Contains('the returned JSON `verdict` field of `codex-review-schema.json` (BLOCK / FLAG / CLEAN as the schema defines it)')) { throw 'gate verdict field' }
  $t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath $file) -replace '\s+', ' '); if (-not $t.Contains('A gate dispatch that the wrapper refuses, times out, or declares VOID (including a tree-pin VOID, exit 69), or that returns no parseable review JSON, completes its pending row with Disposition `VOID`')) { throw 'wrapper VOID row' }
  $t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath $file) -replace '\s+', ' '); if (-not $t.Contains('A VOID row does not count toward the two-read budget, and the HOST may re-dispatch the same read.')) { throw 'VOID retry budget' }
  $t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath $file) -replace '\s+', ' '); if (-not $t.Contains('gate-N')) { throw 'gate round' }
  $t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath $file) -replace '\s+', ' '); if (-not $t.Contains('Any hash mismatch at adjudication makes the read `VOID` and discards its findings unread.')) { throw 'digest mismatch' }
  $t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath $file) -replace '\s+', ' '); if (-not $t.Contains("This planning gate is the one exception to ``No plan-check-family dispatch may occur outside the sidecar record``: its record is the plan file's gate-record table.")) { throw 'gate record exception' }
  $t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath $file) -replace '\s+', ' '); if (-not $t.Contains('**plan-slice inputs**')) { throw 'C2 name' }
  $t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath $file) -replace '\s+', ' '); if (-not $t.Contains('slices table with columns slice-id / spec name / wave / size / risk / predicted files')) { throw 'slice table columns' }
  $t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath $file) -replace '\s+', ' '); if (-not $t.Contains('slices table with slice-id / spec name / wave / size / risk / predicted files')) { throw 'approval slice columns' }
  $t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath $file) -replace '\s+', ' '); if (-not $t.Contains('one `### Slice <slice-id>` section per slice containing that slice''s intent, predicted files, and cited map sections')) { throw 'slice sections' }
  $t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath $file) -replace '\s+', ' '); if (-not $t.Contains('That slice''s section text in C2 and the clean slice brief in C6 come from its `### Slice <slice-id>` section.')) { throw 'slice brief source' }
  $t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath $file) -replace '\s+', ' '); if (-not $t.Contains('Judge wave completion and the C4 pointer from the slices table''s `wave` column.')) { throw 'wave column' }
  $t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath $file) -replace '\s+', ' '); if (-not $t.Contains('all pasted into the prompt by the dispatcher')) { throw 'C2 delivery' }
  $t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath $file) -replace '\s+', ' '); if (-not $t.Contains('The plan path is a reference only: the Critic never opens the plan file and relies on the pasted section texts.')) { throw 'C2 reference' }
  $t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath $file) -replace '\s+', ' '); if (-not $t.Contains('design:')) { throw 'C3 design' }
  $t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath $file) -replace '\s+', ' '); if (-not $t.Contains('contract:')) { throw 'C3 contract' }
  $t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath $file) -replace '\s+', ' '); if (-not $t.Contains('grounding:')) { throw 'C3 grounding' }
  $t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath $file) -replace '\s+', ' '); if (-not $t.Contains('decision:')) { throw 'C3 decision' }
  $t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath $file) -replace '\s+', ' '); if (-not $t.Contains('plan · docs/plans/<plan>.md · next wave <N>')) { throw 'C4 pointer' }
  $t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath $file) -replace '\s+', ' '); if (-not $t.Contains('docs/status.md')) { throw 'C4 location' }
  $t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath $file) -replace '\s+', ' '); if (-not $t.Contains('plan: docs/plans/<plan>.md · slice: <slice-id>')) { throw 'C5 association' }
  $t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath $file) -replace '\s+', ' '); if (-not $t.Contains('Approve? [y / n / edit]')) { throw 'approval banner' }
  $t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath $file) -replace '\s+', ' '); if (-not $t.Contains('docs/plans/done/')) { throw 'plan archival' }
  $t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath $file) -replace '\s+', ' '); if (-not $t.Contains('After the plan moves to `docs/plans/done/`, a slice spec''s C5 line `plan: docs/plans/<plan>.md` resolves to `docs/plans/done/<plan>.md`.')) { throw 'archived plan fallback' }
  $t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath $file) -replace '\s+', ' '); if (-not $t.Contains('Do not open docs/drafts/*.review.log, docs/drafts/*.findings.json or docs/plans/.')) { throw 'cold-read plan exclusion' }
  $t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath $file) -replace '\s+', ' '); if ($t.Contains('Do not open docs/drafts/*.review.log or docs/plans/.')) { throw 'old cold-read plan exclusion' }
  $t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath $file) -replace '\s+', ' '); $bullet = [regex]::Match($t, '- \*\*The cold-read prompt excludes the sidecar — discovery, not just delivery\.\*\*.*?(?= - \*\*Round record)').Value; if (-not $bullet.Contains('The prompt shape in § The cold read above now ends with `Do not open docs/drafts/*.review.log, docs/drafts/*.findings.json or docs/plans/.`')) { throw 'cold-read self-description' }
  $t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath $file) -replace '\s+', ' '); $bullet = [regex]::Match($t, '- \*\*The cold-read prompt excludes the sidecar — discovery, not just delivery\.\*\*.*?(?= - \*\*Round record)').Value; if ($bullet.Contains('Do not open docs/drafts/*.review.log.`')) { throw 'old cold-read self-description ending' }
  $t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath $file) -replace '\s+', ' '); if ($t.Contains('pass and post-readiness read use the same tier trigger: Low and doc-only skip both; Medium and High retain both.')) { throw 'old universal tier' }
  ```
  Run every check line containing `·`, `—` or `§` from a UTF-8 script file.
- [ ] Task 2 - session Checker row names the Big gate → verify: HOST reads `C:/Users/User/.claude/hooks/apex-session-context.md` as UTF-8, normalizes whitespace, and matches the exact Task 2 replacement row as one literal; compare the raw one-line row and count exactly 64 lines. The literal is the complete replacement row in Task 2, from `| Checker |` through `An agent never reviews its own output. |`.
- [ ] Task 3 - ADR records the binding decisions → verify: HOST applies the UTF-8, whitespace-normalized `Contains` presence form above to each exact literal below in the ADR. The C1-C6 lines in Task 3 are the source text for the contract literals; compare the pre-existing ADR text by content diff. Run every check line containing `·`, `—` or `§` from a UTF-8 script file.
  ```text
  2026-10-13
  Big-only gpt-6.1-sol xhigh gate
  non-Big Medium/High Deep Details
  post-readiness cold read without gate output
  one-task Light spec
  OVER
  before commit
  target code repos
  never cwd or the spec-owning repo
  >3 files or >2 phases
  ~15 files / 6 tasks
  six-slice soft cap
  SKILL-HISTORY
  CHANGELOG
  Files evidence
  Grep evidence:
  first maps
  Scribe map rewrites
  ## Planning gate check
  ## Plan artifact
  **plan-slice inputs**
  all pasted into the prompt by the dispatcher
  Gate findings, `gate-N` rows, adjudication history and the rest of the plan narrative are never plan-slice inputs.
  The plan path is a reference only: the Critic never opens the plan file and relies on the pasted section texts.
  severity
  BLOCK/FLAG/CLEAN
  criterion
  design:
  contract:
  grounding:
  decision:
  plan · docs/plans/<plan>.md · next wave <N>
  plan: docs/plans/<plan>.md · slice: <slice-id>
  docs/status.md
  docs/changes/done/
  gate-N
  slice intent, cross-slice contracts, cited map sections
  gate findings and adjudication are removed.
  ```
- [ ] Task 4 - skill history identifies the reference-only change → verify: HOST uses the same UTF-8, whitespace-normalized `Contains` form on `C:/Users/User/apex/SKILL-HISTORY.md` for exact literals `planning-gate-check`, `skills/apex-plan/references/sol-plan-check.md`, `hooks/apex-session-context.md`, and `apex-plan (reference only; SKILL.md version as current at close-out)`; inspect the newest row and its final spec-path cell. Check the apex-plan SKILL file is not modified by this spec using the before/after hash and scope attribution below; do not assert a fixed version.
- [ ] Task 5 - changelog contains the release note → verify: HOST uses the same UTF-8, whitespace-normalized `Contains` form on `C:/Users/User/apex/CHANGELOG.md` for exact literals `## [Unreleased]`, `### Added`, and `planning-gate-check`; inspect that subsection and count exactly one `planning-gate-check` bullet.
- [ ] Line caps and scope - no capped file grows past its bound → verify: HOST counts the hook at 64 lines and the apex-plan SKILL file at no more than 500 lines. Capture `git hash-object` values and content snapshots immediately before and after this spec's edits for its five `## Files to Change` paths and the apex-plan SKILL file. SKILL.md must be not modified by this spec: its path is absent from this spec's manifest and Tasks, and any before/after change must be attributed to the sibling planning-intake build. For shared `SKILL-HISTORY.md` and `CHANGELOG.md`, compare the before/after content diff and require that this spec adds only its own row and bullet; sibling rows or bullets may already be dirty. For the other three owned files, inspect the before/after content diff against Tasks 1-3. Do not use `git status --porcelain` as the shared-file scope criterion; name unrelated pre-existing dirty paths in the report without touching them.
- [ ] Build repository verify fence - HOST runs every command below from `C:/Users/User/.claude` and each passes. This is the current `## Verify commands` fence of its `AGENTS.md`, copied verbatim:
```powershell
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
- [ ] Reachability - a Big plan routes through the gate and plan artifact to an eligible slice cold read → verify: HOST traces the gate dispatch, approval, stored slice/contract/map data, pointer advancement, and post-readiness cold-read exclusion in Task 1's reference prose.

## Progress
_(The build writes here — do not edit manually)_
