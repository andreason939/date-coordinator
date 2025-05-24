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

    // Kontrola, zda jméno již existuje
    if (auth.some((p: any) => p.name === name)) {
      return NextResponse.json({ error: "Name already exists" }, { status: 400 })
    }

    // Vytvoření nového účastníka
    const newParticipant = {
      name,
      passwordHash: simpleHash(password),
      createdAt: new Date().toISOString(),
    }

    // Přidání účastníka a uložení
    auth.push(newParticipant)
    await redis.set(`auth:${params.eventId}`, JSON.stringify(auth))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error registering participant:", error)
    return NextResponse.json({ error: "Failed to register" }, { status: 500 })
  }
}
