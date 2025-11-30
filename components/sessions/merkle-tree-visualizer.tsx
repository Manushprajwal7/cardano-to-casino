"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight, Copy } from "lucide-react";

interface MerkleNode {
  id: string;
  hash: string;
  left?: MerkleNode;
  right?: MerkleNode;
  isLeaf?: boolean;
}

interface MerkleTreeVisualizerProps {
  rootNode: MerkleNode;
  onNodeClick?: (node: MerkleNode) => void;
}

export function MerkleTreeVisualizer({
  rootNode,
  onNodeClick,
}: MerkleTreeVisualizerProps) {
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>(
    {}
  );
  const [copied, setCopied] = useState<string | null>(null);

  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId],
    }));
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const renderNode = (node: MerkleNode, level = 0) => {
    const isExpanded = expandedNodes[node.id] || false;
    const hasChildren = node.left || node.right;

    return (
      <div key={node.id} className="ml-4">
        <div
          className={`flex items-center gap-2 p-2 rounded-lg hover:bg-secondary/50 cursor-pointer ${
            onNodeClick ? "cursor-pointer" : ""
          }`}
          onClick={() =>
            hasChildren ? toggleNode(node.id) : onNodeClick?.(node)
          }
        >
          {hasChildren && (
            <Button
              variant="ghost"
              size="sm"
              className="h-5 w-5 p-0"
              onClick={(e) => {
                e.stopPropagation();
                toggleNode(node.id);
              }}
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </Button>
          )}

          <div className="flex-1 flex items-center gap-2">
            <Badge
              variant={node.isLeaf ? "secondary" : "default"}
              className="text-xs"
            >
              {node.isLeaf ? "Leaf" : "Node"}
            </Badge>
            <code className="font-mono text-xs truncate flex-1">
              {node.hash}
            </code>
            <Button
              variant="ghost"
              size="sm"
              className="h-5 w-5 p-0"
              onClick={(e) => {
                e.stopPropagation();
                copyToClipboard(node.hash, node.id);
              }}
            >
              <Copy
                className={`w-3 h-3 ${
                  copied === node.id ? "text-green-500" : ""
                }`}
              />
            </Button>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="border-l-2 border-border ml-3 pl-3 py-1">
            {node.left && renderNode(node.left, level + 1)}
            {node.right && renderNode(node.right, level + 1)}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle>Merkle Tree Visualization</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto max-h-96">{renderNode(rootNode)}</div>
      </CardContent>
    </Card>
  );
}
