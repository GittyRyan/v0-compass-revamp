// lib/gtm-preview.ts

/**
 * GTM Plan Preview Engine
 *
 * Generates dynamic, context-aware, motion-aware previews that accurately
 * reflect company inputs, timelines, scoring signals, and expected LLM outputs.
 */

import type { MotionConfig, SelectorInputs, MotionId } from "./gtm-scoring"

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type EffortClassification = "lightweight" | "moderate" | "heavy" | "transformational"

export type EffortSlice = "low" | "medium" | "high"
export type RiskLevel = "low" | "medium" | "high"

export interface GtmPlanPreviewPhase {
  phaseId: string
  label: string
  timeframe: string
  focus: string
  primaryWorkstreams: string[]
  primaryOwners: string[]
  effortSlice: EffortSlice
  riskLevel: RiskLevel
}

export interface GtmPlanPreviewSummary {
  executionTheme: string
  keyRisks: string[]
  keyDependencies: string[]
}

export interface GtmPlanPreview {
  horizonMonths: 3 | 6 | 9 | 12
  motionId: string
  motionName: string
  motionType: string
  objective: string
  acvBand: string
  companySize: string
  geography: string
  industry: string
  personas: string[]
  effortScore: number
  impactScore: number
  effortClassification: EffortClassification
  phases: GtmPlanPreviewPhase[]
  summary: GtmPlanPreviewSummary
  llmExpectations: string[]
}

// ─────────────────────────────────────────────────────────────────────────────
// Effort Classification
// ─────────────────────────────────────────────────────────────────────────────

function getEffortClassification(effort: number): EffortClassification {
  if (effort < 40) return "lightweight"
  if (effort < 65) return "moderate"
  if (effort < 80) return "heavy"
  return "transformational"
}

// ─────────────────────────────────────────────────────────────────────────────
// Phase Structure by Timeline
// ─────────────────────────────────────────────────────────────────────────────

