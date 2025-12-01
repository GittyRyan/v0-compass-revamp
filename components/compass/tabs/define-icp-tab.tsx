"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sparkles, Info } from "lucide-react"
import { cn } from "@/lib/utils"

const aiSuggestedICP = {
  industries: [
    { name: "Technology / SaaS", score: 94 },
    { name: "Financial Services", score: 87 },
    { name: "Healthcare IT", score: 76 },
    { name: "Professional Services", score: 72 },
  ],
  companySizes: [
    { name: "Mid-Market (101-1000)", score: 91 },
    { name: "Enterprise (1000+)", score: 85 },
    { name: "SMB (1-100)", score: 68 },
  ],
  geographies: [
    { name: "North America", score: 93 },
    { name: "Western Europe", score: 84 },
    { name: "APAC", score: 71 },
  ],
  personas: [
    { name: "VP of Sales", score: 95 },
    { name: "Chief Revenue Officer", score: 92 },
    { name: "RevOps Manager", score: 88 },
    { name: "Sales Director", score: 82 },
  ],
  techStack: [
    { name: "Salesforce User", score: 89 },
    { name: "HubSpot User", score: 85 },
    { name: "Outreach/SalesLoft", score: 78 },
  ],
  painPoints: [
    { name: "Manual data entry", score: 91 },
    { name: "Low pipeline visibility", score: 88 },
    { name: "Inefficient lead routing", score: 84 },
    { name: "Disconnected tools", score: 79 },
  ],
  goals: [
    { name: "Increase sales productivity", score: 93 },
    { name: "Improve forecast accuracy", score: 87 },
    { name: "Accelerate deal velocity", score: 84 },
  ],
}

const dimensions = [
  { id: "industries", label: "Industries" },
  { id: "companySizes", label: "Company Size" },
  { id: "personas", label: "Buyer Personas" },
  { id: "techStack", label: "Tech Stack" },
  { id: "painPoints", label: "Pain Points" },
  { id: "goals", label: "Goals" },
]

const impactMetrics = [
  { label: "Estimated TAM", value: "$4.2B", change: "+12%" },
  { label: "Expected SQL Lift", value: "+24%", change: "+8%" },
  { label: "Expected ACV Band", value: "$45K-$85K", change: "+15%" },
  { label: "Competition Intensity", value: "Medium", change: "-5%" },
]

export function DefineICPTab() {
  const [selectedDimension, setSelectedDimension] = useState("industries")
  const [selectedItems, setSelectedItems] = useState<Record<string, string[]>>({
    industries: ["Technology / SaaS", "Financial Services"],
    companySizes: ["Mid-Market (101-1000)", "Enterprise (1000+)"],
    personas: ["VP of Sales", "Chief Revenue Officer", "RevOps Manager"],
    techStack: ["Salesforce User", "HubSpot User"],
    painPoints: ["Manual data entry", "Low pipeline visibility"],
    goals: ["Increase sales productivity", "Improve forecast accuracy"],
  })

  const currentDimensionData = aiSuggestedICP[selectedDimension as keyof typeof aiSuggestedICP] || []

  const toggleItem = (item: string) => {
    setSelectedItems((prev) => {
      const current = prev[selectedDimension] || []
      if (current.includes(item)) {
        return { ...prev, [selectedDimension]: current.filter((i) => i !== item) }
      } else {
        return { ...prev, [selectedDimension]: [...current, item] }
      }
    })
  }

  const isSelected = (item: string) => {
    return (selectedItems[selectedDimension] || []).includes(item)
  }

  return (
    <div className="space-y-6">
      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* AI Suggested ICP */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <CardTitle className="text-lg">AI-Suggested ICP</CardTitle>
              <Badge variant="secondary" className="text-xs">
                <Sparkles className="mr-1 h-3 w-3" />
                Based on your data + market benchmarks
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(aiSuggestedICP).map(([key, items]) => (
              <div key={key}>
                <p className="text-xs font-medium text-muted-foreground mb-2 capitalize">
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </p>
                <div className="flex flex-wrap gap-2">
                  {items.slice(0, 4).map((item) => (
                    <Badge
                      key={item.name}
                      variant="secondary"
                      className={cn(
                        "text-xs cursor-pointer transition-all",
                        (selectedItems[key] || []).includes(item.name) && "bg-primary text-primary-foreground",
                      )}
                      onClick={() => {
                        setSelectedDimension(key)
                        toggleItem(item.name)
                      }}
                    >
                      {item.name}
                      <span className="ml-1.5 opacity-70">{item.score}%</span>
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* ICP Editor */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Refine Your ICP</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Dimension Pills */}
            <div className="flex flex-wrap gap-2">
              {dimensions.map((dim) => (
                <button
                  key={dim.id}
                  onClick={() => setSelectedDimension(dim.id)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                    selectedDimension === dim.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                  )}
                >
                  {dim.label}
                </button>
              ))}
            </div>

            {/* Chips Panel */}
            <div className="rounded-lg border border-border p-4 min-h-[200px]">
              <p className="text-xs text-muted-foreground mb-3">Click to add or remove from your ICP</p>
              <div className="flex flex-wrap gap-2">
                {currentDimensionData.map((item) => {
                  const selected = isSelected(item.name)
                  return (
                    <Badge
                      key={item.name}
                      variant={selected ? "default" : "outline"}
                      className={cn(
                        "text-xs cursor-pointer transition-all",
                        selected ? "bg-primary text-primary-foreground" : "hover:bg-accent",
                      )}
                      onClick={() => toggleItem(item.name)}
                    >
                      {item.name}
                      {!selected && <span className="ml-1.5 text-muted-foreground">AI: {item.score}%</span>}
                    </Badge>
                  )
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button className="flex-1">Apply ICP Changes</Button>
              <Button variant="outline" className="flex-1 bg-transparent">
                Reset to AI Suggestion
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ICP Impact Model */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Projected Impact of This ICP</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Metrics Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {impactMetrics.map((metric) => (
              <div key={metric.label} className="rounded-lg bg-accent/50 p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">{metric.label}</p>
                <p className="text-2xl font-bold text-foreground">{metric.value}</p>
                <p className="text-xs text-green-600 font-medium">{metric.change} vs. baseline</p>
              </div>
            ))}
          </div>

          {/* Impact Bars */}
          <div className="space-y-3">
            {impactMetrics.slice(0, 3).map((metric, index) => (
              <div key={metric.label} className="flex items-center gap-4">
                <span className="w-32 text-sm text-muted-foreground">{metric.label}</span>
                <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${70 + index * 10}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* Note */}
          <div className="flex items-start gap-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
            <Info className="h-4 w-4 mt-0.5 shrink-0" />
            <p>These projections will refine your GTM motion recommendations in the GTM Selector tab.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
