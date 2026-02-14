"""Tests for the shared province mapping utility."""

import pytest

from tools.enricher.utils.provinces import extract_province


class TestExtractProvince:
    def test_exact_city_match(self):
        assert extract_province("Tehran") == "Tehran"
        assert extract_province("Isfahan") == "Isfahan"
        assert extract_province("Mashhad") == "Khorasan-e Razavi"

    def test_case_insensitive(self):
        assert extract_province("tehran") == "Tehran"
        assert extract_province("ISFAHAN") == "Isfahan"

    def test_city_in_location_string(self):
        assert extract_province("near Tehran, Iran") == "Tehran"
        assert extract_province("Mashhad city center") == "Khorasan-e Razavi"

    def test_province_name_direct(self):
        assert extract_province("East Azerbaijan") == "East Azerbaijan"
        assert extract_province("Kurdistan") == "Kurdistan"

    def test_new_cities(self):
        """Cities added in the expanded mapping."""
        assert extract_province("Karaj") == "Alborz"
        assert extract_province("Saqqez") == "Kurdistan"
        assert extract_province("Farsan") == "Chaharmahal and Bakhtiari"
        assert extract_province("Chabahar") == "Sistan va Baluchestan"
        assert extract_province("Amol") == "Mazandaran"

    def test_none_input(self):
        assert extract_province(None) is None

    def test_empty_string(self):
        assert extract_province("") is None

    def test_unknown_location(self):
        assert extract_province("Unknown location") is None
        assert extract_province("Mars") is None
