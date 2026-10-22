/**
 * Location-Aware Emergency & Crisis Helpline Directory
 * Provides clinical-grade, accurate emergency numbers (Medical, Police, Fire, Mental Health)
 * tailored dynamically to the user's detected or selected place & country worldwide.
 */

export interface EmergencyContactInfo {
  countryCode: string; // ISO 2-letter code (e.g. IN, US, GB)
  countryName: string; // Full country name
  flagEmoji: string;
  primaryEmergency: string; // Unified 1-click dial number
  medicalEmergency: string; // Ambulance / Emergency medical services
  police: string; // Police services
  fire: string; // Fire and rescue
  mentalHealth: {
    name: string;
    number: string;
    description: string;
  };
  poisonControl?: string;
  notes?: string;
}

export const GLOBAL_EMERGENCY_DIRECTORY: Record<string, EmergencyContactInfo> = {
  IN: {
    countryCode: "IN",
    countryName: "India",
    flagEmoji: "🇮🇳",
    primaryEmergency: "112",
    medicalEmergency: "108",
    police: "100",
    fire: "101",
    mentalHealth: {
      name: "Tele-MANAS",
      number: "14416",
      description: "24/7 National Mental Health Toll-Free Line (1800-891-4416)",
    },
    poisonControl: "1800 116 117",
    notes: "112 is India's National Emergency Response Support System (ERSS).",
  },
  US: {
    countryCode: "US",
    countryName: "United States",
    flagEmoji: "🇺🇸",
    primaryEmergency: "911",
    medicalEmergency: "911",
    police: "911",
    fire: "911",
    mentalHealth: {
      name: "988 Suicide & Crisis Lifeline",
      number: "988",
      description: "24/7 Free & Confidential Suicide & Crisis Lifeline (Call or Text)",
    },
    poisonControl: "1-800-222-1222",
    notes: "Dial 911 immediately for acute medical and physical distress.",
  },
  GB: {
    countryCode: "GB",
    countryName: "United Kingdom",
    flagEmoji: "🇬🇧",
    primaryEmergency: "999",
    medicalEmergency: "999",
    police: "999",
    fire: "999",
    mentalHealth: {
      name: "NHS 111 / Samaritans",
      number: "111",
      description: "NHS Mental Health & Urgent Triage (Samaritans: 116 123)",
    },
    poisonControl: "111",
    notes: "112 also works on all UK mobile phones alongside 999.",
  },
  CA: {
    countryCode: "CA",
    countryName: "Canada",
    flagEmoji: "🇨🇦",
    primaryEmergency: "911",
    medicalEmergency: "911",
    police: "911",
    fire: "911",
    mentalHealth: {
      name: "988 Suicide Crisis Helpline",
      number: "988",
      description: "24/7 Toll-free Call or Text in English and French",
    },
    poisonControl: "1-800-268-9017",
    notes: "911 reaches police, fire, and ambulance across all Canadian provinces.",
  },
  AU: {
    countryCode: "AU",
    countryName: "Australia",
    flagEmoji: "🇦🇺",
    primaryEmergency: "000",
    medicalEmergency: "000",
    police: "000",
    fire: "000",
    mentalHealth: {
      name: "Lifeline Australia",
      number: "13 11 14",
      description: "24/7 Crisis Support & Suicide Prevention",
    },
    poisonControl: "13 11 26",
    notes: "Triple Zero (000) is Australia's primary emergency number. 112 works on mobiles.",
  },
  DE: {
    countryCode: "DE",
    countryName: "Germany",
    flagEmoji: "🇩🇪",
    primaryEmergency: "112",
    medicalEmergency: "112",
    police: "110",
    fire: "112",
    mentalHealth: {
      name: "TelefonSeelsorge",
      number: "0800 111 0 111",
      description: "Free 24/7 Crisis & Emotional Support Helpline",
    },
    poisonControl: "030 19240",
    notes: "112 for ambulance/fire and 110 for police across Germany.",
  },
  FR: {
    countryCode: "FR",
    countryName: "France",
    flagEmoji: "🇫🇷",
    primaryEmergency: "112",
    medicalEmergency: "15",
    police: "17",
    fire: "18",
    mentalHealth: {
      name: "Prévention Suicide",
      number: "3114",
      description: "24/7 Free National Suicide Prevention Hotline",
    },
    poisonControl: "01 40 05 48 48",
    notes: "Dial 15 for SAMU (medical emergencies) or 112 from any phone.",
  },
  IT: {
    countryCode: "IT",
    countryName: "Italy",
    flagEmoji: "🇮🇹",
    primaryEmergency: "112",
    medicalEmergency: "118",
    police: "113",
    fire: "115",
    mentalHealth: {
      name: "Telefono Amico Italia",
      number: "02 2327 2327",
      description: "Confidential Crisis & Emotional Support",
    },
    notes: "112 is the Single European Emergency Number active across Italy.",
  },
  ES: {
    countryCode: "ES",
    countryName: "Spain",
    flagEmoji: "🇪🇸",
    primaryEmergency: "112",
    medicalEmergency: "061",
    police: "091",
    fire: "080",
    mentalHealth: {
      name: "Línea 024 de Atención a la Conducta Suicida",
      number: "024",
      description: "Free, confidential 24/7 emotional crisis support",
    },
    poisonControl: "91 562 04 20",
    notes: "112 centralizes all emergency services in Spain.",
  },
  NL: {
    countryCode: "NL",
    countryName: "Netherlands",
    flagEmoji: "🇳🇱",
    primaryEmergency: "112",
    medicalEmergency: "112",
    police: "112",
    fire: "112",
    mentalHealth: {
      name: "113 Zelfmoordpreventie",
      number: "113",
      description: "24/7 Suicide Prevention (Free call: 0800-0113)",
    },
    notes: "112 connects directly to Dutch central dispatch for all emergencies.",
  },
  AE: {
    countryCode: "AE",
    countryName: "United Arab Emirates",
    flagEmoji: "🇦🇪",
    primaryEmergency: "999",
    medicalEmergency: "998",
    police: "999",
    fire: "997",
    mentalHealth: {
      name: "UAE National Mental Health Hotline",
      number: "800 4673",
      description: "24/7 Free Support Line (800-HOPE)",
    },
    notes: "998 for ambulance and 999 for police across UAE.",
  },
  SG: {
    countryCode: "SG",
    countryName: "Singapore",
    flagEmoji: "🇸🇬",
    primaryEmergency: "995",
    medicalEmergency: "995",
    police: "999",
    fire: "995",
    mentalHealth: {
      name: "Samaritans of Singapore (SOS)",
      number: "1767",
      description: "24-Hour Confidential Suicide Prevention Hotline",
    },
    notes: "995 for SCDF emergency ambulance & fire; 999 for police.",
  },
  NZ: {
    countryCode: "NZ",
    countryName: "New Zealand",
    flagEmoji: "🇳🇿",
    primaryEmergency: "111",
    medicalEmergency: "111",
    police: "111",
    fire: "111",
    mentalHealth: {
      name: "1737 Need to Talk?",
      number: "1737",
      description: "Free Call or Text 24/7 with trained counsellors",
    },
    poisonControl: "0800 764 766",
    notes: "111 connects to Police, Ambulance, or Fire Service in New Zealand.",
  },
  JP: {
    countryCode: "JP",
    countryName: "Japan",
    flagEmoji: "🇯🇵",
    primaryEmergency: "119",
    medicalEmergency: "119",
    police: "110",
    fire: "119",
    mentalHealth: {
      name: "TELL Lifeline (English/Japanese)",
      number: "03-5774-0992",
      description: "Free Crisis Support in Japan",
    },
    notes: "Dial 119 for Ambulance and Fire; dial 110 for Police.",
  },
  CH: {
    countryCode: "CH",
    countryName: "Switzerland",
    flagEmoji: "🇨🇭",
    primaryEmergency: "112",
    medicalEmergency: "144",
    police: "117",
    fire: "118",
    mentalHealth: {
      name: "Die Dargebotene Hand / La Main Tendue",
      number: "143",
      description: "24/7 Confidential Crisis Line",
    },
    poisonControl: "145",
    notes: "144 for Ambulance, 117 for Police, 112 for general emergency.",
  },
  SE: {
    countryCode: "SE",
    countryName: "Sweden",
    flagEmoji: "🇸🇪",
    primaryEmergency: "112",
    medicalEmergency: "112",
    police: "112",
    fire: "112",
    mentalHealth: {
      name: "Mind Självmordslinjen",
      number: "90101",
      description: "Swedish National Suicide Prevention Line",
    },
    notes: "112 handles all SOS emergencies in Sweden.",
  },
  ZA: {
    countryCode: "ZA",
    countryName: "South Africa",
    flagEmoji: "🇿🇦",
    primaryEmergency: "112",
    medicalEmergency: "10177",
    police: "10111",
    fire: "10177",
    mentalHealth: {
      name: "SADAG Mental Health Helpline",
      number: "0800 567 567",
      description: "South African Depression and Anxiety Group (24/7)",
    },
    notes: "112 connects free from any mobile phone in South Africa.",
  },
  BR: {
    countryCode: "BR",
    countryName: "Brazil",
    flagEmoji: "🇧🇷",
    primaryEmergency: "192",
    medicalEmergency: "192",
    police: "190",
    fire: "193",
    mentalHealth: {
      name: "CVV Centro de Valorização da Vida",
      number: "188",
      description: "24/7 Free Emotional Support & Suicide Prevention",
    },
    notes: "192 connects directly to SAMU (Urgent Mobile Ambulance).",
  },
  MX: {
    countryCode: "MX",
    countryName: "Mexico",
    flagEmoji: "🇲🇽",
    primaryEmergency: "911",
    medicalEmergency: "911",
    police: "911",
    fire: "911",
    mentalHealth: {
      name: "Línea de la Vida",
      number: "800 911 2000",
      description: "24/7 National Mental Health & Crisis Helpline",
    },
    notes: "911 is Mexico's nationwide emergency contact number.",
  },
  MY: {
    countryCode: "MY",
    countryName: "Malaysia",
    flagEmoji: "🇲🇾",
    primaryEmergency: "999",
    medicalEmergency: "999",
    police: "999",
    fire: "994",
    mentalHealth: {
      name: "Befrienders Malaysia",
      number: "03-7627 2929",
      description: "24/7 Emotional Support Helpline",
    },
    notes: "999 connects to Police and Ambulance services.",
  },
  IE: {
    countryCode: "IE",
    countryName: "Ireland",
    flagEmoji: "🇮🇪",
    primaryEmergency: "112",
    medicalEmergency: "112",
    police: "112",
    fire: "112",
    mentalHealth: {
      name: "Samaritans Ireland",
      number: "116 123",
      description: "Free 24/7 Confidential Listening Service",
    },
    notes: "Both 112 and 999 are fully functional in Ireland.",
  },
};

