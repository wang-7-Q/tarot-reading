import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ReadingProvider } from './context/ReadingContext';
import HomePage from './pages/HomePage';
import RecommendPage from './pages/RecommendPage';
import DrawPage from './pages/DrawPage';
import InterpretPage from './pages/InterpretPage';

export default function App() {
  return (
    <BrowserRouter>
      <ReadingProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/recommend" element={<RecommendPage />} />
          <Route path="/draw" element={<DrawPage />} />
          <Route path="/interpret" element={<InterpretPage />} />
        </Routes>
      </ReadingProvider>
    </BrowserRouter>
  );
}
