---
spec: scribe-stage3
status: draft
autonomy_level: L2
risk: medium
coder_effort: medium
max_parallel_codex: 1
---

# Spec: Scribe stage 3
<!-- Governing contract: references/spec-contract.md. -->

**Identity:** Replace the post-build product-docs agent with a scoped Codex Scribe close-out and pass its result to the technical-docs handoff.

## Intent
- **Intent:** After the build Critic cadence, one Scribe dispatch per repository documents the integrated change in changed source comments and in CHANGELOG/README only when those files are listed in the spec's `## Files to Change`; retire the product-docs agent.
- **Invariants:** Scope comes from the spec and actual build changes, with critical paths removed; source edits are documentation comments only; the Scribe has an independent Critic, repo verify, ledger-bound family gate, and all-or-nothing integration.
- **Invariants:** Model availability alone permits a fresh `gpt-6-sol` low-effort retry; every other failure preserves the worktree for diagnosis and owner routing.
- **Non-goals:** A new script, a doctrine or D6 exemption change, edits to historical fixtures, or broader documentation scope.

## Assumptions
- `C:/Users/User/.claude` is the build repo at HEAD `73d6dff`; all coder file:line anchors below refer to that revision. If the tree moved, re-anchor before build. -> impact: Stop.
- The prerequisite `wrapper-model-luna` is built first, so `codex-dispatch.ps1 -Model gpt-6-luna` is admitted. -> impact: Stop.
- The build has a pinned pre-build base SHA; integration has staged build paths but no committed integrated tip. The host creates a transient `codex/<spec>-scribe` task-branch commit from the staged integration result. -> impact: Stop.
- `C:/Users/User/apex` is the HOST repo; its planning host owns the live status file and its cap check. -> impact: Stop.

Simplicity check: The existing wrapper, Critic, family gate, and integration procedure execute the close-out; one reference defines their Scribe-specific parameters.

## Prerequisites
- Spec complete first: `wrapper-model-luna` (case-sensitive `gpt-6-luna` wrapper allowlist and its test).
- Environment: PowerShell 5.1, Git, the build repo's `AGENTS.md` verify fence, and the existing `apex-critic` Agent tool route. Use attended host close-out for each repository.

## Files to Change
Grep evidence: 2026-10-06; coder anchors at `C:/Users/User/.claude` HEAD `73d6dff`.

- `skills/apex-code/references/scribe.md`: `Test-Path -LiteralPath C:/Users/User/.claude/skills/apex-code/references/scribe.md` returned `False`; `rg -n -F 'apex-docs-product-agent' C:/Users/User/.claude/skills/apex-code/SKILL.md` found the insertion point at 377; `rg -n -F 'Copy-EngineTaskFiles' C:/Users/User/.claude/skills/apex-code/references/parallel-codex.md` found the integration mechanism at 53.
- `skills/apex-code/SKILL.md`: `rg -n -F -e 'version: 2.20.0' -e 'last_updated: 2026-10-05' -e '## Post-build' -e 'apex-docs-product-agent' C:/Users/User/.claude/skills/apex-code/SKILL.md` found 3, 4, 330, 377; current line count is 478.
- `agents/apex-docs-product-agent.md`: `rg -n -F 'apex-docs-product-agent' C:/Users/User/.claude/agents/apex-docs-product-agent.md` found 2 and 8.
- `agents/apex-docs-technical-agent.md`: `rg -n -F 'docs_product_summary' C:/Users/User/.claude/agents/apex-docs-technical-agent.md` found 18 and 63; `rg -n -F -e 'Decisions Made' -e "What's Next"` found 35 and 38.
- `C:/Users/User/apex/docs/technical/adr/ADR-048-role-redesign.md`: `rg -n -F -e 'Scribe' -e 'apex-docs-product-agent' docs/technical/adr/ADR-048-role-redesign.md` found roster lines 63 and 69-70 and close-out lines 108-110.
- `C:/Users/User/apex/SKILL-HISTORY.md`: `rg -n -F '2.20.0' SKILL-HISTORY.md` found the latest `apex-code` row at 5.
- `C:/Users/User/apex/SKILLS.md`: `rg -n -F 'apex-docs-product-agent' SKILLS.md` found the process-agent sentence at 65; the technical-agent continuation is at 66.
- `rg -uu -n -F` over `C:/Users/User/.claude/skills`, `agents`, and `hooks`, excluding fixtures, found the only live `apex-docs-product-agent` / `docs_product_summary` hits at `skills/apex-code/SKILL.md:377`, `agents/apex-docs-product-agent.md:2,8`, and `agents/apex-docs-technical-agent.md:18,63`; no extra files are in scope.
- `skills/apex-code/scripts/apex-critical-files.ps1`: `rg -n -F -e 'HARDBLOCK' -e 'CRITICAL'` found per-path output at 103 and 204. `skills/apex-code/SKILL.md:396-398` defines the review-row fields; `references/parallel-codex.md:51-122` defines staged integration and D8 teardown is at 131-132.

