"""Province mapping — shared across all source plugins."""

from __future__ import annotations


# City/location → Province mapping for Iran
PROVINCE_MAP: dict[str, str] = {
    "tehran": "Tehran",
    "isfahan": "Isfahan",
    "esfahan": "Isfahan",
    "mashhad": "Khorasan-e Razavi",
    "shiraz": "Fars",
    "tabriz": "East Azerbaijan",
    "ahvaz": "Khuzestan",
    "ahwaz": "Khuzestan",
    "kermanshah": "Kermanshah",
    "zahedan": "Sistan va Baluchestan",
    "sanandaj": "Kurdistan",
    "rasht": "Gilan",
    "karaj": "Alborz",
    "qom": "Qom",
    "arak": "Markazi",
    "hamadan": "Hamadan",
    "hamedan": "Hamadan",
    "yazd": "Yazd",
    "kerman": "Kerman",
    "urmia": "West Azerbaijan",
    "orumiyeh": "West Azerbaijan",
    "bandar abbas": "Hormozgan",
    "gorgan": "Golestan",
    "sari": "Mazandaran",
    "birjand": "South Khorasan",
    "bojnurd": "North Khorasan",
    "ilam": "Ilam",
    "khorramabad": "Lorestan",
    "bushehr": "Bushehr",
    "semnan": "Semnan",
    "shahr-e kord": "Chaharmahal and Bakhtiari",
    "shahrekord": "Chaharmahal and Bakhtiari",
    "farsan": "Chaharmahal and Bakhtiari",
    "yasuj": "Kohgiluyeh and Boyer-Ahmad",
    "zanjan": "Zanjan",
    "ardabil": "Ardabil",
    "saqqez": "Kurdistan",
    "mahabad": "West Azerbaijan",
    "bukan": "West Azerbaijan",
    "izeh": "Khuzestan",
    "dezful": "Khuzestan",
    "abadan": "Khuzestan",
    "behbahan": "Khuzestan",
    "andimeshk": "Khuzestan",
    "javanrud": "Kermanshah",
    "marivan": "Kurdistan",
    "piranshahr": "West Azerbaijan",
    "oshnavieh": "West Azerbaijan",
    "bam": "Kerman",
    "jiroft": "Kerman",
    "rafsanjan": "Kerman",
    "sirjan": "Kerman",
    "chabahar": "Sistan va Baluchestan",
    "iranshahr": "Sistan va Baluchestan",
    "khash": "Sistan va Baluchestan",
    "saravan": "Sistan va Baluchestan",
    "amol": "Mazandaran",
    "babol": "Mazandaran",
    "nowshahr": "Mazandaran",
    "lahijan": "Gilan",
    "bandar anzali": "Gilan",
    "qazvin": "Qazvin",
    "saveh": "Markazi",
    "khomein": "Markazi",
    "neyshabur": "Khorasan-e Razavi",
    "nishapur": "Khorasan-e Razavi",
    "sabzevar": "Khorasan-e Razavi",
    "torbat-e heydarieh": "Khorasan-e Razavi",
    "varamin": "Tehran",
    "eslamshahr": "Tehran",
    "shahriar": "Tehran",
    "pakdasht": "Tehran",
}


def extract_province(location: str | None) -> str | None:
    """Extract province from a location string using city mapping.

    If the location string directly matches a known province name,
    return it as-is. Otherwise, try to find a city match.
    """
    if not location:
        return None

    loc_lower = location.lower().strip()

    # Direct province match
    known_provinces = {v.lower(): v for v in PROVINCE_MAP.values()}
    if loc_lower in known_provinces:
        return known_provinces[loc_lower]

    # City match
    for city, prov in PROVINCE_MAP.items():
        if city in loc_lower:
            return prov

    return None
