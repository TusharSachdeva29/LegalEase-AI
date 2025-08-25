"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Download, Share2, Save, Mail, Link, CheckCircle, Loader2 } from "lucide-react"

interface ExportSectionProps {
  documentTitle?: string
  showSaveToAccount?: boolean
}

export function ExportSection({
  documentTitle = "Legal Document Analysis",
  showSaveToAccount = true,
}: ExportSectionProps) {
  const [downloadState, setDownloadState] = useState<"idle" | "loading" | "success">("idle")
  const [saveState, setSaveState] = useState<"idle" | "loading" | "success">("idle")
  const [shareState, setShareState] = useState<"idle" | "loading" | "success">("idle")

  const handleDownloadPDF = async () => {
    setDownloadState("loading")
    // Simulate download process
    setTimeout(() => {
      setDownloadState("success")
      setTimeout(() => setDownloadState("idle"), 2000)
    }, 1500)
  }

  const handleSaveToAccount = async () => {
    setSaveState("loading")
    // Simulate save process
    setTimeout(() => {
      setSaveState("success")
      setTimeout(() => setSaveState("idle"), 2000)
    }, 1000)
  }

  const handleShare = async () => {
    setShareState("loading")
    // Simulate share process
    setTimeout(() => {
      setShareState("success")
      setTimeout(() => setShareState("idle"), 2000)
    }, 800)
  }

  return (
    <Card className="p-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-foreground mb-2">Export & Save</h2>
        <p className="text-muted-foreground">Download your analysis, save to your account, or share with others</p>
      </div>

      {/* Primary Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {/* Download PDF */}
        <div className="text-center">
          <Button
            onClick={handleDownloadPDF}
            disabled={downloadState === "loading"}
            className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground mb-2"
            size="lg"
          >
            {downloadState === "loading" ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : downloadState === "success" ? (
              <CheckCircle className="h-4 w-4 mr-2" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            {downloadState === "success" ? "Downloaded!" : "Download Simplified PDF"}
          </Button>
          <p className="text-xs text-muted-foreground">Get a clean, easy-to-read PDF with plain-English explanations</p>
        </div>

        {/* Save to Account */}
        {showSaveToAccount && (
          <div className="text-center">
            <Button
              onClick={handleSaveToAccount}
              disabled={saveState === "loading"}
              variant="outline"
              className="w-full mb-2 bg-transparent"
              size="lg"
            >
              {saveState === "loading" ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : saveState === "success" ? (
                <CheckCircle className="h-4 w-4 mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {saveState === "success" ? "Saved!" : "Save to Account"}
            </Button>
            <p className="text-xs text-muted-foreground">Access your analysis anytime from your dashboard</p>
          </div>
        )}

        {/* Share */}
        <div className="text-center">
          <Button
            onClick={handleShare}
            disabled={shareState === "loading"}
            variant="outline"
            className="w-full mb-2 bg-transparent"
            size="lg"
          >
            {shareState === "loading" ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : shareState === "success" ? (
              <CheckCircle className="h-4 w-4 mr-2" />
            ) : (
              <Share2 className="h-4 w-4 mr-2" />
            )}
            {shareState === "success" ? "Link Copied!" : "Share"}
          </Button>
          <p className="text-xs text-muted-foreground">Share analysis with colleagues or legal advisors</p>
        </div>
      </div>

      {/* Share Options */}
      <div className="border-t border-border pt-4">
        <h3 className="text-sm font-medium text-foreground mb-3">Share Options</h3>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="text-xs bg-transparent">
            <Mail className="h-3 w-3 mr-1" />
            Email Link
          </Button>
          <Button variant="outline" size="sm" className="text-xs bg-transparent">
            <Link className="h-3 w-3 mr-1" />
            Copy Link
          </Button>
          <Badge variant="outline" className="text-xs">
            Link expires in 30 days
          </Badge>
        </div>
      </div>

      {/* Export Details */}
      <div className="mt-6 p-4 bg-muted rounded-lg">
        <h4 className="text-sm font-medium text-foreground mb-2">What's included in your export:</h4>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Complete document analysis with risk assessments</li>
          <li>• Plain-English explanations for each clause</li>
          <li>• Highlighted risks and recommendations</li>
          <li>• Summary of key obligations and terms</li>
          <li>• Professional formatting suitable for sharing</li>
        </ul>
      </div>
    </Card>
  )
}
