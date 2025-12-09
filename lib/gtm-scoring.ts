// lib/gtm-scoring.ts

// ---- Types ----

export type CompanySize = "smb" | "mid" | "enterprise"
export type GtmObjective = "pipeline" | "awareness" | "expansion" | "new_market"
export type AcvBand = "low" | "mid" | "high"

export type MotionId = "outbound_abm" | "plg" | "vertical_motion" | "inbound_engine" | "customer_expansion"

export interface SelectorInputs {
  companyName?: string
  companyUrl?: string
  hqCountry?: string
  targetMarketGeography?: string
  companySize: CompanySize
  primaryObjective?: GtmObjective
  secondaryObjectives?: GtmObjective[]
  acvBand?: AcvBand
  personas: string[]
  timeHorizonMonths: 3 | 6 | 9 | 12
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
}

// ---- Helper functions ----

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

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

const TIMELINE_EFFORT_ADJUSTMENT: Record<3 | 6 | 9 | 12, number> = {
  3: 20, // Highly compressed execution window
  6: 10, // Moderately compressed
  9: 0, // Baseline
  12: -5, // Execution is less intense when spread out
}

// PLG and Inbound favor low ACV (high velocity), ABM/Vertical/Expansion favor high ACV
const ACV_MOTION_AFFINITY: Record<MotionId, Record<AcvBand, number>> = {
  // PLG: strong for low ACV, decent for mid, weak for high
  plg: { low: 95, mid: 75, high: 45 },
  // Inbound: strong for low ACV, decent for mid, weak for high
  inbound_engine: { low: 90, mid: 80, high: 50 },
  // Outbound ABM: weak for low, decent for mid, strong for high
  outbound_abm: { low: 45, mid: 75, high: 95 },
  // Vertical: weak for low, decent for mid, strong for high
  vertical_motion: { low: 50, mid: 70, high: 92 },
  // Customer Expansion: moderate for low, good for mid, strong for high
  customer_expansion: { low: 55, mid: 80, high: 90 },
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

// ---- Public scoring API ----

export function scoreMotion(motion: MotionConfig, inputs: SelectorInputs): MotionScoreBreakdown {
  const objectiveFit = inputs.primaryObjective
    ? computeObjectiveFit(motion, inputs.primaryObjective, inputs.secondaryObjectives)
    : 50 // neutral if not set
  const sizeFit = computeSizeFit(motion, inputs.companySize)
  const acvFit = inputs.acvBand ? computeAcvFit(motion, inputs.acvBand) : 50 // neutral if not set
  const personaFit = computePersonaFit(motion, inputs.personas)

  const fitScore = round(0.35 * objectiveFit + 0.25 * sizeFit + 0.25 * acvFit + 0.15 * personaFit)

  // Start with base effort
  let effort = motion.baseEffort

  // Add fit-based adjustments
  if (objectiveFit < 60) effort += 10
  if (sizeFit < 60) effort += 10
  if (acvFit < 60) effort += 10

  // Apply timeline-based adjustment: finalEffort = clamp(baseEffort + timelineAdjustment, 0, 100)
  const timelineAdjustment = TIMELINE_EFFORT_ADJUSTMENT[inputs.timeHorizonMonths]
  effort += timelineAdjustment

  effort = clamp(effort, 0, 100)

  let impact = round(0.5 * motion.baseImpact + 0.5 * fitScore)
  impact = clamp(impact, 20, 100)

  const matchPercent = clamp(round(0.4 * fitScore + 0.3 * impact + 0.3 * (100 - effort)), 0, 100)

  return {
    motionId: motion.id,
    name: motion.name,
    effort,
    impact,
    matchPercent,
    objectiveFit: round(objectiveFit),
    sizeFit: round(sizeFit),
    acvFit: round(acvFit),
    personaFit: round(personaFit),
    fitScore,
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
