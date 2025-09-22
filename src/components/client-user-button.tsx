"use client";

import { UserButton } from "@clerk/nextjs";

export function ClientUserButton() {
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