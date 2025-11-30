"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"

interface CreateSettlementModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateSettlementModal({ open, onOpenChange }: CreateSettlementModalProps) {
  const [selectedSessions, setSelectedSessions] = useState<string[]>([])
  const [amount, setAmount] = useState("")

  const mockSessions = [
    { id: "SESSION-001", operator: "MGM Grand", amount: "1,250.00" },
    { id: "SESSION-002", operator: "Bellagio", amount: "2,000.50" },
    { id: "SESSION-003", operator: "Caesars Palace", amount: "1,500.25" },
    { id: "SESSION-004", operator: "Venetian", amount: "875.75" },
  ]

  const handleSessionSelect = (sessionId: string) => {
    setSelectedSessions((prev) =>
      prev.includes(sessionId) ? prev.filter((id) => id !== sessionId) : [...prev, sessionId],
    )
  }

  const totalAmount = selectedSessions.reduce((sum, id) => {
    const session = mockSessions.find((s) => s.id === id)
    return sum + (session ? Number.parseFloat(session.amount.replace(/,/g, "")) : 0)
  }, 0)

  const platformFee = (totalAmount * 0.01).toFixed(2)
  const remainder = (totalAmount - Number.parseFloat(platformFee)).toFixed(2)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Settlement</DialogTitle>
          <DialogDescription>Select sessions and review settlement details before submission</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Session Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Select Sessions to Settle</Label>
            <div className="border border-border rounded-lg p-4 space-y-2 max-h-48 overflow-y-auto">
              {mockSessions.map((session) => (
                <div key={session.id} className="flex items-center gap-3 p-2 hover:bg-secondary rounded-lg transition">
                  <Checkbox
                    checked={selectedSessions.includes(session.id)}
                    onCheckedChange={() => handleSessionSelect(session.id)}
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{session.id}</div>
                    <div className="text-xs text-muted-foreground">{session.operator}</div>
                  </div>
                  <Badge variant="secondary">{session.amount}</Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Settlement Preview */}
          {selectedSessions.length > 0 && (
            <Card className="bg-secondary/50 border-border">
              <CardContent className="pt-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Selected Sessions</span>
                  <span className="font-semibold">{selectedSessions.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Amount</span>
                  <span className="font-semibold">{totalAmount.toFixed(2)} ADA</span>
                </div>
                <div className="flex justify-between text-sm border-t border-border pt-3">
                  <span className="text-muted-foreground">Platform Fee (1%)</span>
                  <span className="font-semibold text-red-500">-{platformFee} ADA</span>
                </div>
                <div className="flex justify-between text-base font-bold border-t border-border pt-3">
                  <span>Settlement Amount</span>
                  <span className="text-green-500">{remainder} ADA</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recipient Address */}
          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient Address</Label>
            <Input id="recipient" placeholder="addr1v..." className="bg-input text-foreground" />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              className="flex-1 bg-primary hover:bg-primary/90"
              disabled={selectedSessions.length === 0}
              onClick={() => {
                onOpenChange(false)
              }}
            >
              Review & Sign
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
