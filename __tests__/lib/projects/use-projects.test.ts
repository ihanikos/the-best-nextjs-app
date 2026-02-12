import { renderHook, act } from "@testing-library/react";
import { useProjects } from "@/lib/projects/use-projects";
import { initialProjects, availableTeamMembers } from "@/lib/projects/data";

describe("useProjects hook", () => {
  it("should initialize with default projects", () => {
    const { result } = renderHook(() => useProjects());
    
    expect(result.current.allProjects).toHaveLength(initialProjects.length);
    expect(result.current.projects).toHaveLength(initialProjects.length);
  });

  it("should filter projects by status", () => {
    const { result } = renderHook(() => useProjects());
    
    act(() => {
      result.current.setFilters({ status: "active" });
    });
    
    const activeProjects = initialProjects.filter((p) => p.status === "active");
    expect(result.current.projects).toHaveLength(activeProjects.length);
  });

  it("should filter projects by search term", () => {
    const { result } = renderHook(() => useProjects());
    
    act(() => {
      result.current.setFilters({ search: "Website" });
    });
    
    expect(result.current.projects.length).toBeGreaterThan(0);
    expect(result.current.projects[0].name).toContain("Website");
  });

  it("should create a new project", () => {
    const { result } = renderHook(() => useProjects());
    
    const newProject = {
      name: "Test Project",
      description: "Test Description",
      status: "active" as const,
      progress: 0,
      dueDate: "2026-12-31",
      owner: availableTeamMembers[0],
      members: [availableTeamMembers[0]],
    };
    
    act(() => {
      result.current.createProject(newProject);
    });
    
    expect(result.current.allProjects).toHaveLength(initialProjects.length + 1);
    expect(result.current.allProjects[0].name).toBe("Test Project");
  });

  it("should update an existing project", () => {
    const { result } = renderHook(() => useProjects());
    
    const projectId = initialProjects[0].id;
    
    act(() => {
      result.current.updateProject(projectId, { name: "Updated Name" });
    });
    
    const updatedProject = result.current.allProjects.find((p) => p.id === projectId);
    expect(updatedProject?.name).toBe("Updated Name");
  });

  it("should delete a project", () => {
    const { result } = renderHook(() => useProjects());
    
    const projectId = initialProjects[0].id;
    const initialCount = result.current.allProjects.length;
    
    act(() => {
      result.current.deleteProject(projectId);
    });
    
    expect(result.current.allProjects).toHaveLength(initialCount - 1);
    expect(result.current.allProjects.find((p) => p.id === projectId)).toBeUndefined();
  });

  it("should add a task to a project", () => {
    const { result } = renderHook(() => useProjects());
    
    const projectId = initialProjects[0].id;
    const initialTaskCount = initialProjects[0].tasks.length;
    
    act(() => {
      result.current.addTask(projectId, "New Task");
    });
    
    const project = result.current.allProjects.find((p) => p.id === projectId);
    expect(project?.tasks).toHaveLength(initialTaskCount + 1);
    expect(project?.tasks[project.tasks.length - 1].title).toBe("New Task");
  });

  it("should toggle task completion", () => {
    const { result } = renderHook(() => useProjects());
    
    const projectId = initialProjects[0].id;
    const taskId = initialProjects[0].tasks[0].id;
    const initialCompleted = initialProjects[0].tasks[0].completed;
    
    act(() => {
      result.current.toggleTask(projectId, taskId);
    });
    
    const project = result.current.allProjects.find((p) => p.id === projectId);
    const task = project?.tasks.find((t) => t.id === taskId);
    expect(task?.completed).toBe(!initialCompleted);
  });

  it("should sort projects by name", () => {
    const { result } = renderHook(() => useProjects());
    
    act(() => {
      result.current.setFilters({ sortBy: "name", sortOrder: "asc" });
    });
    
    const sortedProjects = result.current.projects;
    for (let i = 1; i < sortedProjects.length; i++) {
      expect(sortedProjects[i - 1].name.localeCompare(sortedProjects[i].name)).toBeLessThanOrEqual(0);
    }
  });

  it("should sort projects by progress", () => {
    const { result } = renderHook(() => useProjects());
    
    act(() => {
      result.current.setFilters({ sortBy: "progress", sortOrder: "desc" });
    });
    
    const sortedProjects = result.current.projects;
    for (let i = 1; i < sortedProjects.length; i++) {
      expect(sortedProjects[i - 1].progress).toBeGreaterThanOrEqual(sortedProjects[i].progress);
    }
  });

  it("should provide available team members", () => {
    const { result } = renderHook(() => useProjects());
    
    expect(result.current.availableTeamMembers).toEqual(availableTeamMembers);
  });
});
