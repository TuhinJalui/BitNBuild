import { TaxCalculation, FilingStatus, Deductions, TaxBracket, UserProfile, TaxSavings, SavingStrategy } from '../types';

// 2024 Tax Brackets
const TAX_BRACKETS_2024: Record<FilingStatus, TaxBracket[]> = {
  single: [
    { rate: 0.10, min: 0, max: 11000, taxOwed: 0, income: 0 },
    { rate: 0.12, min: 11000, max: 44725, taxOwed: 0, income: 0 },
    { rate: 0.22, min: 44725, max: 95375, taxOwed: 0, income: 0 },
    { rate: 0.24, min: 95375, max: 182050, taxOwed: 0, income: 0 },
    { rate: 0.32, min: 182050, max: 231250, taxOwed: 0, income: 0 },
    { rate: 0.35, min: 231250, max: 578125, taxOwed: 0, income: 0 },
    { rate: 0.37, min: 578125, max: Infinity, taxOwed: 0, income: 0 }
  ],
  marriedFilingJointly: [
    { rate: 0.10, min: 0, max: 22000, taxOwed: 0, income: 0 },
    { rate: 0.12, min: 22000, max: 89450, taxOwed: 0, income: 0 },
    { rate: 0.22, min: 89450, max: 190750, taxOwed: 0, income: 0 },
    { rate: 0.24, min: 190750, max: 364200, taxOwed: 0, income: 0 },
    { rate: 0.32, min: 364200, max: 462500, taxOwed: 0, income: 0 },
    { rate: 0.35, min: 462500, max: 693750, taxOwed: 0, income: 0 },
    { rate: 0.37, min: 693750, max: Infinity, taxOwed: 0, income: 0 }
  ],
  marriedFilingSeparately: [
    { rate: 0.10, min: 0, max: 11000, taxOwed: 0, income: 0 },
    { rate: 0.12, min: 11000, max: 44725, taxOwed: 0, income: 0 },
    { rate: 0.22, min: 44725, max: 95375, taxOwed: 0, income: 0 },
    { rate: 0.24, min: 95375, max: 182100, taxOwed: 0, income: 0 },
    { rate: 0.32, min: 182100, max: 231250, taxOwed: 0, income: 0 },
    { rate: 0.35, min: 231250, max: 346875, taxOwed: 0, income: 0 },
    { rate: 0.37, min: 346875, max: Infinity, taxOwed: 0, income: 0 }
  ],
  headOfHousehold: [
    { rate: 0.10, min: 0, max: 15700, taxOwed: 0, income: 0 },
    { rate: 0.12, min: 15700, max: 59850, taxOwed: 0, income: 0 },
    { rate: 0.22, min: 59850, max: 95350, taxOwed: 0, income: 0 },
    { rate: 0.24, min: 95350, max: 182050, taxOwed: 0, income: 0 },
    { rate: 0.32, min: 182050, max: 231250, taxOwed: 0, income: 0 },
    { rate: 0.35, min: 231250, max: 578100, taxOwed: 0, income: 0 },
    { rate: 0.37, min: 578100, max: Infinity, taxOwed: 0, income: 0 }
  ],
  qualifyingWidow: [
    { rate: 0.10, min: 0, max: 22000, taxOwed: 0, income: 0 },
    { rate: 0.12, min: 22000, max: 89450, taxOwed: 0, income: 0 },
    { rate: 0.22, min: 89450, max: 190750, taxOwed: 0, income: 0 },
    { rate: 0.24, min: 190750, max: 364200, taxOwed: 0, income: 0 },
    { rate: 0.32, min: 364200, max: 462500, taxOwed: 0, income: 0 },
    { rate: 0.35, min: 462500, max: 693750, taxOwed: 0, income: 0 },
    { rate: 0.37, min: 693750, max: Infinity, taxOwed: 0, income: 0 }
  ]
};

