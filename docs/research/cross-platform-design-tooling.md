# Cross-Platform / Non-Web Prompt-to-Design Tooling — landscape

_Research date: 2026-06-16. Scope: AI design-generation tools that emit **non-web, non-Apple** native UI (Flutter, Windows native, .NET MAUI, Kotlin/Compose Multiplatform, true all-platform). Complements the Apple-only `swiftui-design-tooling/` (Bitrig) and web (Stitch) lanes._

## Findings

| Tool | Target / output | Maturity | Access | Cost | Runs on | Verdict |
|---|---|---|---|---|---|---|
| **FlutterFlow AI** (Prompt-to-Page / -Component / GenUI Chat) | Flutter/Dart — editable FlutterFlow widgets | Stable; Google-owned since late 2025 | Web app | Free (5 lifetime gens) → $39–150/mo | Browser (any OS) | **Strongest for Flutter.** Real prompt→Flutter UI, editable not throwaway. |
| **DreamFlow** (FlutterFlow team) | Flutter — full screen/app from prompt | New, prototyping-grade; FF integration planned | Web app | Freemium | Browser | First-draft screens only; not production alone. |
| **Google GenUI SDK** | Flutter — *runtime* agent-composed UI | OSS, emerging | SDK | Free | Any | Runtime UI assembly, **not** an authoring/design tool. |
| **Uno Platform Studio — Hot Design Agent** | WinUI/XAML → native C#/.NET across **Win, mac, iOS, Android, Linux, WASM** | Studio 3.0, shipped Nov 2025 (.NET 10) | Desktop (VS/VS Code) + App MCP; Figma-MCP in | Paid (Pro; trial) | Windows/macOS | **Best true all-platform-native answer.** One codebase → native controls per OS. |
| **WinUI agent tooling / WinCLI + Windows Dev Skills** | WinUI 3 / Windows App SDK | Preview, Build 2026 | CLI + VS/VS Code; **agent skills for Claude Code** & Copilot | Free | Windows | **Promising, new.** Agent *codegen*, not a visual canvas. |
| **Telerik AIPrompt / Syncfusion AssistView** | .NET MAUI | Stable | NuGet | Paid | Any (.NET) | **Misnamed** — in-app AI chat controls, NOT prompt→UI. |
| **.NET MAUI via Copilot/Cursor/Claude** | MAUI XAML | Generic codegen | IDE assistants | Varies | Any | No dedicated tool; stumbles on platform-specific XAML. |
| **Compose Multiplatform** (Kotlin) | Android/iOS/desktop native Compose | No dedicated product | JetBrains Junie / LLMs | Junie sub | Any | No purpose-built generator; relies on Jetpack-Compose API overlap. |
| **Tauri / Electron** | web UI in native shell | — | (use Stitch/web) | — | Any | No dedicated tool; web underneath → Stitch applies. |

## Honest gaps

- No credible **WPF/WinForms** visual prompt-to-design canvas.
- No dedicated **Compose Multiplatform** or **MAUI** prompt-to-UI product — both lean on generic agent codegen.
- No single tool emits separate per-platform native toolkits everywhere at once. The closest "native everywhere" is **Uno** (one C#/XAML codebase → its own cross-platform native controls) or **Flutter** (draws its own widgets).

## Bottom line (app spanning Apple + Windows + iPad + mobile)

There is no Stitch-polish "describe it, get native UI everywhere" tool in mid-2026. The path forks by **framework commitment** (decided by apex-stack / apex-mobile):
- **.NET/C#** → **Uno Platform Studio Hot Design Agent** — closest to one-codebase, all-native-surfaces.
- **Flutter** → **FlutterFlow AI (+ DreamFlow)** — most mature prompt-to-UI; own widgets, not OS-native controls.
- **Windows-first native** → **WinCLI / Windows Dev Skills** (agent codegen, usable from Claude Code).
- **KMP / MAUI** → no dedicated tool; text-first brief + generic agent codegen.

Pick the framework first; the design-gen lane follows.
