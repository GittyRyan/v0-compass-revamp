// lib/gtm-motions.ts

/**
 * 10-Motion GTM Library
 *
 * This library defines 10 canonical GTM motions used by the GTM Selector:
 *
 * 1. Product-Led Growth (PLG) - Self-serve, product drives acquisition
 * 2. Sales-Led (Direct Sales) - Human-led consultative selling
 * 3. Outbound ABM - Account-based personalized outreach
 * 4. Inbound / Demand Generation - Content and marketing-led
 * 5. Hybrid PLG + Sales Assist - PLG with sales support for monetization
 * 6. Partner-Led / Channel-Led - Third-party distribution
 * 7. Ecosystem-Led - Platform/API network effects
 * 8. Community-Led - User community drives adoption
 * 9. Event-Led - Events as primary engagement channel
 * 10. Vertical-Specific - Industry-tailored GTM
 *
 * The scoring engine uses these configs to rank motions based on:
 * - Fit score (objective, size, ACV, persona alignment)
 * - Dynamic Impact (base impact × multipliers)
 * - Effort V2 (base effort + contextual deltas)
 */

import type { CompanySize, GtmObjective, AcvBand, MotionId, MotionConfig } from "./gtm-scoring"

export type GtmMotionCategory = "acquisition" | "expansion" | "market_entry" | "retention"

export type GtmMotionMaturity = "emerging" | "standard" | "advanced"

export type OpsIntensity = "light" | "moderate" | "heavy"

export type GtmMotion = {
  id: MotionId
  name: string
  shortLabel: string
  description: string
  coreStrategy: string // Short internal description
  bestFor: string // Primary benefit / best use case

  category: GtmMotionCategory
  maturityLevel: GtmMotionMaturity

  // Scoring primitives
  baseEffort: number // 0–100
  baseImpact: number // 0–100
  bestForSizes: CompanySize[]
  bestForObjectives: GtmObjective[]
  bestForAcv: AcvBand[]
  bestForPersonas: string[]

  recommendedHorizonMonths: 3 | 6 | 9 | 12
  opsIntensity: OpsIntensity
  channelCount: number

  // GTM-library metadata for richer UX
  typicalUseCases: string[]
  prerequisites: string[]
  keyChannels: string[]
  tags: string[]
}

// -----------------------------------------------------------------------------
// Canonical 10-Motion GTM Library
// -----------------------------------------------------------------------------

