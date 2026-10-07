---
spec: engine-recipe-parity
status: draft
autonomy_level: L2
risk: medium
coder_effort: high
max_parallel_codex: 1
---

# Spec: Engine recipe parity
<!-- Governing contract: references/spec-contract.md. -->

**Identity:** Give the Engine planner and dispatch baseline checker one byte-identical AGENTS.md recipe acceptance grammar.

## Intent
- **Intent:** The Engine planner accepts the `## Verify commands` recipes that dispatch pre-flight accepts through its Verify fallback, and places the accepted fence in each task prompt. Parity is defined for that Verify recipe; dispatch pre-flight may prefer `## Preflight commands` when present. A zero-byte AGENTS.md is outside the shared classification grammar: baseline keeps its current empty-lines parameter-binding failure and exit 1, while the planner refuses with a distinct `AGENTS.md is empty` reason.
- **Invariants:** Baseline selection, execution, exact diagnostic text per classification, and exit codes retain current behavior except for the fence-closer correction: today's baseline treats any line starting with three backticks as a closer, including ```` ```python ```` inside an open fence; the shared block closes a fence only on exactly three backticks followed by optional whitespace. A backtick line carrying an info string inside an open fence stays inside it; without a later valid closer the result is `UnclosedFence` with today's unclosed-fence diagnostic and exit 3. Shared pure functions decide heading, fence, command, and shell acceptance. Neither script accepts an empty or comment-only recipe. Planner acceptance tightens to refuse `~~~` fences, fences opened with four or more backticks, comment-only fences, prose between heading and fence, and a second fence before the next heading.
- **Non-goals:** The file-disjoint sibling `engine-build-outputs` owns Engine residue, declared outputs, teardown, and guidance. No plan-state field, recipe execution change, or skill-set change.

## Assumptions
- The build repo is `C:/Users/User/.claude` at HEAD `73d6dff`; all build-repo line anchors below refer to that commit. Stop if HEAD differs. → impact: Stop.
- PowerShell 5.1 and Git are available; the existing test scripts create isolated temporary repositories. → impact: Stop.
- The planner reports acceptance through `Get-EnginePlan.allowed`; the baseline checker exits 0 for a safe runnable fixture, 3 for an unparseable recipe, and 4 for no recipe. A zero-byte AGENTS.md is outside these recipe classifications: baseline retains its existing empty-lines parameter-binding failure and exit 1. → impact: Stop.

Simplicity check: one pure grammar block copied between two production scripts, with one focused regression suite for each.

## Prerequisites
- Specs that must be complete first: `dispatch-pipeline-fixes`, present at build-repo HEAD `73d6dff`. The file-disjoint `engine-build-outputs` sibling is not a prerequisite and may build in parallel.
- Environment setup required: run from `C:/Users/User/.claude`; preserve existing dirty files and use temporary fixture repositories.

## Files to Change
Grep evidence (re-run at `73d6dff`): `rg -n 'function Get-RecipeBlock|headingPattern|sawFence|fenceClosed|Commands =|InfoString =|function Invoke-RecipeBlock|languageTag|candidateHeadings|recipe.ParseError|recipe.Commands.Count' C:/Users/User/.claude/skills/apex-code/scripts/apex-baseline-check.ps1` finds selection/capture at `:49-158`, first-token shell selection at `:190-216`, and call-site acceptance at `:269-312`. `rg -n 'function Get-EngineVerifyFence|Verify commands section|Get-EngineVerifyFence|VerifyFence' C:/Users/User/.claude/skills/apex-code/scripts/engine-plan.ps1` finds the divergent parser at `:179-189`, prompt insertion at `:241-267`, and call site/refusal at `:613-622`. `rg -n 'function New-RawRepo|function Invoke-Checker|shell-powershell|preflight-empty|suffix-only|decoy-heading|captioned-fences|two-fences|blank-adjacent' C:/Users/User/.claude/skills/apex-code/scripts/baseline-check-test.ps1` finds fixture helpers at `:45-63` and current grammar cases at `:93-171`. `rg -n 'function New-TestRepo|function New-Fixture|function Invoke-Plan|function Assert-Case|validator real success' C:/Users/User/.claude/skills/apex-code/scripts/engine-plan-test.ps1` finds fixtures/assertions at `:26-46,201-238,284-293`. `rg -n 'dispatch-pipeline-fixes|apex-code' C:/Users/User/apex/SKILL-HISTORY.md` finds the current apex-code row at `:5`.

