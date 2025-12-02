'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { 
  DPDP_CATEGORIES,
  getFilteredDPDPQuestions,
  getDPDPQuestionsByCategory,
  getDPDPQuestionSummary,
  getDaysUntilDeadline,
  isSignificantDataFiduciary,
  type DPDPIndustryType,
  type DataPrincipalCount,
  type DPDPProfile,
} from '@/lib/assessments/dpdp-questions';
import { ArrowLeft, ArrowRight, CheckCircle2, Shield, Loader2, Info, AlertTriangle, Calendar } from 'lucide-react';

// Indian states for dropdown
const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry', 'Chandigarh',
  'Andaman and Nicobar Islands', 'Dadra and Nagar Haveli and Daman and Diu', 'Lakshadweep'
];

const DATA_PRINCIPAL_COUNTS = [
  { value: '<1L', label: 'Less than 1 Lakh' },
  { value: '1L-10L', label: '1 Lakh to 10 Lakh' },
  { value: '10L-1Cr', label: '10 Lakh to 1 Crore' },
  { value: '>1Cr', label: 'More than 1 Crore' },
];

const INDUSTRY_TYPES: DPDPIndustryType[] = [
  'Information Technology',
  'E-commerce',
  'Financial Services',
  'Healthcare',
  'EdTech',
  'Gaming & Entertainment',
  'Social Media',
  'Telecommunications',
  'Travel & Hospitality',
  'Manufacturing',
  'Professional Services',
  'Other',
];


interface UserDetails {
  companyName: string;
  industry: DPDPIndustryType | '';
  state: string;
  contactName: string;
  contactEmail: string;
  dataPrincipalCount: DataPrincipalCount | '';
  processesChildrenData: boolean;
  crossBorderTransfers: boolean;
  isDigitalPlatform: boolean;
}

