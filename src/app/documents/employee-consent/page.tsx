'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileText, Download, Loader2, CheckCircle } from 'lucide-react'
import { 
  DATA_CATEGORIES, 
  PROCESSING_PURPOSES, 
  RETENTION_PERIODS,
  THIRD_PARTY_CATEGORIES,
  COMPANY_STATES
} from '@/lib/templates/employee-consent-data'

interface FormData {
  // Company Details
  companyName: string
  companyAddress: string
  companyCity: string
  companyState: string
  companyPincode: string
  gstin: string
  pan: string
  
  // Data Collection
  dataCategories: string[]
  processingPurposes: string[]
  retentionPeriod: string
  
  // Third Party Sharing
  sharesWithThirdParties: boolean
  thirdPartyCategories: string[]
  
  // Grievance Officer
  grievanceOfficerName: string
  grievanceOfficerEmail: string
  grievanceOfficerPhone: string
}

export default function EmployeeConsentFormGenerator() {
  const [formData, setFormData] = useState<FormData>({
    companyName: '',
    companyAddress: '',
    companyCity: '',
    companyState: '',
    companyPincode: '',
    gstin: '',
    pan: '',
    dataCategories: [],
    processingPurposes: [],
    retentionPeriod: '7_years',
    sharesWithThirdParties: false,
    thirdPartyCategories: [],
    grievanceOfficerName: '',
    grievanceOfficerEmail: '',
    grievanceOfficerPhone: ''
  })

  const [isGenerating, setIsGenerating] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const toggleArrayItem = (field: 'dataCategories' | 'processingPurposes' | 'thirdPartyCategories', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }))
  }

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.companyName && formData.companyAddress && 
                  formData.companyCity && formData.companyState && formData.companyPincode)
      case 2:
        return formData.dataCategories.length > 0 && formData.processingPurposes.length > 0
      case 3:
        return !!(formData.grievanceOfficerName && formData.grievanceOfficerEmail)
      default:
        return true
    }
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1)
  }

  const handleGenerate = async () => {
    if (!validateStep(3)) return

    setIsGenerating(true)
    setIsSuccess(false)

    try {
      const response = await fetch('/api/documents/employee-consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error('Generation failed')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Employee_Consent_Form_${formData.companyName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      setIsSuccess(true)
      setTimeout(() => setIsSuccess(false), 3000)
    } catch (error) {
      console.error('Generation error:', error)
      alert('Failed to generate document. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Employee Data Consent Form Generator
          </h1>
          <p className="text-gray-600">
            Generate DPDP Act 2023 compliant consent forms for your employees
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-800">FREE during beta</span>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= step ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-300 text-gray-400'
                }`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`w-24 h-1 mx-2 ${
                    currentStep > step ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between max-w-2xl mx-auto mt-2 text-sm">
            <span className={currentStep >= 1 ? 'text-blue-600 font-medium' : 'text-gray-500'}>Company</span>
            <span className={currentStep >= 2 ? 'text-blue-600 font-medium' : 'text-gray-500'}>Data</span>
            <span className={currentStep >= 3 ? 'text-blue-600 font-medium' : 'text-gray-500'}>Officer</span>
          </div>
        </div>

        {/* Step 1: Company Details */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Company Details</CardTitle>
              <CardDescription>Basic information about your organisation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  placeholder="ABC Private Limited"
                />
              </div>

              <div>
                <Label htmlFor="companyAddress">Registered Address *</Label>
                <Input
                  id="companyAddress"
                  value={formData.companyAddress}
                  onChange={(e) => handleInputChange('companyAddress', e.target.value)}
                  placeholder="Building name, Street"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="companyCity">City *</Label>
                  <Input
                    id="companyCity"
                    value={formData.companyCity}
                    onChange={(e) => handleInputChange('companyCity', e.target.value)}
                    placeholder="Mumbai"
                  />
                </div>
                <div>
                  <Label htmlFor="companyPincode">Pincode *</Label>
                  <Input
                    id="companyPincode"
                    value={formData.companyPincode}
                    onChange={(e) => handleInputChange('companyPincode', e.target.value)}
                    placeholder="400001"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="companyState">State *</Label>
                <Select value={formData.companyState} onValueChange={(value) => handleInputChange('companyState', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMPANY_STATES.map(state => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="gstin">GSTIN (optional)</Label>
                  <Input
                    id="gstin"
                    value={formData.gstin}
                    onChange={(e) => handleInputChange('gstin', e.target.value)}
                    placeholder="22AAAAA0000A1Z5"
                  />
                </div>
                <div>
                  <Label htmlFor="pan">PAN (optional)</Label>
                  <Input
                    id="pan"
                    value={formData.pan}
                    onChange={(e) => handleInputChange('pan', e.target.value)}
                    placeholder="AAAAA0000A"
                  />
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <Button 
                  onClick={handleNext}
                  disabled={!validateStep(1)}
                >
                  Next
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Data Categories & Processing */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Data Collection & Processing</CardTitle>
              <CardDescription>Select what data you collect and why</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Data Categories */}
              <div>
                <Label className="text-base font-semibold mb-3 block">
                  What personal data do you collect? *
                </Label>
                <div className="space-y-3">
                  {DATA_CATEGORIES.map(category => (
                    <div key={category.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                      <Checkbox
                        id={category.id}
                        checked={formData.dataCategories.includes(category.id)}
                        onCheckedChange={() => toggleArrayItem('dataCategories', category.id)}
                      />
                      <div className="flex-1">
                        <label htmlFor={category.id} className="text-sm font-medium cursor-pointer">
                          {category.label}
                        </label>
                        <p className="text-xs text-gray-600 mt-1">{category.description}</p>
                        <ul className="text-xs text-gray-500 mt-1 ml-4 list-disc">
                          {category.examples.slice(0, 3).map((ex, i) => (
                            <li key={i}>{ex}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Processing Purposes */}
              <div>
                <Label className="text-base font-semibold mb-3 block">
                  Why do you process this data? *
                </Label>
                <div className="space-y-2">
                  {PROCESSING_PURPOSES.map(purpose => (
                    <div key={purpose.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                      <Checkbox
                        id={purpose.id}
                        checked={formData.processingPurposes.includes(purpose.id)}
                        onCheckedChange={() => toggleArrayItem('processingPurposes', purpose.id)}
                      />
                      <div className="flex-1">
                        <label htmlFor={purpose.id} className="text-sm font-medium cursor-pointer">
                          {purpose.label}
                        </label>
                        <p className="text-xs text-gray-600 mt-1">{purpose.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Retention Period */}
              <div>
                <Label htmlFor="retentionPeriod" className="text-base font-semibold">
                  Data Retention Period *
                </Label>
                <Select value={formData.retentionPeriod} onValueChange={(value) => handleInputChange('retentionPeriod', value)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RETENTION_PERIODS.map(period => (
                      <SelectItem key={period.value} value={period.value}>{period.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  7 years is recommended for statutory compliance (EPF, ESI, Income Tax)
                </p>
              </div>

              {/* Third Party Sharing */}
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <Checkbox
                    id="sharesWithThirdParties"
                    checked={formData.sharesWithThirdParties}
                    onCheckedChange={(checked) => handleInputChange('sharesWithThirdParties', checked)}
                  />
                  <Label htmlFor="sharesWithThirdParties" className="text-base font-semibold cursor-pointer">
                    We share data with third parties
                  </Label>
                </div>

                {formData.sharesWithThirdParties && (
                  <div className="ml-6 space-y-2">
                    <p className="text-sm text-gray-600 mb-2">Select applicable third parties:</p>
                    {THIRD_PARTY_CATEGORIES.map(category => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                          id={`tp_${category}`}
                          checked={formData.thirdPartyCategories.includes(category)}
                          onCheckedChange={() => toggleArrayItem('thirdPartyCategories', category)}
                        />
                        <label htmlFor={`tp_${category}`} className="text-sm cursor-pointer">
                          {category}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={handlePrevious}>
                  Previous
                </Button>
                <Button 
                  onClick={handleNext}
                  disabled={!validateStep(2)}
                >
                  Next
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Grievance Officer */}
        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Grievance Officer Details</CardTitle>
              <CardDescription>DPDP Act requires designation of a grievance officer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="grievanceOfficerName">Full Name *</Label>
                <Input
                  id="grievanceOfficerName"
                  value={formData.grievanceOfficerName}
                  onChange={(e) => handleInputChange('grievanceOfficerName', e.target.value)}
                  placeholder="John Doe"
                />
              </div>

              <div>
                <Label htmlFor="grievanceOfficerEmail">Email Address *</Label>
                <Input
                  id="grievanceOfficerEmail"
                  type="email"
                  value={formData.grievanceOfficerEmail}
                  onChange={(e) => handleInputChange('grievanceOfficerEmail', e.target.value)}
                  placeholder="grievance@company.com"
                />
              </div>

              <div>
                <Label htmlFor="grievanceOfficerPhone">Phone Number *</Label>
                <Input
                  id="grievanceOfficerPhone"
                  type="tel"
                  value={formData.grievanceOfficerPhone}
                  onChange={(e) => handleInputChange('grievanceOfficerPhone', e.target.value)}
                  placeholder="+91 98765 43210"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> The grievance officer is responsible for addressing employee 
                  complaints regarding personal data processing. They must acknowledge complaints within 
                  48 hours and resolve them within 30 days.
                </p>
              </div>

              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={handlePrevious}>
                  Previous
                </Button>
                <Button 
                  onClick={handleGenerate}
                  disabled={!validateStep(3) || isGenerating}
                  className="min-w-[160px]"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : isSuccess ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Downloaded!
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Generate PDF
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
