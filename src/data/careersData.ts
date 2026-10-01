import { Career } from '../types';

export const CAREERS_DATA: Career[] = [
  {
    id: 'fullstack-engineer',
    title: 'Full Stack Software Engineer',
    category: 'Engineering',
    tagline: 'Build end-to-end web applications, microservices, and reactive user experiences.',
    description: 'Bridges frontend design with backend distributed architecture. Solves complex engineering puzzles, architects relational and NoSQL databases, and crafts fluid, high-performance web systems.',
    accentColor: '#38bdf8', // Electric Sky Blue
    icon: 'Layers',
    dimensionalWeights: {
      technical: 5,
      analytical: 4,
      creative: 3,
      communication: 3,
      leadership: 2,
      problemSolving: 5,
      data: 3,
      technology: 5,
      socialImpact: 3
    },
    comparison: {
      codingLevel: 'High',
      analyticalSkills: 'High',
      creativity: 'Moderate',
      communication: 'Moderate',
      duration: '9 - 14 Months',
      typicalRoles: ['Frontend Developer', 'Backend Engineer', 'Full Stack Architect', 'API Platform Engineer'],
      avgSalary: '$118,000 / yr',
      growthOutlook: '+25% (Rapid expansion)',
      workStyle: 'Agile sprints, code reviews, architectural design',
      topTools: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker', 'GraphQL']
    },
    roadmap: [
      {
        step: 1,
        phase: 'Foundation',
        title: 'Modern Web Core & Algorithmic Thinking',
        duration: 'Month 1 - 3',
        keySkills: ['Semantic HTML5', 'Modern CSS & Flexbox/Grid', 'TypeScript Deep-dive', 'Data Structures & Algorithms'],
        recommendedProject: 'Interactive Dashboard with state management and persistent localStorage',
        certificationOrResource: 'Full Stack Open (University of Helsinki) & Meta Frontend Specialization'
      },
      {
        step: 2,
        phase: 'Frontend Mastery',
        title: 'Component Architecture & Responsive UX',
        duration: 'Month 4 - 6',
        keySkills: ['React 19 / Next.js', 'Tailwind / Modern CSS', 'State Management (Zustand/Redux)', 'Web Performance & Accessibility'],
        recommendedProject: 'Collaborative Real-time Kanban Workspace with WebSockets',
        certificationOrResource: 'React Official Certification & Web.dev Core Web Vitals'
      },
      {
        step: 3,
        phase: 'Backend & Data',
        title: 'Scalable APIs & Database Modeling',
        duration: 'Month 7 - 9',
        keySkills: ['Node.js / Express or Go', 'PostgreSQL / Prisma ORM', 'Redis Caching', 'REST & GraphQL Architecture'],
        recommendedProject: 'Production-ready E-Commerce API with payment processing, webhooks, and rate limiting',
        certificationOrResource: 'AWS Certified Cloud Practitioner & Prisma Certification'
      },
      {
        step: 4,
        phase: 'Production & Cloud',
        title: 'CI/CD, Containers & Observability',
        duration: 'Month 10 - 14',
        keySkills: ['Docker Containerization', 'GitHub Actions CI/CD', 'AWS ECS / Vercel', 'Telemetry & Unit/E2E Testing (Playwright)'],
        recommendedProject: 'Full-stack Multi-tenant SaaS with authentication, Stripe billing, and continuous deployment',
        certificationOrResource: 'Certified Kubernetes Application Developer (CKAD) Prep'
      }
    ],
    courses: [
      { name: 'Full Stack Open - Deep Dive into Modern Web Dev', provider: 'Univ of Helsinki', level: 'Intermediate', duration: '12 weeks', badge: 'Free & Renowned' },
      { name: 'Meta Front-End Developer Professional Certificate', provider: 'Coursera / Meta', level: 'Beginner', duration: '7 months', badge: 'Industry Recognized' },
      { name: 'Node.js, Express, MongoDB & More: The Complete Bootcamp', provider: 'Udemy', level: 'Intermediate', duration: '42 hours' }
    ],
    skillsRequired: ['TypeScript / JavaScript', 'React & Modern Frontend', 'Node.js / Python Backend', 'SQL & Database Optimization', 'REST & GraphQL APIs'],
    emergingTrends: ['AI-assisted coding with Copilot & Agents', 'Edge computing & Serverless runtimes', 'Modern fullstack frameworks (Next.js, Remix, Astro)']
  },
  {
    id: 'ai-ml-engineer',
    title: 'AI & Machine Learning Engineer',
    category: 'Data & AI',
    tagline: 'Design neural architectures, fine-tune LLMs, and deploy intelligent agents.',
    description: 'Operates at the bleeding edge of artificial intelligence. Combines advanced mathematics, deep learning frameworks, and scalable cloud pipelines to train and productionize state-of-the-art predictive and generative models.',
    accentColor: '#818cf8', // Indigo / Purple
    icon: 'BrainCircuit',
    dimensionalWeights: {
      technical: 5,
      analytical: 5,
      creative: 3,
      communication: 3,
      leadership: 2,
      problemSolving: 5,
      data: 5,
      technology: 5,
      socialImpact: 4
    },
    comparison: {
      codingLevel: 'High',
      analyticalSkills: 'High',
      creativity: 'Moderate',
      communication: 'Moderate',
      duration: '12 - 18 Months',
      typicalRoles: ['Machine Learning Engineer', 'LLM Application Developer', 'Computer Vision Specialist', 'AI Research Engineer'],
      avgSalary: '$148,000 / yr',
      growthOutlook: '+38% (Extremely high demand)',
      workStyle: 'Model experimentation, benchmark evaluations, MLOps orchestration',
      topTools: ['Python', 'PyTorch', 'Hugging Face', 'LangChain/LlamaIndex', 'TensorFlow', 'MLflow', 'CUDA']
    },
    roadmap: [
      {
        step: 1,
        phase: 'Mathematical Foundations',
        title: 'Linear Algebra, Calculus & Python',
        duration: 'Month 1 - 3',
        keySkills: ['Linear Algebra & Matrix Ops', 'Multivariable Calculus', 'Probability & Statistics', 'NumPy & Pandas Vectorization'],
        recommendedProject: 'Algorithmic Neural Network built from scratch in pure NumPy with backpropagation',
        certificationOrResource: 'Mathematics for Machine Learning Specialization (Imperial College London)'
      },
      {
        step: 2,
        phase: 'Classical Machine Learning',
        title: 'Supervised, Unsupervised & Evaluation',
        duration: 'Month 4 - 6',
        keySkills: ['Scikit-Learn', 'Feature Engineering', 'Gradient Boosted Trees (XGBoost)', 'Model Validation & ROC/AUC'],
        recommendedProject: 'Kaggle Competition Pipeline: Credit Default Risk or Healthcare Diagnostic Predictor',
        certificationOrResource: 'Machine Learning Specialization by Andrew Ng (DeepLearning.AI)'
      },
      {
        step: 3,
        phase: 'Deep Learning & Transformers',
        title: 'PyTorch, Neural Nets & LLMs',
        duration: 'Month 7 - 10',
        keySkills: ['PyTorch Framework', 'Convolutional & Recurrent Nets', 'Transformer Self-Attention Mechanisms', 'Hugging Face Ecosystem'],
        recommendedProject: 'Domain-specific Semantic Search & Question-Answering System with RAG and Vector DBs',
        certificationOrResource: 'Deep Learning Specialization (DeepLearning.AI)'
      },
      {
        step: 4,
        phase: 'MLOps & Agentic Systems',
        title: 'Production Deployment & Generative AI',
        duration: 'Month 11 - 18',
        keySkills: ['Fine-Tuning (LoRA / QLoRA)', 'FastAPI Model Serving', 'Docker / Triton Inference Server', 'Autonomous Agent Workflows'],
        recommendedProject: 'Production Autonomous Research Agent that fetches papers, generates syntheses, and serves an API',
        certificationOrResource: 'AWS Certified Machine Learning - Specialty'
      }
    ],
    courses: [
      { name: 'DeepLearning.AI Deep Learning Specialization', provider: 'Coursera / Andrew Ng', level: 'Intermediate', duration: '4 months', badge: 'Gold Standard' },
      { name: 'Hugging Face Deep RL & NLP Course', provider: 'Hugging Face', level: 'Intermediate', duration: 'Self-paced', badge: 'Free Open Source' },
      { name: 'Full Stack Deep Learning (LLM Bootcamp)', provider: 'FSDL', level: 'Advanced', duration: '6 weeks' }
    ],
    skillsRequired: ['Python & PyTorch', 'Transformers & Attention Mechanisms', 'RAG & Vector Embeddings', 'Model Evaluation & Optimization', 'Cloud GPU Infrastructure'],
    emergingTrends: ['Reasoning models & multi-agent systems', 'Small Language Models (SLMs) on edge devices', 'Diffusion models & multi-modal intelligence']
  },
  {
    id: 'data-scientist',
    title: 'Data Scientist & Analytics Lead',
    category: 'Data & AI',
    tagline: 'Transform messy raw data into decisive strategic decisions and predictive forecasts.',
    description: 'Unlocks actionable insights hidden within complex datasets. Combines rigorous statistical testing, econometric modeling, machine learning, and data storytelling to influence million-dollar business decisions.',
    accentColor: '#06b6d4', // Cyan
    icon: 'BarChart3',
    dimensionalWeights: {
      technical: 4,
      analytical: 5,
      creative: 3,
      communication: 4,
      leadership: 3,
      problemSolving: 4,
      data: 5,
      technology: 4,
      socialImpact: 3
    },
    comparison: {
      codingLevel: 'Moderate',
      analyticalSkills: 'High',
      creativity: 'Moderate',
      communication: 'High',
      duration: '9 - 14 Months',
      typicalRoles: ['Data Scientist', 'Quantitative Analyst', 'Decision Science Lead', 'Product Analytics Specialist'],
      avgSalary: '$126,000 / yr',
      growthOutlook: '+32% (Very high demand)',
      workStyle: 'Exploratory data analysis, hypothesis testing, executive briefings',
      topTools: ['Python', 'SQL', 'R', 'Tableau / PowerBI', 'Scikit-Learn', 'Snowflake', 'BigQuery']
    },
    roadmap: [
      {
        step: 1,
        phase: 'Data Wrangling & SQL',
        title: 'Relational Queries & Python Analytics',
        duration: 'Month 1 - 3',
        keySkills: ['Advanced SQL (Window Functions, CTEs)', 'Python (Pandas, NumPy)', 'Exploratory Data Analysis', 'Data Cleaning & Imputation'],
        recommendedProject: 'Comprehensive Global Economic & Climate Analytics Dashboard',
        certificationOrResource: 'Google Data Analytics Professional Certificate'
      },
      {
        step: 2,
        phase: 'Applied Statistics',
        title: 'Inference, A/B Testing & Modeling',
        duration: 'Month 4 - 6',
        keySkills: ['Hypothesis Testing (t-tests, ANOVA)', 'Experimentation & A/B Testing Design', 'Linear & Logistic Regression', 'Time Series Forecasting (ARIMA, Prophet)'],
        recommendedProject: 'E-commerce Conversion A/B Testing Simulation with Confidence Intervals and Sample Sizing',
        certificationOrResource: 'IBM Data Science Professional Certificate'
      },
      {
        step: 3,
        phase: 'Machine Learning & Clustering',
        title: 'Predictive Modeling & Segmentation',
        duration: 'Month 7 - 9',
        keySkills: ['Customer Churn Prediction', 'Clustering (K-Means, DBSCAN)', 'Ensemble Methods (Random Forest, LightGBM)', 'Dimensionality Reduction (PCA, t-SNE)'],
        recommendedProject: 'Customer Lifetime Value (LTV) & Churn Prediction System with Explainable AI (SHAP)',
        certificationOrResource: 'Applied Data Science with Python (University of Michigan)'
      },
      {
        step: 4,
        phase: 'Executive Storytelling',
        title: 'Business Dashboards & Cloud Data Warehouses',
        duration: 'Month 10 - 14',
        keySkills: ['Tableau / Power BI / Streamlit', 'Snowflake / BigQuery Cloud DWH', 'Data Storytelling & Executive Pitching', 'Data Governance'],
        recommendedProject: 'Live Interactive Portfolio: Streamlit SaaS Metrics Suite connected to live cloud database',
        certificationOrResource: 'Snowflake SnowPro Core Certification'
      }
    ],
    courses: [
      { name: 'Google Advanced Data Analytics Certificate', provider: 'Coursera / Google', level: 'Intermediate', duration: '6 months', badge: 'Top Rated' },
      { name: 'Statistical Learning with Python', provider: 'Stanford Online', level: 'Intermediate', duration: '10 weeks', badge: 'Academic Rigor' },
      { name: 'Storytelling with Data Masterclass', provider: 'StorytellingWithData', level: 'All Levels', duration: 'Self-paced' }
    ],
    skillsRequired: ['Advanced SQL & Query Optimization', 'Python (Pandas, Scikit-Learn)', 'Hypothesis Testing & Experimentation', 'Data Visualization & Storytelling', 'Statistical Modeling'],
    emergingTrends: ['AI-driven automated analytics & text-to-SQL', 'Causal inference in decision science', 'Real-time streaming analytics (Kafka, ClickHouse)']
  },
  {
    id: 'ui-ux-designer',
    title: 'UI/UX & Digital Product Designer',
    category: 'Design',
    tagline: 'Craft delightful user journeys, design systems, and intuitive interfaces.',
    description: 'Advocates for the human user in every digital experience. Conducts qualitative user research, builds design systems, designs interactive prototypes, and balances visual aesthetics with usability heuristics.',
    accentColor: '#ec4899', // Vibrant Pink / Rose
    icon: 'Palette',
    dimensionalWeights: {
      technical: 2,
      analytical: 3,
      creative: 5,
      communication: 5,
      leadership: 3,
      problemSolving: 4,
      data: 2,
      technology: 3,
      socialImpact: 4
    },
    comparison: {
      codingLevel: 'Low',
      analyticalSkills: 'Moderate',
      creativity: 'High',
      communication: 'High',
      duration: '6 - 10 Months',
      typicalRoles: ['UI/UX Designer', 'Product Designer', 'Design Systems Engineer', 'UX Researcher'],
      avgSalary: '$105,000 / yr',
      growthOutlook: '+20% (Steady high demand)',
      workStyle: 'Figma prototyping, usability testing sessions, design crits, design tokens',
      topTools: ['Figma', 'Framer', 'FigJam', 'Principle', 'Adobe Creative Cloud', 'Miro', 'CSS/Tokens']
    },
    roadmap: [
      {
        step: 1,
        phase: 'UX Foundations & Research',
        title: 'User-Centered Design & Heuristics',
        duration: 'Month 1 - 2',
        keySkills: ['Nielsen Norman Heuristics', 'User Personas & Journey Mapping', 'Information Architecture', 'Usability Testing & User Interviews'],
        recommendedProject: 'Complete UX Case Study: Redesigning a frustrating municipal or banking web application',
        certificationOrResource: 'Google UX Design Professional Certificate'
      },
      {
        step: 2,
        phase: 'Visual UI & Typography',
        title: 'Design Systems & Component Libraries',
        duration: 'Month 3 - 4',
        keySkills: ['Typography Scales & Color Theory', 'Figma Auto-Layout & Variables', 'Responsive Grid Systems', 'Design Tokens & Atomic Design'],
        recommendedProject: 'Scalable Design System with 50+ accessible components, dark/light modes, and documentation',
        certificationOrResource: 'Interaction Design Foundation (IxDF) Certification'
      },
      {
        step: 3,
        phase: 'Interaction & Micro-animations',
        title: 'High-Fidelity Prototyping & Motion',
        duration: 'Month 5 - 7',
        keySkills: ['Figma Smart Animate', 'Framer Interactive Sites', 'Micro-interactions & Physics', 'Accessibility Standards (WCAG 2.1 AAA)'],
        recommendedProject: 'Interactive Mobile FinTech App Prototype with fluid micro-interactions and realistic data simulation',
        certificationOrResource: 'Framer Masterclass & Web Accessibility Specialist (WAS)'
      },
      {
        step: 4,
        phase: 'Portfolio & Product Strategy',
        title: 'Case Studies, Handoff & Product Strategy',
        duration: 'Month 8 - 10',
        keySkills: ['Developer Handoff Workflows', 'Design-to-Code collaboration', 'Design Strategy & Product Metrics', 'Polished Portfolio Building'],
        recommendedProject: 'Live Portfolio Website presenting 3 in-depth end-to-end UX/UI Case Studies',
        certificationOrResource: 'Refactoring UI & Nielsen Norman Group Certification'
      }
    ],
    courses: [
      { name: 'Google UX Design Professional Certificate', provider: 'Coursera / Google', level: 'Beginner', duration: '6 months', badge: 'Most Popular' },
      { name: 'Shift Nudge - Advanced Interface Design', provider: 'MDS', level: 'Advanced', duration: '8 weeks', badge: 'Elite Portfolio Quality' },
      { name: 'Interaction Design Foundation - Design System Specialization', provider: 'IxDF', level: 'Intermediate', duration: 'Self-paced' }
    ],
    skillsRequired: ['Figma & Rapid Prototyping', 'User Research & Testing', 'Design Systems & Token Architecture', 'Accessibility & Usability Heuristics', 'Information Architecture'],
    emergingTrends: ['AI-accelerated UI generation & prototyping', 'Spatial UI design for AR/VR headsets', 'Variable fonts & responsive micro-animation physics']
  },
  {
    id: 'cybersecurity-specialist',
    title: 'Cybersecurity Specialist & Ethical Hacker',
    category: 'Security & Cloud',
    tagline: 'Defend critical infrastructure, hunt vulnerabilities, and enforce Zero-Trust defense.',
    description: 'Guards systems against adversarial threats. Conducts penetration tests, security posture evaluations, incident response, and builds automated defensive barricades to protect sensitive user and organizational data.',
    accentColor: '#ef4444', // Red / Crimson
    icon: 'ShieldAlert',
    dimensionalWeights: {
      technical: 5,
      analytical: 5,
      creative: 2,
      communication: 3,
      leadership: 2,
      problemSolving: 5,
      data: 3,
      technology: 5,
      socialImpact: 4
    },
    comparison: {
      codingLevel: 'Moderate',
      analyticalSkills: 'High',
      creativity: 'Moderate',
      communication: 'Moderate',
      duration: '10 - 15 Months',
      typicalRoles: ['Security Analyst (SOC)', 'Penetration Tester / Ethical Hacker', 'Security Engineer', 'Incident Responder'],
      avgSalary: '$122,000 / yr',
      growthOutlook: '+35% (Massive talent shortage)',
      workStyle: 'Threat hunting, vulnerability assessments, capture-the-flag exercises, compliance audits',
      topTools: ['Wireshark', 'Burp Suite', 'Metasploit', 'Nmap', 'Kali Linux', 'Splunk / SIEM', 'Python/Bash']
    },
    roadmap: [
      {
        step: 1,
        phase: 'Networking & OS Internals',
        title: 'TCP/IP, Linux & System Architecture',
        duration: 'Month 1 - 3',
        keySkills: ['TCP/IP Stack, OSI Model, DNS, HTTP/S', 'Linux System Administration & Bash', 'Packet Inspection with Wireshark', 'Operating System Security'],
        recommendedProject: 'Home Lab Network Simulation with isolated VLANs and packet analysis reports',
        certificationOrResource: 'CompTIA Security+ / Network+'
      },
      {
        step: 2,
        phase: 'Defensive Security (Blue Team)',
        title: 'SOC Operations, SIEM & Threat Hunting',
        duration: 'Month 4 - 6',
        keySkills: ['Splunk / Elastic SIEM Log Analysis', 'Intrusion Detection Systems (Snort/Suricata)', 'Incident Response Workflows', 'Endpoint Detection & Response (EDR)'],
        recommendedProject: 'Automated SIEM Alert Pipeline detecting simulated brute-force and SQL injection attacks',
        certificationOrResource: 'Blue Team Level 1 (BTL1) & Cisco Certified CyberOps'
      },
      {
        step: 3,
        phase: 'Offensive Security (Red Team)',
        title: 'Ethical Hacking & Web Vulnerabilities',
        duration: 'Month 7 - 10',
        keySkills: ['OWASP Top 10 Web Exploits', 'Burp Suite Web Proxy Testing', 'Penetration Testing Methodologies', 'Python Scripting for Automating Exploits'],
        recommendedProject: 'Completed 30+ TryHackMe / HackTheBox machines with documented writeups',
        certificationOrResource: 'Certified Ethical Hacker (CEH) / eJPT (Junior Penetration Tester)'
      },
      {
        step: 4,
        phase: 'Cloud & Zero-Trust Defense',
        title: 'Cloud Security Architecture & DevSecOps',
        duration: 'Month 11 - 15',
        keySkills: ['AWS/Azure Cloud Security (IAM, VPCs)', 'Zero-Trust Architecture', 'Container Security (Docker, Kubernetes)', 'Security Automation in CI/CD'],
        recommendedProject: 'Zero-Trust Cloud Infrastructure deployment with automated SAST/DAST security scanning',
        certificationOrResource: 'Offensive Security Certified Professional (OSCP) or AWS Certified Security Specialty'
      }
    ],
    courses: [
      { name: 'Google Cybersecurity Professional Certificate', provider: 'Coursera / Google', level: 'Beginner', duration: '6 months', badge: 'High Career ROI' },
      { name: 'TryHackMe - Complete Cyber Security Path', provider: 'TryHackMe', level: 'Intermediate', duration: 'Hands-on Labs', badge: 'Interactive Practice' },
      { name: 'SANS Institute Security Essentials (SEC401)', provider: 'SANS', level: 'Advanced', duration: 'Rigorous' }
    ],
    skillsRequired: ['Network Protocols & Packet Analysis', 'Linux CLI & Scripting (Python/Bash)', 'OWASP Top 10 Vulnerabilities', 'SIEM & Threat Monitoring', 'Incident Response & Forensics'],
    emergingTrends: ['AI-driven autonomous cyber threats & defensive agents', 'Zero-Trust network architecture', 'Quantum-resistant cryptography standards']
  },
  {
    id: 'cloud-solutions-architect',
    title: 'Cloud Solutions Architect',
    category: 'Security & Cloud',
    tagline: 'Design resilient, high-availability distributed systems in multi-cloud ecosystems.',
    description: 'Strategizes and executes enterprise-scale cloud migrations and infrastructure. Balances cost optimization, fault tolerance, security compliance, and disaster recovery across AWS, Azure, and Google Cloud.',
    accentColor: '#10b981', // Emerald
    icon: 'Cloud',
    dimensionalWeights: {
      technical: 5,
      analytical: 4,
      creative: 2,
      communication: 4,
      leadership: 4,
      problemSolving: 5,
      data: 3,
      technology: 5,
      socialImpact: 2
    },
    comparison: {
      codingLevel: 'Moderate',
      analyticalSkills: 'High',
      creativity: 'Moderate',
      communication: 'High',
      duration: '10 - 16 Months',
      typicalRoles: ['Cloud Architect', 'DevOps Lead', 'Infrastructure Engineer', 'Site Reliability Architect'],
      avgSalary: '$152,000 / yr',
      growthOutlook: '+27% (High enterprise demand)',
      workStyle: 'Architecture review boards, Terraform automation, disaster recovery drills, cost audits',
      topTools: ['AWS / GCP / Azure', 'Terraform', 'Kubernetes', 'Docker', 'Ansible', 'Datadog', 'Prometheus']
    },
    roadmap: [
      {
        step: 1,
        phase: 'Systems & Virtualization',
        title: 'Linux, Networking & Container Basics',
        duration: 'Month 1 - 3',
        keySkills: ['Linux Systems Administration', 'VPC, Subnets, Gateways, Route Tables', 'Docker Container Architecture', 'Bash & Python Automation'],
        recommendedProject: 'Containerized Multi-Tier Web Application deployed on self-managed VM with reverse proxy',
        certificationOrResource: 'Linux Professional Institute Certification (LPIC-1)'
      },
      {
        step: 2,
        phase: 'Cloud Core Services',
        title: 'Compute, Storage & Managed Databases',
        duration: 'Month 4 - 7',
        keySkills: ['AWS EC2, S3, RDS, DynamoDB', 'IAM & Cloud Security Governance', 'Auto-scaling & Load Balancers (ALB/NLB)', 'Serverless (AWS Lambda, EventBridge)'],
        recommendedProject: 'Serverless Event-Driven Processing Engine handling 10,000 requests/minute',
        certificationOrResource: 'AWS Certified Solutions Architect - Associate'
      },
      {
        step: 3,
        phase: 'Infrastructure as Code',
        title: 'Terraform, GitOps & Orchestration',
        duration: 'Month 8 - 11',
        keySkills: ['HashiCorp Terraform (HCL)', 'Kubernetes (K8s) Cluster Architecture', 'Helm Charts', 'GitOps with ArgoCD'],
        recommendedProject: 'Production Infrastructure as Code repository creating full VPC, K8s cluster, and monitoring via one CLI command',
        certificationOrResource: 'HashiCorp Certified: Terraform Associate'
      },
      {
        step: 4,
        phase: 'Enterprise Architecture',
        title: 'High Availability, FinOps & Multi-Region Resilience',
        duration: 'Month 12 - 16',
        keySkills: ['Active-Active Multi-Region Disaster Recovery', 'FinOps Cloud Cost Optimization', 'Zero-Downtime Migration Strategies', 'Observability (Prometheus/Grafana)'],
        recommendedProject: 'Resilient Multi-Region Cloud Architecture with automated failover and cost-savings telemetry',
        certificationOrResource: 'AWS Certified Solutions Architect - Professional'
      }
    ],
    courses: [
      { name: 'AWS Certified Solutions Architect Path', provider: 'A Cloud Guru / Coursera', level: 'Intermediate', duration: '3 months', badge: 'High Value' },
      { name: 'Terraform for AWS & Multi-Cloud', provider: 'Udemy', level: 'Intermediate', duration: '20 hours' },
      { name: 'Kubernetes for the Absolute Beginners & Beyond', provider: 'KodeKloud', level: 'Beginner to Advanced', duration: 'Self-paced' }
    ],
    skillsRequired: ['Cloud Infrastructure (AWS/GCP/Azure)', 'Infrastructure as Code (Terraform)', 'Kubernetes & Container Orchestration', 'Networking & Cloud Security', 'Cost Optimization & FinOps'],
    emergingTrends: ['Platform engineering & Internal Developer Platforms (IDPs)', 'Serverless edge compute', 'AI workload hosting and GPU cloud clusters']
  },
  {
    id: 'product-manager',
    title: 'Technical Product Manager',
    category: 'Business & Strategy',
    tagline: 'Define product vision, align cross-functional teams, and launch market-defining software.',
    description: 'The strategic intersection of technology, user experience, and business growth. Gathers market intelligence, writes technical specifications, prioritizes feature backlogs, and drives sprint execution.',
    accentColor: '#f59e0b', // Warm Amber
    icon: 'Briefcase',
    dimensionalWeights: {
      technical: 3,
      analytical: 4,
      creative: 4,
      communication: 5,
      leadership: 5,
      problemSolving: 4,
      data: 4,
      technology: 4,
      socialImpact: 3
    },
    comparison: {
      codingLevel: 'Low',
      analyticalSkills: 'High',
      creativity: 'High',
      communication: 'High',
      duration: '8 - 12 Months',
      typicalRoles: ['Associate Product Manager', 'Technical Product Manager', 'Product Lead', 'Director of Product'],
      avgSalary: '$135,000 / yr',
      growthOutlook: '+22% (Critical strategic role)',
      workStyle: 'Sprint planning, customer discovery calls, PRD drafting, executive roadmap presentations',
      topTools: ['Jira', 'Notion', 'Mixpanel / Amplitude', 'Figma', 'Linear', 'SQL', 'Postman']
    },
    roadmap: [
      {
        step: 1,
        phase: 'Product Fundamentals',
        title: 'Market Research & Customer Discovery',
        duration: 'Month 1 - 3',
        keySkills: ['Customer Problem Discovery', 'Jobs To Be Done (JTBD) Framework', 'Competitive Intelligence', 'Writing Product Requirements Documents (PRDs)'],
        recommendedProject: 'Comprehensive PRD for an innovative AI-driven educational tool with mock wireframes',
        certificationOrResource: 'Product School: Certified Product Manager (CPM)'
      },
      {
        step: 2,
        phase: 'Technical Fluency',
        title: 'APIs, System Architecture & Engineering Collaboration',
        duration: 'Month 4 - 6',
        keySkills: ['Understanding REST & GraphQL APIs', 'System Architecture basics', 'Estimating Engineering Effort', 'Working with Technical Leads'],
        recommendedProject: 'API Product Specification with Postman collections and developer documentation',
        certificationOrResource: 'One Month PM: Tech for Product Managers'
      },
      {
        step: 3,
        phase: 'Data & Growth Metrics',
        title: 'Product Analytics, Funnels & Experimentation',
        duration: 'Month 7 - 9',
        keySkills: ['Funnel Analysis (Mixpanel/Amplitude)', 'Cohort Retention & Churn Analysis', 'A/B Testing Hypothesis Formation', 'North Star Metric Alignment'],
        recommendedProject: 'Product Analytics Audit: Diagnosing user drop-offs in a live onboarding flow with actionable solutions',
        certificationOrResource: 'Reforge Product Strategy & Growth Series'
      },
      {
        step: 4,
        phase: 'Executive Leadership',
        title: 'Roadmapping, Pricing & Go-To-Market (GTM)',
        duration: 'Month 10 - 12',
        keySkills: ['Strategic Roadmapping & Prioritization (RICE/MoSCoW)', 'Pricing & Packaging Models', 'Cross-Functional Stakeholder Management', 'Go-To-Market Launches'],
        recommendedProject: 'Full Product Pitch Deck & Go-to-Market Strategy presented to startup mentors',
        certificationOrResource: 'Northwestern Kellogg: Product Strategy Executive Program'
      }
    ],
    courses: [
      { name: 'Become a Product Manager', provider: 'Udemy / Cole Mercer', level: 'Beginner', duration: '13 hours', badge: 'Best Seller' },
      { name: 'Google Project Management Professional Certificate', provider: 'Coursera / Google', level: 'Beginner', duration: '6 months' },
      { name: 'Product Analytics Certification (PAC)', provider: 'Product School', level: 'Intermediate', duration: 'Self-paced' }
    ],
    skillsRequired: ['Product Roadmapping & Prioritization', 'Data Analytics & Metric Design', 'Technical Systems Comprehension', 'Cross-Functional Leadership', 'User Research & Discovery'],
    emergingTrends: ['AI-native product development cycles', 'Product-led growth (PLG) micro-loops', 'Automated customer feedback synthesis with LLMs']
  },
  {
    id: 'devops-sre-engineer',
    title: 'DevOps & Site Reliability Engineer (SRE)',
    category: 'Engineering',
    tagline: 'Automate build pipelines, guarantee five-nines uptime, and orchestrate systems.',
    description: 'The guardians of software delivery speed and platform resilience. Builds CI/CD highways, orchestrates containers, sets up automated self-healing clusters, and handles real-time incident triage.',
    accentColor: '#3b82f6', // Royal Blue
    icon: 'Cpu',
    dimensionalWeights: {
      technical: 5,
      analytical: 4,
      creative: 2,
      communication: 3,
      leadership: 3,
      problemSolving: 5,
      data: 3,
      technology: 5,
      socialImpact: 2
    },
    comparison: {
      codingLevel: 'High',
      analyticalSkills: 'High',
      creativity: 'Low',
      communication: 'Moderate',
      duration: '9 - 14 Months',
      typicalRoles: ['DevOps Engineer', 'Site Reliability Engineer (SRE)', 'Platform Engineer', 'Build & Release Lead'],
      avgSalary: '$132,000 / yr',
      growthOutlook: '+26% (Very high industry need)',
      workStyle: 'Automating pipelines, chaos engineering, on-call incident triage, telemetry dashboards',
      topTools: ['Kubernetes', 'Docker', 'GitHub Actions', 'Terraform', 'Prometheus', 'Grafana', 'Go/Python']
    },
    roadmap: [
      {
        step: 1,
        phase: 'Automation & Scripting',
        title: 'Linux Mastery & Python/Go Scripting',
        duration: 'Month 1 - 3',
        keySkills: ['Linux System Administration', 'Bash Shell Scripting', 'Python Automation Scripts', 'Git Branching & Release Management'],
        recommendedProject: 'Automated System Health & Backup Daemon with instant Slack alerting',
        certificationOrResource: 'Linux Foundation Certified System Administrator (LFCS)'
      },
      {
        step: 2,
        phase: 'CI/CD Pipelines & Containers',
        title: 'Docker & GitHub Actions Highways',
        duration: 'Month 4 - 6',
        keySkills: ['Multi-Stage Docker Builds', 'GitHub Actions / GitLab CI', 'Automated Testing Gates', 'Artifact Registries'],
        recommendedProject: 'Production CI/CD Pipeline deploying microservices to staging and prod with zero downtime',
        certificationOrResource: 'Docker Certified Associate (DCA)'
      },
      {
        step: 3,
        phase: 'Kubernetes & Cloud Infrastructure',
        title: 'K8s Cluster Orchestration & Helm',
        duration: 'Month 7 - 10',
        keySkills: ['Kubernetes Deployments, Services, Ingress', 'Helm Packaging', 'Service Meshes (Istio/Linkerd)', 'ConfigMaps & Secrets Management'],
        recommendedProject: 'High-availability K8s Cluster with automated horizontal pod autoscaling under load testing',
        certificationOrResource: 'Certified Kubernetes Administrator (CKA)'
      },
      {
        step: 4,
        phase: 'Observability & Chaos Engineering',
        title: 'Prometheus, Grafana & Reliability',
        duration: 'Month 11 - 14',
        keySkills: ['SLIs, SLOs, SLAs Calculation', 'Prometheus Metrics & Alertmanager', 'Distributed Tracing (OpenTelemetry/Jaeger)', 'Chaos Engineering (Chaos Mesh)'],
        recommendedProject: 'Complete Observability Stack with automated rollback triggers during canary deployment failures',
        certificationOrResource: 'Google Cloud Certified Professional Cloud DevOps Engineer'
      }
    ],
    courses: [
      { name: 'DevOps on AWS Specialization', provider: 'Coursera / AWS', level: 'Intermediate', duration: '4 months', badge: 'Hands-on Cloud' },
      { name: 'Certified Kubernetes Administrator (CKA) with Practice Tests', provider: 'Udemy / Mumshad', level: 'Intermediate', duration: '22 hours', badge: 'Top Rated' },
      { name: 'Site Reliability Engineering: Measuring and Managing Reliability', provider: 'Coursera / Google Cloud', level: 'Intermediate', duration: '4 weeks' }
    ],
    skillsRequired: ['Kubernetes & Container Orchestration', 'CI/CD Pipeline Automation', 'Infrastructure as Code (Terraform)', 'Monitoring & Telemetry (Prometheus/Grafana)', 'Linux Scripting (Bash/Python/Go)'],
    emergingTrends: ['GitOps automation with ArgoCD', 'AI-assisted log anomaly detection', 'Internal Developer Portals (Backstage)']
  },
  {
    id: 'bi-strategy-consultant',
    title: 'Business Intelligence & Strategy Consultant',
    category: 'Business & Strategy',
    tagline: 'Bridge enterprise operations with data dashboards to drive revenue growth.',
    description: 'Designs executive dashboards, models commercial KPIs, streamlines operational bottlenecks, and translates complex financial data into concise recommendations for C-suite leaders.',
    accentColor: '#14b8a6', // Teal
    icon: 'TrendingUp',
    dimensionalWeights: {
      technical: 3,
      analytical: 5,
      creative: 3,
      communication: 5,
      leadership: 4,
      problemSolving: 4,
      data: 5,
      technology: 3,
      socialImpact: 3
    },
    comparison: {
      codingLevel: 'Low',
      analyticalSkills: 'High',
      creativity: 'Moderate',
      communication: 'High',
      duration: '6 - 9 Months',
      typicalRoles: ['BI Analyst', 'Strategy Consultant', 'Operations Lead', 'Revenue Operations Manager'],
      avgSalary: '$112,000 / yr',
      growthOutlook: '+21% (High demand across all sectors)',
      workStyle: 'Stakeholder discovery workshops, SQL optimization, KPI dashboard reviews, board presentations',
      topTools: ['Power BI', 'Tableau', 'SQL', 'Excel / Financial Modeling', 'Snowflake', 'dbt']
    },
    roadmap: [
      {
        step: 1,
        phase: 'Data Modeling & Advanced SQL',
        title: 'Star Schemas & Analytical SQL',
        duration: 'Month 1 - 2',
        keySkills: ['Dimensional Modeling (Kimball Methodology)', 'Advanced SQL Window Functions & Aggregations', 'Data Hygiene & Quality Checks', 'Relational Schema Design'],
        recommendedProject: 'Enterprise Sales & Inventory Dimensional Data Model with Star Schema',
        certificationOrResource: 'Microsoft Power BI Data Analyst (PL-300)'
      },
      {
        step: 2,
        phase: 'Visualization & Dashboard Architecture',
        title: 'Power BI & Tableau Storytelling',
        duration: 'Month 3 - 4',
        keySkills: ['DAX & Power Query', 'Tableau Calculated Fields & LODs', 'UX Principles for Executive Dashboards', 'Drill-through Interactive Filters'],
        recommendedProject: 'Executive Boardroom KPI Dashboard with real-time churn, ARR, and CAC telemetry',
        certificationOrResource: 'Tableau Certified Data Analyst'
      },
      {
        step: 3,
        phase: 'Analytics Engineering with dbt',
        title: 'Modern Data Stack & Cloud Warehouses',
        duration: 'Month 5 - 6',
        keySkills: ['dbt (data build tool) Core', 'Snowflake / BigQuery Workspaces', 'Version-Controlled SQL Transformation', 'Data Lineage & Documentation'],
        recommendedProject: 'Production dbt project modeling marketing attribution with automated tests and CI checks',
        certificationOrResource: 'dbt Fundamentals Certification'
      },
      {
        step: 4,
        phase: 'Strategic Consulting & Advisory',
        title: 'Financial Modeling & Stakeholder Advisory',
        duration: 'Month 7 - 9',
        keySkills: ['Financial Modeling & Unit Economics', 'Change Management & Stakeholder Alignment', 'Executive Presentation Deck Design', 'ROI Calculation'],
        recommendedProject: 'Comprehensive Strategic Turnaround Proposal for a declining subscription platform with full financial model',
        certificationOrResource: 'Wharton Business Analytics Specialization'
      }
    ],
    courses: [
      { name: 'Microsoft Power BI Data Analyst (PL-300)', provider: 'Microsoft Learn / Coursera', level: 'Beginner to Intermediate', duration: '3 months', badge: 'Official Microsoft' },
      { name: 'Business Analytics Specialization', provider: 'Coursera / Univ of Pennsylvania (Wharton)', level: 'Beginner', duration: '4 months' },
      { name: 'The Complete SQL Bootcamp', provider: 'Udemy', level: 'Beginner', duration: '9 hours' }
    ],
    skillsRequired: ['Power BI / Tableau Dashboard Mastery', 'Advanced SQL & Data Modeling (dbt)', 'Business KPI & Unit Economics Analysis', 'Stakeholder Communication & Storytelling', 'Cloud Warehouses (Snowflake)'],
    emergingTrends: ['Self-serve conversational analytics with AI agents', 'Reverse ETL to CRM (Hightouch/Census)', 'Real-time metrics layer adoption']
  },
  {
    id: 'creative-technologist',
    title: 'Creative Technologist & AR/VR Developer',
    category: 'Design',
    tagline: 'Merge code and imagination to build interactive 3D, spatial, and generative installations.',
    description: 'Works at the border of code, interactive design, and multimedia art. Creates spatial computing experiences, WebGL 3D web apps, immersive games, and experiential digital installations.',
    accentColor: '#a855f7', // Purple
    icon: 'Sparkles',
    dimensionalWeights: {
      technical: 4,
      analytical: 3,
      creative: 5,
      communication: 4,
      leadership: 2,
      problemSolving: 4,
      data: 2,
      technology: 5,
      socialImpact: 3
    },
    comparison: {
      codingLevel: 'High',
      analyticalSkills: 'Moderate',
      creativity: 'High',
      communication: 'Moderate',
      duration: '10 - 15 Months',
      typicalRoles: ['Creative Technologist', 'WebGL / Three.js Developer', 'AR/VR Interaction Engineer', 'Technical Artist'],
      avgSalary: '$116,000 / yr',
      growthOutlook: '+23% (High growth in spatial computing)',
      workStyle: 'Shader coding, 3D modeling, interactive physics prototyping, gallery & agency projects',
      topTools: ['Three.js / React Three Fiber', 'Unity / C#', 'Blender', 'GLSL Shaders', 'Unreal Engine 5', 'WebGPU']
    },
    roadmap: [
      {
        step: 1,
        phase: 'Web 3D & Math Basics',
        title: 'Three.js, WebGL & Coordinate Systems',
        duration: 'Month 1 - 3',
        keySkills: ['3D Vector Mathematics & Matrices', 'Three.js Scene, Camera, Light Setup', 'React Three Fiber (R3F)', '3D Model Optimization (GLTF/GLB)'],
        recommendedProject: 'Interactive 3D Product Showcase with camera animations, reflections, and physics',
        certificationOrResource: 'Three.js Journey by Bruno Simon (Industry Benchmark)'
      },
      {
        step: 2,
        phase: 'Shaders & Creative Coding',
        title: 'GLSL Shaders & Visual Effects',
        duration: 'Month 4 - 6',
        keySkills: ['Vertex and Fragment Shaders', 'Noise Functions & Procedural Texturing', 'Post-processing Bloom & Depth of Field', 'Audio-reactive Visuals'],
        recommendedProject: 'Interactive Audio-Reactive WebGL Fluid Simulation reacting to microphone frequencies',
        certificationOrResource: 'The Book of Shaders & Creative Applications Network'
      },
      {
        step: 3,
        phase: 'Game Engines & Spatial Computing',
        title: 'Unity, C# & Spatial Interaction',
        duration: 'Month 7 - 10',
        keySkills: ['Unity Engine Architecture & C#', 'XR Interaction Toolkit (Meta Quest / Apple Vision)', 'Physics & Collision Systems', 'Spatial Audio Design'],
        recommendedProject: 'Spatial AR Education Experience allowing users to dismantle and inspect a virtual jet engine',
        certificationOrResource: 'Unity Certified Associate Game Developer'
      },
      {
        step: 4,
        phase: 'WebGPU & Next-Gen Realities',
        title: 'Next-Gen Performance & Spatial Portfolios',
        duration: 'Month 11 - 15',
        keySkills: ['WebGPU API Compute Shaders', 'Multi-user WebXR with WebSockets', 'Technical Art Pipelines in Blender', 'Interactive Portfolio Launch'],
        recommendedProject: 'Award-winning interactive WebGL portfolio demonstrating 3D storytelling and spatial audio',
        certificationOrResource: 'Meta Spark AR Certification & Unreal Fellowship'
      }
    ],
    courses: [
      { name: 'Three.js Journey', provider: 'Bruno Simon', level: 'Beginner to Advanced', duration: '70+ hours', badge: 'Legendary Resource' },
      { name: 'Unity XR: How to Build AR and VR Apps', provider: 'Coursera / Unity', level: 'Intermediate', duration: '3 months' },
      { name: 'Blender 3D Modeling to Game Engine Pipeline', provider: 'Udemy', level: 'Intermediate', duration: '18 hours' }
    ],
    skillsRequired: ['Three.js & React Three Fiber', 'GLSL Shader Programming', 'Unity / Unreal Engine with C# / C++', '3D Math (Vectors, Quaternions)', 'Blender Asset Pipeline'],
    emergingTrends: ['WebGPU graphics standard adoption', 'Spatial computing for Apple Vision Pro & Quest 3', 'Generative 3D Gaussian Splatting']
  },
  {
    id: 'data-privacy-compliance',
    title: 'Data Privacy & Tech Governance Specialist',
    category: 'Security & Cloud',
    tagline: 'Safeguard digital rights, enforce AI governance, and ensure legal-tech compliance.',
    description: 'Ensures emerging technologies, cloud platforms, and generative AI models adhere to international privacy legislation (GDPR, CCPA, EU AI Act). Shapes ethical risk strategies for enterprises.',
    accentColor: '#64748b', // Slate
    icon: 'Scale',
    dimensionalWeights: {
      technical: 3,
      analytical: 4,
      creative: 2,
      communication: 5,
      leadership: 4,
      problemSolving: 4,
      data: 4,
      technology: 4,
      socialImpact: 5
    },
    comparison: {
      codingLevel: 'Low',
      analyticalSkills: 'High',
      creativity: 'Low',
      communication: 'High',
      duration: '6 - 10 Months',
      typicalRoles: ['Privacy Engineer', 'Data Protection Officer (DPO)', 'AI Ethics Officer', 'Compliance Analyst'],
      avgSalary: '$115,000 / yr',
      growthOutlook: '+28% (Accelerated by global AI regulations)',
      workStyle: 'Policy drafting, privacy impact assessments (PIA), data mapping audits, legal-tech alignment',
      topTools: ['OneTrust', 'BigID', 'WireWheel', 'Jira', 'SQL', 'Python for Privacy Auditing']
    },
    roadmap: [
      {
        step: 1,
        phase: 'Regulatory Frameworks',
        title: 'GDPR, CCPA & Privacy Principles',
        duration: 'Month 1 - 2',
        keySkills: ['GDPR 7 Principles', 'CCPA/CPRA Consumer Rights', 'Privacy By Design Architecture', 'Data Subject Access Requests (DSARs)'],
        recommendedProject: 'Comprehensive GDPR Compliance Audit and Data Flow Map for a mock SaaS platform',
        certificationOrResource: 'IAPP Certified Information Privacy Professional (CIPP/E or CIPP/US)'
      },
      {
        step: 2,
        phase: 'Technical Privacy Engineering',
        title: 'Data Anonymization & Security Controls',
        duration: 'Month 3 - 5',
        keySkills: ['Differential Privacy Basics', 'Data Masking & Tokenization', 'Access Control & IAM Governance', 'Data Retention Lifecycle Policies'],
        recommendedProject: 'Automated Python script scanning databases for unmasked PII and generating risk scores',
        certificationOrResource: 'IAPP Certified Information Privacy Technologist (CIPT)'
      },
      {
        step: 3,
        phase: 'AI Governance & Ethics',
        title: 'EU AI Act, Bias Audits & Responsible AI',
        duration: 'Month 6 - 8',
        keySkills: ['EU AI Act Risk Tiers (Unacceptable, High, Minimal)', 'Algorithmic Bias Testing', 'Model Explainability (XAI)', 'AI Safety Red-Teaming'],
        recommendedProject: 'Responsible AI Risk Assessment Framework evaluating a medical diagnostic model',
        certificationOrResource: 'IAPP Certified Artificial Intelligence Governance Professional (AIGP)'
      },
      {
        step: 4,
        phase: 'Enterprise Program Leadership',
        title: 'OneTrust Implementation & C-Suite Advisory',
        duration: 'Month 9 - 10',
        keySkills: ['Enterprise Privacy Platforms (OneTrust)', 'Cross-Border Data Transfer Agreements', 'Boardroom Risk Reporting', 'Crisis Breach Notification Response'],
        recommendedProject: 'Complete Enterprise Privacy & AI Governance Playbook ready for corporate deployment',
        certificationOrResource: 'Certified Information Privacy Manager (CIPM)'
      }
    ],
    courses: [
      { name: 'IAPP CIPP/E & CIPT Privacy Certification Training', provider: 'IAPP / Coursera', level: 'Intermediate', duration: '3 months', badge: 'Gold Standard' },
      { name: 'AI Ethics and Governance Specialization', provider: 'Coursera / Lund University', level: 'Beginner to Intermediate', duration: '2 months' },
      { name: 'Privacy in the Age of Big Data', provider: 'edX / Harvard University', level: 'Intermediate', duration: '6 weeks' }
    ],
    skillsRequired: ['Global Privacy Law (GDPR, CCPA, EU AI Act)', 'Privacy by Design & DPIA Assessments', 'Data Mapping & PII Discovery (OneTrust)', 'AI Ethics & Algorithmic Auditing', 'Executive Risk Communication'],
    emergingTrends: ['Enforcement of the EU Artificial Intelligence Act', 'Synthetic data generation for privacy preservation', 'Automated Privacy-Preserving Machine Learning (PPML)']
  }
];
