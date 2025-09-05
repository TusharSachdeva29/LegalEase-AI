"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Language, DEFAULT_LANGUAGE, getLanguageByCode } from "@/lib/languages";

interface LanguageContextType {
  selectedLanguage: Language;
  setSelectedLanguage: (language: Language) => void;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [selectedLanguage, setSelectedLanguageState] =
    useState<Language>(DEFAULT_LANGUAGE);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved language preference on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLanguageCode = localStorage.getItem("legalease-language");
      if (savedLanguageCode) {
        const language = getLanguageByCode(savedLanguageCode);
        if (language) {
          setSelectedLanguageState(language);
        }
      }
      setIsLoading(false);
    }
  }, []);

  const setSelectedLanguage = (language: Language) => {
    setSelectedLanguageState(language);
    if (typeof window !== "undefined") {
      localStorage.setItem("legalease-language", language.code);
    }
  };

  const value = {
    selectedLanguage,
    setSelectedLanguage,
    isLoading,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
