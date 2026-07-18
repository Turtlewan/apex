---
spec: round8-c1-digest-emitters
status: draft
autonomy_level: L2
risk: high
coder_effort: high
---

# Spec: tree-pin `-Digest` compute-only mode + scope-check `-WrittenPathsFile` emission

**Identity:** Add the two new machine-readable emitters D6 consumes — a compute-only `-Digest` mode on `tree-pin.ps1` that prints the primary tree's fingerprint without minting a pin file, and a `-WrittenPathsFile` output on `codex-scope-check.ps1`'s `-Check` mode that records the coder's actually-written path set — plus their test coverage.
→ why: see docs/technical/adr/ADR-044-round8-deferred-designs.md (D6 + Grounding addendum 2026-07-18, items "D6 item 1 needs a NEW machine-readable emission" and "D6 item 5 needs a NEW `-Digest` compute-only mode").

## Intent
- **Intent:** Ship the two interfaces D6's dispatcher work (spec round8-c2-dispatch-binding) depends on: a no-write CLI digest of a worktree, and the post-snapshot delta set of paths a `-Check` attributes to the coder.
- **Invariants:** `-Digest` prints exactly one 64-hex line to stdout, mints no pin artifact and writes nothing under the pin directory or the worktree (git may refresh its own index metadata, as `-Pin` does today), exits 0, and computes the identical fingerprint `-Pin` would (same runtime exclusions). `-WrittenPathsFile` (a `-Check`-only, resolve-OUTSIDE-worktree switch) emits one normalized repo-relative path per line — violations, GONE/reverted paths (authorized OR not), and genuinely-touched authorized writes — excluding host-untouched byte-identical entries; a collapsed directory whose aggregate changed emits BOTH its directory token AND all current leaf files (over-emission of untouched siblings accepted — fail-safe: more classification, not less). It is written on every `-Check` that REACHES attribution (clean, violation, mangled-allowlist); a `-Check` that aborts BEFORE attribution — a missing snapshot file or a JSON PARSE failure (syntax-only) — throws and writes nothing, and c2's consumer treats an absent file as fail-closed `critical_violation`; an empty file means the coder wrote nothing. The ENTIRE new collection is gated on the switch: without `-WrittenPathsFile` the attribution loop is byte-identical to today (the authorized short-circuit continues immediately, zero added work). Absent the new switches, both scripts behave byte-identically to today for VALID existing invocations (`-Pin`/`-Verify` with `-Label`); only the shared error-path wording for missing-label / no-mode / multi-mode invocations changes shape (the new exactly-one-of message) — accepted.
- **Non-goals:** No dispatcher wiring (that is round8-c2). No new exit codes. No change to `-Pin`/`-Verify`/`-Snapshot`/`-EncodingScan` behavior. No change to how the attribution loop CLASSIFIES a path (authorized / violation / GONE / untouched) — the new collection reuses the loop's existing decisions, adding no new classification. Stated limit: a leaf DELETED inside a STILL-EXISTING collapsed directory is unidentifiable (the snapshot holds only an aggregate hash per collapsed dir, not leaf paths); the directory token still reaches the classifier — whose prefix/basename rules may fire — so a deleted critical leaf under a broad grant is catalogued here, not silently dropped, and structurally-odd-but-parseable snapshots proceed as today with c2's fail-closed consumption as the downstream backstop.

