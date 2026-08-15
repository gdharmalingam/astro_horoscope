"use client";

import { useI18n } from "@/lib/i18n";

// English reference order (matches the backend constants).
const EN_SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];
const EN_NAK = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
  "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
  "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha",
  "Purva Bhadrapada", "Uttara Bhadrapada", "Revati",
];

const PLANETS: Record<string, Record<string, string>> = {
  en: { Sun: "Sun", Moon: "Moon", Mars: "Mars", Mercury: "Mercury", Jupiter: "Jupiter", Venus: "Venus", Saturn: "Saturn", Rahu: "Rahu", Ketu: "Ketu", Ascendant: "Ascendant" },
  hi: { Sun: "सूर्य", Moon: "चंद्र", Mars: "मंगल", Mercury: "बुध", Jupiter: "गुरु", Venus: "शुक्र", Saturn: "शनि", Rahu: "राहु", Ketu: "केतु", Ascendant: "लग्न" },
  ta: { Sun: "சூரியன்", Moon: "சந்திரன்", Mars: "செவ்வாய்", Mercury: "புதன்", Jupiter: "குரு", Venus: "சுக்கிரன்", Saturn: "சனி", Rahu: "ராகு", Ketu: "கேது", Ascendant: "லக்னம்" },
  te: { Sun: "సూర్యుడు", Moon: "చంద్రుడు", Mars: "కుజుడు", Mercury: "బుధుడు", Jupiter: "గురుడు", Venus: "శుక్రుడు", Saturn: "శని", Rahu: "రాహు", Ketu: "కేతు", Ascendant: "లగ్నం" },
  kn: { Sun: "ಸೂರ್ಯ", Moon: "ಚಂದ್ರ", Mars: "ಮಂಗಳ", Mercury: "ಬುಧ", Jupiter: "ಗುರು", Venus: "ಶುಕ್ರ", Saturn: "ಶನಿ", Rahu: "ರಾಹು", Ketu: "ಕೇತು", Ascendant: "ಲಗ್ನ" },
  ml: { Sun: "സൂര്യൻ", Moon: "ചന്ദ്രൻ", Mars: "ചൊവ്വ", Mercury: "ബുധൻ", Jupiter: "വ്യാഴം", Venus: "ശുക്രൻ", Saturn: "ശനി", Rahu: "രാഹു", Ketu: "കേതു", Ascendant: "ലഗ്നം" },
  bn: { Sun: "সূর্য", Moon: "চন্দ্র", Mars: "মঙ্গল", Mercury: "বুধ", Jupiter: "বৃহস্পতি", Venus: "শুক্র", Saturn: "শনি", Rahu: "রাহু", Ketu: "কেতু", Ascendant: "লগ্ন" },
  mr: { Sun: "सूर्य", Moon: "चंद्र", Mars: "मंगळ", Mercury: "बुध", Jupiter: "गुरू", Venus: "शुक्र", Saturn: "शनि", Rahu: "राहू", Ketu: "केतू", Ascendant: "लग्न" },
  gu: { Sun: "સૂર્ય", Moon: "ચંદ્ર", Mars: "મંગળ", Mercury: "બુધ", Jupiter: "ગુરુ", Venus: "શુક્ર", Saturn: "શનિ", Rahu: "રાહુ", Ketu: "કેતુ", Ascendant: "લગ્ન" },
  pa: { Sun: "ਸੂਰਜ", Moon: "ਚੰਦ", Mars: "ਮੰਗਲ", Mercury: "ਬੁੱਧ", Jupiter: "ਗੁਰੂ", Venus: "ਸ਼ੁੱਕਰ", Saturn: "ਸ਼ਨੀ", Rahu: "ਰਾਹੂ", Ketu: "ਕੇਤੂ", Ascendant: "ਲਗਨ" },
};

// Short labels for chart cells (from horoscope_labels_multilingual.csv).
const PLANET_SHORT: Record<string, Record<string, string>> = {
  en: { Sun: "Su", Moon: "Mo", Mars: "Ma", Mercury: "Me", Jupiter: "Ju", Venus: "Ve", Saturn: "Sa", Rahu: "Ra", Ketu: "Ke" },
  hi: { Sun: "सू", Moon: "च", Mars: "मं", Mercury: "बु", Jupiter: "गु", Venus: "शु", Saturn: "श", Rahu: "रा", Ketu: "के" },
  ta: { Sun: "சூ", Moon: "சந்", Mars: "செ", Mercury: "பு", Jupiter: "குரு", Venus: "சுக்", Saturn: "சனி", Rahu: "ராகு", Ketu: "கேது" },
  te: { Sun: "సూ", Moon: "చం", Mars: "కు", Mercury: "బు", Jupiter: "గు", Venus: "శు", Saturn: "శ", Rahu: "రా", Ketu: "కే" },
  kn: { Sun: "ಸೂ", Moon: "ಚಂ", Mars: "ಮಂ", Mercury: "ಬು", Jupiter: "ಗು", Venus: "ಶು", Saturn: "ಶ", Rahu: "ರಾ", Ketu: "ಕೇ" },
  ml: { Sun: "സൂ", Moon: "ച", Mars: "ചൊ", Mercury: "ബു", Jupiter: "ഗു", Venus: "ശു", Saturn: "ശ", Rahu: "രാ", Ketu: "കേ" },
  bn: { Sun: "সূ", Moon: "চ", Mars: "মং", Mercury: "বু", Jupiter: "বৃ", Venus: "শু", Saturn: "শ", Rahu: "রা", Ketu: "কে" },
  mr: { Sun: "सू", Moon: "चं", Mars: "मं", Mercury: "बु", Jupiter: "गु", Venus: "शु", Saturn: "श", Rahu: "रा", Ketu: "के" },
  gu: { Sun: "સૂ", Moon: "ચં", Mars: "મં", Mercury: "બુ", Jupiter: "ગુ", Venus: "શુ", Saturn: "શ", Rahu: "રા", Ketu: "કે" },
  pa: { Sun: "ਸੂ", Moon: "ਚੰ", Mars: "ਮੰ", Mercury: "ਬੁ", Jupiter: "ਗੁ", Venus: "ਸ਼ੁ", Saturn: "ਸ਼", Rahu: "ਰਾ", Ketu: "ਕੇ" },
};

