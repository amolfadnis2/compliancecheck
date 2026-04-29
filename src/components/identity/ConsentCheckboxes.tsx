'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

interface ConsentCheckboxesProps {
  showMarketing: boolean
  showDeadlineReminders: boolean
  marketingChecked: boolean
  deadlineRemindersChecked: boolean
  onMarketingChange: (v: boolean) => void
  onDeadlineRemindersChange: (v: boolean) => void
}

export function ConsentCheckboxes({
  showMarketing,
  showDeadlineReminders,
  marketingChecked,
  deadlineRemindersChecked,
  onMarketingChange,
  onDeadlineRemindersChange,
}: ConsentCheckboxesProps) {
  if (!showMarketing && !showDeadlineReminders) return null

  return (
    <div className="space-y-2.5 py-1">
      {showDeadlineReminders && (
        <div className="flex items-start gap-2.5">
          <Checkbox
            id="consent-reminders"
            checked={deadlineRemindersChecked}
            onCheckedChange={(v) => onDeadlineRemindersChange(v === true)}
            aria-label="Send me compliance deadline reminders"
          />
          <Label htmlFor="consent-reminders" className="text-sm font-normal leading-snug cursor-pointer">
            Send me compliance deadline reminders
            <span className="block text-xs text-muted-foreground">Functional — only deadlines relevant to your business</span>
          </Label>
        </div>
      )}

      {showMarketing && (
        <div className="flex items-start gap-2.5">
          <Checkbox
            id="consent-marketing"
            checked={marketingChecked}
            onCheckedChange={(v) => onMarketingChange(v === true)}
            aria-label="Send me product updates"
          />
          <Label htmlFor="consent-marketing" className="text-sm font-normal leading-snug cursor-pointer">
            Send me product updates
            <span className="block text-xs text-muted-foreground">Occasional — new features and compliance news</span>
          </Label>
        </div>
      )}
    </div>
  )
}
