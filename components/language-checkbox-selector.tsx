"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Languages, ChevronDown, Check } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { SUPPORTED_LANGUAGES, Language } from "@/lib/languages";

interface LanguageCheckboxSelectorProps {
  compact?: boolean;
  showFlag?: boolean;
  className?: string;
}

export function LanguageCheckboxSelector({
  compact = false,
  showFlag = true,
  className = "",
}: LanguageCheckboxSelectorProps) {
  const { selectedLanguage, setSelectedLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageSelect = (language: Language) => {
    setSelectedLanguage(language);
    setIsOpen(false);
  };

  if (compact) {
    return (
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={`flex items-center gap-2 ${className}`}
          >
            {showFlag && <span>{selectedLanguage.flag}</span>}
            <span className="hidden sm:inline">
              {selectedLanguage.nativeName}
            </span>
            <span className="sm:hidden">
              {selectedLanguage.code.toUpperCase()}
            </span>
            <ChevronDown className="h-3 w-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-72 p-0">
          <div className="p-3 border-b">
            <div className="flex items-center gap-2">
              <Languages className="h-4 w-4" />
              <span className="font-medium text-sm">Select Language</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Choose your preferred language for AI responses and voice features
            </p>
          </div>
          <ScrollArea className="max-h-72">
            <div className="p-2">
              {SUPPORTED_LANGUAGES.map((language) => (
                <div
                  key={language.code}
                  className="flex items-center space-x-3 p-2 rounded-md hover:bg-accent cursor-pointer"
                  onClick={() => handleLanguageSelect(language)}
                >
                  <Checkbox
                    id={`lang-${language.code}`}
                    checked={selectedLanguage.code === language.code}
                    onChange={() => handleLanguageSelect(language)}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-lg">{language.flag}</span>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">
                        {language.nativeName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {language.name}
                      </span>
                    </div>
                  </div>
                  {selectedLanguage.code === language.code && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="p-3 border-t bg-muted/50">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>STT</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>TTS</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>AI Chat</span>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <label className="text-sm font-medium flex items-center gap-2">
        <Languages className="h-4 w-4" />
        Select Language for AI Assistant
      </label>
      <p className="text-xs text-muted-foreground">
        Choose your preferred language for voice recognition, speech synthesis,
        and AI responses.
      </p>

      <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto border rounded-lg p-3">
        {SUPPORTED_LANGUAGES.map((language) => (
          <div
            key={language.code}
            className={`flex items-center space-x-3 p-3 rounded-md border transition-colors cursor-pointer ${
              selectedLanguage.code === language.code
                ? "bg-primary/5 border-primary/20"
                : "hover:bg-accent border-transparent"
            }`}
            onClick={() => handleLanguageSelect(language)}
          >
            <Checkbox
              id={`lang-full-${language.code}`}
              checked={selectedLanguage.code === language.code}
              onChange={() => handleLanguageSelect(language)}
              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
            <div className="flex items-center gap-3 flex-1">
              <span className="text-2xl">{language.flag}</span>
              <div className="flex flex-col">
                <span className="font-medium">{language.nativeName}</span>
                <span className="text-sm text-muted-foreground">
                  {language.name}
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    STT ✓
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    TTS ✓
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    AI ✓
                  </Badge>
                </div>
              </div>
            </div>
            {selectedLanguage.code === language.code && (
              <Check className="h-5 w-5 text-primary" />
            )}
          </div>
        ))}
      </div>

      <div className="p-3 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium">Selected:</span>
          <span>{selectedLanguage.flag}</span>
          <span>{selectedLanguage.nativeName}</span>
          <Badge variant="secondary" className="text-xs">
            {selectedLanguage.code.toUpperCase()}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          All voice features and AI responses will use this language.
        </p>
      </div>
    </div>
  );
}
