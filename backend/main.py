"""Tarot Reading API — FastAPI application."""

import json
import os
import random
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from models.schemas import (
    RecommendRequest,
    RecommendResponse,
    InterpretRequest,
    InterpretResponse,
    Spread,
    TarotCard,
)
from services.recommend_engine import recommend_spreads
from services.interpreter import interpret_with_claude

load_dotenv()

app = FastAPI(title="Tarot Reading API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_DIR = Path(__file__).parent / "data"

_cards: list[dict] = []
_spreads: list[dict] = []
_cards_map: dict[str, dict] = {}
_spreads_map: dict[str, dict] = {}


def _load_data():
    global _cards, _spreads, _cards_map, _spreads_map
    with open(DATA_DIR / "cards.json", "r", encoding="utf-8") as f:
        _cards = json.load(f)
        _cards_map = {c["id"]: c for c in _cards}
    with open(DATA_DIR / "spreads.json", "r", encoding="utf-8") as f:
        _spreads = json.load(f)
        _spreads_map = {s["id"]: s for s in _spreads}


_load_data()


@app.get("/api/cards")
async def get_cards() -> list[TarotCard]:
    """Return all 78 tarot cards."""
    return [TarotCard(**c) for c in _cards]


@app.get("/api/spreads")
async def get_spreads() -> list[Spread]:
    """Return all available spreads."""
    return [Spread(**s) for s in _spreads]


@app.post("/api/recommend")
async def recommend(req: RecommendRequest) -> RecommendResponse:
    """Recommend spreads based on the user's question."""
    recommended = recommend_spreads(req.question, _spreads)
    keywords = _extract_keywords(req.question)
    return RecommendResponse(
        spreads=[Spread(**s) for s in recommended],
        keywords=keywords,
    )


@app.post("/api/interpret")
async def interpret(req: InterpretRequest) -> InterpretResponse:
    """Generate AI interpretation for drawn cards."""
    spread = _spreads_map.get(req.spread_id)
    if not spread:
        raise HTTPException(status_code=404, detail=f"Spread '{req.spread_id}' not found")

    if len(req.cards) != spread["card_count"]:
        raise HTTPException(
            status_code=400,
            detail=f"Spread '{req.spread_id}' requires {spread['card_count']} cards, got {len(req.cards)}",
        )

    for dc in req.cards:
        if dc.position_index < 0 or dc.position_index >= spread["card_count"]:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid position_index: {dc.position_index}",
            )
        if dc.card_id not in _cards_map:
            raise HTTPException(
                status_code=400,
                detail=f"Unknown card_id: {dc.card_id}",
            )

    try:
        result = await interpret_with_claude(
            req.question,
            spread,
            [dc.model_dump() for dc in req.cards],
            _cards_map,
        )
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Claude API error: {str(e)}")

    return InterpretResponse(**result)


@app.get("/api/draw")
async def draw_cards(spread_id: str, count: int | None = None):
    """Randomly draw cards for a spread."""
    spread = _spreads_map.get(spread_id)
    if not spread:
        raise HTTPException(status_code=404, detail=f"Spread '{spread_id}' not found")

    n = count or spread["card_count"]
    drawn_indices = random.sample(range(len(_cards)), n)
    cards = []
    for i, idx in enumerate(drawn_indices):
        cards.append({
            "position_index": i,
            "card": TarotCard(**_cards[idx]),
            "reversed": random.random() < 0.3,
        })
    return {"cards": cards, "spread": Spread(**spread)}


def _extract_keywords(question: str) -> list[str]:
    """Extract matching category keywords from the question."""
    from services.recommend_engine import KEYWORD_TAG_MAP

    found_tags = set()
    for keyword, tags in KEYWORD_TAG_MAP.items():
        if keyword in question:
            found_tags.update(tags)
    return list(found_tags) if found_tags else ["通用"]


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
