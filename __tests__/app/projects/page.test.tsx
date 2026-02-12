import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProjectsPage from '@/app/projects/page'
import { initialProjects } from '@/lib/projects/data'

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

// Mock window.confirm
Object.defineProperty(window, 'confirm', {
  writable: true,
  value: jest.fn(),
})

describe('ProjectsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders projects page with header', () => {
    render(<ProjectsPage />)
    
    expect(screen.getByText('Projects')).toBeInTheDocument()
    expect(screen.getByText('Manage and track all your team projects')).toBeInTheDocument()
  })

  it('renders new project button', () => {
    render(<ProjectsPage />)
    expect(screen.getByRole('button', { name: /new project/i })).toBeInTheDocument()
  })

  it('renders stats cards', () => {
    render(<ProjectsPage />)
    
    expect(screen.getByText('Total Projects')).toBeInTheDocument()
    expect(screen.getByText('Active')).toBeInTheDocument()
    expect(screen.getByText('Completed')).toBeInTheDocument()
    expect(screen.getByText('Avg Progress')).toBeInTheDocument()
  })

  it('displays all initial projects', () => {
    render(<ProjectsPage />)
    
    initialProjects.forEach((project) => {
      expect(screen.getByText(project.name)).toBeInTheDocument()
    })
  })

  it('renders search input', () => {
    render(<ProjectsPage />)
    expect(screen.getByPlaceholderText('Search projects...')).toBeInTheDocument()
  })

  it('opens create project dialog when clicking New Project button', async () => {
    render(<ProjectsPage />)
    
    const newProjectBtn = screen.getByRole('button', { name: /new project/i })
    await userEvent.click(newProjectBtn)
    
    expect(screen.getByText('Create New Project')).toBeInTheDocument()
  })

  it('renders filter dropdowns', () => {
    render(<ProjectsPage />)
    
    expect(screen.getByText('All Status')).toBeInTheDocument()
    expect(screen.getByText('Last Updated')).toBeInTheDocument()
  })
})
