#!/usr/bin/env python3
"""
Gender inference for Iranian victim YAML files.
Uses common Persian/Kurdish/Baluchi first names to infer gender.
Updates YAML files in-place, only setting gender when confident.
"""

import os
import re
import sys

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "victims")

# Common female Persian/Kurdish/Baluchi names
FEMALE_NAMES = {
    # Very common
    "mahsa", "nika", "hadis", "sarina", "ghazaleh", "hannaneh", "minoo",
    "fereshteh", "nasrin", "parisa", "setareh", "aylar", "maryam", "zahra",
    "fatemeh", "fatimeh", "sara", "leila", "layla", "neda", "shirin",
    "roya", "samira", "sepideh", "azadeh", "mina", "elnaz", "elham",
    "shabnam", "bahareh", "niloufar", "golnar", "golnaz", "mahnaz",
    "faranak", "fariba", "farzaneh", "forough", "giti", "haleh",
    "hengameh", "jamileh", "kobra", "laleh", "mahboubeh", "mahin",
    "maliheh", "mansoureh", "marjan", "masoomeh", "massoumeh", "mehrnoush",
    "nahid", "narges", "nargess", "nazanin", "nazgol", "niloofar",
    "nooshin", "pantea", "parastoo", "parvaneh", "pegah", "poupak",
    "raheleh", "reyhaneh", "roghayeh", "roshana", "roxana", "sahar",
    "sanaz", "soudabeh", "shohreh", "tahereh", "yasaman", "yalda",
    "ziba", "zohreh", "vida", "simin", "somayyeh", "soheila",
    "ameneh", "anahita", "anis", "azar", "behnaz", "darya",
    "delaram", "dorsa", "elahe", "elaheh", "fahimeh", "hajar",
    "homa", "khadijeh", "kimia", "mahdieh", "mahshid", "mahvash",
    "marzieh", "monireh", "mozhdeh", "nadia", "nahal", "negin",
    "nesa", "niki", "pari", "parvin", "razieh", "rezvan",
    "saeedeh", "sakineh", "salomeh", "sedigheh", "shahin", "sharareh",
    "shiva", "shokoufeh", "sima", "sogand", "solmaz", "soraya",
    "taraneh", "tina", "touba", "yasi", "zeinab", "zhina",
    "aysan", "ermita", "zhila", "jina",
    "maria", "matine", "parmis",
    # Second pass from data analysis
    "ainaz", "arnica", "asra", "atika", "diana", "hasti", "hediyeh",
    "lina", "mona", "mozhgan", "nagin", "nasim", "prasto",
    "sadaf", "seyyedeh", "simeh", "sopher",
}

# Common male Persian/Kurdish/Baluchi names
MALE_NAMES = {
    # Very common
    "mohammad", "ali", "amir", "hossein", "mehdi", "reza", "javad",
    "ahmad", "hamid", "hassan", "hasan", "saeed", "masoud", "majid",
    "mostafa", "morteza", "naser", "omid", "peyman", "pouya",
    "rahim", "rasoul", "sadegh", "sajjad", "shahram", "vahid",
    "yousef", "yusuf", "mohsen", "behnam", "behrouz", "dariush",
    "daryoush", "ebrahim", "ehsan", "esmail", "farhad", "fardin",
    "farzad", "hamed", "iman", "iraj", "kamran", "karim",
    "kazem", "kourosh", "mahmoud", "manouchehr", "mansour",
    "mojtaba", "nima", "navid", "parviz", "payam", "pejman",
    "pedram", "rouhollah", "saman", "sasan", "shahin", "shahab",
    "siamak", "sohrab", "soroush", "taghi", "vahid",
    # Additional common names
    "abolfazl", "abolfazi", "abdolfazl", "abdollah", "abdolsamad",
    "alireza", "amirhossein", "arash", "arman", "arsalan", "arvin",
    "ayoub", "babak", "bahman", "bahram", "balal", "bijan",
    "changiz", "daniyal", "davoud", "diako", "emad", "erfan",
    "faramarz", "farjad", "fouad", "gholamreza", "habib", "hamidreza",
    "hosseinali", "jafar", "jalal", "jamshid", "kanaan",
    "kian", "kianoush", "mahdi", "maziar", "mehrab", "mehran",
    "mehrdad", "milad", "mobin", "mohammadreza", "mohammadamin",
    "mokhtar", "mukhtar", "musa", "nasser", "nematollah",
    "nowroz", "pouyan", "saeid", "saleh", "samad", "sina",
    "yasin", "yaser", "zakaria", "zaniar", "fereydoun",
    "mohammad-amin", "amir-hossein", "amir-ali", "amir-mehdi",
    "seyyed", "seyed", "lal", "amin", "danesh", "parza",
    "sadreddin", "abdolsamad",
    # Baluchi/Sistan names
    "khoda", "khodabakhsh", "noor", "nour", "issa",
    # Additional from data analysis
    "abdol", "matin", "afshin", "aref", "abdulghafoor", "farzin",
    "ramin", "omran", "farid", "jalil", "abdul", "suleiman",
    "abdorrahman", "abdolrahman", "jamal", "mustafa", "sepehr",
    "danial", "daniel", "shoaib", "keyvan", "fereydon", "kamal",
    "abdolsalam", "ibrahim", "aminollah", "milan", "dastan",
    "hamin", "vahed", "kumar", "riassat", "zacharie", "shahli", "sohn",
    # Second pass from data analysis
    "abbas", "abdolghader", "abdolmalek", "abdolmanan", "abdullah",
    "abu", "abubakr", "adel", "aminullah", "arian", "armin", "artin",
    "azim", "aziz", "azizollah", "azizullah", "behzad", "ezzatollah",
    "faieq", "gholam", "gungo", "hadi", "hamzeh", "heydar", "hemin",
    "imran", "ismail", "jaber", "jabir", "kambiz", "khalil", "khodanour",
    "khodanur", "komeil", "mahuddin", "maisam", "mehrshad", "mehrzad",
    "messam", "mohammed", "mohiuddin", "momen", "motalleb", "moulavi",
    "murad", "nader", "najm", "najmuddin", "omar", "oveis", "parsa",
    "poriya", "rafi", "rouzbeh", "saamer", "salahuddin", "salman",
    "samer", "shahou", "siavash", "thamer", "yahya", "yasir", "younes",
    "yunus", "zolfaghar",
    # Third pass — remaining unknowns
    "mehdis", "kabdani", "mehrgan", "zia", "mirshekar", "mirshekar(i)",
    "sodeys",
}

