"use client";

import { MeshProvider } from "@meshsdk/react";
import { AuthProvider } from "@/contexts/auth-context";
import { NotificationProvider } from "@/contexts/notification-context";
import { NotificationContainer } from "@/components/notifications/notification";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <MeshProvider>
        <NotificationProvider>
          {children}
          <NotificationContainer />
        </NotificationProvider>
      </MeshProvider>
    </AuthProvider>
  );
}
