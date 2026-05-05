'use client'

import Link from 'next/link'
import { 
  Building2, 
  ClipboardCheck, 
  FileCheck2, 
  Download, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  Clock,
  Shield,
  FileText,
  CreditCard
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md border-b border-gray-100 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-800 to-blue-600 rounded-lg flex items-center justify-center">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-gray-900">ComplianceCheck</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/how-it-works" className="text-sm font-medium text-blue-700">
                How It Works
              </Link>
              <Link href="/assessment/statutory-health">
                <Button className="bg-gray-900 hover:bg-gray-800 text-white">
                  Start Assessment
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-2 text-sm text-blue-700 font-medium mb-6">
            <Clock className="h-4 w-4" />
            Complete in under 10 minutes
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            How ComplianceCheck Works
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            From answering simple questions to downloading your detailed compliance report — 
            here&apos;s exactly what happens at each step.
          </p>
        </div>
      </section>

      {/* Process Steps */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          
          {/* Step 1 */}
          <div className="relative mb-16">
            <div className="flex items-start gap-8">
              <div className="flex-shrink-0">
                <div className="w-14 h-14 rounded-2xl bg-blue-700 text-white flex items-center justify-center text-xl font-bold shadow-lg">
                  1
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-3 flex items-center gap-3">
                  <Building2 className="h-6 w-6 text-blue-700" />
                  Enter Your Company Details
                </h2>
                <p className="text-gray-600 mb-6">
                  Tell us about your business so we can tailor the assessment to your specific situation. 
                  Different industries and company sizes have different compliance requirements.
                </p>
                
                <Card className="border-2 border-gray-200 shadow-md">
                  <CardHeader className="bg-gray-50 border-b">
                    <CardTitle className="text-base">Company Information</CardTitle>
                    <CardDescription>We collect only what&apos;s needed for your assessment</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Contact Name</label>
                        <div className="h-10 bg-gray-100 rounded-md border flex items-center px-3 text-gray-500">Rahul Sharma</div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                        <div className="h-10 bg-gray-100 rounded-md border flex items-center px-3 text-gray-500">TechStart Solutions Pvt Ltd</div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Employee Count</label>
                        <div className="h-10 bg-gray-100 rounded-md border flex items-center px-3 text-gray-500">51-100 employees</div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
                        <div className="h-10 bg-gray-100 rounded-md border flex items-center px-3 text-gray-500">Information Technology</div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Registered State</label>
                        <div className="h-10 bg-gray-100 rounded-md border flex items-center px-3 text-gray-500">Maharashtra</div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <div className="h-10 bg-gray-100 rounded-md border flex items-center px-3 text-gray-500">rahul@techstart.in</div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-4 flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      Your data is protected under DPDP Act 2023. We never share your information.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative mb-16">
            <div className="flex items-start gap-8">
              <div className="flex-shrink-0">
                <div className="w-14 h-14 rounded-2xl bg-blue-700 text-white flex items-center justify-center text-xl font-bold shadow-lg">
                  2
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-3 flex items-center gap-3">
                  <ClipboardCheck className="h-6 w-6 text-blue-700" />
                  Answer Yes/No Questions
                </h2>
                <p className="text-gray-600 mb-6">
                  Based on your profile, we filter questions to show only what&apos;s relevant to your business. 
                  Most questions are simple Yes/No — no legal jargon required.
                </p>
                
                <Card className="border-2 border-gray-200 shadow-md">
                  <CardHeader className="bg-gray-50 border-b">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">EPF Compliance</span>
                      <span className="text-sm text-gray-500">Question 5 of 12</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full mt-3 overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: '42%' }} />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Do you submit EPF returns on or before the 15th of each month?
                    </h3>
                    <p className="text-sm text-gray-500 mb-6">
                      EPF Act requires monthly returns by the 15th. Late filing attracts penalties.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <button className="h-14 border-2 border-green-500 bg-green-50 rounded-xl flex items-center justify-center gap-2 text-green-700 font-medium hover:bg-green-100 transition-colors">
                        <CheckCircle2 className="h-5 w-5" />
                        Yes
                      </button>
                      <button className="h-14 border-2 border-gray-200 rounded-xl flex items-center justify-center gap-2 text-gray-700 font-medium hover:bg-gray-50 transition-colors">
                        <XCircle className="h-5 w-5" />
                        No
                      </button>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="h-4 w-4" />
                  Auto-advances after selection — no extra clicks needed
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative mb-16">
            <div className="flex items-start gap-8">
              <div className="flex-shrink-0">
                <div className="w-14 h-14 rounded-2xl bg-blue-700 text-white flex items-center justify-center text-xl font-bold shadow-lg">
                  3
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-3 flex items-center gap-3">
                  <CreditCard className="h-6 w-6 text-blue-700" />
                  Complete Payment
                </h2>
                <p className="text-gray-600 mb-6">
                  After completing the assessment, securely pay via Razorpay. We accept UPI, cards, 
                  net banking, and wallets. You only pay once — no recurring subscriptions.
                </p>
                
                <Card className="border-2 border-gray-200 shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <p className="font-medium text-gray-900">Labour Code Readiness Assessment</p>
                        <p className="text-sm text-gray-500">One-time payment • Instant access</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">Pay Now</p>
                      </div>
                    </div>
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <p className="text-sm font-medium text-gray-700 mb-3">Payment Methods</p>
                      <div className="flex flex-wrap gap-3">
                        <span className="px-3 py-1.5 bg-white border rounded text-sm">UPI</span>
                        <span className="px-3 py-1.5 bg-white border rounded text-sm">Credit Card</span>
                        <span className="px-3 py-1.5 bg-white border rounded text-sm">Debit Card</span>
                        <span className="px-3 py-1.5 bg-white border rounded text-sm">Net Banking</span>
                        <span className="px-3 py-1.5 bg-white border rounded text-sm">Wallets</span>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                      <Shield className="h-3 w-3" />
                      Secured by Razorpay • PCI DSS Compliant
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="relative mb-16">
            <div className="flex items-start gap-8">
              <div className="flex-shrink-0">
                <div className="w-14 h-14 rounded-2xl bg-blue-700 text-white flex items-center justify-center text-xl font-bold shadow-lg">
                  4
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-3 flex items-center gap-3">
                  <FileCheck2 className="h-6 w-6 text-blue-700" />
                  View Your Results Summary
                </h2>
                <p className="text-gray-600 mb-6">
                  Instantly see your compliance score with category-wise breakdowns. 
                  Understand exactly where you stand and what needs attention.
                </p>
                
                {/* Sample Results Summary */}
                <Card className="border-2 border-gray-200 shadow-md overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-blue-800 to-blue-600 text-white">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-white text-lg">Labour Code Readiness Assessment</CardTitle>
                        <CardDescription className="text-blue-100">
                          TechStart Solutions Pvt Ltd • Maharashtra
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-4xl font-bold">72%</div>
                        <div className="text-blue-200 text-sm">Overall Score</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4 mb-6">
                      <h4 className="font-semibold text-gray-900">Category Scores</h4>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-700">EPF Compliance</span>
                          <span className="text-green-600 font-medium">90%</span>
                        </div>
                        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500 rounded-full" style={{ width: '90%' }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-700">ESI Compliance</span>
                          <span className="text-green-600 font-medium">85%</span>
                        </div>
                        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500 rounded-full" style={{ width: '85%' }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-700">Working Hours & Leave</span>
                          <span className="text-yellow-600 font-medium">60%</span>
                        </div>
                        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-yellow-500 rounded-full" style={{ width: '60%' }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-700">Gratuity Provisions</span>
                          <span className="text-red-600 font-medium">40%</span>
                        </div>
                        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-red-500 rounded-full" style={{ width: '40%' }} />
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-t pt-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Priority Action Items</h4>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded">HIGH</span>
                          <span className="text-sm text-gray-700">Register for Gratuity insurance or set aside provision</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded">HIGH</span>
                          <span className="text-sm text-gray-700">Update leave policy to include new code requirements</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-medium rounded">MEDIUM</span>
                          <span className="text-sm text-gray-700">Maintain overtime register as per new format</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Step 5 */}
          <div className="relative">
            <div className="flex items-start gap-8">
              <div className="flex-shrink-0">
                <div className="w-14 h-14 rounded-2xl bg-green-600 text-white flex items-center justify-center text-xl font-bold shadow-lg">
                  5
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-3 flex items-center gap-3">
                  <Download className="h-6 w-6 text-green-600" />
                  Download Your PDF Report
                </h2>
                <p className="text-gray-600 mb-6">
                  Download a professional, audit-ready PDF report. Share with your CA, legal team, 
                  or investors. Includes legal references, government portal links, and remediation steps.
                </p>
                
                {/* Sample PDF Preview */}
                <Card className="border-2 border-gray-200 shadow-lg overflow-hidden">
                  <div className="bg-white p-8 border-b-4 border-blue-700">
                    {/* PDF Header */}
                    <div className="flex justify-between items-start mb-8">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-10 h-10 bg-blue-700 rounded flex items-center justify-center">
                            <Shield className="h-5 w-5 text-white" />
                          </div>
                          <span className="text-xl font-bold text-gray-900">ComplianceCheck</span>
                        </div>
                        <p className="text-sm text-gray-500">Compliance Assessment Report</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Report ID: CC-2025-00847</p>
                        <p className="text-sm text-gray-500">Generated: 19 Jan 2025</p>
                      </div>
                    </div>

                    {/* PDF Title */}
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 mb-6">
                      <h1 className="text-2xl font-bold text-blue-800 mb-2">Labour Code Readiness Assessment</h1>
                      <p className="text-gray-600">Prepared for TechStart Solutions Pvt Ltd</p>
                    </div>

                    {/* PDF Company Info */}
                    <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                      <div className="bg-gray-50 p-3 rounded">
                        <span className="text-gray-500">Company:</span>
                        <span className="ml-2 font-medium">TechStart Solutions Pvt Ltd</span>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <span className="text-gray-500">State:</span>
                        <span className="ml-2 font-medium">Maharashtra</span>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <span className="text-gray-500">Employees:</span>
                        <span className="ml-2 font-medium">51-100</span>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <span className="text-gray-500">Industry:</span>
                        <span className="ml-2 font-medium">Information Technology</span>
                      </div>
                    </div>

                    {/* PDF Score Box */}
                    <div className="border-2 border-yellow-400 bg-yellow-50 rounded-lg p-6 mb-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg">Overall Compliance Score</h3>
                          <p className="text-sm text-gray-600">Based on responses across 4 categories</p>
                        </div>
                        <div className="text-center">
                          <div className="text-5xl font-bold text-yellow-600">72%</div>
                          <div className="text-sm text-yellow-700 font-medium">Needs Improvement</div>
                        </div>
                      </div>
                    </div>

                    {/* PDF Action Items Section */}
                    <div className="mb-6">
                      <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        High Priority Action Items
                      </h3>
                      <div className="space-y-3">
                        <div className="border-l-4 border-red-500 bg-red-50 p-4 rounded-r">
                          <p className="font-medium text-gray-900">Establish Gratuity Fund or Insurance</p>
                          <p className="text-sm text-gray-600 mt-1">
                            Section 4 of Payment of Gratuity Act requires employers with 10+ employees 
                            to establish a gratuity fund. Penalty: Up to Rs. 1,00,000 for non-compliance.
                          </p>
                          <p className="text-xs text-blue-600 mt-2">
                            Reference: shramsuvidha.gov.in/gratuity-registration
                          </p>
                        </div>
                        <div className="border-l-4 border-red-500 bg-red-50 p-4 rounded-r">
                          <p className="font-medium text-gray-900">Update Leave Policy for New Labour Codes</p>
                          <p className="text-sm text-gray-600 mt-1">
                            Code on Wages 2019 mandates annual leave of one day for every 20 days worked. 
                            Your current policy needs revision before November 2025.
                          </p>
                          <p className="text-xs text-blue-600 mt-2">
                            Reference: labour.gov.in/code-on-wages
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* PDF Footer Note */}
                    <div className="text-xs text-gray-400 border-t pt-4">
                      <p>This report is generated based on self-assessment responses and does not constitute legal advice. 
                      Please consult a qualified professional for compliance decisions.</p>
                      <p className="mt-1">© 2025 ComplianceCheck • compliancecheck.co.in</p>
                    </div>
                  </div>
                  
                  {/* Download indicator */}
                  <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FileText className="h-4 w-4" />
                      <span>Labour_Code_Assessment_Report.pdf</span>
                      <span className="text-gray-400">• 245 KB</span>
                    </div>
                    <Button className="bg-green-600 hover:bg-green-700">
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* What's Included */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            What&apos;s Included in Your Report
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-2 hover:border-blue-200 transition-colors">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-6 w-6 text-blue-700" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Compliance Score</h3>
                <p className="text-gray-600 text-sm">
                  Overall percentage score with category-wise breakdown showing exactly where you stand.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-2 hover:border-blue-200 transition-colors">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4">
                  <AlertTriangle className="h-6 w-6 text-red-700" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Gap Analysis</h3>
                <p className="text-gray-600 text-sm">
                  Detailed list of compliance gaps prioritized by risk level — High, Medium, and Low.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-2 hover:border-blue-200 transition-colors">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-green-700" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Action Items</h3>
                <p className="text-gray-600 text-sm">
                  Specific remediation steps with legal references and government portal links.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Our Compliance Assessments - SEO Section */}
      <section className="py-16 px-4 bg-gray-50" id="assessments">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Compliance Assessments for Indian Businesses
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Choose the right assessment for your business needs. From statutory compliance to data protection, 
              we cover all major regulatory requirements for Indian SMEs and startups.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Statutory Health Check */}
            <Link href="/assessments/landing/statutory-health-check" className="group">
              <Card className="h-full border-2 border-gray-200 hover:border-green-400 hover:shadow-lg transition-all duration-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                      Free During Beta
                    </span>
                    <span className="text-lg font-bold text-gray-900">₹999</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-700 transition-colors">
                    Statutory Health Check
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Quick assessment for EPF, ESI, Professional Tax, Gratuity, and Bonus compliance. 
                    Perfect for startups and SMEs to verify basic statutory compliance.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">EPF</span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">ESI</span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">Professional Tax</span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">Gratuity</span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">Bonus</span>
                  </div>
                  <div className="flex items-center text-green-600 text-sm font-medium">
                    Learn more <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Labour Code Readiness */}
            <Link href="/assessments/landing/labour-code-readiness" className="group">
              <Card className="h-full border-2 border-gray-200 hover:border-orange-400 hover:shadow-lg transition-all duration-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                      ⏰ Nov 2025 Deadline
                    </span>
                    <span className="text-lg font-bold text-gray-900">₹1,999</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                    Labour Code Readiness Assessment
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Prepare for India&apos;s 4 new Labour Codes effective November 2025. Get implementation 
                    cost estimates and a prioritized action plan before the deadline.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">Code on Wages</span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">Social Security</span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">OSH Code</span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">IR Code</span>
                  </div>
                  <div className="flex items-center text-orange-600 text-sm font-medium">
                    Learn more <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* DPDP Gap Assessment */}
            <Link href="/assessments/landing/dpdp-gap-assessment" className="group">
              <Card className="h-full border-2 border-gray-200 hover:border-purple-400 hover:shadow-lg transition-all duration-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                      🔒 Data Protection
                    </span>
                    <span className="text-lg font-bold text-gray-900">₹2,499</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-700 transition-colors">
                    DPDP Act 2023 Gap Assessment
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Comprehensive Digital Personal Data Protection Act compliance assessment. 
                    6-phase evaluation with maturity scoring and remediation roadmap.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">Data Inventory</span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">Consent</span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">Principal Rights</span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">Security</span>
                  </div>
                  <div className="flex items-center text-purple-600 text-sm font-medium">
                    Learn more <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* State-Wise Compliance */}
            <Link href="/assessments/landing/state-wise-compliance" className="group">
              <Card className="h-full border-2 border-gray-200 hover:border-teal-400 hover:shadow-lg transition-all duration-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 bg-teal-100 text-teal-700 text-xs font-semibold rounded-full">
                      📍 36 States & UTs
                    </span>
                    <span className="text-lg font-bold text-gray-900">₹1,499</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-teal-700 transition-colors">
                    State-Wise Compliance Check
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Find out exactly what compliance requirements apply in your state. Professional Tax slabs, 
                    Labour Welfare Fund, Shops & Establishments Act, and more.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">Professional Tax</span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">LWF</span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">S&E Act</span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">Factory Act</span>
                  </div>
                  <div className="flex items-center text-teal-600 text-sm font-medium">
                    Learn more <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Restaurant & Food Business */}
            <Link href="/assessments/landing/restaurant-food-business" className="group">
              <Card className="h-full border-2 border-gray-200 hover:border-rose-400 hover:shadow-lg transition-all duration-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 bg-rose-100 text-rose-700 text-xs font-semibold rounded-full">
                      🍽️ Food Business
                    </span>
                    <span className="text-lg font-bold text-gray-900">₹999</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-rose-600 transition-colors">
                    Restaurant & Food Business Compliance
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Complete compliance assessment for restaurants, cloud kitchens, cafes, and food businesses. 
                    FSSAI, Fire NOC, Liquor License, and more.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">FSSAI</span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">Fire NOC</span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">Liquor License</span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">GST</span>
                  </div>
                  <div className="flex items-center text-rose-600 text-sm font-medium">
                    Learn more <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* POSH Act Compliance */}
            <Link href="/assessments/landing/posh-act-compliance" className="group">
              <Card className="h-full border-2 border-gray-200 hover:border-violet-400 hover:shadow-lg transition-all duration-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 bg-violet-100 text-violet-700 text-xs font-semibold rounded-full">
                      🛡️ Mandatory 10+ Employees
                    </span>
                    <span className="text-lg font-bold text-gray-900">₹1,999</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-violet-700 transition-colors">
                    POSH Act 2013 Compliance
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Comprehensive ICC audit and workplace safety assessment. Check Internal Committee constitution,
                    policy coverage, complaint mechanisms, and annual report requirements.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">ICC Audit</span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">POSH Policy</span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">Training</span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">Annual Report</span>
                  </div>
                  <div className="flex items-center text-violet-600 text-sm font-medium">
                    Learn more <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Auto Dealer Compliance */}
            <Link href="/assessments/landing/auto-dealer-compliance" className="group">
              <Card className="h-full border-2 border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all duration-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                      🚗 Auto Dealers
                    </span>
                    <span className="text-lg font-bold text-gray-900">₹1,499</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors">
                    Auto Dealer Compliance Assessment
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Complete compliance check for new car, used car, two-wheeler, and EV dealers. Covers dealer licensing, GST, labour laws, environmental norms, and consumer protection.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">Dealer License</span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">GST</span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">Environment</span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">Consumer Protection</span>
                  </div>
                  <div className="flex items-center text-blue-600 text-sm font-medium">
                    Learn more <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          <div className="text-center mt-10">
            <p className="text-gray-500 text-sm">
              All assessments are <strong>free during beta</strong>. Prices shown apply post-beta launch.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-800 to-blue-900">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Check Your Compliance?
          </h2>
          <p className="text-blue-100 text-lg mb-8">
            Start your assessment now and get your detailed report in under 10 minutes.
          </p>
          <Link href="/assessment/statutory-health">
            <Button size="lg" className="bg-white text-blue-800 hover:bg-gray-100 text-lg px-8 py-6">
              Start Free Assessment
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <p className="text-blue-200 text-sm mt-4">
            Statutory Health Check is free • No credit card required
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-700" />
            <span className="font-bold text-gray-900">ComplianceCheck</span>
          </div>
          <div className="flex gap-6 text-sm text-gray-600">
            <Link href="/privacy" className="hover:text-gray-900">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-gray-900">Terms of Service</Link>
            <Link href="mailto:support@compliancecheck.co.in" className="hover:text-gray-900">Contact</Link>
          </div>
          <p className="text-sm text-gray-400">© 2025 ComplianceCheck</p>
        </div>
      </footer>
    </div>
  )
}
