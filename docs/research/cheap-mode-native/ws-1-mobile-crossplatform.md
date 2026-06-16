# WS-1: Cheap-Mode UI Iteration — Cross-Platform Mobile (Expo/RN + Flutter)

> Research wave 1 of the cheap-mode-native pass.
> Focus: logic-free component isolation, web preview, hot reload, screenshot-to-PNG capture,
> golden/snapshot tests repurposed for design, and Windows runnability.
> Date: 2026-06-16

---

## Summary

"Cheap mode" = iterate on UI visuals with mock data, no business logic/backend, in a tight
loop where an image-capable LLM can see the rendered result as a PNG file — no device access
needed by the LLM.

**Leanest path for each stack:**

- **Expo / React Native** → Storybook for React Native Web (Vite) running in Chrome on Windows.
  Stories render in a desktop browser with full hot reload. No Android emulator required.
  For PNG capture: browser screenshot via Playwright/Puppeteer CLI, or `adb exec-out screencap`
  when an Android emulator IS used.

- **Flutter** → `flutter test --update-goldens` (golden tests). Renders widgets to PNG files on
  the host machine — NO emulator, NO device, fully headless. Flutter web + Widgetbook in Chrome
  is the interactive alternative. Both run on Windows.

**No-emulator PNG path exists for Flutter** (golden tests). For Expo/RN, Storybook web covers
the interactive loop; PNG requires either browser automation or an emulator with adb.

---

## Key Findings

### 1. Logic-Free Component Isolation

#### Expo / React Native — Storybook

**Option A: Storybook for React Native (on-device / on-emulator)**
`@storybook/react-native` v9+ runs stories on the device/emulator via the Metro bundler.
Stories render real native components. Environment variable gate (Windows-compatible via `cross-env`):

```json
// package.json
{ "scripts": { "storybook": "cross-env EXPO_PUBLIC_STORYBOOK_ENABLED=true expo start" } }
```

```js
// metro.config.js
module.exports = withStorybook(config, {
  enabled: process.env.EXPO_PUBLIC_STORYBOOK_ENABLED === 'true',
});
```
[VERIFIED] Source: https://github.com/storybookjs/react-native/blob/next/docs/docs/intro/configuration/environment-variables.md

**Option B: Storybook for React Native Web (Vite) — LEANEST for cheap mode**
`@storybook/react-native-web-vite` renders stories in a desktop browser using `react-native-web`.
No emulator needed. Install:

```sh
npm create storybook@latest
# select "React Native Web" in the setup wizard
npm run storybook   # launches at localhost:6006 in Chrome
```

Requirements: React Native ≥ 0.72, React Native Web ≥ 0.19, Vite ≥ 5, Storybook ≥ 8.5
[VERIFIED] Source: https://storybook.js.org/docs/get-started/frameworks/react-native-web-vite

Both options can coexist in a single Expo project.
[COMMUNITY] Source: https://dev.to/dannyhw/introducing-storybook-for-react-native-web-mn4

**Expo template shortcut:**
```sh
npx create-expo-app --template expo-template-storybook AwesomeStorybook
```

#### Flutter — Widgetbook

Widgetbook v3.24.0 (latest as of 2026-06) is a Flutter sandbox for building widgets and screens
in isolation with mock data. Explicitly supports: Android, iOS, Linux, macOS, Web, Windows.
[VERIFIED] Source: https://pub.dev/packages/widgetbook

Setup:
```sh
flutter create widgetbook --empty
flutter pub add widgetbook widgetbook_annotation dev:widgetbook_generator dev:build_runner
dart run build_runner build -d
flutter run -t widgetbook/main.dart -d chrome   # web, no emulator
flutter run -t widgetbook/main.dart -d windows  # Windows desktop app
```
[VERIFIED] Source: https://docs.widgetbook.io/ + https://pub.dev/packages/widgetbook
[COMMUNITY] run command: https://leancode.co/blog/moving-flutter-widgets-to-widgetbook

