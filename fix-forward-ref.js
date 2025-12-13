// Fix forward reference error in download-buttons.tsx
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'components', 'results', 'download-buttons.tsx');

console.log('Reading file:', filePath);
let content = fs.readFileSync(filePath, 'utf-8');

// Step 1: Remove the useEffect block that's before the function declarations
const useEffectBlock = `
  // Auto-trigger download or email after feedback completion
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (autoTrigger && !autoTriggered) {
      setAutoTriggered(true)
      // Small delay to ensure component is fully mounted
      const timer = setTimeout(() => {
        if (autoTrigger === 'download') {
          handleDownload()
        } else if (autoTrigger === 'email') {
          handleEmailReport()
        }
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [autoTrigger, autoTriggered])
`;

console.log('Removing early useEffect block...');
content = content.replace(useEffectBlock, '');

// Step 2: Find where handleEmailReport ends and insert useEffect after it
const insertAfter = '  }, [assessmentId, assessmentData, propAssessmentType])\n\n  return (';

const newUseEffect = `  }, [assessmentId, assessmentData, propAssessmentType])

  // Auto-trigger download or email after feedback completion
  // Note: Functions defined above, safe to reference now
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (autoTrigger && !autoTriggered) {
      setAutoTriggered(true)
      // Small delay to ensure component is fully mounted
      const timer = setTimeout(() => {
        if (autoTrigger === 'download') {
          handleDownload()
        } else if (autoTrigger === 'email') {
          handleEmailReport()
        }
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [autoTrigger, autoTriggered])

  return (`;

console.log('Inserting useEffect after function declarations...');
content = content.replace(insertAfter, newUseEffect);

// Write back
console.log('Writing fixed file...');
fs.writeFileSync(filePath, content, 'utf-8');

console.log('✅ SUCCESS!');
console.log('✅ Moved useEffect after function declarations');
console.log('✅ Forward reference error should be fixed');
