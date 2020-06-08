import * as fs from "fs"
import * as path from "path"
import slash from "slash"
import babel from "@babel/core"
import flowRemoveTypes from "flow-remove-types"
import { getFsEntity, shouldSeeEntity, shouldAnalyzeEntity } from "./util"
import { AssembledOptions, ParsedEntity, ParsedDirectory, ParsedFile } from "./types"

// dir can be string or dir
export const walkSync = (dir: string, options: AssembledOptions): Array<ParsedEntity> => {
    const fileList: Array<ParsedEntity> = []
    const items = fs.readdirSync(dir)
    const visibleEntities = items.filter(i => shouldSeeEntity(dir, i, options))

    visibleEntities.forEach((item) => {
        const fullPath = path.join(dir, item)
        const entity = getFsEntity(fullPath)
        const baseParsedEntity = {
            path: slash(dir),
            fullPath: slash(fullPath),
            filename: item,
            shouldAnalyze: shouldAnalyzeEntity(dir, item, options)
        }

        if (entity.isDirectory()) {
            fileList.push({
                ...baseParsedEntity,
                type: 'dir',
                files: walkSync(fullPath, options),
            } as ParsedDirectory)
        } else {
            fileList.push({
                ...baseParsedEntity,
                type: 'file',
            } as ParsedFile)
        }
    })

    // Sort by directories first, then alphabetically
    // Required for windows consistency, helps for display
    const sorted = fileList.sort((a, b) => {
        if (a.type === b.type) {
            return a.filename.toLowerCase() > b.filename.toLowerCase() ? 1 : -1
        }

        return a.type > b.type ? 1 : -1
    })

    return sorted
}

export const getFileContents = (fullPath: string): string => {
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

