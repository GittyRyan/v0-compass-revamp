// GTM Plan Library - Types and Service Functions
// Designed for localStorage persistence with clean API replacement path

export type PlanStatus = "active" | "saved" | "draft" | "archived"

export interface GtmPlan {
  id: string
  tenantId: string
  name: string

  status: PlanStatus

  motionId: string
  motionName: string

  segment: {
    industry: string
    companySize: string
    region: string
  }

  objective: string
  acvBand: "low" | "mid" | "high"
  personas: string[]

  effort: number // 0–100
  impact: number // 0–100
  matchPercent: number // 0–100

  kpis?: string[]
  timelineMonths: 3 | 6 | 9 | 12

  createdAt: string // ISO
  updatedAt: string // ISO
  activatedAt?: string | null
  archivedAt?: string | null
}

export interface GtmPlanLibrary {
  tenantId: string
  plans: GtmPlan[]
}

export interface PlanNamingContext {
  motionName: string
  primaryObjective?: string // e.g. "pipeline", "expand-accounts"
  targetMarketGeography?: string // e.g. "North America", "Global"
  timeHorizonMonths?: 3 | 6 | 9 | 12 // from selector inputs
  segment?: {
    industry?: string // "Technology / SaaS"
    companySize?: string // "Mid-Market", "Enterprise"
    region?: string // may be target region if present
  }
  createdAt?: Date
}

function geographyToCode(geo: string): string {
  const normalized = geo.trim().toLowerCase()
  switch (normalized) {
    case "north america":
      return "NA"
    case "emea":
      return "EMEA"
    case "apac":
      return "APAC"
    case "latam":
      return "LATAM"
    case "europe":
      return "EU"
    case "global":
      return "" // No geo code for Global
    default:
      // Return first letters for unknown regions
      return geo
        .split(/\s+/)
        .map((w) => w[0]?.toUpperCase() || "")
        .join("")
  }
}

