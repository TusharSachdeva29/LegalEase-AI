"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

type UploadState = "idle" | "uploading" | "success" | "error";

export default function UploadPage() {
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>("");

  const onDrop = useCallback(
    async (acceptedFiles: File[], rejectedFiles: any[]) => {
      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        if (rejection.errors[0]?.code === "file-too-large") {
          setError("File size must be less than 10MB");
        } else if (rejection.errors[0]?.code === "file-invalid-type") {
          setError("Please upload a PDF, DOCX, or image file");
        } else {
          setError("Invalid file. Please try again.");
        }
        setUploadState("error");
        return;
      }

      const file = acceptedFiles[0];
      if (file) {
        setUploadedFile(file);
        setUploadState("uploading");
        setError("");

        try {
          // Read file content
          const reader = new FileReader();
          reader.onload = async (e) => {
            const text = e.target?.result as string;

            // Store document text in sessionStorage for dashboard
            sessionStorage.setItem("documentText", text);
            sessionStorage.setItem("documentName", file.name);

            // Simulate upload progress
            let progress = 0;
            const interval = setInterval(() => {
              progress += Math.random() * 15;
              if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                setTimeout(() => {
                  setUploadState("success");
                }, 500);
              }
              setUploadProgress(progress);
            }, 200);
          };

          reader.readAsText(file);
        } catch (error) {
          console.error("Error reading file:", error);
          setError("Failed to read file");
          setUploadState("error");
        }
      }
    },
    []
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "image/*": [".png", ".jpg", ".jpeg"],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
  });

  const handleAnalyze = () => {
    // Navigate to analysis page
    window.location.href = "/analysis";
  };

  const handleReset = () => {
    setUploadState("idle");
    setUploadProgress(0);
    setUploadedFile(null);
    setError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      <Navbar />
      <div className="pt-4 pl-4">
        <Link
        href="/dashboard"
        className="inline-flex items-center text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-105 bg-white/5 px-4 py-2 rounded-full backdrop-blur-sm border border-primary/10"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </Link>
      </div>

      <main className="px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 space-y-6">
            <h1 className="text-4xl sm:text-5xl font-serif font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80 mb-4">
              Upload Your Legal Document
            </h1>
            <p className="text-lg text-muted-foreground/90 max-w-2xl mx-auto leading-relaxed">
              Upload your contract, agreement, or terms of service to get
              instant AI-powered analysis and plain-English explanations.
            </p>
          </div>

          {/* Upload Section */}
          <div className="mb-12">
            {uploadState === "idle" && (
              <Card className="p-8 hover:shadow-xl transition-all duration-500 hover:shadow-primary/5 border border-primary/10 backdrop-blur-sm">
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-xl p-16 text-center cursor-pointer transition-all duration-300 group ${
                    isDragActive
                      ? "border-primary bg-primary/5 scale-[0.99]"
                      : "border-primary/20 hover:border-primary hover:bg-primary/5"
                  }`}
                >
                  <input {...getInputProps()} />
                  <div className={`transition-transform duration-500 ${isDragActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                    <div className="p-4 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full w-fit mx-auto mb-6">
                      <Upload className="h-16 w-16 text-primary mx-auto" />
                    </div>
                    <h3 className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80 mb-4">
                      {isDragActive
                        ? "Drop your file here"
                        : "Drop your file here or click to browse"}
                    </h3>
                    <p className="text-muted-foreground/90 mb-6 text-lg">
                      Supports PDF, DOCX, and image files up to 10MB
                    </p>
                    <Button variant="outline" className="mt-2 bg-white/5 border-primary/20 hover:bg-primary/10 hover:text-primary transition-all duration-300">
                      Choose File
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {uploadState === "uploading" && (
              <Card className="p-12 border border-primary/10 backdrop-blur-sm hover:shadow-xl transition-all duration-500 hover:shadow-primary/5">
                <div className="text-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 rounded-full blur-xl opacity-20 animate-pulse"></div>
                    <div className="relative p-4 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full w-fit mx-auto mb-6">
                      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
                    </div>
                  </div>
                  <h3 className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80 mb-4">
                    Analyzing your document securely...
                  </h3>
                  <p className="text-lg text-muted-foreground/90 mb-8">
                    Processing: {uploadedFile?.name}
                  </p>
                  <div className="max-w-md mx-auto">
                    <Progress value={uploadProgress} className="mb-3 h-2 bg-primary/10" />
                    <p className="text-sm text-primary/80 font-medium">
                      {Math.round(uploadProgress)}% complete
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {uploadState === "success" && (
              <Card className="p-12 border border-primary/10 backdrop-blur-sm hover:shadow-xl transition-all duration-500 hover:shadow-primary/5">
                <div className="text-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-primary rounded-full blur-xl opacity-20"></div>
                    <div className="relative p-4 bg-gradient-to-br from-green-500/20 to-green-500/5 rounded-full w-fit mx-auto mb-6">
                      <CheckCircle className="h-16 w-16 text-green-500" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-primary mb-4">
                    Document uploaded successfully!
                  </h3>
                  <p className="text-lg text-muted-foreground/90 mb-8">
                    {uploadedFile?.name} has been analyzed and is ready for
                    review.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      onClick={handleAnalyze}
                      className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary transition-all duration-300 shadow-lg shadow-primary/20 hover:shadow-primary/30 text-white"
                    >
                      View Analysis
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleReset}
                      className="border-primary/20 hover:bg-primary/10 hover:text-primary transition-all duration-300"
                    >
                      Upload Another Document
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {uploadState === "error" && (
              <Card className="p-8">
                <div className="text-center">
                  <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Upload failed
                  </h3>
                  <p className="text-muted-foreground mb-6">{error}</p>
                  <Button onClick={handleReset} variant="outline">
                    Try Again
                  </Button>
                </div>
              </Card>
            )}
          </div>

          {/* File Requirements */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Supported File Types
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3">
                <FileText className="h-8 w-8 text-secondary" />
                <div>
                  <p className="font-medium text-foreground">PDF Documents</p>
                  <p className="text-sm text-muted-foreground">
                    Contracts, agreements
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <FileText className="h-8 w-8 text-secondary" />
                <div>
                  <p className="font-medium text-foreground">Word Documents</p>
                  <p className="text-sm text-muted-foreground">DOCX format</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <FileText className="h-8 w-8 text-secondary" />
                <div>
                  <p className="font-medium text-foreground">Images</p>
                  <p className="text-sm text-muted-foreground">
                    PNG, JPG, JPEG
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Privacy Notice:</strong> Your documents are processed
                securely and are never stored on our servers. All analysis
                happens in real-time and your data is immediately discarded
                after processing.
              </p>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
