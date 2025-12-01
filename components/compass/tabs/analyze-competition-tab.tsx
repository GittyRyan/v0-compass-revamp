"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Check, X } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

const competitors = [
  {
    id: 1,
    name: "Salesforce",
    tag: "Leader",
    targetSize: "Enterprise",
    revenue: "$26.5B",
    marketShare: 23.8,
    overview:
      "Global leader in CRM with comprehensive cloud-based enterprise solutions covering sales, service, marketing, and commerce.",
    positioning: "Enterprise-first, all-in-one platform",
    pricing: "Premium pricing with extensive customization",
    offerings: ["Sales Cloud", "Service Cloud", "Marketing Cloud", "Commerce Cloud", "Platform"],
    strengths: ["Brand recognition", "Extensive ecosystem", "Enterprise features", "Global support"],
    weaknesses: ["Complex implementation", "High total cost", "Steep learning curve"],
  },
  {
    id: 2,
    name: "HubSpot",
    tag: "Challenger",
    targetSize: "SMB / Mid-Market",
    revenue: "$1.7B",
    marketShare: 12.4,
    overview:
      "Inbound marketing pioneer offering integrated CRM, marketing, sales, and service software with freemium model.",
    positioning: "User-friendly, inbound-first approach",
    pricing: "Freemium with tiered paid plans",
    offerings: ["Marketing Hub", "Sales Hub", "Service Hub", "CMS Hub", "Operations Hub"],
    strengths: ["Ease of use", "Freemium model", "Strong content", "Growing ecosystem"],
    weaknesses: ["Enterprise limitations", "Add-on costs", "Customization limits"],
  },
  {
    id: 3,
    name: "Microsoft Dynamics",
    tag: "Leader",
    targetSize: "Enterprise",
    revenue: "$5.4B",
    marketShare: 18.2,
    overview:
      "Microsoft's business applications suite leveraging deep integration with Office 365 and Azure cloud services.",
    positioning: "Microsoft ecosystem integration",
    pricing: "Competitive enterprise pricing",
    offerings: ["Sales", "Customer Service", "Field Service", "Marketing", "Finance"],
    strengths: ["Microsoft integration", "Azure backbone", "Enterprise features", "AI capabilities"],
    weaknesses: ["Complex licensing", "Implementation challenges", "UX concerns"],
  },
]

const marketShareData = [
  { name: "Salesforce", value: 23.8, color: "#6366f1" },
  { name: "Microsoft", value: 18.2, color: "#8b5cf6" },
  { name: "HubSpot", value: 12.4, color: "#a855f7" },
  { name: "Oracle", value: 9.6, color: "#c084fc" },
  { name: "SAP", value: 8.1, color: "#d8b4fe" },
  { name: "Others", value: 27.9, color: "#e9d5ff" },
]

export function AnalyzeCompetitionTab() {
  const [currentPage, setCurrentPage] = useState(0)
  const competitorsPerPage = 2
  const totalPages = Math.ceil(competitors.length / competitorsPerPage)

  const visibleCompetitors = competitors.slice(currentPage * competitorsPerPage, (currentPage + 1) * competitorsPerPage)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Competitive Analysis</h3>
          <p className="text-sm text-muted-foreground mt-1">Segment: Custom Computer Programming Services</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage + 1} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
            disabled={currentPage === totalPages - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Competitor Cards */}
        <div className="lg:col-span-2 space-y-4">
          {visibleCompetitors.map((competitor) => (
            <Card key={competitor.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{competitor.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={competitor.tag === "Leader" ? "default" : "secondary"} className="text-xs">
                        {competitor.tag}
                      </Badge>
                      <span className="text-xs text-muted-foreground">Target: {competitor.targetSize}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Key Metrics */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="rounded-lg bg-accent/50 p-3 text-center">
                    <p className="text-xs text-muted-foreground">Revenue</p>
                    <p className="font-semibold text-foreground">{competitor.revenue}</p>
                  </div>
                  <div className="rounded-lg bg-accent/50 p-3 text-center">
                    <p className="text-xs text-muted-foreground">Market Share</p>
                    <p className="font-semibold text-foreground">{competitor.marketShare}%</p>
                  </div>
                  <div className="rounded-lg bg-accent/50 p-3 text-center">
                    <p className="text-xs text-muted-foreground">Position</p>
                    <p className="font-semibold text-foreground">{competitor.tag}</p>
                  </div>
                </div>

                {/* Overview */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Business Overview</p>
                  <p className="text-sm text-foreground">{competitor.overview}</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Brand Positioning</p>
                    <p className="text-sm text-foreground">{competitor.positioning}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Pricing Strategy</p>
                    <p className="text-sm text-foreground">{competitor.pricing}</p>
                  </div>
                </div>

                {/* Offerings */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Key Offerings</p>
                  <div className="flex flex-wrap gap-1.5">
                    {competitor.offerings.map((offering) => (
                      <Badge key={offering} variant="secondary" className="text-xs">
                        {offering}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Strengths & Weaknesses */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Strengths & Advantages</p>
                    <ul className="space-y-1.5">
                      {competitor.strengths.map((strength, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                          <Check className="h-3.5 w-3.5 text-green-600 shrink-0" />
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Weaknesses & Disadvantages</p>
                    <ul className="space-y-1.5">
                      {competitor.weaknesses.map((weakness, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                          <X className="h-3.5 w-3.5 text-red-600 shrink-0" />
                          {weakness}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Market Share Chart */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-sm">Market Share Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={marketShareData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {marketShareData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [`${value}%`, "Market Share"]}
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(value) => <span className="text-xs text-foreground">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2">
                {marketShareData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-foreground">{item.name}</span>
                    </div>
                    <span className="font-medium text-foreground">{item.value}%</span>
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
