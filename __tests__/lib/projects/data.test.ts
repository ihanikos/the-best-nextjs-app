import { initialProjects, availableTeamMembers, filterProjects, getStatusColor, getStatusBadgeVariant } from '@/lib/projects/data'
import { Project } from '@/lib/projects/types'

describe('Project Data', () => {
  it('has initial projects defined', () => {
    expect(initialProjects).toBeDefined()
    expect(initialProjects.length).toBeGreaterThan(0)
  })

  it('has valid project structure', () => {
    initialProjects.forEach((project) => {
      expect(project.id).toBeDefined()
      expect(project.name).toBeDefined()
      expect(project.status).toBeDefined()
      expect(['active', 'on-hold', 'completed', 'archived']).toContain(project.status)
      expect(project.progress).toBeGreaterThanOrEqual(0)
      expect(project.progress).toBeLessThanOrEqual(100)
      expect(project.owner).toBeDefined()
      expect(project.members).toBeDefined()
      expect(project.tasks).toBeDefined()
    })
  })

  it('has available team members defined', () => {
    expect(availableTeamMembers).toBeDefined()
    expect(availableTeamMembers.length).toBeGreaterThan(0)
  })

  it('has valid team member structure', () => {
    availableTeamMembers.forEach((member) => {
      expect(member.id).toBeDefined()
      expect(member.name).toBeDefined()
      expect(member.email).toBeDefined()
      expect(member.role).toBeDefined()
      expect(member.avatar).toBeDefined()
    })
  })
})

describe('filterProjects', () => {
  it('returns all projects when no filters are applied', () => {
    const result = filterProjects(initialProjects, {})
    expect(result).toHaveLength(initialProjects.length)
  })

  it('filters by status', () => {
    const result = filterProjects(initialProjects, { status: 'active' })
    expect(result.every((p) => p.status === 'active')).toBe(true)
  })

  it('filters by search term', () => {
    const result = filterProjects(initialProjects, { search: 'Website' })
    expect(result.length).toBeGreaterThan(0)
    expect(result[0].name).toContain('Website')
  })

  it('is case insensitive when filtering', () => {
    const lowerResult = filterProjects(initialProjects, { search: 'website' })
    const upperResult = filterProjects(initialProjects, { search: 'WEBSITE' })
    expect(lowerResult.length).toBe(upperResult.length)
  })

  it('returns empty array for no matches', () => {
    const result = filterProjects(initialProjects, { search: 'xyznonexistent' })
    expect(result).toHaveLength(0)
  })
})

describe('getStatusColor', () => {
  it('returns emerald for active status', () => {
    expect(getStatusColor('active')).toBe('bg-emerald-500')
  })

  it('returns amber for on-hold status', () => {
    expect(getStatusColor('on-hold')).toBe('bg-amber-500')
  })

  it('returns blue for completed status', () => {
    expect(getStatusColor('completed')).toBe('bg-blue-500')
  })

  it('returns slate for archived status', () => {
    expect(getStatusColor('archived')).toBe('bg-slate-500')
  })
})

describe('getStatusBadgeVariant', () => {
  it('returns default for active status', () => {
    expect(getStatusBadgeVariant('active')).toBe('default')
  })

  it('returns secondary for on-hold status', () => {
    expect(getStatusBadgeVariant('on-hold')).toBe('secondary')
  })

  it('returns default for completed status', () => {
    expect(getStatusBadgeVariant('completed')).toBe('default')
  })

  it('returns outline for archived status', () => {
    expect(getStatusBadgeVariant('archived')).toBe('outline')
  })
})
