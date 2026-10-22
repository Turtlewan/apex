---
spec: engine-plan-parity
status: draft
autonomy_level: L2
risk: medium
# risk: medium               # optional — enum {low|medium|high}. Absent = medium, except a doc-only spec is Low unless it explicitly declares risk: high, which always wins.
# cross_model_review: true   # optional — high-stakes builds (auth / security / data). Runs an
#                              independent 2nd review by a DIFFERENT model family than the builder
#                              (family-aware: Codex-built → Claude reviews; Claude-fallback-built (Sonnet 5) → Codex reviews).
#                              Cross-family (ADR-032/034): the Claude side is `apex-critic` code mode
#                              subagent; the Codex side is headless `codex exec`. Findings are
#                              advisory, but a Codex BLOCK verdict routes exit 67 — a hard stop.
# coder_model: codex         # optional — pin this WHOLE spec to one coder. Enum {codex|sonnet}, full
#                              stop. Absent → codex (the default); sonnet pins the whole spec to the
#                              Claude fallback coder (Sonnet 5 — A1, session-79b; ADR-045).
# coder_effort: medium       # optional — Codex reasoning effort {low|medium|high|xhigh|max|ultra}.
#                              Absent → medium (default). low = trivial/mechanical; high = risk:high /
#                              auth / security / data / hard; xhigh = hardest async/eval work only;
#                              max = hardest single tasks (state migrations, IAM/auth-critical, gnarly
#                              concurrency); ultra = RARE per-task escalation above max — spawns
#                              in-model subagents, counts DOUBLE against max_parallel_codex, not for
#                              routine use pending head-to-head eval vs max (ADR-030).
max_parallel_codex: 3
# max_parallel_codex: 2      # optional — cap on concurrent `codex exec` subprocesses per wave
#                              (ADR-028). 1 = sequential. Absent → **2** (A2, session-79b; ADR-028 as
#                              amended). Formula min(4, floor(cores/2)−1) documented for reference only.
#                              Machine-protection, not a quota cap.
# declared_runtime_paths:    # optional — repo-relative paths this build depends on at RUNTIME that
#   - path/to/runtime/asset  #   git may not track; the dispatch pre-flight checks DECLARED paths only
#                            #   (a check cannot discover an undeclared invisible dependency).
---

