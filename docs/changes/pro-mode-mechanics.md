# Pro-mode mechanics (Phase 0)

**Identity:** One-command Flash↔Pro coding-tier toggle + APEX tier-awareness (hook injection + Step-6 status line) + routing docs.

---

## Files to change

| Path | Operation |
|------|-----------|
| `~/.zshrc` (Mac) | modify — add `apex-code` zsh function |
| `$PROFILE` (Windows PowerShell) | modify — add `apex-code` function |
| `C:\Users\User\.claude\hooks\backend-session-start.ps1` | modify — emit `coder_tier` in coding mode |
| `C:\Users\User\.claude\skills\apex-orchestrate\SKILL.md` | modify — Step-6 status line gains `Tier:` in coding mode (2 occurrences) |
| `C:\Users\User\apex\BACKEND-ROUTING.md` | modify — document toggle + Flash/Pro tiers |

State file written at runtime (not created by spec): `~/.apex-coding-model` holds the literal `flash` or `pro`.

---

## Task 1 — zsh toggle (`~/.zshrc`, Mac)

Append the following function to `~/.zshrc`. The API key is read from the existing `$DEEPSEEK_API_KEY` env var — never hardcode it.

```zsh
# APEX coding-tier toggle: `apex-code` flips Flash<->Pro, `apex-code flash|pro` sets explicitly.
apex-code() {
  local state_file="$HOME/.apex-coding-model"
  local choice="$1"

  if [[ -z "$choice" ]]; then
    # bare call: alternate based on persisted state (default flash if unset)
    local current="flash"
    [[ -f "$state_file" ]] && current="$(cat "$state_file")"
    if [[ "$current" == "pro" ]]; then choice="flash"; else choice="pro"; fi
  fi

  case "$choice" in
    flash) export ANTHROPIC_MODEL="deepseek-v4-flash" ;;
    pro)   export ANTHROPIC_MODEL="deepseek-v4-pro" ;;
    *) echo "apex-code: usage: apex-code [flash|pro]" >&2; return 1 ;;
  esac

  echo "$choice" > "$state_file"
  export ANTHROPIC_BASE_URL="https://api.deepseek.com/anthropic"
  export ANTHROPIC_AUTH_TOKEN="$DEEPSEEK_API_KEY"

  echo "apex-code: coding tier = $choice ($ANTHROPIC_MODEL)"
  claude
}
```

---

## Task 2 — PowerShell toggle (`$PROFILE`, Windows)

Append the following function to the file at `$PROFILE`. The API key is read from the existing `$env:DEEPSEEK_API_KEY` — never hardcode it.

```powershell
# APEX coding-tier toggle: `apex-code` flips Flash<->Pro, `apex-code flash|pro` sets explicitly.
function apex-code {
    param([string]$Choice)

    $stateFile = Join-Path $HOME '.apex-coding-model'

    if (-not $Choice) {
        $current = 'flash'
        if (Test-Path $stateFile) { $current = (Get-Content $stateFile -Raw).Trim() }
        if ($current -eq 'pro') { $Choice = 'flash' } else { $Choice = 'pro' }
    }

    switch ($Choice) {
        'flash' { $env:ANTHROPIC_MODEL = 'deepseek-v4-flash' }
        'pro'   { $env:ANTHROPIC_MODEL = 'deepseek-v4-pro' }
        default { Write-Error 'apex-code: usage: apex-code [flash|pro]'; return }
    }

    Set-Content -Path $stateFile -Value $Choice -Encoding utf8 -NoNewline
    $env:ANTHROPIC_BASE_URL = 'https://api.deepseek.com/anthropic'
    $env:ANTHROPIC_AUTH_TOKEN = $env:DEEPSEEK_API_KEY

    Write-Output "apex-code: coding tier = $Choice ($env:ANTHROPIC_MODEL)"
    claude
}
```

---

## Task 3 — Tier detection in SessionStart hook (`C:\Users\User\.claude\hooks\backend-session-start.ps1`)

### 3a. Compute `coder_tier` inside the `if ($isDeepSeek) { … }` block.

Find this block (lines 9–16):

```powershell
if ($isDeepSeek) {
    $mode = 'CODING'
    $backend = 'DeepSeek'
    $policy = @"
Mode: CODING (DeepSeek backend)
You MAY: edit source code, run build/test/lint commands, complete implementation tasks.
You SHOULD: look for technical change specs in docs/changes/*.md (or wherever the user keeps them) and execute them. After completing each spec, update its status (e.g., mark Done at top, or move the file to docs/changes/done/).
"@
} else {
```

Replace it with:

