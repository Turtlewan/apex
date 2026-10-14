---
spec: scribe-map-update-v2
status: draft
autonomy_level: L2
risk: medium
coder_effort: high
coder_model: gpt-6.1-sol
max_parallel_codex: 2
---

# Spec: Separate Scribe map update
<!-- Governing contract: ~/.claude/skills/apex-code/references/spec-contract.md. -->

**Identity:** Add an attended, post-integration Scribe dispatch for affected system-map sections.

## Intent
- **Intent:** Update affected map claims from the complete build delta in a separately pinned and reviewed Scribe dispatch.
- **Invariants:** Source/doc Scribe steps 1–8 and authorization set `A` stay intact. A rejected map result never changes the integrated source/doc result. The map dispatch changes only resolved map files and affected sections; the HOST alone stamps `verified:` after re-survey. Each dispatch has its own `scribe-map` build, review, and family-gate identity.
- **Non-goals:** AFK end-gate or drain-runner map updates, checker changes, new map sections, automatic cover repair, and changes to source-code edit permissions. The separate dispatch supersedes role-redesign item 30's same-pass review; this is the owner-adjudicated one-off four-coder-file split-rule exception (2026-10-14). HOST bookkeeping is outside that count.

## Assumptions
- `agents/apex-critic.md` already contains the committed `plan-slice inputs` block in `### mode: code`. → impact: Stop
- The quoted live anchors in the four coder files remain present when built; `skills/apex-code/SKILL.md` starts at `version: 2.26.0` and exactly 500 physical lines. → impact: Stop
- The map checker returns JSON `sections` for `-Owner` and `-Touches`, exit 2 for parse/transport errors, and exit 3 for no component sections. → impact: Stop

Simplicity check: use one post-integration dispatch and the existing wrapper, pin, Critic, family gate, and step-7 pin and apply mechanics with a map-only restore on verification failure.

## Prerequisites
none

## Files to Change
| File | Operation | Notes |
|------|-----------|-------|
| skills/apex-code/references/scribe.md | modify | Task 1 section 9, separate map dispatch and handoff input. |
| skills/apex-code/SKILL.md | modify | Task 2 fourth bounded Post-build exception and version bump. |
| agents/apex-critic.md | modify | Task 3 code-mode map inputs and reject checks. |
| skills/apex-plan/references/system-map.md | modify | Task 4 freshness and cover-repair paragraph. |
| C:/Users/User/apex/SKILL-HISTORY.md | modify | HOST Task 5 newest history row. |
| C:/Users/User/apex/CHANGELOG.md | modify | HOST Task 6 Unreleased Added bullet. |

## Execution manifest
```json apex-manifest
{
  "version": 1,
  "repos": { "claude": "C:/Users/User/.claude" },
  "tasks": [
    { "id": "1", "repo": "claude", "files": [{ "path": "skills/apex-code/references/scribe.md", "op": "modify" }], "depends_on": [] },
    { "id": "2", "repo": "claude", "files": [{ "path": "skills/apex-code/SKILL.md", "op": "modify" }], "depends_on": [] },
    { "id": "3", "repo": "claude", "files": [{ "path": "agents/apex-critic.md", "op": "modify" }], "depends_on": [] },
    { "id": "4", "repo": "claude", "files": [{ "path": "skills/apex-plan/references/system-map.md", "op": "modify" }], "depends_on": [] }
  ]
}
```

