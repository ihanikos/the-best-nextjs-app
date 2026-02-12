"use client";

import { useState, useEffect } from "react";
import { Calendar } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Project, TeamMember } from "@/lib/projects/types";
import { toast } from "sonner";

interface EditProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project;
  onSubmit: (data: Partial<Project>) => void;
  teamMembers: TeamMember[];
}

export function EditProjectDialog({
  open,
  onOpenChange,
  project,
  onSubmit,
  teamMembers,
}: EditProjectDialogProps) {
  const [formData, setFormData] = useState({
    name: project.name,
    description: project.description,
    status: project.status,
    progress: project.progress,
    dueDate: project.dueDate,
    owner: project.owner,
    selectedMembers: project.members.filter((m) => m.id !== project.owner.id),
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setFormData({
      name: project.name,
      description: project.description,
      status: project.status,
      progress: project.progress,
      dueDate: project.dueDate,
      owner: project.owner,
      selectedMembers: project.members.filter((m) => m.id !== project.owner.id),
    });
  }, [project]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error("Project name is required");
      return;
    }

    setIsSubmitting(true);
    
    setTimeout(() => {
      onSubmit({
        name: formData.name,
        description: formData.description,
        status: formData.status,
        progress: formData.progress,
        dueDate: formData.dueDate,
        owner: formData.owner,
        members: [formData.owner, ...formData.selectedMembers],
      });
      setIsSubmitting(false);
    }, 500);
  };

  const toggleMember = (member: TeamMember) => {
    if (member.id === formData.owner.id) return;
    
    setFormData((prev) => ({
      ...prev,
      selectedMembers: prev.selectedMembers.some((m) => m.id === member.id)
        ? prev.selectedMembers.filter((m) => m.id !== member.id)
        : [...prev.selectedMembers, member],
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
          <DialogDescription>
            Update the project details below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">
              Project Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="edit-name"
              placeholder="Enter project name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              placeholder="Describe the project..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value as Project["status"] })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="on-hold">On Hold</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-dueDate">
                Due Date <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="edit-dueDate"
                  type="date"
                  className="pl-10"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-progress">Progress ({formData.progress}%)</Label>
            <Input
              id="edit-progress"
              type="range"
              min="0"
              max="100"
              value={formData.progress}
              onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-owner">Project Owner</Label>
            <Select
              value={formData.owner.id}
              onValueChange={(value) => {
                const owner = teamMembers.find((m) => m.id === value);
                if (owner) setFormData({ ...formData, owner });
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {teamMembers.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {member.avatar}
                        </AvatarFallback>
                      </Avatar>
                      {member.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Team Members</Label>
            <div className="rounded-md border p-4 space-y-2">
              {teamMembers.map((member) => (
                <div key={member.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`edit-member-${member.id}`}
                    checked={
                      member.id === formData.owner.id ||
                      formData.selectedMembers.some((m) => m.id === member.id)
                    }
                    disabled={member.id === formData.owner.id}
                    onCheckedChange={() => toggleMember(member)}
                  />
                  <Label
                    htmlFor={`edit-member-${member.id}`}
                    className="flex items-center gap-2 text-sm font-normal cursor-pointer"
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {member.avatar}
                      </AvatarFallback>
                    </Avatar>
                    {member.name}
                    {member.id === formData.owner.id && (
                      <span className="text-xs text-muted-foreground">(Owner)</span>
                    )}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
