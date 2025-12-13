#!/usr/bin/env python3
"""Fix the forward reference error by moving useEffect after function declarations"""

import re

file_path = r'C:\Users\amol.fadnis\compliancecheck\src\components\results\download-buttons.tsx'

# Read the file
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Find and remove the problematic useEffect block (around line 405-420)
# This is the auto-trigger useEffect that references handleDownload before it's declared
pattern = r'''  // Auto-trigger download or email after feedback completion
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect\(\(\) => \{
    if \(autoTrigger && !autoTriggered\) \{
      setAutoTriggered\(true\)
      // Small delay to ensure component is fully mounted
      const timer = setTimeout\(\(\) => \{
        if \(autoTrigger === 'download'\) \{
          handleDownload\(\)
        \} else if \(autoTrigger === 'email'\) \{
          handleEmailReport\(\)
        \}
      \}, 100\)
      return \(\) => clearTimeout\(timer\)
    \}
  \}, \[autoTrigger, autoTriggered\]\)

'''

# Remove this block
content_without_effect = re.sub(pattern, '', content, flags=re.MULTILINE)

# Find where to insert it back (after handleEmailReport definition)
# Look for the pattern that marks the end of handleEmailReport
insert_pattern = r'(\}, \[assessmentId, assessmentData, propAssessmentType\]\))\n\n(  return \()'

# The useEffect to insert (with proper indentation)
useEffect_block = '''
  // Auto-trigger download or email after feedback completion
  // Note: Functions defined above, called via setTimeout, safe to omit from deps
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

'''

# Insert the useEffect after handleEmailReport
content_fixed = re.sub(insert_pattern, r'\1\n' + useEffect_block + r'\n\2', content_without_effect)

# Write back
with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content_fixed)

print("✅ Fixed forward reference error!")
print("✅ Moved useEffect after function declarations")
print("✅ File updated:", file_path)
