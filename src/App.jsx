import { useEffect } from 'react';
import { BrowserRouter, HashRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Blog from './pages/Blog';
import Post from './pages/Post';
import Header from './components/Header';
import Footer from './components/Footer';
import Loader from './components/Loader';
import Cursor from './components/Cursor';
import { introDone, useFullMotion, useStore } from './lib/store';
import { useScrollToHash } from './hooks/usePortfolioEffects';

// The phone preview is served from a host without SPA fallbacks, so it routes with the hash.
const Router = import.meta.env.VITE_HASH_ROUTER ? HashRouter : BrowserRouter;

function ScrollManager() {
  useScrollToHash();
  return null;
}

function RootClasses() {
  const done = useStore(introDone);
  const motion = useFullMotion();
  useEffect(() => {
    document.documentElement.classList.toggle('intro-done', done);
    document.documentElement.classList.toggle('reduce-motion', !motion);
  }, [done, motion]);
  return null;
}

export default function App() {
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, '').replace(/^\.$/, '');

  return (
    <Router basename={import.meta.env.VITE_HASH_ROUTER ? undefined : basePath}>
      <RootClasses />
      <Loader />
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
      <Cursor />
    </Router>
  );
}