## Assumptions
- `Get-TreeFingerprint` (tree-pin ≈140-191) already returns `@{Digest; Detail}` and `$trees[0].Fingerprint.Digest` is the primary tree's 64-hex digest → impact: Stop
- The `-Pin` mutual-exclusion guard at tree-pin ≈36 (`if ($Pin -eq $Verify) { throw 'Pass exactly one of -Pin or -Verify.' }`) is the sole guard to generalize; `-Label` is `[Parameter(Mandatory)]` at ≈29 → impact: Stop
- scope-check's attribution loop (≈632-664) reaches its per-path decision points in one pass — the authorized short-circuit (≈632-633), the state-path skip (≈634), the GONE classification (≈650), the byte-identical `$untouched` skip (≈654-660), the out-of-scope dirty classification (≈663) — and `$nowDirty` / `$preDirty` / `$preState` / `Get-PathState` / `Test-IsAuthorized` (≈616-622) / `Normalize` (≈138-143) are all in scope there (the byte-identical test at ≈654-655 uses `$preState.ContainsKey` + `Get-PathState`) → impact: Stop
- the mode-exclusivity check sits at ≈84-90, `$repo = (Resolve-Path $Worktree).Path` is set at ≈93, and the `-Snapshot` branch exits at ≈556 (`-EncodingScan` earlier), so both param-contract guards (mode-misuse; written-file containment, which needs `$repo`) precede every mode branch → impact: Stop
- The emission slot at ≈665 (after the loop, before `$headNow = Invoke-Git rev-parse HEAD` at ≈670) executes before every `-Check` exit that REACHES attribution (clean ≈690, mangled ≈717, out-of-scope ≈733); a pre-attribution abort (missing snapshot ≈561-562) throws earlier and never reaches it → impact: Stop
- c2 (round8-c2 Task 3) consumes this file fail-closed — an absent written-paths file after a `-Check` is treated as `critical_violation` true — so a `-Check` that aborts before attribution may safely throw-and-not-write; that cross-spec backstop covers the gap → impact: Stop

Simplicity check: considered a post-loop `$nowDirty.Keys` re-scan — rejected: it re-derives attribution the loop already computed and can diverge from it; collecting inside the single attribution pass, at the loop's own classification points, is exact and cheaper.

## Prerequisites
- Specs complete first: none (first of the c1 → c2 → c3 order).
- Environment setup required: none. Isolated worktree copy of the `.claude` tree (ADR-044 isolation contract X1–X4).

## Files to Change
| File | Operation | Notes |
|------|-----------|-------|
| skills/apex-code/scripts/tree-pin.ps1 | modify | Add `-Digest` compute-only mode; demote `-Label` to conditionally-required. |
| skills/apex-code/scripts/tree-pin-test.ps1 | modify | `-Digest` shape/determinism/sensitivity/guard cases. |
| skills/apex-code/scripts/codex-scope-check.ps1 | modify | Add `-WrittenPathsFile` emission to `-Check`. |
| skills/apex-code/scripts/scope-check-test.ps1 | modify | Emission cases. |

