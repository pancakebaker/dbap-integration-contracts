# Contract release process

Bidding is the semantic authority for auction, bid, tenant, lifecycle, winner,
and final-price meaning. This repository is the compatibility description for
the wire surfaces. Consumers own local parsing, projection, persistence, and
presentation.

1. Make the smallest contract change and classify it as MAJOR, MINOR, or PATCH.
2. Update schemas or API documents, `CHANGELOG.md`, release notes, and
   `contracts-release.json` together.
3. Run `npm run release:check` and review compatibility output.
4. Run affected application conformance checks and obtain consumer review.
5. Merge and push `main`; do not release from an unvalidated local-only commit.
6. Create an annotated immutable tag, for example
   `git tag -a v1.0.1 -m "DBAP Integration Contracts v1.0.1"`.
7. Push only that tag and verify tag CI and release metadata.
8. Create GitHub release notes if desired, using the committed release notes as
   the source.
9. Have applications intentionally update their exact SHA pins and deploy
   independently.

Never move a published tag. A bad release is superseded by a new version; it
may be marked deprecated in release notes, but its tag remains immutable.
Applications can roll back by restoring a previously validated SHA snapshot.
There is no automatic consumer pin-update bot.
