import path from 'path'
import slash from 'slash'
import { flattenEntireTree } from './util'
import { AnalyzedEntity } from './types'

// Gathers all the dependencies as a flat array of strings across all analyzed files
// Note: duplicates are not removed (intentional)
export const getProjectDeps = (firstRunResults: AnalyzedEntity[]): string[] => {
  const flatItems = flattenEntireTree(firstRunResults)
  const allAbsoluteDeps = []
  for (let i = 0; i < flatItems.length; i += 1) {
    const item = flatItems[i]
    if (item.complexityReport) {
      for (let n = 0; n < item.complexityReport.dependencies.length; n += 1) {
        const dep = flatItems[i].complexityReport.dependencies[n]
        const depPath = path.resolve(item.path, dep.path)
        allAbsoluteDeps.push(depPath)
      }
    }
  }

  return allAbsoluteDeps
}

// Matches a full list of dependencies against a file to count how many times it is depended on
export const getTimesDependedOn = (projectDeps: string[], filePath: string): number => {
  const timesDependedOn = projectDeps.filter((d) => {
    const fileNameWithoutExtension = path.basename(filePath).split('.').slice(0, -1).join('.')
    // Windows compatibility (unix-style slashes, plus remove the root drive)
    // eslint-disable-next-line no-useless-escape
    const cleanD = slash(d).replace(/\w\:/, '')

    // Match exactly, or fall back to index (index is a reserved case in nodejs)
    // Note: by design, only javascript dependencies are counted (e.g. svg imports will not count as a TDO)
    const fullMatch = cleanD === `${path.dirname(filePath)}/${fileNameWithoutExtension}`
    const defaultImportMatch = new RegExp(`${cleanD}/index.(js|ts|tsx|jsx)`, 'i')
    const namedImportMatch = new RegExp(`${cleanD}/`, 'i')
    const indexMatch = filePath.match(defaultImportMatch) || filePath.match(namedImportMatch)

    return fullMatch || indexMatch
  })

  return timesDependedOn.length
}