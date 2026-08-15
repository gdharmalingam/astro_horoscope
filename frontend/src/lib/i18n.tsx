"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

export const LANGUAGES: { code: string; label: string }[] = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
  { code: "ta", label: "தமிழ்" },
  { code: "te", label: "తెలుగు" },
  { code: "kn", label: "ಕನ್ನಡ" },
  { code: "ml", label: "മലയാളം" },
  { code: "bn", label: "বাংলা" },
  { code: "mr", label: "मराठी" },
  { code: "gu", label: "ગુજરાતી" },
  { code: "pa", label: "ਪੰਜਾਬੀ" },
];

type Dict = Record<string, string>;

const en: Dict = {
  appTitle: "Vedic Horoscope",
  tagline:
    "Generate a sidereal birth chart and Vimshottari dasa instantly — no sign-in required.",
  name: "Name",
  namePlaceholder: "Person's name",
  sex: "Sex",
  male: "Male",
  female: "Female",
  birthDate: "Birth date",
  birthTime: "Birth time",
  placeOfBirth: "Place of birth",
  searchPlace: "Search city, town or place…",
  pickOnMap: "Pick / adjust on map",
  generate: "Generate horoscope",
  generating: "Generating…",
  chart: "Chart",
  positions: "Planetary Positions",
  dasa: "Vimshottari Dasa",
  current: "Current",
  interpretation: "Interpretation",
  downloadPdf: "Download PDF",
  signIn: "Sign In",
  signInRequired: "Please sign in to download the PDF.",
  horoscopeTab: "Horoscope",
  matchTab: "Match Making",
  transitTab: "Transit",
  aiTab: "AI Prediction",
  comingSoon: "Coming soon",
  aiComingSoonDesc:
    "AI-assisted, personalised predictions are on the way. Soon you'll get a natural-language reading of your chart, dasa timing and yogas here.",
  savedProfiles: "Saved profiles",
  saveCurrent: "＋ Save current",
  signInToSaveProfiles: "Sign in to save up to 5 birth profiles for quick reuse.",
  profileLimitReached: "You can save up to 5 profiles.",
  deleteProfile: "Remove profile",
  profilesTab: "Profiles",
  addProfile: "Add a profile",
  saveProfile: "Save profile",
  useInHoroscope: "Horoscope",
  useAsBoy: "Boy",
  useAsGirl: "Girl",
  alreadySaved: "This profile is already saved.",
  noProfilesYet: "No saved profiles yet. Add one below.",
  fillBirthFirst: "Enter birth date, time and place first.",
  confirmDeleteProfile: "Delete this saved profile?",
  character: "Character",
  dasaPredictions: "Dasa Guidance",
  boy: "Boy",
  girl: "Girl",
  checkMatch: "Check compatibility",
  compatibility: "Compatibility",
  computeTransit: "Show current transit",
  currentTransit: "Current Transit",
};

const hi: Dict = {
  appTitle: "वैदिक कुंडली",
  tagline: "तुरंत निरयन जन्म कुंडली और विंशोत्तरी दशा बनाएं।",
  name: "नाम",
  namePlaceholder: "व्यक्ति का नाम",
  sex: "लिंग",
  male: "पुरुष",
  female: "स्त्री",
  birthDate: "जन्म तिथि",
  birthTime: "जन्म समय",
  placeOfBirth: "जन्म स्थान",
  searchPlace: "शहर, कस्बा या स्थान खोजें…",
  pickOnMap: "मानचित्र पर चुनें",
  generate: "कुंडली बनाएं",
  generating: "बना रहे हैं…",
  chart: "चक्र",
  positions: "ग्रह स्थिति",
  dasa: "विंशोत्तरी दशा",
  current: "वर्तमान",
  interpretation: "व्याख्या",
  downloadPdf: "पीडीएफ डाउनलोड करें",
  signIn: "साइन इन",
  signInRequired: "पीडीएफ डाउनलोड करने के लिए कृपया साइन इन करें।",
  horoscopeTab: "कुंडली",
  matchTab: "गुण मिलान",
  transitTab: "गोचर",
  character: "स्वभाव",
  dasaPredictions: "दशा फल",
  boy: "वर",
  girl: "वधू",
  checkMatch: "मिलान जांचें",
  compatibility: "गुण मिलान",
  computeTransit: "गोचर देखें",
  currentTransit: "वर्तमान गोचर",
};

