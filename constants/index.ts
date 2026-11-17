import { CreateAssistantDTO } from "@vapi-ai/web/dist/api";
import { z } from "zod";

export const mappings = {
  "react.js": "react",
  reactjs: "react",
  react: "react",
  "next.js": "nextjs",
  nextjs: "nextjs",
  next: "nextjs",
  "vue.js": "vuejs",
  vuejs: "vuejs",
  vue: "vuejs",
  "express.js": "express",
  expressjs: "express",
  express: "express",
  "node.js": "nodejs",
  nodejs: "nodejs",
  node: "nodejs",
  mongodb: "mongodb",
  mongo: "mongodb",
  mongoose: "mongoose",
  mysql: "mysql",
  postgresql: "postgresql",
  sqlite: "sqlite",
  firebase: "firebase",
  docker: "docker",
  kubernetes: "kubernetes",
  aws: "aws",
  azure: "azure",
  gcp: "gcp",
  digitalocean: "digitalocean",
  heroku: "heroku",
  photoshop: "photoshop",
  "adobe photoshop": "photoshop",
  html5: "html5",
  html: "html5",
  css3: "css3",
  css: "css3",
  sass: "sass",
  scss: "sass",
  less: "less",
  tailwindcss: "tailwindcss",
  tailwind: "tailwindcss",
  bootstrap: "bootstrap",
  jquery: "jquery",
  typescript: "typescript",
  ts: "typescript",
  javascript: "javascript",
  js: "javascript",
  "angular.js": "angular",
  angularjs: "angular",
  angular: "angular",
  "ember.js": "ember",
  emberjs: "ember",
  ember: "ember",
  "backbone.js": "backbone",
  backbonejs: "backbone",
  backbone: "backbone",
  nestjs: "nestjs",
  graphql: "graphql",
  "graph ql": "graphql",
  apollo: "apollo",
  webpack: "webpack",
  babel: "babel",
  "rollup.js": "rollup",
  rollupjs: "rollup",
  rollup: "rollup",
  "parcel.js": "parcel",
  parceljs: "parcel",
  npm: "npm",
  yarn: "yarn",
  git: "git",
  github: "github",
  gitlab: "gitlab",
  bitbucket: "bitbucket",
  figma: "figma",
  prisma: "prisma",
  redux: "redux",
  flux: "flux",
  redis: "redis",
  selenium: "selenium",
  cypress: "cypress",
  jest: "jest",
  mocha: "mocha",
  chai: "chai",
  karma: "karma",
  vuex: "vuex",
  "nuxt.js": "nuxt",
  nuxtjs: "nuxt",
  nuxt: "nuxt",
  strapi: "strapi",
  wordpress: "wordpress",
  contentful: "contentful",
  netlify: "netlify",
  vercel: "vercel",
  "aws amplify": "amplify",
  python: "python",
  py: "python",
};

export const interviewer: CreateAssistantDTO = {
  name: "Interviewer",
  firstMessage:
    "Hello! Thank you for taking the time to speak with me today. I'm excited to learn more about you and your experience.",
  transcriber: {
    provider: "deepgram",
    model: "nova-2",
    language: "en",
  },
  voice: {
    provider: "11labs",
    voiceId: "sarah",
    stability: 0.4,
    similarityBoost: 0.8,
    speed: 0.9,
    style: 0.5,
    useSpeakerBoost: true,
  },
  model: {
    provider: "groq",
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: `You are a professional job interviewer conducting a real-time voice interview with a candidate. Your goal is to assess their qualifications, motivation, and fit for the role.

Interview Guidelines:
Follow the structured question flow:
{{questions}}

Engage naturally & react appropriately:
Listen actively to responses and acknowledge them before moving forward.
Ask brief follow-up questions if a response is vague or requires more detail.
Keep the conversation flowing smoothly while maintaining control.
Be professional, yet warm and welcoming:

Use official yet friendly language.
Keep responses concise and to the point (like in a real voice interview).
Avoid robotic phrasing—sound natural and conversational.
Answer the candidate’s questions professionally:

If asked about the role, company, or expectations, provide a clear and relevant answer.
If unsure, redirect the candidate to HR for more details.

Conclude the interview properly:
Thank the candidate for their time.
Inform them that the company will reach out soon with feedback.
End the conversation on a polite and positive note.


- Be sure to be professional and polite.
- Keep all your responses short and simple. Use official language, but be kind and welcoming.
- This is a voice conversation, so keep your responses short, like in a real conversation. Don't ramble for too long.`,
      },
    ],
  },
};

