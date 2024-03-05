<p align="center"><a href="https://inseri.swiss/"><img src="https://raw.githubusercontent.com/inseri-swiss/inseri-core-wp/8820531f0db87ca285b11e05af40453b48e29ee8/docs/assets/inseri_logo.svg" alt="Logo" height=120></a>
</p>
<h1 align="center">inseri core <sup>beta</sup></h1>

<p align="center">Scientific and interactive Gutenberg Blocks for WordPress</p>

<p align="center">
<img alt="CI workflow" src="https://github.com/inseri-swiss/inseri-core-wp/actions/workflows/ci.yml/badge.svg" />
<a href="https://wordpress.org/plugins/inseri-core/"><img src="https://img.shields.io/wordpress/plugin/v/inseri-core?label=get%20wp%20plugin" alt="plugin"></a>
<a href="https://inseri.swiss/playground/"><img src="https://img.shields.io/badge/wp-playground-blue" alt="playground"></a>
<a href="https://docs.inseri.swiss/"><img src="https://img.shields.io/badge/read-documentation-blue" alt="documentation"></a>
<a href="https://github.com/inseri-swiss/inseri-swiss/discussions"><img src="https://img.shields.io/github/discussions/inseri-swiss/inseri-swiss" alt="discussions"></a>
<a href="https://github.com/inseri-swiss/inseri-swiss/issues"><img src="https://img.shields.io/github/issues-raw/inseri-swiss/inseri-swiss?color=blue" alt="issues"></a>
<a href="https://inseri.swiss/about/#roadmap"><img src="https://img.shields.io/badge/view-roadmap-blue" alt="roadmap"></a>
</p>

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
- start dev server `npm start`

## Coding Guidelines

### Commit Message Format

Each commit message must conform to [Conventional Commits spec](https://www.conventionalcommits.org/en/v1.0.0/). A message must be structured as follows:

```
<type>(<scope>): <short summary>
```

- The `type` and `short summary` are mandatory
- The `scope` is optional
- The `short summary` must be in present tense

example

```
docs: correct spelling of README
```

#### Type

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

### Branch Naming

A branch name should be composed as follows:

```
<type>/<description>
```

example

```
feat/add-blue-button
```

#### Recommended Types

- **feat**: Adds features or general changes
- **bugfix**: Fixes a bug
- **release**: Maintains a specific release version
- **wip**: unknown, when it will be completed
