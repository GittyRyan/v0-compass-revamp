"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { GTMSelectorTab } from "./tabs/gtm-selector-tab"
import { GTMSetupTab } from "./tabs/gtm-setup-tab"
import { AnalyzePositionTab } from "./tabs/analyze-position-tab"
import { AnalyzeMarketTab } from "./tabs/analyze-market-tab"
import { AnalyzeCompetitionTab } from "./tabs/analyze-competition-tab"
import { DefineICPTab } from "./tabs/define-icp-tab"
import { GTMReportTab } from "./tabs/gtm-report-tab"

const tabs = [
  { id: "gtm-selector", label: "GTM Selector" },
  { id: "gtm-setup", label: "GTM Setup" },
  { id: "analyze-position", label: "Analyze Position" },
  { id: "analyze-market", label: "Analyze Market" },
  { id: "analyze-competition", label: "Analyze Competition" },
  { id: "define-icp", label: "Define ICP" },
  { id: "gtm-report", label: "GTM Report" },
]

export function CompassTabs() {
  const [activeTab, setActiveTab] = useState("gtm-selector")

  return (
    <div className="flex flex-col gap-6">
      {/* Tab Navigation */}
      <div className="border-b border-border">
        <nav className="-mb-px flex gap-1 overflow-x-auto" aria-label="Compass tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
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
        {activeTab === "gtm-selector" && <GTMSelectorTab />}
        {activeTab === "gtm-setup" && <GTMSetupTab />}
        {activeTab === "analyze-position" && <AnalyzePositionTab />}
        {activeTab === "analyze-market" && <AnalyzeMarketTab />}
        {activeTab === "analyze-competition" && <AnalyzeCompetitionTab />}
        {activeTab === "define-icp" && <DefineICPTab />}
        {activeTab === "gtm-report" && <GTMReportTab />}
      </div>
    </div>
  )
}