export const GTM_MOTION_LIBRARY: GtmMotion[] = [
  // 1. Product-Led Growth (PLG)
  {
    id: "plg",
    name: "Product-Led Growth (PLG)",
    shortLabel: "PLG",
    description: "Self-serve, product-centric motion where usage drives acquisition and expansion.",
    coreStrategy:
      "The product itself is the primary driver of customer acquisition, activation, and retention (e.g., freemium, free trial).",
    bestFor: "High-volume SaaS, low-to-mid ACV, quick time-to-value, low CAC.",

    category: "acquisition",
    maturityLevel: "standard",

    baseEffort: 38,
    baseImpact: 58,
    bestForSizes: ["smb", "mid"],
    bestForObjectives: ["pipeline", "awareness"],
    bestForAcv: ["low", "mid"],
    bestForPersonas: ["VP Product", "Growth Lead", "Developer", "End User"],

    recommendedHorizonMonths: 6,
    opsIntensity: "light",
    channelCount: 3,

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
    tags: ["PLG", "Self-serve", "PQL", "Growth", "Freemium"],
  },

  // 2. Sales-Led (Direct Sales)
  {
    id: "sales_led",
    name: "Sales-Led (Direct Sales)",
    shortLabel: "Sales-Led",
    description: "Human-led sales team drives acquisition through direct outreach and consultative selling.",
    coreStrategy:
      "A human-led sales team drives the acquisition process through direct outreach and consultative selling.",
    bestFor: "High ACV, complex solutions, multi-stakeholder deals, regulated industries, long sales cycles.",

    category: "acquisition",
    maturityLevel: "standard",

    baseEffort: 55,
    baseImpact: 62,
    bestForSizes: ["mid", "enterprise"],
    bestForObjectives: ["pipeline", "expansion"],
    bestForAcv: ["mid", "high"],
    bestForPersonas: ["VP Sales", "CRO", "CFO", "IT Director", "Procurement"],

    recommendedHorizonMonths: 9,
    opsIntensity: "heavy",
    channelCount: 4,

    typicalUseCases: [
      "Enterprise or mid-market SaaS with complex buying processes",
      "High-touch deals requiring demos, POCs, and multi-threading",
      "Regulated industries with compliance requirements",
    ],
    prerequisites: [
      "Dedicated sales team with quota capacity",
      "CRM and sales process tooling",
      "Sales enablement content and playbooks",
    ],
    keyChannels: ["Sales calls", "Demos", "Email outreach", "LinkedIn"],
    tags: ["Sales-led", "Enterprise", "Consultative", "High-touch"],
  },

  // 3. Outbound ABM
  {
    id: "outbound_abm",
    name: "Outbound Account-Based Marketing (ABM)",
    shortLabel: "ABM",
    description: "Highly personalized and coordinated outreach to a defined, high-value set of target accounts.",
    coreStrategy: "Highly personalized and coordinated outreach to a defined, high-value set of target accounts.",
    bestFor: "Enterprise / Mid-Market, high ACV, multi-persona buying committees, strategic focus.",

    category: "acquisition",
    maturityLevel: "advanced",

    baseEffort: 58,
    baseImpact: 60,
    bestForSizes: ["mid", "enterprise"],
    bestForObjectives: ["pipeline", "expansion"],
    bestForAcv: ["mid", "high"],
    bestForPersonas: ["VP Sales", "CRO", "RevOps", "CMO", "VP Marketing"],

    recommendedHorizonMonths: 9,
    opsIntensity: "heavy",
    channelCount: 5,

    typicalUseCases: [
      "Enterprise or upper mid-market SaaS with defined ICP and sales team",
      "New-logo acquisition in named strategic accounts",
      "Pipeline generation for high ACV / complex deals",
    ],
    prerequisites: [
      "Dedicated SDR/BDR or outbound sales capacity",
      "Clear ICP and target account list",
      "CRM and sales engagement tooling in place",
      "Sales-marketing alignment on target accounts",
    ],
    keyChannels: ["Outbound email", "Sales calls", "LinkedIn outbound", "Events", "Direct mail"],
    tags: ["ABM", "Outbound", "Enterprise", "Sales-led", "Personalized"],
  },

  // 4. Inbound / Demand Generation
  {
    id: "inbound_demand_gen",
    name: "Inbound (Marketing-Led/Demand Gen)",
    shortLabel: "Inbound",
    description: "Attracting prospects through valuable content, SEO, paid media, and nurturing programs.",
    coreStrategy: "Attracting prospects through valuable content, SEO, paid media, and nurturing programs.",
    bestFor: "Building top-of-funnel awareness and volume, markets driven by education and thought leadership.",

    category: "acquisition",
    maturityLevel: "standard",

    baseEffort: 42,
    baseImpact: 52,
    bestForSizes: ["smb", "mid"],
    bestForObjectives: ["pipeline", "awareness"],
    bestForAcv: ["low", "mid"],
    bestForPersonas: ["CMO", "VP Marketing", "Growth Lead", "Content Manager"],

    recommendedHorizonMonths: 6,
    opsIntensity: "moderate",
    channelCount: 4,

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
    keyChannels: ["SEO", "Paid search", "Paid social", "Webinars", "Content marketing"],
    tags: ["Inbound", "Demand gen", "Marketing-led", "Content", "SEO"],
  },

  // 5. Hybrid PLG + Sales Assist
  {
    id: "hybrid_plg_sales",
    name: "Hybrid (PLG + Sales Assist)",
    shortLabel: "Hybrid",
    description: "Combines the scalability of PLG with the support of a sales team for monetization and expansion.",
    coreStrategy: "Combines the scalability of PLG with the support of a sales team for monetization and expansion.",
    bestFor: "Mid-market, products that require some human guidance for complex features or upgrade paths.",

    category: "acquisition",
    maturityLevel: "advanced",

    baseEffort: 48,
    baseImpact: 60,
    bestForSizes: ["smb", "mid"],
    bestForObjectives: ["pipeline", "expansion"],
    bestForAcv: ["mid"],
    bestForPersonas: ["VP Product", "VP Sales", "Growth Lead", "Account Executive"],

    recommendedHorizonMonths: 6,
    opsIntensity: "moderate",
    channelCount: 4,

    typicalUseCases: [
      "PLG products with expansion opportunities requiring sales touch",
      "Mid-market deals where self-serve gets foot in door, sales closes",
      "Complex upgrade paths or multi-seat expansions",
    ],
    prerequisites: [
      "Working PLG motion with PQL signals",
      "Sales team trained on product-led approach",
      "Handoff processes between product and sales",
    ],
    keyChannels: ["In-product", "Sales outreach", "Email lifecycle", "Success-led expansion"],
    tags: ["Hybrid", "PLG", "Sales assist", "PQL", "Expansion"],
  },

  // 6. Partner-Led / Channel-Led
  {
    id: "partner_led",
    name: "Partner-Led / Channel-Led",
    shortLabel: "Partner",
    description: "Leveraging third-party partners (resellers, SIs, agencies) to distribute and sell the product.",
    coreStrategy:
      "Leveraging third-party partners (resellers, system integrators, agencies) to distribute and sell the product.",
    bestFor:
      "Geographic expansion, regulated industries, or complex sales that benefit from partner trust and existing relationships.",

    category: "market_entry",
    maturityLevel: "advanced",

    baseEffort: 52,
    baseImpact: 55,
    bestForSizes: ["mid", "enterprise"],
    bestForObjectives: ["new_market", "pipeline"],
    bestForAcv: ["mid", "high"],
    bestForPersonas: ["VP Partnerships", "Channel Manager", "VP Sales", "BD Lead"],

    recommendedHorizonMonths: 12,
    opsIntensity: "heavy",
    channelCount: 4,

    typicalUseCases: [
      "Geographic expansion into new regions via local partners",
      "Regulated industries where partners provide compliance expertise",
      "Complex implementations requiring SI delivery",
    ],
    prerequisites: [
      "Partner program structure and economics",
      "Partner enablement and certification",
      "Co-marketing and co-selling processes",
    ],
    keyChannels: ["Partner network", "SI ecosystem", "Reseller channel", "Co-marketing"],
    tags: ["Partner", "Channel", "Reseller", "SI", "Indirect"],
  },

  // 7. Ecosystem-Led
  {
    id: "ecosystem_led",
    name: "Ecosystem-Led",
    shortLabel: "Ecosystem",
    description:
      "Building an integrated platform with complementary products to create network effects and stickiness.",
    coreStrategy:
      "Building an integrated platform with complementary products (often through APIs and marketplaces) to create network effects and stickiness.",
    bestFor:
      "Infrastructure, platform, or API-first products, increasing value through integrations and partner solutions.",

    category: "expansion",
    maturityLevel: "advanced",

    baseEffort: 50,
    baseImpact: 58,
    bestForSizes: ["smb", "mid", "enterprise"],
    bestForObjectives: ["expansion", "awareness"],
    bestForAcv: ["low", "mid", "high"],
    bestForPersonas: ["VP Product", "Developer", "CTO", "Platform Lead", "Integration Manager"],

    recommendedHorizonMonths: 12,
    opsIntensity: "moderate",
    channelCount: 4,

    typicalUseCases: [
      "Building marketplace or integration ecosystem",
      "API-first products driving developer adoption",
      "Platform plays creating switching costs via integrations",
    ],
    prerequisites: [
      "Robust API and developer documentation",
      "Partner/integration program structure",
      "Marketplace or app store infrastructure",
    ],
    keyChannels: ["API/Developer portal", "Marketplace", "Partner integrations", "Developer community"],
    tags: ["Ecosystem", "Platform", "API", "Marketplace", "Integrations"],
  },

  // 8. Community-Led
  {
    id: "community_led",
    name: "Community-Led",
    shortLabel: "Community",
    description: "Building and engaging a community of users around the product to drive adoption and advocacy.",
    coreStrategy:
      "Building and engaging a community of users around the product or brand to drive adoption, feedback, and advocacy.",
    bestFor:
      "Products with strong user groups (e.g., developers, specific professions), fostering loyalty and organic growth.",

    category: "acquisition",
    maturityLevel: "emerging",

    baseEffort: 40,
    baseImpact: 50,
    bestForSizes: ["smb", "mid"],
    bestForObjectives: ["awareness", "pipeline"],
    bestForAcv: ["low", "mid"],
    bestForPersonas: ["Developer", "Community Manager", "DevRel", "VP Marketing", "End User"],

    recommendedHorizonMonths: 9,
    opsIntensity: "moderate",
    channelCount: 3,

    typicalUseCases: [
      "Developer tools building grassroots adoption",
      "Professional communities (designers, marketers, etc.)",
      "Open-source or freemium products with passionate user base",
    ],
    prerequisites: [
      "Community platform and moderation",
      "Content and engagement strategy",
      "Developer relations or community management function",
    ],
    keyChannels: ["Community forum/Discord/Slack", "Social media", "User-generated content", "Meetups"],
    tags: ["Community", "DevRel", "Grassroots", "Advocacy", "Organic"],
  },

  // 9. Event-Led
  {
    id: "event_led",
    name: "Event-Led",
    shortLabel: "Events",
    description: "Using virtual and in-person events as a primary channel to drive awareness and lead generation.",
    coreStrategy:
      "Using virtual and in-person events (conferences, webinars, roadshows) as a primary channel to drive awareness, engagement, and lead generation.",
    bestFor: "High-touch engagement, specialized industries, thought leadership, accelerating pipeline.",

    category: "acquisition",
    maturityLevel: "standard",

    baseEffort: 55,
    baseImpact: 55,
    bestForSizes: ["mid", "enterprise"],
    bestForObjectives: ["awareness", "pipeline"],
    bestForAcv: ["mid", "high"],
    bestForPersonas: ["CMO", "VP Marketing", "Event Manager", "Field Marketing", "VP Sales"],

    recommendedHorizonMonths: 6,
    opsIntensity: "heavy",
    channelCount: 4,

    typicalUseCases: [
      "Industry conferences and trade shows",
      "Owned events (user conferences, roadshows)",
      "Webinar series and virtual summits",
    ],
    prerequisites: [
      "Event production and logistics capability",
      "Budget for event participation/hosting",
      "Post-event follow-up and attribution processes",
    ],
    keyChannels: ["Conferences", "Webinars", "Trade shows", "Owned events", "Roadshows"],
    tags: ["Events", "Conferences", "Webinars", "Field marketing", "High-touch"],
  },

  // 10. Vertical-Specific
  {
    id: "vertical_specific",
    name: "Vertical-Specific",
    shortLabel: "Vertical",
    description: "Industry-focused GTM motion with tailored messaging, proof, and plays.",
    coreStrategy:
      "Tailoring the entire GTM execution (messaging, content, sales plays) to a single, specialized industry (e.g., FinTech, HealthTech).",
    bestFor: "Regulated or niche markets where specialization leads to high relevance and improved win rates.",

    category: "market_entry",
    maturityLevel: "standard",

    baseEffort: 52,
    baseImpact: 58,
    bestForSizes: ["mid", "enterprise"],
    bestForObjectives: ["pipeline", "new_market"],
    bestForAcv: ["mid", "high"],
    bestForPersonas: ["VP Sales", "Industry GM", "Solutions Engineer", "VP Marketing"],

    recommendedHorizonMonths: 9,
    opsIntensity: "heavy",
    channelCount: 4,

    typicalUseCases: [
      "Expanding into a priority vertical (e.g., Financial Services, Healthcare)",
      "Doubling down on a high-performing segment with dedicated plays",
      "Building category leadership in a niche market",
    ],
    prerequisites: [
      "Clear target vertical and segment definition",
      "Vertical-specific proof points (case studies, references, partners)",
      "Sales and marketing alignment on vertical narrative",
    ],
    keyChannels: ["Vertical events", "Partner/SI ecosystem", "Targeted ABM", "Vertical content"],
    tags: ["Vertical", "Industry", "Segmented", "Specialized", "Niche"],
  },
]

