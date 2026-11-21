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

// From the latest résumé (public/resume.pdf). Most recent first.
export const EXPERIENCE = [
  {
    role: 'AI Engineering Intern',
    company: 'Callistra AI',
    date: 'Mar 2026 to Aug 2026',
    domain: 'Financial AI',
    about: 'AI-native research workspace helping public-market financial analysts evaluate companies faster',
    logo: null,
    bullets: [
      'Spearheaded an AI research workspace for financial analysts, processing 10,000+ documents and cutting analysis time by 40%.',
      'Translated analyst workflows into real-time product features with sub-500 ms responses, accelerating analyst research decisions.',
      'Automated event-driven document and notebook workflows, removing manual hand-offs and improving responsiveness for users.',
    ],
    tags: [],
  },
  {
    role: 'Python Intern',
    company: 'Sysstra',
    date: 'Jul 2025 to Nov 2025',
    domain: 'Fintech',
    about: 'Fintech firm building systematic trading strategies',
    logo: 'images/logos/sysstra.png',
    bullets: [
      'Built dividend-based trading strategies that rebalance portfolios systematically.',
      'Designed the data pipeline (Redis, AWS S3) behind high-frequency analysis, cutting its latency.',
    ],
    tags: ['Python', 'Redis', 'AWS S3'],
  },
  {
    role: 'Operations Intern',
    company: 'Aditya Birla Group',
    date: 'May 2025 to Jul 2025',
    domain: 'Manufacturing',
    about: '60B+ global conglomerate operating across 40+ countries and multiple industries',
    logo: 'images/logos/aditya-birla.png',
    bullets: [
      'Optimized sulphuric acid plant operations by analyzing 10+ KPIs and driving process changes, cutting energy use by 10%.',
      'Evaluated crystallization and MSFE configurations to boost throughput and system reliability, sustaining 98–99% recovery rates.',
      'Championed fouling management improvements, saving about 100 m³ of water a day and raising equipment uptime across the plant.',
    ],
    tags: [],
  },
  {
    role: "Founder's Office",
    company: 'Anitum',
    date: 'Dec 2024 to Jan 2025',
    domain: 'Applied AI',
    about: 'AI-driven intelligence platform transforming workplaces with real-time analytics, reducing inefficiencies',
    logo: 'images/logos/anitum.png',
    bullets: [
      'Accelerated issue identification and response by 20–30% across multi-industry client deployments by streamlining operations.',
      'Defined the product, turning live operational data into actionable insights that guided decisions across 4+ client deployments.',
      'Drove product adoption by aligning engineering teams and client stakeholders, improving throughput across operational settings.',
    ],
    tags: [],
  },
];

export const POSITIONS = [
  {
    role: 'Coordinator',
    company: 'Placement Unit, BITS Pilani',
    date: 'Nov 2025 to Present',
    about: 'A student-led body overseeing campus recruitment, acting as interface between the institute and recruiters',
    logo: 'images/logos/bits.png',
    bullets: [
      'Orchestrated campus placements for 700+ students by coordinating institute stakeholders and engaging 50+ hiring companies.',
      'Built PU Outreach, an AI tool that auto-logs leads and drafts pitch emails, cutting per-company time from 2.25 min to 10s.',
      'Supervised 80+ recruitment drives end-to-end, ensuring seamless execution for top firms such as P&G, KPMG and Deloitte.',
    ],
  },
  {
    role: 'Events & Outreach Head',
    company: 'Alumni Relations Cell, BITS Pilani',
    date: 'Apr 2025 to Present',
    about: "The institute's official organization fostering long-term student–alumni networks",
    logo: 'images/logos/bits.png',
    bullets: [
      'Spearheaded alumni engagement by hosting on-campus talks with 50+ alumni, building mentorship access for 1,000+ students.',
      'Led the launch of the Yearbook Portal & TagYourSnap, driving 700+ snaps and enabling interaction across 80%+ of the batch.',
      'Executed Batch Snaps, a flagship 2-day event, coordinating 500+ students and 50+ faculty with the Alumni Relations office.',
    ],
  },
  {
    role: 'Project Lead',
    company: 'Nirmaan Organization',
    date: 'Dec 2024 to Jul 2025',
    about: 'NGO focused on community development through education, and women empowerment',
    logo: 'images/logos/nirmaan.png',
    bullets: [
      'Mobilized 30+ volunteers across 11+ projects, optimizing resource allocation for streamlined execution and on-time delivery.',
      'Spearheaded 25+ community initiatives, mobilizing volunteers and raising 1M+ in funds to benefit 500+ underserved people.',
      'Introduced a data-driven volunteer certification from field visits, strengthening accountability and clarifying performance metrics.',
    ],
  },
];

