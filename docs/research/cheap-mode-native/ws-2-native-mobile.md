# Research: Cheap-Mode UI Iteration — Native Mobile (SwiftUI + Jetpack Compose)
**Wave:** ws-2 | **Date:** 2026-06-16 | **Agent:** Phase-2 Retrieval

---

## Topic

"Cheap mode" UI iteration for native mobile: Apple SwiftUI (iOS/iPadOS) and Android Jetpack Compose.
Cheap mode = iterating on UI **without app logic/backend**, **token-efficient**, where an **image-capable LLM with no device access can SEE the result via a PNG file**.
Host context: **Windows 11** — findings are tagged `[WIN]` (runnable) or `[MAC-GATED]` (requires macOS).

---

## Q1 — Logic-Free Preview: Mock Data + No Backend

### Jetpack Compose — `@Preview` [VERIFIED: developer.android.com/develop/ui/compose/tooling/previews]

Basic preview with inline mock data:
```kotlin
@Preview(name = "My Button", showBackground = true)
@Composable
fun ButtonPreview() {
    MyButton(label = "Click me", enabled = true)
}
```

**`@PreviewParameter`** — injects typed datasets from a provider:
```kotlin
@Preview
@Composable
fun UserCardPreview(
    @PreviewParameter(UserPreviewParameterProvider::class) user: User
) {
    UserCard(user)
}

class UserPreviewParameterProvider : PreviewParameterProvider<User> {
    override val values = sequenceOf(
        User("Alice", age = 30),
        User("Bob", age = 25)
    )
}
```

**Multipreview** — stack multiple preview conditions with a single annotation:
```kotlin
@Preview(name = "Small font", fontScale = 0.5f)
@Preview(name = "Large font", fontScale = 1.5f)
annotation class FontScalePreviews

@FontScalePreviews
@Composable
fun MyScreenPreview() { MyScreen() }
```

Built-in multipreview annotations (Compose 1.6+): `@PreviewScreenSizes`, `@PreviewFontScales`, `@PreviewLightDark`, `@PreviewDynamicColors`.

**`LocalInspectionMode`** — gating preview-only stubs:
```kotlin
@Composable
fun MapWidget() {
    if (LocalInspectionMode.current) {
        Box(Modifier.size(200.dp).background(Color.LightGray)) { Text("Map placeholder") }
    } else {
        RealMapView(...)
    }
}
```

Preview limitations: no network, no file access, ViewModels cannot be constructed with complex deps. Workaround: extract stateless composable accepting plain data params, preview that.

### SwiftUI — `#Preview` macro / `PreviewProvider` [VERIFIED: developer.apple.com/documentation/swiftui]

```swift
// Modern macro form (Xcode 15+)
#Preview {
    MyView(title: "Hello", count: 42)
}

// Legacy PreviewProvider (still valid)
struct MyView_Previews: PreviewProvider {
    static var previews: some View {
        MyView(title: "Hello", count: 42)
            .previewDevice("iPhone 15")
    }
}
```

Previews render in Xcode's canvas with mock/static data. No backend needed. SwiftUI `ImageRenderer` can convert any `View` to `UIImage`/`NSImage`, but only at runtime on Apple platform.

**[MAC-GATED]** — All SwiftUI preview and rendering tooling is macOS/Xcode-bound.

---

## Q2 — Headless Screenshot Rendering to PNG (The Key Question)

### Android Compose: Three Tools, All JVM-Only, No Emulator

#### A. Paparazzi (Cash App) [VERIFIED: github.com/cashapp/paparazzi; context7:/cashapp/paparazzi]

