"use client";

import { LayoutDashboard, FileText, LogOut, UserPlus, Package, Move, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { createClient } from "@/lib/supabase-browser";

const menuItems = [
  {
    icon: LayoutDashboard,
    label: "Manager Dashboard",
    href: "/manager/dashboard",
  },
  { 
    icon: UserPlus, 
    label: "Add Workers", 
    href: "/manager/addWorker" 
  },
  { 
    icon: FileText, 
    label: "GST Invoicing", 
    href: "/manager/gst" 
  },
  {
    icon: Package,
    label: "Inventory",
    href: "/inventory",
  },
  {
    icon: Move,
    label: "Movements",
    href: "/movements",
  },
];

const generalItems = [{ icon: LogOut, label: "Logout", href: "#logout" }];

export function Sidebar() {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    try {
      await supabase.auth.signOut();
      router.push("/"); // Redirect to home after logout
    } catch (error) {
      console.log(error);
    }
  };

  // Close sidebar when route changes (mobile)
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-card border border-border rounded-lg shadow-lg hover:bg-secondary transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-foreground" />
        ) : (
          <Menu className="w-6 h-6 text-foreground" />
        )}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 w-64 bg-card border-r border-border p-4 h-screen overflow-y-auto z-40 transition-transform duration-300 ease-in-out",
        "lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="flex items-center gap-2 group cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center transition-transform group-hover:scale-110 duration-300 relative">
              <div
                className="w-1.5 h-1.5 rounded-full bg-primary-foreground absolute"
                style={{ top: "30%", left: "30%" }}
              />
              <div
                className="w-1.5 h-1.5 rounded-full bg-primary-foreground absolute"
                style={{ top: "30%", right: "30%" }}
              />
              <div className="w-3 h-1.5 border-b-2 border-primary-foreground rounded-full absolute bottom-2.5" />
            </div>
            <span className="text-lg font-semibold text-foreground">BuildTrack</span>
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-1 hover:bg-secondary rounded"
            aria-label="Close menu"
          >
            <X className="w-5 h-5 text-foreground" />
          </button>
        </div>

        {/* Role Badge */}
        <div className="mb-4 px-2">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">
            Role: <strong className="capitalize">Manager</strong>
          </span>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-[10px] font-medium text-muted-foreground mb-2 uppercase tracking-wider px-2">
              Menu
            </p>
            <nav className="space-y-0.5">
              {menuItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onMouseEnter={() => setHoveredItem(item.label)}
                    onMouseLeave={() => setHoveredItem(null)}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-all duration-300",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                      hoveredItem === item.label && !isActive && "translate-x-1",
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="text-sm">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div>
            <p className="text-[10px] font-medium text-muted-foreground mb-2 uppercase tracking-wider px-2">
              General
            </p>
            <nav className="space-y-0.5">
              {generalItems.map((item) => {
                return (
                  <Button
                    key={item.label}
                    onClick={handleLogout}
                    onMouseEnter={() => setHoveredItem(item.label)}
                    onMouseLeave={() => setHoveredItem(null)}
                    variant="ghost"
                    className={cn(
                      "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-all duration-300",
                      "text-muted-foreground hover:bg-secondary hover:text-foreground",
                      hoveredItem === item.label && "translate-x-1",
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="text-sm">{item.label}</span>
                  </Button>
                );
              })}
            </nav>
          </div>
        </div>
      </aside>
    </>
  );
}