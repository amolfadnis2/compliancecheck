import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn('Supabase credentials not configured');
    return null;
  }
  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userDetails, phase1Responses, phase2Responses, applicabilityResults, applicabilitySummary, scoreResult } = body;
    
    if (!userDetails?.email || !userDetails?.companyName) {
      return NextResponse.json({ success: false, error: 'Missing required user details' }, { status: 400 });
    }
    
    const supabase = getSupabaseClient();
    
    if (!supabase) {
      const localId = `local_${Date.now()}`;
      return NextResponse.json({
        success: true, assessmentId: localId, message: 'Assessment saved locally',
        overallScore: scoreResult?.overallScore || 0, categoryScores: scoreResult?.categoryScores || {}, status: scoreResult?.status || 'Unknown',
      });
    }
    
    let userId: string | null = null;
    try {
      const { data: existingUser } = await supabase.from('users').select('id').eq('email', userDetails.email).single();
      if (existingUser) {
        userId = existingUser.id;
        await supabase.from('users').update({
          full_name: userDetails.fullName, phone: userDetails.phoneNumber, company_name: userDetails.companyName, updated_at: new Date().toISOString(),
        }).eq('id', userId);
      } else {
        const { data: newUser } = await supabase.from('users').insert({
          email: userDetails.email, full_name: userDetails.fullName, phone: userDetails.phoneNumber, company_name: userDetails.companyName,
          consent_timestamp: new Date().toISOString(), consent_version: '1.0',
        }).select('id').single();
        userId = newUser?.id || null;
      }
    } catch (userErr) {
      console.error('User creation/lookup error:', userErr);
    }

    const assessmentData = {
      user_id: userId,
      company_name: userDetails.companyName,
      employee_count: phase1Responses?.APP_06 || null,
      state: phase1Responses?.APP_02 || null,
      industry: phase1Responses?.APP_04 || null,
      email: userDetails.email,
      assessment_type: 'state_wise_compliance',
      status: 'completed',
      responses: { 
        phase1: phase1Responses, 
        phase2: phase2Responses, 
        applicabilityResults, 
        applicabilitySummary,
        userDetails,
        compliantItems: scoreResult?.compliantItems || [],
      },
      overall_score: scoreResult?.overallScore || 0,
      category_scores: scoreResult?.categoryScores || {},
      action_items: scoreResult?.gaps?.map((gap: { question: { category: string; text: string }; recommendation: string }) => ({
        priority: 'high', text: gap.recommendation, category: gap.question.category,
      })) || [],
      completed_at: new Date().toISOString(),
    };
    
    const { data: assessment, error: assessmentError } = await supabase.from('assessments').insert(assessmentData).select('id').single();
    
    if (assessmentError) {
      console.error('Assessment insert error:', assessmentError);
      const localId = `local_${Date.now()}`;
      return NextResponse.json({
        success: true, assessmentId: localId, message: 'Assessment saved locally (database error)',
        overallScore: scoreResult?.overallScore || 0, categoryScores: scoreResult?.categoryScores || {}, status: scoreResult?.status || 'Unknown',
      });
    }
    
    sendReportEmail(userDetails, scoreResult, applicabilitySummary, assessment.id).catch(err => console.error('Email send error:', err));
    
    return NextResponse.json({
      success: true, assessmentId: assessment.id, overallScore: scoreResult?.overallScore || 0,
      categoryScores: scoreResult?.categoryScores || {}, status: scoreResult?.status || 'Unknown', applicableCount: applicabilitySummary?.applicableCount || 0,
    });
    
  } catch (error) {
    console.error('State-wise assessment submission error:', error);
    return NextResponse.json({ success: false, error: 'Failed to process assessment', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

async function sendReportEmail(
  userDetails: { fullName: string; email: string; companyName: string },
  scoreResult: { overallScore: number; status: string; categoryScores: Record<string, { percentage: number }> },
  applicabilitySummary: { applicableCount: number; criticalCount: number },
  assessmentId: string
) {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) { console.log('Resend API key not configured'); return; }
  
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://compliancecheck-app.netlify.app';
  const resultsUrl = `${appUrl}/results/${assessmentId}`;
  const statusColor = scoreResult.status === 'Compliant' ? '#059669' : scoreResult.status === 'Needs Attention' ? '#D97706' : '#DC2626';
  
  const categoryList = Object.entries(scoreResult.categoryScores || {})
    .map(([cat, data]) => `<tr><td style="padding: 8px; border-bottom: 1px solid #eee;">${cat}</td><td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${data.percentage}%</td></tr>`)
    .join('');
  
  const emailHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Your State-Wise Compliance Report</title></head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: #7C3AED; color: white; padding: 20px; text-align: center;"><h1 style="margin: 0;">ComplianceCheck</h1><p style="margin: 5px 0 0 0; opacity: 0.9;">State-Wise Comprehensive Compliance Report</p></div>
<div style="padding: 30px 20px;"><p>Dear ${userDetails.fullName},</p>
<p>Thank you for completing the State-Wise Comprehensive Compliance Check for <strong>${userDetails.companyName}</strong>.</p>
<div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
<h2 style="margin: 0 0 10px 0; color: #333;">Your Compliance Score</h2>
<div style="font-size: 48px; font-weight: bold; color: ${statusColor};">${scoreResult.overallScore}%</div>
<div style="font-size: 18px; color: ${statusColor}; font-weight: bold;">${scoreResult.status}</div></div>
<div style="background: #e8f4fd; padding: 15px; border-radius: 8px; margin: 20px 0;"><strong>Compliance Areas Identified:</strong>
<ul style="margin: 10px 0 0 0; padding-left: 20px;"><li>${applicabilitySummary.applicableCount} compliance requirements apply to your business</li>
${applicabilitySummary.criticalCount > 0 ? `<li style="color: #DC2626;"><strong>${applicabilitySummary.criticalCount} critical areas</strong> require immediate attention</li>` : ''}</ul></div>
${categoryList ? `<h3>Category-wise Scores:</h3><table style="width: 100%; border-collapse: collapse; margin: 10px 0;"><thead><tr style="background: #f0f0f0;"><th style="padding: 10px; text-align: left;">Category</th><th style="padding: 10px; text-align: right;">Score</th></tr></thead><tbody>${categoryList}</tbody></table>` : ''}
<div style="text-align: center; margin: 30px 0;"><a href="${resultsUrl}" style="background: #7C3AED; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">View Full Report & Download PDF</a></div>
<p style="color: #666; font-size: 14px;"><strong>Note:</strong> This is an automated assessment. Consult qualified professionals for specific compliance matters.</p></div>
<div style="background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666;"><p style="margin: 0;">ComplianceCheck - Simplifying compliance for Indian businesses</p></div>
</body></html>`;
  
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'ComplianceCheck <noreply@compliancecheck.co.in>', to: [userDetails.email],
        subject: `Your State-Wise Compliance Report - ${scoreResult.overallScore}% ${scoreResult.status}`, html: emailHtml,
      }),
    });
    if (!response.ok) console.error('Resend API error:', await response.text());
    else console.log('Report email sent to:', userDetails.email);
  } catch (emailError) { console.error('Email sending failed:', emailError); }
}
