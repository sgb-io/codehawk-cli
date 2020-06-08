export type SupportedOptionKeys =
    | 'extensions'
    | 'excludeDirectories'
    | 'excludeFilenames'
    | 'skipDirectories'

interface OptionConfig {
    default: Array<string>
    override: boolean
}

export type CodehawkOptions = {
    [key in SupportedOptionKeys]?: OptionConfig
}

export type AssembledOptions = {
    [key in SupportedOptionKeys]?: Array<string>
}