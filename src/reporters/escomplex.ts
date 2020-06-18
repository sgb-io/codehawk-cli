import escomplex from 'typhonjs-escomplex'
import { CodehawkComplexityResult } from '../types'

// The following hack is taken from Plato
// ref. https://github.com/es-analysis/plato/blob/master/lib/reporters/complexity/index.js @ ad8a294

const escomplexReporter = (source: string): CodehawkComplexityResult | null => {
    const report = escomplex.analyzeModule(source)

    // For cases where parsing the javascript has failed
    if (!report) {
        return null
    }

    // Exclude files where the vocab score is lower than 5
    // This prevents things like tiny `index.js` linkages being counted
    if (report.aggregate.halstead.vocabulary < 5) {
        return null
    }

    const trimmed = Object.assign({}, report) as CodehawkComplexityResult

    // Remove un-wanted noise
    delete trimmed.settings
    delete trimmed.classes
    delete trimmed.methodAverage
    delete trimmed.methods
    delete trimmed.filePath
    delete trimmed.srcPath
    delete trimmed.srcPathAlias
    delete trimmed.aggregate.halstead.operands.identifiers
    delete trimmed.aggregate.halstead.operators.identifiers
    delete trimmed.aggregateAverage
    delete trimmed.aggregate.aggregate

    // Calculate the Codehawk Score
    const vocab = (report.aggregate.halstead.vocabulary < 2)
        ? 1
        : report.aggregate.halstead.vocabulary
    const cyclo = report.aggregate.cyclomatic

    // The secret sauce
    const factor = (Math.log(cyclo) < 1) ? 1 : (trimmed.lineEnd / Math.log(cyclo))
    const absoluteCodehawkScore = 171 - 5.2 * Math.log(vocab) - 0.23 * cyclo - 16.2 * Math.log(factor)
    const codehawkScore = (absoluteCodehawkScore * 100) / 171

    // Never minus
    trimmed.codehawkScore = (codehawkScore > 0)
        ? codehawkScore
        : 0

    return trimmed
}

export default escomplexReporter
