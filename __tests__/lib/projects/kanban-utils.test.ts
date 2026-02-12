import {
  KANBAN_COLUMNS,
  getTaskStatusColor,
  getTaskPriorityColor,
  getTasksByStatus,
} from '@/lib/projects/data'
import { Task, TaskStatus } from '@/lib/projects/types'

describe('Kanban Utils', () => {
  describe('KANBAN_COLUMNS', () => {
    it('has correct column structure', () => {
      expect(KANBAN_COLUMNS).toHaveLength(4)
      expect(KANBAN_COLUMNS.map((c) => c.id)).toEqual([
        'todo',
        'in-progress',
        'in-review',
        'done',
      ])
    })

    it('has correct titles', () => {
      expect(KANBAN_COLUMNS[0].title).toBe('To Do')
      expect(KANBAN_COLUMNS[1].title).toBe('In Progress')
      expect(KANBAN_COLUMNS[2].title).toBe('In Review')
      expect(KANBAN_COLUMNS[3].title).toBe('Done')
    })

    it('has correct colors', () => {
      expect(KANBAN_COLUMNS[0].color).toBe('bg-slate-500')
      expect(KANBAN_COLUMNS[1].color).toBe('bg-blue-500')
      expect(KANBAN_COLUMNS[2].color).toBe('bg-amber-500')
      expect(KANBAN_COLUMNS[3].color).toBe('bg-emerald-500')
    })
  })

  describe('getTaskStatusColor', () => {
    it('returns slate for todo', () => {
      expect(getTaskStatusColor('todo')).toBe('bg-slate-500')
    })

    it('returns blue for in-progress', () => {
      expect(getTaskStatusColor('in-progress')).toBe('bg-blue-500')
    })

    it('returns amber for in-review', () => {
      expect(getTaskStatusColor('in-review')).toBe('bg-amber-500')
    })

    it('returns emerald for done', () => {
      expect(getTaskStatusColor('done')).toBe('bg-emerald-500')
    })
  })

  describe('getTaskPriorityColor', () => {
    it('returns red for high priority', () => {
      expect(getTaskPriorityColor('high')).toBe('bg-red-500')
    })

    it('returns amber for medium priority', () => {
      expect(getTaskPriorityColor('medium')).toBe('bg-amber-500')
    })

    it('returns emerald for low priority', () => {
      expect(getTaskPriorityColor('low')).toBe('bg-emerald-500')
    })

    it('returns slate for undefined priority', () => {
      expect(getTaskPriorityColor(undefined)).toBe('bg-slate-500')
    })
  })

  describe('getTasksByStatus', () => {
    const mockTasks: Task[] = [
      { id: '1', title: 'Task 1', completed: false, status: 'todo' },
      { id: '2', title: 'Task 2', completed: false, status: 'in-progress' },
      { id: '3', title: 'Task 3', completed: true, status: 'done' },
      { id: '4', title: 'Task 4', completed: false, status: 'todo' },
      { id: '5', title: 'Task 5', completed: false, status: 'in-review' },
    ]

    it('filters tasks by todo status', () => {
      const result = getTasksByStatus(mockTasks, 'todo')
      expect(result).toHaveLength(2)
      expect(result.map((t) => t.title)).toEqual(['Task 1', 'Task 4'])
    })

    it('filters tasks by in-progress status', () => {
      const result = getTasksByStatus(mockTasks, 'in-progress')
      expect(result).toHaveLength(1)
      expect(result[0].title).toBe('Task 2')
    })

    it('filters tasks by done status', () => {
      const result = getTasksByStatus(mockTasks, 'done')
      expect(result).toHaveLength(1)
      expect(result[0].title).toBe('Task 3')
    })

    it('returns empty array when no tasks match', () => {
      const tasksWithoutInReview = mockTasks.filter((t) => t.status !== 'in-review')
      const result = getTasksByStatus(tasksWithoutInReview, 'in-review')
      expect(result).toHaveLength(0)
    })

    it('returns empty array for empty input', () => {
      const result = getTasksByStatus([], 'todo')
      expect(result).toHaveLength(0)
    })
  })
})
