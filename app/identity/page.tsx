"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
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
import { Lock, Download, Trash2, Plus, CheckCircle, Clock } from "lucide-react"

export default function IdentityPage() {
  const [operators, setOperators] = useState([
    {
      id: "OP-001",
      name: "Casino A",
      did: "did:prism:2ae4...78b9",
      verified: true,
      credentialIssued: true,
      lastLogin: "2024-01-15 14:32",
    },
    {
      id: "OP-002",
      name: "Casino B",
      did: "did:prism:5df1...a4c2",
      verified: true,
      credentialIssued: true,
      lastLogin: "2024-01-15 13:15",
    },
    {
      id: "OP-003",
      name: "Casino C",
      did: "did:prism:8gh2...b3d5",
      verified: false,
      credentialIssued: false,
      lastLogin: "2024-01-14 10:20",
    },
  ])

  const handleIssueCredential = (operatorId: string) => {
    setOperators(operators.map((op) => (op.id === operatorId ? { ...op, credentialIssued: true, verified: true } : op)))
  }

  const handleRevokeCredential = (operatorId: string) => {
    setOperators(operators.map((op) => (op.id === operatorId ? { ...op, credentialIssued: false } : op)))
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Identity Management</h1>
          <p className="text-muted-foreground mt-2">Atala PRISM - Operator DID verification and credential issuance</p>
        </div>

        {/* Identity Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Verified Operators</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{operators.filter((op) => op.verified).length}</div>
              <p className="text-xs text-muted-foreground mt-1">Active identities</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Pending Verification</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{operators.filter((op) => !op.verified).length}</div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting approval</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Active Credentials</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{operators.filter((op) => op.credentialIssued).length}</div>
              <p className="text-xs text-muted-foreground mt-1">Valid credentials</p>
            </CardContent>
          </Card>
        </div>

        {/* Operators Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Operator Identities</CardTitle>
                <CardDescription>DID verification and credential management</CardDescription>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Register Operator
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Register New Operator</DialogTitle>
                    <DialogDescription>Create a new DID for an operator</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Operator Name</label>
                      <Input placeholder="Casino Name" className="mt-1" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Email</label>
                      <Input type="email" placeholder="admin@casino.com" className="mt-1" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">DID Method</label>
                      <Input value="did:prism" readOnly className="mt-1" />
                    </div>
                    <Button className="w-full">Create DID & Register</Button>
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
                  <TableHead>DID</TableHead>
                  <TableHead>Verification Status</TableHead>
                  <TableHead>Credential</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {operators.map((operator) => (
                  <TableRow key={operator.id}>
                    <TableCell className="font-medium">{operator.name}</TableCell>
                    <TableCell className="font-mono text-sm">{operator.did}</TableCell>
                    <TableCell>
                      <Badge variant={operator.verified ? "default" : "secondary"}>
                        {operator.verified ? (
                          <>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 mr-1" />
                            Pending
                          </>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {operator.credentialIssued ? (
                        <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary">None</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{operator.lastLogin}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {!operator.credentialIssued ? (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline" onClick={() => {}}>
                                Issue Credential
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Issue Credential</DialogTitle>
                                <DialogDescription>Issue a verifiable credential to {operator.name}</DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <label className="text-sm font-medium">Credential Type</label>
                                  <Input value="OperatorLicense" readOnly className="mt-1" />
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Expiration (days)</label>
                                  <Input type="number" defaultValue="365" className="mt-1" />
                                </div>
                                <Button
                                  className="w-full"
                                  onClick={() => {
                                    handleIssueCredential(operator.id)
                                  }}
                                >
                                  Issue Credential
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        ) : (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="destructive">
                                <Trash2 className="w-4 h-4 mr-1" />
                                Revoke
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Revoke Credential</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will revoke the credential for {operator.name}. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogAction
                                onClick={() => {
                                  handleRevokeCredential(operator.id)
                                }}
                              >
                                Revoke
                              </AlertDialogAction>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                        <Button size="sm" variant="ghost">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* DID Registry Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              DID Registry Information
            </CardTitle>
            <CardDescription>Atala PRISM distributed identity configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-muted p-3 rounded-md">
                <p className="text-xs text-muted-foreground mb-1">DID Method</p>
                <p className="font-mono text-sm">did:prism</p>
              </div>
              <div className="bg-muted p-3 rounded-md">
                <p className="text-xs text-muted-foreground mb-1">Registry Network</p>
                <p className="font-mono text-sm">Cardano (Preprod)</p>
              </div>
              <div className="bg-muted p-3 rounded-md">
                <p className="text-xs text-muted-foreground mb-1">Credential Schema</p>
                <p className="font-mono text-xs break-all">schema:credential:operator:v1</p>
              </div>
              <div className="bg-muted p-3 rounded-md">
                <p className="text-xs text-muted-foreground mb-1">Revocation Registry</p>
                <p className="font-mono text-xs break-all">cardano:revocation:prod</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
