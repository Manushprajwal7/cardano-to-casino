"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Access Denied</h1>
          <p className="text-lg text-muted-foreground">
            You do not have permission to view this page.
          </p>
        </div>

        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 max-w-md">
          <p className="text-destructive">
            Your current user role does not have access to this resource. Please
            contact your administrator if you believe this is an error.
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <Button onClick={() => router.back()}>Go Back</Button>
          <Button onClick={() => router.push("/dashboard")}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
