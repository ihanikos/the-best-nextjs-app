"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Users,
  DollarSign,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Bell,
} from "lucide-react";
import { useNotifications } from "@/lib/notifications";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ModeToggle } from "@/components/mode-toggle";
import { ActivityFeedCard } from "@/components/activity-feed";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const stats = [
  {
    title: "Total Revenue",
    value: "$45,231.89",
    change: "+20.1%",
    trend: "up",
    icon: DollarSign,
    description: "from last month",
  },
  {
    title: "Active Users",
    value: "2,350",
    change: "+180",
    trend: "up",
    icon: Users,
    description: "new this week",
  },
  {
    title: "Engagement Rate",
    value: "68.2%",
    change: "+5.4%",
    trend: "up",
    icon: Activity,
    description: "vs last week",
  },
  {
    title: "Bounce Rate",
    value: "32.1%",
    change: "-2.3%",
    trend: "down",
    icon: TrendingUp,
    description: "improvement",
  },
];

const revenueData = [
  { name: "Jan", revenue: 4000, users: 2400 },
  { name: "Feb", revenue: 3000, users: 1398 },
  { name: "Mar", revenue: 2000, users: 9800 },
  { name: "Apr", revenue: 2780, users: 3908 },
  { name: "May", revenue: 1890, users: 4800 },
  { name: "Jun", revenue: 2390, users: 3800 },
  { name: "Jul", revenue: 3490, users: 4300 },
  { name: "Aug", revenue: 4000, users: 2400 },
  { name: "Sep", revenue: 3000, users: 1398 },
  { name: "Oct", revenue: 5000, users: 6800 },
  { name: "Nov", revenue: 2780, users: 3908 },
  { name: "Dec", revenue: 1890, users: 4800 },
];

const categoryData = [
  { name: "Desktop", value: 65, color: "hsl(var(--primary))" },
  { name: "Mobile", value: 25, color: "hsl(var(--chart-2))" },
  { name: "Tablet", value: 10, color: "hsl(var(--chart-3))" },
];

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

export default function DashboardPage() {
  const { unreadCount } = useNotifications();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 px-8 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Welcome back! Here&apos;s your overview.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/notifications">
            <Button variant="outline" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Button>
          </Link>
          <ModeToggle />
        </div>
      </header>

      {/* Main Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8 p-8"
      >
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.div key={stat.title} variants={itemVariants}>
              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="flex items-center text-xs text-muted-foreground">
                    {stat.trend === "up" ? (
                      <ArrowUpRight className="mr-1 h-3 w-3 text-emerald-500" />
                    ) : (
                      <ArrowDownRight className="mr-1 h-3 w-3 text-emerald-500" />
                    )}
                    <span
                      className={
                        stat.trend === "up" ? "text-emerald-500" : "text-red-500"
                      }
                    >
                      {stat.change}
                    </span>
                    <span className="ml-1">{stat.description}</span>
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid gap-4 lg:grid-cols-7">
          {/* Revenue Chart */}
          <motion.div variants={itemVariants} className="lg:col-span-4">
            <Card className="h-[400px]">
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
                <CardDescription>
                  Monthly revenue and user growth
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="hsl(var(--primary))"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="hsl(var(--primary))"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="name"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "var(--radius)",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="hsl(var(--primary))"
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Device Distribution */}
          <motion.div variants={itemVariants} className="lg:col-span-3">
            <Card className="h-[400px]">
              <CardHeader>
                <CardTitle>Traffic by Device</CardTitle>
                <CardDescription>
                  User distribution across devices
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "var(--radius)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 flex justify-center gap-4">
                  {categoryData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm text-muted-foreground">
                        {item.name}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Bottom Section */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Recent Activity Feed */}
          <motion.div variants={itemVariants}>
            <ActivityFeedCard limit={5} />
          </motion.div>

          {/* Goals Progress */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle>Monthly Goals</CardTitle>
                <CardDescription>Track your progress towards targets</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Revenue Target</span>
                    <span className="font-medium">85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>New Users</span>
                    <span className="font-medium">62%</span>
                  </div>
                  <Progress value={62} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Team Goals</span>
                    <span className="font-medium">93%</span>
                  </div>
                  <Progress value={93} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Customer Satisfaction</span>
                    <span className="font-medium">98%</span>
                  </div>
                  <Progress value={98} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
