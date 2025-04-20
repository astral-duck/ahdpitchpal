"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/lib/supabaseClient";

const customTheme = {
  default: {
    colors: {
      brand: "#004b91", // American Home Design blue
      brandAccent: "#0077cc", // Accent blue
      inputBorder: "#004b91",
      inputLabelText: "#004b91",
      buttonText: "#fff",
      messageText: "#d32f2f",
      anchorText: "#004b91",
    },
    radii: {
      borderRadiusButton: "0.5rem",
      borderRadiusInput: "0.5rem",
    },
    fontSizes: {
      baseBodySize: "1.1rem",
      baseInputSize: "1.1rem",
      baseLabelSize: "1rem",
      baseButtonSize: "1.1rem",
    },
  },
};

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        router.push("/"); // Redirect to home/chatbot after login
      }
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-md">
        {/* Header with logo */}
        <div className="flex justify-center mb-6">
          <img src="/images/american-home-design-logo-main.jpg" alt="American Home Design Logo" className="h-12 object-contain" style={{maxWidth: '100%', maxHeight: '48px'}} />
        </div>
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: customTheme.default,
            style: {
              button: { backgroundColor: "#004b91", color: "#fff", fontWeight: 600 },
              anchor: { color: "#004b91", fontWeight: 500 },
            },
          }}
          theme="light"
          providers={[]}
          view="sign_in"
        />
      </div>
    </div>
  );
}
