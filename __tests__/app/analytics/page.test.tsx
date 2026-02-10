import React from 'react'
import { render, screen } from '@testing-library/react'
import AnalyticsPage from '@/app/analytics/page'

describe('AnalyticsPage', () => {
  it('renders analytics page with header', () => {
    render(<AnalyticsPage />)
    const header = screen.getByText('Analytics')
    expect(header).toBeInTheDocument()
  })

  it('renders description text', () => {
    render(<AnalyticsPage />)
    const description = screen.getByText(/Detailed insights into your application performance/i)
    expect(description).toBeInTheDocument()
  })

  it('renders export report button', () => {
    render(<AnalyticsPage />)
    const exportButton = screen.getByRole('button', { name: /export report/i })
    expect(exportButton).toBeInTheDocument()
  })

  it('renders all stat cards', () => {
    render(<AnalyticsPage />)
    
    expect(screen.getByText('Total Users')).toBeInTheDocument()
    expect(screen.getByText('Active Sessions')).toBeInTheDocument()
    expect(screen.getByText('Avg. Duration')).toBeInTheDocument()
    expect(screen.getByText('Bounce Rate')).toBeInTheDocument()
  })

  it('renders stat values', () => {
    render(<AnalyticsPage />)
    
    expect(screen.getByText('45,231')).toBeInTheDocument()
    expect(screen.getByText('2,350')).toBeInTheDocument()
    expect(screen.getByText('4m 32s')).toBeInTheDocument()
    expect(screen.getByText('32.1%')).toBeInTheDocument()
  })

  it('renders tabs', () => {
    render(<AnalyticsPage />)
    expect(screen.getByRole('tab', { name: 'Overview' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Users' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Revenue' })).toBeInTheDocument()
  })

  it('renders user growth chart section', () => {
    render(<AnalyticsPage />)
    expect(screen.getByText('User Growth')).toBeInTheDocument()
    expect(screen.getByText('Monthly user sessions and revenue trends')).toBeInTheDocument()
  })

  it('renders top pages section', () => {
    render(<AnalyticsPage />)
    expect(screen.getByText('Top Pages')).toBeInTheDocument()
    expect(screen.getByText('Most visited pages on your platform')).toBeInTheDocument()
  })

  it('renders top page entries', () => {
    render(<AnalyticsPage />)
    expect(screen.getByText('/dashboard')).toBeInTheDocument()
    expect(screen.getByText('/analytics')).toBeInTheDocument()
    expect(screen.getByText('/team')).toBeInTheDocument()
    expect(screen.getByText('/settings')).toBeInTheDocument()
  })

})
