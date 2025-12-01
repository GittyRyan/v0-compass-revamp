"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Compass, Radio, PlayCircle, Lightbulb, MessageSquare, Plug, ShieldCheck, Settings } from "lucide-react"

const navItems = [
  { name: "Compass", href: "/compass", icon: Compass },
  { name: "Signals", href: "/signals", icon: Radio },
  { name: "Plays", href: "/plays", icon: PlayCircle },
  { name: "Insights", href: "/insights", icon: Lightbulb },
  { name: "Assist", href: "/assist", icon: MessageSquare },
  { name: "Integrations", href: "/integrations", icon: Plug },
  { name: "Compliance", href: "/compliance", icon: ShieldCheck },
  { name: "Admin", href: "/admin", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 border-r border-border bg-white">
      <nav className="flex flex-col gap-1 p-4">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive ? "text-primary" : "")} />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
