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

// Cute Lobster SVG Component
function WalkingLobster() {
  return (
    <div className="absolute top-0 left-0 w-full h-16 pointer-events-none overflow-hidden z-50">
      <div className="lobster-walk">
        <svg
          width="60"
          height="50"
          viewBox="0 0 60 50"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="lobster-svg"
        >
          {/* Body */}
          <ellipse cx="30" cy="28" rx="12" ry="8" fill="#E63946" />

          {/* Tail segments */}
          <ellipse cx="42" cy="28" rx="6" ry="5" fill="#DC2F3D" />
          <ellipse cx="48" cy="28" rx="4" ry="4" fill="#C52834" />
          <path
            d="M50 26 L55 22 L54 28 L55 34 L50 30"
            fill="#E63946"
            className="tail-fan"
          />

          {/* Head */}
          <ellipse cx="20" cy="26" rx="6" ry="7" fill="#E63946" />

          {/* Eyes */}
          <circle cx="18" cy="23" r="2" fill="#1A1A1A" />
          <circle cx="18" cy="23" r="1" fill="#FFFFFF" />
          <circle cx="22" cy="23" r="2" fill="#1A1A1A" />
          <circle cx="22" cy="23" r="1" fill="#FFFFFF" />

          {/* Antennae */}
          <path
            d="M18 20 Q16 15 14 12"
            stroke="#C52834"
            strokeWidth="1.5"
            fill="none"
            className="antenna-left"
          />
          <path
            d="M22 20 Q24 15 26 12"
            stroke="#C52834"
            strokeWidth="1.5"
            fill="none"
            className="antenna-right"
          />

          {/* Claws */}
          <g className="claw-left">
            <ellipse cx="16" cy="30" rx="3" ry="4" fill="#E63946" />
            <path
              d="M14 32 L10 35 Q8 36 9 37 L11 36 Q10 35 12 34 Z"
              fill="#DC2F3D"
            />
            <path
              d="M14 32 L10 29 Q8 28 9 27 L11 28 Q10 29 12 30 Z"
              fill="#DC2F3D"
            />
          </g>

          <g className="claw-right">
            <ellipse cx="24" cy="30" rx="3" ry="4" fill="#E63946" />
            <path
              d="M26 32 L30 35 Q32 36 31 37 L29 36 Q30 35 28 34 Z"
              fill="#DC2F3D"
            />
            <path
              d="M26 32 L30 29 Q32 28 31 27 L29 28 Q30 29 28 30 Z"
              fill="#DC2F3D"
            />
          </g>

          {/* Walking legs */}
          <g className="legs">
            <line
              x1="25"
              y1="32"
              x2="23"
              y2="38"
              stroke="#C52834"
              strokeWidth="2"
              className="leg1"
            />
            <line
              x1="28"
              y1="32"
              x2="27"
              y2="38"
              stroke="#C52834"
              strokeWidth="2"
              className="leg2"
            />
            <line
              x1="31"
              y1="32"
              x2="31"
              y2="38"
              stroke="#C52834"
              strokeWidth="2"
              className="leg3"
            />
            <line
              x1="34"
              y1="32"
              x2="35"
              y2="38"
              stroke="#C52834"
              strokeWidth="2"
              className="leg4"
            />
          </g>
        </svg>
      </div>

      <style jsx>{`
        .lobster-walk {
          position: absolute;
          top: 8px;
          animation: walk 15s linear infinite;
        }

        @keyframes walk {
          0% {
            left: -80px;
          }
          100% {
            left: calc(100% + 80px);
          }
        }

        .lobster-svg {
          animation: bounce 0.5s ease-in-out infinite;
        }

        @keyframes bounce {
          0%,
          100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-3px) rotate(2deg);
          }
        }

        .antenna-left {
          animation: wiggle-left 0.6s ease-in-out infinite;
          transform-origin: 18px 20px;
        }

        .antenna-right {
          animation: wiggle-right 0.6s ease-in-out infinite;
          transform-origin: 22px 20px;
        }

        @keyframes wiggle-left {
          0%,
          100% {
            transform: rotate(-5deg);
          }
          50% {
            transform: rotate(5deg);
          }
        }

        @keyframes wiggle-right {
          0%,
          100% {
            transform: rotate(5deg);
          }
          50% {
            transform: rotate(-5deg);
          }
        }

        .tail-fan {
          animation: fan 0.4s ease-in-out infinite;
          transform-origin: 50px 28px;
        }

        @keyframes fan {
          0%,
          100% {
            transform: scaleX(1);
          }
          50% {
            transform: scaleX(1.2);
          }
        }

        .leg1 {
          animation: leg-move 0.4s ease-in-out infinite;
        }

        .leg2 {
          animation: leg-move 0.4s ease-in-out infinite 0.1s;
        }

        .leg3 {
          animation: leg-move 0.4s ease-in-out infinite 0.2s;
        }

        .leg4 {
          animation: leg-move 0.4s ease-in-out infinite 0.3s;
        }

        @keyframes leg-move {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-2px);
          }
        }

        .claw-left {
          animation: claw-snap 1s ease-in-out infinite;
          transform-origin: 16px 30px;
        }

        .claw-right {
          animation: claw-snap 1s ease-in-out infinite 0.5s;
          transform-origin: 24px 30px;
        }

        @keyframes claw-snap {
          0%,
          90%,
          100% {
            transform: rotate(0deg);
          }
          95% {
            transform: rotate(-10deg);
          }
        }
      `}</style>
    </div>
  );
}

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
    <nav className="h-16 bg-card border-b border-border flex items-center justify-between px-6 relative">
      {/* Walking Lobster Animation */}
      <WalkingLobster />

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
                toast.success("You have been logged out successfully!");
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
