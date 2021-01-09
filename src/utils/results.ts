import type { FullyAnalyzedFile, ResultsSummary } from '../types'

const getMedian = (numbers: number[]): number => {
  const sorted = numbers.slice().sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)

  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2
  }

  return sorted[middle]
}

export const getResultsSummary = (
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
