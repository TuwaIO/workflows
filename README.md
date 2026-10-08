# TUWA Workflows & Community Standards

<div align="center">
  <img src="https://raw.githubusercontent.com/TuwaIO/workflows/main/preview/tuwa_preview.gif" alt="TUWA preview: wallet connection, sign-in and transaction tracking" width="100%" />
</div>

## About This Repository

The shared CI/CD workflows, community guidelines, legal documents and brand assets of every TUWA repository. Projects call the workflows from here instead of copying them, so a fix to the release process lands everywhere at once.

---

## What's Inside?

* **`TUWA_AGENTS.md`**: the integration guide for AI coding agents that build apps with TUWA: packages, setup and the rules that keep generated code correct.
* **`.github/workflows/`**: reusable GitHub Actions workflows that publish alpha and stable versions of the `@tuwaio` packages to npm.
* **`CONTRIBUTING.md` & `CODE_OF_CONDUCT.md`**: how to report bugs, suggest features and open pull requests in any TUWA repository.
* **`EMAIL_ROUTING.md`**: the official `@tuwa.io` contact addresses and where each one is used.
* **`Donation.md`**: how to support TUWA with a crypto donation.
* **`docs/`**: the Privacy Policy, Terms of Service and Cookie Policy, with the script that renders them to PDF.
* **`preview/`**: logos, preview images and the posts used across the TUWA sites and social accounts.

---

## Available Workflows

| Workflow File | Description |
|---|---|
| `reusable-alpha-release.yml` | Publishes an alpha version of the changed packages with `semantic-release`. The calling repository runs it on pushes to its `dev/**`, `fix/**` and `feat/**` branches and provides `alpha.release.config.js`. |
| `reusable-stable-publish.yml` | Publishes the stable versions of the `@tuwaio/*` packages after `release-please` creates a release on `main`. |

Both workflows publish with **npm trusted publishing** (OIDC) and provenance: there is no `NPM_TOKEN` secret, the calling job grants `id-token: write`, and each package is set up on npm for trusted publishing from its repository.

---

## How to Use

### Alpha releases

Create `.github/workflows/alpha-release.yml` in your project:

```yaml
name: Alpha Release

on:
  push:
    branches:
      - 'dev/**'
      - 'fix/**'
      - 'feat/**'

jobs:
  call-alpha-release:
    permissions:
      id-token: write
      contents: write
      issues: write
      pull-requests: write
    uses: TuwaIO/workflows/.github/workflows/reusable-alpha-release.yml@main
    secrets: inherit
```

### Stable releases

Run `release-please` on `main` and call the publish workflow when it creates a release:

```yaml
name: Release Please & Publish

on:
  push:
    branches:
      - main

permissions:
  contents: write
  pull-requests: write
  issues: write

jobs:
  release-please:
    runs-on: ubuntu-latest
    outputs:
      releases_created: ${{ steps.release.outputs.releases_created }}
    steps:
      - uses: googleapis/release-please-action@v4
        id: release
        with:
          config-file: release-please-config.json
          manifest-file: .release-please-manifest.json
          include-component-in-tag: true

  call-stable-publish:
    needs: release-please
    if: ${{ needs.release-please.outputs.releases_created == 'true' }}
    permissions:
      id-token: write
      contents: write
    uses: TuwaIO/workflows/.github/workflows/reusable-stable-publish.yml@main
    secrets: inherit
```

`@main` always uses the latest version of a workflow. This repository has no release tags yet; pin a commit SHA instead of `@main` if a project needs a frozen version.

### Linking to Community Files

Instead of copying `CONTRIBUTING.md` into every repository, add a short file that links here:

```markdown
# Contribution Guidelines

This project follows the central TUWA contribution guidelines. Please read them here:
[TUWA Contribution Guidelines](https://github.com/TuwaIO/workflows/blob/main/CONTRIBUTING.md)
```

The issue templates and the Code of Conduct of every repository come from [`TuwaIO/.github`](https://github.com/TuwaIO/.github).
