import escomplexReporter from "./reporters/escomplex"

const {
    NODE_ENV,
} = process.env

const analyzeFile = (dirPath: string, file, projectCoverage) => {
    let report = null
    const relativeFilePath = `${file.path}/${file.filename}`.replace(dirPath, '')
    const coverageData = projectCoverage.find(c => c.path === relativeFilePath)

    let fileCoverage = '0'

    if (coverageData) {
        // Coverage can have a bug where 0 things have 100% coverage
        const linesPct = coverageData.coverage.lines.total === 0 ? 0 : coverageData.coverage.lines.pct
        const fnPct = coverageData.coverage.functions.total === 0 ? 0 : coverageData.coverage.functions.pct
        const stmntPct = coverageData.coverage.statements.total === 0 ? 0 : coverageData.coverage.statements.pct
        const branchPct = coverageData.coverage.branches.total === 0 ? 0 : coverageData.coverage.branches.pct

        // Average the four coverage types.
        fileCoverage = ((
            linesPct +
            fnPct +
            stmntPct +
            branchPct
        ) / 4).toFixed(2)
    }

    let trimmed
    try {
        trimmed = file.rawSource.toString().trim()
    } catch (e) {
        console.error(`Unable to read source of "${file.path}/${file.filename}", skipping`)
    }

    try {
        const complexityReport = escomplexReporter(trimmed, file.options)
        if (complexityReport) {
            report = {
                ...complexityReport,
                coverage: fileCoverage,
            }
        }
    } catch (e) {
        console.error(`Unable to parse "${file.path}/${file.filename}", skipping`)
        if (NODE_ENV !== 'production') {
            // Print out  what is attempting to be evaluated
            // Exposes bugs such as flow-remove-types not working correctly
            // Note: if you see flow types in here, they have not been stripped correctly
            console.error(e)
            console.log('\n\n')
            console.error(trimmed)
            console.log('\n\n')
        }
        // No clear API for capturing a SyntaxError, also we don't know if it'll always be that.
    }

    return report
}

export default analyzeFile