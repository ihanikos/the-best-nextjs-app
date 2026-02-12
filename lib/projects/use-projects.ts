"use client";

import { useState, useCallback } from "react";
import { Project, ProjectFilters, Task, TaskStatus } from "./types";
import { initialProjects, availableTeamMembers, filterProjects } from "./data";

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [filters, setFilters] = useState<ProjectFilters>({
    status: "all",
    sortBy: "updated",
    sortOrder: "desc",
  });

  const filteredProjects = filterProjects(projects, filters);

  const createProject = useCallback(
    (projectData: Omit<Project, "id" | "createdAt" | "updatedAt" | "tasks">) => {
      const now = new Date().toISOString().split("T")[0];
      const newProject: Project = {
        ...projectData,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: now,
        updatedAt: now,
        tasks: [],
      };
      setProjects((prev) => [newProject, ...prev]);
      return newProject;
    },
    []
  );

  const updateProject = useCallback(
    (id: string, updates: Partial<Project>) => {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, ...updates, updatedAt: new Date().toISOString().split("T")[0] }
            : p
        )
      );
    },
    []
  );

  const deleteProject = useCallback((id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const addTask = useCallback((projectId: string, taskTitle: string, status: TaskStatus = "todo") => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? {
              ...p,
              tasks: [
                ...p.tasks,
                {
                  id: Math.random().toString(36).substr(2, 9),
                  title: taskTitle,
                  completed: status === "done",
                  status,
                },
              ],
              updatedAt: new Date().toISOString().split("T")[0],
            }
          : p
      )
    );
  }, []);

  const updateTask = useCallback((projectId: string, taskId: string, updates: Partial<Task>) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? {
              ...p,
              tasks: p.tasks.map((t) =>
                t.id === taskId ? { ...t, ...updates } : t
              ),
              updatedAt: new Date().toISOString().split("T")[0],
            }
          : p
      )
    );
  }, []);

  const deleteTask = useCallback((projectId: string, taskId: string) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? {
              ...p,
              tasks: p.tasks.filter((t) => t.id !== taskId),
              updatedAt: new Date().toISOString().split("T")[0],
            }
          : p
      )
    );
  }, []);

  const toggleTask = useCallback((projectId: string, taskId: string) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? {
              ...p,
              tasks: p.tasks.map((t) =>
                t.id === taskId ? { ...t, completed: !t.completed } : t
              ),
              updatedAt: new Date().toISOString().split("T")[0],
            }
          : p
      )
    );
  }, []);

  return {
    projects: filteredProjects,
    allProjects: projects,
    filters,
    setFilters,
    createProject,
    updateProject,
    deleteProject,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    availableTeamMembers,
  };
}
