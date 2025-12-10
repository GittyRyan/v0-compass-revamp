// lib/gtm-motions.ts
//
// Canonical 10-motion taxonomy for the GTM Selector. These motions cover the
// dominant GTM plays used across SaaS and enterprise segments:
// 1) PLG, 2) Sales-Led, 3) Outbound ABM, 4) Inbound / Demand Gen, 5) Hybrid PLG
// + Sales Assist, 6) Partner-Led, 7) Ecosystem-Led, 8) Community-Led, 9) Event-
// Led, 10) Vertical-Specific. The scoring engine ranks motions by blending base
// impact/effort with fit signals derived from SelectorInputs (objective, ACV,
// size, industry, geography, persona depth). Motion matchWeights anchor the
// scoring to real selector values while bestFor fields retain backward
// compatibility with the legacy scoring knobs.

import type { CompanySize, GtmObjective, AcvBand, MotionId, MotionConfig, OpsIntensity } from "./gtm-scoring"

export type GtmMotionCategory = "acquisition" | "expansion" | "market_entry" | "retention"

export type GtmMotionMaturity = "emerging" | "standard" | "advanced"

export interface GtmMotion extends MotionConfig {
  id: MotionId
  name: string
  shortLabel: string // compact label for UI chips
  description: string // one-line explanation

  category: GtmMotionCategory
  maturityLevel: GtmMotionMaturity
  coreStrategy: string
  bestFor: string
  lifecycleStages?: string[]

  // GTM-library metadata for richer UX
  typicalUseCases: string[] // bullets shown in details drawers, docs, etc.
  prerequisites: string[] // org/process prerequisites
  keyChannels: string[] // primary channels this motion leans on
  tags: string[] // free-form tags for search/filters
}

const DEFAULT_LIFECYCLE: string[] = ["Awareness", "Activation", "SQL", "Adoption"]

const acquisitionSizes: CompanySize[] = ["smb", "mid"]
const enterpriseSizes: CompanySize[] = ["mid", "enterprise"]

const pipelineObjectives: GtmObjective[] = ["pipeline", "awareness", "new_market"]
const expansionObjectives: GtmObjective[] = ["pipeline", "expansion"]

const lowMidAcv: AcvBand[] = ["low", "mid"]
const midHighAcv: AcvBand[] = ["mid", "high"]

