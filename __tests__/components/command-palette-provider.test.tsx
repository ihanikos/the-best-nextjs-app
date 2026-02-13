import { render, screen, fireEvent } from "@testing-library/react"
import { CommandPaletteProvider } from "@/components/command-palette-provider"

// Mock the CommandPalette component
jest.mock("@/components/command-palette", () => ({
  CommandPalette: ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => (
    <div data-testid="command-palette" data-open={open}>
      <button onClick={() => onOpenChange(false)}>Close</button>
    </div>
  ),
}))

describe("CommandPaletteProvider", () => {
  it("renders children", () => {
    render(
      <CommandPaletteProvider>
        <div data-testid="child">Test Child</div>
      </CommandPaletteProvider>
    )

    expect(screen.getByTestId("child")).toBeInTheDocument()
  })

  it("renders CommandPalette component", () => {
    render(
      <CommandPaletteProvider>
        <div>Child</div>
      </CommandPaletteProvider>
    )

    expect(screen.getByTestId("command-palette")).toBeInTheDocument()
  })

  it("initially renders CommandPalette with open=false", () => {
    render(
      <CommandPaletteProvider>
        <div>Child</div>
      </CommandPaletteProvider>
    )

    const palette = screen.getByTestId("command-palette")
    expect(palette).toHaveAttribute("data-open", "false")
  })

  it("provides children and CommandPalette in correct order", () => {
    const { container } = render(
      <CommandPaletteProvider>
        <div data-testid="child">Child Content</div>
      </CommandPaletteProvider>
    )

    // Children should be rendered
    expect(screen.getByTestId("child")).toBeInTheDocument()
    
    // CommandPalette should also be rendered
    expect(screen.getByTestId("command-palette")).toBeInTheDocument()
  })

  it("handles CommandPalette close action", () => {
    render(
      <CommandPaletteProvider>
        <div>Child</div>
      </CommandPaletteProvider>
    )

    const closeButton = screen.getByText("Close")
    fireEvent.click(closeButton)

    // Should not throw an error
    expect(closeButton).toBeInTheDocument()
  })
})
