import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, ClipboardCheck, Shield, FileText } from 'lucide-react'
import { RUPEE } from '@/lib/constants'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b bg-white/90 backdrop-blur-md fixed top-0 left-0 right-0 z-50">
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
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            🎉 Both Assessments Now FREE
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
              <Button size="lg" className="bg-green-600 hover:bg-green-700">
                Statutory Health Check
              </Button>
            </Link>
            <Link href="/assessment/labour-code">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Labour Code Readiness
              </Button>
            </Link>
          </div>
          
          {/* Stats */}
          <div className="flex justify-center gap-12 mt-16 pt-8 border-t">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">2</div>
              <div className="text-gray-600 text-sm">Assessment Tools</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">10 min</div>
              <div className="text-gray-600 text-sm">Average Time</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">FREE</div>
              <div className="text-gray-600 text-sm">Limited Time</div>
            </div>
          </div>
        </div>
      </section>


      {/* Products Section */}
      <section id="products" className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Assessment</h2>
            <p className="text-gray-600">Get your compliance report instantly. No payment required.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Statutory Health Check */}
            <Card className="border-2 border-green-600 hover:shadow-lg transition-all relative">
              <div className="absolute -top-3 left-4 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                FREE
              </div>
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                  <ClipboardCheck className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle>Statutory Health Check</CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold text-green-600">FREE</span>
                  <span className="text-lg text-gray-400 line-through">{RUPEE}999</span>
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
                  <Button className="w-full bg-green-600 hover:bg-green-700">Start Free Assessment</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Labour Code Readiness */}
            <Card className="border-2 border-blue-600 hover:shadow-lg transition-all relative">
              <div className="absolute -top-3 left-4 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                MOST POPULAR
              </div>
              <div className="absolute -top-3 right-4 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                FREE
              </div>
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>Labour Code Readiness</CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold text-blue-600">FREE</span>
                  <span className="text-lg text-gray-400 line-through">{RUPEE}1,999</span>
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


            {/* DPDP - Coming Soon */}
            <Card className="border-2 border-dashed border-gray-300 opacity-75">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex items-center gap-2">
                  <CardTitle>DPDP Gap Assessment</CardTitle>
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">Coming Soon</span>
                </div>
                <div className="text-3xl font-bold text-gray-400">{RUPEE}2,499 <span className="text-base font-normal">one-time</span></div>
                <CardDescription>
                  Data protection compliance for DPDP Act 2023.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2 text-sm text-gray-500">
                    <CheckCircle className="w-4 h-4 text-gray-400" />
                    Data practice questionnaire
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-500">
                    <CheckCircle className="w-4 h-4 text-gray-400" />
                    Compliance maturity score
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-500">
                    <CheckCircle className="w-4 h-4 text-gray-400" />
                    Privacy notice template
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-500">
                    <CheckCircle className="w-4 h-4 text-gray-400" />
                    Risk heat map
                  </li>
                </ul>
                <Button className="w-full" variant="outline" disabled>Coming Soon</Button>
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
            <a href="mailto:hello@compliancecheck.in" className="hover:text-gray-900">Contact</a>
          </div>
          <div className="text-sm text-gray-500">
            © 2025 ComplianceCheck. Made in India 🇮🇳
          </div>
        </div>
      </footer>
    </div>
  )
}