// The Yearbook is from the latest résumé; the rest come from Dev's public repositories and earlier résumés.
export const PROJECTS = [
  {
    name: 'The Yearbook',
    kind: 'A Yearbook Portal to digitize submissions and streamline creation of the final physical yearbook',
    blurb: 'Led the Yearbook Portal launch, onboarding 80% of the batch and generating INR 7L+ in revenue by digitizing submissions.',
    metric: 'INR 7L+ revenue, 9,000+ quotes',
    bullets: [
      'Led the Yearbook Portal launch, onboarding 80% of the batch and generating INR 7L+ in revenue by digitizing submissions.',
      'Doubled engagement (2×) in just one week by shipping new interactive features prioritized through rapid user feedback loops.',
      'Cut manual effort by 90%+ and scaled adoption to 9,000+ quotes through digitized workflows and targeted student outreach.',
    ],
    stack: [],
    links: [{ label: 'Snaps', href: 'https://snaps-dun.vercel.app' }],
  },
  {
    name: 'PU Outreach',
    kind: 'AI outreach tool for the BITS Pilani Placement Unit',
    blurb: 'Screenshot a LinkedIn profile, get a tracker row and a Gmail draft; a person reviews and sends every email.',
    metric: '2.25 min to 10 s per company',
    bullets: [
      'Turns a LinkedIn screenshot into a Google Sheets row and a drafted pitch email, with local OCR and a human approving every send.',
      'Cut per-company outreach time from 2.25 minutes to 10 seconds for the Placement Unit.',
    ],
    stack: ['Python', 'Google Apps Script', 'Tesseract OCR'],
    links: [{ label: 'GitHub', href: 'https://github.com/Dev-Satish-02/PU-Outreach' }],
  },
  {
    name: 'NEXUS: AMR Fleet Coordination',
    kind: 'Smart India Hackathon 2026, problem statement SIH26123',
    blurb: 'Decentralized coordination for warehouse robots: each robot plans with its neighbours peer-to-peer, with no central traffic controller.',
    metric: 'Up to 24% faster than zone locking',
    bullets: [
      'Every robot runs the same agent and shares its position and intent peer-to-peer, with no central traffic controller.',
      'Includes a lane-based multi-robot warehouse simulator, a live fleet dashboard, a layout editor and a benchmark harness.',
      'Finished a 12-robot intersection scenario in 362 s against 476 s for classical zone locking.',
    ],
    stack: ['Python'],
    links: [
      { label: 'Live demo', href: 'https://amr-smart-warehouse.onrender.com/' },
      { label: 'GitHub', href: 'https://github.com/Dev-Satish-02/AMR-smart-warehouse' },
    ],
  },
  {
    name: 'Stadium Evacuation Models',
    kind: 'Crowd-flow and emergency-evacuation simulation',
    blurb: 'A Python framework comparing four crowd-flow models on the same stadiums, crowds and scenarios.',
    metric: '4 models, 40,000+ person crowds',
    bullets: [
      'Builds parametric stadiums from YAML: a 41,355-person football bowl, a 40,603-person cricket oval and an indoor arena.',
      'Generates seeded crowds with mobility classes, walking speeds and pre-movement delays, then runs four models on identical crowds.',
    ],
    stack: ['Python'],
    links: [{ label: 'GitHub', href: 'https://github.com/Dev-Satish-02/stadium-evac' }],
  },
  {
    name: 'BITS Mess Portal',
    kind: 'Campus product',
    blurb: 'Menus, ratings and feedback for the BITS Pilani mess, launched to the whole campus.',
    metric: '2,000+ users in 7 days',
    stack: ['React', 'REST API'],
    links: [
      { label: 'Live', href: 'https://mess-menu-seven.vercel.app' },
      { label: 'GitHub', href: 'https://github.com/Dev-Satish-02/mess-dev' },
    ],
  },
  {
    name: 'Readmebot',
    kind: 'Developer tool on npm',
    blurb: 'A command-line tool that reads a codebase and writes a polished README.md with AI.',
    metric: 'Published on npm',
    stack: ['Node.js', 'OpenAI'],
    links: [
      { label: 'npm', href: 'https://www.npmjs.com/package/readmebot' },
      { label: 'GitHub', href: 'https://github.com/Dev-Satish-02/readmebot' },
    ],
  },
  {
    name: 'Corrosion Detector',
    kind: 'Computer vision, built during the Aditya Birla Group internship',
    blurb: 'A browser app that flags pipe corrosion from live camera feeds, using a model trained on 4,000+ images.',
    metric: '4,000+ training images',
    stack: ['TensorFlow.js', 'Python', 'OpenCV'],
    links: [
      { label: 'Live', href: 'https://rust-detector.vercel.app' },
      { label: 'GitHub', href: 'https://github.com/Dev-Satish-02/rust-detector' },
    ],
  },
  {
    name: 'Nirmaan Pilani website',
    kind: 'Website for the Nirmaan Organization, Pilani chapter',
    blurb: 'Digital outreach site for Nirmaan, the student-run NGO Dev led projects for.',
    metric: 'Live',
    stack: ['Angular', 'TypeScript', 'Tailwind'],
    links: [
      { label: 'Live', href: 'https://nirmaanpilani.org/' },
      { label: 'GitHub', href: 'https://github.com/Dev-Satish-02/bits-nirmaan' },
    ],
  },
];

// The npm package GitHub's Packages tab shows, with live download counts.
export const PACKAGES = [{ name: 'readmebot', repo: 'readmebot' }];

// [who, what, logo]
export const ACHIEVEMENTS = [
  ['Procter & Gamble', 'Top 47 among 5k+ students across India for the P&G Spotlight Program; offered a summer internship.', 'images/logos/pg.png'],
  ['Siemens', 'Top 10 at BITS Pilani in the AI for the Real World Hackathon; invited to Siemens Innovation Day 2026, New Delhi.', 'images/logos/siemens.svg'],
  ['Student Faculty Council', 'Built a feedback system, drove policy improvements and increased student–faculty engagement by 40%.', 'images/logos/bits.png'],
  ['Team Robocon', 'Won the 20K Maze-Solving Competition, building drones, a quadruped and IoT systems while leading tech initiatives.', 'images/logos/robocon.png'],
  ['CEL, Bedrock', 'Third in Bedrock, a one-day marketing event, with a 500% increase in sales revenue (Rs. 70,000).', null],
];

// [name, issuer, logo]
export const CERTIFICATIONS = [
  ['Machine Learning Specialization', 'Stanford University, DeepLearning.AI', 'images/logos/stanford.png'],
  ['AWS DevOps', 'Amazon Web Services', 'images/logos/aws.png'],
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
