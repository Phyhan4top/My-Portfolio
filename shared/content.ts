import type { PortfolioData } from "./schema";

/**
 * The site's content. Everything here is checked against Phyhan's CVs, public
 * GitHub repositories and the PhyhanAgro docs and code. Keep it that way: no
 * invented users, revenue, metrics or testimonials.
 *
 * The site renders from this file straight away. A copy saved from /admin
 * replaces it at runtime.
 */
export const defaultPortfolio: PortfolioData = {
  identity: {
    fullName: "Ajose Oyedepo Olufihan",
    shortName: "Phyhan",
    title: "Frontend Engineer / Software Developer",
    location: "Lagos, Nigeria",
    availability: "Available for full-time roles and freelance projects",
    email: "oyedepo304@gmail.com",
    cvUrl: "/Ajose-Oyedepo-Frontend-Engineer-CV.pdf",
    socials: [
      { label: "LinkedIn", href: "https://www.linkedin.com/in/ajose-oyedepo" },
      { label: "GitHub", href: "https://github.com/phyhan4top" },
      { label: "X", href: "https://x.com/OluPhyHan" },
    ],
  },

  intro: {
    statement:
      "Frontend engineer. I build products whose hard parts stay out of the user’s way: one cart split across many farms, a design editor in a browser tab, dashboards that change with who’s signed in.",
    emphasis: [
      "one cart split across many farms",
      "a design editor in a browser tab",
      "dashboards that change with who’s signed in",
    ],
  },

  practice: {
    paragraphs: [
      "I’m Ajose Oyedepo Olufihan. Most people call me Phyhan. I’m a frontend-focused software engineer in Lagos, with more than three years of building production applications in React, Next.js, Vue and TypeScript, and more recently React Native.",
      "My favourite work sits where the interface meets the rules behind it: role-based data, canvas state, API contracts, money. I’ve worked in product teams, debugged production issues, reviewed code and mentored junior developers. Since 2025 I’ve also been building my own company’s platform, which has taught me what the frontend depends on all the way down.",
    ],
    portrait: {
      src: "/images/portrait.webp",
      alt: "Phyhan, wearing glasses, a patterned navy shirt and a tie, seated in front of a tiled wall",
      caption: "Fig. 1. Phyhan.",
      width: 900,
      height: 1125,
    },
    notes: [
      {
        title: "Rules change, so they shouldn’t need a deploy.",
        body: "Fees, deadlines and matching weights live in audited configuration. The interface reads them and explains them, so a business decision doesn’t become an engineering ticket.",
        source: "From PhyhanAgro",
      },
      {
        title: "Permissions are a design problem.",
        body: "Who is looking decides what a screen is for. I work out the roles and the data each one may see before I draw a layout, and I enforce it on the server, because hiding a button isn’t security.",
        source: "From Chronicles and PhyhanAgro",
      },
      {
        title: "Interaction state is the real work.",
        body: "Selection, layers, transforms, undoable steps: the difficult part of a canvas tool is keeping that state honest while someone drags at 60 frames a second.",
        source: "From Skye Editor",
      },
      {
        title: "Accessibility gets checked, not assumed.",
        body: "UI audits and visual regression checks against WCAG catch what good intentions miss. Every state counts too: loading, empty, error, offline, forbidden.",
        source: "From Chronicles",
      },
    ],
  },

  projects: [
    {
      slug: "phyhanagro",
      name: "PhyhanAgro",
      context: "PhyhanAgro Marketplace Ltd",
      period: "Apr 2025 – present",
      role: "Founder & Lead Software Engineer",
      status: "Pre-launch. In active development, waiting list open.",
      summary:
        "A multi-sided agricultural marketplace for Nigeria. Buyers check out once across several verified farms; the platform holds the payment, coordinates each farm’s part of the order and hands delivery to logistics companies.",
      contribution: [
        "Founded the company and lead the engineering, from product rules and architecture through to the interfaces.",
        "Rebuilt the first MERN version as a TypeScript monorepo: Next.js web and staff console, an Expo mobile app, a NestJS API, and shared packages for types, validation, UI and business rules.",
        "Designed separate workspaces for buyers, farmers, agents and staff, with one permission registry behind them.",
        "Built the order, checkout, wallet and logistics flows, integrating Paystack and OPay for payments and Shipbubble for carriers behind adapter interfaces.",
        "Built onboarding and document verification, and an operations console for users, settings, approvals and the audit log.",
        "Built a shared design system with light and dark themes, every screen state, and language packs for Nigerian Pidgin, Yoruba, Hausa and Igbo.",
        "Built the public company website.",
      ],
      stack: [
        "TypeScript",
        "Next.js",
        "React Native (Expo)",
        "NestJS",
        "MongoDB",
        "BullMQ / Redis",
        "Paystack",
        "OPay",
        "Shipbubble",
        "Tailwind CSS",
        "Zod",
      ],
      challenges: [
        {
          title: "One cart, several farms",
          body: "A cart is never assumed to be one seller. An order becomes items, then one fulfilment per farm, then one shipment per fulfilment. A farm can reject its part while the others continue, so “partially delivered” and partial refunds had to be real states rather than edge cases.",
        },
        {
          title: "Money that can always be explained",
          body: "Amounts are stored as integer kobo. Every movement is a balanced set of immutable double-entry ledger rows, written in one database transaction with the balance it changes. A buyer’s payment sits in an escrow account for that order until delivery is confirmed, then settles into the farmer’s share, commission, fees, VAT and delivery. Mistakes are corrected with a new entry, never an edit.",
        },
        {
          title: "A lost response isn’t a failed payment",
          body: "A redirect saying “paid” proves nothing: success needs a signed webhook and server-side verification. If a response goes missing, the attempt becomes UNKNOWN and a background job reconciles it. Meanwhile the buyer sees “We’re confirming your payment. Don’t pay again.” Idempotency keys make every repeat return the first result.",
        },
        {
          title: "State machines as the single source of truth",
          body: "Orders, payments, refunds and shipments each have one machine in a shared package. Every status change goes through it, and invalid transitions are refused with a 409. The documentation is generated from the same code, so the two can’t drift apart.",
        },
        {
          title: "Business rules without a redeploy",
          body: "Fees, commissions, deadlines and carrier-matching weights come from a configuration service. Each change records who made it, the old and new values, and why. Money settings need a second person to confirm them, and the change is checked again at confirmation in case the setting moved in the meantime.",
        },
        {
          title: "Providers behind adapters",
          body: "Payment and logistics providers sit behind interfaces, so domain code never asks which provider it is talking to. Carrier matching filters on hard constraints first (approved, covers the route, can carry the weight), then scores on price, speed and reliability, with Operations able to override it.",
        },
      ],
      images: [
        {
          src: "/images/phyhanagro-marketplace.webp",
          alt: "PhyhanAgro marketplace home with produce categories, search and a prompt to see produce nearest to you",
          caption: "Home: anyone can browse without an account.",
          width: 1440,
          height: 432,
          step: "Browse",
        },
        {
          src: "/images/phyhanagro-area.webp",
          alt: "Dialog asking for state and local government area, explaining the area stays on the device",
          caption: "Your area only sorts by distance, and it stays on your device.",
          width: 768,
          height: 748,
          step: "Browse",
        },
        {
          src: "/images/phyhanagro-search.webp",
          alt: "Search results for maize showing a white maize listing with price per 50 kg bag and an add button",
          caption: "Search results, priced in the seller’s own unit. Demo listing.",
          width: 1440,
          height: 680,
          step: "Search and filter",
        },
        {
          src: "/images/phyhanagro-filters.webp",
          alt: "Filters for category, state, local government area, price range, timing, minimum stock, organic and sort order",
          caption: "Filters for category, location, price, availability and stock.",
          width: 512,
          height: 802,
          step: "Search and filter",
        },
        {
          src: "/images/phyhanagro-product.webp",
          alt: "PhyhanAgro product page for soybeans with stock, minimum order, location and a note that buyers and farmers don’t exchange phone numbers",
          caption: "Stock and minimum order come first, and PhyhanAgro stays between buyer and farmer. Demo listing.",
          width: 1440,
          height: 1000,
          step: "Decide",
          desktopOnly: true,
        },
        {
          src: "/images/phyhanagro-product-phone.webp",
          alt: "The same PhyhanAgro product page on a phone, ending with an explanation of how buying works",
          caption: "The same page on a phone. Demo listing.",
          width: 500,
          height: 1962,
          step: "Decide",
        },
        {
          src: "/images/phyhanagro-cart.webp",
          alt: "PhyhanAgro cart with soybeans from one farm and tomatoes from another, grouped by farm with a subtotal for each",
          caption: "One cart, two farms: items are grouped by farm, with one checkout. Demo listings.",
          width: 1440,
          height: 650,
          step: "Cart",
          desktopOnly: true,
        },
        {
          src: "/images/phyhanagro-cart-phone.webp",
          alt: "The same PhyhanAgro cart on a phone, with farm groups stacked above the order summary",
          caption: "The same cart on a phone. Demo listings.",
          width: 500,
          height: 1705,
          step: "Cart",
        },
        {
          src: "/images/phyhanagro-signup.webp",
          alt: "Buyer sign-up form with name, email confirmed by a code, optional phone number and password",
          caption: "Sign up only at checkout. The cart moves to the account, and the phone number is optional.",
          width: 512,
          height: 1000,
          step: "Create an account",
        },
        {
          src: "/images/phyhanagro-audit-log.webp",
          alt: "PhyhanAgro staff console showing an audit log of role, setting and account changes, each with a reason",
          caption: "Staff console: the audit log. Development build, demo data.",
          width: 1280,
          height: 989,
        },
        {
          src: "/images/phyhanagro-setting-change.webp",
          alt: "Mobile dialog for changing the VAT setting, with a required reason saved to the audit log",
          caption: "Changing a business rule needs a reason. Development build.",
          width: 375,
          height: 900,
        },
        {
          src: "/images/phyhanagro-design-system.webp",
          alt: "Design system page showing order and wallet cards, payment statuses and the alert telling a buyer not to pay again",
          caption: "Design system: money, statuses and the “don’t pay again” alert. Sample values.",
          width: 1280,
          height: 850,
        },
        {
          src: "/images/phyhanagro-site.webp",
          alt: "PhyhanAgro company website with the headline Farm produce, bought and delivered without the guesswork",
          caption: "The public company website, live now.",
          width: 1440,
          height: 900,
        },
      ],
      figure: "order-trace",
      links: [{ label: "Company website", href: "https://www.phyhanagro.com.ng/" }],
      note: "The marketplace hasn’t launched, so there are no usage numbers to report, and listings marked “demo” are sample data. The source is private; I’m happy to walk through it in an interview.",
    },
    {
      slug: "safe-browser",
      name: "Safe Browser",
      context: "Chronicles Software Development Company",
      period: "Apr 2025 – Jun 2026",
      role: "Sole developer",
      status: "Runs on the company’s student tablets. Not on app stores.",
      summary:
        "A customized browser built into the company’s student tablets. It blocks adult and betting sites, enforces safe search, emails browsing activity to parents, and locks downloads behind a PIN that only a parent can give.",
      contribution: [
        "Built the app alone with React Native for Android, in roughly one to two months.",
        "Enforced a blocklist covering adult websites, betting websites and other adult content.",
        "Enforced safe search on search engines such as Google and Bing, for what a blocklist can’t catch.",
        "Sent students’ browsing activity to parents by email.",
        "Added protected downloads: every download through the browser asks for a PIN that only the parent can give.",
      ],
      stack: ["React Native", "Android", "Android Studio"],
      challenges: [
        {
          title: "A blocklist can never be complete",
          body: "New sites appear faster than any list can grow, so blocking adult and betting sites wasn’t enough on its own. I added a second layer by strictly enforcing safe search on search engines, which covers much of what the list misses.",
        },
        {
          title: "Keeping parents informed without another app",
          body: "Parents shouldn’t need to install or learn anything. Activity goes to their email, which they already check, so there’s no separate app or interface for them to manage.",
        },
        {
          title: "Downloads are a way around the rules",
          body: "A browser’s restrictions mean little if anything can be downloaded freely. Each download through the browser stops and asks for a PIN that only the parent can give, which keeps a person in that decision.",
        },
      ],
      images: [],
      figure: "safe-browser",
      links: [],
      note: "This app is built into the company’s tablets and covered by contract, so I can’t show it. The figure on this page is an illustration I wrote for this site, with placeholder site names and a demo PIN.",
    },
    {
      slug: "exam-browser",
      name: "Exam Browser",
      context: "Chronicles Software Development Company",
      period: "Apr 2025 – Jun 2026",
      role: "Sole developer",
      status: "Runs on the company’s student tablets. Not on app stores.",
      summary:
        "A customized examination browser built into the company’s student tablets. It disables the back button, screenshots and screen recording, and ends the exam if a student leaves the exam screen.",
      contribution: [
        "Built the app alone with React Native for Android, in roughly one to two months.",
        "Disabled the back button so students can’t navigate away from the exam.",
        "Ended the examination when the app loses focus, so leaving the exam screen has a consequence.",
        "Disabled screenshots and screen recording, so exam content can’t be captured on the device.",
      ],
      stack: ["React Native", "Android", "Android Studio"],
      challenges: [
        {
          title: "Tablets are built for leaving",
          body: "Moving between apps is one of the most natural things a person does on a tablet. An exam has to work against that default for its whole length.",
        },
        {
          title: "Making leaving count",
          body: "Rather than rely on blocking every possible route out, the app watches for what matters: losing focus. If the student leaves the exam screen, the exam ends, whichever way they left.",
        },
        {
          title: "Protecting the questions too",
          body: "Integrity is also about the content itself. With screenshots and screen recording disabled, questions can’t be captured on the tablet and passed on.",
        },
      ],
      images: [],
      figure: "exam-browser",
      links: [],
      note: "This app is built into the company’s tablets and covered by contract, so I can’t show it. The figure on this page is an illustration I wrote for this site.",
    },
    {
      slug: "skye-editor",
      name: "Skye Editor",
      context: "Skyestudio",
      period: "Jun 2024 – Mar 2025",
      role: "Software Engineer",
      status: "Employer’s product. Not shown publicly.",
      summary:
        "A web-based design tool for creating marketing materials: text, images and shapes on a canvas, with layers, transforms and export, running entirely in the browser.",
      contribution: [
        "Developed the editor’s frontend with Vue.js and Vite.",
        "Integrated Fabric.js and HTML5 Canvas for drag-and-drop, object transformations and clip-path manipulation.",
        "Built text editing, image manipulation and shape customization features.",
        "Built multi-layer management, opacity controls and multi-format export.",
      ],
      stack: ["Vue.js", "Vite", "Fabric.js", "HTML5 Canvas", "JavaScript"],
      challenges: [
        {
          title: "Two sources of truth",
          body: "Fabric.js holds objects on the canvas while Vue holds the panels around it. Layers, selection and properties have to agree at all times, whichever side a change starts from.",
        },
        {
          title: "Rendering while someone drags",
          body: "Transforms fire continuously, and a design can hold many objects. Rendering had to be optimized so the canvas keeps up with the pointer and the surrounding interface doesn’t redraw on every move.",
        },
        {
          title: "Export has to match the canvas",
          body: "A designer expects the exported file to look exactly like what’s on screen. Multi-format export meant handling layers, opacity and clip paths faithfully in each output.",
        },
      ],
      images: [],
      figure: "canvas-mini",
      links: [],
      note: "The miniature on this page isn’t Skye Editor, and it doesn’t use Fabric.js. I wrote it from scratch for this site, to show the kind of interaction state the job involved. The product itself is proprietary.",
    },
    {
      slug: "chronicles",
      name: "SuccessTab & SuccessBox",
      context: "Chronicles Software Dev Company",
      period: "Apr 2025 – Jun 2026",
      role: "Frontend Software Engineer",
      status: "SuccessBox site is live. SuccessTab dashboards are private.",
      summary:
        "Educational technology for Nigerian students and schools: interactive learning dashboards on the SuccessTab platform, which render differently by role and school type, and SuccessBox, its download and subscription site.",
      contribution: [
        "Built interactive learning dashboards in React.js and TypeScript, with reusable components and responsive layouts in Tailwind CSS.",
        "Integrated REST APIs to drive dynamic rendering by user role and school type, and debugged role-based data flows.",
        "Ran UI audits and visual regression checks against WCAG guidelines.",
        "Investigated state-management issues and performance bottlenecks to make dashboards more reliable.",
        "Reviewed code and mentored junior developers.",
        "Worked on the SuccessBox public site for junior and senior school downloads.",
      ],
      stack: ["React.js", "TypeScript", "Tailwind CSS", "REST APIs", "HTML5 / CSS3"],
      challenges: [
        {
          title: "One dashboard, many audiences",
          body: "The same modules serve different roles, administrative tiers and school types. Rendering had to follow the API’s data and permissions, so nobody sees a broken shell or data that isn’t theirs.",
        },
        {
          title: "Reliability in existing state",
          body: "Much of the work was tracing state and data-flow bugs through a live codebase: finding where a value goes stale, fixing the cause, and leaving the code easier to follow.",
        },
        {
          title: "Consistency across modules",
          body: "Working with backend and design teams to keep modules visually consistent, using reusable components and regular UI audits, while the product kept changing.",
        },
      ],
      images: [
        {
          src: "/images/successbox.webp",
          alt: "SuccessBox website home page offering a one-month free trial, with a student holding books",
          caption: "SuccessBox, the public download and subscription site.",
          width: 1440,
          height: 900,
        },
      ],
      figure: "role-lens",
      links: [
        { label: "SuccessBox", href: "https://successbox.vercel.app" },
        { label: "Source", href: "https://github.com/Phyhan4top/successbox" },
        { label: "Chronicles website", href: "https://www.chroniclesoft.com" },
      ],
      note: "SuccessTab’s dashboards are private. The figure here is a wireframe of the role-based pattern, drawn for this site. It isn’t the product’s interface.",
    },
    {
      slug: "tino",
      name: "Tino",
      context: "Tino",
      period: "Mar 2023 – Jun 2024",
      role: "Frontend Engineer",
      status: "Employer’s product. Not shown publicly.",
      summary:
        "The frontend of an e-commerce platform in Next.js, built around server-side rendering for search visibility and first-load speed, with an interactive calendar scheduling module.",
      contribution: [
        "Implemented Next.js server-side rendering and routing to support SEO and initial page load.",
        "Built an interactive calendar scheduling module with JavaScript and CSS3.",
        "Developed reusable frontend structures, and improved responsive layouts with Tailwind CSS across mobile and desktop.",
      ],
      stack: ["Next.js", "React", "JavaScript", "Tailwind CSS", "CSS3"],
      challenges: [
        {
          title: "Deciding what renders where",
          body: "Search visibility and first load depend on what the server sends. Choosing which components to render on the server, and keeping them reusable, shaped the frontend’s structure.",
        },
        {
          title: "A calendar is an interaction problem",
          body: "A scheduling calendar packs date logic, selection and layout into a small space, and it has to remain usable on a phone.",
        },
      ],
      images: [],
      links: [],
    },
    {
      slug: "fivecart",
      name: "FiveCart",
      context: "Independent repository",
      period: "2026",
      role: "Mobile development",
      status: "Source available. Run it with Expo.",
      summary:
        "A small React Native product-upload app: up to five products with name, price and photo, full validation, and on-device persistence.",
      contribution: [
        "Built the app with Expo, TypeScript and the Context API.",
        "Added camera and gallery image picking with preview, input validation, editing and deletion.",
        "Persisted products locally with AsyncStorage, and enforced the five-product limit with a clear notice.",
      ],
      stack: ["React Native", "Expo", "TypeScript", "Context API", "AsyncStorage"],
      challenges: [
        {
          title: "A small app, done properly",
          body: "Each limit and failure has a visible state: empty names, missing images, invalid prices, and the point where the fifth product disables new uploads.",
        },
      ],
      images: [],
      links: [{ label: "Source", href: "https://github.com/Phyhan4top/YIP-TASK" }],
    },
  ],

  record: {
    roles: [
      {
        company: "PhyhanAgro Marketplace Ltd",
        companyUrl: "https://www.phyhanagro.com.ng/",
        role: "Founder & Lead Software Engineer",
        place: "Lagos, Nigeria",
        start: "2025-04",
        end: null,
        projectSlug: "phyhanagro",
        points: [
          "Lead the architecture and build of a multi-role marketplace for farmers, buyers, agents and staff, with role-based access and dedicated dashboards.",
          "Built multi-farm carts, order splitting and logistics coordination, with Paystack wallet funding and transaction tracking.",
          "Designed configurable rules for fees, deadlines and notifications that change without a redeploy.",
        ],
      },
      {
        company: "Chronicles Software Dev Company",
        companyUrl: "https://www.chroniclesoft.com",
        role: "Frontend Software Engineer",
        place: "Lagos, Nigeria",
        start: "2025-04",
        end: "2026-06",
        projectSlug: "chronicles",
        moreProjects: [
          { label: "Safe Browser", slug: "safe-browser" },
          { label: "Exam Browser", slug: "exam-browser" },
        ],
        points: [
          "Built interactive learning dashboards for SuccessTab with React.js, TypeScript and REST APIs, rendering by role.",
          "Ran UI audits and visual regression checks against WCAG guidelines.",
          "Debugged state-management and performance issues; reviewed code and mentored junior developers.",
          "Built Safe Browser and Exam Browser alone: React Native apps for Android, running on the company’s student tablets.",
          "Resolved a persistent Android Studio build failure with no documented fix by moving the source into a clean project.",
        ],
      },
      {
        company: "Skyestudio",
        role: "Software Engineer",
        place: "Lagos, Nigeria",
        start: "2024-06",
        end: "2025-03",
        projectSlug: "skye-editor",
        points: [
          "Developed Skye Editor, a browser-based design tool, with Vue.js, Vite and Fabric.js.",
          "Built drag-and-drop, clip paths, object transforms, layers, opacity and multi-format export.",
        ],
      },
      {
        company: "Tino",
        role: "Frontend Engineer",
        place: "Lagos, Nigeria",
        start: "2023-03",
        end: "2024-06",
        projectSlug: "tino",
        points: [
          "Implemented Next.js SSR for the SEO and first-load performance of an e-commerce platform.",
          "Built an interactive calendar scheduling module and reusable frontend structures.",
        ],
      },
      {
        company: "Kryzotech",
        role: "Software Developer",
        place: "Dhaka, Bangladesh (remote)",
        start: "2022-12",
        end: "2023-03",
        points: [
          "Built responsive interfaces and integrated them with REST APIs on a distributed team.",
          "Translated business requirements into deployable features alongside engineering and design.",
        ],
      },
    ],
    education: {
      degree: "B.Sc. Computer Science",
      school: "University of Ilorin",
      place: "Kwara, Nigeria",
      period: "Dec 2022 – Aug 2026",
    },
  },

  toolkit: [
    {
      group: "Frontend development",
      items: [
        { name: "React.js", tier: "daily", where: "PhyhanAgro, Chronicles" },
        { name: "TypeScript", tier: "daily", where: "PhyhanAgro, Chronicles" },
        { name: "Next.js", tier: "daily", where: "PhyhanAgro, Tino" },
        { name: "Tailwind CSS", tier: "daily", where: "PhyhanAgro, Chronicles, Tino" },
        { name: "JavaScript, HTML, CSS", tier: "daily", where: "Every project" },
        { name: "Responsive, accessible UI", tier: "daily", where: "WCAG audits at Chronicles" },
        { name: "SSR / SSG", tier: "regular", where: "Tino, PhyhanAgro" },
        { name: "Vue.js", tier: "regular", where: "Skye Editor" },
        { name: "Redux Toolkit", tier: "regular", where: "Product work" },
        { name: "Fabric.js, HTML5 Canvas", tier: "regular", where: "Skye Editor" },
      ],
    },
    {
      group: "Mobile development",
      items: [
        { name: "React Native", tier: "regular", where: "Safe Browser, Exam Browser, PhyhanAgro" },
        { name: "Android, Android Studio", tier: "regular", where: "Safe Browser, Exam Browser" },
        { name: "Expo", tier: "regular", where: "PhyhanAgro, FiveCart" },
        { name: "Progressive Web Apps", tier: "regular", where: "PhyhanAgro v1" },
      ],
    },
    {
      group: "Backend and APIs",
      items: [
        { name: "REST API integration", tier: "daily", where: "Every product role" },
        { name: "Node.js, Express", tier: "regular", where: "PhyhanAgro v1, this site" },
        { name: "NestJS", tier: "regular", where: "PhyhanAgro" },
        { name: "MongoDB", tier: "regular", where: "PhyhanAgro, this site" },
        { name: "Paystack, OPay", tier: "regular", where: "PhyhanAgro" },
        { name: "Prisma", tier: "familiar", where: "A NestJS API project" },
      ],
    },
    {
      group: "Tools and workflow",
      items: [
        { name: "Git, GitHub", tier: "daily", where: "Every project" },
        { name: "Claude, Cursor, Copilot, Codex", tier: "daily", where: "Reviewed like any other code" },
        { name: "Vite", tier: "regular", where: "Skye Editor, this site" },
        { name: "Figma", tier: "regular", where: "Working with design" },
        { name: "Postman", tier: "regular", where: "API work" },
        { name: "CI/CD pipelines", tier: "familiar", where: "GitHub Actions on PhyhanAgro" },
      ],
    },
  ],

  contact: {
    heading: "Bring me the hard part.",
    body: "A role, a collaboration or a product with difficult insides. If it needs both a careful interface and clear thinking behind it, I’d like to hear about it.",
  },
};
