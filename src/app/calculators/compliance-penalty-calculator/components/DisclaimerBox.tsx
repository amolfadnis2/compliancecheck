import { AlertTriangle } from 'lucide-react'

export function DisclaimerBox() {
  return (
    <div className="flex gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-950/30">
      <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
      <div className="text-sm text-amber-800 dark:text-amber-300">
        <span className="font-semibold">Estimates only.</span> Maximum penalties are statutory ceilings;
        actual penalties are determined by adjudicating authorities based on case specifics. Typical risk
        figures are probability-weighted estimates based on industry surveys and our internal data, not
        predictions for your business. This is not legal advice. Consult a qualified compliance
        professional.{' '}
        <span className="font-medium">Penalty rates current as of April 2026.</span>
      </div>
    </div>
  )
}
