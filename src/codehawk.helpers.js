const fs = require('fs')
const path = require('path')
const flowRemoveTypes = require('flow-remove-types')
const babel = require('@babel/core')
const isDotfile = require('is-dotfile')
const isDotdir = require('is-dotdir')
const slash = require('slash')
const escomplexReporter = require('./reporters/escomplex')

const {
    NODE_ENV,
} = process.env

const buildOptions = (baseOptions, projectOptions) => {
    const options = {}
    Object.keys(baseOptions).forEach((optionKey) => {
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

const shouldSkip = (relativeDir, skipDirectories) => {
    for (let i = 0; i < skipDirectories.length; i += 1) {
        if (relativeDir.startsWith(skipDirectories[i])) {
            return true
        }
    }

    return false
}

const isBlacklisted = (relativeDir, filename, options) => {
    const {
        excludeDirectories,
        excludeFilenames,
    } = options

    // Check for blacklisted directories
    for (let i = 0; i < excludeDirectories.length; i += 1) {
        if (relativeDir.startsWith(excludeDirectories[i])) {
            return true
        }
    }

    // Check for blacklisted filename matches
    for (let i = 0; i < excludeFilenames.length; i += 1) {
        if (filename.match(excludeFilenames[i])) {
            return true
        }
    }

    return false
}

const getFsEntity = (fullPath) => {
    let dirent = null

    try {
        dirent = fs.statSync(fullPath)
    } catch (e) {
        // Ingore the error
        // Scenarios this catches: symlinks or otherwise inaccessible directories
    }

    return dirent
}

// Should the dir/file have complexity analysis run?
const shouldAnalyzeEntity = (dir, item, options) => {
    const fullPath = path.join(dir, item)
    const entity = getFsEntity(fullPath)
    const filename = path.basename(fullPath)
    const extension = path.extname(filename)
    const relativeDir = slash(dir).replace(slash(process.cwd()), '')

    // Is a symlink, or other un-readable entity?
    if (!entity) {
        return false
    }

    // Is a directory?
    if (entity.isDirectory()) {
        // Exclude dot directories, allow all others
        const dotDir = isDotdir(fullPath)
        const dotFile = isDotfile(fullPath) || isDotfile(slash(fullPath))
        if (dotDir || dotFile) {
            return false
        }

        return true
    }

    const dotFile = isDotfile(fullPath) || isDotfile(slash(fullPath))
    if (dotFile) {
        return false
    }

    const isWhitelisted = options.extensions.includes(extension)
    if (!isWhitelisted) {
        return false
    }

    const blacklisted = isBlacklisted(relativeDir, filename, options)
    if (blacklisted) {
        return false
    }

    return true
}

// Should the dir/file show on hawk at all?
const shouldSeeEntity = (dir, item, options) => {
    const fullPath = path.join(dir, item)
    const entity = getFsEntity(fullPath)
    const relativeDir = slash(dir).replace(slash(process.cwd()), '')

    // Is a symlink, or other un-readable entity?
    if (!entity) {
        return false
    }

    // Is a directory?
    if (entity.isDirectory()) {
        // Exclude dot directories, allow all others
        const dotDir = isDotdir(fullPath) || isDotdir(slash(fullPath))
        const dotFile = isDotfile(fullPath) || isDotfile(slash(fullPath))
        if (dotDir || dotFile) {
            return false
        }

        return true
    }

    // Is a dotfile?
    const dotFile = isDotfile(fullPath) || isDotfile(slash(fullPath))
    if (dotFile) {
        return false
    }

    // Is codehawk config?
    if (item === 'codehawk.json') {
        return false
    }

    // Skip directories according to config
    if (shouldSkip(relativeDir, options.skipDirectories)) {
        return false
    }

    return true
}

const analyzeFile = (dirPath, file, projectCoverage) => {
    let report = null
    const relativeFilePath = `${file.path}/${file.filename}`.replace(dirPath, '')
    const coverageData = projectCoverage.find(c => c.path === relativeFilePath)

    let fileCoverage = 0

    if (coverageData) {
        // Coverage can have a bug where 0 things have 100% coverage
        const linesPct = coverageData.coverage.lines.total === 0 ? 0 : coverageData.coverage.lines.pct
        const fnPct = coverageData.coverage.functions.total === 0 ? 0 : coverageData.coverage.functions.pct
        const stmntPct = coverageData.coverage.statements.total === 0 ? 0 : coverageData.coverage.statements.pct
        const branchPct = coverageData.coverage.branches.total === 0 ? 0 : coverageData.coverage.branches.pct

        // Average the four coverage types.
        fileCoverage = ((
            linesPct +
            fnPct +
            stmntPct +
            branchPct
        ) / 4).toFixed(2)
    }

    let trimmed
    try {
        trimmed = file.rawSource.toString().trim()
    } catch (e) {
        console.error(`Unable to read source of "${file.path}/${file.filename}", skipping`)
    }

    try {
        const complexityReport = escomplexReporter(trimmed, file.options)
        if (complexityReport) {
            report = {
                ...complexityReport,
                coverage: fileCoverage,
            }
        }
    } catch (e) {
        console.error(`Unable to parse "${file.path}/${file.filename}", skipping`)
        if (NODE_ENV !== 'production') {
            // Print out  what is attempting to be evaluated
            // Exposes bugs such as flow-remove-types not working correctly
            // Note: if you see flow types in here, they have not been stripped correctly
            console.error(e)
            console.log('\n\n')
            console.error(trimmed)
            console.log('\n\n')
        }
        // No clear API for capturing a SyntaxError, also we don't know if it'll always be that.
    }

    return report
}

const walkSync = (dir, filelist = [], options) => {
    const items = fs.readdirSync(dir)
    const visibleEntities = items.filter(i => shouldSeeEntity(dir, i, options))

    visibleEntities.forEach((item) => {
        const fullPath = path.join(dir, item)
        const entity = getFsEntity(fullPath)

        let outputItem
        if (entity.isDirectory()) {
            outputItem = {
                type: 'dir',
                fullPath: slash(fullPath),
                filename: item,
                files: walkSync(fullPath, dir.files, options),
                shouldAnalyze: shouldAnalyzeEntity(dir, item, options)
            }
        } else {
            outputItem = {
                type: 'file',
                fullPath: slash(fullPath),
                path: slash(dir),
                filename: item,
                shouldAnalyze: shouldAnalyzeEntity(dir, item, options)
            }
        }

        if (outputItem.type === 'file') {
            filelist.push(outputItem)
        } else {
            filelist.push(outputItem)
        }
    })

    // Sort by directories first, then alphabetically
    // Required for windows consistency, helps for display
    const sorted = filelist.sort((a, b) => {
        if (a.type === b.type) {
            return a.filename.toLowerCase() > b.filename.toLowerCase() ? 1 : -1
        }

        return a.type > b.type ? 1 : -1
    })

    return sorted
}

const getFileContents = (fullPath) => {
    // https://stackoverflow.com/questions/190852/how-can-i-get-file-extensions-with-javascript/12900504#12900504
    const filename = path.basename(fullPath)
    const extension = path.extname(filename)

    let contents = ''
    try {
        contents = fs.readFileSync(fullPath, 'utf8')

        // TypeScript support
        const isTypescript = extension === '.ts' || extension === '.tsx'
        if (isTypescript) {
            const transformed = babel.transform(contents, {
                plugins: [
                    '@babel/plugin-transform-typescript'
                ]
            })
            contents = transformed.code
        } else {
            // Assume no other static type systems exist
            // Stripping flow types should be safe, even if it's not strictly flow
            contents = flowRemoveTypes(contents, { pretty: true }).toString()
        }
    } catch (e) {
        // Note that this is also caught in a wrapping `catch`, so error handling should be done there
        return contents
    }

    return contents
}

const getCoverage = (dirPath) => {
    let coverage = []

    try {
        const contents = fs.readFileSync(`${dirPath}/coverage/coverage-summary.json`, 'utf8')
        const coveredFiles = JSON.parse(contents)
        coverage = Object.keys(coveredFiles).map((file) => ({
            path: file.replace(dirPath, ''),
            coverage: coveredFiles[file]
        }))
    } catch (e) {
        console.error(`
            Coverage not found, please generate it using instanbul/nyc.
            We expect the json-summary format (coverage/coverage-summary.json).
            If you don't have any tests, you can still continue.
        `)
    }

    return coverage
}

const flattenEntireTree = (items) => {
    let flattened = []
    items.forEach((item) => {
        flattened.push(item)

        if (item.type === 'dir') {
            flattened = flattened.concat(flattenEntireTree(item.files))
        }
    })

    return flattened
}

// Gathers all the dependencies as a flat array of strings across all analyzed files
// Note: duplicates are not removed (intentional)
const getProjectDeps = (firstRunResults) => {
    const flatItems = flattenEntireTree(firstRunResults)
    const allAbsoluteDeps = []
    for (let i = 0; i < flatItems.length; i += 1) {
        const item = flatItems[i]
        if (item.complexityReport) {
            for (let n = 0; n < item.complexityReport.dependencies.length; n += 1) {
                const dep = flatItems[i].complexityReport.dependencies[n]
                const depPath = path.resolve(item.path, dep.path)
                allAbsoluteDeps.push(depPath)
            }
        }
    }

    return allAbsoluteDeps
}

// Matches a full list of dependencies against a file to count how many times it is depended on
const getTimesDependedOn = (projectDeps, filePath) => {
    const timesDependedOn = projectDeps.filter((d) => {
        const fileNameWithoutExtension = path.basename(filePath).split('.').slice(0, -1).join('.')
        // Windows compatibility (unix-style slashes, plus remove the root drive)
        const cleanD = slash(d).replace(/\w\:/, '')
        
        // Match exactly, or fall back to index (index is a reserved case in nodejs)
        // Note: by design, only javascript dependencies are counted (e.g. svg imports will not count as a TDO)
        const fullMatch = cleanD === `${path.dirname(filePath)}/${fileNameWithoutExtension}`
        const defaultImportMatch = new RegExp(`${cleanD}/index.(js|ts|tsx|jsx)`, 'i')
        const namedImportMatch = new RegExp(`${cleanD}/`, 'i')
        const indexMatch = filePath.match(defaultImportMatch) || filePath.match(namedImportMatch)

        return fullMatch || indexMatch
    })

    return timesDependedOn.length
}

module.exports = {
    buildOptions,
    analyzeFile,
    walkSync,
    getFileContents,
    getCoverage,
    getTimesDependedOn,
    getProjectDeps,
}
