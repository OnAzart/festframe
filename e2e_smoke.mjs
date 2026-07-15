import { mkdir, readFile, stat } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import { chromium } from 'playwright'

const output = '/tmp/daymark-e2e'
const baseUrl = 'http://127.0.0.1:4178'
let ownedServer

async function isServerReady() {
  try {
    const response = await fetch(baseUrl)
    return response.ok
  } catch {
    return false
  }
}

if (!(await isServerReady())) {
  ownedServer = spawn(process.execPath, ['./node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '4178'], {
    stdio: 'ignore',
    env: { ...process.env, VITE_E2E_AUTH_BYPASS: 'true' },
  })
  for (let attempt = 0; attempt < 60 && !(await isServerReady()); attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 250))
  }
  if (!(await isServerReady())) {
    ownedServer.kill('SIGTERM')
    throw new Error('FestFrame test server did not start')
  }
}

process.on('exit', () => ownedServer?.kill('SIGTERM'))
await mkdir(output, { recursive: true })

const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true })
const page = await context.newPage()
await page.goto(baseUrl, { waitUntil: 'networkidle' })
await page.getByLabel('Your email').fill('tester@example.com')
await page.getByRole('button', { name: 'Plan My Fest' }).click()
await page.getByRole('heading', { name: 'Build your day' }).waitFor()
const stageOptions = page.locator('.stage-select option')
if (await stageOptions.nth(1).textContent() !== 'MAINSTAGE') throw new Error('Mainstage was not first')
if (await stageOptions.nth(2).textContent() !== 'FREEDOM BY BUD') throw new Error('Freedom was not second')
await page.locator('.timeline-track').first().waitFor()
if (await page.locator('.timeline-time-rail time').first().textContent() !== '12:00') throw new Error('Timeline did not start at the first performance hour')
const longTimelineCard = page.locator('.timeline-set').filter({ hasText: 'Hardwell' }).first()
const artistBox = await longTimelineCard.locator('h3').boundingBox()
const controlsBox = await longTimelineCard.locator('.priority-control').boundingBox()
if (!artistBox || !controlsBox || artistBox.x + artistBox.width > controlsBox.x) throw new Error('Timeline artist name overlaps priority controls')
await page.getByRole('button', { name: 'Photo board' }).click()
await page.locator('.board-event-bar').getByText('TOMORROWLAND BELGIUM 2026', { exact: true }).waitFor()
await page.getByPlaceholder('Search artists or stages').fill('Hardwell')
await page.locator('.board-card').first().waitFor()
if (!(await page.locator('.board-card .board-content time').first().textContent())?.startsWith('00:00')) throw new Error('Post-midnight Hardwell set was not grouped into Friday')
await page.getByPlaceholder('Search artists or stages').fill('Jop Govers')
await page.locator('.board-card').first().locator('.priority-control button').first().click()
await page.getByPlaceholder('Search artists or stages').fill('DISCOVERY')
await page.locator('.board-card').first().locator('.priority-control button').first().click()
await page.getByText('2 saved sets overlap').waitFor()
await page.getByPlaceholder('Search artists or stages').fill('')
await page.locator('.board-card').first().waitFor()
await page.locator('.board-card img').first().waitFor()
if (await page.locator('.board-stage-heading h3').first().textContent() !== 'MAINSTAGE') throw new Error('Board Mainstage group was not first')
if (await page.locator('.board-stage-heading h3').nth(1).textContent() !== 'FREEDOM BY BUD') throw new Error('Board Freedom group was not second')
await page.screenshot({ path: `${output}/board.png`, fullPage: true })
await page.getByRole('button', { name: 'Timeline view' }).click()
await page.locator('.timeline-track').first().waitFor()
if (await page.locator('.timeline-stage-name').nth(0).textContent() !== 'MAINSTAGE') throw new Error('Timeline Mainstage was not first')
if (await page.locator('.timeline-stage-name').nth(1).textContent() !== 'FREEDOM BY BUD') throw new Error('Timeline Freedom was not second')
await page.screenshot({ path: `${output}/timeline.png`, fullPage: true })
await page.getByRole('button', { name: 'My Schedule' }).click()
await page.locator('.schedule-scroll').waitFor()
if (await page.locator('.schedule-set').count() !== 2) throw new Error('My Schedule did not show exactly the selected sets')
if (await page.locator('.schedule-scroll .timeline-stage-name').count() !== 2) throw new Error('My Schedule included an empty stage')
await page.screenshot({ path: `${output}/my-schedule.png`, fullPage: true })
await page.getByRole('button', { name: 'Photo board' }).click()
for (const [priority, startTime] of ['14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'].entries()) {
  const matchingCard = page.locator('.board-card').filter({ has: page.locator('.board-content time', { hasText: startTime }) }).first()
  await matchingCard.locator('.priority-control button').nth(priority % 3).click()
}
await page.getByRole('button', { name: 'Export' }).click()
await page.getByRole('dialog').waitFor()
const previewBox = await page.locator('.iphone-export.is-previewing .iphone-card').boundingBox()
if (!previewBox || previewBox.x < 0 || previewBox.width < 150) throw new Error('Wallpaper preview is not visible beside the export dialog')
const wallpaperSafeArea = await page.locator('.iphone-export.is-previewing .iphone-card').evaluate((card) => {
  const timeline = card.querySelector('.wallpaper-timeline')
  const sets = [...card.querySelectorAll('.wallpaper-set')]
  if (!timeline) return null
  const cardBox = card.getBoundingClientRect()
  const timelineBox = timeline.getBoundingClientRect()
  return {
    timelineBottomRatio: (timelineBox.bottom - cardBox.top) / cardBox.height,
    allSetsVisible: sets.every((set) => {
      const box = set.getBoundingClientRect()
      return box.top >= timelineBox.top - 1 && box.bottom <= timelineBox.bottom + 1
    }),
    stageLabelsVisible: sets.every((set) => {
      const label = set.querySelector('span')
      return label && getComputedStyle(label).display !== 'none' && Boolean(label.textContent?.trim())
    }),
    priorityMarkersVisible: sets.every((set) => {
      const style = getComputedStyle(set)
      return Number.parseFloat(style.borderLeftWidth) >= 4 && Number.parseFloat(style.borderTopWidth) === 0
    }),
    priorityMarkerColors: [...new Set(sets.map((set) => getComputedStyle(set).borderLeftColor))],
    priorityLegend: [...card.querySelectorAll('.wallpaper-priority-legend span')].map((item) => item.textContent?.trim()),
  }
})
if (!wallpaperSafeArea || wallpaperSafeArea.timelineBottomRatio > 0.76 || !wallpaperSafeArea.allSetsVisible) throw new Error('Wallpaper schedule leaves the iPhone safe area')
if (!wallpaperSafeArea.stageLabelsVisible || !wallpaperSafeArea.priorityMarkersVisible || wallpaperSafeArea.priorityMarkerColors.length < 3) throw new Error('Wallpaper is missing stage or priority signals')
if (wallpaperSafeArea.priorityLegend.join(',') !== 'Must,Want,Maybe') throw new Error('Wallpaper priority legend is missing')

