export interface TarotCard {
  id: string;
  name_zh: string;
  name_en: string;
  arcana: string;
  suit: string | null;
  number: number;
  keywords_upright: string[];
  keywords_reversed: string[];
  description: string;
}

export interface Position {
  index: number;
  label: string;
  meaning: string;
}

export interface Spread {
  id: string;
  name_zh: string;
  description: string;
  card_count: number;
  positions: Position[];
  tags: string[];
}

export interface RecommendRequest {
  question: string;
}

export interface RecommendResponse {
  spreads: Spread[];
  keywords: string[];
}

export interface DrawnCard {
  position_index: number;
  card_id: string;
  reversed: boolean;
}

export interface DrawnCardWithData {
  position_index: number;
  card: TarotCard;
  reversed: boolean;
}

export interface InterpretRequest {
  question: string;
  spread_id: string;
  cards: DrawnCard[];
}

export interface IndividualReading {
  position: string;
  card: TarotCard;
  reversed: boolean;
  reading: string;
}

export interface Guidance {
  key_points: string[];
  cautions: string[];
}

export interface InterpretResponse {
  narrative: string;
  individual: IndividualReading[];
  guidance: Guidance;
}

export interface ReadingSession {
  question: string;
  spread: Spread | null;
  drawnCards: DrawnCardWithData[];
  interpretation: InterpretResponse | null;
}
