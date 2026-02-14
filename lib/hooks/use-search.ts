"use client"

import * as React from "react"
import { useProjects } from "@/lib/projects/use-projects"
import { availableTeamMembers } from "@/lib/projects/data"
import { Project, Task } from "@/lib/projects/types"

export type SearchResultType = "project" | "task" | "team" | "navigation" | "action"

export interface SearchResult {
  id: string
  title: string
  subtitle?: string
  type: SearchResultType
  category: string
  href?: string
  action?: () => void
  icon?: string
  projectId?: string
  projectName?: string
  member?: typeof availableTeamMembers[0]
  task?: Task
}

export interface SearchFilters {
  types?: SearchResultType[]
  categories?: string[]
}

export interface UseSearchOptions {
  query: string
  filters?: SearchFilters
  maxResults?: number
  includeNavigation?: boolean
  includeProjects?: boolean
  includeTasks?: boolean
  includeTeam?: boolean
}

export function useSearch({
  query,
  filters,
  maxResults = 20,
  includeNavigation = true,
  includeProjects = true,
  includeTasks = true,
  includeTeam = true,
}: UseSearchOptions) {
  const { projects } = useProjects()
  const [isSearching, setIsSearching] = React.useState(false)
  const [results, setResults] = React.useState<SearchResult[]>([])
  const searchTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  const search = React.useCallback(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    setIsSearching(true)

    // Simulate async search for better UX
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(() => {
      const searchResults: SearchResult[] = []
      const lowerQuery = query.toLowerCase()

      // Search projects
      if (includeProjects && (!filters?.types || filters.types.includes("project"))) {
        projects.forEach((project) => {
          if (
            project.name.toLowerCase().includes(lowerQuery) ||
            project.description.toLowerCase().includes(lowerQuery)
          ) {
            searchResults.push({
              id: `project-${project.id}`,
              title: project.name,
              subtitle: project.description,
              type: "project",
              category: "Projects",
              href: "/projects",
              projectId: project.id,
              projectName: project.name,
            })
          }
        })
      }

      // Search tasks
      if (includeTasks && (!filters?.types || filters.types.includes("task"))) {
        projects.forEach((project) => {
          project.tasks?.forEach((task) => {
            if (task.title.toLowerCase().includes(lowerQuery)) {
              searchResults.push({
                id: `task-${project.id}-${task.id}`,
                title: task.title,
                subtitle: `In ${project.name}`,
                type: "task",
                category: "Tasks",
                href: "/projects",
                projectId: project.id,
                projectName: project.name,
                task,
              })
            }
          })
        })
      }

      // Search team members
      if (includeTeam && (!filters?.types || filters.types.includes("team"))) {
        availableTeamMembers.forEach((member) => {
          if (
            member.name.toLowerCase().includes(lowerQuery) ||
            member.email.toLowerCase().includes(lowerQuery) ||
            member.role.toLowerCase().includes(lowerQuery)
          ) {
            searchResults.push({
              id: `team-${member.id}`,
              title: member.name,
              subtitle: `${member.role} • ${member.email}`,
              type: "team",
              category: "Team Members",
              href: "/team",
              member,
            })
          }
        })
      }

      // Filter by categories if specified
      if (filters?.categories) {
        const filtered = searchResults.filter((result) =>
          filters.categories?.includes(result.category)
        )
        setResults(filtered.slice(0, maxResults))
      } else {
        setResults(searchResults.slice(0, maxResults))
      }

      setIsSearching(false)
    }, 150) // Small debounce for smoother UX
  }, [query, projects, filters, maxResults, includeNavigation, includeProjects, includeTasks, includeTeam])

  React.useEffect(() => {
    search()
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [search])

  const clearSearch = React.useCallback(() => {
    setResults([])
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
  }, [])

  return {
    results,
    isSearching,
    clearSearch,
  }
}

export function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text

  const parts = text.split(new RegExp(`(${escapeRegExp(query)})`, "gi"))
  
  return parts.map((part, index) => {
    if (part.toLowerCase() === query.toLowerCase()) {
      return (
        <mark
          key={index}
          className="bg-primary/20 text-primary font-semibold rounded px-0.5"
        >
          {part}
        </mark>
      )
    }
    return part
  })
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}
