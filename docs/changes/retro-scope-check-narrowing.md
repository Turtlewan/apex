---
spec: retro-scope-check-narrowing
status: draft
autonomy_level: L2
risk: medium
coder_effort: medium
---

# Spec: Scope-check derived-cache narrowing — exact ignored-only exclusions with fail-closed lockstep tests

**Identity:** Adds a second, exact-name exclusion class to `codex-scope-check.ps1 -Check` for ignored, untracked, repo-root-anchored derived caches, plus drift-proof tests.
→ why: see docs/technical/adr/ADR-044-round8-deferred-designs.md (§ D1(d)) and docs/research/artemis-retro-2026-07-29.md (§ P2(a)).

## Intent
- **Intent:** Narrow the gitignored-scratch false-positive class — 147/168 (87.5%) of `critical_violation` rows (`docs/research/ledger-stratification-2026-07-30.md` § A2) — without widening the gate into a blanket cache-dir class. Elimination of that share is the EXPECTED outcome, not an acceptance criterion: it is verified post-ship by a ledger re-census after ~10 build days, recorded as a follow-up measurement.
- **Invariants:**
  - An excluded path must satisfy ALL of: name on the exact list · repo-root-anchored (equality-or-descendant of the root token) · absent from BOTH the index and HEAD (`Test-IsHostCurated`, `codex-scope-check.ps1:684-686`) · and the PRESENCE-SPLIT ignored-only test — **(a)** a path ABSENT from the snapshot (created during the dispatch, the actual false-positive class) needs only current status `!!`; **(b)** a path PRESENT at the snapshot needs recorded snapshot status `!!` AND (current `!!` OR absent now). A present-at-snapshot path with no recorded status grants NO exclusion, so a snapshot written before this change is fail-closed.
  - Any ignored path NOT on the exact list still flags. Any tracked path named like a cache still flags.
  - Exclusion applies in every worktree whose `.gitignore` lists these names (unlike the `~/.claude`-scoped `$runtimeExclusions`, which is gated on a root match), so the artemis / temp-worktree false positives (107 + 61 of 168) are covered; elsewhere the `!!` status guard keeps flagging them, which is the fail-closed direction.
  - Inventory-build failure disables BOTH exclusion classes for that check (fail-closed), keeping `codex-scope-check.ps1:705-708`'s existing warning.
  - Adding a name to `$derivedCacheExclusions` or to `tree-pin.ps1 $toolCacheExclusions` without matching behaviour turns the suite RED. The promise is scoped to exactly the two lists the Task 3 test parses; `$runtimeExclusions` is NOT parsed and carries no such guarantee.
  - **Three-way name state — sanctioned / deprecated-but-excluded / everything else flags.** SANCTIONED: exactly one scratch directory name, `.codex-scratch/`, repo-root-anchored — the only name a coder may create. DEPRECATED-BUT-EXCLUDED: `.scratch`, `.apex-tmp`, `.sandbox-cache` are currently excluded for noise reduction on repos that already contain them and do NOT raise scope violations; they may lose their exclusion in a future revision and must not be used for new work. The three tool caches (`.pytest_cache`, `.mypy_cache`, `.ruff_cache`) complete the seven-entry list. EVERYTHING ELSE FLAGS: the prescription closes the invented-name tail going FORWARD; the exact list never chases it, so task-suffixed names (`.codex-scratch-task2`, `.artemis-dur2-task3-tmp`) still flag.
  - **Accepted content-blindness gap, explicit not incidental:** every listed exclusion is excluded by NAME — contents, including executable-class files, are never examined, and NO current control inspects them. The destructive-command guard cannot see these writes at all (the Codex subprocess does not ride Claude Code's permission floor — `codex-scope-check.ps1:7-8`), and the review diff omits ignored files. The gap is accepted pending the wave-2 out-of-repo TEMP mechanism, which supersedes in-repo scratch entirely. Task 2's fixture case (10) pins it so it cannot be lost silently.
  - Coverage boundary: the Task 3 lockstep test catches LIST and PRESCRIPTION drift plus per-entry behaviour; weakening of the guard LOGIC is caught by Task 2's fixture cases (3), (4), (6), (11), (12) and (14), not by the lockstep test.
- **Non-goals:** prefix/wildcard/glob families · any change to `tree-pin.ps1` · the P2(b) AGENTS.md verify contract and P2(c) per-worktree venv work · exit-code changes.

## Assumptions
- Provenance is split, not uniform: `.codex-scratch`, `.apex-tmp` and `.sandbox-cache` come from the stratification's critical_violation cluster (`ledger-stratification-2026-07-30.md` § A2, 147/168); `.scratch` comes from the done_with_concerns cleanup cluster (§ A1, cluster 2, n=94); the three tool caches (`.pytest_cache`, `.mypy_cache`, `.ruff_cache`) come from parity with `tree-pin.ps1 $toolCacheExclusions` (the drift-gate origin), NOT from the ledger. Together they cover the modal false-positive volume; coder-invented suffixed variants continue to flag until the Task 5 prescription takes effect → impact: Caution
- The exclusion is effective only where the target repo's `.gitignore` already lists these names, so the paths carry porcelain `!!`; in a repo that does not ignore them they keep flagging (fail-closed). Repo seeding is a wave-2 item and no task here edits any `.gitignore` → impact: Caution
- No sibling wave-1 spec touches `references/dispatch-pack.md` (host file map, confirmed at adjudication) → impact: Stop
- `Get-DirtySet` (`codex-scope-check.ps1:158-195`) already carries the porcelain `!!` status class through to `$nowDirty`, but the snapshot writer (`codex-scope-check.ps1:534-541`) records only `dirty` names and `states` hashes — so proving `!!` AT SNAPSHOT requires a snapshot-format addition, and old snapshots must grant no exclusion → impact: Stop
- `$curatedFiles`/`$curatedDirs` currently build only inside `if ($applyRuntimeExclusions)` (`codex-scope-check.ps1:688-709`); hoisting that build to run unconditionally does not change runtime-class behaviour on `~/.claude` → impact: Stop
- `wave-scope-test.ps1`, `sibling-guard-test.ps1`, `git-stderr-test.ps1`, `snapshot-scale-test.ps1`, `careless-coder-test.ps1` and `review-findings-test.ps1` all resolve the checker via `$PSScriptRoot`, so they exercise the worktree copy → impact: Caution
- `encoding-check-test.ps1:17` hardcodes the LIVE absolute checker path, so it can only be run by the host after integration → impact: Caution
- ADR-044 D4's claim that `review-findings-test.ps1` rewrites the LIVE ledger is STALE: the live file creates a per-run temp `APEX_STATE_DIR` and its own empty ledger (`review-findings-test.ps1:9-19`), and it exercises the `-Check` path — so it is safe and IS run by this spec → impact: Caution
- This spec edits scripts the live dispatcher executes (`codex-dispatch.ps1:790, 887, 1381, 1918`), so Tasks 1-3 and Task 5 build in an ISOLATED worktree copy of `~/.claude`, never the live tree (ADR-044 Wave-A X1-X3); Task 4 is host-executed at close-out and is not dispatched → impact: Stop

Simplicity check: yes — a blanket "exclude any ignored cache-shaped directory" rule was considered and rejected: an ignored path can hide a hook, and every exemption previously written into this harness became a hole (`codex-scope-check.ps1:390-391, 621-625`). The exact list plus root/status/ref guards is the narrower version.

## Prerequisites
- Specs that must be complete first: none
- Shared-file edge (declared both sides): `build-orchestrator-contract` also modifies `skills/apex-code/references/dispatch-pack.md` — disjoint regions (this spec's Task 5 at `:22-25` and after `:43`; that spec at `:98`), so the two never co-edit a line. Ordering edge nonetheless: `build-orchestrator-contract` builds AFTER this spec, and its integration must rebase onto this spec's dispatch-pack changes. The two are therefore NOT eligible for cross-spec parallel build (ADR-029 file-disjointness)
- Environment setup: an isolated git worktree copy of `~/.claude` for Tasks 1, 2, 3 and 5 (host-provisioned), with worktree-root-relative paths. Task 4 is host-executed in the `~/apex` repo at close-out and never enters a dispatch.

## Files to Change
| File | Operation | Notes |
|------|-----------|-------|
| skills/apex-code/scripts/codex-scope-check.ps1 (`~/.claude` worktree) | modify | New `$derivedCacheExclusions` + `$derivedCacheDivergence` + `Test-IsDerivedCachePath`; hoist the curated inventory out of the runtime-only branch; apply the guard in both classification branches (lines 719 and 777); new exclusion-count report line |
| skills/apex-code/scripts/scope-check-test.ps1 (`~/.claude` worktree) | modify | Adds the derived-cache fixture cases and the lockstep drift guard; existing 19 written-paths + 13 runtime-exclusion cases stay untouched |
| skills/apex-code/references/dispatch-pack.md (`~/.claude` worktree) | modify | Prescribes `.codex-scratch/` as the sole sanctioned scratch directory — a Constraints-slot bullet in the pack template plus its own short section |
| docs/technical/adr/ADR-044-round8-deferred-designs.md (`~/apex`) | modify | Caveat blockquote under § D1 recording the second, differently-scoped exclusion class and its by-design limits |

Four files exceeds the template's 3-file split guidance; kept as one spec on host adjudication, because the prescription (task 5) and the exclusion list (task 1) are a single contract that the task-3 lockstep test asserts as a pair — splitting them would put the pairing assertion in a spec that cannot see one of its two halves.

Consumer sweep (`Select-String -Pattern 'codex-scope-check' -Path ~/.claude -Recurse`): `codex-dispatch.ps1` (790, 887, 1381, 1918) and ten test suites — `scope-check-test.ps1`, `wave-scope-test.ps1`, `careless-coder-test.ps1`, `sibling-guard-test.ps1`, `git-stderr-test.ps1`, `snapshot-scale-test.ps1`, `encoding-check-test.ps1`, `dispatch-criticalfile-test.ps1`, `dispatch-encoding-utf8-test.ps1`, `review-findings-test.ps1`. No consumer parses the exclusion lists today; `tree-pin.ps1:184` and `codex-scope-check.ps1:650-653` declare a sync obligation in COMMENTS ONLY — no test enforces it.

## Tasks
- [ ] **Task 1**: In `Test-IsRuntimePath`'s neighbourhood, add `$derivedCacheExclusions = @('.codex-scratch','.scratch','.apex-tmp','.sandbox-cache','.pytest_cache','.mypy_cache','.ruff_cache')` — commented with the three-way state: one SANCTIONED name (`.codex-scratch`), three DEPRECATED-BUT-EXCLUDED names kept for noise reduction on existing repos and liable to lose their exclusion in a future revision (`.scratch`, `.apex-tmp`, `.sandbox-cache`), three tool caches at `tree-pin.ps1` parity — plus `$derivedCacheDivergence = @('.venv','node_modules/.cache','__pycache__','.coverage')` (tree-pin entries deliberately NOT shared), and `Test-IsDerivedCachePath` using the same repo-root-anchored ordinal-ignore-case equality-or-descendant matcher as `Test-IsRuntimePath` (lines 665-673). Extend the snapshot writer (`codex-scope-check.ps1:534-541`) with a `statuses` map recording each dirty path's porcelain XY alongside the existing `dirty`/`states`, and read it back beside `$preState`/`$preDirty` (lines 585-590) as `$preStatus`. Hoist the `$curatedFiles`/`$curatedDirs` inventory build (lines 688-709) so it runs unconditionally, and on `catch` clear BOTH `$applyRuntimeExclusions` and a new `$applyDerivedCacheExclusions` while keeping the existing warning text verbatim. In BOTH classification branches, immediately after the existing runtime `if` (lines 719 and 777), add: skip when `$applyDerivedCacheExclusions` AND `Test-IsDerivedCachePath $n` AND NOT `Test-IsHostCurated $n` AND the PRESENCE-SPLIT test passes — **arm (a)**, `$n` is NOT in `$preDirty` (created during the dispatch): require only that `$n`'s current `$nowDirty` status is `!!`; **arm (b)**, `$n` IS in `$preDirty`: require `$preStatus` to hold a recorded status for `$n` that is `!!` AND (`$n`'s current status is `!!` OR `$n` is absent from `$nowDirty` entirely). A present-at-snapshot path with no recorded status falls through to arm (b)'s first clause and is never excluded, so a pre-change snapshot is fail-closed. Increment `$derivedCacheExcludedCount`. Emit a second report line beside line 815-817: `[scope] N derived-cache path(s) excluded (ignored + untracked + exact-list; every other ignored path is still checked).` — files: skills/apex-code/scripts/codex-scope-check.ps1 — done when: the existing `scope-check-test.ps1` and `wave-scope-test.ps1` both still exit 0 (no regression; new coverage lands in Task 2)
- [ ] **Task 2**: Add derived-cache fixture cases to the existing `try` block, after "Runtime exclusion (13)" (line 590) and before the failure tally (line 592), using a new `New-IgnoredCacheRepo` helper that commits a `.gitignore` and redirects `GIT_CONFIG_GLOBAL` to a scratch gitconfig whose `core.excludesFile` is an empty file (the isolation idiom at `dispatch-criticalfile-test.ps1:295-300`) so a host global-ignore cannot perturb the `!!` class. Cases: (1) untracked `.codex-scratch/log.txt` created during dispatch → exit 0, written-paths empty; (2) `.pytest_cache/v/cache/lastfailed` created → exit 0; (3) an ignored path NOT on the list (`.secret-hooks/post-commit`) created during dispatch → non-zero, attributed; (4) a force-added tracked `.pytest_cache/keep.txt` modified by the coder → non-zero, attributed; (5) `.codex-scratch` present at snapshot and deleted at check → exit 0 and no `GONE` line (mirrors "Runtime exclusion (7)", line 509); (6) nested `src/.codex-scratch/x` → non-zero, attributed (root-anchoring bites); (7) `$result.Output -match 'derived-cache path\(s\) excluded'`; (8) the non-`-WrittenPathsFile` branch excludes identically → exit 0 and a `^\[scope\].* clean -` line; (9) an `ls-files` shim failure (`New-FailingGitShim`, line 133) re-attributes `.codex-scratch` and prints `runtime inventory could not be built`; (10) an executable-class file (`.codex-scratch/hook.ps1`) created inside the ignored scratch directory → exit 0, written-paths empty, carrying a comment that names this the ACCEPTED CONTENT-BLINDNESS GAP (exclusion is by name; contents are never examined by ANY control) so the gap cannot be lost silently; (11) an exact-list name created during the dispatch at the repo root that is NOT gitignored, so its current status is `??` → non-zero, attributed (arm (a)'s `!!` requirement is load-bearing); (12) a pre-existing `??` directory bearing an excluded name, deleted during the dispatch → non-zero, attributed (arm (b)'s recorded-snapshot-status requirement is load-bearing); (13) a collapsed-directory porcelain key with a trailing `/` (`!! .codex-scratch/`) → excluded, exercising `Normalize`'s trailing-slash trim against the lookup explicitly; (14) a hand-written snapshot JSON in the OLD format (no `statuses` member) whose `dirty` set names an ignored `.codex-scratch` still present at check → non-zero, attributed (fail-closed back-compat for pre-change snapshots) — files: skills/apex-code/scripts/scope-check-test.ps1 — done when: `scope-check-test.ps1` exits 0 with an assertion count strictly greater than the pre-edit count, and each of the fourteen cases prints a `PASS` line
- [ ] **Task 3**: Add a lockstep drift guard as the last block before the failure tally, built around a `Get-PsArrayLiteral -Path -Name` helper that extracts a named PowerShell array literal from a script read as text. Every parse target is a PARAMETER, so the probes below run against scratch COPIES and no authorized or read-only file is ever mutated: the block copies `codex-scope-check.ps1`, `tree-pin.ps1` and `references/dispatch-pack.md` into `$testRoot` and points the assertions at the copies, so a probe mutates only the copy. Assertions: (a) a parse yielding zero entries for `$derivedCacheExclusions`, `$derivedCacheDivergence` or `tree-pin.ps1 $toolCacheExclusions` (`tree-pin.ps1:208-216`) is a FAIL, never a silent pass; (b) **mechanical per-entry coverage** — loop over the PARSED `$derivedCacheExclusions` array and, for each name, generate and run a two-case behavioural fixture in a fresh repo — (i) the name gitignored and CREATED DURING THE DISPATCH, i.e. absent from the snapshot, so predicate arm (a) applies → excluded, exit 0; (ii) the same name present as `??` → flagged, non-zero — so an entry added without behaviour fails automatically and no hand-authored coverage map exists; (c) `$derivedCacheExclusions` and `$derivedCacheDivergence` are disjoint; (d) every `$toolCacheExclusions` entry is either in `$derivedCacheExclusions` or in `$derivedCacheDivergence`; (e) **the prescription pairing** — the dispatch-pack copy names `.codex-scratch/` as the sole SANCTIONED scratch directory (a zero-hit read, or a second name presented as sanctioned, is a FAIL) AND `$derivedCacheExclusions` contains `.codex-scratch`; the the three DEPRECATED names may appear in the pack only as deprecated examples, never as sanctioned. Carry a header comment stating the coverage boundary: this block catches LIST and PRESCRIPTION drift plus per-entry behaviour — guard-LOGIC weakening is caught by Task 2's cases (3), (4), (6), (11), (12) and (14) — files: skills/apex-code/scripts/scope-check-test.ps1 — done when: `scope-check-test.ps1` exits 0, and each of the three scratch-copy probes (an extra `$derivedCacheExclusions` entry; an extra `$toolCacheExclusions` entry; a renamed sanctioned directory in the pack copy) drives it to exit 1 naming its own assertion, with no file outside `$testRoot` modified
- [ ] **Task 4** `[host]` (HOST-EXECUTED at wave close, NOT dispatched — ADR back-fills are host bookkeeping, and keeping it off the build surface also removes an apex-repo read from inside the build's scope lock): add a caveat blockquote in the `~/apex` repo immediately under the `## D1 — tree-pin adopts the in-process digest…` heading, in the house style of `ADR-036-remove-knowledge-layer.md:8`, recording: `codex-scope-check.ps1` now carries a SECOND exclusion class distinct from D1(d)'s runtime class — repo-root-anchored, exact-name, ignored-and-untracked derived caches, active in EVERY worktree rather than gated on `-RuntimeExclusionRoot`; it is deliberately NOT a blanket cache-dir class, because an ignored path can hide a hook; `.venv`, `node_modules/.cache`, `__pycache__` and `.coverage` are excluded by `tree-pin.ps1` but deliberately NOT by scope-check, recorded as `$derivedCacheDivergence` and enforced by the lockstep test. State three limits plainly: (i) **content-blindness** — `.codex-scratch/` is excluded by NAME and its contents, including executable-class files, are unexamined by scope-check by design; NO current control inspects that content — the destructive-command guard cannot see Codex subprocess writes at all (`codex-scope-check.ps1:7-8`) and the review diff omits ignored files — and the gap covers EVERY listed exclusion, accepted pending the wave-2 out-of-repo TEMP mechanism which supersedes in-repo scratch entirely; (ii) the exclusion only bites where the repo's `.gitignore` already lists the name, and flags fail-closed elsewhere; (iii) task-suffixed scratch names (`.codex-scratch-task2`, `.artemis-dur2-task3-tmp`) still flag. Attribute the entries by provenance — `.codex-scratch`/`.apex-tmp`/`.sandbox-cache` to `docs/research/ledger-stratification-2026-07-30.md` § A2, `.scratch` to its § A1 cluster 2, the three tool caches to `tree-pin.ps1 $toolCacheExclusions` parity and NOT to the ledger. For the wave-2 TEMP mechanism the primary source is `docs/research/sandbox-temp-research-2026-07-30.md` (§ TL;DR causal chain — the Windows restricted token denies the profile `%TEMP%`, `TMPDIR` is unset so workspace-write ships with no writable temp, and the coder re-points TEMP/TMP into the worktree); cite it first, with `docs/research/ledger-stratification-2026-07-30.md` § Cross-cutting and the `docs/status.md` retro-queue entry as corroborating anchors — files: docs/technical/adr/ADR-044-round8-deferred-designs.md — done when: `Select-String -Pattern 'derivedCacheDivergence' -Path docs/technical/adr/ADR-044-round8-deferred-designs.md` returns a match and the blockquote sits between the `## D1` heading and its `### Context` heading
- [ ] **Task 5**: Prescribe the canonical scratch directory. In the `## Pack template` `## Constraints` slot (`dispatch-pack.md:22-25`), add a bullet directly under the surgical-scope bullet: "Scratch: if you need a scratch directory, create `.codex-scratch/` at the repo root and nowhere else — it is the only sanctioned name. `.scratch`, `.apex-tmp` and `.sandbox-cache` are DEPRECATED: they are still excluded from the scope check on existing repos, so they raise no violation, but they may lose that exclusion in a future revision — do not use them for new work. Any other invented or task-suffixed variant (`.codex-scratch-task2`) IS reported as an out-of-scope write. If this repo does not gitignore `.codex-scratch/`, it will flag as a scope violation — report that, and do NOT add gitignore entries yourself." Then add a short `## Scratch directory (the Constraints slot)` section immediately after `## Hazard selection (the Constraints slot)` (ends line 43) stating the same rule as prose: exactly one sanctioned name, repo-root-anchored, the only scratch location a coder may create. The section also states plainly that `codex-scope-check.ps1` additionally excludes three DEPRECATED names (`.scratch`, `.apex-tmp`, `.sandbox-cache`) and three tool caches for noise reduction on existing repos — those raise no violation today, may lose the exclusion in a future revision, and are not for new work. The section repeats the gitignore condition — the exclusion depends on the target repo already ignoring the name, coders never add gitignore entries, and repo seeding is a wave-2 item. Do not restate the exclusion mechanism's guards — point at the script — files: skills/apex-code/references/dispatch-pack.md — done when: `Select-String -Pattern '\.codex-scratch/' -Path skills/apex-code/references/dispatch-pack.md` returns 2 or more matches, `Select-String -Pattern 'sanctioned' -Path skills/apex-code/references/dispatch-pack.md` returns matches in both the template block and the new section, and no name other than `.codex-scratch/` is presented as sanctioned

## Wave plan
Wave 1: [task 1, task 5] | Wave 2: [task 2] | Wave 3: [task 3] | Close-out (host, not dispatched): [task 4]

## Permissions

The following NON-CRITICAL actions will run autonomously during build. Approving this spec approves all of them.
Critical paths — .env · migrations · auth/authz/crypto · CI config · dependency manifests and lockfiles · infra-as-code · secrets/keys/certs · host-state (the session status doc, root AGENTS.md, root CLAUDE.md, the spec-changes and handoff directories, the run ledger) · the permission settings and the hooks — are NEVER pre-authorised by this section. They need a live attended confirmation at build time, and an AFK run parks them (D3, ADR-046; apex-governance is canonical and holds the exact path set). (Sole exception: the docs agents' three host's-pen artifacts — the handoff, the session status doc, and spec archival — under D6.)
docs/audit/ is different and stricter: TIER-1, refused outright on a path match. No confirmation authorises a write there — not attended, not by any switch, not by this section. (D5's append-only exception is doctrine pending a content-aware classifier change; it is not a live permission.)

### File Operations
| Action | Paths |
|--------|-------|
| Create | (none) |
| Modify | skills/apex-code/scripts/codex-scope-check.ps1 · skills/apex-code/scripts/scope-check-test.ps1 · skills/apex-code/references/dispatch-pack.md · docs/technical/adr/ADR-044-round8-deferred-designs.md |
| Delete | (none) |

### Commands
| Command | Purpose |
|---------|---------|
| `scope-check-test.ps1` | Primary suite (edited by this spec) |
| `wave-scope-test.ps1` | Same-code regression suite (read-only) |
| `sibling-guard-test.ps1` | Same-code regression suite (read-only) |
| `git-stderr-test.ps1` | Same-code regression suite (read-only) |
| `snapshot-scale-test.ps1` | Same-code regression suite (read-only) |
| `careless-coder-test.ps1` | Same-code regression suite (read-only) |
| `review-findings-test.ps1` | Same-code regression suite, temp state dir (read-only) |
| the six AGENTS.md verify commands | The repo's verify contract — two `node --check` hook parses, the python destructive-guard test, and the baseline / spec-validate / dispatch-preflight suites |
| `Select-String` | Doc and literal assertions (never bare `grep`) |
| `git status --porcelain --ignored=traditional` | Fixture inspection (read-only) |

Exact invocations, run from the worktree root — this fenced block is the authority for every command named in § Acceptance Criteria:

```
node --check hooks/destructive-command-guard.js
node --check hooks/lib/destructive-detect.js
python hooks/destructive-guard-test.py
powershell.exe -NoProfile -File skills/apex-code/scripts/baseline-check-test.ps1
powershell.exe -NoProfile -File skills/apex-code/scripts/spec-validate-test.ps1
powershell.exe -NoProfile -File skills/apex-code/scripts/dispatch-preflight-test.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File .\skills\apex-code\scripts\scope-check-test.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File .\skills\apex-code\scripts\wave-scope-test.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File .\skills\apex-code\scripts\sibling-guard-test.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File .\skills\apex-code\scripts\git-stderr-test.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File .\skills\apex-code\scripts\snapshot-scale-test.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File .\skills\apex-code\scripts\careless-coder-test.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File .\skills\apex-code\scripts\review-findings-test.ps1
powershell -NoProfile -Command "Select-String -Pattern '\.codex-scratch/' -Path skills/apex-code/references/dispatch-pack.md"
powershell -NoProfile -Command "Select-String -Pattern 'sanctioned' -Path skills/apex-code/references/dispatch-pack.md"
powershell -NoProfile -Command "Select-String -Pattern 'derivedCacheExclusions = @\(' -Context 0,8 -Path skills/apex-code/scripts/codex-scope-check.ps1"
powershell -NoProfile -Command "Select-String -Pattern 'derivedCacheDivergence' -Path docs/technical/adr/ADR-044-round8-deferred-designs.md"
powershell -NoProfile -ExecutionPolicy Bypass -File C:\Users\User\.claude\skills\apex-code\scripts\encoding-check-test.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File C:\Users\User\.claude\skills\apex-code\scripts\codex-scope-check.ps1 -Snapshot -Worktree C:\Users\User\.claude -Task live-smoke
powershell -NoProfile -ExecutionPolicy Bypass -File C:\Users\User\.claude\skills\apex-code\scripts\codex-scope-check.ps1 -Check -Worktree C:\Users\User\.claude -Task live-smoke -Authorized skills/apex-code/scripts/codex-scope-check.ps1
```

The last three lines are HOST-ONLY, run against the live tree after integration with no gates open — never from inside a build worktree.

The first six lines are the `~/.claude` AGENTS.md verify contract (`AGENTS.md:12-17`) and run unchanged; this spec adds no gate to them.

### Git Operations
| Operation | Scope |
|-----------|-------|
| `git add` | (none — the coder never commits) |
| `git commit` | (none — the host commits `docs: scope-check derived-cache exclusions + lockstep drift guard` at wave close) |

### Environment Access
| Variable | Purpose |
|----------|---------|
| `TEMP` | Test fixture roots (`scope-check-test.ps1:8`) |
| `APEX_STATE_DIR` | Suite state isolation (`sibling-guard-test.ps1:20`, `careless-coder-test.ps1:8`) |

### Network
| Action | Purpose |
|--------|---------|
| (none) | No package installation |

## Specialist Context
### Security
The gate's threat model is a careless coder, not a hostile one (`codex-scope-check.ps1:48-65`). Widening exclusions weakens detection, so the exclusion predicate is a four-way conjunction and every ignored path off the exact list must keep flagging — task 2 case (3) is the load-bearing proof.

### Performance
No new git subprocesses per path: the curated inventory is two `git` calls (`ls-files -z`, `ls-tree -r --name-only -z HEAD`, lines 690-691) and hoisting them makes them unconditional rather than repeated. `snapshot-scale-test.ps1` guards against reintroducing the per-file process storm.

### Accessibility
(none — no frontend change)

## Documentation
| Doc type | File | Action |
|----------|------|--------|
| Inline | skills/apex-code/scripts/codex-scope-check.ps1 | Comment block above `$derivedCacheExclusions` stating the four-way conjunction and the divergence-from-tree-pin declaration |
| Reference | skills/apex-code/references/dispatch-pack.md | `.codex-scratch/` prescribed as the sole sanctioned scratch directory (task 5) |
| ADR | docs/technical/adr/ADR-044-round8-deferred-designs.md | Caveat blockquote under § D1 (task 4) |
| Changelog | (none) | Repo has no CHANGELOG |

## Acceptance Criteria
Run every command below from the worktree root; the exact invocations are the fenced block in § Permissions → Commands.

- [ ] Task 1 + Task 2: run `scope-check-test.ps1` → verify: exit 0 and a final `PASS -- all N scope-check assertions passed.` where N exceeds the pre-edit count (record both numbers in the task report)
- [ ] Task 1 regression: run `wave-scope-test.ps1`, `sibling-guard-test.ps1`, `git-stderr-test.ps1`, `snapshot-scale-test.ps1`, `careless-coder-test.ps1` and `review-findings-test.ps1` → verify: each exits 0 (existing suites stay green)
- [ ] Verify contract intact: run the six AGENTS.md verify commands (the first six lines of the § Permissions fenced block) → verify: each exits 0, unchanged by this spec
- [ ] Task 2 false-positive kill: inspect the case-(1)/(2)/(5) output lines → verify: each prints `PASS`, the check exits 0, and the run prints `derived-cache path(s) excluded` — the known false-positive signatures no longer flag
- [ ] Task 2 still-bites: inspect the case-(3)/(4)/(6)/(11)/(12)/(14) output lines → verify: each prints `PASS` with a NON-ZERO checker exit and the offending path present in the `-WrittenPathsFile` output — an ignored path off the exact list, a tracked cache-named path, a nested (non-root) match, an on-list name created during the dispatch that is `??` rather than `!!` (arm (a)), a deleted pre-existing `??` directory bearing an excluded name (arm (b)), and an old-format snapshot lacking `statuses` all still flag
- [ ] Task 2 normalization: inspect the case-(13) output line → verify: it prints `PASS` with a zero checker exit — a collapsed-directory porcelain key with a trailing `/` classifies against the normalized lookup and is excluded
- [ ] Task 1 presence-split: inspect the case-(1) and case-(5) output lines → verify: both print `PASS` with a zero checker exit — a scratch directory created DURING the dispatch is excluded under arm (a) (the actual false-positive class, which a snapshot-only predicate would have missed), and a pre-existing `!!` scratch directory deleted during the dispatch is excluded under arm (b)
- [ ] Task 2 accepted gap is pinned: inspect the case-(10) output line → verify: it prints `PASS` with a zero checker exit for an executable-class file inside the ignored scratch directory, and the fixture carries the comment naming the accepted content-blindness gap — the gap is asserted, not incidental
- [ ] Task 3 mechanical coverage: inspect the generated per-entry fixture output → verify: two behavioural cases ran for EVERY parsed `$derivedCacheExclusions` entry (gitignored → excluded; `??` → flagged), with no hand-authored coverage map in the file
- [ ] Task 3 fail-closed on list drift: run the scratch-copy probe that appends `'.probe-cache'` to `$derivedCacheExclusions` in the COPY of `codex-scope-check.ps1` under the suite's temp root → verify: the probe run exits 1 naming the coverage assertion, and `git status --porcelain` shows no modification to any file outside that temp root
- [ ] Task 3 fail-closed on cross-script drift: run the scratch-copy probe that adds an entry to `$toolCacheExclusions` in the COPY of `tree-pin.ps1` → verify: exits 1 naming the divergence assertion, with `tree-pin.ps1` itself unmodified
- [ ] Task 3 fail-closed on pairing drift: run the scratch-copy probe that renames the sanctioned directory in the COPY of `dispatch-pack.md` → verify: exits 1 naming the prescription-pairing assertion, with `dispatch-pack.md` itself unmodified
- [ ] Task 5 + Task 1 pairing: run the two dispatch-pack `Select-String` commands and the `derivedCacheExclusions` `Select-String` from the fenced block → verify: the pack names `.codex-scratch/` as the sole SANCTIONED scratch directory in both the Constraints slot and the new section with no other name presented as sanctioned, AND the exclusion list holds exactly the seven enumerated entries — one sanctioned, three deprecated-but-excluded, three tool caches
- [ ] Task 4 `[host]`: after the host writes the ADR caveat, run the ADR `Select-String` from the fenced block → verify: one or more matches, inside a blockquote positioned between the `## D1` heading and its `### Context` heading
- [ ] Host verification after integration into the live `~/.claude` tree with no gates open: run the three HOST-ONLY commands at the end of the § Permissions fenced block — `encoding-check-test.ps1` (its checker path is hardcoded absolute at line 17) and the live `-Snapshot`/`-Check` pair against `~/.claude` → verify: exit 0 for both, and the live check still reports `runtime path(s) excluded` for `~/.claude` session churn
- [ ] Follow-up measurement, NOT a gate on this spec: after ~10 build days, re-census the run ledger for `critical_violation` rows → verify: the gitignored-scratch share has fallen from its 147/168 baseline, recorded as an outcome note rather than a build acceptance

## Progress
_(The build writes here — do not edit manually)_