export const GTM_MOTION_LIBRARY: GtmMotion[] = [
  {
    id: "plg",
    name: "Product-Led Growth (PLG)",
    shortLabel: "PLG",
    description: "Product-led, self-serve growth motion rooted in activation and usage.",
    category: "acquisition",
    maturityLevel: "standard",
    coreStrategy:
      "The product itself is the primary driver of customer acquisition, activation, and retention (e.g., freemium, free trial).",
    bestFor: "High-volume SaaS, low-to-mid ACV, quick time-to-value, low CAC.",
    lifecycleStages: ["Awareness", "Activation", "Expansion"],

    baseEffort: 38,
    baseImpact: 78,
    bestForSizes: acquisitionSizes,
    bestForObjectives: pipelineObjectives,
    bestForAcv: lowMidAcv,
    bestForPersonas: ["VP Product", "VP Growth", "Marketing", "Product Manager"],
    weightSignals: 0.6,
    recommendedHorizonMonths: 6,
    opsIntensity: "light",
    channelCount: 3,
    matchWeights: {
      primaryObjective: { pipeline: 85, awareness: 80, expansion: 65 },
      acvBand: { low: 95, mid: 85, high: 55 },
      companySize: { smb: 90, mid: 80, enterprise: 55 },
      targetCompanySize: { smb: 90, mid: 80, enterprise: 60 },
      industry: {
        "saas-tech": 90,
        retail: 78,
        "professional-services": 72,
        fintech: 70,
        healthcare: 62,
        manufacturing: 60,
      },
      targetMarketGeography: {
        global: 92,
        "north-america": 88,
        emea: 85,
        europe: 85,
        apac: 82,
        latam: 80,
      },
      personaCount: { low: 90, medium: 80, high: 60 },
    },

    typicalUseCases: [
      "Self-serve SaaS with free trial or freemium tier",
      "SMB or mid-market focus with high lead volume",
      "Usage-qualified or product-qualified leads (PQLs) feeding sales",
    ],
    prerequisites: [
      "In-product onboarding and activation flows",
      "Ability to track product usage events",
      "Pricing and packaging that supports self-serve entry",
    ],
    keyChannels: ["In-product", "Email lifecycle", "Website", "Community"],
    tags: ["PLG", "Self-serve", "PQL", "Growth"],
  },
  {
    id: "sales_led",
    name: "Sales-Led (Direct Sales)",
    shortLabel: "Sales-Led",
    description: "Human-led sales motion for complex, multi-stakeholder deals.",
    category: "acquisition",
    maturityLevel: "advanced",
    coreStrategy: "A human-led sales team drives the acquisition process through direct outreach and consultative selling.",
    bestFor: "High ACV, complex solutions, multi-stakeholder deals, regulated industries, long sales cycles.",
    lifecycleStages: DEFAULT_LIFECYCLE,

    baseEffort: 65,
    baseImpact: 82,
    bestForSizes: enterpriseSizes,
    bestForObjectives: pipelineObjectives,
    bestForAcv: midHighAcv,
    bestForPersonas: ["VP Sales", "CRO", "RevOps", "Sales Leader"],
    weightSignals: 0.6,
    recommendedHorizonMonths: 9,
    opsIntensity: "heavy",
    channelCount: 5,
    matchWeights: {
      primaryObjective: { pipeline: 90, expansion: 80, new_market: 80, awareness: 60 },
      acvBand: { low: 55, mid: 85, high: 95 },
      companySize: { smb: 60, mid: 85, enterprise: 95 },
      targetCompanySize: { smb: 60, mid: 85, enterprise: 95 },
      industry: {
        healthcare: 90,
        manufacturing: 85,
        fintech: 85,
        "saas-tech": 75,
        "professional-services": 75,
        retail: 70,
      },
      targetMarketGeography: {
        "north-america": 90,
        emea: 90,
        europe: 90,
        apac: 85,
        global: 85,
        latam: 80,
      },
      personaCount: { low: 70, medium: 80, high: 90 },
    },

    typicalUseCases: [
      "Enterprise platform sales with multi-threaded stakeholders",
      "Mid-market deals that need tailored demo + ROI proof",
      "Regulated industries requiring rigorous procurement",
    ],
    prerequisites: [
      "Defined sales process and enablement",
      "Opportunity management and forecasting discipline",
      "Coverage model for SDR/AE/SE collaboration",
    ],
    keyChannels: ["Email", "Calling", "Executive outreach", "Demos", "Events"],
    tags: ["Sales-led", "Enterprise", "High ACV"],
  },
  {
    id: "outbound_abm",
    name: "Outbound ABM",
    shortLabel: "ABM",
    description: "Targeted, account-based outbound motion focused on high-value accounts.",
    category: "acquisition",
    maturityLevel: "advanced",
    coreStrategy: "Highly personalized and coordinated outreach to a defined, high-value set of target accounts.",
    bestFor: "Enterprise / Mid-Market, high ACV, multi-persona buying committees, strategic focus.",
    lifecycleStages: ["Awareness", "MQL", "SQL"],

    baseEffort: 70,
    baseImpact: 84,
    bestForSizes: enterpriseSizes,
    bestForObjectives: pipelineObjectives,
    bestForAcv: midHighAcv,
    bestForPersonas: ["VP Sales", "CRO", "RevOps"],
    weightSignals: 0.6,
    recommendedHorizonMonths: 9,
    opsIntensity: "heavy",
    channelCount: 5,
    matchWeights: {
      primaryObjective: { pipeline: 92, expansion: 78, new_market: 75 },
      acvBand: { low: 40, mid: 90, high: 95 },
      companySize: { smb: 55, mid: 85, enterprise: 95 },
      targetCompanySize: { smb: 55, mid: 85, enterprise: 95 },
      industry: {
        healthcare: 88,
        manufacturing: 85,
        fintech: 88,
        "saas-tech": 80,
        retail: 72,
        "professional-services": 78,
      },
      targetMarketGeography: {
        "north-america": 90,
        emea: 90,
        europe: 88,
        apac: 85,
        global: 85,
        latam: 80,
      },
      personaCount: { low: 70, medium: 85, high: 92 },
    },

    typicalUseCases: [
      "New-logo acquisition in named strategic accounts",
      "Pipeline generation for high ACV / complex deals",
      "Executive multi-threading and deal orchestration",
    ],
    prerequisites: [
      "Dedicated SDR/BDR or outbound sales capacity",
      "Clear ICP and target account list",
      "Sales engagement and intent tooling in place",
    ],
    keyChannels: ["Outbound email", "Sales calls", "LinkedIn outbound", "Events"],
    tags: ["ABM", "Outbound", "Enterprise", "Sales-led"],
  },
  {
    id: "inbound_demand_gen",
    name: "Inbound / Demand Generation",
    shortLabel: "Inbound",
    description: "Content- and performance-driven engine to attract and convert inbound demand.",
    category: "acquisition",
    maturityLevel: "standard",
    coreStrategy: "Attracting prospects through valuable content, SEO, paid media, and nurturing programs.",
    bestFor: "Building top-of-funnel awareness and volume, markets driven by education and thought leadership.",
    lifecycleStages: ["Awareness", "MQL", "SQL"],

    baseEffort: 48,
    baseImpact: 74,
    bestForSizes: acquisitionSizes,
    bestForObjectives: pipelineObjectives,
    bestForAcv: lowMidAcv,
    bestForPersonas: ["CMO", "VP Marketing", "Growth"],
    weightSignals: 0.6,
    recommendedHorizonMonths: 6,
    opsIntensity: "moderate",
    channelCount: 4,
    matchWeights: {
      primaryObjective: { awareness: 88, pipeline: 82, new_market: 70 },
      acvBand: { low: 85, mid: 80, high: 55 },
      companySize: { smb: 80, mid: 80, enterprise: 60 },
      targetCompanySize: { smb: 80, mid: 80, enterprise: 65 },
      industry: {
        "saas-tech": 85,
        "professional-services": 80,
        retail: 85,
        fintech: 80,
        manufacturing: 70,
        healthcare: 70,
      },
      targetMarketGeography: {
        global: 90,
        "north-america": 85,
        emea: 85,
        europe: 85,
        apac: 80,
        latam: 80,
      },
      personaCount: { low: 80, medium: 85, high: 70 },
    },

    typicalUseCases: [
      "Building predictable inbound pipeline over 6–12 months",
      "Scaling beyond founder-led or referral-led growth",
      "Complementing outbound with a demand capture engine",
    ],
    prerequisites: [
      "Content and campaign production capacity",
      "Basic marketing automation and attribution",
      "Clear ICP and keyword/intent strategy",
    ],
    keyChannels: ["SEO", "Paid search", "Paid social", "Webinars"],
    tags: ["Inbound", "Demand gen", "Marketing-led"],
  },
  {
    id: "hybrid_plg_sales_assist",
    name: "Hybrid PLG + Sales Assist",
    shortLabel: "Hybrid PLG",
    description: "Combines PLG efficiency with human guidance for monetization and expansion.",
    category: "acquisition",
    maturityLevel: "standard",
    coreStrategy: "Combines the scalability of PLG with the support of a sales team for monetization and expansion.",
    bestFor: "Mid-market, products that require some human guidance for complex features or upgrade paths.",
    lifecycleStages: DEFAULT_LIFECYCLE,

    baseEffort: 55,
    baseImpact: 78,
    bestForSizes: acquisitionSizes,
    bestForObjectives: expansionObjectives,
    bestForAcv: ["low", "mid", "high"],
    bestForPersonas: ["VP Product", "VP Sales", "Growth"],
    weightSignals: 0.6,
    recommendedHorizonMonths: 6,
    opsIntensity: "moderate",
    channelCount: 4,
    matchWeights: {
      primaryObjective: { pipeline: 85, expansion: 80, awareness: 70 },
      acvBand: { low: 80, mid: 85, high: 70 },
      companySize: { smb: 80, mid: 85, enterprise: 70 },
      targetCompanySize: { smb: 80, mid: 85, enterprise: 75 },
      industry: {
        "saas-tech": 85,
        fintech: 80,
        retail: 78,
        "professional-services": 78,
        healthcare: 70,
        manufacturing: 70,
      },
      targetMarketGeography: {
        global: 88,
        "north-america": 86,
        emea: 84,
        europe: 84,
        apac: 82,
        latam: 78,
      },
      personaCount: { low: 80, medium: 85, high: 75 },
    },

    typicalUseCases: [
      "Product-led funnels that need human assist for upgrades",
      "Mid-market segments with some complexity",
      "Layering sales on top of product-qualified leads",
    ],
    prerequisites: [
      "Product usage visibility and PQL definition",
      "Sales-assist or inside sales capacity",
      "Clear upgrade paths and packaging",
    ],
    keyChannels: ["In-product", "Email", "Sales calls", "Chat"],
    tags: ["Hybrid", "PLG", "Sales assist"],
  },
  {
    id: "partner_led",
    name: "Partner-Led / Channel-Led",
    shortLabel: "Partner-Led",
    description: "Partner ecosystem drives distribution and trust for complex or regional plays.",
    category: "acquisition",
    maturityLevel: "advanced",
    coreStrategy:
      "Leveraging third-party partners (resellers, system integrators, agencies) to distribute and sell the product.",
    bestFor: "Geographic expansion, regulated industries, or complex sales that benefit from partner trust and existing relationships.",
    lifecycleStages: DEFAULT_LIFECYCLE,

    baseEffort: 65,
    baseImpact: 76,
    bestForSizes: enterpriseSizes,
    bestForObjectives: expansionObjectives,
    bestForAcv: midHighAcv,
    bestForPersonas: ["Channel", "VP Sales", "Alliances"],
    weightSignals: 0.6,
    recommendedHorizonMonths: 9,
    opsIntensity: "heavy",
    channelCount: 5,
    matchWeights: {
      primaryObjective: { new_market: 85, pipeline: 80, expansion: 75 },
      acvBand: { low: 50, mid: 80, high: 90 },
      companySize: { smb: 55, mid: 80, enterprise: 92 },
      targetCompanySize: { smb: 55, mid: 80, enterprise: 92 },
      industry: {
        healthcare: 90,
        manufacturing: 90,
        fintech: 85,
        retail: 70,
        "saas-tech": 70,
        "professional-services": 80,
      },
      targetMarketGeography: {
        global: 90,
        "north-america": 85,
        emea: 85,
        europe: 85,
        apac: 85,
        latam: 80,
      },
      personaCount: { low: 70, medium: 80, high: 85 },
    },

    typicalUseCases: [
      "Entering new geographies via trusted resellers",
      "Complex implementations requiring SI partners",
      "Highly regulated industries needing local presence",
    ],
    prerequisites: [
      "Partner program design and incentives",
      "Partner enablement and co-selling process",
      "Clear rules of engagement with sales",
    ],
    keyChannels: ["Alliances", "Resellers", "SI partners", "Partner marketplaces"],
    tags: ["Channel", "Partner-led", "Alliances"],
  },
  {
    id: "ecosystem_led",
    name: "Ecosystem-Led",
    shortLabel: "Ecosystem",
    description: "Platform and integration-first motion creating network effects.",
    category: "expansion",
    maturityLevel: "advanced",
    coreStrategy:
      "Building an integrated platform with complementary products (often through APIs and marketplaces) to create network effects and stickiness.",
    bestFor: "Infrastructure, platform, or API-first products, increasing value through integrations and partner solutions.",
    lifecycleStages: DEFAULT_LIFECYCLE,

    baseEffort: 60,
    baseImpact: 82,
    bestForSizes: enterpriseSizes,
    bestForObjectives: expansionObjectives,
    bestForAcv: midHighAcv,
    bestForPersonas: ["Platform", "Product", "Developers"],
    weightSignals: 0.6,
    recommendedHorizonMonths: 9,
    opsIntensity: "heavy",
    channelCount: 5,
    matchWeights: {
      primaryObjective: { expansion: 85, pipeline: 75, new_market: 80, awareness: 60 },
      acvBand: { low: 55, mid: 85, high: 92 },
      companySize: { smb: 65, mid: 85, enterprise: 90 },
      targetCompanySize: { smb: 65, mid: 85, enterprise: 90 },
      industry: {
        "saas-tech": 85,
        fintech: 85,
        manufacturing: 75,
        healthcare: 75,
        "professional-services": 80,
        retail: 70,
      },
      targetMarketGeography: {
        global: 90,
        "north-america": 85,
        emea: 85,
        europe: 85,
        apac: 85,
        latam: 80,
      },
      personaCount: { low: 75, medium: 85, high: 80 },
    },

    typicalUseCases: [
      "API-first products that monetize integrations",
      "Building a marketplace or partner add-on ecosystem",
      "Deepening stickiness via platform extensibility",
    ],
    prerequisites: [
      "Stable APIs and documentation",
      "Partner management and developer relations",
      "Usage-based pricing or platform packaging",
    ],
    keyChannels: ["APIs", "Marketplace", "Developer relations", "Alliances"],
    tags: ["Platform", "Integrations", "API"],
  },
  {
    id: "community_led",
    name: "Community-Led",
    shortLabel: "Community",
    description: "Community engagement drives adoption, feedback, and advocacy.",
    category: "acquisition",
    maturityLevel: "emerging",
    coreStrategy:
      "Building and engaging a community of users around the product or brand to drive adoption, feedback, and advocacy.",
    bestFor: "Products with strong user groups (e.g., developers, specific professions), fostering loyalty and organic growth.",
    lifecycleStages: ["Awareness", "Activation", "Advocacy"],

    baseEffort: 50,
    baseImpact: 72,
    bestForSizes: acquisitionSizes,
    bestForObjectives: ["pipeline", "awareness"],
    bestForAcv: lowMidAcv,
    bestForPersonas: ["Developers", "Product", "Marketing"],
    weightSignals: 0.6,
    recommendedHorizonMonths: 9,
    opsIntensity: "moderate",
    channelCount: 3,
    matchWeights: {
      primaryObjective: { awareness: 85, pipeline: 70, expansion: 65 },
      acvBand: { low: 85, mid: 75, high: 55 },
      companySize: { smb: 85, mid: 80, enterprise: 60 },
      targetCompanySize: { smb: 85, mid: 80, enterprise: 60 },
      industry: {
        "saas-tech": 85,
        fintech: 80,
        "professional-services": 80,
        retail: 80,
        manufacturing: 65,
        healthcare: 65,
      },
      targetMarketGeography: {
        global: 85,
        "north-america": 82,
        emea: 82,
        europe: 82,
        apac: 78,
        latam: 78,
      },
      personaCount: { low: 85, medium: 80, high: 65 },
    },

    typicalUseCases: [
      "Developer tools with active user forums",
      "Professional communities that can champion the product",
      "Launching advocacy and ambassador programs",
    ],
    prerequisites: [
      "Community platform and moderation",
      "Cadence for events/meetups/office hours",
      "Content and incentives for advocates",
    ],
    keyChannels: ["Community", "Events", "Social", "In-product"],
    tags: ["Community", "Advocacy", "Developer"],
  },
  {
    id: "event_led",
    name: "Event-Led",
    shortLabel: "Event-Led",
    description: "Event programming is the primary engagement and pipeline lever.",
    category: "acquisition",
    maturityLevel: "standard",
    coreStrategy: "Using virtual and in-person events as a primary channel to drive awareness, engagement, and lead generation.",
    bestFor: "High-touch engagement, specialized industries, thought leadership, accelerating pipeline.",
    lifecycleStages: ["Awareness", "MQL", "SQL"],

    baseEffort: 60,
    baseImpact: 74,
    bestForSizes: enterpriseSizes,
    bestForObjectives: pipelineObjectives,
    bestForAcv: midHighAcv,
    bestForPersonas: ["Marketing", "Sales", "Events"],
    weightSignals: 0.6,
    recommendedHorizonMonths: 6,
    opsIntensity: "heavy",
    channelCount: 4,
    matchWeights: {
      primaryObjective: { awareness: 80, pipeline: 80, new_market: 75, expansion: 70 },
      acvBand: { low: 60, mid: 80, high: 85 },
      companySize: { smb: 65, mid: 80, enterprise: 85 },
      targetCompanySize: { smb: 65, mid: 80, enterprise: 85 },
      industry: {
        healthcare: 85,
        manufacturing: 80,
        fintech: 80,
        "saas-tech": 75,
        retail: 80,
        "professional-services": 75,
      },
      targetMarketGeography: {
        "north-america": 85,
        emea: 85,
        europe: 85,
        apac: 80,
        latam: 80,
        global: 80,
      },
      personaCount: { low: 75, medium: 80, high: 85 },
    },

    typicalUseCases: [
      "Conference or webinar-led demand motion",
      "Roadshows to accelerate in-region pipeline",
      "Thought-leadership events for complex industries",
    ],
    prerequisites: [
      "Event budget and production resources",
      "Lead capture, routing, and follow-up mechanics",
      "Content engine to support pre/during/post programming",
    ],
    keyChannels: ["Events", "Webinars", "Field marketing", "ABM"],
    tags: ["Events", "Field", "Pipeline acceleration"],
  },
  {
    id: "vertical_specific",
    name: "Vertical-Specific",
    shortLabel: "Vertical",
    description: "Industry-focused GTM motion with tailored messaging, proof, and plays.",
    category: "market_entry",
    maturityLevel: "standard",
    coreStrategy: "Tailoring GTM execution to a single, specialized industry with deep proof and relevance.",
    bestFor: "Regulated or niche markets where specialization leads to high relevance and improved win rates.",
    lifecycleStages: DEFAULT_LIFECYCLE,

    baseEffort: 58,
    baseImpact: 80,
    bestForSizes: enterpriseSizes,
    bestForObjectives: ["pipeline", "new_market", "expansion"],
    bestForAcv: midHighAcv,
    bestForPersonas: ["VP Sales", "Industry GM"],
    weightSignals: 0.6,
    recommendedHorizonMonths: 9,
    opsIntensity: "heavy",
    channelCount: 4,
    matchWeights: {
      primaryObjective: { pipeline: 85, new_market: 85, expansion: 80, awareness: 70 },
      acvBand: { low: 55, mid: 85, high: 90 },
      companySize: { smb: 55, mid: 85, enterprise: 90 },
      targetCompanySize: { smb: 55, mid: 85, enterprise: 90 },
      industry: {
        healthcare: 95,
        fintech: 90,
        manufacturing: 85,
        "professional-services": 80,
        retail: 80,
        "saas-tech": 75,
      },
      targetMarketGeography: {
        "north-america": 88,
        emea: 85,
        europe: 85,
        apac: 82,
        latam: 80,
        global: 82,
      },
      personaCount: { low: 75, medium: 85, high: 80 },
    },

    typicalUseCases: [
      "Expanding into a priority vertical (e.g., Financial Services, Healthcare)",
      "Doubling down on a high-performing segment with dedicated plays",
      "Building category leadership in a niche market",
    ],
    prerequisites: [
      "Vertical-specific proof points (case studies, references, partners)",
      "Sales and marketing alignment on vertical narrative",
      "Specialized partner and channel support",
    ],
    keyChannels: [
      "Vertical events and conferences",
      "Partner / SI ecosystem",
      "Targeted outbound and ABM",
      "Vertical-specific content",
    ],
    tags: ["Vertical", "Segmented", "Market entry", "ABM-adjacent"],
  },
]

// -----------------------------------------------------------------------------
// Adapter to feed the existing scoring engine
// -----------------------------------------------------------------------------

export const MOTION_CONFIGS_FROM_LIBRARY: MotionConfig[] = GTM_MOTION_LIBRARY.map((motion) => ({
  id: motion.id,
  name: motion.name,
  coreStrategy: motion.coreStrategy,
  bestFor: motion.bestFor,
  lifecycleStages: motion.lifecycleStages,
  baseEffort: motion.baseEffort,
  baseImpact: motion.baseImpact,
  bestForSizes: motion.bestForSizes,
  bestForObjectives: motion.bestForObjectives,
  bestForAcv: motion.bestForAcv,
  bestForPersonas: motion.bestForPersonas,
  matchWeights: motion.matchWeights,
  weightSignals: 0.6,
  recommendedHorizonMonths: motion.recommendedHorizonMonths,
  opsIntensity: motion.opsIntensity as OpsIntensity,
  channelCount: motion.channelCount,
}))

export const MOTION_CONFIGS = MOTION_CONFIGS_FROM_LIBRARY
export const MOTION_LIBRARY = GTM_MOTION_LIBRARY