export const feedbackSchema = z.object({
  totalScore: z.coerce.number(),
  categoryScores: z.array(
    z.object({
      name: z.string(),
      score: z.coerce.number(),
      comment: z.string(),
    })
  ),
  strengths: z.array(z.string()),
  areasForImprovement: z.array(z.string()),
  finalAssessment: z.string(),
});

export const interviewCovers = [
  "/adobe.png",
  "/amazon.png",
  "/facebook.png",
  "/hostinger.png",
  "/pinterest.png",
  "/quora.png",
  "/reddit.png",
  "/skype.png",
  "/spotify.png",
  "/telegram.png",
  "/tiktok.png",
  "/yahoo.png",
];

export const defaultInterviews: Interview[] = [
  {
    id: "interview-frontend-react",
    userId: "system-prepwise",
    role: "Frontend Engineer",
    type: "Technical",
    level: "Mid-Level",
    techstack: ["React", "TypeScript", "Next.js", "Tailwind CSS"],
    questions: [
      "Can you explain the difference between client-side rendering and server-side rendering in React and Next.js?",
      "How do you optimize bundle size and prevent unnecessary component re-renders?",
      "How do you manage complex asynchronous state and cache management in a large web app?",
      "Describe your approach to building responsive, accessible UI components with modern CSS.",
    ],
    finalized: true,
    coverImage: "/covers/facebook.png",
    createdAt: "2024-04-10T10:00:00Z",
  },
  {
    id: "interview-backend-node",
    userId: "system-prepwise",
    role: "Backend Engineer",
    type: "Technical",
    level: "Senior",
    techstack: ["Node.js", "Express", "PostgreSQL", "Redis"],
    questions: [
      "How does the Node.js event loop operate, and how do you handle CPU-intensive tasks without blocking it?",
      "How do you design database schema indexes and connection pools for high-concurrency systems?",
      "Explain caching strategies and cache invalidation patterns using Redis.",
      "How do you structure API security, rate limiting, and input validation in production?",
    ],
    finalized: true,
    coverImage: "/covers/amazon.png",
    createdAt: "2024-04-09T14:30:00Z",
  },
  {
    id: "interview-fullstack-mern",
    userId: "system-prepwise",
    role: "Full Stack Developer",
    type: "Mixed",
    level: "Senior",
    techstack: ["React", "Node.js", "MongoDB", "TypeScript"],
    questions: [
      "Walk me through how you design an end-to-end authentication and session management flow with HTTP-only cookies.",
      "How do you architect data models in MongoDB versus relational databases?",
      "Tell me about a complex production bug you traced from the frontend down to the database.",
      "How do you approach automated testing across unit, integration, and end-to-end layers?",
    ],
    finalized: true,
    coverImage: "/covers/hostinger.png",
    createdAt: "2024-04-08T09:15:00Z",
  },
  {
    id: "interview-devops-cloud",
    userId: "system-prepwise",
    role: "DevOps & Cloud Engineer",
    type: "Technical",
    level: "Senior",
    techstack: ["Docker", "Kubernetes", "AWS", "GitHub Actions"],
    questions: [
      "How do you set up a zero-downtime CI/CD deployment pipeline with automated rollback capabilities?",
      "Explain Kubernetes Pod autoscaling, ingress controllers, and resource requests versus limits.",
      "How do you secure cloud infrastructure using least-privilege IAM policies and secrets management?",
      "How do you monitor distributed systems and configure alerting with Prometheus and Grafana?",
    ],
    finalized: true,
    coverImage: "/covers/adobe.png",
    createdAt: "2024-04-07T16:45:00Z",
  },
  {
    id: "interview-ai-engineer",
    userId: "system-prepwise",
    role: "AI / ML Engineer",
    type: "Technical",
    level: "Mid-Level",
    techstack: ["Python", "Docker", "PostgreSQL", "AWS"],
    questions: [
      "What are the key architectural trade-offs between prompt engineering, RAG, and model fine-tuning?",
      "How do vector databases perform similarity searches using cosine distance or HNSW indexing?",
      "How do you evaluate and minimize hallucinations and latency in production LLM applications?",
      "How do you deploy, scale, and monitor machine learning models in production?",
    ],
    finalized: true,
    coverImage: "/covers/pinterest.png",
    createdAt: "2024-04-06T11:20:00Z",
  },
  {
    id: "interview-system-architect",
    userId: "system-prepwise",
    role: "System Architect",
    type: "Mixed",
    level: "Lead",
    techstack: ["Docker", "PostgreSQL", "Redis", "AWS"],
    questions: [
      "How would you architect a real-time messaging system supporting 5 million concurrent active connections?",
      "Compare synchronous gRPC/REST APIs with event-driven asynchronous messaging via Kafka or queues.",
      "How do you guarantee idempotency and data consistency in distributed payment processing?",
      "How do you balance technical debt against immediate product delivery deadlines?",
    ],
    finalized: true,
    coverImage: "/covers/quora.png",
    createdAt: "2024-04-05T13:00:00Z",
  },
  {
    id: "interview-mobile-developer",
    userId: "system-prepwise",
    role: "Mobile Developer",
    type: "Technical",
    level: "Mid-Level",
    techstack: ["React", "TypeScript", "Firebase", "Redux"],
    questions: [
      "How does React Native bridge JavaScript code with native iOS and Android modules?",
      "How do you implement offline-first data caching and local state synchronization on mobile devices?",
      "How do you identify and resolve UI stutter and memory leaks in mobile applications?",
      "What is your approach to managing app release cycles and deep linking?",
    ],
    finalized: true,
    coverImage: "/covers/telegram.png",
    createdAt: "2024-04-04T15:10:00Z",
  },
  {
    id: "interview-engineering-manager",
    userId: "system-prepwise",
    role: "Engineering Leader",
    type: "Behavioral",
    level: "Lead",
    techstack: ["Git", "GitHub", "Figma", "AWS"],
    questions: [
      "Tell me about a time you resolved a major technical disagreement between senior engineers.",
      "How do you evaluate engineering velocity while maintaining high code quality and test coverage?",
      "Describe a production incident outage and how you conducted the post-mortem analysis with the team.",
      "How do you support career growth and mentorship for engineers across varying experience levels?",
    ],
    finalized: true,
    coverImage: "/covers/spotify.png",
    createdAt: "2024-04-03T18:00:00Z",
  },
  {
    id: "interview-cybersecurity-engineer",
    userId: "system-prepwise",
    role: "Cybersecurity Engineer",
    type: "Technical",
    level: "Senior",
    techstack: ["AWS", "Docker", "Kubernetes", "Python"],
    questions: [
      "How do you implement a Zero Trust security architecture in distributed cloud-native systems?",
      "Walk me through your incident response workflow when a potential remote code execution vulnerability is identified in production.",
      "What automated tools and processes do you integrate into CI/CD for static/dynamic vulnerability scanning and secret leak prevention?",
      "Explain the trade-offs between symmetric and asymmetric cryptography and how mutual TLS (mTLS) secures microservices.",
    ],
    finalized: true,
    coverImage: "/covers/reddit.png",
    createdAt: "2024-04-02T14:00:00Z",
  },
  {
    id: "interview-data-engineer",
    userId: "system-prepwise",
    role: "Data Engineer",
    type: "Technical",
    level: "Mid-Level",
    techstack: ["Python", "PostgreSQL", "Redis", "AWS"],
    questions: [
      "How do you design and orchestrate fault-tolerant ETL/ELT data pipelines processing millions of daily events?",
      "Compare the trade-offs between batch processing and real-time streaming architectures.",
      "How do you handle schema evolution, backfilling historical data, and data deduplication in a data lake/warehouse?",
      "Explain table partitioning, indexing strategies, and query optimization techniques in relational databases.",
    ],
    finalized: true,
    coverImage: "/covers/yahoo.png",
    createdAt: "2024-04-01T11:30:00Z",
  },
  {
    id: "interview-qa-automation-sdet",
    userId: "system-prepwise",
    role: "QA Automation Engineer",
    type: "Technical",
    level: "Mid-Level",
    techstack: ["Cypress", "Jest", "TypeScript", "Selenium"],
    questions: [
      "How do you design a scalable test automation framework that isolates flaky tests and maintains high execution speed?",
      "What is your approach to managing test data and mocking external third-party API dependencies during automated test runs?",
      "How do you integrate automated regression and smoke testing into the continuous integration pull request cycle?",
      "Explain the testing pyramid and the differences between unit, integration, and contract tests in microservices.",
    ],
    finalized: true,
    coverImage: "/covers/skype.png",
    createdAt: "2024-03-31T09:00:00Z",
  },
];

export const dummyInterviews: Interview[] = defaultInterviews;
