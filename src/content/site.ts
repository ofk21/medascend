export const NAV_LINKS = [
  { href: "/#features", label: "Features" },
  { href: "/exam-guide", label: "Exam guide" },
  { href: "/pricing", label: "Pricing" },
  { href: "/blog", label: "Blog" },
  { href: "/help", label: "Help" },
];

export const FAQ = [
  {
    q: "What is the MRCP(UK) Part 1 exam?",
    a: "MRCP Part 1 is the first of three examinations leading to Membership of the Royal Colleges of Physicians. It is a written exam of two three-hour papers, each containing 100 best-of-five questions (200 in total), testing core medical knowledge and the clinical sciences that underpin medical practice.",
  },
  {
    q: "Who is eligible to sit MRCP Part 1?",
    a: "You can apply once you have at least 12 months of postgraduate clinical experience (the equivalent of completing Foundation Year 1). Most candidates sit the exam within 12–24 months of graduating.",
  },
  {
    q: "How many attempts are allowed?",
    a: "A maximum of six attempts is permitted at MRCP Part 1. Well-structured revision that focuses on understanding rather than memorising gives you the best chance of passing first time.",
  },
  {
    q: "How does MedAscend match the real exam?",
    a: "Every question is written in the best-of-five format, text only, with one mark per correct answer and no negative marking – exactly like the exam. Mock exams are generated from the official specialty blueprint so the balance of topics mirrors the real paper.",
  },
  {
    q: "What is the difference between Tutor mode and Timed mode?",
    a: "Tutor mode reveals the answer and full explanation immediately after each question, ideal for learning. Timed mode hides feedback until you finish, replicating exam conditions with a countdown clock, so you can rehearse pacing (roughly 1.8 minutes per question).",
  },
  {
    q: "Can I try before I buy?",
    a: "Yes. Every new account gets a free 48-hour trial with access to the textbook and up to 100 practice questions. No card details are needed.",
  },
  {
    q: "Does my subscription renew automatically?",
    a: "No. Subscriptions are one-off purchases for 3, 6 or 12 months of access. You can extend at any time and the new period is added to your remaining access.",
  },
  {
    q: "What is your refund policy?",
    a: "If you have answered fewer than 50 questions and it is within 7 days of purchase, email us and we will refund you in full. See the refund policy page for details.",
  },
];

export const FEATURES = [
  {
    key: "qbank",
    title: "Qbank",
    headline: "Thousands of exam-style best-of-five questions",
    text: "Every question is peer-reviewed by physicians who have sat the exam, mapped to the official blueprint and written in the exact best-of-five style you will face on the day. Filter by specialty, difficulty, familiarity and keyword to build a session of up to 100 questions.",
  },
  {
    key: "papers",
    title: "Past Papers",
    headline: "Bespoke past papers built from candidate feedback",
    text: "Sit full papers that reproduce the themes and difficulty reported by candidates after each diet. Complete them under exam conditions and review every explanation afterwards.",
  },
  {
    key: "mock",
    title: "Mock Exams",
    headline: "Blueprint-matched mocks with a 3-hour clock",
    text: "Generate a fresh 100-question mock at any time. Specialty weighting follows the MRCP(UK) blueprint, so your score is a realistic indicator of exam readiness.",
  },
  {
    key: "textbook",
    title: "Textbook",
    headline: "High-yield topics that link straight to questions",
    text: "Clear, structured notes for every essential topic. Read a chapter, then test yourself on linked questions without leaving the page.",
  },
  {
    key: "analytics",
    title: "Analytics",
    headline: "Know exactly when you are ready",
    text: "A live readiness score, accuracy by specialty, trend over time and peer comparison show your weak areas and how you compare with thousands of other candidates.",
  },
  {
    key: "tutor",
    title: "AI Tutor",
    headline: "Instant, on-demand explanations while you practise",
    text: "Stuck on an option? Ask the AI tutor to break down the question, explain why distractors are wrong or go deeper on the underlying physiology – all from the question page.",
  },
];

export const LEARNING_CYCLE = [
  { step: "Learn", text: "Read the high-yield textbook topic and its key points." },
  { step: "Practise", text: "Answer blueprint-mapped best-of-five questions in Tutor mode." },
  { step: "Identify", text: "Analytics pinpoints weak specialties and recurring mistakes." },
  { step: "Reinforce", text: "Re-test incorrect and flagged questions until they stick." },
  { step: "Progress", text: "Sit timed mocks and watch your readiness score climb." },
];

export const DEFAULT_TESTIMONIALS = [
  { name: "Dr Amani Al-Harbi", role: "Passed MRCP Part 1, first attempt", quote: "The mock exams felt exactly like the real thing. On exam day nothing surprised me – the pacing, the phrasing, the mix of specialties. I finished with time to spare.", rating: 5 },
  { name: "Dr Tom Whitaker", role: "IMT2, Manchester", quote: "The analytics changed how I revised. Instead of re-reading everything I focused on my three weakest specialties and my score went up 14% in a month.", rating: 5 },
  { name: "Dr Priya Nair", role: "Core Medical Trainee", quote: "Explanations for every wrong option is the killer feature. You learn five things from one question rather than one.", rating: 5 },
];

export const DEFAULT_PLANS = [
  { name: "12 months", slug: "12-months", durationDays: 365, pricePence: 19999, badge: "Best value", sortOrder: 1, description: "For candidates planning ahead or sitting more than one diet." },
  { name: "6 months", slug: "6-months", durationDays: 182, pricePence: 14999, badge: null, sortOrder: 2, description: "Our most popular plan – comfortably covers one full revision cycle." },
  { name: "3 months", slug: "3-months", durationDays: 91, pricePence: 9999, badge: null, sortOrder: 3, description: "Focused, intensive revision in the final stretch before the exam." },
];

export const PLAN_FEATURES = [
  "Full question bank with detailed explanations",
  "All past papers and unlimited blueprint mocks",
  "Complete high-yield textbook",
  "Tutor & Timed modes, flags and notes",
  "Analytics, readiness score and peer comparison",
  "AI tutor on every question",
];