Widgetbook v4 Beta (March 2026) adds stronger types, built-in docs, automated UI testing.
[COMMUNITY] Source: https://www.widgetbook.io/blog/widgetbook-v4-beta-is-here

**Widgetbook runs without an emulator when targeting `-d chrome` or `-d windows`.**

---

### 2. Web Target as Cheapest Preview

#### Expo Web (react-native-web)

Start:
```sh
npx expo start --web   # opens Chrome with Metro bundler
```

Fast Refresh is fully supported on Expo web — updates the DOM without page reload, preserving
state.
[VERIFIED] Source: https://docs.expo.dev/workflow/web/

react-native-web limitations (components that DO NOT fully work on web):
[VERIFIED] Source: https://necolas.github.io/react-native-web/docs/react-native-compatibility/

| Status | Component / API |
|--------|----------------|
| Not supported | `RefreshControl`, `TouchableNativeFeedback` |
| Not supported | `Alert`, `Settings` |
| Mocked (no-op) | `KeyboardAvoidingView`, `StatusBar`, `Keyboard`, `NativeModules`, `BackHandler` |
| Partial | `Text` (no `onLongPress`), `TextInput` (no rich text / auto-expand) |
| Partial | `ScrollView` (no momentum events), `Image` (no multiple sources / HTTP headers) |
| Partial | `Animated` (no `useNativeDriver`), `LayoutAnimation`, `Share` (HTTPS only) |

**Verdict:** Most pure UI components (View, Text, TouchableOpacity, FlatList, StyleSheet) work.
Components with native hardware dependencies (camera, sensors, NativeModules) do not.

#### Flutter Web

Flutter web renders real Flutter widgets in Chrome via CanvasKit or HTML renderer.
As of Flutter 3.35 (August 2025), **stateful hot reload on web is on by default** — no flags needed.
[COMMUNITY] Source: https://vibe-studio.ai/insights/flutter-3-35-web-hot-reload-faster-iteration-in-the-browser
[VERIFIED] Source: https://docs.flutter.dev/tools/hot-reload

```sh
flutter run -d chrome         # Flutter 3.35+: stateful hot reload out of the box
```

Platform-specific widgets (e.g. `CupertinoSlider` on Android) may render differently on web.
Heavy platform channels will not function. Otherwise widget coverage is excellent.

---

### 3. Hot Reload / Fast Refresh

| Stack | Tool | Hot Reload | Notes |
|-------|------|-----------|-------|
| Expo RN | `expo start` (native) | Fast Refresh | State-preserving; Metro bundler |
| Expo Web | `expo start --web` | Fast Refresh | DOM update, no full reload [VERIFIED] |
| Storybook RN Web | `npm run storybook` | HMR via Vite | Instant story updates in browser |
| Flutter native | `flutter run` + `r` key | Hot reload (stateful) | Inject code without restart |
| Flutter web | `flutter run -d chrome` | Stateful hot reload (3.35+) | Previously experimental [COMMUNITY] |
| Widgetbook | `flutter run -t widgetbook/main.dart` | Same as Flutter hot reload | Web or Windows target |

---

### 4. Emulator + Screenshot Capture to PNG

#### Path A: Android Emulator — adb (both stacks)

Works on Windows with Android Studio emulator running.

```sh
# Single-command, streams PNG directly to file (no tmp on device)
adb exec-out screencap -p > screen.png

# Two-step alternative
adb shell screencap /sdcard/screen.png
adb pull /sdcard/screen.png
```
[VERIFIED] Source: https://developer.android.com/tools/adb
[COMMUNITY] Source: https://github.com/lana-20/adb-shell-screencap

Requires: ADB shell V2 protocol (Android 5.0+). Works on Windows with both Expo/RN and Flutter.

#### Path B: Flutter CLI screenshot