## Tasks
- [ ] **Task 1** - Append a separate map dispatch to the attended Scribe procedure - files: `skills/apex-code/references/scribe.md` - done when section 9 computes affected sections, dispatches and reviews a separately pinned map tree, integrates only a clean result, and supplies the map outcome to technical docs.
  - After the current `## 8. Deliver the technical-docs input` section, add `## 9. Map update dispatch`. Preserve steps 1–8 and their source/doc authorization set `A` verbatim. Section 9 runs after step 7 and before step 8 delivers the technical-docs input. When source/doc Scribe had no work, section 9 runs directly after the build. It is attended only. A repo without `docs/system-map.md` or a split `docs/system-map/` has `map_update: skipped`; no map dispatch runs. Cite the bounded fourth `## Post-build` exception in `skills/apex-code/SKILL.md`; do not add resolved map files to `A` or the build spec.
  - Define `MAP_BASE` with this exact sentence: `MAP_BASE is the integrated Scribe result commit from step 7 when step 7 integrated a Scribe result; otherwise (Scribe skipped, made no change, was discarded, or failed) SCRIBE_BASE from step 2.` The complete build delta is `git diff --name-status -z --find-renames <pre-build-base> MAP_BASE`; parse all statuses, including deleted paths and both rename endpoints. Materialize the fresh map worktree at `MAP_BASE` before lookups; `<repo>` in the lookup commands below is that worktree, and a clean lookup-only worktree follows the existing D8 teardown guards on a skip. Use `MAP_BASE` for the full read-only `map-evidence` diff, section resolution, `pointer-targets`, and the fresh map worktree. Do not use an integration-tree HEAD substitute. For each delta path run `apex-map-check.ps1 -Repo <repo> -Owner <path> -Json` and `apex-map-check.ps1 -Repo <repo> -Touches <path> -Json`; decode both `sections` arrays with `ConvertFrom-Json`, then union them with every section whose body has a `file:line` pointer into a build-delta path. Match each name to exactly one `## <component>` heading in the root map or split component files. A split index is a resolution source, not a write target unless it contains an affected component section.
  - State these stop and skip rules exactly: `An unresolved or duplicated section name, checker exit 2, or a resolved map file whose filtered blob identity differs from MAP_BASE stops map work for that repo and reports the exact reason and paths.` `Checker exit 3 or an empty affected-section union skips the map dispatch.` Unexpected checker failures also stop map work; no section name is guessed. `Every MAP_BASE comparison uses filtered blob identities: git hash-object --path <path> <path> in the integration tree must equal git rev-parse MAP_BASE:<path>; never compare raw checkout bytes.` Compare every resolved map file's filtered blob identity in the integration tree with `MAP_BASE` before dispatch. Apply the existing per-path `apex-critical-files.ps1 -Test` classifier to every resolved map file; an excluded path stops that repo's map work. Each unresolved or duplicated name, checker exit 2, unexpected checker failure, classifier-excluded map path, map blob drift, or pre-integration drift records map_update: skipped for that repo together with the affected-section names and the exact reason. No directory authorization is granted.
  - Dispatch on that fresh worktree with `codex-dispatch.ps1 -Spec <s> -SpecSourcePath <absolute-spec> -Task scribe-map -Phase build -Model gpt-6-luna -Effort low -Attended -Worktree <map-worktree> -BaseSha MAP_BASE -Authorized <resolved-map-files> -Prompt <pack>`. Keep step 5's one availability retry and diagnostic-worktree retention, using task id `scribe-map` on any retry. Authorize only resolved map files with operation `modify`; the critical classifier still applies. The pack carries the full `git diff --binary --find-renames <pre-build-base> MAP_BASE` as read-only `map-evidence`, including paths outside `A`, plus the affected-section names, their current text and resolved files, and the bounded edit contract. Use this exact contract: `Rewrite only affected sections' Role / Contracts / Seams / Dependents / Evidence claims and file:line pointers.` `Rewrite a file:line pointer only when its target file is in the build delta; leave other pointers unchanged.` `Header edits are limited to contracts: or seams: path-token replacements for paths renamed or deleted by the build; never change covers or verified:, and never add or remove sections.` Do not authorize any source edit in the map dispatch.
  - The HOST derives `map_cover_repair` mechanically from name-status rename or move entries: record each section and new path when a previously covered path moves outside every section's covers and `-Owner` of the new path returns no section. This is not a Luna completion field or an unresolved item; the dispatch may return normal `done`. Do not add it to `codex-completion-schema.json`.
  - After wrapper exit 0, select the latest matching `spec=<s>, task=scribe-map` ledger build row by worktree and launch identity. Follow step 6's separate tree pin, digest equality to `end_tree_digest`, code-mode `apex-critic` review, pin verification before acting on the verdict, full repo Verify commands fence, pin verification again, mutex-serialized review row, and `apex-family-gate.ps1 -Spec <s> -Task scribe-map -WorktreeKey <ledger worktree_key>`. The review row has `task = 'scribe-map'`, `reviewed_run_id` equal to the selected map build `run_id`, and `reviewed_tree_digest` equal to the pinned map digest. Supply the Critic `map-update inputs`: the affected-section list, the identical `map-evidence` block, and `pointer-targets`. After the map dispatch returns, the HOST derives the rewritten-pointer set by parsing the map diff (dispatch result versus MAP_BASE) for <path>:<n> tokens on added lines whose path is in the build delta, and supplies each such file's MAP_BASE contents with line numbers. A pointer whose target path the build deleted is listed in pointer-targets as deleted with no contents. Include the full map diff versus `MAP_BASE`, authorized files, and bounded edit contract; the Critic receives read-only evidence with no extra file access.
  - Use step 7's pin-before-commit, changed-path blob/mode identity, and path-scoped indexed apply for the map delta only; section 9 owns post-apply verification and rejected-result routing. `Before integration, every path in the build delta (<pre-build-base>..MAP_BASE) that exists in the integration tree, plus every map file, must have a filtered blob identity equal to MAP_BASE; a path absent from MAP_BASE is drift.` `On drift do not integrate, report the exact drifted paths, and record map_update: skipped.` `Before applying the map delta, the HOST saves the exact current bytes of every map file it will write.` `The HOST then applies the map delta, runs step 7's post-apply checks, and runs the integrated verification.` `If any verification fails, the HOST restores those saved bytes to each map file in both the worktree and index, records map_update: rejected, and integrates no map delta.` `Map files hold only map prose and are not part of the already-integrated Scribe review, so this restore is permitted.` A failed dispatch after the permitted availability retry, Critic rejection, or any pin, verification, ledger, or family-gate failure records map_update: rejected and integrates no map delta; retain the failed map worktree per step 7. A clean result records map_update: applied, including when the dispatch makes no map edit; integrate the map delta. Do not roll back or repin the already integrated source/doc Scribe tree. Apply the existing D8 teardown only after successful integration and its normal guards.
  - Amend step 8 at the current anchor `Deliver one per-repo result to \`apex-docs-technical-agent\`:`. Step 8 delivers per-repo map_update, the affected-section names when map_update is skipped or rejected, and HOST-derived map_cover_repair entries to apex-docs-technical-agent. The docs agent writes each map_cover_repair entry and each skipped or rejected affected-section name under What's Next. Preserve the existing `scribe_summary` fields and their source/doc meanings. The map status is separate from `scribe_summary.status`.