const STANDARD_DEDUCTIONS_2024: Record<FilingStatus, number> = {
  single: 14600,
  marriedFilingJointly: 29200,
  marriedFilingSeparately: 14600,
  headOfHousehold: 21900,
  qualifyingWidow: 29200
};

export class AdvancedTaxEngine {
  static calculateComprehensiveTax(
    income: number,
    filingStatus: FilingStatus,
    deductions: Partial<Deductions>,
    userProfile?: UserProfile
  ): TaxCalculation {
    const standardDeduction = STANDARD_DEDUCTIONS_2024[filingStatus];
    const itemizedTotal = this.calculateItemizedDeductions(deductions);
    const finalDeductions: Deductions = {
      standard: standardDeduction,
      itemized: itemizedTotal,
      mortgage: deductions.mortgage || 0,
      stateLocalTax: Math.min(deductions.stateLocalTax || 0, 10000), // SALT cap
      charitableContributions: deductions.charitableContributions || 0,
      medicalExpenses: this.calculateMedicalDeduction(deductions.medicalExpenses || 0, income),
      businessExpenses: deductions.businessExpenses || 0,
      educationExpenses: deductions.educationExpenses || 0,
      retirementContributions: deductions.retirementContributions || 0
    };

    const deductionToUse = Math.max(standardDeduction, itemizedTotal);
    const taxableIncome = Math.max(0, income - deductionToUse);
    
    const brackets = this.calculateTaxByBrackets(taxableIncome, filingStatus);
    const totalTax = brackets.reduce((sum, bracket) => sum + bracket.taxOwed, 0);
    
    // Apply credits
    const credits = this.calculateTaxCredits(income, filingStatus, userProfile);
    const finalTaxLiability = Math.max(0, totalTax - credits);
    
    const effectiveRate = income > 0 ? (finalTaxLiability / income) * 100 : 0;
    const marginalRate = this.getMarginalRate(taxableIncome, filingStatus) * 100;
    
    const recommendations = this.generateRecommendations(income, filingStatus, finalDeductions, userProfile);
    const savings = this.calculatePotentialSavings(income, filingStatus, finalDeductions, userProfile);

    return {
      income,
      filingStatus,
      deductions: finalDeductions,
      taxLiability: finalTaxLiability,
      effectiveRate,
      marginalRate,
      quarterlyPayments: finalTaxLiability / 4,
      breakdown: brackets,
      recommendations,
      savings
    };
  }

  private static calculateItemizedDeductions(deductions: Partial<Deductions>): number {
    const mortgage = deductions.mortgage || 0;
    const saltCapped = Math.min(deductions.stateLocalTax || 0, 10000);
    const charitable = deductions.charitableContributions || 0;
    const medical = deductions.medicalExpenses || 0;
    const business = deductions.businessExpenses || 0;
    const education = deductions.educationExpenses || 0;
    
    return mortgage + saltCapped + charitable + medical + business + education;
  }

  private static calculateMedicalDeduction(medicalExpenses: number, income: number): number {
    const threshold = income * 0.075; // 7.5% of AGI threshold
    return Math.max(0, medicalExpenses - threshold);
  }

  private static calculateTaxByBrackets(taxableIncome: number, filingStatus: FilingStatus): TaxBracket[] {
    const brackets = TAX_BRACKETS_2024[filingStatus];
    const result: TaxBracket[] = [];
    let remainingIncome = taxableIncome;

    for (const bracket of brackets) {
      if (remainingIncome <= 0) break;

      const bracketWidth = bracket.max - bracket.min;
      const incomeInBracket = Math.min(remainingIncome, bracketWidth);
      const taxOwed = incomeInBracket * bracket.rate;

      result.push({
        ...bracket,
        income: incomeInBracket,
        taxOwed
      });

      remainingIncome -= incomeInBracket;
    }

    return result;
  }

