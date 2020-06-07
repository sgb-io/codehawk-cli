# Codehawk CLI

Codehawk is a static analysis tool for JavaScript projects. It is intended as a warning system, to identify complex areas of code that need special attention by developers.

![Codehawk.app](codehawk-logo.png "Codehawk")

The CLI tool provides low level static analysis, check out [codehawk.app](https://codehawk.app) to use Codehawk quickly and get enhanced features such as Risk Factor & viz tools.

JavaScript, TypeScript and Flow projects are supported for analysis. The CLI tool supports unix and windows filesystems (there is a reasonable amount of Windows compatibility code). It works by traversing a directory and discovering all supported filetypes, runs a static analysis routine on each file, then performs project-wide analysis such as inter-dependency counting and test coverage mapping.

Each analyzed file in your project ends up with:

- `codehawkScore` - A Codehawk score which represents it's estimated level of maintainability (0-100, higher is better)
- `dependencies` - a map of this file's dependecies
- `timesDependedOn` - number of times this file is imported by other files
- `complexityReport` - various detailed complexity metrics such as halstead metrics and cyclomatic complexity

The CLI runs as a Node.js process. Node.js >=12 is recommended, but >=10 should also work. <10 is unsupported.

Codehawk depends on `typhonjs-escomplex` for low level complexity metrics.

Flow is supported via `flow-remove-types` and typescript is supported via `@babel/plugin-transform-typescript`. In other words, it transforms any flow or TypeScript code into JavaScript code before static analysis is carried out.

## Usage

```javascript
const codehawk = require('codehawk-cli')

const output = codehawk.analyzeProject('/path/to/project')
// Do stuff with output!
```

## Options

To customise your analysis, use the following options, placed in a `codehawk.json` file in the root directory.

| Option               | Description                                                                                                                                                                                                                              | Default                                         |
|----------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------|
| `extensions`         | File extensions that should be analyzed. The default is always used, but you can add more extensions. Use the `exclude` option to skip any of the default extensions.                                                                    | `['.js', '.jsx', '.ts', '.tsx']`                |
| `excludeFilenames`   | Filename matches that should be excluded from analysis. The default is always used, but you can add more matches to be excluded. Note that the matching is exact. The exclude list is taken into consideration after the extension list. | `['.d.ts', '.min.js', '.bundle.js']`            |
| `excludeDirectories` | Directory matches that should be excluded from analysis. Relative to the root. E.g. `['/fixtures', '/test']`                                                                                                                             | `['/dist', '/bin', '/build']`                   |
| `skipDirectories`    | Directories that should be excluded completely. The defaults will always be skipped.                                                                                                                                                     | `['/node_modules', '/flow-typed', '/coverage']` |

## Complexity Metrics

Codehawk gathers various complexity metrics, including:

- *Lines of code*: Both physical (the number of lines in a module or function) and logical (a count of the imperative statements). A crude measure.
- *Number of parameters*: Analysed statically from the function signature, so no accounting is made for functions that rely on the arguments object. Lower is better.
- *Cyclomatic complexity*: Defined by Thomas J. McCabe in 1976, this is a count of the number of cycles in the program flow control graph. Effectively the number of distinct paths through a block of code. Lower is better.
- *Cyclomatic complexity density*: Proposed as a modification to cyclomatic complexity by Geoffrey K. Gill and Chris F. Kemerer in 1991, this metric simply re-expresses it as a percentage of the logical lines of code. Lower is better.
- *Halstead metrics*: Defined by Maurice Halstead in 1977, these metrics are calculated from the numbers of operators and operands in each function. Lower is better.
- *Maintainability index*: Defined by Paul Oman & Jack Hagemeister in 1991, this is a logarithmic scale from negative infinity to 171, calculated from the logical lines of code, the cyclomatix complexity and the Halstead effort. Higher is better.

## Caveats

- Not optimized for production. The project should be considered experimental and slow.
    - Will not run quickly on large projects, so use caution and common sense when applying it to a workflow or pipeline.
    - Recursively traverses directory trees, so if one activates the process inside a node_modules or C drive directory (unintended usage), you are likely to experience problems.
- Opinionated: the formula for calculating overall file "scores" is arbitrary and based on original, unpublished research. Users are free to interpret the numbers differently and generate their own scorings.
- Internal quality needs improvement: I envision moving the source to TypeScript if there is user interest. The tests are also rudimentary and difficult to maintain.
- `codehawk.json` configuration files are currently required. However, they can be empty.

## Testing and Samples

"Samples" contains 4 fake and 1 real project for the purposes of testing the cli tool.

Sweetalert in this directory is a static export (carried out in 2019) of that library.

Each sample conatins an empty `codehawk.json` configuration file (at present, this config)

## Known Issues

Non-latin (or certain unicode?) characters such as \u2019 confuse `flow-remove-types`, see https://github.com/facebook/flow/issues/8060