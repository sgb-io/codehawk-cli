import { badgen } from 'badgen'
import fs from 'fs'
import slash from 'slash'
import type { Results } from './codehawk'

const getBadgeColor = (percent: number): string => {
  let color = 'e05d44' // 'red';

  if (percent > 15) color = 'fe7d37' // 'orange';
  if (percent > 30) color = 'dfb317' // 'yellow';
  if (percent > 40) color = 'a4a61d' // 'yellowgreen';
  if (percent > 55) color = '97ca00' // 'green';
  if (percent > 65) color = '4c1' // 'brightgreen';

  return color
}

export const generateBadge = (results: Results): void => {
  const { average, worst } = results.summary
  const { badgesDirectory } = results.options
  const badgesPath = badgesDirectory[0] || '' // Fall back to root
  const actualPath = slash(process.cwd()) + badgesPath

  if (badgesPath !== '' && !fs.existsSync(actualPath)) {
    // Fire a specific error message, but also let the upstream generic handling kick in
    const err = `[codehawk-cli] The directory "${badgesPath}" does not exist, please create it in order to generate badges.`
    console.error(err)
    throw new Error(err)
  }

  try {
    fs.writeFileSync(
      `${actualPath}/avg-maintainability.svg`,
      badgen({
        label: 'maintainability (avg)',
        status: `${average.toFixed(2)}`,
        color: getBadgeColor(average),
      }),
      'utf8'
    )
  } catch (error) {
    console.error(error)
  }

  try {
    fs.writeFileSync(
      `${actualPath}/worst-maintainability.svg`,
      badgen({
        label: 'maintainability (worst)',
        status: `${worst.toFixed(2)}`,
        color: getBadgeColor(worst),
      }),
      'utf8'
    )
  } catch (error) {
    console.error(error)
  }
}
