// All site copy lives here. Anything marked TODO is a link or detail still to be filled in.

export const PROFILE = {
  name: 'Dev Satish',
  title: 'Full Stack Engineer & AI Builder',
  kana: 'デヴ・サティシュ',
  email: 'devsatish08@gmail.com',
  phone: '+91 75068 57789',
  phoneHref: 'tel:+917506857789',
  location: 'BITS Pilani · Rajasthan, India',
  intro:
    'I build ML pipelines, trading algorithms and full-stack apps. Four internships so far, and a dual degree in Mechanical Engineering and Biological Sciences at BITS Pilani.',
  portrait: 'images/pixel.png',
};

export const SOCIALS = [
  { label: 'GitHub', href: 'https://github.com/Dev-Satish-02' },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/dev-satish' },
  { label: 'Twitter', href: 'https://twitter.com/devtech08' },
];

// Each home section is an "episode": 第N話 + an arc title written the way the series
// writes them (hiragana + katakana, e.g. ひたぎクラブ) + a kanji for the vertical title.
export const EPISODES = [
  { id: 'experience', no: '第一話', num: '01', arc: 'けいれきキャリア', arcEn: 'Career Arc', kanji: '経歴', label: 'Experience' },
  { id: 'projects', no: '第二話', num: '02', arc: 'つくるラボ', arcEn: 'Laboratory Arc', kanji: '作品', label: 'Projects' },
  { id: 'skills', no: '第三話', num: '03', arc: 'まなぶスキル', arcEn: 'Study Arc', kanji: '技能', label: 'Skills' },
  { id: 'blog', no: '第四話', num: '04', arc: 'かくノート', arcEn: 'Notebook Arc', kanji: '随筆', label: 'Blog' },
  { id: 'contact', no: '最終話', num: '05', arc: 'つながるコール', arcEn: 'Calling Arc', kanji: '連絡', label: 'Contact' },
];

export const NAV_LINKS = [
  { hash: 'experience', label: 'Experience', kanji: '壱' },
  { hash: 'projects', label: 'Projects', kanji: '弐' },
  { hash: 'skills', label: 'Skills', kanji: '参' },
  { to: '/blog', label: 'Blog', kanji: '肆' },
  { hash: 'contact', label: 'Contact', kanji: '伍' },
];

// Chapter counters in the style of the series: 其ノ壹, 其ノ貳 …
export const CHAPTERS = ['其ノ壹', '其ノ貳', '其ノ參', '其ノ肆', '其ノ伍', '其ノ陸', '其ノ漆', '其ノ捌'];

export const EXPERIENCE = [
  {
    date: 'Jul 2025 – Nov 2025',
    year: '2025',
    company: 'Sysstra',
    role: 'Python Intern',
    description:
      'Engineered dividend-based trading algorithms enabling systematic portfolio rebalancing. Architected financial data pipelines using <b>Redis</b> and <b>AWS S3</b>, reducing latency for high-frequency analysis.',
    tags: ['Python', 'Redis', 'AWS S3'],
  },
  {
    date: 'May 2025 – Jul 2025',
    year: '2025',
    company: 'Aditya Birla Group',
    role: 'Machine Learning Intern',
    description:
      'Deployed a corrosion detection model trained on <b>4,000+ images</b>, enabling real-time defect identification from camera feeds. Built a TensorFlow.js app for pipe detection and predictive fouling analysis.',
    tags: ['TensorFlow.js', 'Python', 'OpenCV', 'Selenium'],
  },
  {
    date: 'Jan 2025 – Mar 2025',
    year: '2025',
    company: 'GPLAN',
    role: 'Web Development Intern',
    description:
      'Engineered an architectural layout tool using <b>graph theory</b>. Built interactive UIs with React + D3.js for real-time layout visualisations. Integrated Redux Toolkit for global state management.',
    tags: ['React', 'D3.js', 'Redux'],
  },
  {
    date: 'Dec 2024 – Jan 2025',
    year: '2024',
    company: 'Anitum',
    role: 'Software Development Intern',
    description:
      'Delivered production-grade ERP systems for education and manufacturing clients using <b>Flask + SQLite</b>. Implemented CV pipelines integrated into client dashboards via Chart.js.',
    tags: ['Flask', 'SQLite', 'Chart.js'],
  },
];

