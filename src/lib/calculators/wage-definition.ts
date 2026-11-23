/**
 * "Wages" under the Code on Wages, 2019 (and the Maharashtra Wage Rules, 2026)
 *
 * Wages = basic + DA + retaining allowance. If the components excluded from
 * wages (HRA, conveyance, special allowance, ...) exceed 50% of total pay, the
 * excess is added back to wages. This feeds gratuity and other statutory
 * benefits.
 *
 *   excluded = totalPay - wageComponents
 *   addBack  = max(0, excluded - 50% x totalPay)
 *   wages    = wageComponents + addBack
 *
 * The PF corpus calculator applies the same rule in `pfWageOf`
 * (src/lib/calculators/epf/engine.ts).
 */

export const WAGE_SHARE_FLOOR = 0.5

export interface StatutoryWages {
  /** Basic + DA + retaining allowance, as entered. */
  wageComponents: number
  /** Total monthly pay used for the 50% test (0 when not given). */
  totalRemuneration: number
  /** Excess of excluded components over 50% of total pay. */
  addBack: number
  /** Wages for gratuity and other statutory benefits. */
  wages: number
}

/**
 * @param wageComponents   Basic + DA + retaining allowance (monthly)
 * @param totalRemuneration Total monthly pay including excluded allowances.
 *   Optional: when absent, zero or not above `wageComponents`, nothing is
 *   added back.
 */
export function statutoryWages(wageComponents: number, totalRemuneration?: number): StatutoryWages {
  const base = Math.max(0, wageComponents)
  const total = totalRemuneration && totalRemuneration > base ? totalRemuneration : 0
  const excluded = total - base
  const addBack = total > 0 ? Math.max(0, excluded - WAGE_SHARE_FLOOR * total) : 0
  return {
    wageComponents: base,
    totalRemuneration: total,
    addBack,
    wages: base + addBack,
  }
}
