// lib/gtm-scoring.ts

// ---- Types ----

export type CompanySize = "smb" | "mid" | "enterprise"
export type GtmObjective = "pipeline" | "awareness" | "expansion" | "new_market"
export type AcvBand = "low" | "mid" | "high"

export type MotionId =
  | "plg"
  | "sales_led"
  | "outbound_abm"
  | "inbound_demand_gen"
  | "hybrid_plg_sales_assist"
  | "partner_led"
  | "ecosystem_led"
  | "community_led"
  | "event_led"
  | "vertical_specific"

export type OpsIntensity = "light" | "moderate" | "heavy"

export interface SelectorInputs {
  companyName?: string
  companyUrl?: string
  hqCountry?: string
  targetMarketGeography?: string
  industry?: string
  targetIndustry?: string
  companySize: CompanySize
  targetCompanySize?: CompanySize
  primaryObjective?: GtmObjective
  secondaryObjectives?: GtmObjective[]
  acvBand?: AcvBand
  personas: string[]
  targetDepartments?: string[]
  timeHorizonMonths: 3 | 6 | 9 | 12
}

export interface MotionConfig {
  id: MotionId
  name: string
  coreStrategy?: string
  bestFor?: string
  lifecycleStages?: string[]
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
  matchWeights?: {
    primaryObjective?: Record<string, number>
    acvBand?: Record<string, number>
    companySize?: Record<string, number>
    targetCompanySize?: Record<string, number>
    industry?: Record<string, number>
    targetMarketGeography?: Record<string, number>
    personaCount?: { low: number; medium: number; high: number }
  }
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
  industryFit?: number
  geoFit?: number
  targetSizeFit?: number
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
  }
}

// ---- Helper functions ----

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const clampPercent = (value: number) => clamp(Math.round(value), 0, 100)

const round = (value: number) => Math.round(value)

const normalizeKey = (value?: string) => value?.trim().toLowerCase() ?? ""

const scoreFromWeights = (value: string | undefined, weights?: Record<string, number>): number | undefined => {
  if (!value || !weights) return undefined
  const normalizedValue = normalizeKey(value)
  const matchedEntry = Object.entries(weights).find(([key]) => normalizeKey(key) === normalizedValue)
  if (!matchedEntry) return undefined
  return clampPercent(matchedEntry[1])
}

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

// PLG and Inbound favor low ACV (high velocity), ABM/Sales/Vertical favor higher ACV
const ACV_MOTION_AFFINITY: Record<MotionId, Record<AcvBand, number>> = {
  plg: { low: 95, mid: 80, high: 55 },
  sales_led: { low: 55, mid: 85, high: 95 },
  inbound_demand_gen: { low: 90, mid: 80, high: 55 },
  outbound_abm: { low: 45, mid: 85, high: 95 },
  hybrid_plg_sales_assist: { low: 80, mid: 85, high: 70 },
  partner_led: { low: 50, mid: 80, high: 92 },
  ecosystem_led: { low: 55, mid: 85, high: 92 },
  community_led: { low: 90, mid: 75, high: 55 },
  event_led: { low: 60, mid: 80, high: 90 },
  vertical_specific: { low: 55, mid: 85, high: 92 },
}

// ---- Import library-driven motion configs ----
import { MOTION_CONFIGS_FROM_LIBRARY } from "@/lib/gtm-motions"

export const MOTION_CONFIGS: MotionConfig[] = MOTION_CONFIGS_FROM_LIBRARY

// ---- Fit scoring helpers ----

function computeObjectiveFit(motion: MotionConfig, primary: GtmObjective, secondary?: GtmObjective[]): number {
  const weightedPrimary = scoreFromWeights(primary, motion.matchWeights?.primaryObjective)
  const weightedSecondary = secondary
    ?.map((obj) => scoreFromWeights(obj, motion.matchWeights?.primaryObjective))
    .find((score): score is number => typeof score === "number")

  if (typeof weightedPrimary === "number") return weightedPrimary
  if (typeof weightedSecondary === "number") return weightedSecondary

  if (motion.bestForObjectives.includes(primary)) return 100
  if (secondary && secondary.some((obj) => motion.bestForObjectives.includes(obj))) {
    return 75
  }
  return 40
}

function computeSizeFit(
  motion: MotionConfig,
  size: CompanySize,
  targetSize: CompanySize | undefined,
): { companySizeFit: number; targetSizeFit?: number } {
  const weightedCompanySize = scoreFromWeights(size, motion.matchWeights?.companySize)
  const weightedTargetSize = scoreFromWeights(targetSize, motion.matchWeights?.targetCompanySize)

  let companySizeFit = 40
  if (typeof weightedCompanySize === "number") {
    companySizeFit = weightedCompanySize
  } else if (motion.bestForSizes.includes(size)) {
    companySizeFit = 100
  } else if (motion.bestForSizes.some((s) => isAdjacentSize(size, s))) {
    companySizeFit = 70
  }

  const targetSizeFit = weightedTargetSize
  return { companySizeFit, targetSizeFit }
}