// -----------------------------------------------------------------------------
// Adapter to feed the existing scoring engine
// -----------------------------------------------------------------------------

export const MOTION_CONFIGS_FROM_LIBRARY: MotionConfig[] = GTM_MOTION_LIBRARY.map((motion) => ({
  id: motion.id,
  name: motion.name,
  baseEffort: motion.baseEffort,
  baseImpact: motion.baseImpact,
  bestForSizes: motion.bestForSizes,
  bestForObjectives: motion.bestForObjectives,
  bestForAcv: motion.bestForAcv,
  bestForPersonas: motion.bestForPersonas,
  weightSignals: 0.6,
  recommendedHorizonMonths: motion.recommendedHorizonMonths,
  opsIntensity: motion.opsIntensity,
  channelCount: motion.channelCount,
}))

export const MOTION_CONFIGS = MOTION_CONFIGS_FROM_LIBRARY
export const MOTION_LIBRARY = GTM_MOTION_LIBRARY

// Helper to get motion by ID
export function getMotionById(id: MotionId): GtmMotion | undefined {
  return GTM_MOTION_LIBRARY.find((m) => m.id === id)
}

// Helper to get motion config by ID
export function getMotionConfigById(id: MotionId): MotionConfig | undefined {
  return MOTION_CONFIGS_FROM_LIBRARY.find((m) => m.id === id)
}
