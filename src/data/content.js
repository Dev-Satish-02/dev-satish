// All site copy and links live here.

export const PROFILE = {
  name: 'Dev Satish',
  title: 'Product · Strategy · Engineering',
  summary: 'Studying at BITS Pilani. I like turning problems into things people use.',
  location: 'BITS Pilani, Rajasthan, India',
  email: 'devsatish08@gmail.com',
  phone: '+91 75068 57789',
  phoneHref: 'tel:+917506857789',
  // Drop your PDF at public/resume.pdf. The contact section's résumé button stays hidden until it exists.
  resume: 'resume.pdf',
};

export const SOCIALS = [
  { label: 'GitHub', href: 'https://github.com/Dev-Satish-02' },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/dev-satish' },
  { label: 'Twitter', href: 'https://twitter.com/devtech08' },
];

// The 3D model on the hero. The first file that exists is used; otherwise a stand-in
// figure is drawn in code. See MODEL_GUIDE.md for the format.
export const MODEL = {
  candidates: ['models/hero.vrm', 'models/hero.glb'],
  height: 1.75, // the model is scaled so its bounding box is this tall (scene units ≈ metres)
  headNode: 'Head', // glTF only: node that tilts and looks at the cursor
  idleClip: 'Idle', // glTF only: animation clip to loop, if present
  toon: true, // glTF only: convert materials to cel shading with outlines
  frame: 'full', // 'full' body in view, or 'upper' (waist up)
};

// One scene per season, the way the series runs from spring break to the next spring.
export const SCENES = {
  hero: { no: '001', season: 'Spring' },
  experience: { no: '002', season: 'Summer' },
  projects: { no: '003', season: 'Autumn' },
  skills: { no: '004', season: 'Winter' },
  contact: { no: '005', season: 'Next episode' },
};

export const NAV_LINKS = [
  { hash: 'experience', label: 'Experience' },
  { hash: 'projects', label: 'Projects' },
  { hash: 'skills', label: 'Skills' },
  { to: '/blog', label: 'Blog' },
  { hash: 'contact', label: 'Contact' },
];

export const EXPERIENCE = [
  {
    role: 'Python Intern',
    company: 'Sysstra',
    date: 'Jul 2025 – Nov 2025',
    domain: 'Fintech',
    bullets: [
      'Built dividend-based trading strategies that rebalance portfolios systematically.',
      'Designed the data pipeline (Redis, AWS S3) behind high-frequency analysis, cutting its latency.',
    ],
    tags: ['Python', 'Redis', 'AWS S3'],
  },
  {
    role: 'Machine Learning Intern',
    company: 'Aditya Birla Group',
    date: 'May 2025 – Jul 2025',
    domain: 'Manufacturing',
    bullets: [
      'Deployed a corrosion-detection model, trained on 4,000+ images, that flags pipe defects from live camera feeds.',
      'Built a browser app for pipe detection and predictive fouling analysis.',
    ],
    tags: ['TensorFlow.js', 'Python', 'OpenCV'],
  },
  {
    role: 'Web Development Intern',
    company: 'GPLAN',
    date: 'Jan 2025 – Mar 2025',
    domain: 'Architecture software',
    bullets: [
      'Built an architectural layout tool that generates floor plans using graph theory.',
      'Designed its interactive interface for real-time layout visualisation.',
    ],
    tags: ['React', 'D3.js', 'Redux'],
  },
  {
    role: 'Software Development Intern',
    company: 'Anitum',
    date: 'Dec 2024 – Jan 2025',
    domain: 'Business software',
    bullets: [
      'Delivered ERP systems for education and manufacturing clients.',
      'Added computer-vision features to client dashboards.',
    ],
    tags: ['Flask', 'SQLite', 'Chart.js'],
  },
];

// Links set to null are hidden. Fill them in when you have them.
export const PROJECTS = [
  {
    name: 'BITS Mess Portal',
    kind: 'Campus product',
    blurb: 'Menus, ratings and feedback for the BITS Pilani mess, launched to the whole campus.',
    metric: '2,000+ users in 7 days',
    stack: ['React', 'REST API'],
    links: [],
  },
  {
    name: 'Readmebot',
    kind: 'Developer tool',
    blurb: 'A command-line tool that reads a codebase and writes its README with GPT-4, in under a second.',
    metric: '500+ downloads / week',
    stack: ['Node.js', 'OpenAI'],
    links: [{ label: 'npm', href: 'https://www.npmjs.com/package/readmebot' }],
  },
  {
    name: 'Yearbook Portal',
    kind: 'Community product',
    blurb: 'An online yearbook for a graduating class: profiles, messages and memories in one place.',
    metric: 'Live',
    stack: ['PostgreSQL', 'Express', 'React', 'Node.js'],
    links: [],
  },
  {
    name: 'Nirmaan NGO',
    kind: 'Non-profit website',
    blurb: 'Digital outreach site for Nirmaan, a student-run NGO.',
    metric: 'Shipped to production',
    stack: ['Angular', 'TypeScript', 'Tailwind'],
    links: [],
  },
];

export const EDUCATION = [
  { degree: 'B.E. Mechanical Engineering', school: 'BITS Pilani', date: 'Aug 2023 – Present' },
  { degree: 'M.Sc. Biological Sciences', school: 'BITS Pilani', date: 'Aug 2023 – Present · Dual degree' },
];

// Edit freely: the first group comes from what you've written about and shipped.
export const SKILL_GROUPS = [
  { title: 'Product & strategy', items: ['Product launches', 'Roadmapping', 'Go-to-market planning', 'Launch metrics', 'Writing'] },
  { title: 'Data & analysis', items: ['Python', 'SQL (PostgreSQL, MySQL)', 'Machine learning', 'Data visualisation (D3.js, Chart.js)'] },
  { title: 'Engineering', items: ['JavaScript / TypeScript', 'React', 'Node.js', 'Flask', 'AWS', 'C / C++', 'Java'] },
  { title: 'Certifications', items: ['Machine Learning Specialization (Stanford, DeepLearning.AI)', 'AWS DevOps'] },
];

// Blog categories borrow a season's colour.
export const CATEGORY_SEASON = {
  'book-review': 'winter',
  product: 'spring',
  strategy: 'autumn',
};
