# Packaging roadmap

Phase 1 intentionally publishes no packages and changes no application
references. The repository is a machine-readable documentation and validation
foundation.

Future options should be evaluated after application-side conformance checks:

- .NET may consume a generated or deliberately maintained versioned NuGet artifact.
- TypeScript may consume generated types or validate directly against JSON Schema/AsyncAPI.
- PHP may consume generated DTO/client models only if the REST surface justifies it.

Generated artifacts must remain derived from the language-neutral wire
documents. Producer domain models remain the semantic authority, and consumer
projections remain service-local. Package publication, code generation, and
replacement of current local contract classes are deferred to a later phase.
