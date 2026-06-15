# Flash RED-probe runbook — ponytail YAGNI ladder

**Run this in a DeepSeek (coding) session.** It is the authoritative version of the Haiku
proxy probe in [`README.md`](./README.md). Goal: does **DeepSeek Flash, cold**, produce
lean / YAGNI-conformant code, or over-engineer? If it's lean cold, the ponytail 6-rung
ladder is model-redundant and should NOT be absorbed. If it over-builds, the ladder earns
its place in `apex-coding-principles`.

---

## Hard isolation rules (or the probe is worthless)

1. **Run the three tasks as BARE dispatched subagents** (`general-purpose`), NOT as the
   apex-code build agent. Reason: apex-code pre-flight loads `apex-coding-principles` impl.md,
   which *contains* the simplicity rules — running there makes Flash lean for the wrong reason
   (contaminated probe). On the DeepSeek backend these subagents are Flash regardless.
2. **Paste each task prompt VERBATIM.** Do NOT prepend APEX rules, simplicity/YAGNI guidance,
   CLAUDE.md, or any project context. The prompts below already say "don't read project files."
3. **Do NOT judge the results in this session.** Capture raw output only. The absorb / don't-absorb
   decision is a planning-mode call. Your job here is dispatch + capture + write to disk.
4. **N = 3 independent runs per task** (Flash is stochastic; one run can't establish a tendency).
   That's 9 bare subagents total — dispatch in parallel, `run_in_background`.

---

## The three probe tasks (paste each verbatim, ×3)

### Task 1 — stdlib/one-liner trap (function scale)
> Implement this small task. Do not read any project files, docs, ADRs, or CLAUDE.md — this is a
> self-contained exercise. Just write the code. Task: In Python, write a function
> `group_by_first_letter(words: list[str]) -> dict[str, list[str]]` that groups a list of words
> into a dict keyed by each word's lowercased first letter. Empty strings are skipped. Return ONLY
> the code and one sentence on why you wrote it that way.

### Task 2 — YAGNI/abstraction trap (function scale)
> Implement this small task. Do not read any project files, docs, ADRs, or CLAUDE.md — this is a
> self-contained exercise. Just write the code. Task: In Python, implement
> `get_timeout(path: str) -> int` that reads a JSON file at `path`, returns the integer value of
> its `"timeout"` key, and returns 30 if the key is missing or the file does not exist. Return ONLY
> the code and one sentence on why you wrote it that way.

### Task 3 — structural/over-engineering trap (multi-file scale) — THE KEY ADDITION
> Implement this small task. Do not read any project files, docs, ADRs, or CLAUDE.md — this is a
> self-contained exercise. Just write the code. Task: In Python, write code to manage a to-do list:
> add a task, mark a task as done, and list the tasks that are not yet done. Use whatever structure
> you think is appropriate. Return ONLY the code and one sentence on why you structured it that way.

*(Task 3 is where over-engineering actually bites — the neutral "whatever structure you think
appropriate" invites premature abstraction. Lean = one small data structure + three functions
(or one tiny class). Over-built = Task class hierarchy + TaskManager + Repository + persistence +
status enums + CLI. This is the scale the Haiku function-only probe under-tested.)*

---

## Capture format

Write all raw outputs to `docs/research/headroom-ponytail/flash-probe-results.md` as:

```
## Task N — <name>
### Run 1
<verbatim code + the model's one-sentence rationale>
### Run 2
...
### Run 3
...
```

No commentary, no scoring, no verdict. Then tell the planning session: "Flash probe results are
in flash-probe-results.md." Planning judges each output lean-vs-over-built against the ladder and
makes the absorb call (updating README.md's net-yield line).

---

## What planning will decide from this (for context only — not your job here)

- **All/most runs lean (incl. Task 3 structural):** ladder confirmed model-redundant on the real
  coder → do NOT absorb; 0 skill edits; close the pass permanently.
- **Task 3 over-builds (≥ ~half the runs):** the ladder earns its place at structural scale →
  absorb the 6 rungs (text only) into `apex-coding-principles`, drop the persona framing.
