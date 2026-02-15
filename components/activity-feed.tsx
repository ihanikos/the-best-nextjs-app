"use client";

import { motion } from "framer-motion";
import {
  FolderPlus,
  Edit,
  Trash2,
  Archive,
  ArchiveRestore,
  FilePlus,
  ArrowRightLeft,
  UserPlus,
  UserMinus,
  Shield,
  Mail,
  MessageSquare,
  Upload,
  Settings,
  LogIn,
  LogOut,
  Clock,
  MoreHorizontal,
  Filter,
  Search,
  X,
} from "lucide-react";
import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns";
import { Activity, ActivityAction, ActivityFilter } from "@/lib/activity/types";
import { useActivity } from "@/lib/activity/activity-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";

const iconMap: Record<ActivityAction, React.ElementType> = {
  project_created: FolderPlus,
  project_updated: Edit,
  project_deleted: Trash2,
  project_archived: Archive,
  project_unarchived: ArchiveRestore,
  task_created: FilePlus,
  task_updated: Edit,
  task_deleted: Trash2,
  task_status_changed: ArrowRightLeft,
  task_assigned: UserPlus,
  task_unassigned: UserMinus,
  member_added: UserPlus,
  member_removed: UserMinus,
  member_role_changed: Shield,
  member_invited: Mail,
  comment_added: MessageSquare,
  file_uploaded: Upload,
  settings_changed: Settings,
  login: LogIn,
  logout: LogOut,
};

const actionColors: Record<ActivityAction, string> = {
  project_created: "bg-blue-500 text-white",
  project_updated: "bg-blue-400 text-white",
  project_deleted: "bg-red-500 text-white",
  project_archived: "bg-slate-500 text-white",
  project_unarchived: "bg-slate-400 text-white",
  task_created: "bg-emerald-500 text-white",
  task_updated: "bg-emerald-400 text-white",
  task_deleted: "bg-red-500 text-white",
  task_status_changed: "bg-amber-500 text-white",
  task_assigned: "bg-violet-500 text-white",
  task_unassigned: "bg-violet-400 text-white",
  member_added: "bg-indigo-500 text-white",
  member_removed: "bg-red-500 text-white",
  member_role_changed: "bg-purple-500 text-white",
  member_invited: "bg-cyan-500 text-white",
  comment_added: "bg-pink-500 text-white",
  file_uploaded: "bg-orange-500 text-white",
  settings_changed: "bg-gray-500 text-white",
  login: "bg-green-500 text-white",
  logout: "bg-orange-400 text-white",
};

const targetTypeColors: Record<Activity["targetType"], string> = {
  project: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  task: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
  member: "bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200",
  system: "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200",
  settings: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
};

function formatActivityDate(dateString: string): string {
  const date = new Date(dateString);
  if (isToday(date)) {
    return `Today at ${format(date, "h:mm a")}`;
  } else if (isYesterday(date)) {
    return `Yesterday at ${format(date, "h:mm a")}`;
  } else {
    return format(date, "MMM d, yyyy 'at' h:mm a");
  }
}

function formatRelativeTime(dateString: string): string {
  return formatDistanceToNow(new Date(dateString), { addSuffix: true });
}

interface ActivityItemProps {
  activity: Activity;
  showTarget?: boolean;
  compact?: boolean;
}

