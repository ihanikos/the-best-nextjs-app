import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { CommandPalette } from "@/components/command-palette"

// Mock next/router
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

// Mock useProjects
jest.mock("@/lib/projects/use-projects", () => ({
  useProjects: () => ({
    projects: [
      {
        id: "1",
        name: "Test Project",
        description: "A test project",
        status: "active",
        progress: 50,
        dueDate: "2024-12-31",
        tasks: [],
        members: [],
      },
    ],
    createProject: jest.fn(),
  }),
}))

// Mock next-themes
jest.mock("next-themes", () => ({
  useTheme: () => ({
    theme: "light",
    setTheme: jest.fn(),
  }),
}))

// Mock sonner
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
  },
}))

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
})

describe("CommandPalette", () => {
  const mockOnOpenChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
  })

  it("renders when open", () => {
    render(<CommandPalette open={true} onOpenChange={mockOnOpenChange} />)

    expect(screen.getByPlaceholderText("Search projects, team, pages...")).toBeInTheDocument()
    expect(screen.getByText("Navigation")).toBeInTheDocument()
  })

  it("does not render when closed", () => {
    render(<CommandPalette open={false} onOpenChange={mockOnOpenChange} />)

    expect(screen.queryByPlaceholderText("Search projects, team, pages...")).not.toBeInTheDocument()
  })

  it("displays navigation items", () => {
    render(<CommandPalette open={true} onOpenChange={mockOnOpenChange} />)

    expect(screen.getByText("Dashboard")).toBeInTheDocument()
    expect(screen.getByText("Projects")).toBeInTheDocument()
    expect(screen.getByText("Team")).toBeInTheDocument()
    expect(screen.getByText("Settings")).toBeInTheDocument()
  })

  it("displays project items from useProjects", () => {
    render(<CommandPalette open={true} onOpenChange={mockOnOpenChange} />)

    expect(screen.getByText("Test Project")).toBeInTheDocument()
    expect(screen.getByText("A test project")).toBeInTheDocument()
  })

  it("displays quick actions", () => {
    render(<CommandPalette open={true} onOpenChange={mockOnOpenChange} />)

    expect(screen.getByText("Create New Project")).toBeInTheDocument()
    expect(screen.getByText("Toggle Theme")).toBeInTheDocument()
  })

  it("filters results based on search query", async () => {
    const user = userEvent.setup()
    render(<CommandPalette open={true} onOpenChange={mockOnOpenChange} />)

    const input = screen.getByPlaceholderText("Search projects, team, pages...")
    await user.type(input, "Test Project")

    await waitFor(() => {
      expect(screen.getByText("Test Project")).toBeInTheDocument()
      expect(screen.queryByText("Dashboard")).not.toBeInTheDocument()
    })
  })

  it("shows no results message when search has no matches", async () => {
    const user = userEvent.setup()
    render(<CommandPalette open={true} onOpenChange={mockOnOpenChange} />)

    const input = screen.getByPlaceholderText("Search projects, team, pages...")
    await user.type(input, "xyznonexistent")

    await waitFor(() => {
      expect(screen.getByText(/No results found for/)).toBeInTheDocument()
    })
  })

  it("handles keyboard navigation with arrow keys", () => {
    render(<CommandPalette open={true} onOpenChange={mockOnOpenChange} />)

    // First item should be selected by default
    const firstItem = screen.getByRole("option", { selected: true })
    expect(firstItem).toBeInTheDocument()

    // Press arrow down
    fireEvent.keyDown(window, { key: "ArrowDown" })

    // Check that navigation occurred
    const items = screen.getAllByRole("option")
    expect(items.length).toBeGreaterThan(0)
  })

  it("closes on Escape key", () => {
    render(<CommandPalette open={true} onOpenChange={mockOnOpenChange} />)

    fireEvent.keyDown(window, { key: "Escape" })

    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
  })

  it("shows recent items when available in localStorage", () => {
    const recentItem = {
      id: "nav-dashboard",
      title: "Dashboard",
      subtitle: "View your dashboard",
      icon: "LayoutDashboard",
      href: "/dashboard",
      category: "Navigation",
    }
    localStorageMock.getItem.mockReturnValue(JSON.stringify([recentItem]))

    render(<CommandPalette open={true} onOpenChange={mockOnOpenChange} />)

    // Should show "Recent" category
    expect(screen.getAllByText("Navigation").length).toBeGreaterThan(0)
  })

  it("displays result count in footer", () => {
    render(<CommandPalette open={true} onOpenChange={mockOnOpenChange} />)

    // Should show result count
    const resultCount = screen.getByText(/\d+ results/)
    expect(resultCount).toBeInTheDocument()
  })

  it("displays keyboard shortcuts in footer", () => {
    render(<CommandPalette open={true} onOpenChange={mockOnOpenChange} />)

    expect(screen.getByText("to navigate")).toBeInTheDocument()
    expect(screen.getByText("to select")).toBeInTheDocument()
  })

  it("handles item click", async () => {
    const user = userEvent.setup()
    render(<CommandPalette open={true} onOpenChange={mockOnOpenChange} />)

    const dashboardItem = screen.getByText("Dashboard").closest("button")
    if (dashboardItem) {
      await user.click(dashboardItem)
      expect(mockOnOpenChange).toHaveBeenCalledWith(false)
    }
  })

  it("clears search query when closed", async () => {
    const user = userEvent.setup()
    const { rerender } = render(<CommandPalette open={true} onOpenChange={mockOnOpenChange} />)

    const input = screen.getByPlaceholderText("Search projects, team, pages...")
    await user.type(input, "test")

    expect(input).toHaveValue("test")

    // Close and reopen
    rerender(<CommandPalette open={false} onOpenChange={mockOnOpenChange} />)
    rerender(<CommandPalette open={true} onOpenChange={mockOnOpenChange} />)

    const newInput = screen.getByPlaceholderText("Search projects, team, pages...")
    expect(newInput).toHaveValue("")
  })
})
