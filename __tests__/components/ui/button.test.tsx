import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '@/components/ui/button'

describe('Button', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>)
    const button = screen.getByRole('button', { name: 'Click me' })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('h-9', 'px-4', 'py-2')
  })

  it('renders with custom className', () => {
    render(<Button className="custom-class">Click me</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('custom-class')
  })

  it('renders with different variants', () => {
    const { rerender } = render(<Button variant="destructive">Click me</Button>)
    let button = screen.getByRole('button')
    expect(button).toHaveAttribute('data-variant', 'destructive')

    rerender(<Button variant="outline">Click me</Button>)
    button = screen.getByRole('button')
    expect(button).toHaveAttribute('data-variant', 'outline')
  })

  it('renders with different sizes', () => {
    const { rerender } = render(<Button size="sm">Click me</Button>)
    let button = screen.getByRole('button')
    expect(button).toHaveAttribute('data-size', 'sm')

    rerender(<Button size="lg">Click me</Button>)
    button = screen.getByRole('button')
    expect(button).toHaveAttribute('data-size', 'lg')
  })

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>)
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveClass('disabled:opacity-50')
  })

  it('calls onClick handler when clicked', async () => {
    const user = userEvent.setup()
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    const button = screen.getByRole('button')
    await user.click(button)
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('does not call onClick when disabled', async () => {
    const user = userEvent.setup()
    const handleClick = jest.fn()
    render(<Button disabled onClick={handleClick}>Click me</Button>)
    
    const button = screen.getByRole('button')
    await user.click(button)
    
    expect(handleClick).not.toHaveBeenCalled()
  })
})
