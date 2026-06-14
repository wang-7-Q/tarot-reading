import type {
  TarotCard,
  Spread,
  DrawnCard,
  RecommendRequest,
  RecommendResponse,
  InterpretRequest,
  InterpretResponse,
  DrawnCardWithData,
} from '../types';

const API_BASE = 'http://localhost:8000/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      ...options,
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`API ${res.status}: ${body}`);
    }
    return res.json();
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchCards(): Promise<TarotCard[]> {
  return request<TarotCard[]>('/cards');
}

export async function fetchSpreads(): Promise<Spread[]> {
  return request<Spread[]>('/spreads');
}

export async function recommendSpreads(question: string): Promise<RecommendResponse> {
  return request<RecommendResponse>('/recommend', {
    method: 'POST',
    body: JSON.stringify({ question } as RecommendRequest),
  });
}

export async function interpretReading(
  question: string,
  spreadId: string,
  cards: DrawnCard[]
): Promise<InterpretResponse> {
  return request<InterpretResponse>('/interpret', {
    method: 'POST',
    body: JSON.stringify({
      question,
      spread_id: spreadId,
      cards,
    } as InterpretRequest),
  });
}

export async function drawCards(
  spreadId: string,
  count?: number
): Promise<{ cards: DrawnCardWithData[]; spread: Spread }> {
  const params = new URLSearchParams({ spread_id: spreadId });
  if (count) params.set('count', String(count));
  return request<{ cards: DrawnCardWithData[]; spread: Spread }>(`/draw?${params}`);
}
