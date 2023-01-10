import * as path from 'path'
import slash from 'slash'
import { getCoverage } from './coverage'
import { analyzeFile, calculateComplexity } from './analyze'
import { getFileContents, walkSync } from './traverseProject'
import { getTimesDependedOn, getProjectDeps } from './dependencies'
import type {
  AnalyzedDirectory,
  AnalyzedEntity,
  AnalyzedFile,
  AssembledOptions,
  FullyAnalyzedDirectory,
  FullyAnalyzedEntity,
  FullyAnalyzedFile,
  ParsedEntity,
  ParsedFile,
  ResultsSummary,
} from './types'
import { buildOptions, getConfiguration } from './options'
import { generateBadge } from './badge'
import { getResultsAsList, getResultsSummary } from './utils'

export interface Results {
  options: AssembledOptions
  resultsList: FullyAnalyzedFile[]
  fullResultsTree: FullyAnalyzedEntity[]
  summary: ResultsSummary
}

const cwd = slash(process.cwd())

const analyzeProject = (rawPath: string, isCliContext?: boolean): Results => {
  // When using CLI, execute from the cwd rather than a relative path
  const actualRoot = isCliContext ? cwd : rawPath
  const projectOptions = getConfiguration(actualRoot)
  let options: AssembledOptions = {}
  try {
    options = buildOptions(projectOptions)
  } catch (e) {
    if (isCliContext) {
      console.error(
        '[codehawk-cli] Unable to parse codehawk options - please ensure you have provided correct values'
      )
      process.exit(1)
    } else {
      throw new Error(
        '[codehawk-cli] Unable to parse codehawk options - please ensure you have provided correct values'
      )
    }
  }

  const dirPath = path.resolve(`${actualRoot}/`)
  const projectCoverage = getCoverage(dirPath)

  const addComplexityToFile = (file: ParsedFile): AnalyzedFile => {
    let fileContents
    try {
      if (file.shouldAnalyze) {
        fileContents = getFileContents(
          file.fullPath,
          options.enableFlow ?? false
        )
      }
    } catch (error) {
      console.error(
        `[codehawk-cli] Unable to parse "${file.path}/${file.filename}", skipping`
      )
    }

    const complexityReport = !file.shouldAnalyze
      ? null
      : analyzeFile(
          dirPath,
          {
            path: file.path,
            filename: file.filename,
            rawSource: fileContents,
          },
          projectCoverage
        )

    return {
      ...file,
      complexityReport: complexityReport ?? undefined,
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
  if (
    options.minimumThreshold &&
    isCliContext &&
    summary.worst < options.minimumThreshold
  ) {
    console.error(
      `[codehawk-cli] Worst case (${summary.worst}) was below the minimum threshold (${options.minimumThreshold})`
    )
    process.exit(1)
  }

  return {
    options,
    summary,
    resultsList: resultsAsList,
    fullResultsTree: secondRunResults,
  }
}

// Public APIs
export { calculateComplexity, analyzeProject, generateBadge }
