/*
 * Portfolio content. Edit this file to update the site; main.js renders it.
 * Every fact here comes from Keisya's CV (assets/CV_Keisyazka_Fathaya_Putri.pdf).
 */
window.PORTFOLIO = {
  name: "Keisya Putri",
  fullName: "Keisyazka Fathaya Putri",
  role: "Micro Credit Analyst",
  tagline:
    "I review credit applications, find the risks in them and recommend a decision the business can stand behind.",
  location: "East Jakarta, Indonesia",
  email: "keisyazka.putri@gmail.com",
  phone: "+62 858 1122 3644",
  whatsapp: "https://wa.me/6285811223644",
  linkedin: "", // add the full LinkedIn profile URL to show the button
  github: "",
  cv: "assets/CV_Keisyazka_Fathaya_Putri.pdf",

  heroWhere: "East Jakarta · currently at Bank Mandiri",
  photo: "assets/photo.jpg",
  badgeTag: "Credit and risk",
  heroTags: ["Credit Analysis", "Risk Assessment", "Business Operations", "Market Research"],
  statsSource: "From my CV: Bank Mandiri since June 2026, my own business since February 2025.",
  stats: [
    { value: "3", label: "workplaces" },
    { value: "3.79", label: "GPA out of 4.00" },
    { value: "2", label: "certifications in 2026" },
  ],

  // Shown in the About section's "At a glance" card
  facts: [
    ["Now", "Micro Credit Analyst, PT Bank Mandiri (Persero) Tbk."],
    ["Business", "Founder and owner, Zift Hampers & Food"],
    ["Education", "Bachelor of Fisheries, Jenderal Soedirman University (2020 to 2024), GPA 3.79"],
    ["Interested in", "Analytical, risk, business planning and corporate roles"],
  ],

  // Employers shown in the "Worked with" strip. Without a logo the name shows as text.
  clients: [
    { name: "Bank Mandiri", sector: "Banking" },
    { name: "Zift Hampers & Food", sector: "My own business" },
    { name: "Allegra Mitra Perkasa", sector: "Business development" },
  ],

  about: [
    "I'm a Micro Credit Analyst at Bank Mandiri. I read a credit application the way a lender has to: who the customer is, how the business really runs, what the numbers say, and whether the documents back it up. Then I weigh the risk and recommend a decision.",
    "Since February 2025 I have also run my own business, Zift Hampers & Food. I handle it end to end, from buying and budgeting to orders, customers and the books, so I know what a small business owner deals with every day.",
    "Before that I was a business development intern at Allegra Mitra Perkasa, researching markets and preparing proposals. I'm looking to grow in analytical, risk, business planning and corporate roles.",
  ],

  services: [
    { icon: "file", title: "Credit analysis", text: "I evaluate the customer's profile, financial information, business condition and supporting documents, then recommend a credit decision within my authorised limits." },
    { icon: "activity", title: "Risk assessment", text: "I assess creditworthiness and point out the risks before a decision is made, and I keep watching the borrower's business after the money is disbursed." },
    { icon: "check", title: "Document review", text: "I check that credit documents are complete, accurate and valid under internal policies and procedures." },
    { icon: "flow", title: "Business operations", text: "In my own business I run procurement, budgeting, order fulfilment, customer service and daily administration, and track sales and costs to plan ahead." },
    { icon: "users", title: "Market research", text: "I research markets and customers to find opportunities, and use STP (segmentation, targeting, positioning) to shape products, pricing and promotion." },
    { icon: "layout", title: "Stakeholder coordination", text: "I work with the business units and teams involved so applications move quickly and assessment issues get resolved." },
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
    "Process and reporting": ["Document and process review", "Reporting and documentation", "Stakeholder coordination"],
    "Tools": ["Microsoft Office"],
    "Certifications": ["ESG: Accelerating Green Business Practices, Bank Mandiri (2026)", "Mandatory e-learning on APU, PPT and PPPSPM, Bank Mandiri (2026)"],
    "Leadership": ["Vice President, Himpunan Mahasiswa Akuakultur (2022)", "Research Assistant, aquaculture research project (2023)", "Human Resources Development Staff, Himpunan Mahasiswa Akuakultur (2021)", "Supervision Staff, Dewan Legislatif Mahasiswa (2021)"],
  },

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
