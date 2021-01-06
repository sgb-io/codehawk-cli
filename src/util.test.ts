import { isBlocklisted } from './util'
import { buildOptions } from './options'

// const defaultBlockedFilenames = ['.d.ts', '.min.js', '.bundle.js']
const options = buildOptions({})

describe('util', () => {
  describe('isBlocklisted', () => {
    describe('blocks the default cases, allows others', () => {
      it('.d.ts', () => {
        expect(isBlocklisted('src/foo', 'index.d.ts', options)).toEqual(true)

        expect(isBlocklisted('src/foo', 'ends-with-d.ts', options)).toEqual(
          false
        )
      })

      it('.min.js', () => {
        expect(isBlocklisted('src/foo', 'index.min.js', options)).toEqual(true)

        expect(isBlocklisted('src/foo', 'index-min.js', options)).toEqual(false)
      })

      it('.bundle.js', () => {
        expect(isBlocklisted('src/foo', 'bundle.min.js', options)).toEqual(true)

        expect(isBlocklisted('src/foo', 'bundle-min.js', options)).toEqual(
          false
        )
      })
    })
  })
})
