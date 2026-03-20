import { captureApiFailure } from "@/lib/monitoring"

const DEFAULT_ERROR_MESSAGE = "Something went wrong. Please try again."

const friendlyErrorByStatus = (status) => {
  if (status === 400) return "The request could not be processed. Please review your input and try again."
  if (status === 401 || status === 403) return "Your session has expired or access is denied. Please sign in again."
  if (status === 404) return "The requested service is not available."
  if (status >= 500) return "The server is unavailable right now. Please try again shortly."
  return DEFAULT_ERROR_MESSAGE
}

const resolveUrl = (endpoint, baseUrl) => {
  if (/^https?:\/\//i.test(endpoint)) {
    return endpoint
  }

  const normalizedBase = (baseUrl || "").trim().replace(/\/$/, "")
  if (!normalizedBase) {
    return endpoint
  }

  return `${normalizedBase}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`
}

export async function apiRequest(endpoint, options = {}, config = {}) {
  const method = options.method || "GET"
  const url = resolveUrl(endpoint, config.baseUrl || process.env.NEXT_PUBLIC_API_URL)
  const fallbackMessage = config.friendlyErrorMessage || DEFAULT_ERROR_MESSAGE

  try {
    const response = await fetch(url, options)
    const contentType = response.headers.get("content-type") || ""
    const isJson = contentType.includes("application/json")
    const payload = isJson ? await response.json() : null

    if (!response.ok) {
      const userMessage = config.friendlyErrorMessage || friendlyErrorByStatus(response.status)
      const error = new Error(`Request failed with status ${response.status}`)
      error.status = response.status
      error.userMessage = userMessage

      captureApiFailure(error, {
        endpoint,
        method,
        status: response.status,
      })
      throw error
    }

    return payload
  } catch (error) {
    const wrappedError = error instanceof Error ? error : new Error("Unexpected request failure")
    if (!wrappedError.userMessage) {
      wrappedError.userMessage = fallbackMessage
      captureApiFailure(wrappedError, { endpoint, method })
    }
    throw wrappedError
  }
}