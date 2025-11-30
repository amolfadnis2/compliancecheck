import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <Link href="/register">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Register
        </Button>
      </Link>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Privacy Policy</CardTitle>
          <p className="text-sm text-gray-500">Last updated: November 2025 | Version 1.0</p>
          <p className="text-sm text-blue-600 mt-2">
            DPDP Act 2023 Compliant
          </p>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none space-y-6">
          
          <section>
            <h3 className="text-lg font-semibold">1. Introduction</h3>
            <p className="text-gray-600">
              ComplianceCheck India (&quot;Company&quot;, &quot;we&quot;, &quot;us&quot;) is committed to protecting 
              your privacy and personal data in compliance with the Digital Personal Data Protection 
              Act, 2023 (DPDP Act). This Privacy Policy explains how we collect, use, store, and 
              protect your personal data when you use our Service.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold">2. Data We Collect</h3>
            <p className="text-gray-600">We collect the following categories of personal data:</p>
            <div className="mt-3 space-y-3">
              <div className="bg-gray-50 p-3 rounded">
                <p className="font-medium text-gray-800">Account Information</p>
                <p className="text-gray-600 text-sm">Full name, email address, phone number, password (encrypted)</p>
                <p className="text-gray-500 text-xs mt-1">Purpose: Account creation and authentication</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <p className="font-medium text-gray-800">Company Information</p>
                <p className="text-gray-600 text-sm">Company name, GSTIN, PAN, industry type, employee count, state</p>
                <p className="text-gray-500 text-xs mt-1">Purpose: Customizing compliance assessments</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <p className="font-medium text-gray-800">Assessment Responses</p>
                <p className="text-gray-600 text-sm">Your answers to compliance questionnaires</p>
                <p className="text-gray-500 text-xs mt-1">Purpose: Generating compliance reports</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <p className="font-medium text-gray-800">Payment Information</p>
                <p className="text-gray-600 text-sm">Transaction records (card details handled by Razorpay)</p>
                <p className="text-gray-500 text-xs mt-1">Purpose: Processing payments and generating invoices</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <p className="font-medium text-gray-800">Technical Data</p>
                <p className="text-gray-600 text-sm">IP address, browser type, device information</p>
                <p className="text-gray-500 text-xs mt-1">Purpose: Security, analytics, and service improvement</p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold">3. Legal Basis for Processing</h3>
            <p className="text-gray-600">
              Under the DPDP Act 2023, we process your personal data based on:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-1 mt-2">
              <li><strong>Consent:</strong> Your explicit consent provided during registration</li>
              <li><strong>Contract:</strong> Necessary for providing our services to you</li>
              <li><strong>Legal Obligation:</strong> Compliance with applicable laws (e.g., GST, IT Act)</li>
              <li><strong>Legitimate Interest:</strong> Improving our services and preventing fraud</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold">4. Data Sharing</h3>
            <p className="text-gray-600">We may share your data with:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-1 mt-2">
              <li><strong>Razorpay:</strong> Payment processing (PCI-DSS compliant)</li>
              <li><strong>Supabase:</strong> Database and authentication services</li>
              <li><strong>Amazon Web Services:</strong> Email delivery and cloud infrastructure</li>
              <li><strong>PostHog:</strong> Product analytics (anonymized data)</li>
            </ul>
            <p className="text-gray-600 mt-3">
              We do not sell your personal data to third parties. All service providers are 
              contractually bound to protect your data.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold">5. Data Retention</h3>
            <p className="text-gray-600">We retain your data as follows:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-1 mt-2">
              <li>Account data: Until you request deletion + 30-day grace period</li>
              <li>Assessment data: 3 years from completion</li>
              <li>Payment records: 7 years (as required by Income Tax Act and GST Act)</li>
              <li>Consent logs: 7 years (DPDP Act compliance)</li>
              <li>Server logs: 180 days (CERT-In requirements)</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold">6. Your Rights (Data Principal Rights)</h3>
            <p className="text-gray-600">
              Under the DPDP Act 2023, you have the following rights:
            </p>
            <div className="mt-3 space-y-2">
              <div className="flex items-start gap-3">
                <span className="text-green-600 font-bold">✓</span>
                <div>
                  <p className="font-medium text-gray-800">Right to Access</p>
                  <p className="text-gray-600 text-sm">Request a copy of all your personal data</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-600 font-bold">✓</span>
                <div>
                  <p className="font-medium text-gray-800">Right to Correction</p>
                  <p className="text-gray-600 text-sm">Request correction of inaccurate data</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-600 font-bold">✓</span>
                <div>
                  <p className="font-medium text-gray-800">Right to Erasure</p>
                  <p className="text-gray-600 text-sm">Request deletion of your personal data</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-600 font-bold">✓</span>
                <div>
                  <p className="font-medium text-gray-800">Right to Withdraw Consent</p>
                  <p className="text-gray-600 text-sm">Withdraw consent at any time via account settings</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-600 font-bold">✓</span>
                <div>
                  <p className="font-medium text-gray-800">Right to Nominate</p>
                  <p className="text-gray-600 text-sm">Designate a nominee to exercise rights on your behalf</p>
                </div>
              </div>
            </div>
            <p className="text-gray-600 mt-3">
              To exercise these rights, visit your Account Settings or contact us at privacy@compliancecheck.in
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold">7. Data Security</h3>
            <p className="text-gray-600">
              We implement appropriate technical and organizational measures to protect your data:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-1 mt-2">
              <li>Encryption at rest and in transit (TLS 1.2+)</li>
              <li>Regular security assessments</li>
              <li>Access controls and authentication</li>
              <li>Employee training on data protection</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold">8. Cookies</h3>
            <p className="text-gray-600">
              We use essential cookies for authentication and session management. 
              Analytics cookies (PostHog) are used only with your consent to improve our services.
              You can manage cookie preferences in your browser settings.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold">9. Changes to This Policy</h3>
            <p className="text-gray-600">
              We may update this Privacy Policy periodically. Material changes will be notified 
              via email or through the Service. Continued use after changes constitutes acceptance.
              We will seek fresh consent if required under the DPDP Act.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold">10. Grievance Redressal</h3>
            <p className="text-gray-600">
              For any privacy concerns or complaints, contact our Grievance Officer:
            </p>
            <div className="mt-3 bg-blue-50 p-4 rounded">
              <p className="font-medium text-gray-800">Grievance Officer</p>
              <p className="text-gray-600">ComplianceCheck India</p>
              <p className="text-gray-600">Email: grievance@compliancecheck.in</p>
              <p className="text-gray-600">Address: Pune, Maharashtra, India</p>
              <p className="text-gray-500 text-sm mt-2">
                Response within 48 hours. Resolution within 30 days.
              </p>
            </div>
            <p className="text-gray-600 mt-3">
              If not satisfied, you may escalate to the Data Protection Board of India 
              as established under the DPDP Act 2023.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold">11. Contact Us</h3>
            <p className="text-gray-600">
              For general privacy inquiries:
            </p>
            <p className="text-gray-600 mt-2">
              <strong>ComplianceCheck India</strong><br />
              Email: privacy@compliancecheck.in<br />
              Address: Pune, Maharashtra, India
            </p>
          </section>

        </CardContent>
      </Card>
    </div>
  )
}
