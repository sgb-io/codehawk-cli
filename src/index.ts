#!/usr/bin/env node

import { analyzeProject, generateBadge } from './codehawk'
import { formatResultsAsTable } from './cli-util'

import yargs from 'yargs'
// @types/yargs is missing typings for yargs/helpers (see https://github.com/yargs/yargs/issues/1816)
// @ts-expect-error
import { hideBin } from 'yargs/helpers'

const run = (scanDir: string, createBadge: boolean): void => {
  if (scanDir && scanDir !== '') {
    const output = analyzeProject(`${process.cwd()}/${scanDir}`, true)
    const formattedAsTable = output.resultsList.slice(0, 25)
    console.log(formatResultsAsTable(formattedAsTable))

    if (!createBadge) {
      return
    }

    try {
      console.log('[codehawk-cli] Generating maintainability badge...')
      generateBadge(output)
      console.log('[codehawk-cli] Badge was generated')
    } catch (e) {
      console.warn('[codehawk-cli] Badge was not generated')
    }
  } else {
    console.error(
      '[codehawk-cli] Unable to analyze project, please ensure you provide a directory e.g. "codehawk src"'
    )
  }
}

const rawArgs = hideBin(process.argv)

const argv = yargs(rawArgs)
  .demandCommand(1, 'Please provide a directory argument')
  .describe('no-badge', 'Exclude generated badges')
  .usage('Usage: codehawk [dir] <options>')
  .epilog(
    'For help, file an issue at https://github.com/sgb-io/codehawk-cli/issues'
  )
  .help('help').argv

run(argv._[0] as string, argv.badge !== false)
