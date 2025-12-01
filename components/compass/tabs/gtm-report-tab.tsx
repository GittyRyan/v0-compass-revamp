"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Download, Eye, FileText, Presentation, FileSpreadsheet, Check } from "lucide-react"
import { cn } from "@/lib/utils"

const reportSections = [
  {
    id: "position",
    title: "Analyze Position (SWOT)",
    description: "Internal strengths, weaknesses, opportunities, and threats analysis.",
  },
  {
    id: "icp",
    title: "Ideal Customer Profile (ICP) Recommendations",
    description: "AI-suggested ICP with industry, company size, and persona targeting.",
  },
  {
    id: "market",
    title: "Ranked Market Segments",
    description: "Top market segments with AI opportunity scores and SWOT analysis.",
  },
  {
    id: "strategy",
    title: "GTM Strategy",
    description: "Recommended GTM motion with implementation timeline and expected outcomes.",
  },
  {
    id: "executive",
    title: "Executive Summary",
    description: "High-level overview with key findings and strategic recommendations.",
  },
]

const detailLevels = [
  {
    id: "summary",
    title: "Summary View",
    description: "Bullet points only - concise and scannable",
    icon: FileText,
  },
  {
    id: "detailed",
    title: "Detailed View",
    description: "Full narrative with visuals and deep analysis",
    icon: FileSpreadsheet,
  },
  {
    id: "slide",
    title: "Slide View",
    description: "Presentation-oriented storytelling format",
    icon: Presentation,
  },
]

const outputFormats = [
  { id: "pdf", title: "PDF", icon: FileText },
  { id: "ppt", title: "PowerPoint", icon: Presentation },
  { id: "doc", title: "Word Doc", icon: FileSpreadsheet },
]

export function GTMReportTab() {
  const [selectedSections, setSelectedSections] = useState<string[]>([
    "position",
    "icp",
    "market",
    "strategy",
    "executive",
  ])
  const [selectedDetail, setSelectedDetail] = useState("detailed")
  const [selectedFormat, setSelectedFormat] = useState("pdf")

  const toggleSection = (sectionId: string) => {
    setSelectedSections((prev) =>
      prev.includes(sectionId) ? prev.filter((id) => id !== sectionId) : [...prev, sectionId],
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Select Report Sections */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Select Report Sections</h3>
        <div className="space-y-3">
          {reportSections.map((section) => (
            <Card
              key={section.id}
              className={cn(
                "cursor-pointer transition-all",
                selectedSections.includes(section.id) && "ring-2 ring-primary",
              )}
              onClick={() => toggleSection(section.id)}
            >
              <CardContent className="flex items-start gap-4 p-4">
                <Checkbox
                  checked={selectedSections.includes(section.id)}
                  onCheckedChange={() => toggleSection(section.id)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">{section.title}</h4>
                  <p className="text-sm text-muted-foreground mt-0.5">{section.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Choose Detail Level */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Choose Detail Level</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          {detailLevels.map((level) => (
            <Card
              key={level.id}
              className={cn("cursor-pointer transition-all", selectedDetail === level.id && "ring-2 ring-primary")}
              onClick={() => setSelectedDetail(level.id)}
            >
              <CardContent className="flex flex-col items-center text-center p-6">
                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-full mb-3",
                    selectedDetail === level.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground",
                  )}
                >
                  <level.icon className="h-6 w-6" />
                </div>
                <h4 className="font-medium text-foreground">{level.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">{level.description}</p>
                {selectedDetail === level.id && <Check className="h-4 w-4 text-primary mt-2" />}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Select Output Format */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Select Output Format</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          {outputFormats.map((format) => (
            <Card
              key={format.id}
              className={cn("cursor-pointer transition-all", selectedFormat === format.id && "ring-2 ring-primary")}
              onClick={() => setSelectedFormat(format.id)}
            >
              <CardContent className="flex flex-col items-center text-center p-6">
                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-full mb-3",
                    selectedFormat === format.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground",
                  )}
                >
                  <format.icon className="h-6 w-6" />
                </div>
                <h4 className="font-medium text-foreground">{format.title}</h4>
                {selectedFormat === format.id && <Check className="h-4 w-4 text-primary mt-2" />}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-center gap-4 pt-4">
        <Button variant="outline" size="lg">
          <Eye className="mr-2 h-4 w-4" />
          Preview Report
        </Button>
        <Button size="lg">
          <Download className="mr-2 h-4 w-4" />
          Download Report
        </Button>
      </div>
    </div>
  )
}
