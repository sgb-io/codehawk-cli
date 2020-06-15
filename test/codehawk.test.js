const fs = require('fs')
const analyzeProject = require('../build/codehawk').default

describe('codehawk.analyzeProject', () => {
    const cwd = process.cwd()

    const outputMatchesResult = (projectPath) => {
        const output = analyzeProject(`${cwd}/${projectPath}`)
        expect(output).toBeTruthy()

        const expectedRaw = fs.readFileSync(`${cwd}/${projectPath}/expected.json`)
        const expected = JSON.parse(expectedRaw)

        expect(output.results).toEqual(expected.results)
    }

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
