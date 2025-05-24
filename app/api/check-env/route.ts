import { NextResponse } from "next/server"

// Funkce pro validaci URL
function isValidUrl(url: string): boolean {
  try {
    return url.startsWith("https://") && new URL(url) instanceof URL
  } catch (e) {
    return false
  }
}

export async function GET() {
  try {
    const kvUrl = process.env.STORAGE_REST_API_URL
    const kvToken = process.env.STORAGE_REST_API_TOKEN

    // Kontrola, zda jsou proměnné prostředí nastaveny a platné
    const isUrlValid = kvUrl && isValidUrl(kvUrl)
    const isTokenValid = kvToken && kvToken.length > 10

    const isValid = isUrlValid && isTokenValid

    return NextResponse.json({
      valid: isValid,
      details: {
        url: kvUrl ? (isUrlValid ? "Valid" : "Invalid format") : "Not set",
        token: kvToken ? (isTokenValid ? "Valid" : "Invalid format") : "Not set",
      },
    })
  } catch (error) {
    return NextResponse.json({
      valid: false,
      details: {
        error: error instanceof Error ? error.message : "Unknown error",
      },
    })
  }
}
