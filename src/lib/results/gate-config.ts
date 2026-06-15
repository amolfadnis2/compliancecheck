// Server-safe gate config. This must NOT live in a 'use client' module:
// when a Server Component imports a named export from a client module,
// Next.js turns it into a client-reference stub, so calling it on the
// server throws "x is not a function". Keep this plain (no 'use client').

export interface GateConfig {
  /** PostHog source string, e.g. "dpdp_assessment" */
  source: string
  /** Short reason shown inside the gate card */
  reason: string
}

const GATE_CONFIG: Record<string, GateConfig> = {
  statutory_health: {
    source: 'statutory_health_assessment',
    reason: 'Email me my Statutory Health Check report so I can refer back to it',
  },
  labour_code: {
    source: 'labour_code_assessment',
    reason: 'Email me my Labour Code Readiness report so I can refer back to it',
  },
  dpdp: {
    source: 'dpdp_assessment',
    reason: 'Email me my DPDP Gap Assessment report so I can refer back to it',
  },
  state_wise_compliance: {
    source: 'state_wise_assessment',
    reason: 'Email me my State-Wise Compliance report so I can refer back to it',
  },
  food_business: {
    source: 'food_business_assessment',
    reason: 'Email me my Food Business Compliance report so I can refer back to it',
  },
  posh: {
    source: 'posh_assessment',
    reason: 'Email me my POSH Compliance report so I can refer back to it',
  },
}

export function getGateConfig(assessmentType: string): GateConfig {
  return (
    GATE_CONFIG[assessmentType] ?? {
      source: `${assessmentType}_assessment`,
      reason: 'Verify your email to view your compliance report',
    }
  )
}
