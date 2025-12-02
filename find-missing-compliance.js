// Find the question missing complianceAnswer
const fs = require('fs');

const content = fs.readFileSync('C:\\Users\\amol.fadnis\\compliancecheck\\src\\lib\\assessments\\dpdp-questions.ts', 'utf-8');

// Find all question blocks
const questionPattern = /\{\s*id:\s*'([^']+)',[\s\S]*?\},/g;
let match;
const questionsWithoutCompliance = [];

while ((match = questionPattern.exec(content)) !== null) {
  const questionBlock = match[0];
  const questionId = match[1];
  
  if (!questionBlock.includes('complianceAnswer')) {
    console.log(`\n❌ FOUND: Question "${questionId}" is missing complianceAnswer\n`);
    console.log('--- Question Block ---');
    console.log(questionBlock.substring(0, 400)); // Print first 400 chars
    console.log('...\n');
    questionsWithoutCompliance.push(questionId);
  }
}

console.log(`\nTotal questions missing complianceAnswer: ${questionsWithoutCompliance.length}`);
console.log('IDs:', questionsWithoutCompliance.join(', '));