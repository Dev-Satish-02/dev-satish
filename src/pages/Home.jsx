import Hero from '../components/Hero';
import Experience from '../components/Experience';
import Projects from '../components/Projects';
import Skills from '../components/Skills';
import Blog from '../components/Blog';
import Contact from '../components/Contact';
import FlashCard from '../components/FlashCard';
import { INTERSTITIALS } from '../data/content';
import { useActiveNav, useScrollReveal } from '../hooks/usePortfolioEffects';

export default function Home() {
  useScrollReveal('home');
  useActiveNav();

  return (
    <main>
      <Hero />
      <FlashCard {...INTERSTITIALS.afterHero} left="001" right="開発物語" />
      <Experience />
      <FlashCard {...INTERSTITIALS.afterExperience} left="002" right="其ノ貳" />
      <Projects />
      <FlashCard {...INTERSTITIALS.afterProjects} left="003" right="其ノ參" />
      <Skills />
      <Blog />
      <Contact />
    </main>
  );
}
