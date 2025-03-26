import { xai } from '@ai-sdk/xai'
import { generateText } from 'ai'
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
    console.log("Solicitud recibida en /api/generate:", { messages, data })

    const finalMessages = data?.reinterpret
      ? [
          ...messages,
          {
            role: 'user',
            content: `Reinterpreta el siguiente texto: "${data.reinterpret}". Proporciona una nueva versión con un tono diferente o un resumen.`,
          },
        ]
      : messages

    const { text } = await generateText({
      model: xai('grok-2'),
      messages: finalMessages,
    })

    console.log("Respuesta generada con éxito:", text)
    return new Response(JSON.stringify({ text }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
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