// lib/gtm-scoring.ts

/**
 * GTM Scoring Engine
 *
 * Scores GTM motions based on user-provided selector inputs.
 * The scoring model combines:
 * - Fit score (objective, size, ACV, persona alignment)
 * - Dynamic Impact (base impact × fit/market/horizon multipliers)
 * - Effort V2 (base effort + time/segment/persona/ops deltas)
 * - Match % = weighted combination of fit, impact, and effort
 */

// ---- Types ----

export type CompanySize = "smb" | "mid" | "enterprise"
export type GtmObjective = "pipeline" | "awareness" | "expansion" | "new_market"
export type AcvBand = "low" | "mid" | "high"

export type MotionId =
  | "plg"
  | "sales_led"
  | "outbound_abm"
  | "inbound_demand_gen"
  | "hybrid_plg_sales"
  | "partner_led"
  | "ecosystem_led"
  | "community_led"
  | "event_led"
  | "vertical_specific"

export type OpsIntensity = "light" | "moderate" | "heavy"

export type SeasonalContext = "neutral" | "q1" | "q2" | "q3" | "q4"

export interface SelectorInputs {
  companyName?: string
  companyUrl?: string
  hqCountry?: string
  targetMarketGeography?: string
  companySize: CompanySize
  industry?: string // Added industry field for vertical-specific scoring
  primaryObjective?: GtmObjective
  secondaryObjectives?: GtmObjective[]
  acvBand?: AcvBand
  personas: string[]
  timeHorizonMonths: 3 | 6 | 9 | 12
  salesCycleDays?: number
  salesCycleBucket?: string
  seasonalContext?: SeasonalContext
  seasonalNotes?: string
}

export interface MotionConfig {
  id: MotionId
  name: string
  baseEffort: number
  baseImpact: number
  bestForSizes: CompanySize[]
  bestForObjectives: GtmObjective[]
  bestForAcv: AcvBand[]
  bestForPersonas: string[]
  weightSignals: number
  recommendedHorizonMonths: 3 | 6 | 9 | 12
  opsIntensity: OpsIntensity
  channelCount: number
}

export interface MotionScoreBreakdown {
  motionId: MotionId
  name: string
  effort: number
  impact: number
  matchPercent: number
  objectiveFit: number
  sizeFit: number
  acvFit: number
  personaFit: number
  fitScore: number
  // Dynamic Impact multipliers (for explanation engine)
  motionFitMultiplier: number
  marketContextMultiplier: number
  executionHorizonMultiplier: number
  effortDeltas: {
    timeCompression: number
    segmentComplexity: number
    personaComplexity: number
    motionOps: number
    salesCycleEffort: number
    seasonalityEffort: number
  }
}

// ---- Helper functions ----

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const clampPercent = (value: number) => clamp(Math.round(value), 0, 100)

const round = (value: number) => Math.round(value)

const isAdjacentSize = (a: CompanySize, b: CompanySize): boolean => {
  if (a === b) return true
  if (a === "smb" && b === "mid") return true
  if (a === "mid" && (b === "smb" || b === "enterprise")) return true
  if (a === "enterprise" && b === "mid") return true
  return false
}

const isAdjacentAcv = (a: AcvBand, b: AcvBand): boolean => {
  if (a === b) return true
  if (a === "low" && b === "mid") return true
  if (a === "mid" && (b === "low" || b === "high")) return true
  if (a === "high" && b === "mid") return true
  return false
}

const ACV_MOTION_AFFINITY: Record<MotionId, Record<AcvBand, number>> = {
  // PLG: strong for low ACV (high velocity), decent for mid, weak for high
  plg: { low: 95, mid: 75, high: 40 },
  // Sales-Led: weak for low, decent for mid, strong for high
  sales_led: { low: 40, mid: 70, high: 95 },
  // Outbound ABM: weak for low, decent for mid, strong for high
  outbound_abm: { low: 35, mid: 75, high: 95 },
  // Inbound Demand Gen: strong for low/mid, weaker for high
  inbound_demand_gen: { low: 90, mid: 85, high: 55 },
  // Hybrid PLG + Sales: good across the board, best for mid
  hybrid_plg_sales: { low: 75, mid: 95, high: 70 },
  // Partner-Led: moderate for low, good for mid, strong for high
  partner_led: { low: 50, mid: 75, high: 90 },
  // Ecosystem-Led: good for low/mid (developer tools), decent for high
  ecosystem_led: { low: 80, mid: 85, high: 70 },
  // Community-Led: strong for low/mid, weaker for high
  community_led: { low: 90, mid: 80, high: 50 },
  // Event-Led: moderate for low, good for mid, strong for high
  event_led: { low: 55, mid: 80, high: 90 },
  // Vertical-Specific: weak for low, decent for mid, strong for high
  vertical_specific: { low: 45, mid: 75, high: 95 },
}