function objectiveToLabel(objective: string): string {
  switch (objective) {
    case "pipeline":
      return "Pipeline Growth"
    case "expand-accounts":
      return "Customer Expansion"
    case "market_expansion":
      return "Market Expansion"
    case "competitive_positioning":
      return "Competitive Positioning"
    default:
      return objective.replace(/[_-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  }
}

export function generatePlanName(ctx: PlanNamingContext): string {
  const now = ctx.createdAt ?? new Date()
  const months = ctx.timeHorizonMonths ?? 3

  // Calculate end date and quarter
  const end = new Date(now)
  end.setMonth(end.getMonth() + months)
  const quarter = Math.floor(end.getMonth() / 3) + 1
  const timeframeLabel = `Q${quarter} ${end.getFullYear()}`

  // Geography code (empty string for Global)
  const geoCode = ctx.targetMarketGeography ? geographyToCode(ctx.targetMarketGeography) : ""

  // Goal label: prefer objective, fall back to motionName
  const goalLabel = ctx.primaryObjective ? objectiveToLabel(ctx.primaryObjective) : ctx.motionName

  return [timeframeLabel, geoCode, goalLabel]
    .map((p) => p.trim())
    .filter(Boolean)
    .join(" ")
}

// Capacity limits
const LIMITS = {
  active: 1,
  saved: 5,
  draft: 5,
  archived: 10,
} as const

// Valid state transitions
const VALID_TRANSITIONS: Record<PlanStatus, PlanStatus[]> = {
  draft: ["saved", "archived"],
  saved: ["active", "archived"],
  active: ["saved", "archived"],
  archived: ["saved"],
}

// Storage key factory
const getStorageKey = (tenantId: string) => `omniGtm.planLibrary.v1.${tenantId}`

// Generate unique ID
function generateId(): string {
  return `plan_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

// Get current ISO timestamp
function now(): string {
  return new Date().toISOString()
}

// Load plan library from localStorage
export function loadPlanLibrary(tenantId: string): GtmPlanLibrary {
  if (typeof window === "undefined") {
    return { tenantId, plans: [] }
  }

  try {
    const stored = localStorage.getItem(getStorageKey(tenantId))
    if (stored) {
      const parsed = JSON.parse(stored) as GtmPlanLibrary
      return { ...parsed, tenantId }
    }
  } catch (e) {
    console.error("[GtmPlanLibrary] Failed to load from localStorage:", e)
  }

  return { tenantId, plans: [] }
}

// Save plan library to localStorage
export function savePlanLibrary(lib: GtmPlanLibrary): void {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(getStorageKey(lib.tenantId), JSON.stringify(lib))
  } catch (e) {
    console.error("[GtmPlanLibrary] Failed to save to localStorage:", e)
  }
}

export type PlanLibraryError =
  | { type: "INVALID_TRANSITION"; from: PlanStatus; to: PlanStatus }
  | { type: "CAPACITY_EXCEEDED"; status: PlanStatus; limit: number; current: number }
  | { type: "PLAN_NOT_FOUND"; planId: string }
  | { type: "ARCHIVE_OVERFLOW"; oldestPlan: GtmPlan }
  | { type: "VALIDATION_ERROR"; message: string }

export type PlanLibraryResult<T> = { success: true; data: T } | { success: false; error: PlanLibraryError }

// Count plans by status
export function countByStatus(lib: GtmPlanLibrary): Record<PlanStatus, number> {
  return lib.plans.reduce(
    (acc, p) => {
      acc[p.status]++
      return acc
    },
    { active: 0, saved: 0, draft: 0, archived: 0 } as Record<PlanStatus, number>,
  )
}

// Get oldest archived plan (for auto-delete confirmation)
function getOldestArchived(lib: GtmPlanLibrary): GtmPlan | null {
  const archived = lib.plans
    .filter((p) => p.status === "archived")
    .sort((a, b) => {
      const aDate = a.archivedAt || a.updatedAt
      const bDate = b.archivedAt || b.updatedAt
      return aDate.localeCompare(bDate)
    })
  return archived[0] || null
}

// Create a new plan
export function createPlan(
  lib: GtmPlanLibrary,
  plan: Omit<GtmPlan, "id" | "createdAt" | "updatedAt" | "tenantId">,
): PlanLibraryResult<GtmPlanLibrary> {
  const counts = countByStatus(lib)
  const status = plan.status || "draft"

  // Check capacity for all statuses including active
  if (counts[status] >= LIMITS[status]) {
    return {
      success: false,
      error: { type: "CAPACITY_EXCEEDED", status, limit: LIMITS[status], current: counts[status] },
    }
  }

  const timestamp = now()
  const newPlan: GtmPlan = {
    ...plan,
    id: generateId(),
    tenantId: lib.tenantId,
    createdAt: timestamp,
    updatedAt: timestamp,
    activatedAt: status === "active" ? timestamp : null,
    archivedAt: status === "archived" ? timestamp : null,
  }

  // Active switching is now only done via applyStatusChange (user-driven)
  return {
    success: true,
    data: { ...lib, plans: [...lib.plans, newPlan] },
  }
}

// Update an existing plan
export function updatePlan(
  lib: GtmPlanLibrary,
  planId: string,
  patch: Partial<GtmPlan>,
): PlanLibraryResult<GtmPlanLibrary> {
  const planIndex = lib.plans.findIndex((p) => p.id === planId)
  if (planIndex === -1) {
    return { success: false, error: { type: "PLAN_NOT_FOUND", planId } }
  }

  const updatedPlan = {
    ...lib.plans[planIndex],
    ...patch,
    updatedAt: now(),
  }

  const updatedPlans = [...lib.plans]
  updatedPlans[planIndex] = updatedPlan

  return { success: true, data: { ...lib, plans: updatedPlans } }
}

// Apply status change with state machine enforcement
export function applyStatusChange(
  lib: GtmPlanLibrary,
  planId: string,
  newStatus: PlanStatus,
  options?: { forceArchiveOverflow?: boolean },
): PlanLibraryResult<GtmPlanLibrary> {
  const plan = lib.plans.find((p) => p.id === planId)
  if (!plan) {
    return { success: false, error: { type: "PLAN_NOT_FOUND", planId } }
  }

  const currentStatus = plan.status

  // Check valid transition
  if (!VALID_TRANSITIONS[currentStatus].includes(newStatus)) {
    return { success: false, error: { type: "INVALID_TRANSITION", from: currentStatus, to: newStatus } }
  }

  const counts = countByStatus(lib)
  const timestamp = now()

  // Special handling for archived overflow
  if (newStatus === "archived" && counts.archived >= LIMITS.archived) {
    const oldest = getOldestArchived(lib)
    if (oldest && !options?.forceArchiveOverflow) {
      return { success: false, error: { type: "ARCHIVE_OVERFLOW", oldestPlan: oldest } }
    }
    // If forced, remove oldest archived
    if (oldest && options?.forceArchiveOverflow) {
      lib = { ...lib, plans: lib.plans.filter((p) => p.id !== oldest.id) }
    }
  }

  // Check capacity for target status (except active and archived which have special handling)
  if (newStatus === "saved" && counts.saved >= LIMITS.saved) {
    return {
      success: false,
      error: { type: "CAPACITY_EXCEEDED", status: "saved", limit: LIMITS.saved, current: counts.saved },
    }
  }

  if (newStatus === "draft" && counts.draft >= LIMITS.draft) {
    return {
      success: false,
      error: { type: "CAPACITY_EXCEEDED", status: "draft", limit: LIMITS.draft, current: counts.draft },
    }
  }

  const updatedPlans = lib.plans.map((p) => {
    if (p.id === planId) {
      return {
        ...p,
        status: newStatus,
        updatedAt: timestamp,
        activatedAt: newStatus === "active" ? timestamp : p.activatedAt,
        archivedAt: newStatus === "archived" ? timestamp : null,
      }
    }
    // If activating this plan, deactivate current active
    if (newStatus === "active" && p.status === "active") {
      return { ...p, status: "saved" as PlanStatus, updatedAt: timestamp }
    }
    return p
  })

  return { success: true, data: { ...lib, plans: updatedPlans } }
}

// Delete a plan (for drafts or manual archived deletion)
export function deletePlan(lib: GtmPlanLibrary, planId: string): PlanLibraryResult<GtmPlanLibrary> {
  const plan = lib.plans.find((p) => p.id === planId)
  if (!plan) {
    return { success: false, error: { type: "PLAN_NOT_FOUND", planId } }
  }

  return {
    success: true,
    data: { ...lib, plans: lib.plans.filter((p) => p.id !== planId) },
  }
}

// Get the active plan (convenience helper)
export function getActivePlan(lib: GtmPlanLibrary): GtmPlan | null {
  return lib.plans.find((p) => p.status === "active") || null
}

// Get plans filtered by status
export function getPlansByStatus(lib: GtmPlanLibrary, status: PlanStatus | "all"): GtmPlan[] {
  if (status === "all") return lib.plans
  return lib.plans.filter((p) => p.status === status)
}

// Format date for display
export function formatPlanDate(isoDate: string): string {
  const date = new Date(isoDate)
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

export function formatPlanTime(isoDate: string): string {
  const date = new Date(isoDate)
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
}

// Get status display label
export function getStatusLabel(status: PlanStatus): string {
  switch (status) {
    case "active":
      return "Active"
    case "saved":
      return "Published"
    case "draft":
      return "Draft"
    case "archived":
      return "Archived"
  }
}

export function renamePlan(
  library: GtmPlanLibrary,
  planId: string,
  newName: string,
): PlanLibraryResult<GtmPlanLibrary> {
  const trimmed = newName.trim()

  if (!trimmed) {
    return {
      success: false,
      error: { type: "VALIDATION_ERROR", message: "Plan name cannot be empty." },
    }
  }

  const plans = library.plans.slice()
  const index = plans.findIndex((p) => p.id === planId)
  if (index === -1) {
    return {
      success: false,
      error: { type: "PLAN_NOT_FOUND", planId },
    }
  }

  plans[index] = {
    ...plans[index],
    name: trimmed,
    updatedAt: new Date().toISOString(),
  }

  return {
    success: true,
    data: { ...library, plans },
  }
}

// Initial seed data for demo purposes
export function getSeedPlanLibrary(tenantId: string): GtmPlanLibrary {
  const baseDate = new Date()
  return {
    tenantId,
    plans: [
      {
        id: "plan_seed_1",
        tenantId,
        name: "Q1 Enterprise Push",
        status: "active",
        motionId: "outbound_abm",
        motionName: "Outbound Account-Based Marketing (ABM)",
        segment: { industry: "Technology / SaaS", companySize: "Enterprise", region: "North America" },
        objective: "pipeline",
        acvBand: "high",
        personas: ["VP Sales", "CRO", "Head of Revenue Operations"],
        effort: 70,
        impact: 90,
        matchPercent: 85,
        timelineMonths: 6,
        createdAt: new Date(baseDate.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(baseDate.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        activatedAt: new Date(baseDate.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "plan_seed_2",
        tenantId,
        name: "SMB PLG Expansion",
        status: "saved",
        motionId: "plg",
        motionName: "Product-Led Growth (PLG)",
        segment: { industry: "FinTech", companySize: "SMB", region: "EMEA" },
        objective: "pipeline",
        acvBand: "low",
        personas: ["Product Manager", "Engineering Lead"],
        effort: 45,
        impact: 75,
        matchPercent: 78,
        timelineMonths: 3,
        createdAt: new Date(baseDate.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(baseDate.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "plan_seed_3",
        tenantId,
        name: "Healthcare Vertical Play",
        status: "draft",
        motionId: "vertical_specific",
        motionName: "Vertical-Specific",
        segment: { industry: "Healthcare", companySize: "Mid-Market", region: "North America" },
        objective: "new_market",
        acvBand: "mid",
        personas: ["CIO", "CISO", "VP IT"],
        effort: 60,
        impact: 85,
        matchPercent: 72,
        timelineMonths: 9,
        createdAt: new Date(baseDate.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(baseDate.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "plan_seed_4",
        tenantId,
        name: "2023 APAC Inbound",
        status: "archived",
        motionId: "inbound_demand_gen",
        motionName: "Inbound (Marketing-Led/Demand Gen)",
        segment: { industry: "Manufacturing", companySize: "Enterprise", region: "APAC" },
        objective: "pipeline",
        acvBand: "mid",
        personas: ["Marketing Director", "Demand Gen Manager"],
        effort: 55,
        impact: 70,
        matchPercent: 68,
        timelineMonths: 6,
        createdAt: new Date(baseDate.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(baseDate.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        archivedAt: new Date(baseDate.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
  }
}