| File | Operation | Notes |
|------|-----------|-------|
| skills/apex-code/references/scribe.md | create | T1 Scribe host protocol. |
| skills/apex-code/SKILL.md | modify | T2 Post-build pointer, order, version/date. |
| agents/apex-docs-product-agent.md | delete | T3 retired agent. |
| agents/apex-docs-technical-agent.md | modify | T3 Scribe summary handoff. |
| C:/Users/User/apex/docs/technical/adr/ADR-048-role-redesign.md | modify | HOST T4 dated amendment. |
| C:/Users/User/apex/SKILL-HISTORY.md | modify | HOST T5 history row. |
| C:/Users/User/apex/SKILLS.md | modify | HOST T6 process-agent wording. |

## Execution manifest
```json apex-manifest
{
  "version": 1,
  "repos": { "claude": "C:/Users/User/.claude" },
  "tasks": [
    { "id": "1", "repo": "claude", "files": [{ "path": "skills/apex-code/references/scribe.md", "op": "create" }], "depends_on": [], "effort": "medium" },
    { "id": "2", "repo": "claude", "files": [{ "path": "skills/apex-code/SKILL.md", "op": "modify" }], "depends_on": ["1"], "effort": "medium" },
    { "id": "3", "repo": "claude", "files": [{ "path": "agents/apex-docs-product-agent.md", "op": "delete" }, { "path": "agents/apex-docs-technical-agent.md", "op": "modify" }], "depends_on": ["2"], "effort": "medium" }
  ]
}
```