// Short Lagna marker per language.
const LAGNA_SHORT: Record<string, string> = {
  en: "Lag", hi: "लग्", ta: "லக்", te: "లగ్", kn: "ಲಗ್", ml: "ലഗ്",
  bn: "লগ্", mr: "लग्", gu: "લગ્", pa: "ਲਗ",
};

// Divisional (varga) chart names, keyed by the English name used in labels.
const VARGA_NAMES: Record<string, Record<string, string>> = {
  en: { Rasi: "Rasi", Navamsa: "Navamsa", Hora: "Hora", Drekkana: "Drekkana", Saptamsa: "Saptamsa", Dasamsa: "Dasamsa", Dwadasamsa: "Dwadasamsa" },
  hi: { Rasi: "राशि", Navamsa: "नवांश", Hora: "होरा", Drekkana: "द्रेष्काण", Saptamsa: "सप्तांश", Dasamsa: "दशांश", Dwadasamsa: "द्वादशांश" },
  ta: { Rasi: "ராசி", Navamsa: "நவாம்சம்", Hora: "ஹோரை", Drekkana: "திரேக்காணம்", Saptamsa: "சப்தாம்சம்", Dasamsa: "தசாம்சம்", Dwadasamsa: "துவாதசாம்சம்" },
  te: { Rasi: "రాశి", Navamsa: "నవాంశ", Hora: "హోర", Drekkana: "ద్రేక్కాణ", Saptamsa: "సప్తాంశ", Dasamsa: "దశాంశ", Dwadasamsa: "ద్వాదశాంశ" },
  kn: { Rasi: "ರಾಶಿ", Navamsa: "ನವಾಂಶ", Hora: "ಹೋರಾ", Drekkana: "ದ್ರೇಕ್ಕಾಣ", Saptamsa: "ಸಪ್ತಾಂಶ", Dasamsa: "ದಶಾಂಶ", Dwadasamsa: "ದ್ವಾದಶಾಂಶ" },
  ml: { Rasi: "രാശി", Navamsa: "നവാംശം", Hora: "ഹോര", Drekkana: "ദ്രേക്കാണം", Saptamsa: "സപ്താംശം", Dasamsa: "ദശാംശം", Dwadasamsa: "ദ്വാദശാംശം" },
  bn: { Rasi: "রাশি", Navamsa: "নবাংশ", Hora: "হোরা", Drekkana: "দ্রেক্কাণ", Saptamsa: "সপ্তাংশ", Dasamsa: "দশাংশ", Dwadasamsa: "দ্বাদশাংশ" },
  mr: { Rasi: "राशी", Navamsa: "नवांश", Hora: "होरा", Drekkana: "द्रेष्काण", Saptamsa: "सप्तांश", Dasamsa: "दशांश", Dwadasamsa: "द्वादशांश" },
  gu: { Rasi: "રાશિ", Navamsa: "નવાંશ", Hora: "હોરા", Drekkana: "દ્રેક્કાણ", Saptamsa: "સપ્તાંશ", Dasamsa: "દશાંશ", Dwadasamsa: "દ્વાદશાંશ" },
  pa: { Rasi: "ਰਾਸ਼ੀ", Navamsa: "ਨਵਾਂਸ਼", Hora: "ਹੋਰਾ", Drekkana: "ਦ੍ਰੇਕਾਣ", Saptamsa: "ਸਪਤਾਂਸ਼", Dasamsa: "ਦਸ਼ਾਂਸ਼", Dwadasamsa: "ਦੁਆਦਸ਼ਾਂਸ਼" },
};