## Tasks
- [ ] **Task 1** — In `skills/apex-code/scripts/tree-pin.ps1`: add `[switch]$Digest` to the param block (landmark ≈22-32, after `[switch]$Verify` at ≈25). Demote `[Parameter(Mandatory)][string]$Label` (≈29) to a plain `[string]$Label`. Replace the exactly-one guard at ≈36 with an exactly-one-of-Pin/Verify/Digest check (count how many of the three switches are set; if not exactly one, `throw`), then enforce label presence with an explicit throw when `-Label` is empty AND (`-Pin` OR `-Verify`) is selected (Digest needs no label). Add a further guard: `-Digest` combined with a non-empty `-PinAlso` → `throw` (single-tree only). Insert the `-Digest` branch between the `$trees` computation (ends at ≈212 `})`) and the `if ($Pin) {` block at ≈214: when `$Digest`, write EXACTLY one line — a bare `$trees[0].Fingerprint.Digest`, no `[tree-pin]` prefix — to stdout, then `exit 0`. It mints no pin artifact and writes nothing under the pin directory or the worktree (git may refresh its own index metadata as `-Pin` does today — that is not a write this mode performs). Runtime exclusions need no extra code: `$trees[0].Fingerprint` was already computed with the same `RuntimeExclusionRoot` semantics as `-Pin` (resolution ≈193-196, applied per-tree ≈209-210). Enumeration errors keep today's behavior — `Get-TreeFingerprint` already folds unreadable entries into the digest; never add a crash path. INTERFACE CONTRACT (assert verbatim in Task 2): a `-Digest -Worktree <root>` call prints one line matching `^[0-9a-f]{64}$`, exits 0, and mints no pin file. files: skills/apex-code/scripts/tree-pin.ps1 — done when: `-Digest -Worktree <root>` prints one 64-hex line and exits 0 minting no pin artifact; `-Pin`/`-Verify` without `-Label` throw; passing two or three of Pin/Verify/Digest throws; `-Digest -PinAlso <x>` throws.
- [ ] **Task 2** — In `skills/apex-code/scripts/tree-pin-test.ps1`, add `-Digest` cases exercising Task 1's interface contract: (1) shape — a `-Digest` call on a fixture worktree prints exactly one line matching `^[0-9a-f]{64}$`, exit 0, and no `apex-treepin-*` pin file appears in the pin directory; (2) determinism — two consecutive `-Digest` calls on an unchanged tree print byte-identical digests; (3) sensitivity — modifying the CONTENT of a tracked file (an actual byte change, not a timestamp-only touch) between two `-Digest` calls changes the digest; (4) digest/pin equivalence — a `-Digest` call and a `-Pin` written at the same moment on the same unchanged tree agree: the `-Digest` stdout equals the digest line stored in the pin file (the central interface invariant); (5) exclusivity combos — `-Pin -Digest`, `-Verify -Digest`, all three, and none-of-the-three each throw the exactly-one error, AND `-Digest` with a non-empty `-PinAlso` throws (single-tree); (6) runtime-exclusion equivalence — on a fixture tree posing as the `RuntimeExclusionRoot`, churn under an excluded directory moves NEITHER the `-Digest` output nor a `-Pin` digest (so `-Digest` honors runtime exclusions equivalently to `-Pin`); (7) `-Pin` without `-Label` throws AND `-Verify` without `-Label` throws (the label-still-required regression pins). files: skills/apex-code/scripts/tree-pin-test.ps1 — done when: the suite exits 0 with all seven `-Digest`/equivalence/guard cases; existing `-Pin`/`-Verify` cases pass unmodified. (Build after Task 1.)
- [ ] **Task 3** — In `skills/apex-code/scripts/codex-scope-check.ps1`: add `[string]$WrittenPathsFile` to the param block (≈68-78). Add THREE param-contract guards ahead of attribution: (a) immediately after the mode-exclusivity check at ≈84-90, `if ($WrittenPathsFile -and -not $Check) { throw ... }` — valid ONLY with `-Check` (the `-Snapshot` branch exits at ≈556, so a guard at ≈559 would never see the misuse); (b) immediately after `$repo = (Resolve-Path $Worktree).Path` at ≈93, a containment throw — canonicalize `$WrittenPathsFile` with `[System.IO.Path]::GetFullPath(...)` and, when it equals or descends from `$repo` (compare against `$repo` plus one trailing separator, `StartsWith(..., OrdinalIgnoreCase)`), `throw` (the emitted file must live OUTSIDE the tree being scanned, matching the snapshot-outside-worktree constraint at ≈281-301); (c) immediately after `$snapPath` is set (≈301), a snapshot-alias throw — when `$WrittenPathsFile` is non-empty and `[System.IO.Path]::GetFullPath($WrittenPathsFile)` equals `GetFullPath($snapPath)` (OrdinalIgnoreCase), `throw` (emitting to the snapshot path would overwrite the snapshot, and the ≈689/≈732 cleanup would then delete the output). COLLECT THE WRITTEN SET IN ONE PASS inside the existing attribution loop (≈632-664) — no second scan, and gated entirely on the switch: set `$collectWritten = [bool]$WrittenPathsFile` and, before the loop, create `$writtenSet = New-Object System.Collections.Generic.List[string]`. When `$collectWritten` is false, the loop is byte-identical to today — no added compares, no enumeration; the authorized short-circuit continues immediately. (i) In the authorized branch, change `if (Test-IsAuthorized $n) { continue }` (≈633) to: `if (Test-IsAuthorized $n) { if ($collectWritten) { <apply the loop's OWN full state logic to this authorized path> }; continue }`. The full state logic mirrors ≈636-663: compute `$wasDirty`/`$isDirty` locally (as ≈636-641) and `[void]$writtenSet.Add($n)` when the path is GONE (`$wasDirty -and -not $isDirty` — a deletion OR a revert-to-HEAD) OR genuinely dirty (`$isDirty` AND NOT byte-identical-since-snapshot, i.e. NOT `$preDirty.ContainsKey($n) -and $preState.ContainsKey($n) -and (Get-PathState $n) -eq $preState[$n]`); a byte-identical-since-snapshot authorized path adds NOTHING. (ii) At the GONE classification (≈650) `if ($collectWritten)` add `$n` alongside the `$violations +=`. (iii) At the out-of-scope dirty classification (≈663) `if ($collectWritten)` add `$n` alongside the `$violations +=`. The state-path skip (≈634) and the `$untouched` byte-identical skip (≈654-660) add NOTHING. Every `$n` is already `Normalize`-d (`$allPaths` is built via `Normalize` at ≈629-630). At the emission slot ≈665 (after the loop, before `$headNow` at ≈670, so it runs on every attribution-reaching outcome): when `$WrittenPathsFile` is non-empty, EXPAND directories before writing — for each entry resolve `$full = Join-Path $repo $entry`; when `Test-Path -LiteralPath $full -PathType Container` (an existing directory on disk, i.e. a collapsed-dir key whose aggregate changed), emit BOTH the directory token AND every current leaf — enumerate `Get-ChildItem -LiteralPath $full -Recurse -File -Force` (mirroring the in-process enumeration at ≈227-253) and add each as a normalized repo-relative path (`$file.FullName.Substring($repo.Length).TrimStart(...)` then `-replace '\\','/'`, as ≈242) IN ADDITION to the directory token (over-emission of untouched siblings is accepted — fail-safe, and the snapshot holds only an aggregate so leaf-level attribution is impossible); otherwise emit the entry as-is (this covers files AND a GONE directory that no longer exists on disk — a GONE directory emits its bare token, its basename/prefix rules still applying at the classifier; a leaf deleted inside a still-existing collapsed dir is the stated Non-goals limit). Dedupe and sort the expanded set, then write one path per line via `[System.IO.File]::WriteAllLines($WrittenPathsFile, [string[]]$sorted, [System.Text.UTF8Encoding]::new($false))` (UTF-8, NO BOM, mirroring ≈216 / dispatch ≈1646). When the set is empty, still create an empty file. Wrap the write in try/catch; on any failure `throw`. CONTRACT SCOPE: the file is guaranteed only on a `-Check` that REACHES attribution (clean ≈690, out-of-scope ≈733, mangled-allowlist ≈717); a `-Check` that aborts BEFORE attribution — a missing snapshot FILE (≈561) or a JSON PARSE failure (≈565, syntax-only) — throws and writes nothing (structurally-odd-but-parseable snapshots proceed as today), and c2's consumer treats an absent file fail-closed. INTERFACE CONTRACT (assert verbatim in Task 4): `-WrittenPathsFile` writes one normalized repo-relative path per line, UTF-8 no BOM, a changed collapsed dir emitting its token PLUS current leaves; it is created on every attribution-reaching `-Check` including non-zero exits; an empty file means the coder wrote nothing; `-WrittenPathsFile` without `-Check`, resolving under the worktree, or aliasing the snapshot path each throws. files: skills/apex-code/scripts/codex-scope-check.ps1 — done when: a `-Check` with `-WrittenPathsFile` records exactly the coder-attributed set collected in one pass (violations + GONE/reverted + genuinely-touched authorized, a changed collapsed dir emitting its token AND current leaves, host-untouched excluded) on every attribution-reaching outcome; without `-WrittenPathsFile` the loop is byte-identical (zero added work); `-WrittenPathsFile` without `-Check`, under the worktree, or aliasing the snapshot path each throws.
- [ ] **Task 4** — In `skills/apex-code/scripts/scope-check-test.ps1`, add emission cases over the suite's existing snapshot/check fixture machinery: (1) authorized write only — one authorized file dirtied → the file lists that one normalized path, `-Check` exits 0; (2) out-of-scope write — an unauthorized dirty file → it appears in the written file AND the file is still written on the non-zero exit; (3) deletion — a host-dirty file reverted/removed so it goes GONE → its path appears; (4) host-untouched excluded — a pre-dirty byte-identical unauthorized path is NOT in the written file; (5) empty — a `-Check` where the coder wrote nothing produces an existing but empty file; (6) `-WrittenPathsFile` supplied WITHOUT `-Check` throws; (7) pre-dirty authorized untouched — an authorized file already dirty at snapshot and byte-identical since (the coder never touched it) is NOT in the written file (its rationale: the loop's one-pass authorized branch skips a byte-identical authorized path per Task 3(i)); (8) exit-66 still-written — a `-Check` that trips the malformed-allowlist branch (≈705-718: several writes, none on the authorized list) still writes the file, pinning that the emission slot (≈665) precedes exit 66 so c2's fail-closed missing-file rule can rely on the file existing on every attribution-reaching outcome; (9) collapsed-dir expansion — an untracked NEW directory (collapsed to one dirty entry) containing a nested sensitive-named file → BOTH the directory token AND the leaf path appear (over-emission accepted); (10) GONE directory — a directory dirty at snapshot then deleted (nothing to enumerate on disk) → its bare directory token is emitted; (11) no BOM — a byte-level assertion that the emitted file's first three bytes are NOT `EF BB BF`; (12) write-failure — `-WrittenPathsFile` pointing into a NONEXISTENT directory → the `-Check` throws loudly, exits non-zero, and does NOT report clean; (13) containment — a `-WrittenPathsFile` resolving UNDER the worktree root throws; (14) authorized deletion — an authorized path present at snapshot and GONE now → appears in the written file; (15) authorized revert-to-HEAD — an authorized path dirty at snapshot then reverted to clean → appears (both (14)/(15) exercise the authorized-branch GONE logic); (16) collapsed-dir modified leaf — a modified leaf inside a PRE-EXISTING untracked collapsed directory → the directory token AND the current leaves are emitted; (17) collapsed-dir deleted leaf — a leaf deleted inside such a still-existing collapsed directory → the directory token AND the remaining leaves are emitted (documents the unidentifiable-deleted-leaf limit); (18) no-switch regression — a `-Check` WITHOUT `-WrittenPathsFile` produces byte-identical outcomes to today (no added collection work); (19) snapshot-alias — a `-WrittenPathsFile` resolving to the snapshot path throws. files: skills/apex-code/scripts/scope-check-test.ps1 — done when: the suite exits 0 with all nineteen emission cases; existing `-Check`/`-Snapshot` cases pass unmodified. (Build after Task 3.)

