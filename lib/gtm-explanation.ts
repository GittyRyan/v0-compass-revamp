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

  const deltas = scores.effortDeltas

  // Time compression explanation
  if (deltas.timeCompression >= 20) {
    reasons.push(
      `Effort is significantly higher because you're compressing a ${motion.recommendedHorizonMonths}-month motion into ${inputs.timeHorizonMonths} months.`,
    )
  } else if (deltas.timeCompression >= 10) {
    reasons.push(
      `Effort is elevated due to a compressed timeline (${inputs.timeHorizonMonths} months vs the recommended ${motion.recommendedHorizonMonths} months).`,
    )
  } else if (deltas.timeCompression <= -5) {
    reasons.push(
      `Effort is reduced because your ${inputs.timeHorizonMonths}-month timeline gives generous runway for this motion.`,
    )
  }

  // Segment complexity explanation
  if (deltas.segmentComplexity >= 15) {
    reasons.push(
      `Effort is higher due to enterprise scale and multi-region (${inputs.targetMarketGeography || "Global"}) complexity.`,
    )
  } else if (deltas.segmentComplexity >= 10) {
    reasons.push(
      `Effort increases due to ${inputs.companySize === "enterprise" ? "enterprise-scale" : "geographic"} complexity.`,
    )
  }

  // Persona complexity explanation
  if (deltas.personaComplexity >= 15) {
    reasons.push(
      `Effort is higher because you're targeting ${inputs.personas.length} personas including senior stakeholders, requiring multi-threaded engagement.`,
    )
  } else if (deltas.personaComplexity >= 10) {
    reasons.push(
      `Effort increases due to a larger buying committee (${inputs.personas.length} personas) requiring coordinated outreach.`,
    )
  }

  // Motion ops explanation
  if (deltas.motionOps >= 15) {
    reasons.push(
      `Effort is elevated because this motion requires heavy orchestration across ${motion.channelCount} channels.`,
    )
  } else if (deltas.motionOps >= 10) {
    reasons.push(`Effort is moderately higher due to multi-channel coordination required by this motion.`)
  }

  // Overall effort summary
  if (scores.effort >= 80) {
    reasons.push(
      `Overall effort is high due to a combination of timeline compression, segment complexity, persona count, and operational intensity.`,
    )
  } else if (scores.effort <= 40) {
    reasons.push(
      `Overall effort stays low because this motion targets a narrow audience with fewer channels and a generous timeline.`,
    )
  }

  // Motion Fit Multiplier explanation
  if (scores.motionFitMultiplier > 1.0) {
    reasons.push(
      `Impact is boosted because this motion strongly aligns with your GTM objective, target personas, and company size.`,
    )
  } else if (scores.motionFitMultiplier < 1.0) {
    reasons.push(`Impact is reduced because this motion is only a partial fit for your objective and segment.`)
  }

  // Execution Horizon Multiplier explanation
  if (inputs.timeHorizonMonths === 3 && scores.executionHorizonMultiplier < 1.0) {
    reasons.push(`Impact is constrained by a short 3-month execution horizon.`)
  } else if (inputs.timeHorizonMonths === 12 && scores.executionHorizonMultiplier > 1.0) {
    reasons.push(`Impact is increased by a longer 12-month execution horizon, giving this motion time to compound.`)
  } else if (inputs.timeHorizonMonths === 9 && scores.executionHorizonMultiplier > 1.0) {
    reasons.push(`Impact benefits from a 9-month execution window, allowing sufficient time for momentum to build.`)
  }

  // Market Context Multiplier explanation (ACV-driven)
  if (inputs.acvBand === "high" && scores.marketContextMultiplier > 1.0) {
    reasons.push(`High ACV deals increase the potential impact of this motion.`)
  } else if (inputs.acvBand === "low" && scores.marketContextMultiplier < 1.0) {
    reasons.push(`Lower ACV deals reduce the potential impact per opportunity, requiring higher volume.`)
  }

  // Impact summary
  if (scores.impact >= 85) {
    reasons.push(`If executed well, this motion has high upside potential for pipeline and revenue.`)
  } else if (scores.impact >= 70) {
    reasons.push(`This motion offers solid upside with a balanced risk–return profile.`)
  }

  // 8) Overall match narrative
  if (scores.matchPercent >= 85) {
    reasons.push(`Overall, this motion is a strong fit for your current GTM situation.`)
  } else if (scores.matchPercent >= 70) {
    reasons.push(`Overall, this motion is a good fit with a few trade-offs to manage.`)
  } else {
    reasons.push(`Overall fit is moderate; treat this as a secondary or experimental motion.`)
  }

  return reasons
}
