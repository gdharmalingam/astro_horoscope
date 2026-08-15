"""Ashtakoota (Guna Milan) marriage compatibility scoring.

Standard 8-koota system totalling 36 points, derived from each partner's Moon
nakshatra and rasi. Some kootas (Vashya, Yoni) use widely-published simplified
scoring tables.
"""
from __future__ import annotations

from app.astro.constants import NAKSHATRAS, SIGNS

# --- Nakshatra attributes (indexed 0-26) ---------------------------------

# Yoni (animal) per nakshatra.
_YONI = [
    "Horse", "Elephant", "Sheep", "Serpent", "Serpent", "Dog", "Cat", "Sheep",
    "Cat", "Rat", "Rat", "Cow", "Buffalo", "Tiger", "Buffalo", "Tiger", "Deer",
    "Deer", "Dog", "Monkey", "Mongoose", "Monkey", "Lion", "Horse", "Lion",
    "Cow", "Elephant",
]
# Sworn-enemy yoni pairs (score 0).
_YONI_ENEMIES = {
    frozenset(("Cow", "Tiger")),
    frozenset(("Elephant", "Lion")),
    frozenset(("Horse", "Buffalo")),
    frozenset(("Dog", "Deer")),
    frozenset(("Serpent", "Mongoose")),
    frozenset(("Monkey", "Sheep")),
    frozenset(("Cat", "Rat")),
}

# Gana per nakshatra: 0 = Deva, 1 = Manushya, 2 = Rakshasa.
_GANA = [0, 1, 2, 1, 0, 1, 0, 0, 2, 2, 1, 1, 0, 2, 0, 2, 0, 2, 2, 1, 1, 0, 2, 2, 1, 1, 0]
_GANA_NAMES = ["Deva", "Manushya", "Rakshasa"]
# Gana score matrix [boy][girl].
_GANA_SCORE = [
    [6, 5, 1],
    [6, 6, 0],
    [1, 0, 6],
]

# Nadi per nakshatra: 0 = Adi, 1 = Madhya, 2 = Antya.
_NADI = [0, 1, 2, 2, 1, 0, 0, 1, 2, 2, 1, 0, 0, 1, 2, 2, 1, 0, 0, 1, 2, 2, 1, 0, 0, 1, 2]
_NADI_NAMES = ["Adi", "Madhya", "Antya"]

# --- Rasi attributes (indexed 0-11) --------------------------------------

# Varna rank per rasi (Brahmin 4 > Kshatriya 3 > Vaishya 2 > Shudra 1).
_VARNA_RANK = [3, 2, 1, 4, 3, 2, 1, 4, 3, 2, 1, 4]
_VARNA_NAMES = {4: "Brahmin", 3: "Kshatriya", 2: "Vaishya", 1: "Shudra"}

# Vashya group per rasi: H=human, Q=quadruped, W=water, Wi=wild, I=insect.
_VASHYA = ["Q", "Q", "H", "W", "Wi", "H", "H", "I", "H", "W", "H", "W"]

# Rasi lord planet.
_RASI_LORD = [
    "Mars", "Venus", "Mercury", "Moon", "Sun", "Mercury",
    "Venus", "Mars", "Jupiter", "Saturn", "Saturn", "Jupiter",
]
_FRIENDS = {
    "Sun": {"Moon", "Mars", "Jupiter"},
    "Moon": {"Sun", "Mercury"},
    "Mars": {"Sun", "Moon", "Jupiter"},
    "Mercury": {"Sun", "Venus"},
    "Jupiter": {"Sun", "Moon", "Mars"},
    "Venus": {"Mercury", "Saturn"},
    "Saturn": {"Mercury", "Venus"},
}
_ENEMIES = {
    "Sun": {"Venus", "Saturn"},
    "Moon": set(),
    "Mars": {"Mercury"},
    "Mercury": {"Moon"},
    "Jupiter": {"Mercury", "Venus"},
    "Venus": {"Sun", "Moon"},
    "Saturn": {"Sun", "Moon", "Mars"},
}


def _relation(a: str, b: str) -> str:
    if b in _FRIENDS.get(a, set()):
        return "friend"
    if b in _ENEMIES.get(a, set()):
        return "enemy"
    return "neutral"


def _varna(boy_r: int, girl_r: int) -> dict:
    got = 1.0 if _VARNA_RANK[boy_r] >= _VARNA_RANK[girl_r] else 0.0
    return {"name": "Varna", "obtained": got, "max": 1,
            "note": f"{_VARNA_NAMES[_VARNA_RANK[boy_r]]} / {_VARNA_NAMES[_VARNA_RANK[girl_r]]}"}


