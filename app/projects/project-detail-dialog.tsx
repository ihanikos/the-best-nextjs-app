"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Calendar,
  Users,
  CheckSquare,
  Clock,
  User,
  Plus,
  X,
} from "lucide-react";
import { Project } from "@/lib/projects/types";
import { getStatusBadgeVariant } from "@/lib/projects/data";
import { toast } from "sonner";

interface ProjectDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project;
}

export function ProjectDetailDialog({
  open,
  onOpenChange,
  project,
}: ProjectDetailDialogProps) {
  const [newTask, setNewTask] = useState("");

  const completedTasks = project.tasks.filter((t) => t.completed).length;
  const taskProgress = project.tasks.length > 0
    ? Math.round((completedTasks / project.tasks.length) * 100)
    : 0;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const getDaysRemaining = () => {
    const due = new Date(project.dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: `${Math.abs(diffDays)} days overdue`, color: "text-destructive" };
    if (diffDays === 0) return { text: "Due today", color: "text-amber-500" };
    if (diffDays === 1) return { text: "Due tomorrow", color: "text-amber-500" };
    return { text: `${diffDays} days remaining`, color: "text-emerald-500" };
  };

  const daysRemaining = getDaysRemaining();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl">{project.name}</DialogTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={getStatusBadgeVariant(project.status)}>
                  {project.status.replace("-", " ")}
                </Badge>
                <span className={`text-sm ${daysRemaining.color}`}>
                  {daysRemaining.text}
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Description */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              Description
            </h4>
            <p className="text-sm">{project.description || "No description provided."}</p>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Overall Progress</h4>
              <span className="text-sm font-medium">{project.progress}%</span>
            </div>
            <Progress value={project.progress} className="h-3" />
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg border">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Due Date</p>
                <p className="text-sm font-medium">{formatDate(project.dueDate)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg border">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Last Updated</p>
                <p className="text-sm font-medium">{formatDate(project.updatedAt)}</p>
              </div>
            </div>
          </div>

          {/* Owner */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3">
              Project Owner
            </h4>
            <div className="flex items-center gap-3 p-3 rounded-lg border">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {project.owner.avatar}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{project.owner.name}</p>
                <p className="text-sm text-muted-foreground">{project.owner.role}</p>
              </div>
            </div>
          </div>

          {/* Team Members */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Team Members ({project.members.length})
            </h4>
            <div className="space-y-2">
              {project.members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 p-2 rounded-lg border"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {member.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.role}</p>
                  </div>
                  {member.id === project.owner.id && (
                    <Badge variant="secondary" className="text-xs">Owner</Badge>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Tasks */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CheckSquare className="h-4 w-4" />
                Tasks ({completedTasks}/{project.tasks.length})
              </h4>
              <span className="text-xs text-muted-foreground">
                {taskProgress}% complete
              </span>
            </div>
            
            <Progress value={taskProgress} className="h-1 mb-4" />
            
            <div className="space-y-2">
              {project.tasks.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No tasks yet
                </p>
              ) : (
                project.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-3 rounded-lg border"
                  >
                    <Checkbox
                      id={`task-${task.id}`}
                      checked={task.completed}
                      disabled
                    />
                    <Label
                      htmlFor={`task-${task.id}`}
                      className={`flex-1 text-sm cursor-pointer ${
                        task.completed ? "line-through text-muted-foreground" : ""
                      }`}
                    >
                      {task.title}
                    </Label>
                    {task.assignedTo && (
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {project.members.find((m) => m.id === task.assignedTo)?.avatar || "?"}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