const ta: Dict = {
  appTitle: "வேத ஜாதகம்",
  tagline: "உடனடியாக நிரயன ஜாதகம் மற்றும் விம்சோத்தரி தசை உருவாக்கவும்.",
  name: "பெயர்",
  namePlaceholder: "நபரின் பெயர்",
  sex: "பாலினம்",
  male: "ஆண்",
  female: "பெண்",
  birthDate: "பிறந்த தேதி",
  birthTime: "பிறந்த நேரம்",
  placeOfBirth: "பிறந்த இடம்",
  searchPlace: "நகரம் அல்லது இடத்தைத் தேடுங்கள்…",
  pickOnMap: "வரைபடத்தில் தேர்வு செய்யவும்",
  generate: "ஜாதகம் உருவாக்கு",
  generating: "உருவாக்குகிறது…",
  chart: "சக்கரம்",
  positions: "கிரக நிலைகள்",
  dasa: "விம்சோத்தரி தசை",
  current: "தற்போதைய",
  interpretation: "விளக்கம்",
  downloadPdf: "PDF பதிவிறக்கு",
  signIn: "உள்நுழை",
  signInRequired: "PDF பதிவிறக்க உள்நுழையவும்.",
  horoscopeTab: "ஜாதகம்",
  matchTab: "பொருத்தம்",
  transitTab: "கோச்சாரம்",
  character: "குணம்",
  dasaPredictions: "தசை பலன்",
  boy: "மணமகன்",
  girl: "மணமகள்",
  checkMatch: "பொருத்தம் பார்",
  compatibility: "பொருத்தம்",
  computeTransit: "கோச்சாரம் காட்டு",
  currentTransit: "தற்போதைய கோச்சாரம்",
};

