# ADR-005: Observability & Cost Guardrails

Status: Proposed  
Date: 2025-08-09  
Authors: AImpact Platform Team

## Context
We need robust visibility into latency, reliability, and costs across providers (LLM, TTS, STT, Quantum) to ensure SLOs and profitability.

## Decision
- Define SLOs: Voice P95 < 2.5s, API error rate <1%, uptime >99.5% (MVP phase).
- Implement tracing (OpenTelemetry baseline), structured logs, metrics per provider.
- Cost attribution at call/session level; daily reconciliation against provider invoices.
- Alerting on anomalies (latency, error spikes, budget thresholds).

## Consequences
- Faster debugging and more predictable costs.
- Added instrumentation overhead.

## Alternatives Considered
- Minimal logging only (rejected: blind spots and cost surprises)

## Implementation Notes
- Add middleware for request tracing and correlation IDs.
- Metrics: latency histograms, error counts, cost counters.
- Dashboards: basic health dashboard endpoint in backend; expand later.
- Budget caps and throttling policies configurable per tenant.