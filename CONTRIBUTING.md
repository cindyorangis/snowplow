# Contributing Guide

Thank you for contributing! This document outlines the conventions and workflows for this project. Please read it before opening issues or submitting pull requests.

---

## Table of Contents

- [Getting Started](#getting-started)
- [Branching](#branching)
- [Commits](#commits)
- [Issues](#issues)
- [Pull Requests](#pull-requests)
- [Code Review](#code-review)
- [Environment & Setup](#environment--setup)

---

## Getting Started

1. Fork or clone the repository
2. Create a new branch from `main` (see [Branching](#branching))
3. Make your changes
4. Open a pull request against `main`

Never commit directly to `main` or `staging`.

---

## Branching

Branch names follow the format:

```
type/issue-id-short-description
```

### Prefixes

| Prefix      | When to use                                |
| ----------- | ------------------------------------------ |
| `feature/`  | New functionality                          |
| `fix/`      | Bug fixes                                  |
| `hotfix/`   | Urgent production fixes                    |
| `chore/`    | Maintenance, dependencies, config          |
| `docs/`     | Documentation only                         |
| `refactor/` | Code restructuring without behavior change |
| `test/`     | Adding or fixing tests                     |
| `release/`  | Release preparation                        |

### Examples

```
feature/42-crew-scheduling-page
fix/87-login-redirect-loop
hotfix/payment-null-pointer
chore/upgrade-terraform-1-8
release/v2.1.0
```

### Rules

- Lowercase only
- Hyphens, not underscores or spaces
- Include the issue ID when one exists
- Keep it short but descriptive

---

## Commits

Follow the [Conventional Commits](https://www.conventionalcommits.org/) format:

```
type(scope): short description
```

### Types

`feat` · `fix` · `chore` · `docs` · `refactor` · `test` · `style` · `ci`

### Scopes (optional but recommended)

Use the app or module name: `admin`, `client`, `crew`, `api`, `db`, `ci`, `infra`

### Examples

```
feat(crew): add job assignment modal
fix(api): resolve null pointer on empty payload
chore(infra): upgrade Terraform to 1.8
docs: update deployment environment guide
ci: add staging deploy step to GitHub Actions
```

### Rules

- Use imperative mood: _"add"_ not _"added"_ or _"adding"_
- Keep the subject line under 72 characters
- Add a body if the change needs context or explanation
- Reference issues in the footer: `Closes #42` or `Refs #88`

---

## Issues

Use a clear title with a type prefix:

```
[Type] Short description of the problem or request
```

### Types

| Label    | Format           | Example                                         |
| -------- | ---------------- | ----------------------------------------------- |
| Bug      | `[Bug] ...`      | `[Bug] Crew app crashes on job accept`          |
| Feature  | `[Feature] ...`  | `[Feature] Add CSV export to admin dashboard`   |
| Chore    | `[Chore] ...`    | `[Chore] Rotate staging DB credentials`         |
| Docs     | `[Docs] ...`     | `[Docs] Document subdomain staging conventions` |
| Question | `[Question] ...` | `[Question] Should crew and client share auth?` |

### Bug Reports

Please include:

- Steps to reproduce
- Expected vs actual behavior
- Environment (app, browser/OS, staging/prod)
- Screenshots or logs if applicable

### Feature Requests

Please include:

- The problem you're solving
- Your proposed solution
- Any alternatives you considered

---

## Pull Requests

### Title Format

```
[Type] Brief description of the change (#issue-id)
```

**Examples:**

```
[Feature] Add crew job assignment modal (#42)
[Fix] Resolve login redirect loop (#87)
[Chore] Upgrade Node.js to 20 LTS
[Hotfix] Patch null pointer in payment handler
```

### Rules

- Title under ~72 characters
- Imperative mood: _"Add"_ not _"Added"_
- Always reference the related issue: `Closes #42`
- Keep PRs focused — one concern per PR
- Add screenshots for UI changes
- Make sure CI passes before requesting review

### PR Description Template

```markdown
## What

Brief summary of what this PR does.

## Why

Context or motivation. Link to the issue.

## How

Any notable implementation details or decisions made.

## Testing

How you tested the change (manual steps, test cases, etc).

## Screenshots (if applicable)

Closes #
```

---

## Code Review

- Reviews are required before merging to `main`
- Be specific, constructive, and kind in feedback
- Distinguish between blocking issues and suggestions (e.g. prefix non-blocking comments with `nit:`)
- Authors should respond to all comments before merging
- Approve only when you're confident the change is ready

---

## Environment & Setup

Refer to the [README](./README.md) for local setup instructions.

### Staging Environments

Staging branches follow the subdomain convention:

```
staging/<feature-name>  →  feature-name.staging.yourdomain.com
```

Do not merge staging branches directly into `main`. Open a PR from your feature branch.

### Environment Variables

- Never commit secrets or `.env` files
- Use `.env.example` as a template
- Store secrets in the appropriate secrets manager for your environment
