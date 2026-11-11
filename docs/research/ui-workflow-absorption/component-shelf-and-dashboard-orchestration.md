# Absorption pass — component-library shelf + "dashboard orchestration" video

_Pass date: 2026-11-11 · Protocol: dedup-aware, report-only (no skill edits until the owner approves)._

Two owner-supplied inputs: a curated list of 18 UI libraries, and a video transcript on dashboard
design. This file records both and proposes how the UI flow in
`~/.claude/skills/apex-plan/references/design-workflow.md` would change.

---

## Part 1 — The owner's component shelf (18)

The list is **owner preference** (which sources are approved to pull from), so it passes the
ADR-036 test: a bare agent knows these libraries but cannot derive which ones the owner sanctions.
What is recorded is name, role, and how it lands in a repo. No usage documentation.

"Lands as" matters because `design-workflow.md` § Design archetypes requires the locked contract
to be in-repo and inspectable, "never an imported lib it can't see".

| Tier | Library | Role | Lands as |
|---|---|---|---|
| Foundation | [shadcn/ui](https://ui.shadcn.com) | Styled component set + registry/CLI | Source copied into the repo |
| Foundation | [Radix UI](https://www.radix-ui.com) | Unstyled accessible primitives | npm dependency (under shadcn) |
| Foundation | [Base UI](https://base-ui.com) | Unstyled accessible primitives (Radix alternative) | npm dependency |
| Specialist | [Sonner](https://sonner.emilkowal.ski) | Toasts | npm dependency |
| Specialist | [Vaul](https://vaul.emilkowal.ski) | Drawer / bottom sheet | npm dependency |
| Specialist | [cmdk](https://github.com/pacocoursey/cmdk) | Command palette | npm dependency |
| Specialist | [NumberFlow](https://number-flow.barvian.me) | Animated number transitions | npm dependency |
| Design / AI | [Magic UI](https://magicui.design) | Animated marketing components | Source copied in (shadcn registry) |
| Design / AI | [Aceternity UI](https://ui.aceternity.com) | Animated / effect-heavy components | Source copied in |
| Design / AI | [21st.dev](https://21st.dev) | Community component registry | Source copied in |
| Design / AI | [assistant-ui](https://www.assistant-ui.com) | AI chat interface components | npm primitives + copied-in styled parts |
| Design / AI | [Beautiful UI](https://www.beautifului.dev) | 21 components for AI-agent interfaces (thinking traces, approval cards, chat panel, prompt bar, diff and filter tables); MIT | Site says "copy-paste ready"; install method not stated |
| Design / AI | [Rare UI](https://rare-ui.com) | _not classified — site did not load for automated fetch on 2026-11-11_ | ? |
| Design system | [Coss UI](https://www.coss.com) | Component set on Base UI | Source copied in |
| Design system | [Align UI](https://www.alignui.com) | Tailwind design system (Figma + code) | Source copied in |
| Design system | [daisyUI](https://daisyui.com) | Tailwind class plugin, framework-agnostic | npm plugin |
| Design system | [HeroUI](https://www.heroui.com) | Full React component library | npm dependency |
| Design system | [Ant Design](https://ant.design) | Full enterprise React library, own look | npm dependency |

"Lands as" entries are from model memory, not checked against current docs (Beautiful UI excepted: read from its site 2026-11-11). Verify per library at
the moment one is picked for a project.

**Dedup:** 21st.dev is already named in `design-workflow.md` Path A as a research gallery. Radix,
Base UI and shadcn appeared in the deleted `apex-design-system` skill as mandates; the Sol audit
(`docs/research/gpt56-apex-integration/sol-c5-ui.md`) ruled them "choices to detect or decide in
planning, not universal implementation rules". A shelf the plan picks from is consistent with that
ruling; a default stack would not be.

### Source skill: `pick-ui-library` (github.com/emilkowalski/skills)

Read 2026-11-11, not installed. It is a lookup table (task → one library) that only runs when
explicitly invoked (`disable-model-invocation: true`). Its procedure: identify the task, check
`package.json` first, use what is installed, flag a competitor without churning it, recommend
exactly one library, and say so when leaving the list.

Its list is **not** the 18 above. Overlap is four: Base UI, cmdk, Sonner, NumberFlow. It does not
contain shadcn/ui, Radix, Vaul, any of the six design / AI sources, or any of the five design
systems. It adds picks the 18 lack:

| Task | Pick |
|---|---|
| One-time-password inputs | input-otp |
| Control panels | Leva (dialkit as alternative) |
| General animation | motion |
| Animated text | torph |
| 3D globes | Cobe |
| Open Graph images | Satori |
| Syntax highlighting | shiki |
| Streaming charts / general charts | Liveline / recharts |
| Drag and drop | dnd kit |
| Virtualization | Virtuoso |
| State | zustand |
| Class names / variants | clsx / cva |
| Theme switching | next-themes |

It names Base UI as the single primitives pick, where the owner's list carries Radix and Base UI
side by side.

**Absorption verdict.** Its procedure (check what is installed, one pick, flag but do not churn) is
model-native and matches the Sol audit's "detect or decide in planning"; nothing to write down.
Its value is the list itself, which is preference. Installing it as a live skill would put a
second, partly conflicting pick-list beside the shelf, so the proposal is to fold whichever of
its extra rows the owner wants into the one shelf file (open decision 5) and not install it.

---

## Part 2 — Video summary: three tells of a first-time dashboard

Thesis: designing a dashboard is easy, orchestrating one is hard. Three gaps separate a dashboard
that looks fine from one that works.

**1. Data drives the form.** Build the interface around the shape of the data it shows.
- A field with a fixed set of values (department, employment status) becomes a chip.
- Numbers are right-aligned so digits line up by place value.
- Long text is truncated to give other columns room; inactive rows are shaded out.
- Time-ordered data is a timeline, not a time-sorted table; a time dimension also earns a summary
  chart so nobody hunts through a timestamp column.
- Colour comes from the data, not decoration: red marks an urgent action, an avatar identifies the
  actor faster than a name column.

**2. Progressive disclosure.** Hierarchy is also about what is shown versus hidden.
- Infrequent functions (sharing) live in a popover, not permanently in the layout and not on a
  separate page.
- Inside the popover the primary action (search) is visible at once; a secondary action (remove a
  user) appears on hover with a tooltip.
- "Spectrum of explicitness": always-visible global button → labelled control → icon → appears on
  hover. Place each action on the spectrum by frequency and importance.
- Onboarding is the same idea: one tooltip on the most important action, then the next, or a
  corner checklist. Sequence the product; do not explain it all in a modal on first login.

**3. Interface is what you cannot see.** A dense screen works because of the parts that are not
visible at rest.
- Copy-on-hover chips on cells, comment indicators, drawers, modals, and every hidden state. The
  hidden layer is large and the visible layer does not function without it.
- New features rarely need a new page; they need a considered hidden surface.
- Rare moments count: feature announcements, onboarding pop-ups.
- Tooltips are the most consistently missing piece. Assume users will not understand every icon
  or ambiguous label.

(The video's sponsor segment, the Mobbin reference library and its MCP server, is omitted from the
summary. It is noted under proposal 6 as a possible research-gallery addition.)

---

## Part 3 — Proposed flow changes (nothing applied)

Each proposal is machinery (an artifact field, a gate, a pick rule). The design principles in
Part 2 are model-native and would not be written into any skill.

| # | Change | Where | Token cost | Kind |
|---|---|---|---|---|
| 1 | Shelf index: the Part 1 table plus the pick rule | new `~/.claude/style-library/COMPONENTS.md`, read on demand | 0 always-on; ~500 when read | owner preference |
| 2 | Brief gains a "Component sources" block, set once alongside the aesthetic | `design-brief-template.md` + ~6 lines in `design-workflow.md` | ~120 | artifact field |
| 3 | Rule for npm-only design systems versus the in-repo contract rule | `design-workflow.md` § Design archetypes, ~3 lines | ~60 | gate amendment |
| 4 | `app-flow.md` gains, per screen, a data-shape line and an on-demand inventory | `design-workflow.md` § app-flow, ~5 lines; apex-init seed | ~100 | artifact field |
| 5 | Visual review gate captures interaction states, not only at-rest screenshots | `design-workflow.md` § Visual review gate, ~3 lines | ~60 | gate |
| 6 | Mobbin added to the Path A gallery list | `design-workflow.md` Path A, 1 link | ~10 | reference |

**Pick rule for proposal 1** (mirrors the style shelf's "at most one"):
- Exactly one foundation per project. Radix and Base UI are alternatives; shadcn sits on either.
- Specialists are added individually, when a screen in `app-flow.md` needs that pattern.
- Design / AI sources are mined for single components that are then restyled to brief tokens.
  They never set the look.
- A full design system (Ant Design, HeroUI, daisyUI, Align UI, Coss UI) replaces the foundation
  tier; it is not stacked on top of it. One per project.
- The stack decides first. Most of the shelf is React + Tailwind; if `apex-stack` picks something
  else, the shelf does not apply and the brief says "none".

**Proposal 3 detail.** Copied-in sources satisfy the existing rule as written. npm-only libraries
do not. Options: (a) require a thin local wrapper folder that is the only place the library is
imported, so the coder still reads a local contract; (b) exempt declared design systems from the
rule. Recommendation: (a).

**Proposal 4 detail.** Data-shape line = what the screen displays and the kind of each field
(fixed set · number · time series · long text · person). On-demand inventory = what exists on the
screen but is hidden at rest (hover actions, popovers, drawers, tooltips, first-run sequence).
This extends the existing "screen states" capture and stays flow-level, not visual.

**Proposal 5 detail.** The current gate screenshots four viewport widths at rest, which cannot see
anything in the video's third point. The gate would drive each inventory item from proposal 4
(hover, open, focus) and capture it.

**Build-side consequence.** Registry installs (`npx shadcn add …`) need network access the Codex
sandbox does not have. The host would run component installs before dispatch, and the spec would
list the installed files under Files-to-change and name the allowed dependencies.

**Iron Law.** Proposals 4 and 5 need a RED baseline before any text is written: give a bare agent
a dashboard planning task and check whether it already records data shape and hidden surfaces, and
whether a bare reviewer already captures hover states. If it does, drop the proposal.

## Open decisions

1. Shelf as a pick-list (proposed) or as a default stack (shadcn + Sonner + Vaul + cmdk always)?
2. Proposal 3: wrapper folder (a) or exemption (b)?
3. Rare UI: its site did not load for an automated fetch; needs a manual look to classify.
4. Does the shelf file live beside the style shelf (proposed) or inside `apex-plan/references/`?
5. `pick-ui-library`: fold its extra rows (charts, drag and drop, virtualization, state, and so on)
   into the shelf, or keep the shelf to the 18? And where both lists speak: Base UI only (its
   pick) or Radix and Base UI as alternatives (the 18)?

---

## Part 4 — Choosing between the options (owner direction, 2026-11-11)

Owner: each library is an option for the look; replicate one page across the styles and see which
fits, or use a cheaper method. This settles open decision 1 as **pick-list**.

Only six of the 18 set a look, so only six compete: shadcn/ui (default theme), Coss UI, Align UI,
daisyUI, HeroUI, Ant Design. Radix and Base UI are unstyled, the four specialists fill one pattern
each whichever look wins, and the six design / AI sources supply single components restyled to
the winner.

Proposed selection funnel, cheapest step first:

1. **Browse (no tokens).** The owner opens the six official demo pages and strikes the ones that
   are plainly wrong for the project. Target: two or three finalists.
2. **Bake-off (finalists only).** One anchor page from `app-flow.md`, one shared mock-data file,
   one page per finalist built with the real library in a throwaway folder. The coder builds them;
   the planning model writes the single task description once.
3. **Judge by eye.** Finalists open side by side in browser tabs (the existing multi-variant path
   in `cheap-mockup-workflow.md`). No model screenshot review at this step.
4. **Lock.** The winner goes into the brief's "Component sources" block; the throwaway folder is
   deleted.

Imitating a library's look in hand-written HTML is rejected: it is cheaper but shows the model's
impression of the library, not the library.

### Clarification (owner, same day): this is a per-product step, not a one-off

The funnel above runs inside each product's planning, at the point the design brief is first
filled. Placement in `design-workflow.md`:

- **When:** after `apex-stack` has chosen the stack and `app-flow.md` lists the screens; before the
  brief is locked. Skipped when the stack is not React + Tailwind or the product has no interface.
- **Entry:** a third answer to the existing opening question in § Aesthetic direction
  (research · keywords · **compare libraries on the anchor screen**). Not run unless chosen.
- **Anchor:** the product's own anchor screen, which § Design archetypes already requires at high
  finish. The bake-off replaces designing it once with building it two or three times.
- **Cap:** three finalists at most. Coder builds; owner judges by eye.
- **Output:** the winner's theme values seed the brief's tokens, the winner is recorded under
  "Component sources", and the winning page becomes the locked anchor screen. Losers are deleted.

---

## Owner decisions (2026-11-11)

- **Decision 5 (`pick-ui-library`) — settled.** Do not install the skill. Fold its libraries into
  the one shelf. Look-setting libraries are options compared by eye; single-job libraries (charts,
  drag and drop, long lists, animation, one-time-code inputs, theme switching) are one default per
  job with alternates listed. Plumbing rows (state, class-name helpers) are left out. Each product
  plan carries a "parts used" list (job · library · one-line reason); a default that fits is used
  silently, a departure from the default is flagged with its reason. Override triggers: product
  need the default is weak at · project already uses another library (keep it) · owner dislikes
  the result on the anchor page · build report shows the coder fighting the library.
- **Radix or Base UI — settled.** The mechanism follows the look-setting library the product
  picked. Where the choice is free (shadcn/ui, or parts built from scratch), use Base UI. Never
  both in one product. One look-setting library per product; themes (light/dark, brand variants)
  are fine; two areas needing different libraries are treated as two products.
- **npm-only design systems — settled: wrapper folder.** When the product's look-setting library
  installs as a package (Ant Design, HeroUI, daisyUI), one local folder holds thin shells for the
  parts the product uses; screens import the shells only, never the package directly, and review
  flags a direct import. Copied-in libraries need nothing extra.
- **Shelf location — settled.** The list lives at `~/.claude/style-library/COMPONENTS.md` (plain
  file, owner-editable without the skill procedure). The pick rules live in `design-workflow.md`,
  which points to the shelf the same way it points to the style shelf's `INDEX.md`.
- **Rare UI — parked.** Stays on the shelf with its link, marked unclassified; classify when a
  product first borrows from it.

---

## Baseline tests and what was applied (2026-11-11)

Bare `model: sonnet` agents, no files readable, HR-dashboard task, one prompt each.

| Proposal | RED (current text) | GREEN (amended text) | Outcome |
|---|---|---|---|
| 4 — data shape + on-demand inventory in app-flow | 14 routes, edit/add/help each a full page, one dialog, no field kinds, no hover actions or tooltips recorded | 6 routes; sharing, editing, filters and help moved into existing screens; every field typed; hover actions, popovers, drawers, tooltips and a first-run sequence listed per screen | Applied |
| 5 — gate captures interaction states | Reviewer already planned hover, keyboard focus, open dialog, row-action, validation and toast captures unprompted | not run | General rule dropped as model-native; kept one sentence pointing the reviewer at the app-flow inventory, since that list is a local fact |

Applied: `~/.claude/style-library/COMPONENTS.md` (new) and a pointer in its `INDEX.md`;
`apex-plan/references/design-workflow.md` (§ Component sources, opening question, wrapper folder,
app-flow fields, gate pointer); `design-brief-template.md` (Component sources block); `apex-init`
app-flow stub; `SKILLS.md`; `SKILL-HISTORY.md`. apex-plan 2.11.0, apex-init 1.9.0.

Not applied: proposal 6 (Mobbin in the Path A gallery list), not discussed with the owner.
Not verified: that the Codex sandbox cannot run registry installs; the workflow says installs run
on the host before dispatch without stating that as the reason.
