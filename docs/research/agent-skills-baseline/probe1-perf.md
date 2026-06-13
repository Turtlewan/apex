# Performance Diagnosis: React Dashboard LCP 4.1s / INP 380ms (Baseline Test)

## Diagnostic Ordering: TTFB → LCP → INP/CLS

### Phase 1: Time to First Byte (TTFB)
Before optimizing rendering, establish the server baseline. On mid-range mobile over 4G, TTFB ≥500ms often dominates perceived slowness.

**Checks (no tools):**
- Is the server geographically close? (CDN miss = +200-500ms)
- Is response size >50KB pre-gzip? (negotiate compression, tree-shake)
- Are there synchronous backend calls blocking HTML? (move to deferred fetches)

If TTFB >1s, stop here. All LCP optimization is noise until the server responds.

---

### Phase 2: Largest Contentful Paint (LCP)

LCP 4.1s on mid-range mobile is well above the 2.5s "good" threshold. The three LCP candidates on the critical path are:

#### 2a. Image (Most Common)
- Is the LCP element an `<img />`? Inspect via DevTools Elements panel.
- If yes:
  - **Add `fetchpriority="high"`** to the LCP image tag — signals fetch priority queue to deprioritize other images
  - **Apply `loading="lazy"` discipline** — mark below-fold images with `loading="lazy"` so the LCP image isn't competing for bandwidth
  - **Consider `<picture>` with `srcset` for webp + responsive** — smaller payloads reach mobile faster; webp can be 20-40% smaller than JPEG
  - **Check image size** — is it >100KB unoptimized? If so, add a build-time image optimizer (Sharp, Next.js Image component)

#### 2b. Text (Second Most Common)
- Is LCP a text block (h1, p, div with text)?
- If yes:
  - **Analyze font loading:** is there a FOUT (Flash of Unstyled Text) or FOIT (Flash of Invisible Text)?
  - **Move to `font-display: swap`** — render system font immediately, swap to custom font when ready (avoids blank text)
  - **Preload critical fonts:** `<link rel="preload" href="font.woff2" as="font" type="font/woff2" crossorigin>`
  - **Lazy-load non-critical fonts** — only load weights/styles actually used on the page
  - **Check font file size** — is the subset >40KB? If so, subsetting (only Latin characters) can halve it

#### 2c. Render/JavaScript
- Is LCP a dynamically rendered component (e.g., a chart that paints after React hydration)?
- If yes:
  - **Check hydration cost:** is the React bundle unparsed/uncompiled on first paint? (Code-split heavy JS; defer hydration for below-fold components)
  - **Use `<Suspense>` + streaming** — with React Server Components or Next.js, stream LCP content separately from heavy interactive components
  - **Measure JS parse/compile time on mid-range device** — it's often 1-2s on older phones; reduce bundle size via tree-shaking and dynamic imports

#### 2d. Background/CSS
- Is LCP painted by CSS (e.g., a gradient background)?
  - Unlikely, but ensure no expensive CSS animations or `box-shadow` on large elements before paint

#### Concrete LCP Fix (Decision Tree)
1. Inspect the actual LCP element in DevTools → what is it?
2. If image → fetchpriority + lazy-load discipline + webp + size reduction
3. If text → font preload + font-display:swap + font subsetting
4. If JS-rendered → code-split bundle + streaming + defer hydration
5. Measure with Lighthouse (throttled) — target 2.5s

---

### Phase 3: Interaction to Next Paint (INP) & Cumulative Layout Shift (CLS)

#### INP 380ms (Well Above 200ms "Good" Threshold)

**Root cause on mid-range mobile:** Main thread is blocked during user input, delaying response paint.

**Diagnosis approach:**
1. Profile the interaction: which tap/click is slowest? (tap on button → response 380ms?)
2. Identify the handler: is it in React event handler? Is it doing sync work?

**Specific Main-Thread-Yielding APIs to Apply:**

#### 3a. `scheduler.yield()`
If a React event handler does heavy computation (e.g., filtering 10K items), split work into chunks:

```javascript
// Before: blocks main thread for 200ms
const handleFilter = (items) => {
  const filtered = items.filter(expensiveCheck);
  setResults(filtered); // INP 200+ms
};

// After: yield between chunks
const handleFilter = async (items) => {
  const chunks = chunkArray(items, 100);
  const filtered = [];
  for (const chunk of chunks) {
    const result = chunk.filter(expensiveCheck);
    filtered.push(...result);
    await scheduler.yield(); // Return control to browser
  }
  setResults(filtered); // Now INP < 100ms
};
```

#### 3b. `isInputPending()`
Check if user has hit another key/tap while you're mid-computation. Abandon work to handle urgent input:

```javascript
const handleSearch = async (items) => {
  for (const item of items) {
    processItem(item);
    if (navigator.scheduling.isInputPending()) {
      break; // User typed again, stop here, handle new input
    }
  }
};
```

#### 3c. `scheduler.postTask()`
Defer non-urgent work to a lower priority queue, freeing main thread for user input:

```javascript
// Prioritize: render search results immediately
const [results, setResults] = useState([]);

const handleSearch = (query) => {
  const filtered = items.filter(q => q.includes(query));
  setResults(filtered); // HIGH priority, renders immediately

  // Defer: analytics, logging, non-critical updates
  scheduler.postTask(() => {
    logSearch(query); // USER_BLOCKING priority (lower)
  }, { priority: 'background' });
};
```

