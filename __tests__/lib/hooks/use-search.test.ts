import { renderHook, act, waitFor } from "@testing-library/react"
import { useSearch, highlightMatch } from "@/lib/hooks/use-search"

// Mock projects data
const mockProjects = [
  {
    id: "1",
    name: "Website Redesign",
    description: "Complete overhaul of the company website",
    status: "active",
    progress: 65,
    dueDate: "2026-03-15",
    createdAt: "2026-01-10",
    updatedAt: "2026-02-10",
    owner: { id: "1", name: "Alex Chen", email: "alex@nexus.dev", role: "Product Manager", avatar: "AC" },
    members: [],
    tasks: [
      { id: "1", title: "Design mockups", completed: true, status: "done", priority: "high", dueDate: "2026-03-01" },
      { id: "2", title: "Frontend development", completed: true, status: "done", priority: "medium", dueDate: "2026-03-05" },
    ],
  },
  {
    id: "2",
    name: "Mobile App Development",
    description: "Build a cross-platform mobile application",
    status: "active",
    progress: 40,
    dueDate: "2026-04-30",
    createdAt: "2026-01-15",
    updatedAt: "2026-02-08",
    owner: { id: "2", name: "Sarah Johnson", email: "sarah@nexus.dev", role: "Senior Developer", avatar: "SJ" },
    members: [],
    tasks: [
      { id: "1", title: "UI/UX design", completed: true, status: "done", priority: "high", dueDate: "2026-03-15" },
    ],
  },
]

// Mock useProjects
jest.mock("@/lib/projects/use-projects", () => ({
  useProjects: () => ({
    projects: mockProjects,
  }),
}))

// Mock team members data
jest.mock("@/lib/projects/data", () => ({
  availableTeamMembers: [
    { id: "1", name: "Alex Chen", email: "alex@nexus.dev", role: "Product Manager", avatar: "AC" },
    { id: "2", name: "Sarah Johnson", email: "sarah@nexus.dev", role: "Senior Developer", avatar: "SJ" },
    { id: "3", name: "Mike Williams", email: "mike@nexus.dev", role: "UX Designer", avatar: "MW" },
  ],
}))

