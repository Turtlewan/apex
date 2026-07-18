---
spec: round8-c3-gate-compare
status: draft
autonomy_level: L2
risk: high
coder_effort: medium
---

# Spec: family-gate tree-digest compare — the last-line vouching backstop

**Identity:** Add D6 item 5(c) to `apex-family-gate.ps1`: a review row only vouches for the selected build when their recorded tree digests are present, verifiable, and equal — so a review bound by `run_id` but describing a different (or unverifiable) tree cannot satisfy the gate.
→ why: see docs/technical/adr/ADR-044-round8-deferred-designs.md (D6 item 5(c) — "apex-family-gate compares the two recorded digests as the last-line backstop").

## Intent
- **Intent:** Make the two digests round8-c2 records (`end_tree_digest` on the build row, `reviewed_tree_digest` on the review row) a gate-time backstop: a digest that disagrees, or that is unverifiable, disqualifies the review from vouching.
- **Invariants:** In the review acceptance loop, a review row bound to the selected build is DISqualified (skipped, does not vouch) when BOTH digest properties are present AND (they differ OR either value is empty / whitespace / the `unverifiable` sentinel). When either PROPERTY is absent, the gate's decision is byte-identical to today (migration-safe). No other gate behavior changes; no new exit code — a disqualified review simply leaves nothing to vouch, so the existing `exit 12` is reached.
- **Non-goals:** No recomputation of any digest (the gate reads recorded ledger facts only). No change to the void-marker skip, the cross-family rule, or the attended-human rule. No new files.

## Assumptions
- The review acceptance loop (≈193-225) already skips a bound review on a void-trust marker via a `$row.PSObject.Properties.Name` presence check (≈203-210); the digest skip mirrors that shape and slots after it (≈210) and before the cross-family accept (≈212) → impact: Stop
- `$selectedBuild` (≈161) is in scope in the loop and carries `end_tree_digest` once round8-c2 ships; `$row` carries `reviewed_tree_digest`; c2 records an uncomputable digest as the literal `unverifiable`, never empty → impact: Stop
- When no bound review vouches, the gate falls through to `exit 12` (≈232) with the message at ≈231; a vouching review reaches `exit 0` (≈228). The docstring exit contract is at ≈5-10 → impact: Stop
- `family-gate-test.ps1` seeds ledger fixtures under `TEMP` and passes them via an explicit `-LedgerPath` (param ≈34); it does not rely on `APEX_STATE_DIR` → impact: Caution

Simplicity check: considered a distinct exit for digest disqualification — rejected: a disqualified review is exactly "nothing vouches", which exit 12 already expresses; a new code would fragment the gate's contract for no behavioral gain.

## Prerequisites
- Specs complete first: **round8-c2-dispatch-binding** — it records the two field names (`end_tree_digest`, `reviewed_tree_digest`) and the `unverifiable` sentinel this gate reads. Build strictly after it.
- Environment setup required: none. Isolated worktree copy of the `.claude` tree (ADR-044 isolation contract X1–X4).

## Files to Change
| File | Operation | Notes |
|------|-----------|-------|
| skills/apex-code/scripts/apex-family-gate.ps1 | modify | Digest-disagreement/unverifiable skip; exit-12 message + docstring name the digest cause. |
| skills/apex-code/scripts/family-gate-test.ps1 | modify | Behavioral cases: mismatch / empty / whitespace / unverifiable → 12; match / absent → 0. |

## Tasks
- [ ] **Task 1** — Implement the digest backstop and its coverage across both files. In `skills/apex-code/scripts/apex-family-gate.ps1`: (a) inside the review branch (`if ($row.phase -ceq 'review')`, ≈202), immediately AFTER the void-marker skip `if ($hasVoidTrustMarker) { continue }` (≈208-210) and BEFORE the cross-family acceptance (≈212), add a digest disqualification mirroring the void-marker presence check (≈203-206): read `@($selectedBuild.PSObject.Properties.Name)` and `@($row.PSObject.Properties.Name)`; when the build row has an `end_tree_digest` property AND the review row has a `reviewed_tree_digest` property, take `$buildDigest = [string]$selectedBuild.end_tree_digest` and `$reviewDigest = [string]$row.reviewed_tree_digest`, and `continue` (this review does not vouch) when `[string]::IsNullOrWhiteSpace($buildDigest)` OR `[string]::IsNullOrWhiteSpace($reviewDigest)` OR `$buildDigest -ceq 'unverifiable'` OR `$reviewDigest -ceq 'unverifiable'` OR `$buildDigest -cne $reviewDigest`. When either PROPERTY is absent, fall through unchanged (migration-safe). (b) Update the exit-12 message (≈231) so it also names digest disqualification as a possible cause (e.g. append: `-- or the bound review's tree digest is missing, unverifiable, or disagrees with the build's`). (c) Add one line to the docstring exit contract (≈5-10) stating that a bound review vouches only when its `reviewed_tree_digest` is present, verifiable, and equal to the build's `end_tree_digest`. In `skills/apex-code/scripts/family-gate-test.ps1`, add BEHAVIORAL cases over the suite's ledger-seeding fixtures (a terminal-success build + a bound cross-family review that would otherwise vouch): (1) mismatch — differing non-empty digests → `exit 12`; (2) build digest empty / (3) review digest whitespace / (4) either digest `unverifiable` → each `exit 12`; (5) match — equal non-empty digests → `exit 0`; (6) absent-either-side — build has `end_tree_digest` but the review omits `reviewed_tree_digest`, and the reverse → each `exit 0` (unchanged acceptance). Existing suite cases pass unmodified. files: skills/apex-code/scripts/apex-family-gate.ps1, skills/apex-code/scripts/family-gate-test.ps1 — done when: the gate disqualifies a bound review whose digest is missing/whitespace/`unverifiable`/mismatched (→ 12) and vouches only on an equal verifiable pair (→ 0); an absent property on either side preserves today's behavior; the exit-12 message and docstring name the digest cause; the suite exits 0 with the new cases and no regression.

