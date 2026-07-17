---
spec: round8-d3-hoststate-critical
status: draft
autonomy_level: L2
coder_effort: high
cross_model_review: true
risk: high
---

# Spec: host-state files become a CRITICAL category in apex-critical-files

**Identity:** Add a `host-state` category to `apex-critical-files.ps1` (normalization harmonized to scope-check) so status.md / root AGENTS.md / root CLAUDE.md / docs/changes / docs/handoff / the run-ledger route through the existing two-tier confirmation gate; flip the stale status.md fixture; record the category in the apex-governance canonical source.
→ why: see docs/technical/adr/ADR-044-round8-deferred-designs.md (D3).

**Path-set RATIFIED by the user 2026-07-17 — six matchers, final: `docs/status.md` (exact), root `AGENTS.md` (normalized `agents.md`), root `CLAUDE.md` (normalized `claude.md`), `^docs/changes/` prefix, `^docs/handoff/` prefix, basename `codex-run-ledger.jsonl`.**

**All paths below are relative to the build worktree root; the host supplies the worktree (an isolated copy). Verify commands run from that root.**

## Intent
- **Intent:** authorizing a coder into host control-state must become a deliberate confirmed act (reusing `-CriticalFilesConfirmed`/exit-76 Layer B) — not silent for literal-token repo-relative grants. Directory grants and absolute-path grants remain an accepted gap with NO interim mitigation, closed by D6/Wave B.
- **Invariants:** the host-state matchers classify `CRITICAL <path>: host-state` and exit 10; the invariant is the gate OUTCOME (exit 10, confirmation required), NOT the emitted label or the category's list position — where a path overlaps another category (e.g. `docs/changes/auth-plan.md` also matches auth) it still exits 10 under whichever label wins; normalization is harmonized to scope-check (strip REPEATED leading `./`, strip trailing slashes); no false-reject of untouched byte-identical dirty host files.
- **Non-goals:** no predicate in the scope-check script; no absolute prohibition; no directory-grant post-hoc classification (D6/Wave B); the dispatch-side SKILL.md host-state authoring note is Wave B; this spec does NOT touch `harness-known-limits.md` (host writes Wave-A known-limits rows at wave close) and does NOT touch `SKILL-HISTORY.md` (host bookkeeping at wave close).

## Assumptions
- `apex-critical-files.ps1` has an existing category pattern with normalized-path matching (its normalization at ≈67-70) → impact: Stop (new category follows it; normalization aligns to scope-check).
- Matchers operate on repo-relative normalized tokens; the classifier is not passed the worktree root today → impact: Stop (absolute-grant limitation, W2).
- The critical-files test currently holds 52 existing cases; exactly ONE status.md fixture ('Non-match - status document', ≈290-294) asserts `docs/status.md` → ExitCode 0 / no match and must be FLIPPED → impact: Stop (51 unchanged + 1 flipped).
- apex-governance SKILL.md is the canonical human-readable home of the critical-files category set (ADR-042), currently version 2.1.0 → impact: Stop (add row + bump 2.2.0).

Simplicity check: yes — reusing the confirmation gate adds one category, no new mechanism. Lightweight Iron Law applies (structural edit to the governance skill).

## Prerequisites
- Specs complete first: none (file-disjoint from A1/A2/A4 — A3 solely owns critical-files scripts + apex-governance/SKILL.md).
- Environment: none.

## Build isolation
`apex-critical-files.ps1` is invoked by `codex-dispatch.ps1`'s Layer-B critical-file gate during any dispatch. The build runs in an ISOLATED WORKTREE copy (round-8 W3 pattern), NOT the live tree; the host integrates the diff and re-runs the suites on the live tree post-integration, with no gates open during integration.

## Files to Change
_All paths relative to the build worktree root._
| File | Operation | Notes |
|------|-----------|-------|
| skills/apex-code/scripts/apex-critical-files.ps1 | modify | add `host-state` category (explicit anchoring) + harmonize normalization to scope-check |
| skills/apex-code/scripts/critical-files-test.ps1 | modify | flip the status.md fixture; add normalization / anchored-negative / exact-output / overlap / basename cases |
| skills/apex-governance/SKILL.md | modify | add host-state row to the Critical files section; bump version 2.1.0 → 2.2.0 |

