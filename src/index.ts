#!/usr/bin/env node

import { analyzeProject, resultsAsTable } from './codehawk'

// Sample CLI usage: `codehawk src`
const scanDir = process.argv.slice(2)[0]

if (scanDir && scanDir !== '') {
  const output = analyzeProject(`${process.cwd()}/${scanDir}`, true)
  console.log(resultsAsTable(output.results))
} else {
  console.error(
    '[codehawk-cli] Unable to parse, please ensure you provide a directory e.g. "codehawk src"'
  )
}
