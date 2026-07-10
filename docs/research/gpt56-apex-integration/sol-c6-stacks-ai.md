## Cluster verdict

This cluster contains useful domain traps and verification recipes, but too much of it should remain planning context rather than reach Terra. GPT-5.6 benefits most from exact version hazards, conditional safety invariants, working-directory-aware commands, and explicit acceptance criteria; generic best practices, dated ecosystem rankings, examples, and repeated NEVER/ALWAYS phrasing dilute attention. Opus should make architectural choices, Sol should challenge their currency and testability, Sonnet should resolve repository-specific values, and Terra should receive only the resulting implementation contract. Remove all Claude/DeepSeek backend assumptions from Codex-facing artifacts.

## Per-skill findings

### `apex-stack`

- [RESHAPE] Keep candidate comparison, AI-buildability, verifiability, runner-up analysis, and lock-in assessment in Opus planning and Sol review only (`SKILL.md` §§ “How to choose,” “Lock-in table”). Terra should receive the selected stack as a fixed decision, not reopen it.
- [CUT] Do not inject the dated technology table, candidate menu, full lock-in table, or mandatory runner-up into coding tasks (`SKILL.md` §§ “Research findings,” “Candidate menu,” “Hard blocks”). They consume context without helping implementation.
- [KEEP] For an actual scaffold task, retain exact package-identity verification, empty `.env.example`, and named documentation outputs (`impl.md` §§ “NEVER do,” “ALWAYS do”). Replace “latest major” with “the spec-pinned or repository-compatible version”; automatically taking the latest major can break the plan.
- [CLAUDE-IDIOM] The `~/.claude/registry/domains.md` lookup and `stack_skills` binding are Sonnet orchestration mechanics, not Codex instructions (`SKILL.md` § “Coverage gate”). Terra cannot usefully act on them unless the relevant rules and commands are included in its dispatch.

### `apex-python`

- [KEEP] The high-value Codex payload is small: preserve the repository’s `uv` dependency-group convention, enforce its configured strict type gate, prevent blocking I/O in async paths, and run the concrete recipe (`impl.md` §§ “NEVER do,” “Verification Recipe”). These details can materially prevent plausible-looking but broken changes.
- [RESHAPE] Make `uv`, Python 3.12+, and `mypy --strict` new-project defaults or explicit project decisions—not universal migration instructions (`SKILL.md` § “Hard blocks”; `impl.md` § “ALWAYS do”). Terra should preserve an existing Poetry/Pyright project unless the task explicitly migrates it.
- [CUT] Remove tutorial examples, the generic error table, and “one hypothesis/fix first error” narration from routine dispatches (`impl.md` §§ “Pattern,” “Common errors,” “The loop”). Load a compact reference only after the matching failure occurs. Also remove “mypy is authoritative for correctness”; typing and behavioral tests cover different failure classes.
- [MISSING] Supply the actual Python version, source roots, package manager, configured type checker, test target, coverage threshold, and affected integration tests. Hardcoding `mypy --strict src` is unreliable in monorepos or non-`src` layouts (`impl.md` § “Verification Recipe”).

### `apex-swift`

- [KEEP] Strict-concurrency enforcement, avoiding `@unchecked Sendable`, explicit actor isolation, persistence/wire-model separation, and platform builds are useful Codex constraints (`impl.md` §§ “NEVER do,” “ALWAYS do,” “Verification Recipe”).
- [RESHAPE] Treat `@Observable`, SwiftData, and NavigationStack as deployment-target- and architecture-dependent defaults, not unconditional laws (`SKILL.md` § “Research findings”; `impl.md` § “ALWAYS do”). Likewise, “AI compute belongs in Python” is an APEX product architecture decision that belongs in the spec, not a reusable Swift skill.
- [CLAUDE-IDIOM] `~/.claude/skills/apple-swiftui/` and the instruction to flag their absence are unusable Codex coupling (`impl.md` § “Apple agent skills”). If those references matter, install equivalent `.agents/skills` references and route to them only for relevant APIs. Reconcile the metadata/body mismatch where `impl.md` is version 0.2.0 but calls itself 0.1.0 and unvalidated.
- [MISSING] Every Swift dispatch should name Xcode/Swift versions, minimum OS targets, project versus workspace, schemes, destinations, and available simulators. The recipe should first discover actual values with `xcodebuild -list`; placeholders such as `<App>` are not executable verification (`impl.md` § “Verification Recipe”).

### `apex-tauri`

