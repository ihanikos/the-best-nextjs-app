import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "@jest/globals"
import Home from "@/app/page"

describe("Home Page", () => {
  it("renders main heading", () => {
    render(<Home />)
    expect(screen.getByText(/Build the Future of/)).toBeInTheDocument()
    expect(screen.getByText(/Productivity/)).toBeInTheDocument()
  })

  it("renders hero section CTA buttons", () => {
    render(<Home />)
    expect(screen.getByText(/Get Started Free/)).toBeInTheDocument()
    expect(screen.getByText(/Learn More/)).toBeInTheDocument()
  })

  it("renders feature cards", () => {
    render(<Home />)
    expect(screen.getByText(/Intuitive Dashboard/)).toBeInTheDocument()
    expect(screen.getByText(/Advanced Analytics/)).toBeInTheDocument()
    expect(screen.getByText(/Team Collaboration/)).toBeInTheDocument()
    expect(screen.getByText(/Flexible Settings/)).toBeInTheDocument()
  })

  it("renders statistics section", () => {
    render(<Home />)
    expect(screen.getByText(/10M\+/)).toBeInTheDocument()
    expect(screen.getByText(/Active Users/)).toBeInTheDocument()
    expect(screen.getByText(/99\.9%/)).toBeInTheDocument()
    expect(screen.getByText(/Uptime/)).toBeInTheDocument()
    expect(screen.getByText(/150\+/)).toBeInTheDocument()
    expect(screen.getByText(/Countries/)).toBeInTheDocument()
    expect(screen.getByText(/4\.9\/5/)).toBeInTheDocument()
    expect(screen.getByText(/User Rating/)).toBeInTheDocument()
  })

  it("renders benefits section", () => {
    render(<Home />)
    expect(screen.getByText(/Real-time data synchronization/)).toBeInTheDocument()
    expect(screen.getByText(/Enterprise-grade security/)).toBeInTheDocument()
    expect(screen.getByText(/Lightning-fast performance/)).toBeInTheDocument()
    expect(screen.getByText(/24\/7 customer support/)).toBeInTheDocument()
    expect(screen.getByText(/Seamless integrations/)).toBeInTheDocument()
    expect(screen.getByText(/Regular updates/)).toBeInTheDocument()
  })

  it("renders why choose Nexus section", () => {
    render(<Home />)
    expect(screen.getByText(/Why choose Nexus\?/)).toBeInTheDocument()
    expect(screen.getByText(/Lightning Fast/)).toBeInTheDocument()
    expect(screen.getByText(/Enterprise Security/)).toBeInTheDocument()
    expect(screen.getByText(/Scale Without Limits/)).toBeInTheDocument()
  })

  it("renders final CTA section", () => {
    render(<Home />)
    expect(screen.getByText(/Ready to transform your workflow\?/)).toBeInTheDocument()
    expect(screen.getByText(/Start Your Free Trial/)).toBeInTheDocument()
    expect(screen.getByText(/No credit card required/)).toBeInTheDocument()
    expect(screen.getByText(/14-day free trial/)).toBeInTheDocument()
  })

  it("renders footer", () => {
    render(<Home />)
    expect(screen.getByText(/© 2026 Nexus/)).toBeInTheDocument()
    expect(screen.getByText(/Built with Next.js, React, and Tailwind CSS/)).toBeInTheDocument()
  })

  it("renders new feature badge", () => {
    render(<Home />)
    expect(screen.getByText(/New Features Available/)).toBeInTheDocument()
  })

  it("renders hero description", () => {
    render(<Home />)
    expect(screen.getByText(/Experience the next generation of team collaboration and data analytics/)).toBeInTheDocument()
  })

  it("renders trusted section heading", () => {
    render(<Home />)
    expect(screen.getByText(/Trusted by teams worldwide/)).toBeInTheDocument()
    expect(screen.getByText(/Join thousands of companies already using Nexus/)).toBeInTheDocument()
  })

  it("renders features section heading", () => {
    render(<Home />)
    expect(screen.getByText(/Everything you need to succeed/)).toBeInTheDocument()
    expect(screen.getByText(/Powerful features designed for modern teams/)).toBeInTheDocument()
  })

  it("has working navigation links to dashboard", () => {
    render(<Home />)
    const getStartedButtons = screen.getAllByText(/Get Started Free|Start Your Free Trial/)
    expect(getStartedButtons.length).toBeGreaterThan(0)
  })
})
