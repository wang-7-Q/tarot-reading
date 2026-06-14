import json
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from services.interpreter import build_interpretation_prompt


def load_cards():
    path = os.path.join(os.path.dirname(__file__), '..', 'data', 'cards.json')
    with open(path, 'r', encoding='utf-8') as f:
        return {c["id"]: c for c in json.load(f)}


def load_spreads():
    path = os.path.join(os.path.dirname(__file__), '..', 'data', 'spreads.json')
    with open(path, 'r', encoding='utf-8') as f:
        return {s["id"]: s for s in json.load(f)}


def test_build_prompt_includes_question():
    cards = load_cards()
    spreads = load_spreads()
    drawn = [
        {"position_index": 0, "card_id": "fool", "reversed": False},
        {"position_index": 1, "card_id": "lovers", "reversed": True},
    ]
    sp = spreads["three-card"]
    prompt = build_interpretation_prompt("我的感情怎么样", sp, drawn, cards)
    assert "我的感情怎么样" in prompt


def test_build_prompt_includes_card_names():
    cards = load_cards()
    spreads = load_spreads()
    drawn = [{"position_index": 0, "card_id": "fool", "reversed": False}]
    sp = spreads["single-card"]
    prompt = build_interpretation_prompt("今天怎么样", sp, drawn, cards)
    assert "愚者" in prompt
    assert "The Fool" in prompt


def test_build_prompt_includes_position_labels():
    cards = load_cards()
    spreads = load_spreads()
    drawn = [
        {"position_index": 0, "card_id": "fool", "reversed": False},
        {"position_index": 1, "card_id": "lovers", "reversed": True},
        {"position_index": 2, "card_id": "star", "reversed": False},
    ]
    sp = spreads["three-card"]
    prompt = build_interpretation_prompt("test", sp, drawn, cards)
    assert "过去" in prompt
    assert "现在" in prompt
    assert "未来" in prompt


def test_build_prompt_includes_reversed_marker():
    cards = load_cards()
    spreads = load_spreads()
    drawn = [{"position_index": 0, "card_id": "lovers", "reversed": True}]
    sp = spreads["single-card"]
    prompt = build_interpretation_prompt("test", sp, drawn, cards)
    assert "逆位" in prompt


def test_build_prompt_includes_output_format_instruction():
    cards = load_cards()
    spreads = load_spreads()
    drawn = [{"position_index": 0, "card_id": "fool", "reversed": False}]
    sp = spreads["single-card"]
    prompt = build_interpretation_prompt("test", sp, drawn, cards)
    assert "narrative" in prompt.lower()
    assert "json" in prompt.lower()
