import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function TermsOfServicePage() {
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
          <CardTitle className="text-2xl">Terms of Service</CardTitle>
          <p className="text-sm text-gray-500">Last updated: November 2025 | Version 1.0</p>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none space-y-6">
          
          <section>
            <h3 className="text-lg font-semibold">1. Acceptance of Terms</h3>
            <p className="text-gray-600">
              By accessing or using ComplianceCheck (&quot;Service&quot;), operated by ComplianceCheck India 
              (&quot;Company&quot;, &quot;we&quot;, &quot;us&quot;), you agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not use our Service.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold">2. Description of Service</h3>
            <p className="text-gray-600">
              ComplianceCheck provides self-service compliance assessment tools for Indian businesses, including:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-1">
              <li>Statutory compliance health checks</li>
              <li>Labor Code readiness assessments</li>
              <li>DPDP Act gap assessments</li>
              <li>Compliance document templates</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold">3. User Accounts</h3>
            <p className="text-gray-600">
              You are responsible for maintaining the confidentiality of your account credentials 
              and for all activities that occur under your account. You must provide accurate, 
              complete, and current information during registration. You agree to notify us 
              immediately of any unauthorized use of your account.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold">4. Payment Terms</h3>
            <p className="text-gray-600">
              Our Service operates on a pay-per-use model. All prices are displayed in Indian Rupees (₹) 
              and are inclusive of 18% GST. Payments are processed securely through Razorpay. 
              All sales are final unless otherwise specified. Refunds may be provided at our sole 
              discretion within 7 days of purchase if the assessment has not been started.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold">5. Intellectual Property</h3>
            <p className="text-gray-600">
              All content, features, and functionality of the Service, including but not limited to 
              text, graphics, logos, assessment questionnaires, and software, are owned by 
              ComplianceCheck and are protected by Indian and international intellectual property laws. 
              Reports generated for you are licensed for your internal business use only.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold">6. Disclaimer of Warranties</h3>
            <p className="text-gray-600">
              <strong>Important:</strong> ComplianceCheck provides informational tools only and does not 
              constitute legal, tax, or professional compliance advice. Our assessments are based on 
              information you provide and publicly available regulations. We recommend consulting 
              qualified legal or compliance professionals for specific advice. The Service is provided 
              &quot;as is&quot; without warranties of any kind, express or implied.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold">7. Limitation of Liability</h3>
            <p className="text-gray-600">
              To the maximum extent permitted by Indian law, ComplianceCheck shall not be liable for 
              any indirect, incidental, special, consequential, or punitive damages, including but 
              not limited to loss of profits, data, or business opportunities, arising from your 
              use of the Service. Our total liability shall not exceed the amount paid by you for 
              the specific assessment in question.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold">8. Governing Law</h3>
            <p className="text-gray-600">
              These Terms shall be governed by and construed in accordance with the laws of India. 
              Any disputes arising out of or relating to these Terms shall be subject to the 
              exclusive jurisdiction of the courts in Pune, Maharashtra, India.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold">9. Changes to Terms</h3>
            <p className="text-gray-600">
              We reserve the right to modify these Terms at any time. We will notify you of 
              material changes by email or through the Service. Your continued use of the 
              Service after such modifications constitutes acceptance of the updated Terms.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold">10. Contact Us</h3>
            <p className="text-gray-600">
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <p className="text-gray-600 mt-2">
              <strong>ComplianceCheck India</strong><br />
              Email: legal@compliancecheck.in<br />
              Address: Pune, Maharashtra, India
            </p>
          </section>

        </CardContent>
      </Card>
    </div>
  )
}
