import re

# Read the file
with open('labour-code-assessment.spec.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace all .selectOption() calls with dropdown helper
# Pattern 1: Employee count
content = re.sub(
    r"await page\.getByLabel\(/employee count/i\)\.selectOption\('([^']+)'\);",
    r"await selectFromDropdown(page, /employee count/i, /\1/);",
    content
)

# Pattern 2: Industry
content = re.sub(
    r"await page\.getByLabel\(/industry/i\)\.selectOption\('([^']+)'\);",
    r"await selectFromDropdown(page, /industry/i, /\1/i);",
    content
)

# Pattern 3: State
content = re.sub(
    r"await page\.getByLabel\(/state/i\)\.selectOption\('([^']+)'\);",
    r"await selectFromDropdown(page, /state/i, /\1/i);",
    content
)

# Write back
with open('labour-code-assessment.spec.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed all selectOption calls in labour-code-assessment.spec.ts")