- [KEEP] This is the strongest Terra-facing material: retain a compact Tauri 1→2 hazard map, capability/CSP and secret-boundary rules, correct command working directories, serializable IPC errors, and the double-`Arc` runtime trap (`impl.md` §§ “NEVER do,” “ALWAYS do,” “Common errors”).
- [RESHAPE] Route visual-webview rules only to glass/animation tasks and MSVC setup only to Windows builds (`impl.md` §§ “NEVER do,” “ALWAYS do”). CSP must be derived from the task’s permitted origins; the no-remote-content example is not a universal configuration.
- [CUT] Remove the blanket restriction that every animation use only four CSS properties (`impl.md` § “NEVER do”). It is overbroad and may override an intentional design. Replace exact cross-ecosystem minor-version assertions with “use mutually compatible versions verified by the scaffold, lockfiles, and `tauri info`.”
- [MISSING] Dispatches need target operating systems, pinned Tauri/Node/Rust versions, package manager, named windows, required permissions, allowed network origins, and which integration/build commands are feasible. Add an application-launch or UI smoke test when the environment supports it; compilation alone misses webview and ACL failures (`impl.md` § “Verification Recipe”).

### `apex-mobile`

- [RESHAPE] Split this into a planning-only mobile framework selector and an Expo-specific coding skill. The current `SKILL.md` claims React Native, Flutter, KMP, and native scope while `impl.md` implements only Expo, creating a likely routing error (`SKILL.md` § “Stack assumptions”; `impl.md` § “Stack assumptions”).
- [CUT] Drop unconditional managed-workflow, built-in `Image`, “SafeAreaView on every screen,” global EAS CLI installation, and bootstrap-package instructions from normal tasks (`impl.md` §§ “NEVER / ALWAYS,” “Project bootstrap”). Existing navigation, image, safe-area, and package-management conventions should win; screen-by-screen safe-area wrapping can double-apply insets.
- [KEEP] Preserve secure credential storage, permission pre-prompts, Expo configuration health checks, and honest reporting of unrun device validation (`impl.md` §§ “NEVER / ALWAYS,” “Verification Recipe”). Rewrite the DeepSeek-specific clause as: detect available simulators/emulators, run feasible tests, and report each unrun platform with the concrete reason.
- [MISSING] State the Expo/RN SDK, package manager, supported platforms, native-module requirements, unit/component test command, build command, and device matrix. Store target/API requirements should be reverified during release planning rather than embedded as durable coder facts (`SKILL.md` § “App store preparation checklist”).

### `apex-ai-systems`

- [CLAUDE-IDIOM] Remove the Claude model landscape and Anthropic-first examples from Codex-facing context (`SKILL.md` § “Current model landscape”; `impl.md` §§ “Stack assumptions,” “Anthropic SDK pattern”). The claim that provider patterns are identical is unsafe: caching, structured output, tool calls, streaming events, and supported parameters differ.
- [KEEP] Retain bounded agent loops, typed schemas, validated failure paths, transient-error handling, and the prohibition on feeding raw model output into SQL, shells, or HTML (`impl.md` §§ “NEVER do,” “ALWAYS do”). Replace vague “sanitize” with typed tool interfaces, allowlists, and context-specific escaping.
- [RESHAPE] Make streaming, prompt caching, output caps, and tracing conditional on provider and use case (`impl.md` § “ALWAYS do”). “Always log prompt + response” conflicts with privacy minimization; default to metadata plus redacted, explicitly authorized content. Caching can increase complexity or latency for prefixes that do not repeat.
- [MISSING] Add executable tests for 429s, timeouts, malformed/refused outputs, loop exhaustion, cancellation, and streaming interruption. Each task also needs the provider/SDK version, model configuration location, data-retention classification, retry budget with jitter/idempotency rules, authorized tools, and an eval command with a pass threshold (`impl.md` § “Verification checklist”).

## Codex-native recommendations

Create concise `.agents/skills` packages for `typed-python`, `swift-concurrency`, `tauri2`, `expo`, and provider-specific `llm-integration` workflows. Each `SKILL.md` should contain only:

- Activation and exclusions.
- “Inspect repository configuration first” precedence.
- A small set of conditional, non-obvious invariants.
- Verification-command discovery plus ordered commands and working directories.
- Explicit routing to narrow references for migrations, platform setup, or observed errors.

Keep bulky examples, current-version tables, FFI walkthroughs, and common-error catalogs in references loaded only when relevant. Do not create a Terra-facing stack-selection skill; if Sol runs through Codex, create a separate plan-review skill that checks unresolved decisions, stale claims, repository compatibility, and whether every acceptance criterion has an executable verification path. Codex skills are best used for repeatable workflows, not as a substitute for task-specific decisions ([OpenAI Codex use cases](https://developers.openai.com/codex/use-cases)).

The dispatch pack should supply the frozen architecture, exact versions and repo conventions, allowed files, acceptance criterion, 3–7 task-relevant invariants, runnable commands with working directories, environment limitations, and an output contract requiring changed files, command results, and explicitly unrun checks. Durable repository-wide commands and conventions belong in `AGENTS.md`; task-specific constraints belong only in the dispatch.

Role placement should be:

- Opus: architecture, stack choice, tradeoffs, security/data policy, platform and eval strategy.
- Sol: challenge currency, contradictions, missing failure paths, and non-executable verification.
- Sonnet: resolve repository-specific values, select narrow skills, construct dispatches, integrate worktrees, and rerun gates.
- Terra: inspect the repository, implement the fixed task, execute feasible verification, and report evidence without reopening settled planning decisions.