| File | Operation | Notes |
|------|-----------|-------|
| skills/apex-code/scripts/apex-baseline-check.ps1 | modify | Pure recipe-grammar lockstep block and unchanged baseline adapter. |
| skills/apex-code/scripts/baseline-check-test.ps1 | modify | Baseline behavior regressions. |
| skills/apex-code/scripts/engine-plan.ps1 | modify | Verbatim grammar block and planner fence adapter. |
| skills/apex-code/scripts/engine-plan-test.ps1 | modify | Byte-equality guard and two-real-script parity matrix. |
| C:/Users/User/apex/SKILL-HISTORY.md | modify | HOST: one dated apex-code history row. |

## Execution manifest
```json apex-manifest
{
  "version": 1,
  "repos": { "claude": "C:/Users/User/.claude" },
  "tasks": [
    { "id": "1", "repo": "claude", "files": [{ "path": "skills/apex-code/scripts/apex-baseline-check.ps1", "op": "modify" }], "depends_on": [], "effort": "high" },
    { "id": "2", "repo": "claude", "files": [{ "path": "skills/apex-code/scripts/baseline-check-test.ps1", "op": "modify" }], "depends_on": ["1"], "effort": "medium" },
    { "id": "3", "repo": "claude", "files": [{ "path": "skills/apex-code/scripts/engine-plan.ps1", "op": "modify" }], "depends_on": ["1"], "effort": "high" },
    { "id": "4", "repo": "claude", "files": [{ "path": "skills/apex-code/scripts/engine-plan-test.ps1", "op": "modify" }], "depends_on": ["2", "3"], "effort": "high" }
  ]
}
```

