# Building an Indian CTC to In-Hand Salary Calculator: Complete Technical Reference

India's new Labour Codes fundamentally restructure salary calculations, requiring **Basic + DA to equal at least 50% of total remuneration**. This change, combined with state-specific professional tax slabs and two parallel income tax regimes, creates complex calculations that your calculator must handle precisely. Below is every threshold, formula, and slab needed for implementation.

## The 50% wage rule transforms salary structures

The Code on Wages 2019 redefines "wages" to include only Basic Pay, Dearness Allowance (DA), and Retaining Allowance. The critical constraint: **excluded allowances (HRA, special allowances, bonuses) cannot exceed 50% of total remuneration**. If they do, the excess automatically reclassifies as "wages" for statutory benefit calculations.

**Components included in "wages" definition:**
- Basic Pay
- Dearness Allowance
- Retaining Allowance

**Components excluded (capped at 50% of total):**
- House Rent Allowance, overtime, bonuses, commissions, travel allowances, employer PF contributions, gratuity, retrenchment compensation

**Impact on take-home salary:** Higher basic means higher PF contributions (employer and employee) and higher gratuity provisioning, reducing monthly in-hand pay but increasing retirement corpus. For a ₹10 LPA CTC, the shift from 35% to 50% basic increases annual PF contribution from approximately ₹42,000 to ₹60,000.

## CTC component breakdown with exact percentages

| Component | Recommended % of CTC | Calculation Base | Notes |
|-----------|---------------------|------------------|-------|
| Basic Salary | **50% minimum** | CTC | Mandatory under new Labour Code |
| HRA | 20-25% | 40-50% of Basic | Metro: 50%, Non-metro: 40% |
| Special Allowance | Balancing figure | - | Fully taxable |
| Employer PF | ~6% | 12% of Basic | Split across EPF + EPS |
| Employer ESI | 1.625% | 3.25% of Gross | Only if gross ≤₹21,000 |
| Gratuity | ~2.4% | 4.81% of Basic | Monthly provision |

### Gratuity calculation formula
```
Gratuity Payout = (15 × Last Drawn Basic+DA × Years of Service) ÷ 26
Monthly Gratuity Provision = (Basic + DA) × 15 ÷ 26 ÷ 12 = 4.81%
```
Tax-free limit: **₹20 lakhs** (lifetime cap for private sector). Eligibility requires 5 years continuous service, but fixed-term employees need only 1 year under the new code.

## EPF contribution rules and thresholds

The **₹15,000 wage ceiling** determines mandatory coverage and EPS caps. Employees earning Basic+DA above this threshold can voluntarily contribute on actual salary with employer consent.

| Component | Employee Rate | Employer Rate | Ceiling |
|-----------|--------------|---------------|---------|
| Total PF | 12% | 12% | Basic+DA |
| EPF Account | 12% (full) | 3.67% | No cap |
| EPS (Pension) | - | 8.33% | ₹15,000 (max ₹1,250/month) |
| EDLI (Insurance) | - | 0.5% | ₹15,000 (max ₹75/month) |

**Employer admin charges:** 0.5% of wages (minimum ₹500/month per establishment)

**Calculation example (Basic+DA = ₹20,000):**
- Employee EPF: ₹20,000 × 12% = **₹2,400**
- Employer EPS: ₹15,000 × 8.33% = **₹1,250** (capped)
- Employer EPF: (₹20,000 × 12%) − ₹1,250 = **₹1,150**
- Total monthly EPF accumulation: ₹2,400 + ₹1,150 = **₹3,550**

**Applicability:** Establishments with 20+ employees (mandatory); below 20 can register voluntarily.

## ESI contribution rules

| Parameter | Rate/Threshold |
|-----------|---------------|
| Employee contribution | **0.75%** of gross wages |
| Employer contribution | **3.25%** of gross wages |
| Wage ceiling (regular) | **₹21,000/month** |
| Wage ceiling (disabled) | **₹25,000/month** |
| Establishment threshold | 10+ employees |

**ESI wage components include:** Basic, DA, HRA, City Compensatory Allowance, medical allowance, special allowance, overtime, commission.

