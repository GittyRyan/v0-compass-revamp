import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function CompassHeader() {
  return (
    <div className="flex items-start justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Compass</h1>
        <p className="mt-1 text-sm text-muted-foreground">AI-guided GTM planning: from ICP to motion to strategy.</p>
      </div>
      <div className="flex items-center gap-3">
        <Badge variant="secondary" className="h-8 px-3 text-sm font-medium">
          Active Plan · Q1 SaaS Mid-Market Push
        </Badge>
        <Button variant="outline" size="sm">
          Switch Plan
        </Button>
        <Button size="sm">Create New Plan</Button>
      </div>
    </div>
  )
}