## Tasks
- [ ] **Task 1:** Add category `host-state` to `skills/apex-code/scripts/apex-critical-files.ps1` (list position is free — first-match-wins on overlap is fine, the contract is exit 10). Explicit anchoring: `docs/status.md` exact on the normalized path; `AGENTS.md` root-only (normalized path exactly `agents.md`); root `CLAUDE.md` root-only (normalized path exactly `claude.md`, same root-only semantics as AGENTS.md, NOT any nested `claude.md`); `docs/changes/` and `docs/handoff/` repo-root-anchored prefixes (`^docs/changes/`, `^docs/handoff/`, NOT segment-anywhere); ledger by basename `codex-run-ledger.jsonl`. Output `CRITICAL <path>: host-state`; exit-10 semantics identical to other categories. Harmonize this script's normalization (≈67-70) to scope-check's: strip REPEATED leading `./` and trailing slashes, so `././docs/status.md` and `docs/status.md/` classify. — files: skills/apex-code/scripts/apex-critical-files.ps1 — done when: the matchers (status.md, root AGENTS.md, root CLAUDE.md, the two prefixes, the ledger basename) classify host-state at exit 10 with harmonized normalization.
- [ ] **Task 2:** In `skills/apex-code/scripts/critical-files-test.ps1`, FLIP the single 'Non-match - status document' fixture (≈290-294) from ExitCode 0 / no match to ExitCode 10 / CRITICAL host-state. Add positives: root `AGENTS.md`, root `CLAUDE.md`, `docs/changes/x.md`, `docs/handoff/2026-07-17.md`, `codex-run-ledger.jsonl`, and `docs/progress/codex-run-ledger.jsonl` (proves basename semantics against the legacy nested ledger). Add normalization positives `././docs/status.md` and `docs/status.md/`. Add an EXACT-output assertion that the emitted line for `docs/status.md` equals `CRITICAL docs/status.md: host-state` verbatim. Add an overlap case `docs/changes/auth-plan.md` → exit 10 (either label). Add anchored negatives that must NOT classify host-state: `docs/status-report.md`, `src/agents.md`, `sub/claude.md` (nested, not root), `docs/changesets/x`, `nested/docs/changes/x.md`, `x/docs/handoff/y.md`. — files: skills/apex-code/scripts/critical-files-test.ps1 — done when: the flip holds; every positive/normalization/exact-output/overlap/basename case passes; every anchored negative is NOT host-state.
- [ ] **Task 3:** In `skills/apex-governance/SKILL.md` ONLY, add a `host-state` row to the Critical files section (status.md, root AGENTS.md, root CLAUDE.md, docs/changes/, docs/handoff/, the run-ledger; TIER-2 confirmable) and bump the frontmatter `version` from 2.1.0 to 2.2.0. — files: skills/apex-governance/SKILL.md — done when: the governance Critical files section lists host-state and the version reads 2.2.0.

## Wave plan
Wave 1: [Task 1, Task 3] | Wave 2: [Task 2]
<!-- Task 1 (classifier) and Task 3 (governance skill) touch disjoint worktree files and run in parallel; Task 2 (tests) depends on Task 1's classifier behavior. All within the isolated worktree. -->

## Permissions

