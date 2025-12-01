import { Bell, ChevronDown } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

export function TopNavbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-border bg-white">
      <div className="flex h-full items-center justify-between px-6">
        {/* Left: Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <span className="text-lg font-bold text-primary-foreground">O</span>
          </div>
          <span className="text-lg font-semibold text-foreground">OmniGTM.ai</span>
        </div>

        {/* Center: Page Title */}
        <div className="absolute left-1/2 -translate-x-1/2 text-center">
          <h1 className="text-lg font-semibold text-foreground">Compass</h1>
          <p className="text-xs text-muted-foreground">AI GTM Decision Console</p>
        </div>

        {/* Right: Notifications + User */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
              3
            </span>
          </Button>
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/images/headshot-28hq-29.jpg" />
              <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">RA</AvatarFallback>
            </Avatar>
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium text-foreground">Ryan Arian</p>
              <p className="text-xs text-muted-foreground">Super Admin</p>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </div>
    </header>
  )
}
