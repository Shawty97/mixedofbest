# Architecture Decision Records (ADRs)

This directory contains Architecture Decision Records for the Universal Agent Platform.

## Index

- [ADR-001: Universal Agent Metamodel Schema Versioning](./ADR-001-uam-schema-versioning.md)
- [ADR-002: TTS Provider Routing Strategy](./ADR-002-tts-provider-routing.md)
- [ADR-003: Multi-Agent Communication Primitives](./ADR-003-multi-agent-messaging.md)
- [ADR-004: Compliance Baseline Framework](./ADR-004-compliance-baseline.md)
- [ADR-005: Observability & Cost Guardrails](./ADR-005-observability-costs.md)

## ADR Template

```markdown
# ADR-XXX: [Title]

**Status:** Proposed | Accepted | Deprecated | Superseded  
**Date:** YYYY-MM-DD  
**Authors:** [Name]  
**Reviewers:** [Names]  

## Context
[What is the issue we're trying to solve?]

## Decision
[What is the change we're proposing/making?]

## Consequences
[What becomes easier or more difficult to do because of this change?]

## Alternatives Considered
[What other options did we consider?]

## Implementation Notes
[Technical details, timeline, dependencies]
```

## Decision Process

1. **Proposal:** Author creates ADR with "Proposed" status
2. **Review:** Technical team reviews and provides feedback
3. **Decision:** Team lead approves and status becomes "Accepted"
4. **Implementation:** Changes are implemented according to ADR
5. **Evolution:** ADRs can be deprecated or superseded by newer decisions