import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, ClipboardCheck, Shield, FileText, Calculator } from 'lucide-react'
import { RUPEE } from '@/lib/constants'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Beta Banner */}
      <div className="bg-amber-700 text-white text-center py-2 px-4 text-sm font-medium fixed top-0 left-0 right-0 z-[60]">
        🚧 This site is under development. All assessments are <strong>FREE</strong> for a limited time. 
        We&apos;d love your feedback at{' '}
        <a href="mailto:compliancecheck@zohomail.in" className="underline font-bold">compliancecheck@zohomail.in</a>
      </div>

      {/* Navigation */}
      <nav className="border-b bg-white/90 backdrop-blur-md fixed top-10 left-0 right-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl">ComplianceCheck</span>
          </div>
          <Link href="#products">
            <Button>Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            🎉 FREE During Beta - Limited Time Only
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Instant Compliance Reports
            <br />
            <span className="text-blue-600">for Indian SMEs</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Get compliance assessments in 10 minutes. No subscriptions. No consultants. 
            Just answers you can act on.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/assessment/statutory-health">
              <Button size="lg" className="bg-green-700 hover:bg-green-800">
                Statutory Health Check
              </Button>
            </Link>
            <Link href="/assessment/labour-code">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Labour Code Readiness
              </Button>
            </Link>
            <Link href="/calculator/gratuity">
              <Button size="lg" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                Gratuity Calculator
              </Button>
            </Link>
          </div>
          
          {/* Stats */}
          <div className="flex justify-center gap-12 mt-16 pt-8 border-t">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">4</div>
              <div className="text-gray-600 text-sm">Tools Available</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">10 min</div>
              <div className="text-gray-600 text-sm">Average Time</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">FREE</div>
              <div className="text-gray-600 text-sm">During Beta</div>
            </div>
          </div>
        </div>
      </section>


      {/* Products Section */}
      <section id="products" className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Assessment</h2>
            <p className="text-gray-600">Get your compliance report instantly. Free during beta testing.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Statutory Health Check */}
            <Card className="border-2 border-green-600 hover:shadow-lg transition-all relative">
              <div className="absolute -top-3 left-4 bg-green-800 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                FREE BETA
              </div>
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                  <ClipboardCheck className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle>Statutory Health Check</CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold text-green-600">FREE</span>
                  <span className="text-lg text-gray-600 line-through">{RUPEE}999</span>
                </div>
                <CardDescription>
                  Quick 10-minute check for PF, ESI, PT, Gratuity & Bonus compliance.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    12 guided questions
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Traffic-light compliance dashboard
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Priority action items
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    PDF report included
                  </li>
                </ul>
                <Link href="/assessment/statutory-health">
                  <Button className="w-full bg-green-700 hover:bg-green-800">Start Free Assessment</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Labour Code Readiness */}
            <Card className="border-2 border-blue-600 hover:shadow-lg transition-all relative">
              <div className="absolute -top-3 left-4 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                MOST POPULAR
              </div>
              <div className="absolute -top-3 right-4 bg-green-800 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                FREE BETA
              </div>
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>Labour Code Readiness</CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold text-blue-600">FREE</span>
                  <span className="text-lg text-gray-600 line-through">{RUPEE}1,999</span>
                </div>
                <CardDescription>
                  Comprehensive assessment for all 4 new Labour Codes (effective Nov 2025).
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    30 detailed questions
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    Readiness score per code
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    Gap analysis report
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    Prioritised action items
                  </li>
                </ul>
                <Link href="/assessment/labour-code">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">Start Free Assessment</Button>
                </Link>
              </CardContent>
            </Card>


            {/* DPDP Gap Assessment - NEW */}
            <Card className="border-2 border-purple-600 hover:shadow-lg transition-all relative">
              <div className="absolute -top-3 left-4 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                NEW
              </div>
              <div className="absolute -top-3 right-4 bg-green-800 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                FREE BETA
              </div>
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle>DPDP Gap Assessment</CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold text-purple-600">FREE</span>
                  <span className="text-lg text-gray-600 line-through">{RUPEE}2,499</span>
                </div>
                <CardDescription>
                  Data protection compliance for DPDP Act 2023. Deadline: May 2027.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-purple-600" />
                    25+ guided questions
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-purple-600" />
                    Risk level assessment
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-purple-600" />
                    Penalty exposure analysis
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-purple-600" />
                    Remediation roadmap
                  </li>
                </ul>
                <Link href="/assessment/dpdp">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">Start Free Assessment</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Document Templates - NEW */}
            <Card className="border-2 border-gray-200 hover:shadow-lg transition-all">
              <div className="absolute -top-3 right-4 bg-green-800 text-white text-xs font-bold px-3 py-1 rounded-full">
                FREE BETA
              </div>
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle>Employee Consent Form</CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold text-green-600">FREE</span>
                  <span className="text-lg text-gray-600 line-through">{RUPEE}499</span>
                </div>
                <CardDescription>
                  DPDP Act 2023 compliant employee data consent template.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Customisable consent form
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    All DPDP rights included
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Ready-to-print PDF
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Grievance officer section
                  </li>
                </ul>
                <Link href="/documents/employee-consent">
                  <Button className="w-full bg-green-700 hover:bg-green-800">Generate Document</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Free Tools Section */}
      <section id="free-tools" className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
              🧮 Free Calculators
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Compliance Calculators</h2>
            <p className="text-gray-600">Free tools based on 2025 Labour Code rules. Always free, no registration required.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Gratuity Calculator */}
            <Card className="border-2 border-blue-600 hover:shadow-lg transition-all relative">
              <div className="absolute -top-3 left-4 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                NEW
              </div>
              <div className="absolute -top-3 right-4 bg-green-700 text-white text-xs font-bold px-3 py-1 rounded-full">
                ALWAYS FREE
              </div>
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <Calculator className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>Gratuity Calculator</CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold text-blue-600">FREE</span>
                  <span className="text-sm text-green-600 font-medium">Forever</span>
                </div>
                <CardDescription>
                  Calculate gratuity under new Labour Codes. Fixed-term employees now eligible after 1 year!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    2025 Labour Code formula
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    Fixed-term employee support
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    Rs.20 lakh ceiling applied
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    Tax exemption details
                  </li>
                </ul>
                <Link href="/calculator/gratuity">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">Calculate Gratuity</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Coming Soon: PF Calculator */}
            <Card className="border-2 border-gray-200 hover:shadow-lg transition-all opacity-75">
              <div className="absolute -top-3 left-4 bg-gray-400 text-white text-xs font-bold px-3 py-1 rounded-full">
                COMING SOON
              </div>
              <CardHeader>
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
                  <Calculator className="w-6 h-6 text-gray-400" />
                </div>
                <CardTitle className="text-gray-500">PF Contribution Calculator</CardTitle>
                <CardDescription className="text-gray-400">
                  Calculate EPF contributions with employer and employee breakdowns.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button disabled className="w-full" variant="outline">Coming Soon</Button>
              </CardContent>
            </Card>

            {/* Coming Soon: CTC Calculator */}
            <Card className="border-2 border-gray-200 hover:shadow-lg transition-all opacity-75">
              <div className="absolute -top-3 left-4 bg-gray-400 text-white text-xs font-bold px-3 py-1 rounded-full">
                COMING SOON
              </div>
              <CardHeader>
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
                  <Calculator className="w-6 h-6 text-gray-400" />
                </div>
                <CardTitle className="text-gray-500">CTC to In-Hand Calculator</CardTitle>
                <CardDescription className="text-gray-400">
                  New 50% basic salary rule applied. Calculate take-home salary.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button disabled className="w-full" variant="outline">Coming Soon</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold text-blue-600">1</div>
              <h3 className="font-semibold mb-2">Answer Questions</h3>
              <p className="text-gray-600 text-sm">Simple yes/no questions about your current compliance practices.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold text-blue-600">2</div>
              <h3 className="font-semibold mb-2">Get Your Score</h3>
              <p className="text-gray-600 text-sm">Instant compliance score with category breakdown.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold text-blue-600">3</div>
              <h3 className="font-semibold mb-2">Download Report</h3>
              <p className="text-gray-600 text-sm">Get a PDF report with prioritised action items.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t bg-gray-50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">ComplianceCheck</span>
          </div>
          <div className="flex gap-6 text-sm text-gray-600">
            <Link href="/privacy" className="hover:text-gray-900">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-gray-900">Terms of Service</Link>
            <a href="mailto:compliancecheck@zohomail.in" className="hover:text-gray-900">Contact</a>
          </div>
          <div className="text-sm text-gray-500">
            © 2025 ComplianceCheck. Made in India 🇮🇳
          </div>
        </div>
      </footer>
    </div>
  )
}
