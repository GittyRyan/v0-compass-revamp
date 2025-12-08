"use client"

import { useState, useCallback } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { CompassHeader } from "@/components/compass/compass-header"
import { CompassTabs } from "@/components/compass/compass-tabs"

export type FlowType = "gtm-insight" | "market-report"

export default function CompassPage() {
  const [activeTab, setActiveTab] = useState("gtm-selector")
  const [setupResetKey, setSetupResetKey] = useState(0)
  const [selectedFlow, setSelectedFlow] = useState<FlowType>("gtm-insight")

  const handleCreateNewPlan = useCallback(() => {
    setActiveTab("gtm-setup")
    setSetupResetKey((prev) => prev + 1)
  }, [])

  const handleSelectFlow = useCallback((flow: FlowType) => {
    setSelectedFlow(flow)
  }, [])

  return (
    <AppShell selectedFlow={selectedFlow}>
      <div className="flex flex-col gap-6">
        <CompassHeader
          onCreateNewPlan={handleCreateNewPlan}
          selectedFlow={selectedFlow}
          onSelectFlow={handleSelectFlow}
        />
        <CompassTabs activeTab={activeTab} onTabChange={setActiveTab} setupResetKey={setupResetKey} />
      </div>
    </AppShell>
  )
}
