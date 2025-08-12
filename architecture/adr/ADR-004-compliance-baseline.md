# ADR-004: Compliance Baseline Framework

Status: Proposed  
Date: 2025-08-09  
Authors: AImpact Platform Team

## Context
Enterprise adoption requires built-in compliance for PII handling, data residency, retention, DLP, and auditing—especially for healthcare (HIPAA) and EU markets (GDPR).

## Decision
- Establish a baseline policy set: PII classification, data minimization, encryption at rest/in transit, retention, residency, access controls, audit logging.
- Implement consent flows for voice interactions and data processing.
- Regional data routing and storage (US/EU) with configurable residency.
- Standardize DPA templates and BAA for healthcare customers.

## Consequences
- Faster enterprise procurement and security reviews.
- Slight overhead in engineering for policy checks and regionalization.

## Alternatives Considered
- Ad-hoc compliance per customer (rejected: inconsistent, slow)

## Implementation Notes
- Add `compliance` section to UAM manifests (PII, DLP, retention, residency, audit).
- Backend middleware for consent and PII tagging.
- Logging: structured, redacted, with tamper-evident storage for audits.
- Documentation: HIPAA readiness checklist; GDPR DPA templates.