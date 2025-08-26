"use client";

import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import firebaseApp from "@/lib/firebase";
import { usePathname, useRouter } from "next/navigation";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth(firebaseApp);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);

      // Allow access to public pages
      const publicPaths = ["/", "/signin", "/terms", "/privacy"];

      if (user && user.uid) {
        // Check if user has completed profile
        const profile = localStorage.getItem(`userProfile_${user.uid}`);

        // If signed in but no profile and not on signin page, redirect to signin
        if (!profile && pathname !== "/signin") {
          router.push("/signin");
          return;
        }

        // If has profile and on signin page, redirect to dashboard
        if (profile && pathname === "/signin") {
          router.push("/dashboard");
          return;
        }

        // If on home page and has profile, redirect to dashboard
        if (profile && pathname === "/") {
          router.push("/dashboard");
          return;
        }
      } else {
        // Not signed in - only allow access to public pages
        if (!publicPaths.includes(pathname)) {
          router.push("/signin");
          return;
        }
      }
    });
    return () => unsubscribe();
  }, [pathname, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
