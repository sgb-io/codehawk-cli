const { assert } = require('chai')
const fs = require('fs')
const analyzeProject = require('../build/codehawk').default

describe('codehawk.analyzeProject', () => {
    const cwd = process.cwd()

    it('react-component', () => {
        const output = analyzeProject(`${cwd}/samples/react-component`)
        assert.ok(output)

        const expectedRaw = fs.readFileSync(`${cwd}/samples/react-component/expected.json`)
        const expected = JSON.parse(expectedRaw)

        assert.deepEqual(output.results, expected.results)
    })

    it('react-component-flow', () => {
        const output = analyzeProject(`${cwd}/samples/react-component-flow`)
        assert.ok(output)

        const expectedRaw = fs.readFileSync(`${cwd}/samples/react-component-flow/expected.json`)
        const expected = JSON.parse(expectedRaw)

        assert.deepEqual(output.results, expected.results)
    })

    it('simple-class', () => {
        const output = analyzeProject(`${cwd}/samples/simple-class`)
        assert.ok(output)

        const expectedRaw = fs.readFileSync(`${cwd}/samples/simple-class/expected.json`)
        const expected = JSON.parse(expectedRaw)

        assert.deepEqual(output.results, expected.results)
    })

    it('simple-es6-imports', () => {
        const output = analyzeProject(`${cwd}/samples/simple-es6-imports`)
        assert.ok(output)

        const expectedRaw = fs.readFileSync(`${cwd}/samples/simple-es6-imports/expected.json`)
        const expected = JSON.parse(expectedRaw)

        assert.deepEqual(output.results, expected.results)
    })

    it('sweetalert', () => {
        const output = analyzeProject(`${cwd}/samples/sweetalert`)
        assert.ok(output)

        const expectedRaw = fs.readFileSync(`${cwd}/samples/sweetalert/expected.json`)
        const expected = JSON.parse(expectedRaw)

        assert.deepEqual(output.results, expected.results)
    })
})
