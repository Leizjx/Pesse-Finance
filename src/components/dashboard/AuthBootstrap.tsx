"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useAppStore } from "@/store/useAppStore";
import { useSyncPoller } from "@/hooks/useSyncPoller";
import type { Profile } from "@/types/database.types";

export function AuthBootstrap({ initialProfile }: { initialProfile: Profile }) {
  useEffect(() => {
    // Hydrate the store on client mount
    // Doing this in useEffect avoids "Cannot update a component while rendering" warning
    useAppStore.setState({
      user: initialProfile,
      isAuthenticated: true,
      totalBalance: initialProfile.total_balance ?? 0,
      isLoadingUser: false,
      isInitialized: true, // Mark as initialized to prevent useAuth from starting parallel fetch
    });
  }, [initialProfile]);

  // Still call useAuth so it sets up the onAuthStateChange listener
  useAuth();

  // Start polling /api/sync-status every 10s → feeds SyncBanner
  useSyncPoller();

  return null;
}