## Tasks
- [ ] **Task 1** - Create `skills/apex-code/references/scribe.md` as an eight-step HOST close-out protocol anchored to `skills/apex-code/SKILL.md:367-378,389-446`, `skills/apex-code/scripts/codex-dispatch.ps1:9-19,30-36,69-70`, `skills/apex-code/SKILL.md:97-110,396-398`, `skills/apex-code/scripts/apex-critical-files.ps1:103,204`, `skills/apex-code/references/parallel-codex.md:51-132`, `skills/apex-code/scripts/tree-pin.ps1:20-49`, and `hooks/apex-ledger-append.ps1:13-23`. Specify: (1) after step 2 creates `SCRIBE_BASE`, derive each repo's changed set with `git diff --name-status <pre-build-base> SCRIBE_BASE`; drop `D` entries and every `R` source, intersect with spec `## Files to Change` for that repo (convert absolute HOST paths to repo-relative; drop paths outside the repo), then keep source paths other than CHANGELOG.md, README.md, ADR, status, handoff, and docs-changes paths, with no extra exemption for changed source tests or configuration. Add `{CHANGELOG.md, README.md}` as candidates only when listed in the spec's `## Files to Change` (create if absent in `SCRIBE_BASE`, else modify). Docs needed but not listed there are reported as skipped. Run `skills/apex-code/scripts/apex-critical-files.ps1 -Test -Paths <path> -Root <repo>` for each candidate, dropping every path named on a `CRITICAL` or `HARDBLOCK` line, not the whole set on exit 10/11. The survivors are `A`; record each path's create/modify op for integration, and pass repo-relative paths to `-Authorized`. Report needed but unlisted docs as skips and record empty `A` as skipped without dispatch; (2) from the build's pinned PRE-BUILD BASE SHA, the host creates branch `codex/<spec>-scribe` and worktree `<repo>-wt/<spec>-scribe`, before copying, requires index == working tree for every staged build path in the integration tree (`git diff --quiet -- <path>` exits 0; for deletions the path is absent from both index and working tree), stopping and reporting any mismatch to the owner; copies exactly those staged build bytes onto the worktree from the pre-build base with the same operation-aware byte-copy or indexed `git apply` procedure used for task integration (`references/parallel-codex.md:51-122`), and commits there as `build(<spec>): scribe base`. This transient `codex/*` task-branch commit, under ADR-046 D1 build mechanics, is `SCRIBE_BASE`; never commit on the integration branch; (3) invoke `codex-dispatch.ps1 -Spec <s> -SpecSourcePath <absolute-spec> -Task scribe -Phase build -Model gpt-6-luna -Effort low -Attended -Worktree <scribe-worktree> -BaseSha SCRIBE_BASE -Authorized <A> -Prompt <pack>` per repo, with pack containing the `SCRIBE_BASE` versus pre-build-base diff limited to `A` source files, verbatim `## Intent`, and current CHANGELOG/README only when each is in `A`; allow only diff/Intent-supported facts, existing CHANGELOG style, user-facing README, and source documentation comments; (4) allow C#/Java/TS/JS `///` and `/** */`, JS/TS `//`, Python first-statement module/class/def docstrings and `#`, PowerShell comment-based help and `#`, with whitespace edits only within comments; Python docstrings (the first-statement string literal of a module/class/def) are the sole exception and may be added or edited although they are string tokens; reject every other string or code token change and any add/remove/edit of directive or pragma comments (`eslint-disable`, `@ts-ignore`, `#pragma`, `# type:`, `# noqa`, `#requires`, `#region`, shebang, encoding); (5) on a failed dispatch, quota/429/usage-limit, "model at capacity", or a launch error naming the model/quota/capacity in `.final` or log permits one non-destructive retry regardless of wrapper exit code (the wrapper maps child and launch failures to exit 1), except exit 79, which stays queue/park: retain the failed worktree, create a NEW branch/worktree `codex/<spec>-scribe-sol` / `<repo>-wt/<spec>-scribe-sol` from the same `SCRIBE_BASE`, and redispatch there with the same flags and pack, `-BaseSha SCRIBE_BASE -Authorized <A> -Model gpt-6-sol -Effort low`; select the retry's wrapper ledger row for the gate key. A launch failure without model-availability evidence (missing executable, permission denied, sandbox error) has no retry and goes to the owner; exit 79 stays queue/park, and every other nonzero without that evidence has no retry and goes to the owner; (6) after exit 0, read the latest wrapper ledger row with `spec=<s>, task=scribe` for the selected dispatch and take `run_id`, `worktree_key`, and `end_tree_digest` verbatim. Pin the Scribe worktree with `tree-pin.ps1 -Pin -Worktree <scribe-worktree> -Label <spec>-scribe`, record its digest with `tree-pin.ps1 -Digest -Worktree <scribe-worktree>`, and require equality with the ledger `end_tree_digest`; on mismatch stop and report tree movement. Dispatch `apex-critic` through the Agent tool with `model: sonnet`, `mode: code`, over the Scribe diff versus `SCRIBE_BASE`, using the step (4) comment-only rule, including its sole Python first-statement docstring exception and prohibition on every other string or code token change, as the source-edit pass criterion and fact support for docs; BLOCK on violation. On return run `tree-pin.ps1 -Verify -Worktree <scribe-worktree> -Label <spec>-scribe` and set `reviewed_tree_digest` to that pinned digest. THEN run the repo `AGENTS.md` verify fence and run `tree-pin.ps1 -Verify -Worktree <scribe-worktree> -Label <spec>-scribe` again; if verification moved the tree, do not integrate or silently re-run and report to the owner. Append through `hooks/apex-ledger-append.ps1` a review row with `run_id: insession-<guid>`, `in_session: true`, `spec: <s>`, `task: scribe`, `worktree_key` exactly from the selected wrapper row, `phase: review`, `builder_family: openai`, `reviewer_family: anthropic`, `builder_model` equal to the selected model, `attended: true`, `reviewed_run_id` equal to Scribe `run_id`, `reviewed_tree_digest` equal to the pinned digest, `status: done`, and `started: <utc-o>`; then run `apex-family-gate.ps1 -Spec <s> -Task scribe -WorktreeKey <ledger worktree_key>`; (7) after all gates pass, host first commits the selected Scribe worktree result on `codex/<spec>-scribe` (or the selected retry branch); integrate only its `SCRIBE_BASE` -> committed Scribe result diff for the exact files Scribe changed (a subset of `A`) through the attended indexed `git apply` pipe in `references/parallel-codex.md:51-122`: `git diff --binary SCRIBE_BASE <scribe-branch-commit-or-worktree-state> -- <paths> | git apply --check --index`, then the same diff piped to `git apply --index`, with the same pre/post filtered-hash and staged-set checks. Git apply is atomic: a failed check or apply leaves the integration tree unchanged. On any postcheck mismatch after apply, report the exact paths to the owner and take no further automatic action. On BLOCK, verify, pin, or gate failure integrate nothing, retain worktrees, record diagnosis in handoff, and ask owner to redispatch docs-only with `A` limited to CHANGELOG/README listed in `## Files to Change` or skip. Teardown of Scribe worktrees/branches follows D8 and the owner `!` handback (`references/parallel-codex.md:132`); host runs `codex-dispatch.ps1 -ListObligations` before archival; (8) deliver `scribe_summary = {status: integrated|skipped|discarded, model: used model including fallback, files_written: paths, docs_skipped_unlisted: paths, reason: text}` to the technical-docs agent. — files: skills/apex-code/references/scribe.md — done when: all eight steps, exact commands, op-aware base, ledger binding, pin order, rules, outcomes, and fields are present.
- [ ] **Task 2** - In `skills/apex-code/SKILL.md:359,377-384,432-446`, change "before either docs agent" to "before the Scribe and the docs agent"; insert the Scribe as a NEW numbered Post-build step directly after step 1 (Critic cadence), then renumber the following steps and update every in-file reference to a Post-build step number (`rg -n -F -e 'step 4' -e 'step 5' -e 'step 6' -e 'step 7' -e 'step 8' -e 'step 9' skills/apex-code/SKILL.md`). Point the new step to `references/scribe.md`; run it only after the Critic cadence returns clean or the recorded owner resolution and before the family gate and `apex-docs-technical-agent` steps. Keep the existing build Critic and family-gate requirements and D6 exemptions at `:332` intact. Update the wrapper model sentence at `:383-384` to include the prerequisite's `gpt-6-luna` without claiming it is the default. Bump frontmatter at `:3-4` from `2.20.0` to `2.21.0` and set `last_updated: 2026-10-06`; keep `SKILL.md` at or under 500 lines. — files: skills/apex-code/SKILL.md — done when: the new step, order, version/date, and line cap hold and no Post-build step reference points at the wrong step.
- [ ] **Task 3** - Delete `agents/apex-docs-product-agent.md:1-73`. In `agents/apex-docs-technical-agent.md:18,35-38,63`, replace `docs_product_summary` with the Task 1 `scribe_summary` input; carry model used, fallback, and any discarded result into **Decisions Made**, carry `docs_skipped_unlisted` into **What's Next**, and report `integrated|skipped|discarded` with reason in Step 5. Preserve the four-section handoff and D6 host's-pen steps at `:10,40-59`. — files: agents/apex-docs-product-agent.md, agents/apex-docs-technical-agent.md — done when: the retired agent file is absent and the technical agent consumes only `scribe_summary` for this role.
- [ ] **Task 4 (HOST)** - Amend `C:/Users/User/apex/docs/technical/adr/ADR-048-role-redesign.md:63,69-70,108-110,129` with a dated `2026-10-06` stage-3-shipped note: Luna low Scribe, authorized CHANGELOG/README and changed-source inline comments, comment-only Critic gate, and Sol low model-availability fallback; retain the broader ADR roadmap. — files: C:/Users/User/apex/docs/technical/adr/ADR-048-role-redesign.md — done when: one dated amendment states all four points.
- [ ] **Task 5 (HOST)** - Prepend one `2026-10-06` `apex-code` `2.21.0` row to `C:/Users/User/apex/SKILL-HISTORY.md:5`, naming `scribe.md`, the modified skill and technical agent, the retired product agent, and the Scribe/fallback/gate change. — files: C:/Users/User/apex/SKILL-HISTORY.md — done when: exactly one new dated row records the build.
- [ ] **Task 6 (HOST)** - Replace `C:/Users/User/apex/SKILLS.md:65-66` process-agent sentence so it names the Codex Scribe for CHANGELOG/README/inline docs and `apex-docs-technical-agent` for handoff/archive, with no live product-agent name. — files: C:/Users/User/apex/SKILLS.md — done when: the sentence matches the shipped roles.

