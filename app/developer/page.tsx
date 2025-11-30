"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Code, Plus, Copy, Trash2, Globe, Eye, EyeOff, ExternalLink } from "lucide-react"

export default function DeveloperPage() {
  const [apiKeys, setApiKeys] = useState([
    {
      id: "key_1",
      name: "Production API Key",
      key: "sk_live_51234567890abcdef",
      lastUsed: "2024-01-15 14:32",
      created: "2024-01-01",
    },
    {
      id: "key_2",
      name: "Development API Key",
      key: "sk_test_0987654321fedcba",
      lastUsed: "2024-01-15 13:15",
      created: "2024-01-10",
    },
  ])

  const [webhooks, setWebhooks] = useState([
    {
      id: "wh_1",
      url: "https://api.casino-a.com/webhooks/settlement",
      events: ["settlement.created", "settlement.completed"],
      status: "active",
    },
    {
      id: "wh_2",
      url: "https://api.casino-b.com/webhooks/settlement",
      events: ["settlement.completed"],
      status: "inactive",
    },
  ])

  const [showKey, setShowKey] = useState<string | null>(null)

  const handleDeleteKey = (id: string) => {
    setApiKeys(apiKeys.filter((key) => key.id !== id))
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Developer / API</h1>
          <p className="text-muted-foreground mt-2">API keys, webhooks, and sandbox integration</p>
        </div>

        <Tabs defaultValue="keys" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="keys">API Keys</TabsTrigger>
            <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
            <TabsTrigger value="playground">API Playground</TabsTrigger>
            <TabsTrigger value="sandbox">Sandbox Mode</TabsTrigger>
          </TabsList>

          {/* API Keys Tab */}
          <TabsContent value="keys">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>API Keys</CardTitle>
                    <CardDescription>Create and manage API keys for programmatic access</CardDescription>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Create API Key
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New API Key</DialogTitle>
                        <DialogDescription>Generate a new API key for your application</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Key Name</label>
                          <Input placeholder="e.g., Production API Key" className="mt-1" />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Environment</label>
                          <select className="w-full mt-1 p-2 border border-border rounded-md bg-background">
                            <option>Production (Mainnet)</option>
                            <option>Staging (Preprod)</option>
                            <option>Development (Preview)</option>
                          </select>
                        </div>
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                          <p className="text-xs text-blue-500">
                            Save your API key securely. You won&apos;t be able to view it again.
                          </p>
                        </div>
                        <Button className="w-full">Generate Key</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Key</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Last Used</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {apiKeys.map((apiKey) => (
                      <TableRow key={apiKey.id}>
                        <TableCell className="font-medium">{apiKey.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <code className="font-mono text-sm">
                              {showKey === apiKey.id ? apiKey.key : "••••••••••••••••"}
                            </code>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setShowKey(showKey === apiKey.id ? null : apiKey.id)}
                            >
                              {showKey === apiKey.id ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => navigator.clipboard.writeText(apiKey.key)}>
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{apiKey.created}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{apiKey.lastUsed}</TableCell>
                        <TableCell>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="destructive" className="gap-1">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Revoke API Key</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will revoke the API key &quot;{apiKey.name}&quot; and any applications using it
                                  will stop working.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogAction
                                onClick={() => handleDeleteKey(apiKey.id)}
                                className="bg-destructive hover:bg-destructive/90"
                              >
                                Revoke Key
                              </AlertDialogAction>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Webhooks Tab */}
          <TabsContent value="webhooks">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Webhook Management</CardTitle>
                    <CardDescription>Configure webhooks for real-time event notifications</CardDescription>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Register Webhook
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Register New Webhook</DialogTitle>
                        <DialogDescription>Add a new webhook endpoint for event notifications</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Webhook URL</label>
                          <Input placeholder="https://api.example.com/webhooks/events" className="mt-1" />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Events</label>
                          <div className="mt-2 space-y-2">
                            {["settlement.created", "settlement.completed", "settlement.failed", "audit.completed"].map(
                              (event) => (
                                <label key={event} className="flex items-center gap-2">
                                  <input type="checkbox" className="rounded border-border" />
                                  <span className="text-sm">{event}</span>
                                </label>
                              ),
                            )}
                          </div>
                        </div>
                        <Button className="w-full">Create Webhook</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {webhooks.map((webhook) => (
                  <div key={webhook.id} className="border border-border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-mono text-sm">{webhook.url}</p>
                          <Badge variant={webhook.status === "active" ? "default" : "secondary"}>
                            {webhook.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">Events: {webhook.events.join(", ")}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          Test
                        </Button>
                        <Button size="sm" variant="outline">
                          Logs
                        </Button>
                        <Button size="sm" variant="destructive">
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* API Playground Tab */}
          <TabsContent value="playground">
            <Card>
              <CardHeader>
                <CardTitle>API Playground</CardTitle>
                <CardDescription>Test API endpoints with example requests</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm">Available Endpoints</h3>

                  {[
                    {
                      title: "Upload Logs",
                      method: "POST",
                      endpoint: "/api/sessions/{sessionId}/logs",
                      description: "Upload game session logs",
                    },
                    {
                      title: "Compute Merkle Root",
                      method: "POST",
                      endpoint: "/api/merkle/compute",
                      description: "Calculate merkle root from log entries",
                    },
                    {
                      title: "Settlement Preview",
                      method: "POST",
                      endpoint: "/api/settlements/preview",
                      description: "Preview settlement transaction before submission",
                    },
                    {
                      title: "Submit Transaction",
                      method: "POST",
                      endpoint: "/api/settlements/submit",
                      description: "Submit settlement to blockchain",
                    },
                  ].map((endpoint, idx) => (
                    <div key={idx} className="border border-border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">
                          {endpoint.method}
                        </Badge>
                        <code className="font-mono text-sm">{endpoint.endpoint}</code>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{endpoint.description}</p>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <Code className="w-4 h-4 mr-2" />
                            View Example
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>{endpoint.title}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-3">
                            <div>
                              <p className="text-xs font-medium mb-2">Request</p>
                              <pre className="bg-muted p-3 rounded-md overflow-auto max-h-40 text-xs font-mono">
                                {JSON.stringify(
                                  {
                                    method: endpoint.method,
                                    url: endpoint.endpoint,
                                    headers: { Authorization: "Bearer sk_live_..." },
                                    body: { example: "data" },
                                  },
                                  null,
                                  2,
                                )}
                              </pre>
                            </div>
                            <div>
                              <p className="text-xs font-medium mb-2">Response</p>
                              <pre className="bg-muted p-3 rounded-md overflow-auto max-h-40 text-xs font-mono">
                                {JSON.stringify(
                                  { success: true, data: { id: "123", status: "pending" }, error: null },
                                  null,
                                  2,
                                )}
                              </pre>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sandbox Mode Tab */}
          <TabsContent value="sandbox">
            <Card>
              <CardHeader>
                <CardTitle>Sandbox Mode</CardTitle>
                <CardDescription>Test your integration before going live</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <p className="text-sm text-blue-500">
                    Sandbox mode allows you to test settlements with testnet tokens. All transactions are reversible and
                    do not affect mainnet.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-border rounded-lg p-4">
                    <p className="text-sm font-medium mb-3">Network Selection</p>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input type="radio" name="network" defaultChecked />
                        <span className="text-sm">
                          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                            Preprod
                          </Badge>
                          Cardano Pre-Production
                        </span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="radio" name="network" />
                        <span className="text-sm">
                          <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                            Preview
                          </Badge>
                          Cardano Preview
                        </span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="radio" name="network" disabled />
                        <span className="text-sm text-muted-foreground">
                          <Badge variant="outline">Mainnet</Badge>
                          Production (requires verified account)
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="border border-border rounded-lg p-4">
                    <p className="text-sm font-medium mb-3">Testnet Faucet</p>
                    <p className="text-xs text-muted-foreground mb-3">Get free testnet ADA to test settlements</p>
                    <Button className="w-full gap-2">
                      <Globe className="w-4 h-4" />
                      Get Testnet ADA
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-3">Test Transactions</p>
                  <div className="space-y-2">
                    {[
                      { hash: "abc123def456...", status: "Confirmed", time: "2024-01-15 14:32" },
                      { hash: "ghi789jkl012...", status: "Failed", time: "2024-01-15 13:15" },
                      { hash: "mno345pqr678...", status: "Pending", time: "2024-01-15 12:45" },
                    ].map((tx, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-muted p-3 rounded-lg">
                        <div>
                          <p className="font-mono text-sm">{tx.hash}</p>
                          <p className="text-xs text-muted-foreground">{tx.time}</p>
                        </div>
                        <Badge
                          variant={
                            tx.status === "Confirmed" ? "default" : tx.status === "Failed" ? "destructive" : "secondary"
                          }
                        >
                          {tx.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
