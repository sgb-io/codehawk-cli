#!/usr/bin/env node

import { analyzeProject, generateBadge } from './codehawk'
import { formatResultsAsTable } from './cli-util'

// Sample CLI usage: `codehawk src`
const scanDir = process.argv.slice(2)[0]

if (scanDir && scanDir !== '') {
  const output = analyzeProject(`${process.cwd()}/${scanDir}`, true)
  const formattedAsTable = output.resultsList.slice(0, 25)
  console.log(formatResultsAsTable(formattedAsTable))

  try {
    console.log('[codehawk-cli] Generating maintainability badge...')
    generateBadge(output.summary)
  } catch (e) {
    console.warn('[codehawk-cli] Badge was not generated')
  }
} else {
  console.error(
    '[codehawk-cli] Unable to analyze project, please ensure you provide a directory e.g. "codehawk src"'
  )
}
