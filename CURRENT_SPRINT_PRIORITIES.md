# 🏃 Current Sprint Priorities (Sprint 1 – 14 days)

Owner: Founding Team  |  Goal: MVP Revenue Readiness  |  Period: 14 days

## 🎯 Objectives
- Ship Healthcare Appointment Agent (Template v1)
- Stabilize TTS multi-provider pipeline
- Enable Stripe subscriptions + usage tracking
- Consolidate backend + establish basic observability
- Align Phase 1 of 100x plan: UAM v0.1 + SDK/CLI + Build/Workspace fix

---

## ✅ Scope & Deliverables

1) Healthcare Appointment Agent (Template v1)
- Deliverables:
  - Agent flow (intake → schedule → confirmation → reschedule)
  - Calendar integration (Google Calendar + ICS fallback)
  - Voice UX: medically appropriate prompts, consent, disclaimers
  - Demo script + sample data (German + English)
- Acceptance:
  - End-to-end demo: call → schedule → confirmation SMS
  - Latency P95 < 2.5s, Success > 90%

2) TTS Multi-Provider Pipeline
- Deliverables:
  - Providers: Azure (primary), ElevenLabs (secondary), OpenAI (fallback), Coqui (on-prem option)
  - Smart routing based on latency/cost/quality policy
  - Health checks + failover + metrics
- Acceptance:
  - Automated tests for provider switching
  - Voice quality A/B baseline (MOS proxy rating)

3) Payments & Plans (Stripe)
- Deliverables:
  - Plans: Starter ($99), Pro ($299), Enterprise (Custom)
  - Usage metering: voice minutes + LLM tokens
  - Customer portal + webhook handling
- Acceptance:
  - Test mode: subscribe, cancel, upgrade/downgrade
  - Accurate usage reporting ±2%

4) Backend Consolidation & Observability
- Deliverables:
  - Canon backend: `/backend` only
  - Archive `/frontend/backend` + update docs
  - Logging/metrics: request logs, error rates, provider costs
- Acceptance:
  - Single docker-compose deploy
  - Health dashboard with 3 provider metrics

5) Build System & Workspace Fix (Monorepo)
- Deliverables:
  - Root workspace with scripts for install/dev/build/test
  - Single command to run FE/BE in dev
  - Consistent lockfiles (root + frontend)
- Acceptance:
  - From repo root: `npm run setup` completes without error
  - `npm run dev` starts FE+BE concurrently

6) UAM v0.1 Spec + JSON Schema + Validator
- Deliverables:
  - UAM spec draft (persona, capabilities, tools, knowledge, deployment, compliance, economics, versioning)
  - JSON Schema + validation library (TS) + minimal Python validator
  - Sample agent definitions (healthcare template)
- Acceptance:
  - `uam:validate` CI step passes on sample agents
  - Schema versioning documented (semver) with one migration example

7) Agent SDK & CLI Skeleton
- Deliverables:
  - SDK scaffolding (TS): load/validate UAM, package, deploy hooks
  - CLI skeleton: `uam validate`, `uam package`, `uam deploy` (no-op deploy)
  - Extensibility points for provider plugins
- Acceptance:
  - CLI runs locally with help, returns proper exit codes
  - Unit tests for validation and packaging pass

8) ADR Batch #1 (Architecture Decision Records)
- Deliverables:
  - ADR-001 UAM Schema-Versionierung
  - ADR-002 TTS Provider Routing (Azure→11Labs→OpenAI, Coqui local)
  - ADR-003 Multi-Agent Messaging-Primitives & Handoffs
  - ADR-004 Compliance Baseline (PII flows, residency)
  - ADR-005 Observability & Cost Guardrails (P95, caps, attribution)
- Acceptance:
  - ADRs stored under /docs/adr or /architecture/adr and referenced in README

9) Real-time Agent Communication Foundations
- Deliverables:
  - Protocol outline (sync/async), message envelope, minimal broker interface
  - Service API contract for agent-to-agent messaging (stubbed)
- Acceptance:
  - Contract approved in ADR-003; stub endpoints covered by tests

---

## 📊 KPIs
- Time-to-first-conversation < 30 mins (from signup)
- Voice response latency P95 < 2.5s
- Template deployment success > 90%
- Payment conversion (trial→paid) > 20%
- UAM validation pass rate 100% on shipped templates
- Dev DX: `npm run dev` time-to-running < 60s from clean clone

---

## 🔧 Engineering Tasks
- [ ] Implement TTS provider interfaces + router
- [ ] Add provider health checks + circuit breaker
- [ ] Integrate Stripe (plans + metering + webhooks)
- [ ] Implement appointment template with calendar integration
- [ ] Consolidate backend and update docker-compose
- [ ] Add usage events + cost tracking in service layers
- [ ] Add basic health dashboard endpoint
- [ ] Root workspace scripts (install/dev/build/test) + concurrently
- [ ] UAM JSON Schema + TS validator + sample agents
- [ ] CLI skeleton (validate/package/deploy) + unit tests
- [ ] ADRs 001–005 drafted and committed
- [ ] Agent-to-agent protocol outline + stub service API

## 🧪 QA & Testing
- [ ] E2E voice conversation test (automated)
- [ ] Payments flow test (upgrade/downgrade/cancel)
- [ ] Provider failover test (kill primary → fallback)
- [ ] Load test (100 concurrent conversations)
- [ ] Schema validation tests (valid/invalid agents)
- [ ] CLI tests (exit codes, error messages)
- [ ] Contract tests for agent-to-agent messaging stubs

## 📚 Documentation
- [ ] Update SETUP with healthcare template quickstart
- [ ] Document TTS provider configuration and routing policies
- [ ] Payments setup (Stripe keys, webhooks)
- [ ] Backend consolidation notes
- [ ] UAM v0.1 spec (living doc) + examples
- [ ] CLI usage + SDK extension points
- [ ] ADR index with links in README

---

## 🚨 Risks & Mitigations
- Provider rate limits → backoff + queuing
- Latency spikes → regional routing + caching
- Compliance (healthcare) → add consent flows + data minimization
- Stripe metering accuracy → idempotent webhooks + daily reconciliation
- Scope creep (100x additions) → timebox UAM/CLI to MVP skeletons; defer marketplace

---

## ⏭️ Next Sprint (Preview)
- Slack/Widget deployment (one-click)
- Analytics v1 (ROI + CSAT dashboard)
- HIPAA readiness checklist
- Marketplace architecture draft + revenue sharing design