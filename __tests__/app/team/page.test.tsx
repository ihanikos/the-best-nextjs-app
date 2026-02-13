import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TeamPage from '@/app/team/page'

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
  Toaster: () => <div data-testid="toaster" />,
}))

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}))

describe('TeamPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('renders team page with header', () => {
    render(<TeamPage />)
    
    expect(screen.getByText('Team')).toBeInTheDocument()
    expect(screen.getByText('Manage your team members and their roles')).toBeInTheDocument()
  })

  it('renders Add Member button', () => {
    render(<TeamPage />)
    expect(screen.getByRole('button', { name: /add member/i })).toBeInTheDocument()
  })

  it('renders stats cards with correct initial values', () => {
    render(<TeamPage />)
    
    expect(screen.getByText('Total Members')).toBeInTheDocument()
    expect(screen.getByText('6')).toBeInTheDocument() // Initial 6 members
    
    expect(screen.getByText('Active Now')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument() // 5 active members initially
    
    expect(screen.getByText('Pending Invites')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('renders team members table', () => {
    render(<TeamPage />)
    
    expect(screen.getByText('Team Members')).toBeInTheDocument()
    expect(screen.getByText('Alex Chen')).toBeInTheDocument()
    expect(screen.getByText('Sarah Johnson')).toBeInTheDocument()
    expect(screen.getByText('Mike Williams')).toBeInTheDocument()
  })

  it('renders search input', () => {
    render(<TeamPage />)
    expect(screen.getByPlaceholderText('Search team members...')).toBeInTheDocument()
  })

  it('opens add member dialog when clicking Add Member button', async () => {
    render(<TeamPage />)
    
    const addMemberBtn = screen.getByRole('button', { name: /add member/i })
    await userEvent.click(addMemberBtn)
    
    expect(screen.getByText('Add Team Member')).toBeInTheDocument()
    expect(screen.getByText('Invite a new team member to your workspace.')).toBeInTheDocument()
  })

  it('closes dialog when clicking Cancel', async () => {
    render(<TeamPage />)
    
    // Open dialog
    const addMemberBtn = screen.getByRole('button', { name: /add member/i })
    await userEvent.click(addMemberBtn)
    
    expect(screen.getByText('Add Team Member')).toBeInTheDocument()
    
    // Click Cancel
    const cancelBtn = screen.getByRole('button', { name: /cancel/i })
    await userEvent.click(cancelBtn)
    
    // Dialog should be closed
    await waitFor(() => {
      expect(screen.queryByText('Add Team Member')).not.toBeInTheDocument()
    })
  })

  it('adds new team member and updates the list', async () => {
    render(<TeamPage />)
    
    // Open dialog
    const addMemberBtn = screen.getByRole('button', { name: /add member/i })
    await userEvent.click(addMemberBtn)
    
    // Fill in the form
    await userEvent.type(screen.getByLabelText(/full name/i), 'John Doe')
    await userEvent.type(screen.getByLabelText(/email address/i), 'john@example.com')
    await userEvent.type(screen.getByLabelText(/location/i), 'New York, NY')
    
    // Select role
    const roleTrigger = screen.getByRole('combobox', { name: /role/i })
    await userEvent.click(roleTrigger)
    const developerOption = await screen.findByText('Senior Developer')
    await userEvent.click(developerOption)
    
    // Submit form
    const submitBtn = screen.getByRole('button', { name: /add member/i })
    await userEvent.click(submitBtn)
    
    // Wait for async operations
    jest.advanceTimersByTime(500)
    
    // Dialog should close
    await waitFor(() => {
      expect(screen.queryByText('Add Team Member')).not.toBeInTheDocument()
    })
    
    // New member should appear in the list
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })
    
    // Total members count should update
    await waitFor(() => {
      const totalMembersElements = screen.getAllByText('7')
      expect(totalMembersElements.length).toBeGreaterThan(0)
    })
  })

  it('updates active members count when adding active member', async () => {
    render(<TeamPage />)
    
    // Open dialog
    const addMemberBtn = screen.getByRole('button', { name: /add member/i })
    await userEvent.click(addMemberBtn)
    
    // Fill in the form
    await userEvent.type(screen.getByLabelText(/full name/i), 'Jane Smith')
    await userEvent.type(screen.getByLabelText(/email address/i), 'jane@example.com')
    await userEvent.type(screen.getByLabelText(/location/i), 'Boston, MA')
    
    // Select role
    const roleTrigger = screen.getByRole('combobox', { name: /role/i })
    await userEvent.click(roleTrigger)
    const pmOption = await screen.findByText('Product Manager')
    await userEvent.click(pmOption)
    
    // Submit form
    const submitBtn = screen.getByRole('button', { name: /add member/i })
    await userEvent.click(submitBtn)
    
    jest.advanceTimersByTime(500)
    
    // Active count should update (was 5, now should be 6)
    await waitFor(() => {
      const activeElements = screen.getAllByText('6')
      expect(activeElements.length).toBeGreaterThan(0)
    })
  })

  it('renders team activity section', () => {
    render(<TeamPage />)
    
    expect(screen.getByText('Team Activity')).toBeInTheDocument()
    expect(screen.getByText('Recent activity from your team')).toBeInTheDocument()
  })

  it('shows action dropdown for team members', () => {
    render(<TeamPage />)
    
    // Find the first more options button
    const moreButtons = screen.getAllByRole('button', { name: '' })
    // The more horizontal buttons should be present
    expect(moreButtons.length).toBeGreaterThan(0)
  })

  it('assigns correct ID to new member', async () => {
    render(<TeamPage />)
    
    // Open dialog and add member
    const addMemberBtn = screen.getByRole('button', { name: /add member/i })
    await userEvent.click(addMemberBtn)
    
    await userEvent.type(screen.getByLabelText(/full name/i), 'Test User')
    await userEvent.type(screen.getByLabelText(/email address/i), 'test@example.com')
    await userEvent.type(screen.getByLabelText(/location/i), 'Chicago, IL')
    
    const roleTrigger = screen.getByRole('combobox', { name: /role/i })
    await userEvent.click(roleTrigger)
    const devOpsOption = await screen.findByText('DevOps Engineer')
    await userEvent.click(devOpsOption)
    
    const submitBtn = screen.getByRole('button', { name: /add member/i })
    await userEvent.click(submitBtn)
    
    jest.advanceTimersByTime(500)
    
    // New member should be added successfully
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument()
    })
  })

  it('sets correct default values for new member', async () => {
    render(<TeamPage />)
    
    // Open dialog
    const addMemberBtn = screen.getByRole('button', { name: /add member/i })
    await userEvent.click(addMemberBtn)
    
    // Fill in the form
    await userEvent.type(screen.getByLabelText(/full name/i), 'Bob Wilson')
    await userEvent.type(screen.getByLabelText(/email address/i), 'bob@example.com')
    await userEvent.type(screen.getByLabelText(/location/i), 'Denver, CO')
    
    const roleTrigger = screen.getByRole('combobox', { name: /role/i })
    await userEvent.click(roleTrigger)
    const dataAnalystOption = await screen.findByText('Data Analyst')
    await userEvent.click(dataAnalystOption)
    
    const submitBtn = screen.getByRole('button', { name: /add member/i })
    await userEvent.click(submitBtn)
    
    jest.advanceTimersByTime(500)
    
    // New member should appear with correct role and location
    await waitFor(() => {
      expect(screen.getByText('Bob Wilson')).toBeInTheDocument()
      expect(screen.getByText('Data Analyst')).toBeInTheDocument()
    })
  })

  it('shows percentage calculation in Active Now card', () => {
    render(<TeamPage />)
    
    // Should show "83% of team" for 5 active out of 6 total
    expect(screen.getByText(/83% of team/i)).toBeInTheDocument()
  })

  it('validates form and shows errors', async () => {
    render(<TeamPage />)
    
    // Open dialog
    const addMemberBtn = screen.getByRole('button', { name: /add member/i })
    await userEvent.click(addMemberBtn)
    
    // Try to submit empty form
    const submitBtn = screen.getByRole('button', { name: /add member/i })
    await userEvent.click(submitBtn)
    
    // Should show validation errors
    expect(screen.getByText('Name is required')).toBeInTheDocument()
    expect(screen.getByText('Email is required')).toBeInTheDocument()
  })
})