- [ ] **Task 2** - Add the bounded fourth Post-build write - files: `skills/apex-code/SKILL.md` - done when the fourth exception authorizes only section-9 map edits, the version changes in place, and the file remains exactly 500 physical lines.
  - In frontmatter replace `version: 2.26.0` with `version: 2.27.0` on the same line and update `last_updated: 2026-10-13` to `last_updated: 2026-10-14` in place. In `## Post-build`, replace the sentence beginning `The docs agent's (\`apex-docs-technical-agent\`) three host's-pen artifacts` and its continuation `**Exactly those three. Nothing else is exempt**` with the same three docs-agent artifacts plus this exact fourth permission: `The fourth permitted post-build write outside ## Files to Change is the map-update dispatch's affected-section edits in resolved map files only, under references/scribe.md section 9.` State `**Exactly those four. Nothing else is exempt**` with the period placement and bold markup of the live line. Keep the existing D6 host's-pen scope for the original three. Reflow that paragraph in place with net-zero physical lines; do not remove another check or add a compensating blank line.
- [ ] **Task 3** - Give the code-mode Critic bounded map evidence and reject rules - files: `agents/apex-critic.md` - done when map review applies only to the map dispatch and cannot read additional files.
  - In `### mode: code`, follow the live optional plan-slice block's last sentence `The plan path is a reference only: the Critic never opens the plan file and relies on the pasted section texts.` with this exact rule: `Only the scribe-map dispatch may supply map-update inputs: the affected-section list, the map-evidence block, and pointer-targets; these are read-only evidence and grant no additional file access.` Keep the existing optional plan-slice input, changed-files/spec, coding-principles, fix-check prior-findings/current-diff, and planning-sidecar exclusions. Amend the live review sentence beginning `Review the changed files against those supplied requirements and the slice's cross-slice contracts` to apply the map rules only when the map-update block is supplied.
  - Add these exact code-mode reject sentences: `Reject any map edit outside the affected sections.` `Reject any header edit other than contracts: or seams: path-token replacements for paths renamed or deleted by the build.` `Reject any change to covers or verified:.` `Reject any claim unsupported by map-evidence.` `Reject any rewritten file:line pointer whose target line in pointer-targets does not support the claim.` `Reject any rewritten pointer into a deleted path.` Compare rewritten pointers against the final `MAP_BASE` contents supplied with line numbers; no access to unchanged target files is granted. Do not amend `### mode: spec`.
