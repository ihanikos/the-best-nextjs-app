"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Filter,
  Download,
  Trash2,
  Clock,
  BarChart3,
  Users,
  Calendar,
  X,
  Search,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ActivityFeed } from "@/components/activity-feed";
import { useActivity } from "@/lib/activity";
import { ActivityAction, ActivityFilter } from "@/lib/activity/types";
import { toast } from "sonner";
import { format, subDays } from "date-fns";

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

const actionOptions: { value: ActivityAction | "all"; label: string }[] = [
  { value: "all", label: "All Actions" },
  { value: "project_created", label: "Project Created" },
  { value: "project_updated", label: "Project Updated" },
  { value: "project_deleted", label: "Project Deleted" },
  { value: "project_archived", label: "Project Archived" },
  { value: "task_created", label: "Task Created" },
  { value: "task_updated", label: "Task Updated" },
  { value: "task_deleted", label: "Task Deleted" },
  { value: "task_status_changed", label: "Task Status Changed" },
  { value: "member_added", label: "Member Added" },
  { value: "member_removed", label: "Member Removed" },
  { value: "member_role_changed", label: "Role Changed" },
  { value: "settings_changed", label: "Settings Changed" },
];

export default function ActivityLogPage() {
  const { activities, getActivityStats, clearActivities, deleteOldActivities } = useActivity();
  const [filter, setFilter] = useState<ActivityFilter>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
  const [daysToKeep, setDaysToKeep] = useState("30");

  const stats = getActivityStats();

  const hasFilters = filter.action || filter.targetType || searchQuery || filter.startDate || filter.endDate;

  const clearFilters = () => {
    setFilter({});
    setSearchQuery("");
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(activities, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `activity-log-${format(new Date(), "yyyy-MM-dd")}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setIsExportDialogOpen(false);
    toast.success("Activity log exported successfully");
  };

  const handleClearOld = () => {
    const days = parseInt(daysToKeep, 10);
    deleteOldActivities(days);
    setIsClearDialogOpen(false);
    toast.success(`Activities older than ${days} days have been deleted`);
  };

  const handleClearAll = () => {
    clearActivities();
    setIsClearDialogOpen(false);
    toast.success("All activities have been cleared");
  };

  const filteredActivities = activities.filter((activity) => {
    if (filter.action && activity.action !== filter.action) return false;
    if (filter.targetType && activity.targetType !== filter.targetType) return false;
    if (filter.userId && activity.userId !== filter.userId) return false;
    if (filter.startDate && new Date(activity.createdAt) < new Date(filter.startDate)) return false;
    if (filter.endDate && new Date(activity.createdAt) > new Date(filter.endDate)) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        activity.description.toLowerCase().includes(query) ||
        activity.userName.toLowerCase().includes(query) ||
        activity.targetName?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const todayCount = activities.filter(
    (a) => new Date(a.createdAt).toDateString() === new Date().toDateString()
  ).length;

  const weekCount = activities.filter(
    (a) => new Date(a.createdAt) > subDays(new Date(), 7)
  ).length;

  const monthCount = activities.filter(
    (a) => new Date(a.createdAt) > subDays(new Date(), 30)
  ).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 px-8 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Activity className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Activity Log</h1>
            <p className="text-sm text-muted-foreground">
              Track all actions and changes across your workspace
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExportDialogOpen(true)}
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsClearDialogOpen(true)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear Old
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6 p-8"
      >
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activities.length}</div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{todayCount}</div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Week</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{weekCount}</div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Month</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{monthCount}</div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Activity Feed */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Activity Feed</CardTitle>
                  <CardDescription>
                    {filteredActivities.length} activities found
                    {hasFilters && " (filtered)"}
                  </CardDescription>
                </div>
                {hasFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="mr-2 h-4 w-4" />
                    Clear filters
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex flex-wrap gap-3 mb-6">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search activities..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>

                <Select
                  value={filter.action || "all"}
                  onValueChange={(value) =>
                    setFilter({
                      ...filter,
                      action: value === "all" ? undefined : (value as ActivityAction),
                    })
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Action type" />
                  </SelectTrigger>
                  <SelectContent>
                    {actionOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={filter.targetType || "all"}
                  onValueChange={(value) =>
                    setFilter({
                      ...filter,
                      targetType:
                        value === "all"
                          ? undefined
                          : (value as Activity["targetType"]),
                    })
                  }
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Target type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="project">Projects</SelectItem>
                    <SelectItem value="task">Tasks</SelectItem>
                    <SelectItem value="member">Members</SelectItem>
                    <SelectItem value="settings">Settings</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  type="date"
                  placeholder="From"
                  value={filter.startDate || ""}
                  onChange={(e) =>
                    setFilter({ ...filter, startDate: e.target.value || undefined })
                  }
                  className="w-[150px]"
                />

                <Input
                  type="date"
                  placeholder="To"
                  value={filter.endDate || ""}
                  onChange={(e) =>
                    setFilter({ ...filter, endDate: e.target.value || undefined })
                  }
                  className="w-[150px]"
                />
              </div>

              {/* Activity List */}
              <ActivityFeed
                activities={filteredActivities}
                showTarget
                className="border rounded-lg"
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Activity by Type */}
        {Object.keys(stats.activitiesByType).length > 0 && (
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle>Activity Breakdown</CardTitle>
                <CardDescription>Distribution of activities by type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(stats.activitiesByType)
                    .sort(([, a], [, b]) => b - a)
                    .map(([action, count]) => (
                      <Badge key={action} variant="secondary" className="text-sm py-1 px-3">
                        {action.replace(/_/g, " ")}: {count}
                      </Badge>
                    ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>

      {/* Export Dialog */}
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Activity Log</DialogTitle>
            <DialogDescription>
              Download all activities as a JSON file for backup or analysis.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              This will export {activities.length} activities to a JSON file.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsExportDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export JSON
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clear Dialog */}
      <Dialog open={isClearDialogOpen} onOpenChange={setIsClearDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear Old Activities</DialogTitle>
            <DialogDescription>
              Delete activities older than a specified number of days.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Keep activities from the last:</label>
              <Select value={daysToKeep} onValueChange={setDaysToKeep}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="365">1 year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsClearDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleClearAll}>
              Clear All
            </Button>
            <Button onClick={handleClearOld}>
              Clear Old ({daysToKeep} days)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