## Wave plan
Wave 1: [Task 1, Task 3] | Wave 2: [Task 2, Task 4]
<!-- Task 1 (tree-pin.ps1) and Task 3 (codex-scope-check.ps1) edit different files and are independent. Task 2 depends on Task 1's `-Digest`; Task 4 depends on Task 3's `-WrittenPathsFile`; the two test files are disjoint so they run in one wave. -->

## Permissions

The following actions will run autonomously during build.
Approving this spec approves all of them.

### File Operations
| Action | Paths |
|--------|-------|
| Create | (none) |
| Modify | skills/apex-code/scripts/tree-pin.ps1, skills/apex-code/scripts/tree-pin-test.ps1, skills/apex-code/scripts/codex-scope-check.ps1, skills/apex-code/scripts/scope-check-test.ps1 |
| Delete | (none) |

### Commands
| Command | Purpose |
|---------|---------|
| `powershell.exe -NoProfile -File .\skills\apex-code\scripts\tree-pin-test.ps1` | tree-pin suite (X2). |
| `powershell.exe -NoProfile -File .\skills\apex-code\scripts\scope-check-test.ps1` | scope-check suite (X2). |

### Verify commands
Run from the worktree root (X2) — the `.claude` repo verify contract (worktree AGENTS.md `## Verify commands`), plus the two target suites above:

