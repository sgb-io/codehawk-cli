import { CodehawkOptions, SupportedOptionKeys, AssembledOptions } from "./types"

export const buildOptions = (
    baseOptions: CodehawkOptions,
    projectOptions: AssembledOptions
): AssembledOptions => {
    const options: AssembledOptions = {}
    Object.keys(baseOptions).forEach((optionKey: SupportedOptionKeys) => {
        const option = baseOptions[optionKey]
        let val = option.default
        if (projectOptions[optionKey]) {
            if (option.override) {
                val = projectOptions[optionKey]
            } else {
                // Note - this assumes all non-override options are arrays
                val = val.concat(projectOptions[optionKey])
            }
        }

        options[optionKey] = val
    })

    return options
}