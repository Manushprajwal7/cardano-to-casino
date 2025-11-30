"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Layers,
  DollarSign,
  Search,
  Lock,
  Users,
  Code,
  Settings,
  ChevronDown,
  LogOut,
  FlaskConical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const mainNavigation = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Sessions", href: "/sessions", icon: Layers },
  { name: "Settlements", href: "/settlements", icon: DollarSign },
  { name: "Audit & Proofs", href: "/audit", icon: Search },
  { name: "IPFS Test", href: "/test-ipfs", icon: FlaskConical },
];

const secondaryNavigation = [
  { name: "Identity", href: "/identity", icon: Lock },
  { name: "Admin Panel", href: "/admin", icon: Users },
  { name: "Developer API", href: "/developer", icon: Code },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [expandedSections, setExpandedSections] = useState<string[]>(["main"]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col h-screen overflow-y-auto">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-sidebar-border">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <span className="text-sidebar-primary-foreground font-bold">₳</span>
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sidebar-foreground text-l">
              Cardano To Casino
            </span>
          </div>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <div className="space-y-1">
          {mainNavigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive(item.href)
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
          <div>
            {secondaryNavigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive(item.href)
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Secondary Navigation */}
      <div className="px-3 py-4 border-t border-sidebar-border"></div>
    </aside>
  );
}
