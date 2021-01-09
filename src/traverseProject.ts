import * as fs from 'fs'
import * as path from 'path'
import slash from 'slash'
import { getFsEntity, shouldSeeEntity, shouldAnalyzeEntity } from './utils'
import type {
  AssembledOptions,
  ParsedEntity,
  ParsedDirectory,
  ParsedFile,
} from './types'
import { transpileFileSource } from './analyze'

// dir can be string or dir
export const walkSync = (
  dir: string,
  options: AssembledOptions
): ParsedEntity[] => {
  const fileList: ParsedEntity[] = []
  const items = fs.readdirSync(dir)
  const parsedEntities = items.map((filename) => ({
    filename,
    fullPath: path.join(dir, filename),
    entity: getFsEntity(path.join(dir, filename)),
    relativeDir: slash(dir).replace(slash(process.cwd()), '')
  }))
  const visibleEntities = parsedEntities.filter((item) => shouldSeeEntity({
    filename: item.filename,
    dir,
    fullPath: item.fullPath,
    entity: item.entity,
    options,
    relativeDir: item.relativeDir
  }))

  visibleEntities.forEach((item) => {
    const { fullPath, filename, entity, relativeDir } = item
    const baseParsedEntity = {
      fullPath: slash(item.fullPath),
      filename,
      shouldAnalyze: shouldAnalyzeEntity({
        entity,
        filename,
        fullPath,
        options,
        relativeDir,
      }),
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
        path: slash(dir),
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

export const getFileContents = (
  fullPath: string,
  enableFlow: boolean
): string => {
  // see https://stackoverflow.com/questions/190852/how-can-i-get-file-extensions-with-javascript/12900504#12900504
  const filename = path.basename(fullPath)
  const extension = path.extname(filename)

  const contents = fs.readFileSync(fullPath, 'utf8')

  // TypeScript support
  const isTypescript = extension === '.ts' || extension === '.tsx'

  return transpileFileSource(contents, extension, isTypescript, enableFlow)
}
