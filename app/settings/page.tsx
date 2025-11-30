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
import { User, Lock, Shield, Network, LogOut, Trash2 } from "lucide-react"

export default function SettingsPage() {
  const [twoFAEnabled, setTwoFAEnabled] = useState(false)
  const [selectedNetwork, setSelectedNetwork] = useState("preprod")

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-2">Manage your account and preferences</p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="network">Network</TabsTrigger>
            <TabsTrigger value="danger">Account</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Profile Information
                </CardTitle>
                <CardDescription>Update your personal and account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg bg-primary/20 flex items-center justify-center">
                    <User className="w-8 h-8 text-primary" />
                  </div>
                  <Button variant="outline">Change Avatar</Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Full Name</label>
                    <Input defaultValue="Admin User" className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email Address</label>
                    <Input type="email" defaultValue="admin@cardano-casino.com" className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Role</label>
                    <Input value="Platform Administrator" readOnly className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Organization</label>
                    <Input defaultValue="Cardano Casino Integrity" className="mt-1" />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Bio</label>
                  <textarea
                    className="w-full mt-1 p-2 border border-border rounded-md bg-background"
                    rows={3}
                    placeholder="Tell us about yourself..."
                    defaultValue="Casino platform administrator and blockchain developer"
                  />
                </div>

                <div className="flex gap-2">
                  <Button>Save Changes</Button>
                  <Button variant="outline">Cancel</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Password Tab */}
          <TabsContent value="password">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Change Password
                </CardTitle>
                <CardDescription>Update your password regularly for security</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-medium">Current Password</label>
                  <Input type="password" placeholder="••••••••" className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">New Password</label>
                  <Input type="password" placeholder="••••••••" className="mt-1" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Minimum 12 characters, include uppercase, lowercase, numbers, and symbols
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Confirm New Password</label>
                  <Input type="password" placeholder="••••••••" className="mt-1" />
                </div>

                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                  <p className="text-sm text-green-500">Your password is strong and secure</p>
                </div>

                <div className="flex gap-2">
                  <Button>Update Password</Button>
                  <Button variant="outline">Cancel</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Two-Factor Authentication
                  </CardTitle>
                  <CardDescription>Add an extra layer of security to your account</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!twoFAEnabled ? (
                    <>
                      <p className="text-sm text-muted-foreground">
                        Two-factor authentication is currently disabled. Enable it to protect your account.
                      </p>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button>Enable 2FA</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Enable Two-Factor Authentication</DialogTitle>
                            <DialogDescription>Scan this QR code with your authenticator app</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="flex justify-center p-4 bg-muted rounded-lg">
                              <div className="w-32 h-32 bg-white rounded-lg flex items-center justify-center font-mono text-xs">
                                QR Code
                              </div>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Enter Code</label>
                              <Input placeholder="000000" className="mt-1 font-mono" maxLength={6} />
                            </div>
                            <Button
                              className="w-full"
                              onClick={() => {
                                setTwoFAEnabled(true)
                              }}
                            >
                              Verify & Enable 2FA
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-between bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                        <p className="text-sm text-green-500">Two-Factor Authentication is enabled</p>
                        <Badge className="bg-green-500/20 text-green-500 border-green-500/20">Active</Badge>
                      </div>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          setTwoFAEnabled(false)
                        }}
                      >
                        Disable 2FA
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Sessions</CardTitle>
                  <CardDescription>Manage your active sessions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { device: "Chrome on MacOS", location: "San Francisco, CA", lastActive: "Now" },
                    { device: "Safari on iPhone", location: "San Francisco, CA", lastActive: "2 hours ago" },
                  ].map((session, idx) => (
                    <div key={idx} className="flex items-center justify-between border border-border rounded-lg p-3">
                      <div>
                        <p className="text-sm font-medium">{session.device}</p>
                        <p className="text-xs text-muted-foreground">
                          {session.location} • {session.lastActive}
                        </p>
                      </div>
                      <Button size="sm" variant="outline">
                        Logout
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Network Tab */}
          <TabsContent value="network">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="w-5 h-5" />
                  Network Settings
                </CardTitle>
                <CardDescription>Configure your blockchain network preference</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="text-sm font-medium mb-4">Select Network</p>
                  <div className="space-y-3">
                    {[
                      { value: "preprod", label: "Preprod (Pre-Production)", description: "Recommended for testing" },
                      { value: "preview", label: "Preview", description: "Latest features, less stable" },
                      { value: "mainnet", label: "Mainnet", description: "Production network" },
                    ].map((network) => (
                      <label
                        key={network.value}
                        className="flex items-start gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                      >
                        <input
                          type="radio"
                          name="network"
                          value={network.value}
                          checked={selectedNetwork === network.value}
                          onChange={(e) => setSelectedNetwork(e.target.value)}
                          className="mt-1"
                        />
                        <div>
                          <p className="text-sm font-medium">{network.label}</p>
                          <p className="text-xs text-muted-foreground">{network.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <p className="text-sm text-blue-500">
                    Selected network:{" "}
                    <strong>{selectedNetwork.charAt(0).toUpperCase() + selectedNetwork.slice(1)}</strong>
                  </p>
                </div>

                <Button>Save Network Preference</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Danger Zone */}
          <TabsContent value="danger">
            <Card className="border-red-500/20">
              <CardHeader>
                <CardTitle className="text-red-500">Danger Zone</CardTitle>
                <CardDescription>Irreversible account actions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2 bg-transparent">
                      <LogOut className="w-4 h-4" />
                      Logout All Sessions
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Logout All Sessions</DialogTitle>
                      <DialogDescription>This will log you out from all devices immediately</DialogDescription>
                    </DialogHeader>
                    <div className="flex gap-2">
                      <Button className="flex-1">Logout All</Button>
                      <Button variant="outline" className="flex-1 bg-transparent">
                        Cancel
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="gap-2">
                      <Trash2 className="w-4 h-4" />
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Account</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. All your data will be permanently deleted.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogAction className="bg-destructive hover:bg-destructive/90">
                      Delete Account
                    </AlertDialogAction>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
