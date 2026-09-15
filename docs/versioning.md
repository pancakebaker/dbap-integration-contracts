# Contract versioning and compatibility

The repository version describes the complete externally consumed contract set:
event schemas and envelope, fixtures, OpenAPI, and AsyncAPI. It is separate
from an event's `aggregateVersion`, which orders transitions within one
aggregate.

## Semantic versioning

- **MAJOR:** remove or rename an event or field, make an optional field
  required, change a field type or money representation, narrow an enum,
  change timestamp or UUID semantics, change a routing key, remove an endpoint,
  change an HTTP method, remove a documented response status, or change
  authentication claims/semantics incompatibly.
- **MINOR:** add a new event, endpoint, optional field, compatible response
  property, or supporting documentation. An enum addition is review-required
  and may be breaking for strict consumers.
- **PATCH:** correct documentation, metadata, tooling, or an example without
  changing wire semantics. A semantic correction is not automatically a patch.

The same classification applies across JSON Schema, OpenAPI, and AsyncAPI.
Existing event names, routing keys, envelope fields, endpoint methods, and
documented status behavior are compatibility commitments.

## Compatibility rules

Published schemas and fixtures are immutable. Additive unknown JSON properties
are currently tolerated, but required fields, known enum values, numeric money
representation, ISO-8601 UTC timestamps, and UUID/GUID string shape remain
contractual. Distinct companion events may share one `aggregateVersion`.

Security changes are contract changes even when the HTTP shape is unchanged:
required JWT claims, service-token validation, client assertion admission, and
tenant-binding semantics require compatibility review.

The repository compatibility check detects high-confidence removals and
incompatible changes. It is a review aid, not a complete semantic proof.
Possible breaking changes fail validation; compatible additions still require
an intentional version and changelog update.

## Published releases

Official releases use immutable annotated tags such as `v1.0.0`. Never move or
overwrite a published tag. A defective release remains historically addressable
and is superseded by a new patch or major release. Applications pin exact
commits; rollback means restoring a previous pin and redeploying after tests.
