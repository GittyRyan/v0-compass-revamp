import type React from "react"
import { TopNavbar } from "./top-navbar"
import { Sidebar } from "./sidebar"

interface AppShellProps {
  children: React.ReactNode
  selectedFlow?: "gtm-insight" | "market-report"
}

export function AppShell({ children, selectedFlow }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <TopNavbar selectedFlow={selectedFlow} />
      <Sidebar />
      <main className="ml-64 pt-16">
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}
