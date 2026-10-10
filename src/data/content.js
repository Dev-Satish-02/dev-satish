// All site copy and links live here.

export const PROFILE = {
  name: 'Dev Satish',
  title: 'Full Stack Engineer & AI Builder',
  summary:
    'I build ML pipelines, trading systems and full-stack products. Four internships across fintech, industrial ML and web, while studying Mechanical Engineering and Biological Sciences at BITS Pilani.',
  location: 'BITS Pilani, Rajasthan, India',
  availability: 'Open to internships & full-time roles',
  email: 'devsatish08@gmail.com',
  phone: '+91 75068 57789',
  phoneHref: 'tel:+917506857789',
  // Drop your PDF at public/resume.pdf. The buttons stay hidden until the file exists.
  resume: 'resume.pdf',
  facts: [
    { value: '4', label: 'internships' },
    { value: '500+', label: 'weekly npm downloads' },
    { value: '2', label: 'degrees in progress' },
  ],
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
      'Engineered dividend-based trading algorithms enabling systematic portfolio rebalancing.',
      'Architected financial data pipelines on Redis and AWS S3, reducing latency for high-frequency analysis.',
    ],
    tags: ['Python', 'Redis', 'AWS S3'],
  },
  {
    role: 'Machine Learning Intern',
    company: 'Aditya Birla Group',
    date: 'May 2025 – Jul 2025',
    domain: 'Industrial ML',
    bullets: [
      'Deployed a corrosion-detection model trained on 4,000+ images for real-time defect identification from camera feeds.',
      'Built a TensorFlow.js app for pipe detection and predictive fouling analysis.',
    ],
    tags: ['TensorFlow.js', 'Python', 'OpenCV', 'Selenium'],
  },
  {
    role: 'Web Development Intern',
    company: 'GPLAN',
    date: 'Jan 2025 – Mar 2025',
    domain: 'Architecture tooling',
    bullets: [
      'Engineered an architectural layout tool using graph theory.',
      'Built interactive React + D3.js interfaces for real-time layout visualisation, with Redux Toolkit for global state.',
    ],
    tags: ['React', 'D3.js', 'Redux'],
  },
  {
    role: 'Software Development Intern',
    company: 'Anitum',
    date: 'Dec 2024 – Jan 2025',
    domain: 'ERP & computer vision',
    bullets: [
      'Delivered production ERP systems for education and manufacturing clients using Flask and SQLite.',
      'Implemented computer-vision pipelines integrated into client dashboards via Chart.js.',
    ],
    tags: ['Flask', 'SQLite', 'Chart.js'],
  },
];

// Links set to null are hidden. Fill them in when you have them.
export const PROJECTS = [
  {
    name: 'Readmebot',
    kind: 'Developer tool · CLI',
    blurb: 'A Node.js CLI that reads your codebase and writes the README with GPT-4. Sub-second startup.',
    metric: '500+ downloads / week',
    stack: ['Node.js', 'OpenAI', 'CLI'],
    links: [{ label: 'npm', href: 'https://www.npmjs.com/package/readmebot' }],
  },
  {
    name: 'BITS Mess Portal',
    kind: 'Web app',
    blurb: 'Menus, ratings and feedback for the BITS Pilani mess, built for the whole campus.',
    metric: '2,000+ users in 7 days',
    stack: ['React', 'REST API'],
    links: [],
  },
  {
    name: 'Yearbook Portal',
    kind: 'Full-stack web app',
    blurb: 'A PERN-stack yearbook for a graduating class: profiles, messages and memories in one place.',
    metric: 'Live',
    stack: ['PostgreSQL', 'Express', 'React', 'Node.js'],
    links: [],
  },
  {
    name: 'Nirmaan NGO',
    kind: 'Website',
    blurb: 'Digital outreach site for Nirmaan, a student-run NGO.',
    metric: 'Deployed on GoDaddy',
    stack: ['Angular', 'TypeScript', 'Tailwind'],
    links: [],
  },
];

export const EDUCATION = [
  { degree: 'B.E. Mechanical Engineering', school: 'BITS Pilani', date: 'Aug 2023 – Present' },
  { degree: 'M.Sc. Biological Sciences', school: 'BITS Pilani', date: 'Aug 2023 – Present · Dual degree' },
];

export const SKILL_GROUPS = [
  { title: 'Languages', items: ['Python', 'JavaScript', 'TypeScript', 'C', 'C++', 'Java', 'HTML', 'CSS', 'Lua'] },
  { title: 'Frameworks & ML', items: ['React', 'Next.js', 'Angular', 'Node.js', 'Express', 'Flask', 'PyTorch', 'OpenCV', 'D3.js'] },
  { title: 'Data & Cloud', items: ['PostgreSQL', 'MySQL', 'SQLite', 'Redis', 'AWS S3', 'DigitalOcean', 'Firebase'] },
  { title: 'Certifications', items: ['Machine Learning Specialization (Stanford, DeepLearning.AI)', 'AWS DevOps'] },
];

// Blog categories borrow a season's colour.
export const CATEGORY_SEASON = {
  'book-review': 'winter',
  product: 'spring',
  strategy: 'autumn',
};
