#!/usr/bin/env node

import { analyzeProject, resultsAsTable } from './codehawk'

// Sample CLI usage: `codehawk src`
const scanDir = process.argv.slice(2);
const output = analyzeProject(`${process.cwd()}/${scanDir}`, true)

console.log(resultsAsTable(output.results))