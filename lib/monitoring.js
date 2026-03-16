let monitoringInitialized = false
let sentryClient = null

const isEnabled = () =>
  process.env.NEXT_PUBLIC_SENTRY_ENABLED === "true" &&
  Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN)

const redactValue = (value) => {
  if (Array.isArray(value)) {
    return value.map(redactValue)
  }

  if (value && typeof value === "object") {
    return Object.entries(value).reduce((acc, [key, item]) => {
      const lowered = key.toLowerCase()
      if (
        lowered.includes("password") ||
        lowered.includes("token") ||
        lowered.includes("secret") ||
        lowered.includes("authorization") ||
        lowered.includes("cookie") ||
        lowered.includes("api_key") ||
        lowered.includes("apikey")
      ) {
        acc[key] = "[REDACTED]"
      } else {
        acc[key] = redactValue(item)
      }
      return acc
    }, {})
  }

  if (typeof value === "string") {
    const lowered = value.toLowerCase()
    if (
      lowered.includes("password") ||
      lowered.includes("token") ||
      lowered.includes("secret") ||
      lowered.includes("authorization")
    ) {
      return "[REDACTED]"
    }
  }

  return value
}

export function initializeMonitoring() {
  if (monitoringInitialized || typeof window === "undefined" || !isEnabled()) {
    return
  }

  const script = document.createElement("script")
  script.src = process.env.NEXT_PUBLIC_SENTRY_BROWSER_CDN_URL || "https://browser.sentry-cdn.com/8.42.0/bundle.tracing.min.js"
  script.async = true
  script.onload = () => {
    const sentryGlobal = window.Sentry
    if (!sentryGlobal) {
      return
    }

    sentryGlobal.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NEXT_PUBLIC_APP_ENV || process.env.NODE_ENV,
      tracesSampleRate: Number(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE || "0"),
      sendDefaultPii: false,
      beforeSend(event) {
        const sanitizedEvent = { ...event }
        if (sanitizedEvent.request?.headers) {
          const headers = { ...sanitizedEvent.request.headers }
          for (const key of Object.keys(headers)) {
            const lowered = key.toLowerCase()
            if (["authorization", "cookie", "x-api-key"].includes(lowered)) {
              headers[key] = "[REDACTED]"
            }
          }
          sanitizedEvent.request.headers = headers
        }

        if (sanitizedEvent.request?.data) {
          sanitizedEvent.request.data = redactValue(sanitizedEvent.request.data)
        }

        return sanitizedEvent
      },
    })

    sentryClient = sentryGlobal
    monitoringInitialized = true
  }

  script.onerror = () => {
    monitoringInitialized = false
  }

  document.head.appendChild(script)
}

export function captureException(error, context = {}) {
  if (!isEnabled() || !sentryClient) {
    return
  }

  sentryClient.captureException(error, {
    extra: redactValue(context),
  })
}

export function captureApiFailure(error, context = {}) {
  captureException(error, { ...context, source: "api" })
}