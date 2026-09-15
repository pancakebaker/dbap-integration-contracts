# Phase 4 Code Generation Evaluation

This document evaluates generated artifacts and package distribution against the
released `v1.0.0` contract baseline. It is evaluation only: no generated
artifact is used by production code, and no package is published.

## Current Duplication

| Boundary            | Current representation                                                    | Classification                               | Candidate output                 | Manual code remains                                                 | Practical value                        |
| ------------------- | ------------------------------------------------------------------------- | -------------------------------------------- | -------------------------------- | ------------------------------------------------------------------- | -------------------------------------- |
| Bidding producer    | C# envelope, event names, routing keys, payload records, outbox factories | Wire DTO plus semantic producer logic        | C# event DTOs                    | Aggregate transitions, Buy Now decisions, outbox atomicity, routing | Low to medium                          |
| Operations consumer | C# envelope/payload inputs and activity mapper                            | Mechanical wire DTO plus projection logic    | C# consumer DTOs                 | Mapping, persistence, authorization, reports                        | Medium to high                         |
| Live Feed consumer  | TypeScript unions, constants, validators, Redis/socket projections        | Wire types plus runtime protocol validation  | TypeScript types and validators  | Admission, ordering, idempotency, projection, Socket.IO             | Medium to high                         |
| Laravel BFF         | OpenAPI snapshot, hand-authored HTTP client, response/error handling      | Protocol plumbing plus tenant/auth semantics | PHP DTOs or client surface       | Auth headers, tenant binding, retries, Laravel exceptions           | Low for a full client; medium for DTOs |
| Socket.IO payloads  | Live Feed-specific TypeScript socket payloads                             | Projection/view model                        | None directly from event schemas | All transformation and UI-facing semantics                          | Low                                    |

The canonical schemas remove mechanical drift risk. They do not replace domain
models, persistence entities, projections, authorization, or event sequencing.

## POC Results

### C#

Serious candidates reviewed were NJsonSchema and quicktype. A pinned
Quicktype `23.2.6` experiment generated a 94-line `BidAccepted` model from the
canonical fixture. The output used `Guid`, `DateTimeOffset`, and numeric
properties, but required Newtonsoft.Json and inferred the model from an example
rather than enforcing every JSON Schema keyword. It also produced generic names
and mutable classes that would need review before use.

NJsonSchema is the stronger future candidate because it can consume JSON Schema
and offers configurable System.Text.Json-oriented generation. It still needs a
small checked-in configuration, explicit naming, nullable handling, and a
reviewed mapping boundary.

Generated wire DTOs can preserve nullable reference types, decimal, UTC
`DateTimeOffset`, `Guid`, enum, and JSON property-name semantics only when the
generator configuration is pinned and output is tested against canonical
fixtures. They must remain separate from Bidding aggregates and Operations
models. Bidding gains little as the semantic producer; Operations is the better
consumer candidate.

**Decision:** Bidding producer: `KEEP CURRENT MODEL`. Operations consumer:
`ADOPT LATER`, after a small System.Text.Json DTO POC proves naming, nullability,
and mapping ergonomics.

### TypeScript

Candidates reviewed were `json-schema-to-typescript`, TypeBox/Ajv, and
quicktype. A pinned `json-schema-to-typescript 15.0.4` experiment showed that
the current draft-2020-12 schemas and URN references require a deliberate
bundle/dereference step; direct generation does not silently provide a safe
result. This is a useful portability finding, not a contract defect.

The existing Live Feed parser already supplies runtime validation, exact event
discrimination, UUID/date/money checks, and application-specific invariants.
Generated interfaces alone would remove little risk. A future schema-native
Ajv or TypeBox validator could reduce repeated field checks, but must preserve
`additionalProperties: true`, same-version distinct events, and fail-closed
behavior for malformed messages.

**Decision:** static types: `ADOPT LATER`; runtime parsers: `POC ONLY`; npm
package: `ADOPT LATER` only if generated validators are smaller and behaviorally
identical to the current parser.

### PHP / Laravel

OpenAPI Generator and Kiota were reviewed as full-client candidates. A full
generated Laravel client would add a large file/dependency surface while still
requiring wrappers for BFF authentication headers, tenant binding,
ClientApplication assertions, Laravel exception mapping, retry policy, and
configuration. Those wrappers would retain most of the meaningful code.

Generated PHP DTOs are a narrower candidate, but Laravel currently benefits from
its explicit client and error behavior. A future isolated DTO experiment may be
worthwhile if it consumes the pinned OpenAPI document without introducing a
Composer runtime dependency.

**Decision:** DTOs: `ADOPT LATER`; full client: `KEEP CURRENT MODEL`; Composer
package: `REJECT` for now.

## Scoring

Scores are 1 (poor) to 5 (strong). “Maintenance cost” and “tooling complexity”
are scored as attractiveness, so a low score is a burden.

| Candidate                     | Duplication reduction | Type/runtime safety | Developer ergonomics | Maintenance cost | Tooling complexity | Release complexity | Coupling risk |
| ----------------------------- | --------------------: | ------------------: | -------------------: | ---------------: | -----------------: | -----------------: | ------------: |
| C# producer DTOs              |                     2 |                   3 |                    2 |                2 |                  2 |                  2 |             2 |
| C# Operations consumer DTOs   |                     4 |                   4 |                    4 |                3 |                  3 |                  3 |             3 |
| TypeScript static types       |                     3 |                   3 |                    4 |                3 |                  3 |                  3 |             3 |
| TypeScript runtime validators |                     4 |                   4 |                    3 |                2 |                  2 |                  3 |             2 |
| PHP full generated client     |                     2 |                   3 |                    2 |                1 |                  2 |                  1 |             2 |
| PHP DTO-only generation       |                     3 |                   3 |                    3 |                2 |                  2 |                  2 |             3 |

## Distribution and Version Skew

The current repository-local pinned snapshot remains the best default: it is
offline, reviewable, reproducible, and has no registry or runtime coupling. A
package becomes worthwhile only when at least two consumers demonstrably share
the same generated artifact and upgrade cost is lower than snapshot review.

If adopted later, the canonical release must be published first. Derived
artifacts may then use aligned versions such as `DBAP.Contracts 1.1.0` and
`@dbap/contracts 1.1.0`; neither package becomes semantic authority. Applications
may temporarily use different compatible releases, but each must pin an exact
release/commit and compatibility must be tested before upgrade.

Generated artifacts should include stable provenance such as the canonical
release and commit, never a floating `main` reference. Generation should be
deterministic, formatter-stable, and run from canonical schemas rather than
application-local models. Build-time generation is reproducible but requires
tool availability; committed output is reviewable but creates drift; packages
improve upgrades but add registry, release, and supply-chain coupling.

## Phase 5 Recommendation

**Build one narrow C# Operations consumer DTO POC, without publishing a
package.** Use a pinned schema-native generator, System.Text.Json, and a small
fixture round-trip test. Compare generated DTOs with the current mapper and
measure output size, nullability, unknown-field behavior, and upgrade friction.
If that POC is positive, evaluate a paired TypeScript type/validator artifact.
Keep Bidding producer types and the Laravel BFF client hand-authored until
evidence shows a real reduction in maintenance.

## Security and Licensing

No generator was added to production dependencies. Future adoption should pin
exact tool versions, review transitive dependencies and licenses, run in CI from
the canonical repository, and avoid executing untrusted schema content. No
package or license change is part of this phase.
