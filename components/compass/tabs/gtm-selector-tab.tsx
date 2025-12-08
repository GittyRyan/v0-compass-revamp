"use client"

import { useState, useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
} from "@/lib/gtm-scoring"
import { buildWhyRecommendation } from "@/lib/gtm-explanation"
import {
  Bookmark,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Zap,
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
}

const savedPlans = [
  { id: 1, name: "Q1 Enterprise Push", date: "Dec 15, 2024", motion: "Outbound ABM" },
  { id: 2, name: "SMB Expansion", date: "Dec 10, 2024", motion: "Product-Led Growth" },
  { id: 3, name: "Healthcare Vertical", date: "Dec 5, 2024", motion: "Vertical-Specific" },
]

export function GTMSelectorTab() {
  const [companySize, setCompanySize] = useState("mid-market")
  const [region, setRegion] = useState("north-america")
  const [industry, setIndustry] = useState("saas-tech")
  const [primaryObjective, setPrimaryObjective] = useState("")
  const [timeHorizon, setTimeHorizon] = useState("6")
  const [acvBand, setAcvBand] = useState("")
  const [primaryOffering, setPrimaryOffering] = useState("")
  const [targetPersonas, setTargetPersonas] = useState("VP Sales, CRO")

  const [selectedMotion, setSelectedMotion] = useState<MotionId | null>(null)
  const [expandedCard, setExpandedCard] = useState<MotionId | null>(null)

  // Build selector inputs for scoring
  const selectorInputs: SelectorInputs = {
    companySize: mapCompanySizeToScoring(companySize),
    primaryObjective: mapObjectiveToScoring(primaryObjective),
    acvBand: mapAcvToScoring(acvBand),
    personas: targetPersonas
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean),
    timeHorizonMonths: mapTimeHorizonToScoring(timeHorizon),
  }

  // Compute scores for all motions
  const motionScores = scoreAllMotions(selectorInputs)

  const motionExplainers = MOTION_CONFIGS.reduce(
    (acc, motion) => {
      const scores = motionScores.find((s) => s.motionId === motion.id)
      if (scores) {
        acc[motion.id] = buildWhyRecommendation(motion, scores, selectorInputs)
      }
      return acc
    },
    {} as Record<string, string[]>,
  )

  const motionScoreById = useMemo(() => {
    return Object.fromEntries(motionScores.map((m) => [m.motionId, m]))
  }, [motionScores])

  const selectedMotionData = selectedMotion
    ? {
        ...motionScoreById[selectedMotion],
        ...motionMetadata[selectedMotion],
      }
    : null

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

          {/* Company Profile */}
          <Collapsible defaultOpen>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer py-3 px-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      Company Profile
                    </CardTitle>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0 pb-4 px-4 space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Company Size</Label>
                    <Select value={companySize} onValueChange={setCompanySize}>
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="smb">SMB (1-100)</SelectItem>
                        <SelectItem value="mid-market">Mid-Market (101-1000)</SelectItem>
                        <SelectItem value="enterprise">Enterprise (1000+)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Region</Label>
                    <Select value={region} onValueChange={setRegion}>
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="north-america">North America</SelectItem>
                        <SelectItem value="europe">Europe</SelectItem>
                        <SelectItem value="apac">APAC</SelectItem>
                        <SelectItem value="latam">LATAM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Industry</Label>
                    <Select value={industry} onValueChange={setIndustry}>
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="saas-tech">SaaS / Technology</SelectItem>
                        <SelectItem value="financial">Financial Services</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="manufacturing">Manufacturing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* ICP Snapshot */}
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
                <CardContent className="p-4">
                  <div className="rounded-lg bg-accent/50 p-3 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Primary Persona</span>
                      <span className="font-medium text-foreground">VP of Sales</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Buying Committee</span>
                      <span className="font-medium text-foreground">3-5 stakeholders</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Decision Timeline</span>
                      <span className="font-medium text-foreground">60-90 days</span>
                    </div>
                  </div>
                  <Button variant="link" className="h-auto p-0 mt-2 text-xs text-primary">
                    Edit in ICP Builder <ChevronRight className="ml-1 h-3 w-3" />
                  </Button>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* GTM Goals & Offering */}
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
                      <SelectTrigger className="h-8 text-sm">
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
                    <div className="flex gap-1">
                      {["3", "6", "9", "12"].map((months) => (
                        <button
                          key={months}
                          onClick={() => setTimeHorizon(months)}
                          className={cn(
                            "flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
                            timeHorizon === months
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                          )}
                        >
                          {months}mo
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Annual Deal Size (GTM Goal) *</Label>
                    <Select value={acvBand} onValueChange={setAcvBand}>
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue placeholder="Select band" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="smb">$5K - $25K (SMB)</SelectItem>
                        <SelectItem value="mid-market">$25K - $100K (Mid-Market)</SelectItem>
                        <SelectItem value="enterprise">$100K - $500K (Enterprise)</SelectItem>
                        <SelectItem value="strategic">$500K+ (Strategic)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Primary Offering *</Label>
                    <Input
                      className="h-8 text-sm"
                      placeholder="Enter offering for this GTM strategy"
                      value={primaryOffering}
                      onChange={(e) => setPrimaryOffering(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Target Personas</Label>
                    <Input
                      className="h-8 text-sm"
                      placeholder="Enter target personas"
                      value={targetPersonas}
                      onChange={(e) => setTargetPersonas(e.target.value)}
                    />
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

          {/* GTM Motion Cards */}
          <div className="space-y-4">
            {motionScores.map((score) => {
              const metadata = motionMetadata[score.motionId]
              return (
                <Card
                  key={score.motionId}
                  className={cn("transition-all", selectedMotion === score.motionId && "ring-2 ring-primary")}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                          {metadata.id}
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
                          score.matchPercent >= 90
                            ? "bg-green-100 text-green-700"
                            : score.matchPercent >= 80
                              ? "bg-blue-100 text-blue-700"
                              : "bg-amber-100 text-amber-700",
                        )}
                      >
                        {score.matchPercent}% Match
                      </Badge>
                    </div>

                    <div className="mb-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="w-14 text-xs text-muted-foreground">Effort</span>
                        <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full transition-all duration-300"
                            style={{ width: `${score.effort}%` }}
                          />
                        </div>
                        <span className="w-8 text-xs text-muted-foreground text-right">{score.effort}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-14 text-xs text-muted-foreground">Impact</span>
                        <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                          <div
                            className="h-full bg-green-500 rounded-full transition-all duration-300"
                            style={{ width: `${score.impact}%` }}
                          />
                        </div>
                        <span className="w-8 text-xs text-muted-foreground text-right">{score.impact}%</span>
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
                      open={expandedCard === score.motionId}
                      onOpenChange={() => setExpandedCard(expandedCard === score.motionId ? null : score.motionId)}
                    >
                      <CollapsibleTrigger asChild>
                        <Button variant="link" className="h-auto p-0 text-xs text-primary mb-3">
                          Why this recommendation?
                          <ChevronDown
                            className={cn(
                              "ml-1 h-3 w-3 transition-transform",
                              expandedCard === score.motionId && "rotate-180",
                            )}
                          />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="rounded-lg bg-accent/50 p-3 mb-3 text-sm text-foreground">
                          <ul className="space-y-2 mb-3">
                            {(motionExplainers[score.motionId] ?? []).map((reason, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                                <span>{reason}</span>
                              </li>
                            ))}
                          </ul>
                          <div className="grid grid-cols-2 gap-2 text-xs border-t pt-2 mt-2">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Objective Fit:</span>
                              <span className="font-medium">{score.objectiveFit}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Size Fit:</span>
                              <span className="font-medium">{score.sizeFit}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">ACV Fit:</span>
                              <span className="font-medium">{score.acvFit}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Persona Fit:</span>
                              <span className="font-medium">{score.personaFit}%</span>
                            </div>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>

                    <Button
                      className="w-full"
                      variant={selectedMotion === score.motionId ? "secondary" : "default"}
                      onClick={() => setSelectedMotion(score.motionId)}
                    >
                      {selectedMotion === score.motionId ? (
                        <>
                          <Check className="mr-2 h-4 w-4" /> Motion Selected
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

        {/* Right Column - Selected Path & Saved Plans */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Bookmark className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">Selected GTM Path</h3>
          </div>

          {/* Selected Motion Summary */}
          <Card>
            <CardContent className="p-4">
              {selectedMotionData ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                      {selectedMotionData.id}
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{selectedMotionData.name}</h4>
                      <p className="text-sm text-muted-foreground">Selected Motion</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-3 rounded-lg bg-accent/50">
                      <p className="text-2xl font-bold text-primary">{selectedMotionData.matchPercent}%</p>
                      <p className="text-xs text-muted-foreground">Match</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-accent/50">
                      <p className="text-2xl font-bold text-amber-600">{selectedMotionData.effort}%</p>
                      <p className="text-xs text-muted-foreground">Effort</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-accent/50">
                      <p className="text-2xl font-bold text-green-600">{selectedMotionData.impact}%</p>
                      <p className="text-xs text-muted-foreground">Impact</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Predicted Outcomes</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="text-xs">
                        +12% ACV
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        -15% Sales Cycle
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Timeline</p>
                    <div className="flex gap-1">
                      {["3", "6", "9", "12"].map((months) => (
                        <button
                          key={months}
                          onClick={() => setTimeHorizon(months)}
                          className={cn(
                            "flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
                            timeHorizon === months
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                          )}
                        >
                          {months}mo
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <Button className="w-full">
                      <Zap className="mr-2 h-4 w-4" />
                      Generate GTM Plan
                    </Button>
                    <Button variant="outline" className="w-full bg-transparent">
                      <Bookmark className="mr-2 h-4 w-4" />
                      Save This Configuration
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Select a GTM motion to see details</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Saved Plans */}
          <Card>
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Saved Plans
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 pb-4 px-4">
              <div className="space-y-2">
                {savedPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{plan.name}</p>
                      <p className="text-xs text-muted-foreground">{plan.motion}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{plan.date}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
