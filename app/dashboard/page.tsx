"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import firebaseApp from "@/lib/firebase";
import { Navbar } from "@/components/navbar";
import { LeftSidebar } from "@/components/leftsidebar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Upload,
  MessageCircle,
  FileText,
  History,
  BarChart3,
  BookOpen,
  Users,
  Calendar,
  CheckCircle,
  TrendingUp,
  Clock,
} from "lucide-react";
import Link from "next/link";

interface UserProfile {
  email?: string;
  phone?: string;
  userType: "lawyer" | "client";
  displayName?: string;
  photoURL?: string;
  uid: string;
  createdAt: string;
}

interface DocumentHistory {
  id: string;
  name: string;
  type: string;
  uploadDate: string;
  status: "analyzed" | "pending" | "failed";
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [documentHistory, setDocumentHistory] = useState<DocumentHistory[]>([]);
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth(firebaseApp);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        // Load user profile
        const profile = localStorage.getItem(`userProfile_${user.uid}`);
        if (profile) {
          const parsedProfile = JSON.parse(profile);
          setUserProfile(parsedProfile);
          loadDocumentHistory(user.uid);
        } else {
          // Redirect to signin to complete profile
          router.push("/signin");
        }
      } else {
        router.push("/signin");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const loadDocumentHistory = (uid: string) => {
    // In a real app, this would be loaded from a database
    const history = localStorage.getItem(`documentHistory_${uid}`);
    if (history) {
      setDocumentHistory(JSON.parse(history));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || !userProfile) {
    return null;
  }

  const isLawyer = userProfile.userType === "lawyer";

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95 flex">
      {/* Left Sidebar */}
      <div className="z-50">
        <LeftSidebar userId={user.uid} />
      </div>
      <div className="flex-1 flex flex-col min-h-screen">
        <Navbar />
        <main className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Welcome Header */}
            <div className="mb-10">
              <div className="flex items-center justify-between bg-white/5 p-6 rounded-xl backdrop-blur-sm border border-primary/10">
                <div>
                  <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
                    Welcome back, {user.displayName || "User"}
                  </h1>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge variant={isLawyer ? "default" : "secondary"}>
                      {isLawyer ? "Lawyer" : "Client"}
                    </Badge>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">
                      Member since{" "}
                      {new Date(userProfile.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                {user.photoURL && (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || "User"}
                    className="w-16 h-16 rounded-full border-2 border-primary/20"
                  />
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <Card className="group transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-primary/10 rounded-lg transition-transform duration-300 group-hover:scale-110">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground font-medium">
                        Documents Analyzed
                      </p>
                      <p className="text-2xl font-bold text-primary">
                        {documentHistory.length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-green-500/10 rounded-lg">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Completed Reviews
                      </p>
                      <p className="text-2xl font-bold">
                        {
                          documentHistory.filter((d) => d.status === "analyzed")
                            .length
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-500/10 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {isLawyer ? "Cases Handled" : "Legal Insights"}
                      </p>
                      <p className="text-2xl font-bold">
                        {documentHistory.length * (isLawyer ? 3 : 2)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="hover:shadow-lg transition-all duration-300 border border-primary/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">Recent Activity</CardTitle>
                  </div>
                  {documentHistory.length > 3 && (
                    <Button variant="ghost" size="sm" className="hover:text-primary transition-colors">
                      View All
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {documentHistory.length === 0 ? (
                  <div className="text-center py-12 px-6">
                    <div className="p-4 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full w-fit mx-auto mb-6">
                      <FileText className="h-12 w-12 text-primary mx-auto" />
                    </div>
                    <p className="text-lg font-medium text-primary/80 mb-2">
                      No documents analyzed yet
                    </p>
                    <p className="text-sm text-muted-foreground mb-6">
                      Upload your first document to get started
                    </p>
                    <Link href="/upload">
                      <Button className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary transition-all duration-300 shadow-lg shadow-primary/20 hover:shadow-primary/30">
                        Upload Document
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {documentHistory.slice(0, 3).map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-white/5 to-transparent hover:from-white/10 border border-primary/10 rounded-lg transition-all duration-300 group cursor-pointer"
                      >
                        <div className="flex items-center space-x-4">
                          <div
                            className={`p-2 rounded-lg transition-transform duration-300 group-hover:scale-110 ${
                              doc.status === "analyzed"
                                ? "bg-gradient-to-br from-green-500/20 to-green-500/10"
                                : doc.status === "pending"
                                ? "bg-gradient-to-br from-yellow-500/20 to-yellow-500/10"
                                : "bg-gradient-to-br from-red-500/20 to-red-500/10"
                            }`}
                          >
                            <FileText
                              className={`h-4 w-4 ${
                                doc.status === "analyzed"
                                  ? "text-green-500"
                                  : doc.status === "pending"
                                  ? "text-yellow-500"
                                  : "text-red-500"
                              }`}
                            />
                          </div>
                          <div>
                            <p className="font-medium text-foreground/90 group-hover:text-primary transition-colors">{doc.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {doc.type} •{" "}
                              {new Date(doc.uploadDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={doc.status === "analyzed" ? "default" : "secondary"}
                          className="transition-transform duration-300 group-hover:scale-105"
                        >
                          {doc.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Lawyer-specific section */}
            {isLawyer && (
              <div className="mt-10">
                <h2 className="text-2xl font-semibold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
                  Professional Tools
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="group hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:border-primary/20 backdrop-blur-sm">
                    <CardHeader>
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-gradient-to-br from-indigo-500/20 to-indigo-500/10 rounded-lg transition-transform duration-300 group-hover:scale-110">
                          <Users className="h-6 w-6 text-indigo-500" />
                        </div>
                        <div>
                          <CardTitle className="text-xl font-semibold text-indigo-500/90">Client Portal</CardTitle>
                          <CardDescription>
                            Manage your client documents and cases
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" className="w-full hover:bg-indigo-500/10 hover:text-indigo-500 transition-all duration-300">
                        Access Client Portal
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-orange-500/10 rounded-lg">
                          <BookOpen className="h-6 w-6 text-orange-600" />
                        </div>
                        <div>
                          <CardTitle>Legal Research</CardTitle>
                          <CardDescription>
                            Advanced case law and precedent research
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" className="w-full">
                        Start Research
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
