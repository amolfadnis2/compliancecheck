# ComplianceCheck Style Guide

## Project Overview
ComplianceCheck is an Indian compliance SaaS platform built with Next.js 14, TypeScript, Supabase, and Tailwind CSS. Code reviews should prioritize type safety, accessibility, and Indian regulatory accuracy.

## TypeScript Standards

### Type Safety
- Use strict TypeScript with no `any` types unless absolutely necessary
- Define explicit interfaces for all API responses and form data
- Use discriminated unions for assessment question types
- Prefer `unknown` over `any` when type is genuinely unknown

### Naming Conventions
- Components: PascalCase (e.g., `AssessmentCard`, `ComplianceScore`)
- Hooks: camelCase with `use` prefix (e.g., `useAssessment`, `useComplianceScore`)
- Utilities: camelCase (e.g., `calculateScore`, `formatCurrency`)
- Types/Interfaces: PascalCase with descriptive names (e.g., `AssessmentResponse`, `CompanyProfile`)
- Constants: SCREAMING_SNAKE_CASE (e.g., `MAX_EMPLOYEES`, `PENALTY_RATES`)

## React/Next.js Patterns

### Component Structure
- Use functional components exclusively
- Keep components under 200 lines; extract logic to custom hooks
- Co-locate component-specific types in the same file
- Use `'use client'` directive only when necessary (interactivity, hooks)

### State Management
- Prefer React Query/SWR for server state
- Use React Context sparingly; prefer prop drilling for 1-2 levels
- Keep form state close to the form component


### Error Handling
- Wrap async operations in try-catch blocks
- Display user-friendly error messages in Hindi/English
- Log errors with context for debugging
- Use error boundaries for component-level failures

## Supabase Patterns

### Database Queries
- Use parameterized queries; never concatenate user input
- Handle null/undefined explicitly in query results
- Use RLS (Row Level Security) for all user data access
- Prefer `.single()` when expecting one result

### Authentication
- Check session state before protected operations
- Handle token refresh gracefully
- Clear sensitive data on logout

## Tailwind CSS Guidelines

### Class Organization
- Order: positioning, display, sizing, spacing, typography, colors, effects
- Use semantic color classes (e.g., `text-primary`, `bg-success`)
- Prefer utility classes over custom CSS
- Use `@apply` sparingly in component-scoped styles only

### Responsive Design
- Mobile-first approach with `sm:`, `md:`, `lg:` breakpoints
- Test all assessment flows on mobile viewport
- Ensure touch targets are minimum 44x44px

## Accessibility Requirements (Critical for Compliance SaaS)

- All form inputs must have associated labels
- Use semantic HTML (`<main>`, `<nav>`, `<section>`, `<article>`)
- Provide ARIA labels for icon-only buttons
- Ensure color contrast ratio meets WCAG 2.1 AA (4.5:1 minimum)
- Support keyboard navigation for all interactive elements
- Assessment progress must be announced to screen readers

## PDF Generation (jsPDF)

- Use consistent fonts: Helvetica for body, Helvetica-Bold for headers
- Include page numbers on multi-page reports
- Add legal disclaimer footer on all compliance reports
- Ensure government reference links are clickable
- Test PDF rendering across browsers before deployment

## Testing Standards (Playwright)

### Test Structure
- One assertion per test where practical
- Use descriptive test names: `should show error when PAN is invalid`
- Group related tests with `describe` blocks
- Use data-testid attributes for stable selectors

### Assessment Testing
- Test complete user flows end-to-end
- Verify PDF downloads contain correct data
- Test edge cases for compliance scoring algorithms
- Validate Indian-specific inputs (PAN, GSTIN, Aadhaar patterns)

## Security Considerations

- Never log sensitive data (PAN, Aadhaar, financial details)
- Validate all user inputs server-side
- Sanitize HTML in user-generated content
- Use HTTPS for all external API calls
- Follow DPDP Act 2023 requirements for data handling

## Indian Compliance Domain Rules

- All monetary values must use INR (₹) formatting
- Dates should support DD/MM/YYYY format (Indian standard)
- Employee thresholds must match Labour Code definitions exactly
- Penalty calculations must cite relevant Act sections
- State-specific rules must be clearly indicated

## Code Review Focus Areas

Reviewers should especially check for:
1. Type safety violations
2. Accessibility issues
3. Security vulnerabilities in user input handling
4. Accuracy of compliance calculations and thresholds
5. Mobile responsiveness of assessment flows
6. Error handling in Supabase operations
