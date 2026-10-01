import { QuizQuestion } from '../types';

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    category: 'Work Environment & Daily Motivation',
    question: 'When starting a fresh project, what aspect sparks your greatest excitement?',
    scenario: 'You are invited to join an ambitious new initiative. You get to choose your main focus area:',
    options: [
      {
        id: '1a',
        text: 'Architecting robust code and figuring out how high-performance systems operate behind the scenes.',
        icon: 'Code2',
        weights: { technical: 5, problemSolving: 4, technology: 4 }
      },
      {
        id: '1b',
        text: 'Uncovering patterns in large datasets to predict consumer trends or system bottlenecks.',
        icon: 'BarChart3',
        weights: { data: 5, analytical: 5, problemSolving: 3 }
      },
      {
        id: '1c',
        text: 'Crafting an intuitive, breathtaking visual experience that users instantly fall in love with.',
        icon: 'Palette',
        weights: { creative: 5, communication: 3, socialImpact: 3 }
      },
      {
        id: '1d',
        text: 'Defining product roadmap, aligning stakeholders, and driving the team toward a shared market vision.',
        icon: 'Compass',
        weights: { leadership: 5, communication: 5, socialImpact: 3 }
      }
    ]
  },
  {
    id: 2,
    category: 'Troubleshooting & Problem Solving',
    question: 'A critical system or service unexpectedly slows down right before a major release. What is your instinct?',
    scenario: 'The team is on high alert. How do you naturally step in to resolve the crisis?',
    options: [
      {
        id: '2a',
        text: 'Deep-dive into server telemetry, logs, memory dumps, and code profiling to isolate the bottleneck.',
        icon: 'Cpu',
        weights: { technical: 5, problemSolving: 5, analytical: 3 }
      },
      {
        id: '2b',
        text: 'Run statistical distribution tests on user load data to identify anomalous query behaviors.',
        icon: 'LineChart',
        weights: { data: 5, analytical: 5, technical: 2 }
      },
      {
        id: '2c',
        text: 'Coordinate the war room, synchronize status updates between engineers and executives, and de-escalate tension.',
        icon: 'Users',
        weights: { leadership: 4, communication: 5, socialImpact: 3 }
      },
      {
        id: '2d',
        text: 'Audit access logs and security vectors to ensure this isn’t a malicious DDoS or vulnerability exploit.',
        icon: 'ShieldAlert',
        weights: { technology: 5, problemSolving: 4, technical: 4 }
      }
    ]
  },
  {
    id: 3,
    category: 'Creativity & Human Experience',
    question: 'How do you view aesthetics and user experience in modern digital products?',
    scenario: 'You are reviewing a functional app that works fine but feels uninspired and clumsy to use.',
    options: [
      {
        id: '3a',
        text: 'Essential: Seamless animations, micro-interactions, accessibility, and visual harmony define a product’s soul.',
        icon: 'Sparkles',
        weights: { creative: 5, communication: 4, socialImpact: 4 }
      },
      {
        id: '3b',
        text: 'Valuable, but sub-100ms latency, algorithmic efficiency, and rock-solid uptime matter even more to me.',
        icon: 'Zap',
        weights: { technical: 5, problemSolving: 4, technology: 4 }
      },
      {
        id: '3c',
        text: 'Driven by behavioral data: Let’s A/B test conversion funnels and churn metrics to let users decide with numbers.',
        icon: 'PieChart',
        weights: { data: 5, analytical: 4, leadership: 3 }
      },
      {
        id: '3d',
        text: 'A balance between commercial viability, product positioning, and fulfilling genuine human needs.',
        icon: 'Briefcase',
        weights: { leadership: 4, communication: 4, creative: 3 }
      }
    ]
  },
  {
    id: 4,
    category: 'Analytical Thinking & Numbers',
    question: 'Faced with a mountain of raw, unstructured information, what is your preferred approach?',
    scenario: 'You are given millions of customer transaction logs and survey feedback files.',
    options: [
      {
        id: '4a',
        text: 'Write automated ETL pipelines and SQL scripts to clean, structure, and model the relational data.',
        icon: 'Database',
        weights: { data: 5, technical: 4, technology: 4 }
      },
      {
        id: '4b',
        text: 'Train predictive machine learning models to forecast future trends and detect hidden correlations.',
        icon: 'BrainCircuit',
        weights: { data: 5, analytical: 5, technical: 4 }
      },
      {
        id: '4c',
        text: 'Synthesize the core themes into an executive deck with compelling charts and strategic takeaways.',
        icon: 'Presentation',
        weights: { communication: 5, leadership: 4, analytical: 3 }
      },
      {
        id: '4d',
        text: 'Conduct thematic qualitative analysis to uncover the emotional stories and frustrations behind the numbers.',
        icon: 'HeartHandshake',
        weights: { socialImpact: 5, creative: 4, communication: 4 }
      }
    ]
  },
  {
    id: 5,
    category: 'Security, Ethics & Trust',
    question: 'How do you approach digital privacy, infrastructure safety, and ethical technology?',
    scenario: 'A new feature can harvest extensive background user data to boost monetization by 25%.',
    options: [
      {
        id: '5a',
        text: 'Enforce strict Zero-Trust boundaries, encryption standards, and threat modeling to protect user privacy.',
        icon: 'Lock',
        weights: { technology: 5, technical: 4, socialImpact: 4 }
      },
      {
        id: '5b',
        text: 'Champion user privacy rights, regulatory compliance (GDPR/HIPAA), and ethical AI principles.',
        icon: 'Scale',
        weights: { socialImpact: 5, leadership: 4, communication: 3 }
      },
      {
        id: '5c',
        text: 'Analyze the trade-off mathematically: evaluate risk scores, customer retention impact, and compliance exposure.',
        icon: 'TrendingUp',
        weights: { analytical: 5, data: 4, leadership: 3 }
      },
      {
        id: '5d',
        text: 'Design transparent consent micro-interactions so users feel fully in control and informed.',
        icon: 'Eye',
        weights: { creative: 4, communication: 4, socialImpact: 4 }
      }
    ]
  },
  {
    id: 6,
    category: 'Coding & Hands-on Implementation',
    question: 'What is your current relationship and enthusiasm regarding programming and code?',
    scenario: 'Reflect on how much time you enjoy spending directly in a code editor / terminal each week:',
    options: [
      {
        id: '6a',
        text: 'I love it! I can spend hours building APIs, optimizing algorithms, and exploring new frameworks.',
        icon: 'Terminal',
        weights: { technical: 5, problemSolving: 5, technology: 4 }
      },
      {
        id: '6b',
        text: 'I use code primarily as a scientific tool (Python, R, Pandas, PyTorch) to wrangle data and build models.',
        icon: 'Binary',
        weights: { data: 5, analytical: 4, technical: 4 }
      },
      {
        id: '6c',
        text: 'I prefer visual and design tools (Figma, Framer, CSS) and prototyping rather than deep backend logic.',
        icon: 'PenTool',
        weights: { creative: 5, communication: 3, technology: 2 }
      },
      {
        id: '6d',
        text: 'I prefer high-level strategy, product roadmaps, and sprint planning over writing production code.',
        icon: 'Target',
        weights: { leadership: 5, communication: 5, analytical: 3 }
      }
    ]
  },
  {
    id: 7,
    category: 'Team Dynamics & Collaboration',
    question: 'In a group project, what role do your peers naturally gravitate toward asking you to fill?',
    scenario: 'Your project group is assembling for a high-stakes hackathon or capstone delivery.',
    options: [
      {
        id: '7a',
        text: 'The Architect/Builder: "Can you build the backend architecture, database schema, and deployment?"',
        icon: 'Layers',
        weights: { technical: 5, technology: 5, problemSolving: 4 }
      },
      {
        id: '7b',
        text: 'The Team Lead: "Can you pitch our solution, organize tasks, keep us on time, and handle the judges?"',
        icon: 'Crown',
        weights: { leadership: 5, communication: 5, socialImpact: 3 }
      },
      {
        id: '7c',
        text: 'The Data & Insights Guru: "Can you evaluate the model accuracy, clean the data, and prove our claims?"',
        icon: 'Microscope',
        weights: { analytical: 5, data: 5, problemSolving: 3 }
      },
      {
        id: '7d',
        text: 'The UX / Product Stylist: "Can you design the interactive mockups, design system, and slide deck?"',
        icon: 'Figma',
        weights: { creative: 5, communication: 4, problemSolving: 2 }
      }
    ]
  },
  {
    id: 8,
    category: 'Continuous Learning & Emerging Tech',
    question: 'Which of the following emerging technology frontiers most captures your imagination?',
    scenario: 'You have a full weekend with no obligations to explore any topic you want:',
    options: [
      {
        id: '8a',
        text: 'Large Language Models, Generative Agents, Autonomous Neural Networks, and Computer Vision.',
        icon: 'Bot',
        weights: { data: 5, technical: 4, analytical: 4, technology: 4 }
      },
      {
        id: '8b',
        text: 'Cloud-native Kubernetes orchestration, serverless microservices, and multi-region resilience.',
        icon: 'Cloud',
        weights: { technology: 5, technical: 5, problemSolving: 4 }
      },
      {
        id: '8c',
        text: 'Next-gen spatial computing, 3D interaction design, AR/VR, and immersive design systems.',
        icon: 'Glasses',
        weights: { creative: 5, technology: 4, problemSolving: 3 }
      },
      {
        id: '8d',
        text: 'Cyber threat intelligence, penetration testing, defensive cryptography, and zero-day defense.',
        icon: 'ShieldCheck',
        weights: { technology: 5, problemSolving: 5, technical: 4 }
      }
    ]
  },
  {
    id: 9,
    category: 'Communication & Impact',
    question: 'How do you prefer to articulate complex technical ideas to non-technical audiences?',
    scenario: 'You have solved a complicated challenge and need to explain the solution to client executives.',
    options: [
      {
        id: '9a',
        text: 'Using visual metaphors, clear diagrams, user journeys, and storytelling that anyone can relate to.',
        icon: 'BookOpen',
        weights: { communication: 5, creative: 4, socialImpact: 4 }
      },
      {
        id: '9b',
        text: 'Translating the outcome into financial ROI, reduced operational risk, and customer retention metrics.',
        icon: 'BadgeDollarSign',
        weights: { leadership: 5, analytical: 4, communication: 4 }
      },
      {
        id: '9c',
        text: 'Providing clean dashboards with interactive filters so they can explore the evidence firsthand.',
        icon: 'LayoutDashboard',
        weights: { data: 4, analytical: 4, communication: 4 }
      },
      {
        id: '9d',
        text: 'Providing clear technical specifications, system block diagrams, and RFC documentation.',
        icon: 'FileCode2',
        weights: { technical: 5, communication: 3, problemSolving: 4 }
      }
    ]
  },
  {
    id: 10,
    category: 'Decision-Making Style',
    question: 'When multiple paths forward exist and there is high ambiguity, how do you decide?',
    scenario: 'Two senior team members disagree on the technical direction of a new core module.',
    options: [
      {
        id: '10a',
        text: 'Run quick benchmark experiments and let latency, throughput, and error rates decide objectively.',
        icon: 'Gauge',
        weights: { analytical: 5, technical: 4, problemSolving: 4 }
      },
      {
        id: '10b',
        text: 'Facilitate a structured discussion, evaluate pros/cons against business goals, and drive consensus.',
        icon: 'Handshake',
        weights: { leadership: 5, communication: 5, socialImpact: 3 }
      },
      {
        id: '10c',
        text: 'Rapidly prototype interactive mockups for both solutions and test them with real users for feedback.',
        icon: 'MousePointerClick',
        weights: { creative: 5, problemSolving: 4, communication: 3 }
      },
      {
        id: '10d',
        text: 'Audit scalability constraints, security compliance, and long-term maintainability debt.',
        icon: 'ShieldCheck',
        weights: { technology: 5, technical: 4, analytical: 4 }
      }
    ]
  },
  {
    id: 11,
    category: 'Career Value & Meaning',
    question: 'Looking ahead 5 years, what would make you feel most proud of your career accomplishments?',
    scenario: 'Imagine giving a keynote or reflecting back on your greatest professional milestone:',
    options: [
      {
        id: '11a',
        text: 'Building mission-critical software or infrastructure that powers millions of seamless transactions daily.',
        icon: 'Workflow',
        weights: { technical: 5, technology: 5, problemSolving: 4 }
      },
      {
        id: '11b',
        text: 'Discovering predictive insights or training an AI model that revolutionized medical diagnosis or climate modeling.',
        icon: 'Sparkle',
        weights: { data: 5, socialImpact: 5, analytical: 4 }
      },
      {
        id: '11c',
        text: 'Creating an iconic, universally celebrated digital interface that made technology accessible to everyone.',
        icon: 'Smile',
        weights: { creative: 5, socialImpact: 5, communication: 4 }
      },
      {
        id: '11d',
        text: 'Mentoring an empowered engineering organization and launching breakthrough ventures from zero to one.',
        icon: 'Rocket',
        weights: { leadership: 5, communication: 5, socialImpact: 4 }
      }
    ]
  },
  {
    id: 12,
    category: 'Project Scale & Operational Focus',
    question: 'Which of the following daily deliverables sounds most invigorating to you?',
    scenario: 'Which work output would you be proud to show your mentors at the end of a sprint?',
    options: [
      {
        id: '12a',
        text: 'A clean, well-tested microservice repository with 99.9% test coverage and CI/CD automation.',
        icon: 'CheckCircle2',
        weights: { technical: 5, technology: 5, problemSolving: 4 }
      },
      {
        id: '12b',
        text: 'A Jupyter notebook or neural net pipeline producing high-accuracy predictions and data visualizations.',
        icon: 'FileSpreadsheet',
        weights: { data: 5, analytical: 5, technical: 3 }
      },
      {
        id: '12c',
        text: 'A clickable high-fidelity Figma prototype and interactive component library with micro-animations.',
        icon: 'Shapes',
        weights: { creative: 5, communication: 4, technology: 3 }
      },
      {
        id: '12d',
        text: 'A comprehensive product strategy PRD with customer interviews, market size, and feature matrix.',
        icon: 'FileText',
        weights: { leadership: 5, communication: 5, analytical: 3 }
      }
    ]
  }
];
