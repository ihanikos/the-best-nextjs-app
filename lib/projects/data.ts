import { Project, ProjectFilters, TaskStatus, Task } from "./types";

export const initialProjects: Project[] = [
  {
    id: "1",
    name: "Website Redesign",
    description: "Complete overhaul of the company website with modern design and improved UX",
    status: "active",
    progress: 65,
    dueDate: "2026-03-15",
    createdAt: "2026-01-10",
    updatedAt: "2026-02-10",
    owner: {
      id: "1",
      name: "Alex Chen",
      email: "alex@nexus.dev",
      role: "Product Manager",
      avatar: "AC",
    },
    members: [
      { id: "1", name: "Alex Chen", email: "alex@nexus.dev", role: "Product Manager", avatar: "AC" },
      { id: "3", name: "Mike Williams", email: "mike@nexus.dev", role: "UX Designer", avatar: "MW" },
      { id: "2", name: "Sarah Johnson", email: "sarah@nexus.dev", role: "Senior Developer", avatar: "SJ" },
    ],
    tasks: [
      { id: "1", title: "Design mockups", completed: true, status: "done", priority: "high", dueDate: "2026-03-01" },
      { id: "2", title: "Frontend development", completed: true, status: "done", priority: "medium", dueDate: "2026-03-05" },
      { id: "3", title: "Backend integration", completed: false, assignedTo: "2", status: "in-progress", priority: "high", dueDate: "2026-03-10" },
      { id: "4", title: "Content migration", completed: false, status: "todo", priority: "low", dueDate: "2026-03-12" },
    ],
  },
  {
    id: "2",
    name: "Mobile App Development",
    description: "Build a cross-platform mobile application for iOS and Android",
    status: "active",
    progress: 40,
    dueDate: "2026-04-30",
    createdAt: "2026-01-15",
    updatedAt: "2026-02-08",
    owner: {
      id: "2",
      name: "Sarah Johnson",
      email: "sarah@nexus.dev",
      role: "Senior Developer",
      avatar: "SJ",
    },
    members: [
      { id: "2", name: "Sarah Johnson", email: "sarah@nexus.dev", role: "Senior Developer", avatar: "SJ" },
      { id: "5", name: "Tom Wilson", email: "tom@nexus.dev", role: "Backend Developer", avatar: "TW" },
    ],
    tasks: [
      { id: "1", title: "UI/UX design", completed: true, status: "done", priority: "high", dueDate: "2026-03-15" },
      { id: "2", title: "API development", completed: true, assignedTo: "5", status: "done", priority: "high", dueDate: "2026-03-20" },
      { id: "3", title: "App development", completed: false, assignedTo: "2", status: "in-progress", priority: "medium", dueDate: "2026-04-01" },
      { id: "4", title: "Testing", completed: false, status: "todo", priority: "low", dueDate: "2026-04-10" },
    ],
  },
  {
    id: "3",
    name: "Marketing Campaign Q1",
    description: "First quarter marketing campaign focusing on product launch",
    status: "completed",
    progress: 100,
    dueDate: "2026-01-31",
    createdAt: "2025-12-01",
    updatedAt: "2026-01-28",
    owner: {
      id: "4",
      name: "Emily Davis",
      email: "emily@nexus.dev",
      role: "Marketing Lead",
      avatar: "ED",
    },
    members: [
      { id: "4", name: "Emily Davis", email: "emily@nexus.dev", role: "Marketing Lead", avatar: "ED" },
      { id: "6", name: "Jessica Brown", email: "jessica@nexus.dev", role: "Data Analyst", avatar: "JB" },
    ],
    tasks: [
      { id: "1", title: "Strategy planning", completed: true, status: "done", priority: "medium", dueDate: "2026-01-10" },
      { id: "2", title: "Content creation", completed: true, status: "done", priority: "low", dueDate: "2026-01-15" },
      { id: "3", title: "Campaign execution", completed: true, status: "done", priority: "high", dueDate: "2026-01-20" },
      { id: "4", title: "Performance analysis", completed: true, assignedTo: "6", status: "done", priority: "low", dueDate: "2026-01-25" },
    ],
  },
  {
    id: "4",
    name: "Database Migration",
    description: "Migrate legacy database to new cloud infrastructure",
    status: "on-hold",
    progress: 30,
    dueDate: "2026-05-15",
    createdAt: "2026-01-20",
    updatedAt: "2026-02-05",
    owner: {
      id: "5",
      name: "Tom Wilson",
      email: "tom@nexus.dev",
      role: "Backend Developer",
      avatar: "TW",
    },
    members: [
      { id: "5", name: "Tom Wilson", email: "tom@nexus.dev", role: "Backend Developer", avatar: "TW" },
      { id: "6", name: "Jessica Brown", email: "jessica@nexus.dev", role: "Data Analyst", avatar: "JB" },
    ],
    tasks: [
      { id: "1", title: "Data audit", completed: true, status: "done", priority: "high", dueDate: "2026-04-15" },
      { id: "2", title: "Schema design", completed: true, status: "done", priority: "medium", dueDate: "2026-04-20" },
      { id: "3", title: "Migration scripts", completed: false, status: "in-progress", priority: "high", dueDate: "2026-05-01" },
      { id: "4", title: "Testing", completed: false, status: "todo", priority: "medium", dueDate: "2026-05-10" },
    ],
  },
  {
    id: "5",
    name: "Customer Portal",
    description: "Self-service customer portal for account management",
    status: "archived",
    progress: 90,
    dueDate: "2025-12-31",
    createdAt: "2025-09-01",
    updatedAt: "2025-12-15",
    owner: {
      id: "1",
      name: "Alex Chen",
      email: "alex@nexus.dev",
      role: "Product Manager",
      avatar: "AC",
    },
    members: [
      { id: "1", name: "Alex Chen", email: "alex@nexus.dev", role: "Product Manager", avatar: "AC" },
      { id: "2", name: "Sarah Johnson", email: "sarah@nexus.dev", role: "Senior Developer", avatar: "SJ" },
      { id: "3", name: "Mike Williams", email: "mike@nexus.dev", role: "UX Designer", avatar: "MW" },
    ],
    tasks: [
      { id: "1", title: "Requirements gathering", completed: true, status: "done", priority: "medium" },
      { id: "2", title: "Development", completed: true, status: "done", priority: "high" },
      { id: "3", title: "Testing", completed: true, status: "done", priority: "high" },
      { id: "4", title: "Deployment", completed: true, status: "done", priority: "high" },
    ],
  },
];

