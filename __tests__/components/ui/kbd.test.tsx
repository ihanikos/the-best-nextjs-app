import { render, screen } from "@testing-library/react"
import { Kbd } from "@/components/ui/kbd"

describe("Kbd", () => {
  it("renders children correctly", () => {
    render(<Kbd>⌘K</Kbd>)

    expect(screen.getByText("⌘K")).toBeInTheDocument()
  })

  it("renders with default variant", () => {
    const { container } = render(<Kbd>Enter</Kbd>)

    const kbd = container.querySelector("kbd")
    expect(kbd).toHaveClass("bg-muted")
    expect(kbd).toHaveClass("text-muted-foreground")
  })

  it("renders with outline variant", () => {
    const { container } = render(<Kbd variant="outline">Shift</Kbd>)

    const kbd = container.querySelector("kbd")
    expect(kbd).toHaveClass("bg-background")
    expect(kbd).toHaveClass("text-foreground")
  })

  it("renders with secondary variant", () => {
    const { container } = render(<Kbd variant="secondary">Ctrl</Kbd>)

    const kbd = container.querySelector("kbd")
    expect(kbd).toHaveClass("bg-secondary")
    expect(kbd).toHaveClass("text-secondary-foreground")
  })

  it("renders with default size", () => {
    const { container } = render(<Kbd>A</Kbd>)

    const kbd = container.querySelector("kbd")
    expect(kbd).toHaveClass("h-6")
    expect(kbd).toHaveClass("min-w-6")
  })

  it("renders with small size", () => {
    const { container } = render(<Kbd size="sm">B</Kbd>)

    const kbd = container.querySelector("kbd")
    expect(kbd).toHaveClass("h-5")
    expect(kbd).toHaveClass("min-w-5")
    expect(kbd).toHaveClass("text-[10px]")
  })

  it("renders with large size", () => {
    const { container } = render(<Kbd size="lg">C</Kbd>)

    const kbd = container.querySelector("kbd")
    expect(kbd).toHaveClass("h-7")
    expect(kbd).toHaveClass("min-w-7")
  })

  it("accepts custom className", () => {
    const { container } = render(<Kbd className="custom-class">D</Kbd>)

    const kbd = container.querySelector("kbd")
    expect(kbd).toHaveClass("custom-class")
  })

  it("passes through additional props", () => {
    render(<Kbd data-testid="test-kbd">E</Kbd>)

    expect(screen.getByTestId("test-kbd")).toBeInTheDocument()
  })

  it("renders with correct semantic element", () => {
    const { container } = render(<Kbd>F</Kbd>)

    const kbd = container.querySelector("kbd")
    expect(kbd?.tagName).toBe("KBD")
  })

  it("renders multiple keyboard shortcuts", () => {
    render(
      <>
        <Kbd>⌘</Kbd>
        <Kbd>K</Kbd>
      </>
    )

    expect(screen.getByText("⌘")).toBeInTheDocument()
    expect(screen.getByText("K")).toBeInTheDocument()
  })
})
