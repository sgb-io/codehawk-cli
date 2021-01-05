# Contributing

This project is small and in it's infancy so any help is appreciated. Please feel free to approach me with any suggestions, ideas or feedback. Please use the GitHub issues for your requests.

As the project grows, these guidelines may evolve.

## Getting Started

Codehawk-cli is a pure Node.JS program. All you need to develop the project is

- Node.js v10+ (v14 recommended)
- Git (no specific version required but v2+ is recommended)
- Yarn (v1 recommended, v2 currently untested)

```bash
git clone git@github.com:sgb-io/codehawk-cli.git
cd codehawk-cli
yarn
```

There are a few ways to interact with codehawk in development.

1. **Recommended**: In local development, it is helpful to have the tests running via `yarn test:watch`. With this approach, you can make changes and see their affect in realtime against the set of tests. In this scenario, the top level CLI interface is skipped, and you are interacting with the API programatically.

2. You can call the CLI manually:

```bash
# Build the project and execute the output
yarn build
node build/index.js example-src-dir
```

3. You can `yarn link` or `npm link` the project to a project you want to scan, but it is up to you to ensure you run `yarn build` - as the CLI is the main interface exposed via the `build` dir. In other words, you could link, make changes, then forget to run `yarn build`, meaning you will not see your latest changes reflected.

## Windows and nix support

The project should continue to work correctly on popular linux distributions but also Windows. Both types of operating systems are equally important with regards to the project.

In most cases, compatibility is trivial because the project has no system dependencies beyond Node.JS, however there is compatibility code with regards to file/directory paths etc.

## CI

The project makes use of GitHub actions as a CI provider. The CI is designed to assist with validating PR changesets and protect against mistakes.

The CI currently runs these steps:

```yaml
- run: yarn # install dependencies
- run: yarn build # build the project into the `build` dir
- run: yarn reflect # runs codehawk against itself and generates the latest badges
- run: yarn isclean # checks for any un-staged changes, e.g. out-of-date badges not added to git
- run: yarn lint # ensures the changeset satisfies the linting rules
- run: yarn prettier # ensures the changeset satisfies the required code style
- run: yarn test # ensures that all tests pass
```

A note on `reflect`: this should be run before opening a pull request, as it will cause codehawk to run against itself, resulting in new maintainability badges. In PRs where there has been no material change to code in `src`, there should be no changes to the badges.

Note: the badges for codehawk-cli are tracked in git because

- The badges are generated against summary output data, which is currently generated on-the-fly and not tracked in git
- There is currently no 3rd party API that can fetch codehawk results remotely
- There are no plans to expose codehawk results outside of a project

## Releasing new versions

Note: currently, only the project owner (sgb-io) has access to publish new versions to npm.

The instructions to publish a release are:

- Update the changelog (this is done manually) via a PR
- Run `yarn run tag:{patch|minor|major}`. This creates a git tag.
- Push up the result straight to master
- The GitHub action should publish to npm.

## Support

Contact the lead maintainer on GitHub via the issues, or on twitter (@sgb_io).
