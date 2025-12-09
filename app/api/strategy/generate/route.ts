import { NextResponse } from "next/server"

interface StrategyResult {
  success: boolean
  planId: string
  message?: string
}

export async function POST(req: Request): Promise<NextResponse<StrategyResult | { error: string }>> {
  try {
    const body = await req.json()

    const plan = body?.plan
    if (!plan?.id || plan?.status !== "active") {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
    }

    // Simulate processing
    await new Promise((resolve) => setTimeout(resolve, 1500))

    return NextResponse.json({
      success: true,
      planId: plan.id,
      message: "GTM strategy generated successfully.",
    })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
