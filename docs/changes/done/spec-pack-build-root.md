---
spec: spec-pack-build-root
status: draft
autonomy_level: L2
risk: low
coder_effort: low
---

# Spec: Spec-pack build root

**Identity:** Add three build facts to the apex-plan spec-author pack and bump apex-plan to 2.10.1.
**Mode:** Light. **Size:** Trivial.

## Intent

- **Intent:** The spec-author pack states dispatched-worktree path rules, coder Git/check limits, and done-when output ordering.
- **Risk:** Low; one instruction paragraph and one patch-version line change.
- **Invariants:** Preserve the existing paragraph, keep the insertion in that paragraph, retain `last_updated: 2026-10-21`, and keep the skill at or below 500 lines.
- **Non-goals:** Changes to dispatch code, templates, references, or other skill behavior.

## Assumptions

- `docs/system-map.md` section `apex-plan skill and planning references` covers `skills/apex-plan/SKILL.md`; its historical line/version notes are advisory, and the live file supplies the insertion anchor and current version. Impact if the target or anchor differs: Stop.
- The build root is the worktree each task is dispatched into, including an Engine/HOST worktree checkout. Resolve every build-repo path relative to that root; only the manifest's `repos` value and HOST paths stay absolute. A different working-directory path from the manifest repository path is not a stop condition. Impact if the target file is absent from the dispatched root: Stop.

## Prerequisites

none

## Files to Change

| File | Operation | Notes |
|------|-----------|-------|
| `skills/apex-plan/SKILL.md` | modify | Task 1: insert build facts; version 2.10.0 to 2.10.1. |
| `C:/Users/User/apex/SKILL-HISTORY.md` | modify | HOST H1: append the specified history row. |
| `C:/Users/User/apex/CHANGELOG.md` | modify | HOST H2: add an Unreleased Changed bullet. |

## Execution manifest

```json apex-manifest
{
  "version": 1,
  "repos": { "claude": "C:/Users/User/.claude" },
  "tasks": [
    { "id": "1", "repo": "claude", "files": [{ "path": "skills/apex-plan/SKILL.md", "op": "modify" }], "depends_on": [] }
  ]
}
```

## Tasks

- [ ] **Task 1** - Update the spec-author pack - files: `skills/apex-plan/SKILL.md` - done when: Task 1's tagged acceptance check passes against this task's updated file.

  In section Writing the spec, locate the sentence ending `and the three rules below (no why inline except Intent, mechanism in each task, one concern per task).` Immediately after that sentence, in the same paragraph, insert exactly the following text, including its initial space:

  ```text
   The pack also states three build facts: the build root is the worktree each task is dispatched into, so build-repo paths are written relative to it (only the manifest's `repos` value and HOST paths stay absolute) and no task may stop because its working directory differs from the repository path; coders make no Git operations and run only their own task's tagged checks, never the full verify recipe; and a task's done-when cites only its own or earlier tasks' outputs.
  ```

  Change the frontmatter line `version: 2.10.0` to `version: 2.10.1`; keep `last_updated: 2026-10-21`. Coders make no Git operations and run only their own task's tagged checks, never the full verify recipe. Do not edit HOST files.

- [ ] **Task 2 (HOST)** — H1: history — files: C:/Users/User/apex/SKILL-HISTORY.md — done when: | 2026-10-21 | apex-plan | skills/apex-plan/SKILL.md | 2.10.1 | updated | spec-author pack states build root = dispatched worktree, relative build paths, coder own-checks only, done-when cites own/earlier tasks | docs/changes/spec-pack-build-root.md | is the first dated history row.

- [ ] **Task 3 (HOST)** — H2: changelog — files: C:/Users/User/apex/CHANGELOG.md — done when: the Unreleased Changed bullet is present.

## HOST tasks

- [ ] **H1** - In `C:/Users/User/apex/SKILL-HISTORY.md`, add this row using the existing table layout:

  ```text
  | 2026-10-21 | apex-plan | skills/apex-plan/SKILL.md | 2.10.1 | updated | spec-author pack states build root = dispatched worktree, relative build paths, coder own-checks only, done-when cites own/earlier tasks | docs/changes/spec-pack-build-root.md |
  ```

