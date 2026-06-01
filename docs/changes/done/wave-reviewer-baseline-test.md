---
title: Wave reviewer dispatch — baseline test
status: ready
mode: Light
---

## Intent

Throwaway fixture confirming Flash (DeepSeek V4) can orchestrate the full wave domain
review loop before `wave-reviewer-selective-dispatch.md` executes. Flash creates two stub
reviewer agents, writes two auth-path fixture files (simulating a completed wave), runs the
inline wave review protocol (domain check → BLOCK dispatch → task retry → CLEAN dispatch →
proceed), then tears down all temp artifacts. All four observables must pass; O2/O3 failure
means the dispatch design needs simplification before the main spec runs.

## Key decisions

- **Two stubs, not one stateful stub.** `stub-block` always returns BLOCK; `stub-clean`
  always returns CLEAN. Agents have no per-call state; two separate stubs cover the
  BLOCK → retry → CLEAN path without workarounds.
- **Inline protocol, no SKILL.md edit.** Wave-review steps are embedded in this spec
  directly — the main spec's `apex-code/SKILL.md` change is not a prerequisite for the test.
- **Single domain (auth) only.** Parallel dispatch (two domains simultaneously) is not
  the core risk. Once Flash dispatches one agent and handles the result, dispatching two
  in parallel is not a new capability. Out of scope for baseline.
- **Real file writes.** Fixture files are written to real `auth/` paths so trigger matching
  and the Agent tool dispatch are exercised genuinely, not simulated with hypothetical inputs.
- **Unconditional teardown.** Stubs and fixture files are deleted whether the test passes
  or fails. Stubs left in `~/.claude/agents/` risk accidental dispatch in a real build.

## Observables — all four must pass

- **O1** — Flash's domain check matches `wave-baseline-test/auth/login.ts` → `auth` domain
  (substring match against the trigger table)
- **O2** — Flash dispatches `apex-wave-reviewer-stub-block`, receives `VERDICT: BLOCK`
- **O3** — Flash re-runs the violating task (`login.ts` write) with the BLOCK finding
  prepended to the task description; one retry only
- **O4** — Flash dispatches `apex-wave-reviewer-stub-clean`, receives `VERDICT: CLEAN`,
  then proceeds to teardown

**If O2 fails** (dispatch fails or output unparseable) → the Agent tool dispatch mechanics
need simplification before the main spec executes.
**If O3 fails** (Flash loses wave state across the dispatch) → fix = pass changed_files and
the flagged task as explicit variables in the retry task description, not implicit session memory.

## Gotchas / edge cases

- **Stub output format is the discriminator.** A format mismatch produces a false failure, not
  a real Flash limitation. Stubs must emit exactly the structure in § Stub content below —
  copy verbatim.
- **Retry cap must be present in the inline protocol.** The test uses `stub-clean` on retry
  so the cap won't trigger, but Flash must read and honour the "one retry only" clause.
  Its presence in the instructions is part of what is being tested.
- **State across the Agent dispatch is the highest-risk step.** Flash must remember which
  task was flagged and the full `changed_files` list after the agent call returns. If O3
  fails, the fix is explicit state passing in the retry task, not a redesign.

## Files to touch

- `~/.claude/agents/apex-wave-reviewer-stub-block.md` — create (temp stub; deleted in teardown)
- `~/.claude/agents/apex-wave-reviewer-stub-clean.md` — create (temp stub; deleted in teardown)
- `wave-baseline-test/auth/login.ts` — create (fixture file; deleted in teardown)
- `wave-baseline-test/auth/session.ts` — create (fixture file; deleted in teardown)
- `wave-baseline-test/` — delete dir after teardown (no permanent artifact)

---

## Stub content — create verbatim

### `~/.claude/agents/apex-wave-reviewer-stub-block.md`

```markdown
---
name: apex-wave-reviewer-stub-block
description: Baseline test stub. Always returns BLOCK. Delete after baseline test passes.
---

Output the following exactly and nothing else:

DOMAIN: auth
VERDICT: BLOCK

FINDINGS:
- [BLOCK] auth/login.ts:1 — NEVER store tokens in plaintext (rule: "NEVER store credentials or session tokens without encryption")
```

### `~/.claude/agents/apex-wave-reviewer-stub-clean.md`

```markdown
---
name: apex-wave-reviewer-stub-clean
description: Baseline test stub. Always returns CLEAN. Delete after baseline test passes.
---

Output the following exactly and nothing else:

DOMAIN: auth
VERDICT: CLEAN
```

---

## Inline wave review protocol — Flash runs this after writing fixture files

### Fixture tasks (Wave 1)

1. Write `wave-baseline-test/auth/login.ts` — minimal content (e.g., `// baseline test fixture`).
2. Write `wave-baseline-test/auth/session.ts` — minimal content (e.g., `// baseline test fixture`).

### Wave review steps (run after Wave 1 completes)

**Step 1 — domain check (substring match, case-insensitive):**

Check all file paths written in this wave against the trigger table:

| Domain | Trigger substrings |
|--------|--------------------|
| auth   | `/auth/`, `auth`   |

`wave-baseline-test/auth/login.ts` and `wave-baseline-test/auth/session.ts` both match `auth`.
→ Auth domain matched. Proceed to dispatch.

**Step 2 — dispatch:**

Dispatch `apex-wave-reviewer-stub-block` with:
- `changed_files`: `["wave-baseline-test/auth/login.ts", "wave-baseline-test/auth/session.ts"]`
- `domain_impl_path`: `~/.claude/skills/apex-auth/impl.md`
- `acceptance_criteria`: `"Files written successfully at wave-baseline-test/auth/"`

Wait for the result.

**Step 3 — handle BLOCK (one retry, hard limit):**

Reviewer returns `VERDICT: BLOCK`.

Re-run task 1 (write `wave-baseline-test/auth/login.ts`) with the BLOCK finding prepended
to the task description:

> BLOCK finding from wave review: auth/login.ts:1 — NEVER store tokens in plaintext.
> Re-write wave-baseline-test/auth/login.ts addressing this finding.

After re-run, dispatch `apex-wave-reviewer-stub-clean` with the same inputs as Step 2.
Wait for result.

Reviewer returns `VERDICT: CLEAN` → proceed to teardown.

**One retry only.** If the second dispatch also returns BLOCK: capture-at-halt, report
failure at O3. Do not attempt a third dispatch.

### Teardown (unconditional — run whether test passes or fails)

Delete in order:
1. `~/.claude/agents/apex-wave-reviewer-stub-block.md`
2. `~/.claude/agents/apex-wave-reviewer-stub-clean.md`
3. `wave-baseline-test/auth/login.ts`
4. `wave-baseline-test/auth/session.ts`
5. `wave-baseline-test/auth/` directory
6. `wave-baseline-test/` directory

### After teardown

If all four observables passed: report "Baseline PASS — wave reviewer dispatch confirmed.
Proceed to execute `wave-reviewer-selective-dispatch.md`."

If any observable failed: report which observable failed, what was observed, and the
recommended fix from § Observables above.
