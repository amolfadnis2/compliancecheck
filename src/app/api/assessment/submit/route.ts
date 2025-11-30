/**
 * Assessment Submission API with Server-Side Validation
 * POST /api/assessment/submit
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Rate limiting map (in production, use Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW = 60000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }
  
  if (entry.count >= RATE_LIMIT) {
    return false;
  }
  
  entry.count++;
  return true;
}

// Sanitize string inputs to prevent XSS
function sanitizeString(str: string): string {
  return str
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// Sanitize all string fields in an object
function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const sanitized = { ...obj };
  for (const key in sanitized) {
    const value = sanitized[key];
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value) as T[typeof key];
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>) as T[typeof key];
    }
  }
  return sanitized;
}

// Validation schema (inline for API route)
const companyDetailsSchema = z.object({
  companyName: z.string().min(2).max(200),
  industry: z.string().min(1),
  employeeCount: z.string().min(1),
  state: z.string().min(1),
  email: z.string().email(),
});

const assessmentResponseSchema = z.object({
  questionId: z.string().min(1),
  answer: z.union([z.boolean(), z.string(), z.array(z.string())]),
  answeredAt: z.string().optional(),
});

const assessmentSubmissionSchema = z.object({
  assessmentType: z.enum(['statutory_health', 'labour_code', 'dpdp']),
  companyDetails: companyDetailsSchema,
  responses: z.array(assessmentResponseSchema).min(1),
  completedAt: z.string().optional(),
  consentGiven: z.boolean().refine((val) => val === true),
});

export async function POST(request: NextRequest) {
  try {
    // 1. Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please wait a minute.' },
        { status: 429 }
      );
    }

    // 2. Parse request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // 3. Validate with Zod schema
    const validation = assessmentSubmissionSchema.safeParse(body);
    
    if (!validation.success) {
      const errors = validation.error.issues.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: errors },
        { status: 400 }
      );
    }

    const data = validation.data;
    
    // 4. Sanitize all string inputs (data is already validated by Zod)
    const sanitizedData = sanitizeObject(data as Record<string, unknown>);

    // 5. Generate unique assessment ID
    const assessmentId = `${sanitizedData.assessmentType || data.assessmentType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // 6. Calculate scores (simplified - use your existing scoring functions)
    const scores = {
      overall: 75, // Replace with actual calculation
      categories: {} as Record<string, number>,
    };
    
    const actionItems: Array<{ priority: string; text: string; category: string }> = [];

    // 7. Save to database (Supabase)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    let savedToDb = false;
    
    if (supabaseUrl && supabaseKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        const { error: dbError } = await supabase
          .from('assessments')
          .insert({
            id: assessmentId,
            assessment_type: data.assessmentType,
            company_name: data.companyDetails.companyName,
            industry: data.companyDetails.industry,
            employee_count: data.companyDetails.employeeCount,
            state: data.companyDetails.state,
            email: data.companyDetails.email,
            responses: data.responses,
            overall_score: scores.overall,
            category_scores: scores.categories,
            action_items: actionItems,
            status: 'completed',
            completed_at: new Date().toISOString(),
            ip_address: ip,
            user_agent: request.headers.get('user-agent') || 'unknown',
          });

        if (!dbError) {
          savedToDb = true;
        } else {
          console.error('Database error:', dbError);
        }
      } catch (dbError) {
        console.error('Failed to save to database:', dbError);
      }
    }

    // 8. Return success response
    return NextResponse.json({
      success: true,
      data: {
        assessmentId,
        overallScore: scores.overall,
        categoryScores: scores.categories,
        actionItems,
        savedToDatabase: savedToDb,
      },
    });

  } catch (error) {
    console.error('Assessment submission error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}

// GET method for checking API health
export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
}
