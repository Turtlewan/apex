# Spec: Skill Language Fixes for DeepSeek Compatibility

## Scope

Minor language adjustments across existing `impl.md` files to make them backend-neutral
and accurate when running under DeepSeek V4 Flash. Two issues to fix:

1. **"Flag for Claude review"** appears in 6 impl.md files. When DeepSeek executes these,
   "Claude" is ambiguous. Replace with "Flag for planning-mode review" — meaning: stop,
   write to the decisions log, and surface in the next planning session.

2. **apex-figma image comparison step** — DeepSeek cannot process images (unsupported
   content type). The verification step "MCP screenshot compared to rendered output" must
   be replaced with a DeepSeek-safe equivalent that flags the visual check for planning-mode
   review rather than attempting it.

3. **Frontmatter `backend:` field** — Add `backend: deepseek` to all impl.md files and
   `backend: claude` to all SKILL.md files. Machine-readable routing signal for the
   orchestrator. Does not change any behavior — documentation only.

---

## Files to change

| File | Change |
|------|--------|
| `~/.claude/skills/apex-animation/impl.md` | "Flag for Claude review" → "Flag for planning-mode review" |
| `~/.claude/skills/apex-figma/impl.md` | "Flag for Claude review" → "Flag for planning-mode review" + image step fix |
| `~/.claude/skills/apex-design-system/impl.md` | "Flag for Claude review" → "Flag for planning-mode review" |
| `~/.claude/skills/apex-ui-ux-design/impl.md` | "Flag for Claude review" → "Flag for planning-mode review" |
| `~/.claude/skills/apex-ui-testing/impl.md` | "Flag for Claude review" → "Flag for planning-mode review" |
| `~/.claude/skills/apex-security/impl.md` | "Flag for Claude review (do not decide yourself)" → "Flag for planning-mode review (do not decide yourself)" |
| All impl.md files (all apex-* skills) | Add `backend: deepseek` to frontmatter |
| All SKILL.md files (all apex-* skills) | Add `backend: claude` to frontmatter |

---

## Exact changes

### 1. Global text replacement across 6 impl.md files

In each of the 6 files listed above, do a simple find-replace:

**apex-animation, apex-figma, apex-design-system, apex-ui-ux-design, apex-ui-testing:**
```
Find:    ## Flag for Claude review
Replace: ## Flag for planning-mode review
```

**apex-security only:**
```
Find:    ## Flag for Claude review (do not decide yourself)
Replace: ## Flag for planning-mode review (do not decide yourself)
```

### 2. apex-figma/impl.md — image comparison step fix

Locate the verification checklist item:
```markdown
- [ ] MCP screenshot compared to rendered output — no major deviations
```

Replace with:
```markdown
- [ ] Visual comparison: DeepSeek cannot view images — add "figma-visual-check" to
  the decisions log and flag in handoff for planning-mode (Claude) review
```

Also update the section heading if it exists above the checklist from:
```markdown
## MCP screenshot verification
```
to:
```markdown
## Visual verification (planning-mode only)
> ⚠️ DeepSeek does not support image content. Skip this section and flag in decisions log.
> Claude (planning mode) should review the rendered output against the Figma file manually.
```

(If the heading doesn't exist verbatim, leave it and only change the checklist item.)

### 3. Add `backend:` field to frontmatter

For every `impl.md` file in `~/.claude/skills/apex-*/`, add one line to the frontmatter
after the `skill:` line:

```yaml
---
skill: apex-<name>
backend: deepseek        ← add this line
version: 1.x.x
...
```

For every `SKILL.md` file in `~/.claude/skills/apex-*/`, add one line to the frontmatter
after the `skill:` line:

```yaml
---
skill: apex-<name>
backend: claude          ← add this line
version: 1.x.x
...
```

### 4. Bump versions and last_updated

For every file modified in steps 1–3:
- Bump patch version: `1.x.y` → `1.x.(y+1)` (frontmatter-only change is a patch)
- Update `last_updated` to `2026-05-27`

### 5. Update SKILL-HISTORY.md

After all changes, prepend one batch row per modified skill to `~/apex/SKILL-HISTORY.md`:

```markdown
| 2026-05-27 | apex-animation | impl | 1.x.y | updated (impl) | DeepSeek compat: language fix + backend frontmatter | — |
| 2026-05-27 | apex-figma | impl | 1.x.y | updated (impl) | DeepSeek compat: image step flagged for planning review + backend frontmatter | — |
| 2026-05-27 | apex-design-system | impl | 1.x.y | updated (impl) | DeepSeek compat: language fix + backend frontmatter | — |
| 2026-05-27 | apex-ui-ux-design | impl | 1.x.y | updated (impl) | DeepSeek compat: language fix + backend frontmatter | — |
| 2026-05-27 | apex-ui-testing | impl | 1.x.y | updated (impl) | DeepSeek compat: language fix + backend frontmatter | — |
| 2026-05-27 | apex-security | impl | 1.x.y | updated (impl) | DeepSeek compat: language fix + backend frontmatter | — |
| 2026-05-27 | (all others) | SKILL+impl | 1.x.y | updated | Added backend frontmatter | — |
```

---

## Acceptance criteria

- `grep -r "Flag for Claude review" ~/.claude/skills/apex-*/impl.md` returns no results
- `grep -r "backend: deepseek" ~/.claude/skills/apex-*/impl.md | wc -l` matches total impl.md count
- `grep -r "backend: claude" ~/.claude/skills/apex-*/SKILL.md | wc -l` matches total SKILL.md count
- `apex-figma/impl.md` no longer has an uncaveated "MCP screenshot compared to rendered output" step
- Version numbers bumped and `last_updated` set to 2026-05-27 for all modified files

---

## Commands to run

```powershell
# Verify no "Claude review" references remain in impl.md files
Select-String -Path "$env:USERPROFILE\.claude\skills\apex-*\impl.md" -Pattern "Flag for Claude review"

# Count backend: deepseek entries
(Select-String -Path "$env:USERPROFILE\.claude\skills\apex-*\impl.md" -Pattern "backend: deepseek").Count

# Count backend: claude entries
(Select-String -Path "$env:USERPROFILE\.claude\skills\apex-*\SKILL.md" -Pattern "backend: claude").Count
```

---

## Risks / open questions

- `apex-ai-systems/impl.md` intentionally references `claude-sonnet-4-6` and `@anthropic-ai/sdk`
  in code examples — do NOT change these. They are correct (building Claude-powered apps).
- `apex-devcontainer/impl.md` references to `~/.claude` and `ANTHROPIC_*` env vars are
  infrastructure config — do NOT change these.
- The `backend: deepseek` field is informational only. No orchestrator logic reads it yet.
  If auto-routing is added later, this field will be the signal.
