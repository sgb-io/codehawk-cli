import fs from 'fs'
import path from 'path'
import { analyzeProject } from './codehawk'

const SAMPLES = [
  'react-component',
  'react-component-flow',
  'simple-class',
  'simple-es6-imports',
  'react-component-typescript',
  'contains-some-bad-code',
  'sweetalert',
]

SAMPLES.forEach((sample) => {
  const samplePath = path.resolve(__dirname, '..', 'samples', sample)
  const output = analyzeProject(samplePath)
  const expectedPath = samplePath + path.sep + 'expected.json'
  fs.writeFileSync(expectedPath, JSON.stringify(output, null, 2))
  console.log(`Wrote ${expectedPath}.`)
})

console.log('Complete.')
