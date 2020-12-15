const { getConfiguration } = require('../build/options')

jest.mock('fs');

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

      require('fs').__codehawkConfigFound(true, mockCodehawkJson)

      const config = getConfiguration('/home/')

      expect(config).toEqual(mockCodehawkJson);
    })
  })

  describe('and codehawk.json can not be found', () => {
    it('should use the configuration defined in package.json', () => {
      const mockCodehawkJson = {
        boo: 'spooked',
        happiness: 5,
      }

      require('fs').__codehawkConfigFound(false, {
        codehawk: mockCodehawkJson,
      })

      const config = getConfiguration('/home/')

      expect(config).toEqual(mockCodehawkJson)
    })

    it('should throw an error when package.json contains no codehawk config' , () => {
      require('fs').__codehawkConfigFound(false, {})

      expect(() => getConfiguration('/home/')).toThrow()
    })
  })
});
