const fs = require('fs')
const {
  analyzeProject,
  calculateComplexity,
  generateBadge,
} = require('../build/codehawk')
const { formatResultsAsTable } = require('../build/cli-util')
const { JsxEmit } = require('typescript')

const cwd = process.cwd()
const outputMatchesResult = (projectPath) => {
  const output = analyzeProject(`${cwd}/${projectPath}`)
  expect(output).toBeTruthy()

  const expectedRaw = fs.readFileSync(`${cwd}/${projectPath}/expected.json`)
  const expected = JSON.parse(expectedRaw)

  expect(output.fullResultsTree).toEqual(expected.fullResultsTree)

  generateBadge(output.summary)
  expect('generateBadge did not throw').toBeTruthy()
}

const STATIC_SAMPLE = `
    import lodash from 'lodash';

    const chunkIntoFives: SomeFakeTypeThatWillGetRemoved = (myArr: Array<any>) => {
        return _.chunk(myArr, 5);
    }

    export default chunkIntoFives;
`

describe('codehawk-cli', () => {
  describe('calculateComplexity', () => {
    it('generates metrics from a static typescript sample', () => {
      const metrics = calculateComplexity(STATIC_SAMPLE, '.ts', true, false)
      const expectedMetrics = {
        aggregate: {
          cyclomatic: 2,
          cyclomaticDensity: 50,
          halstead: {
            bugs: 0.015,
            difficulty: 4.2,
            effort: 188.885,
            length: 13,
            time: 10.494,
            vocabulary: 11,
            volume: 44.973,
            operands: {
              distinct: 5,
              total: 7,
            },
            operators: {
              distinct: 6,
              total: 6,
            },
            time: 10.494,
          },
          paramCount: 1,
          sloc: {
            logical: 4,
            physical: 5,
          },
        },
        dependencies: [], // TS removes the lodash dep because it's fake i.e. it resolves to undefined
        errors: [],
        lineEnd: 5,
        lineStart: 1,
        maintainability: 144.217,
        codehawkScore: 92.43914887804003,
      }

      expect(metrics).toEqual(expectedMetrics)
    })
  })

  describe('analyzeProject', () => {
    it('react-component', () => {
      outputMatchesResult('samples/react-component')
    })

    it('react-component-flow', () => {
      outputMatchesResult('samples/react-component-flow')
    })

    it('simple-class', () => {
      outputMatchesResult('samples/simple-class')
    })

    it('simple-es6-imports', () => {
      outputMatchesResult('samples/simple-es6-imports')
    })

    it('react-component-typescript', () => {
      outputMatchesResult('samples/react-component-typescript')
    })

    it('sweetalert', () => {
      outputMatchesResult('samples/sweetalert')
    })
  })

  describe('CLI output', () => {
    const logSpy = jest.spyOn(console, 'log')

    // Note: whitespace is important for this test to pass
    const expectedOutputText =
`
    Codehawk Static Analysis Results
    Top 25 files

    | File                                               | # of Lines | Times Used/Depended On | Maintainability (higher is better) |
    | -------------------------------------------------- | ---------- | ---------------------- | ---------------------------------- |
    | /samples/sweetalert/webpack.config.js              | 104        | 1                      | 44.91 (Needs improvement)          |
    | /samples/sweetalert/src/modules/options/index.ts   | 150        | 2                      | 46.51 (Needs improvement)          |
    | /samples/sweetalert/src/modules/options/buttons.ts | 150        | 8                      | 47.07 (Needs improvement)          |
    | /samples/sweetalert/src/modules/event-listeners.ts | 141        | 2                      | 47.3 (Needs improvement)           |
    | .../sweetalert/src/modules/options/deprecations.ts | 105        | 3                      | 47.38 (Needs improvement)          |
    | /samples/sweetalert/src/polyfills.js               | 110        | 1                      | 49.61 (Needs improvement)          |
    | /samples/sweetalert/src/modules/init/buttons.ts    | 81         | 3                      | 52.64 (Could be better)            |
    | /samples/sweetalert/src/modules/actions.ts         | 67         | 5                      | 53.68 (Could be better)            |
    | /samples/sweetalert/src/modules/init/content.ts    | 72         | 3                      | 54.05 (Could be better)            |
    | /samples/sweetalert/src/modules/init/modal.ts      | 65         | 7                      | 54.53 (Could be better)            |
    | /samples/sweetalert/src/modules/utils.ts           | 61         | 11                     | 55.43 (Could be better)            |
    | /samples/sweetalert/src/modules/init/icon.ts       | 47         | 3                      | 56.82 (Could be better)            |
    | /samples/sweetalert/src/modules/state.ts           | 51         | 6                      | 57.14 (Could be better)            |
    | /samples/sweetalert/src/modules/markup/icons.ts    | 33         | 7                      | 58.89 (Could be better)            |
    | /samples/sweetalert/src/core.ts                    | 34         | 1                      | 59.8 (Could be better)             |
    | /samples/sweetalert/src/modules/init/text.ts       | 38         | 3                      | 60.21 OK                           |
    | /samples/sweetalert/src/modules/init/index.ts      | 30         | 2                      | 60.93 OK                           |
    | /samples/sweetalert/src/modules/options/content.ts | 27         | 3                      | 62.7 OK                            |
    | ...ples/sweetalert/src/modules/class-list/index.ts | 28         | 14                     | 88.72 OK                           |
    | /samples/sweetalert/postcss.config.js              | 10         | 1                      | 91.08 OK                           |
    | /samples/sweetalert/src/sweetalert.js              | 15         | 1                      | 91.12 OK                           |
    | /samples/sweetalert/src/modules/markup/index.ts    | 22         | 7                      | 91.25 OK                           |
    | /samples/sweetalert/src/modules/markup/buttons.ts  | 21         | 7                      | 91.84 OK                           |
    | /samples/sweetalert/src/modules/init/overlay.ts    | 9          | 3                      | 92.17 OK                           |
    | /samples/sweetalert/src/modules/markup/modal.ts    | 12         | 7                      | 92.31 OK                           |
  `

    it('generates the expected table output', () => {
      const output = analyzeProject(`${cwd}/samples/sweetalert`)
      const formattedAsTable = output.resultsList.slice(0, 25)
      console.log(formatResultsAsTable(formattedAsTable))
      expect(logSpy).toHaveBeenCalledWith(expectedOutputText)
    })
  })
})
