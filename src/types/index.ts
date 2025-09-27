export interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  attachments?: FileAttachment[];
  calculations?: TaxCalculation;
  suggestions?: string[];
  confidence?: number;
}

export interface FileAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  extractedData?: any;
  processingStatus: 'pending' | 'processing' | 'completed' | 'error';
  documentType?: DocumentType;
}

export interface TaxCalculation {
  income: number;
  filingStatus: FilingStatus;
  deductions: Deductions;
  taxLiability: number;
  effectiveRate: number;
  marginalRate: number;
  refundAmount?: number;
  quarterlyPayments?: number;
  breakdown: TaxBracket[];
  recommendations: string[];
  savings?: TaxSavings;
}

export interface TaxBracket {
  rate: number;
  min: number;
  max: number;
  taxOwed: number;
  income: number;
}

export interface Deductions {
  standard: number;
  itemized: number;
  mortgage: number;
  stateLocalTax: number;
  charitableContributions: number;
  medicalExpenses: number;
  businessExpenses: number;
  educationExpenses: number;
  retirementContributions: number;
}

export interface TaxSavings {
  potentialSavings: number;
  strategies: SavingStrategy[];
  timeline: string;
}

export interface SavingStrategy {
  strategy: string;
  savings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  deadline?: string;
}

export type FilingStatus = 'single' | 'marriedFilingJointly' | 'marriedFilingSeparately' | 'headOfHousehold' | 'qualifyingWidow';

export type DocumentType = 'w2' | '1099' | '1040' | 'receipt' | 'bank_statement' | 'investment' | 'business' | 'other';

export interface UserProfile {
  age: number;
  filingStatus: FilingStatus;
  dependents: number;
  state: string;
  occupation: string;
  hasBusinessIncome: boolean;
  hasInvestmentIncome: boolean;
  hasRentalIncome: boolean;
  isFirstTimeHomeBuyer: boolean;
  hasStudentLoans: boolean;
  contributesToRetirement: boolean;
}

export interface TaxForm {
  formType: string;
  year: number;
  fields: Record<string, any>;
  status: 'draft' | 'completed' | 'filed';
}

export interface TaxDeadline {
  date: Date;
  description: string;
  type: 'filing' | 'payment' | 'quarterly' | 'extension';
  priority: 'high' | 'medium' | 'low';
}

export interface AIResponse {
  message: string;
  confidence: number;
  sources: string[];
  followUpQuestions: string[];
  calculations?: TaxCalculation;
  recommendations: string[];
  relatedTopics: string[];
}