export default function DPDPAssessmentPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [userDetails, setUserDetails] = useState<UserDetails>({
    companyName: '',
    industry: '',
    state: '',
    contactName: '',
    contactEmail: '',
    dataPrincipalCount: '',
    processesChildrenData: false,
    crossBorderTransfers: false,
    isDigitalPlatform: false,
  });
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Create profile from user details
  const profile: DPDPProfile | null = useMemo(() => {
    if (!userDetails.industry || !userDetails.dataPrincipalCount) return null;
    return {
      industry: userDetails.industry as DPDPIndustryType,
      dataPrincipalCount: userDetails.dataPrincipalCount as DataPrincipalCount,
      processesChildrenData: userDetails.processesChildrenData,
      crossBorderTransfers: userDetails.crossBorderTransfers,
      isDigitalPlatform: userDetails.isDigitalPlatform,
    };
  }, [userDetails]);

  // Get filtered questions based on profile
  const filteredQuestions = useMemo(() => {
    if (!profile) return [];
    return getFilteredDPDPQuestions(profile);
  }, [profile]);

  // Get question summary for preview
  const questionSummary = useMemo(() => {
    if (!profile) return null;
    return getDPDPQuestionSummary(profile);
  }, [profile]);

  // Check if SDF
  const isSDF = useMemo(() => {
    if (!profile) return false;
    return isSignificantDataFiduciary(profile);
  }, [profile]);

  // Get questions for current category (filtered)
  const categoryQuestions = useMemo(() => {
    if (!profile) return [];
    const currentCategory = DPDP_CATEGORIES[currentCategoryIndex];
    if (!currentCategory) return [];
    return getDPDPQuestionsByCategory(currentCategory.id, profile);
  }, [currentCategoryIndex, profile]);

  const currentCategory = DPDP_CATEGORIES[currentCategoryIndex];
  const currentQuestion = categoryQuestions[currentQuestionIndex];
  
  // Calculate progress
  const totalFilteredQuestions = filteredQuestions.length;
  const answeredQuestions = filteredQuestions.filter(q => responses[q.id]).length;
  const progress = currentStep === 0 ? 0 : Math.round((answeredQuestions / totalFilteredQuestions) * 100);

  const daysUntilDeadline = getDaysUntilDeadline();


  const handleUserDetailsChange = (field: keyof UserDetails, value: string | boolean) => {
    setUserDetails(prev => ({ ...prev, [field]: value }));
  };

  const validateUserDetails = (): boolean => {
    if (!userDetails.companyName.trim()) {
      toast.error('Please enter your company name');
      return false;
    }
    if (!userDetails.industry) {
      toast.error('Please select your industry');
      return false;
    }
    if (!userDetails.dataPrincipalCount) {
      toast.error('Please select approximate number of Indian data principals');
      return false;
    }
    if (!userDetails.state) {
      toast.error('Please select your registered state');
      return false;
    }
    if (!userDetails.contactEmail.trim() || !userDetails.contactEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return false;
    }
    return true;
  };

  // Find next category that has questions
  const findNextCategoryWithQuestions = (fromIndex: number): number => {
    if (!profile) return -1;
    for (let i = fromIndex + 1; i < DPDP_CATEGORIES.length; i++) {
      const questions = getDPDPQuestionsByCategory(DPDP_CATEGORIES[i].id, profile);
      if (questions.length > 0) return i;
    }
    return -1;
  };

  // Find previous category that has questions
  const findPrevCategoryWithQuestions = (fromIndex: number): number => {
    if (!profile) return -1;
    for (let i = fromIndex - 1; i >= 0; i--) {
      const questions = getDPDPQuestionsByCategory(DPDP_CATEGORIES[i].id, profile);
      if (questions.length > 0) return i;
    }
    return -1;
  };

  const handleNext = () => {
    if (currentStep === 0) {
      if (!validateUserDetails()) return;
      const firstCategoryWithQuestions = findNextCategoryWithQuestions(-1);
      if (firstCategoryWithQuestions === -1) {
        toast.error('No applicable questions for your profile');
        return;
      }
      setCurrentStep(1);
      setCurrentCategoryIndex(firstCategoryWithQuestions);
      setCurrentQuestionIndex(0);
    } else {
      if (currentQuestionIndex < categoryQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        const nextCategory = findNextCategoryWithQuestions(currentCategoryIndex);
        if (nextCategory !== -1) {
          setCurrentCategoryIndex(nextCategory);
          setCurrentQuestionIndex(0);
          setCurrentStep(currentStep + 1);
        }
      }
    }
  };

  const handleBack = () => {
    if (currentStep === 0) {
      router.push('/');
    } else if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else {
      const prevCategory = findPrevCategoryWithQuestions(currentCategoryIndex);
      if (prevCategory !== -1 && profile) {
        const prevQuestions = getDPDPQuestionsByCategory(DPDP_CATEGORIES[prevCategory].id, profile);
        setCurrentCategoryIndex(prevCategory);
        setCurrentQuestionIndex(prevQuestions.length - 1);
        setCurrentStep(currentStep - 1);
      } else {
        setCurrentStep(0);
      }
    }
  };

  const handleResponse = (questionId: string, value: string) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
  };

  const isLastQuestion = () => {
    if (currentQuestionIndex < categoryQuestions.length - 1) return false;
    const nextCategory = findNextCategoryWithQuestions(currentCategoryIndex);
    return nextCategory === -1;
  };


  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/assessment/dpdp-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userDetails,
          responses,
          assessmentType: 'dpdp',
          filteredQuestionCount: filteredQuestions.length,
          profile,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit assessment');
      }

      const data = await response.json();
      toast.success('Assessment completed!');
      router.push(`/results/${data.assessmentId}?type=dpdp`);
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Failed to submit assessment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const answeredInCategory = categoryQuestions.filter(q => responses[q.id]).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="font-semibold text-lg">ComplianceCheck</span>
                <div className="text-xs text-gray-600">DPDP Gap Assessment</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                <Calendar className="w-3 h-3 mr-1" />
                {daysUntilDeadline} days to deadline
              </Badge>
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                FREE Assessment
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-slate-600 mb-2">
            <span>
              {currentStep === 0 
                ? 'Organisation Details' 
                : `${currentCategory?.name} (${answeredInCategory}/${categoryQuestions.length})`}
            </span>
            <span>{progress}% complete</span>
          </div>
          <Progress value={progress} className="h-2" />
          
          {currentStep > 0 && profile && (
            <div className="flex gap-2 mt-4">
              {DPDP_CATEGORIES.map((cat, idx) => {
                const catQuestions = getDPDPQuestionsByCategory(cat.id, profile);
                if (catQuestions.length === 0) return null;
                const isComplete = catQuestions.every(q => responses[q.id]);
                const isCurrent = idx === currentCategoryIndex;
                return (
                  <div
                    key={cat.id}
                    className={`flex-1 h-1.5 rounded-full ${
                      isComplete ? 'bg-green-500' : isCurrent ? 'bg-purple-500' : 'bg-slate-200'
                    }`}
                    title={`${cat.name}: ${catQuestions.length} questions`}
                  />
                );
              })}
            </div>
          )}
        </div>


        {/* Step 0: User Details */}
        {currentStep === 0 && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <CardTitle className="text-2xl">DPDP Gap Assessment</CardTitle>
              <CardDescription>
                Assess your readiness for the Digital Personal Data Protection Act 2023
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Deadline Warning */}
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-amber-900">Compliance Deadline: 13 May 2027</h4>
                  <p className="text-sm text-amber-700">
                    Only {daysUntilDeadline} days remaining. Penalties up to Rs. 250 Crore for non-compliance.
                  </p>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Organisation Name *</Label>
                  <Input
                    id="companyName"
                    placeholder="Enter your organisation name"
                    value={userDetails.companyName}
                    onChange={(e) => handleUserDetailsChange('companyName', e.target.value)}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry *</Label>
                    <Select
                      value={userDetails.industry}
                      onValueChange={(value) => handleUserDetailsChange('industry', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {INDUSTRY_TYPES.map((industry) => (
                          <SelectItem key={industry} value={industry}>
                            {industry}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dataPrincipalCount">Indian Data Principals *</Label>
                    <Select
                      value={userDetails.dataPrincipalCount}
                      onValueChange={(value) => handleUserDetailsChange('dataPrincipalCount', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select range" />
                      </SelectTrigger>
                      <SelectContent>
                        {DATA_PRINCIPAL_COUNTS.map((count) => (
                          <SelectItem key={count.value} value={count.value}>
                            {count.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">Registered State *</Label>
                  <Select
                    value={userDetails.state}
                    onValueChange={(value) => handleUserDetailsChange('state', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDIAN_STATES.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>


                {/* DPDP-specific questions */}
                <div className="space-y-4 pt-4 border-t">
                  <Label className="text-base font-semibold">Data Processing Profile</Label>
                  
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="processesChildrenData"
                      checked={userDetails.processesChildrenData}
                      onCheckedChange={(checked) => handleUserDetailsChange('processesChildrenData', !!checked)}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label htmlFor="processesChildrenData" className="text-sm font-medium cursor-pointer">
                        We process data of users under 18 years
                      </label>
                      <p className="text-xs text-muted-foreground">
                        Gaming, EdTech, social media, e-commerce with minor users
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="crossBorderTransfers"
                      checked={userDetails.crossBorderTransfers}
                      onCheckedChange={(checked) => handleUserDetailsChange('crossBorderTransfers', !!checked)}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label htmlFor="crossBorderTransfers" className="text-sm font-medium cursor-pointer">
                        We transfer personal data outside India
                      </label>
                      <p className="text-xs text-muted-foreground">
                        Using foreign cloud providers, offshore processing, global operations
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="isDigitalPlatform"
                      checked={userDetails.isDigitalPlatform}
                      onCheckedChange={(checked) => handleUserDetailsChange('isDigitalPlatform', !!checked)}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label htmlFor="isDigitalPlatform" className="text-sm font-medium cursor-pointer">
                        We operate a digital platform
                      </label>
                      <p className="text-xs text-muted-foreground">
                        E-commerce marketplace, social media, food delivery, ride-sharing, etc.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactName">Your Name</Label>
                    <Input
                      id="contactName"
                      placeholder="Enter your name"
                      value={userDetails.contactName}
                      onChange={(e) => handleUserDetailsChange('contactName', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Email Address *</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      placeholder="you@company.com"
                      value={userDetails.contactEmail}
                      onChange={(e) => handleUserDetailsChange('contactEmail', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* SDF Warning */}
              {isSDF && (
                <div className="p-4 bg-red-50 rounded-lg border border-red-200 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-red-900">Significant Data Fiduciary (SDF)</h4>
                    <p className="text-sm text-red-700">
                      Based on your profile, you may qualify as an SDF with additional compliance obligations 
                      including appointing a Data Protection Officer and conducting annual audits.
                    </p>
                  </div>
                </div>
              )}

              {/* Question Summary Preview */}
              {questionSummary && (
                <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-100">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-purple-900 mb-2">
                        Your Personalised Assessment: {questionSummary.total} Questions
                      </h4>
                      <p className="text-sm text-purple-700 mb-3">
                        Based on your data processing profile, we&apos;ve tailored the assessment to your specific needs.
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {DPDP_CATEGORIES.map((cat) => {
                          const count = questionSummary.byCategory[cat.id] || 0;
                          if (count === 0) return null;
                          return (
                            <div key={cat.id} className="flex items-center gap-2 text-purple-800">
                              <span>{cat.icon}</span>
                              <span>{cat.name}: {count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}


        {/* Question Steps */}
        {currentStep > 0 && currentQuestion && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="text-3xl">{currentCategory.icon}</div>
                <Badge variant="outline" className="border-purple-300 text-purple-700">
                  {currentCategory.name}
                </Badge>
                {currentCategory.penaltyExposure && (
                  <Badge variant="secondary" className="bg-red-100 text-red-700 text-xs">
                    Penalty: {currentCategory.penaltyExposure}
                  </Badge>
                )}
              </div>
              <CardTitle className="text-xl leading-relaxed">
                {currentQuestion.text}
              </CardTitle>
              {currentQuestion.helpText && (
                <CardDescription className="text-sm mt-2 bg-purple-50 p-3 rounded-lg border border-purple-100">
                  💡 {currentQuestion.helpText}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {currentQuestion.type === 'yes_no' && (
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      variant={responses[currentQuestion.id] === 'yes' ? 'default' : 'outline'}
                      className={`h-16 text-lg ${
                        responses[currentQuestion.id] === 'yes' 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : ''
                      }`}
                      onClick={() => handleResponse(currentQuestion.id, 'yes')}
                    >
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      Yes
                    </Button>
                    <Button
                      variant={responses[currentQuestion.id] === 'no' ? 'default' : 'outline'}
                      className={`h-16 text-lg ${
                        responses[currentQuestion.id] === 'no' 
                          ? 'bg-red-600 hover:bg-red-700' 
                          : ''
                      }`}
                      onClick={() => handleResponse(currentQuestion.id, 'no')}
                    >
                      No
                    </Button>
                  </div>
                )}

                {currentQuestion.type === 'multiple_choice' && currentQuestion.options && (
                  <div className="space-y-3">
                    {currentQuestion.options.map((option, idx) => (
                      <Button
                        key={idx}
                        variant={responses[currentQuestion.id] === option.value ? 'default' : 'outline'}
                        className={`w-full h-auto py-4 text-left justify-start whitespace-normal ${
                          responses[currentQuestion.id] === option.value 
                            ? 'bg-purple-600 hover:bg-purple-700' 
                            : ''
                        }`}
                        onClick={() => handleResponse(currentQuestion.id, option.value)}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          {currentStep === 0 && (
            <Button 
              onClick={handleNext} 
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
              disabled={!questionSummary || questionSummary.total === 0}
            >
              Start Assessment ({questionSummary?.total || 0} questions)
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}

          {currentStep > 0 && !isLastQuestion() && (
            <Button
              onClick={handleNext}
              disabled={!responses[currentQuestion?.id]}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
            >
              Next Question
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}

          {currentStep > 0 && isLastQuestion() && (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !responses[currentQuestion?.id]}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating Report...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Get Free Report
                </>
              )}
            </Button>
          )}
        </div>

        {/* Question counter */}
        {currentStep > 0 && (
          <div className="text-center text-sm text-slate-500 mt-4">
            Question {currentQuestionIndex + 1} of {categoryQuestions.length} in {currentCategory.name}
            <span className="mx-2">•</span>
            {answeredQuestions} of {totalFilteredQuestions} total answered
          </div>
        )}
      </main>
    </div>
  );
}
