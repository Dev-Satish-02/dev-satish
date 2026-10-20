import StaircaseHero from '../components/StaircaseHero';
import Experience from '../components/Experience';
import Projects from '../components/Projects';
import Skills from '../components/Skills';
import Writing from '../components/Writing';
import Contact from '../components/Contact';
import Seam from '../components/Seam';
import { useActiveNav, useScrollReveal } from '../hooks/usePortfolioEffects';

export default function Home() {
  useScrollReveal('home');
  useActiveNav();

  return (
    <main id="main">
      <StaircaseHero />
      <Experience />
      <Seam from="summer" to="autumn" kind="train" />
      <Projects />
      <Seam from="autumn" to="winter" kind="leaves" />
      <Skills />
      <Seam from="winter" to="night" kind="dusk" />
      <Writing />
      <Contact />
    </main>
  );
}
