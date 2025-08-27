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
  Eye,
} from "lucide-react";
import Link from "next/link";
import { processDocument, ProcessedDocument } from "@/lib/document-processor";

type UploadState = "idle" | "uploading" | "processing" | "success" | "error";

export default function UploadPage() {
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [processedDocument, setProcessedDocument] = useState<ProcessedDocument | null>(null);
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
        setUploadProgress(0);

        try {
          // Simulate upload progress
          let progress = 0;
          const uploadInterval = setInterval(() => {
            progress += Math.random() * 20;
            if (progress >= 100) {
              progress = 100;
              clearInterval(uploadInterval);
              setUploadProgress(100);
              // Start processing
              setTimeout(async () => {
                setUploadState("processing");
                setUploadProgress(0);
                
                try {
                  // Process the document with OCR/text extraction
                  const processed = await processDocument(file);
                  setProcessedDocument(processed);
                  
                  // Store processed document data for dashboard
                  sessionStorage.setItem("documentText", processed.text);
                  sessionStorage.setItem("documentName", processed.fileName);
                  sessionStorage.setItem("processingMethod", processed.processingMethod);
                  if (processed.confidence) {
                    sessionStorage.setItem("ocrConfidence", processed.confidence.toString());
                  }
                  
                  // Simulate processing progress
                  let processProgress = 0;
                  const processInterval = setInterval(() => {
                    processProgress += Math.random() * 10;
                    if (processProgress >= 100) {
                      processProgress = 100;
                      clearInterval(processInterval);
                      setTimeout(() => {
                        setUploadState("success");
                      }, 500);
                    }
                    setUploadProgress(processProgress);
                  }, 300);
                  
                } catch (processingError) {
                  console.error("Error processing document:", processingError);
                  setError(processingError instanceof Error ? processingError.message : "Failed to process document");
                  setUploadState("error");
                }
              }, 500);
            }
            setUploadProgress(progress);
          }, 150);
          
        } catch (error) {
          console.error("Error handling file:", error);
          setError("Failed to process file");
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
    setProcessedDocument(null);
    setError("");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <Link
              href="/dashboard"
              className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-foreground mb-4">
              Upload Your Legal Document
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Upload your contract, agreement, or terms of service to get
              instant AI-powered analysis and plain-English explanations.
            </p>
          </div>

          {/* Upload Section */}
          <div className="mb-8">
            {uploadState === "idle" && (
              <Card className="p-8">
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                    isDragActive
                      ? "border-secondary bg-secondary/5"
                      : "border-border hover:border-secondary hover:bg-secondary/5"
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {isDragActive
                      ? "Drop your file here"
                      : "Drop your file here or click to browse"}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Supports PDF, DOCX, and image files up to 10MB
                  </p>
                  <Button variant="outline" className="mt-2 bg-transparent">
                    Choose File
                  </Button>
                </div>
              </Card>
            )}

            {uploadState === "uploading" && (
              <Card className="p-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-secondary mx-auto mb-4"></div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Uploading your document...
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Processing: {uploadedFile?.name}
                  </p>
                  <div className="max-w-md mx-auto">
                    <Progress value={uploadProgress} className="mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {Math.round(uploadProgress)}% complete
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {uploadState === "processing" && (
              <Card className="p-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Extracting text with OCR...
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {uploadedFile?.type.startsWith('image/') ? 'Reading text from image' : 
                     uploadedFile?.type === 'application/pdf' ? 'Extracting text from PDF' :
                     'Processing document content'}
                  </p>
                  <div className="max-w-md mx-auto">
                    <Progress value={uploadProgress} className="mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {Math.round(uploadProgress)}% complete
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {uploadState === "success" && (
              <Card className="p-8">
                <div className="text-center">
                  <CheckCircle className="h-16 w-16 text-secondary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Document processed successfully!
                  </h3>
                  <p className="text-muted-foreground mb-2">
                    {uploadedFile?.name} has been analyzed and is ready for review.
                  </p>
                  {processedDocument && (
                    <div className="text-sm text-muted-foreground mb-4 space-y-1">
                      <p>Processing method: {processedDocument.processingMethod === 'ocr' ? 'OCR Text Recognition' : 
                                           processedDocument.processingMethod === 'pdf-extract' ? 'PDF Text Extraction' :
                                           'Direct Text Reading'}</p>
                      {processedDocument.confidence && (
                        <p>OCR Confidence: {Math.round(processedDocument.confidence)}%</p>
                      )}
                      <p>Extracted text: {processedDocument.text.length} characters</p>
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      onClick={handleAnalyze}
                      className="bg-secondary hover:bg-secondary/90"
                    >
                      View Analysis
                    </Button>
                    <Button variant="outline" onClick={handleReset}>
                      Upload Another Document
                    </Button>
                    {processedDocument && (
                      <Button variant="ghost" size="sm" className="text-xs">
                        <Eye className="h-3 w-3 mr-1" />
                        Preview Text
                      </Button>
                    )}
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
