"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  MapPin,
  MapPinned, 
  User, 
  Users,
  Cloud,
  CloudSunRain, 
  Bug, 
  Brain, 
  BarChart,
  Leaf
} from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
 
  {
    title: "Profil Petani",
    href: "/dashboard/farmer",
    icon: Users,
  },
   {
    title: "Informasi Kebun",
    href: "/dashboard/map",
    icon: MapPinned,
  },
  {
    title: "Data Klimatologi",
    href: "/dashboard/climate",
    icon: CloudSunRain,
  },
  {
    title: "Monitoring HPG",
    href: "/dashboard/pests",
    icon: Bug,
  },
  {
    title: "Rekomendasi AI",
    href: "/dashboard/ai",
    icon: Brain,
  },
  {
    title: "Analitik",
    href: "/dashboard/analytics",
    icon: BarChart,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <TooltipProvider>
      <div className="flex h-full flex-col border-r">
        <div className="flex h-16 items-center px-4">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <Leaf className="h-6 w-6 text-green-600" />
            <span className="">AgroDemoplot</span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-2 text-sm font-medium">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.title}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="p-4 border-t">
          <img 
            src="/logoRP.svg" 
            alt="RUMAHPETAni Logo" 
            className="h-6 w-auto"
          />
        </div>
      </div>
    </TooltipProvider>
  );
}

export function MobileSidebar() {
  const pathname = usePathname();

  return (
    <TooltipProvider>
      <div className="flex h-full flex-col border-r">
        <div className="flex h-16 items-center px-4">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <Leaf className="h-6 w-6 text-green-600" />
            <span className="">AgroDemoplot</span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-2 text-sm font-medium">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.title}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="p-4 border-t">
          <img 
            src="/logoRP.svg" 
            alt="RUMAHPETAni Logo" 
            className="h-6 w-auto"
          />
        </div>
      </div>
    </TooltipProvider>
  );
}