"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "operator" | "auditor" | "admin" | "developer";
  requiredRoles?: ("operator" | "auditor" | "admin" | "developer")[];
}

export function ProtectedRoute({
  children,
  requiredRole,
  requiredRoles,
}: ProtectedRouteProps) {
  const { isAuthenticated, hasRole, hasAnyRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    } else if (requiredRole && !hasRole(requiredRole)) {
      router.push("/unauthorized");
    } else if (requiredRoles && !hasAnyRole(requiredRoles)) {
      router.push("/unauthorized");
    }
  }, [
    isAuthenticated,
    hasRole,
    hasAnyRole,
    requiredRole,
    requiredRoles,
    router,
  ]);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p>You do not have permission to view this page.</p>
      </div>
    );
  }

  if (requiredRoles && !hasAnyRole(requiredRoles)) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p>You do not have permission to view this page.</p>
      </div>
    );
  }

  return <>{children}</>;
}
