# Round 8 — final cross-family harness review (2026-07-17)

Four independent reviews of the APEX gate harness: 3 Claude lenses (fail-open, bypass, test-adequacy)
+ 1 Codex/Sol cold read (effort max). ~50 raw findings → ~35 real defects after dedup. Sol found
~20 the Claude lenses missed (mostly `codex-dispatch.ps1` internals + destructive-detect). All four
returned BLOCK. This file is the durable record; the fix is sequenced as file-disjoint waves.

## Decisions (user, 2026-07-17)
- **Threat model UNCHANGED — careless coder, not hostile.** Evasion/provenance items → documented
  limits, not fixes. (base64 `-EncodedCommand`, dot-source `. codex exec`, `$exe` indirection,
  C-quotePath, self-assertable `-CriticalFilesConfirmed`, test-override params.) Exception: destructive-detect
  CORRECTNESS bugs are fixed regardless (they protect the human operator, not the coder).
- **Env kill-switches → require reason + audit row.** `APEX_DESTRUCT_GUARD=off` (disables ALL CLAUDE.md
  hard blocks) and `APEX_CODEX_GUARD=off` must refuse unless a reason var is set, and must write an audit
  row when a guard is disabled. (W2.)
- **Remove `Bash(codex exec:*)` from settings.json permissions.allow** — it pre-approves the raw path the
  wrapper exists to forbid; with it gone, a fail-open guard hits a permission prompt instead of silent raw
  dispatch. (W2.)
- **Build one wave at a time, gate scripts first.**

## Wave roadmap
- **W1 — 6 gate scripts** (`docs/changes/round8-w1-gate-scripts.md`) — BUILDING 2026-07-17. ~10 fail-open
  fixes. 3 sub-fixes cut to Deferred (below).
- **W2 — 4 JS hooks + settings.json.** destructive-detect (env/command runner unwrap; `plusRefspecForce`
  dead var → `+HEAD:refs/heads/main` force-push not caught; `dd if=/dev/...` boundary bug); dispatch-guard
  (fail-open on delayed/malformed stdin → fail closed; missed carriers `eval`/`Start-Process` per round-7
  claim); context-cap-guard (fail-open on malformed JSON + read-failure-as-empty; `MultiEdit` matcher gap);
  destructive-guard (fail-open on delayed stdin + swallowed exceptions). + the two settings.json decisions.
- **W3 — `codex-dispatch.ps1`** (13 findings, own spec, highest risk). Sol S2 fake-review-row (`-Phase review`
  + default schema records reviewer_family with no verdict → family gate accepts); S3 missing in-worktree spec
  skips validation; S7 completion statuses not allowlisted; S8/S9/S10 adoption + live-worker races; S11
  `-ReviewedRunId` not bound to build; S12 `-SkipScopeCheck` records false `scope_armed`; S1/K5 `-Phase`
  ValidateSet (note: also partly addressed by W1 discipline). Escape hatches S5 `-AllowSharedWorktree` / S6
  `-NoTreePin` → require reason + ledger annotation.
- **W4 — SKILL.md consistency + remaining test suites.** SKILL.md:342 `Add-Content` bypasses ledger mutex
  (race drops a row); SKILL.md:195 stale observability path; `dispatch-test.ps1` always-exit-0 (C1, sibling of
  the scope-check-test fix done in W1).

## Wave status (updated 2026-07-17)
- W1 DONE + committed (`~/.claude` fbfc32d, `~/apex` bd472bb).
- W2 (hooks + settings + ADR-043): specced, cross-family reviewed (Claude + Sol, both BLOCK — 2+5 BLOCKs), amended (14 amendments incl. dd command-predicate, async cap-guard stdin, real permissionDecision emission, malformed-shape-denies), BUILDING.
- W3 (codex-dispatch.ps1): 10 fixes BUILT (Codex xhigh, isolated worktree, scope-clean, exit-code contract intact). Cross-family review CLEAN on all 10 + confirmed NO over-strict regression. Wave 2 (realign 5 stale test fixtures) RUNNING. Cuts below. NOTE: the Task-1 dispatch exceeded the 10-min foreground ceiling → the Sonnet orchestrator subagent ended but the Codex process detached and finished; host took over (watcher + host-owned run_in_background for Wave 2). Lesson: xhigh big-file dispatches must be HOST-owned run_in_background, not subagent-foreground.

