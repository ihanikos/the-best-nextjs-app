"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Task, TaskStatus, TeamMember } from "@/lib/projects/types";
import { KanbanTaskCard } from "./kanban-task-card";

interface KanbanColumnProps {
  column: {
    id: TaskStatus;
    title: string;
    color: string;
  };
  tasks: Task[];
  teamMembers: TeamMember[];
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
  onCreateTask: () => void;
}

export function KanbanColumn({
  column,
  tasks,
  teamMembers,
  onUpdateTask,
  onDeleteTask,
  onCreateTask,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col w-72 shrink-0 rounded-lg border bg-muted/50 transition-colors ${
        isOver ? "border-primary bg-primary/5" : ""
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${column.color}`} />
          <h3 className="font-semibold text-sm">{column.title}</h3>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={onCreateTask}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>

      {/* Tasks */}
      <div className="flex-1 p-2 space-y-2 min-h-[100px]">
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <KanbanTaskCard
              key={task.id}
              task={task}
              teamMembers={teamMembers}
              onUpdateTask={onUpdateTask}
              onDeleteTask={onDeleteTask}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
            <p className="text-sm">No tasks</p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2"
              onClick={onCreateTask}
            >
              <Plus className="h-3 w-3 mr-1" />
              Add task
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