Requires a running device or emulator:
```sh
flutter screenshot          # saves to flutter_<timestamp>.png
flutter screenshot --type=skia --observatory-uri=<uri>   # Skia-level capture
```
[VERIFIED] Source: https://github.com/flutter/website/blob/main/sites/docs/src/content/reference/flutter-cli.md

#### Path C: Flutter Golden Tests — NO EMULATOR (best for LLM design loop)

```dart
// widget_test.dart
testWidgets('my screen golden', (tester) async {
  await tester.pumpWidget(MyScreen(data: mockData));
  await expectLater(find.byType(MyScreen), matchesGoldenFile('goldens/my_screen.png'));
});
```

```sh
flutter test --update-goldens   # generates PNG files on host, no emulator
flutter test                    # compares to existing goldens
```
[VERIFIED] Source: https://api.flutter.dev/flutter/flutter_test/matchesGoldenFile.html
[VERIFIED] Source: https://github.com/flutter/website (release notes, breaking-changes docs)

Renders in a headless virtual canvas on the host machine. **No emulator, no device, no display.**
Output is real rasterised PNG at the widget's native resolution.

**Windows caveat:** Font rendering and shadow anti-aliasing differ slightly between Windows/Mac/Linux
hosts, so goldens generated on Windows may differ from CI goldens on Linux.
[COMMUNITY] Source: https://medium.com/profusion-engineering/golden-tests-in-flutter-a-comprehensive-guide-b4b50a932fd5

Workaround: use `alchemist` package (replaced `golden_toolkit` which is discontinued as of 2025)
for platform-agnostic golden rendering with tolerance.
[COMMUNITY] Source: https://dev.to/3lvv0w/flutter-mobile-testing-methodologies-recap-2025-523j

#### Path D: Browser Screenshot via Playwright (Expo/RN Web or Flutter Web)

No emulator. Run Storybook or `expo start --web`, then:
```sh
npx playwright screenshot --browser=chromium http://localhost:6006 screen.png
```
[ASSUMED] Standard Playwright CLI — no RN/Flutter-specific docs found for this pattern.

---

### 5. Golden / Snapshot-Image Tests for Design

#### Flutter — Golden Tests (built-in)

- `matchesGoldenFile()` in `flutter_test` (built into Flutter SDK)
- `flutter test --update-goldens` generates PNG on host, NO emulator
- Output: real rasterised RGBA PNG at widget resolution
- **Confirmed to produce real rasterised images — not placeholders**
[VERIFIED] Source: https://api.flutter.dev/flutter/flutter_test/matchesGoldenFile.html

For design iteration, combine with `SizedBox` wrapping to control canvas size:
```dart
await tester.binding.setSurfaceSize(const Size(375, 812));
await tester.pumpWidget(MaterialApp(home: MyWidget()));
await expectLater(find.byType(MyWidget), matchesGoldenFile('goldens/my_widget.png'));
```

`alchemist` (2025 replacement for `golden_toolkit`):
- `GoldenTestScenario` wraps multiple states in a single golden PNG
- More ergonomic for design-state cataloguing
[COMMUNITY] Source: https://dev.to/3lvv0w/flutter-mobile-testing-methodologies-recap-2025-523j

#### React Native / Expo — Snapshot Tests

RN's Jest snapshot tests produce TEXT snapshots (component tree), not rasterised PNGs.
[ASSUMED] No Tier-1 source found for a built-in RN image-golden equivalent.

For rasterised PNG from Expo/RN without an emulator, the options are limited:
- **Storybook web + Playwright screenshot** (browser automation) — no emulator
- **react-native-view-shot** in a running app (requires emulator/device):
  ```sh
  npx expo install react-native-view-shot expo-media-library
  ```
  ```js
  import { captureRef } from 'react-native-view-shot';
  const uri = await captureRef(viewRef, { format: 'png', quality: 1 });
  ```
