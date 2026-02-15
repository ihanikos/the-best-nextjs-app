import React from "react";
import { renderHook, act, waitFor } from "@testing-library/react";
import {
  ActivityProvider,
  useActivity,
} from "@/lib/activity/activity-context";
import { Activity } from "@/lib/activity/types";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ActivityProvider>{children}</ActivityProvider>
);

describe("ActivityContext", () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  describe("useActivity hook", () => {
    it("should throw error when used outside ActivityProvider", () => {
      const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
      
      expect(() => {
        renderHook(() => useActivity());
      }).toThrow("useActivity must be used within an ActivityProvider");
      
      consoleError.mockRestore();
    });

    it("should return context when used within ActivityProvider", () => {
      const { result } = renderHook(() => useActivity(), { wrapper });

      expect(result.current.activities).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(typeof result.current.addActivity).toBe("function");
      expect(typeof result.current.getActivities).toBe("function");
      expect(typeof result.current.getRecentActivities).toBe("function");
      expect(typeof result.current.getActivityStats).toBe("function");
      expect(typeof result.current.clearActivities).toBe("function");
      expect(typeof result.current.deleteOldActivities).toBe("function");
    });
  });

  describe("addActivity", () => {
    it("should add a new activity", () => {
      const { result } = renderHook(() => useActivity(), { wrapper });

      act(() => {
        result.current.addActivity(
          "project_created",
          "project",
          "created a new project",
          { projectId: "proj-1", projectName: "Test Project" },
          "proj-1",
          "Test Project"
        );
      });

      expect(result.current.activities).toHaveLength(1);
      expect(result.current.activities[0].action).toBe("project_created");
      expect(result.current.activities[0].targetType).toBe("project");
      expect(result.current.activities[0].description).toBe("created a new project");
      expect(result.current.activities[0].targetName).toBe("Test Project");
    });

    it("should add multiple activities", () => {
      const { result } = renderHook(() => useActivity(), { wrapper });

      act(() => {
        result.current.addActivity("project_created", "project", "created project 1");
        result.current.addActivity("task_created", "task", "created task 1");
        result.current.addActivity("member_added", "member", "added member 1");
      });

      expect(result.current.activities).toHaveLength(3);
    });

    it("should limit activities to MAX_ACTIVITIES", () => {
      const { result } = renderHook(() => useActivity(), { wrapper });

      // Add more than 1000 activities
      act(() => {
        for (let i = 0; i < 1005; i++) {
          result.current.addActivity("project_created", "project", `created project ${i}`);
        }
      });

      expect(result.current.activities).toHaveLength(1000);
    });
  });

  describe("getActivities", () => {
    it("should filter activities by action type", () => {
      const { result } = renderHook(() => useActivity(), { wrapper });

      act(() => {
        result.current.addActivity("project_created", "project", "created project 1");
        result.current.addActivity("task_created", "task", "created task 1");
        result.current.addActivity("project_updated", "project", "updated project 1");
      });

      const projectActivities = result.current.getActivities({ action: "project_created" });
      expect(projectActivities).toHaveLength(1);
      expect(projectActivities[0].action).toBe("project_created");
    });

    it("should filter activities by target type", () => {
      const { result } = renderHook(() => useActivity(), { wrapper });

      act(() => {
        result.current.addActivity("project_created", "project", "created project");
        result.current.addActivity("task_created", "task", "created task");
        result.current.addActivity("member_added", "member", "added member");
      });

      const projectActivities = result.current.getActivities({ targetType: "project" });
      expect(projectActivities).toHaveLength(1);
      expect(projectActivities[0].targetType).toBe("project");
    });

    it("should filter activities by search query", () => {
      const { result } = renderHook(() => useActivity(), { wrapper });

      act(() => {
        result.current.addActivity("project_created", "project", "created Alpha project");
        result.current.addActivity("project_created", "project", "created Beta project");
        result.current.addActivity("task_created", "task", "created Gamma task");
      });

      const alphaActivities = result.current.getActivities({ searchQuery: "Alpha" });
      expect(alphaActivities).toHaveLength(1);
      expect(alphaActivities[0].description).toContain("Alpha");
    });

    it("should return all activities when no filter is provided", () => {
      const { result } = renderHook(() => useActivity(), { wrapper });

      act(() => {
        result.current.addActivity("project_created", "project", "created project 1");
        result.current.addActivity("task_created", "task", "created task 1");
      });

      expect(result.current.getActivities()).toHaveLength(2);
    });
  });

  describe("getRecentActivities", () => {
    it("should return recent activities with default limit", () => {
      const { result } = renderHook(() => useActivity(), { wrapper });

      act(() => {
        for (let i = 0; i < 15; i++) {
          result.current.addActivity("project_created", "project", `created project ${i}`);
        }
      });

      const recent = result.current.getRecentActivities();
      expect(recent).toHaveLength(10);
    });

    it("should return recent activities with custom limit", () => {
      const { result } = renderHook(() => useActivity(), { wrapper });

      act(() => {
        for (let i = 0; i < 15; i++) {
          result.current.addActivity("project_created", "project", `created project ${i}`);
        }
      });

      const recent = result.current.getRecentActivities(5);
      expect(recent).toHaveLength(5);
    });
  });

  describe("getActivityStats", () => {
    it("should calculate activity statistics", () => {
      const { result } = renderHook(() => useActivity(), { wrapper });

      act(() => {
        result.current.addActivity("project_created", "project", "created project 1");
        result.current.addActivity("project_created", "project", "created project 2");
        result.current.addActivity("task_created", "task", "created task 1");
      });

      const stats = result.current.getActivityStats();
      expect(stats.totalActivities).toBe(3);
      expect(stats.activitiesByType["project_created"]).toBe(2);
      expect(stats.activitiesByType["task_created"]).toBe(1);
    });

    it("should return empty stats when no activities", () => {
      const { result } = renderHook(() => useActivity(), { wrapper });

      const stats = result.current.getActivityStats();
      expect(stats.totalActivities).toBe(0);
      expect(Object.keys(stats.activitiesByType)).toHaveLength(0);
    });
  });

  describe("clearActivities", () => {
    it("should clear all activities", () => {
      const { result } = renderHook(() => useActivity(), { wrapper });

      act(() => {
        result.current.addActivity("project_created", "project", "created project");
        result.current.addActivity("task_created", "task", "created task");
      });

      expect(result.current.activities).toHaveLength(2);

      act(() => {
        result.current.clearActivities();
      });

      expect(result.current.activities).toHaveLength(0);
    });
  });

  describe("deleteOldActivities", () => {
    it("should delete activities older than specified days", () => {
      const { result } = renderHook(() => useActivity(), { wrapper });

      // Add an old activity
      const oldActivity: Activity = {
        id: "old-1",
        userId: "user-1",
        userName: "Test User",
        userEmail: "test@example.com",
        action: "project_created",
        targetType: "project",
        description: "created old project",
        createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(), // 40 days ago
      };

      act(() => {
        result.current.addActivityDirect(oldActivity);
        result.current.addActivity("task_created", "task", "created recent task");
      });

      expect(result.current.activities).toHaveLength(2);

      act(() => {
        result.current.deleteOldActivities(30);
      });

      expect(result.current.activities).toHaveLength(1);
      expect(result.current.activities[0].action).toBe("task_created");
    });
  });

  describe("localStorage persistence", () => {
    it("should save activities to localStorage", async () => {
      const { result } = renderHook(() => useActivity(), { wrapper });

      act(() => {
        result.current.addActivity("project_created", "project", "created project");
      });

      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          "nexus-activities",
          expect.any(String)
        );
      });
    });

    it("should load activities from localStorage on mount", () => {
      const storedActivities: Activity[] = [
        {
          id: "stored-1",
          userId: "user-1",
          userName: "Test User",
          userEmail: "test@example.com",
          action: "project_created",
          targetType: "project",
          description: "stored project",
          createdAt: new Date().toISOString(),
        },
      ];

      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(storedActivities));

      const { result } = renderHook(() => useActivity(), { wrapper });

      expect(result.current.activities).toHaveLength(1);
      expect(result.current.activities[0].id).toBe("stored-1");
    });
  });
});
