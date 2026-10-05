# ADR-044: Round-8 deferred fail-open designs (six decisions)

- **Status:** Accepted (D3's path-set ratified by the user 2026-07-17 — six matchers incl. root CLAUDE.md).
- **Date:** 2026-07-17
- **Refines:** ADR-041 (wrapper hardening), ADR-042 (one-shared-definition), ADR-043 (guard audit). Touches `tree-pin.ps1`, `apex-family-gate.ps1`, `apex-critical-files.ps1`, `codex-scope-check.ps1`, `codex-dispatch.ps1`, and the dispatch test fixtures.
- **Source:** round-8 four-way cross-family review — the six items cut to "Deferred — need a design decision" plus the pre-existing test-debt (`docs/research/round8-review-findings.md`, `docs/handoff/2026-07-17-session75.md`).

## Context (shared)

Six of the round-8 findings could not be closed by a mechanical fix because each names a **fail-open**: a protection that quietly does nothing, or was never wired at all. The threat model is unchanged from `harness-known-limits.md` — a **careless** coder, not a hostile one. None of the decisions below adds evasion hardening; each closes a gap a sloppy dispatch would fall through. Every decision is stated with its accepted limit, because a stated limit beats a false guarantee.

---

## D1 — tree-pin adopts the in-process digest, then fingerprints ignored entries (round-8 item 3 / K10)

> **Caveat (2026-07-31, retro-scope-check-narrowing build):** `codex-scope-check.ps1` now carries a
> SECOND exclusion class distinct from D1(d)'s runtime class — repo-root-anchored, exact-name,
> ignored-and-untracked derived caches (`$derivedCacheExclusions`), active in EVERY worktree rather
> than gated on `-RuntimeExclusionRoot`. It is deliberately NOT a blanket cache-dir class, because an
> ignored path can hide a hook. `.venv`, `node_modules/.cache`, `__pycache__` and `.coverage` are
> excluded by `tree-pin.ps1` but deliberately NOT by scope-check, recorded as
> `$derivedCacheDivergence` and enforced by the lockstep test. Three limits, plainly: (i)
> **content-blindness** — `.codex-scratch/` is excluded by NAME and its contents, including
> executable-class files, are unexamined by scope-check by design; NO current control inspects that
> content — the destructive-command guard cannot see Codex subprocess writes at all
> (`codex-scope-check.ps1:7-8`) and the review diff omits ignored files — and the gap covers EVERY
> listed exclusion, accepted pending the wave-2 out-of-repo TEMP mechanism which supersedes in-repo
> scratch entirely (primary source `docs/research/sandbox-temp-research-2026-07-30.md` § TL;DR — the
> Windows restricted token denies the profile `%TEMP%`, `TMPDIR` is unset so workspace-write ships
> with no writable temp, and the coder re-points TEMP/TMP into the worktree; corroborated by
> `docs/research/ledger-stratification-2026-07-30.md` § Cross-cutting and the `docs/status.md`
> retro-queue entry). (ii) The exclusion only bites where the repo's `.gitignore` already lists the
> name; elsewhere the status guard keeps flagging — fail-closed. (iii) Task-suffixed scratch names
> (`.codex-scratch-task2`, `.artemis-dur2-task3-tmp`) still flag. Provenance: `.codex-scratch` /
> `.apex-tmp` / `.sandbox-cache` — `docs/research/ledger-stratification-2026-07-30.md` § A2;
> `.scratch` — its § A1 cluster 2; the three tool caches — `tree-pin.ps1 $toolCacheExclusions`
> parity, not the ledger.

> **Amendment 2026-10-05 (dispatch-pipeline-fixes, owner Option 2):** a THIRD exclusion class is
> added to scope-check and tree-pin: the repo's own `## Build outputs` section, read from the HEAD
> `AGENTS.md`. A path is excluded only when it is declared there AND ignored AND untracked AND not
> host-curated; anything else keeps flagging. Tree-pin shares the class, so pin and scope-check agree.
> The parser is duplicated in both scripts (no shared helper, per the self-contained rule above) and
> guarded by a text-identity lockstep test. Rejected: global basename exclusions (an ignored name can
> hide a hook in any repo). `**` is an invalid pattern. Exclusion remains content-blind (limit (i)
> above applies to declared prefixes too). Caveat: an untracked nested `.gitignore` or
> `.git/info/exclude` can itself create the ignored precondition inside a declared prefix. Leaf
> enumeration is two-call `-uall` with the `!!` ignored rows unchanged; the scope snapshot moves to
> snapshot format 2 (older snapshots fail closed by name).

### Context

`tree-pin.ps1` `Get-PathDigest` (lines 93-117) spawns `git hash-object` per contained file when it fingerprints a dirty or untracked directory. Its enumeration is `git status --porcelain` **without** `--ignored` (line 144), so ignored files never enter the fingerprint. In `~/.claude` — a blanket `*` gitignore — most churn is ignored, so the pin is blind to nearly all of it. Adding `--ignored` naively would route `node_modules`-scale trees through per-file `git hash-object` — the exact process storm `codex-scope-check.ps1` already fixed (its lines 227-253) by switching to an in-process metadata digest.

### Decision

(a) Replace `Get-PathDigest`'s directory branch with the in-process mechanism mirroring `codex-scope-check.ps1:238-253`: enumerate `Get-ChildItem -Recurse -File -Force` sorted by `FullName`; per file fold `relPath|byteLength|LastWriteTimeUtc.Ticks`; join with `\n`, UTF-8, SHA-256, emit `dir:<hex>`; an empty directory emits `dir:empty`; enumeration errors fold `UNREADABLE|<count>`. Single leaf files keep `git hash-object` (a content hash).
(b) Change the enumeration (line 144) to `git status --porcelain --ignored=traditional`, matching scope-check's `Get-DirtySet` (its line 154).
(c) The pin-file format gains a first-line scheme tag `treepin-v2`, written by `-Pin` (writer ≈181-190) as the new first line. The readers shift accordingly: the digest read moves from line index 0 to 1 (≈217) and detail extraction from `-Skip 1` to `-Skip 2` (≈227). `-Verify` on a pin without the tag fails **closed** (exit 69) with an explicit `pin predates digest scheme v2 — re-pin` message, not the THE TREE MOVED banner.
(d) **Runtime-noise exclusion, `!!`-only, runtime-tree-scoped.** After enumerating with `--ignored`, a fixed, repo-root-anchored list is filtered OUT of the dirty set *before* digesting: `sessions/`, `projects/`, `backups/`, `jobs/`, `shell-snapshots/`, `todos/`, `file-history/`, `history.jsonl`, `.last-update-result.json`. Two guards: (1) the filter activates **only when the pinned worktree IS the session-runtime tree** — a new parameter `-RuntimeExclusionRoot <path>` (default `$env:USERPROFILE\.claude`) is compared canonically (case-insensitive) to the resolved worktree root; on any other tree there are **no exclusions ever**, so a non-runtime worktree that happens to contain an ignored `projects/x` still moves the pin. (2) The filter is a conjunction — an entry is dropped only when its porcelain XY status is `!!` (ignored) AND its normalized repo-relative path equals/descends a list entry (uniform equality-or-descendant for every entry). **Tracked and untracked-`??` rows are never dropped, whatever their path** (Sol proved a pathname-only filter would hide a tracked `projects/…/MEMORY.md` modification; keying on `!!` neutralizes that and the rename case — a rename is a tracked entry). Provenance: six of the list entries come from the session-75 exit-65 adjudication record; `jobs/`, `shell-snapshots/` (empirically observed churn — 24 snapshot files in a window), and `todos/` are accepted additions with that reasoning, low-risk once the runtime-root scoping in guard (1) bounds their effect to the live tree. Without the exclusion the host's own Bash writes `shell-snapshots/` churn during every pin→verify window on `~/.claude` (a reviewer demonstrated the resulting VOID storm).
(e) The tree-pin → scope-check cross-reference comment is **one-direction** in Wave A (added only in `tree-pin.ps1`; scope-check is read-only here). A reciprocal comment in scope-check, if wanted, is Wave B.
(f) The re-pin text is tree-pin's own stdout; `codex-dispatch` and other consumers still treat exit 69 as `tree_moved` (fail-closed, correct, unchanged) — no consumer banner claim is made.

### Alternatives rejected

- **A shared helper module** for the digest — rejected: a missing helper is itself a new fail-open surface, and these harness scripts stay self-contained. Duplicate the ~15 lines with a one-direction cross-reference comment (tree-pin → scope-check) instead.
- **Metadata digest for single files too** — rejected: a content hash is strictly stronger and cheap for a single file.
- **`--ignored` with no runtime exclusion** — rejected: it re-VOIDs every review on `~/.claude` from the host's own shell-snapshot churn (see (d)).
- **Pathname-only exclusion (not `!!`-gated)** — rejected: it would hide tracked modifications and renames under an excluded path; the `!!` conjunction is the fix.

### Consequences / limits

- The directory metadata digest (length + mtime) misses a **same-path + same-length + same-mtime but different-bytes** rewrite, and it misses **empty-directory churn inside a collapsed ignored dir** (enumeration is files-only). Both are accepted deliberately to keep the mechanism identical to scope-check's, and both are stated (correcting the looser earlier "byte-identical rewrite" wording).
- **Partial-collapse limit.** The O(1)-git-spawn guarantee holds per FULLY-COLLAPSED directory entry (the storm-scale dirs are the collapsed ones). Scattered ignored files that `git status` lists individually inside tracked directories still hash per-file — bounded, and stated.
- **Runtime-exclusion invisibility.** Churn under an excluded runtime dir (on the runtime tree only) is invisible to the pin — the same accepted class as exit-65 session-runtime adjudication.
- **C-quoted (Unicode) ignored paths — per-script difference.** scope-check C-unquotes; tree-pin remains **trim-only by design**, so a pre-existing individually-listed Unicode ignored path can digest as missing. Accepted limit, consistent with the `core.quotePath` row in `harness-known-limits.md`; the per-script difference is stated for the host-close notes.
- The partial-collapse and runtime-exclusion rows in `harness-known-limits.md` are written by the **HOST at wave close** (describing shipped behavior), not by any Wave-A spec — so Wave A stays file-disjoint and no spec asserts a limit before its code ships.
- All outstanding pins invalidate on deploy. This is the fail-**closed** direction; pins are gate-window-scoped, so the cost is a re-pin, accepted.

---

## D2 — family-gate rejects trust-marked review rows (round-8 item 6, Sol-discovered)

### Context

`codex-dispatch.ps1`'s main review path writes the completion row **before** the tree-moved branch (lines 1586-1591): a moved-tree review persists as `status:'done'` + `tree_moved:true`, then prints VOID and exits 69. `apex-family-gate.ps1` (lines 164-211) accepts any terminal-success review row, checking only `status` / `phase` / `reviewer_family` / `reviewed_run_id` — it never reads `tree_moved`, `scopeViolation`, or `encoding_violation`. So a VOID review still vouches (exit 0).

### Decision

Gate-side rejection. In the review-row acceptance loop, a `phase:'review'` row where `tree_moved` **or** `scopeViolation` is **present AND true** does not count as a cross-family review — it falls through, and if nothing else vouches the gate exits 12. **Present-and-true only:** absent / false / null fields behave exactly as today, so human-review rows and pre-field ledger rows are unaffected and the migration boundary is not re-opened.

**`encoding_violation` is deliberately NOT discounted.** A review dispatch is read-only, and the main path deliberately skips the encoding scan for read-only sandboxes (`codex-dispatch.ps1:1558-1562`). But the `-Adopt` recovery path runs the scan unguarded (`codex-dispatch.ps1:721-735`), so an adopted review row can carry `encoding_violation:true` from PRE-EXISTING tree mojibake the reviewer never touched — discounting it would refuse genuinely clean reviews. Guarding the adopt-path scan for review-phase adopts is a dispatcher edit, queued to **Wave B**.

### Alternatives rejected

- **Writer-side fix** (write a `void` status on the main path) — rejected: it does not cover historical rows already in the ledgers, and a new status token perturbs `-Adopt`'s terminal-row logic. The exit-69 at dispatch time already signals the host; the gate is the last line and must independently honor the marker.
- **Also discount `encoding_violation`** — rejected: the unguarded adopt-path scan makes it a false-VOID signal on clean reviews (see the Decision). Deferred behind the Wave-B adopt-path guard.

### Consequences / limits

- A third-party writer that omits the fields entirely bypasses the check. The only production writer (`codex-dispatch.ps1`) always writes `tree_moved`/`scopeViolation` on the main review path (lines 1588-1589).
- Rejecting on `scopeViolation` goes beyond the cited finding (`tree_moved` only): a nominally read-only review that wrote files is not a trustworthy review — same trust class, same code shape.
- Until the Wave-B adopt-path guard lands, an adopt-recovered review whose tree genuinely became double-encoded still vouches; that is the accepted cost of not refusing clean adopt reviews.

---

## D3 — host-state files become a CRITICAL category, not a prohibition (round-8 item 2) — [path-set pending user confirmation]

### Context

No "host-file cannot be authorized" predicate exists anywhere in `codex-scope-check.ps1` (verified — the W1 task said "reorder" a prohibition that was never there). A coder authorized into host state (`status.md`, its own executing spec, `AGENTS.md`) can corrupt the session's control files.

### Decision

A new category `host-state` in `apex-critical-files.ps1`. **List position is free** — the invariant is the gate OUTCOME (exit 10, confirmation required), not the category's placement or the emitted label. **Explicit anchoring**: `docs/status.md` exact on the normalized path; `AGENTS.md` root-only (normalized path exactly `agents.md`); root `CLAUDE.md` (normalized path exactly `claude.md`); `docs/changes/` and `docs/handoff/` as repo-root-anchored prefixes (`^docs/changes/`, `^docs/handoff/`, not segment-anywhere); the run-ledger by basename `codex-run-ledger.jsonl`. The script's normalization (≈67-70) is **harmonized to scope-check's** — strip REPEATED leading `./` and trailing slashes — so `././docs/status.md` and `docs/status.md/` classify. This **reuses the existing two-tier confirmation gate** (`-CriticalFilesConfirmed` / exit-76 Layer B): authorizing host state becomes a deliberate confirmed act, not impossible.

**Path-set ratified by the user 2026-07-17** — six matchers, final: `docs/status.md` (exact), root `AGENTS.md` (normalized `agents.md`), root `CLAUDE.md` (normalized `claude.md`, root-only), `^docs/changes/`, `^docs/handoff/`, basename `codex-run-ledger.jsonl`. Ready for promotion to `docs/changes`.

**The gate OUTCOME is the contract, not the label.** A path that also matches an earlier category (e.g. `docs/changes/auth-plan.md` matching auth) still exits 10 and still requires confirmation under whichever label wins. The suite asserts the outcome (exit 10) on such overlaps, and one exact-output assertion (`docs/status.md` → verbatim `CRITICAL docs/status.md: host-state`) catches wrong-path emission the suite's `.*` matching would otherwise miss.

**Governance edit in-worktree; history host-owned.** The coder records the category in the **canonical human-readable source** — the apex-governance SKILL.md Critical files section (per ADR-042, one canonical home) — and bumps its frontmatter version 2.1.0 → 2.2.0, all inside the worktree. The matching **SKILL-HISTORY.md** row lives in the ~/apex repo (outside the build worktree), so the **host** adds it at wave close (recording version 2.2.0) as bookkeeping. The stale fixture `critical-files-test.ps1` 'Non-match - status document' (≈290-294), the single status.md fixture, is **flipped** to exit 10 / host-state; the normalization positive is simply a new case (52 existing = 51 unchanged + 1 flipped; the new-case count is whatever the enumerated cases sum to).

### Alternatives rejected

- **Absolute prohibition** — rejected: it needs its own override switch, and in this harness every exemption became a hole someone walked through (`harness-known-limits.md`). Also, legitimate dispatches **do** edit `AGENTS.md` or handoff docs.
- **Putting the predicate in `codex-scope-check`** — rejected: classification is the classifier's job; scope-check stays single-purpose.

### Consequences / limits

- **(a) Directory-grant gap, NO interim mitigation.** A *directory* grant (`-Authorized docs`) still slips past literal-token classification until D6's post-hoc write classification lands (Wave B). Correcting an earlier claim: `context-cap-guard` is **not** an interim cover — it only size-caps `status.md`/`CLAUDE.md`/`AGENTS.md` and permits under-cap edits; it does not cover `docs/changes`, `docs/handoff`, or the ledger. The Intent's not-silent guarantee therefore holds only for **literal-token grants**; the directory-grant gap is stated plainly and closed by D6/Wave B.
- **(a2) Absolute-grant limitation, NO interim mitigation.** The matchers operate on repo-relative normalized tokens, and the host assembles `-Authorized` as repo-relative tokens (isolation contract X4). An **absolute-path** grant token will therefore not match the host-state matchers — a stated interim gap, closed in **Wave B** by plumbing the worktree root through the dispatcher's classifier call so absolute writes are relativized before classification.
- **(b)** No false-reject of an untouched byte-identical dirty host file: classification applies to grant tokens and writes, never to the untouched-dirty handling (`codex-scope-check.ps1:654-661`, unchanged).
- **(c) Attended-confirmation consequence.** Because host-state authorization now routes through Layer-A `-CriticalFilesConfirmed`, an unattended/AFK dispatch that tries to authorize a host-state path **refuses with exit 76 by design** — host-state edits require an attended operator. The dispatch-side SKILL.md authoring note that documents this for spec authors lands in Wave B (which edits SKILL.md anyway).
- **(d)** This spec does **not** touch `harness-known-limits.md`. All Wave-A known-limits rows — the directory-grant gap, the attended-confirmation rule, and the two D1 rows (partial-collapse, runtime-exclusion invisibility) — are written by the **HOST at wave close**, describing shipped behavior. This resolves both the unshipped-behavior staleness and the D1/D3 file-collision, keeping Wave A file-disjoint.

---

## D4 — pre-existing test-debt: realign fixtures to the wrapper's real contract (no wrapper change)

### Context

`dispatch-deadlock-test.ps1` (3 failing) and `dispatch-encoding-utf8-test.ps1` (1 failing) dispatch workspace-write builds without a non-empty scope. Correcting an earlier misstatement: `-SkipScopeCheck` does **not** clear the empty-scope refusal and never did — `codex-dispatch.ps1:805-807` does not inspect that flag for the refusal; only a non-empty `-Authorized` clears it. So the fixtures hit the empty-scope refusal, and even past it the baseline pre-flight (line 895) exits 72 because the throwaway repos have no AGENTS.md (`apex-baseline-check.ps1:255-258`) — byte-identical red against both the old and the new wrapper (confirmed in round-8 W3 and by a host run). `dispatch-test.ps1` is **green today**: the host ran it (suite exit 0, all assertions ok); the live file already resolves the dispatcher via `$PSScriptRoot` (line 8) and already sets `APEX_STATE_DIR` (line 25). Its earlier-cited failures were already fixed in the live file. The debt is therefore only the two fixture suites.

### Decision

Fix the **fixtures**, never the wrapper. Each workspace-write build dispatch in the two failing suites is armed with BOTH a non-empty `-Authorized` array (a single non-critical placeholder token suffices — the fake codex writes nothing into the repo) **and** `-SkipBaselineCheck` (so the AGENTS.md-absent pre-flight does not refuse). Any existing `-SkipScopeCheck` flags are inert once `-Authorized` is non-empty and are left in place (harmless). `dispatch-test.ps1` is **not** touched (already green). Acceptance is the two suites green against the **current** wrapper with zero wrapper edits, checked by a read-only `git diff HEAD --stat` over both wrapper scripts (the builder performs no git operations).

**Canaries dropped.** Correcting the earlier round: the spec does **not** run `review-findings-test.ps1` or `careless-coder-test.ps1` at all. `review-findings-test.ps1` (≈14-15) resolves the LIVE LOCALAPPDATA ledger, ignoring `APEX_STATE_DIR`, and rewrites it without the dispatch mutex — running it risks live-ledger corruption for zero coverage of the two target files. Acceptance is the two target suites green plus the zero-wrapper-diff check. Every target run still uses a **fresh** scratch `APEX_STATE_DIR` (one per invocation, including each of the three timed deadlock runs). The `review-findings-test.ps1` state-dir hardcode is recorded as further test debt for the host to catalogue. The two targets' pre-edit exit codes and failure names are captured into the **dispatch task report** (the builder cannot write the spec's Progress section) as the was-3-fail / was-1-fail baseline.