export const availableTeamMembers = [
  { id: "1", name: "Alex Chen", email: "alex@nexus.dev", role: "Product Manager", avatar: "AC" },
  { id: "2", name: "Sarah Johnson", email: "sarah@nexus.dev", role: "Senior Developer", avatar: "SJ" },
  { id: "3", name: "Mike Williams", email: "mike@nexus.dev", role: "UX Designer", avatar: "MW" },
  { id: "4", name: "Emily Davis", email: "emily@nexus.dev", role: "Marketing Lead", avatar: "ED" },
  { id: "5", name: "Tom Wilson", email: "tom@nexus.dev", role: "Backend Developer", avatar: "TW" },
  { id: "6", name: "Jessica Brown", email: "jessica@nexus.dev", role: "Data Analyst", avatar: "JB" },
];

export function filterProjects(projects: Project[], filters: ProjectFilters): Project[] {
  let result = [...projects];

  if (filters.status && filters.status !== "all") {
    result = result.filter((p) => p.status === filters.status);
  }

  if (filters.search) {
    const search = filters.search.toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(search) ||
        p.description.toLowerCase().includes(search)
    );
  }

  if (filters.sortBy) {
    result.sort((a, b) => {
      let comparison = 0;
      switch (filters.sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "dueDate":
          comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          break;
        case "progress":
          comparison = a.progress - b.progress;
          break;
        case "updated":
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
      }
      return filters.sortOrder === "desc" ? -comparison : comparison;
    });
  }

  return result;
}

export function getStatusColor(status: Project["status"]): string {
  switch (status) {
    case "active":
      return "bg-emerald-500";
    case "on-hold":
      return "bg-amber-500";
    case "completed":
      return "bg-blue-500";
    case "archived":
      return "bg-slate-500";
    default:
      return "bg-slate-500";
  }
}

export function getStatusBadgeVariant(status: Project["status"]): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "active":
      return "default";
    case "on-hold":
      return "secondary";
    case "completed":
      return "default";
    case "archived":
      return "outline";
    default:
      return "secondary";
  }
}

export const KANBAN_COLUMNS: { id: TaskStatus; title: string; color: string }[] = [
  { id: "todo", title: "To Do", color: "bg-slate-500" },
  { id: "in-progress", title: "In Progress", color: "bg-blue-500" },
  { id: "in-review", title: "In Review", color: "bg-amber-500" },
  { id: "done", title: "Done", color: "bg-emerald-500" },
];

export function getTaskStatusColor(status: TaskStatus): string {
  switch (status) {
    case "todo":
      return "bg-slate-500";
    case "in-progress":
      return "bg-blue-500";
    case "in-review":
      return "bg-amber-500";
    case "done":
      return "bg-emerald-500";
    default:
      return "bg-slate-500";
  }
}

export function getTaskPriorityColor(priority: Task["priority"]): string {
  switch (priority) {
    case "high":
      return "bg-red-500";
    case "medium":
      return "bg-amber-500";
    case "low":
      return "bg-emerald-500";
    default:
      return "bg-slate-500";
  }
}

export function getTasksByStatus(tasks: Task[], status: TaskStatus): Task[] {
  return tasks.filter((task) => task.status === status);
}
