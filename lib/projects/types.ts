export interface Project {
  id: string;
  name: string;
  description: string;
  status: "active" | "on-hold" | "completed" | "archived";
  progress: number;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  owner: TeamMember;
  members: TeamMember[];
  tasks: Task[];
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
}

export type TaskStatus = "todo" | "in-progress" | "in-review" | "done";

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  assignedTo?: string;
  status: TaskStatus;
  priority?: "low" | "medium" | "high";
  dueDate?: string;
}

export interface ProjectFilters {
  status?: Project["status"] | "all";
  search?: string;
  sortBy?: "name" | "dueDate" | "progress" | "updated";
  sortOrder?: "asc" | "desc";
}