describe("useSearch", () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.clearAllMocks()
  })

  it("should return empty results when query is empty", () => {
    const { result } = renderHook(() => useSearch({ query: "" }))

    expect(result.current.results).toEqual([])
    expect(result.current.isSearching).toBe(false)
  })

  it("should search projects by name", async () => {
    const { result } = renderHook(() => useSearch({ query: "Website" }))

    // Wait for debounce
    act(() => {
      jest.advanceTimersByTime(150)
    })

    await waitFor(() => {
      expect(result.current.results.length).toBeGreaterThan(0)
      expect(result.current.results.some((r) => r.title === "Website Redesign")).toBe(true)
    })
  })

  it("should search projects by description", async () => {
    const { result } = renderHook(() => useSearch({ query: "mobile application" }))

    act(() => {
      jest.advanceTimersByTime(150)
    })

    await waitFor(() => {
      expect(result.current.results.some((r) => r.title === "Mobile App Development")).toBe(true)
    })
  })

  it("should search tasks by title", async () => {
    const { result } = renderHook(() => useSearch({ query: "Design mockups" }))

    act(() => {
      jest.advanceTimersByTime(150)
    })

    await waitFor(() => {
      expect(result.current.results.some((r) => r.title === "Design mockups")).toBe(true)
    })
  })

  it("should search team members by name", async () => {
    const { result } = renderHook(() => useSearch({ query: "Sarah Johnson" }))

    act(() => {
      jest.advanceTimersByTime(150)
    })

    await waitFor(() => {
      expect(result.current.results.some((r) => r.title === "Sarah Johnson")).toBe(true)
    })
  })

  it("should search team members by email", async () => {
    const { result } = renderHook(() => useSearch({ query: "alex@nexus.dev" }))

    act(() => {
      jest.advanceTimersByTime(150)
    })

    await waitFor(() => {
      expect(result.current.results.some((r) => r.title === "Alex Chen")).toBe(true)
    })
  })

  it("should search team members by role", async () => {
    const { result } = renderHook(() => useSearch({ query: "Designer" }))

    act(() => {
      jest.advanceTimersByTime(150)
    })

    await waitFor(() => {
      expect(result.current.results.some((r) => r.title === "Mike Williams")).toBe(true)
    })
  })

  it("should show loading state while searching", async () => {
    const { result } = renderHook(() => useSearch({ query: "test" }))

    // Initially should be searching
    expect(result.current.isSearching).toBe(true)

    act(() => {
      jest.advanceTimersByTime(150)
    })

    await waitFor(() => {
      expect(result.current.isSearching).toBe(false)
    })
  })

  it("should limit results to maxResults", async () => {
    const { result } = renderHook(() => useSearch({ query: "a", maxResults: 2 }))

    act(() => {
      jest.advanceTimersByTime(150)
    })

    await waitFor(() => {
      expect(result.current.results.length).toBeLessThanOrEqual(2)
    })
  })

  it("should filter by type when specified", async () => {
    const { result } = renderHook(() =>
      useSearch({
        query: "Alex",
        filters: { types: ["team"] },
      })
    )

    act(() => {
      jest.advanceTimersByTime(150)
    })

    await waitFor(() => {
      expect(result.current.results.every((r) => r.type === "team")).toBe(true)
    })
  })

  it("should filter by category when specified", async () => {
    const { result } = renderHook(() =>
      useSearch({
        query: "a",
        filters: { categories: ["Projects"] },
      })
    )

    act(() => {
      jest.advanceTimersByTime(150)
    })

    await waitFor(() => {
      expect(result.current.results.every((r) => r.category === "Projects")).toBe(true)
    })
  })

  it("should clear results when clearSearch is called", async () => {
    const { result } = renderHook(() => useSearch({ query: "Website" }))

    act(() => {
      jest.advanceTimersByTime(150)
    })

    await waitFor(() => {
      expect(result.current.results.length).toBeGreaterThan(0)
    })

    act(() => {
      result.current.clearSearch()
    })

    expect(result.current.results).toEqual([])
  })

  it("should handle case-insensitive search", async () => {
    const { result } = renderHook(() => useSearch({ query: "WEBSITE" }))

    act(() => {
      jest.advanceTimersByTime(150)
    })

    await waitFor(() => {
      expect(result.current.results.some((r) => r.title === "Website Redesign")).toBe(true)
    })
  })

  it("should return empty results for non-matching query", async () => {
    const { result } = renderHook(() => useSearch({ query: "xyznonexistent" }))

    act(() => {
      jest.advanceTimersByTime(150)
    })

    await waitFor(() => {
      expect(result.current.results).toEqual([])
    })
  })

  it("should debounce search queries", async () => {
    const { result, rerender } = renderHook(
      ({ query }) => useSearch({ query }),
      { initialProps: { query: "test" } }
    )

    // Should be searching immediately
    expect(result.current.isSearching).toBe(true)

    // Change query quickly
    rerender({ query: "testing" })
    rerender({ query: "testing123" })

    // Should still be searching
    expect(result.current.isSearching).toBe(true)

    act(() => {
      jest.advanceTimersByTime(150)
    })

    await waitFor(() => {
      expect(result.current.isSearching).toBe(false)
    })
  })
})

describe("highlightMatch", () => {
  it("should return plain text when query is empty", () => {
    const result = highlightMatch("Hello World", "")
    expect(result).toBe("Hello World")
  })

  it("should highlight matching text", () => {
    const result = highlightMatch("Hello World", "World")
    
    // Result should be an array with highlighted element
    expect(Array.isArray(result)).toBe(true)
  })

  it("should handle case-insensitive highlighting", () => {
    const result = highlightMatch("Hello World", "world")
    
    expect(Array.isArray(result)).toBe(true)
  })

  it("should handle special regex characters in query", () => {
    const result = highlightMatch("Price: $100", "$100")
    
    expect(Array.isArray(result)).toBe(true)
  })

  it("should handle multiple matches", () => {
    const result = highlightMatch("Hello hello HELLO", "hello")
    
    expect(Array.isArray(result)).toBe(true)
  })
})
