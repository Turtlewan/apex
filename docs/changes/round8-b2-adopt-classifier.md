---
spec: round8-b2-adopt-classifier
status: draft
autonomy_level: L2
risk: high
coder_effort: high
---

# Spec: adopt-path encoding guard + classifier worktree-root plumbing + host-state authoring note

**Identity:** Guard the `-Adopt` encoding scan for review-phase adopts, plumb the worktree root through the dispatcher's critical-file classifier so absolute-path grants are relativized before host-state classification, and document the Layer-A host-state confirmation rule in `SKILL.md`.
→ why: see docs/technical/adr/ADR-044-round8-deferred-designs.md (Wave-B carve-outs i / ii / iii, and D3 consequences a2 / c).

## Intent
- **Intent:** Close three Wave-A review carve-outs: a READ-ONLY-sandbox `-Adopt` (the adopted row's recorded `sandbox` is `read-only`) must not attach `encoding_violation:true` from pre-existing mojibake; an absolute-path grant token must be relativized so host-state matchers fire; spec authors must know host-state authorization needs attended confirmation.
- **Invariants:** A read-only-sandbox adopt does not scan; every other adopt (workspace-write, or sandbox absent) scans exactly as today. A rooted path UNDER the worktree root classifies identically to its repo-relative form; outside-root rooted paths and all relative paths flow through UNCHANGED — they classify exactly as today, EXCEPT the two bare host-state directory tokens `docs/changes` and `docs/handoff` (with or without a trailing slash), which now classify host-state (exit 10) by design. Apart from those two bare tokens the classifier's default (no `-Root`) behavior is byte-identical to today.
- **Non-goals:** No new exit codes; no change to the two-tier confirmation gate itself; no change to scope-check; no change to the main-path encoding scan. Outside-root rooted paths flow through UNCHANGED — they classify exactly as today (for the anchored host-state matchers that means no match; the basename ledger rule and other unanchored rules still apply). Containment is LEXICAL only (`GetFullPath` canonicalization); junction / 8.3-short-name / device-alias spellings are outside the careless-not-hostile threat model (consistent with `harness-known-limits.md`), and the host assembles grants repo-relative per X4, so the absolute-grant path is already the anomaly.

## Assumptions
- The adopted ledger row records its own `sandbox`; keying the adopt scan-skip on `[string]$match.sandbox -eq 'read-only'` (NOT the caller's `-Phase`) mirrors the main path's `$Sandbox -eq 'read-only'` and neutralizes a fabricated/legacy `phase:'review'` + `sandbox:'workspace-write'` row; an ABSENT sandbox → SCAN (fail-closed) → impact: Stop
- `apex-critical-files.ps1` normalization (≈66-71) never strips a drive prefix, so an absolute path silently fails every host-state matcher except the basename ledger rule (≈88) — relativizing before ≈66-71 is the fix → impact: Stop
- `$Worktree` (raw param) is in scope at the classifier call site ≈841 → impact: Stop
- The main-path scan model at ≈1569-1576 (`if ($Sandbox -eq 'read-only') { …skipping. } else { & $scopeCheckScript -EncodingScan … }`) is the guard shape to mirror → impact: Caution

Simplicity check: considered relativizing inside scope-check instead — rejected (classification is the classifier's job; scope-check stays single-purpose, per ADR-044 D3 rejected-alternative). This version adds `-Root` to the classifier.

## Prerequisites
- Specs complete first: **round8-b1-specsource** — it edits the same two files (`codex-dispatch.ps1`, `SKILL.md`); build strictly AFTER it to avoid a same-file clobber.
- Environment setup required: none. Isolated worktree copy of `~/.claude` (isolation contract X1–X4).

## Files to Change
| File | Operation | Notes |
|------|-----------|-------|
| skills/apex-code/scripts/apex-critical-files.ps1 | modify | Add optional `[string]$Root`; relativize rooted-under-Root inputs before normalization. |
| skills/apex-code/scripts/codex-dispatch.ps1 | modify | Pass `-Root $Worktree` at classifier call (≈841); guard the adopt scan (≈731-735) for review-phase. |
| skills/apex-code/scripts/critical-files-test.ps1 | modify | New `-Root` classification cases. |
| skills/apex-code/scripts/dispatch-encoding-utf8-test.ps1 | modify | New review-adopt vs build-adopt scan-guard cases. |
| skills/apex-code/scripts/dispatch-criticalfile-test.ps1 | modify | One end-to-end case: absolute-path host-state grant → exit 76 (proves the ≈841 `-Root` plumbing). Also edited by b1 (fixture arming); b2 builds strictly AFTER b1 (prerequisite) — sequential same-file ownership. |
| skills/apex-code/SKILL.md | modify | Host-state authoring note + `-Root` on the Layer-A invocation + cross-ref bullet. |

## Tasks
- [ ] **Task 1 (classifier root param):** In `skills/apex-code/scripts/apex-critical-files.ps1`, add an optional `[string]$Root` to the `param(...)` block (landmark ≈6-16, after `-AdditionalPaths`). BEFORE the per-path normalization at ≈66-71 (landmark ≈67 `$normalizedPath = $originalPath.Replace('\', '/').ToLowerInvariant()`), when `$Root` is non-empty: for each input path where `[System.IO.Path]::IsPathRooted($originalPath)` is true, canonicalize both with `[System.IO.Path]::GetFullPath(...)`, then do a trailing-separator-safe, case-insensitive prefix compare — if the path's canonical form equals or descends from the canonical `$Root` (compare against `$Root` with exactly one trailing directory separator appended, `StartsWith(..., OrdinalIgnoreCase)`), rewrite `$originalPath` to its repo-relative remainder (strip the root prefix + leading separator) BEFORE the ≈66-71 normalization runs. Rooted paths NOT under `$Root`, and all relative paths, flow through unchanged (today's behavior). **Second edit — bare-directory grant spelling:** the shipped host-state matchers use `^docs/changes/` and `^docs/handoff/` prefixes, but the classifier trims trailing slashes at ≈71, so a bare grant token `docs/changes/` normalizes to `docs/changes` and misses the prefix. Add to the host-state rule (landmark: the existing host-state matcher block ≈83-90) exact-equality matches on the bare normalized dir tokens `docs/changes` and `docs/handoff` → same `host-state` category, exit 10. This matches the bare-directory SPELLING of two already-ratified members of the six-path set; it adds no new paths. files: skills/apex-code/scripts/apex-critical-files.ps1 — done when: an absolute path under `$Root` to the status file classifies host-state; without `$Root` it does not; rooted-outside and relative paths are unchanged; bare `docs/changes` and `docs/handoff` (with or without trailing slash) classify host-state at exit 10.
- [ ] **Task 2 (dispatcher plumbing):** In `skills/apex-code/scripts/codex-dispatch.ps1`, change the sole classifier call at ≈841 (landmark: `$critLines = @(& $criticalScript -Test -Paths $Authorized)`) to `$critLines = @(& $criticalScript -Test -Paths $Authorized -Root $Worktree)`. Nothing else in the ≈819-863 gate changes. files: skills/apex-code/scripts/codex-dispatch.ps1 — done when: the call passes `-Root $Worktree`; the surrounding try/catch and `$critExit` capture are untouched. (Ordering: build after Task 1 so `-Root` exists.)
- [ ] **Task 3 (adopt guard):** In `skills/apex-code/scripts/codex-dispatch.ps1`, wrap the adopt-path encoding scan at ≈731-735 (landmark ≈731 `if ($match.worktree) {` … `& $adoptScript -EncodingScan …`) in a guard keyed on the ADOPTED ROW's recorded sandbox, mirroring the main path's read-only skip at ≈1569-1576: skip the scan ONLY when `[string]$match.sandbox -eq 'read-only'` — print a DarkGray note (e.g. `[encoding] read-only adopt (review/end-gate): no coder writes to scan -- skipping.`) and leave `$adoptEncodingViolation = $false`; in EVERY other case, including an ABSENT `sandbox` property (fail-closed) or a `phase:'review'` row whose sandbox is `workspace-write`, run the scan exactly as today. Keying on `$match.sandbox` (not the caller's `-Phase`) neutralizes a fabricated/legacy review-phase row that actually wrote to the tree. The `Test-Path $adoptScript` fail-closed check at ≈727-729 stays ABOVE the guard, unchanged. files: skills/apex-code/scripts/codex-dispatch.ps1 — done when: a read-only-sandbox adopt skips the scan; a workspace-write-sandbox adopt (any phase) and a sandbox-absent adopt both still scan and can set `$adoptEncodingViolation`.
- [ ] **Task 4 (classifier tests):** In `skills/apex-code/scripts/critical-files-test.ps1`, first extend the test harness: its case runner invokes the classifier with a fixed argument shape that never passes `-Root` (landmark ≈423). Add an optional per-case `Root` field to the case schema and splat it through so a case with a `Root` invokes `... -Root <value>` while a case WITHOUT one invokes the classifier with the parameter GENUINELY OMITTED (not `-Root $null`) — the no-`-Root` regression pin depends on true omission. Then add cases: (1) an absolute path UNDER a supplied `-Root` to `docs/status.md` → exit 10 / host-state; (2) that SAME absolute path WITHOUT `-Root` (omitted) → today's fail-open outcome (assert it does NOT classify host-state; the regression pin for the absolute-grant gap); (3) a rooted path OUTSIDE `-Root` with `-Root` supplied → unchanged classification; (4) relative paths with `-Root` supplied → unchanged classification; (5) bare `docs/changes/` (trailing slash) and bare `docs/changes` (no slash) → exit 10 / host-state; (6) bare `docs/handoff/` and `docs/handoff` → exit 10 / host-state; (7) a case-VARIANT absolute path (different letter-casing than `-Root`) under `-Root` → still relativized and classifies host-state (pins the `OrdinalIgnoreCase` compare); (8) sibling-prefix: `-Root C:\...\x` with path `C:\...\x-foo\docs\status.md` → NOT relativized, NOT host-state (pins the trailing-separator-safe compare). files: skills/apex-code/scripts/critical-files-test.ps1 — done when: the runner passes `-Root` through only when a case supplies it (omitted otherwise); suite exits 0 with all eight new assertions. (Build after Task 1.)
- [ ] **Task 5 (adopt regression test):** In `skills/apex-code/scripts/dispatch-encoding-utf8-test.ps1`, using the suite's existing scratch isolation (landmark ≈56-58 / ≈89-91 `-ScratchDirectory` / `APEX_STATE_DIR`), add FOUR cases that drive the `-Adopt` recovery path over a fixture worktree carrying PRE-EXISTING mojibake (reuse the suite's double-encoded-byte helper, or write an inline file bearing `â€"`-style bytes into the fixture repo). There is no existing `-Adopt`/row-fabrication helper — the test FABRICATES a dead ledger row explicitly.
  - Mechanism: append ONE JSON line to `<scratch APEX_STATE_DIR>\progress\codex-run-ledger.jsonl` with EXACTLY these properties so `Invoke-Adopt` selects it, reads it as dead, AND can COMPLETE adoption: `run_id` (fixed literal); `spec`/`task`/`phase` matching the `-Adopt` invocation's `-Spec`/`-Task`/`-Phase` (the ≈483 spec+phase filter and ≈487 task filter); `status` `'stalled'` (passes the ≈491 status filter); `started` a valid fixed datetime string (needed by the ≈499 `Sort-Object { [datetime]$_.started }`); `pid` and `launcher_pid` set to `null` — the liveness check treats a null PID deterministically as dead (≈373-374 skip on the null guard, `$unverifiable` is false at ≈379-381 → returns dead) BEFORE the age check ≈383, so no `pid_start`/`launcher_start` stamps are needed (omit them; fixed positive PIDs are process-space-dependent and can flake); the ≈505 live-guard is thus skipped, routing to the adopt-claim path; `worktree` set to the mojibake fixture repo path so `Get-WorktreeKey` resolution matches the `-Worktree` passed to `-Adopt` (≈495-496); `authorized` empty (`@()`); `scope_task` set (read by the adopt scan ≈732-733); and NO `tree_pin_label` property (so the pin verify at ≈701-719 is skipped). **`final_path` (REQUIRED):** point it at a fixture report file the test writes — WITHOUT a parseable report the adopt path forces `$adoptStatus='blocked'` (≈637-639) and exits 67 at ≈750-752, BEFORE the encoding routing at ≈756-758, so the encoding outcome would never be observed. Case (a): a schema-valid REVIEW report (`verdict: 'CLEAN'`, findings CLEAN/empty) so ≈587-614 yields `done`. Cases (b)/(c)/(d): a schema-valid COMPLETION report (`status: 'done'`) so ≈567-569 yields `done`. Match/completion landmark set: ≈483, 487, 491, 495-496, 505, 560-640; exit routing ≈750-758.
  - (a) Read-only-sandbox case: row `phase` `'review'`, `sandbox` `'read-only'`, `schema` a review-row schema, `final_path` → the CLEAN review report. Invoke `-Adopt -Phase review -Spec <s> -Task <t> -Worktree <mojibake repo>`. Assert adoption COMPLETES (adopted terminal status; the exit-0 path at ≈761), the row does NOT carry `encoding_violation:true`, AND stdout shows the Task-3 read-only skip note.
  - (b) Workspace-write-sandbox case: identical row but `phase` `'build'`, `sandbox` `'workspace-write'`, `schema` a completion schema, `final_path` → the `done` completion report, over the same mojibake repo. Invoke `-Adopt -Phase build …`. Assert the scan RUNS — the adopted row carries `encoding_violation:true` and the ≈756-758 `exit 73` path is taken.
  - (c) Review-phase-but-write-sandbox case: row `phase` `'review'` BUT `sandbox` `'workspace-write'`, completion `final_path`. Invoke `-Adopt -Phase review …`. Assert the scan RUNS (the sandbox-keyed guard does NOT skip a workspace-write row even under review phase) — `encoding_violation:true`.
  - (d) Sandbox-absent case: row with NO `sandbox` property at all, completion `final_path`. Invoke `-Adopt` matching its phase. Assert the scan RUNS (pins Task 3's fail-closed branch — absent sandbox scans) — `encoding_violation:true`.
  - files: skills/apex-code/scripts/dispatch-encoding-utf8-test.ps1 — done when: suite exits 0; case (a) completes with no violation + skip note; cases (b), (c), and (d) each scan and flag the violation. (Build after Task 3.)
- [ ] **Task 6 (SKILL.md host-state note + Layer-A `-Root`):** In `skills/apex-code/SKILL.md`: (a) update the Layer-A classification invocation at ≈86 (landmark: `apex-critical-files.ps1" -Test -Paths path1 path2 path3`) to also pass `-Root <repo-root>`, so the host's manual classification sees absolute tokens exactly as the dispatcher's ≈841 call does (without it the flow is still fail-closed — Layer B refuses at 76 — but the doc should produce confirmation up front, not a refusal/retry). (b) Inside the Layer-A block at ≈95-103 (landmark ≈95 `Exit **10**: critical path.` … ≈100 `A spec's ## Permissions text does not satisfy Layer A`), add a host-state authoring note enumerating the six host-state matchers — `docs/status.md`, root `AGENTS.md`, root `CLAUDE.md`, `docs/changes/`, `docs/handoff/`, and the run-ledger `codex-run-ledger.jsonl` — stating that authorizing ANY of them (INCLUDING a bare grant of the two host-state directories `docs/changes` / `docs/handoff`) requires attended `-CriticalFilesConfirmed`, and that an unattended/AFK dispatch which tries to authorize a host-state path refuses with exit 76 by design (PARK the task). State the REMAINING gap plainly: a BROADER directory grant (e.g. authorizing all of `docs`) still slips literal-token classification until D6's post-hoc write classification (Wave B2) — cite ADR-044 D3 consequence (a). (c) Add one line to the critical-files bullet at ≈387-388 (landmark `Critical files always need confirmation regardless of level`) cross-referencing the host-state note. **Skill-edit contract:** bump the frontmatter `version` sequentially from whatever b1 shipped (b1 leaves apex-code SKILL.md at `2.9.0`, so b2 bumps `2.9.0 → 2.10.0`) and set `last_updated` to the build date; the whole-file edit must be NET-NEUTRAL-OR-NEGATIVE in line count — offset added lines by tightening prose elsewhere in the same file — and stay ≤ the 500-line cap. files: skills/apex-code/SKILL.md — done when: the Layer-A invocation shows `-Root`; the six matchers, the bare-dir inclusion, the `-CriticalFilesConfirmed` requirement, the exit-76 PARK rule, and the broader-dir-grant gap (citing D3 (a)) all appear; the bullet cross-references it; frontmatter reads `version: 2.10.0` with an updated `last_updated`; the file's net line delta is ≤ 0 and total ≤ 500.
- [ ] **Task 7 (end-to-end dispatcher critical-file case):** In `skills/apex-code/scripts/dispatch-criticalfile-test.ps1`, add ONE case: a build dispatch whose `-Authorized` contains an ABSOLUTE path (under the fixture worktree) to `docs/status.md`, with NO `-CriticalFilesConfirmed` → exit 76, zero ledger rows, proving the ≈841 `-Root` plumbing relativizes the absolute grant so the host-state matcher fires end-to-end. **Oracle — exit 76 alone is ambiguous** (a classifier crash / missing-exit also maps to 76 at ≈843-861), so the case MUST additionally assert the classifier's verbatim `CRITICAL <abs-status-path>: host-state` line appears in the dispatcher's stdout. Producing mechanism: the suite's `Invoke-DispatchCase` runner (≈184-187) surfaces only `ExitCode` + `Rows`, not stdout — so this case either invokes the dispatcher DIRECTLY (capturing stdout via `*>&1` into a string) or extends the runner to also return captured output; assert BOTH `ExitCode -eq 76` (zero rows) AND the `CRITICAL … host-state` line. This case refuses at the Layer-B gate BEFORE spec validation, so it needs no seeded spec. files: skills/apex-code/scripts/dispatch-criticalfile-test.ps1 — done when: the new case asserts exit 76 + zero rows + the verbatim `CRITICAL … host-state` stdout line; the suite exits 0. (Build after Task 2, which adds the `-Root` plumbing; and after b1, which owns this file for fixture arming.)

## Wave plan
Wave 1: [Task 1, Task 3, Task 6] | Wave 2: [Task 2, Task 4, Task 5] | Wave 3: [Task 7]
<!-- Task 1 (classifier), Task 3 (adopt guard), Task 6 (SKILL.md) are mutually independent and touch different concerns; Task 3 and Task 2 both edit codex-dispatch.ps1 but Task 3 is independent of Task 1/Task 2 — it is grouped in wave 1 with the other independents. Wave 2: Task 2 depends on Task 1's `-Root` existing; Task 4 depends on Task 1; Task 5 depends on Task 3. NOTE both wave-1 Task 3 and wave-2 Task 2 edit codex-dispatch.ps1 — they must NOT run in the same wave; keeping Task 3 in wave 1 and Task 2 in wave 2 serializes the shared file. Wave 3: Task 7 (end-to-end dispatch-criticalfile case) needs the ≈841 `-Root` plumbing from Task 2 to be present. -->

## Permissions

The following actions will run autonomously during build.
Approving this spec approves all of them.

### File Operations
| Action | Paths |
|--------|-------|
| Create | (none) |
| Modify | skills/apex-code/scripts/apex-critical-files.ps1, skills/apex-code/scripts/codex-dispatch.ps1, skills/apex-code/scripts/critical-files-test.ps1, skills/apex-code/scripts/dispatch-encoding-utf8-test.ps1, skills/apex-code/scripts/dispatch-criticalfile-test.ps1, skills/apex-code/SKILL.md |
| Delete | (none) |

### Commands
| Command | Purpose |
|---------|---------|
| `powershell -NoProfile -File .\skills\apex-code\scripts\critical-files-test.ps1` | Classifier suite (X2). |
| `powershell -NoProfile -File .\skills\apex-code\scripts\dispatch-encoding-utf8-test.ps1` | Adopt/encoding suite (X2). |
| `powershell -NoProfile -File .\skills\apex-code\scripts\dispatch-criticalfile-test.ps1` | Critical-file end-to-end suite (X2). |

### Verify commands
Run from the build worktree root — the repo verify contract (worktree AGENTS.md `## Verify commands`), plus the two target suites above:

```
node --check hooks/destructive-command-guard.js
node --check hooks/lib/destructive-detect.js
python hooks/destructive-guard-test.py
powershell.exe -NoProfile -File .\skills\apex-code\scripts\baseline-check-test.ps1
powershell.exe -NoProfile -File .\skills\apex-code\scripts\spec-validate-test.ps1
powershell.exe -NoProfile -File .\skills\apex-code\scripts\dispatch-preflight-test.ps1
```

### Git Operations
| Operation | Scope |
|-----------|-------|
| (none) | The builder performs no git operations; the host integrates the worktree diff and commits (X3). |

_Host integration-commit message: `feat(dispatch): classifier -Root + review-adopt encoding guard + host-state authoring note (ADR-044 Wave-B i/ii/iii)`._

### Environment Access
| Variable | Purpose |
|----------|---------|
| `APEX_STATE_DIR` | Test isolation — scratch state root. |
| `FAKE_CODEX_*` | Fake-codex fixture control (existing suite machinery). |

### Network
| Action | Purpose |
|--------|---------|
| (none) | No package installation. |

## Specialist Context
### Security
Absolute-path grant relativization closes a stated host-state fail-open (ADR-044 D3 consequence a2), proven end-to-end by the Task-7 dispatcher case (absolute host-state grant → exit 76). The `-Root` prefix compare is case-insensitive and trailing-separator-safe to avoid a sibling-prefix false positive (e.g. `.claude-foo` under `.claude`). Containment is LEXICAL only (`GetFullPath` canonicalization); junction / 8.3-short-name / device-alias spellings that resolve to the same tree are NOT detected — outside the careless-not-hostile threat model (consistent with `harness-known-limits.md`), and the host assembles grants repo-relative per X4, so the absolute-grant path is already the anomaly. The remaining un-closed gap is a BROADER directory grant (e.g. all of `docs`), which slips literal-token classification until D6's post-hoc write classification (Wave B2) — ADR-044 D3 consequence (a).

### Performance
(none)

### Accessibility
(none)

## Documentation
| Doc type | File | Action |
|----------|------|--------|
| Inline | skills/apex-code/scripts/apex-critical-files.ps1 | Comment the `-Root` relativization (why: absolute grants else fail-open). |
| Inline | skills/apex-code/scripts/codex-dispatch.ps1 | Comment the review-adopt scan guard. |
| ADR | docs/technical/adr/ADR-044-round8-deferred-designs.md | Already carries D3/Wave-B carve-outs — no new ADR. |

## Acceptance Criteria
- [ ] **Task 1** → verify: run the classifier with `-Test`, an absolute path (under the worktree root) to the status control-file, and `-Root <abs-worktree>` — it emits `... host-state` and exits 10; the same invocation without `-Root` does not classify host-state.
- [ ] **Task 2** → verify: `Select-String '-Root \$Worktree' skills/apex-code/scripts/codex-dispatch.ps1` matches at the classifier call; the ≈819-863 gate is otherwise unchanged (`git diff` shows only that line in the gate).
- [ ] **Task 3** → verify: `Select-String 'sandbox' skills/apex-code/scripts/codex-dispatch.ps1` shows the adopt guard keyed on `$match.sandbox -eq 'read-only'` (not `$Phase`); the DarkGray skip-note branch guards the adopt scan; a workspace-write or sandbox-absent adopt scans.
- [ ] **Task 4** → verify: `powershell -NoProfile -File .\skills\apex-code\scripts\critical-files-test.ps1` exits 0 with all eight new cases (absolute-under-Root, without-`-Root` regression pin, outside-root, relative, bare `docs/changes`(+/−slash), bare `docs/handoff`(+/−slash), case-variant, sibling-prefix).
- [ ] **Task 5** → verify: `powershell -NoProfile -File .\skills\apex-code\scripts\dispatch-encoding-utf8-test.ps1` exits 0; case (a) adoption completes with no `encoding_violation` + skip note; cases (b), (c), and (d) each scan and flag `encoding_violation`.
- [ ] **Task 6** → verify: `Select-String '-Root' skills/apex-code/SKILL.md` shows the Layer-A invocation carrying `-Root`; the six matchers, the bare-dir inclusion, the `-CriticalFilesConfirmed` requirement, the exit-76 PARK rule, and the broader-dir-grant gap (D3 (a)) are present; file ≤ 500 lines.
- [ ] **Task 7** → verify: `powershell -NoProfile -File .\skills\apex-code\scripts\dispatch-criticalfile-test.ps1` exits 0; the new absolute-path host-state grant case exits 76 with zero ledger rows.

## Host verification
Host integrates the worktree diff into live `~/.claude` with NO gates open (X3), then re-runs on the live tree: `critical-files-test.ps1`, `dispatch-encoding-utf8-test.ps1`, `dispatch-criticalfile-test.ps1`, and (non-regression) `dispatch-preflight-test.ps1` and `dispatch-test.ps1` — all exit 0. Host verification is the authoritative acceptance gate.

At wave close the host also updates `harness-known-limits.md` (HOST-owned per the Wave-A pattern, kept OUT of this spec's Files to Change): the two rows that become false when this ships — "absolute-path grants bypass host-state classification" and "the `-Adopt` review path runs the encoding scan unguarded" — are rewritten to describe shipped behavior (absolute grants under the worktree root are now relativized and classified; the adopt scan is now sandbox-keyed). The remaining broader-directory-grant gap (D3 (a)) is retained/added as a stated limit. The host also adds the host-owned `SKILL-HISTORY.md` row (in the ~/apex repo, Wave-A D3 pattern) recording the apex-code SKILL.md bump to version 2.10.0 (sequential after b1's 2.9.0).

## Progress
_(Coding mode writes here — do not edit manually)_
