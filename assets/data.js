/*
 * Portfolio content. Edit this file to update the site; main.js renders it.
 * Anything still marked "TODO" is a placeholder, not real data.
 */
window.PORTFOLIO = {
  name: "Rayhan Ravandika",
  fullName: "Muhammad Rayhan Ravandika",
  role: "IT PM & Business System Analyst",
  tagline:
    "I take a stakeholder's problem and turn it into the requirements, system design and delivery plan a vendor team builds from.",
  location: "South Jakarta, Indonesia",
  email: "ivanrayhanravan@gmail.com",
  phone: "+62 822 5795 8517",
  whatsapp: "https://wa.me/6282257958517",
  linkedin: "https://www.linkedin.com/in/rayhanravandika/",
  github: "https://github.com/ivanrayhannn",
  cv: "assets/CV_Muhammad_Rayhan_Ravandika.pdf",

  heroWhere: "South Jakarta · currently at Fujitsu, onsite at Toyota Indonesia",
  photo: "", // optional: path to your photo for the ID card, e.g. "assets/photo.jpg"
  badgeTag: "4 yrs experience",
  heroTags: ["Business System Analysis", "IT Project Management", "BRD · FSD · TSD", "Testing Strategy"],
  // Figures come from the CV (Fujitsu role). statsSource is shown under them.
  statsSource: "Figures from my Fujitsu role at Toyota Indonesia, 2023 to now.",
  stats: [
    { value: "4", label: "IT projects led" },
    { value: "8", label: "vendor teams managed" },
    { value: "50+", label: "data integrations" },
    { value: "$12M+", label: "project budget" },
  ],

  // Shown in the About section's "At a glance" card
  facts: [
    ["Experience", "4 years · Fujitsu, Jojonomic"],
    ["Track record", "4 projects · 8 vendor teams · 8 systems · 50+ integrations"],
    ["Budget", "$12M+ digital transformation"],
    ["Education", "B.Sc. Information Systems, Brawijaya University (2017 to 2021)"],
  ],

  /*
   * Clients and employers shown in the "Worked with" strip.
   * logo: optional path to an official logo file, e.g. "assets/clients/toyota.svg".
   * logoHeight: display height in px, to balance square and wide logos. logoSize: intrinsic [w, h].
   * Leave it empty to show the name as a text wordmark.
   */
  clients: [
    { name: "Toyota Indonesia", sector: "Automotive", logo: "assets/clients/toyota-indonesia.png", logoSize: [647, 240], logoHeight: 40 },
    { name: "Fujitsu", sector: "IT services", logo: "assets/clients/fujitsu.png", logoSize: [495, 240], logoHeight: 42 },
    { name: "Adhi Persada Beton", sector: "Construction materials", logo: "assets/clients/adhi-beton.png", logoSize: [267, 240], logoHeight: 58 },
    { name: "Amway", sector: "Direct selling", logo: "assets/clients/amway.png", logoSize: [707, 240], logoHeight: 40 },
    { name: "CIMB Niaga", sector: "Banking", logo: "assets/clients/cimb-niaga.png", logoSize: [548, 87], logoHeight: 26 },
    { name: "Bank Papua", sector: "Banking", logo: "assets/clients/bank-papua.png", logoSize: [548, 118], logoHeight: 40 },
    { name: "FWD", sector: "Insurance", logo: "assets/clients/fwd.png", logoSize: [548, 192], logoHeight: 32 },
    { name: "Jojonomic", sector: "HR tech", logo: "assets/clients/jojonomic.png", logoSize: [251, 240], logoHeight: 58 },
  ],

  about: [
    "I'm an IT Consultant at Fujitsu, dedicated to Toyota Indonesia's Logistic Export Department to support its digital transformation. Most of my work happens between the business users and IT: I listen until I understand what they need and expect, then turn it into a solution and help them through the technical side.",
    "That starts with learning how their operation really runs and checking whether an existing application can be improved before anything new is built. From there I write the technical documentation, design the system, and manage the vendor development team through to go-live, keeping every milestone on schedule.",
    "Before Fujitsu I worked on the product side at Jojonomic, where I led the development team for its HRIS product: attendance, leave, overtime and task management.",
  ],

  services: [
    { icon: "users", title: "User requirements", text: "I run stakeholder interviews, workshops and observation, then turn what I hear into prioritised user stories with acceptance criteria." },
    { icon: "activity", title: "Business operation analysis", text: "I map how the operation runs today, find the gaps and bottlenecks, and size their impact before anyone picks a solution." },
    { icon: "flow", title: "Business process flows", text: "As-is and to-be processes drawn as BPMN swimlanes, with every role, decision point and business rule on the page." },
    { icon: "layout", title: "UI design", text: "I build the prototype first, with the help of AI tools, before writing any document. Business users click through a real, working prototype and see how it feels, so they can validate the flow before development starts." },
    { icon: "file", title: "BRD · FSD · TSD", text: "The business case, the functional spec and the technical design, written as separate documents that business and IT can each sign off." },
    { icon: "check", title: "Testing strategy", text: "Test strategy, scenarios and UAT plans, with each test traced back to the requirement it proves." },
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
   * edges: [from, to, options]. options: { label, kind: "assoc" (dashed, no arrow) | "loop" (drawn on the right side) }
   */
  workflows: [
    {
      id: "waterfall",
      name: "Waterfall",
      caption: "Fig. 1: Waterfall project, from user requirement to go-live",
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
        { id: "so", row: 5, span: [0, 2], label: "Sign-off BRD & FSD: Business User & IT Management" },
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
      caption: "Fig. 2: Agile (Scrum) project, repeated every sprint",
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
        { id: "sp", row: 6, span: [0, 2], label: "Sprint planning: pick stories, estimate, assign per feature" },
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
        { id: "retro", row: 17, span: [0, 2], label: "Retrospective: lessons feed the next sprint" },
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


  /*
   * Case studies. Every fact here comes from the CV.
   * logos: client logos shown on the case (paths under assets/clients/).
   */
  projects: [
    {
      title: "Logistics digital transformation",
      client: "Toyota Indonesia, via Fujitsu",
      period: "2023 to present",
      logos: ["assets/clients/toyota-indonesia.png"],
      summary: "Led 4 IT development projects for the Logistic Department: 8 vendor teams, 8 systems and 50+ data integrations, delivered with both waterfall and agile, within a $12M+ budget and on schedule.",
      deliverables: ["Feasibility study", "System architecture", "FSD & specs", "Test strategy", "API validation", "Dashboards"],
    },
    {
      title: "HRIS on web and mobile: attendance, leave, overtime and tasks",
      client: "Jojonomic",
      period: "2022 to 2023",
      logos: ["assets/clients/jojonomic.png"],
      summary: "Product Owner for four HRIS modules on web and mobile. Designed the screens, defined the API endpoints with the engineers, documented everything from PRD to API spec, and led delivery to release, including geofenced attendance and face match at clock-in. Also supported the No-Code Platform product.",
      deliverables: ["Geofenced attendance", "Face match", "Mobile and web UI", "API endpoints", "PRD and user stories", "UAT"],
      // Optional detail page for this case.
      link: "hris.html",
      linkLabel: "Read the HRIS case study",
    },
    {
      title: "Expense management: reimbursement, cash advance, petty cash and accruals",
      client: "CIMB Niaga, via Jojonomic",
      period: "2022 to 2023",
      logos: ["assets/clients/cimb-niaga.png"],
      summary: "Improved CIMB Niaga's web-based expense modules and the integration between them, so advances, claims, petty cash and month-end accruals end up in one consistent set of numbers for finance. Gathered and prioritised requirements, ran sprint reviews and fixed data and integration issues in unit testing.",
      deliverables: ["Requirement backlog", "Module integration", "Settlement rules", "Month-end accrual", "Unit test fixes"],
      link: "cimb.html",
      linkLabel: "Read the CIMB Niaga case study",
    },
    {
      title: "Marketing tool: spin the wheel",
      client: "Marketing tools",
      badge: "Clickable prototype",
      summary: "A promo game marketing runs without a developer: customers spin for a voucher, while marketing sets the prizes, odds, stock and spins per day. Designed the flow, rules and screens, and built a prototype you can try.",
      deliverables: ["Business rules", "Customer flow", "Admin settings", "Validation", "Prototype"],
      link: "marketing.html",
      linkLabel: "Try the spin-the-wheel prototype",
    },
  ],
  // Shown under the case studies until their write-ups exist.
  projectsPending: "Write-ups for Adhi Persada Beton, Amway and Bank Papua are in progress.",

  skills: {
    "Business analysis": ["Requirement gathering (stakeholder interviews, operational data)", "Business process analysis", "As-is / to-be mapping", "Impact analysis", "Business case & benefit analysis", "Market research", "Competitor analysis", "User stories", "Acceptance criteria"],
    "System design": ["ERP module design (procurement, supplier, customer order, invoicing, warehouse, trucking)", "Data modelling (ERD)", "System integration design", "UI design & screen specs", "JSON API spec", "Vendor technical document review (TSD)"],
    "Documentation": ["BRD", "FSD", "TSD", "PRD", "Feature descriptions", "Test strategy", "Test scenarios"],
    "Testing & delivery": ["SIT", "UAT with end users", "Project schedule & budget control", "Risk mitigation", "Vendor & stakeholder management", "Executive reporting", "Scrum Master activities (sprint planning, daily stand-up, sprint review)"],
    "Data & tools": ["Power BI (DAX)", "Cloudera data warehouse", "Talend", "SQL", "SQL Server", "Oracle", "DBeaver", "Postman", "Figma", "Jira", "Trello", "GitHub CI/CD", "Microsoft 365"],
    "AI": ["AI engineering", "AI prompting", "Hermes Agent", "AI-assisted prototyping"],
    "Methodology & domains": ["Waterfall", "Agile / Scrum", "SDLC", "Logistics & warehouse", "ERP", "HRIS", "Expense management", "Banking", "Insurance"],
  },

  experience: [
    {
      period: "2023 to present",
      title: "Business System Analyst",
      company: "Fujitsu Indonesia · consultant at Toyota Indonesia",
      points: [
        "Managed end-to-end system development as internal consultant for the Logistics business unit, delivering 4+ projects to go-live with Waterfall and Agile, from project planning and daily monitoring to operational support during development and after go-live.",
        "Led digital transformation initiatives for logistics operations, redesigning business processes and systems to reduce operational cost, optimise warehouse space and shorten process cycle time.",
        "Gathered user requirements through stakeholder interviews and operational data collection, identified user pain points, and translated them into BRD, FSD and UI design and screen specifications.",
        "Analysed end-to-end business operations and existing systems, mapped as-is and to-be business process flows, and proposed process and system improvements with technology recommendations aligned with company regulations and IT standards.",
        "Designed ERP modules for a global system project with Toyota Japan and Toyota Thailand (Procurement, Supplier Management, Customer Order, Invoicing, Warehouse and Trucking Delivery), and translated business requirements into system logic for the supporting local systems.",
        "Analysed existing system logic and data structures to assess the impact of new business requirements, designed data models and system integrations, and reviewed vendor technical documents against the functional requirements.",
        "Coordinated business, IT and vendor teams to align system expectations, settled conflicting requirements across stakeholders, and removed blockers to keep projects on track.",
        "Planned and controlled the project schedule, budget and daily progress; set task priorities for the development team, identified project and budget risks with mitigation plans, and escalated critical blockers to IT management.",
        "Prepared and presented project progress, business cases, risks and benefit analyses to executive management for decision-making and project approval.",
        "Defined the testing strategy and test scenarios, and led SIT and UAT with end users to get systems ready with minimal post-go-live issues.",
        "Built logistics cost and compliance dashboards in Power BI, maintained the data warehouse on Cloudera, and developed Talend data integrations to feed the dashboards.",
      ],
    },
    {
      period: "2022 to 2023",
      title: "Product Owner",
      company: "Jojonomic Indonesia · HRIS and Officeless no-code platform",
      points: [
        "Gathered and analysed business needs and trends, ran market research and competitor analysis, identified revenue opportunities and prioritised product features.",
        "Worked with cross-functional teams (backend, frontend and mobile engineers, QA) to translate business needs into technical requirements, and facilitated brainstorming on the best solution during development.",
        "Wrote the product documentation and design system: JSON API, UI design, feature descriptions and acceptance criteria.",
        "Ran agile ceremonies as acting Scrum Master: sprint planning, daily stand-ups and sprint reviews.",
        "Worked with the QA team to define test scenarios, catch potential issues early and prepare action plans, protecting product quality and integration performance.",
        "Troubleshot system issues, analysed their cause and coordinated the team on the fixes.",
        "Fitted the HRIS to FWD Insurance's HR rules: a rule-by-rule gap analysis decided what to configure and what to build as a custom module, such as overtime under the company's own policy.",
      ],
    },
    {
      period: "2022 to 2023",
      title: "Business Analyst (Interim)",
      company: "Jojonomic Indonesia · CIMB Niaga project",
      points: [
        "Improved CIMB Niaga's web-based expense modules (reimbursement, cash advance, petty cash and accruals) and the integration between them.",
        "Gathered requirements from business users, prioritised them for development and monitored daily progress.",
        "Facilitated stakeholder meetings, sprint planning, requirement reviews and clarification sessions.",
        "Helped resolve data and integration job issues during the unit test phase.",
      ],
    },
  ],
};