function ActivityItem({ activity, showTarget = true, compact = false }: ActivityItemProps) {
  const Icon = iconMap[activity.action];
  const iconColor = actionColors[activity.action];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex items-start gap-3 p-3 rounded-lg transition-colors hover:bg-muted/50",
        compact && "p-2"
      )}
    >
      <Avatar className={cn("h-8 w-8 shrink-0", compact && "h-6 w-6")}>
        <AvatarImage src={activity.userAvatar} />
        <AvatarFallback className="bg-primary/10 text-primary text-xs">
          {activity.userName
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className={cn("text-sm", compact && "text-xs")}>
              <span className="font-medium">{activity.userName}</span>{" "}
              <span className="text-muted-foreground">
                {activity.description}
              </span>
              {activity.targetName && (
                <span className="font-medium text-foreground">
                  {" "}{activity.targetName}
                </span>
              )}
            </p>

            <div className="flex items-center gap-2 mt-1">
              <div
                className={cn(
                  "flex items-center justify-center rounded-full",
                  iconColor,
                  compact ? "h-4 w-4" : "h-5 w-5"
                )}
              >
                <Icon className={cn(compact ? "h-2.5 w-2.5" : "h-3 w-3")} />
              </div>

              {showTarget && (
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-xs capitalize",
                    targetTypeColors[activity.targetType],
                    compact && "text-[10px] px-1 py-0"
                  )}
                >
                  {activity.targetType}
                </Badge>
              )}

              <span
                className={cn(
                  "text-muted-foreground flex items-center gap-1",
                  compact ? "text-[10px]" : "text-xs"
                )}
              >
                <Clock className="h-3 w-3" />
                {formatRelativeTime(activity.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

interface ActivityFeedProps {
  limit?: number;
  showFilter?: boolean;
  showTarget?: boolean;
  compact?: boolean;
  className?: string;
  activities?: Activity[];
}

export function ActivityFeed({
  limit = 10,
  showFilter = false,
  showTarget = true,
  compact = false,
  className,
  activities: propActivities,
}: ActivityFeedProps) {
  const { activities: contextActivities, getActivities } = useActivity();
  const [filter, setFilter] = useState<ActivityFilter>({});
  const [searchQuery, setSearchQuery] = useState("");

  const activities = useMemo(() => {
    // Use prop activities if provided, otherwise use context activities
    const baseActivities = propActivities || contextActivities;
    
    // Apply filters
    let filtered = [...baseActivities];

    if (filter.action) {
      filtered = filtered.filter((a) => a.action === filter.action);
    }

    if (filter.targetType) {
      filtered = filtered.filter((a) => a.targetType === filter.targetType);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.description.toLowerCase().includes(query) ||
          a.userName.toLowerCase().includes(query) ||
          a.targetName?.toLowerCase().includes(query)
      );
    }

    return filtered.slice(0, limit);
  }, [propActivities, contextActivities, filter, searchQuery, limit]);

  const hasFilters = filter.action || filter.targetType || searchQuery;

  const clearFilters = () => {
    setFilter({});
    setSearchQuery("");
  };

  if (activities.length === 0) {
    return (
      <div className={cn("text-center py-8", className)}>
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-3">
          <Clock className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">
          {hasFilters ? "No activities match your filters" : "No recent activity"}
        </p>
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-2"
            onClick={clearFilters}
          >
            Clear filters
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={className}>
      {showFilter && (
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search activities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <Select
            value={filter.action || "all"}
            onValueChange={(value) =>
              setFilter({ ...filter, action: value === "all" ? undefined : (value as ActivityAction) })
            }
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Action type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All actions</SelectItem>
              <SelectItem value="project_created">Project created</SelectItem>
              <SelectItem value="task_created">Task created</SelectItem>
              <SelectItem value="member_added">Member added</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filter.targetType || "all"}
            onValueChange={(value) =>
              setFilter({
                ...filter,
                targetType: value === "all" ? undefined : (value as Activity["targetType"]),
              })
            }
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Target type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="project">Projects</SelectItem>
              <SelectItem value="task">Tasks</SelectItem>
              <SelectItem value="member">Members</SelectItem>
            </SelectContent>
          </Select>

          {hasFilters && (
            <Button variant="ghost" size="icon" onClick={clearFilters}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}

      <div className="space-y-1">
        {activities.map((activity) => (
          <ActivityItem
            key={activity.id}
            activity={activity}
            showTarget={showTarget}
            compact={compact}
          />
        ))}
      </div>
    </div>
  );
}

export function ActivityFeedCard({
  limit = 5,
  className,
}: {
  limit?: number;
  className?: string;
}) {
  const { getRecentActivities } = useActivity();
  const activities = getRecentActivities(limit);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Recent Activity</h3>
        <Button variant="ghost" size="sm" asChild>
          <a href="/activity">View all</a>
        </Button>
      </div>
      <ActivityFeed activities={activities} compact showTarget={false} />
    </div>
  );
}

export { ActivityItem, formatActivityDate, formatRelativeTime };
