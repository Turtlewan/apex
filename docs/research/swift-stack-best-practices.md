# Research: Swift / SwiftUI stack (macOS + iOS + iPadOS) for `apex-swift`

**Date:** 2026-05-31
**Confidence:** MEDIUM — SwiftUI/Swift 6 patterns from Apple docs (Tier 1) + reputable community
(avdlee/twostraws agent skills); **recipe commands NOT yet run** (no Mac/Xcode on the dev machine).
**Re-research after:** 2026-07-31 (Apple WWDC-cadence; concurrency tooling still settling).

## Summary
For an all-Apple app (macOS hub + iOS/iPad clients) the 2026 stack is **Swift 6 (strict concurrency
language mode) + SwiftUI multiplatform + @Observable + SwiftData + NavigationStack**. Swift 6's
compiler-enforced data-race safety is the verifiability buy-back (analogous to `mypy --strict` /
`tsc`): the compiler catches an entire class of concurrency bugs the AI would otherwise ship. The
Verification Recipe is `swift build`/`swift test` for SPM modules + `xcodebuild` per platform
destination + `swiftlint`/`swift format` — **authored here but to be empirically validated on the
Mac before the recipe is trusted** (apex-skill-author Iron Law for stack skills).

## Key findings

- **Swift 6 strict concurrency is compiler-enforced and mandatory in Swift 6 language mode.** Data
  races are compile-time errors via `Sendable` conformance + actor isolation + `@MainActor`. This is
  the load-bearing correctness gate. `[VERIFIED — Apple: Adopting strict concurrency in Swift 6]`
- **`@Observable` macro** (Observation framework) replaces `ObservableObject` + `@Published`: less
  boilerplate, granular re-render on exactly what a view reads, and models are plain testable Swift
  classes. `[VERIFIED + COMMUNITY]`
- **SwiftData** is the clean persistence layer (replaces Core Data boilerplate); **NavigationStack**
  is type-safe routing. `[COMMUNITY — consistent 2026 sources]`
- **SwiftUI is `@MainActor`-annotated**; the compiler flags UI updates / non-Sendable closures that
  cross isolation. Plan view-models as `@MainActor @Observable`. `[VERIFIED]`
- **Multiplatform:** one SwiftUI codebase across macOS/iOS/iPadOS with platform-conditional UI
  (`#if os(macOS)`), shared business logic in a Swift 6 SPM module. `[COMMUNITY]`
- **iOS 26 era** (Apple year-based versioning; "Liquid Glass" design language). Target the current
  SDK. `[COMMUNITY — avdlee skill]`
- **Swift Testing** (new macro-based framework, `@Test`) coexists with XCTest. `[VERIFIED]`

## Recommended Verification Recipe (CANDIDATE — ⚠️ unvalidated until run on Mac)

```bash
# Shared business-logic SPM module:
swift build                                        # compiler = Swift 6 safety gate
swift test                                         # Swift Testing / XCTest

# App targets (Xcode project) — build per platform destination:
xcodebuild -scheme <App> -destination 'platform=macOS' build
xcodebuild -scheme <App> -destination 'platform=iOS Simulator,name=iPhone 16' build
xcodebuild -scheme <App> -destination 'platform=macOS' test

# Style / lint:
swiftlint                                          # realm/SwiftLint (community standard)
# or Apple's: swift format lint --recursive Sources/
```

- **Verifiability lever:** enable **Swift 6 language mode** (`swift-tools-version` / `SWIFT_VERSION`)
  so strict concurrency is a hard compile gate — do not author with it off.
- ⚠️ Exact scheme names, the current simulator device name, and whether `swiftlint` vs `swift
  format` is the project default must be confirmed against the real Xcode project on the Mac.

## Stack opinions worth enforcing (candidate gotchas)

- **Swift 6 language mode ON from project creation** — retrofitting strict concurrency later is
  painful. It is the buildability buy-back; don't disable it to silence errors.
- **View-models: `@MainActor @Observable final class`** — not `ObservableObject`.
- **`Sendable` across the actor boundary** — types crossing into background actors must conform; fix
  the type, don't `@unchecked Sendable` it away.
- **No blocking work on `@MainActor`** — offload to `Task.detached` / a background actor; `await`
  back to main for UI.
- **SwiftData `@Model` is not a DTO** — keep network/codable models separate from persisted models.
- **Platform-conditional UI, shared logic** — `#if os(...)` only in the view layer; business logic
  stays platform-agnostic in the SPM module.

## Assumptions / gaps (must validate on Mac)
- Whole recipe is **unrun** — `swift`/`xcodebuild` absent on the Windows dev machine. First Mac build
  must execute it: confirm commands exist, scheme/destination names resolve, and the loop converges.
- Whether the hub uses Mac Catalyst vs native macOS (AppKit interop) is an app-design choice, not a
  stack-skill fact — out of scope.
- `swiftlint` is community (SPM plugin / brew); `swift format` is Apple-official. Pick one at project
  setup; recipe shows both.

## Sources
- Apple — *Adopting strict concurrency in Swift 6* (developer.apple.com), SwiftUI docs
  (`/websites/developer_apple_swiftui`, Context7)
- `/avdlee/swiftui-agent-skill`, `/twostraws/swiftui-agent-skill` (Context7 — reputable community)
- realm/SwiftLint (GitHub); xcodebuild CLI references (mokacoding, Apple TN2339)
