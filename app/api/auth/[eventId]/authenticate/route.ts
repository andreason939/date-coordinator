import { NextResponse } from "next/server"
import { Redis } from "@upstash/redis"
import { simpleHash } from "@/lib/kv-database"

export async function POST(request: Request, { params }: { params: { eventId: string } }) {
  try {
    const { name, password } = await request.json()

    if (!name || !password) {
      return NextResponse.json({ error: "Name and password are required" }, { status: 400 })
    }

    // Inicializace Redis klienta
    const redis = new Redis({
      url: process.env.STORAGE_REST_API_URL || "",
      token: process.env.STORAGE_REST_API_TOKEN || "",
    })

    // Získání existujících účastníků
    const authStr = await redis.get<string>(`auth:${params.eventId}`)
    const auth = authStr ? JSON.parse(authStr) : []

    // Nalezení účastníka
    const participant = auth.find((p: any) => p.name === name)

    if (!participant) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Kontrola hesla
    const isValid = participant.passwordHash === simpleHash(password)

    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error authenticating participant:", error)
    return NextResponse.json({ error: "Failed to authenticate" }, { status: 500 })
  }
}