function computeAcvFit(motion: MotionConfig, acv: AcvBand): number {
  const weightedAcv = scoreFromWeights(acv, motion.matchWeights?.acvBand)
  if (typeof weightedAcv === "number") return weightedAcv

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

function derivePersonaBucket(personas: string[]): "low" | "medium" | "high" {
  const count = personas.length
  if (count <= 2) return "low"
  if (count <= 4) return "medium"
  return "high"
}

function computePersonaFit(motion: MotionConfig, personas: string[]): number {
  const personaBucket = derivePersonaBucket(personas)
  const weightedPersonaCount = motion.matchWeights?.personaCount?.[personaBucket]

  const normalizedPersonas = personas.map((p) => p.toLowerCase())
  const matches = motion.bestForPersonas.filter((p) => normalizedPersonas.includes(p.toLowerCase())).length
  const ratio = motion.bestForPersonas.length ? matches / motion.bestForPersonas.length : 0
  const baseScore = motion.bestForPersonas.length === 0 ? 60 : clamp(ratio * 100, 20, 100)

  if (typeof weightedPersonaCount === "number") {
    return clampPercent((baseScore + weightedPersonaCount) / 2)
  }

  return baseScore
}

function computeIndustryFit(motion: MotionConfig, industry?: string): number | undefined {
  return scoreFromWeights(industry, motion.matchWeights?.industry)
}

function computeGeoFit(motion: MotionConfig, geo?: string): number | undefined {
  return scoreFromWeights(geo, motion.matchWeights?.targetMarketGeography)
}

// ---- Dynamic Impact Multiplier Helpers ----

/**
 * Computes a multiplier based on how well the motion fits the user's
 * objective, personas, and company size (derived from fitScore).
 * Range: 0.8 (poor) to 1.3 (perfect)
 */
function getMotionFitMultiplier(fitScore: number): number {
  if (fitScore >= 80) return 1.3 // perfect alignment
  if (fitScore >= 65) return 1.15 // strong
  if (fitScore >= 45) return 1.0 // neutral
  if (fitScore >= 30) return 0.9 // weak
  return 0.8 // poor
}

/**
 * Computes a multiplier based on ACV band and target geography.
 * Range: ~0.85 to ~1.25
 */
function getMarketContextMultiplier(inputs: SelectorInputs): number {
  const acv = inputs.acvBand
  const geo = inputs.targetMarketGeography
  const normalizedGeo = geo?.toLowerCase()

  // ACV multiplier: high ACV deals have more potential impact
  let acvMultiplier = 1.0
  if (acv === "high") acvMultiplier = 1.2
  else if (acv === "mid") acvMultiplier = 1.0
  else if (acv === "low") acvMultiplier = 0.9

  // Geography multiplier: regional nuances
  let geoMultiplier = 1.0
  if (!geo || normalizedGeo === "global") {
    geoMultiplier = 1.0
  } else if (normalizedGeo === "north-america" || geo === "North America") {
    geoMultiplier = 1.0
  } else if (normalizedGeo === "emea" || geo === "EMEA" || normalizedGeo === "europe") {
    geoMultiplier = 1.0
  } else if (normalizedGeo === "apac" || geo === "APAC") {
    geoMultiplier = 0.95
  } else if (normalizedGeo === "latam" || geo === "LATAM") {
    geoMultiplier = 1.05
  }

  return acvMultiplier * geoMultiplier
}

/**
 * Computes a multiplier based on execution timeline.
 * Longer horizons allow motions to compound, increasing potential impact.
 * Range: 0.9 (3 months) to 1.15 (12 months)
 */
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

// ---- Effort V2 Helper Functions ----

/**
 * Calculates time compression delta based on motion's recommended horizon
 * vs user-selected timeline. Compressing a motion into less time = more effort.
 * Range: -10 (generous runway) to +20 (highly compressed)
 */
function calcTimeCompressionDelta(recommendedHorizonMonths: number, selectedHorizonMonths: number | undefined): number {
  if (!selectedHorizonMonths || selectedHorizonMonths <= 0) {
    return 0 // neutral if missing
  }

  const ratio = recommendedHorizonMonths / selectedHorizonMonths

  if (ratio >= 1.5) return 20 // much more aggressive than ideal (e.g., 9-mo motion in 3 months)
  if (ratio >= 1.1) return 10 // somewhat compressed
  if (ratio >= 0.9 && ratio <= 1.1) return 0 // roughly aligned
  if (ratio >= 0.7) return -5 // more time than needed
  return -10 // very generous runway
}

/**
 * Calculates segment complexity delta based on company size and geography.
 * Enterprise + Global = most complex. SMB + single region = simplest.
 * Range: 0 to +20 (capped)
 */
function calcSegmentComplexityDelta(inputs: SelectorInputs): number {
  let companySizeDelta = 0
  const size = inputs.companySize

  if (size === "mid") {
    companySizeDelta = 5
  } else if (size === "enterprise") {
    companySizeDelta = 10
  }
  // smb = 0

  let geoDelta = 0
  const geo = inputs.targetMarketGeography

  if (!geo) {
    geoDelta = 0
  } else if (geo.toLowerCase() === "global") {
    geoDelta = 10
  } else {
    // broad single-region markets (NA, EMEA, APAC, LATAM, Europe)
    geoDelta = 5
  }

  return Math.min(20, companySizeDelta + geoDelta)
}

/**
 * Calculates persona complexity delta based on number and seniority of personas.
 * More personas = more stakeholders to coordinate. Senior personas = higher stakes.
 * Range: 0 to +20 (capped)
 */
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

/**
 * Calculates motion ops delta based on opsIntensity and channelCount.
 * Heavy orchestration + many channels = more effort.
 * Range: 0 to +20 (capped)
 */
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

// ---- Public scoring API ----

export function scoreMotion(motion: MotionConfig, inputs: SelectorInputs): MotionScoreBreakdown {
  const objectiveFit = inputs.primaryObjective
    ? computeObjectiveFit(motion, inputs.primaryObjective, inputs.secondaryObjectives)
    : 50 // neutral if not set
  const { companySizeFit: sizeFit, targetSizeFit } = computeSizeFit(
    motion,
    inputs.companySize,
    inputs.targetCompanySize,
  )
  const acvFit = inputs.acvBand ? computeAcvFit(motion, inputs.acvBand) : 50 // neutral if not set
  const personaFit = computePersonaFit(motion, inputs.personas)
  const industryFit = computeIndustryFit(motion, inputs.targetIndustry || inputs.industry)
  const geoFit = computeGeoFit(motion, inputs.targetMarketGeography)

  const fitComponents: { score: number; weight: number }[] = [
    { score: objectiveFit, weight: 0.35 },
    { score: sizeFit, weight: 0.2 },
    { score: acvFit, weight: 0.2 },
    { score: personaFit, weight: 0.15 },
  ]

  if (typeof targetSizeFit === "number") fitComponents.push({ score: targetSizeFit, weight: 0.1 })
  if (typeof industryFit === "number") fitComponents.push({ score: industryFit, weight: 0.1 })
  if (typeof geoFit === "number") fitComponents.push({ score: geoFit, weight: 0.1 })

  const totalWeight = fitComponents.reduce((sum, item) => sum + item.weight, 0)
  const fitScore = round(
    fitComponents.reduce((sum, item) => sum + item.score * item.weight, 0) / Math.max(totalWeight, 0.0001),
  )

  const timeCompressionDelta = calcTimeCompressionDelta(motion.recommendedHorizonMonths, inputs.timeHorizonMonths)
  const segmentComplexityDelta = calcSegmentComplexityDelta(inputs)
  const personaComplexityDelta = calcPersonaComplexityDelta(inputs)
  const motionOpsDelta = calcMotionOpsDelta(motion)

  const effort = clampPercent(
    motion.baseEffort + timeCompressionDelta + segmentComplexityDelta + personaComplexityDelta + motionOpsDelta,
  )

  const baseImpact = motion.baseImpact
  const motionFitMultiplier = getMotionFitMultiplier(fitScore)
  const marketContextMultiplier = getMarketContextMultiplier(inputs)
  const executionHorizonMultiplier = getExecutionHorizonMultiplier(inputs)

  const dynamicImpact = clampPercent(
    baseImpact * motionFitMultiplier * marketContextMultiplier * executionHorizonMultiplier,
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
    targetSizeFit: typeof targetSizeFit === "number" ? round(targetSizeFit) : undefined,
    acvFit: round(acvFit),
    personaFit: round(personaFit),
    industryFit: typeof industryFit === "number" ? round(industryFit) : undefined,
    geoFit: typeof geoFit === "number" ? round(geoFit) : undefined,
    fitScore,
    motionFitMultiplier,
    marketContextMultiplier,
    executionHorizonMultiplier,
    effortDeltas: {
      timeCompression: timeCompressionDelta,
      segmentComplexity: segmentComplexityDelta,
      personaComplexity: personaComplexityDelta,
      motionOps: motionOpsDelta,
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
    // First-class UI values (low/mid/high)
    low: "low",
    mid: "mid",
    high: "high",
    // Legacy keys for backward compatibility
    smb: "low",
    "mid-market": "mid",
    enterprise: "high",
    strategic: "high",
  }
  return acvMap[value]
}

export function mapCompanySizeToScoring(value: string): CompanySize {
  const sizeMap: Record<string, CompanySize> = {
    startup: "smb",
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
