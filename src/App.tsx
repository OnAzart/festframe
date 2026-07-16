import { useEffect, useMemo, useRef, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  CalendarDays,
  CalendarCheck,
  Check,
  ChevronRight,
  Download,
  FileText,
  Grid2X2,
  Heart,
  ImageDown,
  LockKeyhole,
  LogOut,
  Search,
  Sparkles,
  Columns3,
  X,
} from 'lucide-react'
import { Analytics } from '@vercel/analytics/react'
import './App.css'

type Priority = 'critical' | 'want' | 'like'
type WallpaperTheme = 'consciousness-desert' | 'botanical-consciousness'
type ViewMode = 'board' | 'timeline' | 'schedule'
type AnalyticsEvent = 'planner_opened' | 'signup_completed' | 'email_submitted' | 'first_artist_selected' | 'five_artists_selected' | 'timeline_viewed' | 'wallpaper_exported' | 'support_opened'

type Artist = {
  id: string
  name: string
  image?: string
}

type Performance = {
  id: string
  name: string
  artists: Artist[]
  stage: { id: string; name: string }
  date: string
  day: string
  startTime: string
  endTime: string
}

type FestivalData = { performances: Performance[] }

const priorityMeta: Record<Priority, { label: string; color: string; weight: number; icon: LucideIcon }> = {
  critical: { label: 'Must', color: '#ff5b4d', weight: 3, icon: LockKeyhole },
  want: { label: 'Want', color: '#f7bf37', weight: 2, icon: Heart },
  like: { label: 'Maybe', color: '#2bc4b0', weight: 1, icon: Sparkles },
}

const STAGE_ORDER = [
  'MAINSTAGE',
  'FREEDOM BY BUD',
  'THE GREAT LIBRARY',
  'THE ROSE GARDEN',
  'ELIXIR',
  'CAGE',
  'THE RAVE CAVE',
  'PLANAXIS',
  'MELODIA BY CORONA',
  'CELESTIA BY KUCOIN',
  'ATMOSPHERE',
  'CORE',
  'CRYSTAL GARDEN',
  'MOOSE BAR',
  'HOUSE OF FORTUNE BY JBL',
  'THE GATHERING',
  'THE GATHERING II',
]

const STAGE_COLORS = ['#ff5b4d', '#24c6b4', '#f4bd38', '#d0b4ff', '#f078b7', '#ff8a3d', '#76a7ff', '#ddf063', '#ec765f', '#55d18a', '#f4dc66', '#82c3ff', '#c695f4', '#f29ac1', '#8ad7ce', '#ffb65c', '#aeb8ff']
const TIMELINE_PX_PER_MINUTE = 1.35
const TIMELINE_STAGE_WIDTH = 210
const WALLPAPER_THEMES: { id: WallpaperTheme; label: string; image: string }[] = [
  { id: 'consciousness-desert', label: 'Consciousness', image: '/wallpapers/consciousness-desert.png' },
  { id: 'botanical-consciousness', label: 'Botanical', image: '/wallpapers/botanical-consciousness.png' },
]

function stageColor(stageName: string) {
  const index = STAGE_ORDER.indexOf(stageName)
  return STAGE_COLORS[index >= 0 ? index % STAGE_COLORS.length : 0]
}

const storageKeys = {
  profile: 'daymark-profile',
  leadId: 'festframe-lead-id',
  priorities: 'daymark-priorities',
  weekend: 'daymark-weekend',
  wallpaperTheme: 'daymark-wallpaper-theme',
}
const SUPPORT_URL = (import.meta.env.VITE_SUPPORT_URL as string | undefined)?.trim() || 'https://ko-fi.com/onazart'
const analyticsSessionId = crypto.randomUUID()

function trackEvent(eventName: AnalyticsEvent, context: { festivalDate?: string; weekend?: 'w1' | 'w2'; properties?: Record<string, string | number | boolean> } = {}) {
  void fetch('/api/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId: analyticsSessionId, eventName, ...context }),
    keepalive: true,
  }).catch(() => undefined)
}

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
})

const timeFormatter = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: 'Europe/Brussels',
})

function localDate(value: string) {
  return new Date(value.replace(' ', 'T'))
}

function festivalDate(performance: Performance) {
  const [calendarDate, time = '12:00:00'] = performance.startTime.split(' ')
  if (Number(time.slice(0, 2)) >= 3) return calendarDate
  const previousDay = new Date(`${calendarDate}T12:00:00Z`)
  previousDay.setUTCDate(previousDay.getUTCDate() - 1)
  return previousDay.toISOString().slice(0, 10)
}

function getArtistImage(performance: Performance) {
  return performance.artists.find((artist) => artist.image)?.image
}

function eventLabel(performance: Performance) {
  return performance.name || performance.artists.map((artist) => artist.name).join(' b2b ')
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

function resizePng(dataUrl: string, width: number, height: number) {
  return new Promise<string>((resolve, reject) => {
    const image = new Image()
    image.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const context = canvas.getContext('2d')
      if (!context) return reject(new Error('Canvas is unavailable'))
      context.drawImage(image, 0, 0, width, height)
      resolve(canvas.toDataURL('image/png'))
    }
    image.onerror = () => reject(new Error('Export image could not be resized'))
    image.src = dataUrl
  })
}

function escapeIcs(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')
}

