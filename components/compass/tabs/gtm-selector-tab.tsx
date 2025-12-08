"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  ChevronDown,
  RefreshCw,
  Check,
  Star,
  MoreHorizontal,
  ArrowRight,
  Sparkles,
  Target,
  Users,
  Building2,
} from "lucide-react"
import { cn } from "@/lib/utils"

const gtmMotions = [
  {
    id: 1,
    name: "Outbound ABM",
    matchScore: 92,
    effort: 65,
    impact: 88,
    drivers: [
      "Strong alignment with enterprise ICP targeting",
      "High-intent signals detected in target accounts",
      "Proven success pattern in your vertical",
    ],
    socialProof: "~72% of market leaders in your vertical use this motion.",
  },
  {
    id: 2,
    name: "Product-Led Growth",
    matchScore: 87,
    effort: 45,
    impact: 76,
    drivers: [
      "Low friction adoption path for SMB segment",
      "Strong product-market fit indicators",
      "Viral coefficient potential identified",
    ],
    socialProof: "~67% of high-growth SaaS companies leverage PLG.",
  },
  {
    id: 3,
    name: "Vertical-Specific Motion",
    matchScore: 79,
    effort: 72,
    impact: 82,
    drivers: [
      "Deep expertise in Financial Services sector",
      "Regulatory compliance as differentiator",
      "Strong case study evidence",
    ],
    socialProof: "~58% of successful vertical plays show 2x faster sales cycles.",
  },
]

const savedPlans = [
  {
    id: 1,
    name: "Q1 SaaS Mid-Market Push",
    status: "Active",
    motion: "Outbound ABM",
    industry: "Technology",
    companySize: "Mid-Market",
    effort: 65,
    impact: 88,
    updated: "2 days ago",
    isActive: true,
  },
  {
    id: 2,
    name: "Enterprise Financial Services",
    status: "Draft",
    motion: "Vertical-Specific",
    industry: "Financial Services",
    companySize: "Enterprise",
    effort: 72,
    impact: 82,
    updated: "1 week ago",
    isActive: false,
  },
  {
    id: 3,
    name: "SMB PLG Expansion",
    status: "Archived",
    motion: "Product-Led Growth",
    industry: "SaaS",
    companySize: "SMB",
    effort: 45,
    impact: 76,
    updated: "3 weeks ago",
    isActive: false,
  },
]

