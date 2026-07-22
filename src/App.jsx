import Header from './components/Header';
import Hero from './components/Hero';
import Experience from './components/Experience';
import Projects from './components/Projects';
import Skills from './components/Skills';
import Blog from './components/Blog';
import Contact from './components/Contact';
import Footer from './components/Footer';
import CustomCursor from './components/CustomCursor';
import { CursorProvider } from './hooks/useCursor';
import { useActiveNav, useScrollReveal } from './hooks/usePortfolioEffects';

export default function App() {
  useScrollReveal();
  useActiveNav();

  return (
    <CursorProvider>
      <CustomCursor />
      <Header />
      <Hero />
      <Experience />
      <Projects />
      <Skills />
      <Blog />
      <Contact />
      <Footer />
    </CursorProvider>
  );
}
