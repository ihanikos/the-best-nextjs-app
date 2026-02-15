"use client";

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import {
  Activity,
  ActivityAction,
  ActivityFilter,
  ActivityMetadata,
  ActivityStats,
} from "./types";

interface ActivityState {
  activities: Activity[];
  isLoading: boolean;
  error: string | null;
}

type ActivityReducerAction =
  | { type: "ADD_ACTIVITY"; payload: Activity }
  | { type: "ADD_ACTIVITIES"; payload: Activity[] }
  | { type: "SET_ACTIVITIES"; payload: Activity[] }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "CLEAR_ACTIVITIES" }
  | { type: "DELETE_OLD_ACTIVITIES"; payload: number };

interface ActivityContextType {
  activities: Activity[];
  isLoading: boolean;
  error: string | null;
  addActivity: (
    action: ActivityAction["action"],
    targetType: Activity["targetType"],
    description: string,
    metadata?: ActivityMetadata,
    targetId?: string,
    targetName?: string
  ) => void;
  addActivityDirect: (activity: Activity) => void;
  getActivities: (filter?: ActivityFilter) => Activity[];
  getRecentActivities: (limit?: number) => Activity[];
  getActivityStats: () => ActivityStats;
  clearActivities: () => void;
  deleteOldActivities: (days: number) => void;
}

const ActivityContext = createContext<ActivityContextType | undefined>(
  undefined
);

const STORAGE_KEY = "nexus-activities";
const MAX_ACTIVITIES = 1000;

function activityReducer(
  state: ActivityState,
  action: ActivityReducerAction
): ActivityState {
  switch (action.type) {
    case "ADD_ACTIVITY": {
      const newActivities = [action.payload, ...state.activities].slice(
        0,
        MAX_ACTIVITIES
      );
      return { ...state, activities: newActivities };
    }
    case "ADD_ACTIVITIES": {
      const combined = [...action.payload, ...state.activities].slice(
        0,
        MAX_ACTIVITIES
      );
      return { ...state, activities: combined };
    }
    case "SET_ACTIVITIES":
      return { ...state, activities: action.payload };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "CLEAR_ACTIVITIES":
      return { ...state, activities: [] };
    case "DELETE_OLD_ACTIVITIES": {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - action.payload);
      const filtered = state.activities.filter(
        (activity) => new Date(activity.createdAt) > cutoffDate
      );
      return { ...state, activities: filtered };
    }
    default:
      return state;
  }
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function getCurrentUser() {
  if (typeof window === "undefined") {
    return {
      id: "system",
      name: "System",
      email: "system@nexus.dev",
      avatar: undefined,
    };
  }

  const authData = localStorage.getItem("nexus-auth");
  if (authData) {
    try {
      const user = JSON.parse(authData);
      return {
        id: user.id || "unknown",
        name: user.name || "Unknown User",
        email: user.email || "unknown@nexus.dev",
        avatar: user.avatar,
      };
    } catch {
      // Fall through to default
    }
  }

  return {
    id: "guest",
    name: "Guest User",
    email: "guest@nexus.dev",
    avatar: undefined,
  };
}

export function ActivityProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(activityReducer, {
    activities: [],
    isLoading: false,
    error: null,
  });

  // Load activities from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const activities = JSON.parse(stored);
        dispatch({ type: "SET_ACTIVITIES", payload: activities });
      } catch (error) {
        console.error("Failed to load activities:", error);
      }
    }
  }, []);

  // Save activities to localStorage when they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.activities));
  }, [state.activities]);

  const addActivity = useCallback(
    (
      action: ActivityAction["action"],
      targetType: Activity["targetType"],
      description: string,
      metadata?: ActivityMetadata,
      targetId?: string,
      targetName?: string
    ) => {
      const user = getCurrentUser();
      const activity: Activity = {
        id: generateId(),
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        userAvatar: user.avatar,
        action,
        targetType,
        targetId,
        targetName,
        description,
        metadata,
        createdAt: new Date().toISOString(),
      };

      dispatch({ type: "ADD_ACTIVITY", payload: activity });
    },
    []
  );

  const addActivityDirect = useCallback((activity: Activity) => {
    dispatch({ type: "ADD_ACTIVITY", payload: activity });
  }, []);

  const getActivities = useCallback(
    (filter?: ActivityFilter): Activity[] => {
      let filtered = [...state.activities];

      if (filter?.userId) {
        filtered = filtered.filter((a) => a.userId === filter.userId);
      }

      if (filter?.action) {
        filtered = filtered.filter((a) => a.action === filter.action);
      }

      if (filter?.targetType) {
        filtered = filtered.filter((a) => a.targetType === filter.targetType);
      }

      if (filter?.targetId) {
        filtered = filtered.filter((a) => a.targetId === filter.targetId);
      }

      if (filter?.startDate) {
        const start = new Date(filter.startDate);
        filtered = filtered.filter((a) => new Date(a.createdAt) >= start);
      }

      if (filter?.endDate) {
        const end = new Date(filter.endDate);
        filtered = filtered.filter((a) => new Date(a.createdAt) <= end);
      }

      if (filter?.searchQuery) {
        const query = filter.searchQuery.toLowerCase();
        filtered = filtered.filter(
          (a) =>
            a.description.toLowerCase().includes(query) ||
            a.userName.toLowerCase().includes(query) ||
            a.targetName?.toLowerCase().includes(query)
        );
      }

      return filtered;
    },
    [state.activities]
  );

  const getRecentActivities = useCallback(
    (limit: number = 10): Activity[] => {
      return state.activities.slice(0, limit);
    },
    [state.activities]
  );

  const getActivityStats = useCallback((): ActivityStats => {
    const stats: ActivityStats = {
      totalActivities: state.activities.length,
      activitiesByType: {} as Record<ActivityAction["action"], number>,
      activitiesByUser: {},
      activitiesByDay: {},
    };

    state.activities.forEach((activity) => {
      // By type
      stats.activitiesByType[activity.action] =
        (stats.activitiesByType[activity.action] || 0) + 1;

      // By user
      stats.activitiesByUser[activity.userId] =
        (stats.activitiesByUser[activity.userId] || 0) + 1;

      // By day
      const day = activity.createdAt.split("T")[0];
      stats.activitiesByDay[day] = (stats.activitiesByDay[day] || 0) + 1;
    });

    return stats;
  }, [state.activities]);

  const clearActivities = useCallback(() => {
    dispatch({ type: "CLEAR_ACTIVITIES" });
  }, []);

  const deleteOldActivities = useCallback((days: number) => {
    dispatch({ type: "DELETE_OLD_ACTIVITIES", payload: days });
  }, []);

  return (
    <ActivityContext.Provider
      value={{
        activities: state.activities,
        isLoading: state.isLoading,
        error: state.error,
        addActivity,
        addActivityDirect,
        getActivities,
        getRecentActivities,
        getActivityStats,
        clearActivities,
        deleteOldActivities,
      }}
    >
      {children}
    </ActivityContext.Provider>
  );
}

export function useActivity() {
  const context = useContext(ActivityContext);
  if (context === undefined) {
    throw new Error("useActivity must be used within an ActivityProvider");
  }
  return context;
}