## Wave plan
Wave 1: [task 1] | Wave 2: [task 2] | Wave 3: [task 3] | HOST close-out after the build: [tasks 4-6]. Manifest `depends_on` is authoritative; `max_parallel_codex: 1` also makes coder dispatch sequential.

## Permissions

The following noncritical file operations and read-only verification run under this spec. Critical paths require their existing attended gate; D6 host's-pen exemptions are unchanged. 

### File Operations
| Action | Paths |
|--------|-------|
| Create | C:/Users/User/.claude/skills/apex-code/references/scribe.md |
| Modify | C:/Users/User/.claude/skills/apex-code/SKILL.md; C:/Users/User/.claude/agents/apex-docs-technical-agent.md; C:/Users/User/apex/docs/technical/adr/ADR-048-role-redesign.md; C:/Users/User/apex/SKILL-HISTORY.md; C:/Users/User/apex/SKILLS.md |
| Delete | C:/Users/User/.claude/agents/apex-docs-product-agent.md |

### Commands
| Command | Purpose |
|---------|---------|
| `apex-spec-validate.ps1 -SpecPath <promoted-spec>` | Validate the promoted spec against the contract. |
| `rg -uu -n -F 'apex-docs-product-agent' C:/Users/User/.claude/skills C:/Users/User/.claude/agents -g '!**/fixtures/**'` | Check live role references after deletion. |
| Build-repo `AGENTS.md` `## Verify commands` fence, executed in order from `C:/Users/User/.claude` | Structural build verification. |
| APEX `AGENTS.md` `## Verify commands` fence, excluding the D6 host-owned status cap | HOST structural verification of the APEX repo; the status-file cap stays with the planning host. |

