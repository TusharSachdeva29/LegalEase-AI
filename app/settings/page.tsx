"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LanguageCheckboxSelector } from "@/components/language-checkbox-selector";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Settings,
  Mic,
  Volume2,
  MessageSquare,
  Check,
  Info,
  Globe,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function SettingsPage() {
  const { selectedLanguage } = useLanguage();
  const { toast } = useToast();
  const [isTestingVoice, setIsTestingVoice] = useState(false);

  const testVoiceFeatures = async () => {
    setIsTestingVoice(true);
    try {
      // Test Text-to-Speech
      const response = await fetch("/api/text-to-speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text:
            selectedLanguage.code === "en"
              ? "Hello! This is a test of the text-to-speech feature."
              : "यह टेक्स्ट-टू-स्पीच फीचर का परीक्षण है।", // Hindi example
          voice: selectedLanguage.voiceCode,
          languageCode: selectedLanguage.speechCode,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`);
        await audio.play();

        toast({
          title: "Voice test successful!",
          description: `Text-to-Speech is working in ${selectedLanguage.nativeName}`,
        });
      } else {
        throw new Error("TTS test failed");
      }
    } catch (error) {
      console.error("Voice test error:", error);
      toast({
        title: "Voice test failed",
        description:
          "There was an issue with the voice features. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTestingVoice(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto p-6 space-y-6 max-w-7xl">
          <div className="flex items-center gap-3 mb-6">
            <Settings className="h-6 w-6" />
            <h1 className="text-3xl font-bold">Settings</h1>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Left: Language Configuration Card */}
            <div className="md:w-1/2 flex-shrink-0">
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Language Configuration
                  </CardTitle>
                  {/* <CardDescription>
                    Configure your preferred language for AI responses, voice
                    recognition, and speech synthesis. All features will adapt to your
                    selected language automatically.
                  </CardDescription> */}
                </CardHeader>
                <CardContent className="space-y-6">
                  <LanguageCheckboxSelector />

                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium flex items-center gap-2 mb-3">
                      <Info className="h-4 w-4" />
                      Current Configuration
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-2">
                        <Mic className="h-4 w-4 text-green-600" />
                        <div>
                          <p className="text-sm font-medium">Speech Recognition</p>
                          <p className="text-xs text-muted-foreground">
                            {selectedLanguage.speechCode}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Volume2 className="h-4 w-4 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium">Text-to-Speech</p>
                          <p className="text-xs text-muted-foreground">
                            {selectedLanguage.voiceCode}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-purple-600" />
                        <div>
                          <p className="text-sm font-medium">AI Responses</p>
                          <p className="text-xs text-muted-foreground">
                            {selectedLanguage.nativeName}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Test Voice Features</h4>
                      <p className="text-sm text-muted-foreground">
                        Test text-to-speech in your selected language
                      </p>
                    </div>
                    <Button
                      onClick={testVoiceFeatures}
                      disabled={isTestingVoice}
                      variant="outline"
                    >
                      {isTestingVoice ? "Testing..." : "Test Voice"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* Right: Feature Status and Supported Languages stacked */}
            <div className="flex flex-col gap-6 flex-1">
              {/* Feature Status Card */}
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle>Feature Status</CardTitle>
                  <CardDescription>
                    Current status of multilingual features in your legal AI assistant
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <Mic className="h-4 w-4" />
                        <span className="font-medium">Voice Input (STT)</span>
                      </div>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <Check className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <Volume2 className="h-4 w-4" />
                        <span className="font-medium">Voice Output (TTS)</span>
                      </div>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <Check className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        <span className="font-medium">Multilingual AI Chat</span>
                      </div>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <Check className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        <span className="font-medium">Language Persistence</span>
                      </div>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <Check className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Supported Languages Overview */}
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle>Supported Languages</CardTitle>
                  <CardDescription>
                    Complete list of languages supported for voice and AI features
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {[
                      { name: "English", native: "English", flag: "🇮🇳" },
                      { name: "Hindi", native: "हिंदी", flag: "🇮🇳" },
                      { name: "Tamil", native: "தமிழ்", flag: "🇮🇳" },
                      { name: "Telugu", native: "తెలుగు", flag: "🇮🇳" },
                      { name: "Bengali", native: "বাংলা", flag: "🇮🇳" },
                      { name: "Marathi", native: "मराठी", flag: "🇮🇳" },
                      { name: "Gujarati", native: "ગુજરાતી", flag: "🇮🇳" },
                      { name: "Kannada", native: "ಕನ್ನಡ", flag: "🇮🇳" },
                      { name: "Malayalam", native: "മലയാളം", flag: "🇮🇳" },
                      { name: "Punjabi", native: "ਪੰਜਾਬੀ", flag: "🇮🇳" },
                      { name: "Urdu", native: "اردو", flag: "🇮🇳" },
                    ].map((lang) => (
                      <div
                        key={lang.name}
                        className="flex items-center gap-2 p-2 border rounded-lg"
                      >
                        <span className="text-lg">{lang.flag}</span>
                        <div className="flex flex-col min-w-0">
                          <span className="font-medium text-sm truncate">
                            {lang.native}
                          </span>
                          <span className="text-xs text-muted-foreground truncate">
                            {lang.name}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
