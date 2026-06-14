from pydantic import BaseModel
from typing import Optional


class Position(BaseModel):
    index: int
    label: str
    meaning: str


class Spread(BaseModel):
    id: str
    name_zh: str
    description: str
    card_count: int
    positions: list[Position]
    tags: list[str]


class TarotCard(BaseModel):
    id: str
    name_zh: str
    name_en: str
    arcana: str
    suit: Optional[str] = None
    number: int
    keywords_upright: list[str]
    keywords_reversed: list[str]
    description: str


class RecommendRequest(BaseModel):
    question: str


class RecommendResponse(BaseModel):
    spreads: list[Spread]
    keywords: list[str]


class DrawnCard(BaseModel):
    position_index: int
    card_id: str
    reversed: bool


class InterpretRequest(BaseModel):
    question: str
    spread_id: str
    cards: list[DrawnCard]


class IndividualReading(BaseModel):
    position: str
    card: TarotCard
    reversed: bool
    reading: str


class Guidance(BaseModel):
    key_points: list[str]
    cautions: list[str]


class InterpretResponse(BaseModel):
    narrative: str
    individual: list[IndividualReading]
    guidance: Guidance