// `glyph` is the big character shown on the project's "frame".
// Set `demo` / `github` to null to hide a button.
export const PROJECTS = [
  {
    name: 'Yearbook Portal',
    glyph: '冊',
    reading: 'satsu · volume',
    stack: ['PostgreSQL', 'Express', 'React', 'Node.js'],
    blurb: 'A PERN-stack yearbook for a graduating class: profiles, messages and memories in one place.',
    stat: { label: 'Status', value: 'Live' },
    badge: 'Featured',
    demo: '#', // TODO
    github: '#', // TODO
  },
  {
    name: 'Readmebot',
    glyph: '書',
    reading: 'sho · writing',
    stack: ['Node.js', 'OpenAI', 'CLI'],
    blurb: 'A CLI that reads your codebase and writes the README for you with GPT-4, with a 0.8s startup time.',
    stat: { label: 'Downloads', value: '500+ / week' },
    terminal: ['$ npx readmebot', '✓ analysing codebase…', '✓ generating docs', '✓ README.md created'],
    demo: 'https://www.npmjs.com/package/readmebot',
    demoLabel: 'npm',
    github: '#', // TODO
  },
  {
    name: 'Nirmaan NGO',
    glyph: '築',
    reading: 'kizuku · to build',
    stack: ['Angular', 'TypeScript', 'Tailwind'],
    blurb: 'Digital outreach site for Nirmaan, an NGO, deployed on GoDaddy.',
    stat: { label: 'Deploy', value: 'GoDaddy' },
    demo: '#', // TODO
    github: '#', // TODO
  },
  {
    name: 'BITS Mess Portal',
    glyph: '食',
    reading: 'shoku · to eat',
    stack: ['React', 'REST API'],
    blurb: 'Menus, ratings and feedback for the BITS Pilani mess. Reached 2,000+ students in its first week.',
    stat: { label: 'Reach', value: '2,000+ in 7 days' },
    demo: '#', // TODO
    github: '#', // TODO
  },
];

export const EDUCATION = [
  {
    degree: 'B.E. Mechanical Engineering',
    school: 'BITS Pilani',
    date: 'Aug 2023 – Present',
    note: 'Rajasthan, India',
  },
  {
    degree: 'M.Sc. Biological Sciences',
    school: 'BITS Pilani',
    date: 'Aug 2023 – Present',
    note: 'Dual degree',
  },
];

export const SKILL_CATEGORIES = [
  {
    kanji: '言語',
    title: 'Languages',
    tags: ['Python', 'JavaScript', 'TypeScript', 'C', 'C++', 'Java', 'HTML', 'CSS', 'Lua'],
  },
  {
    kanji: '基盤',
    title: 'Databases & Cloud',
    tags: ['PostgreSQL', 'MySQL', 'SQLite', 'Redis', 'AWS S3', 'DigitalOcean', 'Firebase'],
  },
  {
    kanji: '骨組',
    title: 'Frameworks',
    tags: ['React', 'Next.js', 'Angular', 'Node.js', 'Express', 'Flask', 'PyTorch', 'OpenCV', 'D3.js'],
  },
  {
    kanji: '資格',
    title: 'Certifications',
    tags: ['ML Specialization (Stanford + DeepLearning.AI)', 'AWS DevOps'],
  },
];

// Blog categories get a title-card colour and a kanji, like each arc in the series.
export const CATEGORY_STYLE = {
  'book-review': { kanji: '書評', color: 'violet' },
  product: { kanji: '製品', color: 'red' },
  strategy: { kanji: '戦略', color: 'gold' },
};
export const DEFAULT_CATEGORY_STYLE = { kanji: '随筆', color: 'ink' };

// The flash cards that cut in between episodes.
export const INTERSTITIALS = {
  afterHero: { tone: 'ink', big: '始', line: 'Every story starts with a commit.' },
  afterExperience: { tone: 'red', big: '赤', line: "I don't know everything. I only know what I've shipped." },
  afterProjects: { tone: 'gold', big: '学', line: 'Four internships. Two degrees. One very long arc.' },
};
