import * as fs from 'fs'
import * as path from 'path'
import slash from 'slash'
import { getCoverage } from './coverage'
import { analyzeFile, calculateComplexity } from './analyze'
import { getFileContents, walkSync } from './traverseProject'
import { getTimesDependedOn, getProjectDeps } from './dependencies'
import {
  ParsedEntity,
  ParsedFile,
  AnalyzedFile,
  AnalyzedDirectory,
  AnalyzedEntity,
  FullyAnalyzedEntity,
  FullyAnalyzedFile,
  FullyAnalyzedDirectory
} from './types'
import { buildOptions } from './options'

interface Results {
  results: FullyAnalyzedEntity[]
}

const cwd = slash(process.cwd())

export * from "./types"

export { calculateComplexity }

export const analyzeProject = (rawPath: string): Results => {
  const optionsPath = path.resolve(`${rawPath}/codehawk.json`)

  let projectOptionsFile = null
  try {
    projectOptionsFile = fs.readFileSync(optionsPath, 'utf8')
  } catch (e) {
    console.log(e)
    throw new Error('Please ensure you have a codehawk.json file in your project root.')
  }

  const projectOptions = JSON.parse(projectOptionsFile)
  const options = buildOptions(projectOptions)
  const dirPath = path.resolve(`${rawPath}/`)
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
  ): AnalyzedEntity[] => entities.map((entity) => {
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
    timesDependedOn: getTimesDependedOn(projectDeps, file.fullPath)
  })

  const addDependencyCounts = (
    projectDeps: string[],
    entities: AnalyzedEntity[]
  ): FullyAnalyzedEntity[] => entities.map((entity) => {
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

  return {
    results: secondRunResults
  }
}
