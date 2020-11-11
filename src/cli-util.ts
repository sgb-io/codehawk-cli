import { FullyAnalyzedFile } from "./types"

// | File                           | # of Lines | Times Used/Depended On | Maintainability (higher is better) |
// | ------------------------------ | ---------- | ---------------------- | ---------------------------------- |
const colLengths = {
  filename: 30,
  lines: 10,
  timesUsed: 22,
  maintainability: 34,
}

const round = (num: number): number => Math.round(num * 100) / 100

const formatCol = (value: string, limit: number) => {
  return (value.length > limit)
      ? value.slice(limit + 3).padStart(limit, '.')
      : value.padEnd(limit, ' ')
}

const getScoreNote = (score: number): string => {
  if (score > 60) return 'OK'

  if (score > 50) return '(Could be better)'

  return '(Needs improvement)'
}

const formatComplexityScore = (score: number): string => {
  const rounded = round(score)
  const note = getScoreNote(score)

  return `${rounded} ${note}`
}

const generateTableLines = (flatFileResults: FullyAnalyzedFile[]): string => {
  return flatFileResults.map((result) => {
    const { complexityReport, filename, timesDependedOn } = result

    if (!complexityReport) {
      return ''
    }

    const { lineEnd, codehawkScore } = complexityReport
    const score = formatComplexityScore(codehawkScore)

    // Convert output into stdout-friendly, padded columns
    const filenameCol = formatCol(filename, colLengths.filename)
    const linesCol = formatCol(lineEnd.toString(), colLengths.lines)
    // Add 1 to the times depended on, assuming that all files are used at least once
    // (Codehawk reports external uses only)
    const depsCol = formatCol((timesDependedOn + 1).toString(), colLengths.timesUsed)
    const maintainabilityCol = formatCol(score, colLengths.maintainability)

    return (
      `| ${filenameCol} | ${linesCol} | ${depsCol} | ${maintainabilityCol} |`
    )
  }).join('\n    ') // Newline + 4 spaces
}


export const formatResultsAsTable = (flatFileResults: FullyAnalyzedFile[]): string => {
  return `
    Codehawk Static Analysis Results
    Top ${flatFileResults.length} file${flatFileResults.length > 1 ? 's' : ''}

    | File                           | # of Lines | Times Used/Depended On | Maintainability (higher is better) |
    | ------------------------------ | ---------- | ---------------------- | ---------------------------------- |
    ${generateTableLines(flatFileResults)}
  `
}