## Tasks
- [ ] **Task 1** - Baseline grammar extraction: at `apex-baseline-check.ps1:49-158,190-216,269-312` put exactly one `# BEGIN recipe-grammar lockstep` and one `# END recipe-grammar lockstep` marker line around non-empty pure functions receiving AGENTS.md lines and candidate headings. Return named result fields `HeadingFound`, `Heading`, `FenceText`, `Commands`, `InfoString`, `LanguageTag`, `FenceFound`, `FenceClosed`, `ParseError`, and `Classification`. `FenceText` is the opening fence line through the closing fence line inclusive, verbatim with leading spaces retained, joined with LF. The fixed `Classification` set is `NoHeading`, `ParseError`, `UnclosedFence`, `NoRunnableCommands`, `UnsupportedShell`, `Accepted`, evaluated in that order: no selected heading; any parse error (including heading/fence adjacency and a second fence); an unclosed fence; no fence or zero runnable commands (empty and comment-only included); unsupported first-token shell; accepted. A zero-byte AGENTS.md stays outside this grammar: preserve baseline's empty-lines parameter-binding failure at `Get-RecipeBlock -Lines $lines` and exit 1. An opening line still uses today's triple-backtick prefix match, so a four-backtick opener with a runnable command and a three-backtick closer is `UnsupportedShell` through its backtick info string. Inside an open fence, recognize a closer only when the line is exactly three backticks followed by optional whitespace; ```` ```python ```` is content, and a fence with no later valid closer is `UnclosedFence`. This closer correction is the sole baseline behavior change. Move current heading/fence scan, first-nonblank adjacency, command filtering, single-fence rule, and first-token shell mapping (including `powershell extra` → PowerShell, case folding, and tab separation) into the block without changing semantics. Keep file reads, mode choice, near-miss diagnostic, shell availability, execution, output text, and exit-code mapping outside the block; use the classification at the existing call site. For every classification, `apex-baseline-check.ps1` prints exactly today's diagnostic text and exits with today's code; in particular unsupported shell remains behind empty-command rejection, as it is today in `Invoke-RecipeBlock:196-216`. The marked block contains no filesystem reads, command invocation, host writes, or `exit`. — files: skills/apex-code/scripts/apex-baseline-check.ps1 — done when: `-Full` and `-Preflight` retain current behavior and the marked pure block decides the complete acceptance grammar.
- [ ] **Task 2** - Baseline regression: at `baseline-check-test.ps1:45-63,93-171` extend real-checker fixtures with `powershell extra`, `POWERSHELL`, and `powershell` followed by a literal tab and `extra`, each using a harmless PowerShell-only command; assert today's exit 0 and shell behavior for all three. Add unsupported `python` info-string with a runnable command; assert exit 3 and exact diagnostic `[baseline] UNPARSEABLE -- unsupported fence info-string 'python'.`. Add empty and comment-only Verify fences, including an empty `python` fence that must classify as `NoRunnableCommands` before `UnsupportedShell`; assert exit 3 and exact diagnostic `[baseline] UNPARSEABLE -- '## Verify commands' found but no runnable command block follows it.`. Assert a zero-byte AGENTS.md retains baseline's current empty-lines parameter-binding failure and exit 1, outside the classification grammar. Assert an open fence containing ```` ```python ```` with no later valid closer is `UnclosedFence`, exits 3, and prints today's unclosed-fence diagnostic; this is the sole baseline behavior change. Assert unclosed fence exit 3 with exact diagnostic `[baseline] UNPARSEABLE -- '## Verify commands' recipe fence is not closed before EOF.` and adjacency parse error exit 3 with exact diagnostic `[baseline] UNPARSEABLE -- '## Verify commands': recipe fence not immediately adjacent to heading.`. Preserve existing exact/suffixed-heading, fenced-decoy, prose-before-fence, prose-after-close, second-fence, `-Preflight` preference/fallback, diagnostic, and execution assertions. Extract the marked Task 1 block and assert this runnable grep criterion returns no matches: `rg -n 'Get-Content|ReadAll|Write-Host|Write-Output|\bexit\b|&' <extracted-block>`; the test must fail if it finds a match. — files: skills/apex-code/scripts/baseline-check-test.ps1 — done when: suite exits 0 and proves current classification order, exact diagnostics, first-token shell behavior, and marked-block purity through the real script.
- [ ] **Task 3** - Planner grammar adapter: at `engine-plan.ps1:179-189,613-622` replace regex-only `Get-EngineVerifyFence` acceptance with a verbatim byte copy of Task 1's complete marked block, including both marker lines and the same EOL. Read AGENTS.md as lines; before calling the shared grammar, refuse a zero-byte file with a distinct reason containing `AGENTS.md is empty`, outside the classification mapping. For nonempty files ask shared grammar for `Verify commands` only, and refuse each rejection through the existing `Get-EnginePlan` refusal path with a distinct reason carrying its classification and baseline mapping: `NoHeading` → exit 4; `ParseError` (including adjacency) → exit 3; `UnclosedFence` → exit 3; `NoRunnableCommands` (no fence, empty, or comment-only) → exit 3; `UnsupportedShell` → exit 3. Pass only accepted `FenceText`, including the original opening line, info string, command lines, leading spaces, and closing line, to `New-EnginePrompt` at `:241-267`. Preserve public plan shape, missing-file refusal, prompt insertion, and persisted state; never execute recipe commands in the planner. — files: skills/apex-code/scripts/engine-plan.ps1 — done when: marked UTF-8 blocks match byte-for-byte, each malformed Verify class has its own reason, and accepted task prompts contain the selected fence.
- [ ] **Task 4** - Lockstep and entry-point parity: at `engine-plan-test.ps1:5-9,26-46,201-238,284-293` read the sibling baseline script through `Join-Path $PSScriptRoot`, extract both marked blocks as raw UTF-8 bytes with markers inclusive, assert exactly one BEGIN and one END marker line per file, non-empty extracted spans, the same EOL in both copies, byte equality, and that a mutated scratch copy fails comparison. Add a table of temporary AGENTS.md bodies containing only Verify recipes so baseline `-Preflight` follows its Verify fallback; invoke the real `apex-baseline-check.ps1` process and real `Get-EnginePlan` for each. Assert equal accept/reject and accepted prompt fence for exact heading (0), suffixed near-miss (4), prose before fence (3), fenced-example decoy plus real heading (0, real fence only), `powershell extra` (0), unsupported shell (3), empty fence (3), comment-only fence (3), prose after close (0), decoy-only fenced heading (4), a `~~~` tilde fence (3: no recognized backtick fence, so today's adjacency `ParseError`), an unclosed fence (3: `UnclosedFence`), a four-backtick opener with a runnable command and a three-backtick closer (3: `UnsupportedShell`), a second fence before the next heading (3: `ParseError`), an open fence containing ```` ```python ```` with no later valid closer (3: `UnclosedFence`), and an empty `python` fence (3: `NoRunnableCommands`, before `UnsupportedShell`). For every rejected row assert the planner's distinct reason names the baseline classification and maps to its exit code, not merely `allowed: false`. For every accepted row compare the planner's selected `FenceText` to the source fence by exact-string equality, including both fence lines, original info string, leading spaces, and LF joining; do not use `Contains`. Add a separate zero-byte AGENTS.md case: baseline process exits 1 from empty-lines parameter binding; planner refuses with a distinct `AGENTS.md is empty` reason, without a recipe classification. Use harmless commands that exit 0. — files: skills/apex-code/scripts/engine-plan-test.ps1 — done when: suite exits 0, all sixteen parity rows call both real entry points and the separate zero-byte case exercises each script, rejected reasons match baseline classes, accepted prompt fences exactly match source, and scratch mutation is detected.
- [ ] **Task 5 (HOST)** - Registry row: adjacent to `SKILL-HISTORY.md:5` add one build-dated apex-code row naming `engine-recipe-parity`, the four build-repo script paths, grammar lockstep, and both regression suites; retain table columns. Apply this row serially with sibling `engine-build-outputs`' row: re-read `SKILL-HISTORY.md` immediately before inserting, after the sibling's write if it has landed. — files: C:/Users/User/apex/SKILL-HISTORY.md — done when: exactly one dated row records this shipped change, with no skill-set or index edit.

## Wave plan
Wave 1: [task 1] | Wave 2: [task 2] | Wave 3: [task 3] | Wave 4: [task 4]. `max_parallel_codex: 1`; manifest dependencies are authoritative. HOST task 5 follows coder verification outside the manifest.

## Permissions

The following non-critical build actions are authorized. HOST owns the APEX registry row after coder verification, outside the Engine manifest. Preserve pre-existing dirty files. Live-repo commit, push, index mutation, checkout, reset, and stash are excluded.

### File Operations
| Action | Paths |
|--------|-------|
| Modify (coder) | `C:/Users/User/.claude/skills/apex-code/scripts/apex-baseline-check.ps1`, `C:/Users/User/.claude/skills/apex-code/scripts/baseline-check-test.ps1`, `C:/Users/User/.claude/skills/apex-code/scripts/engine-plan.ps1`, `C:/Users/User/.claude/skills/apex-code/scripts/engine-plan-test.ps1` |
| Modify (HOST) | `C:/Users/User/apex/SKILL-HISTORY.md` |
| Create or delete | (none) |

### Commands
| Command | Purpose |
|---------|---------|
| `powershell.exe -NoProfile -File skills/apex-code/scripts/baseline-check-test.ps1` | Baseline behavior from build-repo root. |
| `powershell.exe -NoProfile -File skills/apex-code/scripts/engine-plan-test.ps1` | Lockstep and real entry-point parity from build-repo root. |
| Existing build-repo `AGENTS.md` Verify commands fence | Full prescribed build fence. |
| `git status --porcelain -uall` | Scope in both repositories. |

### Git Operations
| Operation | Scope |
|-----------|-------|
| Read-only HEAD and status inspection | Both repositories. |
| Fixture commits | Isolated temporary repositories inside tests only. |
| Live add, commit, push, checkout, reset, stash | (none) |

### Environment Access
| Variable | Purpose |
|----------|---------|
| `TEMP` | Isolated fixture repositories. |
| `GIT_CONFIG_GLOBAL` | Fixture Git configuration isolation when needed. |

### Network
| Action | Purpose |
|--------|---------|
| (none) | Local build and verification. |

## Specialist Context
### Security
Shared grammar is pure and fail-closed. Baseline executes accepted commands; the planner embeds only the selected fence.

### Performance
Scan a supplied AGENTS.md line array once per classification; no subprocess per line.

### Accessibility
(none)

## Documentation
| Doc type | File | Action |
|----------|------|--------|
| History (HOST) | C:/Users/User/apex/SKILL-HISTORY.md | Add one dated apex-code row. |

## Acceptance Criteria
- [ ] Task 1 → verify: the marked block in `skills/apex-code/scripts/apex-baseline-check.ps1` returns the named fields and one of the six fixed classifications in the stated evaluation order; `FenceText` includes both fence lines verbatim and joins them with LF. Only exactly three backticks followed by optional whitespace close an open fence; the documented ```` ```python ```` correction yields `UnclosedFence` when no valid closer follows. A zero-byte AGENTS.md never enters the block. Baseline mode selection, exact diagnostic text and exit code for each classification, shell availability, and execution remain outside the pure block.
- [ ] Task 2 → verify: from `C:/Users/User/.claude` run `powershell.exe -NoProfile -File skills/apex-code/scripts/baseline-check-test.ps1`; exit 0. `powershell extra`, uppercase `POWERSHELL`, and tab-separated `powershell`/`extra` retain today's successful shell behavior; unsupported shell, empty, comment-only, unclosed, and adjacency cases assert exit 3 and their exact current diagnostic text. The extracted block has no `Get-Content`, `ReadAll`, `Write-Host`, `Write-Output`, `exit`, or `&` invocation by the Task 2 grep criterion; all existing cases pass. The zero-byte case retains baseline exit 1, and the info-string line inside an open fence gives `UnclosedFence` with today's diagnostic and exit 3.
- [ ] Task 3 → verify: compare raw UTF-8 bytes between the two marked script blocks, inclusive of their marker lines; they match exactly and use the same EOL. Planner returns `allowed: false` with a distinct classification reason and correct baseline exit mapping for each rejection class; zero-byte AGENTS.md is refused separately with `AGENTS.md is empty`. Each accepted task prompt contains the original Verify fence without a plan-state field.
- [ ] Task 4 → verify: from `C:/Users/User/.claude` run `powershell.exe -NoProfile -File skills/apex-code/scripts/engine-plan-test.ps1`; exit 0. The test asserts exactly one BEGIN and END line per file, inclusive non-empty spans, matching EOL, live-block equality, and scratch-copy inequality. The separate zero-byte case asserts baseline exit 1 from empty-lines parameter binding and the planner's distinct `AGENTS.md is empty` refusal. All sixteen parity rows record baseline exit 0/3/4 beside matching planner allowed/refused and a baseline-class-matched reason for each rejection; accepted `FenceText` equals the source fence as an exact string.
- [ ] Task 5 (HOST) → verify: from `C:/Users/User/apex` run `rg -n 'engine-recipe-parity' SKILL-HISTORY.md`; exactly one dated row names the four build-repo scripts and two suites.
- [ ] Build fence → verify: from `C:/Users/User/.claude` execute every command in its existing `AGENTS.md` `## Verify commands` fence in listed order; each exits 0. The two suites above are included.
- [ ] Scope → verify: `git status --porcelain -uall` in both repositories lists the four coder files and HOST history file as modified; other listed paths predate the build and are named in its report. No sibling-owned file is modified.
- [ ] Reachability — Engine planning and dispatch pre-flight accept and reject the same AGENTS.md `## Verify commands` recipes through real script entry points when pre-flight follows its Verify fallback → verify: Task 4 invokes `Get-EnginePlan` and `powershell.exe -NoProfile -File skills/apex-code/scripts/apex-baseline-check.ps1 -Preflight -Worktree <fixture>` for the same sixteen Verify-only AGENTS.md bodies; accepted cases give baseline 0 and planner `allowed: true`, rejected cases give baseline 3 or 4 and planner `allowed: false` with a class-matched reason, and each accepted prompt uses the exact source fence string. A separate zero-byte AGENTS.md case asserts baseline exit 1 and planner refusal with `AGENTS.md is empty`, outside the shared grammar.

## Progress
_(The build writes here — do not edit manually)_
