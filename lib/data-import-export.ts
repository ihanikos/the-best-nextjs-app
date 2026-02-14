import { Project, Task, TeamMember } from "@/lib/projects/types";

export interface ExportData {
  version: string;
  exportedAt: string;
  projects: Project[];
  teamMembers: TeamMember[];
}

export interface ExportOptions {
  includeProjects?: boolean;
  includeTeam?: boolean;
  projectFilter?: (project: Project) => boolean;
}

export interface ImportResult {
  success: boolean;
  projectsImported: number;
  teamMembersImported: number;
  errors: string[];
  warnings: string[];
}

export function exportToJSON(
  projects: Project[],
  teamMembers: TeamMember[],
  options: ExportOptions = {}
): ExportData {
  const { includeProjects = true, includeTeam = true, projectFilter } = options;

  const data: ExportData = {
    version: "1.0.0",
    exportedAt: new Date().toISOString(),
    projects: includeProjects
      ? projectFilter
        ? projects.filter(projectFilter)
        : projects
      : [],
    teamMembers: includeTeam ? teamMembers : [],
  };

  return data;
}

export function downloadJSON(data: ExportData, filename?: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename || `nexus-export-${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function convertToCSV(data: Record<string, unknown>[]): string {
  if (data.length === 0) return "";

  const headers = Object.keys(data[0]);
  const csvRows: string[] = [];

  // Add header
  csvRows.push(headers.join(","));

  // Add rows
  for (const row of data) {
    const values = headers.map((header) => {
      const value = row[header];
      // Escape values with commas or quotes
      if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value === null || value === undefined ? "" : String(value);
    });
    csvRows.push(values.join(","));
  }

  return csvRows.join("\n");
}

export function downloadCSV(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportProjectsToCSV(projects: Project[]): string {
  const flatProjects = projects.map((project) => ({
    id: project.id,
    name: project.name,
    description: project.description,
    status: project.status,
    progress: project.progress,
    dueDate: project.dueDate,
    startDate: project.startDate,
    priority: project.priority,
    budget: project.budget,
    tags: project.tags?.join("; ") || "",
    memberCount: project.members?.length || 0,
    taskCount: project.tasks?.length || 0,
    completedTasks: project.tasks?.filter((t) => t.completed).length || 0,
  }));

  return convertToCSV(flatProjects);
}

export function exportTeamToCSV(teamMembers: TeamMember[]): string {
  const flatTeam = teamMembers.map((member) => ({
    id: member.id,
    name: member.name,
    email: member.email,
    role: member.role,
    status: member.status,
    location: member.location || "",
    projects: member.projects || 0,
    avatar: member.avatar,
  }));

  return convertToCSV(flatTeam);
}

export function parseJSONFile(file: File): Promise<ExportData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const data = JSON.parse(content);
        resolve(data as ExportData);
      } catch (error) {
        reject(new Error("Invalid JSON file format"));
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsText(file);
  });
}

export function parseCSVFile(file: File): Promise<Record<string, string>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const lines = content.split("\n").filter((line) => line.trim());
        
        if (lines.length < 2) {
          resolve([]);
          return;
        }

        const headers = lines[0].split(",").map((h) => h.trim());
        const rows: Record<string, string>[] = [];

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(",").map((v) => v.trim());
          const row: Record<string, string> = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || "";
          });
          rows.push(row);
        }

        resolve(rows);
      } catch (error) {
        reject(new Error("Invalid CSV file format"));
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsText(file);
  });
}

export function validateImportData(data: unknown): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!data || typeof data !== "object") {
    return { valid: false, errors: ["Invalid data format: expected object"] };
  }

  const importData = data as Partial<ExportData>;

  // Check version (optional but recommended)
  if (importData.version && typeof importData.version !== "string") {
    errors.push("Invalid version format");
  }

  // Validate projects if present
  if (importData.projects) {
    if (!Array.isArray(importData.projects)) {
      errors.push("Projects must be an array");
    } else {
      importData.projects.forEach((project, index) => {
        if (!project.id) errors.push(`Project at index ${index} missing id`);
        if (!project.name) errors.push(`Project at index ${index} missing name`);
      });
    }
  }

  // Validate team members if present
  if (importData.teamMembers) {
    if (!Array.isArray(importData.teamMembers)) {
      errors.push("Team members must be an array");
    } else {
      importData.teamMembers.forEach((member, index) => {
        if (!member.id) errors.push(`Team member at index ${index} missing id`);
        if (!member.name) errors.push(`Team member at index ${index} missing name`);
        if (!member.email) errors.push(`Team member at index ${index} missing email`);
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function generateProjectFromImport(
  data: Record<string, string>,
  existingProjects: Project[]
): Partial<Project> {
  const id = data.id || `imported-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    id,
    name: data.name || "Untitled Project",
    description: data.description || "",
    status: (data.status as Project["status"]) || "active",
    progress: parseInt(data.progress || "0", 10),
    dueDate: data.dueDate || new Date().toISOString().split("T")[0],
    startDate: data.startDate || new Date().toISOString().split("T")[0],
    priority: (data.priority as Project["priority"]) || "medium",
    budget: parseFloat(data.budget || "0"),
    tags: data.tags ? data.tags.split(";").map((t) => t.trim()) : [],
    members: [],
    tasks: [],
    milestones: [],
  };
}

export function generateTeamMemberFromImport(
  data: Record<string, string>,
  existingMembers: TeamMember[]
): Partial<TeamMember> {
  const numericId = data.id ? parseInt(data.id, 10) : Math.max(...existingMembers.map((m) => Number(m.id) || 0), 0) + 1 + Math.floor(Math.random() * 1000);

  return {
    id: isNaN(numericId) ? `imported-${Date.now()}` : numericId,
    name: data.name || "",
    email: data.email || "",
    role: data.role || "Member",
    status: (data.status as TeamMember["status"]) || "active",
    location: data.location || "",
    projects: parseInt(data.projects || "0", 10),
    avatar: data.avatar || data.name?.split(" ").map((n) => n[0]).join("") || "U",
    lastActive: "Just now",
  };
}
