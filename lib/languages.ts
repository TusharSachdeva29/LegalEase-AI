// Language configuration for the legal AI assistant
// Supports major Indian languages plus English

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  speechCode: string; // For Google Speech-to-Text
  voiceCode: string; // For Google Text-to-Speech
  flag: string;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  {
    code: "en",
    name: "English",
    nativeName: "English",
    speechCode: "en-IN", // Indian English for better accent recognition
    voiceCode: "en-IN-Standard-A",
    flag: "🇮🇳",
  },
  {
    code: "hi",
    name: "Hindi",
    nativeName: "हिंदी",
    speechCode: "hi-IN",
    voiceCode: "hi-IN-Standard-A",
    flag: "🇮🇳",
  },
  {
    code: "ta",
    name: "Tamil",
    nativeName: "தமிழ்",
    speechCode: "ta-IN",
    voiceCode: "ta-IN-Standard-A",
    flag: "🇮🇳",
  },
  {
    code: "te",
    name: "Telugu",
    nativeName: "తెలుగు",
    speechCode: "te-IN",
    voiceCode: "te-IN-Standard-A",
    flag: "🇮🇳",
  },
  {
    code: "bn",
    name: "Bengali",
    nativeName: "বাংলা",
    speechCode: "bn-IN",
    voiceCode: "bn-IN-Standard-A",
    flag: "🇮🇳",
  },
  {
    code: "mr",
    name: "Marathi",
    nativeName: "मराठी",
    speechCode: "mr-IN",
    voiceCode: "mr-IN-Standard-A",
    flag: "🇮🇳",
  },
  {
    code: "gu",
    name: "Gujarati",
    nativeName: "ગુજરાતી",
    speechCode: "gu-IN",
    voiceCode: "gu-IN-Standard-A",
    flag: "🇮🇳",
  },
  {
    code: "kn",
    name: "Kannada",
    nativeName: "ಕನ್ನಡ",
    speechCode: "kn-IN",
    voiceCode: "kn-IN-Standard-A",
    flag: "🇮🇳",
  },
  {
    code: "ml",
    name: "Malayalam",
    nativeName: "മലയാളം",
    speechCode: "ml-IN",
    voiceCode: "ml-IN-Standard-A",
    flag: "🇮🇳",
  },
  {
    code: "pa",
    name: "Punjabi",
    nativeName: "ਪੰਜਾਬੀ",
    speechCode: "pa-Guru-IN",
    voiceCode: "pa-IN-Standard-A",
    flag: "🇮🇳",
  },
  {
    code: "ur",
    name: "Urdu",
    nativeName: "اردو",
    speechCode: "ur-IN",
    voiceCode: "ur-IN-Standard-A",
    flag: "🇮🇳",
  },
];

export const DEFAULT_LANGUAGE = SUPPORTED_LANGUAGES[0]; // English

export function getLanguageByCode(code: string): Language | undefined {
  return SUPPORTED_LANGUAGES.find((lang) => lang.code === code);
}

export function getLanguageName(code: string): string {
  const language = getLanguageByCode(code);
  return language ? language.nativeName : "English";
}

export function getSpeechLanguageCode(code: string): string {
  const language = getLanguageByCode(code);
  return language ? language.speechCode : "en-IN";
}

export function getVoiceLanguageCode(code: string): string {
  const language = getLanguageByCode(code);
  return language ? language.voiceCode : "en-IN-Standard-A";
}

// Language-specific legal terms for better speech recognition
export const LEGAL_TERMS_BY_LANGUAGE: Record<string, string[]> = {
  en: [
    "legal",
    "contract",
    "agreement",
    "clause",
    "law",
    "attorney",
    "lawyer",
    "document",
    "analysis",
    "plaintiff",
    "defendant",
    "court",
    "judge",
    "provision",
    "terms",
    "conditions",
    "liability",
    "obligation",
    "rights",
  ],
  hi: [
    "कानूनी",
    "अनुबंध",
    "समझौता",
    "धारा",
    "कानून",
    "वकील",
    "अधिवक्ता",
    "दस्तावेज",
    "विश्लेषण",
    "वादी",
    "प्रतिवादी",
    "न्यायालय",
    "न्यायाधीश",
    "प्रावधान",
    "शर्तें",
    "दायित्व",
    "अधिकार",
  ],
  ta: [
    "சட்ட",
    "ஒப்பந்தம்",
    "உடன்படிக்கை",
    "பிரிவு",
    "சட்டம்",
    "வழக்கறிஞர்",
    "ஆவணம்",
    "பகுப்பாய்வு",
    "வாதி",
    "பிரதிவாதி",
    "நீதிமன்றம்",
    "நீதிபதி",
    "விதி",
    "நிபந்தனைகள்",
    "பொறுப்பு",
    "உரிமைகள்",
  ],
  te: [
    "చట్టపరమైన",
    "ఒప్పందం",
    "ఒప్పందం",
    "నియమం",
    "చట్టం",
    "న్యాయవాది",
    "పత్రం",
    "విశ్లేషణ",
    "వాది",
    "ప్రతివాది",
    "కోర్టు",
    "న్యాయమూర్తి",
    "నిబంధన",
    "షరతులు",
    "బాధ్యత",
    "హక్కులు",
  ],
  bn: [
    "আইনি",
    "চুক্তি",
    "চুক্তি",
    "ধারা",
    "আইন",
    "আইনজীবী",
    "নথি",
    "বিশ্লেষণ",
    "বাদী",
    "বিবাদী",
    "আদালত",
    "বিচারক",
    "বিধান",
    "শর্তাবলী",
    "দায়বদ্ধতা",
    "অধিকার",
  ],
  // Add more languages as needed
};

// Prompt templates for different languages
export const LANGUAGE_PROMPTS: Record<string, string> = {
  en: "Please respond in English.",
  hi: "कृपया हिंदी में उत्तर दें।",
  ta: "தயவு செய்து தமிழில் பதிலளிக்கவும்।",
  te: "దయచేసి తెలుగులో సమాధానం ఇవ్వండి।",
  bn: "অনুগ্রহ করে বাংলায় উত্তর দিন।",
  mr: "कृपया मराठीत उत्तर द्या।",
  gu: "કૃપા કરીને ગુજરાતીમાં જવાબ આપો।",
  kn: "ದಯವಿಟ್ಟು ಕನ್ನಡದಲ್ಲಿ ಉತ್ತರಿಸಿ।",
  ml: "ദയവായി മലയാളത്തിൽ ഉത്തരം നൽകുക।",
  pa: "ਕਿਰਪਾ ਕਰਕੇ ਪੰਜਾਬੀ ਵਿੱਚ ਜਵਾਬ ਦਿਓ।",
  ur: "براہ کرم اردو میں جواب دیں۔",
};