  private static getMarginalRate(taxableIncome: number, filingStatus: FilingStatus): number {
    const brackets = TAX_BRACKETS_2024[filingStatus];
    
    for (const bracket of brackets) {
      if (taxableIncome >= bracket.min && taxableIncome < bracket.max) {
        return bracket.rate;
      }
    }
    
    return brackets[brackets.length - 1].rate;
  }

  private static calculateTaxCredits(income: number, filingStatus: FilingStatus, userProfile?: UserProfile): number {
    let credits = 0;

    // Child Tax Credit (simplified)
    if (userProfile?.dependents) {
      const childTaxCredit = Math.min(userProfile.dependents * 2000, 2000 * userProfile.dependents);
      credits += childTaxCredit;
    }

    // Earned Income Tax Credit (simplified calculation)
    if (income < 50000 && userProfile?.dependents) {
      credits += Math.min(6000, income * 0.1);
    }

    // Education Credits
    if (userProfile?.hasStudentLoans && income < 80000) {
      credits += Math.min(2500, income * 0.02);
    }

    return credits;
  }

  private static generateRecommendations(
    income: number,
    filingStatus: FilingStatus,
    deductions: Deductions,
    userProfile?: UserProfile
  ): string[] {
    const recommendations: string[] = [];

    // Retirement contribution recommendations
    if (!userProfile?.contributesToRetirement && income > 30000) {
      recommendations.push("Consider maximizing 401(k) contributions to reduce taxable income");
    }

    // Itemization vs standard deduction
    if (deductions.itemized < deductions.standard * 0.8) {
      recommendations.push("You may benefit from the standard deduction over itemizing");
    }

    // HSA recommendations
    if (income > 40000) {
      recommendations.push("Consider contributing to an HSA for triple tax benefits");
    }

    // Charitable giving
    if (income > 75000 && deductions.charitableContributions < income * 0.02) {
      recommendations.push("Charitable contributions can provide tax deductions while supporting causes you care about");
    }

    // Business expense tracking
    if (userProfile?.hasBusinessIncome && deductions.businessExpenses < income * 0.1) {
      recommendations.push("Ensure you're tracking all legitimate business expenses for deductions");
    }

    return recommendations;
  }

  private static calculatePotentialSavings(
    income: number,
    filingStatus: FilingStatus,
    deductions: Deductions,
    userProfile?: UserProfile
  ): TaxSavings {
    const strategies: SavingStrategy[] = [];
    let totalSavings = 0;

    // 401(k) max contribution strategy
    if (income > 50000) {
      const maxContribution = 23000; // 2024 limit
      const currentContribution = deductions.retirementContributions;
      const additionalContribution = Math.min(maxContribution - currentContribution, income * 0.2);
      const marginalRate = this.getMarginalRate(income, filingStatus);
      const savings = additionalContribution * marginalRate;
      
      if (savings > 500) {
        strategies.push({
          strategy: "Maximize 401(k) contributions",
          savings,
          difficulty: "Easy",
          deadline: "December 31st"
        });
        totalSavings += savings;
      }
    }

    // HSA contribution strategy
    if (income > 30000) {
      const hsaLimit = filingStatus === 'marriedFilingJointly' ? 8300 : 4150;
      const marginalRate = this.getMarginalRate(income, filingStatus);
      const savings = hsaLimit * marginalRate;
      
      strategies.push({
        strategy: "Contribute to Health Savings Account",
        savings,
        difficulty: "Easy",
        deadline: "April 15th (following year)"
      });
      totalSavings += savings;
    }

    // Tax-loss harvesting for investments
    if (userProfile?.hasInvestmentIncome && income > 40000) {
      const estimatedSavings = income * 0.01; // Conservative estimate
      strategies.push({
        strategy: "Implement tax-loss harvesting strategy",
        savings: estimatedSavings,
        difficulty: "Medium",
        deadline: "December 31st"
      });
      totalSavings += estimatedSavings;
    }

    return {
      potentialSavings: totalSavings,
      strategies,
      timeline: "Current tax year"
    };
  }

