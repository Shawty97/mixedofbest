# ADR-001: Universal Agent Metamodel Schema Versioning

Status: Proposed  
Date: 2025-08-09  
Authors: AImpact Platform Team

## Context
We will define a Universal Agent Metamodel (UAM) to describe agents in a portable, cross-platform way. The schema needs clear versioning, compatibility rules, and a migration strategy to ensure enterprise stability and ecosystem growth.

## Decision
- Use semantic versioning (MAJOR.MINOR.PATCH) for the UAM schema.
- Include a required `schemaVersion` field in every agent manifest.
- Maintain backward compatibility within MINOR and PATCH releases; breaking changes require MAJOR version bump.
- Provide a migration guide and automated migration scripts between MAJOR versions.
- Publish a JSON Schema for each version and keep them immutable.

## Consequences
- Enterprise clients can rely on predictable upgrade paths.
- Tooling (SDK/CLI) can enforce compatibility checks and auto-migrations.
- Spec evolution remains controlled and transparent.

## Alternatives Considered
- Single rolling schema (rejected: unpredictable for enterprises)
- Calendar versioning (rejected: less expressive for breaking changes)

## Implementation Notes
- Add JSON Schema files under `spec/uam/<major>.<minor>/schema.json`.
- CLI validations: `uam validate --schema <version>`.
- Migration scripts: `uam migrate --from 1.0 --to 2.0`.
- Version deprecation policy: N-1 MAJOR supported for 12 months.