**Excluded from ESI:** Conveyance allowance (per Supreme Court 2021 ruling), annual bonus, leave encashment, gratuity, PF contributions.

**Important:** If an employee's wage crosses ₹21,000 during a contribution period, ESI continues until that period ends.

## Income tax slabs for FY 2024-25 (AY 2025-26)

### New Tax Regime (default)

| Income Slab | Tax Rate |
|-------------|----------|
| Up to ₹3,00,000 | Nil |
| ₹3,00,001 – ₹7,00,000 | 5% |
| ₹7,00,001 – ₹10,00,000 | 10% |
| ₹10,00,001 – ₹12,00,000 | 15% |
| ₹12,00,001 – ₹15,00,000 | 20% |
| Above ₹15,00,000 | 30% |

**Standard deduction:** ₹75,000 (increased from ₹50,000 in Budget 2024)

**Section 87A rebate:** Full tax rebate if taxable income ≤ **₹7,00,000** (maximum rebate ₹25,000). Effective zero-tax threshold for salaried individuals: **₹7,75,000 gross** (₹7L + ₹75K standard deduction).

**Deductions available:** Standard deduction (₹75,000), employer NPS contribution under 80CCD(2) up to 14% of salary, Agniveer corpus fund under 80CCH.

**Deductions NOT available:** 80C investments, 80D health insurance, HRA exemption, LTA, home loan interest for self-occupied property.

### Old Tax Regime

| Income Slab (Below 60 years) | Tax Rate |
|------------------------------|----------|
| Up to ₹2,50,000 | Nil |
| ₹2,50,001 – ₹5,00,000 | 5% |
| ₹5,00,001 – ₹10,00,000 | 20% |
| Above ₹10,00,000 | 30% |

**Senior citizens (60-80):** Basic exemption ₹3,00,000
**Super senior citizens (80+):** Basic exemption ₹5,00,000

**Standard deduction:** ₹50,000
**Section 87A rebate:** Full rebate if income ≤ ₹5,00,000 (maximum ₹12,500)

### Major deductions in Old Regime

| Section | Deduction | Limit |
|---------|-----------|-------|
| 80C/80CCC/80CCD(1) | PPF, ELSS, LIC, EPF, NSC, tuition fees | ₹1,50,000 combined |
| 80CCD(1B) | Additional NPS | ₹50,000 |
| 80CCD(2) | Employer NPS | 14% of salary (govt) / 10% (others) |
| 80D | Health insurance (self/family below 60) | ₹25,000 |
| 80D | Health insurance (parents below 60) | ₹25,000 additional |
| 80D | If senior citizens covered | ₹50,000 each category |
| 80TTA | Savings account interest | ₹10,000 |
| 80TTB | All deposit interest (seniors only) | ₹50,000 |
| 80E | Education loan interest | No limit |
| 24(b) | Home loan interest (self-occupied) | ₹2,00,000 |

### Surcharge rates

| Income Range | Old Regime | New Regime |
|--------------|------------|------------|
| Up to ₹50 lakh | Nil | Nil |
| ₹50L – ₹1 crore | 10% | 10% |
| ₹1Cr – ₹2 crore | 15% | 15% |
| ₹2Cr – ₹5 crore | 25% | **25% (capped)** |
| Above ₹5 crore | **37%** | **25% (capped)** |

**Health & Education Cess:** 4% on (Tax + Surcharge) — applies to both regimes.

## HRA exemption calculation (Old Regime only)

**HRA exempt amount = MINIMUM of:**
1. Actual HRA received
2. 50% of (Basic + DA) for **metros** (Delhi, Mumbai, Kolkata, Chennai) OR 40% for **non-metros**
3. Rent paid − 10% of (Basic + DA)

**Example:** Basic ₹50,000, HRA ₹20,000, Rent ₹18,000, Mumbai (metro)
- Condition 1: ₹20,000
- Condition 2: ₹25,000 (50% × ₹50,000)
- Condition 3: ₹13,000 (₹18,000 − ₹5,000)
- **Exempt HRA: ₹13,000** | Taxable HRA: ₹7,000

**Note:** Bengaluru, Hyderabad, and Pune are classified as non-metro (40% rule applies).

## Professional tax slabs by state

