# Pin-change sweep checklist

When any **model pin** (coder id, effort tier, fallback) or **architecture doctrine** (modes,
backends, roles, the skill layer) changes, run this sweep. Living docs rot by omission — no workflow
step touches them, so they freeze at whatever the world looked like when they were written. This
checklist is the deliberate counter-pass. Derived from the P2 stale-claims inventory
(`docs/research/p2-stale-claims-inventory-2026-07-19.md`), where 54 stale claims had accumulated
across ~25 files, mechanism rot outnumbering model rot ~21:8.

## Sweep, in order

1. **The living overview** — `docs/technical/architecture/overview.md` (ADR-014 obliges it to stay
   current). Re-read it whole; it rots by omission, which grep can't catch.
2. **The scope docs** — `ROADMAP.md`, `REQUIREMENTS.md`, `README.md`, `PROJECT.md`. Written once at
   project start, revisited by nothing. Re-read each against current fact.
3. **Skill references and templates** — `~/.claude/skills/apex-*/references/**` and
   `~/.claude/skills/apex-*/templates/**`. SKILL.md bodies get version-bumped through
   apex-skill-author; their `references/` and `templates/` keep the old language. Templates and
   seeded stubs are **multiplier rot** — they re-stamp stale wording into every new spec/handoff.
4. **ADR banners and status headers** — for a model pin, update the banner of every ADR that states
   the old model as present-tense. For a doctrine change, back-write a supersession/status header
   into every ADR the change retires. **Never edit ADR decision prose** — a decision is correct at
   its date; only the metadata header/banner is editable.
5. **Memory files** — `~/.claude/projects/<project>/memory/*.md`. Durable facts that assert the old
   pin/mechanism.

## Grep discipline

- Grep the **old pin string** (e.g. `gpt-5.6-terra`, `deepseek`) AND the **retired mechanism words**
  (mode names, `APEX_MODE`, launcher names like `apex-build`, guard names like write-guard). In this
  inventory mechanism rot outnumbered model rot ~21:8 — grepping only model ids under-reaches.
- **`~/.claude` ripgrep blind spot:** `~/.claude` has a blanket `.gitignore` (`*`), so ripgrep (and
  the Grep tool) skip everything under it by default. Use `rg --no-ignore`, or PowerShell
  `Select-String`, when sweeping skill files — otherwise the skill-side rot is invisible.

## Skip-list (dated records — do not sweep)

`docs/handoff/`, `docs/probes/`, `docs/changes/done/`, `docs/research/` reports, `SKILL-HISTORY.md`,
and **ADR decision prose**. These are past-tense and dated; treat them like an ADR body. Age-check
`docs/drafts/` and `docs/validation/` separately — "current until promoted" content with no expiry
gets a superseded/OBSOLETE banner if its preconditions are dead.

## Make it stick

The ADR template's "Supersedes: X" line should carry a reminder to **back-write the reciprocal
status header into X** — the systematically-dropped direction (11 of 44 ADRs were missing it at this
inventory).
