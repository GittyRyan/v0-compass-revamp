"use client"

import { useState, useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import {
  scoreAllMotions,
  MOTION_CONFIGS,
  mapObjectiveToScoring,
  mapAcvToScoring,
  mapCompanySizeToScoring,
  mapTimeHorizonToScoring,
  type SelectorInputs,
  type MotionId,
  type MotionScoreBreakdown,
} from "@/lib/gtm-scoring"
import { buildWhyRecommendation } from "@/lib/gtm-explanation"
import { GTM_MOTION_LIBRARY, type GtmMotion } from "@/lib/gtm-motions"
import {
  Bookmark,
  Check,
  ChevronDown,
  ChevronRight,
  Download,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
  BarChart3,
  Clock,
  Settings2,
  Building2,
  SlidersHorizontal,
} from "lucide-react"

const motionMetadata: Record<
  MotionId,
  {
    id: number
    drivers: string[]
    socialProof: string
  }
> = {
  outbound_abm: {
    id: 1,
    drivers: [
      "Strong alignment with enterprise ICP targeting",
      "High-intent signals detected in target accounts",
      "Proven success pattern in your vertical",
    ],
    socialProof: "~72% of market leaders in your vertical use this motion.",
  },
  plg: {
    id: 2,
    drivers: [
      "Low friction adoption path for SMB segment",
      "Strong product-market fit indicators",
      "Viral coefficient potential identified",
    ],
    socialProof: "~67% of high-growth SaaS companies leverage PLG.",
  },
  vertical_motion: {
    id: 3,
    drivers: [
      "Deep expertise in Financial Services sector",
      "Regulatory compliance as differentiator",
      "Strong case study evidence",
    ],
    socialProof: "~58% of successful vertical plays show 2x faster sales cycles.",
  },
  inbound_engine: {
    id: 4,
    drivers: [
      "Scalable demand capture infrastructure",
      "Content-driven lead generation",
      "Marketing automation leverage",
    ],
    socialProof: "~61% of B2B SaaS companies rely on inbound as primary demand source.",
  },
  customer_expansion: {
    id: 5,
    drivers: [
      "Existing customer relationships as foundation",
      "Usage data signals expansion opportunities",
      "Lower CAC than new logo acquisition",
    ],
    socialProof: "~85% of revenue for mature SaaS comes from expansion.",
  },
}

const expectedOutcomesByMotionId: Record<MotionId, string[]> = {
  outbound_abm: ["+18% SQL Volume", "+12% ACV", "-15% Sales Cycle"],
  plg: ["+25% Sign-ups", "+15% PQL-to-SQL", "-10% CAC"],
  vertical_motion: ["+20% Win Rate", "+15% Deal Size", "-12% Sales Cycle"],
  inbound_engine: ["+30% Inbound MQLs", "+20% Organic Traffic", "-8% CAC"],
  customer_expansion: ["+10% NRR", "+18% Expansion Revenue", "-15% Churn"],
}

const planPreviewByMotionId: Record<MotionId, string[]> = {
  outbound_abm: [
    "0–30 days: Define ICP and build target account list",
    "31–60 days: Launch 2–3 outbound sequences across email and LinkedIn",
    "61–90 days: Optimize messaging and expand to lookalike accounts",
  ],
  plg: [
    "0–30 days: Optimize signup flow and onboarding experience",
    "31–60 days: Implement in-product growth loops and referral mechanics",
    "61–90 days: Launch self-serve upgrade paths and usage-based triggers",
  ],
  vertical_motion: [
    "0–30 days: Map vertical-specific pain points and compliance requirements",
    "31–60 days: Develop tailored messaging and case studies for the vertical",
    "61–90 days: Engage vertical-specific channels and events",
  ],
  inbound_engine: [
    "0–30 days: Audit content gaps and SEO opportunities",
    "31–60 days: Launch content production and distribution campaigns",
    "61–90 days: Optimize conversion paths and lead nurture sequences",
  ],
  customer_expansion: [
    "0–30 days: Identify expansion signals from usage data",
    "31–60 days: Launch targeted upsell and cross-sell campaigns",
    "61–90 days: Implement customer success playbooks for retention",
  ],
}

const planSummaryByMotionId: Record<MotionId, string> = {
  outbound_abm:
    "this plan focuses on 200–300 target accounts, multi-threaded into VP Sales/CRO with outbound email and LinkedIn as primary channels.",
  plg: "this plan emphasizes product-led acquisition with self-serve onboarding, viral loops, and usage-based conversion triggers.",
  vertical_motion:
    "this plan targets deep vertical penetration with tailored messaging, compliance positioning, and industry-specific case studies.",
  inbound_engine:
    "this plan builds scalable demand capture through content marketing, SEO optimization, and automated lead nurturing.",
  customer_expansion:
    "this plan maximizes existing customer value through usage-based expansion signals, proactive outreach, and retention playbooks.",
}

const motionLibraryById: Record<MotionId, GtmMotion> = Object.fromEntries(
  GTM_MOTION_LIBRARY.map((m) => [m.id, m]),
) as Record<MotionId, GtmMotion>

const savedPlans = [
  { id: 1, name: "Q1 Enterprise Push", date: "Dec 15, 2024", motion: "Outbound ABM", isActive: true },
  { id: 2, name: "SMB Expansion", date: "Dec 10, 2024", motion: "Product-Led Growth", isActive: false },
  { id: 3, name: "Healthcare Vertical", date: "Dec 5, 2024", motion: "Vertical-Specific", isActive: false },
]

const TOP_N_MOTIONS = 3

export function GTMSelectorTab() {
  // Company Profile
  const [companySize, setCompanySize] = useState("mid-market")
  const [region, setRegion] = useState("north-america")
  const [industry, setIndustry] = useState("saas-tech")

  // ICP Snapshot
  const [targetIndustry, setTargetIndustry] = useState("")
  const [targetCompanySize, setTargetCompanySize] = useState("")
  const [targetDepartments, setTargetDepartments] = useState<string[]>([])
  const [targetPersonas, setTargetPersonas] = useState("")

  // GTM Goals & Offering
  const [primaryObjective, setPrimaryObjective] = useState("")
  const [timeHorizon, setTimeHorizon] = useState("6")
  const [acvBand, setAcvBand] = useState("")
  const [primaryOffering, setPrimaryOffering] = useState("")

  // Optional Enhancers
  const [targetBuyerStage, setTargetBuyerStage] = useState("")
  const [brandVoice, setBrandVoice] = useState("")

  const [selectedMotion, setSelectedMotion] = useState<MotionId | null>(null)
  // Execution mode changed to guided/autonomous
  const [executionMode, setExecutionMode] = useState<"guided" | "autonomous">("guided")
  // New state to manage collapsible sections in the right-hand panel
  const [showWhyExpanded, setShowWhyExpanded] = useState<Record<string, boolean>>({})

  const clampPercent = (value?: number) => Math.min(100, Math.max(0, value ?? 0))

  const parsePersonas = (raw: string) =>
    raw
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean)

  const selectorInputs: SelectorInputs = useMemo(
    () => ({
      companySize: mapCompanySizeToScoring(companySize),
      primaryObjective: mapObjectiveToScoring(primaryObjective),
      acvBand: mapAcvToScoring(acvBand),
      personas: parsePersonas(targetPersonas),
      timeHorizonMonths: mapTimeHorizonToScoring(timeHorizon),
      // that are not part of the SelectorInputs interface and are not used by scoreAllMotions()
    }),
    [acvBand, companySize, primaryObjective, targetPersonas, timeHorizon],
  )

  const motionScores = useMemo(() => scoreAllMotions(selectorInputs), [selectorInputs])

  const sortedScores = useMemo(() => {
    return [...motionScores].sort((a, b) => b.matchPercent - a.matchPercent)
  }, [motionScores])

  const recommendedScores = useMemo(() => {
    return sortedScores.slice(0, TOP_N_MOTIONS)
  }, [sortedScores])

  const scoresById = useMemo(() => {
    return Object.fromEntries(motionScores.map((m) => [m.motionId, m])) as Record<MotionId, MotionScoreBreakdown>
  }, [motionScores])

  const explainersById = useMemo(() => {
    return MOTION_CONFIGS.reduce(
      (acc, motion) => {
        const scores = scoresById[motion.id]
        if (scores) {
          acc[motion.id] = buildWhyRecommendation(motion, scores, selectorInputs)
        }
        return acc
      },
      {} as Record<MotionId, string[]>,
    )
  }, [scoresById, selectorInputs])

  const selectedMotionScores = selectedMotion ? scoresById[selectedMotion] : undefined

  const selectedMotionData =
    selectedMotion && selectedMotionScores
      ? {
          ...selectedMotionScores,
          ...motionMetadata[selectedMotion],
        }
      : null

  // Department options for multi-select
  const departmentOptions = [
    "Sales",
    "Marketing",
    "RevOps",
    "Customer Success",
    "Product",
    "Engineering",
    "Finance",
    "IT",
  ]

  // Function to toggle department selection
  const toggleDepartment = (dept: string) => {
    setTargetDepartments((prev) => (prev.includes(dept) ? prev.filter((d) => d !== dept) : [...prev, dept]))
  }

  return (
    <div className="space-y-8">
      {/* Three Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Inputs */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">Inputs</h3>
          </div>

          <Collapsible defaultOpen>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer py-3 px-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-primary" />
                      Company Profile
                    </CardTitle>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0 pb-4 px-4 space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Industry</Label>
                    <Select value={industry} onValueChange={setIndustry}>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="saas-tech">SaaS / Technology</SelectItem>
                        <SelectItem value="financial-services">Financial Services</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="manufacturing">Manufacturing</SelectItem>
                        <SelectItem value="retail">Retail / E-commerce</SelectItem>
                        <SelectItem value="professional-services">Professional Services</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Company Size</Label>
                    <Select value={companySize} onValueChange={setCompanySize}>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="smb">SMB (1-100)</SelectItem>
                        <SelectItem value="mid-market">Mid-Market (101-1000)</SelectItem>
                        <SelectItem value="enterprise">Enterprise (1000+)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Region / Target Geography</Label>
                    <Select value={region} onValueChange={setRegion}>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="Select region" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="north-america">North America</SelectItem>
                        <SelectItem value="emea">EMEA</SelectItem>
                        <SelectItem value="apac">APAC</SelectItem>
                        <SelectItem value="latam">LATAM</SelectItem>
                        <SelectItem value="global">Global</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          <Collapsible defaultOpen>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer py-3 px-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Target className="h-4 w-4 text-primary" />
                      ICP Snapshot
                    </CardTitle>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0 pb-4 px-4 space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Target Industry</Label>
                    <Select value={targetIndustry} onValueChange={setTargetIndustry}>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="Select target industry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="saas-tech">SaaS / Technology</SelectItem>
                        <SelectItem value="financial-services">Financial Services</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="manufacturing">Manufacturing</SelectItem>
                        <SelectItem value="retail">Retail / E-commerce</SelectItem>
                        <SelectItem value="professional-services">Professional Services</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Target Company Size</Label>
                    <Select value={targetCompanySize} onValueChange={setTargetCompanySize}>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="Select target size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="smb">SMB (1-100)</SelectItem>
                        <SelectItem value="mid-market">Mid-Market (101-1000)</SelectItem>
                        <SelectItem value="enterprise">Enterprise (1000+)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Target Departments</Label>
                    <div className="flex flex-wrap gap-1.5">
                      {departmentOptions.map((dept) => (
                        <Badge
                          key={dept}
                          variant={targetDepartments.includes(dept) ? "default" : "outline"}
                          className={cn(
                            "cursor-pointer text-xs transition-colors",
                            targetDepartments.includes(dept) ? "bg-primary text-primary-foreground" : "hover:bg-accent",
                          )}
                          onClick={() => toggleDepartment(dept)}
                        >
                          {dept}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Target Personas *</Label>
                    <Input
                      placeholder="e.g., VP Sales, CRO, RevOps"
                      className="h-9 text-sm"
                      value={targetPersonas}
                      onChange={(e) => setTargetPersonas(e.target.value)}
                    />
                    <p className="text-[10px] text-muted-foreground">Comma-separated list of personas</p>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          <Collapsible defaultOpen>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer py-3 px-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Zap className="h-4 w-4 text-primary" />
                      GTM Goals & Offering
                    </CardTitle>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0 pb-4 px-4 space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Primary GTM Objective *</Label>
                    <Select value={primaryObjective} onValueChange={setPrimaryObjective}>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="Select objective" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel className="font-semibold text-foreground">Marketing Objectives</SelectLabel>
                          <SelectItem value="generate-awareness" className="pl-4">
                            Generate Market Awareness
                          </SelectItem>
                          <SelectItem value="create-demand" className="pl-4">
                            Create Demand Pipeline
                          </SelectItem>
                          <SelectItem value="category-leadership" className="pl-4">
                            Position for Category Leadership
                          </SelectItem>
                          <SelectItem value="new-offering" className="pl-4">
                            Launch New Offering / Market Entry
                          </SelectItem>
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel className="font-semibold text-foreground">Sales Objectives</SelectLabel>
                          <SelectItem value="accelerate-pipeline" className="pl-4">
                            Accelerate Pipeline Conversion
                          </SelectItem>
                          <SelectItem value="expand-accounts" className="pl-4">
                            Expand Strategic Accounts
                          </SelectItem>
                          <SelectItem value="scale-revenue" className="pl-4">
                            Scale Revenue Operations
                          </SelectItem>
                          <SelectItem value="optimize-pricing" className="pl-4">
                            Optimize Pricing & Packaging Impact
                          </SelectItem>
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel className="font-semibold text-foreground">
                            Customer Success Objectives
                          </SelectLabel>
                          <SelectItem value="drive-adoption" className="pl-4">
                            Drive Adoption & Retention
                          </SelectItem>
                          <SelectItem value="customer-advocacy" className="pl-4">
                            Expand Customer Advocacy
                          </SelectItem>
                          <SelectItem value="increase-nrr" className="pl-4">
                            Increase Net Revenue Retention (NRR)
                          </SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Time Horizon</Label>
                    <div className="flex rounded-lg border border-input bg-background p-0.5">
                      {["3", "6", "9", "12"].map((months) => (
                        <button
                          key={months}
                          type="button"
                          onClick={() => setTimeHorizon(months)}
                          className={cn(
                            "flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
                            timeHorizon === months
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:text-foreground hover:bg-accent",
                          )}
                        >
                          {months}mo
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">ACV Band</Label>
                    <Select value={acvBand} onValueChange={setAcvBand}>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="Select ACV band" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low ({"<"}$25K)</SelectItem>
                        <SelectItem value="mid">Mid ($25K-$100K)</SelectItem>
                        <SelectItem value="high">High ({">"}$100K)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Primary Offering *</Label>
                    <Input
                      placeholder="Enter your primary offering"
                      className="h-9 text-sm"
                      value={primaryOffering}
                      onChange={(e) => setPrimaryOffering(e.target.value)}
                    />
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          <Collapsible>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer py-3 px-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Optional Enhancers</span>
                    </CardTitle>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0 pb-4 px-4 space-y-3">
                  <p className="text-[10px] text-muted-foreground mb-2">
                    These fields are optional and do not affect scoring.
                  </p>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Target Buyer Stage</Label>
                    <Select value={targetBuyerStage} onValueChange={setTargetBuyerStage}>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="Select buyer stage" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="awareness">Awareness</SelectItem>
                        <SelectItem value="consideration">Consideration</SelectItem>
                        <SelectItem value="decision">Decision</SelectItem>
                        <SelectItem value="retention">Retention</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Brand Voice</Label>
                    <Select value={brandVoice} onValueChange={setBrandVoice}>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="Select brand voice" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="conversational">Conversational</SelectItem>
                        <SelectItem value="technical">Technical</SelectItem>
                        <SelectItem value="bold">Bold / Disruptive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        </div>

        {/* Middle Column - GTM Motion Cards */}
        <div className="lg:col-span-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">Recommended GTM Motions</h3>
          </div>

          <div className="space-y-4">
            {recommendedScores.map((score, index) => {
              const metadata = motionMetadata[score.motionId]
              const libraryMotion = motionLibraryById[score.motionId]
              const reasons = explainersById[score.motionId] ?? []
              const effort = clampPercent(score.effort)
              const impact = clampPercent(score.impact)
              const matchPercent = clampPercent(score.matchPercent)
              const objectiveFit = clampPercent(score.objectiveFit)
              const sizeFit = clampPercent(score.sizeFit)
              const acvFit = clampPercent(score.acvFit)
              const personaFit = clampPercent(score.personaFit)

              if (!metadata) {
                return (
                  <Card key={score.motionId} className="transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">{score.name}</h4>
                          <p className="text-xs text-muted-foreground">Unable to compute recommendation.</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              }

              return (
                <Card
                  key={score.motionId}
                  className={cn("transition-all", selectedMotion === score.motionId && "ring-2 ring-primary")}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">{score.name}</h4>
                          {selectedMotion === score.motionId && (
                            <span className="inline-flex items-center gap-1 text-xs text-primary">
                              <Check className="h-3 w-3" /> Selected
                            </span>
                          )}
                        </div>
                      </div>
                      <Badge
                        className={cn(
                          "text-xs font-semibold",
                          matchPercent >= 90
                            ? "bg-green-100 text-green-700"
                            : matchPercent >= 80
                              ? "bg-blue-100 text-blue-700"
                              : "bg-amber-100 text-amber-700",
                        )}
                      >
                        {matchPercent}% Match
                      </Badge>
                    </div>

                    <div className="mb-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="w-14 text-xs text-muted-foreground">Effort</span>
                        <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full transition-all duration-300"
                            style={{ width: `${effort}%` }}
                          />
                        </div>
                        <span className="w-8 text-xs text-muted-foreground text-right">{effort}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-14 text-xs text-muted-foreground">Impact</span>
                        <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                          <div
                            className="h-full bg-green-500 rounded-full transition-all duration-300"
                            style={{ width: `${impact}%` }}
                          />
                        </div>
                        <span className="w-8 text-xs text-muted-foreground text-right">{impact}%</span>
                      </div>
                    </div>

                    {/* Key Drivers */}
                    <div className="mb-3">
                      <p className="text-xs font-medium text-muted-foreground mb-1.5">Key Drivers</p>
                      <ul className="space-y-1">
                        {metadata.drivers.map((driver, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                            <Sparkles className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                            {driver}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Social Proof */}
                    <p className="text-xs text-muted-foreground italic mb-3">{metadata.socialProof}</p>

                    {/* Expandable Reasoning */}
                    <Collapsible
                      open={showWhyExpanded[score.motionId] ?? false}
                      onOpenChange={(open) => setShowWhyExpanded((prev) => ({ ...prev, [score.motionId]: open }))}
                    >
                      <CollapsibleTrigger asChild>
                        <Button variant="link" className="h-auto p-0 text-xs text-primary mb-3">
                          Why this recommendation?
                          <ChevronDown
                            className={cn(
                              "ml-1 h-3 w-3 transition-transform",
                              showWhyExpanded[score.motionId] && "rotate-180",
                            )}
                          />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="rounded-lg bg-accent/50 p-3 mb-3 text-sm text-foreground">
                          <ul className="space-y-2 mb-3">
                            {reasons.map((reason, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <ChevronRight className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                                <span>{reason}</span>
                              </li>
                            ))}
                          </ul>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Objective Fit:</span>
                              <span className="font-medium">{objectiveFit}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Size Fit:</span>
                              <span className="font-medium">{sizeFit}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">ACV Fit:</span>
                              <span className="font-medium">{acvFit}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Persona Fit:</span>
                              <span className="font-medium">{personaFit}%</span>
                            </div>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>

                    {/* Select Button */}
                    <Button
                      variant={selectedMotion === score.motionId ? "default" : "outline"}
                      size="sm"
                      className="w-full"
                      onClick={() => setSelectedMotion(score.motionId)}
                    >
                      {selectedMotion === score.motionId ? (
                        <>
                          <Check className="mr-2 h-4 w-4" /> Selected
                        </>
                      ) : (
                        "Select This Motion"
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">Selected GTM Path</h3>
          </div>

          {selectedMotion && selectedMotionScores ? (
            <Card className="border-primary/50">
              <CardContent className="p-5 space-y-5">
                {/* 4.1 Header + Match Snapshot */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h4 className="font-semibold text-lg text-foreground">
                        {motionLibraryById[selectedMotion]?.name}
                      </h4>
                      <p className="text-xs text-muted-foreground">AI-selected GTM path for this plan</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-700 font-semibold">
                        {clampPercent(selectedMotionScores.matchPercent)}% Match
                      </Badge>
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                        <Check className="h-3.5 w-3.5 text-white" />
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{motionLibraryById[selectedMotion]?.description}</p>
                </div>

                {/* 4.2 Plan Context (Inputs Summary) */}
                <div className="space-y-2">
                  <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Plan Context</h5>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <div className="text-muted-foreground">Primary Industry</div>
                      <div className="text-foreground font-medium text-right">
                        {industry === "saas-tech"
                          ? "SaaS / Technology"
                          : industry === "financial-services"
                            ? "Financial Services"
                            : industry === "healthcare"
                              ? "Healthcare"
                              : industry === "manufacturing"
                                ? "Manufacturing"
                                : industry === "retail"
                                  ? "Retail / E-commerce"
                                  : industry === "professional-services"
                                    ? "Professional Services"
                                    : industry === "education"
                                      ? "Education"
                                      : industry}
                      </div>
                      <div className="text-muted-foreground">Company Size</div>
                      <div className="text-foreground font-medium text-right">
                        {companySize === "smb"
                          ? "SMB (1-100)"
                          : companySize === "mid-market"
                            ? "Mid-Market (101-1000)"
                            : companySize === "enterprise"
                              ? "Enterprise (1000+)"
                              : "—"}
                      </div>
                      <div className="text-muted-foreground">Target Industry</div>
                      <div className="text-foreground font-medium text-right">
                        {targetIndustry === "saas-tech"
                          ? "SaaS / Technology"
                          : targetIndustry === "financial-services"
                            ? "Financial Services"
                            : targetIndustry === "healthcare"
                              ? "Healthcare"
                              : targetIndustry === "manufacturing"
                                ? "Manufacturing"
                                : targetIndustry === "retail"
                                  ? "Retail / E-commerce"
                                  : targetIndustry === "professional-services"
                                    ? "Professional Services"
                                    : targetIndustry === "education"
                                      ? "Education"
                                      : targetIndustry || "—"}
                      </div>
                      <div className="text-muted-foreground">Target Company Size</div>
                      <div className="text-foreground font-medium text-right">
                        {targetCompanySize === "smb"
                          ? "SMB (1-100)"
                          : targetCompanySize === "mid-market"
                            ? "Mid-Market (101-1000)"
                            : targetCompanySize === "enterprise"
                              ? "Enterprise (1000+)"
                              : "—"}
                      </div>
                      <div className="text-muted-foreground">Target Departments</div>
                      <div
                        className="text-foreground font-medium text-right truncate"
                        title={targetDepartments.join(", ")}
                      >
                        {targetDepartments.length > 0 ? targetDepartments.join(", ") : "—"}
                      </div>
                      <div className="text-muted-foreground">Key Personas</div>
                      <div className="text-foreground font-medium text-right truncate" title={targetPersonas}>
                        {targetPersonas || "—"}
                      </div>
                      <div className="text-muted-foreground">Primary Objective</div>
                      <div className="text-foreground font-medium text-right truncate">
                        {primaryObjective
                          ? primaryObjective
                              .split("-")
                              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                              .join(" ")
                          : "—"}
                      </div>
                      <div className="text-muted-foreground">Region</div>
                      <div className="text-foreground font-medium text-right">
                        {region === "north-america"
                          ? "North America"
                          : region === "emea"
                            ? "EMEA"
                            : region === "apac"
                              ? "APAC"
                              : region === "latam"
                                ? "LATAM"
                                : region === "global"
                                  ? "Global"
                                  : region}
                      </div>
                      {acvBand && (
                        <>
                          <div className="text-muted-foreground">ACV Band</div>
                          <div className="text-foreground font-medium text-right">
                            {acvBand === "low" ? "< $25K" : acvBand === "mid" ? "$25K–$100K" : "> $100K"}
                          </div>
                        </>
                      )}
                      {targetBuyerStage && (
                        <>
                          <div className="text-muted-foreground">Target Buyer Stage</div>
                          <div className="text-foreground font-medium text-right capitalize">{targetBuyerStage}</div>
                        </>
                      )}
                      {brandVoice && (
                        <>
                          <div className="text-muted-foreground">Brand Voice</div>
                          <div className="text-foreground font-medium text-right capitalize">{brandVoice}</div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* 4.3 AI Fit & Rationale */}
                <div className="space-y-3">
                  <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Why this GTM path?
                  </h5>
                  <ul className="space-y-1.5">
                    {(explainersById[selectedMotion] ?? []).slice(0, 4).map((bullet, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                        <Sparkles className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Fit Breakdown */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Objective Fit</span>
                        <span className="font-medium">{clampPercent(selectedMotionScores.objectiveFit)}%</span>
                      </div>
                      <Progress value={clampPercent(selectedMotionScores.objectiveFit)} className="h-1.5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Size Fit</span>
                        <span className="font-medium">{clampPercent(selectedMotionScores.sizeFit)}%</span>
                      </div>
                      <Progress value={clampPercent(selectedMotionScores.sizeFit)} className="h-1.5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">ACV Fit</span>
                        <span className="font-medium">{clampPercent(selectedMotionScores.acvFit)}%</span>
                      </div>
                      <Progress value={clampPercent(selectedMotionScores.acvFit)} className="h-1.5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Persona Fit</span>
                        <span className="font-medium">{clampPercent(selectedMotionScores.personaFit)}%</span>
                      </div>
                      <Progress value={clampPercent(selectedMotionScores.personaFit)} className="h-1.5" />
                    </div>
                  </div>
                </div>

                {/* 4.4 Expected Outcomes */}
                <div className="space-y-2">
                  <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Expected Outcomes
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {(expectedOutcomesByMotionId[selectedMotion] ?? []).map((outcome, i) => (
                      <Badge
                        key={i}
                        variant="secondary"
                        className={cn(
                          "text-xs font-medium px-2.5 py-1",
                          outcome.startsWith("+") && "bg-green-50 text-green-700 border border-green-200",
                          outcome.startsWith("-") && "bg-blue-50 text-blue-700 border border-blue-200",
                        )}
                      >
                        <BarChart3 className="h-3 w-3 mr-1" />
                        {outcome}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground italic">
                    Estimates are directional and based on this GTM motion and timeline.
                  </p>
                </div>

                {/* 4.5 Timeline & Scenario Controls */}
                <div className="space-y-3">
                  <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Timeline & Execution
                  </h5>

                  {/* Timeline Selector */}
                  <div className="space-y-1.5">
                    <Label className="text-xs flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      Timeline
                    </Label>
                    <div className="flex rounded-lg border bg-muted/30 p-0.5">
                      {["3", "6", "9", "12"].map((months) => (
                        <button
                          key={months}
                          onClick={() => setTimeHorizon(months)}
                          className={cn(
                            "flex-1 text-xs font-medium py-1.5 px-2 rounded-md transition-colors",
                            timeHorizon === months
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "text-muted-foreground hover:text-foreground",
                          )}
                        >
                          {months}mo
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Execution Mode */}
                  <div className="space-y-1.5">
                    <Label className="text-xs flex items-center gap-1.5">
                      <Settings2 className="h-3.5 w-3.5" />
                      Execution Mode
                    </Label>
                    <div className="flex rounded-lg border bg-muted/30 p-0.5">
                      {(["guided", "autonomous"] as const).map((mode) => (
                        <button
                          key={mode}
                          onClick={() => setExecutionMode(mode)}
                          className={cn(
                            "flex-1 text-xs font-medium py-1.5 px-2 rounded-md transition-colors capitalize",
                            executionMode === mode
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "text-muted-foreground hover:text-foreground",
                          )}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 4.6 AI GTM Plan Preview */}
                <div className="space-y-2">
                  <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    AI GTM Plan Preview
                  </h5>
                  <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                    <ul className="space-y-1.5">
                      {(planPreviewByMotionId[selectedMotion] ?? []).map((milestone, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-foreground">
                          <ChevronRight className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                          <span>{milestone}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs text-muted-foreground pt-1 border-t border-border/50">
                      Over the next <span className="font-medium text-foreground">{timeHorizon} months</span> in{" "}
                      <span className="font-medium text-foreground capitalize">{executionMode}</span> mode,{" "}
                      {planSummaryByMotionId[selectedMotion]}
                    </p>
                  </div>
                </div>

                {/* 4.7 CTAs */}
                <div className="space-y-2 pt-2">
                  <Button className="w-full" size="sm">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate GTM Strategy
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    <Download className="mr-2 h-4 w-4" />
                    Export Summary
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* 5. Empty State */
            <Card className="border-dashed">
              <CardContent className="p-8 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted mx-auto mb-4">
                  <Target className="h-7 w-7 text-muted-foreground" />
                </div>
                <h4 className="font-medium text-foreground mb-1">No GTM motion selected</h4>
                <p className="text-sm text-muted-foreground">
                  Choose a recommended motion on the left to preview an AI-generated GTM plan summary.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <div className="mt-8 border-t pt-6">
        <div className="flex items-center gap-2 mb-4">
          <Bookmark className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Saved GTM Plans</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {savedPlans.map((plan) => (
            <Card key={plan.id} className="cursor-pointer hover:border-primary/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-foreground">{plan.name}</h4>
                    <p className="text-xs text-muted-foreground">{plan.motion}</p>
                  </div>
                  {plan.isActive && (
                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                      Active
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mb-3">{plan.date}</p>
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  Open Plan <ChevronRight className="ml-2 h-3 w-3" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
