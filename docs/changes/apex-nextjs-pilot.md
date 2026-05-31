# Spec: apex-nextjs pilot — validate the buildability layer end-to-end

**Identity:** Cluster 5 of the buildability-layer roadmap — author the first stack skill
(`apex-nextjs`) and **prove clusters 1–4 work end-to-end by running them against a real Next.js
app**. See ADR-005 (stack-skill family) and ADR-006 (verification inversion).

**Mode:** Coding (DeepSeek). This spec is executed in coding mode because its core deliverable —
a `## Verification Recipe` proven by *running* it, plus an exercised build loop — requires
executing commands against a real project. Planning cannot close it (a doc-sourced recipe is
forbidden by the cluster-1 rule).

**Pre-requisite flag (resolve before building):** `apex-nextjs`'s *best-practice content* is
judgment-heavy (Server/Client boundaries, Server-Action security, caching model) — DeepSeek's
weak area. **Recommended:** a planning (Claude) session pre-drafts `apex-nextjs/SKILL.md` +
`impl.md` content first, referencing `apex-skill-author` (stack-skill family rules) + `context7`,
leaving the `## Verification Recipe` marked `DRAFT — unvalidated`. This spec then *validates and
corrects* the recipe and exercises the loop. If no pre-draft exists, Task 2 authors the content
in-session against `apex-skill-author` + `context7` (higher risk; flag any judgment calls back to
planning per the apex-figma pattern).

---

## Files to change

| Path | Op | Notes |
|------|----|-------|
| `C:\Users\User\apex-nextjs-pilot\` (whole dir) | create | Throwaway Next.js app (scaffolded; not committed to either skills repo) |
| `C:\Users\User\apex-nextjs-pilot\docs\status.md` | create | Minimal — carries `stack_skills: [apex-nextjs]` binding |
| `~/.claude/skills/apex-nextjs/SKILL.md` | create | Planning-side "what to weigh" (thin) |
| `~/.claude/skills/apex-nextjs/impl.md` | create | Patterns + the **`## Verification Recipe`** (the load-bearing section) |
| `~/.claude/registry/domains.md` | modify | Add `nextjs` row (triple-write) |
| `~/apex/SKILLS.md` | modify | Add apex-nextjs quick-ref row + paragraph (triple-write) |
| `~/apex/SKILL-HISTORY.md` | modify | Prepend `created` row (triple-write) |

---

## Exact changes

### Phase 1 — Scaffold the pilot app + bind

- **Task 1.1** — Scaffold a real Next.js app (TypeScript, App Router) into
  `C:\Users\User\apex-nextjs-pilot\`.
  - done when: `npx create-next-app@latest` completes and `npm run build` succeeds on the bare app.
- **Task 1.2** — Create `C:\Users\User\apex-nextjs-pilot\docs\status.md` with frontmatter
  including `stack: nextjs` and `stack_skills: [apex-nextjs]` (use the orchestrate
  status-template fields).
  - done when: the file exists and `stack_skills` lists `apex-nextjs`.

### Phase 2 — Author + EMPIRICALLY VALIDATE apex-nextjs

- **Task 2.1** — Create `~/.claude/skills/apex-nextjs/SKILL.md` and `impl.md` per
  `apex-skill-author`'s stack-skill family rules (always SKILL+impl; `apex-research`/`context7`
  for current Next.js 15 facts; altitude = framework). If a planning pre-draft exists, use it.
  - done when: both files exist with valid frontmatter (incl. trigger-style `description`) and
    `impl.md` contains a `## Verification Recipe` section.
- **Task 2.2** — **Validate the recipe by running it** against the Phase-1 app. The recipe is
  the layered command set (language ⊂ framework), e.g.:
  - language: `npx tsc --noEmit` (with `tsconfig` `strict: true`)
  - framework: `npm run lint` (or `npx next lint`), `npm run build` (or `npx next build`)
  - Run each command in `C:\Users\User\apex-nextjs-pilot\`. If a command does not exist, errors
    spuriously, or does not converge, **fix the recipe text** and re-run until every command
    executes clean. Record the actual final command output.
  - done when: every recipe command runs against the real app and exits 0; the recipe in
    `impl.md` matches what was actually run (NOT doc-sourced).
- **Task 2.3** — Triple-write `apex-nextjs`: registry row, `SKILLS.md` quick-ref + paragraph,
  `SKILL-HISTORY.md` `created` row (note "recipe empirically validated against pilot app").
  - done when: all three files updated and the registry `nextjs` row points at both skill files.

### Phase 3 — Exercise the apex-code recipe loop

- **Task 3.1** — In the pilot app, build one representative feature that exercises the patterns:
  a server-action CRUD route (auth-checked + Zod-validated + `revalidatePath`) with a server
  component reading it. Follow the `apex-code` loop literally: read `stack_skills` from the
  pilot `status.md` → load the `apex-nextjs` recipe → consult `context7` at the write step →
  run the recipe after the task → on failure, run the verify-fail recovery loop (one hypothesis
  at a time).
  - done when: the feature is implemented and the full recipe passes on it.
- **Task 3.2** — Deliberately confirm the recovery loop fires: the build naturally surfaces at
  least one real error (e.g. a `'use client'`/boundary or async-`params` error). Record the
  error, the single hypothesis, the fix, and the converging re-run.
  - done when: at least one recipe-caught error + its recovery is recorded in the handoff.

### Phase 4 — Report end-to-end validation

- **Task 4.1** — Write findings to the handoff: did `apex-code` read the `stack_skills` binding?
  did it load + run the recipe (not spec-carried npm)? did the recovery loop converge? was the
  recipe run-validated (not doc-sourced)? was `context7` consulted? Note any cluster 1–4 gap the
  pilot exposed (route back to planning).
  - done when: the handoff answers each of these explicitly.

---

## Acceptance criteria

1. Bare scaffolded app builds → `npm run build` exits 0 (Task 1.1).
2. Pilot `status.md` has `stack_skills: [apex-nextjs]` → grep confirms (Task 1.2).
3. `apex-nextjs/SKILL.md` + `impl.md` exist; `impl.md` has `## Verification Recipe` → files present (Task 2.1).
4. Every recipe command runs against the real app and exits 0; recipe text == commands run → run output recorded (Task 2.2).
5. Triple-write complete → `nextjs` in registry, SKILLS.md, SKILL-HISTORY.md (Task 2.3).
6. Feature built via the recipe loop; full recipe passes on it (Task 3.1).
7. ≥1 recipe-caught error + recovery recorded (Task 3.2).
8. Handoff answers all four end-to-end questions (Task 4.1).

---

## Commands to run

```bash
# Phase 1
cd C:\Users\User
npx create-next-app@latest apex-nextjs-pilot --typescript --app --eslint --no-tailwind --no-src-dir --use-npm
cd C:\Users\User\apex-nextjs-pilot
npm run build

# Phase 2 (the recipe — exact commands finalized by validation)
npx tsc --noEmit
npm run lint
npm run build
```

---

## Permissions

- file_writes: `C:\Users\User\apex-nextjs-pilot\**`, `~/.claude/skills/apex-nextjs/**`,
  `~/.claude/registry/domains.md`, `~/apex/SKILLS.md`, `~/apex/SKILL-HISTORY.md`
- commands: `npx create-next-app@latest …`, `npm install`, `npm run build`, `npm run lint`,
  `npx tsc --noEmit`, `npx next lint`, `npx next build`
- git_ops: none (do not commit the pilot app; the skills-repo triple-write is committed separately)
- network: npm registry (package install), `context7` (current Next.js docs)
- Hard blocks unchanged (no push to main, no destructive schema ops).
