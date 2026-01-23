import { ThemeToggle } from '@/components/ui/theme-toggle'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ComplianceCheck</h1>
          <p className="text-gray-600 dark:text-gray-400">Simplifying compliance for Indian businesses</p>
        </div>
        {children}
      </div>
    </div>
  )
}
