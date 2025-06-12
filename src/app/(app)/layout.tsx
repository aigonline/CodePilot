"use client"; 

import * as React from "react";
import Link from "next/link";
import { Cpu, Settings, Home, CreditCard, User } from "lucide-react"; // Added icons
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarRail,
} from "@/components/ui/sidebar";
import { AppHeader } from "@/components/header"; // Assuming you create this
import { usePathname } from "next/navigation"; // To manage active states

// Placeholder for actual sidebar navigation items
const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/pricing", label: "Pricing", icon: CreditCard },
];

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <Sidebar collapsible="icon" variant="sidebar" side="left">
          <SidebarRail />
          <SidebarHeader className="border-b border-sidebar-border p-3">
            <Link href="/dashboard" className="group flex items-center gap-2 text-lg font-semibold text-primary">
              <Cpu className="h-7 w-7 shrink-0 transition-all group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8 group-hover:scale-110" />
              <span className="group-data-[collapsible=icon]:hidden">CodePilot</span>
            </Link>
          </SidebarHeader>
          <SidebarContent className="p-2">
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))}
                    tooltip={{children: item.label, className: "group-data-[collapsible=icon]:block hidden"}}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-2 border-t border-sidebar-border mt-auto">
            {/* Placeholder for user info or actions in sidebar footer */}
             <SidebarMenuButton tooltip={{children: "Help", className: "group-data-[collapsible=icon]:block hidden"}}>
                <Settings />
                <span>Help & Support</span>
              </SidebarMenuButton>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="flex flex-col sm:gap-4 sm:py-4 sm:pl-0 md:pl-[var(--sidebar-width-icon)] group-data-[state=expanded]:md:pl-[var(--sidebar-width)] transition-[padding] duration-200 ease-linear">
          <AppHeader />
          <main className="flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
