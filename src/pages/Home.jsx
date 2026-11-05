import StaircaseHero from '../components/StaircaseHero';
import SceneStage, { STAGED, StageContext } from '../components/SceneStage';
import Experience from '../components/Experience';
import Projects from '../components/Projects';
import Skills from '../components/Skills';
import Writing from '../components/Writing';
import Contact from '../components/Contact';
import { useActiveNav, useScrollReveal } from '../hooks/usePortfolioEffects';
import '../styles/episodes.css';

export default function Home() {
  useScrollReveal('home');
  useActiveNav();

  return (
    <main id="main">
      <SceneStage />
      <StageContext.Provider value={STAGED}>
        <StaircaseHero />
        <Experience />
        <Projects />
        <Skills />
        <Writing />
        <Contact />
      </StageContext.Provider>
    </main>
  );
}
