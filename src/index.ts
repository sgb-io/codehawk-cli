#!/usr/bin/env node

import { analyzeProject, getResultsAsList } from './codehawk'
import { formatResultsAsTable } from './cli-util'

// Sample CLI usage: `codehawk src`
const scanDir = process.argv.slice(2)[0]

if (scanDir && scanDir !== '') {
  const output = analyzeProject(`${process.cwd()}/${scanDir}`, true)
  const formattedAsTable = getResultsAsList(output.fullResultsTree, 20)
  console.log(formatResultsAsTable(formattedAsTable))
} else {
  console.error(
    '[codehawk-cli] Unable to parse, please ensure you provide a directory e.g. "codehawk src"'
  )
}
