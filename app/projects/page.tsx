"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Filter,
  Calendar,
  Users,
  CheckSquare,
  MoreHorizontal,
  ArrowUpDown,
  Folder,
  Clock,
  Trash2,
  Edit,
  LayoutGrid,
  List,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProjects } from "@/lib/projects/use-projects";
import { Project, ProjectFilters } from "@/lib/projects/types";
import { CreateProjectDialog } from "./create-project-dialog";
import { EditProjectDialog } from "./edit-project-dialog";
import { ProjectDetailDialog } from "./project-detail-dialog";
import { KanbanBoard } from "@/components/kanban-board";
import { getStatusColor, getStatusBadgeVariant } from "@/lib/projects/data";
import { toast } from "sonner";
import { useNotifications } from "@/lib/notifications";
import { Task, TaskStatus } from "@/lib/projects/types";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 100 },
  },
};

export default function ProjectsPage() {
  const {
    projects,
    filters,
    setFilters,
    createProject,
    updateProject,
    deleteProject,
    updateTask,
    deleteTask,
    addTask,
    availableTeamMembers,
  } = useProjects();
  const { addNotification } = useNotifications();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [viewingProject, setViewingProject] = useState<Project | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
  const [kanbanProjectId, setKanbanProjectId] = useState<string | null>(null);

  const activeProjects = projects.filter((p) => p.status === "active").length;
  const completedProjects = projects.filter((p) => p.status === "completed").length;
  const onHoldProjects = projects.filter((p) => p.status === "on-hold").length;
  const totalProgress = projects.length > 0
    ? Math.round(projects.reduce((acc, p) => acc + p.progress, 0) / projects.length)
    : 0;

  const handleCreateProject = (data: Parameters<typeof createProject>[0]) => {
    createProject(data);
    addNotification({
      title: "Project Created",
      message: `"${data.name}" has been created successfully`,
      type: "success",
      link: "/projects",
      metadata: { action: "project_created" },
    });
    toast.success("Project created successfully");
    setIsCreateOpen(false);
  };

  const handleUpdateProject = (id: string, data: Parameters<typeof updateProject>[1]) => {
    updateProject(id, data);
    addNotification({
      title: "Project Updated",
      message: `"${data.name}" has been updated`,
      type: "info",
      link: "/projects",
      metadata: { action: "project_updated", projectId: id },
    });
    toast.success("Project updated successfully");
    setEditingProject(null);
  };

  const handleDelete = (project: Project) => {
    if (confirm(`Are you sure you want to delete "${project.name}"?`)) {
      deleteProject(project.id);
      addNotification({
        title: "Project Deleted",
        message: `"${project.name}" has been deleted`,
        type: "warning",
        metadata: { action: "project_deleted", projectId: project.id },
      });
      toast.success("Project deleted successfully");
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const kanbanProject = kanbanProjectId
    ? projects.find((p) => p.id === kanbanProjectId)
    : null;

  const handleUpdateTask = (taskId: string, updates: Partial<Task>) => {
    if (!kanbanProjectId) return;
    updateTask(kanbanProjectId, taskId, updates);
    if (updates.status || updates.completed !== undefined) {
      addNotification({
        title: "Task Updated",
        message: `Task status updated`,
        type: "info",
        metadata: { action: "task_updated", projectId: kanbanProjectId },
      });
    }
  };

  const handleDeleteTask = (taskId: string) => {
    if (!kanbanProjectId) return;
    deleteTask(kanbanProjectId, taskId);
    addNotification({
      title: "Task Deleted",
      message: "Task has been deleted",
      type: "warning",
      metadata: { action: "task_deleted", projectId: kanbanProjectId },
    });
    toast.success("Task deleted successfully");
  };

  const handleCreateTask = (status: TaskStatus) => {
    if (!kanbanProjectId) return;
    const title = prompt(`Enter task title for "${status.replace("-", " ")}" column:`);
    if (title && title.trim()) {
      addTask(kanbanProjectId, title.trim(), status);
      addNotification({
        title: "Task Created",
        message: `New task added to ${status.replace("-", " ")}`,
        type: "success",
        metadata: { action: "task_created", projectId: kanbanProjectId },
      });
      toast.success("Task created successfully");
    }
  };

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">
            Manage and track all your team projects
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <Folder className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projects.length}</div>
              <p className="text-xs text-muted-foreground">
                Across all statuses
              </p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeProjects}</div>
              <p className="text-xs text-muted-foreground">
                Currently in progress
              </p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <div className="h-2 w-2 rounded-full bg-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedProjects}</div>
              <p className="text-xs text-muted-foreground">
                Finished projects
              </p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProgress}%</div>
              <p className="text-xs text-muted-foreground">
                Overall completion
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            className="pl-10"
            value={filters.search || ""}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>
        <div className="flex gap-2">
          {/* View Mode Toggle */}
          {viewMode === "kanban" && kanbanProject && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setViewMode("list");
                setKanbanProjectId(null);
              }}
            >
              <List className="mr-2 h-4 w-4" />
              Back to Projects
            </Button>
          )}
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              className="rounded-r-none"
              onClick={() => {
                setViewMode("list");
                setKanbanProjectId(null);
              }}
            >
              <List className="mr-2 h-4 w-4" />
              List
            </Button>
            <Button
              variant={viewMode === "kanban" ? "secondary" : "ghost"}
              size="sm"
              className="rounded-l-none"
              disabled={viewMode === "kanban" && !kanbanProject}
              onClick={() => {
                if (projects.length > 0 && !kanbanProjectId) {
                  setKanbanProjectId(projects[0].id);
                }
                setViewMode("kanban");
              }}
            >
              <LayoutGrid className="mr-2 h-4 w-4" />
              Board
            </Button>
          </div>
          <Select
            value={filters.status || "all"}
            onValueChange={(value) =>
              setFilters({ ...filters, status: value as Project["status"] | "all" })
            }
          >
            <SelectTrigger className="w-[140px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="on-hold">On Hold</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.sortBy || "updated"}
            onValueChange={(value) =>
              setFilters({ ...filters, sortBy: value as ProjectFilters["sortBy"] })
            }
          >
            <SelectTrigger className="w-[160px]">
              <ArrowUpDown className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="dueDate">Due Date</SelectItem>
              <SelectItem value="progress">Progress</SelectItem>
              <SelectItem value="updated">Last Updated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* View Mode Content */}
      {viewMode === "kanban" && kanbanProject ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">{kanbanProject.name}</h2>
              <p className="text-sm text-muted-foreground">
                Drag and drop tasks to update their status
              </p>
            </div>
            <Select
              value={kanbanProjectId || ""}
              onValueChange={(value) => setKanbanProjectId(value)}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <KanbanBoard
            tasks={kanbanProject.tasks}
            teamMembers={kanbanProject.members}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
            onCreateTask={handleCreateTask}
          />
        </motion.div>
      ) : (
        <>
      {/* Projects Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
      >
        <AnimatePresence mode="popLayout">
          {projects.map((project) => (
            <motion.div key={project.id} variants={itemVariants} layout>
              <Card className="h-full cursor-pointer transition-all hover:shadow-lg hover:border-primary/50" onClick={() => setViewingProject(project)}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 pr-4">
                      <CardTitle className="text-lg line-clamp-1">{project.name}</CardTitle>
                      <CardDescription className="line-clamp-2 mt-1">
                        {project.description}
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="shrink-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setViewingProject(project); }}>
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setKanbanProjectId(project.id); setViewMode("kanban"); }}>
                          <LayoutGrid className="mr-2 h-4 w-4" />
                          Open Board View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setEditingProject(project); }}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={(e) => { e.stopPropagation(); handleDelete(project); }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant={getStatusBadgeVariant(project.status)}>
                      {project.status.replace("-", " ")}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {project.progress}%
                    </span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(project.dueDate)}
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckSquare className="h-4 w-4" />
                      {project.tasks.filter((t) => t.completed).length}/{project.tasks.length}
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex -space-x-2">
                      {project.members.slice(0, 3).map((member) => (
                        <Avatar key={member.id} className="h-7 w-7 border-2 border-background">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {member.avatar}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {project.members.length > 3 && (
                        <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-muted text-xs text-muted-foreground">
                          +{project.members.length - 3}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      {project.members.length}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {projects.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <Folder className="h-16 w-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold">No projects found</h3>
          <p className="text-muted-foreground mt-1">
            Get started by creating your first project
          </p>
          <Button onClick={() => setIsCreateOpen(true)} className="mt-4 gap-2">
            <Plus className="h-4 w-4" />
            Create Project
          </Button>
        </motion.div>
      )}
        </>
      )}

      {/* Dialogs */}
      <CreateProjectDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={handleCreateProject}
        teamMembers={availableTeamMembers}
      />

      {editingProject && (
        <EditProjectDialog
          open={!!editingProject}
          onOpenChange={(open) => !open && setEditingProject(null)}
          project={editingProject}
          onSubmit={(data) => handleUpdateProject(editingProject.id, data)}
          teamMembers={availableTeamMembers}
        />
      )}

      {viewingProject && (
        <ProjectDetailDialog
          open={!!viewingProject}
          onOpenChange={(open) => !open && setViewingProject(null)}
          project={viewingProject}
        />
      )}
    </div>
  );
}