```
node --check hooks/destructive-command-guard.js
node --check hooks/lib/destructive-detect.js
python hooks/destructive-guard-test.py
powershell.exe -NoProfile -File skills/apex-code/scripts/baseline-check-test.ps1
powershell.exe -NoProfile -File skills/apex-code/scripts/spec-validate-test.ps1
powershell.exe -NoProfile -File skills/apex-code/scripts/dispatch-preflight-test.ps1
powershell.exe -NoProfile -File skills/apex-code/scripts/tree-pin-test.ps1
powershell.exe -NoProfile -File skills/apex-code/scripts/scope-check-test.ps1
```

### Git Operations
| Operation | Scope |
|-----------|-------|
| (none) | The builder performs no git operations; the host integrates the worktree diff and commits (X3). |

_Host integration-commit message: `feat(dispatch): tree-pin -Digest compute-only mode + scope-check -WrittenPathsFile emission (ADR-044 D6 emitters)`._

### Environment Access
| Variable | Purpose |
|----------|---------|
| `TEMP` / `APEX_STATE_DIR` | Test isolation — scratch pin/state directories used by the suites. |

### Network
| Action | Purpose |
|--------|---------|
| (none) | No package installation. |

## Specialist Context
### Security
`-Digest` mints no pin artifact and writes nothing under the pin directory or the worktree (git may refresh its own index metadata, as `-Pin` does today) — it cannot mint or overwrite a pin, so it introduces no pin-forgery surface. `-WrittenPathsFile` is fail-loud: it must resolve OUTSIDE the worktree (a path under the tree being scanned throws), and any write failure throws rather than letting a `-Check` pass without recording the set the post-hoc critical classifier (round8-c2) will read; an absent file downstream is treated fail-closed by the consumer.

