# Contributing to the TUWA Web3 Transaction Tracking Suite

First off, thank you for considering contributing! We welcome any help, from reporting a bug to submitting a pull request for a new feature. This project and everyone involved in it are grateful for your support.

## Table of Contents
- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
    - [Reporting Bugs](#reporting-bugs)
    - [Suggesting Enhancements](#suggesting-enhancements)
    - [Submitting Pull Requests](#submitting-pull-requests)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior.

## How Can I Contribute?

### Reporting Bugs

If you encounter a bug, please help us by submitting an issue. Before creating a new issue, please check the existing issues to see if your problem has already been reported.

When you are creating a bug report, please use the **[🐞 Bug Report](https://github.com/TuwaIO/web3-transactions-tracking/issues/new?assignees=&labels=bug%2C+triage&projects=&template=bug_report.md)** template and include as many details as possible.

### Suggesting Enhancements

If you have an idea for a new feature or an improvement to an existing one, we'd love to hear about it. Please use the **[✨ Feature Request](https://github.com/TuwaIO/web3-transactions-tracking/issues/new?assignees=&labels=enhancement%2C+feature&projects=&template=feature_request.md)** template to outline your suggestion.

### Submitting Pull Requests

We love pull requests! If you're looking to contribute code, please follow the process outlined below.

## Development Setup

To get the project running on your local machine for development and testing purposes, follow these steps:

1.  **Fork the repository** on GitHub.
2.  **Clone your fork** to your local machine:
    ```bash
    git clone [https://github.com/YOUR_USERNAME/web3-transactions-tracking.git](https://github.com/YOUR_USERNAME/web3-transactions-tracking.git)
    cd web3-transactions-tracking
    ```
3.  **Install dependencies** using `pnpm`:
    ```bash
    pnpm install
    ```
4.  You can now run the apps locally (e.g., the docs site) to test your changes:
    ```bash
    pnpm --filter docs dev
    ```

## Pull Request Process

1.  **Create a new branch** for your feature or bug fix. Please use a descriptive name.
    ```bash
    git checkout -b feature/my-amazing-feature
    ```
2.  **Make your changes** in the code.
3.  **Lint and format your code** before committing to ensure it meets our style guidelines.
    ```bash
    pnpm format
    pnpm lint
    ```
4.  **Commit your changes.** We follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification. This helps us automate releases and generate changelogs. A good commit message looks like this:
    ```bash
    feat(ui): Add retry button to TrackingTxModal
    ```
5.  **Push your branch** to your fork on GitHub:
    ```bash
    git push origin feat/my-amazing-feature
    ```
6.  **Open a Pull Request** to the `main` branch of the `TuwaIO/web3-transactions-tracking` repository.
7.  Provide a clear title and description for your Pull Request, linking to any relevant issues.

Thank you again for your contribution!