### States with highest PT collections

| State | Exemption Threshold | Standard Monthly PT | Maximum Annual PT | Special Rules |
|-------|--------------------|--------------------|-------------------|---------------|
| **Maharashtra (Male)** | ≤₹7,500 | ₹175-200 | ₹2,500 | ₹300 in February |
| **Maharashtra (Female)** | ≤₹25,000 | ₹200 | ₹2,500 | ₹300 in February |
| **Karnataka** | ≤₹24,999 | ₹200 | ₹2,500 | ₹300 in February |
| **West Bengal** | ≤₹10,000 | ₹110-200 | ₹2,400 | Progressive slabs |
| **Andhra Pradesh** | ≤₹15,000 | ₹150-200 | ₹2,400 | — |
| **Telangana** | ≤₹15,000 | ₹150-200 | ₹2,400 | — |
| **Gujarat** | ≤₹12,000 | ₹200 | ₹2,400 | — |
| **Tamil Nadu** | ≤₹21,000 | ~₹30-208 | ₹2,500 | Half-yearly collection |
| **Kerala** | ≤₹11,999 (half-yearly) | ₹20-208 | ₹2,500 | Half-yearly collection |

### Detailed state-wise PT slabs

**Maharashtra:**
| Monthly Salary | Male PT | Female PT |
|----------------|---------|-----------|
| Up to ₹7,500 | Nil | Nil |
| ₹7,501 – ₹10,000 | ₹175 | Nil |
| ₹10,001 – ₹25,000 | ₹200 | Nil |
| Above ₹25,000 | ₹200 (₹300 Feb) | ₹200 (₹300 Feb) |

**West Bengal:**
| Monthly Salary | PT Amount |
|----------------|-----------|
| Up to ₹10,000 | Nil |
| ₹10,001 – ₹15,000 | ₹110 |
| ₹15,001 – ₹25,000 | ₹130 |
| ₹25,001 – ₹40,000 | ₹150 |
| Above ₹40,000 | ₹200 |

**Madhya Pradesh:**
| Monthly Salary | PT Amount |
|----------------|-----------|
| Up to ₹18,750 | Nil |
| ₹18,751 – ₹25,000 | ₹125 |
| ₹25,001 – ₹33,333 | ₹166 (₹174 last month) |
| Above ₹33,333 | ₹208 (₹212 last month) |

**Odisha:**
| Annual Salary | Monthly PT |
|---------------|------------|
| Up to ₹1,59,999 | Nil |
| ₹1,60,000 – ₹3,00,000 | ₹125 |
| Above ₹3,00,000 | ₹200 (₹300 last month) |

**Punjab:**
| Monthly Salary | PT Amount |
|----------------|-----------|
| Up to ₹7,500 | Nil |
| ₹7,501 – ₹10,000 | ₹175 |
| Above ₹10,000 | ₹200 |

**Assam:**
| Monthly Salary | PT Amount |
|----------------|-----------|
| Up to ₹10,000 | Nil |
| ₹10,001 – ₹15,000 | ₹150 |
| ₹15,001 – ₹24,999 | ₹180 |
| Above ₹25,000 | ₹208 |

**Jharkhand:**
| Annual Salary | Monthly PT |
|---------------|------------|
| Up to ₹3,00,000 | Nil |
| ₹3,00,001 – ₹5,00,000 | ₹100 |
| ₹5,00,001 – ₹8,00,000 | ₹150 |
| ₹8,00,001 – ₹10,00,000 | ₹175 |
| Above ₹10,00,000 | ₹208 |

**Bihar:**
| Annual Salary | Annual PT |
|---------------|-----------|
| Up to ₹3,00,000 | Nil |
| ₹3,00,001 – ₹5,00,000 | ₹1,000 |
| ₹5,00,001 – ₹10,00,000 | ₹2,000 |
| Above ₹10,00,000 | ₹2,500 |

**Chhattisgarh:**
| Annual Salary | Monthly PT |
|---------------|------------|
| Up to ₹1,00,000 | Nil |
| ₹1,00,001 – ₹1,50,000 | ₹130 |
| ₹1,50,001 – ₹2,00,000 | ₹150 |
| ₹2,00,001 – ₹2,50,000 | ₹200 |
| Above ₹2,50,000 | ₹208 (₹212 last month) |