// ---- Import library-driven motion configs ----
import { MOTION_CONFIGS_FROM_LIBRARY } from "@/lib/gtm-motions"

export const MOTION_CONFIGS: MotionConfig[] = MOTION_CONFIGS_FROM_LIBRARY

// ---- Fit scoring helpers ----

function computeObjectiveFit(motion: MotionConfig, primary: GtmObjective, secondary?: GtmObjective[]): number {
  if (motion.bestForObjectives.includes(primary)) return 100
  if (secondary && secondary.some((obj) => motion.bestForObjectives.includes(obj))) {
    return 75
  }
  return 40
}

function computeSizeFit(motion: MotionConfig, size: CompanySize): number {
  if (motion.bestForSizes.includes(size)) return 100
  if (motion.bestForSizes.some((s) => isAdjacentSize(size, s))) {
    return 70
  }
  return 40
}

function computeAcvFit(motion: MotionConfig, acv: AcvBand): number {
  // Use motion-specific affinity matrix for differentiated scoring
  const affinityScores = ACV_MOTION_AFFINITY[motion.id]
  if (affinityScores) {
    return affinityScores[acv]
  }
  // Fallback to original logic if motion not in affinity map
  if (motion.bestForAcv.includes(acv)) return 100
  if (motion.bestForAcv.some((a) => isAdjacentAcv(acv, a))) {
    return 70
  }
  return 40
}

function computePersonaFit(motion: MotionConfig, personas: string[]): number {
  if (!motion.bestForPersonas.length) return 60
  const normalizedPersonas = personas.map((p) => p.toLowerCase())
  const matches = motion.bestForPersonas.filter((p) => normalizedPersonas.includes(p.toLowerCase())).length
  if (matches === 0) return 20
  const ratio = matches / motion.bestForPersonas.length
  const score = ratio * 100
  return clamp(score, 40, 100)
}

// ---- Dynamic Impact Multiplier Helpers ----

function getMotionFitMultiplier(fitScore: number): number {
  if (fitScore >= 80) return 1.3
  if (fitScore >= 65) return 1.15
  if (fitScore >= 45) return 1.0
  if (fitScore >= 30) return 0.9
  return 0.8
}

function getMarketContextMultiplier(inputs: SelectorInputs): number {
  const acv = inputs.acvBand
  const geo = inputs.targetMarketGeography

  let acvMultiplier = 1.0
  if (acv === "high") acvMultiplier = 1.2
  else if (acv === "mid") acvMultiplier = 1.0
  else if (acv === "low") acvMultiplier = 0.9

  let geoMultiplier = 1.0
  if (!geo || geo.toLowerCase() === "global") {
    geoMultiplier = 1.0
  } else if (geo === "North America") {
    geoMultiplier = 1.0
  } else if (geo === "EMEA") {
    geoMultiplier = 1.0
  } else if (geo === "APAC") {
    geoMultiplier = 0.95
  } else if (geo === "LATAM") {
    geoMultiplier = 1.05
  } else if (geo === "Europe") {
    geoMultiplier = 1.0
  }

  return acvMultiplier * geoMultiplier
}

function getExecutionHorizonMultiplier(inputs: SelectorInputs): number {
  const months = inputs.timeHorizonMonths

  switch (months) {
    case 3:
      return 0.9
    case 6:
      return 1.0
    case 9:
      return 1.05
    case 12:
      return 1.15
    default:
      return 1.0
  }
}

function salesCycleMultiplier(inputs: SelectorInputs): number {
  const { salesCycleDays, timeHorizonMonths, primaryObjective } = inputs
  if (!salesCycleDays || !timeHorizonMonths) return 1

  // Only apply to performance objectives
  const perfObjectives: GtmObjective[] = ["pipeline", "expansion"]
  if (!primaryObjective || !perfObjectives.includes(primaryObjective)) {
    return 1
  }

  const horizonDays = timeHorizonMonths * 30
  const ratio = horizonDays / salesCycleDays

  if (ratio >= 1.5) return 1.0
  if (ratio >= 1.0) return 0.95
  if (ratio >= 0.75) return 0.9
  if (ratio >= 0.5) return 0.8
  return 0.7
}

