## Cluster verdict

The planning layers contain valuable product judgment, but the implementation layers remain optimized for a literal, weak coder: excessive absolutes, duplicated baseline competence, and hardcoded stack choices would reduce Terra’s adaptability. Codex-facing material should retain security, accessibility, visual-contract, reduced-motion, and verification requirements while replacing universal library/pattern mandates with repo-detected decisions. Opus should own design intent and architectural choices; Sol should challenge unsupported assumptions and testability; Sonnet should resolve repository facts and dispatch only the applicable constraints. Terra should receive a compact task contract, not concatenated `impl.md` cores.

## Per-skill findings

### `apex-frontend`

- [RESHAPE] “React 19 + React Compiler” and “NEVER/ALWAYS” overgeneralize optional capabilities. Terra should inspect framework version, compiler configuration, and existing data/form patterns before applying “no memoization,” Actions, Server Components, or Tailwind-only styling; these are not valid defaults for every React repository. (`SKILL.md` § React 19 + React Compiler, § Rendering strategy; `impl.md` § Stack assumptions, § NEVER do)

- [CUT] Explicit prop typing, avoiding direct state mutation, narrow imports, semantic elements, and running typecheck/lint/build are already native Terra behavior. Remove these from routine dispatches unless the repository has a known failure mode; also delete “one file per component,” which is architecture preference rather than correctness. (`impl.md` § NEVER do, § ALWAYS do, § Verification checklist)

- [KEEP] Small client boundaries, intentional loading/error behavior, waterfall avoidance, and profiling before manual memoization materially improve implementation. Phrase them as task-relevant outcomes, not mandatory mechanisms such as “never fetch in `useEffect`” or “all mutations use Actions.” (`SKILL.md` § Eliminating waterfalls, § Review checklist)

- [MISSING] Dispatch needs the actual framework/runtime, state/data library, styling convention, target routes and viewports, browser-test command, and the exact performance or rendering acceptance criterion. “Use the bound stack’s recipe” is unavailable to isolated `codex exec`. (`impl.md` § Stack assumptions, § Verification checklist)

### `apex-nextjs`

- [KEEP] Server Action threat modeling, authorization at the mutation boundary, server-secret isolation, explicit cache intent, and async request APIs are high-value Terra constraints. Include them only for affected files, with the required auth and invalidation behavior named in the task. (`SKILL.md` § Research findings, § Hard blocks; `impl.md` § NEVER do)

- [RESHAPE] Zod, `lib/dal/*`, `import 'server-only'`, and revalidation after every mutation are prescribed architecture, not universal Next.js requirements. The plan should choose a validation library and service boundary; Terra should preserve an existing repository pattern unless the task explicitly migrates it. (`impl.md` § NEVER do, § ALWAYS do, § server-only Data Access Layer)

- [RESHAPE] Replace fixed “Next.js 15/16” recipes and `npm` fallbacks with repository detection. Sonnet should pass detected version, package manager, scripts, router type, caching mode, and compiler configuration; Terra should not infer them from this skill’s timestamp. (`SKILL.md` § Research findings; `impl.md` introduction, § Verification Recipe)

- [MISSING] Every route task should state rendering/freshness intent, authorization rule, affected cache tags or paths, expected redirects/errors, test fixtures, and runnable verification commands. (`SKILL.md` § What to weigh; `impl.md` § Verification Recipe)

### `apex-design-system`

- [KEEP] Existing-component discovery, semantic token use, state coverage, and editing locally owned shadcn source are useful Codex guidance because they prevent duplication and visual drift. (`SKILL.md` § Token naming convention, § shadcn/ui usage pattern)

- [RESHAPE] Radix/Base UI, unified `radix-ui`, Storybook, TanStack Table, `cn()`, Tailwind v4, and shadcn are choices to detect or decide in planning—not universal implementation rules. “Every component has a Story,” “never custom table,” and “no pixels for spacing” will produce unnecessary dependencies and repo-wide churn. (`SKILL.md` § Component stack; `impl.md` § NEVER do, § ALWAYS do)

- [CUT] The example button and CLI command add little to Terra and may cause it to overwrite an established variant system. Replace them with pointers to the repository’s canonical component, token, and story files. (`impl.md` § Tailwind v4 design token pattern, § shadcn/ui component pattern)

- [MISSING] Specify API compatibility requirements, canonical component/token locations, allowed dependencies, required variants/states, visual-regression workflow, and whether new stories are in scope. (`SKILL.md` § Questions to ask before designing; `impl.md` § Verification checklist)

### `apex-ui-ux-design`

- [KEEP] `design-brief.md`, `app-flow.md`, product-specific art direction, forbidden patterns, realistic content, and independent screenshot review are the strongest parts of this cluster. Pass only relevant brief tokens, states, and forbidden patterns to Terra; keep the full taste rubric with Opus/Sol. (`SKILL.md` § App-flow artifact, § Design-brief artifact, § Generic-AI detection, § Visual review gate)

- [CLAUDE-IDIOM] Remove Codex-facing references to `~/.claude`, APEX dispatches, style-library installation, Claude’s “eyes,” DeepSeek limitations, planning-mode escalation, Cursor co-editing, and ADR history. A standalone Terra subprocess cannot act on those unless Sonnet supplies tools, paths, URLs, and artifacts. (`SKILL.md` § Aesthetic direction, § Prompt-to-design lanes, § Live preview during build)

