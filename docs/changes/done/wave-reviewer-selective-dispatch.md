---
title: Coding-side selective wave reviewer dispatch
status: blocked — baseline test required (see Prerequisite)
mode: Light
---

## Prerequisite — do not execute until this passes

A baseline test must confirm Flash (DeepSeek V4) can reliably:
1. Collect changed file paths from a completed wave
2. Match them against the trigger table (substring check)
3. Dispatch a reviewer agent and wait for its result
4. Route a BLOCK finding into a task re-run and re-review loop

Design the baseline test protocol before executing this spec.
If Flash cannot reliably complete steps 3–4, the dispatch design must be simplified.

---

## Intent

Add a selective domain reviewer pass after each coding wave, before the next wave starts.
Triggered only when a wave touches auth, security, or data — domains where a violation in
Wave N compounds into Wave N+1. Low-risk waves skip it and rely on the existing post-build
apex-reviewer. Discussion: 2026-06-01 planning session.

## Key decisions

- **File-path pattern matching only.** No keyword scan of task descriptions. Flash checks
  changed file paths/names against a fixed substring table — deterministic, no judgment.
- **Three domains: auth, security, data.** Same set planning auto-fires for spec review.
  Testing and accessibility stay post-build-only; their violations do not compound across waves.
- **One reviewer per matched domain, dispatched in parallel.** If a wave touches both auth
  and data, two reviewers run concurrently.
- **BLOCK = one retry, then BIG fork.** Re-run the specific violating task with the finding
  prepended. One retry cap — if still BLOCK, capture-at-halt and route to planning.
  FLAG = log to decisions table, continue. No retry.
- **Post-build apex-reviewer unchanged.** The wave reviewer is an early-warning pass, not
  a replacement for the whole-build review.

## Files to touch

- `~/.claude/agents/apex-wave-reviewer.md` — create (new agent)
- `~/.claude/skills/apex-code/SKILL.md` — add wave domain review section + wire into execution loop

---

## Exact changes

### 1. Create `~/.claude/agents/apex-wave-reviewer.md`

```markdown
---
name: apex-wave-reviewer
description: >
  Reviews code output from a completed build wave against one domain's NEVER/ALWAYS rules.
  Returns BLOCK / FLAG / CLEAN findings cited to specific rules. Dispatched by apex-code
  after high-risk domain waves complete. Sandboxed — reads only changed files and the
  provided impl.md; no planning docs, no status.md, no other specs.
---

# Wave Reviewer

You review code produced by a completed build wave against one domain's enforcement rules.

## Inputs (provided by the dispatcher)

- `changed_files`: list of full file paths written in this wave
- `domain_impl_path`: path to `~/.claude/skills/apex-<domain>/impl.md`
- `acceptance_criteria`: the "done when:" clauses for each task in this wave

## What to do

1. Read `domain_impl_path` — load only `## NEVER do` and `## ALWAYS do` sections. Stop there.
2. Read each file in `changed_files`.
3. For each `## NEVER do` rule: check if any changed code violates it.
4. For each `## ALWAYS do` rule: check if the changed code satisfies it where applicable.
5. Check `acceptance_criteria` — does the code meet each "done when:" clause?

## Output format

Return findings in this exact structure:

DOMAIN: {domain name}
VERDICT: BLOCK | FLAG | CLEAN

FINDINGS:
- [BLOCK] {file path}:{approx line} — {what violates which rule, rule text quoted verbatim}
- [FLAG]  {file path}:{approx line} — {what may violate which rule, rule text quoted verbatim}

If verdict is CLEAN, output only:
DOMAIN: {domain name}
VERDICT: CLEAN

## Hard rules

- NEVER invent violations not grounded in the impl.md NEVER/ALWAYS rules
- NEVER read any file not in `changed_files` or the provided `domain_impl_path`
- NEVER access planning docs, status.md, handoff docs, or other specs
- ALWAYS cite the exact rule text the finding references
- ALWAYS be specific: file path + approximate line, not "somewhere in the code"
- ALWAYS return one verdict per invocation — you review exactly one domain per run
```

---

### 2. `~/.claude/skills/apex-code/SKILL.md` — two edits

#### Edit A — wire into the execution loop

In the `During execution:` bullet list, replace:

```
- After each wave completes: verify wave outputs before starting the next wave
```

With:

```
- After each wave completes: run the wave domain review (see § Wave domain review) before starting the next wave
```

#### Edit B — add new section

Insert the following section immediately after the `## Verification — run the stack's recipe` section and before `## Forks`:

```markdown
## Wave domain review — selective dispatch

Runs after each wave's recipe passes, before the next wave starts. Skipped entirely for
waves that touch no high-risk domain — proceed directly to next wave.

**Step 1 — domain check (file-path substring match, case-insensitive):**

Collect all file paths written in this wave. Check each path and filename against:

| Domain   | Trigger substrings (path or filename)                                      |
|----------|----------------------------------------------------------------------------|
| auth     | `/auth/`, `/session/`, `auth`, `session`, `jwt`, `oauth`, `login`, `signup`, `password` |
| security | `/security/`, `/crypto/`, `guard`, `middleware`, `sanitize`, `encrypt`, `hash` |
| data     | `/migrations/`, `/schema/`, `migration`, `schema`, `seed`                  |

If no file matches any row → skip. Proceed to next wave.

**Step 2 — dispatch (one reviewer per matched domain, in parallel):**

For each matched domain dispatch `apex-wave-reviewer` with:
- `changed_files`: list of file paths written in this wave
- `domain_impl_path`: `~/.claude/skills/apex-{domain}/impl.md`
- `acceptance_criteria`: the "done when:" clauses for this wave's tasks

Wait for all dispatched reviewers to complete before proceeding.

**Step 3 — handle findings:**

| Verdict | Action |
|---------|--------|
| CLEAN   | Proceed to next wave |
| FLAG    | Log to decisions table: `"Wave {N} {domain} review: {finding}"`. Proceed to next wave. |
| BLOCK   | Re-run the specific task that produced the violation with the finding prepended to its context. Re-run the recipe. Re-dispatch this domain's reviewer (one retry only). If still BLOCK: BIG fork — capture-at-halt, mark spec blocked. Do not attempt a second retry. |

The one-retry cap on BLOCK is a hard limit. A second BLOCK means the issue requires planning judgment — do not loop.
```

---

## Acceptance criteria

- `~/.claude/agents/apex-wave-reviewer.md` exists and matches the content above
- apex-code/SKILL.md execution loop references "§ Wave domain review" after each wave
- apex-code/SKILL.md contains the `## Wave domain review` section with the trigger table, dispatch step, and findings table
- apex-code/SKILL.md `## Forks` section is unchanged
- Post-build `apex-reviewer` dispatch is unchanged

## Commands to run

None — `.md` files only.
