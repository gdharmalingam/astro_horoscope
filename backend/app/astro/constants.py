"""Static Vedic astrology constants: signs, nakshatras, planets, dasa periods."""

# 12 Rasis (zodiac signs), sidereal order starting from Aries.
SIGNS = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
]

# 27 Nakshatras in order starting from Ashwini (0 degrees Aries).
NAKSHATRAS = [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
    "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
    "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
    "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha",
    "Purva Bhadrapada", "Uttara Bhadrapada", "Revati",
]

# Span of a single nakshatra in degrees (360 / 27).
NAKSHATRA_SPAN = 360.0 / 27.0
# Span of a single pada (quarter of a nakshatra).
PADA_SPAN = NAKSHATRA_SPAN / 4.0

# Vimshottari dasa: ruling lords in sequence and their period lengths in years.
# Total cycle = 120 years.
VIMSHOTTARI_SEQUENCE = [
    ("Ketu", 7),
    ("Venus", 20),
    ("Sun", 6),
    ("Moon", 10),
    ("Mars", 7),
    ("Rahu", 18),
    ("Jupiter", 16),
    ("Saturn", 19),
    ("Mercury", 17),
]
VIMSHOTTARI_TOTAL_YEARS = 120

# Nakshatra lord repeats every 9 nakshatras following the Vimshottari sequence.
NAKSHATRA_LORDS = [VIMSHOTTARI_SEQUENCE[i % 9][0] for i in range(27)]
