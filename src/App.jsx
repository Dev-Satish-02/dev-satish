import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Blog from './pages/Blog';
import Post from './pages/Post';
import Header from './components/Header';
import Footer from './components/Footer';
import Intro from './components/Intro';
import RouteFlash from './components/RouteFlash';
import CustomCursor from './components/CustomCursor';
import { CursorProvider } from './hooks/useCursor';
import { useScrollToHash } from './hooks/usePortfolioEffects';

function ScrollManager() {
  useScrollToHash();
  return null;
}

export default function App() {
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

  return (
    <CursorProvider>
      <CustomCursor />
      <BrowserRouter basename={basePath}>
        <Intro />
        <RouteFlash />
        <ScrollManager />
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:category" element={<Blog />} />
          <Route path="/blog/:category/:slug" element={<Post />} />
          <Route path="*" element={<Home />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </CursorProvider>
  );
}