// Fuller regional dictionaries — any missing keys fall back to English.
const te: Dict = {
  appTitle: "వేద జాతకం", name: "పేరు", sex: "లింగం", male: "పురుషుడు", female: "స్త్రీ",
  birthDate: "పుట్టిన తేదీ", birthTime: "పుట్టిన సమయం", placeOfBirth: "పుట్టిన స్థలం",
  generate: "జాతకం రూపొందించు", positions: "గ్రహ స్థానాలు", dasa: "వింశోత్తరి దశ",
  interpretation: "వ్యాఖ్యానం", downloadPdf: "PDF డౌన్‌లోడ్", signIn: "సైన్ ఇన్",
  horoscopeTab: "జాతకం", matchTab: "జాతక పొంతన", transitTab: "గోచారం", character: "స్వభావం",
  dasaPredictions: "దశా ఫలం", boy: "వరుడు", girl: "వధువు", checkMatch: "పొంతన తనిఖీ",
  compatibility: "గుణ మిలన్", computeTransit: "గోచారం చూపించు", currentTransit: "ప్రస్తుత గోచారం",
};
const kn: Dict = {
  appTitle: "ವೈದಿಕ ಜಾತಕ", name: "ಹೆಸರು", sex: "ಲಿಂಗ", male: "ಪುರುಷ", female: "ಸ್ತ್ರೀ",
  birthDate: "ಹುಟ್ಟಿದ ದಿನಾಂಕ", birthTime: "ಹುಟ್ಟಿದ ಸಮಯ", placeOfBirth: "ಹುಟ್ಟಿದ ಸ್ಥಳ",
  generate: "ಜಾತಕ ರಚಿಸಿ", positions: "ಗ್ರಹ ಸ್ಥಾನಗಳು", dasa: "ವಿಂಶೋತ್ತರಿ ದಶಾ",
  interpretation: "ವ್ಯಾಖ್ಯಾನ", downloadPdf: "PDF ಡೌನ್‌ಲೋಡ್", signIn: "ಸೈನ್ ಇನ್",
  horoscopeTab: "ಜಾತಕ", matchTab: "ಜಾತಕ ಹೊಂದಾಣಿಕೆ", transitTab: "ಗೋಚಾರ", character: "ಸ್ವಭಾವ",
  dasaPredictions: "ದಶಾ ಫಲ", boy: "ವರ", girl: "ವಧು", checkMatch: "ಹೊಂದಾಣಿಕೆ ಪರಿಶೀಲಿಸಿ",
  compatibility: "ಗುಣ ಮಿಲನ", computeTransit: "ಗೋಚಾರ ತೋರಿಸಿ", currentTransit: "ಪ್ರಸ್ತುತ ಗೋಚಾರ",
};
const ml: Dict = {
  appTitle: "വേദ ജാതകം", name: "പേര്", sex: "ലിംഗം", male: "പുരുഷൻ", female: "സ്ത്രീ",
  birthDate: "ജനന തീയതി", birthTime: "ജനന സമയം", placeOfBirth: "ജനന സ്ഥലം",
  generate: "ജാതകം ഉണ്ടാക്കുക", positions: "ഗ്രഹസ്ഥാനങ്ങൾ", dasa: "വിംശോത്തരി ദശ",
  interpretation: "വ്യാഖ്യാനം", downloadPdf: "PDF ഡൗൺലോഡ്", signIn: "സൈൻ ഇൻ",
  horoscopeTab: "ജാതകം", matchTab: "പൊരുത്തം", transitTab: "ഗോചാരം", character: "സ്വഭാവം",
  dasaPredictions: "ദശാ ഫലം", boy: "വരൻ", girl: "വധു", checkMatch: "പൊരുത്തം പരിശോധിക്കുക",
  compatibility: "പൊരുത്തം", computeTransit: "ഗോചാരം കാണിക്കുക", currentTransit: "നിലവിലെ ഗോചാരം",
};
const bn: Dict = {
  appTitle: "বৈদিক কুণ্ডলী", name: "নাম", sex: "লিঙ্গ", male: "পুরুষ", female: "নারী",
  birthDate: "জন্ম তারিখ", birthTime: "জন্ম সময়", placeOfBirth: "জন্মস্থান",
  generate: "কুণ্ডলী তৈরি করুন", positions: "গ্রহ অবস্থান", dasa: "বিংশোত্তরী দশা",
  interpretation: "ব্যাখ্যা", downloadPdf: "PDF ডাউনলোড", signIn: "সাইন ইন",
  horoscopeTab: "কুণ্ডলী", matchTab: "মিলন", transitTab: "গোচর", character: "স্বভাব",
  dasaPredictions: "দশা ফল", boy: "বর", girl: "বধূ", checkMatch: "মিল যাচাই করুন",
  compatibility: "গুণ মিলন", computeTransit: "গোচর দেখান", currentTransit: "বর্তমান গোচর",
};
const mr: Dict = {
  appTitle: "वैदिक कुंडली", name: "नाव", sex: "लिंग", male: "पुरुष", female: "स्त्री",
  birthDate: "जन्म तारीख", birthTime: "जन्म वेळ", placeOfBirth: "जन्म ठिकाण",
  generate: "कुंडली तयार करा", positions: "ग्रह स्थिती", dasa: "विंशोत्तरी दशा",
  interpretation: "विवेचन", downloadPdf: "PDF डाउनलोड", signIn: "साइन इन",
  horoscopeTab: "कुंडली", matchTab: "जुळणी", transitTab: "गोचर", character: "स्वभाव",
  dasaPredictions: "दशा फल", boy: "वर", girl: "वधू", checkMatch: "जुळणी तपासा",
  compatibility: "गुण मिलन", computeTransit: "गोचर पहा", currentTransit: "सध्याचे गोचर",
};
const gu: Dict = {
  appTitle: "વૈદિક કુંડળી", name: "નામ", sex: "જાતિ", male: "પુરુષ", female: "સ્ત્રી",
  birthDate: "જન્મ તારીખ", birthTime: "જન્મ સમય", placeOfBirth: "જન્મ સ્થળ",
  generate: "કુંડળી બનાવો", positions: "ગ્રહ સ્થિતિ", dasa: "વિંશોત્તરી દશા",
  interpretation: "અર્થઘટન", downloadPdf: "PDF ડાઉનલોડ", signIn: "સાઇન ઇન",
  horoscopeTab: "કુંડળી", matchTab: "મેળાપક", transitTab: "ગોચર", character: "સ્વભાવ",
  dasaPredictions: "દશા ફળ", boy: "વર", girl: "કન્યા", checkMatch: "મેળ ચકાસો",
  compatibility: "ગુણ મિલન", computeTransit: "ગોચર બતાવો", currentTransit: "વર્તમાન ગોચર",
};
const pa: Dict = {
  appTitle: "ਵੈਦਿਕ ਕੁੰਡਲੀ", name: "ਨਾਮ", sex: "ਲਿੰਗ", male: "ਮਰਦ", female: "ਔਰਤ",
  birthDate: "ਜਨਮ ਮਿਤੀ", birthTime: "ਜਨਮ ਸਮਾਂ", placeOfBirth: "ਜਨਮ ਸਥਾਨ",
  generate: "ਕੁੰਡਲੀ ਬਣਾਓ", positions: "ਗ੍ਰਹਿ ਸਥਿਤੀ", dasa: "ਵਿੰਸ਼ੋੱਤਰੀ ਦਸ਼ਾ",
  interpretation: "ਵਿਆਖਿਆ", downloadPdf: "PDF ਡਾਊਨਲੋਡ", signIn: "ਸਾਈਨ ਇਨ",
  horoscopeTab: "ਕੁੰਡਲੀ", matchTab: "ਮਿਲਾਨ", transitTab: "ਗੋਚਰ", character: "ਸੁਭਾਅ",
  dasaPredictions: "ਦਸ਼ਾ ਫਲ", boy: "ਲਾੜਾ", girl: "ਲਾੜੀ", checkMatch: "ਮਿਲਾਨ ਜਾਂਚੋ",
  compatibility: "ਗੁਣ ਮਿਲਾਨ", computeTransit: "ਗੋਚਰ ਵੇਖੋ", currentTransit: "ਮੌਜੂਦਾ ਗੋਚਰ",
};

const DICTS: Record<string, Dict> = { en, hi, ta, te, kn, ml, bn, mr, gu, pa };

interface I18nContextValue {
  lang: string;
  setLang: (code: string) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within <LanguageProvider>");
  return ctx;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState("en");

  useEffect(() => {
    const saved = typeof window !== "undefined" && localStorage.getItem("lang");
    if (saved && DICTS[saved]) setLangState(saved);
  }, []);

  const setLang = (code: string) => {
    setLangState(code);
    localStorage.setItem("lang", code);
  };

  const t = (key: string) => DICTS[lang]?.[key] ?? en[key] ?? key;

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}
