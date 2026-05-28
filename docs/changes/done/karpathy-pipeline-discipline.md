# Spec: Karpathy Discipline — Baked Into Planning and Coding Pipeline

## Scope

Implements Andrej Karpathy's four engineering discipline principles as structural
checkpoints in the APEX pipeline — not guidelines, but mandatory gates that run
at defined moments. Changes four files:

1. `spec-template.md` — adds `## Assumptions` section and step→verify format for Acceptance Criteria
2. `apex-plan/SKILL.md` — adds Karpathy quality checks to the readiness gate (Deep Details)
   and a lightweight quality check for Light mode; adds assumptions-writing instructions
3. `apex-code/SKILL.md` — adds Karpathy Pre-Flight as a mandatory step inside AFK Build Mode
   and a lighter version inside Edit Mode
4. `~/.claude/CLAUDE.md` — adds one-line enforcement pointers under each of the four principles

The principles and their pipeline positions:
- Think Before Coding → planning (interpretation block) + coding (assumption verification)
- Simplicity First → planning (complexity challenge gate) + coding (per-task simplicity check)
- Surgical Changes → coding (scope lock — every touched file must trace to a spec task)
- Goal-Driven Execution → planning (step→verify acceptance criteria) + coding (per-task done-criteria)

---

## Prerequisites
- `spec-template-revision` must be executed first (removes `## Scope` from spec-template.md — this spec's insertion anchor depends on that)
- `apex-code-session-start` must be executed first (modifies apex-code/SKILL.md — this spec also touches that file)

## Files to change

| File | Operation | Notes |
|------|-----------|-------|
| `~/.claude/skills/apex-orchestrate/templates/spec-template.md` | Modify | Add `## Assumptions` section; update Acceptance Criteria format |
| `~/.claude/skills/apex-plan/SKILL.md` | Modify | Add Karpathy quality gate to readiness gate; add Light mode mini-gate; add assumptions-writing guidance in planning conversation |
| `~/.claude/skills/apex-code/SKILL.md` | Modify | Add Karpathy Pre-Flight inside AFK Build Mode; add lighter version for Edit Mode |
| `~/.claude/CLAUDE.md` | Modify | Add enforcement pointers under each of the four principles |

---

## Exact changes

---

### 1. `spec-template.md` — add `## Assumptions` and update Acceptance Criteria

**Note:** `spec-template-revision` (run first) removes `## Scope` and adds a split-rule comment after the frontmatter. The insertion anchor below reflects that — `## Scope` will not exist.

**Add `## Assumptions` section** between the split-rule comment and `## Prerequisites`:

```markdown
## Assumptions
<!-- Planning mode fills this. Coding mode verifies each item before executing. -->
<!-- Format: assumption → impact if wrong (Stop | Caution | Low) -->
- {Assumption 1} → impact: {Stop | Caution | Low}
- {Assumption 2} → impact: {Stop | Caution | Low}

<!-- Simplicity check (planning fills this): -->
<!-- "Is there a simpler spec? ___. Why this version: ___." -->
Simplicity check: {considered simpler approach? yes/no — if yes, why this version instead}
```

**Replace the existing `## Acceptance Criteria` section** with:

```markdown
## Acceptance Criteria
<!-- Use step→verify format. "Done" must be observable, not vague. -->
- [ ] {Step 1} → verify: {what to check — specific, observable}
- [ ] {Step 2} → verify: {what to check — specific, observable}
- [ ] {Step 3} → verify: {what to check — specific, observable}
```

**Also update the `## Tasks` format** to include a done-criteria hint:

```markdown
## Tasks
- [ ] Task 1: {description} — done when: {observable outcome}
- [ ] Task 2: {description} — done when: {observable outcome}
- [ ] Task 3: {description} — done when: {observable outcome}
```

---

### 2. `apex-plan/SKILL.md` — add Karpathy checks

#### A. Add to `## Planning conversation` section

After the existing "Ask clarifying questions one at a time" paragraph, add:

```markdown
### Think Before Speccing

Before writing any spec section, state your interpretation of the request explicitly.
If multiple interpretations are valid, present them — do not silently pick one.

> "I'm reading this as X. An alternative interpretation is Y. I'm going with X because Z.
> Does that match your intent?"

If something is genuinely unclear, stop. Name what's confusing. Do not fill in the gap
with an assumption that isn't written down somewhere — write it in `## Assumptions` instead.
```

#### B. Add to `## Writing the spec` — Deep Details mode

After the existing rules list ("Every file must have a full absolute path..." etc.), add:

```markdown
**Karpathy rules while writing:**
- Every `## Assumptions` item must say what happens if it's wrong (`Stop | Caution | Low`)
- Every `## Acceptance Criteria` item must use step→verify format — no vague criteria
- Every `## Tasks` item must have a "done when:" clause — observable, not "it works"
- Every file in `## Files to Change` must be strictly necessary — no speculative additions
```

#### C. Extend `## Readiness gate` — Deep Details only

After the existing `Questions` block, add a new block:

```markdown
Karpathy Quality Gate
  [ ] Assumptions: every non-obvious assumption is written in ## Assumptions with impact level
  [ ] Complexity challenge: "Is there a simpler spec that achieves the same goal?"
      — answered explicitly in the Simplicity check line of ## Assumptions
  [ ] Acceptance criteria: every item uses step→verify format — no item says "it works" or "it passes"
  [ ] Tasks: every item has a "done when:" clause
  [ ] Surgical scope: every file in ## Files to Change maps to at least one task
      — no file is listed "just in case" or "while we're in there"
  [ ] No task contains work beyond what was explicitly requested
```

If any Karpathy Quality Gate item fails: surface it, revise in-place, re-run gate.

#### D. Add Light mode quality check

In `## Writing the spec — Light mode`, before "Verify decisions are clear, then confirm with the user", add:

```markdown
**Light mode quality check (no gate, but run this before confirming):**
- Assumptions block written? Every non-obvious assumption stated.
- Is there a simpler intent that achieves the same goal? If so, write that.
- Every file listed in "Files to touch" is strictly necessary?
- Acceptance criteria (if any) use observable outcomes, not vague descriptions.

If any answer is "no": revise before confirming with user.
```

---

### 3. `apex-code/SKILL.md` — add Karpathy Pre-Flight

#### A. AFK Build Mode — add Karpathy Pre-Flight as step 6 of Pre-flight

The existing pre-flight has steps 1–5 (read spec, read token_profile, read permissions,
pre-authorise, package legitimacy check). Add step 6:

```markdown
6. **Karpathy Pre-Flight** — runs before any task is started:

   **a. Assumption verification (Think Before Coding)**
   Read every item in `## Assumptions`. For each:
   - Verify it against the codebase now (read the relevant file or run a check command)
   - If assumption holds → proceed
   - If assumption is wrong AND impact is `Stop` → halt, log to decisions table, report to user:
     "Pre-flight failed: assumption '{X}' is wrong. Spec needs revision. Stopping build."
   - If assumption is wrong AND impact is `Caution` → log to decisions table, note the deviation, proceed
   - If assumption is wrong AND impact is `Low` → log, proceed
   - If ## Assumptions section is missing → note it in decisions log, proceed (spec was written before this rule)

   **b. Simplicity sweep (Simplicity First)**
   For each task in ## Tasks, before implementing:
   - Estimate: could this task be done with significantly less code than the spec implies?
   - If yes: implement the simpler version. Log the decision:
     "Task N: simplified from [spec approach] to [simpler approach] — same acceptance criteria met."
   - Simpler is always preferred if acceptance criteria are still satisfied.
   - If spec says 200 lines and 50 lines does the job: write 50. Document why.

   **c. Surgical scope lock (Surgical Changes)**
   List every file you intend to touch. Cross-reference against ## Files to Change.
   - File in spec AND you need to touch it → proceed
   - File NOT in spec AND you need to touch it → log to blocked actions, do NOT touch it,
     flag in handoff as "needed but out of spec scope"
   - File in spec BUT you don't need to touch it → skip it (don't touch files that don't need changing)
   This scope lock persists for the entire build. Re-check before touching any file.

   **d. Per-task done-criteria (Goal-Driven Execution)**
   Before starting each task, state the done-criteria from the spec's "done when:" clause.
   If "done when:" is missing from the task: derive it from the acceptance criteria.
   After completing the task: verify the criterion before checking it off. No exceptions.
   "The task is done when it's verified, not when the code is written."
```

#### B. Edit Mode — add lighter Karpathy check

In `## Edit Mode`, after the first bullet point ("Single sequential execution..."), add:

```markdown
**Karpathy check for Edit Mode (runs before any file is touched):**
- State your interpretation of the edit request explicitly. If ambiguous, ask once.
- State the minimum change: "The smallest edit that achieves this is: ___"
- Confirm: every file you intend to touch is directly required by the edit.
- State what "done" looks like: "This edit is done when: [observable outcome]"
- After completing: verify the done-criteria before reporting finished.
```

---

### 4. `~/.claude/CLAUDE.md` — add enforcement pointers

Under each of the four existing principle sections, add an enforcement line.

**After `## 1. Think Before Coding` paragraph, add:**
```markdown
> **Pipeline enforcement:** planning mode states interpretations explicitly before writing specs
> (apex-plan); coding mode verifies every `## Assumptions` item against the codebase before
> executing (apex-code Karpathy Pre-Flight step a).
```

**After `## 2. Simplicity First` paragraph, add:**
```markdown
> **Pipeline enforcement:** planning mode runs a complexity challenge gate before finalising
> any spec (apex-plan readiness gate); coding mode prefers simpler implementations if
> acceptance criteria are still met (apex-code Karpathy Pre-Flight step b).
```

**After `## 3. Surgical Changes` paragraph, add:**
```markdown
> **Pipeline enforcement:** coding mode maintains a surgical scope lock for the entire build —
> any file not listed in the spec's `## Files to Change` is a blocked action
> (apex-code Karpathy Pre-Flight step c).
```

**After `## 4. Goal-Driven Execution` paragraph, add:**
```markdown
> **Pipeline enforcement:** specs use step→verify acceptance criteria format; coding mode
> states done-criteria before each task and verifies after (apex-code Karpathy Pre-Flight step d).
```

---

## Acceptance Criteria

- [ ] `spec-template.md` has `## Assumptions` section with impact format → verify: open the file and confirm section exists with `Stop | Caution | Low` notation
- [ ] `spec-template.md` Acceptance Criteria uses step→verify format → verify: `grep "verify:" spec-template.md` returns results
- [ ] `spec-template.md` Tasks use "done when:" format → verify: `grep "done when:" spec-template.md` returns results
- [ ] `apex-plan/SKILL.md` has "Think Before Speccing" block in Planning conversation section → verify: `grep "Think Before Speccing" apex-plan/SKILL.md` returns a result
- [ ] `apex-plan/SKILL.md` Readiness Gate contains "Karpathy Quality Gate" block → verify: `grep "Karpathy Quality Gate" apex-plan/SKILL.md` returns a result
- [ ] `apex-plan/SKILL.md` Light mode has quality check paragraph → verify: `grep "Light mode quality check" apex-plan/SKILL.md` returns a result
- [ ] `apex-code/SKILL.md` Pre-flight has step 6 "Karpathy Pre-Flight" with 4 sub-steps (a, b, c, d) → verify: `grep "Karpathy Pre-Flight" apex-code/SKILL.md` returns results; check a/b/c/d sub-steps present
- [ ] `apex-code/SKILL.md` Edit Mode has Karpathy check paragraph → verify: `grep "Karpathy check for Edit Mode" apex-code/SKILL.md` returns a result
- [ ] `~/.claude/CLAUDE.md` has "Pipeline enforcement:" lines under all four principles → verify: `grep "Pipeline enforcement" ~/.claude/CLAUDE.md | wc -l` returns 4

---

## Commands to run

```powershell
# Verify Assumptions section in spec template
Select-String -Path "$env:USERPROFILE\.claude\skills\apex-orchestrate\templates\spec-template.md" -Pattern "Assumptions"

# Verify Karpathy Pre-Flight in apex-code
Select-String -Path "$env:USERPROFILE\.claude\skills\apex-code\SKILL.md" -Pattern "Karpathy Pre-Flight"

# Verify Karpathy Quality Gate in apex-plan
Select-String -Path "$env:USERPROFILE\.claude\skills\apex-plan\SKILL.md" -Pattern "Karpathy Quality Gate"

# Verify enforcement pointers in global CLAUDE.md
(Select-String -Path "$env:USERPROFILE\.claude\CLAUDE.md" -Pattern "Pipeline enforcement").Count
# Expected: 4
```

---

## Risks / open questions

- **Existing specs** in `docs/changes/` don't have `## Assumptions` sections. The coding mode
  pre-flight handles this gracefully: "If ## Assumptions section is missing → note in decisions
  log, proceed." No retro-fitting of old specs required.
- **Assumption verification depth:** some assumptions require reading multiple files to verify.
  Coding mode should timebox this to what's needed for `Stop`-level assumptions only — `Caution`
  and `Low` can proceed on faith.
- **Simplicity check tension:** if the spec author (planning mode) has already done the simplicity
  challenge, coding mode doing it again is redundant. The value is as a second pass, not a
  contradiction of the spec. The rule is: "simpler is preferred *if acceptance criteria are still
  met*" — the spec's acceptance criteria are the contract.
- **CLAUDE.md edit:** this is the global file at `~/.claude/CLAUDE.md`. The enforcement pointer
  lines are purely additive — one line under each existing section. No existing content changes.