// Fallback international / GSM standard
export const DEFAULT_EMERGENCY_INFO: EmergencyContactInfo = {
  countryCode: "GLOBAL",
  countryName: "Global / International",
  flagEmoji: "🌐",
  primaryEmergency: "112",
  medicalEmergency: "112",
  police: "112",
  fire: "112",
  mentalHealth: {
    name: "Crisis Support (Global GSM)",
    number: "112",
    description: "Dial 112 from any GSM mobile phone to reach local emergency dispatch.",
  },
  notes: "112 is the international mobile emergency number recognized worldwide.",
};

// Major city heuristic mappings
const CITY_TO_COUNTRY_CODE: Record<string, string> = {
  // India
  chennai: "IN",
  mumbai: "IN",
  delhi: "IN",
  "new delhi": "IN",
  bengaluru: "IN",
  bangalore: "IN",
  hyderabad: "IN",
  kolkata: "IN",
  pune: "IN",
  ahmedabad: "IN",
  jaipur: "IN",
  kochi: "IN",
  trivandrum: "IN",
  coimbatore: "IN",
  madurai: "IN",
  lucknow: "IN",
  chandigarh: "IN",
  // USA
  "new york": "US",
  "san francisco": "US",
  "los angeles": "US",
  chicago: "US",
  seattle: "US",
  boston: "US",
  austin: "US",
  dallas: "US",
  houston: "US",
  miami: "US",
  atlanta: "US",
  denver: "US",
  washington: "US",
  // UK
  london: "GB",
  manchester: "GB",
  birmingham: "GB",
  edinburgh: "GB",
  glasgow: "GB",
  liverpool: "GB",
  bristol: "GB",
  leeds: "GB",
  // Canada
  toronto: "CA",
  vancouver: "CA",
  montreal: "CA",
  calgary: "CA",
  ottawa: "CA",
  // Australia
  sydney: "AU",
  melbourne: "AU",
  brisbane: "AU",
  perth: "AU",
  adelaide: "AU",
  canberra: "AU",
  // Germany
  berlin: "DE",
  munich: "DE",
  frankfurt: "DE",
  hamburg: "DE",
  cologne: "DE",
  // France
  paris: "FR",
  lyon: "FR",
  marseille: "FR",
  nice: "FR",
  // UAE
  dubai: "AE",
  "abu dhabi": "AE",
  sharjah: "AE",
  // Singapore
  singapore: "SG",
  // Japan
  tokyo: "JP",
  osaka: "JP",
  kyoto: "JP",
  // New Zealand
  auckland: "NZ",
  wellington: "NZ",
  christchurch: "NZ",
};

