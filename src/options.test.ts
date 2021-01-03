import * as fs from 'fs'
import { mocked } from 'ts-jest/utils'

import { getConfiguration } from './options'

jest.mock('fs')

const mockedFs = mocked(fs, true)

describe('when attempting to get the configuration for codehawk', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('and codehawk.json can be found', () => {
    it('should use the configuration defined in codehawk.json', () => {
      const mockCodehawkJson = {
        thing: true,
        good: 'yes',
      }

      mockedFs.existsSync.mockReturnValue(true)
      mockedFs.readFileSync.mockReturnValue(JSON.stringify(mockCodehawkJson))

      const config = getConfiguration('/home/')

      expect(config).toEqual(mockCodehawkJson)
    })
  })

  describe('and codehawk.json can not be found', () => {
    it('should use the configuration defined in package.json', () => {
      const mockCodehawkJson = {
        boo: 'spooked',
        happiness: 5,
      }

      mockedFs.existsSync.mockReturnValueOnce(false)
      mockedFs.readFileSync.mockReturnValue(
        JSON.stringify({
          codehawk: mockCodehawkJson,
        })
      )

      const config = getConfiguration('/home/')

      expect(config).toEqual(mockCodehawkJson)
    })

    it('should throw an error when package.json contains no codehawk config', () => {
      mockedFs.existsSync.mockReturnValue(false)
      mockedFs.readFileSync.mockReturnValue(JSON.stringify({}))
      expect(() => getConfiguration('/home/')).toThrow()
    })
  })
})