### Git Operations
| Operation | Scope |
|-----------|-------|
| No commit/add/push by the coder | Leave both working trees for the host's integration. |
| Scribe runtime transient task-branch base/worktree/integration | Future post-build host action defined in `scribe.md`, not this spec-authoring dispatch. |

### Environment Access
| Variable | Purpose |
|----------|---------|
| `APEX_STATE_DIR`, `LOCALAPPDATA`, `TEMP` | Existing ledger resolution for Scribe review row. |

### Network
(none)

## Specialist Context
### Security
Critical-file classification removes those paths from Scribe authorization; directive/pragma comments are protected from Scribe edits.

### Performance
One Scribe dispatch per repository; one model-availability retry maximum.

### Accessibility
(none)

## Documentation
| Doc type | File | Action |
|----------|------|--------|
| Protocol | skills/apex-code/references/scribe.md | Create Scribe close-out reference. |
| Skill | skills/apex-code/SKILL.md | Point Post-build to Scribe and bump version. |
| Agent | agents/apex-docs-technical-agent.md | Consume Scribe summary. |
| ADR | C:/Users/User/apex/docs/technical/adr/ADR-048-role-redesign.md | Add dated shipped amendment. |
| History | C:/Users/User/apex/SKILL-HISTORY.md | Add one 2.21.0 row. |
| Index | C:/Users/User/apex/SKILLS.md | Correct process roles. |

