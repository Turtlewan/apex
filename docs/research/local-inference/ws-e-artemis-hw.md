# Research: WS-E — Artemis hardware integration

**Date:** 2026-06-12
**Confidence:** High for market pricing (VERIFIED current retailers); Medium for Apple Silicon contention under combined RAG+LLM workloads (COMMUNITY patterns, no published benchmarks for this exact stack); Low for Artemis scope assumptions (product undefined).

---

## Summary

**Shared vs. dedicated call:** Run Artemis RAG/embedding on the Mac Studio M3 Ultra alongside APEX inference — do NOT split to a separate box at this stage. On Apple Silicon's unified-memory architecture, embedding models (~500 MB–2 GB) and a 284B MoE LLM (13B active at any time) occupy completely different resource vectors and schedule naturally without conflict. One box, one power budget, one failure domain. Revisit if Artemis ingestion corpus exceeds ~5 M documents or concurrent inference streams exceed 4.

**Mac Mini verdict:** Retain as APEX coding model host (small/mid models via Ollama) and Artemis orchestration layer (stateless API gateway, task queue, background ingestion scheduling). Do not sell. Zero marginal cost; M4 draws ~12–30 W sustained, runs silently, and has headroom for app-layer work. The Studio handles all large-model inference; the Mini calls it over the local LAN.

**Phased path (summary):**
- Phase 0 (today): Windows desktop + Mac Mini only. $0 new spend. APEX stays on Anthropic API.
- Phase 1 (Q3–Q4 2026): Add Mac Studio M3 Ultra 192 GB (base $3,999) or 256 GB ($5,999 after March 2026 price rise). Add 4-bay NAS (~$599 diskless + ~$480 for 4x 4 TB drives). Add UPS (~$240). Total new spend: ~$5,300–$7,300 depending on RAM tier. APEX fully local + Artemis RAG running.
- Phase 2 (2027+): If Artemis scales to 10 M+ vectors or M5 Ultra ships, evaluate a second Studio or trade in. No spend commitment today.

---

## Key findings

### 1. Mac Studio M3 Ultra — current pricing and RAM availability

