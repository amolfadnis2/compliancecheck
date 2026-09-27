import { describe, it, expect } from 'vitest'
import { calculatePayrollStatutory } from '@/lib/calculators/payroll-statutory-calculator'

const base = {
  state: 'Karnataka',
  employeeCount: 25,
  monthlyBasicDA: 10000,
  monthlyGross: 18000,
}

describe('calculatePayrollStatutory — EPF', () => {
  it('is not mandatory at 19 employees', () => {
    const r = calculatePayrollStatutory({ ...base, employeeCount: 19 })
    expect(r.pf.applicable).toBe(false)
    expect(r.pf.employee).toBe(0)
    expect(r.pf.employerTotal).toBe(0)
  })

  it('is mandatory at 20 employees', () => {
    const r = calculatePayrollStatutory({ ...base, employeeCount: 20 })
    expect(r.pf.applicable).toBe(true)
    // 12% of 10,000
    expect(r.pf.employee).toBe(1200)
    expect(r.pf.employerEPS).toBe(833)
    expect(r.pf.employerEPF).toBe(367)
    expect(r.pf.employerEDLI).toBe(50)
    expect(r.pf.employerAdmin).toBe(50)
    expect(r.pf.employerTotal).toBe(1300)
  })

  it('caps PF wages at Rs.15,000 by default', () => {
    const r = calculatePayrollStatutory({ ...base, monthlyBasicDA: 30000, monthlyGross: 50000 })
    expect(r.pf.pfWage).toBe(15000)
    expect(r.pf.employee).toBe(1800)
    expect(r.pf.employerEPS).toBe(1250)
    expect(r.pf.employerEPF).toBe(550)
  })

  it('keeps EPS and EDLI capped when contributing on actual basic', () => {
    const r = calculatePayrollStatutory({ ...base, monthlyBasicDA: 30000, monthlyGross: 50000, pfOnActualBasic: true })
    expect(r.pf.pfWage).toBe(30000)
    expect(r.pf.employee).toBe(3600)
    expect(r.pf.employerEPS).toBe(1250)
    expect(r.pf.employerEPF).toBe(2350)
    expect(r.pf.employerEDLI).toBe(75)
    expect(r.pf.employerAdmin).toBe(150)
  })
})

describe('calculatePayrollStatutory — ESI', () => {
  it('does not apply below 10 employees', () => {
    const r = calculatePayrollStatutory({ ...base, employeeCount: 9 })
    expect(r.esi.establishmentCovered).toBe(false)
    expect(r.esi.employee).toBe(0)
  })

  it('covers an employee at exactly Rs.21,000 gross', () => {
    const r = calculatePayrollStatutory({ ...base, monthlyGross: 21000 })
    expect(r.esi.employeeCovered).toBe(true)
    expect(r.esi.employee).toBe(158) // 157.5 rounded up
    expect(r.esi.employer).toBe(683) // 682.5 rounded up
  })

  it('does not cover an employee above Rs.21,000 gross', () => {
    const r = calculatePayrollStatutory({ ...base, monthlyGross: 21001 })
    expect(r.esi.establishmentCovered).toBe(true)
    expect(r.esi.employeeCovered).toBe(false)
    expect(r.esi.employer).toBe(0)
  })
})

describe('calculatePayrollStatutory — Professional Tax', () => {
  it('uses the Karnataka slab', () => {
    expect(calculatePayrollStatutory({ ...base, monthlyGross: 24999 }).pt.monthly).toBe(0)
    expect(calculatePayrollStatutory({ ...base, monthlyGross: 30000 }).pt.monthly).toBe(200)
  })

  it('uses the Maharashtra gender-specific slab', () => {
    const male = calculatePayrollStatutory({ ...base, state: 'Maharashtra', monthlyGross: 20000, gender: 'male' })
    const female = calculatePayrollStatutory({ ...base, state: 'Maharashtra', monthlyGross: 20000, gender: 'female' })
    expect(male.pt.monthly).toBe(200)
    expect(female.pt.monthly).toBe(0)
  })

  it('uses the West Bengal and Tamil Nadu slabs', () => {
    expect(calculatePayrollStatutory({ ...base, state: 'West Bengal', monthlyGross: 20000 }).pt.monthly).toBe(130)
    expect(calculatePayrollStatutory({ ...base, state: 'Tamil Nadu', monthlyGross: 25000 }).pt.monthly).toBe(135)
  })

  it('reports no PT in Delhi', () => {
    const r = calculatePayrollStatutory({ ...base, state: 'Delhi', monthlyGross: 50000 })
    expect(r.pt.status).toBe('not_levied')
    expect(r.pt.monthly).toBe(0)
  })

  it('flags states without slab data as unknown, not zero-tax', () => {
    const r = calculatePayrollStatutory({ ...base, state: 'Mizoram', monthlyGross: 50000 })
    expect(r.pt.status).toBe('unknown')
  })

  it('marks Bihar as annual', () => {
    expect(calculatePayrollStatutory({ ...base, state: 'Bihar' }).pt.status).toBe('annual')
  })
})

describe('calculatePayrollStatutory — totals and notes', () => {
  it('sums employee deductions and employer cost', () => {
    const r = calculatePayrollStatutory(base)
    expect(r.totals.employeeDeductions).toBe(r.pf.employee + r.esi.employee + r.pt.monthly)
    expect(r.totals.employerCost).toBe(r.pf.employerTotal + r.esi.employer)
  })

  it('warns when Basic + DA is below 50% of gross', () => {
    const r = calculatePayrollStatutory({ ...base, monthlyBasicDA: 8000, monthlyGross: 18000 })
    expect(r.notes.some(n => n.includes('50%'))).toBe(true)
  })
})
