# TUWA Workflows & Community Standards

<div align="center">
  <img src="https://raw.githubusercontent.com/TuwaIO/workflows/main/preview/tuwa_preview.gif" alt="TUWA Preview Demo" width="100%" max-width="800px" />
</div>

## About This Repository

This repository is the single source of truth for CI/CD automation and community standards across the entire TUWA ecosystem. Its purpose is to centralize logic, enforce consistency, and make it easy to manage and update development processes for all projects.

By using the reusable components from this repository, we follow the **DRY (Don't Repeat Yourself)** principle, saving time and reducing errors.

---

## What's Inside?

* **`TUWA_AGENTS.md`**: Master Integration Standard and Single Source of Truth for building dApps and configuring AI agents across the TUWA ecosystem.
* **`.github/workflows/`**: Reusable GitHub Actions workflows for automated alpha releases and stable NPM package publishing.
* **`EMAIL_ROUTING.md`**: Centralized email routing manifest establishing official contact addresses under the `@tuwa.io` domain.
* **`Donation.md`**: Multi-chain cryptocurrency donation manifest supporting open-source development.
* **`CONTRIBUTING.md` & `CODE_OF_CONDUCT.md`**: Universal community standards, code guidelines, and PR procedures.
* **`docs/`**: Official legal policies (Privacy Policy, Terms of Service, Cookie Policy) with automated headless PDF generation tooling.
* **`preview/`**: Shared ecosystem visual assets, logos, and architecture diagrams.

---

## Available Workflows

Here is a list of the reusable workflows available in this repository:

| Workflow File | Description |
|---|---|
| `reusable-alpha-release.yml` | Publishes an alpha version to NPM. Triggered by pushes to `dev`, `fix`, and `feat` branches. |
| `reusable-stable-publish.yml`| Publishes a stable version to NPM after a release is created by `release-please`. |

---

## How to Use

### Using Reusable Workflows

To use a workflow from this repository, you call it from a workflow file in your own project using the `uses` keyword.

**Example:** To implement the alpha release process, create a `.github/workflows/alpha-release.yml` file in your project with the following content:

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
    # This line calls the reusable workflow
    uses: TuwaIO/workflows/.github/workflows/reusable-alpha-release.yml@main

    # This line is crucial for passing secrets like GITHUB_TOKEN and NPM_TOKEN
    secrets: inherit
```

**Note on Versioning:** The `@main` at the end of the `uses` path means you will always use the latest version from the `main` branch. For production stability, it is recommended to pin to a specific version tag, like `@v1.0.0`, once you create releases in this repository.

### Linking to Community Files

Instead of duplicating `CONTRIBUTING.md` in every repository, you can create a small file in your project that links here.

**Example `CONTRIBUTING.md` in your project:**

```markdown
# Contribution Guidelines

This project follows the central TUWA contribution guidelines. Please read them here:
[TUWA Contribution Guidelines](https://github.com/TuwaIO/workflows/blob/main/CONTRIBUTING.md)
```