export function GTMSelectorTab() {
  const [selectedMotion, setSelectedMotion] = useState<number | null>(null)
  const [expandedCard, setExpandedCard] = useState<number | null>(null)
  const [selectedTimeline, setSelectedTimeline] = useState("6")

  const selectedMotionData = gtmMotions.find((m) => m.id === selectedMotion)

  return (
    <div className="space-y-8">
      {/* Three Column Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Section A - Inputs Panel (Left Column) */}
        <div className="lg:col-span-3">
          <div className="sticky top-6 space-y-4">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Inputs</h3>

            {/* Company Profile */}
            <Collapsible defaultOpen>
              <Card>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer py-3 hover:bg-accent/50">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">Company Profile</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          60%
                        </Badge>
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-3 pt-0">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Company Name</Label>
                      <Input placeholder="Enter company name" className="h-8 text-sm" defaultValue="Acme Corp" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Industry</Label>
                      <Select defaultValue="technology">
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="technology">Technology</SelectItem>
                          <SelectItem value="financial">Financial Services</SelectItem>
                          <SelectItem value="healthcare">Healthcare</SelectItem>
                          <SelectItem value="retail">Retail</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Company Size</Label>
                      <Select defaultValue="mid-market">
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
                      <Select defaultValue="north-america">
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="north-america">North America</SelectItem>
                          <SelectItem value="europe">Europe</SelectItem>
                          <SelectItem value="apac">APAC</SelectItem>
                          <SelectItem value="global">Global</SelectItem>
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
                  <CardHeader className="cursor-pointer py-3 hover:bg-accent/50">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">ICP Snapshot</CardTitle>
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-3 pt-0">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-xs text-muted-foreground">Primary Industry</p>
                          <p className="font-medium">Technology / SaaS</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Users className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-xs text-muted-foreground">Company Size</p>
                          <p className="font-medium">101-1000 employees</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Target className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-xs text-muted-foreground">Key Personas</p>
                          <p className="font-medium">VP Sales, CRO, RevOps</p>
                        </div>
                      </div>
                    </div>
                    <Button variant="link" className="h-auto p-0 text-xs text-primary">
                      Refine ICP <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* GTM Goals */}
            <Collapsible defaultOpen>
              <Card>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer py-3 hover:bg-accent/50">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">GTM Goals</CardTitle>
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-3 pt-0">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Primary GTM Objective</Label>
                      <Select defaultValue="generate-awareness">
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue />
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
                            onClick={() => setSelectedTimeline(months)}
                            className={cn(
                              "flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
                              selectedTimeline === months
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                            )}
                          >
                            {months}mo
                          </button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          </div>
        </div>

        {/* Section B - AI Analysis & GTM Options (Center Column) */}
        <div className="lg:col-span-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                  AI Analysis & GTM Options
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">Recommended motions based on your ICP and goals.</p>
              </div>
              <Button variant="ghost" size="sm" className="text-xs">
                <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                Refresh AI Analysis
              </Button>
            </div>

            {/* GTM Motion Cards */}
            <div className="space-y-4">
              {gtmMotions.map((motion) => (
                <Card
                  key={motion.id}
                  className={cn("transition-all", selectedMotion === motion.id && "ring-2 ring-primary")}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                          {motion.id}
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">{motion.name}</h4>
                          {selectedMotion === motion.id && (
                            <span className="inline-flex items-center gap-1 text-xs text-primary">
                              <Check className="h-3 w-3" /> Selected
                            </span>
                          )}
                        </div>
                      </div>
                      <Badge
                        className={cn(
                          "text-xs font-semibold",
                          motion.matchScore >= 90
                            ? "bg-green-100 text-green-700"
                            : motion.matchScore >= 80
                              ? "bg-blue-100 text-blue-700"
                              : "bg-amber-100 text-amber-700",
                        )}
                      >
                        {motion.matchScore}% Match
                      </Badge>
                    </div>

                    {/* Effort/Impact Bars */}
                    <div className="mb-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="w-14 text-xs text-muted-foreground">Effort</span>
                        <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                          <div className="h-full bg-amber-500 rounded-full" style={{ width: `${motion.effort}%` }} />
                        </div>
                        <span className="w-8 text-xs text-muted-foreground text-right">{motion.effort}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-14 text-xs text-muted-foreground">Impact</span>
                        <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                          <div className="h-full bg-green-500 rounded-full" style={{ width: `${motion.impact}%` }} />
                        </div>
                        <span className="w-8 text-xs text-muted-foreground text-right">{motion.impact}%</span>
                      </div>
                    </div>

                    {/* Key Drivers */}
                    <div className="mb-3">
                      <p className="text-xs font-medium text-muted-foreground mb-1.5">Key Drivers</p>
                      <ul className="space-y-1">
                        {motion.drivers.map((driver, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                            <Sparkles className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                            {driver}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Social Proof */}
                    <p className="text-xs text-muted-foreground italic mb-3">{motion.socialProof}</p>

                    {/* Expandable Reasoning */}
                    <Collapsible
                      open={expandedCard === motion.id}
                      onOpenChange={() => setExpandedCard(expandedCard === motion.id ? null : motion.id)}
                    >
                      <CollapsibleTrigger asChild>
                        <Button variant="link" className="h-auto p-0 text-xs text-primary mb-3">
                          Why this recommendation?
                          <ChevronDown
                            className={cn(
                              "ml-1 h-3 w-3 transition-transform",
                              expandedCard === motion.id && "rotate-180",
                            )}
                          />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="rounded-lg bg-accent/50 p-3 mb-3 text-sm text-foreground">
                          <p>
                            Based on your ICP characteristics (Mid-Market SaaS in North America) and goal of
                            accelerating pipeline, this motion demonstrates strong alignment with successful patterns
                            we&apos;ve identified in similar organizations. The AI analysis considers 47 data points
                            including your competitive position, market dynamics, and historical conversion rates.
                          </p>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>

                    <Button
                      className="w-full"
                      variant={selectedMotion === motion.id ? "secondary" : "default"}
                      onClick={() => setSelectedMotion(motion.id)}
                    >
                      {selectedMotion === motion.id ? (
                        <>
                          <Check className="mr-2 h-4 w-4" /> Motion Selected
                        </>
                      ) : (
                        "Select This Motion"
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Section C - Selected GTM Strategy Summary (Right Column) */}
        <div className="lg:col-span-4">
          <div className="sticky top-6">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-4">Selected GTM Path</h3>
            <Card className="h-fit">
              <CardContent className="p-5">
                {!selectedMotionData ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
                      <Target className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="font-medium text-foreground">No GTM motion selected</p>
                    <p className="mt-1 text-sm text-muted-foreground max-w-[200px]">
                      Choose a recommended motion on the left to preview a strategy summary.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        <h4 className="font-semibold text-lg text-foreground">{selectedMotionData.name}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        A strategic approach combining targeted outreach with personalized account-based engagement to
                        maximize conversion rates.
                      </p>
                    </div>

                    <div className="space-y-3 rounded-lg bg-accent/50 p-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Primary Industry</span>
                        <span className="font-medium text-foreground">Technology / SaaS</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Company Size</span>
                        <span className="font-medium text-foreground">Mid-Market</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Key Personas</span>
                        <span className="font-medium text-foreground">VP Sales, CRO</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Primary Goal</span>
                        <span className="font-medium text-foreground">Accelerate Pipeline</span>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">Expected Outcomes</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="text-xs">
                          +18% SQL Volume
                        </Badge>
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
                            onClick={() => setSelectedTimeline(months)}
                            className={cn(
                              "flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
                              selectedTimeline === months
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
                        Generate GTM Strategy
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                      <Button variant="outline" className="w-full bg-transparent">
                        Export Summary
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Section D - Saved GTM Plans */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Saved GTM Plans</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {savedPlans.map((plan) => (
            <Card key={plan.id} className={cn(plan.isActive && "ring-2 ring-primary")}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-foreground">{plan.name}</h4>
                    <p className="text-xs text-muted-foreground">{plan.motion}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge
                      variant={plan.status === "Active" ? "default" : plan.status === "Draft" ? "secondary" : "outline"}
                      className="text-xs"
                    >
                      {plan.status}
                    </Badge>
                  </div>
                </div>

                <div className="mb-3 space-y-1 text-sm">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>{plan.industry}</span>
                    <span>{plan.companySize}</span>
                  </div>
                </div>

                {/* Mini Effort/Impact Bars */}
                <div className="mb-3 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-12 text-xs text-muted-foreground">Effort</span>
                    <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${plan.effort}%` }} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-12 text-xs text-muted-foreground">Impact</span>
                    <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: `${plan.impact}%` }} />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                  <span>Updated {plan.updated}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="flex-1 text-xs bg-transparent">
                    Open Plan
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Star
                      className={cn("h-4 w-4", plan.isActive ? "fill-primary text-primary" : "text-muted-foreground")}
                    />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
