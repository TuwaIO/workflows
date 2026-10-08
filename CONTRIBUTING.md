# Contributing to TUWA

First and foremost, thank you for considering contributing to the TUWA ecosystem! We welcome any help, from reporting a bug to submitting a pull request for a new feature. Open source is built by people like you, and we're grateful for your support.

## Table of Contents
- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
    - [Reporting Bugs](#reporting-bugs)
    - [Suggesting Enhancements](#suggesting-enhancements)
    - [Submitting Pull Requests](#submitting-pull-requests)
- [Security Issues](#security-issues)
- [Questions](#questions)
- [General Development Workflow](#general-development-workflow)
- [Pull Request Process](#pull-request-process)

## Code of Conduct

All TUWA projects and everyone participating in them are governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Bugs are best reported directly on the GitHub repository of the specific project you are using.

1.  Go to the repository of the project (e.g., `TuwaIO/pulsar-core`).
2.  Navigate to the **"Issues"** tab.
3.  Check if a similar bug has already been reported.
4.  If not, click **"New Issue"** and choose the **"Bug Report"** template. Please provide as much detail as possible to help us reproduce and fix the issue.

### Suggesting Enhancements

Have an idea for a new feature or an improvement? We'd love to hear it!

1.  Go to the repository of the relevant project.
2.  Navigate to the **"Issues"** tab.
3.  Click **"New Issue"** and choose the **"Feature Request"** template.
4.  Clearly describe your suggestion, including the problem it solves and why it would be valuable.

### Submitting Pull Requests

We love pull requests! If you're ready to contribute code, please follow the general workflow and process outlined below.

## Security Issues

Please **do not open a public issue** for a vulnerability. Email [security@tuwa.io](mailto:security@tuwa.io) with the affected package or service, its version, the steps to reproduce it and the impact you see. You will get a reply there, and the fix is published before the details are.

## Questions

For questions about using TUWA, read the [documentation](https://docs.tuwa.io) first, then ask on [Discord](https://discord.gg/9dN8tkTk7u) or [Telegram](https://t.me/tuwa_io). Issues are for bugs, feature requests and documentation problems.

## General Development Workflow

Because our ecosystem consists of multiple projects, the specific setup steps (like installing dependencies or running the project) can vary. **Always refer to the `README.md` file of the specific repository you are working on for detailed setup instructions.** The `AGENTS.md` of each repository describes its stack, its structure and the checks to run before a pull request (the same rules apply to people and to AI coding agents).

The general workflow, however, is consistent:

1.  **Fork the repository** of the project you want to contribute to on GitHub.
2.  **Clone your fork** to your local machine:
    ```bash
    git clone https://github.com/YOUR_USERNAME/[repository-name].git
    cd [repository-name]
    ```
3.  **Follow the setup instructions** in that project's `README.md` to install dependencies (e.g., using `pnpm install`).

## Pull Request Process

1.  **Create a new branch** from the `main` branch. Please use a descriptive name that follows the `type/scope` convention (e.g., `feat/new-button`, `fix/login-bug`).
    ```bash
    git checkout -b feat/my-amazing-feature
    ```
2.  **Make your changes** in the code.
3.  **Run the checks of the repository.** Every repository has lint and format scripts, and most have tests and a build; its `AGENTS.md` lists what to run.
    ```bash
    # Example commands, check the specific repo's package.json and AGENTS.md
    pnpm lint
    pnpm format
    pnpm test
    pnpm build
    ```
4.  **Commit your changes.** We follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification. This is mandatory as it helps us automate releases and generate changelogs.

    A good commit message looks like this:
    ```bash
    feat(ui): add retry button to TrackingTxModal
    ```
    Common types include: `feat`, `fix`, `docs`, `chore`. `release-please` reads them: in a `0.x` package a `feat` releases a minor version and a `fix` a patch version, while `docs` and `chore` release nothing.

5.  **Push your branch** to your fork on GitHub:
    ```bash
    git push origin feat/my-amazing-feature
    ```
6.  **Open a Pull Request** to the `main` branch of the original TUWA repository you forked from.
7.  Provide a clear title and a detailed description for your Pull Request, linking to any relevant issues (e.g., "Closes #123").

Thank you again for your contribution!