import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import path from 'node:path'
import { chromium } from 'playwright'

const root = process.cwd()
const output = path.join(root, 'marketing/creatives/w2-2026-07-22')
const sourceOutput = path.join(output, 'source')
const baseUrl = 'http://127.0.0.1:4182'
let ownedServer

const priorities = {
  '2650690978': 'want',     // Aaron Hibell
  '2650684429': 'like',     // Amber Broos b2b Juliet Fox
  '2650784426': 'critical', // Miss Monique
  '2997900454': 'like',     // John Newman
  '2650778634': 'want',     // Nicky Romero
  '2650665452': 'critical', // James Hype
  '2650692179': 'critical', // Fisher
  '2650778205': 'want',     // Kaskade
  '2650773191': 'want',     // Steve Angello
  '2650772988': 'critical', // Hardwell
  '3065224287': 'like',     // Illenium
}

async function serverReady() {
  try {
    return (await fetch(baseUrl)).ok
  } catch {
    return false
  }
}

async function startServer() {
  if (await serverReady()) return
  ownedServer = spawn(process.execPath, ['./node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '4182'], {
    cwd: root,
    stdio: 'ignore',
    env: { ...process.env, VITE_E2E_AUTH_BYPASS: 'true' },
  })
  for (let attempt = 0; attempt < 80 && !(await serverReady()); attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 250))
  }
  if (!(await serverReady())) throw new Error('Creative capture server did not start')
}

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd: root, stdio: 'inherit' })
    child.on('exit', (code) => code === 0 ? resolve() : reject(new Error(`${command} exited with ${code}`)))
    child.on('error', reject)
  })
}

function dataUrl(buffer) {
  return `data:image/png;base64,${buffer.toString('base64')}`
}

function brand() {
  return '<div class="brand"><b>FEST</b><i></i><i></i><strong>FRAME</strong></div>'
}

function phone(image, className = '') {
  return `<div class="phone ${className}"><div class="island"></div><img src="${image}" alt=""></div>`
}

