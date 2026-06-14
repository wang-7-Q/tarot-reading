import json
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from services.recommend_engine import recommend_spreads


def load_spreads():
    path = os.path.join(os.path.dirname(__file__), '..', 'data', 'spreads.json')
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)


def test_recommend_relationship_question():
    spreads = load_spreads()
    result = recommend_spreads("他喜欢我吗", spreads)
    assert len(result) >= 1
    assert len(result) <= 3
    assert result[0]["id"] == "relationship"


def test_recommend_career_question():
    spreads = load_spreads()
    result = recommend_spreads("我该不该跳槽", spreads)
    assert len(result) >= 1
    ids = [s["id"] for s in result]
    assert "celtic-cross" in ids or "three-card" in ids


def test_recommend_default_for_vague_question():
    spreads = load_spreads()
    result = recommend_spreads("今天怎么样", spreads)
    assert len(result) >= 1
    assert result[0]["id"] in ["three-card", "single-card"]


def test_recommend_returns_max_3():
    spreads = load_spreads()
    result = recommend_spreads("我应该怎么做才能更幸福", spreads)
    assert len(result) <= 3


def test_recommend_empty_question():
    spreads = load_spreads()
    result = recommend_spreads("", spreads)
    assert len(result) >= 1
