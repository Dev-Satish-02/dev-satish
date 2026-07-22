export const NAV_LINKS = [
  { href: '#experience', label: 'Experience' },
  { href: '#projects', label: 'Projects' },
  { href: '#skills', label: 'Skills' },
  { href: '#blog', label: 'Blog' },
  { href: '#contact', label: 'Contact' },
];

export const EXPERIENCE = [
  {
    side: 'right',
    date: 'JUL 2025 – NOV 2025',
    company: 'SYSSTRA',
    role: 'Python Intern',
    description:
      'Engineered dividend-based trading algorithms enabling systematic portfolio rebalancing. Architected financial data pipelines using <b>Redis</b> and <b>AWS S3</b>, reducing latency for high-frequency analysis.',
    tags: [
      { label: 'Python', bg: '#ffd6b0' },
      { label: 'Redis', bg: '#b0e6ff' },
      { label: 'AWS S3', bg: '#fdc003' },
    ],
    marker: { bg: '#fcf8f9', color: '#1b1b1c', num: '1' },
  },
  {
    side: 'left',
    date: 'MAY 2025 – JUL 2025',
    company: 'ADITYA BIRLA GROUP',
    role: 'Machine Learning Intern',
    description:
      'Deployed a corrosion detection model trained on <b>4,000+ images</b>, enabling real-time defect identification from camera feeds. Built a TensorFlow.js app for pipe detection and predictive fouling analysis.',
    tags: [
      { label: 'TensorFlow.js', bg: '#d4f5d4' },
      { label: 'Python', bg: '#ffd6b0' },
      { label: 'OpenCV', bg: '#fdc003' },
      { label: 'Selenium', bg: '#b0e6ff' },
    ],
    marker: { bg: '#fdc003', color: '#1b1b1c', num: '2' },
  },
  {
    side: 'right',
    date: 'JAN 2025 – MAR 2025',
    company: 'GPLAN',
    role: 'Web Development Intern',
    description:
      'Engineered an architectural layout tool using <b>graph theory</b>. Built interactive UIs with React + D3.js for real-time layout visualisations. Integrated Redux Toolkit for global state management.',
    tags: [
      { label: 'React', bg: '#b0e6ff' },
      { label: 'D3.js', bg: '#fdc003' },
      { label: 'Redux', bg: '#ffd6b0' },
    ],
    marker: { bg: '#2addcd', color: '#1b1b1c', num: '3' },
  },
  {
    side: 'left',
    date: 'DEC 2024 – JAN 2025',
    company: 'ANITUM',
    role: 'Software Development Intern',
    description:
      'Delivered production-grade ERP systems for education and manufacturing clients using <b>Flask + SQLite</b>. Implemented CV pipelines integrated into client dashboards via Chart.js.',
    tags: [
      { label: 'Flask', bg: '#ffd6b0' },
      { label: 'SQLite', bg: '#d4f5d4' },
      { label: 'Chart.js', bg: '#e5e2e3' },
    ],
    marker: { bg: '#fcf8f9', color: '#1b1b1c', num: '4' },
    dimmed: true,
    dateStickerBg: '#5c3f42',
    isLast: true,
  },
];

export const SKILL_CATEGORIES = [
  {
    icon: '⌨️',
    iconBg: '#e51152',
    title: 'Languages',
    tags: ['Python', 'JavaScript', 'TypeScript', 'C', 'C++', 'Java', 'HTML', 'CSS', 'Lua'],
  },
  {
    icon: '☁️',
    iconBg: '#2addcd',
    title: 'Databases & Cloud',
    tags: ['PostgreSQL', 'MySQL', 'SQLite', 'Redis', 'AWS S3', 'DigitalOcean', 'Firebase'],
  },
  {
    icon: '⚛️',
    iconBg: '#fdc003',
    title: 'Frameworks',
    tags: ['React', 'Next.js', 'Angular', 'Node.js', 'Express', 'Flask', 'PyTorch', 'OpenCV', 'D3.js'],
  },
  {
    icon: '🏆',
    iconBg: '#1b1b1c',
    title: 'Certifications',
    tags: [
      { label: 'ML Specialization — Stanford + DeepLearning.AI', bg: '#ffd6b0' },
      { label: 'AWS DevOps', bg: '#d4f5d4' },
    ],
  },
];

export const BLOG_POSTS = [
  {
    headerBg: '#2addcd',
    sticker: { bg: '#1b1b1c', color: '#2addcd', label: 'ML' },
    dateColor: '#1b1b1c',
    titleColor: '#1b1b1c',
    date: 'JUN 2025',
    title: 'Building a Corrosion Detector at Scale',
    excerpt:
      'How I trained and deployed a corrosion detection model on 4,000+ industrial images for real-time camera feed inference at Aditya Birla.',
    tags: [
      { label: 'TensorFlow', bg: '#d4f5d4' },
      { label: 'OpenCV', bg: undefined },
    ],
  },
  {
    headerBg: '#fdc003',
    sticker: { bg: '#1b1b1c', color: '#fdc003', label: 'CLI' },
    dateColor: '#1b1b1c',
    titleColor: '#1b1b1c',
    date: 'APR 2025',
    title: 'Why I Built a README Generator With GPT-4',
    excerpt:
      "I was tired of writing README files. So I built Readmebot — a Node.js CLI that does it in under a second. Here's how, and what I learned about sub-1s startup time.",
    tags: [
      { label: 'Node.js', bg: '#ffd6b0' },
      { label: 'OpenAI', bg: undefined },
    ],
  },
  {
    headerBg: '#e51152',
    sticker: { bg: '#1b1b1c', color: '#e51152', label: 'FINTECH' },
    dateColor: '#fff',
    titleColor: '#fff',
    date: 'JUL 2025',
    title: 'Redis + S3: Lessons From a Financial Data Pipeline',
    excerpt:
      'Deep-dive into the architecture decisions behind a high-frequency trading data pipeline — why we chose Redis for hot cache and S3 for cold storage.',
    tags: [
      { label: 'Redis', bg: '#b0e6ff' },
      { label: 'AWS S3', bg: undefined },
    ],
  },
];
