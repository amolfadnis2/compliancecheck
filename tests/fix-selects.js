const fs = require('fs');

// Read the file
let content = fs.readFileSync('labour-code-assessment.spec.ts', 'utf-8');

// Replace all .selectOption() calls
content = content.replace(
  /await page\.getByLabel\(\/employee count\/i\)\.selectOption\('([^']+)'\);/g,
  "await selectFromDropdown(page, /employee count/i, /$1/);"
);

content = content.replace(
  /await page\.getByLabel\(\/industry\/i\)\.selectOption\('([^']+)'\);/g,
  "await selectFromDropdown(page, /industry/i, /$1/i);"
);

content = content.replace(
  /await page\.getByLabel\(\/state\/i\)\.selectOption\('([^']+)'\);/g,
  "await selectFromDropdown(page, /state/i, /$1/i);"
);

// Write back
fs.writeFileSync('labour-code-assessment.spec.ts', content, 'utf-8');
console.log('✅ Fixed all selectOption calls in labour-code-assessment.spec.ts');

// Do the same for filtering file
content = fs.readFileSync('labour-code-filtering.spec.ts', 'utf-8');

content = content.replace(
  /await page\.getByLabel\(\/employee count\/i\)\.selectOption\('([^']+)'\);/g,
  "await selectFromDropdown(page, /employee count/i, /$1/);"
);

content = content.replace(
  /await page\.getByLabel\(\/industry\/i\)\.selectOption\('([^']+)'\);/g,
  "await selectFromDropdown(page, /industry/i, /$1/i);"
);

content = content.replace(
  /await page\.getByLabel\(\/state\/i\)\.selectOption\('([^']+)'\);/g,
  "await selectFromDropdown(page, /state/i, /$1/i);"
);

fs.writeFileSync('labour-code-filtering.spec.ts', content, 'utf-8');
console.log('✅ Fixed all selectOption calls in labour-code-filtering.spec.ts');
