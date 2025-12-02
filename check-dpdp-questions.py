"""
Check DPDP questions file for questions missing complianceAnswer
"""
import re

# Read the file
with open(r'C:\Users\amol.fadnis\compliancecheck\src\lib\assessments\dpdp-questions.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Find all question objects
# Pattern: id: 'question_id', ... until the next question or closing bracket
question_pattern = r"\{\s*id:\s*'([^']+)',\s*text:[^}]+?(?=\n\s*\},|\n\s*\])"

questions = re.findall(question_pattern, content, re.DOTALL)

print(f"Total questions found: {len(questions)}")
print()

# Check each question for complianceAnswer
questions_without_compliance = []

for match in re.finditer(question_pattern, content, re.DOTALL):
    question_block = match.group(0)
    question_id = match.group(1)
    
    # Check if this block contains complianceAnswer
    if 'complianceAnswer' not in question_block:
        questions_without_compliance.append(question_id)
        print(f"❌ {question_id} - MISSING complianceAnswer")
    else:
        # Extract the complianceAnswer value
        compliance_match = re.search(r"complianceAnswer:\s*'([^']+)'", question_block)
        if compliance_match:
            print(f"✅ {question_id} - complianceAnswer: '{compliance_match.group(1)}'")
        else:
            print(f"⚠️  {question_id} - complianceAnswer present but couldn't extract value")

print()
print(f"Questions missing complianceAnswer: {len(questions_without_compliance)}")
if questions_without_compliance:
    print("Missing:", ', '.join(questions_without_compliance))