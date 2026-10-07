---
spec: wrapper-model-luna
status: draft
autonomy_level: L2
risk: low
coder_effort: low
max_parallel_codex: 1
---

# Spec: Wrapper model Luna
<!-- Governing contract: references/spec-contract.md. -->

**Identity:** Admit `gpt-6-luna` as a case-sensitive wrapper `-Model` for author dispatch.

## Intent
- **Intent:** Allow the separate `scribe-stage3` Scribe build to dispatch through the wrapper with `-Model gpt-6-luna`.
- **Invariants:** The default remains `gpt-5.6-sol`; uppercase model spellings fail parameter binding; existing model-family mapping remains intact.
- **Non-goals:** Default-model change, Scribe procedure, model-family mapping change.

## Assumptions
- `C:/Users/User/.claude` is the build repo at HEAD `73d6dff`; task anchors refer to this revision. -> impact: Stop.
- PowerShell 5.1 and the build repo's `AGENTS.md` Verify commands are available. -> impact: Stop.

Simplicity check: One coder task and one HOST close-out row.

## Prerequisites
- Specs complete first: none.
- Environment: build from `C:/Users/User/.claude`; preserve pre-existing dirty paths.

## Files to Change
Grep evidence: at build HEAD `73d6dff`, `rg -n -F -e 'ValidateSet(' -e 'gpt-5.6-sol' skills/apex-code/scripts/codex-dispatch.ps1` found the model allowlist at 18 and default at 19; `rg -n -F -e 'author-create-gpt-6.1-sol' -e 'GPT-6.1-SOL' skills/apex-code/scripts/dispatch-author-test.ps1` found the accepted case at 517-545 and uppercase refusal at 700-713; in APEX, `rg -n -m 1 -F 'engine-followups-ab' SKILL-HISTORY.md` found the prior wrapper-model history row at 12.

| File | Operation | Notes |
|------|-----------|-------|
| skills/apex-code/scripts/codex-dispatch.ps1 | modify | Task 1 model allowlist. |
| skills/apex-code/scripts/dispatch-author-test.ps1 | modify | Task 1 acceptance and uppercase refusal cases. |
| C:/Users/User/apex/SKILL-HISTORY.md | modify | HOST Task 2 history row. |

## Execution manifest
```json apex-manifest
{
  "version": 1,
  "repos": { "claude": "C:/Users/User/.claude" },
  "tasks": [
    { "id": "1", "repo": "claude", "files": [{ "path": "skills/apex-code/scripts/codex-dispatch.ps1", "op": "modify" }, { "path": "skills/apex-code/scripts/dispatch-author-test.ps1", "op": "modify" }], "depends_on": [], "effort": "low" }
  ]
}
```

## Tasks
- [ ] **Task 1** - At `codex-dispatch.ps1:18`, add `'gpt-6-luna'` to the `-Model` `ValidateSet`, retaining `IgnoreCase = $false` and the default at `:19`; if a header/comment lists admitted models, add it there. In `dispatch-author-test.ps1:517-545`, mirror `author-create-gpt-6.1-sol` with `Model = 'gpt-6-luna'`, asserting exit 0, exact draft content, adjacent argv `-m gpt-6-luna`, and `[string]$row.model -ceq 'gpt-6-luna'`. At `dispatch-author-test.ps1:700-713`, mirror the uppercase refusal with `GPT-6-LUNA`, asserting exit 1, zero ledger rows, and no argv file. Done when the author test exits 0. - files: skills/apex-code/scripts/codex-dispatch.ps1, skills/apex-code/scripts/dispatch-author-test.ps1
- [ ] **Task 2 (HOST)** - Prepend one dated apex-code row naming `wrapper-model-luna`, both coder files, the case-sensitive allowlist addition, accepted author dispatch, and uppercase refusal; preserve existing rows. Done when one new row contains the spec name and both coder paths. - files: C:/Users/User/apex/SKILL-HISTORY.md

## Wave plan
Wave 1: [task 1]. HOST completes Task 2 after coder verification.

## Permissions
The following file operations and local commands are authorized for the build. The standing scope lock applies.

### File Operations
| Action | Paths |
|--------|-------|
| Modify (coder) | The two build-repo script files in `## Files to Change`. |
| Modify (HOST) | C:/Users/User/apex/SKILL-HISTORY.md |
| Create/Delete | (none) |

### Commands
| Command | Purpose |
|---------|---------|
| `powershell.exe -NoProfile -File skills/apex-code/scripts/dispatch-author-test.ps1` | Task 1 author cases. |
| `powershell.exe -NoProfile -File dispatch-test.ps1` from the scripts directory | Wrapper regression. |
| Build repo `AGENTS.md` `## Verify commands` fence | Build verification. |

### Git Operations
| Operation | Scope |
|-----------|-------|
| Read-only `git` commands | Build and APEX repos. |

### Environment Access
(none)

### Network
(none)

## Specialist Context
### Security
(none)

### Performance
(none)

### Accessibility
(none)

## Documentation
| Doc type | File | Action |
|----------|------|--------|
| History | C:/Users/User/apex/SKILL-HISTORY.md | HOST Task 2 prepends the row. |

## Acceptance Criteria
- [ ] Task 1 - from `C:/Users/User/.claude`, run `powershell.exe -NoProfile -File skills/apex-code/scripts/dispatch-author-test.ps1` -> verify: exit 0; the Luna author case checks exit 0, exact draft content, adjacent `-m gpt-6-luna`, and case-exact ledger model; `GPT-6-LUNA` exits 1 with zero ledger rows and no argv file.
- [ ] Task 1 default and family - from the build repo, run `rg -n -F '[string]$Model = ''gpt-5.6-sol''' skills/apex-code/scripts/codex-dispatch.ps1` and `rg -n -F 'if ($m -match ''codex'' -or $m -match ''^gpt'')' skills/apex-code/scripts/codex-dispatch.ps1` in PowerShell -> verify: both exit 0 and each matches exactly one unchanged line (the default and the existing `Get-ModelFamily` rule).
- [ ] Task 2 (HOST) - run `rg -n -F 'wrapper-model-luna' C:/Users/User/apex/SKILL-HISTORY.md` -> verify: exactly one new dated apex-code row names both coder files and the allowlist, author dispatch, and uppercase refusal.
- [ ] Tasks 1-2 build fence - from `C:/Users/User/.claude`, run every command in its existing `AGENTS.md` `## Verify commands` fence; from the scripts directory, run `powershell.exe -NoProfile -File dispatch-test.ps1` -> verify: every command exits 0.
- [ ] Tasks 1-2 scope - run `git status --porcelain -uall` in each repo before and after the build -> verify: only the two coder scripts and HOST history row are newly modified; all other reported paths match their pre-build state.
- [ ] Task 1 reachability - run `powershell.exe -NoProfile -File skills/apex-code/scripts/dispatch-author-test.ps1` from the build repo -> verify: exit 0 through the real wrapper author dispatch fixture with Luna model and uppercase refusal.

## Progress
_(The build writes here - do not edit manually)_
