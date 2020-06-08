import fs from "fs"

export const getCoverage = (dirPath) => {
    let coverage = []

    try {
        const contents = fs.readFileSync(`${dirPath}/coverage/coverage-summary.json`, 'utf8')
        const coveredFiles = JSON.parse(contents)
        coverage = Object.keys(coveredFiles).map((file) => ({
            path: file.replace(dirPath, ''),
            coverage: coveredFiles[file]
        }))
    } catch (e) {
        console.error(`
            Coverage not found, please generate it using instanbul/nyc.
            We expect the json-summary format (coverage/coverage-summary.json).
            If you don't have any tests, you can still continue.
        `)
    }

    return coverage
}