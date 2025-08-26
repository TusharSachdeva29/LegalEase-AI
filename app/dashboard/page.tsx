"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import firebaseApp from "@/lib/firebase";
import { Navbar } from "@/components/navbar";
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
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-serif font-bold text-foreground">
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Documents Analyzed
                    </p>
                    <p className="text-2xl font-bold">
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

          {/* Main Action Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Upload Document */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Upload className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Upload Document</CardTitle>
                    <CardDescription>
                      {isLawyer
                        ? "Analyze contracts and legal documents for your clients"
                        : "Upload your legal documents for AI-powered analysis"}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Link href="/upload">
                  <Button className="w-full">Start New Analysis</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Legal Chat */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-500/10 rounded-lg">
                    <MessageCircle className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle>Legal Chat Assistant</CardTitle>
                    <CardDescription>
                      {isLawyer
                        ? "Get quick legal research and case law insights"
                        : "Ask questions about legal matters and get expert guidance"}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Link href="/chat">
                  <Button variant="outline" className="w-full">
                    Start Conversation
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Clause Analysis */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-green-500/10 rounded-lg">
                    <FileText className="h-8 w-8 text-green-600" />
                  </div>
                  <div>
                    <CardTitle>Clause Analysis</CardTitle>
                    <CardDescription>
                      {isLawyer
                        ? "Deep dive into contract clauses and identify potential issues"
                        : "Understand complex legal clauses in plain language"}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Link href="/clauses">
                  <Button variant="outline" className="w-full">
                    Analyze Clauses
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Document History */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-purple-500/10 rounded-lg">
                    <History className="h-8 w-8 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle>Document History</CardTitle>
                    <CardDescription>
                      Access all your previously analyzed documents and reports
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  View History ({documentHistory.length})
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <CardTitle>Recent Activity</CardTitle>
                </div>
                {documentHistory.length > 3 && (
                  <Button variant="ghost" size="sm">
                    View All
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {documentHistory.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No documents analyzed yet
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload your first document to get started
                  </p>
                  <Link href="/upload">
                    <Button>Upload Document</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {documentHistory.slice(0, 3).map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className={`p-2 rounded-lg ${
                            doc.status === "analyzed"
                              ? "bg-green-500/10"
                              : doc.status === "pending"
                              ? "bg-yellow-500/10"
                              : "bg-red-500/10"
                          }`}
                        >
                          <FileText
                            className={`h-4 w-4 ${
                              doc.status === "analyzed"
                                ? "text-green-600"
                                : doc.status === "pending"
                                ? "text-yellow-600"
                                : "text-red-600"
                            }`}
                          />
                        </div>
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {doc.type} •{" "}
                            {new Date(doc.uploadDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          doc.status === "analyzed" ? "default" : "secondary"
                        }
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
            <div className="mt-8">
              <h2 className="text-2xl font-semibold mb-6">
                Professional Tools
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-indigo-500/10 rounded-lg">
                        <Users className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div>
                        <CardTitle>Client Portal</CardTitle>
                        <CardDescription>
                          Manage your client documents and cases
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full">
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
  );
}
