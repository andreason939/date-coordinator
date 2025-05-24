import { type NextRequest, NextResponse } from "next/server"
import { Redis } from "@upstash/redis"

// Funkce pro validaci URL
function isValidUrl(url: string): boolean {
  try {
    return url.startsWith("https://") && new URL(url) instanceof URL
  } catch (e) {
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    // Kontrola, zda jsou nastaveny proměnné prostředí a jsou platné
    const kvUrl = process.env.STORAGE_REST_API_URL
    const kvToken = process.env.STORAGE_REST_API_TOKEN

    if (!kvUrl || !kvToken || !isValidUrl(kvUrl)) {
      console.error("Invalid KV environment variables:", {
        url: kvUrl ? (isValidUrl(kvUrl) ? "Valid" : "Invalid format") : "Not set",
        token: kvToken ? "Set" : "Not set",
      })

      return NextResponse.json(
        {
          error: "Database configuration is invalid. Please check environment variables.",
          details: "STORAGE_REST_API_URL must be a valid HTTPS URL and STORAGE_REST_API_TOKEN must be set.",
          useLocalStorage: true,
        },
        { status: 500 },
      )
    }

    // Parsování dat z požadavku
    const eventData = await request.json()

    // Generování ID události
    const eventId = Math.random().toString(36).substring(2, 15)

    // Vytvoření nové události
    const newEvent = {
      ...eventData,
      id: eventId,
      participants: [],
      activitySuggestions: [],
      createdAt: new Date().toISOString(),
    }

    try {
      // Inicializace Redis klienta s validovanými proměnnými
      const redis = new Redis({
        url: kvUrl,
        token: kvToken,
      })

      // Uložení události do Redis
      await redis.set(`event:${eventId}`, JSON.stringify(newEvent))
      return NextResponse.json(newEvent)
    } catch (kvError) {
      console.error("KV operation error:", kvError)
      return NextResponse.json(
        {
          error: `Database operation failed: ${kvError instanceof Error ? kvError.message : "Unknown error"}`,
          useLocalStorage: true,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error creating event:", error)
    return NextResponse.json(
      {
        error: `Failed to create event: ${error instanceof Error ? error.message : "Unknown error"}`,
        useLocalStorage: true,
      },
      { status: 500 },
    )
  }
}
