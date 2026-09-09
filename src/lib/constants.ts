export const BRAND = {
  name: "MedAscend",
  tagline: "Rise to the standard.",
  description:
    "MedAscend is the MRCP Part 1 revision platform built by physicians: a 5,000+ question bank, past papers, blueprint-matched mock exams, a high-yield textbook and analytics that tell you when you are ready.",
  supportEmail: "support@medascend.app",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  twitter: "https://x.com/medascend",
  instagram: "https://instagram.com/medascend",
  youtube: "https://youtube.com/@medascend",
};

export const TRIAL_HOURS = 48;
export const TRIAL_QUESTION_LIMIT = 100;
export const MAX_SESSION_QUESTIONS = 100;
export const MOCK_QUESTIONS = 100;
export const MOCK_DURATION_MIN = 180;

export const DIFFICULTY_LABEL: Record<number, string> = {
  1: "Easy",
  2: "Moderate",
  3: "Hard",
};

export const SPECIALTIES: { name: string; slug: string; blueprintCount: number; description: string }[] = [
  { name: "Cardiology", slug: "cardiology", blueprintCount: 14, description: "Ischaemic heart disease, arrhythmias, valvular disease, heart failure and ECG interpretation." },
  { name: "Clinical Pharmacology & Therapeutics", slug: "clinical-pharmacology", blueprintCount: 15, description: "Mechanisms of action, adverse effects, interactions, prescribing in special groups and toxicology." },
  { name: "Clinical Sciences", slug: "clinical-sciences", blueprintCount: 25, description: "Cell biology, anatomy, biochemistry, physiology, genetics, immunology and statistics/epidemiology." },
  { name: "Dermatology", slug: "dermatology", blueprintCount: 8, description: "Inflammatory skin disease, skin cancers, cutaneous manifestations of systemic disease." },
  { name: "Endocrinology, Diabetes & Metabolic Medicine", slug: "endocrinology", blueprintCount: 14, description: "Diabetes, thyroid, adrenal, pituitary, calcium and bone metabolism." },
  { name: "Gastroenterology & Hepatology", slug: "gastroenterology", blueprintCount: 14, description: "Luminal GI disease, liver disease, pancreatobiliary disorders and nutrition." },
  { name: "Geriatric Medicine", slug: "geriatric-medicine", blueprintCount: 8, description: "Frailty, falls, delirium, dementia, polypharmacy and comprehensive geriatric assessment." },
  { name: "Haematology", slug: "haematology", blueprintCount: 10, description: "Anaemias, haemoglobinopathies, haematological malignancy, coagulation and transfusion." },
  { name: "Infectious Diseases", slug: "infectious-diseases", blueprintCount: 14, description: "Bacterial, viral, fungal and parasitic infection, HIV, tropical medicine and antimicrobials." },
  { name: "Neurology", slug: "neurology", blueprintCount: 14, description: "Stroke, epilepsy, movement disorders, neuromuscular disease, headache and neuro-anatomy." },
  { name: "Oncology", slug: "oncology", blueprintCount: 5, description: "Tumour biology, oncological emergencies, paraneoplastic syndromes and systemic therapy." },
  { name: "Medical Ophthalmology", slug: "ophthalmology", blueprintCount: 4, description: "The red eye, visual loss, ocular manifestations of systemic disease and neuro-ophthalmology." },
  { name: "Palliative Medicine & End of Life Care", slug: "palliative-medicine", blueprintCount: 4, description: "Symptom control, opioid conversion, ethics and end-of-life decision making." },
  { name: "Psychiatry", slug: "psychiatry", blueprintCount: 9, description: "Mood disorders, psychosis, substance misuse, organic psychiatry and psychopharmacology." },
  { name: "Renal Medicine", slug: "renal-medicine", blueprintCount: 14, description: "AKI, CKD, glomerulonephritis, electrolyte disorders and renal replacement therapy." },
  { name: "Respiratory Medicine", slug: "respiratory-medicine", blueprintCount: 14, description: "Asthma, COPD, interstitial lung disease, infection, malignancy and lung function." },
  { name: "Rheumatology", slug: "rheumatology", blueprintCount: 14, description: "Inflammatory arthritis, connective tissue disease, vasculitis and bone disease." },
];

export const EXAM_INFO = {
  papers: 2,
  questionsPerPaper: 100,
  totalQuestions: 200,
  paperDurationHours: 3,
  passMarkScaled: 540,
  scaledRange: "200–800",
  passMarkApprox: "≈60%",
  maxAttempts: 6,
  feeUK: "£489",
  feeInternational: "£655",
  diets: [
    { exam: "28 January 2026", applications: "4–11 November 2025", results: "13 March 2026" },
    { exam: "21 May 2026", applications: "10–17 March 2026", results: "3 July 2026" },
    { exam: "23 September 2026", applications: "14–21 July 2026", results: "6 November 2026" },
  ],
};
