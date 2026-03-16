import { captureApiFailure } from "@/lib/monitoring"

export async function streamGeminiResponse(endpoint, message, onUpdate, onEnd, onError) {
    const latestMessage = message?.[message.length - 1]?.parts?.[0]?.text || ""
    const readerId = Math.random().toString()
    window.localStorage.setItem("readerId", readerId)

    try {
        const response = await fetch(`${endpoint}/?data=${encodeURIComponent(latestMessage)}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
        })

        if (!response.ok) {
            const error = new Error(`Streaming request failed with status ${response.status}`)
            error.userMessage = "The assistant is temporarily unavailable. Please try again."
            captureApiFailure(error, { endpoint, status: response.status, method: "GET", source: "stream" })
            throw error
        }

        if (!response.body) {
            const error = new Error("Readable stream not supported in this environment")
            error.userMessage = "Your browser does not support streaming responses."
            captureApiFailure(error, { endpoint, method: "GET", source: "stream" })
            throw error
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder('utf-8')

        while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value, { stream: true })
            const lines = chunk.split('\n\n').filter(line => line.trim().startsWith('data: '))

            for (const line of lines) {
                const text = String(line.split("data: ")[1])
                onUpdate(text, readerId)
            }
        }

        onEnd()
    } catch (error) {
        const safeError = error instanceof Error ? error : new Error("Streaming request failed")
        if (!safeError.userMessage) {
            safeError.userMessage = "Something went wrong while streaming the response."
            captureApiFailure(safeError, { endpoint, method: "GET", source: "stream" })
        }
        if (typeof onError === "function") {
            onError(safeError.userMessage)
        }
        onEnd()
    }
}