# ADR-002: TTS Provider Routing Strategy

Status: Proposed  
Date: 2025-08-09  
Authors: AImpact Platform Team

## Context
We require low-latency, high-quality, and cost-effective TTS for voice agents. No single provider guarantees global excellence. We need a multi-provider strategy with health, latency, cost, and quality considerations.

## Decision
- Primary: Azure Speech for breadth of voices, enterprise SLAs, and regional availability.
- Secondary: ElevenLabs for premium voice quality and brand voices.
- Fallback: OpenAI TTS for resiliency and cost balance.
- Local option: Coqui TTS for on-prem and data-sensitive deployments.
- Implement a policy-based router with health checks, circuit breaker, and per-region/provider scoring.

## Consequences
- Higher reliability and predictable latency.
- Cost optimization via dynamic routing.
- Complexity increases in integration and monitoring.

## Alternatives Considered
- Single provider (rejected: vendor lock-in, regional performance variance)
- Manual selection per agent (rejected: operational burden, lacks auto-failover)

## Implementation Notes
- Add `tts.providerPolicy` to UAM (latency/cost/quality weights, region preferences).
- Metrics: provider latency P95, error rate, cost per minute, MOS proxy.
- Health: periodic pings, failure thresholds, recovery backoff.
- Circuit breaker per provider-region pair.
- Audit traces for routing decisions.