- [ ] **Task 4** - Describe map freshness after the separate dispatch - files: `skills/apex-plan/references/system-map.md` - done when the existing targeted re-survey protocol handles applied and unapplied map results accurately.
  - In `## Freshness and targeted re-survey`, insert one paragraph immediately after the existing anchor `Git/live code wins when either contradicts the map.` Include these exact sentences: `The map Scribe dispatch rewrites affected sections without stamping verified:.` `A rewritten section whose covers include a changed path reports stale at the next apex-map-check.ps1 -Stale run after the commit that integrates the change lands, because the checker compares the verified SHA to HEAD and ignores staged or working-tree edits; the HOST re-surveys and stamps it under the existing freshness protocol.` `A Touches-only section whose covers are unchanged keeps its stamp.` `When map_update is skipped or rejected, the handoff names the affected sections for targeted re-survey; -Stale catches only covers-changed sections.` `The HOST repairs covers listed in map_cover_repair during the next re-survey.` `Drained (AFK) specs get no map update.` Keep the existing checker exit semantics and survey instructions.
- [ ] **Task 5 (HOST)** - Prepend one history row - files: `C:/Users/User/apex/SKILL-HISTORY.md` - done when the newest data row names all four coder files and the apex-code version.
  - Prepend a `2026-10-14` row for `scribe-map-update-v2`; list `skills/apex-code/SKILL.md` at `2.27.0`, `skills/apex-code/references/scribe.md`, `skills/apex-plan/references/system-map.md` (reference only; no apex-plan SKILL.md version bump), and `agents/apex-critic.md` as agent with no version field. Put this exact text in its description cell: `scribe-map-update-v2: separate post-integration map dispatch, bounded Post-build exception, code-mode Critic gate, and HOST freshness handoff.`
- [ ] **Task 6 (HOST)** - Add one changelog bullet - files: `C:/Users/User/apex/CHANGELOG.md` - done when the Unreleased Added subsection has exactly one matching bullet.
  - Under `## [Unreleased]` / `### Added`, add this exact bullet: `- Scribe map update v2 (2026-10-14, scribe-map-update-v2, apex-code 2.27.0): a separate attended map dispatch updates affected system-map sections from the full build delta, receives its own Critic and family gates, and passes cover repairs and skipped sections to the technical-docs handoff.`

## Wave plan
Wave 1: [1, 2, 3, 4] | HOST: bookkeeping.

## Permissions
Coder tasks own only their file-disjoint manifest paths. HOST owns the two bookkeeping paths outside the manifest. The owner granted this spec a one-off four-coder-file split-rule exception on 2026-10-14. No network or live-repository Git write operation is authorized by this spec.

### File Operations
| Action | Paths |
|--------|-------|
| Modify (coder Task 1) | skills/apex-code/references/scribe.md |
| Modify (coder Task 2) | skills/apex-code/SKILL.md |
| Modify (coder Task 3) | agents/apex-critic.md |
| Modify (coder Task 4) | skills/apex-plan/references/system-map.md |
| Modify (HOST Task 5) | C:/Users/User/apex/SKILL-HISTORY.md |
| Modify (HOST Task 6) | C:/Users/User/apex/CHANGELOG.md |

### Commands
| Command | Purpose |
|---------|---------|
| `Get-Content -Raw -Encoding UTF8` | HOST checks exact UTF-8 literals after whitespace normalization. |
| Build repository Verify commands fence | HOST runs the complete build-repository recipe. |

### Git Operations
| Operation | Scope |
|-----------|-------|
| (none) | No staging or commits by the coder. |

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
The map dispatch remains subject to the critical-file classifier, wrapper scope gate, tree pin, separate Critic code-mode review, and family gate.

