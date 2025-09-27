import { TaxCalculation, TaxBracket, UserProfile } from '../types';

// 2024 Tax Brackets (Single)
const TAX_BRACKETS_2024_SINGLE: TaxBracket[] = [
  { rate: 0.10, min: 0, max: 11000, tax: 0 },
  { rate: 0.12, min: 11000, max: 44725, tax: 0 },
  { rate: 0.22, min: 44725, max: 95375, tax: 0 },
  { rate: 0.24, min: 95375, max: 182050, tax: 0 },
  { rate: 0.32, min: 182050, max: 231250, tax: 0 },
  { rate: 0.35, min: 231250, max: 578125, tax: 0 },
  { rate: 0.37, min: 578125, max: Infinity, tax: 0 },
];

// 2024 Tax Brackets (Married Filing Jointly)
const TAX_BRACKETS_2024_MARRIED: TaxBracket[] = [
  { rate: 0.10, min: 0, max: 22000, tax: 0 },
  { rate: 0.12, min: 22000, max: 89450, tax: 0 },
  { rate: 0.22, min: 89450, max: 190750, tax: 0 },
  { rate: 0.24, min: 190750, max: 364200, tax: 0 },
  { rate: 0.32, min: 364200, max: 462500, tax: 0 },
  { rate: 0.35, min: 462500, max: 693750, tax: 0 },
  { rate: 0.37, min: 693750, max: Infinity, tax: 0 },
];

// Standard Deductions for 2024
const STANDARD_DEDUCTIONS_2024 = {
  single: 14600,
  married_joint: 29200,
  married_separate: 14600,
  head_of_household: 21900,
};

export const calculateTax = (
  income: number,
  deductions: number = 0,
  profile: UserProfile
): TaxCalculation => {
  const brackets = profile.filingStatus === 'married_joint' 
    ? TAX_BRACKETS_2024_MARRIED 
    : TAX_BRACKETS_2024_SINGLE;

  const standardDeduction = STANDARD_DEDUCTIONS_2024[profile.filingStatus];
  const totalDeductions = Math.max(deductions, standardDeduction);
  const taxableIncome = Math.max(0, income - totalDeductions);

  let totalTax = 0;
  const bracketBreakdown: TaxBracket[] = [];

  for (const bracket of brackets) {
    if (taxableIncome <= bracket.min) break;

    const taxableAtThisBracket = Math.min(taxableIncome, bracket.max) - bracket.min;
    const taxAtThisBracket = taxableAtThisBracket * bracket.rate;
    
    totalTax += taxAtThisBracket;
    
    bracketBreakdown.push({
      ...bracket,
      tax: taxAtThisBracket,
    });
  }

  const effectiveRate = income > 0 ? (totalTax / income) * 100 : 0;
  const marginalRate = getMarginalRate(taxableIncome, brackets) * 100;

  return {
    income,
    deductions: totalDeductions,
    taxableIncome,
    estimatedTax: totalTax,
    effectiveRate,
    marginalRate,
    breakdown: bracketBreakdown,
  };
};

const getMarginalRate = (taxableIncome: number, brackets: TaxBracket[]): number => {
  for (const bracket of brackets) {
    if (taxableIncome <= bracket.max) {
      return bracket.rate;
    }
  }
  return brackets[brackets.length - 1].rate;
};

export const estimateQuarterlyPayments = (annualTax: number): number => {
  return Math.ceil(annualTax / 4);
};

export const calculateRefund = (taxOwed: number, taxWithheld: number): number => {
  return taxWithheld - taxOwed;
};

export const getDeductionSuggestions = (income: number, profile: UserProfile): string[] => {
  const suggestions: string[] = [];

  if (income > 50000) {
    suggestions.push("Consider maximizing your 401(k) contributions");
    suggestions.push("Look into HSA contributions if available");
  }

  if (profile.dependents > 0) {
    suggestions.push("Claim Child Tax Credit for eligible dependents");
    suggestions.push("Consider dependent care FSA if applicable");
  }

  suggestions.push("Keep track of charitable donations");
  suggestions.push("Document business expenses if self-employed");
  suggestions.push("Consider state and local tax deductions");

  return suggestions;
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatPercentage = (rate: number): string => {
  return `${rate.toFixed(2)}%`;
};