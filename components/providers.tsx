"use client";

import { MeshProvider } from "@meshsdk/react";
import { AuthProvider } from "@/contexts/auth-context";
import { NotificationProvider } from "@/contexts/notification-context";
import { NotificationContainer } from "@/components/notifications/notification";
import { HydraProvider } from "@/components/hydra/hydra-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <MeshProvider>
        <HydraProvider>
          <NotificationProvider>
            {children}
            <NotificationContainer />
          </NotificationProvider>
        </HydraProvider>
      </MeshProvider>
    </AuthProvider>
  );
}
