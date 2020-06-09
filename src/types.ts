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

interface CoverageMeasurement {
    total: number
    covered: number
    skipped: number
    pct: number
}

type SupportedCoverageMeasurements =
    | 'lines'
    | 'functions'
    | 'statements'
    | 'branches'

type CoverageMetrics = {
    [key in SupportedCoverageMeasurements]: CoverageMeasurement
}

export interface CoverageSummary {
    [key: string]: CoverageMetrics
}

export interface CoverageMapping {
    path: string
    coverage: CoverageMetrics
}

interface BaseEntity {
    fullPath: string
    path: string
    filename: string
    shouldAnalyze: boolean
}

export interface FileWithContents {
    path: string
    filename: string
    rawSource: string
}

// Parsed entities 

export interface ParsedFile extends BaseEntity {
    type: 'file'
}

export interface ParsedDirectory extends BaseEntity {
    type: 'dir'
    files: Array<ParsedFile>
}

export type ParsedEntity = ParsedFile | ParsedDirectory


// Parsed entities plus complexityReports

export interface AnalyzedFile extends ParsedFile {
    complexityReport?: CompleteCodehawkComplexityResult
}

export interface AnalyzedDirectory extends BaseEntity {
    type: 'dir',
    files: Array<AnalyzedFile>
}

export type AnalyzedEntity = AnalyzedFile | AnalyzedDirectory


// Parsed entities plus complexityReports and timesDependedOn

export interface FullyAnalyzedFile extends AnalyzedFile {
    timesDependedOn: number
}

export interface FullyAnalyzedDirectory extends BaseEntity {
    type: 'dir',
    files: Array<FullyAnalyzedFile>
}

export type FullyAnalyzedEntity = FullyAnalyzedFile | FullyAnalyzedDirectory

// Before coverage mapping
export interface CodehawkComplexityResult extends ComplexityResult {
    codehawkScore: number
}

// After coverage mapping
export interface CompleteCodehawkComplexityResult extends CodehawkComplexityResult {
    coverage: string
}