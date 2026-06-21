# Spec: Validate the `dontAsk` classifier-SPOF mitigation — Phase 2 (real `wave_dispatch: workflow` build)

**Identity:** Empirically close Phase 2 of the dontAsk SPOF validation — prove a real workflow-dispatched
build runs end-to-end under `--permission-mode dontAsk` on DeepSeek, that the allowlist is complete vs a
real Verification Recipe (Probe E), and that workers spawned via `wave_dispatch: workflow` actually
**inherit** `dontAsk` (Probe F — the last open unknown). Phase 1 (Probes A–D) is done:
`docs/changes/done/validate-dontask-spof.md`, evidence `docs/probes/dontask-results.md`. Stack mirrors
Artemis's Python brain (apex-python: uv/ruff/mypy/pytest) so this doubles as a dry-run for real Artemis
builds. Background: [[classifier-gates-protected-path-edits]], [[dontask-probe-cleanup-paradox]].

**Key insight:** running the probe in a **throwaway project** makes the `permissions.allow` list
*project-local* (`<project>/.claude/settings.local.json`). Teardown = delete the project dir — there is
no global-settings cleanup, so the Phase-1 cleanup paradox does not recur.

---

## Intent
Build a minimal disposable Python project, then run a 2-worker `wave_dispatch: workflow` build inside it
under `dontAsk` on DeepSeek. Confirm: the recipe allowlist is complete (Probe E), the build completes with
zero prompts and zero classifier round-trips (Probe F1), and workers honor `dontAsk` rather than being
silently elevated to the classifier-gated path (Probe F2 — the discriminator for the open unknown).

## Key decisions
- **Throwaway project, not ~/artemis or APEX** — APEX is markdown-only (no recipe); a throwaway isolates
  the variable under test and makes the allowlist disposable (delete-the-dir teardown).
- **Python brain stack** (uv/ruff/mypy/pytest) — Windows/DeepSeek-runnable now; Swift is Mac-gated.
- **Setup + teardown run OUTSIDE `dontAsk`** (planning/Anthropic, reliable classifier). The `dontAsk`
  session can only *run* the probe — it cannot author its own allowlist or protected-path `.claude/` writes
  (this is the Phase-1 finding). Project-local allowlist means teardown is just `rm -rf` the project.
- **Two independent worker tasks** (separate module files) so the wave dispatches 2 parallel workers — the
  minimum that actually exercises worker isolation + `dontAsk` inheritance.
- **F2 reads the worker's *denial class*, not a file** — a worker attempting an off-list action returns the
  verbatim denial in its (always-allowed) summary string. Local "don't ask mode" text = inherited; a
  "cannot determine the safety" classifier message or a prompt/success = NOT inherited.

## Gotchas / edge cases
- `coding-mode --permission-mode dontAsk` launches in the **current directory** — operator must `cd` into
  the throwaway project first (§B), not run from APEX.
- `dontAsk` runs only `permissions.allow` + read-only Bash; **off-list = silent deny, no prompt**. The
  recipe commands take variable args, so allow them as **prefix/pattern** rules (`Bash(uv:*)`), never
  exact strings. Probe E's whole job is to confirm `:*` admits the real arg-bearing invocations.
- `enableWorkflows: true` is already set globally (`~/.claude/settings.json`, session 52) — no toggle needed.
- The throwaway project needs `docs/status.md` with `stack_skills: [apex-python]` so apex-code reads the
  apex-python Verification Recipe.
- If Probe A's symptom ("cannot determine the safety") appears **anywhere** in §B, STOP — the mitigation
  isn't holding; re-check the launch mode/flag before trusting `dontAsk` for real builds.

---

## §A — Setup — ✅ PRE-APPLIED (planning, session 55)

Already scaffolded + verified at `C:/Users/User/apex-dontask-probe/`: files below created, `uv sync` run
(venv materialised), and the seed recipe is **fully green** (`uv run pytest -q` · `uv run ruff check .` ·
`uv run mypy src` all pass). The `dontAsk` session starts directly at §B. (Listed here for reproducibility.)

1. **`C:/Users/User/apex-dontask-probe/pyproject.toml`**
   ```toml
   [project]
   name = "apex-dontask-probe"
   version = "0.0.0"
   requires-python = ">=3.11"
   dependencies = []

   [dependency-groups]
   dev = ["pytest>=8", "mypy>=1.10", "ruff>=0.5"]

   [tool.uv]
   package = false

   [tool.ruff]
   line-length = 100

   [tool.mypy]
   strict = true
   files = ["src"]

   [tool.pytest.ini_options]
   pythonpath = ["src"]
   ```
