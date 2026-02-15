"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  MoreHorizontal,
  Mail,
  Phone,
  MapPin,
  Calendar,
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
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AddTeamMemberDialog } from "./add-team-member-dialog";
import { useAuth } from "@/lib/auth";

import { UserRole, ROLE_INFO, PERMISSIONS } from "@/lib/auth/roles";
import { PermissionGuard } from "@/components/permission-guard";
import { RoleManagementDialog } from "./role-management-dialog";

export interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  status: "active" | "offline";
  avatar: string;
  lastActive: string;
  location: string;
  projects: number;
}

const initialTeamMembers: TeamMember[] = [
  {
    id: 1,
    name: "Alex Chen",
    email: "alex@nexus.dev",
    role: "admin",
    status: "active",
    avatar: "AC",
    lastActive: "2 minutes ago",
    location: "San Francisco, CA",
    projects: 12,
  },
  {
    id: 2,
    name: "Sarah Johnson",
    email: "sarah@nexus.dev",
    role: "manager",
    status: "active",
    avatar: "SJ",
    lastActive: "15 minutes ago",
    location: "New York, NY",
    projects: 8,
  },
  {
    id: 3,
    name: "Mike Williams",
    email: "mike@nexus.dev",
    role: "member",
    status: "active",
    avatar: "MW",
    lastActive: "1 hour ago",
    location: "London, UK",
    projects: 6,
  },
  {
    id: 4,
    name: "Emily Davis",
    email: "emily@nexus.dev",
    role: "member",
    status: "active",
    avatar: "ED",
    lastActive: "3 hours ago",
    location: "Austin, TX",
    projects: 5,
  },
  {
    id: 5,
    name: "Tom Wilson",
    email: "tom@nexus.dev",
    role: "viewer",
    status: "offline",
    avatar: "TW",
    lastActive: "1 day ago",
    location: "Toronto, CA",
    projects: 10,
  },
  {
    id: 6,
    name: "Jessica Brown",
    email: "jessica@nexus.dev",
    role: "member",
    status: "active",
    avatar: "JB",
    lastActive: "30 minutes ago",
    location: "Seattle, WA",
    projects: 4,
  },
];

export default function TeamPage() {
  const { user } = useAuth();
  const userRole = user?.role || null;

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(initialTeamMembers);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  const handleAddMember = (
    newMember: Omit<TeamMember, "id" | "lastActive" | "projects">
  ) => {
    const member: TeamMember = {
      ...newMember,
      id: Math.max(...teamMembers.map((m) => m.id), 0) + 1,
      lastActive: "Just now",
      projects: 0,
    };
    setTeamMembers((prev) => [...prev, member]);
  };

  const handleEditRole = (member: TeamMember) => {
    setSelectedMember(member);
    setIsRoleDialogOpen(true);
  };

  const handleRoleChange = (newRole: UserRole) => {
    if (selectedMember) {
      setTeamMembers((prev) =>
        prev.map((m) =>
          m.id === selectedMember.id ? { ...m, role: newRole } : m
        )
      );
    }
  };

  const handleRemoveMember = (memberId: number) => {
    setTeamMembers((prev) => prev.filter((m) => m.id !== memberId));
  };

  const activeMembers = teamMembers.filter((m) => m.status === "active").length;

  return (
    <div className="space-y-8 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team</h1>
          <p className="text-muted-foreground">
            Manage your team members and their roles
          </p>
        </div>
        <PermissionGuard userRole={userRole} permission={PERMISSIONS.USER_INVITE}>
          <Button className="gap-2" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Member
          </Button>
        </PermissionGuard>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teamMembers.length}</div>
              <p className="text-xs text-muted-foreground">+3 this month</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Now</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeMembers}</div>
              <p className="text-xs text-muted-foreground">
                {Math.round((activeMembers / teamMembers.length) * 100)}% of team
              </p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Invites</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">Awaiting response</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>
              View and manage all team members in your workspace
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search team members..." className="pl-10" />
              </div>
            </div>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead>Projects</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {member.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{member.name}</div>
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {member.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={`${ROLE_INFO[member.role].color} text-white`}
                        >
                          {ROLE_INFO[member.role].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            member.status === "active" ? "default" : "secondary"
                          }
                        >
                          {member.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {member.lastActive}
                      </TableCell>
                      <TableCell>{member.projects}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>View Profile</DropdownMenuItem>
                            <DropdownMenuItem>Send Message</DropdownMenuItem>
                            <PermissionGuard
                              userRole={userRole}
                              permission={PERMISSIONS.TEAM_MANAGE_ROLES}
                            >
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleEditRole(member)}
                                >
                                  Edit Role
                                </DropdownMenuItem>
                              </>
                            </PermissionGuard>
                            <PermissionGuard
                              userRole={userRole}
                              permission={PERMISSIONS.USER_REMOVE}
                            >
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleRemoveMember(member.id)}
                              >
                                Remove
                              </DropdownMenuItem>
                            </PermissionGuard>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Team Activity</CardTitle>
            <CardDescription>Recent activity from your team</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {teamMembers.slice(0, 4).map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-4 rounded-lg border p-4"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {member.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {ROLE_INFO[member.role].label} • {member.location}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {member.lastActive}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <AddTeamMemberDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={handleAddMember}
      />

      {selectedMember && (
        <RoleManagementDialog
          open={isRoleDialogOpen}
          onOpenChange={setIsRoleDialogOpen}
          memberName={selectedMember.name}
          memberEmail={selectedMember.email}
          currentRole={selectedMember.role}
          onRoleChange={handleRoleChange}
        />
      )}
    </div>
  );
}
