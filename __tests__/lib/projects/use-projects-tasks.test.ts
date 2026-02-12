import { renderHook, act } from '@testing-library/react';
import { useProjects } from '@/lib/projects/use-projects';
import { initialProjects } from '@/lib/projects/data';

describe('useProjects - Task Management', () => {
  beforeEach(() => {
    // Reset localStorage
    localStorage.clear();
  });

  it('adds a task with default todo status', () => {
    const { result } = renderHook(() => useProjects());
    const projectId = result.current.allProjects[0].id;

    act(() => {
      result.current.addTask(projectId, 'New Test Task');
    });

    const updatedProject = result.current.allProjects.find(p => p.id === projectId);
    expect(updatedProject?.tasks).toHaveLength(5); // Original 4 + 1 new
    expect(updatedProject?.tasks[4].title).toBe('New Test Task');
    expect(updatedProject?.tasks[4].status).toBe('todo');
    expect(updatedProject?.tasks[4].completed).toBe(false);
  });

  it('adds a task with specific status', () => {
    const { result } = renderHook(() => useProjects());
    const projectId = result.current.allProjects[0].id;

    act(() => {
      result.current.addTask(projectId, 'In Progress Task', 'in-progress');
    });

    const updatedProject = result.current.allProjects.find(p => p.id === projectId);
    expect(updatedProject?.tasks[4].status).toBe('in-progress');
    expect(updatedProject?.tasks[4].completed).toBe(false);
  });

  it('adds a task with done status as completed', () => {
    const { result } = renderHook(() => useProjects());
    const projectId = result.current.allProjects[0].id;

    act(() => {
      result.current.addTask(projectId, 'Done Task', 'done');
    });

    const updatedProject = result.current.allProjects.find(p => p.id === projectId);
    expect(updatedProject?.tasks[4].status).toBe('done');
    expect(updatedProject?.tasks[4].completed).toBe(true);
  });

  it('updates task with new properties', () => {
    const { result } = renderHook(() => useProjects());
    const projectId = result.current.allProjects[0].id;
    const taskId = result.current.allProjects[0].tasks[0].id;

    act(() => {
      result.current.updateTask(projectId, taskId, {
        status: 'in-progress',
        completed: false,
      });
    });

    const updatedProject = result.current.allProjects.find(p => p.id === projectId);
    const updatedTask = updatedProject?.tasks.find(t => t.id === taskId);
    expect(updatedTask?.status).toBe('in-progress');
  });

  it('deletes a task', () => {
    const { result } = renderHook(() => useProjects());
    const projectId = result.current.allProjects[0].id;
    const taskId = result.current.allProjects[0].tasks[0].id;
    const initialTaskCount = result.current.allProjects[0].tasks.length;

    act(() => {
      result.current.deleteTask(projectId, taskId);
    });

    const updatedProject = result.current.allProjects.find(p => p.id === projectId);
    expect(updatedProject?.tasks).toHaveLength(initialTaskCount - 1);
    expect(updatedProject?.tasks.find(t => t.id === taskId)).toBeUndefined();
  });

  it('updates task status and completion together', () => {
    const { result } = renderHook(() => useProjects());
    const projectId = result.current.allProjects[0].id;
    const taskId = result.current.allProjects[0].tasks[0].id;

    act(() => {
      result.current.updateTask(projectId, taskId, {
        status: 'done',
        completed: true,
      });
    });

    const updatedProject = result.current.allProjects.find(p => p.id === projectId);
    const updatedTask = updatedProject?.tasks.find(t => t.id === taskId);
    expect(updatedTask?.status).toBe('done');
    expect(updatedTask?.completed).toBe(true);
  });

  it('updates project timestamp when task is added', () => {
    const { result } = renderHook(() => useProjects());
    const projectId = result.current.allProjects[0].id;
    const originalUpdatedAt = result.current.allProjects[0].updatedAt;

    // Wait a moment to ensure timestamp changes
    jest.useFakeTimers();
    jest.advanceTimersByTime(1000);

    act(() => {
      result.current.addTask(projectId, 'New Task');
    });

    const updatedProject = result.current.allProjects.find(p => p.id === projectId);
    expect(updatedProject?.updatedAt).not.toBe(originalUpdatedAt);

    jest.useRealTimers();
  });

  it('updates project timestamp when task is updated', () => {
    const { result } = renderHook(() => useProjects());
    const projectId = result.current.allProjects[0].id;
    const taskId = result.current.allProjects[0].tasks[0].id;
    const originalUpdatedAt = result.current.allProjects[0].updatedAt;

    jest.useFakeTimers();
    jest.advanceTimersByTime(1000);

    act(() => {
      result.current.updateTask(projectId, taskId, { status: 'done' });
    });

    const updatedProject = result.current.allProjects.find(p => p.id === projectId);
    expect(updatedProject?.updatedAt).not.toBe(originalUpdatedAt);

    jest.useRealTimers();
  });

  it('updates project timestamp when task is deleted', () => {
    const { result } = renderHook(() => useProjects());
    const projectId = result.current.allProjects[0].id;
    const taskId = result.current.allProjects[0].tasks[0].id;
    const originalUpdatedAt = result.current.allProjects[0].updatedAt;

    jest.useFakeTimers();
    jest.advanceTimersByTime(1000);

    act(() => {
      result.current.deleteTask(projectId, taskId);
    });

    const updatedProject = result.current.allProjects.find(p => p.id === projectId);
    expect(updatedProject?.updatedAt).not.toBe(originalUpdatedAt);

    jest.useRealTimers();
  });
});
