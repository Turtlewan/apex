# WS-3: Cheap-Mode UI Iteration for Native Desktop Apps
<!-- APEX Research Template — retrieval pass, cite-or-drop -->

**Date:** 2026-06-16
**Researcher:** Phase-2 Retrieval Agent (claude-sonnet-4-6)
**Topic:** "Cheap mode" for desktop apps that open as a native window (.exe), NOT a browser tab.
**Families covered:** (A) Web-shell desktop — Electron, Tauri; (B) True native .NET — WinUI 3, WPF, Avalonia.
**Host:** Windows 11 (all paths Windows-runnable unless noted).

---

## 1. Web-Shell Family: Electron & Tauri

### 1.1 UI is standard web tech — browser preview works

Both Electron and Tauri render their UI using a browser engine embedded in the native window:

- **Electron** embeds a full Chromium instance. The renderer process is a normal web page (HTML/CSS/JS). [VERIFIED — electronjs.org: "framework for creating cross-platform desktop applications using web technologies like JavaScript, HTML, and CSS, built upon Node.js and Chromium"]
- **Tauri** uses the platform's native WebView (WebView2 on Windows 11, which is Chromium-based). The frontend is pointed at a `devUrl` — typically a Vite/webpack dev-server running on localhost. [VERIFIED — v2.tauri.app: "The devUrl is usually a URL to a dev server, which serves your application assets with hot-reload and HMR"]

**Cheap-mode workflow:** Run the frontend dev-server standalone (e.g., `npm run dev` / `vite`). Open the localhost URL directly in Chrome. Edit HTML/CSS/JS and see hot-module-reload (HMR) in Chrome — no Electron/Tauri process needed. This is **identical to web development**.

**Tauri v2 config confirming dev URL separation:**
```json
// tauri.conf.json
{
  "build": {
    "devUrl": "http://localhost:5173",
    "beforeDevCommand": "npm run dev"
  }
}
```
[VERIFIED — v2.tauri.app/reference/config]

### 1.2 Caveats: where browser preview diverges from the real .exe

| Divergence | Electron | Tauri |
|---|---|---|
| Native-only APIs | `ipcRenderer`, `shell`, `dialog`, `fs` via Node.js — unavailable in Chrome | Tauri Rust `invoke()` commands — unavailable in plain browser |
| Window chrome | Custom frameless chrome, traffic-light buttons — not visible in browser tab | Same |
| WebView2 vs Chrome | Minor rendering differences (font rendering, scrollbar, CSS quirks) | WebView2 IS Chromium-based; gap is small but nonzero |
| System menus / tray | Defined in main process — absent in browser preview | Absent |
| Native file dialogs | `dialog.showOpenDialog` — N/A in browser | `tauri-plugin-dialog` — N/A |

**Verdict:** For pure layout/styling iteration the browser preview is effectively identical. Only test in the actual .exe when the feature touches native APIs or custom window chrome.

---

## 2. True Native Preview without Full App Logic

### 2.1 WPF

**XAML Hot Reload** — edit XAML while the app is running under VS debugger; changes apply without restart.
[VERIFIED — learn.microsoft.com/visualstudio/xaml-tools/xaml-hot-reload: "WPF .NET Framework 4.6+, .NET Core, and .NET 5+; Windows 7 and later"]

Starting VS 2022 v17.14 Preview 2, Hot Reload is also available at **design-time** (no debugger session required). [VERIFIED — learn.microsoft.com/visualstudio/xaml-tools/xaml-hot-reload updated 2026-04-24]

**XAML Live Preview** — captures the running app window into a docked VS panel; edit XAML and see real-time reflection. Uses `PrintWindow` API internally. Supports WPF. [VERIFIED — learn.microsoft.com/visualstudio/xaml-tools/xaml-live-preview: "WPF | Element Selection & Info Tip: Yes | Rulers: Yes"]

**Design-time data (`d:DataContext`)** — XAML namespace `xmlns:d="http://schemas.microsoft.com/expression/blend/2008"` with `d:DataContext="{d:DesignInstance Type=vm:MyViewModel, IsDesignTimeCreatable=True}"` populates the VS XAML designer at edit time without running business logic. [COMMUNITY — well-established WPF pattern]

