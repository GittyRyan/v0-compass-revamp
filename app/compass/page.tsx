"use client"

import { useState, useCallback } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { CompassHeader } from "@/components/compass/compass-header"
import { CompassTabs } from "@/components/compass/compass-tabs"
import type { GtmPlan } from "@/lib/gtm-plans"

export type FlowType = "gtm-insight" | "market-report"

export default function CompassPage() {
  const [activeTab, setActiveTab] = useState("gtm-selector")
  const [setupResetKey, setSetupResetKey] = useState(0)
  const [selectedFlow, setSelectedFlow] = useState<FlowType>("gtm-insight")
  const [activePlan, setActivePlan] = useState<GtmPlan | null>(null)

  const handleCreateNewPlan = useCallback(() => {
    setActiveTab("gtm-setup")
    setSetupResetKey((prev) => prev + 1)
  }, [])

  const handleSelectFlow = useCallback((flow: FlowType) => {
    setSelectedFlow(flow)
  }, [])

  const handleScrollToLibrary = useCallback(() => {
    setActiveTab("gtm-selector")
    // Scroll to library section after tab switch
    setTimeout(() => {
      const librarySection = document.querySelector("[data-plan-library]")
      librarySection?.scrollIntoView({ behavior: "smooth", block: "start" })
    }, 100)
  }, [])

  return (
    <AppShell selectedFlow={selectedFlow}>
      <div className="flex flex-col gap-6">
        <CompassHeader
          onCreateNewPlan={handleCreateNewPlan}
          selectedFlow={selectedFlow}
          onSelectFlow={handleSelectFlow}
          activePlan={activePlan}
          onScrollToLibrary={handleScrollToLibrary}
        />
        <CompassTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          setupResetKey={setupResetKey}
          onActivePlanChange={setActivePlan}
          flowType={selectedFlow}
        />
      </div>
    </AppShell>
  )
}
