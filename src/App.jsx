import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Blog from './pages/Blog';
import Post from './pages/Post';
import Header from './components/Header';
import CustomCursor from './components/CustomCursor';
import { CursorProvider } from './hooks/useCursor';

export default function App() {
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

  return (
    <CursorProvider>
      <CustomCursor />
      <BrowserRouter basename={basePath}>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:category" element={<Blog />} />
          <Route path="/blog/:category/:slug" element={<Post />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </CursorProvider>
  );
}
