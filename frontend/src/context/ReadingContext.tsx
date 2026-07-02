/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReadingSession, Spread, DrawnCardWithData, InterpretResponse } from '../types';

interface ReadingContextType {
  session: ReadingSession;
  setQuestion: (question: string) => void;
  setSpread: (spread: Spread) => void;
  setDrawnCards: (cards: DrawnCardWithData[]) => void;
  setInterpretation: (result: InterpretResponse) => void;
  resetSession: () => void;
}

const initialSession: ReadingSession = {
  question: '',
  spread: null,
  drawnCards: [],
  interpretation: null,
};

const ReadingContext = createContext<ReadingContextType | null>(null);

export function ReadingProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<ReadingSession>(initialSession);

  const setQuestion = useCallback((question: string) => {
    setSession(prev => ({ ...prev, question }));
  }, []);

  const setSpread = useCallback((spread: Spread) => {
    setSession(prev => ({ ...prev, spread }));
  }, []);

  const setDrawnCards = useCallback((cards: DrawnCardWithData[]) => {
    setSession(prev => ({ ...prev, drawnCards: cards }));
  }, []);

  const setInterpretation = useCallback((result: InterpretResponse) => {
    setSession(prev => ({ ...prev, interpretation: result }));
  }, []);

  const resetSession = useCallback(() => {
    setSession(initialSession);
  }, []);

  return (
    <ReadingContext.Provider
      value={{ session, setQuestion, setSpread, setDrawnCards, setInterpretation, resetSession }}
    >
      {children}
    </ReadingContext.Provider>
  );
}

export function useReading() {
  const ctx = useContext(ReadingContext);
  if (!ctx) throw new Error('useReading must be used within ReadingProvider');
  return ctx;
}
