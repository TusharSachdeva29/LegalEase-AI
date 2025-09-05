"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Languages, ChevronDown } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { SUPPORTED_LANGUAGES, Language } from "@/lib/languages";

interface LanguageSelectorProps {
  compact?: boolean;
  showFlag?: boolean;
}

export function LanguageSelector({
  compact = false,
  showFlag = true,
}: LanguageSelectorProps) {
  const { selectedLanguage, setSelectedLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageSelect = (language: Language) => {
    setSelectedLanguage(language);
    setIsOpen(false);
  };

  if (compact) {
    return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            {showFlag && <span>{selectedLanguage.flag}</span>}
            <span>
              {compact
                ? selectedLanguage.code.toUpperCase()
                : selectedLanguage.nativeName}
            </span>
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {SUPPORTED_LANGUAGES.map((language) => (
            <DropdownMenuItem
              key={language.code}
              onClick={() => handleLanguageSelect(language)}
              className="flex items-center gap-3 cursor-pointer"
            >
              <span>{language.flag}</span>
              <div className="flex flex-col">
                <span className="font-medium">{language.nativeName}</span>
                <span className="text-xs text-muted-foreground">
                  {language.name}
                </span>
              </div>
              {selectedLanguage.code === language.code && (
                <Badge variant="secondary" className="ml-auto text-xs">
                  Selected
                </Badge>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium flex items-center gap-2">
        <Languages className="h-4 w-4" />
        Select Language
      </label>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            <div className="flex items-center gap-2">
              <span>{selectedLanguage.flag}</span>
              <span>{selectedLanguage.nativeName}</span>
              <span className="text-muted-foreground">
                ({selectedLanguage.name})
              </span>
            </div>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-full min-w-[250px]">
          {SUPPORTED_LANGUAGES.map((language) => (
            <DropdownMenuItem
              key={language.code}
              onClick={() => handleLanguageSelect(language)}
              className="flex items-center gap-3 cursor-pointer p-3"
            >
              <span className="text-lg">{language.flag}</span>
              <div className="flex flex-col">
                <span className="font-medium">{language.nativeName}</span>
                <span className="text-xs text-muted-foreground">
                  {language.name}
                </span>
              </div>
              {selectedLanguage.code === language.code && (
                <Badge variant="secondary" className="ml-auto">
                  ✓
                </Badge>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
