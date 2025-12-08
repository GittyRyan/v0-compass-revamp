// lib/gtm-scoring.ts

// ---- Types ----

export type CompanySize = "smb" | "mid" | "enterprise"
export type GtmObjective = "pipeline" | "awareness" | "expansion" | "new_market"
export type AcvBand = "low" | "mid" | "high"

export type MotionId = "outbound_abm" | "plg" | "vertical_motion"

export interface SelectorInputs {
  companySize: CompanySize
  primaryObjective: GtmObjective
  secondaryObjectives?: GtmObjective[]
  acvBand: AcvBand
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

// ---- Static motion configs ----

export const MOTION_CONFIGS: MotionConfig[] = [
  {
    id: "outbound_abm",
    name: "Outbound ABM",
    baseEffort: 70,
    baseImpact: 85,
    bestForSizes: ["mid", "enterprise"],
    bestForObjectives: ["pipeline", "expansion"],
    bestForAcv: ["mid", "high"],
    bestForPersonas: ["VP Sales", "CRO", "RevOps"],
    weightSignals: 0.7,
  },
  {
    id: "plg",
    name: "Product-Led Growth",
    baseEffort: 65,
    baseImpact: 90,
    bestForSizes: ["smb", "mid"],
    bestForObjectives: ["pipeline", "awareness"],
    bestForAcv: ["low", "mid"],
    bestForPersonas: ["VP Product", "Growth", "Marketing"],
    weightSignals: 0.5,
  },
  {
    id: "vertical_motion",
    name: "Vertical-Specific Motion",
    baseEffort: 60,
    baseImpact: 80,
    bestForSizes: ["mid", "enterprise"],
    bestForObjectives: ["pipeline", "new_market"],
    bestForAcv: ["mid", "high"],
    bestForPersonas: ["VP Sales", "Industry GM"],
    weightSignals: 0.6,
  },
]

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
  const objectiveFit = computeObjectiveFit(motion, inputs.primaryObjective, inputs.secondaryObjectives)
  const sizeFit = computeSizeFit(motion, inputs.companySize)
  const acvFit = computeAcvFit(motion, inputs.acvBand)
  const personaFit = computePersonaFit(motion, inputs.personas)

  const fitScore = round(0.35 * objectiveFit + 0.25 * sizeFit + 0.25 * acvFit + 0.15 * personaFit)

  let effort = motion.baseEffort
  if (objectiveFit < 60) effort += 10
  if (sizeFit < 60) effort += 10
  if (acvFit < 60) effort += 10
  if (inputs.timeHorizonMonths === 3 && motion.baseEffort > 65) {
    effort += 5
  }
  effort = clamp(effort, 20, 95)

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

export function mapObjectiveToScoring(value: string): GtmObjective {
  const objectiveMap: Record<string, GtmObjective> = {
    "generate-awareness": "awareness",
    "create-demand": "pipeline",
    "category-leadership": "awareness",
    "new-offering": "new_market",
    "accelerate-pipeline": "pipeline",
    "expand-accounts": "expansion",
    "scale-revenue": "pipeline",
    "optimize-pricing": "expansion",
    "drive-adoption": "expansion",
    "customer-advocacy": "awareness",
    "increase-nrr": "expansion",
  }
  return objectiveMap[value] || "pipeline"
}

export function mapAcvToScoring(value: string): AcvBand {
  const acvMap: Record<string, AcvBand> = {
    smb: "low",
    "mid-market": "mid",
    enterprise: "high",
    strategic: "high",
  }
  return acvMap[value] || "mid"
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
