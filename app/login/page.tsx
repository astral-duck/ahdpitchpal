"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";

export default function LoginPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();

  // Add a loading state to prevent redirects until session/profile is checked
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for session changes
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log("[LoginPage] Session after auth state change:", session);
      if (session) {
        // Check profile completeness
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("first_name, last_name")
          .eq("user_id", session.user.id)
          .single();
        console.log("[LoginPage] Profile query result:", profile, profileError);
        if (!profile || !profile.first_name || !profile.last_name || profile.first_name.trim() === "" || profile.last_name.trim() === "") {
          console.log("[LoginPage] Redirecting to /complete-profile due to incomplete profile");
          router.replace("/complete-profile");
          setLoading(false);
          return;
        }
        // All users with complete profile go to /chat
        console.log("[LoginPage] Redirecting to /chat");
        router.replace("/chat");
        setLoading(false);
      } else {
        setLoading(false);
      }
    });

    // On mount, check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log("[LoginPage] Session on mount:", session);
      if (session) {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("first_name, last_name")
          .eq("user_id", session.user.id)
          .single();
        console.log("[LoginPage] Profile query result (mount):", profile, profileError);
        if (!profile || !profile.first_name || !profile.last_name || profile.first_name.trim() === "" || profile.last_name.trim() === "") {
          console.log("[LoginPage] Redirecting to /complete-profile due to incomplete profile (mount)");
          router.replace("/complete-profile");
          setLoading(false);
          return;
        }
        console.log("[LoginPage] Redirecting to /chat (mount)");
        router.replace("/chat");
        setLoading(false);
      } else {
        setLoading(false);
      }
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, [supabase, router]);

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: 48 }}><span>Loading...</span></div>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-md">
        {/* Header with logo */}
        <div className="flex justify-center mb-6">
          <img src="/images/american-home-design-logo-main.jpg" alt="American Home Design Logo" className="h-20 object-contain" style={{maxWidth: '100%', maxHeight: '80px'}} />
        </div>
        <h2 className="text-2xl font-semibold mb-4 text-center">Sign In</h2>
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#1e3a8a',
                  brandAccent: '#1e40af',
                  inputBorder: '#d1d5db',
                  inputBackground: '#eff6ff',
                  inputText: '#1e293b',
                  messageText: '#dc2626',
                },
                radii: {
                  borderRadiusButton: '0.5rem',
                },
                space: {
                  spaceInput: '0.75rem',
                },
              },
            },
          }}
          theme="default"
          providers={[]}
          redirectTo={undefined}
        />
        {/* Removed 'Forgot your password?' link as requested */}
      </div>
    </div>
  );
}
