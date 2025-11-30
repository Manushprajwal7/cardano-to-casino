"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { AIFraudDetection } from "@/components/admin/ai-fraud-detection";
import { SmartSearchBar } from "@/components/search/smart-search-bar";

export default function FraudDetectionPage() {
  return (
    <ProtectedRoute>
      <div className="flex-1 overflow-auto">
        <div className="p-8 space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight neon-green">
              AI-Powered Fraud Detection
            </h1>
            <p className="text-muted-foreground mt-2">
              Real-time anomaly detection using machine learning algorithms
            </p>
          </div>

          {/* Smart Search */}
          <div className="flex justify-center">
            <SmartSearchBar />
          </div>

          {/* AI Fraud Detection Dashboard */}
          <AIFraudDetection />
        </div>
      </div>
    </ProtectedRoute>
  );
}
