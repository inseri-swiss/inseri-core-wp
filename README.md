# Inseri Core for WordPress

[![License](https://img.shields.io/github/license/inseri-swiss/inseri-core-wp)](https://github.com/inseri-swiss/inseri-core-wp/blob/main/LICENSE)

## Development

### Prerequisites

- Node.js (our recommendation: [nvm](https://github.com/nvm-sh/nvm))
- docker

### Editor Tools

- use [EditorConfig plugin](https://editorconfig.org/#download)
- use [Prettier](https://prettier.io/docs/en/editors.html) and enable the option `Format On Save`

### Quickstart

- switch to project's node version `nvm use`
- install dependencies `npm ci`
- start wp dev environment `npx wp-env start`
- start dev server `npx wp-env start`

## Coding Guidelines

### Commit Message Format

Each commit message must conform to [Conventional Commits spec](https://www.conventionalcommits.org/en/v1.0.0/). A message must be structured as follows:

```
<type>(<optional scope>): <description>
```

example

```
docs: correct spelling of README
```

### Type

Must be one of the following:

- **build**: Changes that affect the build system or external dependencies
- **ci**: Changes to our CI configuration files
- **docs**: Documentation changes
- **feat**: A new feature
- **fix**: A bug fix
- **perf**: A code change that improves performance
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
- **test**: Adding missing tests or correcting existing tests
- **chore**: Other changes that don't modify src or test files
- **revert**: Reverts a previous commit
