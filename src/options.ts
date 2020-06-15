import { CodehawkOptions, AllOptionKeys, AssembledOptions } from './types'

const baseOptions: CodehawkOptions = {
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
  excludeFilenames: {
    type: 'stringArray',
    default: ['.d.ts', '.min.js', '.bundle.js'],
    replaceDefault: false,
  },
  skipDirectories: {
    type: 'stringArray',
    default: ['/node_modules', '/flow-typed', '/coverage'],
    replaceDefault: false,
  }
}

export const buildOptions = (
  projectOptions: AssembledOptions
): AssembledOptions => {
  const assembledOptions = {} as AssembledOptions

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
        val = (option.type === 'stringArray' && Array.isArray(val))
          ? val.concat(projectOptions[optionKey] as string[])
          : val = projectOptions[optionKey] as boolean
      }
    }

    // TODO unsure how to remove this `any` atm
    // It may require a rethink of the type defs
    assembledOptions[optionKey] = val as any
  })

  return assembledOptions
}