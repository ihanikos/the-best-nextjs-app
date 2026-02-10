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
    const description = screen.getByText(/Deep insights into your application performance/i)
    expect(description).toBeInTheDocument()
  })

  it('renders all performance metric cards', () => {
    render(<AnalyticsPage />)
    
    expect(screen.getByText('Conversion Rate')).toBeInTheDocument()
    expect(screen.getByText('Avg. Session Duration')).toBeInTheDocument()
    expect(screen.getByText('Bounce Rate')).toBeInTheDocument()
    expect(screen.getByText('Pages per Session')).toBeInTheDocument()
  })

  it('renders traffic overview section', () => {
    render(<AnalyticsPage />)
    expect(screen.getByText('Traffic Overview')).toBeInTheDocument()
    expect(screen.getByText('Visitors and page views over time')).toBeInTheDocument()
  })

  it('renders conversion rate trends section', () => {
    render(<AnalyticsPage />)
    expect(screen.getByText('Conversion Rate Trends')).toBeInTheDocument()
    expect(screen.getByText('Weekly conversion performance')).toBeInTheDocument()
  })

  it('renders device distribution section', () => {
    render(<AnalyticsPage />)
    expect(screen.getByText('Traffic by Device')).toBeInTheDocument()
    expect(screen.getByText('User distribution across devices')).toBeInTheDocument()
  })

  it('renders traffic sources section', () => {
    render(<AnalyticsPage />)
    expect(screen.getByText('Traffic Sources')).toBeInTheDocument()
    expect(screen.getByText('Where your visitors are coming from')).toBeInTheDocument()
  })

  it('renders top pages section', () => {
    render(<AnalyticsPage />)
    expect(screen.getByText('Top Pages')).toBeInTheDocument()
    expect(screen.getByText('Most visited pages this period')).toBeInTheDocument()
  })

  it('renders top page entries', () => {
    render(<AnalyticsPage />)
    expect(screen.getByText('/dashboard')).toBeInTheDocument()
    expect(screen.getByText('/analytics')).toBeInTheDocument()
    expect(screen.getByText('/team')).toBeInTheDocument()
    expect(screen.getByText('/settings')).toBeInTheDocument()
    expect(screen.getByText('/profile')).toBeInTheDocument()
  })

  it('renders export button', () => {
    render(<AnalyticsPage />)
    const exportButton = screen.getByRole('button', { name: /export/i })
    expect(exportButton).toBeInTheDocument()
  })

  it('renders filter button', () => {
    render(<AnalyticsPage />)
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('renders date range selector', () => {
    render(<AnalyticsPage />)
    const dateSelector = screen.getByRole('combobox')
    expect(dateSelector).toBeInTheDocument()
  })

  it('renders visitor and page view badges', () => {
    render(<AnalyticsPage />)
    expect(screen.getByText('Visitors')).toBeInTheDocument()
    expect(screen.getByText('Page Views')).toBeInTheDocument()
  })
})
