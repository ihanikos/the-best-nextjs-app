export type ActivityAction =
  | "project_created"
  | "project_updated"
  | "project_deleted"
  | "project_archived"
  | "project_unarchived"
  | "task_created"
  | "task_updated"
  | "task_deleted"
  | "task_status_changed"
  | "task_assigned"
  | "task_unassigned"
  | "member_added"
  | "member_removed"
  | "member_role_changed"
  | "member_invited"
  | "comment_added"
  | "file_uploaded"
  | "settings_changed"
  | "login"
  | "logout";

export interface ActivityMetadata {
  projectId?: string;
  projectName?: string;
  taskId?: string;
  taskTitle?: string;
  memberId?: string;
  memberName?: string;
  memberEmail?: string;
  oldRole?: string;
  newRole?: string;
  oldStatus?: string;
  newStatus?: string;
  fromColumn?: string;
  toColumn?: string;
  comment?: string;
  fileName?: string;
  fileSize?: number;
  settingName?: string;
  oldValue?: string;
  newValue?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface Activity {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  action: ActivityAction;
  targetType: "project" | "task" | "member" | "system" | "settings";
  targetId?: string;
  targetName?: string;
  description: string;
  metadata?: ActivityMetadata;
  createdAt: string;
  organizationId?: string;
}

export interface ActivityFilter {
  userId?: string;
  action?: ActivityAction;
  targetType?: Activity["targetType"];
  targetId?: string;
  startDate?: string;
  endDate?: string;
  searchQuery?: string;
}

export interface ActivityStats {
  totalActivities: number;
  activitiesByType: Record<ActivityAction, number>;
  activitiesByUser: Record<string, number>;
  activitiesByDay: Record<string, number>;
}

export const activityActionLabels: Record<ActivityAction, string> = {
  project_created: "Created Project",
  project_updated: "Updated Project",
  project_deleted: "Deleted Project",
  project_archived: "Archived Project",
  project_unarchived: "Unarchived Project",
  task_created: "Created Task",
  task_updated: "Updated Task",
  task_deleted: "Deleted Task",
  task_status_changed: "Changed Task Status",
  task_assigned: "Assigned Task",
  task_unassigned: "Unassigned Task",
  member_added: "Added Team Member",
  member_removed: "Removed Team Member",
  member_role_changed: "Changed Member Role",
  member_invited: "Invited Member",
  comment_added: "Added Comment",
  file_uploaded: "Uploaded File",
  settings_changed: "Changed Settings",
  login: "Logged In",
  logout: "Logged Out",
};

export const activityActionIcons: Record<ActivityAction, string> = {
  project_created: "FolderPlus",
  project_updated: "Edit",
  project_deleted: "Trash2",
  project_archived: "Archive",
  project_unarchived: "ArchiveRestore",
  task_created: "FilePlus",
  task_updated: "Edit",
  task_deleted: "Trash2",
  task_status_changed: "ArrowRightLeft",
  task_assigned: "UserPlus",
  task_unassigned: "UserMinus",
  member_added: "UserPlus",
  member_removed: "UserMinus",
  member_role_changed: "Shield",
  member_invited: "Mail",
  comment_added: "MessageSquare",
  file_uploaded: "Upload",
  settings_changed: "Settings",
  login: "LogIn",
  logout: "LogOut",
};

export const activityTargetColors: Record<Activity["targetType"], string> = {
  project: "bg-blue-500/10 text-blue-600",
  task: "bg-emerald-500/10 text-emerald-600",
  member: "bg-violet-500/10 text-violet-600",
  system: "bg-slate-500/10 text-slate-600",
  settings: "bg-amber-500/10 text-amber-600",
};
