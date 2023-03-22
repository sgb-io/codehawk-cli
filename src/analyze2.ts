import path from 'path'
import * as ts from 'typescript'
import { gatherEntities } from './visit'

interface HalsteadMetrics {
  vocabulary: number
  length: number
  volume: number
  difficulty: number
  effort: number
  time: number
  bugs: number
}

function calculateHalsteadMetrics(sourceFile: ts.SourceFile): HalsteadMetrics {
  const { operands, operators } = gatherEntities(sourceFile)

  // Distinct is now very close! But totals are off (e.g. isTSX duplicated 32 times)
  console.log('operands', operands, Object.keys(operands).length)
  // Operators is way off at the moment, presumably various cases are missing in visit.ts
  console.log('operators', operators, Object.keys(operators).length)

  // There should be:
  // 62 distinct, 148 total ish operands
  // 24 distinct, 136 total ish operators

  // Calculate Halstead metrics
  const vocabulary =
    Object.keys(operators).length + Object.keys(operands).length
  const length =
    Object.values(operators).reduce((a, b) => a + b, 0) +
    Object.values(operands).reduce((a, b) => a + b, 0)
  const volume = length * Math.log2(vocabulary)
  const difficulty =
    (Object.keys(operators).length / 2) *
    (Object.values(operands).reduce((a, b) => a + b, 0) /
      Object.keys(operands).length)
  const effort = volume * difficulty
  const time = effort / 18
  const bugs = volume / 3000

  return {
    vocabulary,
    length,
    volume,
    difficulty,
    effort,
    time,
    bugs,
  }
}

const filePath = path.resolve(__dirname, 'analyze.ts')
const program = ts.createProgram([filePath], {})
const sourceFile = program.getSourceFile(filePath)
if (sourceFile) {
  const halsteadMetrics = calculateHalsteadMetrics(sourceFile)
  console.log('Halstead Metrics:', halsteadMetrics)
}
