"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  CheckSquare,
  Folder,
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
  parseISO,
} from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Project, Task } from "@/lib/projects/types";
import { getStatusColor } from "@/lib/projects/data";

interface CalendarViewProps {
  projects: Project[];
  onProjectClick?: (project: Project) => void;
  onTaskClick?: (projectId: string, task: Task) => void;
}

type CalendarItem =
  | { type: "project"; data: Project }
  | { type: "task"; data: Task; projectId: string; projectName: string };

export function CalendarView({
  projects,
  onProjectClick,
  onTaskClick,
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const calendarItems = useMemo(() => {
    const items: Map<string, CalendarItem[]> = new Map();

    projects.forEach((project) => {
      // Add project due date
      const projectDate = project.dueDate;
      if (!items.has(projectDate)) {
        items.set(projectDate, []);
      }
      items.get(projectDate)!.push({ type: "project", data: project });

      // Add task due dates
      project.tasks.forEach((task) => {
        if (task.dueDate) {
          if (!items.has(task.dueDate)) {
            items.set(task.dueDate, []);
          }
          items.get(task.dueDate)!.push({
            type: "task",
            data: task,
            projectId: project.id,
            projectName: project.name,
          });
        }
      });
    });

    return items;
  }, [projects]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days: Date[] = [];
  let day = calendarStart;
  while (day <= calendarEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const handleToday = () => setCurrentDate(new Date());

  const formatDateKey = (date: Date) => format(date, "yyyy-MM-dd");

  const getItemsForDate = (date: Date): CalendarItem[] => {
    return calendarItems.get(formatDateKey(date)) || [];
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-4">
        {/* Calendar Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">
              {format(currentDate, "MMMM yyyy")}
            </h2>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePrevMonth}
                className="h-8 w-8"
                aria-label="Previous month"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleNextMonth}
                className="h-8 w-8"
                aria-label="Next month"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleToday}>
            <CalendarIcon className="mr-2 h-4 w-4" />
            Today
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className="rounded-lg border bg-card">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 border-b">
            {weekDays.map((weekDay) => (
              <div
                key={weekDay}
                className="py-2 text-center text-sm font-medium text-muted-foreground"
              >
                {weekDay}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7">
            {days.map((date, index) => {
              const dateKey = formatDateKey(date);
              const items = getItemsForDate(date);
              const isCurrentMonth = isSameMonth(date, currentDate);
              const isTodayDate = isToday(date);
              const isSelected = selectedDate && isSameDay(date, selectedDate);

              return (
                <motion.div
                  key={dateKey}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.005 }}
                  className={cn(
                    "min-h-[100px] border-b border-r p-2 transition-colors hover:bg-muted/50",
                    !isCurrentMonth && "bg-muted/30 text-muted-foreground",
                    index % 7 === 6 && "border-r-0",
                    index >= days.length - 7 && "border-b-0"
                  )}
                  onClick={() => setSelectedDate(date)}
                  role="button"
                  tabIndex={0}
                  aria-label={format(date, "MMMM d, yyyy")}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      setSelectedDate(date);
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "text-sm font-medium",
                        isTodayDate &&
                          "flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground"
                      )}
                    >
                      {format(date, "d")}
                    </span>
                    {items.length > 0 && (
                      <Badge variant="secondary" className="text-[10px] px-1">
                        {items.length}
                      </Badge>
                    )}
                  </div>

                  {/* Calendar Items */}
                  <div className="mt-1 space-y-1">
                    <AnimatePresence>
                      {items.slice(0, 3).map((item, idx) => (
                        <Tooltip key={`${item.type}-${idx}`}>
                          <TooltipTrigger asChild>
                            <motion.div
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -5 }}
                              className={cn(
                                "cursor-pointer rounded px-1.5 py-0.5 text-[10px] font-medium truncate transition-colors hover:opacity-80",
                                item.type === "project"
                                  ? "bg-primary/10 text-primary border border-primary/20"
                                  : item.data.status === "done"
                                  ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                                  : item.data.status === "in-progress"
                                  ? "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                                  : item.data.status === "in-review"
                                  ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                                  : "bg-slate-500/10 text-slate-600 border border-slate-500/20"
                              )}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (item.type === "project") {
                                  onProjectClick?.(item.data);
                                } else {
                                  onTaskClick?.(item.projectId, item.data);
                                }
                              }}
                            >
                              {item.type === "project" ? (
                                <span className="flex items-center gap-1">
                                  <Folder className="h-3 w-3" />
                                  {item.data.name}
                                </span>
                              ) : (
                                <span className="flex items-center gap-1">
                                  <CheckSquare className="h-3 w-3" />
                                  {item.data.title}
                                </span>
                              )}
                            </motion.div>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs">
                            <div className="space-y-1">
                              <p className="font-medium">
                                {item.type === "project"
                                  ? item.data.name
                                  : item.data.title}
                              </p>
                              {item.type === "task" && (
                                <p className="text-xs text-muted-foreground">
                                  Project: {item.projectName}
                                </p>
                              )}
                              <p className="text-xs text-muted-foreground">
                                Status: {" "}
                                {item.type === "project"
                                  ? item.data.status
                                  : item.data.status.replace("-", " ")}
                              </p>
                              {item.type === "project" && (
                                <p className="text-xs text-muted-foreground">
                                  Progress: {item.data.progress}%
                                </p>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </AnimatePresence>
                    {items.length > 3 && (
                      <p className="text-[10px] text-muted-foreground text-center">
                        +{items.length - 3} more
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded bg-primary/10 border border-primary/20" />
            <span>Project</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded bg-slate-500/10 border border-slate-500/20" />
            <span>To Do</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded bg-blue-500/10 border border-blue-500/20" />
            <span>In Progress</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded bg-amber-500/10 border border-amber-500/20" />
            <span>In Review</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded bg-emerald-500/10 border border-emerald-500/20" />
            <span>Done</span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
