"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import firebaseApp from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  GoogleIcon,
  LegalIcon,
  UserIcon,
  PhoneIcon,
  MailIcon,
  LockIcon,
} from "@/components/icons";
import Link from "next/link";

interface UserProfile {
  email?: string;
  phone?: string;
  userType: "lawyer" | "client";
  displayName?: string;
  photoURL?: string;
}

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    email: "",
    phone: "",
    userType: "client",
  });
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth(firebaseApp);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        // Check if user has completed profile
        const profile = localStorage.getItem(`userProfile_${user.uid}`);
        if (!profile) {
          setShowProfileForm(true);
          setUserProfile((prev) => ({
            ...prev,
            email: user.email || "",
            displayName: user.displayName || "",
            photoURL: user.photoURL || "",
          }));
        } else {
          router.push("/dashboard");
        }
      } else {
        setUser(null);
        setShowProfileForm(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError("");
    const auth = getAuth(firebaseApp);
    const provider = new GoogleAuthProvider();

    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      setError(err.message || "Failed to sign in with Google");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignIn = async (
    email: string,
    password: string,
    isSignUp: boolean
  ) => {
    setIsLoading(true);
    setError("");
    const auth = getAuth(firebaseApp);

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!userProfile.userType) {
      setError("Please select whether you are a lawyer or client");
      return;
    }

    // Save profile to localStorage (in a real app, you'd save to a database)
    const profileData = {
      ...userProfile,
      uid: user.uid,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(
      `userProfile_${user.uid}`,
      JSON.stringify(profileData)
    );

    // Redirect to dashboard
    router.push("/dashboard");
  };

  if (showProfileForm && user) {
    return (
      <div className="min-h-screen bg-background relative flex items-center justify-center p-4 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.07] via-accent/[0.05] to-background"></div>
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl opacity-60 animate-slow-drift"></div>
        <div className="absolute bottom-20 right-10 w-[30rem] h-[30rem] bg-gradient-to-bl from-accent/20 to-primary/20 rounded-full blur-3xl opacity-60 animate-slow-drift-reverse"></div>

        <Card className="w-full max-w-md bg-white/40 dark:bg-white/10 backdrop-blur-xl border border-white/20 relative z-10">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Complete Your Profile
            </CardTitle>
            <CardDescription className="text-center text-base text-muted-foreground/90">
              We need a bit more information to personalize your experience
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleProfileSubmit}>
            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl border border-white/20">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary/40 to-accent/40 rounded-full blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="Profile"
                      className="relative w-14 h-14 rounded-full border-2 border-white/20"
                    />
                  ) : (
                    <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                      <UserIcon className="w-7 h-7 text-primary" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-bold text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    {user.displayName || user.email}
                  </p>
                  <p className="text-sm text-muted-foreground/90">{user.email}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number (Optional)</Label>
                <div className="relative">
                  <PhoneIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={userProfile.phone}
                    onChange={(e) =>
                      setUserProfile((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-medium">I am a *</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="lawyer"
                      checked={userProfile.userType === "lawyer"}
                      onCheckedChange={(checked) => {
                        if (checked)
                          setUserProfile((prev) => ({
                            ...prev,
                            userType: "lawyer",
                          }));
                      }}
                    />
                    <Label
                      htmlFor="lawyer"
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <LegalIcon className="w-4 h-4" />
                      <span>Lawyer</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="client"
                      checked={userProfile.userType === "client"}
                      onCheckedChange={(checked) => {
                        if (checked)
                          setUserProfile((prev) => ({
                            ...prev,
                            userType: "client",
                          }));
                      }}
                    />
                    <Label
                      htmlFor="client"
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <UserIcon className="w-4 h-4" />
                      <span>Client</span>
                    </Label>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full mt-6">
                Complete Profile & Continue
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative flex items-center justify-center p-4 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.07] via-accent/[0.05] to-background"></div>
      <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl opacity-60 animate-slow-drift"></div>
      <div className="absolute bottom-20 right-10 w-[30rem] h-[30rem] bg-gradient-to-bl from-accent/20 to-primary/20 rounded-full blur-3xl opacity-60 animate-slow-drift-reverse"></div>

      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Logo and Header */}
        <div className="text-center space-y-4">
          <Link href="/" className="inline-block group">
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-primary/40 to-accent/40 rounded-lg blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <h1 className="relative text-4xl font-sans font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                LegalEase AI
              </h1>
            </div>
          </Link>
          <div className="flex flex-col items-center gap-2">
            <Badge 
              variant="secondary" 
              className="text-xs font-medium px-2 py-0.5 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors"
            >
              Beta
            </Badge>
            <p className="text-lg text-muted-foreground">
              Sign in to access your legal assistant
            </p>
          </div>
        </div>

        {/* Google Sign In */}
        <Card className="bg-white/40 dark:bg-white/10 backdrop-blur-xl border border-white/20 hover:border-primary/20 transition-all duration-300">
          <CardContent className="pt-6">
            <Button
              variant="outline"
              className="w-full relative group border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 h-12 rounded-xl"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.07] to-accent/[0.07] opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg"></div>
              <div className="relative flex items-center justify-center gap-3">
                <GoogleIcon className="w-5 h-5" />
                <span className="text-base font-medium">Continue with Google</span>
              </div>
            </Button>
          </CardContent>
        </Card>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full bg-primary/20" />
          </div>
          <div className="relative flex justify-center text-xs uppercase font-medium">
            <span className="bg-background px-4 text-primary/60">Or continue with</span>
          </div>
        </div>

        {/* Email/Password Forms */}
        <Card className="bg-white/40 dark:bg-white/10 backdrop-blur-xl border border-white/20 hover:border-primary/20 transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Email Sign In
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground/90">
              All fields are optional. Choose your preferred method.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 p-1 bg-primary/10 rounded-lg">
                <TabsTrigger 
                  value="signin" 
                  className="rounded-md data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all duration-300"
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger 
                  value="signup"
                  className="rounded-md data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all duration-300"
                >
                  Sign Up
                </TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="space-y-4">
                <EmailPasswordForm
                  onSubmit={(email, password) =>
                    handleEmailSignIn(email, password, false)
                  }
                  isLoading={isLoading}
                />
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <EmailPasswordForm
                  onSubmit={(email, password) =>
                    handleEmailSignIn(email, password, true)
                  }
                  isLoading={isLoading}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive" className="bg-destructive/10 text-destructive border-2 border-destructive/20">
            <AlertDescription className="font-medium">{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            By continuing, you agree to our{" "}
            <Link href="/terms" className="text-primary hover:text-accent transition-colors font-medium">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-primary hover:text-accent transition-colors font-medium">
              Privacy Policy
            </Link>
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground/80">
            <Badge className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
              Secure
            </Badge>
            <Badge className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
              End-to-End Encrypted
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}

interface EmailPasswordFormProps {
  onSubmit: (email: string, password: string) => void;
  isLoading: boolean;
}

function EmailPasswordForm({ onSubmit, isLoading }: EmailPasswordFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(email, password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium text-foreground/90">Email (Optional)</Label>
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
          <div className="relative">
            <MailIcon className="absolute left-3 top-3 h-5 w-5 text-muted-foreground/80" />
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 h-12 bg-white/40 dark:bg-white/5 border-white/20 focus:border-primary/30 focus:ring-primary/20 rounded-xl transition-all duration-300"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium text-foreground/90">Password (Optional)</Label>
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
          <div className="relative">
            <LockIcon className="absolute left-3 top-3 h-5 w-5 text-muted-foreground/80" />
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 h-12 bg-white/40 dark:bg-white/5 border-white/20 focus:border-primary/30 focus:ring-primary/20 rounded-xl transition-all duration-300"
            />
          </div>
        </div>
      </div>

      <Button 
        type="submit" 
        disabled={isLoading}
        className="w-full relative group bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white font-medium h-12 rounded-xl shadow-lg transition-all duration-300 border-0"
      >
        <div className="absolute inset-0 bg-white/20 translate-y-12 group-hover:translate-y-0 transition-transform duration-500 rounded-xl"></div>
        <span className="relative text-base">
          {isLoading ? "Please wait..." : "Continue"}
        </span>
      </Button>
    </form>
  );
}