### Performance
(none)

### Accessibility
(none)

## Documentation
| Doc type | File | Action |
|----------|------|--------|
| Reference | skills/apex-code/references/scribe.md | Task 1 adds section 9 and handoff input. |
| Skill instruction | skills/apex-code/SKILL.md | Task 2 adds the Post-build exception and version. |
| Agent instruction | agents/apex-critic.md | Task 3 adds code-mode map review. |
| Reference | skills/apex-plan/references/system-map.md | Task 4 adds freshness paragraph. |
| History | C:/Users/User/apex/SKILL-HISTORY.md | HOST prepends one row. |
| Changelog | C:/Users/User/apex/CHANGELOG.md | HOST adds one Unreleased Added bullet. |

## Acceptance Criteria
Tagged checks below run in the build-repository root. Every checked literal is prescribed verbatim in its task body. HOST reads each named file as UTF-8, normalizes whitespace, and applies the exact presence or absence form; apostrophes in single-quoted literals are doubled. Run non-ASCII literals from a UTF-8 PowerShell script file. Untagged HOST checks own bookkeeping, scope snapshots, wiring, and the full verify fence.

- [ ] Task 1 - the separate dispatch uses the adjudicated baseline and section selection → verify: these exact mechanism literals appear in the Scribe reference.
```powershell apex-accept
$t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath 'skills/apex-code/references/scribe.md') -replace '\s+', ' '); if (-not $t.Contains('## 9. Map update dispatch')) { throw 'map section' }
$t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath 'skills/apex-code/references/scribe.md') -replace '\s+', ' '); if (-not $t.Contains('Section 9 runs after step 7 and before step 8 delivers the technical-docs input.')) { throw 'map sequence' }
$t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath 'skills/apex-code/references/scribe.md') -replace '\s+', ' '); if (-not $t.Contains('MAP_BASE is the integrated Scribe result commit from step 7 when step 7 integrated a Scribe result; otherwise (Scribe skipped, made no change, was discarded, or failed) SCRIBE_BASE from step 2.')) { throw 'map base' }
$t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath 'skills/apex-code/references/scribe.md') -replace '\s+', ' '); if (-not $t.Contains('git diff --name-status -z --find-renames <pre-build-base> MAP_BASE')) { throw 'full delta' }
$t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath 'skills/apex-code/references/scribe.md') -replace '\s+', ' '); if (-not $t.Contains('apex-map-check.ps1 -Repo <repo> -Owner <path> -Json')) { throw 'owner lookup' }
$t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath 'skills/apex-code/references/scribe.md') -replace '\s+', ' '); if (-not $t.Contains('apex-map-check.ps1 -Repo <repo> -Touches <path> -Json')) { throw 'touches lookup' }
$t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath 'skills/apex-code/references/scribe.md') -replace '\s+', ' '); if (-not $t.Contains('An unresolved or duplicated section name, checker exit 2, or a resolved map file whose filtered blob identity differs from MAP_BASE stops map work for that repo and reports the exact reason and paths.')) { throw 'map stop' }
$t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath 'skills/apex-code/references/scribe.md') -replace '\s+', ' '); if (-not $t.Contains('Checker exit 3 or an empty affected-section union skips the map dispatch.')) { throw 'map skip' }
$t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath 'skills/apex-code/references/scribe.md') -replace '\s+', ' '); if (-not $t.Contains('Every MAP_BASE comparison uses filtered blob identities: git hash-object --path <path> <path> in the integration tree must equal git rev-parse MAP_BASE:<path>; never compare raw checkout bytes.')) { throw 'filtered map base comparison' }
$t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath 'skills/apex-code/references/scribe.md') -replace '\s+', ' '); if (-not $t.Contains('Each unresolved or duplicated name, checker exit 2, unexpected checker failure, classifier-excluded map path, map blob drift, or pre-integration drift records map_update: skipped for that repo together with the affected-section names and the exact reason.')) { throw 'skipped outcome' }
```
- [ ] Task 1 - map writes, review, integration, and handoff are bounded → verify: these exact task-prescribed literals appear; HOST traces the full section-9 sequence and confirms steps 1–8 retain `A`.
```powershell apex-accept
$t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath 'skills/apex-code/references/scribe.md') -replace '\s+', ' '); if (-not $t.Contains('codex-dispatch.ps1 -Spec <s> -SpecSourcePath <absolute-spec> -Task scribe-map -Phase build -Model gpt-6-luna -Effort low -Attended -Worktree <map-worktree> -BaseSha MAP_BASE -Authorized <resolved-map-files> -Prompt <pack>')) { throw 'map wrapper identity' }
$t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath 'skills/apex-code/references/scribe.md') -replace '\s+', ' '); if (-not $t.Contains('Rewrite only affected sections'' Role / Contracts / Seams / Dependents / Evidence claims and file:line pointers.')) { throw 'affected section edits' }
$t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath 'skills/apex-code/references/scribe.md') -replace '\s+', ' '); if (-not $t.Contains('Rewrite a file:line pointer only when its target file is in the build delta; leave other pointers unchanged.')) { throw 'pointer scope' }
$t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath 'skills/apex-code/references/scribe.md') -replace '\s+', ' '); if (-not $t.Contains('Header edits are limited to contracts: or seams: path-token replacements for paths renamed or deleted by the build; never change covers or verified:, and never add or remove sections.')) { throw 'header guard' }
$t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath 'skills/apex-code/references/scribe.md') -replace '\s+', ' '); if (-not $t.Contains('After the map dispatch returns, the HOST derives the rewritten-pointer set by parsing the map diff (dispatch result versus MAP_BASE) for <path>:<n> tokens on added lines whose path is in the build delta, and supplies each such file''s MAP_BASE contents with line numbers.')) { throw 'pointer targets producer' }
$t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath 'skills/apex-code/references/scribe.md') -replace '\s+', ' '); if (-not $t.Contains('A pointer whose target path the build deleted is listed in pointer-targets as deleted with no contents.')) { throw 'deleted pointer target' }
$t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath 'skills/apex-code/references/scribe.md') -replace '\s+', ' '); if (-not $t.Contains('apex-family-gate.ps1 -Spec <s> -Task scribe-map -WorktreeKey <ledger worktree_key>')) { throw 'map family gate' }
$t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath 'skills/apex-code/references/scribe.md') -replace '\s+', ' '); if (-not $t.Contains('Before integration, every path in the build delta (<pre-build-base>..MAP_BASE) that exists in the integration tree, plus every map file, must have a filtered blob identity equal to MAP_BASE; a path absent from MAP_BASE is drift.')) { throw 'integration binding' }
$t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath 'skills/apex-code/references/scribe.md') -replace '\s+', ' '); if (-not $t.Contains('On drift do not integrate, report the exact drifted paths, and record map_update: skipped.')) { throw 'integration drift outcome' }
$t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath 'skills/apex-code/references/scribe.md') -replace '\s+', ' '); if (-not $t.Contains('Before applying the map delta, the HOST saves the exact current bytes of every map file it will write.')) { throw 'map bytes saved' }
$t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath 'skills/apex-code/references/scribe.md') -replace '\s+', ' '); if (-not $t.Contains('The HOST then applies the map delta, runs step 7''s post-apply checks, and runs the integrated verification.')) { throw 'map integrated verification' }
$t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath 'skills/apex-code/references/scribe.md') -replace '\s+', ' '); if (-not $t.Contains('If any verification fails, the HOST restores those saved bytes to each map file in both the worktree and index, records map_update: rejected, and integrates no map delta.')) { throw 'map verification restore' }
$t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath 'skills/apex-code/references/scribe.md') -replace '\s+', ' '); if (-not $t.Contains('Map files hold only map prose and are not part of the already-integrated Scribe review, so this restore is permitted.')) { throw 'map restore scope' }
$t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath 'skills/apex-code/references/scribe.md') -replace '\s+', ' '); if (-not $t.Contains('The HOST derives `map_cover_repair` mechanically from name-status rename or move entries: record each section and new path when a previously covered path moves outside every section''s covers and `-Owner` of the new path returns no section.')) { throw 'cover repair derivation' }
$t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath 'skills/apex-code/references/scribe.md') -replace '\s+', ' '); if (-not $t.Contains('A failed dispatch after the permitted availability retry, Critic rejection, or any pin, verification, ledger, or family-gate failure records map_update: rejected and integrates no map delta; retain the failed map worktree per step 7.')) { throw 'rejected outcome' }
$t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath 'skills/apex-code/references/scribe.md') -replace '\s+', ' '); if (-not $t.Contains('A clean result records map_update: applied, including when the dispatch makes no map edit; integrate the map delta.')) { throw 'applied outcome' }
$t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath 'skills/apex-code/references/scribe.md') -replace '\s+', ' '); if (-not $t.Contains('Step 8 delivers per-repo map_update, the affected-section names when map_update is skipped or rejected, and HOST-derived map_cover_repair entries to apex-docs-technical-agent.')) { throw 'step 8 map input' }
$t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath 'skills/apex-code/references/scribe.md') -replace '\s+', ' '); if (-not $t.Contains('The docs agent writes each map_cover_repair entry and each skipped or rejected affected-section name under What''s Next.')) { throw 'step 8 next actions' }
```
- [ ] Task 2 - apex-code permits only bounded map post-build writes and keeps its cap → verify: literals and exact physical line count.
```powershell apex-accept
$t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath 'skills/apex-code/SKILL.md') -replace '\s+', ' '); if (-not $t.Contains('version: 2.27.0')) { throw 'apex-code version' }
$t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath 'skills/apex-code/SKILL.md') -replace '\s+', ' '); if (-not $t.Contains('last_updated: 2026-10-14')) { throw 'apex-code date' }
$t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath 'skills/apex-code/SKILL.md') -replace '\s+', ' '); if (-not $t.Contains('The fourth permitted post-build write outside ## Files to Change is the map-update dispatch''s affected-section edits in resolved map files only, under references/scribe.md section 9.')) { throw 'post-build map exception' }
$t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath 'skills/apex-code/SKILL.md') -replace '\s+', ' '); if (-not $t.Contains('**Exactly those four. Nothing else is exempt**')) { throw 'four exception bound' }
$t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath 'skills/apex-code/SKILL.md') -replace '\s+', ' '); if ($t.Contains('Exactly those three. Nothing else is exempt')) { throw 'old exception bound' }
if ((@(Get-Content -Encoding UTF8 -LiteralPath 'skills/apex-code/SKILL.md')).Count -ne 500) { throw 'apex-code line cap' }
```
- [ ] Task 3 - code-mode Critic gets read-only inputs and all six map reject checks → verify: these literals occur in `### mode: code`; HOST confirms `### mode: spec` is unchanged.
```powershell apex-accept
$t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath 'agents/apex-critic.md') -replace '\s+', ' '); if (-not $t.Contains('Only the scribe-map dispatch may supply map-update inputs: the affected-section list, the map-evidence block, and pointer-targets; these are read-only evidence and grant no additional file access.')) { throw 'critic map inputs' }
$t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath 'agents/apex-critic.md') -replace '\s+', ' '); if (-not $t.Contains('Reject any map edit outside the affected sections.')) { throw 'critic section guard' }
$t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath 'agents/apex-critic.md') -replace '\s+', ' '); if (-not $t.Contains('Reject any header edit other than contracts: or seams: path-token replacements for paths renamed or deleted by the build.')) { throw 'critic header guard' }
$t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath 'agents/apex-critic.md') -replace '\s+', ' '); if (-not $t.Contains('Reject any change to covers or verified:.')) { throw 'critic stamp guard' }
$t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath 'agents/apex-critic.md') -replace '\s+', ' '); if (-not $t.Contains('Reject any claim unsupported by map-evidence.')) { throw 'critic evidence guard' }
$t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath 'agents/apex-critic.md') -replace '\s+', ' '); if (-not $t.Contains('Reject any rewritten file:line pointer whose target line in pointer-targets does not support the claim.')) { throw 'critic pointer guard' }
$t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath 'agents/apex-critic.md') -replace '\s+', ' '); if (-not $t.Contains('Reject any rewritten pointer into a deleted path.')) { throw 'critic deleted pointer guard' }
```
- [ ] Task 4 - map freshness and HOST repair rules are explicit → verify: all six exact sentences occur in the map reference.
```powershell apex-accept
$t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath 'skills/apex-plan/references/system-map.md') -replace '\s+', ' '); if (-not $t.Contains('The map Scribe dispatch rewrites affected sections without stamping verified:.')) { throw 'no automatic stamp' }
$t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath 'skills/apex-plan/references/system-map.md') -replace '\s+', ' '); if (-not $t.Contains('A rewritten section whose covers include a changed path reports stale at the next apex-map-check.ps1 -Stale run after the commit that integrates the change lands, because the checker compares the verified SHA to HEAD and ignores staged or working-tree edits; the HOST re-surveys and stamps it under the existing freshness protocol.')) { throw 'covered change freshness' }
$t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath 'skills/apex-plan/references/system-map.md') -replace '\s+', ' '); if (-not $t.Contains('A Touches-only section whose covers are unchanged keeps its stamp.')) { throw 'touches-only stamp' }
$t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath 'skills/apex-plan/references/system-map.md') -replace '\s+', ' '); if (-not $t.Contains('When map_update is skipped or rejected, the handoff names the affected sections for targeted re-survey; -Stale catches only covers-changed sections.')) { throw 'unapplied map handoff' }
$t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath 'skills/apex-plan/references/system-map.md') -replace '\s+', ' '); if (-not $t.Contains('The HOST repairs covers listed in map_cover_repair during the next re-survey.')) { throw 'cover repair survey' }
$t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath 'skills/apex-plan/references/system-map.md') -replace '\s+', ' '); if (-not $t.Contains('Drained (AFK) specs get no map update.')) { throw 'attended boundary' }
```
- [ ] Task 5 - HOST history bookkeeping is present → verify: the newest data row names all four coder files, apex-code `2.27.0`, and the apex-critic agent; run this untagged literal check.
```powershell
$t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath 'C:/Users/User/apex/SKILL-HISTORY.md') -replace '\s+', ' '); if (-not $t.Contains('scribe-map-update-v2: separate post-integration map dispatch, bounded Post-build exception, code-mode Critic gate, and HOST freshness handoff.')) { throw 'history row' }
```
- [ ] Task 6 - HOST changelog bookkeeping is present → verify: exactly one `scribe-map-update-v2` bullet is under `## [Unreleased]` / `### Added`; run this untagged literal check.
```powershell
$t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath 'C:/Users/User/apex/CHANGELOG.md') -replace '\s+', ' '); if (-not $t.Contains('- Scribe map update v2 (2026-10-14, scribe-map-update-v2, apex-code 2.27.0): a separate attended map dispatch updates affected system-map sections from the full build delta, receives its own Critic and family gates, and passes cover repairs and skipped sections to the technical-docs handoff.')) { throw 'changelog bullet' }
```
- [ ] Build repository verify fence - HOST runs every command below from the build repository root → verify: this is the current `## Verify commands` fence of the build repository's AGENTS file, copied verbatim, and all commands pass.
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
- [ ] Scope - only the six `## Files to Change` paths are written → verify: before the build, HOST saves the full `git status --porcelain -uall` list and `git hash-object` of every listed path that exists on disk in both `C:/Users/User/.claude` and `C:/Users/User/apex`; deleted paths are represented by status alone. After coder work and HOST bookkeeping, save both lists and hashes again. Every newly listed path, changed status, or changed hash must be one of the six listed paths; the two HOST files differ only by their specified row and bullet. The wrapper/Engine scope gate (`codex-scope-check.ps1`) proves each coder task wrote only its own manifest file. Name unrelated pre-existing dirt in the report.
- [ ] Reachability - the separate map result reaches the technical-docs handoff → verify: HOST traces `<pre-build-base>..MAP_BASE` through name-status, Owner/Touches JSON and pointer selection, map-file resolution, wrapper task `scribe-map`, its separate Critic review row and family gate, MAP_BASE filtered blob checks, map-only indexed apply and restore on integrated verification failure, and step-8 per-repo `map_update`, `map_cover_repair`, and targeted re-survey inputs. Confirm a rejected map tree remains available for diagnosis and does not affect the integrated source/doc result.

## Progress
_(The build writes here — do not edit manually)_
