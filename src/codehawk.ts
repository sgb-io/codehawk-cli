import * as path from 'path'
import slash from 'slash'
import { getCoverage } from './coverage'
import { analyzeFile, calculateComplexity } from './analyze'
import { getFileContents, walkSync } from './traverseProject'
import { getTimesDependedOn, getProjectDeps } from './dependencies'
import type {
  ParsedEntity,
  ParsedFile,
  AnalyzedFile,
  AnalyzedDirectory,
  AnalyzedEntity,
  FullyAnalyzedEntity,
  FullyAnalyzedFile,
  FullyAnalyzedDirectory,
} from './types'
import { buildOptions, getConfiguration } from './options'
import { flattenEntireTree } from './util'
import { generateBadge } from './badge'

export interface ResultsSummary {
  average: number
  median: number
  worst: number
}

export interface Results {
  resultsList: FullyAnalyzedFile[]
  fullResultsTree: FullyAnalyzedEntity[]
  summary: ResultsSummary
}

const cwd = slash(process.cwd())

const analyzeProject = (rawPath: string, isCliContext?: boolean): Results => {
  // When using CLI, execute from the cwd rather than a relative path
  const actualRoot = isCliContext ? cwd : rawPath
  const projectOptions = getConfiguration(actualRoot)
  const options = buildOptions(projectOptions)
  const dirPath = path.resolve(`${actualRoot}/`)
  const projectCoverage = getCoverage(dirPath)

  const addComplexityToFile = (file: ParsedFile): AnalyzedFile => {
    const complexityReport = !file.shouldAnalyze
      ? null
      : analyzeFile(
          dirPath,
          {
            path: file.path,
            filename: file.filename,
            rawSource: getFileContents(file.fullPath, options.enableFlow),
          },
          projectCoverage
        )

    return {
      ...file,
      complexityReport,
      fullPath: file.fullPath.replace(cwd, ''),
      path: file.path.replace(cwd, ''),
    }
  }

  const addComplexityToEntities = (
    entities: ParsedEntity[]
  ): AnalyzedEntity[] =>
    entities.map((entity) => {
      if (entity.type === 'dir') {
        return {
          ...entity,
          files: addComplexityToEntities(entity.files),
          fullPath: entity.fullPath.replace(cwd, ''),
        } as AnalyzedDirectory
      }

      return addComplexityToFile(entity)
    })

  const addDependencyCountToFile = (
    projectDeps: string[],
    file: AnalyzedFile
  ): FullyAnalyzedFile => ({
    ...file,
    timesDependedOn: getTimesDependedOn(projectDeps, file.fullPath),
  })

  const addDependencyCounts = (
    projectDeps: string[],
    entities: AnalyzedEntity[]
  ): FullyAnalyzedEntity[] =>
    entities.map((entity) => {
      if (entity.type === 'dir') {
        return {
          ...entity,
          files: addDependencyCounts(projectDeps, entity.files),
        } as FullyAnalyzedDirectory
      }

      return addDependencyCountToFile(projectDeps, entity)
    })

  // First run of all files: generate complexity & coverage metrics
  const entities = walkSync(dirPath, options)
  const firstRunResults = addComplexityToEntities(entities)

  // Second run: generate timesDependedOn (can only be calculated after first run)
  const projectDeps = getProjectDeps(firstRunResults)
  const secondRunResults = addDependencyCounts(projectDeps, firstRunResults)
  const resultsAsList = getResultsAsList(secondRunResults)
  const summary = getResultsSummary(resultsAsList)

  // When in a CLI context, exit if the worst case fails to meet the minimum threshold
  if (isCliContext && summary.worst < options.minimumThreshold) {
    console.error('[codehawk-cli] Badge was not generated')
    process.exit(1)
  }

  return {
    summary,
    resultsList: resultsAsList,
    fullResultsTree: secondRunResults,
  }
}

const getResultsAsList = (
  analyzedEntities: FullyAnalyzedEntity[],
  limit?: number
): FullyAnalyzedFile[] => {
  const flatFileResults: FullyAnalyzedFile[] = flattenEntireTree<
    FullyAnalyzedFile
  >(analyzedEntities)
    .filter((entity) => {
      return entity.type === 'file' && !!entity.complexityReport
    })
    // Sort by codehawk score, ascending (most complex files are first in the list)
    .sort((entityA, entityB) => {
      return (
        entityA.complexityReport.codehawkScore -
        entityB.complexityReport.codehawkScore
      )
    })

  return limit ? flatFileResults.slice(0, limit) : flatFileResults
}

const getMedian = (numbers: number[]): number => {
  const sorted = numbers.slice().sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)

  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2
  }

  return sorted[middle]
}

const getResultsSummary = (
  resultsAsList: FullyAnalyzedFile[]
): ResultsSummary => {
  const allScores: number[] = resultsAsList.reduce((arr: number[], current) => {
    if (current.complexityReport) {
      arr.push(current.complexityReport.codehawkScore)
    }
    return arr
  }, [])
  const total = allScores.reduce((total: number, score) => {
    return total + score
  }, 0)
  const worst = allScores.reduce((worst: number, score) => {
    if (score < worst) {
      return score
    }
    return worst
  }, 100) // Start with max maintainability, work downwards

  const average = total / allScores.length
  const median = getMedian(allScores)

  return {
    average,
    median,
    worst,
  }
}

// Public APIs
export { calculateComplexity, analyzeProject, generateBadge }
