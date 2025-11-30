"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Copy, Check, ExternalLink } from "lucide-react"
import { useState } from "react"

interface SettlementPreviewModalProps {
  settlement: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettlementPreviewModal({ settlement, open, onOpenChange }: SettlementPreviewModalProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Settlement Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Header with ID and Status */}
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div>
              <h3 className="font-semibold text-lg">{settlement.id}</h3>
              <p className="text-xs text-muted-foreground">{settlement.timestamp}</p>
            </div>
            <Badge className={settlement.status === "Confirmed" ? "bg-green-600" : "bg-yellow-600"}>
              {settlement.status}
            </Badge>
          </div>

          {/* Amount Details */}
          <Card className="bg-secondary/50 border-border">
            <CardContent className="pt-6 space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Amount</span>
                <span className="font-semibold">{settlement.amount} ADA</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Platform Fee (1%)</span>
                <span className="text-red-500 font-semibold">{settlement.fee} ADA</span>
              </div>
              <div className="flex justify-between border-t border-border pt-3 text-base font-bold">
                <span>Final Amount</span>
                <span className="text-green-500">
                  {(Number.parseFloat(settlement.amount.replace(/,/g, "")) - Number.parseFloat(settlement.fee)).toFixed(
                    2,
                  )}{" "}
                  ADA
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Recipient & Platform Addresses */}
          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Recipient Address</p>
              <div className="bg-secondary p-3 rounded-lg flex items-center justify-between">
                <code className="text-xs font-mono break-all">
                  addr1vxn37k5ujyhtcgz0yc0nux7p54xycj5hxgzzp2uqrdyn5gg4zyx7h
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard("addr1vxn37k5ujyhtcgz0yc0nux7p54xycj5hxgzzp2uqrdyn5gg4zyx7h")}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Platform Address</p>
              <div className="bg-secondary p-3 rounded-lg">
                <code className="text-xs font-mono break-all">
                  addr1vq8lxfq7hf73kyu9zwey82m9qz5x8z2vqkqwc8v7n8xvwgg5h5kr
                </code>
              </div>
            </div>
          </div>

          {/* Attached Metadata */}
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Attached Metadata</p>
            <div className="bg-secondary p-3 rounded-lg space-y-2 max-h-32 overflow-y-auto font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Settlement ID:</span>
                <span>{settlement.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sessions:</span>
                <span>{settlement.sessions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fee Percentage:</span>
                <span>1.0%</span>
              </div>
            </div>
          </div>

          {/* Transaction Hash */}
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Transaction Hash</p>
            <div className="bg-secondary p-3 rounded-lg flex items-center justify-between">
              <code className="text-xs font-mono break-all">{settlement.txHash}</code>
              <Button variant="ghost" size="sm" asChild>
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4" />
                </a>
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button className="flex-1 bg-primary hover:bg-primary/90">Show Raw Tx Hex</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
