import React from 'react'
import { render, screen } from '@testing-library/react'
import DashboardPage from '@/app/dashboard/page'

describe('DashboardPage', () => {
  it('renders dashboard with header', () => {
    render(<DashboardPage />)
    const header = screen.getByText('Dashboard')
    expect(header).toBeInTheDocument()
  })

  it('renders welcome message', () => {
    render(<DashboardPage />)
    const welcomeMessage = screen.getByText(/Welcome back! Here's your overview/i)
    expect(welcomeMessage).toBeInTheDocument()
  })

  it('renders all stat cards', () => {
    render(<DashboardPage />)
    
    expect(screen.getByText('Total Revenue')).toBeInTheDocument()
    expect(screen.getByText('Active Users')).toBeInTheDocument()
    expect(screen.getByText('Engagement Rate')).toBeInTheDocument()
    expect(screen.getByText('Bounce Rate')).toBeInTheDocument()
  })

  it('renders revenue chart section', () => {
    render(<DashboardPage />)
    expect(screen.getByText('Revenue Overview')).toBeInTheDocument()
    expect(screen.getByText('Monthly revenue and user growth')).toBeInTheDocument()
  })

  it('renders device distribution section', () => {
    render(<DashboardPage />)
    expect(screen.getByText('Traffic by Device')).toBeInTheDocument()
    expect(screen.getByText('User distribution across devices')).toBeInTheDocument()
  })

  it('renders recent activity section', () => {
    render(<DashboardPage />)
    expect(screen.getByText('Recent Activity')).toBeInTheDocument()
    expect(screen.getByText('Latest actions from your team')).toBeInTheDocument()
  })

  it('renders monthly goals section', () => {
    render(<DashboardPage />)
    expect(screen.getByText('Monthly Goals')).toBeInTheDocument()
    expect(screen.getByText('Track your progress towards targets')).toBeInTheDocument()
  })

  it('renders header buttons', () => {
    render(<DashboardPage />)
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
  })
})
