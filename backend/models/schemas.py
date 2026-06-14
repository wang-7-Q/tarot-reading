from pydantic import BaseModel, field_validator
from typing import Literal, Optional


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

    @field_validator("card_count")
    @classmethod
    def card_count_matches_positions(cls, v: int, info) -> int:
        positions = info.data.get("positions")
        if positions is not None and len(positions) != v:
            raise ValueError(
                f"card_count ({v}) does not match number of positions ({len(positions)})"
            )
        return v


class TarotCard(BaseModel):
    id: str
    name_zh: str
    name_en: str
    arcana: Literal["major", "minor"]
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