**WPF XAML Designer** — still present in VS 2022 for WPF (unlike WinUI 3, see below). Renders a static preview of the XAML without running the app. [VERIFIED — implicit from Microsoft docs: WinUI 3 designer removed, WPF designer remains]

### 2.2 WinUI 3

**XAML Hot Reload** — supported: "WinUI 3: Windows 10, version 1809 and later, with the Windows App SDK." Requires debugger or VS 17.14+ design-time mode. [VERIFIED — learn.microsoft.com/visualstudio/xaml-tools/xaml-hot-reload]

**XAML Live Preview** — supported for WinUI 3 desktop. [VERIFIED — learn.microsoft.com/visualstudio/xaml-tools/xaml-live-preview: "WinUI3 desktop | Element Selection & Info Tip: Yes | Rulers: Yes"]

**XAML Designer** — REMOVED in VS 2022 for WinUI 3. Microsoft recommendation is to use Hot Reload instead. [VERIFIED — learn.microsoft.com search result: "The XAML Designer for WinUI 3 is not supported in Visual Studio 2022 or later versions"]

**XAML Studio** — Microsoft open-sourced XAML Studio in January 2026 amid developer discontent with the missing WinUI 3 designer. [COMMUNITY — devclass.com 2026-01-07; "Microsoft open sources XAML Studio amid developer discontent with Visual Studio designers"]

**WinUI 3 Control Gallery** — the official `WinUI3Gallery` sample app ships every WinUI 3 control with live demos and copyable XAML snippets. Useful for isolating control appearance without building app logic. [COMMUNITY — well-known Microsoft sample]

### 2.3 Avalonia

**Avalonia Previewer** — Avalonia has a live XAML previewer integrated with VS (via the Avalonia for Visual Studio extension) and JetBrains Rider. It renders XAML in a side-by-side pane without running the app. [COMMUNITY — docs.avaloniaui.net]

**Design-time data** — same `d:DataContext` pattern works in Avalonia (it uses the same XAML namespace convention). [COMMUNITY]

---

## 3. Capture the Native Window to a PNG File

### 3.1 PowerShell + System.Drawing (CopyFromScreen)

Captures a specific app window by matching its title to the process MainWindowTitle, then screenshots just that region:

```powershell
Add-Type -AssemblyName System.Drawing

$proc  = Get-Process | Where-Object { $_.MainWindowTitle -like "*MyApp*" }
$hwnd  = $proc.MainWindowHandle

# Use P/Invoke to get precise window rect (handles window border accurately)
Add-Type @"
using System;
using System.Runtime.InteropServices;
public struct RECT { public int Left, Top, Right, Bottom; }
public class Win32 {
    [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr hwnd, out RECT rect);
    [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr hwnd);
}
"@

[Win32]::SetForegroundWindow($hwnd)
Start-Sleep -Milliseconds 200  # allow window to paint

$rect = New-Object RECT
[Win32]::GetWindowRect($hwnd, [ref]$rect) | Out-Null

$width  = $rect.Right  - $rect.Left
$height = $rect.Bottom - $rect.Top

$bmp      = New-Object System.Drawing.Bitmap $width, $height
$graphics = [System.Drawing.Graphics]::FromImage($bmp)
$graphics.CopyFromScreen($rect.Left, $rect.Top, 0, 0, $bmp.Size)
$bmp.Save("C:\tmp\window-capture.png", [System.Drawing.Imaging.ImageFormat]::Png)
$graphics.Dispose(); $bmp.Dispose()
```
[VERIFIED approach — woshub.com + delftstack.com PowerShell screenshot guides; P/Invoke pattern confirmed by win32 API docs]

**Limitation:** Requires the window to be visible and not occluded. Does not work for minimized windows without a ShowWindow call first. Does not capture hardware-accelerated (DirectX/OpenGL) content reliably — use `PrintWindow` with `PW_RENDERFULLCONTENT` flag for those.

### 3.2 NirCmd (third-party CLI, zero-install option)

NirCmd is a free portable single-exe CLI tool from NirSoft:

```bat
:: Capture the currently active window (must bring to foreground first)
nircmd.exe win activate title "MyApp Window Title"
nircmd.exe savescreenshotwin "C:\tmp\window-capture.png"
```

`savescreenshotwin` captures the active window only (no direct "by title" flag in one command). [VERIFIED — nircmd.nirsoft.net/savescreenshotwin.html]

Workflow: pipe `win activate title` before `savescreenshotwin`. Supports .png, .jpg, .bmp, .tiff.

### 3.3 XAML Live Preview's internal mechanism

VS uses `PrintWindow` (Win32 API, `winuser.h`) internally for XAML Live Preview captures. Developers can call `PrintWindow` directly from PowerShell or C# for a higher-fidelity capture (works even for partially occluded windows and some GPU-accelerated content):

```powershell
Add-Type @"
using System;
using System.Drawing;
using System.Runtime.InteropServices;
public class PrintWindowCapture {
    [DllImport("user32.dll")] static extern bool PrintWindow(IntPtr hWnd, IntPtr hdcBlt, uint nFlags);
    [DllImport("user32.dll")] public static extern IntPtr FindWindow(string lpClassName, string lpWindowName);
    public static Bitmap Capture(IntPtr hWnd, int w, int h) {
        var bmp = new Bitmap(w, h);
        using (var g = Graphics.FromImage(bmp))
            PrintWindow(hWnd, g.GetHdc(), 0x00000002); // PW_RENDERFULLCONTENT
        return bmp;
    }
}
"@
# Use FindWindow or Get-Process to get hWnd, supply known width/height
```
[VERIFIED — learn.microsoft.com/windows/win32/api/winuser/nf-winuser-printwindow; XAML Live Preview docs confirm PrintWindow usage]

### 3.4 FlaUI (UI Automation .NET library)

FlaUI wraps Microsoft's UIAutomation APIs and provides screenshot methods at element or window scope:

```csharp
using FlaUI.Core;
using FlaUI.UIA3;

var app = Application.Launch("MyApp.exe");
using var automation = new UIA3Automation();
var window = app.GetMainWindow(automation);

// Full window capture
var bitmap = FlaUI.Core.Capturing.Capture.Element(window);
bitmap.ToFile("C:\\tmp\\window-capture.png");

// Or: specific element
var btn = window.FindFirstDescendant(cf => cf.ByName("Submit"));
FlaUI.Core.Capturing.Capture.Element(btn).ToFile("C:\\tmp\\btn.png");
```
[VERIFIED — blog.nashtechglobal.com + codoid.com FlaUI guides; Capture.Element / Capture.Screen / Capture.Rectangle all confirmed]

**Advantage over PrintWindow approach:** FlaUI can also interact with the app (click, type), making it a full UI automation + screenshot pipeline.

### 3.5 Playwright for Electron

Playwright has a first-class Electron integration. The `electron.launch()` API returns an `ElectronApplication`; call `page.screenshot()` on any window Page object:

```javascript
const { _electron: electron } = require('playwright');

const app = await electron.launch({ args: ['dist/main.js'] });
const window = await app.firstWindow();
await window.screenshot({ path: 'screenshot.png' });

// Or target a specific window by index
const windows = app.windows();
await windows[1].screenshot({ path: 'second-window.png' });

await app.close();
```
[VERIFIED — playwright.dev/docs/api/class-electronapplication: "window.screenshot({ path: 'intro.png' })"]

**Note:** This requires the Electron app to be launched by Playwright (not attached to an already-running instance), and requires Node.js. Best for CI pipelines.

---

## 4. Headless / No-Window Rendering

### 4.1 WPF: RenderTargetBitmap

WPF's `RenderTargetBitmap` can render a control to a bitmap **without displaying the window** when used in a UI thread context:

```csharp
// Must be called on the UI/STA thread
var control = new MyUserControl();
control.Measure(new Size(800, 600));
control.Arrange(new Rect(0, 0, 800, 600));
control.UpdateLayout();

var rtb = new RenderTargetBitmap(800, 600, 96, 96, PixelFormats.Pbgra32);
rtb.Render(control);

var encoder = new PngBitmapEncoder();
encoder.Frames.Add(BitmapFrame.Create(rtb));
using var stream = File.OpenWrite("output.png");
encoder.Save(stream);
```
[VERIFIED — learn.microsoft.com WPF RenderTargetBitmap; c-sharpcorner.com "How to Create a Picture of a WPF Control"]