[VERIFIED] Source: https://github.com/expo/expo/blob/main/apps/expo-go/modules/react-native-view-shot/README.md

No built-in headless PNG render for RN components exists (unlike Flutter golden tests).

---

### 6. Windows Runnability

| Tool | Windows OK | Mac-gated | Notes |
|------|-----------|-----------|-------|
| Storybook RN Web (Vite) | Yes | No | Browser-only, no native required |
| Expo Web (`expo start --web`) | Yes | No | Metro + Chrome |
| Android emulator + adb | Yes | No | Android Studio required |
| `adb exec-out screencap` | Yes | No | Works on Windows |
| Flutter web (`flutter run -d chrome`) | Yes | No | Flutter SDK on Windows |
| Widgetbook (`-d chrome` or `-d windows`) | Yes | No | Windows explicitly listed as platform |
| Flutter golden tests (`flutter test`) | Yes | No | Headless host render, no emulator |
| iOS Simulator | No | Mac only | Not available on Windows |
| Xcode / Swift toolchain | No | Mac only | N/A for cross-platform UI |
| Expo EAS Build (iOS) | N/A | Mac build servers | Cloud build, not local |

---

## Options Table

| Approach | Stack | Emulator? | PNG output | Windows | Hot reload | Complexity |
|----------|-------|-----------|-----------|---------|-----------|-----------|
| Storybook RN Web + Playwright | Expo/RN | No | Via browser automation | Yes | Yes (Vite HMR) | Low |
| Storybook on-device | Expo/RN | Yes (Android) | adb screencap | Yes | Yes (Fast Refresh) | Medium |
| Expo Web + Playwright | Expo/RN | No | Via browser automation | Yes | Yes | Low |
| Flutter golden tests | Flutter | No | Yes — native PNG | Yes | N/A (test run) | Low |
| Widgetbook + Playwright | Flutter | No | Via browser automation | Yes | Yes (3.35+) | Low |
| flutter screenshot CLI | Flutter | Yes | Yes | Yes | N/A | Low |

---

## Recommended Approach (per stack, for cheap-mode LLM loop)

### Expo / React Native
**Storybook for React Native Web (Vite)** is the leanest path:
1. Write stories with mock data — no business logic imported
2. `npm run storybook` → opens Chrome on Windows
3. Edit component → Vite HMR updates instantly
4. For LLM PNG: `npx playwright screenshot http://localhost:6006/iframe.html?... screen.png`

No Android emulator needed. All runs on Windows.

### Flutter
**Flutter golden tests (`flutter test --update-goldens`)** is the leanest path:
1. Write a `testWidgets` with mock data, call `matchesGoldenFile('goldens/foo.png')`
2. Run `flutter test --update-goldens` → PNG written to `test/goldens/foo.png`
3. LLM reads the PNG directly
4. Edit widget → rerun command → new PNG

No emulator. No display. Runs on Windows. State-of-art tool: `alchemist` (not `golden_toolkit`).

For interactive iteration: **Widgetbook** on `-d chrome` + Flutter 3.35 stateful hot reload.

---

## Code Examples

### Flutter Golden Test (complete minimal example)
```dart
// test/my_widget_test.dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:my_app/widgets/my_card.dart';

void main() {
  testWidgets('MyCard golden', (WidgetTester tester) async {
    await tester.binding.setSurfaceSize(const Size(375, 200));
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: MyCard(title: 'Hello', subtitle: 'Mock subtitle'),
        ),
      ),
    );
    await expectLater(
      find.byType(MyCard),
      matchesGoldenFile('goldens/my_card.png'),
    );
  });
}
```
```sh
flutter test --update-goldens test/my_widget_test.dart
# → generates test/goldens/my_card.png on Windows host
```

### ADB Screenshot (Android emulator, both stacks)
```sh
adb exec-out screencap -p > screen.png
```