### Alternatives rejected

- **Relax the wrapper's empty-scope refusal or baseline pre-flight** to make the fixtures pass — rejected: both refusals are correct behavior; the fixtures encode a stale contract. Changing the wrapper to fit the tests inverts the trust relationship.
- **Edit `dispatch-test.ps1`** — rejected: it is green in the live file; both cited fixes are already present. Editing it would be a no-op at best.

### Consequences / limits

- The fixtures now encode the wrapper's real authorization + pre-flight contract, so they will track future contract changes rather than masking them.
- Arming scope adds subprocess overhead inside the deadlock suite's 60s Wait-Job window; the margin is executable — three `Measure-Command`-wrapped runs, each echoing elapsed seconds and exit code, done-when each <45s and exit 0.
- `-SkipScopeCheck` never cleared the empty-scope refusal (`codex-dispatch.ps1:805-807` does not inspect it); the non-empty `-Authorized` is what clears it. Existing `-SkipScopeCheck` flags are left in place as inert.

---

## D5 — `-SpecSourcePath`: cross-tree spec validation refuses instead of silently skipping (round-8 item 4) — WAVE B

_Decision recorded now; spec written against shipped Wave-A code per the spec-one-wave-ahead rule._

### Context

`codex-dispatch.ps1` resolves `-Spec` (a bare name) only under the build worktree (lines 907-908); when the spec lives in another repo (the APEX two-tree self-build: specs in `~/apex`, build in `~/.claude`), lines 923-925 **skip validation silently**.

