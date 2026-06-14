"""Tarot Reading API — FastAPI application."""

import json
import logging
import os
import random
import sys
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
from services.recommend_engine import recommend_spreads, KEYWORD_TAG_MAP
from services.interpreter import interpret_with_claude

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
)
logger = logging.getLogger(__name__)

load_dotenv()

app = FastAPI(title="Tarot Reading API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv(
        "CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"
    ).split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_DIR = Path(__file__).parent / "data"

_cards: list[dict] = []
_spreads: list[dict] = []
_cards_map: dict[str, dict] = {}
_spreads_map: dict[str, dict] = {}


def _load_data() -> None:
    """Load cards and spreads from disk with validation."""
    cards_path = DATA_DIR / "cards.json"
    spreads_path = DATA_DIR / "spreads.json"

    missing = [p for p in (cards_path, spreads_path) if not p.exists()]
    if missing:
        raise FileNotFoundError(f"Missing data files: {missing}")

    with open(cards_path, "r", encoding="utf-8") as f:
        cards = json.load(f)
    with open(spreads_path, "r", encoding="utf-8") as f:
        spreads = json.load(f)

    card_ids = [c["id"] for c in cards]
    dupes = {cid for cid in card_ids if card_ids.count(cid) > 1}
    if dupes:
        raise ValueError(f"Duplicate card IDs in cards.json: {dupes}")

    global _cards, _spreads, _cards_map, _spreads_map
    _cards = cards
    _spreads = spreads
    _cards_map = {c["id"]: c for c in cards}
    _spreads_map = {s["id"]: s for s in spreads}
    logger.info("Loaded %d cards and %d spreads", len(cards), len(spreads))


try:
    _load_data()
except Exception as e:
    logger.critical("Failed to load data: %s", e)
    sys.exit(1)


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
        logger.error("Interpretation value error: %s", e)
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        logger.error("Claude API error: %s", e, exc_info=True)
        raise HTTPException(status_code=502, detail=f"Claude API error: {str(e)}")

    return InterpretResponse(**result)


@app.get("/api/draw")
async def draw_cards(spread_id: str, count: int | None = None):
    """Randomly draw cards for a spread."""
    spread = _spreads_map.get(spread_id)
    if not spread:
        raise HTTPException(status_code=404, detail=f"Spread '{spread_id}' not found")

    n = count or spread["card_count"]
    if n < 1:
        raise HTTPException(status_code=400, detail=f"Count must be at least 1, got {n}")
    if n > len(_cards):
        raise HTTPException(
            status_code=400,
            detail=f"Requested {n} cards but only {len(_cards)} available",
        )

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
    found_tags: set[str] = set()
    for keyword, tags in KEYWORD_TAG_MAP.items():
        if keyword in question:
            found_tags.update(tags)
    return list(found_tags) if found_tags else ["通用"]


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
