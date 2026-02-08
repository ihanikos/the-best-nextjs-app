import React from 'react'
import { render, screen } from '@testing-library/react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
} from '@/components/ui/card'

describe('Card components', () => {
  it('renders Card with default props', () => {
    render(<Card>Card content</Card>)
    const card = screen.getByText('Card content')
    expect(card).toBeInTheDocument()
    expect(card).toHaveAttribute('data-slot', 'card')
  })

  it('renders Card with custom className', () => {
    render(<Card className="custom-class">Card content</Card>)
    const card = screen.getByText('Card content')
    expect(card).toHaveClass('custom-class')
  })

  it('renders complete card structure', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card description</CardDescription>
          <CardAction>Action</CardAction>
        </CardHeader>
        <CardContent>Card content</CardContent>
        <CardFooter>Footer content</CardFooter>
      </Card>
    )

    expect(screen.getByText('Card Title')).toBeInTheDocument()
    expect(screen.getByText('Card description')).toBeInTheDocument()
    expect(screen.getByText('Card content')).toBeInTheDocument()
    expect(screen.getByText('Footer content')).toBeInTheDocument()
    expect(screen.getByText('Action')).toBeInTheDocument()

    const cardTitle = screen.getByText('Card Title')
    expect(cardTitle).toHaveAttribute('data-slot', 'card-title')
    expect(cardTitle).toHaveClass('font-semibold')

    const cardDescription = screen.getByText('Card description')
    expect(cardDescription).toHaveAttribute('data-slot', 'card-description')
    expect(cardDescription).toHaveClass('text-muted-foreground', 'text-sm')

    const cardContent = screen.getByText('Card content')
    expect(cardContent).toHaveAttribute('data-slot', 'card-content')
    expect(cardContent).toHaveClass('px-6')

    const cardFooter = screen.getByText('Footer content')
    expect(cardFooter).toHaveAttribute('data-slot', 'card-footer')
  })
})