### Decision

A new `-SpecSourcePath <absolute path>` param; when provided it must exist and `apex-spec-validate` runs against it (exit-72 refuse on FAIL). For build + workspace-write dispatches with neither an in-worktree spec nor `-SpecSourcePath`, **REFUSE** (exit 72) — the silent-skip branch is removed. Callers rewired: the `SKILL.md` build invocation always passes it (the host always knows the spec's real home); review invocations don't validate specs (pre-flight is build-gated) so are untouched. `-SkipBaselineCheck` keeps skipping the whole pre-flight (bootstrap escape, unchanged).

### Alternatives rejected

- **Keep the silent skip but log a warning** — rejected: a warning on a fail-open path is the pattern this whole ADR set exists to remove.

### Consequences / limits

- Every build dispatch must now know its spec's real location. The host does; a hand-run dispatch that omits both loses the build path and must use `-SkipBaselineCheck` deliberately.

---

## D6 — post-hoc critical classification of actual writes + per-attempt tree digest binding (round-8 items 1 + 5) — WAVE B

_Decision recorded now; spec written against shipped Wave-A code. Depends on D1 (in-process digest must ship first)._

### Item 1 context

`codex-scope-check`'s `Test-IsAuthorized` (616-622) gives grant tokens descendant-prefix semantics, but critical-file classification sees only the literal tokens — `-Authorized src` authorizes `src/auth/login.ps1` with no CRITICAL hit; the grant-token heuristics (extensionless → critical) both over- and under-fire.

### Item 5 context

`run_id` is the only per-attempt identity; `-ReviewedRunId` is recorded but never verified (its only use: line 1029). Two same-worktree uncommitted builds share `worktree_key` + `base_sha`, so a review of A can validate against B; `base_sha` is caller-passed verbatim, never checked.

### Decision

**Item 1:** classify the coder's **actual** writes post-hoc — at `-Check` completion the dispatcher feeds the actually-written path set to `apex-critical-files`; any CRITICAL write on a dispatch lacking `-CriticalFilesConfirmed` → a fail-closed distinct exit + a `critical_violation` ledger field; the host must adjudicate before accepting the diff. This kills the grant-token heuristics, covers files created mid-build, and lets the classifier see real full paths.

**Item 5:** (a) at build completion, record a tree fingerprint (`end_tree_digest`, computed via the D1-upgraded tree-pin mechanism) on the build row; (b) at review launch with `-ReviewedRunId`, compute the live fingerprint, **REFUSE** on mismatch with the referenced build row's `end_tree_digest` (distinct documented exit code), and record it on the review row as `reviewed_tree_digest`; (c) `apex-family-gate` compares the two recorded digests as the last-line backstop; (d) record launch-time actual `head_sha` and **warn** (not refuse) on a `-BaseSha` mismatch.

### Alternatives rejected

- **Per-file `git hash-object` for the build-completion fingerprint** — rejected: recreates the exact process storm D1 removes. The in-process digest must ship first, which is why D6 depends on D1.
- **Grant-token prefix heuristics refined further** — rejected: they cannot see mid-build-created files, and post-hoc classification of real writes subsumes them.

### Consequences / limits

- For directory grants, confirmation is post-hoc (pre-commit), not pre-flight — the human gate holds at diff-acceptance, documented as such.

---

## Wave plan

**Build isolation + uniform isolation contract (applies to all of Wave A).** Wave A edits scripts the live dispatch harness itself executes — `tree-pin.ps1`, `apex-family-gate.ps1`, and `apex-critical-files.ps1` are all invoked by `codex-dispatch.ps1` during any dispatch. Every Wave-A build therefore runs in an ISOLATED WORKTREE copy (the round-8 W3 pattern), never the live tree. The four specs share one isolation contract:

- **X1** — every Files-to-Change and task path is **worktree-root-relative** (`skills/apex-code/scripts/…`); no absolute `C:\Users\User\.claude` paths in tasks/permissions/verify. The host supplies the worktree.
- **X2** — verify commands run **from the worktree root** against the worktree's own copies (`.\skills\…`); the suites resolve scripts via `$PSScriptRoot`, so they exercise the patched copies. The builder's done-when is the specified suites green in its worktree.
- **X3** — each spec carries a **`## Host verification`** step: the host integrates the worktree diff into the live tree with no gates open, re-runs the full suites on the live tree, then (D1 only) the live-`~/.claude` smoke. Host verification is the **authoritative** acceptance gate; the builder's green is necessary, not sufficient. Host-owned bookkeeping (D3's SKILL-HISTORY.md row) also lands here.
- **X4** — the host assembles `-Authorized` grants as **repo-relative tokens** matching each spec's Files-to-Change list.

