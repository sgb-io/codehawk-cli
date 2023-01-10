import * as fs from 'fs'
import { analyzeProject, calculateComplexity, generateBadge } from './codehawk'
import { formatResultsAsTable } from './cli-util'

const cwd = process.cwd()
const outputMatchesResult = (projectPath: string): void => {
  const output = analyzeProject(`${cwd}/${projectPath}`)
  expect(output).toBeTruthy()

  const expectedRaw = fs.readFileSync(
    `${cwd}/${projectPath}/expected.json`,
    'utf-8'
  )
  const expected = JSON.parse(expectedRaw)

  expect(expected.fullResultsTree).toEqual(output.fullResultsTree)

  generateBadge(output)
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
      const expectedMetrics: any = {
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
          },
          paramCount: 1,
          sloc: {
            logical: 4,
            physical: 4,
          },
        },
        dependencies: [], // TS removes the lodash dep because it's fake i.e. it resolves to undefined
        errors: [],
        lineEnd: 4,
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

    it('contains-some-bad-code', () => {
      outputMatchesResult('samples/contains-some-bad-code')
    })

    it('sweetalert', () => {
      outputMatchesResult('samples/sweetalert')
    })
  })

  describe('CLI output', () => {
    const logSpy = jest.spyOn(console, 'log')

    // Note: whitespace is important for this test to pass
    const expectedOutputText = `
    Codehawk Static Analysis Results
    Top 25 files

    | File                                               | # of Lines | Times Used/Depended On | Maintainability (higher is better) |
    | -------------------------------------------------- | ---------- | ---------------------- | ---------------------------------- |
    | /samples/sweetalert/webpack.config.js              | 104        | 1                      | 44.91 (Needs improvement)          |
    | /samples/sweetalert/src/modules/options/index.ts   | 143        | 2                      | 46.97 (Needs improvement)          |
    | .../sweetalert/src/modules/options/deprecations.ts | 102        | 3                      | 47.65 (Needs improvement)          |
    | /samples/sweetalert/src/modules/options/buttons.ts | 131        | 8                      | 48.35 (Needs improvement)          |
    | /samples/sweetalert/src/modules/event-listeners.ts | 118        | 2                      | 48.99 (Needs improvement)          |
    | /samples/sweetalert/src/polyfills.js               | 110        | 1                      | 49.61 (Needs improvement)          |
    | /samples/sweetalert/src/modules/init/buttons.ts    | 73         | 3                      | 53.62 (Could be better)            |
    | /samples/sweetalert/src/modules/actions.ts         | 62         | 5                      | 54.41 (Could be better)            |
    | /samples/sweetalert/src/modules/init/content.ts    | 67         | 3                      | 54.73 (Could be better)            |
    | /samples/sweetalert/src/modules/init/modal.ts      | 60         | 7                      | 55.28 (Could be better)            |
    | /samples/sweetalert/src/modules/utils.ts           | 57         | 11                     | 56.08 (Could be better)            |
    | /samples/sweetalert/src/modules/init/icon.ts       | 42         | 3                      | 57.88 (Could be better)            |
    | /samples/sweetalert/src/modules/state.ts           | 47         | 6                      | 57.91 (Could be better)            |
    | /samples/sweetalert/src/modules/markup/icons.ts    | 33         | 7                      | 58.89 (Could be better)            |
    | /samples/sweetalert/src/core.ts                    | 34         | 1                      | 59.8 (Could be better)             |
    | /samples/sweetalert/src/modules/init/text.ts       | 38         | 3                      | 60.21 OK                           |
    | /samples/sweetalert/src/modules/init/index.ts      | 27         | 2                      | 61.93 OK                           |
    | /samples/sweetalert/src/modules/options/content.ts | 23         | 3                      | 64.22 OK                           |
    | ...ples/sweetalert/src/modules/class-list/index.ts | 29         | 14                     | 88.72 OK                           |
    | /samples/sweetalert/postcss.config.js              | 10         | 1                      | 91.08 OK                           |
    | /samples/sweetalert/src/sweetalert.js              | 15         | 1                      | 91.12 OK                           |
    | /samples/sweetalert/src/modules/markup/index.ts    | 22         | 7                      | 91.25 OK                           |
    | /samples/sweetalert/src/modules/markup/buttons.ts  | 21         | 7                      | 91.84 OK                           |
    | /samples/sweetalert/src/modules/init/overlay.ts    | 7          | 3                      | 92.17 OK                           |
    | /samples/sweetalert/src/modules/markup/modal.ts    | 18         | 7                      | 92.31 OK                           |
  `

    it('generates the expected table output', () => {
      const output = analyzeProject(`${cwd}/samples/sweetalert`)
      const formattedAsTable = output.resultsList.slice(0, 25)
      console.log(formatResultsAsTable(formattedAsTable))
      expect(logSpy).toHaveBeenCalledWith(expectedOutputText)
    })
  })
})
