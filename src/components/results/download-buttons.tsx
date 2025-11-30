'use client'

import { Button } from '@/components/ui/button'
import { Download, Mail } from 'lucide-react'

export function DownloadButtons() {
  const handleDownload = () => {
    window.print()
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <Button className="flex-1" onClick={handleDownload}>
        <Download className="w-4 h-4 mr-2" />
        Download PDF Report
      </Button>
      <Button variant="outline" className="flex-1" disabled>
        <Mail className="w-4 h-4 mr-2" />
        Email Report (Coming Soon)
      </Button>
    </div>
  )
}
