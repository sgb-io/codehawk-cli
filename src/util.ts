import * as fs from 'fs'
import * as path from 'path'
import slash from 'slash'
import isDotfile from 'is-dotfile'
import isDotdir from 'is-dotdir'
import type { AssembledOptions, AnalyzedEntity, AnyAnalyzedFile } from './types'

const shouldSkip = (
  relativeDir: string,
  skipDirectories: string[]
): boolean => {
  for (let i = 0; i < skipDirectories.length; i += 1) {
    if (relativeDir.startsWith(skipDirectories[i])) {
      return true
    }
  }

  return false
}

const isBlocklisted = (
  relativeDir: string,
  filename: string,
  options: AssembledOptions
): boolean => {
  const { excludeDirectories, excludeFilenames } = options

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

export const getFsEntity = (fullPath: string): fs.Stats | null => {
  let dirent = null

  try {
    dirent = fs.statSync(fullPath)
  } catch (e) {
    // Ingore the error
    // Scenarios this catches: symlinks or otherwise inaccessible directories
  }

  return dirent
}

export const flattenEntireTree = <T extends AnyAnalyzedFile>(
  items: AnalyzedEntity[]
): T[] => {
  let flattened: T[] = []
  items.forEach((item) => {
    if (item.type === 'dir') {
      flattened = flattened.concat(flattenEntireTree<T>(item.files))
    } else {
      flattened.push(item as T)
    }
  })

  return flattened
}

// Should the dir/file show at all in results?
export const shouldSeeEntity = (
  dir: string,
  item: string,
  options: AssembledOptions
): boolean => {
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

// Should the dir/file have complexity analysis run?
export const shouldAnalyzeEntity = (
  dir: string,
  item: string,
  options: AssembledOptions
): boolean => {
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

  if (!options.extensions.includes(extension)) {
    return false
  }

  if (isBlocklisted(relativeDir, filename, options)) {
    return false
  }

  return true
}
