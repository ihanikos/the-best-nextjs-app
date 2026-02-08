"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Users,
  Zap,
  CheckCircle,
  Sparkles,
  LayoutDashboard,
  Settings,
  TrendingUp,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: LayoutDashboard,
    title: "Intuitive Dashboard",
    description:
      "Get a comprehensive overview of your metrics with real-time data visualization and customizable widgets.",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description:
      "Deep dive into your data with powerful analytics tools, custom reports, and actionable insights.",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description:
      "Work seamlessly with your team through shared workspaces, real-time updates, and integrated communication.",
  },
  {
    icon: Settings,
    title: "Flexible Settings",
    description:
      "Customize every aspect of your experience with comprehensive configuration options and preferences.",
  },
];

const stats = [
  { value: "10M+", label: "Active Users" },
  { value: "99.9%", label: "Uptime" },
  { value: "150+", label: "Countries" },
  { value: "4.9/5", label: "User Rating" },
];

const benefits = [
  "Real-time data synchronization",
  "Enterprise-grade security",
  "Lightning-fast performance",
  "24/7 customer support",
  "Seamless integrations",
  "Regular updates",
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

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-purple-500/10 to-fuchsia-500/10 animate-gradient-xy" />

        <section className="relative px-6 py-20 lg:py-32">
          <div className="mx-auto max-w-5xl text-center">
            <motion.div
              variants={itemVariants}
              className="mb-6 inline-flex items-center gap-2 rounded-full border bg-background/50 px-4 py-2 backdrop-blur-sm"
            >
              <Sparkles className="h-4 w-4 text-violet-500" />
              <Badge variant="secondary" className="font-medium">
                New Features Available
              </Badge>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="mb-6 text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl"
            >
              Build the Future of{" "}
              <span className="bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 bg-clip-text text-transparent">
                Productivity
              </span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="mb-10 text-lg text-muted-foreground sm:text-xl"
            >
              Experience the next generation of team collaboration and data
              analytics. Powerful features, beautiful design, and seamless
              performance.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col gap-4 sm:flex-row sm:justify-center"
            >
              <Button
                asChild
                size="lg"
                className="group h-14 px-8 text-base shadow-lg transition-all hover:shadow-xl"
              >
                <Link href="/dashboard">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-14 px-8 text-base"
              >
                <Link href="#features">Learn More</Link>
              </Button>
            </motion.div>
          </div>
        </section>

        <section className="relative px-6 py-20">
          <div className="mx-auto max-w-5xl">
            <motion.div
              variants={itemVariants}
              className="mb-16 text-center"
            >
              <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Trusted by teams worldwide
              </h2>
              <p className="text-lg text-muted-foreground">
                Join thousands of companies already using Nexus
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
            >
              {stats.map((stat, index) => (
                <Card key={index} className="border-2 text-center">
                  <CardContent className="p-6">
                    <div className="mb-2 text-3xl font-bold bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
                      {stat.value}
                    </div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          </div>
        </section>

        <section id="features" className="relative px-6 py-20">
          <div className="mx-auto max-w-5xl">
            <motion.div
              variants={itemVariants}
              className="mb-16 text-center"
            >
              <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Everything you need to succeed
              </h2>
              <p className="text-lg text-muted-foreground">
                Powerful features designed for modern teams
              </p>
            </motion.div>

            <motion.div
              variants={containerVariants}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
            >
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div key={index} variants={itemVariants}>
                    <Card className="h-full border-2 transition-all hover:shadow-lg hover:border-primary/50">
                      <CardHeader>
                        <motion.div
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.5 }}
                          className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white"
                        >
                          <Icon className="h-6 w-6" />
                        </motion.div>
                        <CardTitle className="text-xl">{feature.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-base">
                          {feature.description}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        <section className="relative px-6 py-20">
          <div className="mx-auto max-w-5xl">
            <motion.div
              variants={itemVariants}
              className="grid gap-12 lg:grid-cols-2"
            >
              <div className="space-y-8">
                <div>
                  <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                    Why choose Nexus?
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    We&apos;ve built a platform that combines powerful features with
                    exceptional user experience.
                  </p>
                </div>

                <div className="space-y-4">
                  {benefits.map((benefit, index) => {
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-3"
                      >
                        <CheckCircle className="h-5 w-5 flex-shrink-0 text-emerald-500" />
                        <span className="text-base">{benefit}</span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              <motion.div
                variants={itemVariants}
                className="space-y-6"
              >
                <Card className="border-2 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-yellow-500" />
                      Lightning Fast
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Built on Next.js with cutting-edge performance
                      optimizations. Experience blazing-fast load times and
                      smooth interactions.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-2 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-blue-500" />
                      Enterprise Security
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Bank-level encryption and security measures to keep your
                      data safe. SOC 2 Type II certified infrastructure.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-2 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-emerald-500" />
                      Scale Without Limits
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      From startups to enterprises, our platform scales with
                      your needs. Pay only for what you use.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <section className="relative px-6 py-20">
          <div className="mx-auto max-w-4xl text-center">
            <motion.div variants={itemVariants}>
              <h2 className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl">
                Ready to transform your workflow?
              </h2>
              <p className="mb-10 text-lg text-muted-foreground">
                Join thousands of teams already using Nexus to achieve more
              </p>
              <Button
                asChild
                size="lg"
                className="group h-14 px-8 text-base shadow-lg transition-all hover:shadow-xl"
              >
                <Link href="/dashboard">
                  Start Your Free Trial
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <p className="mt-4 text-sm text-muted-foreground">
                No credit card required • 14-day free trial
              </p>
            </motion.div>
          </div>
        </section>

        <footer className="border-t bg-muted/50 px-6 py-12">
          <div className="mx-auto max-w-5xl text-center">
            <motion.div
              variants={itemVariants}
              className="flex items-center justify-center gap-2"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold">Nexus</span>
            </motion.div>
            <motion.p
              variants={itemVariants}
              className="mt-4 text-sm text-muted-foreground"
            >
              © 2026 Nexus. Built with Next.js, React, and Tailwind CSS.
            </motion.p>
          </div>
        </footer>
      </motion.div>
    </div>
  );
}
