import { Progress } from '@/components/ui/progress'

interface AssessmentProgressProps {
  value: number
  label: string
}

export function AssessmentProgress({ value, label }: AssessmentProgressProps) {
  return (
    <Progress
      value={value}
      className="h-3 [&>div]:bg-green-600"
      aria-label={label}
    />
  )
}