[VERIFIED — Apple.com, Tom's Hardware March 2026, EveryMac.com]

- **Base M3 Ultra (96 GB, 28-core CPU, 60-core GPU, 1 TB SSD):** $3,999 MSRP.
- **256 GB upgrade:** Originally $1,600 over base; Apple raised this by $400 in March 2026 when it discontinued the 512 GB option. 256 GB config now $5,999 (base $3,999 + $2,000 upgrade).
- **512 GB config:** Discontinued March 2026. [VERIFIED — 9to5Mac, Tom's Hardware]
- **Delivery lead times:** 6–10 weeks for higher-RAM configs as of mid-2026. [VERIFIED — Apple store search results]
- **Note for planning:** 192 GB is not an M3 Ultra standard config; Apple offers 96 GB and 256 GB only. The WS-B anchor "192 GB" is an estimate of model footprint, not a purchasable tier. Recommend budgeting for 256 GB unless the Q4_K_M 96 GB fit can be confirmed before purchase (see Gap 1 below).

**DeepSeek V4-Flash on M3 Ultra 96 GB:**

[COMMUNITY — DeepSeek V4 Hub, Compute Market, InsiderLLM guides]

- V4-Flash at Q4_K_M weighs ~140–163 GiB. 96 GB is below the model floor — you cannot run V4-Flash at full Q4_K_M on the 96 GB config even with KV cache stripped to zero.
- 256 GB is the safe tier: model (~163 GiB) + KV cache headroom + macOS overhead all fit comfortably.
- Benchmark: M3 Ultra community reports ~22 tokens/second decode for Q4_K_M quantizations of comparable MoE models. [COMMUNITY — Slashdot/MacRumors DeepSeek V3 M3 Ultra thread, InsiderLLM 2026 guide]
- 4 concurrent inference streams possible before throughput falls below 5 tok/s per stream. [COMMUNITY — DeepSeek V4 Hub local Mac guide]

### 2. Apple Silicon unified memory — contention analysis

[COMMUNITY — arXiv 2601.19139, PromptQuorum GPU vs Apple Silicon, Seresa.io unified memory explainer]

Apple Silicon's unified memory architecture means CPU, GPU, and Neural Engine share one physical pool. The implications for a combined LLM + RAG workload:

**GPU memory allocation ceiling:** ~75–78% of unified memory is allocatable to the GPU on large-memory configs. On 256 GB, that is ~195 GB for GPU. DeepSeek V4-Flash Q4_K_M (~163 GiB) fits within this ceiling with ~30 GB to spare for KV cache. [COMMUNITY — Apple Silicon MLX guide, ThinkSmart.Life]

**Embedding model contention:**
- nomic-embed-text (~274 MB) or bge-m3 (~1.1 GB) are negligible relative to available memory.
- Embedding inference is CPU-friendly; MLX can schedule it on the Neural Engine, leaving GPU memory lanes for the LLM. No bandwidth fight for concurrent embedding + generation if they are in separate processes.
- **Risk zone:** Simultaneous bulk ingestion (embedding 10,000+ documents in a tight loop) while serving a long-context LLM prompt can cause memory pressure spikes. Mitigation: throttle ingestion batch size to ~100 docs/pass; schedule bulk indexing overnight. [ASSUMED — based on unified-memory pressure patterns; no V4-Flash + embedding co-run benchmark exists as of June 2026]

**Conclusion:** Co-hosting is safe for personal-scale use (1–4 concurrent users, nightly ingestion batches). Do not run bulk ingestion during active APEX coding sessions.

### 3. Homelab concerns — balanced tier (Mac Studio 256 GB + Mac Mini)

**Power draw:**
- Mac Studio M3 Ultra: 80–150 W under LLM inference load; ~7 W idle. [VERIFIED — Apple spec sheet / Creative Strategies review]
- Mac Mini M4: 10–30 W under load, ~3 W idle. [VERIFIED — Apple spec sheet]
- NAS (Synology DS923+ with 4 spinning drives): ~20–30 W active, ~8 W sleep.
- Network switch + router overhead: ~15–20 W.
- **Total sustained load:** ~125–210 W. Peak (Studio at LLM max + NAS rebuild): ~250 W.

**UPS sizing for balanced tier:**
- Target: 15 min runtime at ~200 W load for graceful shutdown.
- Required capacity: 200 W × 0.25 hr = 50 Wh. At ~50% usable battery depth, need ~100 Wh battery.
- **Recommended:** CyberPower CP1500PFCLCD (1500VA/1000W, pure sine wave). ~$240 MSRP, ~$240 street (Amazon, June 2026). [VERIFIED — CyberPower product page, Amazon listing]
- Runtime at 200 W: ~24 min — sufficient for graceful shutdown and auto-save.
- Pure sine wave required: Apple Silicon power supplies use active PFC; simulated sine wave risks erratic behaviour or shutdown. [VERIFIED — MacRumors UPS forum, heatedbattery.com Mac UPS guide]
- No rack enclosure needed. Both Macs are desktop/shelf form factors.

**Noise and placement:**
- Studio M3 Ultra: near-silent at LLM load (~20–25 dB). [VERIFIED — Creative Strategies review]
- Mac Mini M4: essentially inaudible (~15 dB).
- NAS DS923+: spinning drives audible; ~35 dB. Place in closet or utility room.
- **Total stack can live in a home office or study without noise issues.** No dedicated server room required. This is the primary advantage over the headroom tier.

**Network:**
- Wired Ethernet to Studio and Mini is essential: model downloads (163 GiB) and inference API calls need stable bandwidth.
- Gigabit LAN is sufficient for all inference API traffic and NAS backup. 10 GbE is an optional upgrade for future NAS throughput (TP-Link TL-SX1008 8-port 10 GbE unmanaged: ~$299–$349 street). [ASSUMED — current 1 GbE sufficient; 10 GbE future-proofs NAS backup window]
- Tailscale: install on both Macs. Free personal tier covers this setup. Bind Ollama/LLM server to Tailscale IP for secure remote access without port forwarding. LM Studio 0.4.16 (June 2026) ships with LM Link for Tailscale-native remote model access. [VERIFIED — Tailscale blog, LM Studio release notes]

### 4. Homelab concerns — headroom tier (4× RTX PRO 6000 Blackwell, ~2.4 kW)

[VERIFIED — NVIDIA RTX PRO 6000 spec page, Thunder Compute pricing June 2026]

**Power:**
- 4× RTX PRO 6000 Blackwell: 4 × 600 W = 2,400 W GPU TDP alone.
- Full workstation system (CPU, RAM, PSU overhead, cooling): 3,000–3,500 W sustained.
- **UPS for headroom tier:** APC Smart-UPS 3000VA (2700 W, rack-mount 2U, ~$800–$1,200 street). Provides ~3–5 min at full load — enough for graceful shutdown only. For meaningful runtime, add extended battery module (+~$600). [VERIFIED — Amazon APC SMT3000RM2UC listing, CDW pricing]
- Monthly power cost (24/7 operation at $0.15/kWh): ~$380/month. Not a home workstation; this is a small data centre node.

**Cooling and placement:**
- Requires dedicated room with supplemental cooling: 3.5 kW waste heat = equivalent of a small window AC unit running continuously.
- Noise: GPU blower fans at full load ~65–75 dB. Unusable in any living or office space.
- Rack infrastructure: 12U–15U open rack or enclosed cabinet with front-to-back airflow ($200–$800).

**Verdict on headroom tier:** Viable only with a utility room or garage-level installation. The $36–40k GPU cost is in addition to ~$3–5k infrastructure (rack, supplemental cooling, 30 A circuit, UPS). Annual power cost alone (~$4,500) approaches the annual Claude API subscription cost for many workloads. This tier is justified only if concurrent throughput demand genuinely requires it. Not the recommended starting point.

### 5. Backup strategy

**What must be backed up (irreplaceable):**
- Artemis vector index (Qdrant snapshots or LanceDB files): grows ~1–6 GB per 100 K–1 M vectors. If Artemis reaches 5 M vectors, expect ~30 GB. Daily snapshots essential.
- APEX config, session memory, handoff docs: already in git on Windows desktop. Mirror to NAS.
- System configs (Ollama model registry, vLLM serving config, Tailscale credentials): <10 MB total. Critical.
- Application data (ChromaDB/Qdrant persistent volumes): back up with rsync or Synology Hyper Backup.

**What does NOT need backup:**
- Model weights (DeepSeek V4-Flash GGUF, nomic-embed-text): re-downloadable from HuggingFace in 20–60 min. No backup cost justified.
- macOS system files: restore from Apple Recovery.

**NAS recommendation:**
- Synology DS923+ (4-bay, AMD Ryzen dual-core, 4 GB RAM, 10 GbE upgrade slot): ~$599 diskless. [VERIFIED — storagediskprices.com, Newegg listing June 2026]
- 4× 4 TB WD Red Plus NAS drives: ~$120 each = ~$480. Note: Hard drive prices surged ~46–96% since late 2025 due to AI infrastructure demand. WD production largely committed for 2026. Buy early. [VERIFIED — ZME Science HDD price surge article, Digital Biz Talk crisis guide]
- RAID 5 configuration gives 12 TB usable with 1-drive fault tolerance.
- Total NAS cost: ~$1,079 populated. [ASSUMED — $599 + $480 drives, street prices as found]
- Synology Hyper Backup to a second destination (external USB drive or Backblaze B2 at ~$6/TB/month) completes the 3-2-1 rule.

**Vector DB choice for backupability:**
- LanceDB (disk-native Lance format) is more backup-friendly than in-memory ChromaDB: files sit on disk, rsync directly to NAS. Handles corpora > 1 M vectors without memory pressure. Recommended for Artemis second brain. [VERIFIED — 4xxi.com vector DB comparison 2026]
- ChromaDB acceptable for development / small corpora (< 500 K vectors). Switch to LanceDB before Artemis scales.

### 6. GPU pricing note (headroom tier only)

[VERIFIED — Thunder Compute NVIDIA RTX PRO 6000 pricing blog, Amazon listing June 2026, PNY product page]

- RTX PRO 6000 Blackwell Workstation Edition: ~$8,000–$9,200 street per card as of June 2026. MSRP set at ~$8,565 at March 2025 launch.
- 4-card workstation: GPU cost alone ~$32,000–$36,800. Full system with workstation chassis, power, cooling: $36,000–$42,000.
- Server Edition (passive cooling): designed for dense rack deployment; not suitable for home without rack + supplemental HVAC.

---

## Shared vs. dedicated analysis

| Dimension | Shared (Studio hosts both) | Dedicated (Studio = LLM only, Mini = Artemis) | Verdict |
|-----------|---------------------------|----------------------------------------------|---------|
| Embedding contention on unified memory | Near-zero: 1–2 GB model vs 256 GB pool | None | Shared wins |
| Bulk ingestion during active LLM session | Mild pressure; throttle batches to 100 docs/pass | None | Dedicated marginal win; not worth cost |
| Failure blast radius | APEX + Artemis both down if Studio fails | Partial degradation | Dedicated wins; acceptable trade-off |
| Power / cost | One box at ~150 W | Two boxes at ~200 W; Mini adds 30 W | Shared wins |
| Upgrade independence | Studio upgrade affects both | Can swap inference box without Artemis disruption | Dedicated marginal win; no upgrade planned |
| Operational complexity | Single serve endpoint | Two endpoints, routing layer | Shared wins |
| **Overall** | | | **Shared recommended** |

The Mac Mini should run the Artemis orchestration layer (stateless: API gateway, task scheduler, background ingestion) and APEX coding models (7 B–14 B via Ollama). The Studio serves all large-model inference over the local network REST API. This is not "dedicated" in the hardware sense — it is a logical split of duties across already-owned machines.

---

## Phased hardware path table

| Phase | When | Component | Line item cost | Cumulative | Notes |
|-------|------|-----------|---------------|-----------|-------|
| **0** | Today | Windows desktop (owned) | $0 | $0 | APEX planning only; API calls to Anthropic |
| **0** | Today | Mac Mini M4 (owned) | $0 | $0 | APEX coding host + Artemis proto (small models) |
| **1a** | Q3 2026 | Mac Studio M3 Ultra 256 GB / 2 TB SSD | $5,999 [VERIFIED — Apple March 2026 pricing] | $5,999 | Core inference box. Order early: 6–10 wk lead time. |
| **1b** | Q3 2026 | CyberPower CP1500PFCLCD UPS | $240 [VERIFIED — Amazon June 2026] | $6,239 | Pure sine wave; 15 min graceful shutdown at 200 W |
| **1c** | Q4 2026 | Synology DS923+ (diskless) | $599 [VERIFIED — storagediskprices.com] | $6,838 | NAS chassis |
| **1c** | Q4 2026 | 4× 4 TB WD Red Plus | $480 [VERIFIED — buyperunit.com ~$120/drive; note HDD price volatility] | $7,318 | RAID 5; 12 TB usable |
| **1d** | Q4 2026 | TP-Link TL-SX1008 10 GbE switch (optional) | $299–$349 [ASSUMED — typical street range] | $7,617–$7,667 | Only if NAS backup window matters; 1 GbE works fine today |
| **2** | 2027+ | M5 Ultra Studio (if released H2 2026) or trade-in upgrade | TBD | — | Rumoured H2 2026. If V4-Flash performance or Artemis corpus demands it, trade in Studio. |
| **2** | 2027+ | Dedicated embedding accelerator | $0–$800 | — | Only if Artemis bulk ingestion (10 M+ docs) creates sustained contention. Start with free Mac Mini CPU capacity. |

**Phase 1 total (recommended):** ~$7,300 including NAS. Without NAS (defer to Q4 2026): ~$6,239.

**Entry alternative:** Mac Studio M3 Ultra 96 GB ($3,999) if a confirmed Q4_K_M quant of V4-Flash below 90 GB emerges before purchase. Risk: may need to sell and upgrade if quant doesn't materialise. [ASSUMED — 96 GB floor for V4-Flash not yet confirmed; community guidance says 256 GB is safe]

**Headroom tier (optional Phase 3):** 4× RTX PRO 6000 Blackwell workstation, $36–42k all-in. Justified only at production scale with 10+ concurrent users and utility-room installation. Not in the home plan.

---

## Mac Mini verdict

**Retain. Repurpose as dual-role host: APEX coding model server + Artemis orchestration layer.**

Rationale:

1. **Zero marginal cost.** Already owned. Power: ~10–30 W sustained (~$15–25/year at $0.15/kWh). [VERIFIED — Mac Mini M4 spec sheet, Ollama Mac Mini M4 power guide]
2. **Right fit for coding models.** Ollama on M4 runs 7 B–14 B coding distils at 40–60 tok/s. Adequate for APEX coding-mode tasks that don't need V4-Flash scale. V4-Flash large-model requests route to the Studio over local LAN.
3. **Artemis orchestrator.** FastAPI + task queue (Celery or RQ) for background ingestion scheduling, query routing, memory management. Footprint: 2–4 GB RAM. M4 Pro 24 GB is massively headroom for this role.
4. **Upgrade independence.** Mac Mini and Studio upgrade on separate cycles. When Studio is eventually replaced (M5 Ultra), Mini stays. When Mini ages out, swap it without touching inference infrastructure.
5. **Alternative rejected.** Selling Mini today yields ~$800–$1,000 used vs. $0 marginal cost to keep. Not economically rational given the ongoing utility.

---

## Assumptions & gaps

1. **Gap: V4-Flash fits 96 GB — unconfirmed.** Community guidance cites ~140–163 GiB for Q4_K_M. If a lower-quant (Q3_K_S, ~100 GiB) emerges and validates on 96 GB with acceptable quality, the entry tier ($3,999) becomes viable. Check HuggingFace community model pages and llama.cpp issue tracker before ordering. [ASSUMED — no confirmed 96 GB run as of June 2026]

2. **Artemis scope undefined.** All RAG/embedding sizing assumes a personal knowledge base of 10 K–500 K documents (second-brain use case). If Artemis later handles multi-user production traffic or a corpus > 5 M documents, the shared-box model breaks and a dedicated embedding host (even a used Mac Mini M4 Pro) is needed.

3. **M5 Ultra timing.** Rumoured H2 2026 (Macworld). If released before order, evaluate trade-in economics before committing to M3 Ultra 256 GB. M5 may offer higher memory bandwidth and better MoE token throughput. [COMMUNITY — Macworld M5 Mac Studio rumour roundup]

4. **HDD price volatility.** Hard drive prices surged 46–96% since late 2025 due to AI datacenter demand. WD production nearly sold out for 2026. NAS drive budget may shift ±30% by Q4 2026. Buy drives early or consider higher-TB drives to future-proof. [VERIFIED — ZME Science, Digital Biz Talk HDD price surge articles]

5. **Single point of failure.** Shared Studio means APEX and Artemis both fail if the Studio fails. Acceptable for a single-owner home setup. Mitigations: Time Machine backup of Studio config, Synology NAS for vector index daily snapshots, APEX fallback to Anthropic API (already wired in CLAUDE.md).

6. **Tailscale free tier.** Personal Tailscale plan covers one user, 3 devices (Windows, Studio, Mini). Check tailscale.com for current limits if additional nodes are added (e.g., NAS, phone). [ASSUMED — current personal plan limit; verify before adding 4th device]

---

## Sources

**Apple pricing and availability:**
- [Apple Mac Studio buy page](https://www.apple.com/shop/buy-mac/mac-studio)
- [Tom's Hardware: Apple pulls 512 GB Mac Studio option, raises 256 GB price (March 2026)](https://www.tomshardware.com/tech-industry/apple-pulls-512-mac-studio-upgrade-option)
- [9to5Mac: Apple no longer offers M3 Ultra with highest RAM (March 2026)](https://9to5mac.com/2026/03/05/apple-no-longer-offers-m3-ultra-mac-studio-with-original-highest-ram-configuration/)
- [EveryMac: Mac Studio MSRP history](https://everymac.com/global-mac-prices/all-msrp-mac-studio-prices-in-united-states.html)
- [Macworld: M5 Mac Studio 2026 rumours](https://www.macworld.com/article/2973459/2026-mac-studio-m5-release-date-specs-price-rumors.html)

**DeepSeek V4-Flash on Apple Silicon:**
- [DeepSeek V4 Hub: local Mac deployment guide](https://deepseekv4pro.com/guides/deepseek-v4-flash-local-mac)
- [InsiderLLM: Best local LLMs for Mac 2026](https://insiderllm.com/guides/best-local-llms-mac-2026/)
- [Compute Market: DeepSeek V4-Flash local hardware guide 2026](https://www.compute-market.com/blog/deepseek-v4-flash-local-hardware-guide-2026)
- [Flowtivity: DeepSeek V4 Flash on 128 GB Mac](https://flowtivity.ai/blog/deepseek-v4-flash-ds4-local-inference-128gb-mac/)
- [Slashdot/MacRumors: DeepSeek V3 at 20 tok/s on Mac Studio](https://apple.slashdot.org/story/25/03/25/2054214/deepseek-v3-now-runs-at-20-tokens-per-second-on-mac-studio)

**Apple Silicon unified memory architecture:**
- [Seresa.io: Unified memory — Apple Silicon vs NVIDIA for AI](https://seresa.io/blog/ai-data-readiness/what-is-unified-memory)
- [PromptQuorum: GPU vs CPU vs Apple Silicon for local LLMs](https://www.promptquorum.com/local-llms/gpu-vs-cpu-vs-apple-silicon)
- [arXiv 2601.19139: Native LLM and MLLM inference at scale on Apple Silicon](https://arxiv.org/pdf/2601.19139)
- [ThinkSmart.Life: Apple Silicon MLX and LLM inference complete guide](https://thinksmart.life/research/posts/apple-silicon-mlx-llm-guide/)

**Mac Mini as inference/embedding server:**
- [Marc0.dev: Mac Mini M4 AI server Ollama 2026](https://www.marc0.dev/en/blog/ai-agents/mac-mini-ai-server-ollama-openclaw-claude-code-complete-guide-2026-1770481256372)
- [RunMini: Mac Mini M4 Ollama AI hosting review 2026](https://runmini.com/en/blog/articles/mac-mini-m4-ollama-ai-hosting-cost.html)
- [GitHub gist: Ollama + Gemma 4 12B on Mac mini April 2026 setup](https://gist.github.com/greenstevester/fc49b4e60a4fef9effc79066c1033ae5)

**UPS and power:**
- [HomeLabPicks: Best UPS for home lab 2026](https://homelabpicks.com/ups-power/best-ups-home-lab/)
- [CyberPower CP1500PFCLCD product page](https://www.cyberpowersystems.com/product/ups/pfc-sinewave/cp1500pfclcd/)
- [Amazon: CyberPower CP1500PFCLCD](https://www.amazon.com/CyberPower-CP1500PFCLCD-Sinewave-Outlets-Mini-Tower/dp/B00429N19W)
- [HeatedBattery: How to choose a UPS for Mac](https://www.heatedbattery.com/how-to-choose-the-best-ups-for-your-mac-setup/)
- [Amazon: APC SMT3000RM2UC 3000VA rack UPS](https://www.amazon.com/APC-Smart-UPS-SmartConnect-Uninterruptible-SMT3000RM2UC/dp/B0785NCFMY)

**NAS and storage:**
- [StorageDiskPrices: Best Synology NAS 2026](https://storagediskprices.com/best-synology-nas/)
- [BuyPerUnit: 4 TB HDD price 2026 ($0.015/GB floor)](https://www.buyperunit.com/blog/best-4tb-hard-drive-price-per-gb)
- [ZME Science: Hard drive prices surged 60% in four months](https://www.zmescience.com/future/hard-drive-prices-have-surge/)
- [Digital Biz Talk: HDD price crisis 2026 buying guide](https://digitalbiztalk.com/article/hdd-price-surge-where-to-buy-drives-in-2026-after-96-increase)

**Vector databases:**
- [4xxi: Vector database comparison 2026 (ChromaDB vs Qdrant vs LanceDB)](https://4xxi.com/articles/vector-database-comparison/)
- [LanceDB vs ChromaDB — AICoolies disk-based comparison](https://aicoolies.com/comparisons/lancedb-vs-chromadb)

**Networking:**
- [Tailscale: Self-host a local AI stack and access it from anywhere](https://tailscale.com/blog/self-host-a-local-ai-stack)
- [Tailscale: LM Link remote LLM access](https://tailscale.com/blog/lm-link-remote-llm-access)
- [TP-Link TL-SX1008 8-port 10 GbE switch](https://www.tp-link.com/us/business-networking/unmanaged-switch/tl-sx1008/)

**RTX PRO 6000 Blackwell (headroom tier reference):**
- [Thunder Compute: NVIDIA RTX PRO 6000 pricing June 2026](https://www.thundercompute.com/blog/nvidia-rtx-pro-6000-pricing)
- [NVIDIA RTX PRO 6000 Blackwell Workstation Edition](https://www.nvidia.com/en-us/products/workstations/professional-desktop-gpus/rtx-pro-6000/)
- [Amazon: RTX PRO 6000 Blackwell listing](https://www.amazon.com/NVD-RTX-PRO-6000-Blackwell/dp/B0F7Y644FQ)

---

**File written:** 2026-06-12
**Replaces:** Prior thin-run ws-e-artemis-hw.md (built on wrong tier — assumed discrete GPU box, not Apple Silicon balanced tier)
