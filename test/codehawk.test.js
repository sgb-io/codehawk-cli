const fs = require('fs')
const { analyzeProject, calculateComplexity, resultsAsTable } = require('../build/codehawk')

const cwd = process.cwd()
const outputMatchesResult = (projectPath) => {
    const output = analyzeProject(`${cwd}/${projectPath}`)
    expect(output).toBeTruthy()

    const expectedRaw = fs.readFileSync(`${cwd}/${projectPath}/expected.json`)
    const expected = JSON.parse(expectedRaw)

    expect(output.fullResultsTree).toEqual(expected.results)

    const asTable = resultsAsTable(output.fullResultsTree);
    console.log(asTable);
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
            const metrics = calculateComplexity(
                STATIC_SAMPLE,
                '.ts',
                true,
                false
            )
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
                            total: 7
                        },
                        operators: {
                            distinct: 6,
                            total: 6
                        },
                        time: 10.494
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
                codehawkScore: 92.43914887804003
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
})