## Wave plan
Wave 1: [Task 1]
<!-- Single task: implementation and its tests land together in one file-pair and run one suite. -->

## Permissions

The following actions will run autonomously during build.
Approving this spec approves all of them.

### File Operations
| Action | Paths |
|--------|-------|
| Create | (none) |
| Modify | skills/apex-code/scripts/apex-family-gate.ps1, skills/apex-code/scripts/family-gate-test.ps1 |
| Delete | (none) |

### Commands
| Command | Purpose |
|---------|---------|
| `powershell.exe -NoProfile -File .\skills\apex-code\scripts\family-gate-test.ps1` | Family-gate suite incl. digest compare (X2). |

### Verify commands
Run from the worktree root (X2) — the `.claude` repo verify contract (worktree AGENTS.md `## Verify commands`), plus the target suite above:

```
node --check hooks/destructive-command-guard.js
node --check hooks/lib/destructive-detect.js
python hooks/destructive-guard-test.py
powershell.exe -NoProfile -File skills/apex-code/scripts/baseline-check-test.ps1
powershell.exe -NoProfile -File skills/apex-code/scripts/spec-validate-test.ps1
powershell.exe -NoProfile -File skills/apex-code/scripts/dispatch-preflight-test.ps1
powershell.exe -NoProfile -File skills/apex-code/scripts/family-gate-test.ps1
```

### Git Operations
| Operation | Scope |
|-----------|-------|
| (none) | The builder performs no git operations; the host integrates the worktree diff and commits (X3). |

_Host integration-commit message: `feat(family-gate): tree-digest compare backstop — disqualify a review whose digest is missing, unverifiable, or disagrees (ADR-044 D6 item 5c)`._

### Environment Access
| Variable | Purpose |
|----------|---------|
| `TEMP` | Test isolation — `family-gate-test.ps1` builds ledger fixtures under `TEMP` and passes them via an explicit `-LedgerPath`; the gate does not consume `APEX_STATE_DIR` in these runs. |

### Network
| Action | Purpose |
|--------|---------|
| (none) | No package installation. |

## Specialist Context
### Security
This is the last-line backstop for D6 item 5: even if a review were launched against a stale or swapped tree and somehow reached the gate, a digest that disagrees — or that is unverifiable (empty / whitespace / the `unverifiable` sentinel c2 records when it could not compute one) — now disqualifies it from vouching. The gate reads recorded ledger facts only (no recomputation), so it cannot itself be raced, and it fails safe (a disagreement or unverifiable digest removes a voucher, never adds one). The documented recovery for an unverifiable-but-legitimate build is the attended human-review ledger row, which the gate still accepts.

### Performance
(none)

### Accessibility
(none)

## Documentation
| Doc type | File | Action |
|----------|------|--------|
| Inline | skills/apex-code/scripts/apex-family-gate.ps1 | Docstring line + exit-12 message naming the digest cause; comment the skip (mirrors the void-marker skip; migration-safe when the property is absent). |
| ADR | docs/technical/adr/ADR-044-round8-deferred-designs.md | Already carries D6 item 5(c) — no new ADR. |

## Acceptance Criteria
- [ ] **Task 1** → verify: `powershell.exe -NoProfile -File .\skills\apex-code\scripts\family-gate-test.ps1` exits 0 with the new behavioral cases — mismatch, empty, whitespace, and `unverifiable` digests each drive the gate to `exit 12`, an equal verifiable pair drives `exit 0`, and an absent property on either side preserves today's acceptance — and no existing case regresses; the gate's exit-12 message and docstring name the digest disqualification cause.

## Host verification
Host integrates the worktree diff into the live `.claude` tree with NO gates open (X3), then re-runs on the live tree: `family-gate-test.ps1` and (non-regression) `dispatch-test.ps1`, `dispatch-criticalfile-test.ps1`, and `dispatch-preflight-test.ps1` — all exit 0. Host verification is the authoritative acceptance gate; the builder's green is necessary, not sufficient. At wave close the host updates `harness-known-limits.md` (host-owned, kept OUT of this spec's Files to Change) noting the family-gate now disqualifies a review whose recorded tree digest is missing, unverifiable, or disagrees with the selected build's. No skill frontmatter changes in this spec, so no `SKILL-HISTORY.md` row.

## Progress
_(Coding mode writes here — do not edit manually)_
