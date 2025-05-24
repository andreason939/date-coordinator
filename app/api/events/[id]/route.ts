import { NextResponse } from "next/server"
import { Redis } from "@upstash/redis"

// Funkce pro validaci URL
function isValidUrl(url: string): boolean {
  try {
    return url.startsWith("https://") && new URL(url) instanceof URL
  } catch (e) {
    return false
  }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
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
        },
        { status: 500 },
      )
    }

    // Inicializace Redis klienta s validovanými proměnnými
    const redis = new Redis({
      url: kvUrl,
      token: kvToken,
    })

    const event = await redis.get(`event:${params.id}`)

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    return NextResponse.json(event)
  } catch (error) {
    console.error("Error getting event:", error)
    return NextResponse.json(
      {
        error: `Failed to get event: ${error instanceof Error ? error.message : "Unknown error"}`,
        useLocalStorage: true,
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
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
        },
        { status: 500 },
      )
    }

    const eventData = await request.json()

    // Inicializace Redis klienta s validovanými proměnnými
    const redis = new Redis({
      url: kvUrl,
      token: kvToken,
    })

    // Kontrola, zda událost existuje
    const existingEvent = await redis.get(`event:${params.id}`)

    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Aktualizace události
    await redis.set(`event:${params.id}`, JSON.stringify(eventData))
    return NextResponse.json(eventData)
  } catch (error) {
    console.error("Error updating event:", error)
    return NextResponse.json(
      {
        error: `Failed to update event: ${error instanceof Error ? error.message : "Unknown error"}`,
        useLocalStorage: true,
      },
      { status: 500 },
    )
  }
}
