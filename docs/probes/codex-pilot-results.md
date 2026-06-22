# Codex integration pilot — results (ADR-026 P2)

Date: 2026-06-22 (session 60). Host: Windows 11, `codex-cli 0.141.0`, ChatGPT auth, model `gpt-5.5`.
Throwaway repo: `~/codex-pilot-tmp` (git-init'd, torn down after).

## Verdict: BOTH halves of the pipeline PROVEN end-to-end on this host. ✅

### Test 1 — Codex as ceiling coder (`--sandbox workspace-write`)
Prompt (piped via stdin): create `calc.py` (`add(a,b)→a+b`) + `test_calc.py` (pytest), touch only those two.
- **Result:** Codex created exactly `calc.py` + `test_calc.py`, left `README.md` untouched, ~2.6k tokens.
- **Independent verify:** `python -m pytest -q` → `1 passed`. ✅

### Test 2 — Codex as cross-model reviewer (`--sandbox read-only --output-schema`)
Reviewed a deliberately-buggy `calc.py` (`return a - b`) against the criterion "add(2,3)==5".
- **Result:** schema-valid JSON, correct verdict:
  `{"findings":[{"severity":"BLOCK","file":"calc.py","line":2,"rationale":"returns a-b not a+b → add(2,3)=-1 not 5"}],"verdict":"BLOCK"}`.
  Written to `review.json` via `-o`; `ConvertFrom-Json` valid; ~9.5k tokens. ✅

## Two bugs the pilot caught (both fixed in the shipped artifacts)
1. **`codex exec` HANGS when the prompt is passed as a positional arg** in a non-interactive shell —
   it keeps reading stdin (`"Reading additional input from stdin..."`) and never reaches EOF, so it
   blocks forever. **Fix: pipe the prompt via stdin** (`printf '%s' "<prompt>" | codex exec …`). Both
   the coder and reviewer invocations in `apex-code/SKILL.md` + `references/codex-review.md` were
   updated from bare-arg → piped stdin. *(This was the cause of the two initial pilot stalls.)*
2. **The findings schema failed OpenAI strict structured-output mode** (HTTP 400:
   `'required' … must include every key in properties. Missing 'line'`). Strict mode requires every
   property in `required`. **Fix:** `codex-review-schema.json` now lists all properties in `required`
   with `line`/`criterion` as nullable (`["integer","null"]` / `["string","null"]`).

## Net
The integrated pipeline (DeepSeek/Codex build → family-aware Codex/Opus review) is **wired AND proven**
on Windows. Two corrections folded back into the artifacts. The full APEX→Codex migration remains a
separate, larger, un-decided question (see `docs/research/codex-migration/`).
