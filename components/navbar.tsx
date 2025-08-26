"use client";

import { useState, useEffect } from "react";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import firebaseApp from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Menu, X } from "lucide-react";
import Link from "next/link";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Firebase Auth
  useEffect(() => {
    const auth = getAuth(firebaseApp);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    const auth = getAuth(firebaseApp);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      // Optionally handle error
    }
  };

  const handleSignOut = async () => {
    const auth = getAuth(firebaseApp);
    try {
      await signOut(auth);
    } catch (err) {
      // Optionally handle error
    }
  };

  // Removed navigation items as per requirements - only showing Get Started and LegalEaseAI

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center space-x-2">
              <h1 className="text-2xl font-serif font-bold text-primary">
                LegalEase AI
              </h1>
              <Badge variant="secondary" className="text-xs">
                Beta
              </Badge>
            </Link>
          </div>

          {/* Desktop Navigation - Removed as per requirements */}

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <div className="flex items-center space-x-2">
                  {user.photoURL && (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || "User"}
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                  <span className="text-sm font-medium">
                    {user.displayName || user.email}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  className="text-foreground hover:text-primary"
                  onClick={handleSignOut}
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/signin">
                  <Button className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-foreground"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation - Simplified */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-border">
              <div className="pt-4 pb-3">
                <div className="flex flex-col space-y-3 px-3">
                  {user ? (
                    <>
                      <div className="flex items-center space-x-2">
                        {user.photoURL && (
                          <img
                            src={user.photoURL}
                            alt={user.displayName || "User"}
                            className="w-8 h-8 rounded-full"
                          />
                        )}
                        <span className="text-sm font-medium">
                          {user.displayName || user.email}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        className="justify-start text-foreground hover:text-primary"
                        onClick={handleSignOut}
                      >
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link href="/signin">
                        <Button className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                          Get Started
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
