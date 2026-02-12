import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { KanbanTaskCard } from '@/components/kanban-task-card';
import { Task, TeamMember } from '@/lib/projects/types';

// Mock dnd-kit
jest.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: jest.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
}));

jest.mock('@dnd-kit/utilities', () => ({
  CSS: {
    Transform: {
      toString: () => '',
    },
  },
}));

const mockTeamMembers: TeamMember[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Developer', avatar: 'JD' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'Designer', avatar: 'JS' },
];

const mockTask: Task = {
  id: '1',
  title: 'Test Task',
  completed: false,
  status: 'todo',
  priority: 'high',
  assignedTo: '1',
  dueDate: '2026-03-15',
};

describe('KanbanTaskCard', () => {
  const mockOnUpdateTask = jest.fn();
  const mockOnDeleteTask = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock confirm
    global.confirm = jest.fn(() => true);
  });

  it('renders task title', () => {
    render(
      <KanbanTaskCard
        task={mockTask}
        teamMembers={mockTeamMembers}
        onUpdateTask={mockOnUpdateTask}
        onDeleteTask={mockOnDeleteTask}
      />
    );

    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  it('displays completed state with strikethrough', () => {
    const completedTask = { ...mockTask, completed: true };
    render(
      <KanbanTaskCard
        task={completedTask}
        teamMembers={mockTeamMembers}
        onUpdateTask={mockOnUpdateTask}
        onDeleteTask={mockOnDeleteTask}
      />
    );

    const taskText = screen.getByText('Test Task');
    expect(taskText).toHaveClass('line-through');
  });

  it('shows assignee avatar when task is assigned', () => {
    render(
      <KanbanTaskCard
        task={mockTask}
        teamMembers={mockTeamMembers}
        onUpdateTask={mockOnUpdateTask}
        onDeleteTask={mockOnDeleteTask}
      />
    );

    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('shows unassigned placeholder when task has no assignee', () => {
    const unassignedTask = { ...mockTask, assignedTo: undefined };
    render(
      <KanbanTaskCard
        task={unassignedTask}
        teamMembers={mockTeamMembers}
        onUpdateTask={mockOnUpdateTask}
        onDeleteTask={mockOnDeleteTask}
      />
    );

    expect(screen.getByText('?')).toBeInTheDocument();
  });

  it('displays due date when present', () => {
    render(
      <KanbanTaskCard
        task={mockTask}
        teamMembers={mockTeamMembers}
        onUpdateTask={mockOnUpdateTask}
        onDeleteTask={mockOnDeleteTask}
      />
    );

    expect(screen.getByText('Mar 15')).toBeInTheDocument();
  });

  it('calls onUpdateTask when toggle completion is clicked', () => {
    render(
      <KanbanTaskCard
        task={mockTask}
        teamMembers={mockTeamMembers}
        onUpdateTask={mockOnUpdateTask}
        onDeleteTask={mockOnDeleteTask}
      />
    );

    const toggleButton = screen.getByRole('button', { name: '' });
    fireEvent.click(toggleButton);

    expect(mockOnUpdateTask).toHaveBeenCalledWith('1', {
      completed: true,
      status: 'done',
    });
  });

  it('calls onDeleteTask when delete is confirmed', () => {
    render(
      <KanbanTaskCard
        task={mockTask}
        teamMembers={mockTeamMembers}
        onUpdateTask={mockOnUpdateTask}
        onDeleteTask={mockOnDeleteTask}
      />
    );

    // Open dropdown menu
    const menuButton = screen.getAllByRole('button')[1];
    fireEvent.click(menuButton);

    // Click delete option
    const deleteOption = screen.getByText('Delete');
    fireEvent.click(deleteOption);

    expect(mockOnDeleteTask).toHaveBeenCalledWith('1');
  });

  it('shows priority indicator for high priority', () => {
    render(
      <KanbanTaskCard
        task={mockTask}
        teamMembers={mockTeamMembers}
        onUpdateTask={mockOnUpdateTask}
        onDeleteTask={mockOnDeleteTask}
      />
    );

    expect(document.querySelector('[title="Priority: high"]')).toBeInTheDocument();
  });

  it('shows priority indicator for low priority', () => {
    const lowPriorityTask = { ...mockTask, priority: 'low' };
    render(
      <KanbanTaskCard
        task={lowPriorityTask}
        teamMembers={mockTeamMembers}
        onUpdateTask={mockOnUpdateTask}
        onDeleteTask={mockOnDeleteTask}
      />
    );

    expect(document.querySelector('[title="Priority: low"]')).toBeInTheDocument();
  });
});