This resolves Sol's mid-wave self-mutation hazard (a v1/v2 tree-pin transition between a sibling dispatch's pin and verify, or a live classifier changing under an open gate). The Wave-A known-limits rows are written by the host at wave close, describing shipped behavior.

- **Wave A** = D1 / D2 / D3 / D4. File-disjoint by construction, specced now (`round8-d1-treepin-digest.md`, `round8-d2-familygate-void.md`, `round8-d3-hoststate-critical.md`, `round8-d4-test-debt.md`). D3 additionally owns the in-worktree apex-governance SKILL.md edit; no other Wave-A spec touches it, and none touches `harness-known-limits.md` or `SKILL-HISTORY.md` (both host-owned at wave close).
- **Wave B** = D5 / D6, plus three carve-outs surfaced by the Wave-A reviews: (i) the **adopt-path encoding-scan guard** for review-phase adopts (from D2 — stops `-Adopt` attaching `encoding_violation:true` to a clean review from pre-existing mojibake); (ii) the **SKILL.md host-state authoring note** documenting the Layer-A attended-confirmation requirement (from D3); and (iii) **plumbing the worktree root through the dispatcher's classifier call** so absolute-path writes are relativized before host-state classification (from D3's absolute-grant limitation). All land in `codex-dispatch.ps1` + `SKILL.md` + the family-gate compare; specced against **shipped** Wave-A code per the spec-one-wave-ahead rule (D6 depends on D1's digest existing).

---

## Grounding addendum (2026-07-18) — D6 mechanisms + Wave-B split

Recorded while speccing the first Wave-B pass. This addendum only records grounding + the split; it does not alter any decision above.

- **D6 item 1 needs a NEW machine-readable emission from `codex-scope-check.ps1`.** Today all of scope-check's output is `Write-Host`, and the dispatcher captures only `$LASTEXITCODE` from the scan call (dispatcher ≈1529-1530) — the actually-written path set is never available to feed the classifier post-hoc. Chosen mechanism: a new `-WrittenPathsFile <path>` parameter on scope-check's `-Check` mode that writes the post-snapshot **delta set** (the same set violations are drawn from), normalized repo-relative, one path per line. The dispatcher reads that file after the check and feeds it to `apex-critical-files`; a missing-file-after-check is **fail-closed** in the dispatcher (treated as "cannot classify" → refuse, not "nothing written" → pass).
- **D6 item 5 needs a NEW `-Digest` compute-only mode on `tree-pin.ps1`.** No CLI digest path exists today — `-Pin` always writes a pin file (≈215-217). `Get-TreeFingerprint` (≈140-191) already returns the object D6 needs; `-Digest` exposes it as a compute-only, no-write emission so the dispatcher can record `end_tree_digest` on the build row and recompute at review launch without minting a pin.
- **New exit codes reserved:** `77` = post-hoc unconfirmed CRITICAL write (ledger field `critical_violation`); `78` = review-launch tree-digest mismatch vs the referenced build row's `end_tree_digest`. (`63`/`64` also remain free; `70` is scope-check's.)
- **Wave B executes as two passes.** **B1** = D5 + the three carve-outs i/ii/iii + the four-suite run-ledger isolation test-debt, specced 2026-07-18 (`round8-b1-specsource.md`, `round8-b2-adopt-classifier.md`, `round8-b3-suite-isolation.md`). **B2** = D6, specced only AFTER B1 ships, because D6 consumes B1's classifier `-Root` interface (carve-out iii) and both new mechanisms above (`-WrittenPathsFile`, `-Digest`).
