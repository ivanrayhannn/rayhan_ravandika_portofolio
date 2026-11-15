/*
 * Portfolio content. Edit this file to update the site; main.js renders it.
 * Every fact here comes from Keisya's CV (assets/CV_Keisyazka_Fathaya_Putri.pdf).
 */
window.PORTFOLIO = {
  name: "Keisyazka Fathaya Putri",
  fullName: "Keisyazka Fathaya Putri",
  role: "Micro Credit Analyst",
  tagline:
    "I work in credit analysis, where attention to detail, analytical thinking and sound judgment matter every day. Beyond my professional role, I'm someone who enjoys exploring new things, building ideas, learning through experience and turning curiosity into action. I believe every experience has something to teach me, and every new challenge is an opportunity to grow.",
  location: "East Jakarta, Indonesia",
  email: "keisyazka.putri@gmail.com",
  phone: "+62 858 1122 3644",
  whatsapp: "https://wa.me/6285811223644",
  linkedin: "", // add the full LinkedIn profile URL to show the button
  github: "",
  cv: "assets/CV_Keisyazka_Fathaya_Putri.pdf",

  heroWhere: "",
  photo: "assets/photo.png",
  badgeTag: "Credit and risk",
  heroTags: [],
  statsSource: "My journey has taken me through different experiences: from business development and building my own business to working in banking. Each experience has shaped the way I think, work and see opportunities.",
  stats: [
    { value: "3", label: "workplaces" },
    { value: "2", label: "certifications" },
  ],

  // Shown in the About section's "At a glance" card
  facts: [
    ["Current role", "Micro Credit Analyst, PT Bank Mandiri (Persero) Tbk."],
    ["Business", "Founder and owner, Zift Hampers & Food"],
    ["Education", "Bachelor of Fisheries, Jenderal Soedirman University (2020 to 2024), GPA 3.79"],
    ["Areas of interest", "Credit analysis, risk management, business development, human capital and organizational development"],
  ],

  // Employers shown in the "Where I have worked" strip. Without a logo the name shows as text.
  // Logo credits: assets/clients/README.md
  clients: [
    { name: "PT Bank Mandiri (Persero) Tbk.", sector: "Banking", logo: "assets/clients/bank-mandiri.svg", logoSize: [80, 25], logoHeight: 30 },
    { name: "Zift Hampers & Food", sector: "My own business", logo: "assets/clients/zift-hampers.png", logoSize: [233, 240], logoHeight: 58 },
    { name: "PT Allegra Mitra Perkasa", sector: "Construction", logo: "assets/clients/allegra-mitra-perkasa.png", logoSize: [636, 160], logoHeight: 40 },
  ],

  about: [
    "I'm a Micro Credit Analyst at Bank Mandiri, with experience in credit assessment, risk analysis and business evaluation.",
    "Beyond my full-time career, I'm also an entrepreneur running Zift Hampers & Food, and previously explored business development at Allegra Mitra Perkasa.",
    "I'm a curious and proactive person who enjoys learning by doing, exploring new opportunities and challenging myself beyond my comfort zone.",
  ],

  services: [
    { title: "Credit analysis", text: "I evaluate the customer's profile, financial information, business condition and supporting documents, then recommend a credit decision within my authorised limits." },
    { title: "Risk assessment", text: "I assess creditworthiness and point out the risks before a decision is made, and I keep watching the borrower's business after the money is disbursed." },
    { title: "Document review", text: "I check that credit documents are complete, accurate and valid under internal policies and procedures." },
    { title: "Business operations", text: "In my own business I run procurement, budgeting, order fulfilment, customer service and daily administration, and track sales and costs to plan ahead." },
    { title: "Market research", text: "I research markets and customers to find opportunities, and use STP (segmentation, targeting, positioning) to shape products, pricing and promotion." },
    { title: "Stakeholder coordination", text: "I work with the business units and teams involved so applications move quickly and assessment issues get resolved." },
  ],

  // "How I review a credit application", shown as a chain of steps
  deliverables: [
    { code: "01", name: "Customer and business", items: ["Customer profile", "Business condition", "Supporting documents"] },
    { code: "02", name: "Financials and risk", items: ["Financial information", "Creditworthiness", "Potential risks"] },
    { code: "03", name: "Decision", items: ["Document completeness and validity", "Credit recommendation", "Approval within authorised limits"] },
    { code: "04", name: "After disbursement", items: ["Borrower business performance", "Credit quality", "Healthy portfolio"] },
  ],

  skills: {
    "Credit and risk": ["Credit analysis", "Risk identification", "Risk mitigation", "Creditworthiness assessment", "Financial and business assessment", "Portfolio monitoring"],
    "Business analysis": ["Business analysis", "Market research", "Customer analysis", "STP framework", "Sales and cost monitoring"],
    "Operations": ["Business operations", "Procurement", "Budgeting", "Order fulfilment", "Customer service"],
    "Process, reporting and tools": ["Document and process review", "Reporting and documentation", "Stakeholder coordination", "Microsoft Office"],
    "Certifications": ["ESG: Accelerating Green Business Practices, Bank Mandiri (2026)", "Mandatory e-learning on APU, PPT and PPPSPM, Bank Mandiri (2026)"],
    "Leadership": ["Vice President, Himpunan Mahasiswa Akuakultur (2022)", "Research Assistant, aquaculture research project (2023)", "Human Resources Development Staff, Himpunan Mahasiswa Akuakultur (2021)", "Supervision Staff, Dewan Legislatif Mahasiswa (2021)"],
  },

  // Case studies shown on the home page
  projects: [
    {
      title: "Micro credit, from application to restructuring",
      client: "PT Bank Mandiri (Persero) Tbk.",
      period: "2026 to present",
      logos: ["assets/clients/bank-mandiri.svg"],
      summary: "How I assess a micro business loan in five processes: business feasibility, repayment capacity, collateral and legal documents, early warning and collection, and credit restructuring.",
      deliverables: ["Feasibility check", "Repayment capacity", "SLIK history", "Collateral and APHT", "Early warning", "Restructuring"],
      link: "mandiri.html",
      linkLabel: "Read the micro credit case study",
    },
  ],

  experience: [
    {
      period: "June 2026 to present",
      title: "Micro Credit Analyst",
      company: "PT Bank Mandiri (Persero) Tbk.",
      points: [
        "Analyse credit applications by evaluating customer profiles, financial information, business conditions and supporting documents.",
        "Assess creditworthiness and identify potential risks to support the right credit recommendations and decisions.",
        "Review the completeness, accuracy and validity of credit documents in line with internal policies and procedures.",
        "Review and approve credit applications within authorised limits.",
        "Coordinate with the business units involved so credit applications are processed quickly and assessment issues get resolved.",
        "Monitor borrowers' business performance and credit quality after disbursement to keep the portfolio healthy.",
      ],
    },
    {
      period: "February 2025 to present",
      title: "Founder and Owner",
      company: "Zift Hampers & Food",
      points: [
        "Run the business end to end: procurement, budgeting, order fulfilment, customer service and daily administration.",
        "Monitor sales, expenses and operating performance to plan ahead and keep costs down.",
        "Analyse the market and customers to adjust products, pricing and promotions.",
        "Manage customer relationships and coordinate orders to keep service quality high and customers coming back.",
      ],
    },
    {
      period: "September 2024 to March 2025",
      title: "Business Development Intern",
      company: "PT Allegra Mitra Perkasa",
      points: [
        "Supported market and industry research to find business opportunities and inform marketing initiatives.",
        "Helped prepare company profiles, proposals and promotional materials.",
        "Supported the planning and running of business development activities, and shared information across internal teams.",
        "Applied the STP (segmentation, targeting, positioning) framework to support the marketing strategy.",
      ],
    },
  ],
};
