---
spec: round8-d2-familygate-void
status: draft
autonomy_level: L2
coder_effort: high
cross_model_review: true
risk: high
---

# Spec: family-gate rejects trust-marked (VOID) cross-family review rows

**Identity:** In `apex-family-gate.ps1`, discount any `phase -ceq 'review'` row whose `tree_moved` or `scopeViolation` is present-and-true, so a bound-but-VOID review no longer vouches. `encoding_violation` is deliberately NOT discounted.
→ why: see docs/technical/adr/ADR-044-round8-deferred-designs.md (D2).

**All paths below are relative to the build worktree root; the host supplies the worktree (an isolated copy). Verify commands run from that root.**

## Intent
- **Intent:** the family-gate is the last line and must independently honor a VOID marker a review row carries, rather than accepting any terminal `done` review row.
- **Invariants:** a `phase -ceq 'review'` row with `tree_moved` or `scopeViolation` present-and-`$true` does NOT count toward `$hasCrossFamilyReview`; `encoding_violation` present-and-true STILL vouches (adopt-path pre-existing-mojibake carve-out); absent, explicit `false`, and explicit `null` on those fields still vouch; the marker check is scoped to review-phase rows only, so a bound attended human-review row is unaffected; exit contract unchanged (0/12/13).
- **Non-goals:** no writer-side change to the dispatcher; no new status token; no migration-boundary changes; the adopt-path encoding-scan guard is Wave B.

## Assumptions
- The review-acceptance loop sits at `apex-family-gate.ps1` (≈188-211) and sets `$hasCrossFamilyReview`; rows carry a `phase` field → impact: Caution (locate by variable, not line).
- `family-gate-test.ps1`'s `New-FixtureRow` (≈11-39) builds rows serialized to a JSON ledger and can gain one optional property-map parameter → impact: Stop.
- The legacy fixture set serializes byte-identically when the new parameter is not supplied → impact: Stop (verified by capture-and-diff, not asserted).

Simplicity check: yes — one optional `-ExtraFields` property-map (attached only when supplied) leaves legacy serialization untouched by construction, simpler and safer than three tri-state params.

## Prerequisites
- Specs complete first: none (file-disjoint from A1/A3/A4).
- Environment: none.

## Build isolation
`apex-family-gate.ps1` is the gate `codex-dispatch.ps1` consults to accept a cross-family review. The build runs in an ISOLATED WORKTREE copy (round-8 W3 pattern), NOT the live tree; the host integrates the diff and re-runs the suites on the live tree post-integration, with no gates open during integration.

## Files to Change
_All paths relative to the build worktree root._
| File | Operation | Notes |
|------|-----------|-------|
| skills/apex-code/scripts/apex-family-gate.ps1 | modify | discount present-and-true `tree_moved`/`scopeViolation` on `phase -ceq 'review'` rows; update header docstring |
| skills/apex-code/scripts/family-gate-test.ps1 | modify | add `-ExtraFields` property-map to `New-FixtureRow`; capture-and-diff byte-compat; per-state emission + gate-exit + human-review cases |

## Tasks
- [ ] **Task 1:** Pre-change byte-compat capture. BEFORE any edit, run the UNMODIFIED `skills/apex-code/scripts/family-gate-test.ps1` once and save the serialized legacy fixture ledger bytes to a capture file under `TEMP`. Record the capture path and the suite's exit code in the dispatch task report (the builder's final report). — files: skills/apex-code/scripts/family-gate-test.ps1 — done when: the legacy serialized ledger bytes are captured and the path is reported.
- [ ] **Task 2:** In the review-acceptance loop (≈188-211), BEFORE setting `$hasCrossFamilyReview`, and scoped to `phase -ceq 'review'` rows ONLY, skip any row where `tree_moved` OR `scopeViolation` is present-and-`$true` (property-exists check plus `-eq $true`, so absent/false/null passes). Do NOT discount on `encoding_violation`. Skipped row falls through; if nothing else vouches, exit 12. Exit contract (0/12/13) unchanged. — files: skills/apex-code/scripts/apex-family-gate.ps1 — done when: a review-phase `tree_moved`/`scopeViolation`-marked row no longer contributes; an `encoding_violation`-only review row and any non-review row still contribute.
- [ ] **Task 3:** Update the header docstring (≈6-15) to state the trust-marker rule (review-phase `tree_moved`/`scopeViolation` present-and-true does not vouch) and the `encoding_violation` carve-out (adopt-path guard queued to Wave B). — files: skills/apex-code/scripts/apex-family-gate.ps1 — done when: docstring names both discounted markers, the phase scoping, and the carve-out.
- [ ] **Task 4:** Extend `New-FixtureRow` (≈11-39) with ONE optional property-map parameter `-ExtraFields` (e.g. `@{tree_moved=$true}`) attached to the row only when supplied; omitted → legacy serialization untouched. The map must be able to emit a key with value `true`, `false`, or `null`. — files: skills/apex-code/scripts/family-gate-test.ps1 — done when: `-ExtraFields` emits the given keys; omission leaves the row byte-identical to legacy.
- [ ] **Task 5:** Add cases. Byte-compat: re-serialize the legacy fixture set (no `-ExtraFields`) and assert byte equality with the Task 1 capture file. Per-state emission (whitespace-normalized string assertions on the serialized row) for EACH marker `tree_moved`/`scopeViolation`/`encoding_violation` in EACH state: supplied `$true` → contains `"<marker>":true`; supplied `$false` → contains `"<marker>":false`; supplied `$null` → contains `"<marker>":null`; omitted → the key is absent. Gate-exit cases: (i) `tree_moved:true` review → 12; (ii) `scopeViolation:true` review → 12; (iii) `encoding_violation:true` review STILL vouches → 0; (iv) `tree_moved`/`scopeViolation` both `false` → 0; (v) `tree_moved: null` review → 0; (vi) `scopeViolation: null` review → 0; (vii) a `tree_moved:true` review PLUS a second clean bound review → 0; (viii) a `tree_moved:true` cross-family review PLUS a bound attended human-review row → 0 (human-review substitute unaffected by the review-phase scoping). — files: skills/apex-code/scripts/family-gate-test.ps1 — done when: the byte-equality assertion, all per-state emission assertions, and all eight gate-exit cases pass.

