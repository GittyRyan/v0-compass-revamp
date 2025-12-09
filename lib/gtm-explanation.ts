// lib/gtm-explanation.ts

import type { MotionConfig, MotionScoreBreakdown, SelectorInputs } from "@/lib/gtm-scoring"

// Human-readable labels for display
const objectiveLabels: Record<string, string> = {
  pipeline: "Pipeline Generation",
  awareness: "Market Awareness",
  expansion: "Account Expansion",
  new_market: "New Market Entry",
}

const acvLabels: Record<string, string> = {
  low: "$5K - $25K (SMB)",
  mid: "$25K - $100K (Mid-Market)",
  high: "$100K+ (Enterprise/Strategic)",
}

const sizeLabels: Record<string, string> = {
  smb: "SMB",
  mid: "Mid-Market",
  enterprise: "Enterprise",
}

const acvRationale: Record<string, Record<string, string>> = {
  low: {
    strong:
      "Effective for low-ACV, high-velocity inbound and product-led motions where volume offsets smaller deal sizes.",
    partial: "Your low ACV may require higher lead volume to reach revenue targets with this motion.",
    weak: "This motion is typically optimized for higher ACV deals; expect more effort to make unit economics work.",
  },
  mid: {
    strong:
      "This motion aligns well with your mid-ACV balanced sales model, supporting both efficiency and deal quality.",
    partial: "Your mid-market ACV fits moderately well; fine-tune targeting to maximize conversion rates.",
    weak: "Mid-ACV deals may underperform with this motion unless you adapt the approach significantly.",
  },
  high: {
    strong:
      "Strong alignment with high-ACV enterprise outreach where deal size justifies the investment in this motion.",
    partial: "Your high ACV provides solid foundation for this motion with some adaptation needed.",
    weak: "High-ACV deals typically require more personalized motions; this approach may feel too generic.",
  },
}

export function buildWhyRecommendation(
  motion: MotionConfig,
  scores: MotionScoreBreakdown,
  inputs: SelectorInputs,
): string[] {
  const reasons: string[] = []

  // 1) Objective fit
  if (scores.objectiveFit >= 80) {
    reasons.push(
      `Strong alignment with your primary GTM objective of ${objectiveLabels[inputs.primaryObjective || ""] || inputs.primaryObjective || "pipeline generation"}.`,
    )
  } else if (scores.objectiveFit >= 60) {
    reasons.push(
      `Partial alignment with your current GTM objective; this motion may require additional enablement and support.`,
    )
  } else {
    reasons.push(
      `This motion is not naturally optimized for your primary GTM objective and should be treated as an experiment.`,
    )
  }

  // 2) Company size fit
  if (scores.sizeFit >= 80) {
    reasons.push(
      `Well suited for ${sizeLabels[inputs.companySize] || inputs.companySize.toUpperCase()} organizations, matching your current company size.`,
    )
  } else if (scores.sizeFit < 60) {
    reasons.push(`Designed primarily for different company sizes, which can add execution friction for your team.`)
  }

  // 3) ACV / offering fit - now with specific rationale based on ACV band
  if (inputs.acvBand) {
    const acvBand = inputs.acvBand
    if (scores.acvFit >= 80) {
      reasons.push(
        acvRationale[acvBand]?.strong ||
          `Matches your ${acvLabels[acvBand] || acvBand} ACV offering, making targeting and deal structure more straightforward.`,
      )
    } else if (scores.acvFit >= 60) {
      reasons.push(
        acvRationale[acvBand]?.partial ||
          `Your ACV band shows partial alignment with this motion; some optimization may be needed.`,
      )
    } else {
      reasons.push(
        acvRationale[acvBand]?.weak ||
          `Your current price point is atypical for this motion; expect more iteration on packaging and pricing.`,
      )
    }
  }

  // 4) Persona fit
  if (scores.personaFit >= 80 && inputs.personas.length > 0) {
    reasons.push(
      `Targets the same buying personas you've defined (${inputs.personas.join(", ")}), increasing relevance and response rates.`,
    )
  } else if (scores.personaFit < 60 && inputs.personas.length > 0) {
    reasons.push(
      `Only partially overlaps with your defined personas, so messaging and targeting will need extra tuning.`,
    )
  }

  // 5) Timeline impact on effort
  if (inputs.timeHorizonMonths === 3) {
    reasons.push(
      `Effort is higher due to an aggressive 3-month execution timeline, requiring compressed coordination and faster ramp-up.`,
    )
  } else if (inputs.timeHorizonMonths === 6) {
    reasons.push(`A 6-month timeline adds moderate execution pressure, slightly increasing the effort required.`)
  } else if (inputs.timeHorizonMonths === 12) {
    reasons.push(
      `Effort is slightly reduced because this motion allows more distributed execution over a 12-month window.`,
    )
  }
  // Note: 9-month timeline is baseline, no specific explanation needed

  // 6) Effort vs Impact summary
  if (scores.effort <= 55) {
    reasons.push(`Execution lift is relatively low for your current stage and team.`)
  } else if (scores.effort >= 75) {
    reasons.push(
      `This is a heavier-lift motion operationally and will require significant coordination across functions.`,
    )
  }

  if (scores.impact >= 85) {
    reasons.push(`If executed well, this motion has high upside potential for pipeline and revenue.`)
  } else if (scores.impact >= 70) {
    reasons.push(`This motion offers solid upside with a balanced risk–return profile.`)
  }

  // 7) Overall match narrative
  if (scores.matchPercent >= 85) {
    reasons.push(`Overall, this motion is a strong fit for your current GTM situation.`)
  } else if (scores.matchPercent >= 70) {
    reasons.push(`Overall, this motion is a good fit with a few trade-offs to manage.`)
  } else {
    reasons.push(`Overall fit is moderate; treat this as a secondary or experimental motion.`)
  }

  return reasons
}
