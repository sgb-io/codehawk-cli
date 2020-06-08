import * as fs from 'fs'
import * as path from 'path'
import slash from 'slash'
import { getCoverage } from './coverage'
import analyzeFile from './analyze'
import { getFileContents, walkSync } from './traverseProject'
import { getTimesDependedOn, getProjectDeps } from './dependencies'
import { CodehawkOptions } from './types'
import { buildOptions } from './options'

const cwd = slash(process.cwd())

const baseOptions: CodehawkOptions = {
    extensions: {
        default: ['.js', '.jsx', '.ts', '.tsx'],
        override: false,
    },
    excludeDirectories: {
        default: ['/dist', '/bin', '/build'],
        override: true,
    },
    excludeFilenames: {
        default: ['.d.ts', '.min.js', '.bundle.js'],
        override: false,
    },
    skipDirectories: {
        default: ['/node_modules', '/flow-typed', '/coverage'],
        override: false,
    }
}

const analyzeProject = (rawPath: string) => {
    const optionsPath = path.resolve(`${rawPath}/codehawk.json`)

    let projectOptionsFile = null
    try {
        projectOptionsFile = fs.readFileSync(optionsPath, 'utf8')
    } catch (e) {
        console.log(e)
        throw new Error('Please ensure you have a codehawk.json file in your project root.')
    }

    const projectOptions = JSON.parse(projectOptionsFile)
    const options = buildOptions(baseOptions, projectOptions)
    const dirPath = path.resolve(`${rawPath}/`)
    const projectCoverage = getCoverage(dirPath)

    const addComplexityToFile = (file) => {
        const complexityReport = !file.shouldAnalyze
            ? null
            : analyzeFile(
                dirPath,
                {
                    path: file.path,
                    filename: file.filename,
                    rawSource: getFileContents(file.fullPath),
                },
                projectCoverage
            )

        return {
            ...file,
            complexityReport,
            fullPath: file.fullPath.replace(cwd, ''),
            path: file.path.replace(cwd, ''),
        }
    }

    const addComplexityToProject = (files) => files.map((file) => {
        if (file.type === 'dir') {
            return {
                ...file,
                files: addComplexityToProject(file.files),
                fullPath: file.fullPath.replace(cwd, ''),
            }
        }

        return addComplexityToFile(file)
    })

    const addDependencyCountToFile = (projectDeps, file) => ({
        ...file,
        timesDependedOn: getTimesDependedOn(projectDeps, file.fullPath)
    })

    const addDependencyCounts = (projectDeps: Array<string>, files) => files.map((file) => {
        if (file.type === 'dir') {
            return {
                ...file,
                files: addDependencyCounts(projectDeps, file.files),
            }
        }

        return addDependencyCountToFile(projectDeps, file)
    })

    const files = walkSync(dirPath, [], options)
    // First run of all files: generate complexity & coverage metrics
    const firstRunResults = addComplexityToProject(files)
    // Second run: generate timesDependedOn (can only be calculated after first run)
    const projectDeps = getProjectDeps(firstRunResults)
    const secondRunResults = addDependencyCounts(projectDeps, firstRunResults)

    return {
        results: secondRunResults
    }
}

const codehawk = {
    analyzeProject,
}

module.exports = codehawk
