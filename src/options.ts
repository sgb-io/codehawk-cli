import { existsSync, readFileSync } from 'fs'
import { resolve as pathResolve } from 'path'

import { NO_CONFIGURATION_FOUND } from './consts/errors'
import type { CodehawkOptions, AllOptionKeys, AssembledOptions } from './types'

const baseOptions: CodehawkOptions = {
  badgesDirectory: {
    type: 'stringArray',
    default: ['/generated'],
    replaceDefault: true,
  },
  enableFlow: {
    type: 'boolean',
    default: false,
    replaceDefault: true,
  },
  extensions: {
    type: 'stringArray',
    default: ['.js', '.jsx', '.ts', '.tsx'],
    replaceDefault: false,
  },
  excludeDirectories: {
    type: 'stringArray',
    default: ['/dist', '/bin', '/build'],
    replaceDefault: true,
  },
  excludeExact: {
    type: 'stringArray',
    default: [],
    replaceDefault: true,
  },
  excludeFilenames: {
    type: 'stringArray',
    default: ['.d.ts', '.min.js', '.bundle.js'],
    replaceDefault: false,
  },
  skipDirectories: {
    type: 'stringArray',
    default: ['/node_modules', '/flow-typed', '/coverage'],
    replaceDefault: false,
  },
  minimumThreshold: {
    type: 'number',
    default: 10,
    replaceDefault: true,
  },
  cliOutputLimit: {
    type: 'number',
    default: 25,
    replaceDefault: true,
  },
}

const injectOptionValues = ({
  existingOptions,
  optionKey,
  val,
}: {
  existingOptions: AssembledOptions
  optionKey: AllOptionKeys
  val: any
}): AssembledOptions => {
  let err
  const newOptions = { ...existingOptions }

  switch (optionKey) {
    case 'enableFlow':
      newOptions[optionKey] = val as boolean
      break
    case 'badgesDirectory':
    case 'excludeDirectories':
    case 'excludeExact':
    case 'excludeFilenames':
    case 'extensions':
    case 'skipDirectories':
      newOptions[optionKey] = val as string[]
      break
    case 'minimumThreshold':
    case 'cliOutputLimit':
      newOptions[optionKey] = parseInt(val, 10)
      break
    default:
      // Print a friendly error but also allow the upstream generic handling to kick in
      err = `[codehawk-cli] Unknown option "${
        optionKey as string
      }" is not supported`
      console.warn(err)
      throw new Error(err)
  }

  return newOptions
}

export const buildOptions = (
  projectOptions: AssembledOptions
): AssembledOptions => {
  let assembledOptions: AssembledOptions = {}

  Object.keys(baseOptions).forEach((optionKey: AllOptionKeys) => {
    const option = baseOptions[optionKey]
    let val = option.default

    if (projectOptions[optionKey]) {
      // Project options can either be added to the defaults, or replace them.
      if (option.replaceDefault) {
        // Mutate options by replacing (we assume project config is valid!)
        val = projectOptions[optionKey]
      } else {
        // Mutate options by mixing in project options to defaults
        val =
          option.type === 'stringArray' && Array.isArray(val)
            ? val.concat(projectOptions[optionKey] as string[])
            : (val = projectOptions[optionKey])
      }
    }

    assembledOptions = injectOptionValues({
      existingOptions: assembledOptions,
      optionKey,
      val,
    })
  })

  return assembledOptions
}

export const getConfiguration = (rootDirectory: string): AssembledOptions => {
  try {
    if (existsSync(pathResolve(`${rootDirectory}/codehawk.json`))) {
      const configContents = readFileSync(
        pathResolve(`${rootDirectory}/codehawk.json`),
        'utf8'
      )
      return JSON.parse(configContents)
    }
    const packageConfig = readFileSync(
      pathResolve(`${rootDirectory}/package.json`),
      'utf-8'
    )
    const parsedPackageConfig = JSON.parse(packageConfig)
    if ('codehawk' in parsedPackageConfig) {
      return parsedPackageConfig.codehawk
    }
  } catch (e) {
    console.log(e)
  }

  throw new Error(NO_CONFIGURATION_FOUND)
}