```powershell
if ($isDeepSeek) {
    $mode = 'CODING'
    $backend = 'DeepSeek'
    $model = $env:ANTHROPIC_MODEL
    if ($model -and $model -like '*pro*') { $coderTier = 'pro' } else { $coderTier = 'flash' }
    $policy = @"
Mode: CODING (DeepSeek backend)
Coder tier: $coderTier (ANTHROPIC_MODEL: $(if ($model) { $model } else { '(unset - default flash)' }))
You MAY: edit source code, run build/test/lint commands, complete implementation tasks.
You SHOULD: look for technical change specs in docs/changes/*.md (or wherever the user keeps them) and execute them. After completing each spec, update its status (e.g., mark Done at top, or move the file to docs/changes/done/).
"@
} else {
    $coderTier = ''
```

(The `else` branch gains a single `$coderTier = ''` line at its top; keep all existing lines in the `else` block below it unchanged.)

### 3b. Surface `coder_tier` in the injected context.

Find the `$ctx` assignment (line 57):

```powershell
$ctx = "$route`n## Active LLM backend: $backend`n## ANTHROPIC_BASE_URL: $url`n`n$policy$handoffContent"
```

Replace with:

```powershell
$tierLine = if ($coderTier) { "`n## coder_tier: $coderTier" } else { '' }
$ctx = "$route`n## Active LLM backend: $backend`n## ANTHROPIC_BASE_URL: $url$tierLine`n`n$policy$handoffContent"
```

### 3c. Mac/zsh hook equivalent — **deferred Mac task. Do not implement.**

A zsh/bash SessionStart equivalent of this hook does not exist on the Mac yet. Note for a future Mac session: port `coder_tier` detection to the Mac hook when it is created. Do not invent the Mac hook in this spec.

---

## Task 4 — Step-6 status line tier (`C:\Users\User\.claude\skills\apex-orchestrate\SKILL.md`)

Two occurrences of the status line exist (line 133 under Step 6, line 192 under Governance rules). Update **both** identically.

Find (each occurrence):

```
"Running at L{n} | Profile: {profile} | Stack: {stack_skills or 'none'} | Mode: {planning/coding}"
```

Replace with:

```
"Running at L{n} | Profile: {profile} | Stack: {stack_skills or 'none'} | Mode: {planning/coding}"

In coding mode only, append ` | Tier: {flash|pro}` (read from the `coder_tier` value injected by the SessionStart hook). Omit the Tier segment in planning mode.
```

---

## Task 5 — Routing docs (`C:\Users\User\apex\BACKEND-ROUTING.md`)

### 5a. Detection-rule table — split DeepSeek into the two tiers.

Find (lines 10–13):

```
| `ANTHROPIC_BASE_URL` | Active backend | Mode |
|----------------------|---------------|------|
| unset or `api.anthropic.com` | **Claude (Anthropic)** | Planning |
| contains `deepseek` | **DeepSeek V4 Flash** | Coding |
```

Replace with:

```
| `ANTHROPIC_BASE_URL` | `ANTHROPIC_MODEL` | Active backend | Mode |
|----------------------|-------------------|----------------|------|
| unset or `api.anthropic.com` | — | **Claude (Anthropic)** | Planning |
| contains `deepseek` | `deepseek-v4-flash` (or unset) | **DeepSeek V4 Flash** | Coding |
| contains `deepseek` | `deepseek-v4-pro` | **DeepSeek V4 Pro** | Coding |

