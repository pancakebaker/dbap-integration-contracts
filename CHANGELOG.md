# Changelog

All notable contract changes are recorded here. Published releases are
immutable; changes are classified using [the versioning policy](docs/versioning.md).

## [Unreleased]

Future changes require compatibility review, release metadata updates, and
intentional application snapshot upgrades.

## [1.0.0] - 2026-09-15

- Established the six v1 event schemas and shared envelope.
- Established canonical `BidAccepted`, `AuctionClosed`, and `WinnerSelected`
  fixtures.
- Documented the current Bidding REST surface with OpenAPI 3.1.
- Documented RabbitMQ event channels with AsyncAPI 2.6.
- Added ownership, versioning, release, and application conformance guidance.
- Recorded the validated application baseline for the four active consumers.
