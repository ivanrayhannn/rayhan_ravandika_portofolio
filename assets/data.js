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

  /*
   * Project workflows drawn as vertical swimlanes.
   * lanes: columns, left to right. phases: [label, firstRow, lastRow].
   * nodes: { id, row, lane, label ("\n" = new line), type: task | start | end | gw, span: [fromLane, toLane] }
   * edges: [from, to, options] — options: { label, kind: "assoc" (dashed, no arrow) | "loop" (drawn on the right side) }
   */
  workflows: [
    {
      id: "waterfall",
      name: "Waterfall",
      caption: "Fig. 2 — Waterfall project, from user requirement to go-live",
      lanes: ["Business User", "Business System Analyst", "IT Management", "Vendor / Dev Team"],
      me: 1,
      phases: [
        ["Requirement", 0, 6],
        ["Design (TSD)", 7, 9],
        ["Development", 10, 11],
        ["Testing", 12, 15],
        ["Pre go-live", 16, 20],
      ],
      nodes: [
        { id: "s", row: 0, lane: 0, type: "start", label: "Business need" },
        { id: "ur", row: 1, lane: 0, label: "Share user\nrequirement" },
        { id: "cd", row: 1, lane: 1, label: "Collect data &\nrequirement" },
        { id: "brd", row: 2, lane: 1, label: "Write BRD & FSD" },
        { id: "val", row: 3, lane: 1, label: "Validate with user" },
        { id: "rev", row: 3, lane: 0, label: "Review BRD & FSD" },
        { id: "ok", row: 4, lane: 1, type: "gw", label: "Approved?" },
        { id: "so", row: 5, span: [0, 2], label: "Sign-off BRD & FSD — Business User & IT Management" },
        { id: "plan", row: 6, lane: 1, label: "Project schedule, budget\n& resource per feature" },
        { id: "tsd", row: 7, lane: 3, label: "Write TSD" },
        { id: "mon1", row: 7, lane: 1, label: "Monitor daily progress,\nanswer questions" },
        { id: "rtsd", row: 8, lane: 1, label: "Review TSD\n(on deadline)" },
        { id: "atsd", row: 9, lane: 2, label: "Approve TSD" },
        { id: "dev", row: 10, lane: 3, label: "Develop features\n(per PIC)" },
        { id: "mon2", row: 10, lane: 1, label: "Monitor daily progress\nwith PIC / PM" },
        { id: "scn", row: 11, lane: 1, label: "Prepare test scenarios\n& test data" },
        { id: "ft", row: 12, lane: 1, label: "Functional Test" },
        { id: "fix", row: 12, lane: 3, label: "Fix defects" },
        { id: "sit", row: 13, lane: 1, label: "System Integration\nTest (SIT)" },
        { id: "uat", row: 14, lane: 0, label: "User Acceptance\nTest (UAT)" },
        { id: "sup", row: 14, lane: 1, label: "Support users\nduring UAT" },
        { id: "uso", row: 15, span: [0, 2], label: "UAT sign-off" },
        { id: "sop", row: 16, lane: 1, label: "Write SOP guideline" },
        { id: "trn", row: 17, lane: 1, label: "Train users &\nvendor users" },
        { id: "att", row: 17, lane: 0, label: "Attend training" },
        { id: "dpl", row: 18, lane: 1, label: "Prepare deployment\nprocedure" },
        { id: "go", row: 19, lane: 3, label: "Deploy to production" },
        { id: "mon3", row: 19, lane: 1, label: "Monitor deployment" },
        { id: "e", row: 20, lane: 3, type: "end", label: "Go-live" },
      ],
      edges: [
        ["s", "ur"], ["ur", "cd"], ["cd", "brd"], ["brd", "val"], ["val", "rev"], ["rev", "ok"],
        ["ok", "brd", { kind: "loop", label: "No" }], ["ok", "so", { label: "Yes" }], ["so", "plan"],
        ["plan", "tsd"], ["tsd", "mon1", { kind: "assoc" }], ["tsd", "rtsd"], ["rtsd", "atsd"],
        ["atsd", "dev"], ["dev", "mon2", { kind: "assoc" }], ["mon2", "scn"],
        ["scn", "ft"], ["ft", "fix", { kind: "assoc" }], ["ft", "sit"], ["sit", "uat"], ["uat", "sup", { kind: "assoc" }],
        ["uat", "uso"], ["uso", "sop"], ["sop", "trn"], ["trn", "att", { kind: "assoc" }], ["trn", "dpl"],
        ["dpl", "go"], ["go", "mon3", { kind: "assoc" }], ["go", "e"],
      ],
    },
    {
      id: "agile",
      name: "Agile",
      caption: "Fig. 3 — Agile (Scrum) project, repeated every sprint",
      lanes: ["Product Owner / User", "Business System Analyst", "Scrum Team (Dev & QA)", "IT Management"],
      me: 1,
      phases: [
        ["Discovery & backlog", 0, 5],
        ["Sprint planning", 6, 7],
        ["Sprint", 8, 10],
        ["Review & UAT", 11, 12],
        ["Release", 13, 17],
      ],
      nodes: [
        { id: "s", row: 0, lane: 0, type: "start", label: "Product need" },
        { id: "ng", row: 1, lane: 0, label: "Share needs\n& goals" },
        { id: "cd", row: 1, lane: 1, label: "Collect data &\nrequirement" },
        { id: "us", row: 2, lane: 1, label: "Write epics & user stories\nwith acceptance criteria" },
        { id: "pb", row: 3, lane: 0, label: "Prioritise product\nbacklog" },
        { id: "rm", row: 4, lane: 1, label: "Release roadmap, budget\n& resource plan" },
        { id: "arm", row: 5, lane: 3, label: "Approve roadmap\n& budget" },
        { id: "sp", row: 6, span: [0, 2], label: "Sprint planning — pick stories, estimate, assign per feature" },
        { id: "ref", row: 7, lane: 1, label: "Refine stories into\nlight FSD / TSD" },
        { id: "td", row: 7, lane: 2, label: "Technical design\nper story" },
        { id: "bld", row: 8, lane: 2, label: "Build stories" },
        { id: "ds", row: 8, lane: 1, label: "Daily stand-up: track\nprogress, clear blockers" },
        { id: "scn", row: 9, lane: 1, label: "Prepare test scenarios\n& test data" },
        { id: "ft", row: 10, lane: 1, label: "Functional test &\nSIT on increment" },
        { id: "fix", row: 10, lane: 2, label: "Fix defects" },
        { id: "rv", row: 11, lane: 0, label: "Sprint review\n& UAT" },
        { id: "demo", row: 11, lane: 1, label: "Demo & support\nusers in UAT" },
        { id: "acc", row: 12, lane: 1, type: "gw", label: "Accepted?" },
        { id: "ar", row: 13, lane: 3, label: "Approve release" },
        { id: "sop", row: 14, lane: 1, label: "SOP guideline &\nuser training" },
        { id: "att", row: 14, lane: 0, label: "Attend training" },
        { id: "dpl", row: 15, lane: 1, label: "Deployment procedure\n& monitoring" },
        { id: "go", row: 15, lane: 2, label: "Deploy increment" },
        { id: "e", row: 16, lane: 2, type: "end", label: "Increment live" },
        { id: "retro", row: 17, span: [0, 2], label: "Retrospective — lessons feed the next sprint" },
      ],
      edges: [
        ["s", "ng"], ["ng", "cd"], ["cd", "us"], ["us", "pb"], ["pb", "rm"], ["rm", "arm"], ["arm", "sp"],
        ["sp", "ref"], ["ref", "td", { kind: "assoc" }], ["td", "bld"], ["bld", "ds", { kind: "assoc" }],
        ["ds", "scn"], ["scn", "ft"], ["ft", "fix", { kind: "assoc" }], ["ft", "rv"], ["rv", "demo", { kind: "assoc" }],
        ["rv", "acc"], ["acc", "ref", { kind: "loop", label: "No" }], ["acc", "ar", { label: "Yes" }],
        ["ar", "sop"], ["sop", "att", { kind: "assoc" }], ["sop", "dpl"], ["dpl", "go"], ["go", "e"], ["e", "retro"],
        ["retro", "sp", { kind: "loop", label: "Next sprint", x: 1112 }],
      ],
    },
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
    {
      period: "2023 — Present",
      title: "IT PM & Business System Analyst",
      company: "Fujitsu · onsite at Toyota, Logistic Department",
      points: [
        "Led 4 IT development projects over 3 years, managing 8 cross-functional vendor teams across 8 systems and 50+ data integrations, using Waterfall and Agile methodologies.",
        "Facilitated cross-country meetings, user requirement clarification, and system process flow.",
        "Gathered user requirements and ran feasibility studies to identify business pain points, define project scope, and align technology solutions with business objectives.",
        "Designed technology solutions and system architectures that addressed business requirements and supported strategic initiatives across departments.",
        "Managed relationships between IT, business units, and external vendors; resolved conflicting requirements and removed blockers to keep the schedule.",
        "Managed digital transformation project budgets totalling $12M+ and optimised resource allocation across concurrent projects.",
        "Identified project risks through impact analysis and ran mitigation throughout the lifecycle, keeping 100% schedule compliance.",
        "Defined testing strategies including test scenarios, validated API endpoints, and ensured security compliance and readiness for penetration testing.",
        "Built data analytics dashboards and visualisations that give leadership and stakeholders actionable insight.",
        "Documented system specifications, process flows, and technical requirements for development and implementation teams.",
      ],
    },
    {
      period: "2022 — 2023",
      title: "System Analyst",
      company: "Jojonomic",
      points: [
        "Associate Product Owner for HRIS development, and assisted the Product Manager on the No-Code Platform.",
        "Defined product strategy, roadmap, PRD, user stories, acceptance criteria, and delivery schedules.",
        "Gathered and prioritised requirements from business needs, product research, and customer needs.",
        "Aligned CTO, VP, and product teams on scope, priorities, technical constraints, timeline, risks, and release plans.",
        "Facilitated sprint planning, sprint meetings, product reviews, requirement clarification, and decision-making sessions.",
        "Managed the product lifecycle from discovery to release and continuous improvement.",
        "Wrote technical documents: JSON API, database relations, system integration flow, and UI design.",
        "Ensured release readiness through QA, UAT, defect prioritisation, and operational planning.",
        "Promoted structured documentation and standardised product management practices.",
      ],
    },
    {
      period: "2022 — 2023",
      title: "Business Analyst (Interim)",
      company: "Jojonomic · FWD Insurance and CIMB Niaga projects",
      points: [
        "Managed improvement features on several modules to align them with customer needs.",
        "Gathered requirements from business users, prioritised them for development, and monitored daily progress.",
        "Facilitated stakeholder meetings, sprint planning, requirement reviews, and requirement clarification.",
        "Helped resolve data and integration job issues during the unit test phase.",
      ],
    },
  ],
};
