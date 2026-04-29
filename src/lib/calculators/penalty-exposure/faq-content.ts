export interface FAQItem {
  question: string
  answer: string
}

export const FAQ_ITEMS: FAQItem[] = [
  {
    question: 'How is the "Typical Annual Risk" figure calculated?',
    answer:
      'The Typical Annual Risk is a probability-weighted estimate. We take each applicable penalty and multiply it by a gap rate — the proportion of Indian SMEs in that category that our surveys indicate are currently non-compliant. For example, if 42% of companies with 10+ employees lack a constituted Internal Complaints Committee (POSH), we apply a 0.42 multiplier to the ₹50,000 penalty ceiling. Sources include the CII-Protiviti India Risk Survey 2024 and PwC DPDP Readiness Survey 2024. See the full methodology for all rates and citations.',
  },
  {
    question: 'What is the DPDP Act and why are its penalties so large?',
    answer:
      'The Digital Personal Data Protection Act 2023 came into force partially on November 13, 2025 (Data Protection Board constituted). Full enforcement — including the penalty schedule — is expected by May 13, 2027. Penalties are tiered up to ₹250 crore per violation for data security failures, which brings DPDP exposure to the top of most calculators. The large number is the statutory ceiling, not the expected fine for a first violation. Our typical risk figures apply a gap rate of 0.84 (only 16% of Indian businesses claim readiness per PwC 2024) and scale with your estimated data volume (proxied by turnover).',
  },
  {
    question: 'Do the new Labour Codes apply to my business in 2026?',
    answer:
      'Yes. The Code on Wages 2019 notified its rules on November 21, 2025, making it nationally enforceable. It applies to every establishment, regardless of size. The OSH, Industrial Relations, and Social Security Codes are pending state-level rules, but central establishment provisions are already active for many sectors. Use our Labour Code Readiness assessment for a detailed gap analysis specific to your state and industry.',
  },
  {
    question: 'What happens if my company does not have an Internal Complaints Committee under POSH?',
    answer:
      'Every employer with 10 or more employees must constitute an Internal Committee (IC) under the Prevention, Prohibition and Redressal of Sexual Harassment of Women at Workplace Act 2013. Failure to do so attracts a penalty of up to ₹50,000 on first violation. A second or subsequent conviction can result in the cancellation of your business licence. Additionally, if a complaint is raised without an IC in place, the employer faces direct liability for the victim\'s losses.',
  },
  {
    question: 'How accurate are these estimates for my specific company?',
    answer:
      'This calculator gives an order-of-magnitude estimate, not a legal opinion. The typical risk uses aggregate industry gap rates, not your internal records. It does not account for your actual compliance posture, payroll size, or pending investigations. Use it as a decision-making trigger — if the numbers are large, a paid assessment will tell you exactly where your gaps are. The statutory maximums are accurate per current law (April 2026).',
  },
  {
    question: 'Our EPF / ESI contributions are always paid on time. Will that reduce the estimate?',
    answer:
      'The calculator applies an industry-average gap rate rather than your actual compliance record, since it cannot verify your filings. If you are consistently timely, your real exposure for late-payment penalties is near zero. The calculation is a conservative worst-case trigger for businesses that have not formally audited their compliance. A Statutory Health Check assessment lets you confirm your actual status in 15 minutes.',
  },
  {
    question: 'Does this calculator cover all compliance requirements?',
    answer:
      'No — it covers the most financially significant laws for Indian SMEs: EPF, ESI, Labour Codes, POSH, DPDP, GST, Companies Act, FSSAI, and Factories Act. It does not cover Professional Tax, Contract Labour Act, Shops & Establishments Act, state-specific excise or environmental rules, SEBI/RBI regulations, or sector-specific licences. Our State-Wise Compliance assessment adds the state layer.',
  },
  {
    question: 'When will DPDP penalties actually be enforced?',
    answer:
      'The Data Protection Board of India (DPB) was constituted on November 13, 2025 and began operations. Full enforcement — including the penalty schedule under the Schedule to the DPDP Act — is expected when the remaining rules are notified. The government has indicated a May 2027 target for full rule notification. Businesses that process personal data of Indian residents should be compliant well before that date; grace periods are typically short once rules are notified.',
  },
]
