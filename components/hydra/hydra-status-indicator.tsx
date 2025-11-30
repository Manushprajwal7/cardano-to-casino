"use client";

import { Badge } from "@/components/ui/badge";
import { useHydraContext } from "@/components/hydra/hydra-provider";

interface HydraStatusIndicatorProps {
  showLabels?: boolean;
}

export function HydraStatusIndicator({
  showLabels = true,
}: HydraStatusIndicatorProps) {
  const { isConnected, isReady, error } = useHydraContext();

  if (error) {
    return (
      <div className="flex items-center gap-2">
        {showLabels && <span className="text-sm">Hydra:</span>}
        <Badge variant="destructive">Error</Badge>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="flex items-center gap-2">
        {showLabels && <span className="text-sm">Hydra:</span>}
        <Badge variant="destructive">Disconnected</Badge>
      </div>
    );
  }

  if (!isReady) {
    return (
      <div className="flex items-center gap-2">
        {showLabels && <span className="text-sm">Hydra:</span>}
        <Badge variant="secondary">Connecting</Badge>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {showLabels && <span className="text-sm">Hydra:</span>}
      <Badge>Connected</Badge>
    </div>
  );
}
