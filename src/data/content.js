// All site copy and links live here.

export const PROFILE = {
  name: 'Dev Satish',
  title: 'Product, strategy and engineering',
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

export const EXPERIENCE = [
  {
    role: 'Python Intern',
    company: 'Sysstra',
    date: 'Jul 2025 to Nov 2025',
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
    date: 'May 2025 to Jul 2025',
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
    date: 'Jan 2025 to Mar 2025',
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
    date: 'Dec 2024 to Jan 2025',
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
  { degree: 'B.E. Mechanical Engineering', school: 'BITS Pilani', date: 'Since Aug 2023' },
  { degree: 'M.Sc. Biological Sciences', school: 'BITS Pilani', date: 'Since Aug 2023' },
];

// Edit freely: the first group comes from what you've written about and shipped.
export const SKILL_GROUPS = [
  { title: 'Product & strategy', items: ['Product launches', 'Roadmapping', 'Go-to-market planning', 'Launch metrics', 'Writing'] },
  { title: 'Data & analysis', items: ['Python', 'SQL (PostgreSQL, MySQL)', 'Machine learning', 'Data visualisation (D3.js, Chart.js)'] },
  { title: 'Engineering', items: ['JavaScript / TypeScript', 'React', 'Node.js', 'Flask', 'AWS', 'C / C++', 'Java'] },
  { title: 'Certifications', items: ['Machine Learning Specialization (Stanford, DeepLearning.AI)', 'AWS DevOps'] },
];

// What the LinkedIn window shows, matching the live profile.
export const LINKEDIN = {
  headline: 'Placement Unit | Alumni Relations | BITS Pilani',
  pronouns: 'He/Him',
  location: 'Mumbai, Maharashtra, India',
  connections: '500+ connections',
  school: 'Birla Institute of Technology and Science, Pilani',
  // banner: "Bits Clock tower" by JRDkg, CC BY-SA 4.0, via Wikimedia Commons (cropped to 4:1)
  banner: 'images/bits-clock-tower.jpg',
  bannerCredit: { text: 'Photo: JRDkg, CC BY-SA 4.0', href: 'https://commons.wikimedia.org/wiki/File:Bits_Clock_tower.jpg' },
};

// The profile photo the LinkedIn, X and GitHub windows use.
export const AVATAR = 'images/dev.jpg';

// What the X window shows, matching the live profile.
export const X_PROFILE = {
  name: 'dev',
  joined: 'September 2024',
  following: 2,
  followers: 1,
};

// GitHub: pinned repositories, in the order the profile shows them, and a few profile extras.
export const GITHUB = {
  pinned: ['bits-nirmaan', 'mess-dev', 'snaps', 'meshery', 'meshery.io', 'readmebot'],
  website: 'https://dev-satish-02.github.io/dev-satish/',
  achievements: [
    ['Pair Extraordinaire', '🫛', '#7fc96b'],
    ['Quickdraw', '🤠', '#f2a65a'],
    ['YOLO', '🎉', '#f28bb3'],
    ['Pull Shark', '🦈', '#4a7bd8'],
  ],
};

// Dev's Spotify: the public playlists on his profile, with covers saved in public/images/spotify.
export const SPOTIFY = {
  name: 'dev',
  profile: 'https://open.spotify.com/user/1oziia7t09x2x1hqyuyktwo8w',
  playlists: [
    { id: '3cjbiVfQnwuxAZF4lajryx', title: 'desi rap' },
    { id: '0CbcBhHjPfjDtyGNTFVYda', title: 'jazz' },
    { id: '1rCSTiDZP6chFton6pg21K', title: 'haseena zulfonwale' },
    { id: '2MJQZPxgBubwz9v0KKzfHy', title: 'lock in' },
    { id: '2mbHULN4Ah0msLKTaIhgJE', title: 'my mind' },
    { id: '4Qtb2nfpa3ByU53Mi8QqxG', title: 'arunachalam' },
  ],
};
