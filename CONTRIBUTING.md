# How to Contribute

Your contribution is welcome! Please use the [Fork and pull model](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/getting-started/about-collaborative-development-models#fork-and-pull-model).

For a more concrete example please see [Creating a pull request from a fork](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request-from-a-fork)

## Contribute to the Code

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

## Contribute to the Documentation

The documentation is done using [Material for MkDocs](https://squidfunk.github.io/mkdocs-material/).

### Prerequisites

- Python 3.11
- [`pipenv`](https://pipenv.pypa.io/en/latest/)

### Editor Tools

- use [EditorConfig plugin](https://editorconfig.org/#download)
- use [Prettier](https://prettier.io/docs/en/editors.html) and enable the option `Format On Save`

### Quickstart

- install from the Pipfile `pipenv install`
- activate the environment `pipenv shell`
- start MkDocs built-in dev-server and enable the warnings `mkdocs serve --strict`

Please see above the [Coding Guidelines](#coding-guidelines).
