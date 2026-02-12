"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  MoreHorizontal,
  Trash2,
  AlertCircle,
  ArrowUpCircle,
  ArrowDownCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Task, TeamMember } from "@/lib/projects/types";
import { getTaskPriorityColor } from "@/lib/projects/data";
import { cn } from "@/lib/utils";

interface KanbanTaskCardProps {
  task: Task;
  teamMembers: TeamMember[];
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
  isDragging?: boolean;
}

export function KanbanTaskCard({
  task,
  teamMembers,
  onUpdateTask,
  onDeleteTask,
  isDragging,
}: KanbanTaskCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging || isDragging ? 0.5 : 1,
  };

  const assignedMember = task.assignedTo
    ? teamMembers.find((m) => m.id === task.assignedTo)
    : null;

  const toggleCompleted = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateTask(task.id, {
      completed: !task.completed,
      status: !task.completed ? "done" : "todo",
    });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this task?')) {
      onDeleteTask(task.id);
    }
  };

  const getPriorityIcon = () => {
    switch (task.priority) {
      case "high":
        return <ArrowUpCircle className="h-3 w-3 text-red-500" />;
      case "medium":
        return <AlertCircle className="h-3 w-3 text-amber-500" />;
      case "low":
        return <ArrowDownCircle className="h-3 w-3 text-emerald-500" />;
      default:
        return null;
    }
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "cursor-grab active:cursor-grabbing transition-shadow",
        isHovered && "shadow-md"
      )}
    >
      <CardContent className="p-3">
        {/* Task Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 flex-1 min-w-0">
            <button
              onClick={toggleCompleted}
              className="mt-0.5 shrink-0"
            >
              {task.completed ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              ) : (
                <Circle className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
            <p
              className={cn(
                "text-sm font-medium line-clamp-2",
                task.completed && "text-muted-foreground line-through"
              )}
            >
              {task.title}
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0 -mr-1 -mt-1"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={toggleCompleted}>
                {task.completed ? (
                  <>
                    <Circle className="mr-2 h-4 w-4" />
                    Mark as incomplete
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Mark as complete
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Task Footer */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            {/* Priority */}
            {task.priority && (
              <div
                className="flex items-center gap-1"
                title={`Priority: ${task.priority}`}
              >
                {getPriorityIcon()}
              </div>
            )}

            {/* Due Date */}
            {task.dueDate && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
              </div>
            )}
          </div>

          {/* Assignee */}
          {assignedMember ? (
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                {assignedMember.avatar}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="h-6 w-6 rounded-full border border-dashed border-muted-foreground/30 flex items-center justify-center">
              <span className="text-[10px] text-muted-foreground">?</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