#### 3d. React-Specific INP Fixes
- **Break event handlers into sync + async:** render UI synchronously, defer expensive work
- **Use `flushSync()` sparingly** — do NOT wrap event handlers in `flushSync()` (that's the anti-pattern that causes INP 300+ms)
- **Avoid `useMemo` / `React.memo` for cache** — if not causing INP directly, they often hide the real problem (thrashing due to object re-creation). Fix the root cause (callback stability) instead
- **Batch updates:** if the handler updates multiple states, React 18+ auto-batches; ensure you're not defeating it with `await` inside the handler

#### 3e. Browser/OS Interaction Budgets
On mid-range Android (Snapdragon 662, ~2.5s/GHz):
- Rendering a frame: ~16ms
- Parsing/compiling JS during input: +50-100ms
- Heavy React re-renders: +100-200ms

Target: INP < 200ms = ~1 frame of rendering + 1 input delay + 1 frame to paint = 50ms headroom

---

### CLS (Cumulative Layout Shift) — Font-Driven Fixes

CLS is harder to diagnose without tools, but **font swapping is the #1 cause on mobile:**

#### Font-Driven CLS Fix
When the custom font loads, the page reflows because metrics differ from the fallback font.

**Specific CSS Properties:**
- **`font-display: swap`** — render fallback immediately, swap to custom font (might cause visible jank, but zero CLS if metrics match)
- **`ascent-override`, `descent-override`, `line-gap-override`** (CSS Fonts Level 4) — match custom font metrics to fallback, eliminating CLS on swap:

```css
@font-face {
  font-family: 'MyFont';
  src: url('myfont.woff2') format('woff2');
  /* Match fallback (e.g., Arial) metrics */
  ascent-override: 85%;
  descent-override: 20%;
  line-gap-override: 0%;
  font-display: swap;
}
```

- **`size-adjust`** (newer) — scale the custom font metrics post-load to match fallback:

```css
@font-face {
  font-family: 'MyFont';
  src: url('myfont.woff2') format('woff2');
  size-adjust: 95%; /* Scale up/down to match fallback */
  font-display: swap;
}
```

**Practical step:**
1. Use a font metrics matching tool (e.g., [Fallback Font Generator](https://www.f-font.com/)) to measure the gap
2. Set overrides in `@font-face`
3. Verify with Lighthouse (CLS should drop from 0.15+ to <0.1)

---

## Critical Caveat: Without Field Data, Your Diagnosis Is Incomplete

**All of the above is educated guessing.** True LCP/INP/CLS numbers require:

1. **Field Data (Real Users):** CrUX, Google Analytics, or your own RUM (Real User Monitoring). Mid-range mobile 4G is the test harness; if you're benchmarking on a flagship phone on 5G, you're measuring nothing real.
   
2. **Lab Data (Reproducible):** Lighthouse on actual mid-range device (Moto G Power, Galaxy A12) or Android Emulator with CPU throttling (4x slowdown). DevTools on your MacBook Pro does not count.

**Without lab profiling, you cannot know:**
- Where the 4.1s LCP is coming from (image? fonts? JS?)
- Which interaction is causing the 380ms INP (button click? form input? list scroll?)
- What's causing CLS (font? ads? image load?)

**Next step:** Run Lighthouse in "Simulate slow 4G, 4x CPU slowdown" mode on the actual page. The report will tell you which element is LCP, which task blocks input, and CLS sources. Then apply the fixes above surgically.

---

## Common AI-Generated Anti-Patterns to Avoid

These appear in React perf code and make things worse:

1. **Needless `React.memo()`** — wrapping every component in `React.memo` to "prevent re-renders." The real problem is usually unstable props (callback or object created on every render). Memo hides the root cause; it doesn't cure it. Fix the props instead.

2. **Cargo-cult `useMemo`** — wrapping expensive computations in `useMemo` without dependencies, or with dependencies that still change every render (objects, callbacks). This adds memo overhead without benefit.

3. **Sequential `await` in event handlers** — if a handler does `await fetch1; await fetch2; await fetch3`, it's stalling the main thread between each fetch. Parallelize with `Promise.all()` instead.

4. **Over-fetching data** — loading 100 items when the UI displays 10. This bloats TTFB and parsing time. Implement pagination or lazy-loading on the backend.

5. **Inline functions in event handlers** — creating a new function on every render (`onClick={() => doSomething()}`). Use `useCallback` sparingly only if the function is passed to a memoized child; otherwise, just define the handler outside the render.

6. **Parsing/re-parsing large JSON objects on every re-render** — parsing JSON in the render path. Move parsing to `useEffect` or server-side (if using SSR).

---

## Summary

| Issue | 4.1s LCP | 380ms INP | CLS |
|-------|----------|-----------|-----|
| **Root Cause (Likely)** | Image fetch + font FOIT | Heavy event handler + main thread block | Font swap reflow |
| **First Fix** | `fetchpriority="high"` + `loading="lazy"` | `scheduler.yield()` or `postTask()` | `font-display: swap` + `ascent-override` |
| **Measure With** | Lighthouse (4x CPU, slow 4G) | Profile via DevTools Perf tab | Lighthouse CLS report |
| **Know You're Done When** | LCP < 2.5s | INP < 200ms | CLS < 0.1 |

**Do NOT optimize without lab data.** The dashboard is slow somewhere specific; find it first.
