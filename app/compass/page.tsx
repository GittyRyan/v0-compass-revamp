import { AppShell } from "@/components/layout/app-shell"
import { CompassHeader } from "@/components/compass/compass-header"
import { CompassTabs } from "@/components/compass/compass-tabs"

export default function CompassPage() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <CompassHeader />
        <CompassTabs />
      </div>
    </AppShell>
  )
}
