---
spec: audit-step3-criticalfile-crossfamily
status: ready
autonomy_level: L2
coder_model: codex         # Codex gpt-5.6-sol, dispatched per task through the wrapper. PER-TASK
                           # fallback: a task whose dispatch reports BLOCKED on a sandbox denial
                           # (denied writes to the harness state dir or .git) is re-run by the HOST
                           # as an in-session Opus worker for THAT task only — not a blanket pin.
cross_model_review: true   # Codex builds -> Claude reviews. Any Opus-fallback task gets a Codex
                           # review instead (cross-family; ADR-032/042). Harness safety change.
coder_effort: high         # fail-closed refusal gates on critical-file edits + an executable family
                           # gate; wrong = a wedge or a silent hole in the confirmation/independence.
---

# Spec: Audit step 3 — two-layer critical-file confirmation (#3) + cross-family ledger gate (#7)

**Identity:** Mechanises the two prose-only governance controls the joint audit filed as BLOCKs #3 and #7 — a two-tier, two-layer critical-file gate (interactive skill gate + a fail-closed wrapper backstop, exit 76) sharing one classifier that distinguishes never-confirmable hard-blocks from confirmable critical files, and an executable family gate that refuses same-family review unless a diff-bound attended human review is recorded.
→ why: see `docs/technical/adr/ADR-042-critical-file-confirmation-and-achievable-cross-family.md`, `docs/research/apex-v2-joint-audit-2026-07-15.md` (#3, #7). Do not restate rationale in this spec.

## Intent
- **Intent:** Give the "critical files always need confirmation, an authorising spec does not settle it" rule (#3) and the "cross-family review, achievable on the fallback" rule (#7) real, executable mechanisms, fail-closed, with a single shared classifier and a single family-gate script.
- **Invariants:**
  - The canonical critical-file classifier has exactly ONE executable home, `apex-critical-files.ps1`, matching `apex-governance` § Hard blocks (`docs/audit/`, never confirmable) and § Critical files (confirmable set) — no second copy of the pattern list in PowerShell.
  - The classifier is TWO-TIER: a TIER-1 HARD-BLOCK match (`docs/audit/`, governance §77) signals distinctly (exit 11 / `HARDBLOCK` line) and is NEVER cleared by `-CriticalFilesConfirmed`; a TIER-2 CRITICAL match signals `CRITICAL` / exit 10 and is clearable only by an attended confirmation; no match → exit 0.
  - A `-Phase build -Sandbox workspace-write` dispatch is REFUSED with **exit 76**, before reservation and before the pin arms (no ledger row, no dispatch log — same framing as exit 72/74), when: any `-Authorized` path is a hard-block; OR any `-Authorized` path is critical and no `-CriticalFilesConfirmed` switch is present; OR the run is `-ScopeUnlocked` (no declarable file set) and no `-CriticalFilesConfirmed`; OR the classifier cannot be resolved/run (fail-closed).
  - `-CriticalFilesConfirmed` is honoured only as a dispatch switch, never set by spec text; Layer A (attended, live human) is its only setter. With a TIER-2 match the run proceeds and records `critical_files_confirmed=true` plus the `-CriticalFilesConfirmedNote` who/when string. It does NOT override a TIER-1 hard-block.
  - The wrapper records `builder_family` on a build-phase dispatch and `reviewer_family` on a review/end-gate dispatch, each derived from `$coderModel` via `Get-ModelFamily`, computed BEFORE the ledger row is written (so the field is a real value, not empty).
  - The #7 completion gate is an EXECUTABLE script (`apex-family-gate.ps1`) that reads the ledger and exits pass/refuse; `apex-code`'s completion step CALLS it (like the M3 validator), never eyeballs it. It counts only COMPLETED (terminal-success) build/review rows, takes the builder family from the successful build row, and accepts a same-family build only when a cross-family review OR a diff-bound attended human review is recorded.
  - The "cross-family, always" promise is reworded to the achievable policy in the governance canonical home and the `apex-code` summary.
  - This spec PASSES its own `apex-spec-validate.ps1` files-completeness rule (dogfood).
- **Non-goals:**
  - Adds NO third model family and NO `-CoderModel` parameter to the wrapper — it stays hardwired to `gpt-5.6-sol` (ADR-038/042); the family fields describe what it launched.
  - Does NOT add a wrapper exit code for #7 — the completion gate is `apex-family-gate.ps1`'s own exit space, read by the skill, not a dispatch refusal.
  - Does NOT touch `~/.claude/CLAUDE.md`'s "cross-family, both directions" summary line (governance is the canonical reworded home).
  - Does NOT re-open the M2b/M3 pre-flight (ADR-040) or the scope-lock / cap-guard / tree-pin work (ADR-041); it slots the new refusal beside them.
  - Does NOT close the bare-non-critical-directory-grant hole (a `src` grant authorising `src/auth/x`) or the scope-unlocked hard-block-invisibility beyond requiring confirmation — both are stated known-limits deferred to round 8.

## Assumptions
- `codex-dispatch.ps1` hardcodes the coder model as the literal `-m 'gpt-5.6-sol'` in the launch-args array (currently ~line 938) and takes NO coder-model parameter; the Opus fallback build is an in-session worker that never runs through this wrapper (ADR-038). So wrapper-recorded families are ALWAYS `openai`; the anthropic side is recorded by `apex-code` to the same ledger. → impact: Caution (STOP and report if the wrapper has gained a real coder-model input by build time — the derivation source would then change).
- In `codex-dispatch.ps1`: the empty-`-Authorized` exit-74 refusal is at ~line 645 (BEFORE the build pre-flight `try`); the `try` opens ~line 658 and its `if ($Phase -eq 'build' -and $Sandbox -eq 'workspace-write')` guard begins ~line 659; the `$ledgerRow` ordered hashtable is ~lines 786-816; the reservation append is ~lines 833-845; the `-m` launch arg is ~line 938. → impact: Stop (if any anchor moved, re-place the new refusal so it still runs before reservation and independently of `-SkipBaselineCheck`, and re-place the `$coderModel`/`Get-ModelFamily` definitions before the ledger row; report the move).
- The critical-file refusal must run for EVERY workspace-write build regardless of `-SkipBaselineCheck` (independent gates), placed as the FIRST check inside the build guard, before the `$SkipBaselineCheck` branch and before the pin arms, so its `exit 76` needs no pin cleanup. → impact: Stop.
- `apex-critical-files.ps1`, `apex-family-gate.ps1`, `family-gate-test.ps1`, `critical-files-test.ps1`, and `dispatch-criticalfile-test.ps1` are CREATED by this spec (Tasks 1/2/4/5/6) and are NOT yet git-tracked; `~/.claude` blanket-ignores `*`, so they are staged host-side with `git add -f` by name after review. → impact: Caution (a gitignored new file suppresses path-scoped diff display; stage by name at review).
- No task's `-Authorized` in THIS spec matches any tier the classifier defines — every edit is under `skills/apex-code/`, `skills/apex-governance/`, `agents/`, or `~/apex` docs; none is a `.env`, migration, auth/crypto/middleware source, CI config, dependency manifest/lockfile, infra-as-code, hook, `.claude/settings.json`, secret/credential path, or `docs/audit/` file. So Layer B requires no `-CriticalFilesConfirmed` for this build. → impact: Stop (if a matching task is added, dispatch it with `-CriticalFilesConfirmed -CriticalFilesConfirmedNote "attended 2026-07-17"`; a `docs/audit/` edit could not be built at all — it is a hard block).
- `apex-code` SKILL.md is ~328 lines and `apex-governance` SKILL.md is ~173 lines (both under the 500 cap). → impact: Low.

Simplicity check: considered a single-tier classifier and a prose #7 gate — rejected on Sol round 1: a single tier lets `-CriticalFilesConfirmed` clear a `docs/audit/` edit that governance §77 forbids outright, and a prose family check is the model-self-check anti-pattern audit #4 named. Why this version: one classifier that names the tier, plus one gate script the completion step runs, is the smallest shape that cannot fail open through a divergent copy or a self-graded check.

## Prerequisites
- Specs that must be complete first: `audit-step2-m2b-m3` (done) and `audit-step2p5-wrapper-hardening` (done) — this spec assumes the exit-72 pre-flight `try`, the exit-74 scope-lock refusal + `-ScopeUnlocked`/`-ScopeUnlockedReason` params, and the `$ledgerRow` shape those specs produced. No file overlap with any in-flight spec.
- Environment setup required: `powershell.exe` (Windows PowerShell 5.1), Git-for-Windows on PATH; `codex` NOT required (dispatch tests drive `dispatch-test-fakecodex.ps1` via `-CodexExecutable`).

## Files to Change

**Dispatch note (scope lock):** each task's `-Authorized` list is the task's files as REPO-RELATIVE paths within that task's `-Worktree` (e.g. `skills/apex-code/scripts/apex-critical-files.ps1`), NOT the absolute paths shown in this table — the absolute form here is for human reading only. `codex-scope-check.ps1` compares `-Authorized` against repo-relative git porcelain paths, so the orchestrator must pass the repo-relative form per task (as steps 2/2.5 did); passing the absolute display paths verbatim would flag every edit out-of-scope (exit 65/66).

| File | Operation | Notes |
|------|-----------|-------|
| `C:\Users\User\.claude\skills\apex-code\scripts\apex-critical-files.ps1` | create | Task 1 — the single two-tier classifier (`-Test -Paths`), hard-block vs critical; cites governance § Hard blocks + § Critical files |
| `C:\Users\User\.claude\skills\apex-code\scripts\critical-files-test.ps1` | create | Task 2 — loud-fail suite for the classifier (every category + tier + non-matches) |
| `C:\Users\User\.claude\skills\apex-code\scripts\codex-dispatch.ps1` | modify | Task 3 — `-CriticalFilesConfirmed`/`-CriticalFilesConfirmedNote`/`-CriticalFilesScript` params, Layer-B refusal (exit 76, two-tier, scope-unlocked + missing-classifier fail-closed), `Get-ModelFamily` + `$coderModel` before the ledger row, ledger family + confirmation fields |
| `C:\Users\User\.claude\skills\apex-code\scripts\dispatch-criticalfile-test.ps1` | create | Task 4 — loud-fail dispatch suite for exit-76 (critical/hard-block/scope-unlocked/missing-classifier), the confirmed-proceeds path, and the family ledger fields |
| `C:\Users\User\.claude\skills\apex-code\scripts\dispatch-test-fakecodex.ps1` | run only — not modified | Task 4 — the fake coder the suite drives via `-CodexExecutable` |
| `C:\Users\User\.claude\skills\apex-code\scripts\apex-family-gate.ps1` | create | Task 5 — the executable #7 completion gate; reads the ledger, exits pass/refuse |
| `C:\Users\User\.claude\skills\apex-code\scripts\family-gate-test.ps1` | create | Task 6 — loud-fail suite for the family gate (cross-family pass, same-family refuse, diff-bound human review, terminal-status semantics) |
| `C:\Users\User\.claude\skills\apex-code\SKILL.md` | modify | Task 7 — Layer-A pre-dispatch step, exit-76 row, the #7 completion step that CALLS `apex-family-gate.ps1` + the in-session/human-review record shape, cross-family reword; version bump |
| `C:\Users\User\.claude\skills\apex-governance\SKILL.md` | modify | Task 8 — critical-file two-tier / two-layer mechanism note, cross-model review reworded to the achievable policy; version bump |
| `C:\Users\User\.claude\agents\apex-reviewer.md` | modify | Task 9 — one note: advisory only; a same-family review cannot by itself satisfy the cross-family completion gate |
| `C:\users\user\apex\SKILL-HISTORY.md` | modify | Task 10 (tree: `~/apex`) — one row each for the apex-code and apex-governance edits |

## Tasks

- [ ] **Task 1: The single two-tier critical-file classifier `apex-critical-files.ps1`** — files: `C:\Users\User\.claude\skills\apex-code\scripts\apex-critical-files.ps1`
  Windows PowerShell 5.1. The ONE executable home of the pattern set (Layer A, Layer B, and any consumer call it; no second copy). `-Test` mode: `apex-critical-files.ps1 -Test -Paths @('a/b.py',...)` normalises each path (backslash→forward-slash, lowercase, trim leading `./`) and classifies it. OUTPUT: print `HARDBLOCK <path>: <category>` for each TIER-1 match and `CRITICAL <path>: <category>` for each TIER-2 match. EXIT: **11** if any TIER-1 match (dominates — a hard-block wins over a critical match); else **10** if any TIER-2 match; else **0**. Header comment: source is `apex-governance` § Hard blocks (§77) + § Critical files (§100-103); a divergent second copy fails open, so there is exactly one; the integrity sweep (audit #11) reconciles this file against governance. TIGHT categories (governance-complete): `.env`, migrations, auth/crypto (prefix), hooks, permission-settings, secret-in-path, and the `docs/audit` hard-block. BEST-EFFORT / OPEN categories (unbounded sets — common filenames enumerated, an exotic filename is a round-8 residual): CI config, infra-as-code, and dependency manifests. Match case-insensitively against the normalised repo-relative path. DIRECTORY-GRANT rule (Sol BLOCK 75, load-bearing): `codex-scope-check.ps1` trims trailing slashes and treats a directory grant as authorizing its descendants, so a bare SLASHLESS grant (`-Authorized docs/audit`) must match the same as `docs/audit/child` — EVERY directory pattern therefore ends `(/|$)`, NOT a bare trailing `/`, so it matches both the directory itself and paths under it. Patterns:
  - **TIER 1 — HARD-BLOCK (never confirmable):**
    - `audit`: `(^|/)docs/audit(/|$)` — governance §77 makes ANY modification a permanent hard block; `-CriticalFilesConfirmed` must NOT clear it. The `(/|$)` tail catches the slashless grant `docs/audit`.
  - **TIER 2 — CRITICAL (confirmable):**
    - `secrets-env`: `(^|/)(\.env|[^/]*\.env)(\.[^/]*)?$` — `.env`, `.env.local`, `.env.production`, `x.env`, `x.env.local` (governance `.env` / `*.env.*`).
    - `migrations`: `(^|/)migrations(/|$)` or `(^|/)alembic/versions(/|$)`.
    - `auth`: component-PREFIX match (Sol BLOCK 79 — masking a crypto/auth file is the dangerous direction, so the stem is broad and separators must not stop it). Split the normalised path on `/`, strip the extension from the basename component, and treat a component as an auth match when it STARTS WITH `auth`, `oauth`, `crypto`, or `middleware` followed by ANY characters INCLUDING `_`/`-` (per-component regex `^(auth|oauth|crypto|middleware)` — catching `auth`, `authn`, `authz`, `authentication`, `authenticator`, `authorization`, `auth_service`, `auth-service`, `oauth`, `crypto`, `cryptography`, `crypto-utils`, `middleware`) — EXCEPT a component that is exactly `author` or `authors`, which is NOT an auth match (so top-level `author/`, `authors.md` stay clean while `src/auth/authors.md` still matches on the `auth/` component). Any qualifying component → `auth`. Residual (documented, fail-safe toward confirmation): another English word beginning `auth`/`crypto` — rare in code paths — over-matches.
    - `ci`: `(^|/)\.github/workflows(/|$)`, or a `(^|/)\.circleci(/|$)` segment, or a basename `\.gitlab-ci\.yml`, `\.travis\.yml`, `azure-pipelines\.yml`, `bitbucket-pipelines\.yml`, or `Jenkinsfile`. Best-effort (open category, §101): the common set is covered; an exotic CI filename is a round-8 residual.
    - `deps` (BEST-EFFORT / open category — Sol BLOCK 81): a basename in the manifest set — `package.json`, `pyproject.toml`, `Cargo.toml`, `go.mod`, `go.sum`, `Gemfile`, `composer.json`, `requirements.txt`, `Pipfile`, `pom.xml`, `build.gradle`, `build.gradle.kts`, `Package.swift`, `pubspec.yaml`, `mix.exs`, `packages.config`, `Directory.Packages.props` — OR the non-`.lock` lockfiles `package-lock.json` and `pnpm-lock.yaml` — OR any basename ending `.lock` (`(^|/)[^/]*\.lock$`, covering `yarn.lock`, `poetry.lock`, `uv.lock`, `Cargo.lock`, `Gemfile.lock`, `Pipfile.lock`, `composer.lock`, and future lockfiles). Known-limits: `*.lock` may over-match a non-dependency `.lock` file (rare; fails safe toward confirmation); an exotic manifest filename is a round-8 residual.
    - `infra`: a basename ending `.tf` or `.tfvars`; a basename `Dockerfile` (optionally `Dockerfile.<x>`); `docker-compose.yml`/`docker-compose.yaml`; a `(^|/)(k8s|kubernetes)(/|$)` path segment; or a Helm `Chart.yaml`/`values.yaml` basename. Best-effort (open category): common IaC covered; an exotic IaC filename is a round-8 residual.
    - `secret-in-path`: the substring `secret` or `credential` anywhere in the normalised path.
    - `hooks`: `(^|/)hooks(/|$)`, `(^|/)\.git/hooks(/|$)`, `(^|/)\.githooks(/|$)`, or `(^|/)\.husky(/|$)`.
    - `permission-settings`: the AGENT permission settings only — `(^|/)\.claude/settings(\.local)?\.json$`, OR a repo-root `^settings(\.local)?\.json$`. Tightest sound rule: `.vscode/settings.json` and `.idea/` editor configs do NOT match by construction (neither under `.claude/` nor at root). Known-limit: a permission-settings file under another custom path is not caught.
  - done when: `-Paths @('docs/audit/log.md')` AND the slashless `-Paths @('docs/audit')` each exit **11** printing `HARDBLOCK`; `-Paths @('config/.env')` exits 10 `secrets-env`; the slashless `-Paths @('migrations')` and `-Paths @('.husky')` each exit 10; `-Paths @('src/authentication/login.ts')`, `-Paths @('src/authenticator/x.ts')`, `-Paths @('lib/cryptography/key.ts')`, `-Paths @('src/auth_service.ts')`, `-Paths @('lib/crypto-utils.ts')`, and `-Paths @('src/middleware/mw.ts')` each exit 10 `auth`; `-Paths @('.github/workflows/ci.yml')`, `-Paths @('.travis.yml')`, and `-Paths @('bitbucket-pipelines.yml')` exit 10 `ci`; `-Paths @('uv.lock')`, `-Paths @('package-lock.json')`, `-Paths @('pom.xml')`, and `-Paths @('Package.swift')` exit 10 `deps`; `-Paths @('infra/main.tf')` and `-Paths @('k8s/deployment.yaml')` exit 10 `infra`; `-Paths @('.husky/pre-commit')` exit 10 `hooks`; `-Paths @('.claude/settings.json')` exit 10 `permission-settings`; `-Paths @('.vscode/settings.json')`, `-Paths @('authors.md')`, `-Paths @('AUTHOR/notes.md')`, and `-Paths @('skills/apex-code/scripts/codex-dispatch.ps1')` each exit 0; a batch mixing `docs/audit/x.md` with a critical path exits **11** (hard-block dominates).

- [ ] **Task 2: Loud-fail classifier suite `critical-files-test.ps1`** — files: `C:\Users\User\.claude\skills\apex-code\scripts\critical-files-test.ps1`
  Accumulate-and-exit-nonzero suite (NOT print-only) that invokes `apex-critical-files.ps1 -Test -Paths @(...)` per case and asserts BOTH the exit code and, for matches, the printed tier + category. Cases:
  - TIER-1: `docs/audit/log.md` → exit 11 with `HARDBLOCK ... audit`.
  - SLASHLESS directory grants (Sol BLOCK 75): `docs/audit` → exit 11 (hard-block tier); `migrations` → exit 10 `migrations`; `.husky` → exit 10 `hooks`; `alembic/versions` → exit 10 `migrations`.
  - one TIER-2 POSITIVE per category (`secrets-env`, `migrations`, `auth`, `ci`, `deps`, `infra`, `secret-in-path`, `hooks`, `permission-settings`) → exit 10 with the expected category.
  - auth PREFIX coverage incl. separators: `src/authentication/login.ts`, `src/authenticator/svc.ts`, `src/authorization/policy.py`, `src/authz/guard.ts`, `lib/cryptography/key.ts`, `src/auth_service.ts`, `src/auth-service.ts`, `lib/crypto-utils.ts`, and `src/middleware/logging.ts` each → exit 10 `auth` (middleware + prefix stems, incl. `_`/`-` separators, MUST match — governance §100/§102).
  - dep/CI/infra extras: `.travis.yml`, `bitbucket-pipelines.yml` → `ci`; `uv.lock`, `package-lock.json`, `pnpm-lock.yaml`, `pom.xml`, `build.gradle.kts`, `Package.swift`, `pubspec.yaml`, `mix.exs`, `packages.config`, `Directory.Packages.props` → `deps`; `k8s/deployment.yaml`, `helm/Chart.yaml` → `infra`; `.husky/pre-commit` → `hooks`.
  - tier dominance: a batch `@('docs/audit/x.md','config/.env')` → exit 11 (hard-block dominates), printing both lines.
  - normalisation: `config\.env` (backslash) and `Config/.ENV` (mixed case) each → exit 10 `secrets-env`.
  - NON-match cases that must NOT trip: `skills/apex-code/scripts/codex-dispatch.ps1`, `agents/apex-reviewer.md`, `docs/status.md`, `README.md`, `.vscode/settings.json` (editor config, NOT agent settings), `.idea/workspace.xml`, the decoy `authors.md` and `AUTHOR/notes.md` (the documented auth exclusion) → each exit 0.
  - done when: all tier, slashless-grant, positive, auth-prefix, extras, dominance, normalisation, and non-match cases pass; the suite exits non-zero if any assertion fails.

- [ ] **Task 3: Layer-B refusal (exit 76) + family fields in `codex-dispatch.ps1`** — files: `C:\Users\User\.claude\skills\apex-code\scripts\codex-dispatch.ps1`
  - 3a. Add params near `$SkipBaselineCheck` (~line 36): `[switch]$CriticalFilesConfirmed`, `[string]$CriticalFilesConfirmedNote`, `[string]$CriticalFilesScript` (override for tests; empty → resolve `apex-critical-files.ps1` beside `$PSScriptRoot`), and `[string]$ReviewedRunId` (the build run_id a REVIEW dispatch covers, recorded so the family gate can bind a review to the exact build it reviewed — Sol BLOCK 127). Comments: the switch is set ONLY by `apex-code` Layer A after a real attended confirmation — a spec's `## Permissions` text does not set it; the note carries who/when for the ledger; the script override exists so the classifier-fails-to-run fail-closed path is dogfooded.
  - 3b. Define `Get-ModelFamily([string]$model)` beside the other helpers (~line 71): lowercase; return `openai` when it matches `codex` or starts `gpt`, `anthropic` when it matches `opus`/`sonnet`/`haiku`/`claude`, else `unknown`. Define `$coderModel = 'gpt-5.6-sol'` at ~line 785, immediately BEFORE the `$ledgerRow` hashtable (Sol BLOCK 97 — so the family fields compute a real value, not empty), and USE `$coderModel` in the `-m` position of the `$arguments` array (~line 938) so the launched model and the family derivation share one source.
  - 3c. Insert the Layer-B refusal as the FIRST statement inside the build guard `if ($Phase -eq 'build' -and $Sandbox -eq 'workspace-write')` (~line 659), BEFORE the `if ($SkipBaselineCheck)` branch and before the pin arms (so `exit 76` needs no pin cleanup). It runs independently of `-SkipBaselineCheck`. Sequence:
    1. Resolve `$criticalScript = if ($CriticalFilesScript) { $CriticalFilesScript } else { Join-Path $PSScriptRoot 'apex-critical-files.ps1' }`. Missing → print `[dispatch] REFUSED (exit 76): apex-critical-files.ps1 missing -- cannot verify critical-file safety` and `exit 76` (fail closed).
    2. SCOPE-UNLOCKED (Sol BLOCK 92): if `$ScopeUnlocked` (its `-Authorized` is empty by the step-2.5 mutual-exclusion) → a build with no declarable file set cannot be cleared by the classifier, so require the switch: if `-not $CriticalFilesConfirmed` → print `[dispatch] REFUSED (exit 76): -ScopeUnlocked build has no declared file set -- critical-file safety is unverifiable, pass -CriticalFilesConfirmed (attended) or park` and `exit 76`; else print a loud confirmed note and fall through (known-limit: a scope-unlocked build cannot be hard-block-checked -- round 8). Skip the classifier call (nothing to classify).
    3. Else if `$Authorized.Count -gt 0`: run the classifier fail-closed (Sol FLAG 109 + BLOCK 106 — ANY outcome that is not a clean {0,10,11} verdict, including a throw, a missing/erroring script, a script that `return`s WITHOUT `exit` (which leaves `$LASTEXITCODE` STALE at its prior value under Windows PowerShell 5.1 — a prior 0 would fail OPEN), or an uncontracted code, maps to the contracted `exit 76`, never an uncaught throw). RESET `$LASTEXITCODE` to a non-verdict sentinel FIRST so a no-`exit` classifier is detected: `$critExit = $null; $critLines = @(); try { & cmd /c exit 99; $critLines = @(& $criticalScript -Test -Paths $Authorized); $critExit = $LASTEXITCODE } catch { $critExit = $null }`. After this, `$critExit` is 0/10/11 only if the classifier actually emitted it; a `return`-without-`exit` leaves the sentinel 99 → falls to the fail-closed branch. Print each captured line.
       - `$critExit -eq 11` (HARD-BLOCK) → REFUSE ALWAYS, switch does NOT override: print `[dispatch] REFUSED (exit 76): -Authorized names a permanent hard block (docs/audit) -- not confirmable, cannot build` and `exit 76`.
       - `$critExit -eq 10` (CRITICAL) AND `-not $CriticalFilesConfirmed` → print `[dispatch] REFUSED (exit 76): -Authorized names critical file(s) and -CriticalFilesConfirmed is absent -- a spec cannot self-approve; confirm attended (apex-code Layer A) or park` and `exit 76`.
       - `$critExit -eq 10` AND `$CriticalFilesConfirmed` → print `[dispatch] critical-file edit CONFIRMED (attended) -- note: $CriticalFilesConfirmedNote` and fall through.
       - `$critExit -eq 0` → fall through.
       - ANY OTHER value (including `$null` from a throw, or an unexpected code) → print `[dispatch] REFUSED (exit 76): critical-file classifier failed to return a valid verdict (got '$critExit') -- failing closed` and `exit 76`. NO uncaught throw is left on this path.
    Comment: exit 76 = critical-file gate refused before reservation; NO ledger row, NO dispatch log (shared state dirs already exist, as with exit 72/74). Known-limit comment: a bare non-critical directory grant (`src`) authorising a critical descendant is not caught by path-classification (the scope lock permits directory grants) -- round 8.
  - 3d. In the `$ledgerRow` hashtable (~lines 786-816) add: `critical_files_confirmed = [bool]$CriticalFilesConfirmed`; `critical_files_confirmed_note = $(if ($CriticalFilesConfirmed) { $CriticalFilesConfirmedNote } else { '' })`; `builder_family = $(if ($Phase -eq 'build') { Get-ModelFamily $coderModel } else { '' })`; `reviewer_family = $(if ($Phase -eq 'review' -or $Schema -eq 'review' -or $Schema -eq 'endgate') { Get-ModelFamily $coderModel } else { '' })`; `reviewed_run_id = $(if ($Phase -eq 'review' -or $Schema -eq 'review' -or $Schema -eq 'endgate') { $ReviewedRunId } else { '' })` (the build identity this review covers — the family gate binds a review to its build via this; the build row's own identity is its existing `run_id`, and `base_sha`/`tree_pin_label` are already recorded).
  - done when (task): a workspace-write build whose `-Authorized` is a hard-block exits 76 even WITH `-CriticalFilesConfirmed`; a TIER-2-critical `-Authorized` without the switch exits 76, with it proceeds+records the note; a `-ScopeUnlocked` build without the switch exits 76; a missing/overridden-absent classifier exits 76; all refusals leave NO row and NO log and fire even under `-SkipBaselineCheck`; a non-critical build is unaffected; a build row records `builder_family:"openai"` (a real value), a review/end-gate row records `reviewer_family:"openai"`.

- [ ] **Task 4: Loud-fail dispatch suite `dispatch-criticalfile-test.ps1`** — files: `C:\Users\User\.claude\skills\apex-code\scripts\dispatch-criticalfile-test.ps1`
  Accumulate-and-exit-nonzero suite (do NOT copy `dispatch-test.ps1`'s print-only pattern). Isolate the ledger with `$env:APEX_STATE_DIR` set to a fresh temp dir OUTSIDE any repo; UNIQUE spec name per case so "no row" is checkable by counting rows for that spec in the isolated `codex-run-ledger.jsonl`. Drive the launch path with `-CodexExecutable powershell.exe -CodexExecutableArgumentPrefix ... dispatch-test-fakecodex.ps1`. Fixtures are temp `git init` with a trivially-green `AGENTS.md` recipe so only the critical-file gate is under test. Cases (assert exit code AND ledger-row count/fields):
  - HARD-BLOCK, confirmed → `-Authorized` naming `docs/audit/x.md`, WITH `-CriticalFilesConfirmed` → **76**, ZERO rows (the switch does not override a hard block).
  - CRITICAL, unconfirmed → `-Authorized` naming a critical path (e.g. `config/.env`) → **76**, ZERO rows.
  - CRITICAL, confirmed → same WITH `-CriticalFilesConfirmed -CriticalFilesConfirmedNote "attended tester"` → proceeds (not 76), row EXISTS with `"critical_files_confirmed":true` + the note.
  - CRITICAL, unconfirmed, under `-SkipBaselineCheck` → still **76**, ZERO rows.
  - SCOPE-UNLOCKED, unconfirmed → `-ScopeUnlocked -ScopeUnlockedReason "x"` (empty `-Authorized`), no `-CriticalFilesConfirmed` → **76**, ZERO rows.
  - MISSING classifier → pass `-CriticalFilesScript` pointing at a nonexistent path → **76**, ZERO rows (fail-closed dogfooded — Sol FLAG 108).
  - CLASSIFIER RETURNS AN UNEXPECTED CODE → pass `-CriticalFilesScript` pointing at a tiny stub fixture that `exit 7` (a code outside {0,10,11}) → **76**, ZERO rows (the wrap in 3c maps any non-verdict outcome to the contracted 76, never an uncaught throw — Sol FLAG 109).
  - CLASSIFIER RETURNS WITHOUT `exit` → pass `-CriticalFilesScript` pointing at a stub that `return`s (or just ends) with NO `exit`, run AFTER a case whose prior `$LASTEXITCODE` was 0 → **76**, ZERO rows (proves the sentinel reset catches the PS 5.1 stale-`$LASTEXITCODE` fail-open — Sol BLOCK 106).
  - NON-critical build → `-Authorized` naming only ordinary files → proceeds (not 76); row EXISTS with `"critical_files_confirmed":false` and `"builder_family":"openai"`.
  - REVIEW dispatch (`-Phase review -ReviewedRunId "sentinel-123"`) → not subject to exit 76; the row carries `"reviewer_family":"openai"`, an empty `"builder_family"`, AND `"reviewed_run_id":"sentinel-123"` (proves the wrapper wires `-ReviewedRunId` through to the ledger — Sol FLAG 126; a hand-built Task-6 fixture cannot cover this).
  - done when: every case holds and the suite exits non-zero on any failed assertion.

- [ ] **Task 5: The executable #7 family gate `apex-family-gate.ps1`** — files: `C:\Users\User\.claude\skills\apex-code\scripts\apex-family-gate.ps1`
  Windows PowerShell 5.1. Params: `-Spec`, `-Task`, `-WorktreeKey`, `[-LedgerPath]` (override for tests; empty → resolve the wrapper's ledger `<APEX_STATE_DIR|LOCALAPPDATA\apex|TEMP\apex>\progress\codex-run-ledger.jsonl`). NO caller-supplied base-SHA/pin — the gate DERIVES the build identity from the ledger itself, so a caller cannot point it at the wrong diff (Sol BLOCK 127). Read the ledger JSONL; select rows where `spec`, `task`, and `worktree_key` all match. COMPLETION SEMANTICS (Sol BLOCK 114a): consider only TERMINAL-SUCCESS rows — `status` in `done`, `done_with_concerns`, `success`, `adopted-done`; ignore `running`, `stalled`, `recorded`, `failed`, `blocked`.
  - SELECT THE BUILD: the SELECTED BUILD is the latest-by-`started` terminal-success `phase == 'build'` row; its `run_id` is the SELECTED BUILD IDENTITY (`$selRunId`), its `builder_family` the effective builder family (so a failed OpenAI attempt + a done Anthropic fallback resolves to the DONE Anthropic build). FAIL CLOSED (Sol BLOCK 131): no terminal-success build row, OR its `builder_family` is not a KNOWN family (`openai`/`anthropic`), OR its `run_id` is empty/whitespace → **exit 13** (cannot vouch).
  - BIND REVIEWS TO IT (Sol BLOCK 127/131): count a terminal-success `phase == 'review'` row as CROSS-FAMILY only when ALL hold — its `reviewed_run_id` is NON-EMPTY and equals the NON-EMPTY `$selRunId` (empty never matches empty), its `reviewer_family` is a KNOWN family (`openai`/`anthropic`), and that family differs from the selected build's `builder_family`. A review with `reviewer_family == 'unknown'`/empty does NOT count. A valid ATTENDED HUMAN REVIEW is a terminal-success `phase == 'human-review'` row with `attended == true` AND a NON-EMPTY `reviewed_run_id == $selRunId`.
  - DECISION / EXIT: **0** = at least one review counts as cross-family per the rule above OR a valid bound attended human review exists; **12** = the builder family is known but no such cross-family review and no valid bound human review (same-family, refuse); **13** = no valid selected build (above). Print the reason on any non-zero. Header comment states the exit contract, that unknown/empty families and empty run_ids NEVER satisfy the gate, and that it reads recorded FACTS bound to the selected build — never a live self-check, never a caller-chosen diff.
  - done when: a done openai build + a done anthropic review whose `reviewed_run_id` is that build → exit 0; a done anthropic build + done anthropic review bound to it, no human review → exit 12; the same plus a `human-review` row bound to that build's `run_id` → exit 0; a STALE done anthropic review bound to an EARLIER build's `run_id` + a later done anthropic build → exit 12 (the stale cross-family-looking review does not count for the selected build); a failed openai build + done anthropic build + done anthropic review bound to the done build → exit 12 (picks the done build); only non-terminal rows → exit 13.

- [ ] **Task 6: Loud-fail family-gate suite `family-gate-test.ps1`** — files: `C:\Users\User\.claude\skills\apex-code\scripts\family-gate-test.ps1`
  Accumulate-and-exit-nonzero suite. Build a fixture ledger JSONL in `$env:TEMP` (NOT the live ledger), one file per case (or unique spec/task keys in one file), pass it via `-LedgerPath`, and assert `apex-family-gate.ps1`'s exit. Cases mirror Task 5's done-when, PLUS: a review row with `status:"failed"` (crashed reviewer) is NOT counted → exit 12; a `human-review` row with `attended:false` does NOT satisfy → exit 12; a review whose `reviewed_run_id` does NOT match the selected build → exit 12; a review with `reviewer_family:"unknown"`/empty bound to the selected build does NOT satisfy → exit 12 (Sol BLOCK 131); a selected build with an EMPTY `run_id` → exit 13 (no valid build — empty run_id is not a valid identity, matching Task 5 / ADR-042); an UNKNOWN builder family on the selected build → exit 13.
  - done when: cross-family-bound→0, same-family-no-human→12, human-review-bound→0, stale-review-of-earlier-build→12, unbound-review→12, failed-attempt-build-ignored→12, crashed-reviewer→12, unattended-human→12, unknown-reviewer-family→12, empty-selected-run_id→13, unknown-builder-family→13, only-non-terminal→13 all hold; the suite exits non-zero on any failed assertion.

- [ ] **Task 7: `apex-code` SKILL.md — Layer A, exit-76 row, #7 gate CALLS the script, reword** — files: `C:\Users\User\.claude\skills\apex-code\SKILL.md`
  - 7a. LAYER A (pre-dispatch, interactive). In the Codex-dispatch / pre-flight area add a step: before dispatching a build task, classify the task's `-Authorized` with `powershell.exe -NoProfile -File "$env:USERPROFILE\.claude\skills\apex-code\scripts\apex-critical-files.ps1" -Test -Paths <the task's -Authorized>` (absolute path via `$env:USERPROFILE`). On exit 11 (hard-block, e.g. a `docs/audit/` edit) → REFUSE the task entirely (a permanent hard block; never build it). On exit 10 (critical): **attended** → run the governance approval gate and, on the user's real "yes", dispatch WITH `-CriticalFilesConfirmed -CriticalFilesConfirmedNote "attended <who> <when>"`; **AFK / dontAsk / autonomous** → PARK the task and surface it; do NOT dispatch. State that spec `## Permissions` text does NOT satisfy this — only a live attended confirmation does — and that Layer B (wrapper exit 76) is the mechanical backstop that ensures a switch was passed (it cannot verify the boolean's human provenance; that is Layer A's job, which is why an autonomous run parks — it has no human to say yes).
  - 7b. Add the exit-76 row to the exit-code contract table (~line 124), in code order after 75: `| 76 | refused: critical-file gate | The dispatch's -Authorized named a permanent hard block (docs/audit -- NOT confirmable) or a critical file (migration/auth/CI/lockfile/hook/settings/secret/...) with no -CriticalFilesConfirmed switch, OR a -ScopeUnlocked build passed no confirmation, OR the apex-critical-files.ps1 classifier was missing. Refused BEFORE reservation, so NO ledger row and NO dispatch log exist. Confirm attended via Layer A, or park; a hard block cannot be built at all; spec text cannot self-approve. |`.
  - 7c. #7 COMPLETION GATE — CALL the script, do not eyeball. In the Post-build section add: (i) whenever apex-code runs an IN-SESSION worker, it MUST append one annotation row to the wrapper's ledger AT the worker's COMPLETION with a TERMINAL status. RECORD = the codex run ledger JSONL `%APEX_STATE_DIR%\progress\codex-run-ledger.jsonl` (fallbacks `%LOCALAPPDATA%\apex\progress\...` then `%TEMP%\apex\progress\...`). ROW SHAPE (one compact JSON line): `{"run_id":"insession-<guid>","in_session":true,"spec":"<spec>","task":"<task>","worktree_key":"<git-root>","phase":"build"|"review"|"human-review","builder_family":"<fam>","reviewer_family":"<fam>","builder_model":"<model>","attended":<bool>,"reviewed_run_id":"<the-build-run_id-this-review-covers>","status":"done","started":"<utc-o>"}`. An in-session BUILD row (Opus fallback) sets `phase:"build"`, a fresh `run_id`, `builder_family:"anthropic"` — that `run_id` is the build identity later reviews must cite. A REVIEW row (in-session Claude reviewer) sets `phase:"review"`, `reviewer_family` (sonnet/opus → `anthropic`), and `reviewed_run_id` = the run_id of the build it reviewed (the Codex wrapper build row's `run_id`, or the in-session build row's). A human review sets `phase:"human-review"`, `attended:true`, and `reviewed_run_id` = the SELECTED build's run_id. For a cross-family Codex review dispatched through the wrapper, pass `-ReviewedRunId <build run_id>` so the wrapper records the binding itself (Task 3a/3d). APPEND with `Add-Content -LiteralPath <ledger> -Encoding utf8 -Value <json-line>`. (ii) Before marking a task/spec complete, RUN `powershell.exe -NoProfile -File "$env:USERPROFILE\.claude\skills\apex-code\scripts\apex-family-gate.ps1" -Spec <s> -Task <t> -WorktreeKey <k>` (the gate DERIVES the selected build + its identity from the ledger — no base-SHA argument to point it at the wrong diff); exit 0 → complete; non-zero (12 same-family / 13 unverifiable) → REFUSE completion, require a cross-family review OR a build-bound attended human review; **AFK → park the task**. A same-family AUTOMATED review is advisory and cannot satisfy the gate.
  - 7d. Reword the cross-family review step (~lines 286-291) from any "always" phrasing to the achievable policy: cross-family when both families are available; on the same-family fallback, a diff-bound attended human review substitutes (ADR-042), enforced by `apex-family-gate.ps1`. Note the wrapper hardwires `gpt-5.6-sol`, so every wrapper dispatch is `openai` and the family fields describe what it launched.
  - 7e. Frontmatter: bump `version: 2.7.0` → **`2.8.0`** and `last_updated` to `2026-07-17`. Keep the file ≤ 500 lines. — done when: SKILL.md carries the Layer-A step (hard-block refuse / critical confirm / AFK park), a 76 row, the #7 completion step that RUNS `apex-family-gate.ps1` + the record shape, the reworded cross-family policy, and frontmatter 2.8.0 / 2026-07-17.

- [ ] **Task 8: `apex-governance` SKILL.md — two-tier / two-layer mechanism + achievable cross-family** — files: `C:\Users\User\.claude\skills\apex-governance\SKILL.md`
  - 8a. In the `## Critical files` section (~lines 98-115) keep the prose list as canonical and add: the set is mechanised in `apex-critical-files.ps1` (one executable home) in TWO TIERS — the § Hard blocks `docs/audit/` entry is TIER-1 (never confirmable, refused outright), the rest are TIER-2 (confirmable) — enforced in TWO LAYERS: `apex-code` Layer A (interactive; hard-block refuse, critical confirm attended, park when unattended) and the wrapper's Layer B (exit 76, fail closed). "An authorising spec does not settle it" is now enforced by the `-CriticalFilesConfirmed` switch, which only Layer A sets after a live attended "yes" (ADR-042).
  - 8b. In `## Evaluator independence` / Cross-model review (~lines 143-153), reword the `reviewer family ≠ builder family` invariant to the achievable policy: cross-family when both families are available; on the same-family fallback (Codex quota-out → Opus builds → Codex unavailable → same-family Claude review), a diff-bound attended human review substitutes, enforced at completion by `apex-family-gate.ps1`; a same-family automated review is advisory only; AFK → park (ADR-042).
  - 8c. Frontmatter: bump `version: 2.0.0` → **`2.1.0`** and `last_updated` to `2026-07-17`. Keep ≤ 500 lines. — done when: the Critical-files section names the two-tier/two-layer mechanism and the switch, the cross-model section states the achievable policy and names the gate script, and frontmatter shows 2.1.0 / 2026-07-17.

- [ ] **Task 9: `apex-reviewer.md` — advisory + same-family note** — files: `C:\Users\User\.claude\agents\apex-reviewer.md`
  Add one short prose note (no frontmatter change): this reviewer is advisory and runs `model: sonnet` — cross-family versus a Codex (openai) build, but SAME family as an Opus build; a same-family review cannot by itself satisfy the cross-family completion gate (`apex-family-gate.ps1`, ADR-042), so on the Opus-fallback path a cross-family review or a diff-bound attended human review is still required. — done when: `apex-reviewer.md` carries the note and its `tools`/`model` frontmatter is otherwise unchanged.

- [ ] **Task 10: SKILL-HISTORY rows (tree: `C:\users\user\apex`)** — files: `C:\users\user\apex\SKILL-HISTORY.md`
  Add TWO rows at the top of the row list (newest first, columns `Date | Skill | Files | Version | Event | What Changed | Sources`), both dated `2026-07-17`:
  - `apex-code` · SKILL.md · `2.8.0` · `updated` · two-tier two-layer critical-file confirmation (Layer A interactive + wrapper Layer B exit-76 sharing apex-critical-files.ps1; docs/audit is a never-confirmable hard block) and the #7 executable family gate (apex-family-gate.ps1, run at completion, diff-bound human-review substitute); exit-76 added to the contract; cross-family reworded to the achievable policy · Sources: docs/technical/adr/ADR-042-critical-file-confirmation-and-achievable-cross-family.md.
  - `apex-governance` · SKILL.md · `2.1.0` · `updated` · critical-file section names the two-tier/two-layer mechanism + the -CriticalFilesConfirmed switch; cross-model review reworded to cross-family-when-available with a diff-bound attended-human-review substitute on same-family fallback · Sources: docs/technical/adr/ADR-042-critical-file-confirmation-and-achievable-cross-family.md.
  - done when: both rows exist above the current newest row, with all seven columns; versions match Tasks 7-8 (2.8.0, 2.1.0).

## Wave plan
Wave 1: [Task 1, Task 8, Task 9] | Wave 2: [Task 2, Task 3] | Wave 3: [Task 4, Task 5] | Wave 4: [Task 6, Task 7] | Wave 5: [Task 10]

<!-- DAG: Task 1 (classifier) feeds Task 2 (its suite), Task 3 (Layer B calls it), Task 7 (Layer A docs
     it). Task 3 (family fields in the ledger) feeds Task 5 (the family gate reads them) and Task 4.
     Task 5 (gate script) feeds Task 6 (its suite) and Task 7 (which runs it). Tasks 8/9 (governance +
     reviewer docs) are dependency-independent and ride Wave 1. Task 7 rides Wave 4 so the gate script
     it names already exists. Task 10 (SKILL-HISTORY) records the Tasks 7-8 versions -> Wave 5.
     TREE SERIALISATION: Tasks 1-9 all write the ONE ~/.claude worktree, so the dispatcher's
     one-worktree rule (exit 71, ADR-028) serialises them -- apex-code runs them one at a time in the
     shared worktree, in listed within-wave order (file-disjoint, so order is free). Task 10 writes the
     SEPARATE ~/apex tree and may ride in parallel with the ~/.claude stream; it is in Wave 5 only
     because it records the final versions. A task that falls back to an in-session Opus worker still
     respects this serialisation -- same worktree, one coder at a time. -->

**Cross-family wave reviews (BLOCK = stop the build).** In addition to the whole-spec `cross_model_review`, run three mid-build cross-family reviews on the safety-critical pieces (matching step-2 / step-2.5 discipline). After Task 1 lands → review `apex-critical-files.ps1` — lens: a classifier that fails OPEN or misdrops a governance category is the entire risk; verify no path that should match escapes, that the enumerated-auth-stems refinement still catches `authentication`/`authorization`/`middleware`, and the tier signalling (exit 11 hard-block dominates, 10 critical, 0 clean). After Task 3 lands → review the `codex-dispatch.ps1` diff — lens: fail-open paths and phantom state in the Layer-B refusal; verify exit 76 fires before reservation and before the pin arms, the hard-block-not-overridable and scope-unlocked and missing-classifier fail-closed branches, independence from `-SkipBaselineCheck`, and that `$coderModel`/`Get-ModelFamily` sit before the ledger row so the family fields are non-empty. After Task 5 lands → review `apex-family-gate.ps1` — lens: the terminal-status/completion semantics (a failed or non-terminal row must not satisfy the gate) and the build-identity binding (every counted review and human-review must cite the SELECTED build's `run_id` via `reviewed_run_id`; a stale cross-family-looking review of an EARLIER build must not pass, and the gate must derive the build from the ledger, not a caller-supplied SHA). A BLOCK verdict stops the build until resolved; the reviewer is cross-family to the builder (Codex-built → Claude review).

## Permissions
The following actions will run autonomously during build. Approving this spec approves all of them.

> **Critical harness/safety files, attended.** `codex-dispatch.ps1`, `apex-critical-files.ps1`,
> `apex-family-gate.ps1`, and the SKILL/agent files under `C:\Users\User\.claude\skills\` and
> `C:\Users\User\.claude\agents\` are harness SAFETY / governance files. This batch was approved by the
> user **attended on 2026-07-17**. If any task would run unattended (AFK/dontAsk), STOP and re-confirm —
> spec text alone does not settle a critical-file edit.
>
> **Self-reference check (Layer B).** No task's `-Authorized` in this spec matches the classifier's
> hard-block or critical tiers — every edit is under `skills/apex-code/`, `skills/apex-governance/`,
> `agents/`, or the `~/apex` docs, none of which is a `.env`, migration, auth/crypto/middleware source,
> CI config, dependency manifest/lockfile, infra-as-code, hook, the agent `settings.json`,
> secret/credential path, or a `docs/audit` file. So Layer B (exit 76) requires no `-CriticalFilesConfirmed`
> for this build; the attended harness-safety approval above is the separate human gate that applies. If a
> task is later added whose `-Authorized` matches TIER-2, dispatch it with `-CriticalFilesConfirmed
> -CriticalFilesConfirmedNote "attended 2026-07-17"`; a `docs/audit/` edit is a hard block and cannot be built.
>
> **Two trees, no commits.** The build leaves BOTH trees dirty; staging and commits are host-side and
> approval-gated (see § Git). Each task's edits stay inside the tree that owns its files — Task 10 →
> `C:\users\user\apex`, all others → `C:\Users\User\.claude`.

### File Operations
| Action | Paths |
|--------|-------|
| Create | `C:\Users\User\.claude\skills\apex-code\scripts\apex-critical-files.ps1`, `C:\Users\User\.claude\skills\apex-code\scripts\critical-files-test.ps1`, `C:\Users\User\.claude\skills\apex-code\scripts\dispatch-criticalfile-test.ps1`, `C:\Users\User\.claude\skills\apex-code\scripts\apex-family-gate.ps1`, `C:\Users\User\.claude\skills\apex-code\scripts\family-gate-test.ps1` |
| Modify | `C:\Users\User\.claude\skills\apex-code\scripts\codex-dispatch.ps1`, `C:\Users\User\.claude\skills\apex-code\SKILL.md`, `C:\Users\User\.claude\skills\apex-governance\SKILL.md`, `C:\Users\User\.claude\agents\apex-reviewer.md`, `C:\users\user\apex\SKILL-HISTORY.md` |
| Delete | (none) |

### Commands
| Command | Purpose |
|---------|---------|
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File skills\apex-code\scripts\critical-files-test.ps1` | Task 2 verify (run from `~/.claude`; Windows PowerShell 5.1 — `pwsh` is not on PATH) |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File skills\apex-code\scripts\dispatch-criticalfile-test.ps1` | Task 4 verify (drives the fakecodex helper; isolates the ledger via `APEX_STATE_DIR`) |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File skills\apex-code\scripts\family-gate-test.ps1` | Task 6 verify (fixture ledgers via `-LedgerPath`) |
| `git init` / `git add` / `git commit` **in throwaway temp repos** | Tests seed fixture repos (NOT the live trees; temp fixtures sit outside the worktree snapshot) |

### Git Operations
| Operation | Scope |
|-----------|-------|
| `git add` | Host-side only, after review — `git add -f` the new/changed harness files by name in `~/.claude`; `git add SKILL-HISTORY.md` in `~/apex` |
| `git commit` | Host-side only, after review — no commits during the build; both trees left dirty |

### Environment Access
| Variable | Purpose |
|----------|---------|
| `APEX_STATE_DIR` | Task 4 ledger isolation (honoured by the wrapper) |
| `FAKE_CODEX_REPO` | Task 4 fakecodex driver target (as in `dispatch-test.ps1`) |

### Network
| Action | Purpose |
|--------|---------|
| (none) | No package installs; the tests execute only fixture repos' trivial recipe lines |

## Specialist Context
### Security
- Layer B is a REFUSE-only gate: it never edits the tree. Each exit-76 refusal runs before the ledger row and dispatch log exist (like exit 72/74) and before the pin arms, so it leaves no partial state. A missing/unresolvable classifier fails closed (also exit 76) — a gate that cannot run is not a pass.
- The hard-block tier is not confirmable at all: `-CriticalFilesConfirmed` clears a TIER-2 critical edit but NEVER a TIER-1 `docs/audit/` edit (governance §77). Layer A refuses a hard-block task outright.
- `-CriticalFilesConfirmed` is set only by Layer A (attended, live human). Layer B is a mechanical backstop that ensures a switch was passed; it cannot verify the boolean's human provenance — that is Layer A's job, and an autonomous run parks precisely because it has no human to confirm. Stated known-limit, not a hole.
- Exit-code coherence: exit 74 (empty `-Authorized`, ~line 645) fires before the build guard; exit 76 (first inside the guard ~line 659) and exit 72 (baseline, after) follow. 74 and 76 are mutually exclusive for a non-`-ScopeUnlocked` build (empty vs non-empty scope list); a `-ScopeUnlocked` build skips 74 and is handled by 76's scope-unlocked branch. The critical-file check precedes the baseline.
- The #7 gate reads recorded FACTS via `apex-family-gate.ps1` and counts only terminal-success rows bound to the SELECTED build's `run_id` — a failed attempt, a crashed reviewer, a review (or human review) of an EARLIER build, an unknown/empty family, or an empty run_id cannot satisfy it. It is an independence check, not a security boundary; refusal parks, never weakens.
- Stated known-limits deferred to round 8: a scope-unlocked build cannot be hard-block-checked (no file set); a bare non-critical directory grant authorising a critical descendant is not caught by path-classification alone.

### Performance
- Layer B adds one in-process regex classification of the (short) `-Authorized` array per build launch — sub-millisecond. `apex-family-gate.ps1` reads the JSONL ledger once at completion — linear in ledger size, run once per task. No extra process spawn on the coder's hot path.

### Accessibility
(none — no UI.)

## Documentation
| Doc type | File | Action |
|----------|------|--------|
| Inline | the new/modified scripts | header comments: the two-tier single-home rule, the exit-76 contract, the family mapping, the gate's terminal-status + diff-binding semantics |
| ADR | docs/technical/adr/ADR-042-critical-file-confirmation-and-achievable-cross-family.md | **already written** (this planning session) — the build NEVER touches the ADR. If reality diverges, STOP and report; do not edit the ADR mid-build. |
| Exit-code contract | apex-code SKILL.md | Task 7 — the exit table IS the wrapper's exit-code contract; the `.ps1` carries a per-site comment |
| SKILL-HISTORY | apex SKILL-HISTORY.md | Task 10 — one row each for the apex-code and apex-governance edits |

## Acceptance Criteria

**Task 1**
- [ ] Two tiers + every category → verify: `apex-critical-files.ps1 -Test -Paths` returns exit 11 with `HARDBLOCK` for a `docs/audit/` path, exit 10 with the expected category for one path per TIER-2 category (`secrets-env`, `migrations`, `auth`, `ci`, `deps`, `infra`, `secret-in-path`, `hooks`, `permission-settings`), and exit 11 (hard-block dominates) for a batch mixing a hard-block with a critical path.
- [ ] Full-word auth + tight settings + non-matches → verify: a full-word `authentication` path and a `middleware` path each exit 10 `auth`; an agent `settings.json` under a `.claude` directory exits 10 `permission-settings` while an editor `settings.json` under a `.vscode` directory exits 0; a decoy `authors.md` and an ordinary harness path each exit 0; the header names governance § Hard blocks + § Critical files as the single source.

**Task 2**
- [ ] Classifier suite is exhaustive and loud → verify: `critical-files-test.ps1` covers the hard-block tier, every TIER-2 category positive, full-word auth incl. `middleware`, the CI/lock/hook extras (`.travis.yml`, `uv.lock`, and a `.husky` hook), tier dominance, normalisation, and the editor-`settings.json` (under `.vscode`) and `authors.md` non-match decoys, and exits non-zero if any assertion fails.

**Task 3**
- [ ] Layer-B refusals (two-tier + fail-closed) → verify: a hard-block `-Authorized` exits **76** even WITH `-CriticalFilesConfirmed`; a TIER-2-critical `-Authorized` with no switch exits **76**; a `-ScopeUnlocked` build with no switch exits **76**; a missing/overridden-absent classifier exits **76** — each leaving NO ledger row and NO dispatch log, and firing even under `-SkipBaselineCheck`.
- [ ] Confirmed proceeds + family fields → verify: the TIER-2 dispatch WITH `-CriticalFilesConfirmed -CriticalFilesConfirmedNote "..."` proceeds and records `"critical_files_confirmed":true` + the note; a build row carries `"builder_family":"openai"` (a real value, from `$coderModel`/`Get-ModelFamily` defined before the ledger row) and a review/end-gate row carries `"reviewer_family":"openai"`; the `-m` launch arg uses the same `$coderModel`.

**Task 4**
- [ ] Dispatch suite → verify: `dispatch-criticalfile-test.ps1` asserts hard-block-confirmed → 76/zero-rows, critical-unconfirmed → 76, critical-confirmed → proceeds/row-with-note, `-SkipBaselineCheck`-critical → 76, scope-unlocked-unconfirmed → 76, missing-classifier (`-CriticalFilesScript` nonexistent) → 76, classifier-returns-unexpected-code (stub `exit 7`) → 76, classifier-returns-without-`exit` (after a prior exit-0 case) → 76, non-critical → proceeds/`builder_family`, and review (`-ReviewedRunId "sentinel-123"`) → not-76 with `"reviewer_family":"openai"` and `"reviewed_run_id":"sentinel-123"` recorded — isolating the ledger via `APEX_STATE_DIR` and exiting non-zero on any failure.

**Task 5**
- [ ] Executable family gate binds to the selected build → verify: `apex-family-gate.ps1` (deriving the build identity from the ledger, no caller SHA) exits 0 for a done openai build + a done anthropic review whose `reviewed_run_id` is that build, 12 for a done anthropic build + a done anthropic review bound to it with no human review, 0 when a `human-review` row bound to that build's `run_id` is added, 12 for a stale done anthropic review bound to an EARLIER build's run_id plus a later done anthropic build, 12 for a failed openai build + done anthropic build + a review bound to the done build (picks the done build), and 13 when only non-terminal rows exist.

**Task 6**
- [ ] Family-gate suite → verify: `family-gate-test.ps1` covers cross-family-bound→0, same-family-no-human→12, human-review-bound→0, stale-review-of-earlier-build→12, unbound-review→12, failed-attempt-build-ignored→12, crashed-reviewer→12, unattended-human→12, unknown-reviewer-family→12, empty-run_id→never-0, and only-non-terminal→13, exiting non-zero on any failed assertion.

**Task 7**
- [ ] Layer A + exit-76 row → verify: `apex-code` SKILL.md describes the pre-dispatch `apex-critical-files.ps1 -Test` classification (hard-block → refuse the task; critical + attended → confirm + `-CriticalFilesConfirmed`; AFK/dontAsk → park) and its exit table has a `76` row placed in code order.
- [ ] #7 gate runs the script + reword + version → verify: SKILL.md's completion step RUNS `apex-family-gate.ps1` (exit 0 → complete; non-zero → refuse/park), documents the in-session/human-review ledger record shape (with `reviewed_run_id` binding a review to its build), states the reworded achievable cross-family policy, and frontmatter shows `2.8.0` / `2026-07-17`; file ≤ 500 lines.

**Task 8**
- [ ] Governance mechanism + policy → verify: `apex-governance` SKILL.md's Critical-files section names the two-tier (hard-block vs confirmable) / two-layer mechanism and the `-CriticalFilesConfirmed` switch, the Cross-model review section states cross-family-when-available with a diff-bound attended-human-review substitute and names `apex-family-gate.ps1`, and frontmatter shows `2.1.0` / `2026-07-17`.

**Task 9**
- [ ] Reviewer note → verify: `apex-reviewer.md` carries the advisory + same-family-cannot-satisfy-the-cross-family-gate note, with `tools` and `model` frontmatter otherwise unchanged.

**Task 10**
- [ ] SKILL-HISTORY → verify: two new top rows dated `2026-07-17` for `apex-code` `2.8.0` and `apex-governance` `2.1.0`, each with all seven columns, above the current newest row.

**Cross-cutting**
- [ ] Path-scoped diffs only → verify: `git diff --stat` in `~/.claude` shows changes confined to exactly these files — `skills\apex-code\scripts\apex-critical-files.ps1`, `skills\apex-code\scripts\critical-files-test.ps1`, `skills\apex-code\scripts\codex-dispatch.ps1`, `skills\apex-code\scripts\dispatch-criticalfile-test.ps1`, `skills\apex-code\scripts\apex-family-gate.ps1`, `skills\apex-code\scripts\family-gate-test.ps1`, `skills\apex-code\SKILL.md`, `skills\apex-governance\SKILL.md`, `agents\apex-reviewer.md` — and in `~/apex` to `SKILL-HISTORY.md`. Both trees carry unrelated dirty host work — do NOT assert a repo-wide "only these files changed".

## Progress
_(Coding mode writes here — do not edit manually)_