function seasonalityMultiplier(inputs: SelectorInputs, motion: MotionConfig): number {
  const context = inputs.seasonalContext ?? "neutral"
  if (context === "neutral") return 1.0

  const motionId = motion.id
  let multiplier = 1.0

  switch (context) {
    case "q1":
      // Q1: New budgets - good for expansion/sales-led
      if (motionId === "sales_led" || motionId === "outbound_abm") {
        multiplier = 1.05
      } else {
        multiplier = 0.95
      }
      break
    case "q2":
      // Q2: Execution peak - good for most motions
      multiplier = 1.05
      break
    case "q3":
      // Q3: Summer slowdown - good for event/community
      if (motionId === "event_led" || motionId === "community_led") {
        multiplier = 1.05
      } else {
        multiplier = 0.95
      }
      break
    case "q4":
      // Q4: Budget deadline - good for sales-led/ABM/vertical
      if (motionId === "sales_led" || motionId === "outbound_abm" || motionId === "vertical_specific") {
        multiplier = 1.05
      } else {
        multiplier = 0.95
      }
      break
  }

  // Clamp between 0.9 and 1.1
  return Math.min(1.1, Math.max(0.9, multiplier))
}

// ---- Effort V2 Helper Functions ----

function calcTimeCompressionDelta(recommendedHorizonMonths: number, selectedHorizonMonths: number | undefined): number {
  if (!selectedHorizonMonths || selectedHorizonMonths <= 0) {
    return 0
  }

  const ratio = recommendedHorizonMonths / selectedHorizonMonths

  if (ratio >= 1.5) return 20
  if (ratio >= 1.1) return 10
  if (ratio >= 0.9 && ratio <= 1.1) return 0
  if (ratio >= 0.7) return -5
  return -10
}

function calcSegmentComplexityDelta(inputs: SelectorInputs): number {
  let companySizeDelta = 0
  const size = inputs.companySize

  if (size === "mid") {
    companySizeDelta = 5
  } else if (size === "enterprise") {
    companySizeDelta = 10
  }

  let geoDelta = 0
  const geo = inputs.targetMarketGeography

  if (!geo) {
    geoDelta = 0
  } else if (geo.toLowerCase() === "global") {
    geoDelta = 10
  } else {
    geoDelta = 5
  }

  return Math.min(20, companySizeDelta + geoDelta)
}

function calcPersonaComplexityDelta(inputs: SelectorInputs): number {
  const personas = inputs.personas ?? []
  const count = personas.length

  let base = 0
  if (count >= 2 && count <= 3) base = 5
  else if (count >= 4 && count <= 5) base = 10
  else if (count > 5) base = 15

  const seniorityKeywords = ["vp", "cfo", "cio", "chief", "cmo", "ceo", "c-suite", "executive", "cro", "cto"]
  const hasSeniorPersona = personas.some((p) => {
    const normalized = p.toLowerCase()
    return seniorityKeywords.some((kw) => normalized.includes(kw))
  })

  if (hasSeniorPersona) {
    base += 5
  }

  return Math.min(20, base)
}

function calcMotionOpsDelta(motion: MotionConfig): number {
  let opsDelta = 0
  if (motion.opsIntensity === "moderate") opsDelta = 5
  else if (motion.opsIntensity === "heavy") opsDelta = 10

  let channelDelta = 0
  if (motion.channelCount >= 3 && motion.channelCount <= 4) {
    channelDelta = 5
  } else if (motion.channelCount >= 5) {
    channelDelta = 10
  }

  const total = opsDelta + channelDelta
  return Math.min(20, total)
}

function salesCycleEffortDelta(inputs: SelectorInputs): number {
  const { salesCycleDays, timeHorizonMonths } = inputs
  if (!salesCycleDays || !timeHorizonMonths) return 0

  const horizonDays = timeHorizonMonths * 30
  const ratio = horizonDays / salesCycleDays

  if (ratio >= 1.0) return 0
  if (ratio >= 0.75) return 5
  if (ratio >= 0.5) return 10
  return 15
}

function seasonalityEffortDelta(inputs: SelectorInputs): number {
  const context = inputs.seasonalContext ?? "neutral"

  switch (context) {
    case "q2":
      return -5 // Execution peak - easier
    case "q3":
      return 5 // Summer slowdown - harder
    case "q4":
      return 10 // Budget deadline - harder
    case "q1":
    case "neutral":
    default:
      return 0
  }
}

// ---- Public scoring API ----

