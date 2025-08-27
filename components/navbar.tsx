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
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60 border-b border-white/10">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.07] via-accent/[0.07] to-primary/[0.07]"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0 group">
            <Link href="/" className="flex items-center space-x-3">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/40 to-accent/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                <h1 className="relative text-2xl font-sans font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  LegalEase AI
                </h1>
              </div>
              <Badge 
                variant="secondary" 
                className="text-xs font-medium px-2 py-0.5 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors"
              >
                Beta
              </Badge>
            </Link>
          </div>

          {/* Desktop Navigation - Removed as per requirements */}

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-6">
            {user ? (
              <>
                <div className="flex items-center space-x-3 group">
                  <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                    {user.photoURL && (
                      <img
                        src={user.photoURL}
                        alt={user.displayName || "User"}
                        className="relative w-10 h-10 rounded-full border-2 border-white/20 shadow-md"
                      />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">
                      {user.displayName || user.email}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {user.email}
                    </span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5 text-foreground hover:text-primary transition-all duration-300"
                  onClick={handleSignOut}
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/signin">
                  <Button 
                    className="relative group/btn overflow-hidden bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white font-medium px-4 py-4 h-auto rounded-xl shadow-lg transition-all duration-300 border-0"
                  >
                    <div className="absolute inset-0 bg-white/20 group-hover/btn:translate-y-0 transition-transform duration-500"></div>
                    <span className="relative">Get Started</span>
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
