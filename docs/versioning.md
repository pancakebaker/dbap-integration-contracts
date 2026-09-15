# Contract versioning

This repository describes wire contracts independently from the producer
domain models and consumer projections. The schema/API document version is
not the same thing as an event `aggregateVersion`.

Semantic-versioning guidance for future releases:

- **Patch:** documentation, validator, or example corrections with no wire change.
- **Minor:** additive compatible fields, event types, or routing documentation.
- **Major:** removed or renamed fields/events, changed meaning or type, changed
  routing keys, or other incompatible wire behavior.

Versioned fixtures are compatibility baselines. Once published, treat a v1
fixture as immutable. A semantic correction normally requires a new version or
an explicitly coordinated compatibility decision rather than silently editing
the old baseline.

Adding an optional field is compatible only when existing consumers tolerate
unknown fields. Required-field additions, field removal, enum narrowing,
numeric representation changes, endpoint path changes, and routing-key changes
require coordinated migration. Unknown enum values are not assumed to be
forward compatible because current TypeScript parsers validate known values.

Deprecation requires a compatible replacement, a documented migration window,
and removal only in a breaking major version. No version tags or deprecations
are created by Phase 1.
