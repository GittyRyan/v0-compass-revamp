"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SwitchFlowModal } from "./switch-flow-modal"

interface CompassHeaderProps {
  onCreateNewPlan?: () => void
  selectedFlow?: "gtm-insight" | "market-report"
  onSelectFlow?: (flow: "gtm-insight" | "market-report") => void
}

export function CompassHeader({ onCreateNewPlan, selectedFlow = "gtm-insight", onSelectFlow }: CompassHeaderProps) {
  const [showSwitchFlowModal, setShowSwitchFlowModal] = useState(false)

  const handleSelectFlow = (flow: "gtm-insight" | "market-report") => {
    onSelectFlow?.(flow)
  }

  return (
    <>
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="h-8 px-3 text-sm font-medium">
            Active Plan · Q1 SaaS Mid-Market Push
          </Badge>
          <Button variant="outline" size="sm" onClick={() => setShowSwitchFlowModal(true)}>
            Switch Flow
          </Button>
          <Button size="sm" onClick={onCreateNewPlan}>
            Create New Plan
          </Button>
        </div>
      </div>

      <SwitchFlowModal
        open={showSwitchFlowModal}
        onOpenChange={setShowSwitchFlowModal}
        onSelectFlow={handleSelectFlow}
        defaultFlow={selectedFlow}
      />
    </>
  )
}
