# Probe 4 — SaaS Pricing Card Baseline

## Markup / Classes (produced from own knowledge, no repo reads)

```html
<!-- Pricing card — "Pro" tier -->
<div class="bg-white border border-gray-200 rounded-2xl shadow-xl p-8 flex flex-col gap-6 max-w-sm">

  <!-- Badge -->
  <div class="inline-flex self-start">
    <span class="bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide">
      Most Popular
    </span>
  </div>

  <!-- Tier name + description -->
  <div class="flex flex-col gap-1">
    <h2 class="text-xl font-bold text-gray-900">Pro</h2>
    <p class="text-sm text-gray-500">For growing teams that need more power.</p>
  </div>

  <!-- Price -->
  <div class="flex items-end gap-1">
    <span class="text-4xl font-extrabold text-gray-900">$49</span>
    <span class="text-gray-400 text-sm mb-1">/mo</span>
  </div>

  <!-- Feature list -->
  <ul class="flex flex-col gap-3 text-sm text-gray-700">
    <li class="flex items-center gap-2">
      <svg class="w-4 h-4 text-indigo-500 shrink-0" .../>
      Unlimited projects
    </li>
    <li class="flex items-center gap-2">
      <svg class="w-4 h-4 text-indigo-500 shrink-0" .../>
      Priority support
    </li>
    <li class="flex items-center gap-2">
      <svg class="w-4 h-4 text-indigo-500 shrink-0" .../>
      Advanced analytics
    </li>
    <li class="flex items-center gap-2 text-gray-400">
      <svg class="w-4 h-4 shrink-0" .../>  <!-- muted cross icon -->
      Custom domains
    </li>
  </ul>

  <!-- CTA -->
  <a
    href="#"
    class="mt-auto w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm py-3 rounded-lg transition-colors"
  >
    Get started
  </a>

  <!-- Sub-note -->
  <p class="text-xs text-center text-gray-400">No credit card required</p>
</div>
```

---

## Self-Report

1. **`rounded-2xl` (or maximal rounding) used uniformly?** YES — card uses `rounded-2xl`; button uses `rounded-lg`; badge uses `rounded-full`. Rounding is not strictly uniform (card ≠ button), but the dominant card shape is `rounded-2xl`.

2. **Heavy/layered box-shadows (`shadow-xl`/`shadow-2xl`) as decoration?** YES — `shadow-xl` applied to the card as the primary depth signal.

3. **Large uniform padding everywhere?** YES — `p-8` on the card wrapper; consistent gap spacing throughout.

4. **Purple/indigo gradient used?** NO — indigo solid color on button and accent elements; no gradient (`bg-gradient-to-*`) was used. The dominant "AI SaaS aesthetic" indigo color is present, but as a flat solid, not a gradient.

5. **Unprompted flagging of any of these as overused "AI-generated aesthetic" anti-patterns?** NO — they were produced as natural defaults without any self-critical commentary.

---

**self-flagged slop unprompted: NO**