- [RESHAPE] The clickable `<div role="button">` example contradicts `apex-accessibility`’s semantic-control rule. Universal real-time validation, `cursor-pointer` on non-buttons, forced URL state, concentric-radius formulas, font smoothing, and image outlines should become optional design decisions rather than enforcement. (`impl.md` § NEVER do, § ALWAYS do, § Interactive element pattern, § Micro-polish details)

- [MISSING] UI dispatches need target screenshots or mockups, viewport list, route to render, representative content, required states, permitted visual latitude, dev-server command, and a concrete comparison/output contract. Native vision is useless if the subprocess receives no image path or reachable render. (`SKILL.md` § Visual review gate, § Live preview during build)

### `apex-animation`

- [KEEP] Motion purpose, frequency budgeting, reduced-motion behavior, interruptibility, no unpausable loops, and explicit enter/exit states genuinely change Terra’s output. (`SKILL.md` § Accessibility rules, § Should it animate at all?)

- [RESHAPE] “Only transform/opacity,” “always spring,” “AnimatePresence for all,” `mode="wait"`, unconditional `will-change`, and avoiding Motion shorthands are too absolute. Select techniques from the existing library, browser support, interaction semantics, and measured performance; layout or `clip-path` animation can be justified. (`impl.md` § NEVER do, § ALWAYS do, § Modern CSS motion primitives)

- [RESHAPE] The global `0.01ms !important` kill switch conflicts with the planning guidance to retain useful opacity/colour feedback and can alter application behavior. Prefer component-level reduced variants; use a global fallback only as an explicitly chosen project policy. (`SKILL.md` § Accessibility rules; `impl.md` § CSS prefers-reduced-motion global rule)

- [MISSING] State the trigger, initial/final states, interruption behavior, reduced-motion variant, supported browsers, performance budget, and how to verify visually and with tooling. (`impl.md` § Verification checklist)

### `apex-accessibility`

- [KEEP] Keyboard operation, focus restoration/visibility, accessible naming, field-error relationships, non-colour cues, drag alternatives, authentication constraints, and manual-review handoff are valuable Codex-facing requirements. (`SKILL.md` § WCAG 2.2 criteria, § Review checklist)

- [RESHAPE] “Add `aria-live` to dynamic regions,” manual `role="dialog"` construction, and “never `aria-label` when visible text exists” are unsafe absolutes. Prefer native elements or established primitives and specify the intended accessible-name and announcement behavior. (`impl.md` § NEVER do, § ALWAYS do)

- [RESHAPE] The supplied axe test checks only one route and only `critical` violations, despite claiming WCAG 2.2 AA. Sonnet should identify affected routes/states and the project’s severity/tag policy; Terra should run automated checks without claiming they establish conformance. (`impl.md` § Verification)

- [CLAUDE-IDIOM] Replace the DeepSeek-specific skip instruction with a model-neutral output contract: report automated results separately and list manual keyboard, zoom, and screen-reader checks requiring a human or equipped reviewer. (`impl.md` § Verification)

### `apex-figma`

- [KEEP] Treating Figma as specification rather than generated code, reusing local components, mapping variables, translating auto-layout semantically, and comparing rendered output to the source all materially help Terra. (`SKILL.md` § Design-to-code workflow; `impl.md` § NEVER do)

- [CLAUDE-IDIOM] Remove Claude MCP installation instructions and every DeepSeek image caveat. Codex-facing instructions must instead declare whether a Figma connector is available; otherwise Sonnet must export the relevant frame, variables, assets, and screenshots into reachable paths. (`SKILL.md` § MCP tools available; `impl.md` § DeepSeek image caveat)

- [RESHAPE] “No hardcoded px,” “no absolute positioning,” and “fetch MCP before writing” are conditional. Exact dimensions, overlays, and repository-local artifacts can be correct; require token reuse for shared design decisions and justify exceptions. (`impl.md` § NEVER do, § ALWAYS do)

- [MISSING] Include file/frame/node identifiers, access status, source screenshot paths, asset/export requirements, target viewports, token mapping table, and the allowed visual-difference threshold. (`impl.md` § Design-to-code workflow, § Verification checklist)

## Codex-native recommendations

Create a small `.agents/skills/web-ui/` tree rather than copying these files:

- `react-next/SKILL.md`: repo inspection, client/server and security invariants, version-gated notes, and command discovery.
- `design-system/SKILL.md`: reuse-first workflow, canonical token/component discovery, compatibility rules, and state/story verification.
- `ui-implementation/SKILL.md`: consume `design-brief.md` and `app-flow.md`, render named routes/viewports, compare supplied references, and report divergences.
- `accessibility/SKILL.md`: task-scoped semantic, keyboard, focus, naming, and automated/manual verification contracts.
- `motion/SKILL.md`: motion specification schema plus reduced-motion and performance checks.
- `figma-handoff/SKILL.md`: tool-availability branches, required exported artifacts, token mapping, and screenshot comparison.

Keep examples and volatile framework facts in opt-in references, not the main skill. Each main skill should instruct Terra to inspect the repository first, preserve established architecture, apply only relevant constraints, and report files changed, commands run with results, visual evidence inspected, and unresolved manual checks.

Role placement should be explicit: Opus authors flows, design brief, cache/security decisions, motion intent, and accessibility acceptance criteria; Sol rejects unsupported library choices, contradictions, and unverifiable criteria; Sonnet resolves repository versions, commands, available tools, routes, assets, and selects the minimal skill pack; Terra implements and verifies. The dispatch prompt should contain task scope, exact files, chosen architectural decisions, relevant brief excerpts, runnable commands, render targets, supplied artifacts, acceptance criteria, and the reporting contract—nothing from this cluster that is merely general coding hygiene.