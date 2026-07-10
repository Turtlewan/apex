---
spec: gpt56-b2-dispatch-pack
status: ready
token_profile: balanced
autonomy_level: L2
coder_effort: medium
---

# Spec: Phase B2 — Codex dispatch pack + JSON completion contract

**Identity:** Replaces the bare-text `▸codex` coder prompt with the four-slot dispatch pack (Goal → Context → Constraints → Done-when) and schema-constrains the final message, incl. blocked-vs-paused routing.
→ why: see docs/technical/adr/ADR-031-codex-context-propagation.md

## Intent
- **Intent:** the enforcement layer (impl-core rules, spec intent, resolved decisions) actually travels to the Codex subprocess, and the host gets a machine-readable completion instead of free prose.
- **Invariants:** apex-code SKILL.md stays ≤500 lines; the dispatch command stays identical in SKILL.md and `references/codex-observability.md`; the schema follows the proven strict-mode shape (`additionalProperties: false`, every property required, nullability via type arrays — the codex-review pilot lesson); `status: blocked` routes to Forks, never to the Opus fallback.
- **Non-goals:** no Sol escalation rung (Phase C), no review-routing changes (Phase C), no `.agents/skills` cards (B3), no changes to the pulse mechanism or parallel-dispatch mechanics.

## Assumptions
- `~/.claude/skills/apex-code/SKILL.md` is exactly 500 lines and contains the anchor substrings quoted in Task 3 verbatim → impact: Stop
- `--output-schema` composes with `--json` + `-o` on codex-cli 0.144.1 (schema constrains the final message; `--json` streams events) → impact: Caution — Task 5 probes this cheaply on Luna before the contract is relied on
- This spec writes to BOTH `~/.claude` and `~/apex` (SKILL-HISTORY). Codex execution needs two dispatch roots; Claude-direct execution unaffected → impact: Caution

Simplicity check: considered folding the pack rules into the existing SKILL.md dispatch bullet — rejected: the bullet is already the file's densest line and the file is at the 500-line cap; the pack template + routing table are per-dispatch reference material, exactly what `references/` is for. SKILL.md keeps one pointer line.

