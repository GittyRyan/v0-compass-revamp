// Strategy Service - Typed integration layer for GTM strategy generation
// Calls the backend/LLM via Next.js API route

import type { GtmPlan } from "@/lib/gtm-plans"
import type { GtmPlanPreview } from "@/lib/gtm-preview"
import type { SeasonalContext } from "@/lib/gtm-scoring"

// ─────────────────────────────────────────────────────────────────────────────
// Request/Response Types
// ─────────────────────────────────────────────────────────────────────────────

export interface SalesContext {
  salesCycleDays?: number
  salesCycleBucket?: string
  seasonalContext?: SeasonalContext
}

/**
 * Request payload for strategy generation
 */
export interface StrategyGenerationRequest {
  plan: GtmPlan // Full plan as stored in the library
  tenantId: string // Tenant identifier from plan library
  source: "gtm-selector" // Where the request originated
  preview?: GtmPlanPreview // Optional preview context for LLM
  salesContext?: SalesContext
}

/**
 * A section of the generated strategy (maps to downstream tabs)
 */
export interface StrategySection {
  id: string // e.g. "position", "market", "competition", "icp", "gtm-report"
  title: string // Human-readable section title
  summary: string // Short abstract
  bullets: string[] // Key points
}

/**
 * Response from strategy generation
 */
export interface StrategyGenerationResult {
  success: boolean
  planId: string
  message?: string
  sections?: StrategySection[] // Optional strategy sections (for future use)
  rawResponseId?: string // Reference to raw LLM/backend record
}

// ─────────────────────────────────────────────────────────────────────────────
// Runtime Type Guards
// ─────────────────────────────────────────────────────────────────────────────

function isStrategySection(obj: unknown): obj is StrategySection {
  if (typeof obj !== "object" || obj === null) return false
  const section = obj as Record<string, unknown>
  return (
    typeof section.id === "string" &&
    typeof section.title === "string" &&
    typeof section.summary === "string" &&
    Array.isArray(section.bullets) &&
    section.bullets.every((b) => typeof b === "string")
  )
}

function isStrategyGenerationResult(obj: unknown): obj is StrategyGenerationResult {
  if (typeof obj !== "object" || obj === null) return false
  const result = obj as Record<string, unknown>

  // Required fields
  if (typeof result.success !== "boolean") return false
  if (typeof result.planId !== "string") return false

  // Optional fields
  if (result.message !== undefined && typeof result.message !== "string") return false
  if (result.rawResponseId !== undefined && typeof result.rawResponseId !== "string") return false

  // Optional sections array
  if (result.sections !== undefined) {
    if (!Array.isArray(result.sections)) return false
    if (!result.sections.every(isStrategySection)) return false
  }

  return true
}

// ─────────────────────────────────────────────────────────────────────────────
// Main API Function
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate a GTM strategy for the given plan.
 *
 * Calls the /api/strategy/generate endpoint with the plan details.
 * Never throws; always returns a StrategyGenerationResult.
 *
 * @param plan - The active GTM plan to generate strategy for
 * @param preview - Optional preview context to inform LLM generation
 * @param salesContext - Optional sales cycle and seasonal context
 * @returns Promise<StrategyGenerationResult>
 */
export async function generateGtmStrategyForPlan(
  plan: GtmPlan,
  preview?: GtmPlanPreview,
  salesContext?: SalesContext,
): Promise<StrategyGenerationResult> {
  const request: StrategyGenerationRequest = {
    plan,
    tenantId: plan.tenantId,
    source: "gtm-selector",
    preview,
    salesContext,
  }

  console.log("[StrategyService] Sending strategy generation request", {
    planId: plan.id,
    planName: plan.name,
    tenantId: plan.tenantId,
    hasSalesContext: !!salesContext,
  })

  try {
    const response = await fetch("/api/strategy/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    })

    // Handle non-200 responses
    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error")
      console.error("[StrategyService] API returned non-200 status", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      })
      return {
        success: false,
        planId: plan.id,
        message: `Strategy generation failed: ${response.statusText || `HTTP ${response.status}`}`,
      }
    }

    // Parse JSON response
    const json: unknown = await response.json()

    // Validate response shape
    if (!isStrategyGenerationResult(json)) {
      console.error("[StrategyService] Invalid response shape from API", json)
      return {
        success: false,
        planId: plan.id,
        message: "Strategy generation failed: Invalid response from server.",
      }
    }

    console.log("[StrategyService] Strategy generation complete", {
      planId: json.planId,
      success: json.success,
      sectionsCount: json.sections?.length ?? 0,
    })

    return json
  } catch (error) {
    // Network or parsing error - never throw, return failure result
    console.error("[StrategyService] Strategy generation error", error)
    return {
      success: false,
      planId: plan.id,
      message: `Strategy generation failed: ${error instanceof Error ? error.message : "Network error"}`,
    }
  }
}
