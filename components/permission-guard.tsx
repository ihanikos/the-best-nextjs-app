"use client";

import React, { ReactNode } from "react";
import { UserRole, Permission, hasPermission, hasAnyPermission, hasAllPermissions } from "@/lib/auth/roles";

interface PermissionGuardProps {
  userRole: UserRole | null | undefined;
  permission: Permission;
  children: ReactNode;
  fallback?: ReactNode;
}

interface PermissionGuardAnyProps {
  userRole: UserRole | null | undefined;
  permissions: Permission[];
  children: ReactNode;
  fallback?: ReactNode;
}

interface PermissionGuardAllProps {
  userRole: UserRole | null | undefined;
  permissions: Permission[];
  children: ReactNode;
  fallback?: ReactNode;
}

interface RoleGuardProps {
  userRole: UserRole | null | undefined;
  allowedRoles: UserRole[];
  children: ReactNode;
  fallback?: ReactNode;
}

// Guard that renders children only if user has specific permission
export function PermissionGuard({
  userRole,
  permission,
  children,
  fallback = null,
}: PermissionGuardProps) {
  if (!userRole) return fallback;
  
  const hasAccess = hasPermission(userRole, permission);
  return hasAccess ? <>{children}</> : <>{fallback}</>;
}

// Guard that renders children if user has ANY of the specified permissions
export function PermissionGuardAny({
  userRole,
  permissions,
  children,
  fallback = null,
}: PermissionGuardAnyProps) {
  if (!userRole) return fallback;
  
  const hasAccess = hasAnyPermission(userRole, permissions);
  return hasAccess ? <>{children}</> : <>{fallback}</>;
}

// Guard that renders children only if user has ALL of the specified permissions
export function PermissionGuardAll({
  userRole,
  permissions,
  children,
  fallback = null,
}: PermissionGuardAllProps) {
  if (!userRole) return fallback;
  
  const hasAccess = hasAllPermissions(userRole, permissions);
  return hasAccess ? <>{children}</> : <>{fallback}</>;
}

// Guard that renders children only if user has specific role(s)
export function RoleGuard({
  userRole,
  allowedRoles,
  children,
  fallback = null,
}: RoleGuardProps) {
  if (!userRole) return fallback;
  
  const hasAccess = allowedRoles.includes(userRole);
  return hasAccess ? <>{children}</> : <>{fallback}</>;
}

// Higher-order component for protecting entire components
export function withPermission<P extends object>(
  Component: React.ComponentType<P>,
  permission: Permission
) {
  return function PermissionWrappedComponent(
    props: P & { userRole: UserRole | null | undefined }
  ) {
    const { userRole, ...componentProps } = props;
    
    return (
      <PermissionGuard userRole={userRole} permission={permission}>
        <Component {...(componentProps as P)} />
      </PermissionGuard>
    );
  };
}

// Higher-order component for protecting components with any permission
export function withAnyPermission<P extends object>(
  Component: React.ComponentType<P>,
  permissions: Permission[]
) {
  return function PermissionWrappedComponent(
    props: P & { userRole: UserRole | null | undefined }
  ) {
    const { userRole, ...componentProps } = props;
    
    return (
      <PermissionGuardAny userRole={userRole} permissions={permissions}>
        <Component {...(componentProps as P)} />
      </PermissionGuardAny>
    );
  };
}

// Hook-like utility for conditional rendering
export function usePermissionCheck(
  userRole: UserRole | null | undefined,
  permission: Permission
): boolean {
  if (!userRole) return false;
  return hasPermission(userRole, permission);
}

export function useAnyPermissionCheck(
  userRole: UserRole | null | undefined,
  permissions: Permission[]
): boolean {
  if (!userRole) return false;
  return hasAnyPermission(userRole, permissions);
}

export function useAllPermissionsCheck(
  userRole: UserRole | null | undefined,
  permissions: Permission[]
): boolean {
  if (!userRole) return false;
  return hasAllPermissions(userRole, permissions);
}
