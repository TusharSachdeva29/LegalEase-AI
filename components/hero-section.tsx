"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, Zap, Lock } from "lucide-react";

export function HeroSection() {
  const handleUploadClick = () => {
    window.location.href = "/upload";
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Content */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-foreground mb-6 leading-tight">
            Demystify Legal Documents with AI
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Upload contracts, agreements, or terms of service and get clear,
            simple explanations instantly. Our AI transforms complex legal
            language into plain English you can understand.
          </p>
          <Button
            size="lg"
            onClick={handleUploadClick}
            className="bg-secondary hover:bg-secondary/90 text-secondary-foreground text-lg px-8 py-4 h-auto"
          >
            Upload Your Document
          </Button>
        </div>

        {/* Hero Illustration */}
        <div className="mb-16 flex justify-center">
          <div className="relative">
            <img
              src="/ai-analyzing-legal-documents-with-modern-interface.png"
              alt="AI analyzing legal documents"
              className="rounded-lg shadow-lg"
            />
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="flex justify-center mb-4">
              <Shield className="h-12 w-12 text-secondary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Privacy-First
            </h3>
            <p className="text-muted-foreground">
              Your documents are processed securely and never stored. Complete
              privacy guaranteed.
            </p>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="flex justify-center mb-4">
              <Zap className="h-12 w-12 text-secondary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              AI-Powered
            </h3>
            <p className="text-muted-foreground">
              Advanced AI technology breaks down complex legal jargon into
              simple, understandable language.
            </p>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="flex justify-center mb-4">
              <Lock className="h-12 w-12 text-secondary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Secure
            </h3>
            <p className="text-muted-foreground">
              Bank-level encryption ensures your sensitive legal documents
              remain completely secure.
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
}
