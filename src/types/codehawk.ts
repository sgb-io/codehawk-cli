// All option keys
type SupportedStringArrayKeys =
    | 'badgesDirectory'
    | 'excludeDirectories'
    | 'excludeExact'
    | 'excludeFilenames'
    | 'extensions'
    | 'skipDirectories'
type SupportedBooleanOptions = 'enableFlow'
type SupportedNumberOptions = 'minimumThreshold' | 'cliOutputLimit'

export type AllOptionKeys =
  | SupportedStringArrayKeys
  | SupportedBooleanOptions
  | SupportedNumberOptions

interface StringArrayOption {
  type: 'stringArray'
  default: string[]
  replaceDefault: boolean
}

interface BooleanOption {
  type: 'boolean'
  default: boolean
  replaceDefault: boolean
}

interface NumberOption {
  type: 'number'
  default: number
  replaceDefault: boolean
}

export type CodehawkOptions = {
  [key in SupportedStringArrayKeys]?: StringArrayOption
} & {
  [key in SupportedBooleanOptions]?: BooleanOption
} & {
  [key in SupportedNumberOptions]?: NumberOption
}

export type AssembledOptions = {
  [key in SupportedStringArrayKeys]?: string[]
} & {
  [key in SupportedBooleanOptions]?: boolean
} & {
  [key in SupportedNumberOptions]?: number
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
  rawSource: string | undefined // Undefined if parsing fails
}

// Parsed entities 

export interface ParsedFile extends BaseEntity {
  type: 'file'
}

export interface ParsedDirectory extends BaseEntity {
  type: 'dir'
  files: ParsedFile[]
}

export type ParsedEntity = ParsedFile | ParsedDirectory


// Parsed entities plus complexityReports

export interface AnalyzedFile extends ParsedFile {
  complexityReport?: CompleteCodehawkComplexityResult
}

// For when we have a guarantee of a complexity report
export interface AnalyzedFileWithReport extends ParsedFile {
  complexityReport: CompleteCodehawkComplexityResult
}

export interface AnalyzedDirectory extends BaseEntity {
  type: 'dir'
  files: AnalyzedFile[]
}

export type AnalyzedEntity = AnalyzedFile | AnalyzedDirectory

// Parsed entities plus complexityReports and timesDependedOn

export interface FullyAnalyzedFile extends AnalyzedFile {
  timesDependedOn: number
}

// Some operations are against analyzed files, but we don't care if they're fully analyzed

export type AnyAnalyzedFile = AnalyzedFile | FullyAnalyzedFile

export interface FullyAnalyzedDirectory extends BaseEntity {
  type: 'dir'
  files: FullyAnalyzedFile[]
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

export interface ResultsSummary {
  average: number
  median: number
  worst: number
}