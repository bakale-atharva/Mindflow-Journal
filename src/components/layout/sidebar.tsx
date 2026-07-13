"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Plus, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/", icon: Home, label: "Journal" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 h-full bg-sidebar border-r border-border p-6 flex-shrink-0">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white font-heading font-bold text-lg">
          M
        </div>
        <span className="font-heading font-bold text-xl text-foreground">MindFlow</span>
      </div>

      <Link 
        href="?new=true"
        className="flex items-center justify-center w-full bg-brand-500 hover:bg-brand-600 text-white shadow-glow mb-8 h-12 rounded-xl text-base font-semibold transition-all duration-200 hover:-translate-y-0.5"
      >
        <Plus className="w-5 h-5 mr-2" />
        New Entry
      </Link>

      <nav className="flex-1 flex flex-col gap-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium",
                isActive
                  ? "bg-brand-50 text-brand-600"
                  : "text-secondary-text hover:bg-tertiary hover:text-foreground"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive ? "text-brand-500" : "text-muted-text")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 border-t border-border flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-medium">
          A
        </div>
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">Founding beta</p>
          <div className="flex items-center gap-1 text-xs font-medium text-brand-600">
            <ShieldCheck className="h-3 w-3" />
            Private workspace
          </div>
        </div>
      </div>
    </aside>
  );
}
