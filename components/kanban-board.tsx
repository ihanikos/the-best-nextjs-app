"use client";

import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  defaultDropAnimationSideEffects,
  DropAnimation,
} from "@dnd-kit/core";
import { arrayMove, SortableContext } from "@dnd-kit/sortable";
import { Task, TaskStatus, TeamMember } from "@/lib/projects/types";
import { KANBAN_COLUMNS, getTasksByStatus } from "@/lib/projects/data";
import { KanbanColumn } from "./kanban-column";
import { KanbanTaskCard } from "./kanban-task-card";
import { createPortal } from "react-dom";

interface KanbanBoardProps {
  tasks: Task[];
  teamMembers: TeamMember[];
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
  onCreateTask: (status: TaskStatus) => void;
}

export function KanbanBoard({
  tasks,
  teamMembers,
  onUpdateTask,
  onDeleteTask,
  onCreateTask,
}: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    // Check if dropped over a column
    const column = KANBAN_COLUMNS.find((col) => col.id === overId);
    if (column) {
      const task = tasks.find((t) => t.id === taskId);
      if (task && task.status !== column.id) {
        onUpdateTask(taskId, {
          status: column.id,
          completed: column.id === "done",
        });
      }
      return;
    }

    // Check if dropped over another task
    const overTask = tasks.find((t) => t.id === overId);
    if (overTask) {
      const activeTaskData = tasks.find((t) => t.id === taskId);
      if (activeTaskData && activeTaskData.status !== overTask.status) {
        onUpdateTask(taskId, {
          status: overTask.status,
          completed: overTask.status === "done",
        });
      }
    }
  };

  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: "0.5",
        },
      },
    }),
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 h-full min-h-[500px]">
        {KANBAN_COLUMNS.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            tasks={getTasksByStatus(tasks, column.id)}
            teamMembers={teamMembers}
            onUpdateTask={onUpdateTask}
            onDeleteTask={onDeleteTask}
            onCreateTask={() => onCreateTask(column.id)}
          />
        ))}
      </div>
      {typeof document !== "undefined" &&
        createPortal(
          <DragOverlay dropAnimation={dropAnimation}>
            {activeTask ? (
              <KanbanTaskCard
                task={activeTask}
                teamMembers={teamMembers}
                onUpdateTask={onUpdateTask}
                onDeleteTask={onDeleteTask}
                isDragging
              />
            ) : null}
          </DragOverlay>,
          document.body
        )}
    </DndContext>
  );
}
