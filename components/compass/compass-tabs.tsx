"use client"

import { cn } from "@/lib/utils"
import { GTMSelectorTab } from "./tabs/gtm-selector-tab"
import { GTMSetupTab } from "./tabs/gtm-setup-tab"
import { AnalyzePositionTab } from "./tabs/analyze-position-tab"
import { AnalyzeMarketTab } from "./tabs/analyze-market-tab"
import { AnalyzeCompetitionTab } from "./tabs/analyze-competition-tab"
import { DefineICPTab } from "./tabs/define-icp-tab"
import { GTMReportTab } from "./tabs/gtm-report-tab"
import type { GtmPlan } from "@/lib/gtm-plans"
import type { FlowType } from "@/app/compass/page"

const tabs = [
  { id: "gtm-selector", label: "GTM Selector" },
  { id: "gtm-setup", label: "GTM Setup" },
  { id: "analyze-position", label: "Analyze Position" },
  { id: "analyze-market", label: "Analyze Market" },
  { id: "analyze-competition", label: "Analyze Competition" },
  { id: "define-icp", label: "Define ICP" },
  { id: "gtm-report", label: "GTM Report" },
]

interface CompassTabsProps {
  activeTab: string
  onTabChange: (tab: string) => void
  setupResetKey: number
  onActivePlanChange?: (plan: GtmPlan | null) => void
  flowType?: FlowType
}

export function CompassTabs({
  activeTab,
  onTabChange,
  setupResetKey,
  onActivePlanChange,
  flowType = "gtm-insight",
}: CompassTabsProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Tab Navigation */}
      <div className="border-b border-border">
        <nav className="-mb-px flex gap-1 overflow-x-auto" aria-label="Compass tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "gtm-selector" && <GTMSelectorTab onActivePlanChange={onActivePlanChange} flowType={flowType} />}
        {activeTab === "gtm-setup" && <GTMSetupTab key={setupResetKey} />}
        {activeTab === "analyze-position" && <AnalyzePositionTab />}
        {activeTab === "analyze-market" && <AnalyzeMarketTab />}
        {activeTab === "analyze-competition" && <AnalyzeCompetitionTab />}
        {activeTab === "define-icp" && <DefineICPTab />}
        {activeTab === "gtm-report" && <GTMReportTab />}
      </div>
    </div>
  )
}
