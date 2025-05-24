import { NextResponse } from "next/server"

export async function GET() {
  try {
    const convexDeployment = process.env.CONVEX_DEPLOYMENT
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL

    return NextResponse.json({
      details: {
        deployment: convexDeployment || "Not set",
        url: convexUrl || "Not set",
      },
    })
  } catch (error) {
    return NextResponse.json({
      details: {
        error: error instanceof Error ? error.message : "Unknown error",
      },
    })
  }
}
