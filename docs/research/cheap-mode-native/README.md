# Research: "Cheap mode" UI iteration for native app targets (mobile + desktop)

**Date:** 2026-06-16
**Confidence:** HIGH — mostly Tier-1/primary (official docs + tool repos); a few tools are in alpha (tagged).
**Re-research after:** 2026-07-16 (fast-moving frontend/mobile tooling; several tools in alpha)

## Summary
"Cheap mode" = render a UI component **logic-free** to a **PNG an image model can read**, in a fast, token-light loop. The deciding factor for cheapness is whether you can produce that PNG **without spinning a heavy emulator / simulator / app window**. Verdict: **every target except Apple SwiftUI has a Windows-runnable cheap path** — and for the big ones (Flutter, Android Compose, Avalonia desktop) there's a genuine **headless host-render-to-PNG** path that needs no emulator at all. SwiftUI is the lone hard Mac-gate.

## The cheap-mode tier model (the synthesis insight)
Rank a target's preview path by what it costs to get a PNG:

| Tier | Mechanism | Targets | Cost |
|------|-----------|---------|------|
| **A — headless host-render → PNG** (cheapest; no emulator/window) | A test/render command rasterises the component on the host | **Flutter** goldens · **Android Compose** (Paparazzi / Roborazzi / Compose Preview Screenshot Testing) · **Avalonia** headless Skia | Lowest — scriptable, fast, I read the PNG directly |
| **B — browser preview + Playwright screenshot** (≈ what we did today) | Component renders in Chrome via a dev server | **Web** · **Electron** · **Tauri** · **Expo/RN** (Storybook-RN-Web) · Flutter-web | Low |
| **C — run on emulator/device/window + capture** (full fidelity) | Launch it, then screenshot to a file | Android emulator (`adb screencap`) · WPF/WinUI window (FlaUI/PowerShell) · iOS simulator | Higher (boot + run) |
| **Mac-gated** | No Windows render path exists | **Apple SwiftUI** | Needs a Mac (or CI macOS runner) |

**Working rule:** prototype the *look* as a web mockup (Tier B, framework-agnostic, cheapest) → lock the design-brief → for native fidelity use the target's **Tier-A headless render** of the real component where it exists; fall back to Tier C / Mac only when Tier A isn't available.

## Per-target: cheapest path for *my* eyes (PNG)
| Target | Cheapest LLM-visible path | Tier | Windows? | Key caveat |
|--------|---------------------------|------|----------|------------|
| Web | Chrome dev-server + Playwright screenshot | B | ✅ | — |
| **Electron** | Chrome dev-server (renderer = Chromium) + `page.screenshot()` | B | ✅ | native IPC / window chrome absent in plain Chrome |
| **Tauri** | Chrome dev-server (WebView2 = Chromium) + Playwright | B | ✅ | Rust `invoke()` cmds absent; minor WebView2↔Chrome font diffs |
| **Flutter** (mobile/desktop/web) | `flutter test --update-goldens` → host-rendered PNG | **A** | ✅ | Windows font anti-aliasing differs vs Linux CI → use `alchemist` (replaced `golden_toolkit` 2025) |
| **Expo / React Native** | Storybook-RN-Web (Vite, SB 8.5+) on localhost + Playwright screenshot | B | ✅ | `react-native-web` mocks `Alert`/`RefreshControl`/`NativeModules`/`useNativeDriver` etc.; layout/style fine |
| **Android (Jetpack Compose)** | Paparazzi (`recordPaparazziDebug`) → JVM/LayoutLib PNG, no emulator | **A** | ✅ | Paparazzi = composable-only; needs `layoutlib-native-win` (fixed ≥1.3.5). Alt: Google's Compose Preview Screenshot Testing (AGP 8.5+, JDK 17) or Roborazzi (Robolectric ≥4.12 on Windows) |
| **Apple (SwiftUI)** | none locally | Mac-gated | ❌ | `swift-snapshot-testing` / `xcrun simctl io booted screenshot` all need macOS+Xcode. Fallback: GitHub Actions **macOS runner** → upload PNG artifacts, or a web-mockup proxy |
| **.NET WPF** | `RenderTargetBitmap` in a console exe → PNG | A* | ✅ | needs a desktop session (empty PNG as a Windows Service — dotnet/wpf#2811). XAML Hot Reload + Live Preview for interactive. Avalonia XPF adds true headless to WPF |
| **.NET WinUI 3** | FlaUI `Capture.Element(window).ToFile()` on the running app | C | ✅ | no headless path; XAML Designer removed in VS2022 (XAML Studio open-sourced Jan 2026) |
| **Avalonia** (Win/Mac/Linux desktop) | `.UseSkia().UseHeadless()` → `CaptureRenderedFrame().Save()` → PNG | **A** | ✅ | pure Skia, no display needed — cheapest native-desktop path |

## Recommended approach
- **Web-shell desktop (Electron/Tauri):** treat exactly like web — mock in Chrome, Playwright screenshot. Switch to the real `.exe` only for native-API / window-chrome work. (Tier B.)
- **Flutter:** `flutter test --update-goldens` is the cleanest emulator-free PNG loop — strongest cross-stack cheap-mode option. Pair with Widgetbook (`-d windows`/`-d chrome`) for interactive hot-reload exploration. (Tier A.)
- **Android Compose:** **Paparazzi** for composable-only iteration (most mature on Windows); Google's Compose Preview Screenshot Testing if you want zero test code off existing `@Preview`s. (Tier A.)
- **Expo/RN:** Storybook-RN-Web + Playwright screenshot for the no-emulator loop; Android emulator + `adb exec-out screencap` when native fidelity matters. (Tier B/C.)
- **.NET desktop:** prefer **Avalonia headless** if the stack is open — true scriptable PNG. WPF: `RenderTargetBitmap` console exe. WinUI 3: FlaUI window capture. (Tier A / C.)
- **SwiftUI:** accept the Mac-gate — local web-mockup proxy for layout/feel, CI macOS runner for real-pixel fidelity. (Mac-gated.)

## Capture commands (quick reference)
```sh
# Android emulator/device (Expo/RN + Flutter)        [WIN]
adb exec-out screencap -p > screen.png
# Flutter, no emulator (host render)                 [WIN]
flutter test --update-goldens          # → test/goldens/*.png
# Android Compose, no emulator (host render)         [WIN]
gradlew recordPaparazziDebug           # → src/test/snapshots/*.png
# iOS simulator                                       [MAC]
xcrun simctl io booted screenshot out.png
# Windows native window capture                       [WIN]
nircmd.exe savescreenshotwin "out.png"   # or PowerShell CopyFromScreen / FlaUI Capture.Element
```

## Gaps / to validate hands-on
- The Tier-A tools are mostly **alpha** (Paparazzi 2.0.0-alpha, Compose Preview Screenshot Testing alpha15) — versions/commands will move; re-check on use.
- None of the native Tier-A paths have been *run* here (Windows planning box has no Flutter/Android/.NET toolchains installed) — first real build is the validation, same posture as the apex-swift recipe.

## Sources
- `ws-1-mobile-crossplatform.md` — Expo/RN + Flutter (Storybook-RN-Web, golden tests, Widgetbook, adb)
- `ws-2-native-mobile.md` — SwiftUI (Mac-gated) + Compose (Paparazzi/Roborazzi/Compose Preview Screenshot Testing)
- `ws-3-desktop.md` — Electron/Tauri (web-shell) + .NET WinUI/WPF/Avalonia (headless Skia, RenderTargetBitmap, FlaUI)
