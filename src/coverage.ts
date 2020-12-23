import fs from 'fs'
import type { CoverageMapping, CoverageSummary } from './types'

export const getCoverage = (dirPath: string): CoverageMapping[] => {
  let coverage: CoverageMapping[] = []

  try {
    const contents = fs.readFileSync(
      `${dirPath}/coverage/coverage-summary.json`,
      'utf8'
    )
    const coveredFiles: CoverageSummary = JSON.parse(contents)
    coverage = Object.keys(coveredFiles).map((file) => ({
      path: file.replace(dirPath, ''),
      coverage: coveredFiles[file],
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
