'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, Calculator, CheckCircle, XCircle, Info, Calendar } from 'lucide-react'
import { AssessmentHeader } from '@/components/assessment/assessment-header'
import { INDIAN_STATES, RUPEE } from '@/lib/constants/india'
import { trackEvent, ANALYTICS_EVENTS } from '@/lib/analytics'
import {
  calculatePayrollStatutory,
  PAYROLL_RULES_LAST_REVIEWED,
  type PayrollStatutoryResult,
} from '@/lib/calculators/payroll-statutory-calculator'

const inr = (n: number) => `${RUPEE}${n.toLocaleString('en-IN')}`

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex justify-between gap-4 py-1.5 text-sm ${strong ? 'font-semibold border-t mt-1 pt-2' : ''}`}>
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  )
}

function StatusIcon({ ok }: { ok: boolean }) {
  return ok
    ? <CheckCircle className="w-5 h-5 text-green-600" />
    : <XCircle className="w-5 h-5 text-gray-400" />
}

export default function PayrollStatutoryCalculatorPage() {
  const [state, setState] = useState('')
  const [employeeCount, setEmployeeCount] = useState('')
  const [basicDA, setBasicDA] = useState('')
  const [gross, setGross] = useState('')
  const [gender, setGender] = useState<'male' | 'female'>('male')
  const [pfOnActualBasic, setPfOnActualBasic] = useState(false)
  const [result, setResult] = useState<PayrollStatutoryResult | null>(null)

  const isValid = state !== '' && Number(employeeCount) > 0 && Number(basicDA) > 0 && Number(gross) >= Number(basicDA)

  const handleCalculate = () => {
    if (!isValid) return
    const calcResult = calculatePayrollStatutory({
      state,
      employeeCount: Number(employeeCount),
      monthlyBasicDA: Number(basicDA),
      monthlyGross: Number(gross),
      gender: state === 'Maharashtra' ? gender : undefined,
      pfOnActualBasic,
    })
    setResult(calcResult)

    trackEvent(ANALYTICS_EVENTS.CALCULATOR_COMPLETED, {
      calculator_type: 'pf_esi_pt',
      state,
      employee_count: Number(employeeCount),
      pf_applicable: calcResult.pf.applicable,
      esi_covered: calcResult.esi.employeeCovered,
      pt_status: calcResult.pt.status,
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <AssessmentHeader
        title="ComplianceCheck"
        subtitle="PF, ESI & PT Calculator"
        badgeText="FREE Tool"
        badgeVariant="free"
      />

      <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
        <Link href="/" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to home
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Do PF and ESI apply, and what do they cost?</CardTitle>
            <CardDescription>
              Enter your headcount and one employee&apos;s monthly salary. You&apos;ll see EPF, ESI and Professional Tax for that employee. No signup needed.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label>State where the employee works</Label>
              <Select value={state} onValueChange={setState}>
                <SelectTrigger>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {INDIAN_STATES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="employeeCount">Total employees in your business</Label>
              <Input
                id="employeeCount"
                type="number"
                min="1"
                value={employeeCount}
                onChange={(e) => setEmployeeCount(e.target.value)}
                placeholder="e.g., 24"
              />
              <p className="text-xs text-gray-500">Count everyone on payroll, including contract staff employed through you.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="basicDA">Monthly Basic + DA</Label>
              <div className="flex">
                <span className="inline-flex items-center px-3 text-gray-600 bg-gray-100 border border-r-0 rounded-l-md">{RUPEE}</span>
                <Input
                  id="basicDA"
                  type="number"
                  min="0"
                  value={basicDA}
                  onChange={(e) => setBasicDA(e.target.value)}
                  placeholder="e.g., 12000"
                  className="rounded-l-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gross">Monthly gross salary</Label>
              <div className="flex">
                <span className="inline-flex items-center px-3 text-gray-600 bg-gray-100 border border-r-0 rounded-l-md">{RUPEE}</span>
                <Input
                  id="gross"
                  type="number"
                  min="0"
                  value={gross}
                  onChange={(e) => setGross(e.target.value)}
                  placeholder="e.g., 20000"
                  className="rounded-l-none"
                />
              </div>
              <p className="text-xs text-gray-500">Basic + DA + all allowances, before deductions. Must be at least Basic + DA.</p>
            </div>

            {state === 'Maharashtra' && (
              <div className="space-y-2">
                <Label>Employee gender (Maharashtra PT slabs differ)</Label>
                <Select value={gender} onValueChange={(v) => setGender(v as 'male' | 'female')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-start gap-2">
              <Checkbox
                id="pfOnActualBasic"
                checked={pfOnActualBasic}
                onCheckedChange={(v) => setPfOnActualBasic(v === true)}
              />
              <Label htmlFor="pfOnActualBasic" className="text-sm font-normal leading-snug">
                We pay PF on actual Basic + DA (above the {RUPEE}15,000 ceiling)
              </Label>
            </div>

            <Button onClick={handleCalculate} disabled={!isValid} className="w-full bg-blue-600 hover:bg-blue-700" size="lg">
              <Calculator className="w-4 h-4 mr-2" />
              Calculate
            </Button>
          </CardContent>
        </Card>

        {result && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <StatusIcon ok={result.pf.applicable} /> EPF (Provident Fund)
                </CardTitle>
                <CardDescription>{result.pf.reason}</CardDescription>
              </CardHeader>
              {result.pf.applicable && (
                <CardContent>
                  <Row label="PF wages" value={inr(result.pf.pfWage)} />
                  <Row label="Employee share (12%)" value={inr(result.pf.employee)} />
                  <Row label="Employer: EPS (8.33%)" value={inr(result.pf.employerEPS)} />
                  <Row label="Employer: EPF (balance of 12%)" value={inr(result.pf.employerEPF)} />
                  <Row label="Employer: EDLI (0.5%)" value={inr(result.pf.employerEDLI)} />
                  <Row label="Employer: admin charges (0.5%)" value={inr(result.pf.employerAdmin)} />
                  <Row label="Employer total" value={inr(result.pf.employerTotal)} strong />
                </CardContent>
              )}
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <StatusIcon ok={result.esi.employeeCovered} /> ESI (Employees&apos; State Insurance)
                </CardTitle>
                <CardDescription>{result.esi.reason}</CardDescription>
              </CardHeader>
              {result.esi.employeeCovered && (
                <CardContent>
                  <Row label="Employee share (0.75%)" value={inr(result.esi.employee)} />
                  <Row label="Employer share (3.25%)" value={inr(result.esi.employer)} />
                </CardContent>
              )}
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <StatusIcon ok={result.pt.status === 'levied' && result.pt.monthly > 0} /> Professional Tax
                </CardTitle>
                <CardDescription>{result.pt.note}</CardDescription>
              </CardHeader>
              {result.pt.status === 'levied' && result.pt.monthly > 0 && (
                <CardContent>
                  <Row label="Deducted from employee" value={`${inr(result.pt.monthly)} / month`} />
                </CardContent>
              )}
            </Card>

            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle>Monthly total for this employee</CardTitle>
              </CardHeader>
              <CardContent>
                <Row label="Deducted from employee's salary" value={inr(result.totals.employeeDeductions)} />
                <Row label="Employer's cost on top of salary" value={inr(result.totals.employerCost)} strong />
              </CardContent>
            </Card>

            {result.dueDates.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" /> Due dates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {result.dueDates.map((d) => (
                    <Row key={d.item} label={d.item} value={d.due} />
                  ))}
                </CardContent>
              </Card>
            )}

            {result.notes.length > 0 && (
              <Card className="border-amber-200 bg-amber-50">
                <CardContent className="pt-4 space-y-2">
                  {result.notes.map((n) => (
                    <div key={n} className="flex items-start gap-2 text-sm text-amber-900">
                      <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{n}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="pt-4 space-y-3 text-sm">
                <p className="font-medium">Is the rest of your payroll compliance in order?</p>
                <p className="text-muted-foreground">
                  The Statutory Health Check covers PF, ESI, PT, gratuity, bonus, registers and more in about 10 minutes.
                </p>
                <Link href="/assessment/statutory-health">
                  <Button variant="outline">Start the Statutory Health Check</Button>
                </Link>
              </CardContent>
            </Card>
          </>
        )}

        <p className="text-xs text-gray-500">
          Sources: EPF &amp; MP Act 1952 and EPF Scheme 1952; ESI Act 1948; Code on Social Security 2020; state Professional Tax Acts.
          Rules last reviewed {PAYROLL_RULES_LAST_REVIEWED}. This is general information, not legal advice. Coverage can also depend on
          ESIC-notified areas and exempted establishments. Verify with EPFO, ESIC or your state tax department before filing.
        </p>
      </div>
    </div>
  )
}
