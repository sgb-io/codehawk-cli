type UnusedMetric = any

interface Halstead {
    bugs: number
    difficulty: number
    effort: number
    length: number
    time: number
    vocabulary: number
    volume: number
    operands: {
        distinct: number
        total: number
        identifiers: UnusedMetric
    }
    operators: {
        distinct: number
        total: number
        identifiers: UnusedMetric
    }
}

interface Dependency {
    line: number
    path: string
    type: string
}

interface Aggregate {
    aggregate: UnusedMetric
    cyclomatic: number
    cyclomaticDensity: number
    halstead: Halstead
    paramCount: number
    sloc: {
        logical: number
        physical: number
    }
}

interface ComplexityResult {
    aggregate: Aggregate
    aggregateAverage: UnusedMetric
    classes: UnusedMetric
    dependencies: Array<Dependency>
    errors: Array<UnusedMetric>
    filePath: UnusedMetric
    lineEnd: number
    lineStart: number
    maintainability: number
    methodAverage: UnusedMetric
    methods: UnusedMetric
    settings: UnusedMetric
    srcPath: UnusedMetric
    srcPathAlias: UnusedMetric
}

declare module "typhonjs-escomplex" {
    export function analyzeModule(source: string): ComplexityResult;
}