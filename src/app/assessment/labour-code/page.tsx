'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
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
import {
  INDIAN_STATES,
  EMPLOYEE_COUNT_OPTIONS,
  INDUSTRY_OPTIONS
} from '@/lib/constants/india';
import { ASSESSMENT_TYPES, getLocalStorageKey } from '@/lib/constants/assessment-types';
import { AssessmentHeader } from '@/components/assessment/assessment-header';
import { useAssessmentTracking, type OrganizationSize } from '@/lib/analytics';
import { ArrowLeft, ArrowRight, CheckCircle2, XCircle, Building2, Loader2, Info, Save } from 'lucide-react';

interface UserDetails {
  companyName: string;
  industry: IndustryType | '';
  employeeCount: EmployeeCountRange | '';
  state: string;
  contactName: string;
  contactEmail: string;
  phone: string;
}

// Local storage key for progress persistence
const STORAGE_KEY = 'labour_code_progress';

interface SavedProgress {
  currentStep: number;
  currentCategoryIndex: number;
  currentQuestionIndex: number;
  responses: Record<string, string>;
  userDetails: UserDetails;
  savedAt: string;
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
    phone: '',
  });
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [hasRestoredProgress, setHasRestoredProgress] = useState(false);

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

  // Initialize assessment tracking
  const assessmentTracking = useAssessmentTracking({
    assessmentType: ASSESSMENT_TYPES.LABOUR_CODE,
    userTier: 'free',
    organizationIndustry: userDetails.industry || undefined,
    organizationSize: userDetails.employeeCount as OrganizationSize | undefined,
    questionCount: totalFilteredQuestions || 30, // fallback to approx count
    enableAutoAbandon: true,
  });

  // Get dynamic help text for current question
  const currentHelpText = useMemo(() => {
    if (!currentQuestion || !userDetails.employeeCount) {
      return currentQuestion?.helpText || '';
    }
    return getDynamicHelpText(currentQuestion, userDetails.employeeCount as EmployeeCountRange);
  }, [currentQuestion, userDetails.employeeCount]);

  // Load saved progress on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const progress: SavedProgress = JSON.parse(saved);
        // Only restore if saved within last 24 hours
        const savedTime = new Date(progress.savedAt).getTime();
        const now = Date.now();
        if (now - savedTime < 24 * 60 * 60 * 1000) {
          setCurrentStep(progress.currentStep);
          setCurrentCategoryIndex(progress.currentCategoryIndex);
          setCurrentQuestionIndex(progress.currentQuestionIndex);
          setResponses(progress.responses);
          setUserDetails(progress.userDetails);
          setHasRestoredProgress(true);
        }
      }
    } catch (e) {
      console.error('Error loading saved progress:', e);
    }
  }, []);

  // Auto-save progress
  const saveProgress = useCallback(() => {
    setSaveStatus('saving');
    try {
      const progress: SavedProgress = {
        currentStep,
        currentCategoryIndex,
        currentQuestionIndex,
        responses,
        userDetails,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (e) {
      console.error('Error saving progress:', e);
      setSaveStatus('idle');
    }
  }, [currentStep, currentCategoryIndex, currentQuestionIndex, responses, userDetails]);

  // Auto-save when responses change
  useEffect(() => {
    if (Object.keys(responses).length > 0 || currentStep > 0) {
      const timer = setTimeout(saveProgress, 500);
      return () => clearTimeout(timer);
    }
  }, [responses, currentStep, saveProgress]);

  // Clear saved progress
  const clearProgress = () => {
    localStorage.removeItem(STORAGE_KEY);
    setHasRestoredProgress(false);
  };

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
      // Track assessment start
      assessmentTracking.trackStart();
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
    
    // Track progress
    const answeredCount = Object.keys(responses).length + 1;
    assessmentTracking.trackProgress(answeredCount, currentCategory?.name, questionId);
    
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
    
    // Track completion before API call
    // For yes/no questions, "no" typically indicates non-compliance
    const gapCount = filteredQuestions.filter(q => 
      q.type === 'yes_no' && responses[q.id] === 'no'
    ).length;
    assessmentTracking.trackComplete(
      Math.round((answeredQuestions / totalFilteredQuestions) * 100),
      { high: gapCount, medium: 0, low: 0 },
      answeredQuestions,
      totalFilteredQuestions - answeredQuestions
    );
    
    try {
      const response = await fetch('/api/assessment/labour-code-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userDetails,
          responses,
          assessmentType: ASSESSMENT_TYPES.LABOUR_CODE,
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
        assessment_type: ASSESSMENT_TYPES.LABOUR_CODE,
        created_at: new Date().toISOString(),
      };
      localStorage.setItem(getLocalStorageKey(data.assessmentId), JSON.stringify(assessmentData));
      
      // Clear saved progress on successful submission
      clearProgress();
      
      toast.success('Assessment completed!');
      router.push(`/results/${data.assessmentId}?type=${ASSESSMENT_TYPES.LABOUR_CODE}`);
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
      <AssessmentHeader 
        title="ComplianceCheck"
        subtitle="Labour Code Readiness"
        badgeText="FREE Assessment"
        badgeVariant="free"
      />

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Restored Progress Notice */}
        {hasRestoredProgress && currentStep === 0 && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700 flex items-center justify-between">
            <span>📝 Your previous progress has been restored.</span>
            <button 
              onClick={() => {
                clearProgress();
                setCurrentStep(0);
                setCurrentCategoryIndex(0);
                setCurrentQuestionIndex(0);
                setResponses({});
                setUserDetails({
                  companyName: '',
                  industry: '',
                  employeeCount: '',
                  state: '',
                  contactName: '',
                  contactEmail: '',
                  phone: '',
                });
              }}
              className="text-blue-600 hover:underline"
            >
              Start Fresh
            </button>
          </div>
        )}

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-slate-600 mb-2">
            <span>
              {currentStep === 0 
                ? 'Company Details' 
                : `${currentCategory?.name} (${answeredInCategory}/${categoryQuestions.length})`}
            </span>
            <div className="flex items-center gap-2">
              {saveStatus === 'saving' && (
                <span className="flex items-center text-blue-600">
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Saving...
                </span>
              )}
              {saveStatus === 'saved' && (
                <span className="flex items-center text-green-600">
                  <Save className="w-3 h-3 mr-1" />
                  Saved
                </span>
              )}
              <span>{progress}% complete</span>
            </div>
          </div>
          <Progress value={progress} className="h-3 [&>div]:bg-green-600" aria-label="Assessment progress" />
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
                        {INDUSTRY_OPTIONS.map((industry) => (
                          <SelectItem key={industry.value} value={industry.value}>
                            {industry.label}
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
                        {EMPLOYEE_COUNT_OPTIONS.map((count) => (
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

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 text-gray-600 bg-gray-100 border border-r-0 rounded-l-md">
                      +91
                    </span>
                    <Input
                      id="phone"
                      placeholder="9876543210"
                      value={userDetails.phone}
                      onChange={(e) => handleUserDetailsChange('phone', e.target.value)}
                      className="rounded-l-none"
                      maxLength={10}
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
                          ? 'bg-green-700 hover:bg-green-800 text-white' 
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
                          ? 'bg-red-700 hover:bg-red-800 text-white' 
                          : ''
                      }`}
                      onClick={() => handleResponse(currentQuestion.id, 'no')}
                    >
                      <XCircle className="w-5 h-5 mr-2" />
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
                            ? 'bg-blue-700 hover:bg-blue-800 text-white' 
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
              className="flex items-center gap-2 bg-green-700 hover:bg-green-800"
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
