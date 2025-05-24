import { NextResponse } from "next/server"
import { Redis } from "@upstash/redis"

export async function DELETE(request: Request, { params }: { params: { eventId: string; name: string } }) {
  try {
    // Inicializace Redis klienta
    const redis = new Redis({
      url: process.env.STORAGE_REST_API_URL || "",
      token: process.env.STORAGE_REST_API_TOKEN || "",
    })

    // Získání existujících účastníků
    const authStr = await redis.get<string>(`auth:${params.eventId}`)
    const auth = authStr ? JSON.parse(authStr) : []

    // Filtrování účastníka
    const filtered = auth.filter((p: any) => p.name !== params.name)

    // Uložení aktualizovaného seznamu
    await redis.set(`auth:${params.eventId}`, JSON.stringify(filtered))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting participant auth:", error)
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 })
  }
}
