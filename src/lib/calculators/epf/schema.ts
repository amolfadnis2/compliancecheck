/**
 * zod schema for EPF engine input — used at the server/URL boundary and in
 * tests. Not imported by client components (keeps zod out of the page bundle);
 * the client uses ./rules.ts, which this schema also applies.
 */

import { z } from 'zod'
import { inputRuleErrors } from './rules'
import { SCENARIO_KEYS, type EpfErrorCode, type EpfFieldError, type EpfInput, type EpfValidationResult } from './types'

export const epfInputSchema = z
  .object({
    age: z.number(),
    retirementAge: z.number(),
    startY: z.number().int().min(2000).max(2200),
    startM: z.number().int().min(1).max(12),
    basic: z.number(),
    allowances: z.number().min(0).default(0),
    hikePct: z.number().min(0).max(100),
    stepUpMonth: z.number().int().min(1).max(12),
    opening: z.number().min(0).default(0),
    basis: z.enum(['capped', 'actual']),
    contributionRate: z.union([z.literal(0.12), z.literal(0.1)]).default(0.12),
    epsMember: z.boolean(),
    pastEpsYears: z.number().min(0).max(40).default(0),
    labourCode: z.boolean().default(false),
    vpfPct: z.number().min(0).max(100).default(0),
    interestTiming: z.enum(['next_month', 'same_month']),
    scenario: z.enum(SCENARIO_KEYS),
    customRate: z.number(),
    inflationPct: z.number().min(0).max(100).default(0),
    taxRegime: z.enum(['new', 'old']),
    slabPct: z.number().min(0).max(100).default(0),
    rounding: z.enum(['rupee', 'paise']).default('rupee'),
    epsCeilingReading: z.enum(['25000', '15000']),
    ratePath: z.record(z.string(), z.number()).optional(),
    useHistorical: z.boolean().optional(),
  })
  .superRefine((inp, ctx) => {
    for (const e of inputRuleErrors(inp)) {
      ctx.addIssue({ code: 'custom', path: [e.field], message: e.message, params: { errorCode: e.code } })
    }
  })

/** Validate input with zod; returns field-level errors with typed codes. */
export function validateInput(raw: unknown): EpfValidationResult {
  const parsed = epfInputSchema.safeParse(raw)
  if (parsed.success) return { ok: true, value: parsed.data as EpfInput }
  const errors: EpfFieldError[] = parsed.error.issues.map((issue) => {
    const params = (issue as { params?: { errorCode?: EpfErrorCode } }).params
    return {
      code: params?.errorCode ?? 'INVALID_INPUT',
      field: issue.path.map(String).join('.') || 'input',
      message: issue.message,
    }
  })
  return { ok: false, errors }
}
