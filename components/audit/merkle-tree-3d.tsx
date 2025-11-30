"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text, Sphere, Line } from "@react-three/drei";
import { Card, CardContent, CardDescription,CardHeader, CardTitle } from "@/components/ui/card";
import { Binary, Box } from "lucide-react";
import { useState } from "react";
import * as THREE from "three";

interface MerkleNode {
  hash: string;
  left?: MerkleNode;
  right?: MerkleNode;
  isLeaf: boolean;
  position: [number, number, number];
}

function Node({ node, onClick }: { node: MerkleNode; onClick: () => void }) {
  const color = node.isLeaf ? "#22c55e" : node.left || node.right ? "#3b82f6" : "#a855f7";
  
  return (
    <group position={node.position}>
      <Sphere args={[0.3, 32, 32]} onClick={onClick}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
      </Sphere>
      <Text
        position={[0, -0.6, 0]}
        fontSize={0.15}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {node.hash.substring(0, 8)}...
      </Text>
    </group>
  );
}

function Connection({ from, to }: { from: [number, number, number]; to: [number, number, number] }) {
  const points = [new THREE.Vector3(...from), new THREE.Vector3(...to)];
  
  return (
    <Line
      points={points}
      color="#70c88c"
      lineWidth={2}
      opacity={0.6}
      transparent
    />
  );
}

function MerkleTree3D({ tree }: { tree: MerkleNode }) {
  const [selectedNode, setSelectedNode] = useState<MerkleNode | null>(null);

  const renderTree = (node: MerkleNode | undefined): JSX.Element[] => {
    if (!node) return [];

    const elements: JSX.Element[] = [
      <Node key={node.hash} node={node} onClick={() => setSelectedNode(node)} />
    ];

    if (node.left) {
      elements.push(
        <Connection key={`${node.hash}-left`} from={node.position} to={node.left.position} />
      );
      elements.push(...renderTree(node.left));
    }

    if (node.right) {
      elements.push(
        <Connection key={`${node.hash}-right`} from={node.position} to={node.right.position} />
      );
      elements.push(...renderTree(node.right));
    }

    return elements;
  };

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />
      {renderTree(tree)}
      <OrbitControls enablePan enableZoom enableRotate />
    </>
  );
}

export function MerkleTree3DExplorer() {
  // Sample Merkle tree structure
  const sampleTree: MerkleNode = {
    hash: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0",
    isLeaf: false,
    position: [0, 3, 0],
    left: {
      hash: "0xabc123def456789",
      isLeaf: false,
      position: [-2, 1.5, 0],
      left: {
        hash: "0xleaf1abc",
        isLeaf: true,
        position: [-3, 0, 0],
      },
      right: {
        hash: "0xleaf2def",
        isLeaf: true,
        position: [-1, 0, 0],
      },
    },
    right: {
      hash: "0x789ghi012jkl345",
      isLeaf: false,
      position: [2, 1.5, 0],
      left: {
        hash: "0xleaf3ghi",
        isLeaf: true,
        position: [1, 0, 0],
      },
      right: {
        hash: "0xleaf4jkl",
        isLeaf: true,
        position: [3, 0, 0],
      },
    },
  };

  return (
    <Card className="glass-card">
      <CardHeader className="border-b border-green-500/20">
        <div className="flex items-center gap-2">
          <Box className="w-5 h-5 neon-green" />
          <div>
            <CardTitle className="neon-green">3D Merkle Tree Explorer</CardTitle>
            <CardDescription>Interactive visualization of cryptographic proof structure</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[500px] w-full bg-gradient-dark relative rounded-b-lg overflow-hidden">
          <Canvas camera={{ position: [0, 2, 8], fov: 50 }}>
            <MerkleTree3D tree={sampleTree} />
          </Canvas>
          
          {/* Legend */}
          <div className="absolute bottom-4 left-4 glass-intense p-4 rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Leaf Nodes</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span>Internal Nodes</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <span>Root Node</span>
            </div>
          </div>

          {/* Controls hint */}
          <div className="absolute top-4 right-4 glass-intense p-3 rounded-lg text-xs text-muted-foreground">
            <div>🖱️ Drag to rotate</div>
            <div>🔍 Scroll to zoom</div>
            <div>👆 Click nodes to inspect</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