def _vashya(boy_r: int, girl_r: int) -> dict:
    a, b = _VASHYA[boy_r], _VASHYA[girl_r]
    if a == b:
        got = 2.0
    elif {a, b} <= {"H", "Q", "W"}:
        got = 1.0
    else:
        got = 0.5
    return {"name": "Vashya", "obtained": got, "max": 2}


def _tara(boy_n: int, girl_n: int) -> dict:
    def good(frm: int, to: int) -> bool:
        rem = (((to - frm) % 27) + 1) % 9
        return rem not in (3, 5, 7)

    got = (1.5 if good(boy_n, girl_n) else 0.0) + (1.5 if good(girl_n, boy_n) else 0.0)
    return {"name": "Tara", "obtained": got, "max": 3}


def _yoni(boy_n: int, girl_n: int) -> dict:
    a, b = _YONI[boy_n], _YONI[girl_n]
    if a == b:
        got = 4.0
    elif frozenset((a, b)) in _YONI_ENEMIES:
        got = 0.0
    else:
        got = 2.0
    return {"name": "Yoni", "obtained": got, "max": 4, "note": f"{a} / {b}"}


def _graha_maitri(boy_r: int, girl_r: int) -> dict:
    la, lb = _RASI_LORD[boy_r], _RASI_LORD[girl_r]
    if la == lb:
        got = 5.0
    else:
        r1, r2 = _relation(la, lb), _relation(lb, la)
        pair = {r1, r2}
        if pair == {"friend"}:
            got = 5.0
        elif pair == {"friend", "neutral"}:
            got = 4.0
        elif pair == {"neutral"}:
            got = 3.0
        elif pair == {"friend", "enemy"}:
            got = 1.0
        elif pair == {"neutral", "enemy"}:
            got = 0.5
        else:
            got = 0.0
    return {"name": "Graha Maitri", "obtained": got, "max": 5, "note": f"{la} / {lb}"}


def _gana(boy_n: int, girl_n: int) -> dict:
    ga, gb = _GANA[boy_n], _GANA[girl_n]
    got = float(_GANA_SCORE[ga][gb])
    return {"name": "Gana", "obtained": got, "max": 6,
            "note": f"{_GANA_NAMES[ga]} / {_GANA_NAMES[gb]}"}


def _bhakoot(boy_r: int, girl_r: int) -> dict:
    a = ((girl_r - boy_r) % 12) + 1
    b = ((boy_r - girl_r) % 12) + 1
    bad = {frozenset((2, 12)), frozenset((5, 9)), frozenset((6, 8))}
    got = 0.0 if frozenset((a, b)) in bad else 7.0
    return {"name": "Bhakoot", "obtained": got, "max": 7,
            "dosha": got == 0.0}


def _nadi(boy_n: int, girl_n: int) -> dict:
    same = _NADI[boy_n] == _NADI[girl_n]
    return {"name": "Nadi", "obtained": 0.0 if same else 8.0, "max": 8,
            "dosha": same, "note": f"{_NADI_NAMES[_NADI[boy_n]]} / {_NADI_NAMES[_NADI[girl_n]]}"}


def guna_milan(
    boy_nak: int, boy_rasi: int, girl_nak: int, girl_rasi: int
) -> dict:
    """Compute the 8-koota (36-point) compatibility between two Moon positions."""
    kootas = [
        _varna(boy_rasi, girl_rasi),
        _vashya(boy_rasi, girl_rasi),
        _tara(boy_nak, girl_nak),
        _yoni(boy_nak, girl_nak),
        _graha_maitri(boy_rasi, girl_rasi),
        _gana(boy_nak, girl_nak),
        _bhakoot(boy_rasi, girl_rasi),
        _nadi(boy_nak, girl_nak),
    ]
    total = sum(k["obtained"] for k in kootas)
    if total >= 28:
        verdict = "Excellent match"
    elif total >= 18:
        verdict = "Acceptable match"
    elif total >= 14:
        verdict = "Below average — review carefully"
    else:
        verdict = "Not recommended"
    doshas = [k["name"] for k in kootas if k.get("dosha")]
    return {
        "kootas": kootas,
        "total": round(total, 1),
        "max": 36,
        "verdict": verdict,
        "doshas": doshas,
        "boy": {"nakshatra": NAKSHATRAS[boy_nak], "rasi": SIGNS[boy_rasi]},
        "girl": {"nakshatra": NAKSHATRAS[girl_nak], "rasi": SIGNS[girl_rasi]},
    }
