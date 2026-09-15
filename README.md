# DBAP Integration Contracts

Language-neutral, machine-readable compatibility foundations for the
Distributed Bidding Auction Platform. This repository describes wire facts
shared across independently deployed services; it is not a replacement for
producer domain logic or consumer projections.

## What belongs here

- RabbitMQ integration-event JSON Schemas and routing documentation;
- the current Bidding REST surface as normalized OpenAPI documentation;
- AsyncAPI documentation for the existing RabbitMQ event channels;
- canonical JSON examples and compatibility fixtures; and
- versioning, ownership, drift, and future packaging guidance.

Redis keys, database schemas and migrations, queue retry/DLQ policy, Socket.IO
payloads, UI models, credentials, and service implementations remain in their
own repositories.

## Current contracts

The v1 event envelope contains `eventId`, `eventType`, `occurredAtUtc`,
`aggregateType`, `aggregateId`, `aggregateVersion`, `correlationId`,
`tenantId`, and `payload`. The six current event types are `BidAccepted`,
`AuctionPurchased`, `AuctionClosed`, `WinnerSelected`, `AuctionCancelled`,
and `TenantStatusChanged`.

`eventId` is the event uniqueness/idempotency identity. `aggregateVersion` is
ordering metadata for aggregate transitions; distinct companion events may
share one version. For example, a threshold Buy Now transition can emit
`BidAccepted`, `AuctionPurchased`, and `AuctionClosed` at the same version.

Bidding is authoritative for accepted bids, Buy Now normalization, winners,
final prices, Tenant ownership, and lifecycle meaning. An `AuctionPurchased`
final price is producer-supplied and must not be inferred from `BidAccepted`.
Money remains a JSON number in the current wire format, timestamps are
ISO-8601 UTC strings, and UUID/GUID values use the current UUID string shape.

The schemas allow additive unknown properties while requiring the current
semantic fields. This reflects the current consumers, which validate required
fields but do not reject unrelated JSON properties. Known enum values remain
intentionally constrained because current parsers reject unknown event/status
values.

## Repository layout

```text
schemas/events/v1/       JSON Schema Draft 2020-12 event definitions
contracts/fixtures/v1/   copied verified golden examples
openapi/                  current Bidding REST documentation
asyncapi/                 current RabbitMQ channel documentation
docs/                     ownership, drift, compatibility, and roadmap notes
scripts/                  repository-local validation
```

The three v1 fixtures are copied from the Bidding repository's established
baseline: `BidAccepted`, `AuctionClosed`, and `WinnerSelected`. No fixture was
invented for the three additional schemas because their complete producer
envelope examples have not yet been promoted to canonical baselines.

## Validation

Install the repository-local validator and run the complete check:

```text
npm ci
npm run validate
npm run format:check
```

Validation uses AJV for JSON Schema, Swagger Parser for OpenAPI, and the
AsyncAPI parser for messaging documentation. It does not require PostgreSQL,
RabbitMQ, Redis, or any application repository. Application-side producer and
consumer conformance checks are intentionally deferred to Phase 2.

## Related repositories

- [Laravel React Auction Web](https://github.com/pancakebaker/laravel-react-auction-web)
- [Node.js Live Feed](https://github.com/pancakebaker/nodejs-live-feed)
- [.NET Blazor Operations Portal](https://github.com/pancakebaker/dotnet-blazor-operations-portal)
- [.NET Bidding Service](https://github.com/pancakebaker/dotnet-bidding-service)
- [DBAP Platform Infrastructure](https://github.com/pancakebaker/docker-dbap-platform)
- [Historical integrated monorepo](https://github.com/pancakebaker/distributed-bidding-auction-platform)

## Future direction

Machine-readable schemas, OpenAPI, and AsyncAPI are intended to become the
wire-contract source of truth. Producer domain models remain the business
semantic source of truth, and generated language types are derived artifacts.
Versioned NuGet/npm/Composer packaging and code generation are deliberately
deferred until application conformance is proven.

No license file is currently included. This repository is a contract-foundation
and portfolio artifact, not a complete production governance or deployment
package.
