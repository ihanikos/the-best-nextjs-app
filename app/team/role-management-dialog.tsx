"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  UserRole,
  ROLE_INFO,
  getAllRoles,
} from "@/lib/auth/roles";
import { Shield, User, Eye, Users } from "lucide-react";

interface RoleManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberName: string;
  memberEmail: string;
  currentRole: string;
  onRoleChange: (role: UserRole) => void;
}

const roleIcons: Record<UserRole, typeof Shield> = {
  admin: Shield,
  manager: Users,
  member: User,
  viewer: Eye,
};

export function RoleManagementDialog({
  open,
  onOpenChange,
  memberName,
  memberEmail,
  currentRole,
  onRoleChange,
}: RoleManagementDialogProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>(
    (currentRole.toLowerCase() as UserRole) || "member"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    onRoleChange(selectedRole);
    setIsSubmitting(false);
    onOpenChange(false);
  };

  const roles = getAllRoles();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Manage Role</DialogTitle>
          <DialogDescription>
            Change the role and permissions for {memberName}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="mb-6 rounded-lg border bg-muted/50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <span className="text-sm font-medium">
                  {memberName.split(" ").map((n) => n[0]).join("")}
                </span>
              </div>
              <div>
                <p className="font-medium">{memberName}</p>
                <p className="text-sm text-muted-foreground">{memberEmail}</p>
              </div>
              <Badge variant="secondary" className="ml-auto">
                {ROLE_INFO[currentRole.toLowerCase() as UserRole]?.label || currentRole}
              </Badge>
            </div>
          </div>

          <Label className="mb-3 block text-base font-semibold">
            Select a new role
          </Label>

          <RadioGroup
            value={selectedRole}
            onValueChange={(value) => setSelectedRole(value as UserRole)}
            className="space-y-3"
          >
            {roles.map((role) => {
              const Icon = roleIcons[role];
              const info = ROLE_INFO[role];
              
              return (
                <div
                  key={role}
                  className={`flex items-start space-x-3 rounded-lg border p-4 transition-colors hover:bg-muted/50 cursor-pointer ${
                    selectedRole === role ? "border-primary bg-primary/5" : ""
                  }`}
                  onClick={() => setSelectedRole(role)}
                >
                  <RadioGroupItem value={role} id={role} className="mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <Label
                        htmlFor={role}
                        className="cursor-pointer font-semibold"
                      >
                        {info.label}
                      </Label>
                      <Badge
                        variant="secondary"
                        className={`${info.color} text-white text-xs`}
                      >
                        {role}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {info.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </RadioGroup>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
