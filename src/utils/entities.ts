import * as fs from 'fs'
import * as path from 'path'
import slash from 'slash'
import isDotfile from 'is-dotfile'
import isDotdir from 'is-dotdir'
import type { AssembledOptions } from '../types'
import { isBlocklisted } from './blocklist'

const shouldSkipDir = (
  relativeDir: string,
  skipDirectories: string[]
): boolean => {
  for (let i = 0; i < skipDirectories.length; i += 1) {
    if (
      relativeDir.startsWith(skipDirectories[i]) ||
      `${relativeDir}/`.startsWith(skipDirectories[i])
    ) {
      return true
    }
  }

  return false
}

const isDotEntity = (fullPath: string): boolean => {
  const dotDir = isDotdir(fullPath) || isDotdir(slash(fullPath))
  const dotFile = isDotfile(fullPath) || isDotfile(slash(fullPath))
  return dotDir || dotFile
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

// Should the dir/file show at all in results?
export const shouldSeeEntity = ({
  dir,
  entity,
  filename,
  fullPath,
  options,
  relativeDir,
}: {
  dir: string
  entity: fs.Stats | null
  filename: string
  fullPath: string
  options: AssembledOptions
  relativeDir: string
}): boolean => {
  // Is a symlink, or other un-readable entity?
  if (!entity) {
    return false
  }

  // Exclude dot directories/files
  if (isDotEntity(fullPath)) {
    return false
  }

  // Is a directory?
  if (entity.isDirectory() && options.skipDirectories) {
    return !shouldSkipDir(relativeDir, options.skipDirectories)
  }

  // Is codehawk config?
  if (filename === 'codehawk.json') {
    return false
  }

  // Is it a file in a directory that should be skipped?
  if (
    options.skipDirectories &&
    shouldSkipDir(relativeDir, options.skipDirectories)
  ) {
    return false
  }

  return true
}

// Should the dir/file have complexity analysis run?
export const shouldAnalyzeEntity = ({
  entity,
  filename,
  fullPath,
  options,
  relativeDir,
}: {
  entity: fs.Stats | null
  filename: string
  fullPath: string
  options: AssembledOptions
  relativeDir: string
}): boolean => {
  const extension = path.extname(filename)

  // Is a symlink, or other un-readable entity?
  if (!entity) {
    return false
  }

  // Exclude dot directories/files
  if (isDotEntity(fullPath)) {
    return false
  }

  // Is a directory?
  if (entity.isDirectory()) {
    return true
  }

  // Is the extension included in the options?
  if (options.extensions && !options.extensions.includes(extension)) {
    return false
  }

  // Is the path/filename excluded by user options?
  if (isBlocklisted(relativeDir, filename, options)) {
    return false
  }

  return true
}
