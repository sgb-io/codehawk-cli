import { isBlocklisted } from './util'
import { buildOptions } from './options'

const options = buildOptions({
  excludeExact: ['/src/foo/excluded.ts'],
})

describe('util', () => {
  describe('isBlocklisted', () => {
    describe('excludeFilenames - blocks the default cases, allows others', () => {
      it('.d.ts', () => {
        expect(isBlocklisted('/src/foo', 'index.d.ts', options)).toEqual(true)
        expect(isBlocklisted('/src/foo', 'ends-with-d.ts', options)).toEqual(
          false
        )
      })

      it('.min.js', () => {
        expect(isBlocklisted('/src/foo', 'index.min.js', options)).toEqual(true)
        expect(isBlocklisted('/src/foo', 'index-min.js', options)).toEqual(
          false
        )
      })

      it('.bundle.js', () => {
        expect(isBlocklisted('/src/foo', 'bundle.min.js', options)).toEqual(
          true
        )
        expect(isBlocklisted('/src/foo', 'bundle-min.js', options)).toEqual(
          false
        )
      })
    })

    describe('excludeDirectories - blocks the default cases, allows others', () => {
      it('/dist', () => {
        expect(isBlocklisted('/src/foo', 'index.ts', options)).toEqual(false)
        expect(isBlocklisted('/src/dist/foo', 'index.ts', options)).toEqual(
          false
        )
        expect(isBlocklisted('/dist/foo', 'index.ts', options)).toEqual(true)
      })

      it('/bin', () => {
        expect(isBlocklisted('/src/foo', 'index.ts', options)).toEqual(false)
        expect(isBlocklisted('/src/bin/foo', 'index.ts', options)).toEqual(
          false
        )
        expect(isBlocklisted('/bin/foo', 'index.ts', options)).toEqual(true)
      })

      it('/build', () => {
        expect(isBlocklisted('/src/foo', 'index.ts', options)).toEqual(false)
        expect(isBlocklisted('/src/build/foo', 'index.ts', options)).toEqual(
          false
        )
        expect(isBlocklisted('/build/foo', 'index.ts', options)).toEqual(true)
      })
    })

    describe('excludeExact', () => {
      it('excludes an exact match', () => {
        expect(isBlocklisted('/src/foo', 'bar.ts', options)).toEqual(false)
        expect(isBlocklisted('/src/foo', 'excluded.ts', options)).toEqual(true)
      })
    })
  })
})
