# Spec: Retire the dead GSD-style coding pipeline

**Identity:** Delete the 5 orphaned pre-APEX coding agents (`coding-pipeline`, `code-writer`, `code-reviewer`, `code-documenter`, `doc-writer`) that the canonical `apex-code` flow no longer dispatches. (ADR-018 "APEX is sole coding workflow"; status.md In-Flight "Context-exhaustion on parallel builds".)

coder_tier: flash

## Files to Change

- `~/.claude/agents/coding-pipeline.md` — delete (`git rm`)
- `~/.claude/agents/code-writer.md` — delete (`git rm`)
- `~/.claude/agents/code-reviewer.md` — delete (`git rm`)
- `~/.claude/agents/code-documenter.md` — delete (`git rm`)
- `~/.claude/agents/doc-writer.md` — delete (`git rm`)
- `~/apex/SKILL-HISTORY.md` — modify (prepend one row)

## Assumptions

- None of the 5 are referenced by the canonical flow. Verify: `grep -rn "coding-pipeline\|code-writer\|code-documenter\|doc-writer" ~/.claude/skills ~/.claude/registry` returns nothing (the live reviewer is `apex-reviewer`; live doc agents are `apex-docs-*`; the live worker `code-worker` and orchestrator `apex-coder` are NOT in this delete list). Impact if wrong: Stop.
- All 5 are git-tracked, so `git rm` preserves history. Verify: `cd ~/.claude && git ls-files agents/coding-pipeline.md`. Impact if wrong: Caution — fall back to plain `rm` (still recoverable from prior commits).
- `registry/agents.md` does NOT list any of the 5 → no registry edit needed. Verify: `grep -c "coding-pipeline\|code-writer\|code-documenter\|doc-writer" ~/.claude/registry/agents.md` returns 0. Impact if wrong: Caution (remove the rows too).

## Exact Changes

### Task 1 — delete the 5 dead agent files

**done when:** all 5 files are gone from `~/.claude/agents/` and staged as deletions.

```
cd ~/.claude
git rm agents/coding-pipeline.md agents/code-writer.md agents/code-reviewer.md agents/code-documenter.md agents/doc-writer.md
```

Do NOT delete `agents/code-worker.md` or `agents/apex-coder.md` — both are live (registry Phase-2).

### Task 2 — `~/apex/SKILL-HISTORY.md`: log the change

**done when:** a new top row records the retirement.

Prepend one row under the header (newest-first):

```
| 2026-06-19 | (agents) | agents/coding-pipeline.md, code-writer.md, code-reviewer.md, code-documenter.md, doc-writer.md | — | deleted | Retired the orphaned pre-APEX GSD-style coding pipeline — superseded by the apex-code inline flow + apex-* agent roster (ADR-018); recoverable from git history | ADR-018 |
```

## Acceptance Criteria

1. The 5 files are gone → verify: `for f in coding-pipeline code-writer code-reviewer code-documenter doc-writer; do test ! -f ~/.claude/agents/$f.md || echo "STILL PRESENT: $f"; done` prints nothing.
2. The 2 live agents remain → verify: `test -f ~/.claude/agents/code-worker.md && test -f ~/.claude/agents/apex-coder.md`
3. No dangling references introduced → verify: `grep -rn "coding-pipeline\|code-writer\|code-documenter\|doc-writer" ~/.claude/skills ~/.claude/registry` returns nothing.
4. History row present → verify: `grep -q "Retired the orphaned pre-APEX GSD-style coding pipeline" ~/apex/SKILL-HISTORY.md`

## Commands to Run

No build step. Run the four checks above; each must pass.