The following actions run autonomously during build, in the isolated worktree (see ## Build isolation).
The host assembles any `-Authorized` grants as repo-relative tokens matching the Files-to-Change list.
Approving this spec approves all of them.

### File Operations
_Worktree-root-relative._
| Action | Paths |
|--------|-------|
| Create | (none) |
| Modify | skills/apex-code/scripts/apex-critical-files.ps1 |
| Modify | skills/apex-code/scripts/critical-files-test.ps1 |
| Modify | skills/apex-governance/SKILL.md |
| Delete | (none) |

### Git Operations
The builder stages/commits NOTHING; the host commits after verification. Any suite-internal `git init`/`config`/`add`/`commit` in throwaway TEMP repos is suite-internal, distinct from repo git operations.

### Environment Access
| Variable | Purpose |
|----------|---------|
| `TEMP` | scratch fixture files the suite creates and deletes |
| `APEX_STATE_DIR` | isolate any state off the live location during the suite |

### Temp files
The suite creates and deletes fixture files under `TEMP`.

### Network
| Action | Purpose |
|--------|---------|
| (none) | No package installation |

### Verify commands
Run from the build worktree root:

```
powershell.exe -NoProfile -File .\skills\apex-code\scripts\critical-files-test.ps1
# Mandatory repo verify recipe — worktree AGENTS.md ## Verify commands:
node --check hooks/destructive-command-guard.js
node --check hooks/lib/destructive-detect.js
python hooks/destructive-guard-test.py
powershell.exe -NoProfile -File .\skills\apex-code\scripts\baseline-check-test.ps1
powershell.exe -NoProfile -File .\skills\apex-code\scripts\spec-validate-test.ps1
powershell.exe -NoProfile -File .\skills\apex-code\scripts\dispatch-preflight-test.ps1
```

## Specialist Context
### Security
Adds a CRITICAL classification tier for host control-state so authorizing a coder into it becomes a deliberate confirmed act (reuses the exit-76 Layer B gate); unattended/AFK dispatches into host state refuse by design. Stated interim limits with NO mitigation until D6/Wave B: (1) directory grants bypass literal-token classification (context-cap-guard only size-caps status.md/CLAUDE.md/AGENTS.md and permits under-cap edits; it does not cover docs/changes, docs/handoff, or the ledger); (2) the matchers operate on repo-relative normalized tokens, so an ABSOLUTE-path grant token will not match — closed in Wave B by plumbing the worktree root through the dispatcher's classifier call. `apex-critical-files.ps1` is a gate control, so `cross_model_review: true` and an attended host dispatch in an isolated worktree apply.

### Performance
(none — one additional category in an already-linear classifier)

### Accessibility
(none — no frontend surface)

## Documentation
| Doc type | File | Action |
|----------|------|--------|
| ADR | docs/technical/adr/ADR-044-round8-deferred-designs.md | Reference (D3, already written) |
| Skill | skills/apex-governance/SKILL.md | Add host-state to the Critical files section; version 2.2.0 (Task 3) |

## Host verification
Authoritative acceptance gate (builder green is necessary, not sufficient). The host integrates the worktree diff into the live tree with NO gates open, re-runs the full suites on the live tree, then performs the bookkeeping the coder cannot: add one row to `SKILL-HISTORY.md` (in the ~/apex repo) for the apex-governance update — newest first, recording version 2.2.0.

## Acceptance Criteria
- [ ] Host-state category classifies with anchoring + harmonized normalization (Task 1) → verify: status.md, root AGENTS.md, root CLAUDE.md, the two prefixes, and the ledger basename each classify host-state at exit 10; the AGENTS.md and CLAUDE.md matchers are root-only; the repeated-dot-prefixed and trailing-slash forms of status.md classify; the contract is exit 10 regardless of list position.
- [ ] Flip; exact-output; overlap; basename; anchored negatives (Task 2) → verify: the former 'Non-match - status document' now asserts host-state; the verbatim expected status.md output line (see Task 2) is asserted; the overlap path exits 10 under either label; the nested-ledger basename case classifies host-state; a status-report sibling, a nested agents.md, a nested (non-root) claude.md, a changesets near-miss, and non-root-anchored nested changes and handoff paths do NOT classify host-state.
- [ ] Suite green (Task 2) → verify: `critical-files-test.ps1` runs with no failing case — 51 unchanged, 1 flipped, plus the enumerated new cases.
- [ ] Canonical source updated (Task 3) → verify: the apex-governance Critical files section lists host-state and the frontmatter version reads 2.2.0.

## Progress
_(Coding mode writes here — do not edit manually)_