let downloadPromise = page.waitForEvent('download')
await page.getByRole('button', { name: 'Calendar file Google, Apple & Outlook' }).click()
await (await downloadPromise).saveAs(`${output}/plan.ics`)
downloadPromise = page.waitForEvent('download')
await page.getByRole('button', { name: 'Print-ready PDF One clean daily rundown' }).click()
await (await downloadPromise).saveAs(`${output}/plan.pdf`)
downloadPromise = page.waitForEvent('download')
await page.getByRole('button', { name: 'Lock-screen image iPhone 17 / 17 Pro · 1206×2622' }).click()
await (await downloadPromise).saveAs(`${output}/botanical-consciousness-timeline.png`)
await page.getByRole('button', { name: 'Consciousness' }).click()
downloadPromise = page.waitForEvent('download')
await page.getByRole('button', { name: 'Lock-screen image iPhone 17 / 17 Pro · 1206×2622' }).click()
await (await downloadPromise).saveAs(`${output}/consciousness-desert-timeline.png`)
await page.screenshot({ path: `${output}/desktop.png`, fullPage: true })

const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 } })
const mobilePage = await mobileContext.newPage()
await mobilePage.goto(baseUrl, { waitUntil: 'networkidle' })
await mobilePage.getByRole('button', { name: 'Skip for now' }).click()
await mobilePage.getByRole('heading', { name: 'Build your day' }).waitFor()
const mobileLegend = mobilePage.locator('.priority-legend')
for (const label of ['Must', 'Want', 'Maybe']) {
  if (!(await mobileLegend.getByText(label, { exact: true }).isVisible())) throw new Error(`${label} legend is missing on mobile`)
}
const mobileBoardCard = mobilePage.locator('.board-card').first()
await mobileBoardCard.waitFor()
await mobileBoardCard.click()
if (!(await mobileBoardCard.locator('button[aria-label="Want"]').getAttribute('class'))?.includes('selected')) throw new Error('Clicking an artist did not default to Want')
await mobilePage.getByRole('button', { name: 'Timeline view' }).click()
const mobileHourBox = await mobilePage.locator('.timeline-time-rail time').first().boundingBox()
const mobileHeaderBox = await mobilePage.locator('.timeline-corner').boundingBox()
if (!mobileHourBox || !mobileHeaderBox || mobileHourBox.y < mobileHeaderBox.y + mobileHeaderBox.height) throw new Error('Mobile timeline start time is clipped by its header')
await mobilePage.getByRole('button', { name: 'Photo board' }).click()
await mobilePage.locator('.board-card').first().waitFor()
await mobilePage.getByRole('button', { name: 'My Schedule' }).click()
await mobilePage.locator('.schedule-scroll').waitFor()
if (await mobilePage.locator('.schedule-set').count() !== 1) throw new Error('My Schedule is incorrect on mobile')
await mobilePage.screenshot({ path: `${output}/mobile.png`, fullPage: true })

for (const file of ['plan.ics', 'plan.pdf', 'consciousness-desert-timeline.png', 'botanical-consciousness-timeline.png']) {
  if ((await stat(`${output}/${file}`)).size < 200) throw new Error(`${file} was unexpectedly small`)
}
for (const file of ['consciousness-desert-timeline.png', 'botanical-consciousness-timeline.png']) {
  const png = await readFile(`${output}/${file}`)
  if (png.readUInt32BE(16) !== 1206 || png.readUInt32BE(20) !== 2622) throw new Error(`${file} is not sized for iPhone 17 / 17 Pro`)
}
const calendar = await readFile(`${output}/plan.ics`, 'utf8')
if (!/DTSTART:\d{8}T\d{6}Z/.test(calendar)) throw new Error('Calendar export is missing a valid UTC event start')
if (!calendar.endsWith('END:VCALENDAR\r\n')) throw new Error('Calendar export is missing its final line ending')
await browser.close()
ownedServer?.kill('SIGTERM')