2. **`C:/Users/User/apex-dontask-probe/src/probe/__init__.py`** — empty file.
3. **`C:/Users/User/apex-dontask-probe/src/probe/calc.py`**
   ```python
   def add(a: int, b: int) -> int:
       return a + b
   ```
4. **`C:/Users/User/apex-dontask-probe/tests/test_calc.py`**
   ```python
   from probe.calc import add


   def test_add() -> None:
       assert add(2, 3) == 5
   ```
5. **`C:/Users/User/apex-dontask-probe/docs/status.md`** — minimal:
   ```markdown
   # Project: apex-dontask-probe (throwaway)
   stack: Python
   token_profile: lean
   autonomy_level: L3
   specialists_default: []
   stack_skills: [apex-python]
   coder_tier_policy: flash
   <!-- CODING:START -->
   ## In-Flight
   | What | Mode | State | File | Stopped at | Uncommitted |
   |------|------|-------|------|------------|-------------|
   <!-- CODING:END -->
   ```
6. **`C:/Users/User/apex-dontask-probe/docs/changes/add-ops.md`** — the build the probe runs (2 independent waves-of-one-each → 2 parallel workers):
   ```markdown
   ---
   status: ready
   wave_dispatch: workflow
   coder_tier: flash
   ---
   # Spec: add two independent ops modules

   ## Intent
   Add two independent operation modules, each with a test. Independent files → parallel workers.

   ## Tasks
   1. Create `C:/Users/User/apex-dontask-probe/src/probe/mathops.py` with
      `def multiply(a: int, b: int) -> int: return a * b`, and
      `C:/Users/User/apex-dontask-probe/tests/test_mathops.py` asserting `multiply(2, 3) == 6`.
      — done when: `uv run pytest -q tests/test_mathops.py` passes.
   2. Create `C:/Users/User/apex-dontask-probe/src/probe/textops.py` with
      `def shout(s: str) -> str: return s.upper() + "!"`, and
      `C:/Users/User/apex-dontask-probe/tests/test_textops.py` asserting `shout("hi") == "HI!"`.
      — done when: `uv run pytest -q tests/test_textops.py` passes.

   ## Wave plan
   Wave 1: [task 1, task 2]   # independent files, no shared edits

   ## Files to change
   - src/probe/mathops.py (create) · tests/test_mathops.py (create)
   - src/probe/textops.py (create) · tests/test_textops.py (create)
   ```
7. **`C:/Users/User/apex-dontask-probe/.claude/settings.local.json`** — the complete project-local allowlist:
   ```json
   {
     "permissions": {
       "allow": [
         "Write(C:/Users/User/apex-dontask-probe/**)",
         "Edit(C:/Users/User/apex-dontask-probe/**)",
         "Bash(uv:*)",
         "Bash(uv run:*)",
         "Bash(pytest:*)",
         "Bash(ruff:*)",
         "Bash(mypy:*)"
       ],
       "deny": []
     }
   }
   ```
8. Run once (any non-`dontAsk` session) to materialise the venv so the recipe is runnable:
   `cd C:/Users/User/apex-dontask-probe && uv sync` → expect a `.venv` + lockfile, exit 0.

## §B — Probe (relaunch in the project, `dontAsk`)

```powershell
cd C:/Users/User/apex-dontask-probe
coding-mode --permission-mode dontAsk
```
Then tell the agent: **"run the validate-dontask-spof-phase2 probe."** Record every result in
`C:/Users/User/apex-dontask-probe/docs/probes/phase2-results.md` (allow-listed under the project tree):
action, exact tool result/error text, PASS/FAIL.

### Probe E — allowlist completeness vs the apex-python recipe
1. Run each Verification Recipe command in turn: `uv sync`, `uv run ruff check .`, `uv run mypy src`,
   `uv run pytest -q`.
2. **Expected (PASS):** each runs (no permission denial, no "cannot determine the safety"); the recipe is
   green on the seed project.
3. For any command **denied**, log the exact text and the pattern rule that fixed it (exact-string vs `:*`).
→ Tells us whether `Bash(<cmd>:*)` prefix rules suffice for real arg-bearing recipe invocations.

### Probe F1 — `wave_dispatch: workflow` build completes with no classifier
1. Build `docs/changes/add-ops.md` (the apex-code workflow-dispatch path; 2 parallel workers).
2. **Expected (PASS):** both workers create their module + test, verification runs green, **zero permission
   prompts**, **zero "cannot determine the safety"** anywhere, the build completes and `uv run pytest -q`
   passes for all 4 tests.
→ Proves a normal build works end-to-end under `dontAsk` (claim 2).

