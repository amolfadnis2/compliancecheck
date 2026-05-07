'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Calculator, Loader2 } from 'lucide-react'
import { INDIAN_STATES } from '@/lib/constants/india'
import {
  EMPLOYEE_SNAP_POINTS,
  INDUSTRY_OPTIONS,
  TURNOVER_BAND_LABELS,
  type IndustryType,
  type TurnoverBand,
} from '@/lib/calculators/penalty-exposure/types'

export interface FormValues {
  state: string
  employeeCount: number
  industry: IndustryType
  turnoverBand: TurnoverBand
  processesPersonalData: boolean
  hasWomenEmployees: boolean
}

interface Props {
  values: FormValues
  onChange: (values: FormValues) => void
  onCalculate: () => void
  isLoading: boolean
}

const TURNOVER_BANDS: TurnoverBand[] = ['lt40L', '40L-2cr', '2-10cr', '10-50cr', '50-500cr', '500cr+']

function ToggleGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  testId,
}: {
  label: string
  options: Array<{ value: T; label: string }>
  value: T | null
  onChange: (v: T) => void
  testId?: string
}) {
  return (
    <div>
      <Label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </Label>
      <div className="flex flex-wrap gap-2" data-testid={testId}>
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${
              value === opt.value
                ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-blue-500'
            }`}
            aria-pressed={value === opt.value}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export function InputForm({ values, onChange, onCalculate, isLoading }: Props) {
  const isValid =
    !!values.state &&
    values.employeeCount > 0 &&
    !!values.industry &&
    !!values.turnoverBand

  return (
    <div className="space-y-6">
      {/* State */}
      <div>
        <Label htmlFor="state-select" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          State / Union Territory
        </Label>
        <Select
          value={values.state}
          onValueChange={(v) => onChange({ ...values, state: v })}
        >
          <SelectTrigger id="state-select" className="w-full bg-white dark:bg-gray-800">
            <SelectValue placeholder="Select your state…" />
          </SelectTrigger>
          <SelectContent>
            {INDIAN_STATES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Employee Count */}
      <ToggleGroup
        label="Number of Employees"
        options={EMPLOYEE_SNAP_POINTS.map((n) => ({
          value: n as unknown as IndustryType,
          label: n === 500 ? '500+' : String(n),
        }))}
        value={values.employeeCount as unknown as IndustryType}
        onChange={(v) => onChange({ ...values, employeeCount: Number(v) })}
        testId="employee-count-group"
      />

      {/* Industry */}
      <div>
        <Label htmlFor="industry-select" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Industry
        </Label>
        <Select
          value={values.industry}
          onValueChange={(v) => onChange({ ...values, industry: v as IndustryType })}
        >
          <SelectTrigger id="industry-select" className="w-full bg-white dark:bg-gray-800">
            <SelectValue placeholder="Select your industry…" />
          </SelectTrigger>
          <SelectContent>
            {INDUSTRY_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Annual Turnover */}
      <ToggleGroup
        label="Annual Turnover"
        options={TURNOVER_BANDS.map((b) => ({
          value: b as unknown as IndustryType,
          label: TURNOVER_BAND_LABELS[b],
        }))}
        value={values.turnoverBand as unknown as IndustryType}
        onChange={(v) => onChange({ ...values, turnoverBand: v as unknown as TurnoverBand })}
        testId="turnover-band-group"
      />

      {/* Switches */}
      <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Label htmlFor="personal-data-switch" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Process customer personal data?
            </Label>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Enables DPDP Act 2023 penalty calculation
            </p>
          </div>
          <Switch
            id="personal-data-switch"
            checked={values.processesPersonalData}
            onCheckedChange={(v) => onChange({ ...values, processesPersonalData: v })}
          />
        </div>
        <div className="flex items-center justify-between gap-4">
          <div>
            <Label htmlFor="women-employees-switch" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Employ women?
            </Label>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Enables POSH Act 2013 penalty calculation
            </p>
          </div>
          <Switch
            id="women-employees-switch"
            checked={values.hasWomenEmployees}
            onCheckedChange={(v) => onChange({ ...values, hasWomenEmployees: v })}
          />
        </div>
      </div>

      {/* Calculate Button */}
      <Button
        onClick={onCalculate}
        disabled={!isValid || isLoading}
        size="lg"
        className="w-full bg-blue-700 hover:bg-blue-800 text-white"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Calculating…
          </>
        ) : (
          <>
            <Calculator className="mr-2 h-5 w-5" />
            Calculate My Exposure
          </>
        )}
      </Button>
    </div>
  )
}