### Storybook RN Web story (Expo)
```tsx
// components/MyCard.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { MyCard } from './MyCard';

const meta: Meta<typeof MyCard> = { component: MyCard };
export default meta;
type Story = StoryObj<typeof MyCard>;

export const Default: Story = {
  args: { title: 'Hello', subtitle: 'Mock subtitle' },
};
```
```sh
npm run storybook  # → Chrome localhost:6006, Vite HMR
```

---

## Gaps

- `alchemist` setup commands and pub.dev page not directly fetched — cited from community recap only. [COMMUNITY]
- Playwright + Storybook web screenshot workflow confirmed as standard practice but no RN/Flutter-specific official doc found. [ASSUMED]
- Widgetbook hot reload confirmed indirectly (runs as Flutter app, Flutter hot reload applies). Widgetbook official docs on exact `flutter run` target-device flags could not be fetched (404). [COMMUNITY]
- react-native-web compatibility table may lag behind current RNW release — checked necolas.github.io which is the authoritative source but may not be current 2026 state. [VERIFIED/dated]
- Font rendering drift on Windows for Flutter golden tests is documented — alchemist tolerance API not fully verified for Windows specifically. [COMMUNITY]

---

## Sources

### Tier 1 (Verified — official docs / primary sources)
- [Storybook for React Native — environment variables](https://github.com/storybookjs/react-native/blob/next/docs/docs/intro/configuration/environment-variables.md)
- [Storybook for React Native — storybook-ui-configuration](https://github.com/storybookjs/react-native/blob/next/docs/docs/intro/configuration/storybook-ui-configuration.md)
- [Storybook for React Native Web (Vite)](https://storybook.js.org/docs/get-started/frameworks/react-native-web-vite)
- [Expo web workflow docs](https://docs.expo.dev/workflow/web/)
- [react-native-view-shot in Expo](https://github.com/expo/expo/blob/main/apps/expo-go/modules/react-native-view-shot/README.md)
- [react-native-web compatibility table](https://necolas.github.io/react-native-web/docs/react-native-compatibility/)
- [flutter screenshot CLI reference](https://github.com/flutter/website/blob/main/sites/docs/src/content/reference/flutter-cli.md)
- [matchesGoldenFile API](https://api.flutter.dev/flutter/flutter_test/matchesGoldenFile.html)
- [Flutter golden test — update-goldens](https://github.com/flutter/website/blob/main/sites/docs/src/content/release/breaking-changes/paint-enableDithering.md)
- [Widgetbook pub.dev](https://pub.dev/packages/widgetbook)
- [Android ADB docs](https://developer.android.com/tools/adb)
- [Flutter hot reload](https://docs.flutter.dev/tools/hot-reload)

### Tier 2 (Community / secondary)
- [Flutter 3.35 web hot reload](https://vibe-studio.ai/insights/flutter-3-35-web-hot-reload-faster-iteration-in-the-browser)
- [Flutter 3.32 hot reload announcement](https://blog.flutter.dev/whats-new-in-flutter-3-32-40c1086bab6e)
- [Flutter golden tests comprehensive guide](https://medium.com/profusion-engineering/golden-tests-in-flutter-a-comprehensive-guide-b4b50a932fd5)
- [Widgetbook v4 Beta announcement](https://www.widgetbook.io/blog/widgetbook-v4-beta-is-here)
- [Moving Flutter widgets to Widgetbook — LeanCode](https://leancode.co/blog/moving-flutter-widgets-to-widgetbook)
- [Flutter testing methodologies recap 2025 (alchemist)](https://dev.to/3lvv0w/flutter-mobile-testing-methodologies-recap-2025-523j)
- [Introducing Storybook for RN Web](https://dev.to/dannyhw/introducing-storybook-for-react-native-web-mn4)
- [ADB screencap guide](https://github.com/lana-20/adb-shell-screencap)
- [Flutter golden tests — solguruz guide](https://solguruz.com/blog/flutter-golden-tests/)