const SIGNS: Record<string, string[]> = {
  en: EN_SIGNS,
  hi: ["मेष", "वृषभ", "मिथुन", "कर्क", "सिंह", "कन्या", "तुला", "वृश्चिक", "धनु", "मकर", "कुंभ", "मीन"],
  ta: ["மேஷம்", "ரிஷபம்", "மிதுனம்", "கடகம்", "சிம்மம்", "கன்னி", "துலாம்", "விருச்சிகம்", "தனுசு", "மகரம்", "கும்பம்", "மீனம்"],
  te: ["మేషం", "వృషభం", "మిథునం", "కర్కాటకం", "సింహం", "కన్య", "తుల", "వృశ్చికం", "ధనుస్సు", "మకరం", "కుంభం", "మీనం"],
  kn: ["ಮೇಷ", "ವೃಷಭ", "ಮಿಥುನ", "ಕರ್ಕಾಟಕ", "ಸಿಂಹ", "ಕನ್ಯಾ", "ತುಲಾ", "ವೃಶ್ಚಿಕ", "ಧನು", "ಮಕರ", "ಕುಂಭ", "ಮೀನ"],
  ml: ["മേടം", "ഇടവം", "മിഥുനം", "കർക്കിടകം", "ചിങ്ങം", "കന്നി", "തുലാം", "വൃശ്ചികം", "ധനു", "മകരം", "കുംഭം", "മീനം"],
  bn: ["মেষ", "বৃষ", "মিথুন", "কর্কট", "সিংহ", "কন্যা", "তুলা", "বৃশ্চিক", "ধনু", "মকর", "কুম্ভ", "মীন"],
  mr: ["मेष", "वृषभ", "मिथुन", "कर्क", "सिंह", "कन्या", "तूळ", "वृश्चिक", "धनु", "मकर", "कुंभ", "मीन"],
  gu: ["મેષ", "વૃષભ", "મિથુન", "કર્ક", "સિંહ", "કન્યા", "તુલા", "વૃશ્ચિક", "ધનુ", "મકર", "કુંભ", "મીન"],
  pa: ["ਮੇਖ", "ਬ੍ਰਿਖ", "ਮਿਥੁਨ", "ਕਰਕ", "ਸਿੰਘ", "ਕੰਨਿਆ", "ਤੁਲਾ", "ਬ੍ਰਿਸ਼ਚਕ", "ਧਨੁ", "ਮਕਰ", "ਕੁੰਭ", "ਮੀਨ"],
};

const NAKS: Record<string, string[]> = {
  en: EN_NAK,
  hi: [
    "अश्विनी", "भरणी", "कृत्तिका", "रोहिणी", "मृगशिरा", "आर्द्रा", "पुनर्वसु", "पुष्य", "आश्लेषा",
    "मघा", "पूर्व फाल्गुनी", "उत्तर फाल्गुनी", "हस्त", "चित्रा", "स्वाति", "विशाखा", "अनुराधा", "ज्येष्ठा",
    "मूल", "पूर्वाषाढ़ा", "उत्तराषाढ़ा", "श्रवण", "धनिष्ठा", "शतभिषा", "पूर्व भाद्रपद", "उत्तर भाद्रपद", "रेवती",
  ],
  ta: [
    "அஸ்வினி", "பரணி", "கார்த்திகை", "ரோகிணி", "மிருகசீரிடம்", "திருவாதிரை", "புனர்பூசம்", "பூசம்", "ஆயில்யம்",
    "மகம்", "பூரம்", "உத்திரம்", "ஹஸ்தம்", "சித்திரை", "சுவாதி", "விசாகம்", "அனுஷம்", "கேட்டை",
    "மூலம்", "பூராடம்", "உத்திராடம்", "திருவோணம்", "அவிட்டம்", "சதயம்", "பூரட்டாதி", "உத்திரட்டாதி", "ரேவதி",
  ],
};

export function useNames() {
  const { lang } = useI18n();

  const planet = (english: string) =>
    PLANETS[lang]?.[english] ?? PLANETS.en[english] ?? english;

  const signByIndex = (i: number) =>
    (SIGNS[lang] ?? SIGNS.en)[i] ?? EN_SIGNS[i] ?? "";

  const sign = (english: string) => {
    const idx = EN_SIGNS.indexOf(english);
    return idx >= 0 ? signByIndex(idx) : english;
  };

  const nak = (english: string) => {
    const idx = EN_NAK.indexOf(english);
    if (idx < 0) return english;
    return (NAKS[lang] ?? NAKS.en)[idx] ?? EN_NAK[idx];
  };

  // Grapheme-safe 2-character abbreviation for compact chart cells.
  const abbr = (s: string) => Array.from(s).slice(0, 2).join("");

  // Localized short planet label used inside chart cells.
  const planetShort = (english: string) =>
    PLANET_SHORT[lang]?.[english] ??
    PLANET_SHORT.en[english] ??
    abbr(planet(english));

  const lagnaShort = () => LAGNA_SHORT[lang] ?? LAGNA_SHORT.en;

  const vargaName = (english: string) =>
    VARGA_NAMES[lang]?.[english] ?? VARGA_NAMES.en[english] ?? english;

  return { planet, planetShort, sign, signByIndex, nak, abbr, lagnaShort, vargaName, lang };
}
