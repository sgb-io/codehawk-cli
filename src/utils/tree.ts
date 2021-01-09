import type {
  AnalyzedEntity,
  AnyAnalyzedFile,
  FullyAnalyzedEntity,
  FullyAnalyzedFile,
} from '../types'

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

export const getResultsAsList = (
  analyzedEntities: FullyAnalyzedEntity[],
  limit?: number
): FullyAnalyzedFile[] => {
  const flatFileResults: FullyAnalyzedFile[] = flattenEntireTree<
    FullyAnalyzedFile
  >(analyzedEntities)
    .filter((entity) => {
      return entity.type === 'file' && !!entity.complexityReport
    })
    // Sort by codehawk score, ascending (most complex files are first in the list)
    .sort((entityA, entityB) => {
      return (
        entityA.complexityReport.codehawkScore -
        entityB.complexityReport.codehawkScore
      )
    })

  return limit ? flatFileResults.slice(0, limit) : flatFileResults
}
