# Roadmap

| Phase | Goal | Status |
|-------|------|--------|
| 1 | Audit all existing apex skills — gaps, inconsistencies, missing impl.md files | ✅ Done |
| 2 | Define and fill gaps — write SKILL.md + impl.md for 11 new specialist domains | ✅ Done |
| 3 | Create SKILLS.md tiered index for fast context loading | ✅ Done |
| 4 | Update registry (`~/.claude/registry/domains.md`) to route new skills automatically | Next |
| 5 | Improve orchestration — smarter specialist loading, token budgeting | Future |
| 6 | Additional specialists (apex-payments, apex-auth, apex-email, apex-websockets) | Future |

## Phase 2 — New skills delivered (2026-05-27)

### Skill files written (SKILL.md + impl.md)

| Skill | Domain | Key topics |
|-------|--------|------------|
| apex-github | Version control | Issue taxonomy, PR conventions, Conventional Commits, release management, GitHub security features |
| apex-system-design | Architecture | CAP/PACELC, caching strategies, message queues, rate limiting, circuit breakers, distributed locking |
| apex-devcontainer | Dev tooling | devcontainer.json spec, ~/.claude mount strategy, Features, lifecycle hooks, DinD vs DooD |
| apex-aws | Cloud | Well-Architected 6 pillars, CDK v2, IAM execution roles, S3/DynamoDB/ECS, OIDC federation |
| apex-azure | Cloud | WAF 5 pillars, Bicep/Terraform, Managed Identity, Key Vault references, Container Apps, WIF |
| apex-gcp | Cloud | Architecture Framework 6 pillars, Cloud Run, GKE Autopilot, Workload Identity Federation, Secret Manager |
| apex-homelab | IoT/Smart home | Home Assistant, ESPHome ESP32, Zigbee/MQTT, mmWave radar occupancy, HA REST/WebSocket API |
| apex-k8s | Container ops | Workloads, HPA, Helm, ArgoCD GitOps, RBAC, External Secrets, Network Policies |
| apex-iac | Infrastructure | Terraform remote state/modules, Pulumi, Ansible, Infracost, CI plan+apply workflow |
| apex-mobile | Mobile | Expo/React Native, EAS Build+Submit, EAS Update OTA, SecureStore, push notifications |
| apex-research | Research | Tiered sources (Context7/WebSearch/WebFetch), confidence tagging, parallel agents, ADR output |