## Prerequisites
- Specs that must be complete first: `gpt56-b1-planning-surface` (owns `~/apex/SKILL-HISTORY.md`; also lands the spec-template `## Intent` block the pack's Context slot consumes — the pack degrades gracefully when a spec has no Intent block)
- Environment setup required: none

## Files to Change
| File | Operation | Notes |
|------|-----------|-------|
| `C:\Users\User\.claude\skills\apex-code\references\codex-completion-schema.json` | create | strict-mode completion contract |
| `C:\Users\User\.claude\skills\apex-code\references\dispatch-pack.md` | create | pack template + hazard selection + autonomy clause + completion routing |
| `C:\Users\User\.claude\skills\apex-code\SKILL.md` | modify | dispatch line → pack + schema; fallback routing nuance; version 1.28.0 |
| `C:\Users\User\.claude\skills\apex-code\references\codex-observability.md` | modify | recipe command sync |
| `C:\users\user\apex\SKILL-HISTORY.md` | modify | prepend 1 row |

## Tasks

- [ ] **Task 1: create the completion schema** — files: `C:\Users\User\.claude\skills\apex-code\references\codex-completion-schema.json` — done when: file exists with exactly:

  ```json
  {
    "type": "object",
    "additionalProperties": false,
    "properties": {
      "status": { "type": "string", "enum": ["done", "done_with_concerns", "blocked"] },
      "changed_files": { "type": "array", "items": { "type": "string" } },
      "commands_run": {
        "type": "array",
        "items": {
          "type": "object",
          "additionalProperties": false,
          "properties": {
            "command": { "type": "string" },
            "result": { "type": "string", "enum": ["pass", "fail", "not_run"] },
            "detail": { "type": ["string", "null"] }
          },
          "required": ["command", "result", "detail"]
        }
      },
      "deviations": { "type": "array", "items": { "type": "string" } },
      "unresolved": { "type": "array", "items": { "type": "string" } },
      "blocker": { "type": ["string", "null"] }
    },
    "required": ["status", "changed_files", "commands_run", "deviations", "unresolved", "blocker"]
  }
  ```

  (No "paused" status by design — paused is a *process-level* state the host detects from exit code + log tail; a quota-killed Codex cannot report its own death.)

- [ ] **Task 2: create the dispatch-pack reference** — files: `C:\Users\User\.claude\skills\apex-code\references\dispatch-pack.md` — done when: file exists with exactly this content:

  ````markdown
  # Codex dispatch pack (every ▸codex coder dispatch — ADR-031)

  The prompt piped to `codex exec` is never bare task text. Assemble this four-slot pack per task —
  it is how the enforcement layer reaches the coder: the impl cores load in the *host*, so the
  task-relevant rules must travel in the pack. **Read this file once per build** (like
  `references/permissions.md`) and reuse it for every dispatch that session — never re-read per task.

  ## Pack template

  ```
  ## Goal
  <task text verbatim>
  Done when: <the task's done-when clause>

  ## Context
  - Spec: <identity line>. Intent: <the spec's ## Intent block verbatim, if present>
  - Repo: <repo-relative pointers the task needs — module paths, the pattern-file to mirror>
  - Files for this task (authorized set — touch nothing else): <list>
  - Resolved decisions: <versions, lib choices, policy values from the spec — state them;
    never "adapt to the bound stack">

  ## Constraints
  - Surgical scope: only the files listed above; `git diff --stat` must show only those.
  - <3–7 task-relevant hazards — selection rule below>
  - <autonomy clause verbatim — below>

  ## Done-when
  - Acceptance criterion: <verbatim from the spec>
  - Verify: run <exact recipe commands for this task> — all green.
  - Final message: JSON per the completion contract (--output-schema): status, changed_files,
    commands_run (+results), deviations, unresolved, blocker.
  ```

  ## Hazard selection (the Constraints slot)

  - Source: the loaded impl cores (apex-coding-principles + bound stack NEVER/ALWAYS) + the spec's
    Specialist Context.
  - Pick **3–7 this task can actually violate** (a DB task gets the schema hazards, not the a11y
    rules). Never paste a whole NEVER/ALWAYS list.
  - Skip generic hygiene entirely (validation, HTTP codes, naming-in-general, DRY,
    no-silent-errors) — native to GPT-5.6; injecting it degrades output via instruction competition.
  - Phrase positively; check the assembled pack for internal consistency before dispatch
    (contradictions burn GPT-5 reasoning) — rewrite conflicts, never stack them.

  ## Autonomy clause (verbatim — closes the Constraints slot)

  "Follow AGENTS.md. Surgical scope — touch only the listed files. Work autonomously to
  completion: run the verify recipe, and if a test fails / lint errors / you hit a problem, fix it
  and re-run — do not stop to ask. Only end when the acceptance criterion passes, or you are
  genuinely blocked — then say exactly what blocked you. Safe local choice (make it, log it in
  deviations): which existing pattern to mirror, a local name. Blocker (report in `blocker`, don't
  improvise): an acceptance criterion that cannot pass as written, a needed file outside the
  authorized set, a missing credential."

  ## Completion routing (host reads exit code + `.final` JSON)

  | Signal | Meaning | Host action |
  |---|---|---|
  | `status: done` | complete | run the spec's Verification Recipe on the diff (trust but verify) → check the task off |
  | `status: done_with_concerns` | complete + flags | verify as above; copy `deviations` / `unresolved` into the decisions table |
  | `status: blocked` (+ `blocker`) | **spec defect** | route through Forks (capture-at-halt). Never model-fallback — a spec defect survives the swap |
  | non-zero exit / no valid `.final`, log tail shows a rate-limit / quota signature | **paused, not failed** | park the task + checkpoint In-Flight; operator choice: wait for quota reset (re-dispatch Codex) vs Opus fallback now |
  | non-zero exit, any other signature | process failure | one re-dispatch; if it repeats, treat as verify-fail (effort ladder → fallback) |
  | verify recipe fails on a `done` diff | verify-fail | effort-bump ladder (ADR-030) → Opus fallback per SKILL.md § Model fallback |
  ````

- [ ] **Task 3: apex-code SKILL.md — six exact edits** — files: `C:\Users\User\.claude\skills\apex-code\SKILL.md` — done when: all six applied, frontmatter bumped to `version: 1.28.0` / `last_updated:` today, `  - docs/technical/adr/ADR-031-codex-context-propagation.md` appended to `sources:`, and `wc -l` ≤ 500.

  **3a — dispatch command, prompt slot.** In the `▸codex` dispatch bullet's command line, replace the substring:
  ```
  "<task text + Files for this task + acceptance criterion + the autonomy clause below>"
  ```
  with:
  ```
  "<the dispatch pack — assemble per references/dispatch-pack.md>"
  ```

  **3b — dispatch command, schema flag.** In the same command line, replace the substring:
  ```
  --json -o <scratch>/codex-<task>.final
  ```
  with:
  ```
  --json --output-schema ~/.claude/skills/apex-code/references/codex-completion-schema.json -o <scratch>/codex-<task>.final
  ```

  **3c — autonomy-clause line → pack line.** Replace the whole line that begins:
  ```
       **Autonomy clause** (append to every coder prompt — config kills halt-to-escalate, this kills report-and-stop-by-disposition):
  ```
  (the full line, through `— then state exactly what blocked you."*`) with:
  ```
       **Dispatch pack (ADR-031)** — every coder prompt is the four-slot pack **Goal → Context → Constraints → Done-when**, assembled per `references/dispatch-pack.md`: spec `## Intent` block + authorized files + resolved decisions + 3–7 task-relevant hazards from the loaded impl cores + the autonomy clause (verbatim in that reference). The final message is schema-constrained (`references/codex-completion-schema.json`: status / changed_files / commands_run / deviations / unresolved / blocker) — route `status` per `references/dispatch-pack.md` § Completion routing; `blocked` = spec defect → Forks, never model-fallback.
  ```

  **3d — fallback section: paused-vs-failed nuance.** Immediately before the line starting `- **Effort bump first (ADR-030):**`, insert:
  ```
  - **Completion-contract routing first (ADR-031):** a schema-valid `status: blocked` is a *spec* defect — Forks (capture-at-halt), never a model fallback. A process-level death (non-zero exit / no valid `.final`) with a rate-limit/quota signature in the log tail is **paused, not failed** — park + checkpoint In-Flight, then operator choice: wait for quota reset (re-dispatch Codex) vs Opus now. Only a genuine verify-fail enters the effort ladder below.
  ```

  **3e — line-cap offset.** Replace the two lines:
  ```
  Context note: each worker agent starts with a fresh ~200k context scoped to its assigned tasks.
  The main window stays lean. All shared state flows through spec files and git history — not handoff docs or conversation memory.
  ```
  with one line:
  ```
  Context note: each worker starts with a fresh ~200k context scoped to its tasks; the main window stays lean — shared state flows through spec files and git history only.
  ```

  **3f — line-cap offset (funds the `sources:` addition).** Replace the two lines:
  ```
  **Context discipline:** When executing a spec, read only that spec and the files it explicitly lists.
  Never load docs/handoff/, other pending specs, or ambient project documentation.
  ```
  with one line:
  ```
  **Context discipline:** when executing a spec, read only that spec and the files it explicitly lists — never docs/handoff/, other pending specs, or ambient project documentation.
  ```

- [ ] **Task 4: codex-observability.md — sync the recipe** — files: `C:\Users\User\.claude\skills\apex-code\references\codex-observability.md` — done when: (a) the `## Recipe` code block reads:
  ```
  printf '%s' "<dispatch pack>" | codex exec -p apex-coder --sandbox workspace-write -m gpt-5.6-terra \
    -c model_reasoning_effort="<effort>" \
    -C <repo-or-worktree> --json \
    --output-schema ~/.claude/skills/apex-code/references/codex-completion-schema.json \
    -o <scratch>/codex-<task>.final --color never \
    > docs/progress/codex-<task>.log 2>&1
  ```
  and (b) the `-o <…>.final` bullet reads:
  ```
  - `-o <…>.final` → the schema-constrained completion JSON (ADR-031: status / changed_files /
    commands_run / deviations / unresolved / blocker). **The host reads this** (small) on completion,
    plus the exit code and `git diff --stat`, and routes `status` per
    `references/dispatch-pack.md` § Completion routing. Codex's own tokens are unchanged: the events
    already exist; `--json` only emits them.
  ```

- [ ] **Task 5: probe the flag composition (cheap, Luna)** — files: none (scratch only) — done when: the command below exits 0 and the output file parses as schema-valid JSON:
  ```
  printf '%s' "Do nothing. Reply with a completion message: status done, empty changed_files, empty commands_run, empty deviations, empty unresolved, null blocker." | codex exec -c approval_policy="never" --sandbox read-only -m gpt-5.6-luna --json --output-schema ~/.claude/skills/apex-code/references/codex-completion-schema.json -o /tmp/codex-schema-probe.final --color never > /tmp/codex-schema-probe.log 2>&1
  ```
  If the flags conflict (non-zero exit citing `--output-schema`/`--json` incompatibility): STOP, log to Blocked Actions — the contract design needs planning revision, do not ship Tasks 3–4 partially.

- [ ] **Task 6: SKILL-HISTORY — prepend 1 row** — files: `C:\users\user\apex\SKILL-HISTORY.md` — done when: top data row is:
  ```
  | 2026-07-10 | apex-code | SKILL.md, references/dispatch-pack.md, references/codex-completion-schema.json, references/codex-observability.md | 1.28.0 | updated (SKILL) | Codex dispatch pack (Goal/Context/Constraints/Done-when) + JSON completion contract via --output-schema; blocked=spec-defect→Forks vs paused/retryable (quota) routing; recipe synced (ADR-031) | GPT-5.6×APEX report §3/§4, ADR-031, OpenAI dispatch-shape docs |
  ```

## Wave plan
Wave 1: [task 1, task 2, task 3, task 4] | Wave 2: [task 5, task 6]

## Permissions

### File Operations
| Action | Paths |
|--------|-------|
| Create | `C:\Users\User\.claude\skills\apex-code\references\codex-completion-schema.json`, `C:\Users\User\.claude\skills\apex-code\references\dispatch-pack.md` |
| Modify | `C:\Users\User\.claude\skills\apex-code\SKILL.md`, `C:\Users\User\.claude\skills\apex-code\references\codex-observability.md`, `C:\users\user\apex\SKILL-HISTORY.md` |
| Delete | (none) |

### Commands
| Command | Purpose |
|---------|---------|
| `wc -l ~/.claude/skills/apex-code/SKILL.md` | 500-line cap check |
| `codex exec … --output-schema … -o …` (Task 5, exact form above) | flag-composition probe, read-only sandbox, Luna |

### Git Operations
(none — host/owner commits)

### Environment Access
(none)

### Network
| Action | Purpose |
|--------|---------|
| `codex exec` (Task 5) | one Luna API round-trip on existing ChatGPT auth |

## Specialist Context
### Skill-author conformance (apex-skill-author)
- Iron Law: applied at the **lightweight tier per the standing user convention** (memory `iron-law-application-depth`): convention/structural wiring edits ship on documented RED evidence; full RED/GREEN dogfood is reserved for new-domain/gate-emphasis skills. RED evidence here = the current dispatch prompt provably carries none of the enforcement layer (GPT-5.6×APEX report §3); the schema strict-mode shape reuses the empirically pilot-fixed codex-review pattern. GREEN = the first `▸codex` build after landing is the proving run (ADR-031 § Consequences). Deviation from the literal "no exceptions" Iron Law wording **explicitly accepted by planning** (spec-review FLAG resolution, session 65).
- 500-line cap. Verified line budget: `sources:` entry (+1) · Task 3d (+1) · Task 3e (−1) · Task 3f (−1) → **net 0, file stays at 500**; 3a–3c edit within existing lines.
- dispatch-pack.md read cadence: once per build, reused across dispatches (stated in the file's header) — mirrors the `references/permissions.md` pattern, not a per-task re-read.

## Documentation
| Doc type | File | Action |
|----------|------|--------|
| ADR | docs/technical/adr/ADR-031-codex-context-propagation.md | already written |
| History | ~/apex/SKILL-HISTORY.md | Task 6 |

## Acceptance Criteria
- [ ] Schema created → verify: `python -c "import json;json.load(open(r'C:\Users\User\.claude\skills\apex-code\references\codex-completion-schema.json'))"` exits 0; file contains `"additionalProperties": false`.
- [ ] Reference created → verify: `grep -n "## Completion routing" ~/.claude/skills/apex-code/references/dispatch-pack.md` hits; autonomy clause present verbatim.
- [ ] SKILL.md edited → verify: `grep -c "dispatch-pack.md" ~/.claude/skills/apex-code/SKILL.md` ≥ 2; `grep -n "output-schema" ~/.claude/skills/apex-code/SKILL.md` hits in the dispatch command; `grep -n "ADR-031" ~/.claude/skills/apex-code/SKILL.md` hits in `sources:`; the string "Autonomy clause" no longer appears in SKILL.md; `wc -l` ≤ 500; frontmatter `version: 1.28.0`.
- [ ] Observability recipe synced → verify: `grep -n "output-schema" ~/.claude/skills/apex-code/references/codex-observability.md` hits inside the Recipe block.
- [ ] Probe passed → verify: probe exit code 0 AND `codex-schema-probe.final` parses as JSON with a `status` field.
- [ ] History row prepended → verify: `head -20 ~/apex/SKILL-HISTORY.md` shows the 2026-07-10 apex-code 1.28.0 row.

## Progress
_(Coding mode writes here — do not edit manually)_
