# Live-Test Protocol — apex-code session-start reads `stack_skills` + loads the bound recipe

Closes **gap #2** from handoff `docs/handoff/2026-05-31.md` (Cluster-5 pilot): the `stack_skills`
binding read + recipe load assumed by **ADR-005 / ADR-006** was never exercised by a real
`apex-code` session (the pilot read it manually). This protocol is the runnable DeepSeek test.

> **Backend:** must run on **DeepSeek (coding mode)** — `ANTHROPIC_BASE_URL` contains `deepseek`.
> Planning mode (Anthropic) cannot run it; the PreToolUse gate blocks source writes and the
> apex-code recipe loop is coding-mode behaviour. Re-runnable as a regression test.

---

## Static pre-check — already PASS (planning mode, 2026-05-31)

Verified before this protocol was written; recorded here so this doc is the single gap-#2 record.

| Check | Result |
|-------|--------|
| Producer→consumer format chain identical (`stack_skills: [...]` in status.md frontmatter) across `apex-init` L97, `apex-stack` L137, `apex-orchestrate` L41, `apex-code` L26 | ✅ PASS |
| Consumer instructions exist & unambiguous (`apex-code` SKILL.md session-start step 2 + recipe-load L128–135) | ✅ PASS |
| Artifact the consumer loads exists (`~/.claude/skills/apex-nextjs/impl.md` → `## Verification Recipe`, L115) | ✅ PASS |

Format drift — the most likely cause of a failed live run — is ruled out. What remains is the
**behavioural run**: a real DeepSeek apex-code session loading and running the bound recipe.

---

## What this test proves

1. **The read** — apex-code session-start step 2 reads `stack_skills` from `status.md` frontmatter.
2. **The load** — at AFK-build pre-flight, apex-code loads the `## Verification Recipe` from the
   bound skill's `impl.md` (not from spec-carried commands).
3. **The run + provenance** — the verify step runs the **apex-nextjs** recipe
   (`npx tsc --noEmit` → `npm run lint` → `npm run build`) and does **not** log the
   "no recipe available" fallback gap (apex-code L133–135).

**The discriminator** (why the fixture spec carries *no* `## Commands to run`):

| Binding state | apex-code behaviour | Observable |
|---------------|---------------------|------------|
| `[apex-nextjs]` read correctly | loads recipe from apex-nextjs, runs it, attributes provenance | recipe runs, **no gap logged** → **PASS** |
| treated as `[]` (read failed) + no spec commands | best-effort typecheck/build + **logs "no recipe available"** | gap logged in decisions → **FAIL** |

---

## Fixture setup (run on DeepSeek backend, once)

All commands from a scratch directory outside the APEX repo. The Next.js scaffold is real so the
recipe actually runs green (no recovery-loop noise); the pilot confirmed this builds clean.

### 1. Scaffold a minimal Next.js app

```bash
cd /c/Users/User/   # or any scratch parent
npx create-next-app@latest stack-binding-test --ts --eslint --app --no-src-dir --no-tailwind --use-npm --yes
cd stack-binding-test
npm run build   # confirm baseline scaffold builds clean before the test
```

### 2. Seed `docs/status.md` WITH the binding

Create `stack-binding-test/docs/status.md` exactly:

```markdown
# Project: stack-binding-test (throwaway fixture)

stack: Next.js / TypeScript
token_profile: balanced
autonomy_level: L2
specialists_default: []
stack_skills: [apex-nextjs]
backends: planning=claude | coding=deepseek-v4-flash

_Last updated by planning mode:_ 2026-05-31

<!-- CODING:START -->
## In-Flight
| What | Mode | State | File | Stopped at | Uncommitted |
|------|------|-------|------|------------|-------------|
<!-- CODING:END -->

<!-- PLANNING:START -->
## Pending Specs
| Spec | Summary |
|------|---------|
| add-sum-util | Add a pure sum() utility (recipe-provenance probe). |
<!-- PLANNING:END -->
```

### 3. Seed the trivial spec — `docs/changes/add-sum-util.md`

