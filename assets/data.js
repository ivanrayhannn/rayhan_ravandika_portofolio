/*
 * Portfolio content — edit this file to update the site.
 * Items marked "TODO" are placeholders to replace with your real details.
 */
window.PORTFOLIO = {
  name: "Rayhan Ravandika",
  role: "Business System Analyst",
  tagline:
    "I turn business needs into clear requirements, process flows, and system designs that engineering teams can build and business teams can trust.",
  location: "Indonesia",
  email: "your.email@example.com", // TODO: your contact email
  linkedin: "https://www.linkedin.com/in/", // TODO: your LinkedIn URL
  github: "https://github.com/ivanrayhannn",
  cv: "#", // TODO: link to your CV PDF, e.g. "assets/Rayhan_Ravandika_CV.pdf"

  stats: [
    { value: "BRD · FSD · TSD", label: "End-to-end documentation" },
    { value: "BPMN", label: "Business flow modelling" },
    { value: "UAT / SIT", label: "Testing strategy" },
  ],

  about: [
    "I'm a Business System Analyst who works at the point where business operations meet technology. I start by understanding how a business actually runs: its people, rules, and pain points. Then I turn that into requirements, process models, and specifications that developers, testers, and stakeholders can all follow.",
    "My work covers the whole delivery lifecycle: gathering user requirements, analysing business operations, defining as-is and to-be business flows, designing UI, writing BRD, FSD, and TSD documents, and planning a test strategy that proves the solution meets the need.",
  ],

  services: [
    { icon: "users", title: "User Requirements", text: "Stakeholder interviews, workshops, and observation turned into prioritised user stories with clear acceptance criteria." },
    { icon: "activity", title: "Business Operation Analysis", text: "Assess current operations, spot gaps and bottlenecks, and quantify the impact to shape the right solution." },
    { icon: "flow", title: "Business Flow Process", text: "Model as-is and to-be processes in BPMN / swimlanes with roles, decision points, and business rules." },
    { icon: "layout", title: "UI Design", text: "Wireframes and clickable prototypes that validate flows with users before a single line of code is written." },
    { icon: "file", title: "BRD · FSD · TSD", text: "Structured documentation from business objectives down to functional specs and technical/system design." },
    { icon: "check", title: "Testing Strategy", text: "Test strategy, scenarios, and UAT plans with traceability back to every requirement." },
  ],

  deliverables: [
    { code: "BRD", name: "Business Requirement Document", items: ["Business objectives & scope", "Stakeholders & RACI", "As-is / to-be process", "Business rules & KPIs"] },
    { code: "FSD", name: "Functional Specification Document", items: ["Use cases & user stories", "Screen specs & field validation", "Workflow & approval logic", "Acceptance criteria"] },
    { code: "TSD", name: "Technical Specification Document", items: ["System architecture & integration", "Data model / ERD", "API contracts", "Non-functional requirements"] },
    { code: "TST", name: "Testing Strategy", items: ["Test levels: SIT, UAT, regression", "Scenarios & test cases", "Requirement traceability matrix", "Entry / exit criteria"] },
  ],

  process: [
    { step: "Discover", text: "Stakeholder mapping, interviews, and workshops to capture the real problem." },
    { step: "Analyse", text: "Business operation analysis, gap analysis, and prioritisation." },
    { step: "Model", text: "As-is and to-be business flows, business rules, and data." },
    { step: "Design", text: "UI wireframes and prototypes validated with users." },
    { step: "Specify", text: "BRD, FSD, and TSD handed over to engineering." },
    { step: "Validate", text: "Test strategy, SIT/UAT support, and sign-off." },
  ],

  domains: [
    { title: "ERP & Inventory", text: "Procurement, stock movement, warehouse, and purchase-to-accounting flows." },
    { title: "Finance & Accounting", text: "Approval chains, journal postings, reconciliation, and reporting." },
    { title: "E-commerce", text: "Catalogue, cart and checkout, payment gateway integration, and promotions." },
    { title: "HR & Operations", text: "Employee lifecycle, role-based permissions, and approval workflows." },
  ],

  projects: [
    // TODO: replace with your real case studies
    {
      title: "Inventory Management Enhancement",
      tag: "ERP",
      summary: "Mapped multi-warehouse stock-transfer flows and redesigned the approval process to cut manual reconciliation.",
      deliverables: ["BRD", "BPMN", "FSD", "UAT Plan"],
    },
    {
      title: "Customer Onboarding Portal",
      tag: "Web App",
      summary: "Gathered requirements from operations and compliance, then designed the onboarding UI and validation rules.",
      deliverables: ["User Stories", "Wireframes", "FSD", "Test Scenarios"],
    },
    {
      title: "Approval Workflow Digitalisation",
      tag: "Workflow",
      summary: "Replaced a paper-based approval chain with a configurable, role-based digital workflow and audit trail.",
      deliverables: ["As-is / To-be", "BRD", "TSD", "RTM"],
    },
  ],

  skills: {
    "Analysis & Modelling": ["Requirement Elicitation", "Gap Analysis", "BPMN 2.0", "UML", "Use Case", "User Story", "ERD", "Data Flow Diagram"],
    "Documentation": ["BRD", "FSD", "TSD", "SRS", "RTM", "Test Strategy", "UAT Scenario"],
    "Tools": ["Figma", "Draw.io", "Visio", "Jira", "Confluence", "Postman", "SQL", "Excel"],
    "Methodology": ["Agile / Scrum", "Waterfall", "SDLC", "Stakeholder Management"],
  },

  experience: [
    // TODO: replace with your real work history
    {
      period: "20XX — Present",
      title: "Business System Analyst",
      company: "Company Name",
      points: [
        "Run requirement workshops with business users and translate needs into BRD and FSD.",
        "Define business flow processes and design UI wireframes for new features.",
        "Prepare test strategy and support SIT/UAT through to go-live.",
      ],
    },
    {
      period: "20XX — 20XX",
      title: "Business Analyst",
      company: "Company Name",
      points: [
        "Analysed business operations and documented as-is / to-be processes.",
        "Worked with developers on TSD, API, and data-model definitions.",
      ],
    },
  ],
};
