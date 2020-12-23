import { badgen } from 'badgen'
import fs from 'fs'
import type { ResultsSummary } from './codehawk'

const getBadgeColor = (percent: number): string => {
  let color = 'e05d44' // 'red';

  if (percent > 15) color = 'fe7d37' // 'orange';
  if (percent > 30) color = 'dfb317' // 'yellow';
  if (percent > 40) color = 'a4a61d' // 'yellowgreen';
  if (percent > 55) color = '97ca00' // 'green';
  if (percent > 65) color = '4c1' // 'brightgreen';

  return color
}

export const generateBadge = (resultsSummary: ResultsSummary): void => {
  const { average, worst } = resultsSummary
  try {
    fs.writeFileSync(
      'generated/avg-maintainability.svg',
      badgen({
        label: 'maintainability',
        status: `${average}`,
        color: getBadgeColor(average),
      }),
      'utf8'
    )
  } catch (error) {
    console.error(error)
  }

  try {
    fs.writeFileSync(
      'generated/worst-maintainability.svg',
      badgen({
        label: 'maintainability',
        status: `${worst}`,
        color: getBadgeColor(worst),
      }),
      'utf8'
    )
  } catch (error) {
    console.error(error)
  }
}
