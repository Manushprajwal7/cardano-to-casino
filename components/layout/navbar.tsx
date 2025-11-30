"use client";

import {
  Bell,
  ChevronDown,
  Wallet,
  User,
  Settings,
  LogOut,
  HelpCircle,
  BookOpen,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useWallet } from "@meshsdk/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

export function Navbar() {
  const { wallet, connected, connecting } = useWallet();
  const router = useRouter();
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [supportMessage, setSupportMessage] = useState("");

  const getAddressPreview = (address: string) => {
    if (!address) return "Connect Wallet";
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`;
  };

  return (
    <nav className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold">Dashboard</h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Network Badge */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <Badge variant="secondary" className="text-xs">
            Cardano Preprod
          </Badge>
        </div>

        {/* Wallet Connect */}
        <Button
          variant="outline"
          size="sm"
          className="gap-2 bg-transparent"
          onClick={() => {
            if (!connected) {
              // In a real implementation, this would open the wallet connector modal
              console.log("Open wallet connector");
            }
          }}
        >
          <Wallet className="w-4 h-4" />
          <span className="hidden sm:inline">
            {connecting
              ? "Connecting..."
              : connected
              ? getAddressPreview("addr1qy...2xs8")
              : "Connect Wallet"}
          </span>
          <span className="sm:hidden">
            {connecting ? "..." : connected ? "Wallet" : "Connect"}
          </span>
        </Button>

        {/* Notifications */}
        <button className="relative p-2 text-foreground hover:bg-secondary rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* User Connection Indicator */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <Badge variant="secondary" className="text-xs hidden md:inline">
            Connected
          </Badge>
        </div>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary transition-colors">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-sm font-semibold text-primary">OP</span>
              </div>
              <ChevronDown className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Operator Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                router.push("/profile");
                toast.info("Navigating to profile...");
              }}
            >
              <User className="w-4 h-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                router.push("/settings");
                toast.info("Opening settings...");
              }}
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                router.push("/identity");
                toast.info("Switching role...");
              }}
            >
              <Users className="w-4 h-4 mr-2" />
              Switch Role
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                window.open("https://docs.cardanocasino.integrity", "_blank");
                toast.info("Opening documentation...");
              }}
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Documentation
            </DropdownMenuItem>
            <Dialog open={isSupportOpen} onOpenChange={setIsSupportOpen}>
              <DialogTrigger asChild>
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    setIsSupportOpen(true);
                  }}
                >
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Support
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Support Chat</DialogTitle>
                  <DialogDescription>
                    Get help from our support team. We typically respond within
                    2 hours.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg max-h-60 overflow-y-auto">
                    <div className="space-y-3">
                      <div className="flex justify-start">
                        <div className="bg-primary text-primary-foreground p-3 rounded-lg rounded-bl-none max-w-xs">
                          <p className="text-sm">
                            Hello! How can I help you today?
                          </p>
                          <p className="text-xs opacity-70 mt-1">
                            Support Team • Just now
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <div className="bg-secondary p-3 rounded-lg rounded-br-none max-w-xs">
                          <p className="text-sm">
                            I need help with settlement verification.
                          </p>
                          <p className="text-xs opacity-70 mt-1">
                            You • 1 min ago
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Type your message here..."
                      value={supportMessage}
                      onChange={(e) => setSupportMessage(e.target.value)}
                      className="min-h-[80px]"
                    />
                    <div className="flex justify-between">
                      <Button variant="outline" size="sm">
                        Attach File
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          if (supportMessage.trim()) {
                            toast.success(
                              "Message sent! Our support team will respond shortly."
                            );
                            setSupportMessage("");
                            setIsSupportOpen(false);
                          }
                        }}
                      >
                        Send Message
                      </Button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                // In a real implementation, this would handle actual logout logic
                // such as clearing auth tokens, resetting state, etc.
                // For now, we'll show a toast and redirect to login
                toast.success("You have been logged out successfully!");
                // Clear any stored authentication data
                localStorage.removeItem("authToken");
                sessionStorage.clear();
                // Redirect to login page
                router.push("/login");
              }}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