# Names that are ambiguous or unisex — skip these
AMBIGUOUS_NAMES = {"shahin"}

# Remove ambiguous names from both sets
FEMALE_NAMES -= AMBIGUOUS_NAMES
MALE_NAMES -= AMBIGUOUS_NAMES


def extract_first_name(name_latin: str) -> str:
    """Extract the first name from a full Latin name."""
    # Remove quotes
    name = name_latin.strip().strip('"').strip("'")
    # Handle parentheticals
    name = re.sub(r'\s*\(.*?\)', '', name)
    # Check for "son of" / "Sohn von" pattern (clearly male)
    if "son of" in name.lower() or "sohn von" in name.lower():
        return "son_of"
    # First word is the first name
    parts = name.split()
    if not parts:
        return ""
    return parts[0].lower().rstrip(",")


def infer_gender(first_name: str) -> str | None:
    """Return 'male', 'female', or None if unknown."""
    if first_name == "son_of":
        return "male"
    if first_name in FEMALE_NAMES:
        return "female"
    if first_name in MALE_NAMES:
        return "male"
    return None


def process_yaml_file(filepath: str) -> str | None:
    """Update gender field in a YAML file. Returns inferred gender or None."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract name_latin
    match = re.search(r'^name_latin:\s*"?(.+?)"?\s*$', content, re.MULTILINE)
    if not match:
        return None

    name_latin = match.group(1)
    first_name = extract_first_name(name_latin)
    if not first_name:
        return None

    gender = infer_gender(first_name)
    if gender is None:
        return None

    # Replace gender: null with the inferred gender
    new_content = re.sub(
        r'^gender:\s*null\s*$',
        f'gender: {gender}',
        content,
        count=1,
        flags=re.MULTILINE,
    )

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return gender

    # Check if gender is already set
    gender_match = re.search(r'^gender:\s*(\S+)', content, re.MULTILINE)
    if gender_match and gender_match.group(1) != "null":
        return None  # Already set, don't overwrite

    return None


def main():
    stats = {"male": 0, "female": 0, "unknown": 0, "total": 0, "skipped": 0}

    for root, dirs, files in os.walk(DATA_DIR):
        for filename in sorted(files):
            if not filename.endswith(".yaml") or filename.startswith("_"):
                continue

            filepath = os.path.join(root, filename)
            stats["total"] += 1

            result = process_yaml_file(filepath)
            if result == "male":
                stats["male"] += 1
            elif result == "female":
                stats["female"] += 1
            else:
                stats["unknown"] += 1

    print(f"\nGender Inference Results:")
    print(f"  Total files:  {stats['total']}")
    print(f"  Male:         {stats['male']}")
    print(f"  Female:       {stats['female']}")
    print(f"  Unknown:      {stats['unknown']}")
    print(f"  Coverage:     {(stats['male'] + stats['female']) / stats['total'] * 100:.1f}%")


if __name__ == "__main__":
    main()