## Pre-existing test debt (discovered during W3, NOT caused by round 8)
Empirically confirmed red against the OLD (pre-W3) wrapper, so no regression — track as a separate cleanup spec:
- `dispatch-deadlock-test.ps1` (3 fail), `dispatch-encoding-utf8-test.ps1` (1 fail), `review-findings-test.ps1` #11, `dispatch-encoding-utf8` Test 1: fixtures dispatch a workspace-write build with `-SkipScopeCheck` ALONE (no `-Authorized`/`-ScopeUnlocked`) → hit the long-standing empty-scope refusal (byte-identical old & new wrapper). `-SkipScopeCheck` never bypassed that gate.
- `review-findings-test.ps1` #5, `careless-coder-test.ps1` #1: fixtures omit the AGENTS.md/baseline pre-flight input.
- `dispatch-scopelock-test.ps1` 'unlocked': `-ScopeUnlocked` without `-CriticalFilesConfirmed`.
- `dispatch-test.ps1`: hardcodes the installed dispatcher path + hits sandbox-denied LOCALAPPDATA when run from a worktree.
(W3 Wave 2 opportunistically fixes the in-file pre-existing cases for the 5 suites it must touch anyway; the two purely-untouched suites — deadlock, encoding-utf8 — stay for the cleanup spec.)
- W4 (apex-code/SKILL.md ledger-mutex race + stale path): skill-authoring (apex-skill-author), pending.

## Deferred — need a design decision, NOT a mechanical fix
### From W3 review (cut 12→10)
4. **Spec-resolution / `-SpecSourcePath`** (was W3 Fix 3). Refusing an unresolvable spec breaks the APEX two-tree self-build model (specs in ~/apex, build worktree ~/.claude → always "cross-tree"). Needs a first-class `-SpecSourcePath` param + rewiring every dispatch caller so the wrapper validates the spec at its real location; plan-time apex-spec-validate already covers the careless case.
5. **Bind a review to the build it reviewed** (was W3 Fix 8). `worktree_key`+`base_sha` can't identify a build ATTEMPT — two uncommitted same-worktree builds share both, so a review of A validates against B. Needs a durable per-attempt build identity (a tree/diff digest recorded at launch) that doesn't exist yet.
6. **Family-gate accepts a bound-but-VOID review** (Sol-discovered). A CLEAN review whose tree moved is written `status:done, tree_moved:true` then exits 69 (VOID), but `apex-family-gate.ps1` (164-203) accepts terminal `done` review rows and never checks `tree_moved`. Fix lives in family-gate.ps1 (cross-file). Important — revisit next.

### From W1 review

1. **Directory/prefix-grant critical detection** (was W1 Task 1a). The scope checker treats every authorized
   token as a descendant prefix, so `-Authorized src` (or dotted `api.v2`) authorizes `src/auth/login.ps1`
   while apex-critical-files classifies only the literal token → auth code skips confirmation. The
   "extensionless → CRITICAL" heuristic misses dotted grants AND over-fires on plain files (LICENSE, Makefile).
   Needs: prefix semantics, or classify the coder's ACTUAL writes post-hoc, not the grant list.
2. **Host-file non-authorizable predicate** (was W1 Task 5c). No such prohibition exists in codex-scope-check
   to "reorder" — only comments. A pre-authorization reject is new policy: must define the exact path-set
   (status.md only? all planning docs? AGENTS.md?), must NOT false-reject an already-dirty byte-identical
   status.md (lines 611-617 treat that as untouched host work), and overlaps context-cap-guard's basename block.
3. **Ignored-entry fingerprint in tree-pin** (was W1 Task 6b, = K10, the `~/.claude` blanket-`*` blind spot).
   tree-pin's `Get-PathDigest` (73-81) spawns `git hash-object` per file; adding `--ignored` routes node_modules
   through it — the EXACT storm codex-scope-check (188-193) already fixed by switching to an in-process
   path+length+mtime digest. tree-pin must adopt that in-process digest first.

## Also parked
- exit-65 session-runtime adjudication has no machine-readable ledger annotation (process gap).
- pre-family-field ledger rows permanently gate-13 (migration boundary — one-line note at each re-audit).

Full per-finding detail with line cites: `docs/handoff/2026-07-17-session75.md` (step-3 FLAGs) +
`docs/technical/harness-known-limits.md` (accepted limits).
