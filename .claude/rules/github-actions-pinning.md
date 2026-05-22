---
description: GitHub Actions version pinning rule
globs:
  - ".github/workflows/**/*.yml"
  - ".github/actions/**/*.yml"
---

# GitHub Actions version pinning rule

## Basic rules

- When referencing an action with `uses:`, pin it to a commit hash (e.g. `@11bd71901bbe5b1630ceea73d27597364c9af683 # v4`) instead of a tag annotation (e.g. `@v4`).
- Always pin to a commit hash to mitigate supply chain attacks.
- Keep the original version tag in a comment (e.g. `# v4`).
- Local/composite actions (`uses: ./.github/actions/...`) are out of scope.

## Procedure when adding or updating a version

1. Get the release date (`published_at`) via `gh api repos/{owner}/{repo}/releases/tags/{tag}`.
2. **Confirm at least 3 days have passed since the release** (releases newer than 3 days are not used, to allow a detection window for supply chain attacks).
3. After confirming, get the SHA via `gh api repos/{owner}/{repo}/git/ref/tags/{tag}` and pin to it.
4. If less than 3 days old, warn the user and use the previous version instead.