const sharedCss = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Space+Grotesk:wght@400;500;600;700&display=swap');
  *{box-sizing:border-box} html,body{margin:0;width:100%;height:100%;overflow:hidden}
  body{font-family:'Space Grotesk',Arial,sans-serif;background:#f7f4ec;color:#141a2c}
  .brand{display:flex;align-items:center;gap:8px;font-size:29px;line-height:1;font-weight:700;letter-spacing:0}
  .brand b{color:#f7bf37}.brand strong{color:inherit}.brand i{width:9px;height:9px;border-radius:50%;background:#2bc4b0}
  .brand i+ i{margin-left:-4px;background:#f7bf37}
  .label{font:500 17px 'DM Mono',monospace;letter-spacing:1.5px;color:#667086;text-transform:uppercase}
  h1{margin:0;font-size:76px;line-height:.98;letter-spacing:0;font-weight:650}
  p{margin:0;color:#5f6677;font-size:27px;line-height:1.35}
  .url{font:500 20px 'DM Mono',monospace;color:#141a2c}
  .phone{position:absolute;overflow:hidden;border:14px solid #080b11;border-radius:58px;background:#080b11;box-shadow:0 28px 70px rgba(20,26,44,.28)}
  .phone img{display:block;width:100%;height:100%;object-fit:cover}
  .phone .island{position:absolute;z-index:2;top:13px;left:50%;width:120px;height:34px;transform:translateX(-50%);border-radius:24px;background:#000}
  .accent{position:absolute;background:#2bc4b0}.accent.sun{background:#f7bf37}.accent.coral{background:#ff5b4d}
`

async function renderPage(browser, filename, width, height, body, css = '') {
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 })
  const page = await context.newPage()
  await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>${sharedCss}${css}</style></head><body>${body}</body></html>`, { waitUntil: 'networkidle' })
  await page.evaluate(() => document.fonts?.ready)
  await page.screenshot({ path: path.join(output, filename) })
  await context.close()
}

async function captureProduct(browser) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    acceptDownloads: true,
  })
  await context.addInitScript(({ storedPriorities }) => {
    localStorage.setItem('daymark-profile', 'guest')
    localStorage.setItem('festframe-plan-owner', 'guest')
    localStorage.setItem('daymark-weekend', 'w2')
    localStorage.setItem('daymark-priorities', JSON.stringify(storedPriorities))
    localStorage.setItem('daymark-wallpaper-theme', 'consciousness-desert')
    localStorage.setItem('festframe-priority-hint-seen', 'true')
  }, { storedPriorities: priorities })

  const page = await context.newPage()
  await page.route('**/api/events', (route) => route.fulfill({ status: 202, contentType: 'application/json', body: '{"accepted":true}' }))
  await page.goto(baseUrl, { waitUntil: 'networkidle' })
  await page.getByRole('heading', { name: 'Plan your Tomorrowland.' }).waitFor()
  await page.locator('.day-tabs button.active').filter({ hasText: '24 Jul' }).waitFor()
  await page.locator('.route-item').first().waitFor()
  await page.evaluate(() => document.fonts?.ready)

  await page.locator('.route-panel').screenshot({ path: path.join(sourceOutput, 'product-route-panel.png') })

  await page.locator('.lineup-panel').scrollIntoViewIfNeeded()
  await page.locator('.stage-select select').selectOption('MAINSTAGE')
  const missMonique = page.locator('.board-card').filter({ hasText: 'Miss Monique' })
  await missMonique.scrollIntoViewIfNeeded()
  await page.evaluate(() => window.scrollBy(0, -175))
  await page.waitForTimeout(400)
  await page.screenshot({ path: path.join(sourceOutput, 'product-board.png') })

  await page.getByRole('button', { name: 'My Schedule' }).click()
  await page.locator('.schedule-event-bar').waitFor()
  await page.waitForTimeout(350)
  await page.locator('.lineup-panel').screenshot({ path: path.join(sourceOutput, 'product-schedule.png') })

  const exportButton = page.getByRole('button', { name: 'Export' })
  await exportButton.scrollIntoViewIfNeeded()
  await exportButton.click()
  await page.getByRole('dialog').waitFor()
  await page.waitForTimeout(350)
  await page.screenshot({ path: path.join(sourceOutput, 'product-export.png') })

  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Lock-screen image iPhone 17 / 17 Pro · 1206×2622' }).click()
  await (await downloadPromise).saveAs(path.join(output, 'wallpaper-w2-friday.png'))
  await context.close()
}

async function renderLockscreen(browser, wallpaper) {
  const css = `
    body{position:relative;background:#07131e;color:#f3f5f8}
    .wallpaper{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
    .status{position:absolute;z-index:3;top:31px;left:62px;right:62px;display:flex;justify-content:space-between;align-items:center;font-size:36px;font-weight:600;text-shadow:0 1px 5px #000}
    .status span:last-child{letter-spacing:4px}.dynamic{position:absolute;z-index:3;top:26px;left:50%;width:360px;height:102px;transform:translateX(-50%);border-radius:60px;background:#000}
    .lock-date{position:absolute;z-index:3;top:158px;left:0;right:0;text-align:center;font-size:52px;font-weight:500;text-shadow:0 2px 8px #000}
    .lock-time{position:absolute;z-index:3;top:220px;left:0;right:0;text-align:center;font-size:230px;line-height:1;font-weight:500;letter-spacing:-5px;color:#aeb7c3;text-shadow:0 3px 10px #000}
    .home{position:absolute;z-index:3;bottom:22px;left:50%;width:390px;height:13px;transform:translateX(-50%);border-radius:10px;background:#fff}
  `
  const body = `<img class="wallpaper" src="${wallpaper}" alt=""><div class="status"><span>FestFrame</span><span>▮▮▮ 5G 83</span></div><div class="dynamic"></div><div class="lock-date">Friday, 24 July</div><div class="lock-time">18:37</div><div class="home"></div>`
  await renderPage(browser, 'lockscreen-w2-friday.png', 1206, 2622, body, css)
}

async function renderGallery(browser, images) {
  const galleryCss = `
    body{position:relative;padding:74px 68px}
    .copy{position:relative;z-index:2;width:560px}.copy .brand{margin-bottom:60px}.copy .label{margin-bottom:24px}.copy p{width:470px;margin-top:28px}
    .copy .url{position:absolute;top:1135px}.phone{width:420px;height:912px;right:54px;bottom:-80px}
    .accent{width:18px;height:220px;right:0;top:0}.accent.sun{width:120px;height:18px;right:18px;top:0}
  `
  await renderPage(browser, 'reddit-gallery-01-lockscreen.png', 1080, 1350, `
    <div class="copy">${brand()}<div class="label">Tomorrowland Belgium · W2</div><h1>Your whole<br>route.<br>One glance.</h1><p>A free festival planner made for your lock screen.</p><div class="url">festframe.vercel.app</div></div>
    ${phone(images.lockscreen)}<span class="accent"></span><span class="accent sun"></span>
  `, galleryCss)

  await renderPage(browser, 'reddit-gallery-02-priorities.png', 1080, 1350, `
    <div class="copy">${brand()}<div class="label">Plan in minutes</div><h1>Must.<br>Want.<br>Maybe.</h1><p>Pick what matters. Keep every clash visible.</p><div class="url">Tap any artist · change priority anytime</div></div>
    ${phone(images.board)}<span class="accent coral"></span><span class="accent sun"></span>
  `, galleryCss)

  await renderPage(browser, 'reddit-gallery-03-export.png', 1080, 1350, `
    <div class="copy">${brand()}<div class="label">Take it with you</div><h1>Wallpaper.<br>Calendar.<br>Done.</h1><p>Your selected route stays one glance away.</p><div class="url">Free · email optional</div></div>
    ${phone(images.export)}<span class="accent"></span><span class="accent sun"></span>
  `, galleryCss)
}

async function renderVideoFrames(browser, images) {
  const videoCss = `
    body{position:relative;padding:92px 70px;background:#101422;color:#f7f4ec}
    .top{position:relative;z-index:3}.top .brand{margin-bottom:58px}.top .label{margin-bottom:22px;color:#aeb7ca}.top h1{font-size:86px}.top p{margin-top:25px;color:#c8cfdb}
    .phone{width:620px;height:1348px;left:50%;bottom:-300px;transform:translateX(-50%);border-width:18px;border-radius:76px}
    .phone.schedule img{height:calc(100% - 55px);margin-top:55px;object-fit:contain;object-position:top center;background:#f7f4ec}
    .phone .island{width:170px;height:45px;top:16px}.footer{position:absolute;z-index:5;left:70px;right:70px;top:760px;display:flex;justify-content:space-between;align-items:center;font:500 22px 'DM Mono',monospace}.cta{padding:16px 21px;background:#f7bf37;color:#141a2c;font-weight:700}
    .accent{width:24px;height:290px;right:0;top:0}.accent.sun{width:160px;height:24px;right:24px}
  `
  const frames = [
    ['video-hook-stop.png', 'W2 survival tip', 'Stop reopening<br>the timetable<br>all day.', 'Put the route where you can actually see it.', images.lockscreen],
    ['video-hook-glance.png', 'Tomorrowland W2', 'Your whole<br>route.<br>One glance.', 'Build it once. Keep it on your lock screen.', images.lockscreen],
    ['video-board.png', 'Step 1', 'Pick Must.<br>Want.<br>Maybe.', 'Tap any artist. Change priority anytime.', images.board],
    ['video-schedule.png', 'Step 2', 'See every<br>clash.', 'Your selected stages, side by side.', images.schedule],
    ['video-export.png', 'Step 3', 'Export.<br>You’re done.', 'Wallpaper, Google Calendar or PDF.', images.export],
    ['video-cta.png', 'Free W2 planner', 'Plan Friday<br>before Friday.', 'No app install. Email optional.', images.lockscreen],
  ]
  for (const [filename, label, headline, copy, image] of frames) {
    await renderPage(browser, filename, 1080, 1920, `
      <div class="top">${brand()}<div class="label">${label}</div><h1>${headline}</h1><p>${copy}</p></div>${phone(image, label === 'Step 2' ? 'schedule' : '')}
      <div class="footer"><span>festframe.vercel.app</span><b class="cta">PLAN W2 FREE</b></div><span class="accent"></span><span class="accent sun"></span>
    `, videoCss)
  }
}

async function renderVideos() {
  const common = [
    ['video-board.png', 2.1],
    ['video-schedule.png', 1.8],
    ['video-export.png', 1.8],
    ['video-cta.png', 2.2],
  ]
  for (const [hook, filename] of [
    ['video-hook-stop.png', 'reel-stop-reopening.mp4'],
    ['video-hook-glance.png', 'reel-one-glance.mp4'],
  ]) {
    const sequence = [[hook, 1.5], ...common]
    const concatFile = path.join(sourceOutput, `${filename}.txt`)
    const lines = sequence.flatMap(([file, duration]) => [`file '${path.join(output, file).replaceAll("'", "'\\''")}'`, `duration ${duration}`])
    lines.push(`file '${path.join(output, sequence.at(-1)[0]).replaceAll("'", "'\\''")}'`)
    await writeFile(concatFile, `${lines.join('\n')}\n`)
    await run('ffmpeg', [
      '-y', '-f', 'concat', '-safe', '0', '-i', concatFile,
      '-vf', 'fps=30,format=yuv420p', '-c:v', 'libx264', '-preset', 'medium', '-crf', '20',
      '-movflags', '+faststart', '-an', path.join(output, filename),
    ])
  }
}

async function prepareRedditScreenshots() {
  const redditOutput = path.join(output, 'reddit-app-screenshots')
  await mkdir(redditOutput, { recursive: true })
  await Promise.all([
    copyFile(path.join(output, 'lockscreen-w2-friday.png'), path.join(redditOutput, '01-lock-screen.png')),
    copyFile(path.join(sourceOutput, 'product-board.png'), path.join(redditOutput, '02-select-artists.png')),
    copyFile(path.join(sourceOutput, 'product-schedule.png'), path.join(redditOutput, '03-my-schedule.png')),
    copyFile(path.join(sourceOutput, 'product-export.png'), path.join(redditOutput, '04-export-options.png')),
  ])
}

await mkdir(sourceOutput, { recursive: true })
await startServer()
const browser = await chromium.launch({ headless: true })

try {
  await captureProduct(browser)
  const [wallpaperBuffer, boardBuffer, scheduleBuffer, exportBuffer] = await Promise.all([
    readFile(path.join(output, 'wallpaper-w2-friday.png')),
    readFile(path.join(sourceOutput, 'product-board.png')),
    readFile(path.join(sourceOutput, 'product-schedule.png')),
    readFile(path.join(sourceOutput, 'product-export.png')),
  ])
  await renderLockscreen(browser, dataUrl(wallpaperBuffer))
  const lockscreenBuffer = await readFile(path.join(output, 'lockscreen-w2-friday.png'))
  const images = {
    lockscreen: dataUrl(lockscreenBuffer),
    board: dataUrl(boardBuffer),
    schedule: dataUrl(scheduleBuffer),
    export: dataUrl(exportBuffer),
  }
  await renderGallery(browser, images)
  await renderVideoFrames(browser, images)
} finally {
  await browser.close()
  ownedServer?.kill('SIGTERM')
}

await renderVideos()
await prepareRedditScreenshots()
console.log(`Creative pack generated at ${output}`)
