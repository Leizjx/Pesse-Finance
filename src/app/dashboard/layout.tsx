import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabaseServer";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { MobileNav } from "@/components/dashboard/MobileNav";
import { AuthBootstrap } from "@/components/dashboard/AuthBootstrap";
import { SyncBanner } from "@/components/dashboard/SyncBanner";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard - Pesse",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // FORCE SERVER-SIDE CHECK: Strictly verify profile exists in DB
  const { data: profileData, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error || !profileData) {
    // If profile check fails, boot them completely
    redirect("/login?error=" + encodeURIComponent("profile_not_found_on_server"));
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] p-4 md:p-6 font-sans text-on-surface relative">
      <SyncBanner />
      {/* Silently syncs Supabase auth state → Zustand (profile, balance) */}
      <AuthBootstrap initialProfile={profileData as any} />

      <div className="max-w-[1600px] mx-auto h-[calc(100vh-3rem)] flex flex-col lg:flex-row gap-6">
        
        {/* Left Column: Sidebar (Desktop only) */}
        <div className="hidden lg:block w-64 shrink-0 h-full">
          <Sidebar />
        </div>

        {/* Main Content Area */}
        <main className="flex-1 h-full pb-24 lg:pb-0 relative" id="main-content">
          {children}
        </main>
      </div>

      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  );
}
