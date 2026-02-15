import {
  Activity,
  ActivityAction,
  ActivityFilter,
  ActivityMetadata,
  ActivityStats,
  activityActionLabels,
  activityActionIcons,
  activityTargetColors,
} from "@/lib/activity/types";

describe("Activity Types", () => {
  describe("ActivityAction", () => {
    it("should have all expected action types", () => {
      const expectedActions: ActivityAction[] = [
        "project_created",
        "project_updated",
        "project_deleted",
        "project_archived",
        "project_unarchived",
        "task_created",
        "task_updated",
        "task_deleted",
        "task_status_changed",
        "task_assigned",
        "task_unassigned",
        "member_added",
        "member_removed",
        "member_role_changed",
        "member_invited",
        "comment_added",
        "file_uploaded",
        "settings_changed",
        "login",
        "logout",
      ];

      expectedActions.forEach((action) => {
        expect(activityActionLabels[action]).toBeDefined();
        expect(activityActionIcons[action]).toBeDefined();
      });
    });
  });

  describe("activityActionLabels", () => {
    it("should provide human-readable labels for all actions", () => {
      expect(activityActionLabels["project_created"]).toBe("Created Project");
      expect(activityActionLabels["task_status_changed"]).toBe("Changed Task Status");
      expect(activityActionLabels["member_role_changed"]).toBe("Changed Member Role");
      expect(activityActionLabels["login"]).toBe("Logged In");
      expect(activityActionLabels["logout"]).toBe("Logged Out");
    });
  });

  describe("activityActionIcons", () => {
    it("should provide icon names for all actions", () => {
      expect(activityActionIcons["project_created"]).toBe("FolderPlus");
      expect(activityActionIcons["task_created"]).toBe("FilePlus");
      expect(activityActionIcons["member_added"]).toBe("UserPlus");
      expect(activityActionIcons["login"]).toBe("LogIn");
    });
  });

  describe("activityTargetColors", () => {
    it("should provide color classes for all target types", () => {
      expect(activityTargetColors["project"]).toContain("blue");
      expect(activityTargetColors["task"]).toContain("emerald");
      expect(activityTargetColors["member"]).toContain("violet");
      expect(activityTargetColors["system"]).toContain("slate");
      expect(activityTargetColors["settings"]).toContain("amber");
    });
  });

  describe("Activity interface", () => {
    it("should allow creating valid activity objects", () => {
      const activity: Activity = {
        id: "test-123",
        userId: "user-1",
        userName: "John Doe",
        userEmail: "john@example.com",
        userAvatar: "https://example.com/avatar.jpg",
        action: "project_created",
        targetType: "project",
        targetId: "proj-123",
        targetName: "My Project",
        description: "created a new project",
        metadata: {
          projectId: "proj-123",
          projectName: "My Project",
        },
        createdAt: new Date().toISOString(),
      };

      expect(activity.id).toBe("test-123");
      expect(activity.action).toBe("project_created");
      expect(activity.targetType).toBe("project");
    });
  });

  describe("ActivityFilter interface", () => {
    it("should allow creating filter objects", () => {
      const filter: ActivityFilter = {
        userId: "user-1",
        action: "project_created",
        targetType: "project",
        targetId: "proj-123",
        startDate: "2024-01-01",
        endDate: "2024-12-31",
        searchQuery: "test",
      };

      expect(filter.userId).toBe("user-1");
      expect(filter.searchQuery).toBe("test");
    });

    it("should work with empty filter", () => {
      const filter: ActivityFilter = {};
      expect(Object.keys(filter)).toHaveLength(0);
    });
  });

  describe("ActivityMetadata interface", () => {
    it("should allow creating metadata objects", () => {
      const metadata: ActivityMetadata = {
        projectId: "proj-123",
        projectName: "My Project",
        oldStatus: "todo",
        newStatus: "done",
        fromColumn: "backlog",
        toColumn: "in-progress",
      };

      expect(metadata.projectId).toBe("proj-123");
      expect(metadata.oldStatus).toBe("todo");
      expect(metadata.newStatus).toBe("done");
    });
  });

  describe("ActivityStats interface", () => {
    it("should allow creating stats objects", () => {
      const stats: ActivityStats = {
        totalActivities: 100,
        activitiesByType: {
          project_created: 10,
          task_created: 50,
        } as Record<ActivityAction, number>,
        activitiesByUser: {
          "user-1": 30,
          "user-2": 70,
        },
        activitiesByDay: {
          "2024-01-01": 5,
          "2024-01-02": 10,
        },
      };

      expect(stats.totalActivities).toBe(100);
      expect(stats.activitiesByType["project_created"]).toBe(10);
      expect(stats.activitiesByUser["user-1"]).toBe(30);
    });
  });
});
