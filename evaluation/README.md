# Phase 4 Evaluation Materials

Phase 4 uses temporary, pinned generator experiments against the canonical
`v1.0.0` schemas. Generated output is intentionally not committed as production
code and is not consumed by any application.

Representative commands:

```text
npx --yes quicktype@23.2.6 --lang csharp --src-lang json --src contracts/fixtures/v1/auction-bid-accepted.json -o BidAccepted.cs
npx --yes json-schema-to-typescript@15.0.4 schemas/events/v1/bid-accepted.schema.json -o BidAccepted.ts
```

The C# experiment produced a 94-line Newtonsoft.Json model from a fixture. The
TypeScript experiment exposed the need for deliberate bundling/dereferencing of
the canonical draft-2020-12 URN references. These results, the PHP/OpenAPI
assessment, scoring, and adoption recommendation are recorded in
`docs/codegen-evaluation.md`.
