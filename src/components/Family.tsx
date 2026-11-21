// The CDM family of products, shown on the landing page. Links follow the addresses set in CDM Partners > App addresses
// (public/cdm-links.js switches any old address to the current one).
const FAMILY = [
  { id: 'cdm24', name: 'CDM ERP', text: 'Point of sale, stock, accounts and an online store for pharmacies, supermarkets, shops, restaurants and hotels.', url: 'https://cdm24.netlify.app' },
  { id: 'cdmschool', name: 'CDM School', text: 'School management: attendance, results, report sheets, fees online and parent updates.', url: 'https://cdmschool.netlify.app' },
  { id: 'cdmfinrep', name: 'CDM FinRep', text: 'Financial accounting and reporting software for businesses and accountants.', url: 'https://cdmfinrep.bolt.host' },
  { id: 'cdmprep', name: 'CDM Prep', text: 'Exam preparation for ICAN, ANAN, ACCA and CPA, with practice questions, mock exams and worked answers.', url: 'https://cdmprep.bolt.host' },
  { id: 'cdmpeople', name: 'CDM People', text: 'Payroll and HR with PAYE, pension, NHF and payslips.', url: 'https://cdmpeople.bolt.host' },
  { id: 'cdmclearance', name: 'CDM Clearance', text: 'E-invoices checked against the NRS e-invoicing rules, with practice and live modes.', url: 'https://cdmclearance.bolt.host' },
  { id: 'cdmfood', name: 'CDM Food', text: 'Meal planner for every country: plan your week, recipes and cooking videos, and Ask AI for health goals.', url: 'https://cdm-food.netlify.app' },
  { id: 'cdmstudio', name: 'CDM Studio', text: 'Learn AI, coding, data and design with certified courses, and build websites and apps with AI.', url: 'https://cdmtechnologies.github.io/cdm-studio/' },
  { id: 'cdmsocial', name: 'CDM Social', text: 'AI social media manager: plans, writes and posts to Facebook, Instagram, LinkedIn and X, only after your approval.', url: 'https://cdmtechnologies.github.io/cdm-social/' },
  { id: 'cdmpartners', name: 'CDM Partners', text: 'Earn commission selling the CDM family of software.', url: 'https://cdmpartners.bolt.host' },
]

export default function Family({ self }: { self: string }) {
  return (
    <section aria-labelledby="family-title" className="space-y-5">
      <div>
        <h2 id="family-title" className="font-display text-2xl font-bold sm:text-3xl">More from CDM Technologies</h2>
        <p className="mt-1 text-slate-600">One family of software for businesses, schools and learners. One login works across CDM Studio and CDM Social.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FAMILY.filter((f) => f.id !== self).map((f) => (
          <a key={f.id} href={f.url} target="_blank" rel="noopener noreferrer" className="card block p-5 transition hover:shadow-md">
            {f.id !== 'cdmpartners' && <img src={`./logos/${f.id}.png`} alt="" className="mb-3 h-12 w-auto" loading="lazy" />}
            <h3 className="text-lg font-bold">{f.name}</h3>
            <p className="mt-1 text-sm text-slate-600">{f.text}</p>
            <span className="mt-3 inline-block text-sm font-semibold underline">Visit website</span>
          </a>
        ))}
      </div>
    </section>
  )
}
