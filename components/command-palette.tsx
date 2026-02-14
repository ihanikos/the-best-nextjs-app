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
  CheckCircle,
  User,
  Briefcase,
  Loader2,
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
import { useSearch, highlightMatch, SearchResult } from "@/lib/hooks/use-search"
import { availableTeamMembers } from "@/lib/projects/data"

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

  const { results, isSearching } = useSearch({
    query,
    maxResults: 15,
  })

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

  // Save recent item to localStorage
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

  // Build navigation and action items
  const staticItems = React.useMemo(() => {
    const items: SearchResult[] = []

    // Navigation items
    items.push(
      {
        id: "nav-home",
        title: "Home",
        subtitle: "Go to landing page",
        type: "navigation",
        category: "Navigation",
        href: "/",
      },
      {
        id: "nav-dashboard",
        title: "Dashboard",
        subtitle: "View your dashboard",
        type: "navigation",
        category: "Navigation",
        href: "/dashboard",
      },
      {
        id: "nav-projects",
        title: "Projects",
        subtitle: "Manage your projects",
        type: "navigation",
        category: "Navigation",
        href: "/projects",
      },
      {
        id: "nav-team",
        title: "Team",
        subtitle: "View team members",
        type: "navigation",
        category: "Navigation",
        href: "/team",
      },
      {
        id: "nav-analytics",
        title: "Analytics",
        subtitle: "View analytics and reports",
        type: "navigation",
        category: "Navigation",
        href: "/analytics",
      },
      {
        id: "nav-notifications",
        title: "Notifications",
        subtitle: "View notifications",
        type: "navigation",
        category: "Navigation",
        href: "/notifications",
      },
      {
        id: "nav-settings",
        title: "Settings",
        subtitle: "Configure your account",
        type: "navigation",
        category: "Navigation",
        href: "/settings",
      }
    )

    // Quick Actions
    items.push(
      {
        id: "action-create-project",
        title: "Create New Project",
        subtitle: "Start a new project",
        type: "action",
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
        type: "action",
        category: "Quick Actions",
        action: () => {
          setTheme(theme === "dark" ? "light" : "dark")
          toast.success(`Switched to ${theme === "dark" ? "light" : "dark"} mode`)
        },
      }
    )

    return items
  }, [theme, createProject, setTheme])

  // Combine and filter all results
  const allResults = React.useMemo(() => {
    if (!query.trim()) {
      // Show recent items first when no query
      if (recentItems.length > 0) {
        const recentIds = new Set(recentItems.map((i) => i.id))
        const filteredStatic = staticItems.filter((i) => !recentIds.has(i.id))
        return [
          ...recentItems.filter((item) => 
            staticItems.some((i) => i.id === item.id) || 
            results.some((r) => r.id === item.id)
          ),
          ...filteredStatic,
        ]
      }
      return staticItems
    }

    // Filter static items by query
    const lowerQuery = query.toLowerCase()
    const filteredStatic = staticItems.filter(
      (item) =>
        item.title.toLowerCase().includes(lowerQuery) ||
        item.subtitle?.toLowerCase().includes(lowerQuery)
    )

    // Combine with search results
    return [...results, ...filteredStatic]
  }, [results, staticItems, query, recentItems])

  // Group results by category
  const groupedResults = React.useMemo(() => {
    const groups: Record<string, SearchResult[]> = {}
    allResults.forEach((item) => {
      if (!groups[item.category]) {
        groups[item.category] = []
      }
      groups[item.category].push(item)
    })
    return groups
  }, [allResults])

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

  // Reset selected index when query changes
  React.useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  const getIcon = (item: SearchResult) => {
    switch (item.type) {
      case "project":
        return FolderKanban
      case "task":
        return CheckCircle
      case "team":
        return User
      case "navigation":
        switch (item.id) {
          case "nav-home":
            return Home
          case "nav-dashboard":
            return LayoutDashboard
          case "nav-projects":
            return FolderKanban
          case "nav-team":
            return Users
          case "nav-analytics":
            return BarChart3
          case "nav-notifications":
            return Bell
          case "nav-settings":
            return Settings
          default:
            return ArrowRight
        }
      case "action":
        if (item.id === "action-toggle-theme") {
          return theme === "dark" ? Sun : Moon
        }
        return Plus
      default:
        return FileText
    }
  }

  let currentIndex = 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 shadow-2xl sm:max-w-[640px] gap-0">
        <DialogTitle className="sr-only">Command Palette</DialogTitle>
        <div className="flex items-center border-b px-4">
          <Search className="mr-2 h-5 w-5 shrink-0 text-muted-foreground" />
          <Input
            ref={inputRef}
            placeholder="Search projects, team, tasks, pages..."
            className="flex h-14 border-0 bg-transparent text-base placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
            }}
            aria-label="Search"
            aria-autocomplete="list"
            aria-controls="search-results"
            aria-activedescendant={flatResults[selectedIndex]?.id}
          />
          {isSearching ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <Kbd variant="outline" size="sm" className="hidden sm:inline-flex">
              ESC
            </Kbd>
          )}
        </div>

        <div
          ref={listRef}
          id="search-results"
          className="max-h-[400px] overflow-y-auto p-2"
          role="listbox"
          aria-label="Search results"
        >
          {flatResults.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-sm text-muted-foreground">
                {query.trim() 
                  ? `No results found for "${query}"` 
                  : "Start typing to search..."}
              </p>
            </div>
          ) : (
            Object.entries(groupedResults).map(([category, items]) => (
              <div key={category} className="mb-4 last:mb-0">
                <h3 
                  className="mb-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                  aria-label={`${category} results`}
                >
                  {category}
                </h3>
                <div className="space-y-1">
                  {items.map((item) => {
                    const index = currentIndex++
                    const isSelected = index === selectedIndex
                    const Icon = getIcon(item)
                    const isRecent = recentItems.some((i) => i.id === item.id) && !query.trim()

                    return (
                      <motion.button
                        key={item.id}
                        data-index={index}
                        id={item.id}
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
                              {query.trim() 
                                ? highlightMatch(item.title, query)
                                : item.title}
                            </span>
                            {isRecent && (
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
                              {query.trim() 
                                ? highlightMatch(item.subtitle, query)
                                : item.subtitle}
                            </p>
                          )}
                        </div>
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
            {isSearching ? (
              <span className="flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                Searching...
              </span>
            ) : (
              <span>{flatResults.length} results</span>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
