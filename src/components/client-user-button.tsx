"use client";

import { UserButton } from "@clerk/nextjs";
import { useAuth } from "@clerk/nextjs";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";

export function ClientUserButton() {
  const { isLoaded } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Show skeleton while not loaded or not mounted to prevent hydration mismatch
  if (!isLoaded || !isMounted) {
    return (
      <Skeleton className="h-8 w-8 rounded-full" />
    );
  }

  return (
    <UserButton 
      appearance={{
        elements: {
          avatarBox: "h-8 w-8"
        }
      }}
    />
  );
}