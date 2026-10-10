import Hero from '../components/Hero';
import Experience from '../components/Experience';
import Projects from '../components/Projects';
import Skills from '../components/Skills';
import Writing from '../components/Writing';
import Contact from '../components/Contact';
import { useActiveNav, useScrollReveal } from '../hooks/usePortfolioEffects';

export default function Home() {
  useScrollReveal('home');
  useActiveNav();

  return (
    <main id="main">
      <Hero />
      <Experience />
      <Projects />
      <Skills />
      <Writing />
      <Contact />
    </main>
  );
}
