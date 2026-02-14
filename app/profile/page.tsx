"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Calendar,
  FolderKanban,
  CheckCircle,
  Clock,
  Settings,
  LogOut,
  Shield,
  Award,
  TrendingUp,
  Activity,
  Edit3,
  FileText,
  Users,
  Bell,
  Key,
  AlertCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

// Activity log data structure
interface ActivityItem {
  id: string;
  type: "project" | "task" | "auth" | "team" | "settings" | "notification";
  action: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, string>;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
    },
  },
};

// Mock activity log data
const activityLog: ActivityItem[] = [
  {
    id: "1",
    type: "auth",
    action: "Login",
    description: "Logged in from Chrome on macOS",
    timestamp: "2026-02-14T10:30:00Z",
  },
  {
    id: "2",
    type: "project",
    action: "Project Updated",
    description: "Updated 'Website Redesign' project status to 'In Progress'",
    timestamp: "2026-02-14T09:15:00Z",
    metadata: { project: "Website Redesign" },
  },
  {
    id: "3",
    type: "task",
    action: "Task Completed",
    description: "Marked 'Design Homepage Mockup' as completed",
    timestamp: "2026-02-14T08:45:00Z",
  },
  {
    id: "4",
    type: "team",
    action: "Member Added",
    description: "Added Sarah Chen to the Marketing team",
    timestamp: "2026-02-13T16:20:00Z",
  },
  {
    id: "5",
    type: "settings",
    action: "Profile Updated",
    description: "Changed notification preferences",
    timestamp: "2026-02-13T14:10:00Z",
  },
  {
    id: "6",
    type: "notification",
    action: "Alert Received",
    description: "Received security alert for new device login",
    timestamp: "2026-02-13T11:30:00Z",
  },
  {
    id: "7",
    type: "project",
    action: "Project Created",
    description: "Created new project 'Mobile App v2.0'",
    timestamp: "2026-02-12T15:45:00Z",
  },
  {
    id: "8",
    type: "auth",
    action: "Password Changed",
    description: "Successfully updated account password",
    timestamp: "2026-02-12T10:00:00Z",
  },
];

const getActivityIcon = (type: ActivityItem["type"]) => {
  switch (type) {
    case "project":
      return FolderKanban;
    case "task":
      return CheckCircle;
    case "auth":
      return Key;
    case "team":
      return Users;
    case "settings":
      return Settings;
    case "notification":
      return Bell;
    default:
      return Activity;
  }
};

const getActivityColor = (type: ActivityItem["type"]) => {
  switch (type) {
    case "project":
      return "bg-blue-500/10 text-blue-500";
    case "task":
      return "bg-emerald-500/10 text-emerald-500";
    case "auth":
      return "bg-violet-500/10 text-violet-500";
    case "team":
      return "bg-orange-500/10 text-orange-500";
    case "settings":
      return "bg-gray-500/10 text-gray-500";
    case "notification":
      return "bg-yellow-500/10 text-yellow-500";
    default:
      return "bg-primary/10 text-primary";
  }
};

const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) {
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    return diffInMinutes < 1 ? "Just now" : `${diffInMinutes} minutes ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hours ago`;
  } else {
    const diffInDays = Math.floor(diffInHours / 24);
    return diffInDays === 1 ? "Yesterday" : `${diffInDays} days ago`;
  }
};

