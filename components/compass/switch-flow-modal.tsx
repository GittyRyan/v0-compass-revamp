"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, ClipboardList, TrendingUp, BarChart3, Users, Target, FileText, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

interface SwitchFlowModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectFlow?: (flow: "gtm-insight" | "market-report") => void
  defaultFlow?: "gtm-insight" | "market-report"
}

const flows = [
  {
    id: "gtm-insight" as const,
    title: "GTM Insight",
    badge: "Internal – Own Company",
    description: "Supports internal strategic decision-making",
    icon: ClipboardList,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    id: "market-report" as const,
    title: "Market Report",
    badge: "External – Competitor/Industry Analysis",
    description: "Focuses on competitor, industry, and external trend analysis",
    icon: TrendingUp,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
  },
]

const availableFeatures = [
  { icon: BarChart3, label: "SWOT Analysis" },
  { icon: Users, label: "Target Personas" },
  { icon: Target, label: "Market Segments" },
  { icon: FileText, label: "GTM Strategy" },
]

export function SwitchFlowModal({
  open,
  onOpenChange,
  onSelectFlow,
  defaultFlow = "gtm-insight",
}: SwitchFlowModalProps) {
  const [selectedFlow, setSelectedFlow] = useState<"gtm-insight" | "market-report">(defaultFlow)

  useEffect(() => {
    if (open) {
      setSelectedFlow(defaultFlow)
    }
  }, [open, defaultFlow])

  const handleContinue = () => {
    onSelectFlow?.(selectedFlow)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px] p-0 gap-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Switch Flow</DialogTitle>
        </DialogHeader>

        {/* Flow Options */}
        <div className="p-6 space-y-3">
          {flows.map((flow) => {
            const Icon = flow.icon
            const isSelected = selectedFlow === flow.id

            return (
              <button
                key={flow.id}
                onClick={() => setSelectedFlow(flow.id)}
                className={cn(
                  "w-full flex items-start gap-4 p-4 rounded-xl border-2 transition-all text-left",
                  isSelected ? "border-indigo-500 bg-indigo-50/50" : "border-gray-200 hover:border-gray-300 bg-white",
                )}
              >
                <div className={cn("p-3 rounded-xl", flow.iconBg)}>
                  <Icon className={cn("h-6 w-6", flow.iconColor)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900">{flow.title}</span>
                    <Badge variant="secondary" className="text-xs font-normal bg-gray-100 text-gray-600">
                      {flow.badge}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500">{flow.description}</p>
                </div>
                {isSelected && (
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* Available Features Section */}
        <div className="px-6 pb-6">
          <div className="border-t pt-5">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="h-4 w-4 text-gray-500" />
              <span className="font-semibold text-gray-900">Available Features for All Flows</span>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2">
              {availableFeatures.map((feature) => {
                const Icon = feature.icon
                return (
                  <div key={feature.label} className="flex items-center gap-2 text-sm text-gray-600">
                    <Icon className="h-4 w-4 text-gray-400" />
                    <span>{feature.label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="border-t px-6 py-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleContinue}>Continue with Selected Flow</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
