import type { AnalyzedEntity, AnyAnalyzedFile } from '../types'

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
