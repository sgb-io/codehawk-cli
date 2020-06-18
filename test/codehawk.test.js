const fs = require('fs')
const { analyzeProject, addComplexity } = require('../build/codehawk')

const cwd = process.cwd()
const outputMatchesResult = (projectPath) => {
    const output = analyzeProject(`${cwd}/${projectPath}`)
    expect(output).toBeTruthy()

    const expectedRaw = fs.readFileSync(`${cwd}/${projectPath}/expected.json`)
    const expected = JSON.parse(expectedRaw)

    expect(output.results).toEqual(expected.results)
}

const STATIC_SAMPLE = `
    import lodash from 'lodash';

    const chunkIntoFives = (myArr) => {
        return _.chunk(myArr, 5);
    }

    export default chunkIntoFives;
`

describe('codehawk-cli', () => {
    describe('addComplexity', () => {
        it('generates metrics from a sample', () => {
            const metrics = addComplexity(STATIC_SAMPLE)
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
                        physical: 9,
                    },
                },
                dependencies: [
                    { line: 2, path: 'lodash', type: 'esm' }
                ],
                errors: [],
                lineEnd: 9,
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
