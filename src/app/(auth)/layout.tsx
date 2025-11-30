export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">ComplianceCheck</h1>
          <p className="text-gray-600">Simplifying compliance for Indian businesses</p>
        </div>
        {children}
      </div>
    </div>
  )
}
