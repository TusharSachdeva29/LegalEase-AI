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
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-serif text-center">
              Complete Your Profile
            </CardTitle>
            <CardDescription className="text-center">
              We need a bit more information to personalize your experience
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleProfileSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex items-center space-x-4 p-3 bg-muted rounded-lg">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="Profile"
                    className="w-12 h-12 rounded-full"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <UserIcon className="w-6 h-6 text-primary" />
                  </div>
                )}
                <div>
                  <p className="font-medium">
                    {user.displayName || user.email}
                  </p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
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
              <Button type="submit" className="w-full">
                Complete Profile & Continue
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-serif font-bold text-primary">
              LegalEase AI
            </h1>
          </Link>
          <Badge variant="secondary" className="text-xs">
            Beta
          </Badge>
          <p className="text-muted-foreground">
            Sign in to access your legal assistant
          </p>
        </div>

        {/* Google Sign In */}
        <Card>
          <CardContent className="pt-6">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <GoogleIcon className="w-4 h-4 mr-2" />
              Continue with Google
            </Button>
          </CardContent>
        </Card>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or</span>
          </div>
        </div>

        {/* Email/Password Forms */}
        <Card>
          <CardHeader>
            <CardTitle>Email Sign In</CardTitle>
            <CardDescription>
              All fields are optional. Choose your preferred method.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
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
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <p className="text-center text-sm text-muted-foreground">
          By continuing, you agree to our{" "}
          <Link href="/terms" className="underline hover:text-primary">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline hover:text-primary">
            Privacy Policy
          </Link>
        </p>
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email (Optional)</Label>
        <div className="relative">
          <MailIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password (Optional)</Label>
        <div className="relative">
          <LockIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Please wait..." : "Continue"}
      </Button>
    </form>
  );
}