The coding tier (Flash vs Pro) is selected by the `apex-code` shell toggle (see [Switching backends](#switching-backends)) and persisted in `~/.apex-coding-model`. Pro is ~3.1× the cost of Flash. The SessionStart hook reads `ANTHROPIC_MODEL` and injects a `coder_tier` value (`flash`|`pro`); apex-orchestrate surfaces it in the Step-6 status line as `Tier: {flash|pro}`.
```

### 5b. "Switching backends" section — document the toggle.

Find the "To switch to coding mode (DeepSeek)" PowerShell block (lines 121–126):

```powershell
$env:ANTHROPIC_BASE_URL = "https://api.deepseek.com/anthropic"
$env:ANTHROPIC_AUTH_TOKEN = "<your DeepSeek API key>"
$env:ANTHROPIC_MODEL = "deepseek-v4-flash"
```

Replace the surrounding "**To switch to coding mode (DeepSeek):**" subsection with:

```
**To switch to coding mode (DeepSeek) — use the `apex-code` toggle:**

```sh
apex-code          # flip between Flash and Pro (alternates from last choice)
apex-code flash    # force Flash tier (deepseek-v4-flash)
apex-code pro      # force Pro tier (deepseek-v4-pro, ~3.1× Flash cost)
```

The function sets `ANTHROPIC_BASE_URL`, `ANTHROPIC_AUTH_TOKEN` (from `$DEEPSEEK_API_KEY` / `$env:DEEPSEEK_API_KEY`), and `ANTHROPIC_MODEL`, persists the tier to `~/.apex-coding-model`, then launches `claude`. Defined in `~/.zshrc` (Mac, primary) and `$PROFILE` (Windows).
```

### 5c. Footer — update the version line.

Find (line 156):

```
_Last updated: 2026-06-02 | DeepSeek: V4 Flash | Claude: Sonnet 4.6 / Opus 4.7_
```

Replace with:

```
_Last updated: 2026-06-13 | DeepSeek: V4 Flash / V4 Pro | Claude: Sonnet 4.6 / Opus 4.7_
```

---

## Acceptance criteria (step → verify)

1. **zsh toggle exists and is well-formed** *(Mac-gated — deferred validation)*
   → `source ~/.zshrc && type apex-code` prints the function definition without error.

2. **zsh bare call alternates** *(Mac-gated — deferred validation)*
   → `echo flash > ~/.apex-coding-model; apex-code` (cancel `claude` launch) leaves `~/.apex-coding-model` containing `pro`; running `apex-code` again yields `flash`.

3. **zsh explicit set + env exports** *(Mac-gated — deferred validation)*
   → `apex-code pro` sets `ANTHROPIC_MODEL=deepseek-v4-pro`, `ANTHROPIC_BASE_URL=https://api.deepseek.com/anthropic`, and `ANTHROPIC_AUTH_TOKEN=$DEEPSEEK_API_KEY`; `~/.apex-coding-model` reads `pro`.

4. **PowerShell toggle exists**
   → `. $PROFILE; Get-Command apex-code` returns a Function entry.

5. **PowerShell bare call alternates**
   → `Set-Content ~/.apex-coding-model 'flash' -NoNewline; apex-code` (with `claude` launch interrupted) leaves the state file reading `pro`.

6. **PowerShell explicit set + env exports**
   → `apex-code pro` sets `$env:ANTHROPIC_MODEL` to `deepseek-v4-pro`, `$env:ANTHROPIC_BASE_URL` to the DeepSeek URL, and `$env:ANTHROPIC_AUTH_TOKEN` to `$env:DEEPSEEK_API_KEY`.

7. **Hook emits Flash tier on unset model**
   → `$env:ANTHROPIC_BASE_URL='https://api.deepseek.com/anthropic'; Remove-Item Env:ANTHROPIC_MODEL -EA SilentlyContinue; powershell -File C:\Users\User\.claude\hooks\backend-session-start.ps1` output JSON's `additionalContext` contains `coder_tier: flash`.

8. **Hook emits Pro tier**
   → same as #7 but with `$env:ANTHROPIC_MODEL='deepseek-v4-pro'` → `additionalContext` contains `coder_tier: pro`.

9. **Hook omits tier in planning mode**
   → `Remove-Item Env:ANTHROPIC_BASE_URL -EA SilentlyContinue; powershell -File ...backend-session-start.ps1` output `additionalContext` contains no `coder_tier:` substring.

10. **Step-6 status line documents Tier**
    → `grep -c "Tier: {flash|pro}" C:\Users\User\.claude\skills\apex-orchestrate\SKILL.md` returns `2`.

11. **BACKEND-ROUTING documents Pro tier + toggle**
    → `grep -E "deepseek-v4-pro|apex-code" C:\Users\User\apex\BACKEND-ROUTING.md` returns matches for both the Pro model string and the `apex-code` command.

---

## Commands to run

```powershell
# Hook tier detection (criteria 7, 8, 9)
$env:ANTHROPIC_BASE_URL='https://api.deepseek.com/anthropic'; Remove-Item Env:ANTHROPIC_MODEL -ErrorAction SilentlyContinue; powershell -File C:\Users\User\.claude\hooks\backend-session-start.ps1
$env:ANTHROPIC_MODEL='deepseek-v4-pro'; powershell -File C:\Users\User\.claude\hooks\backend-session-start.ps1
Remove-Item Env:ANTHROPIC_BASE_URL -ErrorAction SilentlyContinue; powershell -File C:\Users\User\.claude\hooks\backend-session-start.ps1

# PowerShell toggle (criteria 4, 5, 6)
. $PROFILE; Get-Command apex-code

# Doc + skill checks (criteria 10, 11)
grep -c "Tier: {flash|pro}" C:\Users\User\.claude\skills\apex-orchestrate\SKILL.md
grep -E "deepseek-v4-pro|apex-code" C:\Users\User\apex\BACKEND-ROUTING.md
```

```zsh
# zsh toggle (criteria 1, 2, 3) — Mac-gated, deferred validation
source ~/.zshrc && type apex-code
echo flash > ~/.apex-coding-model && apex-code pro && cat ~/.apex-coding-model
```