### Probe F2 — worker `dontAsk` inheritance (the open unknown)
1. Run a one-task `wave_dispatch: workflow` build whose single worker task is: **attempt
   `Bash(node -e "console.log(1)")` (deliberately off-list) and return the verbatim permission-denial text
   in your summary; do not write any file.**
2. **Expected (PASS):** the worker's returned text is a **local** denial — contains "don't ask mode" (or an
   equivalent local "not permitted"), and does **NOT** contain "cannot determine the safety" and is **not** a
   prompt or a success.
3. **FAIL signal:** the worker reports a classifier message, a prompt, or the action **succeeded** → workers
   are NOT inheriting `dontAsk` (silently elevated) — STOP and record; real builds would re-expose the SPOF
   through the worker path.
→ Resolves whether `wave_dispatch: workflow` workers honor the parent's `dontAsk` (docs say auto-mode ignores
   a subagent's frontmatter `permissionMode`, so this must be observed, not assumed).

## §C — Teardown (any non-`dontAsk` session)
1. `rm -rf C:/Users/User/apex-dontask-probe` (or PowerShell `Remove-Item -Recurse -Force`). The project-local
   allowlist dies with it — **no global-settings cleanup needed**.
2. Copy `phase2-results.md` to `C:/Users/User/apex/docs/probes/` first if you want to retain the evidence in
   the APEX repo before deleting.

---

## Acceptance criteria
| # | Check | Pass condition |
|---|-------|----------------|
| 1 | Probe E | Every recipe command runs (or is logged with the `:*` pattern rule it needed); seed recipe green |
| 2 | Probe F1 | 2-worker workflow build completes; all 4 tests pass; zero prompts; **no** "cannot determine the safety" anywhere |
| 3 | Probe F2 | Worker's off-list attempt returns a **local** "don't ask mode" denial — no classifier message, no prompt, no success |
| 4 | Teardown | `apex-dontask-probe/` deleted; no probe residue in APEX's `.claude/settings.local.json` |

## Notes
- Phase 2 is the `coding-session`-gated proving run flagged in `docs/status.md` Open Questions and the
  session-54/55 handoffs. On completion, fold the Probe E pattern-rule finding + the F2 inheritance result
  back into `apex-code` step 1a (the `dontAsk` build-mode guidance) if they change it, and update the SPOF
  Open Question to fully RESOLVED.
- If F2 shows workers do **not** inherit `dontAsk`, that is a real finding — route it to a follow-up spec
  (worker-mode propagation), do not paper over it.

---

## §D — Re-run after the session-55 allowlist block (added session 56) — DO THIS FIRST NEXT SESSION

First Phase-2 run (evidence: `docs/probes/phase2-results.md`): **E PASS**; **F1/F2 INCONCLUSIVE** — the
seed allowlist (§A item 7) never included the orchestration tools, so `Workflow`/`Skill` were denied and
no worker ever spawned. Key read: both denials were the **local** `"…running in don't ask mode"` form,
**not** `"cannot determine the safety"` — so these tools are gated by `permissions.allow`, **not the
classifier**. Allowlisting them should unblock the path; SPOF stays eliminated.

**Prep (planning / non-`dontAsk` — the `dontAsk` session can't author its own allowlist, [[dontask-probe-cleanup-paradox]]):**
1. Expand `C:/Users/User/apex-dontask-probe/.claude/settings.local.json` `allow` with the orchestration
   tools (over-allow is fine in a throwaway):
   ```json
   "Workflow(*)", "Agent(*)", "Task(*)", "Skill(*)"
   ```
2. Reset the 4 manually-created files so the F1 workflow build has real work to dispatch (leave the seed
   `calc.py` / `test_calc.py` intact):
   `rm src/probe/mathops.py src/probe/textops.py tests/test_mathops.py tests/test_textops.py`
   (PowerShell: `Remove-Item` those 4). Optionally clear `__pycache__`.
3. Confirm the seed recipe is still green (`uv run pytest -q` → 1 passed; `uv run ruff check .`; `uv run mypy src`).

**Re-run (relaunch in the project, `dontAsk`):** `cd C:/Users/User/apex-dontask-probe && coding-mode --permission-mode dontAsk`,
then re-run §B Probe F1 (the real `wave_dispatch: workflow` build of `add-ops.md`) and Probe F2 (worker
off-list-denial class). F2 is the only genuinely open unknown — worker `dontAsk` inheritance.

**If F1 still blocks** with a `"cannot determine the safety"` (classifier) message rather than a local
denial after allowlisting → that *is* the separate architectural finding (orchestration inherently needs
the classifier under `dontAsk`); STOP and record — do not paper over it.
