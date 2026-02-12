import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { KanbanBoard } from '@/components/kanban-board';
import { Task, TaskStatus, TeamMember } from '@/lib/projects/types';

// Mock dnd-kit
jest.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DragOverlay: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PointerSensor: jest.fn(),
  useSensor: jest.fn(),
  useSensors: jest.fn(),
  defaultDropAnimationSideEffects: jest.fn(),
}));

jest.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  arrayMove: jest.fn(),
  verticalListSortingStrategy: {},
}));

// Mock createPortal
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (children: React.ReactNode) => children,
}));

const mockTeamMembers: TeamMember[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Developer', avatar: 'JD' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'Designer', avatar: 'JS' },
];

const mockTasks: Task[] = [
  { id: '1', title: 'Task 1', completed: false, status: 'todo', priority: 'high', assignedTo: '1' },
  { id: '2', title: 'Task 2', completed: true, status: 'done', priority: 'medium' },
  { id: '3', title: 'Task 3', completed: false, status: 'in-progress', priority: 'low', assignedTo: '2' },
];

describe('KanbanBoard', () => {
  const mockOnUpdateTask = jest.fn();
  const mockOnDeleteTask = jest.fn();
  const mockOnCreateTask = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all columns', () => {
    render(
      <KanbanBoard
        tasks={mockTasks}
        teamMembers={mockTeamMembers}
        onUpdateTask={mockOnUpdateTask}
        onDeleteTask={mockOnDeleteTask}
        onCreateTask={mockOnCreateTask}
      />
    );

    expect(screen.getByText('To Do')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('In Review')).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();
  });

  it('displays tasks in correct columns', () => {
    render(
      <KanbanBoard
        tasks={mockTasks}
        teamMembers={mockTeamMembers}
        onUpdateTask={mockOnUpdateTask}
        onDeleteTask={mockOnDeleteTask}
        onCreateTask={mockOnCreateTask}
      />
    );

    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
    expect(screen.getByText('Task 3')).toBeInTheDocument();
  });

  it('shows task count for each column', () => {
    render(
      <KanbanBoard
        tasks={mockTasks}
        teamMembers={mockTeamMembers}
        onUpdateTask={mockOnUpdateTask}
        onDeleteTask={mockOnDeleteTask}
        onCreateTask={mockOnCreateTask}
      />
    );

    // To Do column should have 1 task
    const todoHeader = screen.getByText('To Do').closest('div');
    expect(todoHeader?.textContent).toContain('1');

    // In Progress column should have 1 task
    const inProgressHeader = screen.getByText('In Progress').closest('div');
    expect(inProgressHeader?.textContent).toContain('1');

    // Done column should have 1 task
    const doneHeader = screen.getByText('Done').closest('div');
    expect(doneHeader?.textContent).toContain('1');
  });

  it('calls onCreateTask when clicking add task button', () => {
    render(
      <KanbanBoard
        tasks={mockTasks}
        teamMembers={mockTeamMembers}
        onUpdateTask={mockOnUpdateTask}
        onDeleteTask={mockOnDeleteTask}
        onCreateTask={mockOnCreateTask}
      />
    );

    const addButtons = screen.getAllByRole('button', { name: '' });
    // Click the first add button (in the To Do column header)
    fireEvent.click(addButtons[0]);

    expect(mockOnCreateTask).toHaveBeenCalledWith('todo');
  });

  it('displays empty state for columns with no tasks', () => {
    render(
      <KanbanBoard
        tasks={mockTasks}
        teamMembers={mockTeamMembers}
        onUpdateTask={mockOnUpdateTask}
        onDeleteTask={mockOnDeleteTask}
        onCreateTask={mockOnCreateTask}
      />
    );

    // In Review column should be empty
    const inReviewColumn = screen.getByText('In Review').closest('div')?.parentElement;
    expect(inReviewColumn?.textContent).toContain('No tasks');
  });

  it('renders without crashing when tasks array is empty', () => {
    render(
      <KanbanBoard
        tasks={[]}
        teamMembers={mockTeamMembers}
        onUpdateTask={mockOnUpdateTask}
        onDeleteTask={mockOnDeleteTask}
        onCreateTask={mockOnCreateTask}
      />
    );

    expect(screen.getByText('To Do')).toBeInTheDocument();
    expect(screen.getByText('No tasks')).toBeInTheDocument();
  });
});