## Wave plan
Wave 1 — single sequential wave, one coder: Task 1 (capture) → Task 2 → Task 3 (both `apex-family-gate.ps1`) → Task 4 → Task 5 (both `family-gate-test.ps1`; Task 5 consumes Task 4's `-ExtraFields` and Task 1's capture). No intra-spec parallelism.

## Permissions

The following actions run autonomously during build, in the isolated worktree (see ## Build isolation).
The host assembles any `-Authorized` grants as repo-relative tokens matching the Files-to-Change list.
Approving this spec approves all of them.

### File Operations
_Worktree-root-relative._
| Action | Paths |
|--------|-------|
| Create | (none) |
| Modify | skills/apex-code/scripts/apex-family-gate.ps1 |
| Modify | skills/apex-code/scripts/family-gate-test.ps1 |
| Delete | (none) |

### Git Operations
The builder stages/commits NOTHING; the host commits after verification. Any suite-internal `git init`/`config`/`add`/`commit` in throwaway TEMP repos is suite-internal, distinct from repo git operations.

### Environment Access
| Variable | Purpose |
|----------|---------|
| `TEMP` | scratch ledger, fixture, and byte-capture files the suite creates and deletes |
| `APEX_STATE_DIR` | isolate any ledger state off the live location during the suite |

### Temp files
The suite creates and deletes fixture ledger files and the byte-compat capture file under `TEMP`.

### Network
| Action | Purpose |
|--------|---------|
| (none) | No package installation |

### Verify commands
Run from the build worktree root:

```
powershell.exe -NoProfile -File .\skills\apex-code\scripts\family-gate-test.ps1
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
Closes a trust gap: a bound-but-VOID review (moved tree or scope violation) previously vouched. It only tightens acceptance and deliberately excludes `encoding_violation` to avoid refusing clean adopt-path reviews; it opens no new bypass. `apex-family-gate.ps1` is a review-integrity control, so `cross_model_review: true` and an attended host dispatch in an isolated worktree apply.

### Performance
(none — one extra property check per review-phase row)

### Accessibility
(none — no frontend surface)

## Documentation
| Doc type | File | Action |
|----------|------|--------|
| ADR | docs/technical/adr/ADR-044-round8-deferred-designs.md | Reference (D2, already written) |
| Inline | skills/apex-code/scripts/apex-family-gate.ps1 | Header docstring states the rule + carve-out (Task 3) |

## Host verification
Authoritative acceptance gate (builder green is necessary, not sufficient). The host integrates the worktree diff into the live tree with NO gates open and re-runs the full suites on the live tree.

## Acceptance Criteria
- [ ] Byte-compat captured and equal (Task 1, Task 5) → verify: the legacy fixture set re-serialized without `-ExtraFields` is byte-equal to the Task 1 capture file.
- [ ] Trust-marked review rows discounted, phase-scoped (Task 2) → verify: a review-phase `tree_moved`/`scopeViolation` present-and-true row does not contribute; an `encoding_violation`-only review row and a non-review row still contribute.
- [ ] Docstring updated (Task 3) → verify: header names both discounted markers, the phase scoping, and the carve-out.
- [ ] Emission modes verifiable (Task 4, Task 5) → verify: each marker emits `true`/`false`/`null` when supplied and is absent when omitted (whitespace-normalized string assertions).
- [ ] Gate-exit + human-review cases pass (Task 5) → verify: the eight cases yield 12/12/0/0/0/0/0/0; both `null` cases and the `encoding_violation:true` case vouch; the marked-cross-family-plus-human-review case exits 0.

## Progress
_(Coding mode writes here — do not edit manually)_
