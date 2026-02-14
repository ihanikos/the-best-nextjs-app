import {
  exportToJSON,
  downloadJSON,
  convertToCSV,
  downloadCSV,
  exportProjectsToCSV,
  exportTeamToCSV,
  validateImportData,
  generateProjectFromImport,
  generateTeamMemberFromImport,
} from "@/lib/data-import-export";
import { Project, TeamMember } from "@/lib/projects/types";

// Mock URL and Blob for testing
global.URL.createObjectURL = jest.fn(() => "mock-url");
global.URL.revokeObjectURL = jest.fn();

describe("Data Import/Export Utilities", () => {
  const mockProjects: Project[] = [
    {
      id: "1",
      name: "Test Project",
      description: "A test project",
      status: "active",
      progress: 50,
      dueDate: "2026-12-31",
      members: [],
      tasks: [
        { id: "t1", title: "Task 1", completed: true, status: "done" },
        { id: "t2", title: "Task 2", completed: false, status: "todo" },
      ],
      priority: "high",
      budget: 10000,
      tags: ["important", "urgent"],
    },
  ];

  const mockTeamMembers: TeamMember[] = [
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      role: "Developer",
      avatar: "JD",
      status: "active",
      location: "New York",
      projects: 5,
    },
  ];

  describe("exportToJSON", () => {
    it("should export projects and team members to JSON format", () => {
      const result = exportToJSON(mockProjects, mockTeamMembers);

      expect(result.version).toBe("1.0.0");
      expect(result.projects).toHaveLength(1);
      expect(result.teamMembers).toHaveLength(1);
      expect(result.exportedAt).toBeDefined();
    });

    it("should respect export options", () => {
      const result = exportToJSON(mockProjects, mockTeamMembers, {
        includeProjects: false,
        includeTeam: true,
      });

      expect(result.projects).toHaveLength(0);
      expect(result.teamMembers).toHaveLength(1);
    });

    it("should apply project filter when provided", () => {
      const result = exportToJSON(mockProjects, mockTeamMembers, {
        projectFilter: (p) => p.status === "active",
      });

      expect(result.projects).toHaveLength(1);
    });

    it("should filter out non-matching projects", () => {
      const result = exportToJSON(mockProjects, mockTeamMembers, {
        projectFilter: (p) => p.status === "completed",
      });

      expect(result.projects).toHaveLength(0);
    });
  });

  describe("convertToCSV", () => {
    it("should convert array of objects to CSV format", () => {
      const data = [
        { name: "John", age: "30", city: "NYC" },
        { name: "Jane", age: "25", city: "LA" },
      ];

      const csv = convertToCSV(data);
      const lines = csv.split("\n");

      expect(lines[0]).toBe("name,age,city");
      expect(lines[1]).toBe("John,30,NYC");
      expect(lines[2]).toBe("Jane,25,LA");
    });

    it("should handle empty arrays", () => {
      const csv = convertToCSV([]);
      expect(csv).toBe("");
    });

    it("should escape values with commas", () => {
      const data = [{ name: "John, Jr.", age: "30" }];

      const csv = convertToCSV(data);
      expect(csv).toContain('"John, Jr."');
    });

    it("should handle null and undefined values", () => {
      const data = [{ name: "John", age: null, city: undefined }];

      const csv = convertToCSV(data);
      expect(csv).toBe("name,age,city\nJohn,,");
    });
  });

  describe("exportProjectsToCSV", () => {
    it("should export projects to CSV with flattened structure", () => {
      const csv = exportProjectsToCSV(mockProjects);
      const lines = csv.split("\n");

      expect(lines[0]).toContain("id,name,description");
      expect(lines[1]).toContain("Test Project");
      expect(lines[1]).toContain("50"); // progress
      expect(lines[1]).toContain("active"); // status
    });

    it("should calculate task counts correctly", () => {
      const csv = exportProjectsToCSV(mockProjects);
      const dataLine = csv.split("\n")[1];

      expect(dataLine).toContain("2"); // total tasks
      expect(dataLine).toContain("1"); // completed tasks
    });

    it("should handle projects with tags", () => {
      const csv = exportProjectsToCSV(mockProjects);
      const dataLine = csv.split("\n")[1];

      expect(dataLine).toContain("important; urgent");
    });
  });

  describe("exportTeamToCSV", () => {
    it("should export team members to CSV", () => {
      const csv = exportTeamToCSV(mockTeamMembers);
      const lines = csv.split("\n");

      expect(lines[0]).toContain("id,name,email");
      expect(lines[1]).toContain("John Doe");
      expect(lines[1]).toContain("john@example.com");
      expect(lines[1]).toContain("Developer");
    });
  });

  describe("validateImportData", () => {
    it("should validate correct data format", () => {
      const data = {
        version: "1.0.0",
        projects: [{ id: "1", name: "Test" }],
        teamMembers: [{ id: "1", name: "John", email: "john@example.com" }],
      };

      const result = validateImportData(data);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject non-object data", () => {
      const result = validateImportData(null);
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain("Invalid data format");
    });

    it("should validate projects array", () => {
      const data = {
        projects: "not an array",
      };

      const result = validateImportData(data);
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain("Projects must be an array");
    });

    it("should detect missing project fields", () => {
      const data = {
        projects: [{ name: "Test" }], // missing id
      };

      const result = validateImportData(data);
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain("missing id");
    });

    it("should validate team members array", () => {
      const data = {
        teamMembers: "not an array",
      };

      const result = validateImportData(data);
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain("Team members must be an array");
    });

    it("should detect missing team member fields", () => {
      const data = {
        teamMembers: [{ id: "1", name: "John" }], // missing email
      };

      const result = validateImportData(data);
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain("missing email");
    });

    it("should validate version format if present", () => {
      const data = {
        version: 123, // should be string
        projects: [],
      };

      const result = validateImportData(data);
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain("Invalid version format");
    });
  });

  describe("generateProjectFromImport", () => {
    const existingProjects: Project[] = [
      { id: "1", name: "Existing", description: "", status: "active", progress: 0, dueDate: "", members: [], tasks: [] },
    ];

    it("should generate project from CSV row data", () => {
      const data = {
        name: "New Project",
        description: "A new project",
        status: "active",
        progress: "75",
        budget: "5000",
        tags: "tag1; tag2",
      };

      const project = generateProjectFromImport(data, existingProjects);

      expect(project.name).toBe("New Project");
      expect(project.description).toBe("A new project");
      expect(project.progress).toBe(75);
      expect(project.budget).toBe(5000);
      expect(project.tags).toEqual(["tag1", "tag2"]);
    });

    it("should generate unique ID if not provided", () => {
      const data = { name: "Test" };
      const project = generateProjectFromImport(data, existingProjects);

      expect(project.id).toBeDefined();
      expect(project.id).toContain("imported-");
    });

    it("should use provided ID if available", () => {
      const data = { id: "custom-id", name: "Test" };
      const project = generateProjectFromImport(data, existingProjects);

      expect(project.id).toBe("custom-id");
    });

    it("should set default values for missing fields", () => {
      const data = { name: "Test" };
      const project = generateProjectFromImport(data, existingProjects);

      expect(project.status).toBe("active");
      expect(project.priority).toBe("medium");
      expect(project.progress).toBe(0);
      expect(project.members).toEqual([]);
      expect(project.tasks).toEqual([]);
    });
  });

  describe("generateTeamMemberFromImport", () => {
    const existingMembers: TeamMember[] = [
      { id: "1", name: "John", email: "john@example.com", role: "Dev", avatar: "J" },
    ];

    it("should generate team member from CSV row data", () => {
      const data = {
        name: "Jane Doe",
        email: "jane@example.com",
        role: "Designer",
        location: "NYC",
        projects: "3",
      };

      const member = generateTeamMemberFromImport(data, existingMembers);

      expect(member.name).toBe("Jane Doe");
      expect(member.email).toBe("jane@example.com");
      expect(member.role).toBe("Designer");
      expect(member.location).toBe("NYC");
      expect(member.projects).toBe(3);
    });

    it("should generate avatar from name initials", () => {
      const data = { name: "John Doe" };
      const member = generateTeamMemberFromImport(data, existingMembers);

      expect(member.avatar).toBe("JD");
    });

    it("should use provided avatar if available", () => {
      const data = { name: "John", avatar: "Custom" };
      const member = generateTeamMemberFromImport(data, existingMembers);

      expect(member.avatar).toBe("Custom");
    });

    it("should set default values for missing fields", () => {
      const data = { name: "Test" };
      const member = generateTeamMemberFromImport(data, existingMembers);

      expect(member.role).toBe("Member");
      expect(member.status).toBe("active");
      expect(member.projects).toBe(0);
      expect(member.lastActive).toBe("Just now");
    });

    it("should handle string IDs", () => {
      const data = { id: "123", name: "Test" };
      const member = generateTeamMemberFromImport(data, existingMembers);

      expect(member.id).toBe(123);
    });
  });

  describe("download functions", () => {
    let mockAnchor: HTMLAnchorElement;

    beforeEach(() => {
      mockAnchor = {
        click: jest.fn(),
        href: "",
        download: "",
      } as unknown as HTMLAnchorElement;
      jest.spyOn(document, "createElement").mockReturnValue(mockAnchor);
      jest.spyOn(document.body, "appendChild").mockImplementation(() => mockAnchor);
      jest.spyOn(document.body, "removeChild").mockImplementation(() => mockAnchor);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("downloadJSON should create and click anchor element", () => {
      const data = exportToJSON(mockProjects, mockTeamMembers);
      downloadJSON(data, "test.json");

      expect(document.createElement).toHaveBeenCalledWith("a");
      expect(mockAnchor.download).toBe("test.json");
      expect(mockAnchor.click).toHaveBeenCalled();
      expect(URL.revokeObjectURL).toHaveBeenCalled();
    });

    it("downloadCSV should create and click anchor element", () => {
      const csv = "name,age\nJohn,30";
      downloadCSV(csv, "test.csv");

      expect(document.createElement).toHaveBeenCalledWith("a");
      expect(mockAnchor.download).toBe("test.csv");
      expect(mockAnchor.click).toHaveBeenCalled();
      expect(URL.revokeObjectURL).toHaveBeenCalled();
    });
  });
});
