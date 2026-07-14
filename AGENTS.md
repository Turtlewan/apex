# AGENTS.md — APEX (build instructions)

Standing instructions for any coding agent working in this repo (Codex CLI reads this automatically
at the start of every run, including `codex exec`; Cursor reads it too; `apex-code` reads it on
demand at build time).

## What this repo is

**APEX** — the Claude Code skill system that builds every other project here. It is **pure
Markdown**: 14 skills (`~/.claude/skills/apex-*/`), a registry, templates, and planning docs. There
is **no package.json, no test suite, no build step, and no linter** — do not add one, do not look
for one, do not try to run one.

Note the split: the *skills themselves* live in `~/.claude/`, outside this repo. This repo holds the
docs, the index (`SKILLS.md`), the history (`SKILL-HISTORY.md`), and the ADRs. A change to APEX
usually touches both trees.

## How to build a spec

When asked to implement `docs/changes/<name>.md`:

1. **Read the whole spec first.** Implement `## Exact changes` precisely.
2. **Surgical scope:** create or modify only files in the spec's `## Files to change`.
   `git diff --stat` must show only those.
3. **Run the spec's `## Commands to run`** and make every `## Acceptance criteria` item pass.
4. **Stop and ask** if a criterion cannot be met as written — that is a planning question. Note it;
   do not improvise around the spec.
5. **After a spec passes, move it to `docs/changes/done/`** (a file move, not a commit).

## Verify commands

There is no test suite. Verification here is **structural**, and these are the checks that actually
catch regressions:

```bash
# 1. No skill exceeds its line cap (500 for SKILL.md) — a cap breach is a real failure
wc -l ~/.claude/skills/apex-*/SKILL.md | sort -rn | head -3

# 2. No dangling pointers — every skill/agent/reference a file names must exist
grep -roE '~/\.claude/skills/apex-[a-z-]+' ~/.claude/skills/ | sort -u

# 3. The three files are inside their caps
wc -l docs/status.md          # ≤100
wc -l ~/.claude/CLAUDE.md     # ≤200
wc -c AGENTS.md               # <32768
```

A spec that edits a skill must also land its `SKILL-HISTORY.md` row and, if the skill set changed,
its `SKILLS.md` entry. That double-write **is** part of the acceptance criteria — a missing row is a
failed build, not a nit.

## Hard rules

- **Never `git commit`, never `git push`.** Build and verify only; leave the work dirty for review.
- **A dirty working tree is NORMAL** — the planning host edits concurrently. Leave out-of-scope
  modified or untracked files strictly untouched; mention them in your report.
- **Never weaken or delete a check to make it pass.**
- **Never re-create the domain-knowledge layer.** 36 domain skills were deleted in ADR-036. If a
  rule seems missing, ask whether a bare model would already follow it. It almost always would. A
  new global skill is the wrong answer to nearly every gap.

## Conventions

- Markdown only. Match the surrounding file's voice and structure.
- Skill frontmatter is a contract: `skill`, `backend`, `version`, `last_updated`, `sources`,
  `staleness_threshold`, `description`. The `description` is what routes the skill — it is loaded
  into every session, so keep it tight.
- `SKILL.md` ≤ 500 lines, hard. Overflow goes to `references/`, loaded on demand — never a fatter
  SKILL.md. `apex-code` and `apex-plan` sit at the cap; an edit to either must be net-neutral or
  negative.
- Specs are **execution scripts, not design docs**: one-line identity, exact files per task, no
  *why* inline (the why lives in an ADR). Never "update the auth flow" — name the files.
