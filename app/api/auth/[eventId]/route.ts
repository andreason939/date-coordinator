import { type NextRequest, NextResponse } from "next/server"
import { Redis } from "@upstash/redis"

export async function GET(request: NextRequest, { params }: { params: { eventId: string } }) {
  try {
    // Inicializace Redis klienta
    const redis = new Redis({
      url: process.env.STORAGE_REST_API_URL || "",
      token: process.env.STORAGE_REST_API_TOKEN || "",
    })

    const auth = await redis.get<string>(`auth:${params.eventId}`)
    return NextResponse.json(auth ? JSON.parse(auth) : [])
  } catch (error) {
    console.error("Error getting auth:", error)
    return NextResponse.json({ error: "Failed to get auth" }, { status: 500 })
  }
}
