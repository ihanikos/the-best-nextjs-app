"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  FileText,
  Users,
  LayoutDashboard,
  Settings,
  Plus,
  Bell,
  BarChart3,
  FolderKanban,
  ArrowRight,
  Command,
  X,
  Clock,
  Sparkles,
  Moon,
  Sun,
  LogOut,
  Home,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Kbd } from "@/components/ui/kbd"
import { useProjects } from "@/lib/projects/use-projects"
import { useTheme } from "next-themes"
import { toast } from "sonner"

interface SearchResult {
  id: string
  title: string
  subtitle?: string
  icon: React.ElementType
  href?: string
  action?: () => void
  category: string
  shortcut?: string
}

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const RECENT_ITEMS_KEY = "command-palette-recent"
const MAX_RECENT_ITEMS = 5

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter()
  const { projects, createProject } = useProjects()
  const { theme, setTheme } = useTheme()
  const [query, setQuery] = React.useState("")
  const [selectedIndex, setSelectedIndex] = React.useState(0)
  const [recentItems, setRecentItems] = React.useState<SearchResult[]>([])
  const inputRef = React.useRef<HTMLInputElement>(null)
  const listRef = React.useRef<HTMLDivElement>(null)

  // Load recent items from localStorage
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(RECENT_ITEMS_KEY)
      if (saved) {
        try {
          setRecentItems(JSON.parse(saved))
        } catch {
          // Ignore parse errors
        }
      }
    }
  }, [])

  // Save recent items to localStorage
  const saveRecentItem = React.useCallback((item: SearchResult) => {
    if (typeof window !== "undefined") {
      setRecentItems((prev) => {
        const filtered = prev.filter((i) => i.id !== item.id)
        const newItems = [item, ...filtered].slice(0, MAX_RECENT_ITEMS)
        localStorage.setItem(RECENT_ITEMS_KEY, JSON.stringify(newItems))
        return newItems
      })
    }
  }, [])

  // Build search results
  const results = React.useMemo(() => {
    const items: SearchResult[] = []

    // Navigation items
    const navigationItems: SearchResult[] = [
      {
        id: "nav-home",
        title: "Home",
        subtitle: "Go to landing page",
        icon: Home,
        href: "/",
        category: "Navigation",
      },
      {
        id: "nav-dashboard",
        title: "Dashboard",
        subtitle: "View your dashboard",
        icon: LayoutDashboard,
        href: "/dashboard",
        category: "Navigation",
      },
      {
        id: "nav-projects",
        title: "Projects",
        subtitle: "Manage your projects",
        icon: FolderKanban,
        href: "/projects",
        category: "Navigation",
      },
      {
        id: "nav-team",
        title: "Team",
        subtitle: "View team members",
        icon: Users,
        href: "/team",
        category: "Navigation",
      },
      {
        id: "nav-analytics",
        title: "Analytics",
        subtitle: "View analytics and reports",
        icon: BarChart3,
        href: "/analytics",
        category: "Navigation",
      },
      {
        id: "nav-notifications",
        title: "Notifications",
        subtitle: "View notifications",
        icon: Bell,
        href: "/notifications",
        category: "Navigation",
      },
      {
        id: "nav-settings",
        title: "Settings",
        subtitle: "Configure your account",
        icon: Settings,
        href: "/settings",
        category: "Navigation",
      },
    ]
    items.push(...navigationItems)

    // Project items
    const projectItems: SearchResult[] = projects.map((project) => ({
      id: `project-${project.id}`,
      title: project.name,
      subtitle: project.description,
      icon: FileText,
      href: "/projects",
      category: "Projects",
    }))
    items.push(...projectItems)

    // Quick Actions
    const quickActions: SearchResult[] = [
      {
        id: "action-create-project",
        title: "Create New Project",
        subtitle: "Start a new project",
        icon: Plus,
        category: "Quick Actions",
        action: () => {
          const name = prompt("Enter project name:")
          if (name?.trim()) {
            createProject({
              name: name.trim(),
              description: "",
              dueDate: new Date().toISOString().split("T")[0],
              status: "active",
              members: [],
            })
            toast.success("Project created successfully")
          }
        },
      },
      {
        id: "action-toggle-theme",
        title: "Toggle Theme",
        subtitle: `Switch to ${theme === "dark" ? "light" : "dark"} mode`,
        icon: theme === "dark" ? Sun : Moon,
        category: "Quick Actions",
        action: () => {
          setTheme(theme === "dark" ? "light" : "dark")
          toast.success(`Switched to ${theme === "dark" ? "light" : "dark"} mode`)
        },
      },
    ]
    items.push(...quickActions)

    // Filter by query
    if (query.trim()) {
      const lowerQuery = query.toLowerCase()
      return items.filter(
        (item) =>
          item.title.toLowerCase().includes(lowerQuery) ||
          item.subtitle?.toLowerCase().includes(lowerQuery) ||
          item.category.toLowerCase().includes(lowerQuery)
      )
    }

    // Show recent items first when no query
    if (!query.trim() && recentItems.length > 0) {
      const recentIds = new Set(recentItems.map((i) => i.id))
      const filteredItems = items.filter((i) => !recentIds.has(i.id))
      return [
        ...recentItems.filter((item) => items.some((i) => i.id === item.id)),
        ...filteredItems,
      ]
    }

    return items
  }, [projects, query, recentItems, theme, createProject, setTheme])

  // Group results by category
  const groupedResults = React.useMemo(() => {
    const groups: Record<string, SearchResult[]> = {}
    results.forEach((item) => {
      if (!groups[item.category]) {
        groups[item.category] = []
      }
      groups[item.category].push(item)
    })
    return groups
  }, [results])

  // Get flat list for keyboard navigation
  const flatResults = React.useMemo(() => {
    return Object.values(groupedResults).flat()
  }, [groupedResults])

  // Handle item selection
  const handleSelect = React.useCallback(
    (item: SearchResult) => {
      saveRecentItem(item)

      if (item.action) {
        item.action()
      } else if (item.href) {
        router.push(item.href)
      }

      onOpenChange(false)
      setQuery("")
      setSelectedIndex(0)
    },
    [router, saveRecentItem, onOpenChange]
  )

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault()
          setSelectedIndex((prev) =>
            prev < flatResults.length - 1 ? prev + 1 : prev
          )
          break
        case "ArrowUp":
          e.preventDefault()
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0))
          break
        case "Enter":
          e.preventDefault()
          if (flatResults[selectedIndex]) {
            handleSelect(flatResults[selectedIndex])
          }
          break
        case "Escape":
          e.preventDefault()
          onOpenChange(false)
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [open, flatResults, selectedIndex, handleSelect, onOpenChange])

  // Focus input when opened
  React.useEffect(() => {
    if (open) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
      setSelectedIndex(0)
    }
  }, [open])

  // Scroll selected item into view
  React.useEffect(() => {
    if (listRef.current && open) {
      const selectedElement = listRef.current.querySelector(
        `[data-index="${selectedIndex}"]`
      )
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: "nearest" })
      }
    }
  }, [selectedIndex, open])

  let currentIndex = 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 shadow-2xl sm:max-w-[640px] gap-0">
        <DialogTitle className="sr-only">Command Palette</DialogTitle>
        <div className="flex items-center border-b px-4">
          <Search className="mr-2 h-5 w-5 shrink-0 text-muted-foreground" />
          <Input
            ref={inputRef}
            placeholder="Search projects, team, pages..."
            className="flex h-14 border-0 bg-transparent text-base placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelectedIndex(0)
            }}
          />
          <Kbd variant="outline" size="sm" className="hidden sm:inline-flex">
            ESC
          </Kbd>
        </div>

        <div
          ref={listRef}
          className="max-h-[400px] overflow-y-auto p-2"
          role="listbox"
        >
          {flatResults.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-sm text-muted-foreground">
                No results found for &quot;{query}&quot;
              </p>
            </div>
          ) : (
            Object.entries(groupedResults).map(([category, items]) => (
              <div key={category} className="mb-4 last:mb-0">
                <h3 className="mb-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {category}
                </h3>
                <div className="space-y-1">
                  {items.map((item) => {
                    const index = currentIndex++
                    const isSelected = index === selectedIndex
                    const Icon = item.icon

                    return (
                      <motion.button
                        key={item.id}
                        data-index={index}
                        onClick={() => handleSelect(item)}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition-colors",
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        )}
                        role="option"
                        aria-selected={isSelected}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <div
                          className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-md",
                            isSelected
                              ? "bg-primary-foreground/20"
                              : "bg-muted"
                          )}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium truncate">
                              {item.title}
                            </span>
                            {recentItems.some((i) => i.id === item.id) &&
                              !query.trim() && (
                                <Badge
                                  variant={isSelected ? "secondary" : "outline"}
                                  className="text-[10px]"
                                >
                                  <Clock className="mr-1 h-3 w-3" />
                                  Recent
                                </Badge>
                              )}
                          </div>
                          {item.subtitle && (
                            <p
                              className={cn(
                                "text-sm truncate",
                                isSelected
                                  ? "text-primary-foreground/80"
                                  : "text-muted-foreground"
                              )}
                            >
                              {item.subtitle}
                            </p>
                          )}
                        </div>
                        {item.shortcut && (
                          <Kbd
                            variant={isSelected ? "secondary" : "outline"}
                            size="sm"
                          >
                            {item.shortcut}
                          </Kbd>
                        )}
                        {item.href && (
                          <ArrowRight
                            className={cn(
                              "h-4 w-4 shrink-0",
                              isSelected
                                ? "text-primary-foreground"
                                : "text-muted-foreground"
                            )}
                          />
                        )}
                      </motion.button>
                    )
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex items-center justify-between border-t bg-muted/50 px-4 py-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Kbd variant="outline" size="sm">↑</Kbd>
              <Kbd variant="outline" size="sm">↓</Kbd>
              to navigate
            </span>
            <span className="flex items-center gap-1">
              <Kbd variant="outline" size="sm">↵</Kbd>
              to select
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span>{flatResults.length} results</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