  static analyzeDocumentForTaxInfo(content: string, fileName: string): any {
    const analysis = {
      documentType: this.identifyDocumentType(content, fileName),
      extractedData: {},
      confidence: 0
    };

    // W-2 Analysis
    if (analysis.documentType === 'w2') {
      analysis.extractedData = this.extractW2Data(content);
      analysis.confidence = 0.85;
    }
    
    // 1099 Analysis
    else if (analysis.documentType === '1099') {
      analysis.extractedData = this.extract1099Data(content);
      analysis.confidence = 0.80;
    }
    
    // Receipt Analysis
    else if (analysis.documentType === 'receipt') {
      analysis.extractedData = this.extractReceiptData(content);
      analysis.confidence = 0.70;
    }

    return analysis;
  }

  private static identifyDocumentType(content: string, fileName: string): string {
    const lowerContent = content.toLowerCase();
    const lowerFileName = fileName.toLowerCase();

    if (lowerContent.includes('w-2') || lowerContent.includes('wage and tax statement')) {
      return 'w2';
    }
    if (lowerContent.includes('1099') || lowerContent.includes('miscellaneous income')) {
      return '1099';
    }
    if (lowerContent.includes('1040') || lowerContent.includes('individual income tax return')) {
      return '1040';
    }
    if (lowerContent.includes('receipt') || lowerContent.includes('invoice')) {
      return 'receipt';
    }
    if (lowerContent.includes('bank statement') || lowerContent.includes('account summary')) {
      return 'bank_statement';
    }

    return 'other';
  }

  private static extractW2Data(content: string): any {
    const data: any = {};
    
    // Extract wages (Box 1)
    const wagesMatch = content.match(/wages.*?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i);
    if (wagesMatch) {
      data.wages = parseFloat(wagesMatch[1].replace(/,/g, ''));
    }

    // Extract federal tax withheld (Box 2)
    const federalTaxMatch = content.match(/federal.*?tax.*?withheld.*?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i);
    if (federalTaxMatch) {
      data.federalTaxWithheld = parseFloat(federalTaxMatch[1].replace(/,/g, ''));
    }

    // Extract employer name
    const employerMatch = content.match(/employer.*?([A-Za-z\s&.,]+)/i);
    if (employerMatch) {
      data.employer = employerMatch[1].trim();
    }

    return data;
  }

  private static extract1099Data(content: string): any {
    const data: any = {};
    
    // Extract miscellaneous income
    const incomeMatch = content.match(/(?:miscellaneous|other)\s+income.*?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i);
    if (incomeMatch) {
      data.miscellaneousIncome = parseFloat(incomeMatch[1].replace(/,/g, ''));
    }

    return data;
  }

  private static extractReceiptData(content: string): any {
    const data: any = {};
    
    // Extract total amount
    const totalMatch = content.match(/total.*?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i);
    if (totalMatch) {
      data.amount = parseFloat(totalMatch[1].replace(/,/g, ''));
    }

    // Extract date
    const dateMatch = content.match(/(\d{1,2}\/\d{1,2}\/\d{2,4})/);
    if (dateMatch) {
      data.date = dateMatch[1];
    }

    // Categorize expense
    data.category = this.categorizeExpense(content);

    return data;
  }

  private static categorizeExpense(content: string): string {
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('medical') || lowerContent.includes('pharmacy') || lowerContent.includes('doctor')) {
      return 'medical';
    }
    if (lowerContent.includes('charity') || lowerContent.includes('donation')) {
      return 'charitable';
    }
    if (lowerContent.includes('office') || lowerContent.includes('business')) {
      return 'business';
    }
    if (lowerContent.includes('education') || lowerContent.includes('tuition')) {
      return 'education';
    }
    
    return 'other';
  }
}