// Account statistics
const accountStats = {
  projectsCreated: 12,
  tasksCompleted: 47,
  teamMembersInvited: 8,
  lastActive: "2 minutes ago",
  accountAge: "3 months",
  loginStreak: 15,
};

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      logout();
      setIsLoggingOut(false);
      toast.success("Logged out successfully");
    }, 500);
  };

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle>Not Authenticated</CardTitle>
            <CardDescription>Please log in to view your profile</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/login">
              <Button className="w-full">Go to Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 px-8 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
          <p className="text-sm text-muted-foreground">
            Manage your account and view activity
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/settings">
            <Button variant="outline" className="gap-2">
              <Settings className="h-4 w-4" />
              Edit Profile
            </Button>
          </Link>
        </div>
      </header>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6 p-8"
      >
        {/* Profile Overview Card */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col gap-6 md:flex-row md:items-center">
                <Avatar className="h-24 w-24 ring-4 ring-primary/20">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white text-2xl">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold">{user.name}</h2>
                    <Badge variant="secondary" className="gap-1">
                      <Shield className="h-3 w-3" />
                      Verified
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {user.email}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Member since {accountStats.accountAge}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Last active {accountStats.lastActive}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Link href="/settings">
                    <Button variant="outline" className="w-full gap-2">
                      <Edit3 className="h-4 w-4" />
                      Edit Profile
                    </Button>
                  </Link>
                  <Button
                    variant="destructive"
                    className="w-full gap-2"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                  >
                    {isLoggingOut ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <LogOut className="h-4 w-4" />
                        </motion.div>
                        Logging out...
                      </>
                    ) : (
                      <>
                        <LogOut className="h-4 w-4" />
                        Logout
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Grid */}
        <motion.div variants={itemVariants}>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Projects Created</CardTitle>
                <FolderKanban className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{accountStats.projectsCreated}</div>
                <p className="text-xs text-muted-foreground">Across all workspaces</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{accountStats.tasksCompleted}</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Team Invites</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{accountStats.teamMembersInvited}</div>
                <p className="text-xs text-muted-foreground">Members invited</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Login Streak</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{accountStats.loginStreak}</div>
                <p className="text-xs text-muted-foreground">Consecutive days</p>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Activity Log */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Activity Log</CardTitle>
                  <CardDescription>Recent actions and events</CardDescription>
                </div>
                <Activity className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="auth">Auth</TabsTrigger>
                  <TabsTrigger value="project">Projects</TabsTrigger>
                  <TabsTrigger value="team">Team</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-4">
                  {activityLog.map((activity, index) => {
                    const Icon = getActivityIcon(activity.type);
                    return (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-start gap-4 rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                      >
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${getActivityColor(
                            activity.type
                          )}`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">{activity.action}</p>
                            <span className="text-xs text-muted-foreground">
                              {formatTimestamp(activity.timestamp)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {activity.description}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </TabsContent>

                <TabsContent value="auth" className="space-y-4">
                  {activityLog
                    .filter((a) => a.type === "auth")
                    .map((activity, index) => {
                      const Icon = getActivityIcon(activity.type);
                      return (
                        <motion.div
                          key={activity.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-start gap-4 rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                        >
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${getActivityColor(
                              activity.type
                            )}`}
                          >
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <p className="font-medium">{activity.action}</p>
                              <span className="text-xs text-muted-foreground">
                                {formatTimestamp(activity.timestamp)}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {activity.description}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                </TabsContent>

                <TabsContent value="project" className="space-y-4">
                  {activityLog
                    .filter((a) => a.type === "project" || a.type === "task")
                    .map((activity, index) => {
                      const Icon = getActivityIcon(activity.type);
                      return (
                        <motion.div
                          key={activity.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-start gap-4 rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                        >
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${getActivityColor(
                              activity.type
                            )}`}
                          >
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <p className="font-medium">{activity.action}</p>
                              <span className="text-xs text-muted-foreground">
                                {formatTimestamp(activity.timestamp)}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {activity.description}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                </TabsContent>

                <TabsContent value="team" className="space-y-4">
                  {activityLog
                    .filter((a) => a.type === "team")
                    .map((activity, index) => {
                      const Icon = getActivityIcon(activity.type);
                      return (
                        <motion.div
                          key={activity.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-start gap-4 rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                        >
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${getActivityColor(
                              activity.type
                            )}`}
                          >
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <p className="font-medium">{activity.action}</p>
                              <span className="text-xs text-muted-foreground">
                                {formatTimestamp(activity.timestamp)}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {activity.description}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <Link href="/settings" className="group">
                  <div className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50 group-hover:border-primary">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Settings className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Settings</p>
                      <p className="text-sm text-muted-foreground">
                        Manage your account
                      </p>
                    </div>
                  </div>
                </Link>

                <Link href="/projects" className="group">
                  <div className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50 group-hover:border-primary">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                      <FolderKanban className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="font-medium">Projects</p>
                      <p className="text-sm text-muted-foreground">
                        View your projects
                      </p>
                    </div>
                  </div>
                </Link>

                <Link href="/team" className="group">
                  <div className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50 group-hover:border-primary">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
                      <Users className="h-5 w-5 text-orange-500" />
                    </div>
                    <div>
                      <p className="font-medium">Team</p>
                      <p className="text-sm text-muted-foreground">
                        Manage team members
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
