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
import { toast } from 'sonner';
import { 
  LABOUR_CODE_CATEGORIES,
  getFilteredQuestions,
  getQuestionsByCategory,
  getDynamicHelpText,
  getQuestionSummary,
  type IndustryType,
  type EmployeeCountRange,
} from '@/lib/assessments/labour-code-questions';
import { ArrowLeft, ArrowRight, CheckCircle2, Building2, Loader2, Info } from 'lucide-react';

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

const EMPLOYEE_COUNTS = [
  { value: '1-9', label: '1-9 employees' },
  { value: '10-19', label: '10-19 employees' },
  { value: '20-49', label: '20-49 employees' },
  { value: '50-99', label: '50-99 employees' },
  { value: '100-299', label: '100-299 employees' },
  { value: '300-499', label: '300-499 employees' },
  { value: '500+', label: '500+ employees' },
];

const INDUSTRY_TYPES: IndustryType[] = [
  'Information Technology',
  'Manufacturing',
  'Retail & E-commerce',
  'Healthcare',
  'Financial Services',
  'Education',
  'Hospitality',
  'Construction',
  'Logistics & Transportation',
  'Professional Services',
  'Other',
];

interface UserDetails {
  companyName: string;
  industry: IndustryType | '';
  employeeCount: EmployeeCountRange | '';
  state: string;
  contactName: string;
  contactEmail: string;
}

