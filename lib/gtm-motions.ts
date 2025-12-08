// lib/gtm-motions.ts

import type { CompanySize, GtmObjective, AcvBand, MotionId, MotionConfig } from "./gtm-scoring"

export type GtmMotionCategory = "acquisition" | "expansion" | "market_entry" | "retention"

export type GtmMotionMaturity = "emerging" | "standard" | "advanced"

export type GtmMotion = {
  id: MotionId
  name: string
  shortLabel: string // compact label for UI chips
  description: string // one-line explanation

  category: GtmMotionCategory
  maturityLevel: GtmMotionMaturity

  // Core knobs used by the scoring engine
  baseEffort: number // 0–100 baseline execution lift
  baseImpact: number // 0–100 baseline potential upside
  bestForSizes: CompanySize[]
  bestForObjectives: GtmObjective[]
  bestForAcv: AcvBand[]
  bestForPersonas: string[]

  // GTM-library metadata for richer UX
  typicalUseCases: string[] // bullets shown in details drawers, docs, etc.
  prerequisites: string[] // org/process prerequisites
  keyChannels: string[] // primary channels this motion leans on
  tags: string[] // free-form tags for search/filters
}

// -----------------------------------------------------------------------------
// Canonical GTM Motion Library
// -----------------------------------------------------------------------------

export const GTM_MOTION_LIBRARY: GtmMotion[] = [
  // 1. Outbound ABM
  {
    id: "outbound_abm",
    name: "Outbound ABM",
    shortLabel: "ABM",
    description: "Targeted, account-based outbound motion focused on high-value accounts.",
    category: "acquisition",
    maturityLevel: "advanced",

    baseEffort: 70,
    baseImpact: 85,
    bestForSizes: ["mid", "enterprise"],
    bestForObjectives: ["pipeline", "expansion"],
    bestForAcv: ["mid", "high"],
    bestForPersonas: ["VP Sales", "CRO", "RevOps"],

    typicalUseCases: [
      "Enterprise or upper mid-market SaaS with defined ICP and sales team",
      "New-logo acquisition in named strategic accounts",
      "Pipeline generation for high ACV / complex deals",
    ],
    prerequisites: [
      "Dedicated SDR/BDR or outbound sales capacity",
      "Clear ICP and target account list",
      "CRM and sales engagement tooling in place",
    ],
    keyChannels: ["Outbound email", "Sales calls", "LinkedIn outbound", "Events"],
    tags: ["ABM", "Outbound", "Enterprise", "Sales-led"],
  },

  // 2. Product-Led Growth
  {
    id: "plg",
    name: "Product-Led Growth",
    shortLabel: "PLG",
    description: "Self-serve, product-centric motion where usage drives acquisition and expansion.",
    category: "acquisition",
    maturityLevel: "standard",

    baseEffort: 65,
    baseImpact: 90,
    bestForSizes: ["smb", "mid"],
    bestForObjectives: ["pipeline", "awareness"],
    bestForAcv: ["low", "mid"],
    bestForPersonas: ["VP Product", "Growth", "Marketing"],

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

  // 3. Vertical-Specific Motion
  {
    id: "vertical_motion",
    name: "Vertical-Specific Motion",
    shortLabel: "Vertical",
    description: "Industry-focused GTM motion with tailored messaging, proof, and plays.",
    category: "market_entry",
    maturityLevel: "standard",

    baseEffort: 60,
    baseImpact: 80,
    bestForSizes: ["mid", "enterprise"],
    bestForObjectives: ["pipeline", "new_market"],
    bestForAcv: ["mid", "high"],
    bestForPersonas: ["VP Sales", "Industry GM"],

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
    keyChannels: [
      "Vertical events and conferences",
      "Partner / SI ecosystem",
      "Targeted outbound and ABM",
      "Vertical-specific content",
    ],
    tags: ["Vertical", "Segmented", "Market entry", "ABM-adjacent"],
  },

  // 4. Inbound Demand Engine
  {
    id: "inbound_engine",
    name: "Inbound Demand Engine",
    shortLabel: "Inbound",
    description: "Content- and performance-driven engine to attract and convert inbound demand.",
    category: "acquisition",
    maturityLevel: "standard",

    baseEffort: 55,
    baseImpact: 78,
    bestForSizes: ["smb", "mid"],
    bestForObjectives: ["pipeline", "awareness"],
    bestForAcv: ["low", "mid"],
    bestForPersonas: ["CMO", "VP Marketing", "Growth"],

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

  // 5. Customer Expansion
  {
    id: "customer_expansion",
    name: "Customer Expansion",
    shortLabel: "Expansion",
    description: "Land-and-expand motion focused on driving net revenue retention and upsell.",
    category: "expansion",
    maturityLevel: "advanced",

    baseEffort: 58,
    baseImpact: 88,
    bestForSizes: ["mid", "enterprise"],
    bestForObjectives: ["expansion"],
    bestForAcv: ["mid", "high"],
    bestForPersonas: ["CS Leader", "Account Manager", "CRO"],

    typicalUseCases: [
      "Growing NRR via cross-sell and upsell into existing accounts",
      "Monetizing usage expansion and feature adoption",
      "Formalizing CS → Sales handoffs around expansion opportunities",
    ],
    prerequisites: [
      "CS or AM function with customer coverage",
      "Usage data or health scores to surface expansion signals",
      "Clear upsell/cross-sell packaging and playbooks",
    ],
    keyChannels: ["Customer success", "In-product prompts", "Email", "QBRs"],
    tags: ["Expansion", "NRR", "Customer-led", "CS"],
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
}))
