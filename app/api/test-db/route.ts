import { NextResponse } from "next/server"
import { Redis } from "@upstash/redis"

// Jednoduchý endpoint pro testování připojení k databázi
export async function GET() {
  try {
    // Kontrola, zda jsou nastaveny proměnné prostředí
    if (!process.env.STORAGE_REST_API_URL || !process.env.STORAGE_REST_API_TOKEN) {
      return NextResponse.json(
        {
          status: "error",
          message: "Database configuration is missing. Please check environment variables.",
          env: {
            STORAGE_REST_API_URL: process.env.STORAGE_REST_API_URL ? "Set" : "Not set",
            STORAGE_REST_API_TOKEN: process.env.STORAGE_REST_API_TOKEN ? "Set" : "Not set",
          },
        },
        { status: 500 },
      )
    }

    // Inicializace Redis klienta
    const redis = new Redis({
      url: process.env.STORAGE_REST_API_URL,
      token: process.env.STORAGE_REST_API_TOKEN,
    })

    // Test připojení k databázi
    const pingResult = await redis.ping()

    // Test zápisu a čtení
    const testKey = "test_" + Date.now()
    await redis.set(testKey, "Test value")
    const testValue = await redis.get(testKey)
    await redis.del(testKey)

    return NextResponse.json({
      status: "success",
      message: "Database connection successful",
      ping: pingResult,
      testValue,
      env: {
        STORAGE_REST_API_URL: process.env.STORAGE_REST_API_URL ? "Set" : "Not set",
        STORAGE_REST_API_TOKEN: process.env.STORAGE_REST_API_TOKEN ? "Set" : "Not set",
        NODE_ENV: process.env.NODE_ENV,
      },
    })
  } catch (error) {
    console.error("Database test error:", error)
    return NextResponse.json(
      {
        status: "error",
        message: `Database test failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        env: {
          STORAGE_REST_API_URL: process.env.STORAGE_REST_API_URL ? "Set" : "Not set",
          STORAGE_REST_API_TOKEN: process.env.STORAGE_REST_API_TOKEN ? "Set" : "Not set",
          NODE_ENV: process.env.NODE_ENV,
        },
      },
      { status: 500 },
    )
  }
}
