"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight, AlertTriangle, Link2, Sparkles, Users, Clock, Gauge } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import type { GtmPlanPreview, GtmPlanPreviewPhase } from "@/lib/gtm-preview"

interface GtmPlanPreviewProps {
  preview: GtmPlanPreview
  className?: string
}

function EffortSliceBadge({ slice }: { slice: "low" | "medium" | "high" }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-[10px] px-1.5 py-0",
        slice === "low" && "border-green-300 text-green-700 bg-green-50",
        slice === "medium" && "border-yellow-300 text-yellow-700 bg-yellow-50",
        slice === "high" && "border-red-300 text-red-700 bg-red-50",
      )}
    >
      {slice === "low" ? "Low" : slice === "medium" ? "Med" : "High"} Effort
    </Badge>
  )
}

function RiskBadge({ level }: { level: "low" | "medium" | "high" }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-[10px] px-1.5 py-0",
        level === "low" && "border-green-300 text-green-700 bg-green-50",
        level === "medium" && "border-yellow-300 text-yellow-700 bg-yellow-50",
        level === "high" && "border-red-300 text-red-700 bg-red-50",
      )}
    >
      {level === "low" ? "Low" : level === "medium" ? "Med" : "High"} Risk
    </Badge>
  )
}

function PhaseCard({ phase, defaultOpen = false }: { phase: GtmPlanPreviewPhase; defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="w-full">
        <div className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-2">
            {isOpen ? (
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            )}
            <div className="text-left">
              <div className="text-xs font-medium">{phase.label}</div>
              <div className="text-[10px] text-muted-foreground">{phase.timeframe}</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <EffortSliceBadge slice={phase.effortSlice} />
            <RiskBadge level={phase.riskLevel} />
          </div>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="pl-6 pr-2 pb-2 space-y-2">
          <div className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Focus:</span> {phase.focus}
          </div>
          <ul className="space-y-1">
            {phase.primaryWorkstreams.map((workstream, i) => (
              <li key={i} className="flex items-start gap-1.5 text-xs text-foreground">
                <ChevronRight className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                <span>{workstream}</span>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-1.5 pt-1">
            <Users className="h-3 w-3 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">
              <span className="font-medium">Owners:</span> {phase.primaryOwners.join(", ")}
            </span>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

export function GtmPlanPreviewComponent({ preview, className }: GtmPlanPreviewProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Effort Classification Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Gauge className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-medium">Effort Classification:</span>
          <Badge
            variant="outline"
            className={cn(
              "text-xs capitalize",
              preview.effortClassification === "lightweight" && "border-green-300 text-green-700 bg-green-50",
              preview.effortClassification === "moderate" && "border-blue-300 text-blue-700 bg-blue-50",
              preview.effortClassification === "heavy" && "border-orange-300 text-orange-700 bg-orange-50",
              preview.effortClassification === "transformational" && "border-purple-300 text-purple-700 bg-purple-50",
            )}
          >
            {preview.effortClassification}
          </Badge>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          {preview.horizonMonths} months
        </div>
      </div>

      {/* Phases */}
      <div className="space-y-1 border rounded-lg bg-muted/30 p-2">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-2 py-1">
          Execution Phases
        </div>
        {preview.phases.map((phase, index) => (
          <PhaseCard key={phase.phaseId} phase={phase} defaultOpen={index === 0} />
        ))}
      </div>

      {/* Execution Summary */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Execution Summary</div>
        <p className="text-xs text-foreground leading-relaxed">{preview.summary.executionTheme}</p>
      </div>

      {/* Risks & Dependencies */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <AlertTriangle className="h-3.5 w-3.5" />
            Key Risks
          </div>
          <ul className="space-y-1">
            {preview.summary.keyRisks.map((risk, i) => (
              <li key={i} className="text-[11px] text-foreground flex items-start gap-1">
                <span className="text-orange-500 mt-0.5">•</span>
                <span>{risk}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Link2 className="h-3.5 w-3.5" />
            Key Dependencies
          </div>
          <ul className="space-y-1">
            {preview.summary.keyDependencies.map((dep, i) => (
              <li key={i} className="text-[11px] text-foreground flex items-start gap-1">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>{dep}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* LLM Expectations */}
      <div className="space-y-2 border-t pt-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          What the AI Will Generate
        </div>
        <ul className="space-y-1">
          {preview.llmExpectations.map((expectation, i) => (
            <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
              <ChevronRight className="h-3 w-3 text-primary mt-0.5 shrink-0" />
              <span>{expectation}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