function getPhaseTimeframes(horizonMonths: 3 | 6 | 9 | 12): { label: string; timeframe: string }[] {
  switch (horizonMonths) {
    case 3:
      return [
        { label: "Phase 1: Foundation", timeframe: "Days 0–30" },
        { label: "Phase 2: Execution", timeframe: "Days 31–60" },
        { label: "Phase 3: Acceleration", timeframe: "Days 61–90" },
      ]
    case 6:
      return [
        { label: "Phase 1: Foundation", timeframe: "Months 1–2" },
        { label: "Phase 2: Execution", timeframe: "Months 3–4" },
        { label: "Phase 3: Acceleration", timeframe: "Months 5–6" },
      ]
    case 9:
      return [
        { label: "Phase 1: Foundation", timeframe: "Months 1–2" },
        { label: "Phase 2: Build", timeframe: "Months 3–4" },
        { label: "Phase 3: Scale", timeframe: "Months 5–7" },
        { label: "Phase 4: Optimize", timeframe: "Months 8–9" },
      ]
    case 12:
      return [
        { label: "Phase 1: Foundation", timeframe: "Months 1–3" },
        { label: "Phase 2: Build", timeframe: "Months 4–6" },
        { label: "Phase 3: Scale", timeframe: "Months 7–9" },
        { label: "Phase 4: Optimize", timeframe: "Months 10–12" },
      ]
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Motion-Specific Workstreams
// ─────────────────────────────────────────────────────────────────────────────

type MotionWorkstreams = {
  phases: {
    focus: string
    workstreams: string[]
    owners: string[]
  }[]
}

const MOTION_WORKSTREAMS: Record<MotionId, MotionWorkstreams> = {
  plg: {
    phases: [
      {
        focus: "Onboarding & Activation",
        workstreams: [
          "Design self-serve onboarding flow",
          "Implement in-app activation triggers",
          "Set up product analytics tracking",
          "Define PQL scoring model",
        ],
        owners: ["Product", "Engineering", "Growth"],
      },
      {
        focus: "Conversion & Monetization",
        workstreams: [
          "A/B test pricing page and CTAs",
          "Build upgrade prompts at value moments",
          "Launch email nurture sequences",
          "Optimize trial-to-paid conversion",
        ],
        owners: ["Product", "Marketing", "Growth"],
      },
      {
        focus: "Expansion & Retention",
        workstreams: [
          "Implement usage-based expansion triggers",
          "Launch upsell campaigns to power users",
          "Build customer health scoring",
          "Optimize feature adoption funnels",
        ],
        owners: ["Product", "CS", "Growth"],
      },
      {
        focus: "Scale & Efficiency",
        workstreams: [
          "Automate low-touch expansion plays",
          "Refine PQL handoff to sales",
          "Build self-serve expansion paths",
          "Optimize CAC:LTV efficiency",
        ],
        owners: ["Product", "Sales", "Growth"],
      },
    ],
  },
  sales_led: {
    phases: [
      {
        focus: "Sales Process Foundation",
        workstreams: [
          "Define ICP and target account criteria",
          "Build sales playbook and talk tracks",
          "Set up CRM workflows and stages",
          "Train sales team on methodology",
        ],
        owners: ["Sales", "RevOps", "Enablement"],
      },
      {
        focus: "Pipeline Generation",
        workstreams: [
          "Launch outbound prospecting campaigns",
          "Execute multi-threading strategies",
          "Build demo and POC frameworks",
          "Develop ROI and business case tools",
        ],
        owners: ["Sales", "Solutions", "Marketing"],
      },
      {
        focus: "Deal Acceleration",
        workstreams: [
          "Implement champion enablement programs",
          "Build procurement and legal playbooks",
          "Develop executive alignment strategies",
          "Optimize deal desk processes",
        ],
        owners: ["Sales", "Solutions", "Legal"],
      },
      {
        focus: "Scale & Repeatability",
        workstreams: [
          "Codify winning sales plays",
          "Build competitive displacement playbooks",
          "Optimize territory and quota models",
          "Implement sales forecasting rigor",
        ],
        owners: ["Sales", "RevOps", "Enablement"],
      },
    ],
  },
  outbound_abm: {
    phases: [
      {
        focus: "Account Selection & Intelligence",
        workstreams: [
          "Build target account list with intent signals",
          "Research key stakeholders per account",
          "Develop account-specific value propositions",
          "Set up account scoring and tiering",
        ],
        owners: ["Marketing", "Sales", "RevOps"],
      },
      {
        focus: "Multi-Channel Campaigns",
        workstreams: [
          "Launch personalized email sequences",
          "Execute LinkedIn engagement plays",
          "Coordinate direct mail and gifting",
          "Align SDR outreach with marketing air cover",
        ],
        owners: ["Marketing", "Sales", "SDR"],
      },
      {
        focus: "Account Acceleration",
        workstreams: [
          "Host executive roundtables and events",
          "Deploy account-specific content",
          "Orchestrate multi-stakeholder engagement",
          "Coordinate sales and marketing touchpoints",
        ],
        owners: ["Marketing", "Sales", "Exec"],
      },
      {
        focus: "Pipeline Conversion",
        workstreams: [
          "Accelerate engaged accounts to opportunity",
          "Build account-based forecasting",
          "Optimize ABM-to-AE handoff",
          "Measure account progression and velocity",
        ],
        owners: ["Sales", "Marketing", "RevOps"],
      },
    ],
  },
  inbound_demand_gen: {
    phases: [
      {
        focus: "Content & SEO Foundation",
        workstreams: [
          "Conduct keyword and intent research",
          "Build content calendar and pillar pages",
          "Optimize website for conversion",
          "Set up marketing automation workflows",
        ],
        owners: ["Marketing", "Content", "Web"],
      },
      {
        focus: "Campaign Execution",
        workstreams: [
          "Launch paid search and social campaigns",
          "Execute webinar and event series",
          "Build lead nurture sequences",
          "Implement lead scoring model",
        ],
        owners: ["Marketing", "Demand Gen", "Ops"],
      },
      {
        focus: "Funnel Optimization",
        workstreams: [
          "Optimize MQL-to-SQL conversion",
          "A/B test landing pages and CTAs",
          "Improve lead routing and response time",
          "Build attribution and ROI reporting",
        ],
        owners: ["Marketing", "RevOps", "Sales"],
      },
      {
        focus: "Scale & Efficiency",
        workstreams: [
          "Expand high-performing channels",
          "Automate nurture and follow-up",
          "Optimize CAC by channel",
          "Build predictable pipeline model",
        ],
        owners: ["Marketing", "Demand Gen", "RevOps"],
      },
    ],
  },
  hybrid_plg_sales: {
    phases: [
      {
        focus: "PQL Definition & Handoff",
        workstreams: [
          "Define PQL criteria and signals",
          "Build product-to-sales handoff workflow",
          "Train sales on product-led approach",
          "Set up PQL alerting and routing",
        ],
        owners: ["Product", "Sales", "RevOps"],
      },
      {
        focus: "Sales-Assisted Conversion",
        workstreams: [
          "Launch PQL outreach sequences",
          "Build expansion playbooks for sales",
          "Coordinate product and sales touchpoints",
          "Optimize timing of sales engagement",
        ],
        owners: ["Sales", "Product", "CS"],
      },
      {
        focus: "Expansion & Upsell",
        workstreams: [
          "Identify multi-seat expansion opportunities",
          "Build upgrade path plays",
          "Coordinate CS and sales on renewals",
          "Launch account expansion campaigns",
        ],
        owners: ["Sales", "CS", "Product"],
      },
      {
        focus: "Model Optimization",
        workstreams: [
          "Refine PQL scoring based on conversion data",
          "Optimize sales capacity allocation",
          "Balance self-serve vs. assisted paths",
          "Build hybrid motion playbook",
        ],
        owners: ["RevOps", "Sales", "Product"],
      },
    ],
  },
  partner_led: {
    phases: [
      {
        focus: "Partner Program Design",
        workstreams: [
          "Define partner tiers and economics",
          "Build partner onboarding program",
          "Create co-selling and co-marketing frameworks",
          "Set up partner portal and tooling",
        ],
        owners: ["Partnerships", "Marketing", "Sales"],
      },
      {
        focus: "Partner Recruitment",
        workstreams: [
          "Identify and recruit target partners",
          "Execute partner enablement training",
          "Launch partner certification program",
          "Build partner sales playbooks",
        ],
        owners: ["Partnerships", "Enablement", "Sales"],
      },
      {
        focus: "Partner Activation",
        workstreams: [
          "Launch co-marketing campaigns",
          "Execute joint customer events",
          "Build deal registration and tracking",
          "Coordinate partner-sourced pipeline",
        ],
        owners: ["Partnerships", "Marketing", "Sales"],
      },
      {
        focus: "Partner Scale",
        workstreams: [
          "Expand successful partner relationships",
          "Build partner success metrics",
          "Optimize partner economics and incentives",
          "Launch partner advisory board",
        ],
        owners: ["Partnerships", "RevOps", "Exec"],
      },
    ],
  },
  ecosystem_led: {
    phases: [
      {
        focus: "Platform & API Foundation",
        workstreams: [
          "Build and document public APIs",
          "Create developer portal and docs",
          "Set up integration marketplace",
          "Define partner integration standards",
        ],
        owners: ["Product", "Engineering", "DevRel"],
      },
      {
        focus: "Developer Adoption",
        workstreams: [
          "Launch developer community programs",
          "Build sample apps and SDKs",
          "Execute developer marketing campaigns",
          "Host hackathons and workshops",
        ],
        owners: ["DevRel", "Marketing", "Engineering"],
      },
      {
        focus: "Integration Expansion",
        workstreams: [
          "Recruit strategic integration partners",
          "Build co-marketing with integration partners",
          "Launch marketplace promotions",
          "Develop integration success stories",
        ],
        owners: ["Partnerships", "Product", "Marketing"],
      },
      {
        focus: "Ecosystem Scale",
        workstreams: [
          "Build ecosystem revenue attribution",
          "Optimize integration discovery and adoption",
          "Launch ecosystem partner programs",
          "Develop platform network effects",
        ],
        owners: ["Product", "Partnerships", "RevOps"],
      },
    ],
  },
  community_led: {
    phases: [
      {
        focus: "Community Foundation",
        workstreams: [
          "Launch community platform (Slack/Discord)",
          "Define community guidelines and moderation",
          "Build initial content and programming",
          "Recruit community champions and advocates",
        ],
        owners: ["Community", "Marketing", "DevRel"],
      },
      {
        focus: "Engagement & Growth",
        workstreams: [
          "Launch regular community events and AMAs",
          "Build user-generated content programs",
          "Implement community recognition and rewards",
          "Grow community through organic channels",
        ],
        owners: ["Community", "Marketing", "Content"],
      },
      {
        focus: "Advocacy & Influence",
        workstreams: [
          "Launch customer advocacy program",
          "Build referral and word-of-mouth engine",
          "Develop community-sourced case studies",
          "Amplify community voices in marketing",
        ],
        owners: ["Community", "Marketing", "CS"],
      },
      {
        focus: "Community Scale",
        workstreams: [
          "Expand to regional/local chapters",
          "Build community-led support programs",
          "Measure community impact on pipeline",
          "Develop community-product feedback loop",
        ],
        owners: ["Community", "Product", "Support"],
      },
    ],
  },
  event_led: {
    phases: [
      {
        focus: "Event Strategy & Planning",
        workstreams: [
          "Define event calendar and priorities",
          "Build event ROI and attribution model",
          "Set up event tech stack and processes",
          "Plan flagship and field event series",
        ],
        owners: ["Marketing", "Events", "Sales"],
      },
      {
        focus: "Event Execution",
        workstreams: [
          "Execute industry conference presence",
          "Launch owned webinar and event series",
          "Coordinate sales and marketing at events",
          "Build pre/post event engagement plays",
        ],
        owners: ["Events", "Marketing", "Sales"],
      },
      {
        focus: "Pipeline Conversion",
        workstreams: [
          "Optimize event-to-meeting conversion",
          "Build post-event nurture sequences",
          "Accelerate event-sourced opportunities",
          "Measure event attribution and ROI",
        ],
        owners: ["Marketing", "Sales", "RevOps"],
      },
      {
        focus: "Event Scale",
        workstreams: [
          "Launch user conference or summit",
          "Expand regional event footprint",
          "Build event-based ABM programs",
          "Optimize event mix and budget allocation",
        ],
        owners: ["Events", "Marketing", "Exec"],
      },
    ],
  },
  vertical_specific: {
    phases: [
      {
        focus: "Vertical Strategy & ICP",
        workstreams: [
          "Define vertical ICP and segmentation",
          "Research vertical pain points and needs",
          "Build vertical-specific value proposition",
          "Identify vertical proof points and references",
        ],
        owners: ["Marketing", "Sales", "Product"],
      },
      {
        focus: "Vertical Content & Enablement",
        workstreams: [
          "Create vertical-specific content and collateral",
          "Build vertical sales playbooks",
          "Develop vertical demo and POC scenarios",
          "Train sales on vertical narrative",
        ],
        owners: ["Marketing", "Enablement", "Sales"],
      },
      {
        focus: "Vertical Go-to-Market",
        workstreams: [
          "Launch vertical-targeted campaigns",
          "Execute vertical event and sponsorship strategy",
          "Build vertical partner and SI relationships",
          "Develop vertical customer advisory board",
        ],
        owners: ["Marketing", "Sales", "Partnerships"],
      },
      {
        focus: "Vertical Leadership",
        workstreams: [
          "Expand vertical customer base and references",
          "Build vertical thought leadership position",
          "Optimize vertical product-market fit",
          "Measure vertical penetration and share",
        ],
        owners: ["Sales", "Marketing", "Product"],
      },
    ],
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// Effort Slice and Risk Level by Phase and Classification
// ─────────────────────────────────────────────────────────────────────────────

function getEffortSliceForPhase(
  phaseIndex: number,
  totalPhases: number,
  classification: EffortClassification,
): EffortSlice {
  const isEarlyPhase = phaseIndex === 0
  const isLatePhase = phaseIndex === totalPhases - 1

  if (classification === "lightweight") {
    return isEarlyPhase ? "medium" : "low"
  }
  if (classification === "moderate") {
    return isEarlyPhase ? "medium" : isLatePhase ? "low" : "medium"
  }
  if (classification === "heavy") {
    return isEarlyPhase ? "high" : isLatePhase ? "medium" : "high"
  }
  // transformational
  return "high"
}

function getRiskLevelForPhase(
  phaseIndex: number,
  totalPhases: number,
  classification: EffortClassification,
): RiskLevel {
  const isEarlyPhase = phaseIndex === 0

  if (classification === "lightweight") {
    return "low"
  }
  if (classification === "moderate") {
    return isEarlyPhase ? "medium" : "low"
  }
  if (classification === "heavy") {
    return isEarlyPhase ? "high" : "medium"
  }
  // transformational
  return isEarlyPhase ? "high" : "medium"
}

// ─────────────────────────────────────────────────────────────────────────────
// Summary Generation
// ─────────────────────────────────────────────────────────────────────────────

function generateExecutionTheme(
  motionName: string,
  classification: EffortClassification,
  horizonMonths: number,
  companySize: string,
  seasonalContext?: string,
): string {
  const intensityDescriptor =
    classification === "lightweight"
      ? "streamlined"
      : classification === "moderate"
        ? "balanced"
        : classification === "heavy"
          ? "intensive"
          : "transformational"

  const timeframeDescriptor = horizonMonths <= 6 ? "accelerated" : "methodical"

  let baseTheme = `This is a ${intensityDescriptor}, ${timeframeDescriptor} ${horizonMonths}-month execution of ${motionName}, tailored for ${companySize} organizations. The plan emphasizes quick wins in early phases while building toward sustainable, scalable outcomes.`

  if (seasonalContext && seasonalContext !== "neutral") {
    const seasonClauses: Record<string, string> = {
      q1: "This plan is tuned for Q1 with fresh budgets and annual planning cycles.",
      q2: "This plan leverages Q2's execution peak when buying momentum is typically strongest.",
      q3: "This plan accounts for Q3 vacation patterns, focusing on foundational building and event leverage.",
      q4: "This plan is tuned for Q4 with budget deadlines and heavier procurement cycles.",
    }
    baseTheme += ` ${seasonClauses[seasonalContext] || ""}`
  }

  return baseTheme
}

function generateKeyRisks(
  classification: EffortClassification,
  motionId: MotionId,
  inputs?: { salesCycleDays?: number; timeHorizonMonths?: number; seasonalContext?: string },
): string[] {
  const baseRisks: string[] = []

  if (inputs?.salesCycleDays && inputs?.timeHorizonMonths) {
    const horizonDays = inputs.timeHorizonMonths * 30
    if (inputs.salesCycleDays > horizonDays) {
      baseRisks.push(
        "Sales cycle length exceeds the selected horizon; some outcomes will materialize beyond this plan window.",
      )
    }
  }

  if (inputs?.seasonalContext === "q4") {
    baseRisks.push("Q4 procurement and budget cycles may slow down deal closure; early phases must de-risk approvals.")
  }
  if (inputs?.seasonalContext === "q3") {
    baseRisks.push(
      "Q3 vacation patterns may slow response times; focus this plan on top-of-funnel building and event leverage.",
    )
  }

  // Classification-based risks
  if (classification === "heavy" || classification === "transformational") {
    baseRisks.push("Resource contention across parallel workstreams")
    baseRisks.push("Extended timeline risk due to cross-functional dependencies")
  }
  if (classification === "lightweight") {
    baseRisks.push("Potential underinvestment in foundational capabilities")
  }

  // Motion-specific risks
  const motionRisks: Record<MotionId, string[]> = {
    plg: ["Product adoption velocity may not meet projections", "Self-serve conversion rates below benchmark"],
    sales_led: ["Sales cycle length exceeding forecast", "Pipeline coverage insufficient for quota"],
    outbound_abm: ["Target account engagement rates below threshold", "Multi-threading depth insufficient"],
    inbound_demand_gen: ["Content production velocity constraints", "Lead quality vs. quantity tradeoff"],
    hybrid_plg_sales: ["PQL-to-sales handoff friction", "Misalignment between product and sales motions"],
    partner_led: ["Partner activation timeline delays", "Partner capacity and capability gaps"],
    ecosystem_led: ["Developer adoption slower than projected", "Integration quality and support burden"],
    community_led: ["Community engagement sustainability", "Difficulty attributing community to pipeline"],
    event_led: ["Event ROI measurement challenges", "Post-event follow-up execution gaps"],
    vertical_specific: ["Vertical expertise depth constraints", "Limited reference customers in target vertical"],
  }

  return [...baseRisks, ...(motionRisks[motionId] || [])].slice(0, 4)
}

function generateKeyDependencies(motionId: MotionId, companySize: string): string[] {
  const baseDependencies: string[] = []

  // Size-based dependencies
  if (companySize === "enterprise") {
    baseDependencies.push("Executive sponsorship and alignment")
  }

  // Motion-specific dependencies
  const motionDependencies: Record<MotionId, string[]> = {
    plg: ["Product instrumentation and analytics", "Growth engineering capacity", "Self-serve billing infrastructure"],
    sales_led: ["Adequate SDR/AE headcount", "CRM and sales engagement tooling", "Sales enablement content"],
    outbound_abm: ["Intent data and account intelligence", "Marketing-sales alignment", "Personalization capacity"],
    inbound_demand_gen: ["Content production resources", "Marketing automation platform", "Attribution infrastructure"],
    hybrid_plg_sales: ["PQL signal instrumentation", "Sales-product collaboration", "Clear handoff criteria and SLAs"],
    partner_led: ["Partner program infrastructure", "Partner enablement resources", "Co-marketing budget"],
    ecosystem_led: ["API and developer platform maturity", "Developer relations capacity", "Integration support"],
    community_led: ["Community management resources", "Community platform and tooling", "Advocacy program budget"],
    event_led: ["Event budget allocation", "Event production capacity", "Field marketing resources"],
    vertical_specific: [
      "Vertical expertise (PMM, SE)",
      "Vertical proof points and references",
      "Industry partnerships",
    ],
  }

  return [...baseDependencies, ...(motionDependencies[motionId] || [])].slice(0, 3)
}

// ─────────────────────────────────────────────────────────────────────────────
// LLM Expectation Hints
// ─────────────────────────────────────────────────────────────────────────────

const LLM_EXPECTATIONS: string[] = [
  "Detailed GTM execution blueprint for each phase",
  "Market and competitive analysis aligned with the chosen motion",
  "Persona-level messaging and ICP refinement",
  "Channel strategy recommendations based on effort and operational intensity",
  "Risk assessment and mitigation plan",
  "KPI modeling and success metrics for the chosen time horizon",
  "Season- and sales-cycle-aware recommendations that distinguish what can land within the current horizon versus longer-running plays",
]

// ─────────────────────────────────────────────────────────────────────────────
// Main Build Function
// ─────────────────────────────────────────────────────────────────────────────

export function buildGtmPlanPreview(
  motion: MotionConfig,
  inputs: SelectorInputs,
  scores: { effort: number; impact: number; match: number },
): GtmPlanPreview {
  const horizonMonths = inputs.timeHorizonMonths
  const effortClassification = getEffortClassification(scores.effort)

  // Get phase structure
  const phaseTimeframes = getPhaseTimeframes(horizonMonths)
  const motionWorkstreams = MOTION_WORKSTREAMS[motion.id]

  // Build phases
  const phases: GtmPlanPreviewPhase[] = phaseTimeframes.map((pt, index) => {
    const workstreamData = motionWorkstreams.phases[Math.min(index, motionWorkstreams.phases.length - 1)]

    return {
      phaseId: `phase-${index + 1}`,
      label: pt.label,
      timeframe: pt.timeframe,
      focus: workstreamData.focus,
      primaryWorkstreams: workstreamData.workstreams.slice(0, 4),
      primaryOwners: workstreamData.owners,
      effortSlice: getEffortSliceForPhase(index, phaseTimeframes.length, effortClassification),
      riskLevel: getRiskLevelForPhase(index, phaseTimeframes.length, effortClassification),
    }
  })

  // Build summary
  const companySizeLabel =
    inputs.companySize === "smb" ? "SMB" : inputs.companySize === "mid" ? "Mid-Market" : "Enterprise"

  const summary: GtmPlanPreviewSummary = {
    executionTheme: generateExecutionTheme(
      motion.name,
      effortClassification,
      horizonMonths,
      companySizeLabel,
      inputs.seasonalContext,
    ),
    keyRisks: generateKeyRisks(effortClassification, motion.id, {
      salesCycleDays: inputs.salesCycleDays,
      timeHorizonMonths: inputs.timeHorizonMonths,
      seasonalContext: inputs.seasonalContext,
    }),
    keyDependencies: generateKeyDependencies(motion.id, inputs.companySize),
  }

  return {
    horizonMonths,
    motionId: motion.id,
    motionName: motion.name,
    motionType: motion.id, // Use ID as type identifier
    objective: inputs.primaryObjective || "Not specified",
    acvBand: inputs.acvBand || "Not specified",
    companySize: companySizeLabel,
    geography: inputs.targetMarketGeography || "Not specified",
    industry: inputs.industry || "Not specified",
    personas: inputs.personas,
    effortScore: scores.effort,
    impactScore: scores.impact,
    effortClassification,
    phases,
    summary,
    llmExpectations: LLM_EXPECTATIONS,
  }
}
