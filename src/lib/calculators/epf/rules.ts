/**
 * Business validation rules for the PF calculator (same rules and messages as
 * the approved prototype's validate()). zod-free so the client can use them;
 * ./schema.ts applies the same function inside its zod superRefine.
 */

import type { EpfFieldError } from './types'

export interface RuleInput {
  age: number
  retirementAge: number
  basic: number
  scenario: string
  customRate: number
}

export function inputRuleErrors(inp: RuleInput): EpfFieldError[] {
  const errors: EpfFieldError[] = []
  if (!(inp.age >= 18 && inp.age <= 57)) {
    errors.push({ code: 'INVALID_AGE', field: 'age', message: 'Enter an age between 18 and 57.' })
  }
  if (!(inp.retirementAge > inp.age && inp.retirementAge <= 60)) {
    errors.push({ code: 'INVALID_RETIREMENT_AGE', field: 'retirementAge', message: 'Retirement age must be above your age and at most 60.' })
  }
  if (!(inp.basic > 0)) {
    errors.push({ code: 'INVALID_BASIC', field: 'basic', message: 'Enter your monthly Basic + DA.' })
  }
  if (inp.scenario === 'custom' && !(inp.customRate >= 5 && inp.customRate <= 12)) {
    errors.push({ code: 'INVALID_CUSTOM_RATE', field: 'customRate', message: 'Use a rate between 5% and 12%.' })
  }
  return errors
}