- [ ] **H2** - In `C:/Users/User/apex/CHANGELOG.md`, add under `## [Unreleased]` / `### Changed`:

  ```text
  - Spec-pack build root (2026-10-21, spec-pack-build-root, apex-plan 2.10.1): the spec-author pack states that the build root is the dispatched worktree, build paths are relative, coders make no Git operations and run only their own tagged checks, and done-when cites only own or earlier task outputs.
  ```

## Wave plan

Wave 1: [1] | HOST: [H1, H2] after the coder task.

## Permissions

The following NON-CRITICAL actions will run autonomously during build. Approving this spec approves all of them.
Critical paths — .env · migrations · auth/authz/crypto · CI config · dependency manifests and lockfiles · infra-as-code · secrets/keys/certs · host-state (`status.md`, root AGENTS.md, root CLAUDE.md, docs/changes/, docs/handoff/, the run ledger) · the permission settings and the hooks — are NEVER pre-authorised by this section. They need a live attended confirmation at build time, and an AFK run parks them (D3, ADR-046; apex-governance is canonical). (Sole exception: the docs agents' three host's-pen artifacts — the handoff, `status.md`, and spec archival — under D6.)
docs/audit/ is different and stricter: TIER-1, refused outright on a path match. No confirmation authorises a write there — not attended, not by any switch, not by this section. (D5's append-only exception is doctrine pending a content-aware classifier change; it is not a live permission.)

### File Operations
| Action | Paths |
|--------|-------|
| Create | (none) |
| Modify | `skills/apex-plan/SKILL.md` (coder) |
| Modify (HOST only) | `C:/Users/User/apex/SKILL-HISTORY.md`, `C:/Users/User/apex/CHANGELOG.md` |
| Delete | (none) |

### Commands
| Command | Purpose |
|---------|---------|
| Task 1's tagged check only | Verify Task 1's acceptance criterion |

### Git Operations
| Operation | Scope |
|-----------|-------|
| (none) | Coder |

### Environment Access
| Variable | Purpose |
|----------|---------|
| (none) | (none) |

### Network
| Action | Purpose |
|--------|---------|
| (none) | (none) |

## Specialist Context

### Security
none — prose only

### Performance
none

### Accessibility
none

## Documentation

| Doc type | File | Action |
|----------|------|--------|
| History | C:/Users/User/apex/SKILL-HISTORY.md | HOST H1: SKILL-HISTORY.md row |
| Changelog | C:/Users/User/apex/CHANGELOG.md | HOST H2: CHANGELOG.md Unreleased Changed bullet |

## Acceptance Criteria

- [ ] Task 1 - Each distinctive phrase appears exactly once; frontmatter has version 2.10.1 and the unchanged date; the file has at most 500 lines. Run from the dispatched build root:

```powershell apex-accept
$path = 'skills/apex-plan/SKILL.md'
$text = Get-Content -LiteralPath $path -Raw -Encoding UTF8
$phrases = @(
    'three build facts',
    'worktree each task is dispatched into',
    "only their own task's tagged checks",
    "cites only its own or earlier tasks' outputs"
)
foreach ($phrase in $phrases) {
    if ([regex]::Matches($text, [regex]::Escape($phrase)).Count -ne 1) {
        throw "Expected exactly one occurrence: $phrase"
    }
}
$lines = @(Get-Content -LiteralPath $path -Encoding UTF8)
if (@($lines | Where-Object { $_ -ceq 'version: 2.10.1' }).Count -ne 1) {
    throw 'Expected version: 2.10.1'
}
if (@($lines | Where-Object { $_ -ceq 'last_updated: 2026-10-21' }).Count -ne 1) {
    throw 'Expected unchanged last_updated: 2026-10-21'
}
if ($lines.Count -gt 500) { throw 'SKILL.md exceeds 500 lines' }
```

- [ ] Task 2 - H1 (HOST): the SKILL-HISTORY.md row for apex-plan 2.10.1 is the first dated history row → verify: HOST inspects C:/Users/User/apex/SKILL-HISTORY.md.
- [ ] Task 3 - H2 (HOST): the CHANGELOG.md Unreleased Changed bullet for spec-pack-build-root is present → verify: HOST inspects C:/Users/User/apex/CHANGELOG.md.
- [ ] HOST H1 - The specified 2.10.1 history row is present in `C:/Users/User/apex/SKILL-HISTORY.md`.
- [ ] HOST H2 - The specified bullet is present under Unreleased Changed in `C:/Users/User/apex/CHANGELOG.md`.

## Progress

_(The build writes here - do not edit manually)_
