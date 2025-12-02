// Load and analyze DPDP questions
const fs = require('fs');

// Read the file
const content = fs.readFileSync('C:\\Users\\amol.fadnis\\compliancecheck\\src\\lib\\assessments\\dpdp-questions.ts', 'utf-8');

// Count question definitions
const questionMatches = content.match(/id:\s*'[a-z_]+\d+'/g);
console.log(`Total question IDs found: ${questionMatches ? questionMatches.length : 0}`);

// Count complianceAnswer occurrences
const complianceAnswers = content.match(/complianceAnswer:\s*'(yes|no)'/g);
console.log(`Questions with complianceAnswer: ${complianceAnswers ? complianceAnswers.length : 0}`);

console.log('\n--- Breakdown ---');
if (questionMatches) {
  questionMatches.forEach((match, idx) => {
    console.log(`${idx + 1}. ${match}`);
  });
}

console.log('\n--- Questions possibly missing complianceAnswer ---');
const diff = (questionMatches?.length || 0) - (complianceAnswers?.length || 0);
console.log(`Difference: ${diff} questions`);