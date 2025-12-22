'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { AssessmentHeader } from '@/components/assessment/assessment-header';
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ArrowLeft, 
  ArrowRight,
  Loader2,
} from 'lucide-react';
import {
  PHASE1_QUESTIONS,
  TOP_10_STATES,
  Question,
  ApplicabilityResult,
  UserDetails,
  ApplicabilityResponses,
  determineApplicability,
  getFilteredPhase2Questions,
  calculateComplianceScore,
  generateApplicabilitySummary,
} from '@/lib/assessments/state-wise-compliance-questions';

declare global {
  interface Window {
    posthog?: {
      capture: (event: string, properties?: Record<string, unknown>) => void;
    };
  }
}

type AssessmentPhase = 'user_details' | 'phase1' | 'applicability_results' | 'phase2' | 'submitting';

// Helper to format state names in reason text
function formatStateNames(reason: string): string {
  if (!reason) return reason;
  // Replace any lowercase state values with proper labels
  let formatted = reason;
  TOP_10_STATES.forEach(state => {
    // Match the value (case-insensitive) and replace with label
    const regex = new RegExp(`\\b${state.value}\\b`, 'gi');
    formatted = formatted.replace(regex, state.label);
  });
  return formatted;
}

export default function StateWiseComplianceAssessment() {
  const router = useRouter();
  const [currentPhase, setCurrentPhase] = useState<AssessmentPhase>('user_details');
  const [userDetails, setUserDetails] = useState<UserDetails>({
    fullName: '',
    email: '',
    phoneNumber: '',
    companyName: '',
  });
  const [phase1Responses, setPhase1Responses] = useState<ApplicabilityResponses>({});
  const [phase1Index, setPhase1Index] = useState(0);
  const [applicabilityResults, setApplicabilityResults] = useState<ApplicabilityResult[]>([]);
  const [filteredPhase2Questions, setFilteredPhase2Questions] = useState<Question[]>([]);
  const [phase2Responses, setPhase2Responses] = useState<Record<string, string>>({});
  const [phase2Index, setPhase2Index] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [multiSelectValues, setMultiSelectValues] = useState<string[]>([]);

  useEffect(() => {
    window.posthog?.capture('assessment_page_viewed', { assessment_type: 'state_wise_compliance' });
  }, []);

  const getProgress = (): number => {
    if (currentPhase === 'user_details') return 0;
    if (currentPhase === 'phase1') return Math.round((phase1Index / PHASE1_QUESTIONS.length) * 40);
    if (currentPhase === 'applicability_results') return 45;
    if (currentPhase === 'phase2') {
      const phase2Progress = filteredPhase2Questions.length > 0 
        ? (phase2Index / filteredPhase2Questions.length) * 50 
        : 0;
      return 45 + Math.round(phase2Progress);
    }
    return 100;
  };

  const handleUserDetailsSubmit = () => {
    if (!userDetails.fullName || !userDetails.email || !userDetails.companyName) {
      setError('Please fill in all required fields');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userDetails.email)) {
      setError('Please enter a valid email address');
      return;
    }
    setError(null);
    setCurrentPhase('phase1');
    window.posthog?.capture('assessment_started', { 
      assessment_type: 'state_wise_compliance', 
      company_name: userDetails.companyName 
    });
  };

  const handlePhase1Answer = (questionId: string, answer: string | string[]) => {
    const newResponses = { ...phase1Responses, [questionId]: answer };
    setPhase1Responses(newResponses);
    setTimeout(() => {
      if (phase1Index < PHASE1_QUESTIONS.length - 1) {
        setPhase1Index(phase1Index + 1);
      } else {
        const results = determineApplicability(newResponses);
        setApplicabilityResults(results);
        const filtered = getFilteredPhase2Questions(results, newResponses);
        setFilteredPhase2Questions(filtered);
        setCurrentPhase('applicability_results');
        window.posthog?.capture('phase1_completed', { 
          assessment_type: 'state_wise_compliance', 
          applicable_count: results.filter(r => r.applies).length 
        });
      }
    }, 300);
  };

  const handleMultiSelect = (questionId: string, value: string) => {
    let newValues: string[];
    if (value === 'same_as_registered') {
      newValues = ['same_as_registered'];
    } else {
      const filtered = multiSelectValues.filter(v => v !== 'same_as_registered');
      newValues = filtered.includes(value) 
        ? filtered.filter(v => v !== value) 
        : [...filtered, value];
    }
    setMultiSelectValues(newValues);
    setPhase1Responses({ ...phase1Responses, [questionId]: newValues });
  };

  const handlePhase2Answer = (questionId: string, answer: string) => {
    const newResponses = { ...phase2Responses, [questionId]: answer };
    setPhase2Responses(newResponses);
    setTimeout(() => {
      if (phase2Index < filteredPhase2Questions.length - 1) {
        setPhase2Index(phase2Index + 1);
      }
    }, 300);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setCurrentPhase('submitting');
    
    try {
      const scoreResult = calculateComplianceScore(phase2Responses, filteredPhase2Questions);
      const applicabilitySummary = generateApplicabilitySummary(applicabilityResults);
      
      const submissionData = {
        userDetails,
        phase1Responses,
        phase2Responses,
        applicabilityResults,
        applicabilitySummary,
        scoreResult,
        assessmentType: 'state_wise_compliance',
      };
      
      const response = await fetch('/api/assessment/state-wise-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Store complete data in localStorage for the results page
        localStorage.setItem(`assessment_${result.assessmentId}`, JSON.stringify({
          ...submissionData,
          assessmentId: result.assessmentId,
          timestamp: new Date().toISOString(),
        }));
        
        window.posthog?.capture('assessment_completed', {
          assessment_type: 'state_wise_compliance',
          overall_score: scoreResult.overallScore,
          status: scoreResult.status,
        });
        
        router.push(`/results/${result.assessmentId}`);
      } else {
        throw new Error(result.error || 'Submission failed');
      }
    } catch (err) {
      console.error('Submission error:', err);
      // Fallback to localStorage
      const localId = `local_${Date.now()}`;
      const scoreResult = calculateComplianceScore(phase2Responses, filteredPhase2Questions);
      const applicabilitySummary = generateApplicabilitySummary(applicabilityResults);
      
      localStorage.setItem(`assessment_${localId}`, JSON.stringify({
        userDetails,
        phase1Responses,
        phase2Responses,
        applicabilityResults,
        applicabilitySummary,
        scoreResult,
        assessmentType: 'state_wise_compliance',
        assessmentId: localId,
        timestamp: new Date().toISOString(),
      }));
      
      router.push(`/results/${localId}`);
    }
  };


  const renderUserDetailsForm = () => (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-green-800 text-white text-xs font-bold px-2 py-1 rounded shadow-md">
            FREE BETA
          </span>
          <span className="text-gray-600 line-through text-sm">Rs.1,499</span>
        </div>
        <CardTitle className="text-2xl">State-Wise Comprehensive Compliance Check</CardTitle>
        <CardDescription>
          Complete compliance assessment covering central labour laws, state-specific 
          requirements, tax compliance, and industry-specific regulations. 
          Takes approximately 20-30 minutes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name *</Label>
            <Input 
              id="fullName" 
              placeholder="Your full name" 
              value={userDetails.fullName} 
              onChange={(e) => setUserDetails({ ...userDetails, fullName: e.target.value })} 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="you@company.com" 
              value={userDetails.email} 
              onChange={(e) => setUserDetails({ ...userDetails, email: e.target.value })} 
            />
            <p className="text-xs text-gray-500">We will send your report to this email</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-600 text-sm">
                +91
              </span>
              <Input 
                id="phoneNumber" 
                type="tel" 
                placeholder="9876543210" 
                className="rounded-l-none" 
                value={userDetails.phoneNumber} 
                onChange={(e) => setUserDetails({ ...userDetails, phoneNumber: e.target.value })} 
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name *</Label>
            <Input 
              id="companyName" 
              placeholder="Your company name" 
              value={userDetails.companyName} 
              onChange={(e) => setUserDetails({ ...userDetails, companyName: e.target.value })} 
            />
          </div>
        </div>
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />{error}
          </div>
        )}
        <Button 
          className="w-full bg-blue-700 hover:bg-blue-800 text-white" 
          onClick={handleUserDetailsSubmit}
        >
          Continue to Assessment
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">This assessment covers:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              Central Labour Laws (EPF, ESI, Gratuity, POSH, Maternity)
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              State-Specific (Professional Tax, LWF, Shops & Establishments)
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              Tax & Business (GST, MSME, DPDP)
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              Industry-Specific (FSSAI, Fintech, Factory, Pollution)
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );

  const renderPhase1Question = () => {
    const question = PHASE1_QUESTIONS[phase1Index];
    // Skip conditional questions if condition not met
    if (question.id === 'APP_08' && phase1Responses['APP_07'] !== 'yes') {
      setTimeout(() => { 
        if (phase1Index < PHASE1_QUESTIONS.length - 1) setPhase1Index(phase1Index + 1); 
      }, 0);
      return null;
    }
    
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
              Phase 1: Applicability Check
            </span>
            <span className="text-sm text-gray-500">
              {phase1Index + 1} of {PHASE1_QUESTIONS.length}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
            <span className="bg-gray-100 px-2 py-1 rounded">{question.category}</span>
          </div>
          <CardTitle className="text-xl">{question.text}</CardTitle>
          {question.helpText && (
            <CardDescription className="text-sm">{question.helpText}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {question.type === 'yes_no' && (
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant={phase1Responses[question.id] === 'yes' ? 'default' : 'outline'} 
                className={phase1Responses[question.id] === 'yes' ? 'bg-green-700 hover:bg-green-800' : ''} 
                onClick={() => handlePhase1Answer(question.id, 'yes')}
              >
                Yes
              </Button>
              <Button 
                variant={phase1Responses[question.id] === 'no' ? 'default' : 'outline'} 
                className={phase1Responses[question.id] === 'no' ? 'bg-red-700 hover:bg-red-800' : ''} 
                onClick={() => handlePhase1Answer(question.id, 'no')}
              >
                No
              </Button>
            </div>
          )}
          {question.type === 'single_choice' && question.options && (
            <div className="space-y-2">
              {question.options.map((option) => (
                <Button 
                  key={option.value} 
                  variant={phase1Responses[question.id] === option.value ? 'default' : 'outline'} 
                  className={`w-full justify-start text-left ${
                    phase1Responses[question.id] === option.value ? 'bg-blue-700 hover:bg-blue-800' : ''
                  }`} 
                  onClick={() => handlePhase1Answer(question.id, option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          )}
          {question.type === 'multiple_choice' && question.options && (
            <div className="space-y-2">
              <p className="text-sm text-gray-500 mb-2">Select all that apply:</p>
              {question.options.map((option) => (
                <Button 
                  key={option.value} 
                  variant={multiSelectValues.includes(option.value) ? 'default' : 'outline'} 
                  className={`w-full justify-start text-left ${
                    multiSelectValues.includes(option.value) ? 'bg-blue-700 hover:bg-blue-800' : ''
                  }`} 
                  onClick={() => handleMultiSelect(question.id, option.value)}
                >
                  {option.label}
                </Button>
              ))}
              {multiSelectValues.length > 0 && (
                <Button 
                  className="w-full mt-4 bg-green-700 hover:bg-green-800" 
                  onClick={() => handlePhase1Answer(question.id, multiSelectValues)}
                >
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          )}
          <div className="flex justify-between pt-4">
            <Button 
              variant="ghost" 
              onClick={() => phase1Index > 0 && setPhase1Index(phase1Index - 1)} 
              disabled={phase1Index === 0}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />Back
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };


  const renderApplicabilityResults = () => {
    const summary = generateApplicabilitySummary(applicabilityResults);
    const applicable = applicabilityResults.filter(r => r.applies);
    const notApplicable = applicabilityResults.filter(r => !r.applies);
    
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Summary Card with Continue Button */}
        <Card>
          <CardHeader>
            <span className="text-sm font-medium text-green-700 bg-green-50 px-3 py-1 rounded-full w-fit">
              Phase 1 Complete
            </span>
            <CardTitle className="text-2xl">Your Compliance Applicability Results</CardTitle>
            <CardDescription>
              Based on your responses, we have identified which compliance requirements 
              apply to your business.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-green-700">{summary.applicableCount}</div>
                <div className="text-sm text-green-600">Applicable</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-gray-700">{summary.notApplicableCount}</div>
                <div className="text-sm text-gray-600">Not Applicable</div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-blue-700">{filteredPhase2Questions.length}</div>
                <div className="text-sm text-blue-600">Questions in Phase 2</div>
              </div>
            </div>
            
            {summary.criticalCount > 0 && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-6">
                <div className="flex items-center gap-2 text-red-700 font-medium">
                  <AlertCircle className="h-5 w-5" />
                  {summary.criticalCount} Critical compliance areas identified
                </div>
              </div>
            )}
            
            {/* Continue Button - RIGHT AFTER SUMMARY */}
            <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg text-center">
              <h3 className="text-lg font-medium mb-2">Ready for Phase 2?</h3>
              <p className="text-gray-600 mb-4">
                Now we will assess your compliance status for the {applicable.length} applicable 
                areas. ({filteredPhase2Questions.length} questions)
              </p>
              <Button 
                className="bg-blue-700 hover:bg-blue-800 text-white"
                onClick={() => setCurrentPhase('phase2')}
              >
                Continue to Compliance Assessment
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Applicable Items */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Applicable to Your Business ({applicable.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {applicable.map((item) => (
                <div 
                  key={item.code} 
                  className={`p-3 rounded-lg border ${
                    item.priority === 'critical' ? 'bg-red-50 border-red-200' : 
                    item.priority === 'high' ? 'bg-amber-50 border-amber-200' : 
                    'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {item.name}
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          item.priority === 'critical' ? 'bg-red-200 text-red-800' : 
                          item.priority === 'high' ? 'bg-amber-200 text-amber-800' : 
                          item.priority === 'medium' ? 'bg-blue-200 text-blue-800' :
                          'bg-gray-200 text-gray-800'
                        }`}>
                          {item.priority.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {formatStateNames(item.reason)}
                      </div>
                      {item.threshold && (
                        <div className="text-xs text-gray-500 mt-1">
                          Threshold: {item.threshold}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Not Applicable Items */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-gray-500">
              <XCircle className="h-5 w-5" />
              Not Applicable ({notApplicable.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-500 space-y-1">
              {notApplicable.map((item) => (
                <div key={item.code} className="flex items-center gap-2">
                  <span className="text-gray-400">•</span>
                  {item.name}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderPhase2Question = () => {
    if (filteredPhase2Questions.length === 0) {
      return (
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-6 text-center">
            <p>No compliance questions applicable based on your business profile.</p>
            <Button onClick={handleSubmit} className="mt-4">
              Complete Assessment
            </Button>
          </CardContent>
        </Card>
      );
    }
    
    const question = filteredPhase2Questions[phase2Index];
    const isLastQuestion = phase2Index === filteredPhase2Questions.length - 1;
    
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-purple-700 bg-purple-50 px-3 py-1 rounded-full">
              Phase 2: Compliance Check
            </span>
            <span className="text-sm text-gray-500">
              {phase2Index + 1} of {filteredPhase2Questions.length}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
            <span className="bg-gray-100 px-2 py-1 rounded">{question.category}</span>
          </div>
          <CardTitle className="text-xl">{question.text}</CardTitle>
          {question.helpText && (
            <CardDescription className="text-sm">{question.helpText}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {question.type === 'yes_no' && (
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant={phase2Responses[question.id] === 'yes' ? 'default' : 'outline'} 
                className={phase2Responses[question.id] === 'yes' ? 'bg-green-700 hover:bg-green-800' : ''} 
                onClick={() => handlePhase2Answer(question.id, 'yes')}
              >
                Yes
              </Button>
              <Button 
                variant={phase2Responses[question.id] === 'no' ? 'default' : 'outline'} 
                className={phase2Responses[question.id] === 'no' ? 'bg-red-700 hover:bg-red-800' : ''} 
                onClick={() => handlePhase2Answer(question.id, 'no')}
              >
                No
              </Button>
            </div>
          )}
          {question.type === 'single_choice' && question.options && (
            <div className="space-y-2">
              {question.options.map((option) => (
                <Button 
                  key={option.value} 
                  variant={phase2Responses[question.id] === option.value ? 'default' : 'outline'} 
                  className={`w-full justify-start text-left ${
                    phase2Responses[question.id] === option.value ? 'bg-blue-700 hover:bg-blue-800' : ''
                  }`} 
                  onClick={() => handlePhase2Answer(question.id, option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          )}
          <div className="flex justify-between pt-4">
            <Button 
              variant="ghost" 
              onClick={() => phase2Index > 0 && setPhase2Index(phase2Index - 1)} 
              disabled={phase2Index === 0}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />Back
            </Button>
            {isLastQuestion && phase2Responses[question.id] && (
              <Button 
                className="bg-green-700 hover:bg-green-800 text-white" 
                onClick={handleSubmit} 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Assessment
                    <CheckCircle2 className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderSubmitting = () => (
    <Card className="max-w-md mx-auto">
      <CardContent className="pt-6 text-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium">Analyzing Your Compliance...</h3>
        <p className="text-gray-500 mt-2">This may take a few seconds.</p>
      </CardContent>
    </Card>
  );


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Beta Banner */}
      <div className="bg-amber-700 text-white text-center py-2 text-sm font-medium">
        This site is under development. All assessments FREE during beta!
      </div>
      
      {/* Use consistent AssessmentHeader like other assessments */}
      <AssessmentHeader
        title="State-Wise Compliance"
        subtitle="ComplianceCheck"
        badgeText="FREE Assessment"
        badgeVariant="free"
      />
      
      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Overall Progress</span>
            <span className="text-sm font-medium">{getProgress()}%</span>
          </div>
          <Progress value={getProgress()} className="h-2" aria-label="Assessment progress" />
          <div className="flex justify-between mt-3 text-xs">
            <div className={`flex items-center gap-1 ${currentPhase === 'user_details' ? 'text-blue-700 font-medium' : 'text-gray-500'}`}>
              <div className={`w-2 h-2 rounded-full ${currentPhase === 'user_details' ? 'bg-blue-700' : 'bg-gray-300'}`} />
              Details
            </div>
            <div className={`flex items-center gap-1 ${currentPhase === 'phase1' ? 'text-blue-700 font-medium' : 'text-gray-500'}`}>
              <div className={`w-2 h-2 rounded-full ${currentPhase === 'phase1' ? 'bg-blue-700' : 'bg-gray-300'}`} />
              Applicability
            </div>
            <div className={`flex items-center gap-1 ${currentPhase === 'applicability_results' ? 'text-green-700 font-medium' : 'text-gray-500'}`}>
              <div className={`w-2 h-2 rounded-full ${currentPhase === 'applicability_results' ? 'bg-green-700' : 'bg-gray-300'}`} />
              Results
            </div>
            <div className={`flex items-center gap-1 ${currentPhase === 'phase2' ? 'text-purple-700 font-medium' : 'text-gray-500'}`}>
              <div className={`w-2 h-2 rounded-full ${currentPhase === 'phase2' ? 'bg-purple-700' : 'bg-gray-300'}`} />
              Compliance
            </div>
            <div className="flex items-center gap-1 text-gray-500">
              <div className="w-2 h-2 rounded-full bg-gray-300" />
              Report
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {currentPhase === 'user_details' && renderUserDetailsForm()}
        {currentPhase === 'phase1' && renderPhase1Question()}
        {currentPhase === 'applicability_results' && renderApplicabilityResults()}
        {currentPhase === 'phase2' && renderPhase2Question()}
        {currentPhase === 'submitting' && renderSubmitting()}
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t mt-auto py-4">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
          <p>ComplianceCheck - Simplifying compliance for Indian businesses</p>
          <p className="mt-1">
            Questions? Contact us at{' '}
            <a href="mailto:compliancecheck@zohomail.in" className="text-blue-600 hover:underline">
              compliancecheck@zohomail.in
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
