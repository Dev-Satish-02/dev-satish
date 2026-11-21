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
    logo: null,
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

// Links set to null are hidden. Fill them in when you have them.
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
    links: [],
  },
  {
    name: 'College Merchandise',
    kind: 'Campus apparel for large-scale fests',
    blurb: 'Drove merchandise sales across campus fests such as OASIS, securing 1,200+ orders and generating INR 1.5L+ in revenue.',
    metric: '1,200+ orders, INR 1.5L+ revenue',
    bullets: [
      'Drove merchandise sales across campus fests such as OASIS, securing 1,200+ orders and generating INR 1.5L+ in revenue.',
      'Optimized demand planning and inventory allocation using student insights, achieving high sell-through across peak fest cycles.',
      'Owned the end-to-end supply chain across sourcing, production and distribution, ensuring timely delivery and quality standards.',
    ],
    stack: [],
    links: [],
  },
];

// The npm package GitHub's Packages tab shows, with live download counts.
export const PACKAGES = [{ name: 'readmebot', repo: 'readmebot' }];

export const ACHIEVEMENTS = [
  ['Procter & Gamble', 'Top 47 among 5k+ students across India for the P&G Spotlight Program; offered a summer internship.'],
  ['Siemens', 'Top 10 at BITS Pilani in the AI for the Real World Hackathon; invited to Siemens Innovation Day 2026, New Delhi.'],
  ['Student Faculty Council', 'Built a feedback system, drove policy improvements and increased student–faculty engagement by 40%.'],
  ['Team Robocon', 'Won the 20K Maze-Solving Competition, building drones, a quadruped and IoT systems while leading tech initiatives.'],
  ['CEL, Bedrock', 'Third in Bedrock, a one-day marketing event, with a 500% increase in sales revenue (Rs. 70,000).'],
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
