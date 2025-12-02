/**
 * Test script to identify DPDP scoring issue
 * Run with: node test-dpdp-scoring.js
 */

// Simulating the scoring logic from dpdp-questions.ts
const DPDP_QUESTIONS = [
  // Sample questions
  { id: 'inventory_1', type: 'yes_no', category: 'inventory', weight: 8, complianceAnswer: 'yes' },
  { id: 'inventory_2', type: 'yes_no', category: 'inventory', weight: 7, complianceAnswer: 'yes' },
  { id: 'consent_1', type: 'yes_no', category: 'consent', weight: 10, complianceAnswer: 'yes' },
  { id: 'consent_2', type: 'yes_no', category: 'consent', weight: 9, complianceAnswer: 'yes' },
  { id: 'security_1', type: 'yes_no', category: 'security', weight: 10, complianceAnswer: 'yes' },
];

const riskMultipliers = {
  children: 2.0,
  security: 1.8,
  breach: 1.5,
  rights: 1.3,
  thirdparty: 1.5,
  consent: 1.0,
  notices: 1.0,
  inventory: 1.0,
};

function testScoring(responses) {
  const categoryScores = {};
  const maxScores = {};
  
  // Initialize scores
  ['inventory', 'consent', 'security'].forEach((cat) => {
    categoryScores[cat] = 0;
    maxScores[cat] = 0;
  });

  // Calculate scores
  DPDP_QUESTIONS.forEach((question) => {
    const response = responses[question.id];
    const multiplier = riskMultipliers[question.category] || 1.0;
    const adjustedWeight = question.weight * multiplier;
    
    maxScores[question.category] += adjustedWeight;

    if (!response) return;

    if (question.type === 'yes_no') {
      if (response === question.complianceAnswer) {
        categoryScores[question.category] += adjustedWeight;
      }
    }
  });

  // Calculate overall score
  let totalScore = 0;
  let totalMaxScore = 0;

  Object.keys(categoryScores).forEach((cat) => {
    totalScore += categoryScores[cat];
    totalMaxScore += maxScores[cat];
  });

  const overallScore = totalMaxScore > 0 ? Math.round((totalScore / totalMaxScore) * 100) : 0;

  return {
    categoryScores,
    maxScores,
    totalScore,
    totalMaxScore,
    overallScore,
  };
}

console.log('=== TEST 1: All answers are "no" ===');
const allNoResponses = {
  'inventory_1': 'no',
  'inventory_2': 'no',
  'consent_1': 'no',
  'consent_2': 'no',
  'security_1': 'no',
};
const result1 = testScoring(allNoResponses);
console.log('Result:', result1);
console.log('Expected: 0%');
console.log('Actual:', result1.overallScore + '%');
console.log('');

console.log('=== TEST 2: All answers are "yes" ===');
const allYesResponses = {
  'inventory_1': 'yes',
  'inventory_2': 'yes',
  'consent_1': 'yes',
  'consent_2': 'yes',
  'security_1': 'yes',
};
const result2 = testScoring(allYesResponses);
console.log('Result:', result2);
console.log('Expected: 100%');
console.log('Actual:', result2.overallScore + '%');
console.log('');

console.log('=== TEST 3: Mixed answers ===');
const mixedResponses = {
  'inventory_1': 'yes',
  'inventory_2': 'no',
  'consent_1': 'yes',
  'consent_2': 'no',
  'security_1': 'yes',
};
const result3 = testScoring(mixedResponses);
console.log('Result:', result3);
console.log('Actual:', result3.overallScore + '%');