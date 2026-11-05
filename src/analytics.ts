function addScript(attrs: { src?: string; text?: string }) {
  const script = document.createElement('script')
  if (attrs.src) {
    script.async = true
    script.src = attrs.src
  }
  if (attrs.text) script.text = attrs.text
  document.head.appendChild(script)
}

function initGoogleAnalytics(id: string) {
  addScript({ src: `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}` })
  addScript({
    text: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config',${JSON.stringify(id)});`,
  })
}

function initClarity(id: string) {
  addScript({
    text: `window.clarity=window.clarity||function(){(window.clarity.q=window.clarity.q||[]).push(arguments)};`,
  })
  addScript({ src: `https://www.clarity.ms/tag/${encodeURIComponent(id)}` })
}

const SENSITIVE_PARAMS = ['token', 'code']
const URL_CHECK_INTERVAL_MS = 250
const URL_CHECK_TIMEOUT_MS = 15000

export function hasSensitiveUrl(location: Pick<Location, 'search' | 'hash'> = window.location) {
  const search = new URLSearchParams(location.search)
  const hash = new URLSearchParams(location.hash.replace(/^#/, ''))
  return SENSITIVE_PARAMS.some((name) => search.has(name) || hash.has(name))
}

function whenUrlIsClean(start: () => void) {
  if (!hasSensitiveUrl()) return start()
  const startedAt = Date.now()
  const timer = window.setInterval(() => {
    if (!hasSensitiveUrl()) {
      window.clearInterval(timer)
      start()
    } else if (Date.now() - startedAt > URL_CHECK_TIMEOUT_MS) {
      window.clearInterval(timer)
    }
  }, URL_CHECK_INTERVAL_MS)
}

export function initAnalytics() {
  if (!import.meta.env.PROD) return
  const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID
  const clarityId = import.meta.env.VITE_CLARITY_PROJECT_ID
  if (!gaId && !clarityId) return
  whenUrlIsClean(() => {
    if (gaId) initGoogleAnalytics(gaId)
    if (clarityId) initClarity(clarityId)
  })
}
