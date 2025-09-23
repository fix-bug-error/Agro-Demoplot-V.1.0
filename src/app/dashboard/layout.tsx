import { Sidebar, MobileSidebar } from "@/components/layout/sidebar";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { SimpleThemeToggle } from "@/components/theme-toggle";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SheetTrigger } from "@/components/ui/sheet";
import { ClientUserButton } from "@/components/client-user-button";
import { MobilePlotSelector } from "@/components/mobile-plot-selector";
import { BackToTopButton } from "@/components/back-to-top-button";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <div className="hidden md:flex w-64 flex-col border-r fixed inset-y-0 z-40">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col md:ml-64">
        {/* Header */}
        <header className="border-b sticky top-0 z-30 bg-background">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <div className="md:hidden flex items-center gap-2">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Menu className="h-5 w-5" />
                      <span className="sr-only">Toggle navigation menu</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="p-0 w-64">
                    <MobileSidebar />
                  </SheetContent>
                </Sheet>
                {/* Mobile Plot Selector */}
                <div id="mobile-plot-selector-container" className="flex items-center min-h-[40px] min-w-[120px]" />
              </div>
              
              {/* Desktop Plot Selector Placeholder */}
              <div id="plot-selector-container" className="hidden md:flex min-h-[40px] min-w-[120px]" />
            </div>
            
            <div className="flex items-center gap-4">
              {/* Theme Toggle */}
              <SimpleThemeToggle />
              
              {/* User Profile (integrated with Clerk) */}
              <ClientUserButton />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </main>
        
        {/* Back to Top Button */}
        <BackToTopButton />
      </div>
    </div>
  );
}