## Acceptance Criteria
- [ ] Task 1 -> verify: `Test-Path C:/Users/User/.claude/skills/apex-code/references/scribe.md` is true; `rg -n -F` finds the per-path staged index/working-tree equality check and owner stop, PRE-BUILD BASE to transient task-branch `SCRIBE_BASE` copy and commit, `git diff --name-status` set derivation, CHANGELOG/README authorization only through `## Files to Change` and unlisted-doc skips, per-path critical filtering and create/modify ops, exact dispatch flags, both models with `low`, a non-destructive retry worktree for model-availability evidence regardless of wrapper exit code, no retry for unrelated launch failures, the exit-79 queue/park rule, the Python first-statement docstring exception with every other string/code token and directive restriction, ledger row values, digest equality and two `tree-pin.ps1 -Verify` checks around the verify fence, the same comment-only Critic pass rule, `apex-ledger-append.ps1` row fields, ledger-bound `apex-family-gate.ps1`, a committed Scribe result followed only by the attended indexed `git apply --check --index` / `git apply --index` pipes with pre/post filtered-hash and staged-set checks, atomic failed-apply behavior and exact-path owner report on postcheck mismatch, D8 teardown/`-ListObligations`, and all five `scribe_summary` fields. The reference is at most 500 lines and all file pointers resolve.
- [ ] Task 2 -> verify: `rg -n -F` in `skills/apex-code/SKILL.md` finds `version: 2.21.0`, `last_updated: 2026-10-06`, and `references/scribe.md`; numbered Post-build line order is Critic cadence, new Scribe step, family gate, technical-docs agent. The line at prior `:359` says "before the Scribe and the docs agent". `rg -n -F -e 'step 4' -e 'step 5' -e 'step 6' -e 'step 7' -e 'step 8' -e 'step 9' skills/apex-code/SKILL.md` plus the numbered list confirms no Post-build step reference points at the wrong step. `rg -n -F 'apex-docs-product-agent' skills/apex-code/SKILL.md` returns no hits; `Get-Content` line count is at most 500.
- [ ] Task 3 -> verify: `Test-Path agents/apex-docs-product-agent.md` is false; `rg -n -F` in `agents/apex-docs-technical-agent.md` finds `scribe_summary`, `integrated`, `skipped`, `discarded`, model/fallback, **Decisions Made**, **What's Next**, and unlisted-doc skips; `rg -n -F 'docs_product_summary' agents/apex-docs-technical-agent.md` returns no hits.
- [ ] Task 4 (HOST) -> verify: `rg -n -F` in `C:/Users/User/apex/docs/technical/adr/ADR-048-role-redesign.md` finds a `2026-10-06` stage-3-shipped amendment with `gpt-6-luna`, `gpt-6-sol`, inline comments, and comment-only Critic gate.
- [ ] Task 5 (HOST) -> verify: `rg -n -F '2026-10-06 | apex-code' C:/Users/User/apex/SKILL-HISTORY.md` returns exactly one new `2.21.0` row naming the four coder paths, including the deletion, and Scribe fallback/gate.
- [ ] Task 6 (HOST) -> verify: `rg -n -F` in `C:/Users/User/apex/SKILLS.md` finds Scribe and `apex-docs-technical-agent` in the process-role sentence; `rg -n -F 'apex-docs-product-agent' C:/Users/User/apex/SKILLS.md` returns no hits.
- [ ] Spec validation -> verify: after promotion to `docs/changes/`, `apex-spec-validate.ps1` exits 0 with no `FILES-COMPLETENESS`, `TASK-CRITERIA-COVERAGE`, `STRUCTURE`, or `EXEC-MANIFEST` finding.
- [ ] Verify fences -> verify: from `C:/Users/User/.claude`, run each command in its `AGENTS.md` `## Verify commands` fence, in order, and require exit 0. In APEX, run the three checks in `AGENTS.md:34-43` for skill caps, pointers, `CLAUDE.md` and `AGENTS.md` caps; the planning host alone runs and reports the status-file cap. Do not open that file in this dispatch.
- [ ] Scope -> verify: `Test-Path -LiteralPath C:/Users/User/.claude/skills/apex-code/references/scribe.md` is true. In `C:/Users/User/.claude`, compare before/after file listings from `git ls-files -co --exclude-standard` UNION the explicit coder paths in this spec; hash each present path with `git hash-object --path <path> <path>` and mark absent paths. This listing includes the created reference because that repo ignores `*`; also require `Test-Path -LiteralPath` for the created file, and for the tracked deletion confirm `git ls-files --deleted` names the path and `Test-Path -LiteralPath` is false. In `C:/Users/User/apex`, check only the explicit HOST paths in `## Files to Change` (ADR-048, SKILL-HISTORY.md, SKILLS.md) before/after with `git hash-object --path <path> <path>` and mark absent paths; do not list or hash the rest of APEX, and never read the planning host's status file. Only the spec's paths may change. Name pre-existing dirty paths among those checked without modifying them; do not use `git status --porcelain -uall` or `git diff --stat` as the sole scope check.
- [ ] SPEC-LEVEL reachability -> verify: `skills/apex-code/SKILL.md` Post-build points to `references/scribe.md` after the Critic cadence and before family gate and technical-docs handoff; that reference contains the executable wrapper dispatch and gate sequence. `rg -uu -n -F 'apex-docs-product-agent' C:/Users/User/.claude/skills C:/Users/User/.claude/agents -g '!**/fixtures/**'` returns no hits after build; historical fixture specs and history are excluded.

## Progress
_(The build writes here; do not edit manually.)_
