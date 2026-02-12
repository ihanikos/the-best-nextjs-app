import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { KanbanColumn } from '@/components/kanban-column';
import { Task, TaskStatus, TeamMember } from '@/lib/projects/types';

// Mock dnd-kit
jest.mock('@dnd-kit/core', () => ({
  useDroppable: () => ({
    setNodeRef: jest.fn(),
    isOver: false,
  }),
}));

jest.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  verticalListSortingStrategy: {},
}));

jest.mock('@/components/kanban-task-card', () => ({
  KanbanTaskCard: ({ task }: { task: Task }) => (
    <div data-testid={`task-${task.id}`}>{task.title}</div>
  ),
}));

const mockColumn = {
  id: 'todo' as TaskStatus,
  title: 'To Do',
  color: 'bg-slate-500',
};

const mockTeamMembers: TeamMember[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Developer', avatar: 'JD' },
];

const mockTasks: Task[] = [
  { id: '1', title: 'Task 1', completed: false, status: 'todo' },
  { id: '2', title: 'Task 2', completed: false, status: 'todo' },
];

describe('KanbanColumn', () => {
  const mockOnUpdateTask = jest.fn();
  const mockOnDeleteTask = jest.fn();
  const mockOnCreateTask = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders column title and color indicator', () => {
    render(
      <KanbanColumn
        column={mockColumn}
        tasks={mockTasks}
        teamMembers={mockTeamMembers}
        onUpdateTask={mockOnUpdateTask}
        onDeleteTask={mockOnDeleteTask}
        onCreateTask={mockOnCreateTask}
      />
    );

    expect(screen.getByText('To Do')).toBeInTheDocument();
    expect(document.querySelector('.bg-slate-500')).toBeInTheDocument();
  });

  it('displays task count badge', () => {
    render(
      <KanbanColumn
        column={mockColumn}
        tasks={mockTasks}
        teamMembers={mockTeamMembers}
        onUpdateTask={mockOnUpdateTask}
        onDeleteTask={mockOnDeleteTask}
        onCreateTask={mockOnCreateTask}
      />
    );

    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('renders all tasks in the column', () => {
    render(
      <KanbanColumn
        column={mockColumn}
        tasks={mockTasks}
        teamMembers={mockTeamMembers}
        onUpdateTask={mockOnUpdateTask}
        onDeleteTask={mockOnDeleteTask}
        onCreateTask={mockOnCreateTask}
      />
    );

    expect(screen.getByTestId('task-1')).toBeInTheDocument();
    expect(screen.getByTestId('task-2')).toBeInTheDocument();
  });

  it('calls onCreateTask when add button in header is clicked', () => {
    render(
      <KanbanColumn
        column={mockColumn}
        tasks={mockTasks}
        teamMembers={mockTeamMembers}
        onUpdateTask={mockOnUpdateTask}
        onDeleteTask={mockOnDeleteTask}
        onCreateTask={mockOnCreateTask}
      />
    );

    const addButton = screen.getAllByRole('button', { name: '' })[0];
    fireEvent.click(addButton);

    expect(mockOnCreateTask).toHaveBeenCalled();
  });

  it('shows empty state when no tasks', () => {
    render(
      <KanbanColumn
        column={mockColumn}
        tasks={[]}
        teamMembers={mockTeamMembers}
        onUpdateTask={mockOnUpdateTask}
        onDeleteTask={mockOnDeleteTask}
        onCreateTask={mockOnCreateTask}
      />
    );

    expect(screen.getByText('No tasks')).toBeInTheDocument();
    expect(screen.getByText('Add task')).toBeInTheDocument();
  });

  it('calls onCreateTask from empty state add button', () => {
    render(
      <KanbanColumn
        column={mockColumn}
        tasks={[]}
        teamMembers={mockTeamMembers}
        onUpdateTask={mockOnUpdateTask}
        onDeleteTask={mockOnDeleteTask}
        onCreateTask={mockOnCreateTask}
      />
    );

    const addButton = screen.getByText('Add task');
    fireEvent.click(addButton);

    expect(mockOnCreateTask).toHaveBeenCalled();
  });

  it('displays different column titles correctly', () => {
    const inProgressColumn = {
      id: 'in-progress' as TaskStatus,
      title: 'In Progress',
      color: 'bg-blue-500',
    };

    render(
      <KanbanColumn
        column={inProgressColumn}
        tasks={[]}
        teamMembers={mockTeamMembers}
        onUpdateTask={mockOnUpdateTask}
        onDeleteTask={mockOnDeleteTask}
        onCreateTask={mockOnCreateTask}
      />
    );

    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(document.querySelector('.bg-blue-500')).toBeInTheDocument();
  });
});
