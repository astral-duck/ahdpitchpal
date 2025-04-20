"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function RequireProfile({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setChecking(false);
        return;
      }
      const { data, error } = await supabase
        .from("profiles")
        .select("first_name, last_name")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error || !data) {
        router.replace("/complete-profile");
      }
      setChecking(false);
    }
    checkProfile();
  }, [router]);

  if (checking) {
    return <div className="flex min-h-screen items-center justify-center">Checking profile...</div>;
  }
  return <>{children}</>;
}