export default function LabourCodeAssessmentPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [userDetails, setUserDetails] = useState<UserDetails>({
    companyName: '',
    industry: '',
    employeeCount: '',
    state: '',
    contactName: '',
    contactEmail: '',
  });
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Get filtered questions based on industry and employee count
  const filteredQuestions = useMemo(() => {
    if (!userDetails.industry || !userDetails.employeeCount) {
      return [];
    }
    return getFilteredQuestions(
      userDetails.industry as IndustryType,
      userDetails.employeeCount as EmployeeCountRange
    );
  }, [userDetails.industry, userDetails.employeeCount]);

  // Get question summary for preview
  const questionSummary = useMemo(() => {
    if (!userDetails.industry || !userDetails.employeeCount) {
      return null;
    }
    return getQuestionSummary(
      userDetails.industry as IndustryType,
      userDetails.employeeCount as EmployeeCountRange
    );
  }, [userDetails.industry, userDetails.employeeCount]);

  // Get questions for current category (filtered)
  const categoryQuestions = useMemo(() => {
    if (!userDetails.industry || !userDetails.employeeCount) {
      return [];
    }
    const currentCategory = LABOUR_CODE_CATEGORIES[currentCategoryIndex];
    if (!currentCategory) return [];
    return getQuestionsByCategory(
      currentCategory.id,
      userDetails.industry as IndustryType,
      userDetails.employeeCount as EmployeeCountRange
    );
  }, [currentCategoryIndex, userDetails.industry, userDetails.employeeCount]);

  const currentCategory = LABOUR_CODE_CATEGORIES[currentCategoryIndex];
  const currentQuestion = categoryQuestions[currentQuestionIndex];
  
  // Calculate progress based on filtered questions
  const totalFilteredQuestions = filteredQuestions.length;
  const answeredQuestions = filteredQuestions.filter(q => responses[q.id]).length;
  const progress = currentStep === 0 ? 0 : Math.round((answeredQuestions / totalFilteredQuestions) * 100);

  // Get dynamic help text for current question
  const currentHelpText = useMemo(() => {
    if (!currentQuestion || !userDetails.employeeCount) {
      return currentQuestion?.helpText || '';
    }
    return getDynamicHelpText(currentQuestion, userDetails.employeeCount as EmployeeCountRange);
  }, [currentQuestion, userDetails.employeeCount]);

  const handleUserDetailsChange = (field: keyof UserDetails, value: string) => {
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
    if (!userDetails.employeeCount) {
      toast.error('Please select employee count');
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
    for (let i = fromIndex + 1; i < LABOUR_CODE_CATEGORIES.length; i++) {
      const questions = getQuestionsByCategory(
        LABOUR_CODE_CATEGORIES[i].id,
        userDetails.industry as IndustryType,
        userDetails.employeeCount as EmployeeCountRange
      );
      if (questions.length > 0) return i;
    }
    return -1; // No more categories with questions
  };

  // Find previous category that has questions
  const findPrevCategoryWithQuestions = (fromIndex: number): number => {
    for (let i = fromIndex - 1; i >= 0; i--) {
      const questions = getQuestionsByCategory(
        LABOUR_CODE_CATEGORIES[i].id,
        userDetails.industry as IndustryType,
        userDetails.employeeCount as EmployeeCountRange
      );
      if (questions.length > 0) return i;
    }
    return -1;
  };

  const handleNext = () => {
    if (currentStep === 0) {
      if (!validateUserDetails()) return;
      // Find first category with questions
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
        // Find next category with questions
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
      // Find previous category with questions
      const prevCategory = findPrevCategoryWithQuestions(currentCategoryIndex);
      if (prevCategory !== -1) {
        const prevQuestions = getQuestionsByCategory(
          LABOUR_CODE_CATEGORIES[prevCategory].id,
          userDetails.industry as IndustryType,
          userDetails.employeeCount as EmployeeCountRange
        );
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
    
    // Auto-advance to next question after 800ms delay
    setTimeout(() => {
      handleNext();
    }, 800);
  };

  const isLastQuestion = () => {
    if (currentQuestionIndex < categoryQuestions.length - 1) return false;
    const nextCategory = findNextCategoryWithQuestions(currentCategoryIndex);
    return nextCategory === -1;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/assessment/labour-code-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userDetails,
          responses,
          assessmentType: 'labour_code',
          filteredQuestionCount: filteredQuestions.length,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit assessment');
      }

      const data = await response.json();
      
      // Save to localStorage as fallback (especially for temp_ IDs)
      const assessmentData = {
        userDetails,
        responses: { answers: responses },
        overall_score: data.overallScore,
        category_scores: data.categoryScores,
        action_items: data.actionItems,
        assessment_type: 'labour_code',
        created_at: new Date().toISOString(),
      };
      localStorage.setItem(`assessment_${data.assessmentId}`, JSON.stringify(assessmentData));
      
      toast.success('Assessment completed!');
      router.push(`/results/${data.assessmentId}?type=labour_code`);
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Failed to submit assessment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const answeredInCategory = categoryQuestions.filter(q => responses[q.id]).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="font-semibold text-lg">ComplianceCheck</span>
                <div className="text-xs text-gray-600">Labour Code Readiness</div>
              </div>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              FREE Assessment
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-slate-600 mb-2">
            <span>
              {currentStep === 0 
                ? 'Company Details' 
                : `${currentCategory?.name} (${answeredInCategory}/${categoryQuestions.length})`}
            </span>
            <span>{progress}% complete</span>
          </div>
          <Progress value={progress} className="h-2" aria-label="Assessment progress" />
          
          {currentStep > 0 && (
            <div className="flex gap-2 mt-4">
              {LABOUR_CODE_CATEGORIES.map((cat, idx) => {
                const catQuestions = getQuestionsByCategory(
                  cat.id,
                  userDetails.industry as IndustryType,
                  userDetails.employeeCount as EmployeeCountRange
                );
                if (catQuestions.length === 0) return null;
                const isComplete = catQuestions.every(q => responses[q.id]);
                const isCurrent = idx === currentCategoryIndex;
                return (
                  <div
                    key={cat.id}
                    className={`flex-1 h-1.5 rounded-full ${
                      isComplete ? 'bg-green-500' : isCurrent ? 'bg-blue-500' : 'bg-slate-200'
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
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <CardTitle className="text-2xl">Labour Code Readiness</CardTitle>
              <CardDescription>
                Comprehensive assessment for all 4 new Labour Codes (effective November 2025)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    placeholder="Enter your company name"
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
                    <Label htmlFor="employeeCount">Employee Count *</Label>
                    <Select
                      value={userDetails.employeeCount}
                      onValueChange={(value) => handleUserDetailsChange('employeeCount', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select range" />
                      </SelectTrigger>
                      <SelectContent>
                        {EMPLOYEE_COUNTS.map((count) => (
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

              {/* Question Summary Preview */}
              {questionSummary && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-2">
                        Your Personalised Assessment: {questionSummary.total} Questions
                      </h4>
                      <p className="text-sm text-blue-700 mb-3">
                        Based on your industry ({userDetails.industry}) and size ({userDetails.employeeCount}), 
                        we&apos;ve tailored the assessment to show only relevant questions.
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {LABOUR_CODE_CATEGORIES.map((cat) => {
                          const count = questionSummary.byCategory[cat.id] || 0;
                          if (count === 0) return null;
                          return (
                            <div key={cat.id} className="flex items-center gap-2 text-blue-800">
                              <span>{cat.icon}</span>
                              <span>{cat.name}: {count}</span>
                            </div>
                          );
                        })}
                      </div>
                      {questionSummary.total < 30 && (
                        <p className="text-xs text-blue-600 mt-3">
                          💡 {30 - questionSummary.total} questions skipped as not applicable to your profile
                        </p>
                      )}
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
                <Badge variant="outline">{currentCategory.name}</Badge>
              </div>
              <CardTitle className="text-xl leading-relaxed">
                {currentQuestion.text}
              </CardTitle>
              {currentHelpText && (
                <CardDescription className="text-sm mt-2 bg-blue-50 p-3 rounded-lg border border-blue-100">
                  💡 {currentHelpText}
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
                        variant={responses[currentQuestion.id] === option ? 'default' : 'outline'}
                        className={`w-full h-auto py-4 text-left justify-start whitespace-normal ${
                          responses[currentQuestion.id] === option 
                            ? 'bg-blue-600 hover:bg-blue-700' 
                            : ''
                        }`}
                        onClick={() => handleResponse(currentQuestion.id, option)}
                      >
                        {option}
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
              className="flex items-center gap-2"
              disabled={!questionSummary || questionSummary.total === 0}
            >
              Start Assessment ({questionSummary?.total || 0} questions)
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
          {/* Next button removed - auto-advances after answering */}

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