export function scoreMotion(motion: MotionConfig, inputs: SelectorInputs): MotionScoreBreakdown {
  const objectiveFit = inputs.primaryObjective
    ? computeObjectiveFit(motion, inputs.primaryObjective, inputs.secondaryObjectives)
    : 50
  const sizeFit = computeSizeFit(motion, inputs.companySize)
  const acvFit = inputs.acvBand ? computeAcvFit(motion, inputs.acvBand) : 50
  const personaFit = computePersonaFit(motion, inputs.personas)

  const fitScore = round(0.35 * objectiveFit + 0.25 * sizeFit + 0.25 * acvFit + 0.15 * personaFit)

  const timeCompressionDelta = calcTimeCompressionDelta(motion.recommendedHorizonMonths, inputs.timeHorizonMonths)
  const segmentComplexityDelta = calcSegmentComplexityDelta(inputs)
  const personaComplexityDelta = calcPersonaComplexityDelta(inputs)
  const motionOpsDelta = calcMotionOpsDelta(motion)
  const salesEffort = salesCycleEffortDelta(inputs)
  const seasonEffort = seasonalityEffortDelta(inputs)

  const effort = clampPercent(
    motion.baseEffort +
      timeCompressionDelta +
      segmentComplexityDelta +
      personaComplexityDelta +
      motionOpsDelta +
      salesEffort +
      seasonEffort,
  )

  const baseImpact = motion.baseImpact
  const motionFitMultiplier = getMotionFitMultiplier(fitScore)
  const marketContextMultiplier = getMarketContextMultiplier(inputs)
  const executionHorizonMultiplier = getExecutionHorizonMultiplier(inputs)
  const salesMult = salesCycleMultiplier(inputs)
  const seasonMult = seasonalityMultiplier(inputs, motion)

  const dynamicImpact = clampPercent(
    baseImpact * motionFitMultiplier * marketContextMultiplier * executionHorizonMultiplier * salesMult * seasonMult,
  )

  const matchPercent = clamp(round(0.4 * fitScore + 0.3 * dynamicImpact + 0.3 * (100 - effort)), 0, 100)

  return {
    motionId: motion.id,
    name: motion.name,
    effort,
    impact: dynamicImpact,
    matchPercent,
    objectiveFit: round(objectiveFit),
    sizeFit: round(sizeFit),
    acvFit: round(acvFit),
    personaFit: round(personaFit),
    fitScore,
    motionFitMultiplier,
    marketContextMultiplier,
    executionHorizonMultiplier,
    effortDeltas: {
      timeCompression: timeCompressionDelta,
      segmentComplexity: segmentComplexityDelta,
      personaComplexity: personaComplexityDelta,
      motionOps: motionOpsDelta,
      salesCycleEffort: salesEffort,
      seasonalityEffort: seasonEffort,
    },
  }
}

export function scoreAllMotions(inputs: SelectorInputs): MotionScoreBreakdown[] {
  return MOTION_CONFIGS.map((motion) => scoreMotion(motion, inputs))
}

// ---- Mapping helpers for UI values ----

export function mapObjectiveToScoring(value: string): GtmObjective | undefined {
  if (!value || value.trim() === "") return undefined
  const objectiveMap: Record<string, GtmObjective> = {
    // Marketing Objectives
    "generate-awareness": "awareness",
    "create-demand": "pipeline",
    "category-leadership": "awareness",
    "new-offering": "new_market",
    // Sales Objectives
    "accelerate-pipeline": "pipeline",
    "expand-accounts": "expansion",
    "scale-revenue": "pipeline",
    "optimize-pricing": "expansion",
    // Customer Success Objectives
    "drive-adoption": "expansion",
    "customer-advocacy": "awareness",
    "increase-nrr": "expansion",
    // Legacy values for backward compatibility
    pipeline: "pipeline",
    market_expansion: "new_market",
    competitive_positioning: "awareness",
    retention: "expansion",
    brand_awareness: "awareness",
  }
  return objectiveMap[value]
}

export function mapAcvToScoring(value: string): AcvBand | undefined {
  if (!value || value.trim() === "") return undefined
  const acvMap: Record<string, AcvBand> = {
    low: "low",
    mid: "mid",
    high: "high",
    smb: "low",
    "mid-market": "mid",
    enterprise: "high",
    strategic: "high",
  }
  return acvMap[value]
}

export function mapCompanySizeToScoring(value: string): CompanySize {
  const sizeMap: Record<string, CompanySize> = {
    smb: "smb",
    "mid-market": "mid",
    enterprise: "enterprise",
  }
  return sizeMap[value] || "mid"
}

export function mapTimeHorizonToScoring(value: string): 3 | 6 | 9 | 12 {
  const num = Number.parseInt(value, 10)
  if (num === 3 || num === 6 || num === 9 || num === 12) return num
  return 6
}