**Critical caveat:** Works well as a console app under .NET 5+. Produces **empty/transparent PNG when run as a Windows Service or in a fully headless server context** (no display context). This is a known .NET Core WPF limitation (GitHub dotnet/wpf issue #2811). [VERIFIED — github.com/dotnet/wpf/issues/2811]

**Workaround:** Run as a normal console EXE on Windows (not a Service). A console app has a display context even without a visible window.

### 4.2 Avalonia: Headless Platform + Skia Renderer (the recommended scriptable path)

Avalonia's headless platform is the cleanest no-window rendering solution. It runs the full Avalonia control tree (layout, styling, data binding) in memory without any display.

**NuGet packages:**
- `Avalonia.Headless`
- `Avalonia.Themes.Fluent` (for theming)

**Critical: enable Skia renderer** (default is a fake backend producing no pixels):

```csharp
AppBuilder.Configure<App>()
    .UseSkia()
    .UseHeadless(new AvaloniaHeadlessPlatformOptions
    {
        UseHeadlessDrawing = false  // false = use real Skia renderer
    });
```

**Capture rendered frame to PNG:**

```csharp
var window = new Window { Content = new MyControl() };
window.Show();
// Optional: simulate layout pass
var frame = window.CaptureRenderedFrame();  // returns WriteableBitmap
frame.Save("output.png");
```
[VERIFIED — docs.avaloniaui.net/docs/concepts/headless/ + docs.avaloniaui.net/docs/testing/setting-up-the-headless-platform]

**Render a control directly (community pattern, from AvaloniaUI/Avalonia Discussion #13372):**

```csharp
// Place control in a headless window, force layout, then render
var pixelSize = new PixelSize(800, 600);
var rtb = new RenderTargetBitmap(pixelSize, new Vector(96, 96));
rtb.Render(myControl);

using var stream = File.OpenWrite("output.png");
rtb.Save(stream);
```
[COMMUNITY — github.com/AvaloniaUI/Avalonia/discussions/13372]

**Avalonia RenderTargetBitmap** does NOT have the Windows Service limitation that WPF has — Avalonia's renderer is cross-platform Skia, not GDI-dependent. Works on a headless Linux CI machine too. [VERIFIED — docs.avaloniaui.net headless platform docs]

### 4.3 Avalonia XPF: headless for WPF apps

Avalonia XPF is a commercial compatibility layer that lets WPF apps run on Avalonia's rendering stack. It supports the same headless API:

```csharp
AppBuilder.Configure<DefaultXpfAvaloniaApplication>()
    .WithAvaloniaXpf()
    .UseSkia()
    .UseHeadless(new AvaloniaHeadlessPlatformOptions { UseHeadlessDrawing = false });
```

Then call `CaptureRenderedFrame()` on any window. This lets you run WPF UI tests and screenshots on Linux/Windows without a display. [VERIFIED — docs.avaloniaui.net/xpf/testing/headless-testing + avaloniaui.net/blog/exploring-headless-testing-for-xpf-and-wpf-applications]

### 4.4 WinUI 3: no headless path

WinUI 3 does not have a headless rendering mode as of 2026. It requires a running Windows desktop session. No equivalent to Avalonia.Headless exists for WinUI 3. [ASSUMED — no contradicting source found; absence of any headless WinUI 3 documentation]

---

## 5. Windows Verdict: Cheapest LLM-Visible Path per Family

### Family A: Web-Shell (Electron / Tauri)

**Cheapest path:** Open the frontend dev-server URL in Chrome. No .exe needed. Full hot-reload. Playwright can screenshot the running Chrome tab (standard `page.screenshot()`), or screenshot the Electron window directly via `electron.launch()` + `window.screenshot()`.

**Ranking:**
1. Chrome dev-server preview + `page.screenshot()` via Playwright — zero native overhead, works without any app binary
2. Playwright Electron integration — launches real .exe, one line to PNG

**Windows-runnable:** Yes, fully. WebView2 (Tauri on Win11) is pre-installed as a Windows component.

### Family B: True Native (.NET WinUI 3 / WPF / Avalonia)

**Cheapest LLM-visible path (with window):**
- Hot-reload the running app (XAML Hot Reload / VS 17.14+ design-time), then screenshot with PowerShell `CopyFromScreen` or `PrintWindow`
- Or use FlaUI `Capture.Element(window).ToFile(path)` — single call, no manual bounds math

**Cheapest LLM-visible path (no window / scriptable):**
- **Avalonia → Avalonia.Headless + Skia → `CaptureRenderedFrame()` → PNG.** This is the gold standard: no display required, no WPF GDI limitation, cross-platform, scriptable from a test harness.
- **WPF → RenderTargetBitmap** works as a console EXE but fails in a headless service context. Acceptable for interactive dev, fragile for CI without a display session.
- **WinUI 3 → no headless path.** Must run in a Windows desktop session; capture with PowerShell + PrintWindow or FlaUI.

**Ranking (Windows, scriptable/cheap-mode):**
1. Avalonia headless + `CaptureRenderedFrame()` — no window, no display, pure PNG output
2. WPF `RenderTargetBitmap` (console EXE mode) — works on Windows dev machines
3. FlaUI `Capture.Element()` on running window — easiest single-call capture for WinUI 3 / WPF when app must be visible
4. PowerShell `CopyFromScreen` / `PrintWindow` — works but requires window to be foreground and unoccluded

---

## Sources

- [electronjs.org — Electron docs](https://www.electronjs.org/)
- [v2.tauri.app — Tauri v2 docs](https://v2.tauri.app/reference/config/)
- [playwright.dev — ElectronApplication class](https://playwright.dev/docs/api/class-electronapplication)
- [learn.microsoft.com — XAML Hot Reload](https://learn.microsoft.com/en-us/visualstudio/xaml-tools/xaml-hot-reload?view=visualstudio)
- [learn.microsoft.com — XAML Live Preview](https://learn.microsoft.com/en-us/visualstudio/xaml-tools/xaml-live-preview?view=visualstudio)
- [learn.microsoft.com — PrintWindow Win32 API](https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-printwindow)
- [learn.microsoft.com — RenderTargetBitmap (WPF)](https://learn.microsoft.com/en-us/dotnet/api/system.windows.media.imaging.rendertargetbitmap)
- [github.com/dotnet/wpf/issues/2811 — RenderTargetBitmap empty in Windows Service](https://github.com/dotnet/wpf/issues/2811)
- [docs.avaloniaui.net — Headless Platform](https://docs.avaloniaui.net/docs/concepts/headless/)
- [docs.avaloniaui.net — Setting up Headless Platform](https://docs.avaloniaui.net/docs/testing/setting-up-the-headless-platform)
- [github.com/AvaloniaUI/Avalonia/discussions/13372 — Control Export to PNG](https://github.com/AvaloniaUI/Avalonia/discussions/13372)
- [avaloniaui.net/blog — Headless Testing for XPF and WPF](https://avaloniaui.net/blog/exploring-headless-testing-for-xpf-and-wpf-applications)
- [docs.avaloniaui.net/xpf — Headless Testing](https://docs.avaloniaui.net/xpf/testing/headless-testing)
- [nircmd.nirsoft.net — savescreenshotwin](https://nircmd.nirsoft.net/savescreenshotwin.html)
- [woshub.com — PowerShell Desktop Screenshots](https://woshub.com/take-user-desktop-screenshot-with-powershell/)
- [delftstack.com — PowerShell Screenshot](https://www.delftstack.com/howto/powershell/powershell-screenshot/)
- [blog.nashtechglobal.com — FlaUI Desktop Automation](https://blog.nashtechglobal.com/desktop-automation-test-with-flaui/)
- [devclass.com — XAML Studio open sourced (2026-01-07)](https://www.devclass.com/development/2026/01/07/microsoft-open-sources-xaml-studio-amid-developer-discontent-with-visual-studio-designers/)
