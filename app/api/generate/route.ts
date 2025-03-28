import { xai } from '@ai-sdk/xai'
import { streamText } from 'ai'
import { NextRequest } from 'next/server'

export const maxDuration = 30

function errorHandler(error: unknown): string {
  if (error == null) {
    return 'Unknown error'
  }
  if (typeof error === 'string') {
    return error
  }
  if (error instanceof Error) {
    return error.message
  }
  return JSON.stringify(error)
}

export async function POST(req: NextRequest) {
  try {
    const { messages, data } = await req.json()

    const finalMessages = data?.reinterpret
      ? [
          ...messages,
          {
            role: 'user',
            content: `Reinterpreta el siguiente texto: "${data.reinterpret}". Proporciona una nueva versión con un tono diferente o un resumen.`,
          },
        ]
      : messages

    const result = await streamText({
      model: xai('grok-2'),
      messages: finalMessages,
    })

    return result.toDataStreamResponse({
      getErrorMessage: errorHandler,
    })
  } catch (error: unknown) {
    console.error("Error en /api/generate:", error)
    const errorMessage = errorHandler(error)
    return new Response(
      JSON.stringify({
        error: errorMessage,
        details: error instanceof Error ? error.stack || "No additional details" : "No additional details",
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}