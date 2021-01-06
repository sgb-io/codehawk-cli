# Changelog

As of v8.0.0, changelogs are now automatically generated in the [GitHub Releases page](https://github.com/sgb-io/codehawk-cli/releases).

The legacy (manual) changelog is preserved below.

## Legacy changelog

### 7.1.5

- Removed the npm engine restriction

### 7.1.0

- Adds badges (#53)
- Strengthen build process
- Convert tests to TypeScript (#55)
- Adds the minimum threshold feature (#59)

### 7.0.1

- Add new results API (#49)
- Fix lint and style errors, update CI to ensure lint and style errors can't be merged
- Update CLI output to include longer filepaths and fix the formatting

### 6.1.1

- Allow config to exist in `package.json` instead of `codehawk.json`

### 6.0.3

- Update docs
- Correct some logic around where the CLI is being executed

### 6.0.1

- Fix CLI bash context

### 6.0.0

- Added new CLI top level interface

### 5.0.1

- Correctly exposed types

### 5.0.0

- Updated `calculateComplexity` signature, file extension and typescript/flow flags added

### 4.0.1

- Updated ts and npm config to properly expose types

### 4.0.0

- Added and exposed `calculateComplexity`
- Refactored linting config
- Removed more legacy config and code
- Migrated to Jest
- Fixed coverage

### 3.0.0

- Refactored available options
- Made flow optional and disabled by default
- Added GitHub pipeline config

### 2.0.0

- Removed lots of legacy/dead code that existed in 1.0.0
- Migrated to TypeScript

### 1.0.0

Initial release
