"use client";

import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Activity,
  Download,
  Calendar,
  Filter,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

// Sample data for analytics
const trafficData = [
  { date: "Jan 1", visitors: 2400, pageViews: 4800 },
  { date: "Jan 8", visitors: 1398, pageViews: 2800 },
  { date: "Jan 15", visitors: 9800, pageViews: 19600 },
  { date: "Jan 22", visitors: 3908, pageViews: 7816 },
  { date: "Jan 29", visitors: 4800, pageViews: 9600 },
  { date: "Feb 5", visitors: 3800, pageViews: 7600 },
  { date: "Feb 12", visitors: 4300, pageViews: 8600 },
];

const conversionData = [
  { name: "Week 1", rate: 2.4 },
  { name: "Week 2", rate: 3.1 },
  { name: "Week 3", rate: 2.8 },
  { name: "Week 4", rate: 3.8 },
];

const deviceData = [
  { name: "Desktop", value: 55, color: "hsl(var(--primary))" },
  { name: "Mobile", value: 35, color: "hsl(var(--chart-2))" },
  { name: "Tablet", value: 10, color: "hsl(var(--chart-3))" },
];

const sourceData = [
  { name: "Direct", value: 35, color: "hsl(var(--primary))" },
  { name: "Organic Search", value: 30, color: "hsl(var(--chart-2))" },
  { name: "Social Media", value: 20, color: "hsl(var(--chart-3))" },
  { name: "Referral", value: 10, color: "hsl(var(--chart-4))" },
  { name: "Email", value: 5, color: "hsl(var(--chart-5))" },
];

const performanceMetrics = [
  {
    title: "Conversion Rate",
    value: "3.24%",
    change: "+0.8%",
    trend: "up",
    description: "vs last month",
  },
  {
    title: "Avg. Session Duration",
    value: "4m 32s",
    change: "+12s",
    trend: "up",
    description: "vs last month",
  },
  {
    title: "Bounce Rate",
    value: "42.3%",
    change: "-2.1%",
    trend: "down",
    description: "improvement",
  },
  {
    title: "Pages per Session",
    value: "3.8",
    change: "+0.4",
    trend: "up",
    description: "vs last month",
  },
];

const topPages = [
  { page: "/dashboard", views: 12543, change: "+15%" },
  { page: "/analytics", views: 8932, change: "+8%" },
  { page: "/team", views: 6543, change: "-3%" },
  { page: "/settings", views: 4321, change: "+12%" },
  { page: "/profile", views: 3456, change: "+5%" },
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

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 px-8 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Deep insights into your application performance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select defaultValue="30d">
            <SelectTrigger className="w-[160px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8 p-8"
      >
        {/* Performance Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {performanceMetrics.map((metric) => (
            <motion.div key={metric.title} variants={itemVariants}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {metric.title}
                  </CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <p className="flex items-center text-xs text-muted-foreground">
                    {metric.trend === "up" ? (
                      <TrendingUp className="mr-1 h-3 w-3 text-emerald-500" />
                    ) : (
                      <TrendingDown className="mr-1 h-3 w-3 text-emerald-500" />
                    )}
                    <span
                      className={
                        metric.trend === "up"
                          ? "text-emerald-500"
                          : "text-red-500"
                      }
                    >
                      {metric.change}
                    </span>
                    <span className="ml-1">{metric.description}</span>
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Traffic Overview */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Traffic Overview</CardTitle>
                  <CardDescription>
                    Visitors and page views over time
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge variant="secondary">
                    <div className="mr-1 h-2 w-2 rounded-full bg-primary" />
                    Visitors
                  </Badge>
                  <Badge variant="outline">
                    <div className="mr-1 h-2 w-2 rounded-full bg-chart-2" />
                    Page Views
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trafficData}>
                    <defs>
                      <linearGradient
                        id="colorVisitors"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
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
                      <linearGradient
                        id="colorPageViews"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="hsl(var(--chart-2))"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="hsl(var(--chart-2))"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-muted"
                    />
                    <XAxis
                      dataKey="date"
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
                      dataKey="visitors"
                      stroke="hsl(var(--primary))"
                      fillOpacity={1}
                      fill="url(#colorVisitors)"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="pageViews"
                      stroke="hsl(var(--chart-2))"
                      fillOpacity={1}
                      fill="url(#colorPageViews)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Charts Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Conversion Rate */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle>Conversion Rate Trends</CardTitle>
                <CardDescription>
                  Weekly conversion performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={conversionData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-muted"
                      />
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
                        tickFormatter={(value) => `${value}%`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "var(--radius)",
                        }}
                        formatter={(value: number) => [`${value}%`, "Rate"]}
                      />
                      <Line
                        type="monotone"
                        dataKey="rate"
                        stroke="hsl(var(--primary))"
                        strokeWidth={3}
                        dot={{ fill: "hsl(var(--primary))", r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Device Distribution */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle>Traffic by Device</CardTitle>
                <CardDescription>
                  User distribution across devices
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={deviceData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {deviceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "var(--radius)",
                        }}
                        formatter={(value: number) => [`${value}%`, "Share"]}
                      />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        iconType="circle"
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Traffic Sources */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Traffic Sources</CardTitle>
              <CardDescription>
                Where your visitors are coming from
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sourceData} layout="vertical">
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-muted"
                      horizontal={false}
                    />
                    <XAxis
                      type="number"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      width={100}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "var(--radius)",
                      }}
                      formatter={(value: number) => [`${value}%`, "Share"]}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {sourceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Pages Table */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Top Pages</CardTitle>
              <CardDescription>Most visited pages this period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topPages.map((page, index) => (
                  <motion.div
                    key={page.page}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-4">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium">{page.page}</p>
                        <p className="text-sm text-muted-foreground">
                          {page.views.toLocaleString()} views
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={page.change.startsWith("+") ? "default" : "secondary"}
                    >
                      {page.change}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
