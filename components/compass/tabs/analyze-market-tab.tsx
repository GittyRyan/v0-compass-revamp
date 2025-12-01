"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sparkles, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

const marketSegments = [
  {
    id: 1,
    name: "Custom Computer Programming Services",
    industry: "Technology",
    targetSize: "Mid-Market",
    score: 92,
    recommended: true,
  },
  {
    id: 2,
    name: "Financial Technology Solutions",
    industry: "Financial Services",
    targetSize: "Enterprise",
    score: 87,
    recommended: true,
  },
  {
    id: 3,
    name: "Healthcare IT Services",
    industry: "Healthcare",
    targetSize: "Mid-Market",
    score: 78,
    recommended: false,
  },
  {
    id: 4,
    name: "Retail & E-commerce Platforms",
    industry: "Retail",
    targetSize: "SMB",
    score: 72,
    recommended: false,
  },
]

const segmentDetails = {
  swot: {
    strengths: [
      "High technology adoption rates in target segment",
      "Strong demand for automation solutions",
      "Decision-makers accessible through digital channels",
    ],
    weaknesses: [
      "Highly competitive market with established players",
      "Price sensitivity in current economic climate",
      "Complex procurement processes",
    ],
    opportunities: [
      "Digital transformation initiatives driving investment",
      "AI integration becoming a key differentiator",
      "Consolidation creating partnership opportunities",
    ],
    threats: [
      "Economic uncertainty affecting IT budgets",
      "Rapid technology changes requiring continuous adaptation",
      "New entrants with disruptive pricing models",
    ],
  },
  takeaways: {
    mainInsight: "Why This Segment Is Attractive",
    offerings: [
      "AI-powered CRM with predictive analytics",
      "Sales automation platform with native integrations",
      "Custom implementation services",
    ],
    painPoints: [
      "Difficulty coordinating multi-channel campaigns",
      "Limited visibility into sales pipeline",
      "Manual data entry reducing productivity",
    ],
    goals: ["Increase lead quality by 25%", "Improve sales team productivity", "Scale outbound motions efficiently"],
    recommendedMotion: "Outbound ABM",
  },
}

const swotColors = {
  strengths: "bg-green-50 border-green-200",
  weaknesses: "bg-red-50 border-red-200",
  opportunities: "bg-blue-50 border-blue-200",
  threats: "bg-amber-50 border-amber-200",
}

const swotTextColors = {
  strengths: "text-green-700",
  weaknesses: "text-red-700",
  opportunities: "text-blue-700",
  threats: "text-amber-700",
}

export function AnalyzeMarketTab() {
  const [selectedSegment, setSelectedSegment] = useState(marketSegments[0])

  return (
    <div className="space-y-6">
      {/* Market Segments - Horizontal Scroll */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Market Segments</h3>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {marketSegments.map((segment) => (
            <Card
              key={segment.id}
              className={cn(
                "min-w-[280px] cursor-pointer transition-all hover:shadow-md",
                selectedSegment.id === segment.id && "ring-2 ring-primary",
              )}
              onClick={() => setSelectedSegment(segment)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-semibold text-foreground text-sm leading-tight max-w-[180px]">{segment.name}</h4>
                  {segment.recommended && (
                    <Badge className="bg-primary/10 text-primary text-xs shrink-0">
                      <Sparkles className="mr-1 h-3 w-3" />
                      AI Pick
                    </Badge>
                  )}
                </div>
                <div className="space-y-2 mb-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">AI Score</span>
                    <span className="font-semibold text-primary">{segment.score}/100</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Industry</span>
                    <span className="font-medium">{segment.industry}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Target Size</span>
                    <span className="font-medium">{segment.targetSize}</span>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="w-full text-xs">
                  View Detail
                  <ChevronRight className="ml-1 h-3 w-3" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Detailed Analysis */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* SWOT Analysis */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
            SWOT Analysis - {selectedSegment.name}
          </h3>
          <div className="grid gap-4 grid-cols-2">
            {(Object.keys(segmentDetails.swot) as Array<keyof typeof segmentDetails.swot>).map((key) => (
              <Card key={key} className={cn("border", swotColors[key])}>
                <CardHeader className="py-3 px-4">
                  <CardTitle className={cn("text-sm capitalize", swotTextColors[key])}>{key}</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 pt-0">
                  <ul className="space-y-2">
                    {segmentDetails.swot[key].map((item, index) => (
                      <li key={index} className="text-xs text-foreground flex items-start gap-2">
                        <span
                          className={cn(
                            "mt-1.5 h-1.5 w-1.5 rounded-full shrink-0",
                            swotTextColors[key].replace("text-", "bg-"),
                          )}
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Key Takeaways */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Key Takeaways</h3>
          <Card>
            <CardContent className="p-5 space-y-4">
              <div>
                <h4 className="font-semibold text-foreground mb-2">{segmentDetails.takeaways.mainInsight}</h4>
                <p className="text-sm text-muted-foreground">
                  This segment shows strong alignment with your product capabilities and demonstrates high growth
                  potential with accessible decision-makers.
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Primary Offering Recommendations</p>
                <ul className="space-y-1.5">
                  {segmentDetails.takeaways.offerings.map((offering, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {offering}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Relevant Pain Points</p>
                <ul className="space-y-1.5">
                  {segmentDetails.takeaways.painPoints.map((pain, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                      {pain}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Goals</p>
                <ul className="space-y-1.5">
                  {segmentDetails.takeaways.goals.map((goal, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                      {goal}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 border-t">
                <Badge variant="secondary" className="text-xs">
                  Recommended: {segmentDetails.takeaways.recommendedMotion}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* AI Recommendation Banner */}
      {selectedSegment.recommended && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="font-medium text-foreground">AI Recommended Market Segment</span>
            </div>
            <Button size="sm">
              View Implementation Plan
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
