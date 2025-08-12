# ADR-003: Multi-Agent Communication Primitives & Handoffs

Status: Proposed  
Date: 2025-08-09  
Authors: AImpact Platform Team

## Context
To achieve true multi-agent orchestration, agents must communicate reliably with well-defined message envelopes, roles, and handoff semantics. The system needs to support sync and async communication, scoped permissions, and auditability.

## Decision
- Define a message envelope with fields: `id`, `timestamp`, `traceId`, `sender`, `recipient`, `role`, `intent`, `payload`, `acl`, `ttl`.
- Support both synchronous (RPC-style) and asynchronous (event/queue) patterns.
- Handoffs: explicit `handoff` messages with context packages and consent policies.
- Permissions: scoped API/tool permissions per agent and per conversation.
- Persistence: append-only conversation graph with audit trail.

## Consequences
- Clear protocol surface enables robust orchestration and testing.
- Better observability and replay capabilities.
- Slightly increased overhead for envelope management.

## Alternatives Considered
- Ad-hoc JSON messages (rejected: brittle, no governance/audit)
- Only async (rejected: voice and transactional flows need sync paths)

## Implementation Notes
- Define TypeScript interfaces for envelope and message bus contract.
- Backend: abstract broker interface (e.g., NATS/Kafka/RabbitMQ pluggable later), start with in-memory stub.
- Conversation graph persisted via existing DB; design for ACL on shared memories.
- Add policy hooks for compliance checks at handoffs.