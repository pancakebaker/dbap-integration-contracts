# Application contract upgrades

Applications use repository-local snapshots for deterministic conformance;
normal builds do not require a sibling contract checkout or network access.

1. Select a published canonical release and exact commit.
2. Copy only the required schemas, fixtures, or OpenAPI document into the
   application's test-only contract directory.
3. Update its provenance file with repository, release tag, commit, and scope.
4. Run the application's conformance and normal validation suites.
5. Commit and push the application independently; wait for its CI to pass.
6. Deploy or roll back the application according to its normal release process.

Do not consume floating `main`, `latest`, or runtime files from this repository.
No application is updated automatically when a contract release is published.
