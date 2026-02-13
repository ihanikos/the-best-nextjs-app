import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AddTeamMemberDialog } from '@/app/team/add-team-member-dialog'

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

import { toast } from 'sonner'

describe('AddTeamMemberDialog', () => {
  const mockOnOpenChange = jest.fn()
  const mockOnSubmit = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  const renderDialog = (props = {}) => {
    return render(
      <AddTeamMemberDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSubmit={mockOnSubmit}
        {...props}
      />
    )
  }

  it('renders dialog with correct title and description', () => {
    renderDialog()
    
    expect(screen.getByText('Add Team Member')).toBeInTheDocument()
    expect(screen.getByText('Invite a new team member to your workspace.')).toBeInTheDocument()
  })

  it('renders all form fields', () => {
    renderDialog()
    
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/role/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/location/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/status/i)).toBeInTheDocument()
  })

  it('renders Cancel and Add Member buttons', () => {
    renderDialog()
    
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add member/i })).toBeInTheDocument()
  })

  it('closes dialog when Cancel button is clicked', async () => {
    renderDialog()
    
    const cancelBtn = screen.getByRole('button', { name: /cancel/i })
    await userEvent.click(cancelBtn)
    
    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
  })

  it('validates required fields - name', async () => {
    renderDialog()
    
    const submitBtn = screen.getByRole('button', { name: /add member/i })
    await userEvent.click(submitBtn)
    
    expect(screen.getByText('Name is required')).toBeInTheDocument()
    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('validates required fields - email', async () => {
    renderDialog()
    
    const nameInput = screen.getByLabelText(/full name/i)
    await userEvent.type(nameInput, 'John Doe')
    
    const submitBtn = screen.getByRole('button', { name: /add member/i })
    await userEvent.click(submitBtn)
    
    expect(screen.getByText('Email is required')).toBeInTheDocument()
    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('validates email format', async () => {
    renderDialog()
    
    const nameInput = screen.getByLabelText(/full name/i)
    await userEvent.type(nameInput, 'John Doe')
    
    const emailInput = screen.getByLabelText(/email address/i)
    await userEvent.type(emailInput, 'invalid-email')
    
    const submitBtn = screen.getByRole('button', { name: /add member/i })
    await userEvent.click(submitBtn)
    
    expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()
    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('validates required fields - role', async () => {
    renderDialog()
    
    const nameInput = screen.getByLabelText(/full name/i)
    await userEvent.type(nameInput, 'John Doe')
    
    const emailInput = screen.getByLabelText(/email address/i)
    await userEvent.type(emailInput, 'john@example.com')
    
    const submitBtn = screen.getByRole('button', { name: /add member/i })
    await userEvent.click(submitBtn)
    
    expect(screen.getByText('Role is required')).toBeInTheDocument()
    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('validates required fields - location', async () => {
    renderDialog()
    
    const nameInput = screen.getByLabelText(/full name/i)
    await userEvent.type(nameInput, 'John Doe')
    
    const emailInput = screen.getByLabelText(/email address/i)
    await userEvent.type(emailInput, 'john@example.com')
    
    // Open role dropdown and select an option
    const roleTrigger = screen.getByRole('combobox', { name: /role/i })
    await userEvent.click(roleTrigger)
    
    const developerOption = await screen.findByText('Senior Developer')
    await userEvent.click(developerOption)
    
    const submitBtn = screen.getByRole('button', { name: /add member/i })
    await userEvent.click(submitBtn)
    
    expect(screen.getByText('Location is required')).toBeInTheDocument()
    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('submits form successfully with valid data', async () => {
    renderDialog()
    
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
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        role: 'Senior Developer',
        status: 'active',
        location: 'New York, NY',
        avatar: 'JD',
      })
    })
    
    expect(toast.success).toHaveBeenCalledWith('Team member "John Doe" added successfully')
    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
  })

  it('generates correct avatar initials from name', async () => {
    renderDialog()
    
    await userEvent.type(screen.getByLabelText(/full name/i), 'Mary Jane Watson')
    await userEvent.type(screen.getByLabelText(/email address/i), 'mary@example.com')
    await userEvent.type(screen.getByLabelText(/location/i), 'Los Angeles, CA')
    
    const roleTrigger = screen.getByRole('combobox', { name: /role/i })
    await userEvent.click(roleTrigger)
    const designerOption = await screen.findByText('UX Designer')
    await userEvent.click(designerOption)
    
    const submitBtn = screen.getByRole('button', { name: /add member/i })
    await userEvent.click(submitBtn)
    
    jest.advanceTimersByTime(500)
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          avatar: 'MJ',
        })
      )
    })
  })

  it('allows changing status to offline', async () => {
    renderDialog()
    
    // Open status dropdown
    const statusTriggers = screen.getAllByRole('combobox')
    const statusTrigger = statusTriggers[statusTriggers.length - 1] // Status is the last dropdown
    await userEvent.click(statusTrigger)
    
    const offlineOption = await screen.findByText('Offline')
    await userEvent.click(offlineOption)
    
    // Fill other required fields
    await userEvent.type(screen.getByLabelText(/full name/i), 'Jane Smith')
    await userEvent.type(screen.getByLabelText(/email address/i), 'jane@example.com')
    await userEvent.type(screen.getByLabelText(/location/i), 'Boston, MA')
    
    const roleTrigger = screen.getByRole('combobox', { name: /role/i })
    await userEvent.click(roleTrigger)
    const pmOption = await screen.findByText('Product Manager')
    await userEvent.click(pmOption)
    
    const submitBtn = screen.getByRole('button', { name: /add member/i })
    await userEvent.click(submitBtn)
    
    jest.advanceTimersByTime(500)
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'offline',
        })
      )
    })
  })

  it('shows loading state during submission', async () => {
    renderDialog()
    
    // Fill in the form
    await userEvent.type(screen.getByLabelText(/full name/i), 'John Doe')
    await userEvent.type(screen.getByLabelText(/email address/i), 'john@example.com')
    await userEvent.type(screen.getByLabelText(/location/i), 'New York, NY')
    
    const roleTrigger = screen.getByRole('combobox', { name: /role/i })
    await userEvent.click(roleTrigger)
    const developerOption = await screen.findByText('Senior Developer')
    await userEvent.click(developerOption)
    
    const submitBtn = screen.getByRole('button', { name: /add member/i })
    await userEvent.click(submitBtn)
    
    expect(screen.getByRole('button', { name: /adding/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled()
  })

  it('clears form after successful submission', async () => {
    renderDialog()
    
    // Fill in the form
    const nameInput = screen.getByLabelText(/full name/i)
    await userEvent.type(nameInput, 'John Doe')
    
    const emailInput = screen.getByLabelText(/email address/i)
    await userEvent.type(emailInput, 'john@example.com')
    
    const locationInput = screen.getByLabelText(/location/i)
    await userEvent.type(locationInput, 'New York, NY')
    
    const roleTrigger = screen.getByRole('combobox', { name: /role/i })
    await userEvent.click(roleTrigger)
    const developerOption = await screen.findByText('Senior Developer')
    await userEvent.click(developerOption)
    
    const submitBtn = screen.getByRole('button', { name: /add member/i })
    await userEvent.click(submitBtn)
    
    jest.advanceTimersByTime(500)
    
    // Dialog should close, so we check the onOpenChange was called
    await waitFor(() => {
      expect(mockOnOpenChange).toHaveBeenCalledWith(false)
    })
  })

  it('resets form and errors when dialog is reopened', async () => {
    const { rerender } = renderDialog({ open: true })
    
    // Try to submit empty form to trigger errors
    const submitBtn = screen.getByRole('button', { name: /add member/i })
    await userEvent.click(submitBtn)
    
    expect(screen.getByText('Name is required')).toBeInTheDocument()
    
    // Close dialog
    rerender(
      <AddTeamMemberDialog
        open={false}
        onOpenChange={mockOnOpenChange}
        onSubmit={mockOnSubmit}
      />
    )
    
    // Reopen dialog
    rerender(
      <AddTeamMemberDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSubmit={mockOnSubmit}
      />
    )
    
    // Errors should be cleared
    expect(screen.queryByText('Name is required')).not.toBeInTheDocument()
  })
})