### Performance
`-Digest` reuses the already-computed `$trees[0].Fingerprint` — no extra hashing pass. PS 5.1: use `[System.Text.UTF8Encoding]::new($false)` for BOM-free writes; do not use `Out-File` (emits UTF-16 with BOM by default).

### Accessibility
(none)

## Documentation
| Doc type | File | Action |
|----------|------|--------|
| Inline | skills/apex-code/scripts/tree-pin.ps1 | Comment the compute-only `-Digest` intent (no-write emission). |
| Inline | skills/apex-code/scripts/codex-scope-check.ps1 | Comment the written-set emission (union minus host-untouched). |
| ADR | docs/technical/adr/ADR-044-round8-deferred-designs.md | Already carries D6 + the grounding addendum — no new ADR. |

## Acceptance Criteria
- [ ] **Task 1** → verify: a `-Digest -Worktree <fixture>` invocation prints exactly one line matching `^[0-9a-f]{64}$`, exits 0, and mints no `apex-treepin-*` file in the pin directory; `-Pin` and `-Verify` each throw when `-Label` is absent; passing two of Pin/Verify/Digest throws; `-Digest` with `-PinAlso` throws.
- [ ] **Task 2** → verify: `tree-pin-test.ps1` exits 0 with the seven new cases (shape, determinism, content-sensitivity, digest/pin equivalence, exclusivity combos, runtime-exclusion equivalence, label-required).
- [ ] **Task 3** → verify: a `-Check ... -WrittenPathsFile <p>` run writes `<p>` (UTF-8, no BOM) with the one-pass coder-attributed paths one per line — directories expanded to leaves — on both a clean (exit 0) and an out-of-scope (non-zero) run; a no-write run leaves `<p>` empty-but-present; `-WrittenPathsFile` without `-Check`, or resolving under the worktree, throws.
- [ ] **Task 4** → verify: `scope-check-test.ps1` exits 0 with the nineteen emission cases (authorized-only, out-of-scope-still-written, GONE, host-untouched-excluded, empty, no-`-Check`-throws, pre-dirty-authorized-untouched-excluded, exit-66-still-written, collapsed-dir-token+leaf, GONE-directory-token, no-BOM, write-failure-throws, under-worktree-throws, authorized-deletion, authorized-revert, collapsed-dir-modified-leaf, collapsed-dir-deleted-leaf, no-switch-byte-identical, snapshot-alias-throws).

## Host verification
Host integrates the worktree diff into the live `.claude` tree with NO gates open (X3), then re-runs on the live tree: `tree-pin-test.ps1`, `scope-check-test.ps1`, and (non-regression) `dispatch-preflight-test.ps1` and `dispatch-test.ps1` — all exit 0. Host verification is the authoritative acceptance gate; the builder's green is necessary, not sufficient. At wave close the host updates `harness-known-limits.md` (host-owned, kept OUT of this spec's Files to Change) noting that a compute-only tree digest and a machine-readable written-path emission now exist for D6, and adds no `SKILL-HISTORY.md` row (no skill frontmatter changed in this spec).

## Progress
_(Coding mode writes here — do not edit manually)_