/**
 * Matches a country name, code, or city string to the corresponding EmergencyContactInfo.
 */
export function getEmergencyInfo(countryOrLocation?: string | null): EmergencyContactInfo {
  if (!countryOrLocation || typeof countryOrLocation !== "string") {
    return GLOBAL_EMERGENCY_DIRECTORY.IN; // Default to India as primary GraceAi locale
  }

  const query = countryOrLocation.trim().toLowerCase();

  // 1. Direct ISO code check (e.g. "IN", "US", "GB")
  const upper = countryOrLocation.trim().toUpperCase();
  if (GLOBAL_EMERGENCY_DIRECTORY[upper]) {
    return GLOBAL_EMERGENCY_DIRECTORY[upper];
  }

  // 2. City name heuristic match
  if (CITY_TO_COUNTRY_CODE[query] && GLOBAL_EMERGENCY_DIRECTORY[CITY_TO_COUNTRY_CODE[query]]) {
    return GLOBAL_EMERGENCY_DIRECTORY[CITY_TO_COUNTRY_CODE[query]];
  }

  // Check if query contains any known city
  for (const [cityName, code] of Object.entries(CITY_TO_COUNTRY_CODE)) {
    if (query.includes(cityName) && GLOBAL_EMERGENCY_DIRECTORY[code]) {
      return GLOBAL_EMERGENCY_DIRECTORY[code];
    }
  }

  // 3. Country name substring or exact match
  for (const info of Object.values(GLOBAL_EMERGENCY_DIRECTORY)) {
    const nameLower = info.countryName.toLowerCase();
    if (
      nameLower === query ||
      query.includes(nameLower) ||
      nameLower.includes(query)
    ) {
      return info;
    }
  }

  // Common aliases
  if (query.includes("usa") || query.includes("america") || query.includes("united states")) {
    return GLOBAL_EMERGENCY_DIRECTORY.US;
  }
  if (query.includes("uk") || query.includes("britain") || query.includes("england") || query.includes("scotland")) {
    return GLOBAL_EMERGENCY_DIRECTORY.GB;
  }
  if (query.includes("bharat") || query.includes("hindustan") || query.includes("india")) {
    return GLOBAL_EMERGENCY_DIRECTORY.IN;
  }
  if (query.includes("uae") || query.includes("emirates")) {
    return GLOBAL_EMERGENCY_DIRECTORY.AE;
  }

  return GLOBAL_EMERGENCY_DIRECTORY.IN;
}

/**
 * Returns all configured countries sorted alphabetically for easy user selection.
 */
export function getAllEmergencyCountries(): EmergencyContactInfo[] {
  return Object.values(GLOBAL_EMERGENCY_DIRECTORY).sort((a, b) =>
    a.countryName.localeCompare(b.countryName)
  );
}

/**
 * Dispatches a client-side event so all components immediately update their emergency numbers.
 */
export function dispatchLocationChange(location: {
  city: string;
  region?: string;
  country: string;
  latitude?: number;
  longitude?: number;
}) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      "graceai_user_location",
      JSON.stringify(location)
    );
    window.dispatchEvent(
      new CustomEvent("graceai_location_changed", { detail: location })
    );
  } catch (err) {
    console.warn("Could not dispatch location change:", err);
  }
}
