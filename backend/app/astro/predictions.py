"""Lightweight rule-based interpretation text (generic, non-predictive guidance).

These are broad, traditional significations — a starting interpretation layer,
not deterministic predictions.
"""
from __future__ import annotations

_ASCENDANT = {
    "Aries": "Bold, energetic and pioneering; a natural initiator who prefers action over deliberation.",
    "Taurus": "Steady, patient and comfort-seeking; values stability, beauty and material security.",
    "Gemini": "Curious, communicative and versatile; thrives on ideas, learning and variety.",
    "Cancer": "Sensitive, nurturing and home-oriented; guided strongly by emotion and memory.",
    "Leo": "Confident, warm and expressive; seeks recognition and leads with the heart.",
    "Virgo": "Analytical, precise and service-minded; notices detail and values usefulness.",
    "Libra": "Diplomatic, relational and balance-seeking; drawn to harmony, fairness and partnership.",
    "Scorpio": "Intense, determined and private; probes beneath the surface and transforms through depth.",
    "Sagittarius": "Optimistic, philosophical and freedom-loving; a seeker of meaning and wide horizons.",
    "Capricorn": "Disciplined, ambitious and responsible; builds patiently toward long-term goals.",
    "Aquarius": "Independent, humanitarian and inventive; thinks in systems and future possibilities.",
    "Pisces": "Compassionate, imaginative and intuitive; sensitive to the unseen and the collective.",
}

_MOON = {
    "Aries": "an impulsive, courageous emotional nature that acts quickly on feeling.",
    "Taurus": "a calm, loyal emotional nature (Moon is exalted here) that craves security.",
    "Gemini": "a restless, communicative mind that processes emotion through thought.",
    "Cancer": "a deeply feeling, caring mind at home in its own sign — strong emotional memory.",
    "Leo": "a proud, generous heart that needs appreciation and dignity.",
    "Virgo": "a discerning, worry-prone mind that seeks order and improvement.",
    "Libra": "a sociable, harmony-seeking nature attuned to others and relationships.",
    "Scorpio": "an intense, secretive emotional depth (Moon is debilitated here) that feels powerfully.",
    "Sagittarius": "an optimistic, independent mind drawn to truth and exploration.",
    "Capricorn": "a serious, self-contained nature that matures emotionally with time.",
    "Aquarius": "a detached, unconventional mind that feels through ideas and groups.",
    "Pisces": "a dreamy, empathetic and impressionable emotional world.",
}

_DASA = {
    "Sun": "a period emphasising authority, confidence, career visibility and relations with father/government.",
    "Moon": "a period emphasising mind, emotions, home, mother, public life and travel.",
    "Mars": "a period emphasising energy, courage, property, competition and initiative — guard against haste.",
    "Mercury": "a period emphasising intellect, communication, commerce, study and skill.",
    "Jupiter": "a generally favourable period for wisdom, wealth, children, teachers and expansion.",
    "Venus": "a period emphasising relationships, comfort, arts, vehicles and material enjoyment.",
    "Saturn": "a period of discipline, responsibility and slow, lasting gains through hard work and patience.",
    "Rahu": "an ambitious, unconventional period of sudden changes, foreign influences and worldly desire.",
    "Ketu": "a detaching, introspective period favouring spirituality, research and letting go.",
}


def build_predictions(
    ascendant_sign: str, moon_sign: str, current_dasa_lord: str | None
) -> dict:
    """Return generic character + Moon + current-dasa interpretation text."""
    character = _ASCENDANT.get(
        ascendant_sign, "A unique blend of qualities shapes the personality."
    )
    moon = f"With the Moon in {moon_sign}, there is " + _MOON.get(
        moon_sign, "a distinctive emotional temperament."
    )
    dasa_text = None
    if current_dasa_lord:
        dasa_text = f"You are currently in the {current_dasa_lord} major period — " + _DASA.get(
            current_dasa_lord, "a phase coloured by that planet's significations."
        )
    return {"character": character, "moon": moon, "dasa": dasa_text}