function toIcsUtcDate(date: Date) {
  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, '0'),
    String(date.getUTCDate()).padStart(2, '0'),
  ].join('') + `T${String(date.getUTCHours()).padStart(2, '0')}${String(date.getUTCMinutes()).padStart(2, '0')}00Z`
}

function foldIcsLine(line: string) {
  const parts: string[] = []
  let remainder = line
  while (remainder.length > 73) {
    parts.push(remainder.slice(0, 73))
    remainder = ` ${remainder.slice(73)}`
  }
  parts.push(remainder)
  return parts
}

function PriorityPicker({
  selected,
  onChoose,
  compact = false,
}: {
  selected?: Priority
  onChoose: (priority: Priority) => void
  compact?: boolean
}) {
  return <div className={`priority-control ${compact ? 'compact' : ''}`}>
    {(Object.keys(priorityMeta) as Priority[]).map((priority) => {
      const Icon = priorityMeta[priority].icon
      return <button key={priority} title={priorityMeta[priority].label} aria-label={priorityMeta[priority].label} onClick={(event) => { event.stopPropagation(); onChoose(priority) }} className={selected === priority ? 'selected' : ''} style={{ '--priority-color': priorityMeta[priority].color } as React.CSSProperties}><Icon size={compact ? 12 : 14} strokeWidth={2.3} /></button>
    })}
  </div>
}

