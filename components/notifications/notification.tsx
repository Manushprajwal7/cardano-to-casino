"use client";

import { useState, useEffect } from "react";
import { useNotification } from "@/contexts/notification-context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Info, CheckCircle, AlertTriangle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const typeStyles = {
  info: "bg-blue-500/10 border-blue-500/20 text-blue-500",
  success: "bg-green-500/10 border-green-500/20 text-green-500",
  warning: "bg-yellow-500/10 border-yellow-500/20 text-yellow-500",
  error: "bg-red-500/10 border-red-500/20 text-red-500",
};

const typeIcons = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertCircle,
};

export function NotificationContainer() {
  const { notifications, removeNotification } = useNotification();
  const [visibleNotifications, setVisibleNotifications] = useState<string[]>(
    []
  );

  useEffect(() => {
    // When notifications change, add new ones to visible list
    const newNotifications = notifications.filter(
      (notification) => !visibleNotifications.includes(notification.id)
    );

    if (newNotifications.length > 0) {
      setVisibleNotifications((prev) => [
        ...prev,
        ...newNotifications.map((n) => n.id),
      ]);
    }
  }, [notifications, visibleNotifications]);

  const handleRemove = (id: string) => {
    setVisibleNotifications((prev) =>
      prev.filter((notificationId) => notificationId !== id)
    );
    // Give time for animation before actually removing
    setTimeout(() => {
      removeNotification(id);
    }, 300);
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 w-full max-w-xs">
      {notifications.map((notification) => {
        const Icon = typeIcons[notification.type];
        const isVisible = visibleNotifications.includes(notification.id);

        return (
          <div
            key={notification.id}
            className={cn(
              "transition-all duration-300 ease-in-out",
              isVisible
                ? "translate-x-0 opacity-100"
                : "translate-x-full opacity-0"
            )}
          >
            <Card
              className={cn("border shadow-lg", typeStyles[notification.type])}
            >
              <CardContent className="p-4 relative">
                <div className="flex items-start gap-3">
                  <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm">
                      {notification.title}
                    </h4>
                    {notification.message && (
                      <p className="text-sm mt-1 opacity-90">
                        {notification.message}
                      </p>
                    )}
                    <p className="text-xs mt-2 opacity-70">
                      {notification.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-70 hover:opacity-100"
                    onClick={() => handleRemove(notification.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      })}
    </div>
  );
}