**Meghalaya:**
| Monthly Salary | PT Amount |
|----------------|-----------|
| Up to ₹4,166 | Nil |
| ₹4,167 – ₹6,250 | ₹16.50 |
| ₹6,251 – ₹8,333 | ₹25 |
| ₹8,334 – ₹12,500 | ₹41.50 |
| ₹12,501 – ₹20,833 | ₹62.50-83.33 |
| ₹20,834 – ₹41,666 | ₹104-200 |
| Above ₹41,667 | ₹208 |

**Tripura:**
| Monthly Salary | PT Amount |
|----------------|-----------|
| Up to ₹7,500 | Nil |
| ₹7,501 – ₹15,000 | ₹150 |
| Above ₹15,000 | ₹208 |

**Sikkim:**
| Monthly Salary | PT Amount |
|----------------|-----------|
| Up to ₹20,000 | Nil |
| ₹20,001 – ₹30,000 | ₹125 |
| ₹30,001 – ₹40,000 | ₹150 |
| Above ₹40,000 | ₹200 |

### States and UTs without Professional Tax

**No PT levied:** Delhi, Uttar Pradesh, Haryana, Rajasthan, Himachal Pradesh, Uttarakhand, Arunachal Pradesh, Goa, Jammu & Kashmir, Ladakh, Chandigarh, Andaman & Nicobar Islands, Dadra & Nagar Haveli, Daman & Diu, Lakshadweep.

**Note:** Puducherry is the only Union Territory that levies PT.

## Calculator formulas for implementation

### Basic salary derivation from CTC
```
Basic = CTC × 0.50 (minimum under new Labour Code)
```

### Monthly in-hand calculation
```
Gross Salary = Basic + HRA + Special Allowance + Other Allowances

CTC = Gross Salary + Employer PF + Employer ESI + Gratuity + Other Benefits

Take-Home = Gross Salary 
           − Employee PF (Basic × 12%)
           − Employee ESI (Gross × 0.75%, if applicable)
           − Professional Tax (state-specific)
           − TDS (Income Tax)
```

### EPF calculation
```javascript
// Employee
employeePF = (basic + DA) * 0.12;

// Employer breakdown
epsWage = Math.min(basic + DA, 15000);
employerEPS = epsWage * 0.0833;  // Max ₹1,250
employerEPF = (basic + DA) * 0.12 - employerEPS;
employerEDLI = epsWage * 0.005;  // Max ₹75
```

### ESI calculation (only if gross ≤ ₹21,000)
```javascript
employeeESI = grossWages * 0.0075;
employerESI = grossWages * 0.0325;
```

### HRA exemption (Old Regime)
```javascript
const hraExempt = Math.min(
  actualHRA,
  (basic + DA) * (isMetro ? 0.50 : 0.40),
  rentPaid - (basic + DA) * 0.10
);
const taxableHRA = actualHRA - hraExempt;
```

### Taxable income calculation
```javascript
// New Regime
taxableIncome = grossSalary 
              - 75000  // Standard deduction
              - employerNPSContribution;  // 80CCD(2)

// Old Regime  
taxableIncome = grossSalary
              - 50000  // Standard deduction
              - hraExempt
              - ltaExempt
              - section80C  // Max ₹1,50,000
              - section80D  // Health insurance
              - section80CCD1B  // Additional NPS ₹50,000
              - homeLoanInterest  // Max ₹2,00,000
              - otherDeductions;
```

## Conclusion

Your calculator must handle three interconnected systems: the **50% wage rule** restructuring CTC components, **dual tax regime** comparison, and **19 state-specific PT slabs**. The critical implementation decisions are: (1) default Basic to 50% of CTC for Labour Code compliance, (2) implement the three-condition HRA exemption test for Old Regime calculations, (3) apply the ₹15,000 EPS cap while calculating employer PF split, and (4) build a state selector that handles Maharashtra's gender-based slabs and the February adjustment rule used by multiple states. Professional tax is deductible under Section 16 in the Old Regime, creating a feedback loop between PT and taxable income that requires iterative calculation in edge cases.