- **What it does:** Renders Android Views and Composables to PNG on the JVM, using Android Studio's **LayoutLib** engine. No emulator, no device.
- **Windows:** `[WIN]` — Confirmed. Paparazzi ships a `layoutlib-native-win` artifact. Changelog explicitly documents Windows fixes: filename sanitisation (1.3.5), platform-agnostic paths (1.2.0), correct SDK path (0.9.0). Latest release 2.0.0-alpha05 (May 2026) active.
- **Rendering engine:** LayoutLib (same engine Android Studio uses for Compose previews) — produces pixel-accurate previews.
- **Caveat:** Cannot render Activities or Fragments — composable/view-only. Cross-platform rendering differences exist (noted in issue #1465, partially addressed in 1.3.5).

**Setup (Kotlin DSL):**
```kotlin
// build.gradle.kts
plugins {
    id("com.android.library")
    id("app.cash.paparazzi") version "2.0.0-alpha02"
}
```

**Gradle commands [WIN]:**
```
# Record golden PNGs to src/test/snapshots/
gradlew recordPaparazziDebug

# Verify against recorded baselines (generates diff PNGs on failure)
gradlew verifyPaparazziDebug

# Run all snapshot tests + HTML report at build/reports/paparazzi/
gradlew testDebug
```

**Test code:**
```kotlin
class MyButtonTest {
    @get:Rule val paparazzi = Paparazzi()

    @Test fun renders_correctly() {
        paparazzi.snapshot {
            MyButton(label = "Submit", enabled = true)
        }
    }
}
```

Output PNG location: `src/test/snapshots/images/com.example.MyButtonTest_renders_correctly.png`

#### B. Roborazzi (takahirom) [VERIFIED: github.com/takahirom/roborazzi; context7:/takahirom/roborazzi]

- **What it does:** Screenshot testing library for JVM Android tests. Runs on **Robolectric** with `@GraphicsMode(NATIVE)` to render real pixels. Supports composables, Activities, Fragments, and interactions.
- **Windows:** `[WIN]` — **Qualified yes.** Robolectric Native Graphics (RNG) had a DLL-missing bug on Windows (issue #8312, reported June 2023 on 4.10.3). **Fixed in Robolectric 4.12** which added native runtime support for Windows x86_64. Robolectric 4.13 (2024) further improved HW rendering. Use Robolectric >= 4.12 on Windows.
- **Compose Preview auto-generation:** Roborazzi can scan all `@Preview` composables and auto-generate screenshot tests:

```kotlin
// build.gradle.kts
roborazzi {
    generateComposePreviewRobolectricTests {
        enable = true
        packages = listOf("com.example.ui")
        robolectricConfig = mapOf(
            "sdk" to "[33]",
            "qualifiers" to "RobolectricDeviceQualifiers.Pixel5"
        )
        includePrivatePreviews = true
    }
}
```

**Gradle commands [WIN]:**
```
# Record baseline PNGs
gradlew recordRoborazziDebug

# Compare current renders against saved baselines
gradlew compareRoborazziDebug

# Validate (fail if diff detected)
gradlew verifyRoborazziDebug

# Verify then record
gradlew verifyAndRecordRoborazziDebug
```

**Test code:**
```kotlin
@RunWith(RobolectricTestRunner::class)
@GraphicsMode(GraphicsMode.Mode.NATIVE)
class MyComposableTest {
    @get:Rule val composeTestRule = createComposeRule()

    @Test fun capture_preview() {
        composeTestRule.setContent { MyButton(label = "Submit") }
        composeTestRule.onRoot().captureRoboImage("my_button.png")
    }
}
```

#### C. Google Compose Preview Screenshot Testing (`screenshotTest` source set) [VERIFIED: developer.android.com/studio/preview/compose-screenshot-testing]

- **What it does:** Official Android Gradle plugin that renders `@Preview` composables to PNG as JVM host-side tests. Zero emulator needed.
- **Windows:** `[WIN]` — Explicitly confirmed. Windows task syntax: `gradlew updateDebugScreenshotTest`. alpha14+ fixed "command line exceeds OS limits" on Windows and GitHub Actions.
- **Status:** Experimental, alpha15 (2026-05-21), requires AGP 8.5+ (tasks), AGP 9.0+ (full IDE), JDK 17+.
- **Key requirement (alpha10+):** `@PreviewTest` annotation must be added alongside `@Preview`.

**Setup:**
```kotlin
// gradle.properties
android.experimental.enableScreenshotTest=true

// build.gradle.kts
plugins {
    id("com.android.compose.screenshot") version "0.0.1-alpha15"
}
dependencies {
    screenshotTestImplementation(libs.screenshot.validation.api)
    screenshotTestImplementation(libs.androidx.ui.tooling)
}
```

**Preview code:**
```kotlin
// app/src/screenshotTest/kotlin/…
@PreviewTest
@Preview(showBackground = true)
@Composable
fun MyButtonPreview() {
    MyButton(label = "Submit", enabled = true)
}
```

**Gradle commands [WIN]:**
```
# Generate/update reference PNGs
gradlew updateDebugScreenshotTest

# Validate current renders against references (CI gate)
gradlew validateDebugScreenshotTest
```

Reference PNGs: `{module}/src/screenshotTestDebug/reference/`
HTML report: `{module}/build/reports/screenshotTest/preview/debug/index.html`

Memory config: `android.compose.screenshot.maxHeapSize=4g` (gradle.properties).

### SwiftUI: Headless PNG Rendering

**All options are `[MAC-GATED]`.** SwiftUI is an Apple-only framework with no Windows runtime.

| Tool | Rendering | macOS required? | Notes |
|---|---|---|---|
| `swift-snapshot-testing` (pointfreeco) | UIView/UIViewController snapshot via XCTest | macOS/Xcode | Captures PNG as XCTest attachment; no headless mode without Mac |
| `SnapshotPreviews` (EmergeTools/Sentry) | Xcode Preview → PNG via XCTest | macOS + Xcode + Simulator | `xcodebuild test -sdk iphonesimulator -destination 'platform=iOS Simulator,name=iPhone 15 Pro'` |
| `swiftui-render` (olliewagner) | ImageRenderer / NSWindow offscreen | macOS 13+, Xcode CLI tools, Apple Silicon | Headless binary, no simulator, but Mac-only |
| `xcrun simctl io booted screenshot out.png` | iOS Simulator | macOS + running Simulator | CLI screenshot; Mac-only |

**[MAC-GATED]** — There is no viable path to render SwiftUI to a PNG on Windows. SwiftUI requires the Apple platform runtime (Foundation, CoreGraphics, Metal). No cross-compile or emulation path exists on Windows.

---

## Q3 — Simulator/Emulator + CLI Screenshot Capture

### Android Emulator → PNG [WIN] (with emulator running)
```
adb exec-out screencap -p > screenshot.png
```
Requires: Android emulator running, ADB in PATH. On Windows, binary pipe may corrupt; safer:
```
adb shell screencap -p /sdcard/screen.png
adb pull /sdcard/screen.png screen.png
adb shell rm /sdcard/screen.png
```
ADB is available on Windows via Android SDK Platform Tools.

### iOS Simulator → PNG [MAC-GATED]
```bash
xcrun simctl io booted screenshot out.png
# With explicit format:
xcrun simctl io booted screenshot --type=png out.png
```
Requires: macOS, Xcode, running iOS Simulator. `booted` targets the currently booted simulator. Format options: png (default), tiff, bmp, gif, jpeg.

---

## Q4 — Live Preview / Hot Reload (IDE-Bound, Not LLM-Visible)

### Jetpack Compose — Android Studio
- **Compose Preview Panel**: renders `@Preview` composables live in IDE as you type. Not headless.
- **Live Edit** (Android Studio Hedgehog+): push composable code changes to running emulator/device without recompile. Emulator needed.
- **Interactive Preview Mode**: interact with composable within Android Studio preview pane.

**[WIN]** — Android Studio runs on Windows; live preview and interactive mode work locally.

### SwiftUI — Xcode
- **Xcode Preview Canvas**: live rendering as code changes. Pinned previews persist across edits.
- **Hot reload equivalent**: Xcode 15+ Preview macro updates canvas without full rebuild.

**[MAC-GATED]** — Xcode is macOS-only.

**LLM visibility note:** Neither live preview system produces a file automatically. Screenshots must be explicitly captured (Q2/Q3 methods) and fed to the LLM as a PNG.

---

## Q5 — Windows Verdict

### Compose (Android) — Windows Path is Genuine

**The cheap-mode workflow on Windows for Compose:**

1. Write `@Preview` composable with inline mock data (no backend, no ViewModel).
2. Pick ONE headless tool — **Paparazzi** (most mature, fastest, confirmed Win) or **Compose Preview Screenshot Testing** (official, simplest setup if AGP 9+).
3. Run Gradle task → PNG written to disk.
4. Feed PNG to image-capable LLM → iterate.

**Recommended tool by use case:**

| Need | Tool | Windows? |
|---|---|---|
| Fastest iteration, pure composables | Paparazzi 2.x | `[WIN]` confirmed |
| Automate all `@Preview` with zero test code | Compose Preview Screenshot Testing alpha15 | `[WIN]` confirmed |
| Activities / Fragments / interactions | Roborazzi + Robolectric 4.12+ | `[WIN]` qualified (4.12+ required) |

**Rendering fidelity note:** Paparazzi uses LayoutLib (same as Android Studio) — very close to device renders. Minor cross-OS font/text differences observed (fixed partially in 1.3.5).

### SwiftUI (iOS) — Windows Dead End

**There is no path to render SwiftUI to a PNG on Windows.** All options (Xcode Previews, swift-snapshot-testing, swiftui-render, SnapshotPreviews, xcrun simctl) require macOS + either Xcode or Xcode CLI tools.

**Cheapest fallback on Windows for SwiftUI UI design iteration:**

| Option | Notes |
|---|---|
| Figma / design mockup | Not real SwiftUI but LLM-visible; iterate design then hand off to Mac |
| SwiftUI in a web viewer proxy (e.g., Appetize.io) | Remote iOS simulator; costs money; screenshot via browser |
| GitHub Actions (macOS runner) | Free tier includes macOS; run Xcode tests + artifact PNGs; slower loop |
| Mac Mini / Mac access | The actual cheap long-term fix; even a remote SSH Mac with `swiftui-render` CLI works |

**Bottom line:** For SwiftUI, Windows is structurally incompatible. The cheapest viable path is a CI macOS runner (GitHub Actions free tier) that runs `swift-snapshot-testing` or `swiftui-render` and uploads PNG artifacts.

---

## Sources

### Tier 1 (Verified)
- [Compose Previews docs](https://developer.android.com/develop/ui/compose/tooling/previews) — @Preview, @PreviewParameter, multipreview, LocalInspectionMode [VERIFIED]
- [Compose Preview Screenshot Testing](https://developer.android.com/studio/preview/compose-screenshot-testing) — screenshotTest source set, task names, Windows confirmed [VERIFIED]
- [Compose Preview Screenshot Testing Release Notes](https://developer.android.com/studio/preview/compose-screenshot-testing-release-notes) — alpha15, @PreviewTest requirement, Windows fix alpha14 [VERIFIED]
- [Paparazzi GitHub](https://github.com/cashapp/paparazzi) — no emulator, JVM, Gradle commands [VERIFIED]
- [Paparazzi Changelog](https://cashapp.github.io/paparazzi/changelog/) — Windows fixes, layoutlib-native-win, 2.0.0-alpha05 [VERIFIED]
- [Roborazzi GitHub](https://github.com/takahirom/roborazzi) — Robolectric NATIVE, Compose preview auto-generation [VERIFIED]
- [swift-snapshot-testing](https://github.com/pointfreeco/swift-snapshot-testing) — supports iOS/macOS/tvOS/Linux, no Windows [VERIFIED]
- [SnapshotPreviews EmergeTools](https://github.com/EmergeTools/SnapshotPreviews) — requires Xcode + Simulator, macOS only [VERIFIED]
- [swiftui-render](https://github.com/olliewagner/swiftui-render) — macOS 13+ only, Apple Silicon [VERIFIED]
- [Robolectric issue #8312](https://github.com/robolectric/robolectric/issues/8312) — Windows DLL bug, closed (fixed in 4.12) [VERIFIED]

### Tier 2 (Community / Cross-reference)
- [Paparazzi vs Roborazzi vs CPST comparison — Natalia Kulbaka](https://medium.com/@natalia.kulbaka/comparing-snapshot-testing-libraries-paparazzi-roborazzi-compose-previews-screenshot-testing-b7c3b47f7f59) [COMMUNITY]
- [Android screenshot testing playground — sergio-sastre](https://github.com/sergio-sastre/Android-screenshot-testing-playground) [COMMUNITY]
- [Screenshot testing on JVM via Paparazzi — hashnode](https://dispatchersdotplayground.hashnode.dev/screenshot-testing-on-the-jvm-thanks-to-paparazzi) [COMMUNITY]
- [Robolectric 4.13 release discussion](https://github.com/robolectric/robolectric/discussions/9269) [COMMUNITY]
- [xcrun simctl screenshots — Sarunw](https://sarunw.com/posts/take-screenshot-and-record-video-in-ios-simulator/) [COMMUNITY]
