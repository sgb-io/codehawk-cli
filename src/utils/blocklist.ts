import type { AssembledOptions } from '../types'

export const isBlocklisted = (
  relativeDir: string,
  filename: string,
  options: AssembledOptions
): boolean => {
  const { excludeDirectories, excludeFilenames, excludeExact } = options

  // Check for blocklisted directories
  if (excludeDirectories) {
    for (let i = 0; i < excludeDirectories.length; i += 1) {
      if (relativeDir.startsWith(excludeDirectories[i])) {
        return true
      }
    }
  }

  // Check for blocklisted filename matches
  if (excludeFilenames) {
    for (let i = 0; i < excludeFilenames.length; i += 1) {
      if (filename.includes(excludeFilenames[i])) {
        return true
      }
    }
  }

  // Check for exact matches
  if (excludeExact) {
    for (let i = 0; i < excludeExact.length; i += 1) {
      if (excludeExact[i] === `${relativeDir}/${filename}`) {
        return true
      }
    }
  }

  return false
}