function App() {
  const [localProfile, setLocalProfile] = useState<string | null>(() => localStorage.getItem(storageKeys.profile))
  const [email, setEmail] = useState('')
  const [weekend, setWeekend] = useState<'w1' | 'w2'>(() => (localStorage.getItem(storageKeys.weekend) as 'w1' | 'w2') || 'w1')
  const [data, setData] = useState<FestivalData | null>(null)
  const [priorities, setPriorities] = useState<Record<string, Priority>>(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKeys.priorities) || '{}')
    } catch {
      return {}
    }
  })
  const [activeDate, setActiveDate] = useState('')
  const [search, setSearch] = useState('')
  const [stage, setStage] = useState('all')
  const [viewMode, setViewMode] = useState<ViewMode>(() => window.matchMedia('(max-width: 700px)').matches ? 'board' : 'timeline')
  const [exportsOpen, setExportsOpen] = useState(false)
  const [wallpaperTheme, setWallpaperTheme] = useState<WallpaperTheme>(() => {
    const saved = localStorage.getItem(storageKeys.wallpaperTheme)
    return saved === 'consciousness-desert' ? saved : 'botanical-consciousness'
  })
  const [toast, setToast] = useState('')
  const exportCardRef = useRef<HTMLDivElement>(null)
  const hasTrackedOpenRef = useRef(false)
  const profile = localProfile

  useEffect(() => {
    const controller = new AbortController()
    setData(null)
    fetch(`/data/tomorrowland-2026-${weekend}.json`, { signal: controller.signal })
      .then((response) => response.json())
      .then((festivalData: FestivalData) => setData(festivalData))
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          setToast('The timetable could not be loaded. Please refresh.')
        }
      })
    return () => controller.abort()
  }, [weekend])

  useEffect(() => {
    localStorage.setItem(storageKeys.priorities, JSON.stringify(priorities))
  }, [priorities])

  useEffect(() => {
    localStorage.setItem(storageKeys.weekend, weekend)
  }, [weekend])

  useEffect(() => {
    localStorage.setItem(storageKeys.wallpaperTheme, wallpaperTheme)
  }, [wallpaperTheme])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(''), 3500)
    return () => window.clearTimeout(timer)
  }, [toast])

  useEffect(() => {
    if (!profile || !data || hasTrackedOpenRef.current) return
    hasTrackedOpenRef.current = true
    trackEvent('planner_opened', { weekend })
  }, [profile, data, weekend])

  const dates = useMemo(() => {
    if (!data) return []
    return [...new Set(data.performances.map(festivalDate))].sort()
  }, [data])

  useEffect(() => {
    if (dates.length && !dates.includes(activeDate)) {
      const firstFestivalDay = dates.find((date) => new Date(`${date}T12:00:00`).getDay() === 5)
      setActiveDate(firstFestivalDay || dates[0])
    }
  }, [dates, activeDate])

  const daySets = useMemo(() => {
    if (!data || !activeDate) return []
    return data.performances
      .filter((performance) => festivalDate(performance) === activeDate)
      .filter((performance) => stage === 'all' || performance.stage.name === stage)
      .filter((performance) => {
        const needle = search.trim().toLowerCase()
        return !needle || `${eventLabel(performance)} ${performance.stage.name}`.toLowerCase().includes(needle)
      })
      .sort((a, b) => localDate(a.startTime).getTime() - localDate(b.startTime).getTime())
  }, [data, activeDate, stage, search])

  const stages = useMemo(() => {
    if (!data || !activeDate) return []
    return [...new Set(data.performances.filter((performance) => festivalDate(performance) === activeDate).map((performance) => performance.stage.name))].sort((left, right) => {
      const leftIndex = STAGE_ORDER.indexOf(left)
      const rightIndex = STAGE_ORDER.indexOf(right)
      return (leftIndex < 0 ? 999 : leftIndex) - (rightIndex < 0 ? 999 : rightIndex)
    })
  }, [data, activeDate])

  const boardGroups = useMemo(() => stages
    .map((stageName) => ({
      stageName,
      performances: daySets
        .filter((performance) => performance.stage.name === stageName)
        .sort((left, right) => localDate(left.startTime).getTime() - localDate(right.startTime).getTime()),
    }))
    .filter((group) => group.performances.length), [daySets, stages])

  const timelineBounds = useMemo(() => {
    if (!data || !activeDate) return null
    const dayPerformances = data.performances.filter((performance) => festivalDate(performance) === activeDate)
    if (!dayPerformances.length) return null
    const firstStart = Math.min(...dayPerformances.map((performance) => localDate(performance.startTime).getTime()))
    const lastEnd = Math.max(...dayPerformances.map((performance) => localDate(performance.endTime).getTime()))
    const start = new Date(Math.floor(firstStart / 3_600_000) * 3_600_000)
    const end = new Date(Math.ceil(lastEnd / 3_600_000) * 3_600_000)
    const durationMinutes = (end.getTime() - start.getTime()) / 60_000
    return { start, end, height: Math.max(660, durationMinutes * TIMELINE_PX_PER_MINUTE) }
  }, [data, activeDate])

  const timelineHours = useMemo(() => {
    if (!timelineBounds) return []
    const hours: Date[] = []
    const cursor = new Date(timelineBounds.start)
    while (cursor <= timelineBounds.end) {
      hours.push(new Date(cursor))
      cursor.setHours(cursor.getHours() + 1)
    }
    return hours
  }, [timelineBounds])

  const selectedDaySets = useMemo(() => {
    if (!data || !activeDate) return []
    return data.performances
      .filter((performance) => festivalDate(performance) === activeDate && priorities[performance.id])
      .sort((a, b) => localDate(a.startTime).getTime() - localDate(b.startTime).getTime())
  }, [data, activeDate, priorities])

  const selectedStages = useMemo(() => stages.filter((stageName) => selectedDaySets.some((performance) => performance.stage.name === stageName)), [selectedDaySets, stages])

  const scheduleBounds = useMemo(() => {
    if (!selectedDaySets.length) return null
    const firstStart = Math.min(...selectedDaySets.map((performance) => localDate(performance.startTime).getTime()))
    const lastEnd = Math.max(...selectedDaySets.map((performance) => localDate(performance.endTime).getTime()))
    const start = new Date(Math.floor(firstStart / 3_600_000) * 3_600_000)
    const naturalEnd = Math.ceil(lastEnd / 3_600_000) * 3_600_000
    const end = new Date(Math.max(naturalEnd, start.getTime() + 3 * 3_600_000))
    const durationMinutes = (end.getTime() - start.getTime()) / 60_000
    return { start, end, height: durationMinutes * TIMELINE_PX_PER_MINUTE }
  }, [selectedDaySets])

  const scheduleHours = useMemo(() => {
    if (!scheduleBounds) return []
    const hours: Date[] = []
    const cursor = new Date(scheduleBounds.start)
    while (cursor <= scheduleBounds.end) {
      hours.push(new Date(cursor))
      cursor.setHours(cursor.getHours() + 1)
    }
    return hours
  }, [scheduleBounds])

  const conflicts = useMemo(() => {
    const issues: { left: Performance; right: Performance; message: string }[] = []
    for (let index = 0; index < selectedDaySets.length; index += 1) {
      for (let comparison = index + 1; comparison < selectedDaySets.length; comparison += 1) {
        const left = selectedDaySets[index]
        const right = selectedDaySets[comparison]
        const leftStart = localDate(left.startTime)
        const leftEnd = localDate(left.endTime)
        const rightStart = localDate(right.startTime)
        const rightEnd = localDate(right.endTime)
        const overlap = Math.min(leftEnd.getTime(), rightEnd.getTime()) - Math.max(leftStart.getTime(), rightStart.getTime()) > 60_000
        if (overlap) {
          issues.push({
            left,
            right,
            message: 'These selections overlap.',
          })
        }
      }
    }
    return issues
  }, [selectedDaySets])

  const stats = useMemo(() => {
    const counts = { critical: 0, want: 0, like: 0 }
    selectedDaySets.forEach((performance) => { counts[priorities[performance.id]] += 1 })
    return counts
  }, [priorities, selectedDaySets])

  const overlappingSetCount = useMemo(() => new Set(conflicts.flatMap((issue) => [issue.left.id, issue.right.id])).size, [conflicts])

  const wallpaperBounds = useMemo(() => {
    if (!selectedDaySets.length) return timelineBounds
    const firstStart = Math.min(...selectedDaySets.map((performance) => localDate(performance.startTime).getTime()))
    const lastEnd = Math.max(...selectedDaySets.map((performance) => localDate(performance.endTime).getTime()))
    const start = new Date(Math.floor(firstStart / 3_600_000) * 3_600_000)
    const naturalEnd = Math.ceil(lastEnd / 3_600_000) * 3_600_000
    const end = new Date(Math.max(naturalEnd + 30 * 60_000, start.getTime() + 4.5 * 3_600_000))
    return { start, end, height: 440 }
  }, [selectedDaySets, timelineBounds])

  const wallpaperLayout = useMemo(() => {
    if (!wallpaperBounds) return { items: [], hours: [] as Date[], hidden: 0 }
    const visible = selectedDaySets.slice(0, 20)
    const range = wallpaperBounds.end.getTime() - wallpaperBounds.start.getTime()
    const clusters: Performance[][] = []
    let clusterEnd = 0
    visible.forEach((performance) => {
      const start = localDate(performance.startTime).getTime()
      const end = localDate(performance.endTime).getTime()
      if (!clusters.length || start >= clusterEnd - 60_000) {
        clusters.push([performance])
        clusterEnd = end
      } else {
        clusters[clusters.length - 1].push(performance)
        clusterEnd = Math.max(clusterEnd, end)
      }
    })
    const items = clusters.flatMap((cluster) => {
      const laneEnds: number[] = []
      const laneStackDepths: number[] = []
      const placed = cluster.map((performance) => {
        const start = localDate(performance.startTime).getTime()
        const end = localDate(performance.endTime).getTime()
        let lane = laneEnds.findIndex((laneEnd) => laneEnd <= start + 60_000)
        let stacked = false
        let stackDepth = 0
        if (lane < 0 && laneEnds.length < 3) lane = laneEnds.length
        if (lane < 0) {
          lane = laneEnds.indexOf(Math.min(...laneEnds))
          stacked = true
          laneStackDepths[lane] = (laneStackDepths[lane] || 0) + 1
          stackDepth = laneStackDepths[lane]
        } else {
          laneStackDepths[lane] = 0
        }
        laneEnds[lane] = Math.max(laneEnds[lane] || 0, end)
        return { performance, lane, stacked, stackDepth, start, end }
      })
      const columns = laneEnds.length
      return placed.map(({ performance, lane, stacked, stackDepth, start, end }) => ({
        performance,
        lane,
        stacked,
        stackDepth,
        columns,
        overlap: cluster.length > 1,
        top: (start - wallpaperBounds.start.getTime()) / range * 100,
        height: Math.max(3.8, (end - start) / range * 100),
      }))
    })
    const hours: Date[] = []
    const cursor = new Date(wallpaperBounds.start)
    while (cursor <= wallpaperBounds.end) {
      hours.push(new Date(cursor))
      cursor.setHours(cursor.getHours() + 2)
    }
    return { items, hours, hidden: Math.max(0, selectedDaySets.length - visible.length) }
  }, [selectedDaySets, wallpaperBounds])

  const activeDateLabel = activeDate ? dateFormatter.format(new Date(`${activeDate}T12:00:00`)) : ''

  function choosePriority(id: string, priority: Priority) {
    setPriorities((current) => {
      if (current[id] === priority) {
        const next = { ...current }
        delete next[id]
        return next
      }
      return { ...current, [id]: priority }
    })
  }

  function chooseArtist(id: string) {
    if (priorities[id]) return
    const selectedCount = Object.keys(priorities).length
    choosePriority(id, 'want')
    if (selectedCount === 0) trackEvent('first_artist_selected', { festivalDate: activeDate, weekend })
    if (selectedCount === 4) trackEvent('five_artists_selected', { festivalDate: activeDate, weekend })
    if (!localStorage.getItem('festframe-priority-hint-seen')) {
      localStorage.setItem('festframe-priority-hint-seen', 'true')
      setToast('Added to Want. Use Must, Want, or Maybe to change it.')
    }
  }

  function enterPlanner(event: React.FormEvent) {
    event.preventDefault()
    const normalized = email.trim().toLowerCase()
    if (!/^\S+@\S+\.\S+$/.test(normalized)) {
      setToast('Enter a valid email to continue.')
      return
    }
    let visitorId = localStorage.getItem(storageKeys.leadId)
    if (!visitorId) {
      visitorId = crypto.randomUUID()
      localStorage.setItem(storageKeys.leadId, visitorId)
    }
    localStorage.setItem(storageKeys.profile, normalized)
    setLocalProfile(normalized)
    trackEvent('email_submitted')
    void fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visitorId, email: normalized }),
    }).catch(() => undefined)
  }

  function enterAsGuest() {
    localStorage.setItem(storageKeys.profile, 'guest')
    setLocalProfile('guest')
  }

  function logout() {
    localStorage.removeItem(storageKeys.profile)
    setLocalProfile(null)
  }

  function exportCalendar() {
    if (!selectedDaySets.length) return setToast('Choose at least one set before exporting.')
    const stamp = toIcsUtcDate(new Date())
    const events = selectedDaySets.map((performance) => {
      const start = toIcsUtcDate(localDate(performance.startTime))
      const end = toIcsUtcDate(localDate(performance.endTime))
      return [
        'BEGIN:VEVENT',
        `UID:${performance.id}-${activeDate}@festframe.local`,
        `DTSTAMP:${stamp}`,
        `DTSTART:${start}`,
        `DTEND:${end}`,
        `SUMMARY:${escapeIcs(eventLabel(performance))}`,
        `LOCATION:${escapeIcs(performance.stage.name)}`,
        `DESCRIPTION:${escapeIcs(`${priorityMeta[priorities[performance.id]].label} selection · FestFrame festival plan`)}`,
        'STATUS:CONFIRMED',
        'TRANSP:TRANSPARENT',
        'END:VEVENT',
      ].join('\r\n')
    })
    const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//FestFrame//Festival plan//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'X-WR-CALNAME:FestFrame festival plan', ...events.flatMap((event) => event.split('\r\n')), 'END:VCALENDAR']
    const body = `${lines.flatMap(foldIcsLine).join('\r\n')}\r\n`
    downloadBlob(new Blob([body], { type: 'text/calendar;charset=utf-8' }), `festframe-${activeDate}.ics`)
    setToast('Calendar file downloaded.')
  }

  async function exportPdf() {
    if (!selectedDaySets.length) return setToast('Choose at least one set before exporting.')
    const { jsPDF } = await import('jspdf')
    const pdf = new jsPDF({ unit: 'pt', format: 'a4' })
    pdf.setFillColor(16, 20, 34)
    pdf.rect(0, 0, 595, 842, 'F')
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(28)
    pdf.text('FESTFRAME', 42, 58)
    pdf.setTextColor(255, 193, 66)
    pdf.setFontSize(11)
    pdf.text(`TOMORROWLAND 2026 · ${activeDateLabel.toUpperCase()}`, 42, 82)
    let y = 124
    selectedDaySets.forEach((performance, index) => {
      if (y > 760) {
        pdf.addPage()
        pdf.setFillColor(16, 20, 34)
        pdf.rect(0, 0, 595, 842, 'F')
        y = 56
      }
      const priority = priorityMeta[priorities[performance.id]]
      pdf.setFillColor(priority.color)
      pdf.circle(51, y - 4, 5, 'F')
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(14)
      pdf.text(`${timeFormatter.format(localDate(performance.startTime))}  ${eventLabel(performance)}`, 70, y)
      pdf.setTextColor(171, 184, 208)
      pdf.setFontSize(10)
      pdf.text(`${performance.stage.name} · ${priority.label}`, 70, y + 17)
      if (index < selectedDaySets.length - 1) {
        pdf.setDrawColor(48, 56, 79)
        pdf.line(42, y + 31, 553, y + 31)
      }
      y += 48
    })
    pdf.setTextColor(171, 184, 208)
    pdf.setFontSize(9)
    pdf.text('Made with FestFrame · Check the official timetable for live changes.', 42, 812)
    pdf.save(`festframe-${activeDate}.pdf`)
    setToast('PDF downloaded.')
  }

  async function exportIphoneImage() {
    if (!selectedDaySets.length) return setToast('Choose at least one set before exporting.')
    if (!exportCardRef.current) return
    try {
      const { toPng } = await import('html-to-image')
      const dataUrl = await toPng(exportCardRef.current, { pixelRatio: 2, cacheBust: true })
      const iphone17DataUrl = await resizePng(dataUrl, 1206, 2622)
      const link = document.createElement('a')
      link.download = `festframe-${activeDate}-iphone.png`
      link.href = iphone17DataUrl
      link.click()
      trackEvent('wallpaper_exported', { festivalDate: activeDate, weekend, properties: { theme: wallpaperTheme, selectedCount: selectedDaySets.length } })
      setToast('iPhone image downloaded.')
    } catch {
      setToast('Image export failed. Please try again.')
    }
  }

  function renderTimeline(
    bounds: { start: Date; end: Date; height: number },
    hours: Date[],
    stageNames: string[],
    performances: Performance[],
    finalSchedule = false,
  ) {
    return <div className={`timeline-scroll ${finalSchedule ? 'schedule-scroll' : ''}`}>
      <div className="timeline-grid" style={{ gridTemplateColumns: `64px repeat(${stageNames.length}, ${TIMELINE_STAGE_WIDTH}px)` }}>
        <div className="timeline-corner">TIME</div>
        {stageNames.map((stageName) => <div className="timeline-stage-name" key={stageName} style={{ '--stage-color': stageColor(stageName) } as React.CSSProperties}>{stageName}</div>)}
        <div className="timeline-time-rail" style={{ height: bounds.height }}>
          {hours.map((hour) => <time key={hour.toISOString()} style={{ top: (hour.getTime() - bounds.start.getTime()) / 60_000 * TIMELINE_PX_PER_MINUTE }}>{timeFormatter.format(hour)}</time>)}
        </div>
        {stageNames.map((stageName) => <div className="timeline-track" key={stageName} style={{ height: bounds.height }}>
          {hours.map((hour) => <i key={hour.toISOString()} className="timeline-hour-line" style={{ top: (hour.getTime() - bounds.start.getTime()) / 60_000 * TIMELINE_PX_PER_MINUTE }} />)}
          {performances.filter((performance) => performance.stage.name === stageName).map((performance) => {
            const selected = priorities[performance.id]
            const top = (localDate(performance.startTime).getTime() - bounds.start.getTime()) / 60_000 * TIMELINE_PX_PER_MINUTE
            const naturalHeight = (localDate(performance.endTime).getTime() - localDate(performance.startTime).getTime()) / 60_000 * TIMELINE_PX_PER_MINUTE - 5
            const height = Math.max(finalSchedule ? 46 : 72, naturalHeight)
            return <article className={`timeline-set ${finalSchedule ? 'schedule-set' : 'is-selectable'} ${selected ? `is-${selected}` : ''}`} key={performance.id} onClick={finalSchedule ? undefined : () => chooseArtist(performance.id)} style={{ top, height, '--stage-color': stageColor(performance.stage.name) } as React.CSSProperties}>
              <time>{timeFormatter.format(localDate(performance.startTime))}–{timeFormatter.format(localDate(performance.endTime))}</time>
              <h3>{eventLabel(performance)}</h3>
              {finalSchedule && selected ? <span className="schedule-priority" style={{ color: priorityMeta[selected].color }}>{priorityMeta[selected].label}</span> : <PriorityPicker compact selected={selected} onChoose={(priority) => choosePriority(performance.id, priority)} />}
            </article>
          })}
        </div>)}
      </div>
    </div>
  }

  if (!profile) {
    return (
      <main className="login-screen">
        <div className="login-visual" aria-hidden="true">
          <span className="sun sun-one" />
          <span className="sun sun-two" />
          <span className="sun sun-three" />
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="visual-word">FESTFRAME</div>
        </div>
        <section className="login-panel">
          <div className="wordmark"><span>FEST</span><i />FRAME</div>
          <p className="eyebrow">FESTFRAME · UNOFFICIAL FESTIVAL PLANNER</p>
          <h1>Plan Tomorrowland<br />Belgium 2026.</h1>
          <p className="login-copy"><strong>Your festival day, made for your lock screen.</strong><span>Choose the sets that matter, see the overlaps, and take a clear daily route with you.</span></p>
          <form onSubmit={enterPlanner} className="login-form">
            <label htmlFor="email">Your email <small>optional</small></label>
            <input id="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@email.com" type="email" autoComplete="email" />
            <button type="submit" className="primary-button">Plan My Fest <ChevronRight size={18} /></button>
            <button type="button" className="skip-button" onClick={enterAsGuest}>Skip for now</button>
          </form>
          <div className="login-note"><Check size={15} /> No password · your plan stays on this device</div>
          <p className="login-privacy">Email is optional. We store it with your FestFrame profile; no marketing emails without separate consent.</p>
        </section>
        {toast && <div className="toast">{toast}</div>}
        <Analytics />
      </main>
    )
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="wordmark compact"><span>FEST</span><i />FRAME</div>
        <div className="flow-steps" aria-label="Planning flow">
          <span className="done"><Check size={13} /> Started</span><b />
          <span className="current">2. Build</span><b />
          <span>3. Export</span>
        </div>
        <div className="account-menu">
          {SUPPORT_URL && <a className="support-top-link" href={SUPPORT_URL} target="_blank" rel="noreferrer" onClick={() => trackEvent('support_opened', { festivalDate: activeDate, weekend })}><Heart size={16} /><span>Support</span></a>}
          <span>{profile.split('@')[0]}</span>
          <button className="icon-button" onClick={logout} title="Sign out" aria-label="Sign out"><LogOut size={18} /></button>
        </div>
      </header>

      <section className="planner-header">
        <div>
          <p className="eyebrow">UNOFFICIAL TOMORROWLAND BELGIUM 2026 PLANNER</p>
          <h1>Plan your Tomorrowland.</h1>
          <p>Pick the sets that matter, check the clashes, and put your route on your lock screen.</p>
        </div>
        <div className="weekend-switch" role="group" aria-label="Festival weekend">
          <button onClick={() => setWeekend('w1')} className={weekend === 'w1' ? 'active' : ''}>W1 <small>17–19 Jul</small></button>
          <button onClick={() => setWeekend('w2')} className={weekend === 'w2' ? 'active' : ''}>W2 <small>24–26 Jul</small></button>
        </div>
      </section>

      {!data ? <div className="loading-state"><Sparkles size={18} /> Loading the official timetable snapshot...</div> : <>
        <nav className="day-tabs" aria-label="Festival days">
          {dates.map((date) => (
            <button key={date} className={date === activeDate ? 'active' : ''} onClick={() => { setActiveDate(date); setStage('all') }}>
              <span>{dateFormatter.format(new Date(`${date}T12:00:00`)).split(' ')[0]}</span>
              <strong>{dateFormatter.format(new Date(`${date}T12:00:00`)).split(' ').slice(1).join(' ')}</strong>
            </button>
          ))}
        </nav>

        <section className="planner-grid">
          <section className="lineup-panel">
            <div className="section-heading">
              <div>
                <p className="eyebrow">{activeDateLabel}</p>
                <h2>{viewMode === 'schedule' ? 'My Schedule' : 'Build your day'}</h2>
              </div>
              <div className="section-actions">
                <div className="view-switch" role="group" aria-label="Planner view">
                  <button className={viewMode === 'board' ? 'active' : ''} onClick={() => setViewMode('board')} title="Photo board" aria-label="Photo board"><Grid2X2 size={16} /></button>
                  <button className={viewMode === 'timeline' ? 'active' : ''} onClick={() => { setViewMode('timeline'); if (selectedDaySets.length) trackEvent('timeline_viewed', { festivalDate: activeDate, weekend, properties: { selectedCount: selectedDaySets.length } }) }} title="Timeline view" aria-label="Timeline view"><Columns3 size={16} /></button>
                  <button className={viewMode === 'schedule' ? 'active' : ''} onClick={() => setViewMode('schedule')} title="My Schedule" aria-label="My Schedule"><CalendarCheck size={16} /></button>
                </div>
                <span className="set-count">{selectedDaySets.length} saved</span>
              </div>
            </div>

            {viewMode !== 'schedule' && <div className="filters">
              <label className="search-field"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search artists or stages" /></label>
              <label className="stage-select"><span>Stage</span><select value={stage} onChange={(event) => setStage(event.target.value)}><option value="all">All stages</option>{stages.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
            </div>}

            {viewMode !== 'schedule' && <div className="priority-legend" aria-label="Selection priorities"><span className="legend-instruction"><b>Tap any artist</b><small>Saved as Want by default. Change priority anytime:</small></span>{(Object.keys(priorityMeta) as Priority[]).map((priority) => { const Icon = priorityMeta[priority].icon; const detail = priority === 'critical' ? 'Won’t miss' : priority === 'want' ? 'Plan to see' : 'If time allows'; return <span className="legend-priority" key={priority}><Icon size={15} style={{ color: priorityMeta[priority].color }} /><span><b>{priorityMeta[priority].label}</b><small>{detail}</small></span></span> })}</div>}

            {viewMode === 'board' ? <div className="board-groups">
              <div className="board-event-bar"><span>TOMORROWLAND BELGIUM 2026</span><b>{weekend.toUpperCase()} · {activeDateLabel}</b><small>UNOFFICIAL PLANNER</small></div>
              {boardGroups.map((group) => <section className="board-stage-group" key={group.stageName}>
                <div className="board-stage-heading" style={{ '--stage-color': stageColor(group.stageName) } as React.CSSProperties}><i /><h3>{group.stageName}</h3><span>{group.performances.length} sets</span></div>
                <div className="board-grid">{group.performances.map((performance) => {
                  const currentPriority = priorities[performance.id]
                  const artistImage = getArtistImage(performance)
                  return <article className={`board-card is-selectable ${currentPriority ? `is-${currentPriority}` : ''}`} key={performance.id} onClick={() => chooseArtist(performance.id)} style={{ '--stage-color': stageColor(performance.stage.name) } as React.CSSProperties}>
                    <div className="board-image">{artistImage ? <img src={artistImage} alt="" loading="lazy" /> : <span>{eventLabel(performance).slice(0, 1)}</span>}<div className="board-tint" /></div>
                    <div className="board-content"><time>{timeFormatter.format(localDate(performance.startTime))}–{timeFormatter.format(localDate(performance.endTime))}</time><h3>{eventLabel(performance)}</h3><p><i />{performance.stage.name}</p></div>
                    <PriorityPicker selected={currentPriority} onChoose={(priority) => choosePriority(performance.id, priority)} />
                  </article>
                })}</div>
              </section>)}
            </div> : viewMode === 'timeline' && timelineBounds ? renderTimeline(timelineBounds, timelineHours, stage === 'all' ? stages : [stage], daySets) : viewMode === 'schedule' && scheduleBounds ? <div className="my-schedule-view">
              <div className="schedule-event-bar"><div><CalendarCheck size={18} /><span>MY SCHEDULE</span></div><b>{selectedDaySets.length} SETS · {selectedStages.length} STAGES</b><small>Only your selected route, from first set to last.</small></div>
              {renderTimeline(scheduleBounds, scheduleHours, selectedStages, selectedDaySets, true)}
            </div> : <div className="schedule-empty"><CalendarCheck size={24} /><strong>No sets in your schedule yet.</strong><p>Choose artists from Board or Timeline and they will appear here.</p><button onClick={() => setViewMode('board')}>Browse artists <ChevronRight size={16} /></button></div>}
          </section>

          <aside className="route-panel">
            <div className="route-topline"><p className="eyebrow">YOUR ROUTE</p><button className="export-top-button" onClick={() => setExportsOpen(true)}><Download size={16} /> Export</button></div>
            <h2>{activeDateLabel || 'Your day'}</h2>
            <div className="route-stats">
              {(Object.keys(priorityMeta) as Priority[]).map((priority) => {
                const Icon = priorityMeta[priority].icon
                return <span key={priority} title={priorityMeta[priority].label}><Icon size={14} style={{ color: priorityMeta[priority].color }} /><b style={{ color: priorityMeta[priority].color }}>{stats[priority]}</b><small>{priorityMeta[priority].label}</small></span>
              })}
            </div>
            {overlappingSetCount > 0 && <button className="overlap-note" onClick={() => setViewMode('schedule')}><CalendarCheck size={15} /><span>{overlappingSetCount} saved sets overlap</span><ChevronRight size={14} /></button>}

            <div className="route-list">
              {selectedDaySets.length ? selectedDaySets.map((performance) => <div className="route-item" key={performance.id} style={{ '--stage-color': stageColor(performance.stage.name) } as React.CSSProperties}><span className="route-dot" style={{ background: stageColor(performance.stage.name) }} /><div><time>{timeFormatter.format(localDate(performance.startTime))}</time><strong>{eventLabel(performance)}</strong><small>{performance.stage.name}</small></div><button className="remove-set" onClick={() => { const next = { ...priorities }; delete next[performance.id]; setPriorities(next) }} title={`Remove ${eventLabel(performance)} from your route`} aria-label={`Remove ${eventLabel(performance)} from your route`}><X size={15} /></button></div>) : <div className="empty-route"><Sparkles size={22} /><strong>Your route starts here.</strong><p>Choose the acts that matter. Your route builds itself in time order.</p></div>}
            </div>
            <p className="official-note">Times are based on the 15 July timetable snapshot. Check official updates before you go.</p>
          </aside>
        </section>
      </>}

      <div className={`iphone-export ${exportsOpen ? 'is-previewing' : ''}`} aria-hidden="true">
        <div className={`iphone-card ${selectedDaySets.length >= 15 ? 'is-packed' : selectedDaySets.length >= 9 ? 'is-dense' : ''}`} ref={exportCardRef}>
          <div className="iphone-artwork" style={{ backgroundImage: `url(${WALLPAPER_THEMES.find((theme) => theme.id === wallpaperTheme)?.image})` }} />
          <div className="iphone-shade" />
          <div className="iphone-head"><div className="iphone-brand"><span>FEST</span><i />FRAME</div><small>TOMORROWLAND BELGIUM 2026</small></div>
          <div className="iphone-title"><div><h2>{activeDateLabel}</h2><p>My route · {selectedDaySets.length} sets</p></div><span>{weekend.toUpperCase()}</span></div>
          <div className="wallpaper-priority-legend" aria-label="Priority legend">{(Object.keys(priorityMeta) as Priority[]).map((priority) => <span key={priority}><i style={{ background: priorityMeta[priority].color }} />{priorityMeta[priority].label}</span>)}</div>
          <div className="wallpaper-timeline">
            <div className="wallpaper-hours">{wallpaperBounds && wallpaperLayout.hours.map((hour) => <time key={hour.toISOString()} style={{ top: `${(hour.getTime() - wallpaperBounds.start.getTime()) / (wallpaperBounds.end.getTime() - wallpaperBounds.start.getTime()) * 100}%` }}>{timeFormatter.format(hour)}</time>)}</div>
            <div className="wallpaper-track">{wallpaperBounds && wallpaperLayout.hours.map((hour) => <i key={hour.toISOString()} style={{ top: `${(hour.getTime() - wallpaperBounds.start.getTime()) / (wallpaperBounds.end.getTime() - wallpaperBounds.start.getTime()) * 100}%` }} />)}{wallpaperLayout.items.map(({ performance, lane, columns, stacked, stackDepth, overlap, top, height }) => <div className={`wallpaper-set is-${priorities[performance.id]} ${height < 6.5 ? 'is-compact' : ''} ${columns >= 3 ? 'is-narrow' : ''} ${overlap ? 'has-overlap' : ''} ${stacked ? 'is-stacked' : ''}`} key={performance.id} style={{ top: `${top}%`, height: `${height}%`, minHeight: selectedDaySets.length >= 15 ? 32 : selectedDaySets.length >= 9 ? 36 : 34, left: `${lane / columns * 100}%`, width: `calc(${100 / columns}% - 3px)`, transform: stacked ? `translate(${4 + stackDepth * 2}px, ${3 + stackDepth * 4}px)` : undefined, zIndex: priorityMeta[priorities[performance.id]].weight * 10 + (stacked ? stackDepth : 0), '--stage-color': stageColor(performance.stage.name), '--priority-color': priorityMeta[priorities[performance.id]].color } as React.CSSProperties}><time>{timeFormatter.format(localDate(performance.startTime))}</time><span>{performance.stage.name}</span><strong>{eventLabel(performance)}</strong></div>)}</div>
          </div>
          <footer><span>{wallpaperLayout.hidden ? `+${wallpaperLayout.hidden} more in the app` : overlappingSetCount ? 'Overlaps shown side by side' : 'Ready for the day'}</span><b>MADE WITH FESTFRAME</b></footer>
        </div>
      </div>

      {exportsOpen && <div className="modal-backdrop export-backdrop" role="presentation" onMouseDown={() => setExportsOpen(false)}><section className="export-modal" role="dialog" aria-modal="true" aria-labelledby="export-title" onMouseDown={(event) => event.stopPropagation()}><button className="modal-close icon-button" onClick={() => setExportsOpen(false)} aria-label="Close export menu"><X size={18} /></button><p className="eyebrow">{activeDateLabel}</p><h2 id="export-title">Take your route with you.</h2><p>Select a wallpaper, then export this day. Everything is free.</p><div className="wallpaper-theme-picker" role="group" aria-label="Wallpaper style">{WALLPAPER_THEMES.map((theme) => <button key={theme.id} className={wallpaperTheme === theme.id ? 'selected' : ''} onClick={() => setWallpaperTheme(theme.id)} aria-pressed={wallpaperTheme === theme.id}><span style={{ backgroundImage: `url(${theme.image})` }} /><b>{theme.label}</b><Check size={15} /></button>)}</div><div className="export-options"><button onClick={exportCalendar}><CalendarDays size={22} /><span><b>Calendar file</b><small>Google, Apple & Outlook</small></span><ChevronRight size={17} /></button><button onClick={exportPdf}><FileText size={22} /><span><b>Print-ready PDF</b><small>One clean daily rundown</small></span><ChevronRight size={17} /></button><button className="featured-export" onClick={exportIphoneImage}><ImageDown size={22} /><span><b>Lock-screen image</b><small>iPhone 17 / 17 Pro · 1206×2622</small></span><ChevronRight size={17} /></button></div>{SUPPORT_URL && <a className="support-link" href={SUPPORT_URL} target="_blank" rel="noreferrer" onClick={() => trackEvent('support_opened', { festivalDate: activeDate, weekend })}><Heart size={18} /><span><b>Keep the planner free</b><small>Optional one-time contribution</small></span><ChevronRight size={16} /></a>}</section></div>}
      {toast && <div className="toast" role="status">{toast}</div>}
      <Analytics />
    </main>
  )
}

export default App