# Spec: Engine task-heading and verification parity
<!-- Governing contract: skills/apex-code/references/spec-contract.md (the validator's contract doc owns the version; never restate a number here). -->

**Identity:** Align Engine task declarations with validator headings, scope coder verification to task checks, and mark the template scope check as HOST-only.
<!-- Optional, on its own line: → why: see docs/technical/adr/ADR-NNN-*.md (a pointer, never the content). -->

<!-- A spec is an EXECUTION SCRIPT, not a design doc: rich on the *what* (exact files,
     copy-paste-ready detail, per-task verify), stripped of the *why*. The coder executes against
     frozen acceptance criteria; build-changing judgment is resolved in planning, not the build. Spec-authoring rules:
     - No why inline. Litmus when tempted: does it change what gets built? No → cut it
       (home = ADR / planning discussion). Yes → don't add the why, make the *what* explicit.
     - List files per task — every task names its exact files (see ## Tasks). Never "update the auth flow."
     - Cross-cutting conventions live in the relevant skill's impl.md, never copied into the spec. -->

<!-- Split rule: if this spec touches >3 files OR has >2 logical phases, split it into separate specs,
     unless it is doc-only as defined in Intent. Explicit `risk: high` overrides this exemption. -->

## Intent

- **Intent:** Validator-accepted coder headings reach Engine planning; Engine coders execute only their own tagged checks while integrated verification stays authoritative.
- **Invariants:** Preserve current-form declaration bytes and last-match completion extraction; HOST/OWNER declarations bound coder bodies; missing or malformed verify recipes still refuse planning; existing frozen plans remain untouched.
- **Non-goals:** Shared-file chains (3b-2), validator edits, dispatch-pack.md edits, wrapper/manual prompt edits, and apex-engine.ps1 edits.

## Assumptions
<!-- The plan fills this. The build verifies each item before executing. -->
<!-- Format: assumption → impact if wrong (Stop | Caution | Low) -->
- The build root is the checkout/worktree each task is dispatched into. Resolve every build-repo path below from that root, including linked worktrees; never require cwd to equal the execution manifest's repo value. Only that value and HOST bookkeeping targets are absolute. → impact: Stop
- Get-EngineTaskDeclarations and New-EnginePrompt are defined in skills/apex-code/scripts/engine-plan.ps1; engine-plan-test.ps1 supplies Assert-Case, New-Fixture, New-SpecText, and the real-validator seam. → impact: Stop
- The live dispatch-pack.md autonomy clause contains the case-sensitive substring `run the verify recipe` exactly once. Count it at prompt generation and refuse on zero or multiple matches; do not change the reference. → impact: Stop
- The existing § Verify Two cadences paragraph is one physical line and skills/apex-code/SKILL.md has exactly 500 lines. Replace only that paragraph line; retain frontmatter and the rest of the file. → impact: Stop
- HOST runs the build root's complete AGENTS.md verify fence natively after integration. Coders run only their own task-labelled tagged blocks below; the Git-backed planner regression suite and engine-test.ps1 are HOST-native only. → impact: Stop
- HOST records pre-existing dirty paths in both repositories before dispatch. Coders perform no Git operations; Engine integration commits are build mechanics. → impact: Stop
- Split waiver A4 applies: four build files, three small file-disjoint coder tasks, one logical phase and one wave; two build files are documentation/test files. HOST bookkeeping is separate from the coder manifest. → impact: Low

Simplicity check: one planner change with its existing regression file; two one-anchor prose edits; no new files, helpers shared across tasks, validator changes, or extra logical phases.

## Prerequisites
<!-- Build-load-bearing for cross-spec parallelism (ADR-029) and the unattended drain (ADR-049): two
     specs run concurrently only when BOTH dependency-independent (this list, transitive) AND
     file-disjoint (their ## Files to Change don't intersect). Give each shared file ONE owning spec
     and list that spec here, rather than co-editing it from two specs.
     After stripping HTML comments, Prerequisites non-blank lines are absent with no edges when the section is missing; otherwise they are exactly one line of `none`, `(none)`, or `None`, or every line is `- ` plus a backticked spec name matching `^[a-z0-9][a-z0-9-]{0,62}$`, optionally followed by ` - <free text>` or ` — <free text>`.
     Example list:
     - `first-spec`
     - `second-spec` — provides the shared helper
     Environment setup belongs in ## Assumptions, not here. -->
none

## Files to Change
| File | Operation | Notes |
|------|-----------|-------|
| skills/apex-code/scripts/engine-plan.ps1 | modify | Task 1: declaration extraction and Engine-only prompt verification/autonomy |
| skills/apex-code/scripts/engine-plan-test.ps1 | modify | Task 1: heading, boundaries, prompt, drift, and retained recipe-refusal regressions |
| skills/apex-orchestrate/templates/spec-template.md | modify | Task 2: HOST-only scope-check comment |
| skills/apex-code/SKILL.md | modify | Task 3: replace the Two cadences paragraph line; exactly 500 lines |
| C:/Users/User/apex/SKILL-HISTORY.md | modify | Task 4 (HOST), H1: apex-code and apex-orchestrate rows |
| C:/Users/User/apex/CHANGELOG.md | modify | Task 5 (HOST), H2: Unreleased Changed bullet |

## Execution manifest
<!-- Include one entry per coder task. HOST/OWNER tasks stay outside the manifest.
     ## Wave plan remains human-readable, while manifest depends_on dependencies are authoritative to the Engine. -->
```json apex-manifest
{
  "version": 1,
  "repos": { "claude": "C:/Users/User/.claude" },
  "tasks": [
    { "id": "1", "repo": "claude", "files": [{ "path": "skills/apex-code/scripts/engine-plan.ps1", "op": "modify" }, { "path": "skills/apex-code/scripts/engine-plan-test.ps1", "op": "modify" }], "depends_on": [] },
    { "id": "2", "repo": "claude", "files": [{ "path": "skills/apex-orchestrate/templates/spec-template.md", "op": "modify" }], "depends_on": [] },
    { "id": "3", "repo": "claude", "files": [{ "path": "skills/apex-code/SKILL.md", "op": "modify" }], "depends_on": [] }
  ]
}
```

## Tasks
<!-- Every task names its exact files — never "update the auth flow" (forces the worker to explore = context cost + scope creep; the file list is also the wave grouping + scope lock). -->
- [ ] **Task 1** — Align Get-EngineTaskDeclarations and New-EnginePrompt, and update planner regressions — files: skills/apex-code/scripts/engine-plan.ps1, skills/apex-code/scripts/engine-plan-test.ps1 — done when: Task 1's tagged checks pass and all listed regression cases are implemented in engine-plan-test.ps1.

  In Get-EngineTaskDeclarations, replace the checkbox/post-bold-dash-only matcher with a line scan using the validator's exact `$taskDeclarationRegex` pattern and CultureInvariant options:

  ```text
  ^\s*(?:[-*+]|\d+[.)])\s+(?:\[[ xX]\]\s+)?\*\*\s*(?<Title>Task\s+(?<Id>[0-9]+[A-Za-z]?)(?=\b).*?)\*\*
  ```

  Track the exact Tasks H2 section and fence state across the LF-normalized document, using the validator's fence opener/closer rules (backticks or tildes, up to three leading spaces, same closing character, at least opener length, whitespace-only closer suffix). Section transitions use `^##\s+(.+?)\s*$` at column 0 outside fences (the validator's rule); the Tasks section is the one whose captured title equals `Tasks` exactly (ordinal). A fenced H2 is not a section transition. Recognize declarations only outside fences within Tasks. Keep original body bytes, including fenced payload; fenced declarations never create boundaries.

  Record each recognized declaration's offsets, title and lowercase ID before filtering. Bound each body at the next recognized declaration, including titles containing the exact case-sensitive token `(HOST)` or whole word `OWNER`, or the end of the Tasks section. Apply the validator's case-sensitive HOST/OWNER classification to the bold title; exclude those declarations from the returned coder map after boundary calculation. Lowercase `owner`, `HOMEOWNER`, and `(HOSTILE)` remain coder titles.

  For a coder declaration, remove the leading `Task` plus ID from Title, trim leading spaces/tabs, ASCII hyphen, U+2013, U+2014, colon and period from the title remainder, and prepend any nonempty remainder to the declaration body. Immediately after the closing bold marker, consume optional horizontal spacing and one ASCII/en/em-dash declaration separator with its following horizontal spacing when present; otherwise remove only the horizontal spacing before the same-line body. Never strip additional body punctuation. Join title remainder/body with a single space only when both are nonempty. Preserve continuation lines and existing trailing-LF trimming. For current `- [ ] **Task N** - text` declarations (including en/em-dash separators), Text and DoneWhen remain byte-identical. This guarantee covers only the bare `**Task N**` + separator form; bold titles with extra text before the closing `**` (e.g. `**Task 1 (modify)** - text`) intentionally now keep that text in the task text, and test item 2 fixtures cover only the bare form. Keep the existing done-when regex and selection of its last match within that bounded coder task text.

  In New-EnginePrompt, count case-sensitive ordinal occurrences of the exact substring `run the verify recipe` in `$Template.Autonomy`. If the count is not exactly one, throw a clear planning error naming live dispatch-pack.md autonomy drift and the expected exact-once substring; Get-EnginePlan returns a refusal with no executable waves. Replace that one occurrence with `run only this task's tagged checks (never the repository verify recipe)` in a local Engine-only string and add that string to Constraints. Do not mutate `$Template.Autonomy` or the live template.

  In Get-EnginePlan, explicitly wrap the per-task loop assigning `$task.prompt = New-EnginePrompt ...` and `$task.prompt_digest` in `try { ... } catch { return New-EngineRefusal -Reason $_.Exception.Message -Spec $planSpec }`; the existing try/catch around verify-fence/template loading does not cover that loop. New-EnginePrompt itself still throws when the count is not exactly one; test item 5 must retain both the direct throw assertion and the Get-EnginePlan refusal assertion with no executable waves.

  Replace the old Verify-line-plus-fence append with exactly one of these lines, selected by whether the current task's acceptance_checks collection is nonempty (a missing property or empty collection selects the second):

  ```text
  - Verify: run only this task's tagged checks above; do not run the repository verify recipe (the Engine runs it after integration).
  - Verify: this task has no tagged checks; do not run the repository verify recipe (the Engine runs it after integration).
  ```

  Keep each task's existing tagged fence body verbatim above this line. Do not append VerifyFence to the prompt. Retain the VerifyFence parameter, Get-EngineVerifyFence planning read, recipe grammar lockstep block, and all missing/malformed/unsupported recipe refusals. The Engine-injected parts of the prompt (the Constraints autonomy clause after replacement and the Verify line) must contain neither `run the verify recipe` nor `run the exact build-repo recipe commands`; New-EnginePrompt no longer appends VerifyFence. Task text, acceptance text and tagged check bodies are still copied verbatim, even if they quote either string. Keep the existing prompt_digest calculation over the final prompt; new prompt bytes produce new digests. Do not rewrite stored/frozen plans or existing run artifacts.

  In engine-plan-test.ps1, add cases through Assert-Case and existing fixture helpers; keep production edits and these regressions in this task:

  1. Table-drive every bullet family (`-`, `*`, `+`, `1.`, `1)`), absent/present/checked checkboxes, leading whitespace, whitespace inside the opening bold marker, ID letter suffix, in-bold title (`- [ ] **Task 1 - Title.** body`), and post-bold ASCII/en/em-dash forms. Each valid full-spec fixture must pass the real validator and Get-EnginePlan, with the expected text/completion, and must never refuse with `task declaration is missing for manifest task 1`. Keep required files markers on declaration lines and criteria aligned with the fixture IDs.
  2. Compare current-form Text and DoneWhen byte-for-byte against pre-change expectations, including body-leading punctuation after the single declaration separator, continuation whitespace, LF joining, and the last of multiple completion markers. For equivalent heading forms with identical extracted text, assert byte-identical generated prompts. Against the old current-form prompt expectation, allow only the prescribed Verify/autonomy substitutions and removal of the appended recipe; assert all other prompt bytes unchanged.
  3. Interleave a HOST declaration between two coder declarations with a distinct HOST completion marker. Repeat with an OWNER title. Assert only the two coder IDs are dispatched, the first coder's Text/prompt excludes HOST/OWNER content, its completion is its own last marker, and the second task remains intact. Test fenced declaration/H2 decoys and declarations outside Tasks; include backtick and tilde fences.
  4. Cover tasks with one/multiple tagged checks, an empty acceptance_checks collection, and a missing property. Assert the exact selected Verify line occurs once and only own tagged bodies are embedded verbatim. On fixtures whose own task text, acceptance text and tagged check bodies contain neither legacy substring nor recipe commands, assert recipe-command absence and absence of both `run the verify recipe` and `run the exact build-repo recipe commands` from the whole prompt. Also cover task text, acceptance text and tagged check bodies quoting those strings: preserve them verbatim and assert absence of the two strings only in the injected Constraints autonomy clause after replacement and the Verify line. Assert VerifyFence is not appended, the live autonomy clause is unchanged and the Engine-local replacement occurs exactly once.
  5. Cover missing and duplicated autonomy substrings with direct New-EnginePrompt rejection and Get-EnginePlan refusal/no waves. Use a temporary fixture or an isolated function stub restored in finally; never edit the live dispatch-pack.md. Assert prompt_digest equals Get-EngineSha256 of the changed prompt and differs from the old prompt digest for the same fixture inputs; no existing run/frozen plan is rewritten.
  6. Replace the old prompt-fence extraction assertion in the recipe-parity matrix (anchor `prompt fence differs from exact source fence`) with assertions for the new task-specific Verify line and no appended VerifyFence. Keep direct Get-EngineVerifyFence exact-fence equality and the entire refusal/classification matrix. Update `exact live-template slots commands and prompt digest`, including its duplicate final return assertions, to expect recipe-command absence and the Engine-only autonomy clause. For these whole-prompt absence assertions, explicitly use fixtures whose own task text, acceptance text and tagged check bodies contain neither recipe commands nor either legacy substring (`run the verify recipe`, `run the exact build-repo recipe commands`); otherwise limit the legacy-substring assertions to the injected Constraints autonomy clause and Verify line. Retain all unrelated assertions and raw-byte recipe-grammar lockstep checks.

  Coders run only Task 1's tagged blocks. HOST runs engine-plan-test.ps1 through the native full fence after integration; coders do not launch the Git-backed fixture suite.

- [ ] **Task 2** — Annotate the template scope-check comment — files: skills/apex-orchestrate/templates/spec-template.md — done when: Task 2's tagged check passes and the existing scope criterion and command remain intact.

  At the `<!-- Scope check` comment immediately before the Scope criterion, insert the following sentence as ONE unwrapped physical line on its own line immediately before the closing `-->`, after the existing final sentence: `This is a HOST check; never place it (or any git command) in a ` followed by the inline-code span `powershell apex-accept` and ` fence.` Preserve the existing scope command, dirty-path comparison, acceptance grammar comment, and all other template content.

- [ ] **Task 3** — Replace the Verify cadence sentence on its existing paragraph line — files: skills/apex-code/SKILL.md — done when: Task 3's tagged check passes and SKILL.md remains exactly 500 lines.

  In § Verify, on the paragraph line starting `**Two cadences, both required.**`, replace only `(a) *During build:* the coder runs the repo recipe in its isolated worktree per task and iterates to green.` with `(a) *During build:* on the Engine path the coder runs only its own task's tagged checks in its isolated worktree and iterates to green; on the manual/AFK path the coder runs the repo recipe per task as today.` Keep cadence (b), the authoritative Engine/HOST adjudication text, the remaining paragraph, frontmatter and line count unchanged. Do not reflow or add lines.

- [ ] **Task 4 (HOST)** — H1: add skill-history rows — files: C:/Users/User/apex/SKILL-HISTORY.md — done when: both skill-history rows exist and name the implemented Task 1 through Task 3 changes.

  Add one dated apex-code row naming engine-plan.ps1, engine-plan-test.ps1 and the SKILL.md Verify wording; add one dated apex-orchestrate row naming the spec-template.md HOST scope comment. Use the existing table columns and current skill versions; this dispatch has no version/frontmatter bump. Sources identify engine-plan-parity. Keep these writes outside the coder manifest.

- [ ] **Task 5 (HOST)** — H2: add the changelog bullet — files: C:/Users/User/apex/CHANGELOG.md — done when: Unreleased Changed contains the engine-plan-parity entry.

  Under `## [Unreleased]` / `### Changed`, add a bullet naming heading parity, Engine-only task checks/autonomy, the retained manual/AFK recipe cadence and the HOST scope-check annotation. Keep this write outside the coder manifest.

- [ ] **Task 6 (HOST)** — H3: run integrated native verification — files: (none) — done when: every command in the build root's current AGENTS.md Verify commands fence exits zero and the planner regressions from Task 1 pass.

  Read the current verify fence from AGENTS.md at the integration build root and run it completely in native Windows PowerShell after Tasks 1 through 3 integrate. Preserve command order and test native exit codes; a nonzero code fails the check. This includes engine-plan-test.ps1 and the HOST-native-only engine-test.ps1. Do not dispatch this fence to a coder or tag it as apex-accept.

- [ ] **Task 7 (HOST)** — H4: check write scope against the build base commit and captured dirty baseline — files: (none) — done when: the four build paths and two absolute HOST bookkeeping paths are accounted for and every other path shown was already changed/dirty before this build (name them in the report).

  Run the untagged Scope criterion from each repository's appropriate root. In the build integration root, run `git diff --name-only <build base commit>` against the commit the build started from (capture it before dispatch), comparing the working tree to that commit so integration commits and uncommitted edits are included, together with `git status --porcelain -uall` for untracked files. Their union must list every build-repo path in `## Files to Change`; every other path shown must already have been changed/dirty before this build (name them in the report). In the HOST bookkeeping repository (C:/Users/User/apex), keep `git status --porcelain -uall` and account for both listed HOST files against its pre-dispatch dirty baseline. Inspect the build-file diff against the build base commit and the HOST-file working-tree diff. No coder runs a Git command; do not stage, commit, push, restore, reset, stash, or archive the spec.

## Wave plan
<!-- Required for specs with ≥3 tasks. Planning derives this from stated dependencies. The emitted
     plan is a PROPOSAL: grouping is advisory; manifest depends_on is authoritative to the Engine
     for eligible specs. HOST schedules the attended manual path for refused specs. Parallel tasks
     must be file-disjoint; risk:high runs sequentially on both paths.
     Under ADR-027 as amended (A1/ADR-045) the coder is Codex by default for every task (Sonnet 5 is the
     fallback, reached only via the three fallback triggers and handled at build time by apex-code) — emit
     the normal untagged wave plan; don't tag ▸sonnet
     proactively. Full rubric in apex-plan § Model-routing build planning. -->
Wave 1: [task 1, task 2, task 3]

All coder depends_on lists are empty; their file sets are disjoint. HOST dispatches with capacity/MaxParallel 3 and the declared max_parallel_codex 3. After this wave: Task 4 (H1), Task 5 (H2), Task 6 (H3), then Task 7 (H4); HOST tasks are outside the manifest.

## Permissions
The following NON-CRITICAL actions will run autonomously during build. Approving this spec approves all of them.
Critical paths — .env · migrations · auth/authz/crypto · CI config · dependency manifests and lockfiles · infra-as-code · secrets/keys/certs · host-state (`status.md`, root AGENTS.md, root CLAUDE.md, docs/changes/, docs/handoff/, the run ledger) · the permission settings and the hooks — are NEVER pre-authorised by this section. They need a live attended confirmation at build time, and an AFK run parks them (D3, ADR-046; apex-governance is canonical). (Sole exception: the docs agents' three host's-pen artifacts — the handoff, `status.md`, and spec archival — under D6.)
docs/audit/ is different and stricter: TIER-1, refused outright on a path match. No confirmation authorises a write there — not attended, not by any switch, not by this section. (D5's append-only exception is doctrine pending a content-aware classifier change; it is not a live permission.)

### File Operations
| Action | Paths |
|--------|-------|
| Create | (none) |
| Modify | skills/apex-code/scripts/engine-plan.ps1; skills/apex-code/scripts/engine-plan-test.ps1; skills/apex-orchestrate/templates/spec-template.md; skills/apex-code/SKILL.md; HOST only: C:/Users/User/apex/SKILL-HISTORY.md; C:/Users/User/apex/CHANGELOG.md |
| Delete | (none) |

### Commands
| Command | Purpose |
|---------|---------|
| Task-labelled tagged blocks below | Coders run only their own fast checks at the dispatched build root |
| Build root AGENTS.md Verify commands fence, verbatim | HOST-native integrated verification only, including engine-plan-test.ps1 and engine-test.ps1 |
| `git diff --name-only <build base commit>` together with `git status --porcelain -uall` | HOST-only build integration scope check, including integration commits, uncommitted edits and untracked files |
| `git status --porcelain -uall` | HOST-only scope check in C:/Users/User/apex |
| `git diff <build base commit> -- <listed-build-paths>`; `git diff -- <listed-HOST-paths>` | HOST-only review of the listed build files and HOST bookkeeping files in their respective repositories |

### Git Operations
| Operation | Scope |
|-----------|-------|
| Read-only status/diff | HOST only; no coder Git operations |
| Integration commits | Engine build mechanics only; no coder or manual commit command is authorised |

### Environment Access
| Variable | Purpose |
|----------|---------|
| TEMP | HOST-run existing planner fixture suite scratch directory |
| APEX_STATE_DIR | HOST-run existing fixture suite's isolated state; existing restoration remains intact |

### Network
| Action | Purpose |
|--------|---------|
| (none) | No network actions |

Standing scope lock: do not read, write, edit or create the planning host's status file; do not edit files outside Files to Change. Keep unrelated dirty/untracked files untouched. This spec does not authorise promotion or archival.

## Specialist Context
### Security
Keep tagged checks read-only and relative to the dispatched build root; no Git commands, absolute path literals, repository recipe, or native Engine suite in coder checks. Autonomy drift refuses planning on both zero and multiple exact occurrences.

### Performance
Coder checks use in-memory parser/prompt fixtures and small text reads only. Run the existing Git-backed planner regressions and full verify fence once through HOST-native integration verification.

### Accessibility
(none)

## Documentation
| Doc type | File | Action |
|----------|------|--------|
| Skill instructions | skills/apex-code/SKILL.md | Task 3: replace only cadence (a) on the existing paragraph line |
| Template | skills/apex-orchestrate/templates/spec-template.md | Task 2: append HOST-only scope-check comment sentence |
| History | C:/Users/User/apex/SKILL-HISTORY.md | Task 4 (HOST): apex-code and apex-orchestrate rows |
| Changelog | C:/Users/User/apex/CHANGELOG.md | Task 5 (HOST): Unreleased Changed bullet |

The skill set is unchanged; no index or ADR edit is included.

## Acceptance Criteria
<!-- Executable checks opt in only with the exact, case-sensitive info string `powershell apex-accept`
     under this Acceptance Criteria section. Checks run with integration-root cwd.
     Binding uses the immediately preceding criterion line: a leading label matching
     `^- \[[ xX]\] Task (\d+[a-z]?) -` binds to that execution-manifest task ID;
     an unlabelled criterion binds to spec level. Compound task labels and unknown task IDs,
     including HOST tasks absent from the manifest, are refused. Untagged criteria remain HOST checks.
     Tagged checks are trusted author-written, Critic-reviewed, owner-promoted spec content,
     run unsandboxed with the same trust as the AGENTS.md verify fence. The grammar guards accidents
     rather than confines execution. Tree/index movement or residue parks the run without restoration.
     Refuse whole path tokens beginning a drive-letter path (X:\ or X:/), UNC (\\), or /,
     including single- or double-quoted argument values. Quoted -match/-notmatch regex operands
     are patterns, not paths. Refuse cd, Set-Location, and Push-Location case-insensitively as
     whole command names in command position, including after operators and invocation with &;
     incidental words in arguments/strings are allowed. See the governing contract for the grammar.
     Throw on failure: PowerShell checks must throw when assertions fail. Native commands require
     explicit $LASTEXITCODE tests, e.g. `if ($LASTEXITCODE -ne 0) { throw 'native check failed' }`.
     A check's exit ends its child process, not the Engine process. -->
<!-- Use step→verify format. "Done" must be observable, not vague.
     For doc-only specs, use presence/absence greps, version/date checks, caps, pointers, and the
     exact commands in the repo AGENTS.md `## Verify commands` fence. Reserve exact-line manifests
     and whole-tree content hashes for High risk. -->
- [ ] Task 1 - Parser and prompt files parse, alternate headings preserve task boundaries, and Engine-injected verification is task-specific -> verify: run this fast in-memory check at the dispatched build root; its prompt fixtures' own task text, acceptance text and tagged check bodies contain neither legacy substring nor repository recipe commands.
```powershell apex-accept
$ErrorActionPreference = 'Stop'
foreach ($path in @('skills/apex-code/scripts/engine-plan.ps1', 'skills/apex-code/scripts/engine-plan-test.ps1')) {
    $tokens = $null; $errors = $null
    [void][System.Management.Automation.Language.Parser]::ParseFile((Join-Path (Get-Location).Path $path), [ref]$tokens, [ref]$errors)
    if (@($errors).Count) { throw ('PowerShell parse failed: ' + $path) }
}
. ./skills/apex-code/scripts/engine-plan.ps1
$canonical = Get-EngineTaskDeclarations -Text "## Tasks`n- [ ] **Task 1** - Alpha. done when: first.`n  tail`n## Other`n"
$variants = @('- [ ] **Task 1 - Alpha.** done when: first.', '* **Task 1** - Alpha. done when: first.', '+ [x] **Task 1** - Alpha. done when: first.', '1. **Task 1** - Alpha. done when: first.', '1) **Task 1** - Alpha. done when: first.')
$variants += ('- [ ] **Task 1** ' + [char]0x2013 + ' Alpha. done when: first.')
foreach ($line in $variants) {
    $decl = Get-EngineTaskDeclarations -Text ("## Tasks`n" + $line + "`n  tail`n## Other`n")
    if (-not $decl.ContainsKey('1') -or $decl['1'].Text -cne $canonical['1'].Text -or $decl['1'].DoneWhen -cne 'first.') { throw 'Heading parity failed' }
}
$fence = '```'
$fenced = Get-EngineTaskDeclarations -Text ("## Tasks`n- [ ] **Task 1** - Alpha. done when: first.`n" + $fence + "text`n- [ ] **Task 9** - Fenced decoy.`n" + $fence + "`n## Other`n")
if ($fenced.Count -ne 1 -or -not $fenced.ContainsKey('1') -or $fenced['1'].DoneWhen -cne 'first.' -or -not $fenced['1'].Text.Contains('Fenced decoy')) { throw 'Fenced declaration was not ignored as a boundary' }
foreach ($kind in @('(HOST)', 'OWNER')) {
    $source = "## Tasks`n- [ ] **Task 1** - Alpha. done when: first.`n- [ ] **Task 9 $kind** - Host payload. done when: host.`n- [ ] **Task 2** - Beta. done when: second.`n"
    $decl = Get-EngineTaskDeclarations -Text $source
    if ($decl.Count -ne 2 -or $decl['1'].Text.Contains('Host payload') -or $decl['1'].DoneWhen -cne 'first.' -or $decl['2'].DoneWhen -cne 'second.') { throw 'HOST or OWNER boundary failed' }
}
$template = [pscustomobject]@{ Surgical = ''; Scratch = '- Scratch: local'; Autonomy = 'Follow AGENTS.md; run the verify recipe, then finish.'; Final = '' }
$base = @{ Identity = 'fixture'; RepoPath = (Get-Location).Path; Intent = 'fixture'; Assumptions = 'fixture'; SpecialistContext = @(); VerifyFence = 'REPO-RECIPE-SENTINEL'; Template = $template }
$task = [pscustomobject]@{ text = 'Alpha'; done_when = 'complete'; files = @([pscustomobject]@{ path = 'fixture.txt'; op = 'modify' }); acceptance = @(); acceptance_checks = @([pscustomobject]@{ body = "Write-Output 'OWN-CHECK-SENTINEL'" }) }
$prompt = New-EnginePrompt -Task $task @base
$ownLine = "- Verify: run only this task's tagged checks above; do not run the repository verify recipe (the Engine runs it after integration)."
$noneLine = "- Verify: this task has no tagged checks; do not run the repository verify recipe (the Engine runs it after integration)."
if (@($prompt -split "`n" | Where-Object { $_ -ceq $ownLine }).Count -ne 1 -or -not $prompt.Contains('OWN-CHECK-SENTINEL')) { throw 'Own-checks prompt failed' }
$task.acceptance_checks = @()
$emptyPrompt = New-EnginePrompt -Task $task @base
$task.PSObject.Properties.Remove('acceptance_checks')
$missingPrompt = New-EnginePrompt -Task $task @base
foreach ($value in @($emptyPrompt, $missingPrompt)) {
    if (@($value -split "`n" | Where-Object { $_ -ceq $noneLine }).Count -ne 1 -or $value.Contains('OWN-CHECK-SENTINEL')) { throw 'No-checks prompt failed' }
}
# Whole-prompt absence applies here because fixture task text, acceptance text and tagged check bodies contain neither legacy substring nor repository recipe commands.
foreach ($value in @($prompt, $emptyPrompt, $missingPrompt)) {
    if ($value.Contains('run the verify recipe') -or $value.Contains('run the exact build-repo recipe commands') -or $value.Contains('REPO-RECIPE-SENTINEL')) { throw 'Repository recipe leaked into prompt' }
    if (-not $value.Contains("run only this task's tagged checks (never the repository verify recipe)")) { throw 'Autonomy replacement missing' }
}
if ($template.Autonomy -cne 'Follow AGENTS.md; run the verify recipe, then finish.') { throw 'Template object mutated' }
foreach ($bad in @('Follow AGENTS.md; finish.', 'run the verify recipe; run the verify recipe')) {
    $template.Autonomy = $bad
    $message = $null
    try { $null = New-EnginePrompt -Task $task @base } catch { $message = $_.Exception.Message }
    if ([string]::IsNullOrWhiteSpace($message) -or $message -notmatch '(?i)autonomy' -or $message -notmatch 'run the verify recipe') { throw 'Autonomy drift did not clearly refuse' }
}
```

- [ ] Task 2 - The scope comment explicitly assigns HOST and prohibits tagged Git commands; the scope command remains untagged -> verify: run this text check.
```powershell apex-accept
$ErrorActionPreference = 'Stop'
$text = [System.IO.File]::ReadAllText((Join-Path (Get-Location).Path 'skills/apex-orchestrate/templates/spec-template.md'))
$comment = [regex]::Match($text, '(?s)<!-- Scope check.*?-->').Value
$sentence = 'This is a HOST check; never place it (or any git command) in a `powershell apex-accept` fence.'
if (-not $comment.Contains($sentence)) { throw 'HOST scope comment missing' }
foreach ($block in [regex]::Matches($text, '(?ms)^```powershell apex-accept[ \t]*\r?\n(?<Body>.*?)^```[ \t]*\r?$')) {
    if ($block.Groups['Body'].Value -match '\bgit\b') { throw 'Git command in tagged template check' }
}
```

- [ ] Task 3 - The existing cadence paragraph distinguishes Engine task checks from manual/AFK recipe execution and stays on one line; SKILL.md stays exactly 500 lines -> verify: run this text and line-count check.
```powershell apex-accept
$ErrorActionPreference = 'Stop'
$lines = [System.IO.File]::ReadAllLines((Join-Path (Get-Location).Path 'skills/apex-code/SKILL.md'))
if ($lines.Count -ne 500) { throw 'SKILL.md must have exactly 500 lines' }
$paragraph = @($lines | Where-Object { $_.StartsWith('**Two cadences, both required.**') })
if ($paragraph.Count -ne 1) { throw 'Expected one cadence paragraph line' }
$expected = "(a) *During build:* on the Engine path the coder runs only its own task's tagged checks in its isolated worktree and iterates to green; on the manual/AFK path the coder runs the repo recipe per task as today."
if (-not $paragraph[0].Contains($expected) -or -not $paragraph[0].Contains('(b) *Authoritative pass:*')) { throw 'Cadence wording missing' }
```

- [ ] Task 1 - HOST regression review -> verify: engine-plan-test.ps1 contains and passes every case listed in Task 1, including the real-validator heading matrix, current-form compatibility modulo the prescribed prompt edits, HOST/OWNER boundaries, fenced/out-of-section decoys, both Verify variants, missing/duplicated autonomy refusals, prompt digests, and the unchanged recipe-refusal matrix. Whole-prompt legacy-substring/recipe-command absence uses fixtures whose own task text, acceptance text and tagged check bodies contain neither string nor recipe commands; quoted strings remain verbatim, while the injected Constraints autonomy clause and Verify line contain neither legacy substring and VerifyFence is not appended. HOST runs it through Task 6; this criterion is untagged.
- [ ] Task 2 - HOST delta review -> verify: only the sentence inside the existing scope-check comment changes; the Scope criterion, command and dirty-path instructions remain unchanged.
- [ ] Task 3 - HOST delta review -> verify: only cadence (a) on the existing Two cadences paragraph line changes; all other bytes including frontmatter and remaining paragraph text are unchanged, with exactly 500 lines.
- [ ] Task 4 - HOST skill-history coverage -> verify: C:/Users/User/apex/SKILL-HISTORY.md has one apex-code row covering Task 1 plus Task 3 and one apex-orchestrate row covering Task 2, each dated with the build date, current version and engine-plan-parity source.
- [ ] Task 5 - HOST changelog coverage -> verify: C:/Users/User/apex/CHANGELOG.md Unreleased Changed contains the entry specified in Task 5.
- [ ] Task 6 - HOST integrated verification -> verify: run every command in the current build root AGENTS.md Verify commands fence, natively and in order, checking each exit code. engine-plan-test.ps1 and engine-test.ps1 pass; no coder executes this recipe or either Git-backed suite.
- [ ] Task 7 - HOST scope review -> verify: in the build integration root compare the union of `git diff --name-only <build base commit>` and `git status --porcelain -uall` to the listed build paths and captured pre-build baseline; in C:/Users/User/apex compare `git status --porcelain -uall` to the listed HOST paths and its dirty baseline. Every listed path must appear; every other path shown must already have been changed/dirty before this build (name them in the report), without changing them.
<!-- Scope check — use THIS form, never `git diff --stat`: a newly-created file is UNTRACKED, so it
     never appears in a diff at all (and `git add` is not available — the coder may not touch the git
     index), which makes "`git diff --stat` lists exactly N files" unsatisfiable for any spec that
     creates one. `-uall` is required, or a new directory collapses to `dir/` and the file path never
     shows. The output cannot separate your writes from the repo's normal dirty state, so assert the
     LISTED paths — never a total file count.
This is a HOST check; never place it (or any git command) in a `powershell apex-accept` fence.
-->
- [ ] Scope — nothing written outside `## Files to Change` — verify: in the build integration root,
      HOST runs `git diff --name-only <build base commit>` (working tree against the commit the build
      started from, including integration commits and uncommitted edits) together with
      `git status --porcelain -uall` (untracked files). Their union must list every build-repo path in
      `## Files to Change`, and every other path shown must already have been changed/dirty before
      this build (name them in the report). In the HOST bookkeeping repository (C:/Users/User/apex),
      HOST keeps `git status --porcelain -uall`: it must list both HOST bookkeeping paths in
      `## Files to Change`, and every other path shown must already have been changed/dirty before
      this build (name them in the report). Listed paths may have been dirty beforehand.
<!-- Reachability (readiness-gate item): SPEC-LEVEL, or one line per exposed boundary — never per
     task. Name the wiring, not the mechanism. Typed client/server boundary — ROUND-TRIP test.
     deny-unknown-fields is a per-repo choice, never mandated by this slot. -->
- [ ] Reachability — HOST exercises real validator — Get-EnginePlan — New-EnginePrompt through the planner suite's valid alternate-heading fixtures whose own task text, acceptance text and tagged check bodies contain neither legacy substring (`run the verify recipe`, `run the exact build-repo recipe commands`) nor repository recipe commands; plans are allowed, coder task IDs/text/completion match expected values, prompt digests match final bytes, and prompts carry the own-checks/no-checks Verify line with neither legacy substring nor recipe commands and no appended VerifyFence. Task text, acceptance text and tagged check bodies quoting those strings remain verbatim; the absence invariant applies to the injected Constraints autonomy clause and Verify line. No typed client/server boundary is added.

## Progress
_(The build writes here — do not edit manually)_