> Deliberately has **no `## Commands to run`** section — this is what makes the discriminator clean.

```markdown
# add-sum-util

Identity: add one pure TypeScript utility function. Probe for apex-code recipe provenance.

## Assumptions
- The project is a Next.js App Router app with TypeScript strict mode. → impact: Caution

## Files to Change
- create `lib/sum.ts`

## Tasks
- **Task 1** — create `lib/sum.ts` exporting a pure `sum`.
  done when: `lib/sum.ts` exists and the verification recipe passes.

## Exact changes
`lib/sum.ts` (new):
\`\`\`ts
export function sum(a: number, b: number): number {
  return a + b;
}
\`\`\`

## Acceptance criteria
- Step: create `lib/sum.ts` → verify: file exists with the exact `sum` signature above.
- Step: run the bound verification recipe → verify: typecheck, lint, and build all exit 0.

## Permissions
- file_writes: `lib/sum.ts`
- commands: `npx tsc --noEmit`, `npm run lint`, `npm run build`
- git_ops: none
- network: none
```

---

## Run steps (DeepSeek backend, in `stack-binding-test/`)

1. **Bare session-start.** Start a fresh apex-code session (invoke the orchestrator / apex-code).
   Let it run its session-start (git log, read status.md, list specs).
2. **Observe the read (O1).** The session-start report / state line should now echo the binding
   automatically: `Stack: [apex-nextjs]` (no probe needed — `apex-code` ≥1.5.1 /
   `apex-orchestrate` ≥1.1.4). If absent, that's an O1 fail.
3. **Start the build (O2/O3).** Say: *"start build add-sum-util"*.
   Let it run pre-flight → execute Task 1 → run the verify step.
4. **Probe provenance if not already stated:** *"State the source of the verification commands you
   just ran."* Expected: **apex-nextjs** Verification Recipe (binding), not spec/best-effort.
5. Read the resulting `docs/handoff/<date>.md` and the In-Flight / decisions table.

---

## Acceptance checklist

| # | Observable | PASS condition | FAIL condition |
|---|-----------|----------------|----------------|
| O1 | Binding read + surfaced at session-start | session-start report / state line shows `Stack: [apex-nextjs]` (echoed automatically — `apex-code` ≥1.5.1, `apex-orchestrate` ≥1.1.4) | Shows `Stack: none` / `[]`, or omits it |
| O2 | Recipe loaded from binding | Verify step runs `npx tsc --noEmit`, `npm run lint`, `npm run build` (the apex-nextjs recipe) | Runs unrelated/generic commands, or asks the user what to run |
| O3 | Provenance correct (the discriminator) | apex-code attributes the commands to the **apex-nextjs** recipe; **no** "no recipe available" gap in the decisions table | Decisions table logs "no recipe available — best effort" |
| O4 | Build converges green | Task 1 done; recipe exits 0; spec moved to `docs/changes/done/` | Recipe fails on the trivial change (would indicate a recipe defect, not a binding defect) |

**Test PASSES** iff **O2 + O3** both hold (O2 = recipe loaded, O3 = correct provenance, no gap log).
O1 is corroborating; O4 confirms the recipe itself is still green (already proven by the pilot).

---

## Observability note (fixed 2026-05-31)

Originally session-start read `stack_skills` but never printed it, so O1 was only indirectly
observable. Now fixed: `apex-orchestrate` v1.1.4 echoes `Stack: {…}` in the Step 6 / governance
state line, and `apex-code` v1.5.1 echoes it in the session-start report. O1 is now a direct
observable. O3 (recipe provenance / no gap log) remains the authoritative proof of the read+load.

---

## Recording the result

- **PASS** → note in the session handoff that gap #2 is closed (live-validated); mark ADR-005/006
  `stack_skills` read+load path empirically GREEN. Delete the throwaway `stack-binding-test/` dir.
- **FAIL** → capture which observable failed + the apex-code output, file under
  `docs/changes/` as a fix spec against `apex-code` (recipe-load path) or `apex-stack` (binding write).

## Teardown

```bash
rm -rf /c/Users/User/stack-binding-test
```
