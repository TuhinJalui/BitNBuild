import { AIResponse, UserProfile, TaxCalculation, Message } from '../types';
import { AdvancedTaxEngine } from './advancedTaxEngine';

export class AITaxAdvisor {
  private static taxKnowledgeBase = {
    deductions: {
      standard: "The standard deduction for 2024 is $14,600 for single filers, $29,200 for married filing jointly, $21,900 for head of household, and $14,600 for married filing separately.",
      itemized: "Itemized deductions include mortgage interest, state and local taxes (capped at $10,000), charitable contributions, and medical expenses exceeding 7.5% of AGI.",
      business: "Business expenses must be ordinary and necessary for your trade or business. Keep detailed records and receipts.",
      medical: "Medical expenses are deductible only to the extent they exceed 7.5% of your adjusted gross income.",
      charitable: "Charitable contributions are generally deductible up to 60% of your AGI for cash donations to qualified organizations."
    },
    credits: {
      child: "The Child Tax Credit provides up to $2,000 per qualifying child under 17. Income limits apply.",
      education: "Education credits include the American Opportunity Credit (up to $2,500) and Lifetime Learning Credit (up to $2,000).",
      earned_income: "The Earned Income Tax Credit (EITC) is available for low to moderate-income workers, especially those with children."
    },
    retirement: {
      "401k": "401(k) contributions reduce your taxable income. The 2024 limit is $23,000, with an additional $7,500 catch-up contribution for those 50 and older.",
      ira: "Traditional IRA contributions may be deductible. Roth IRA contributions are made with after-tax dollars but grow tax-free.",
      hsa: "HSA contributions are triple tax-advantaged: deductible, grow tax-free, and withdrawals for medical expenses are tax-free."
    },
    deadlines: {
      filing: "The tax filing deadline is typically April 15th. Extensions are available but only extend the filing deadline, not payment deadline.",
      quarterly: "Quarterly estimated tax payments are due on January 15, April 15, June 15, and September 15.",
      retirement: "IRA contributions can be made until the tax filing deadline of the following year."
    }
  };

  static async generateResponse(
    userMessage: string,
    conversationHistory: Message[],
    userProfile?: UserProfile,
    uploadedFiles?: any[]
  ): Promise<AIResponse> {
    const normalizedMessage = userMessage.toLowerCase();
    
    // Analyze intent
    const intent = this.analyzeIntent(normalizedMessage);
    
    // Generate contextual response
    let response = await this.generateContextualResponse(
      normalizedMessage,
      intent,
      conversationHistory,
      userProfile,
      uploadedFiles
    );

    // Add calculations if relevant
    if (intent.includes('calculate') || intent.includes('tax') || intent.includes('income')) {
      response.calculations = this.generateSampleCalculation(userProfile);
    }

    // Generate follow-up questions
    response.followUpQuestions = this.generateFollowUpQuestions(intent, userProfile);

    // Add related topics
    response.relatedTopics = this.getRelatedTopics(intent);

    return response;
  }

  private static analyzeIntent(message: string): string[] {
    const intents: string[] = [];
    
    // Tax calculation intents
    if (message.match(/calculate|tax|owe|refund|liability/)) {
      intents.push('calculate');
    }
    
    // Deduction intents
    if (message.match(/deduct|write.?off|expense|itemize/)) {
      intents.push('deductions');
    }
    
    // Filing status intents
    if (message.match(/filing|status|married|single|head.?of.?household/)) {
      intents.push('filing_status');
    }
    
    // Deadline intents
    if (message.match(/deadline|due|when|file|extension/)) {
      intents.push('deadlines');
    }
    
    // Document intents
    if (message.match(/w.?2|1099|1040|form|document|upload/)) {
      intents.push('documents');
    }
    
    // Retirement intents
    if (message.match(/401k|ira|retirement|roth|hsa/)) {
      intents.push('retirement');
    }
    
    // Credits intents
    if (message.match(/credit|child|education|earned.?income/)) {
      intents.push('credits');
    }

    return intents.length > 0 ? intents : ['general'];
  }

  private static async generateContextualResponse(
    message: string,
    intents: string[],
    history: Message[],
    userProfile?: UserProfile,
    files?: any[]
  ): Promise<AIResponse> {
    let responseText = "";
    let confidence = 0.8;
    const sources: string[] = [];
    const recommendations: string[] = [];

    // Handle file-related queries
    if (files && files.length > 0) {
      responseText += this.generateFileAnalysisResponse(files);
      confidence = 0.9;
      sources.push("Uploaded document analysis");
    }

    // Handle specific intents
    for (const intent of intents) {
      switch (intent) {
        case 'calculate':
          responseText += this.generateCalculationResponse(userProfile);
          sources.push("IRS Tax Tables 2024");
          break;
          
        case 'deductions':
          responseText += this.generateDeductionResponse(message, userProfile);
          sources.push("IRS Publication 17");
          break;
          
        case 'filing_status':
          responseText += this.generateFilingStatusResponse(message);
          sources.push("IRS Filing Status Guidelines");
          break;
          
        case 'deadlines':
          responseText += this.generateDeadlineResponse();
          sources.push("IRS Tax Calendar 2024");
          break;
          
        case 'retirement':
          responseText += this.generateRetirementResponse(message);
          sources.push("IRS Publication 590");
          break;
          
        case 'credits':
          responseText += this.generateCreditsResponse(message, userProfile);
          sources.push("IRS Tax Credits Guide");
          break;
          
        default:
          responseText += this.generateGeneralResponse(message);
          sources.push("IRS General Tax Information");
      }
    }

    // Add personalized recommendations
    if (userProfile) {
      recommendations.push(...this.generatePersonalizedRecommendations(userProfile));
    }

    return {
      message: responseText || "I'd be happy to help you with your tax questions. Could you provide more specific details about what you'd like to know?",
      confidence,
      sources,
      followUpQuestions: [],
      recommendations,
      relatedTopics: []
    };
  }

  private static generateFileAnalysisResponse(files: any[]): string {
    let response = "I've analyzed your uploaded documents:\n\n";
    
    files.forEach((file, index) => {
      response += `📄 **${file.name}**\n`;
      
      if (file.extractedData) {
        const data = file.extractedData;
        
        if (file.documentType === 'w2') {
          response += `   • Wages: $${data.wages?.toLocaleString() || 'Not found'}\n`;
          response += `   • Federal Tax Withheld: $${data.federalTaxWithheld?.toLocaleString() || 'Not found'}\n`;
          response += `   • Employer: ${data.employer || 'Not found'}\n`;
        } else if (file.documentType === '1099') {
          response += `   • Miscellaneous Income: $${data.miscellaneousIncome?.toLocaleString() || 'Not found'}\n`;
        } else if (file.documentType === 'receipt') {
          response += `   • Amount: $${data.amount?.toLocaleString() || 'Not found'}\n`;
          response += `   • Category: ${data.category || 'Other'}\n`;
          response += `   • Date: ${data.date || 'Not found'}\n`;
        }
      }
      
      response += "\n";
    });

    response += "Based on these documents, I can help you with tax calculations and identify potential deductions. Would you like me to calculate your estimated tax liability?\n\n";
    
    return response;
  }

  private static generateCalculationResponse(userProfile?: UserProfile): string {
    return `I can help you calculate your tax liability. Here's what I need to provide an accurate calculation:

📊 **Required Information:**
• Annual income (W-2 wages, 1099 income, etc.)
• Filing status (Single, Married Filing Jointly, etc.)
• Number of dependents
• Deductible expenses (mortgage interest, charitable donations, etc.)

💡 **Quick Tax Facts for 2024:**
• Standard deduction ranges from $14,600 to $29,200 depending on filing status
• Tax rates range from 10% to 37% based on income brackets
• Many tax credits are available to reduce your tax liability

Would you like me to run a calculation with your specific information?\n\n`;
  }

  private static generateDeductionResponse(message: string, userProfile?: UserProfile): string {
    let response = "Here's information about tax deductions:\n\n";

    if (message.includes('standard')) {
      response += `📋 **Standard Deduction (2024):**
• Single: $14,600
• Married Filing Jointly: $29,200
• Head of Household: $21,900
• Married Filing Separately: $14,600\n\n`;
    }

    if (message.includes('itemized') || message.includes('itemize')) {
      response += `📝 **Common Itemized Deductions:**
• Mortgage interest (up to $750,000 in debt)
• State and local taxes (capped at $10,000)
• Charitable contributions
• Medical expenses (exceeding 7.5% of AGI)
• Business expenses\n\n`;
    }

    response += `💰 **Deduction Strategy:**
You should itemize only if your total itemized deductions exceed your standard deduction. I can help you calculate which option saves you more money.\n\n`;

    return response;
  }

  private static generateFilingStatusResponse(message: string): string {
    return `👥 **Filing Status Options:**

**Single:** Unmarried individuals or those legally separated

**Married Filing Jointly:** Generally provides the lowest tax for married couples

**Married Filing Separately:** May be beneficial if one spouse has high medical expenses or miscellaneous deductions

**Head of Household:** For unmarried individuals who pay more than half the cost of maintaining a home for a qualifying person

**Qualifying Widow(er):** For widowed individuals with dependent children (available for 2 years after spouse's death)

💡 **Tip:** Married couples should compare both joint and separate filing to determine which saves more money.\n\n`;
  }

  private static generateDeadlineResponse(): string {
    const currentYear = new Date().getFullYear();
    
    return `📅 **Important Tax Deadlines for ${currentYear}:**

**April 15, ${currentYear + 1}:** Tax return filing deadline
**April 15, ${currentYear + 1}:** Final payment deadline (even with extension)
**October 15, ${currentYear + 1}:** Extended filing deadline

**Quarterly Estimated Tax Payments:**
• Q1: January 15, ${currentYear + 1}
• Q2: April 15, ${currentYear + 1}
• Q3: June 17, ${currentYear + 1}
• Q4: September 16, ${currentYear + 1}

⚠️ **Important:** Extensions only extend the filing deadline, not the payment deadline. Pay what you owe by April 15th to avoid penalties.\n\n`;
  }

  private static generateRetirementResponse(message: string): string {
    return `🏦 **Retirement Account Tax Benefits:**

**401(k) Contributions (2024):**
• Contribution limit: $23,000
• Catch-up (50+): Additional $7,500
• Reduces current year taxable income

**IRA Contributions (2024):**
• Traditional IRA: Up to $7,000 (deductible if eligible)
• Roth IRA: Up to $7,000 (after-tax, tax-free growth)
• Catch-up (50+): Additional $1,000

**HSA (Health Savings Account):**
• Individual: $4,150
• Family: $8,300
• Triple tax advantage: deductible, tax-free growth, tax-free medical withdrawals

💡 **Strategy:** Maximize employer 401(k) match first, then consider IRA contributions based on your tax situation.\n\n`;
  }

  private static generateCreditsResponse(message: string, userProfile?: UserProfile): string {
    let response = "💳 **Available Tax Credits:**\n\n";

    response += `**Child Tax Credit:**
• Up to $2,000 per qualifying child under 17
• Income limits apply (phases out at higher incomes)

**American Opportunity Tax Credit:**
• Up to $2,500 for qualified education expenses
• Available for first 4 years of post-secondary education

**Earned Income Tax Credit (EITC):**
• For low to moderate-income workers
• Larger credit with qualifying children

**Child and Dependent Care Credit:**
• For expenses to care for children under 13 or disabled dependents
• Up to $3,000 for one child, $6,000 for two or more\n\n`;

    if (userProfile?.dependents) {
      response += `Based on your profile with ${userProfile.dependents} dependent(s), you may qualify for several of these credits.\n\n`;
    }

    return response;
  }

  private static generateGeneralResponse(message: string): string {
    return `I'm here to help with all your tax questions! I can assist you with:

🧮 **Tax Calculations:** Estimate your tax liability and refund
📄 **Document Analysis:** Review your W-2s, 1099s, and receipts
💰 **Deduction Optimization:** Find all eligible deductions
📅 **Tax Planning:** Year-round strategies to minimize taxes
📋 **Form Assistance:** Help with tax form completion

What specific tax topic would you like to explore?\n\n`;
  }

  private static generatePersonalizedRecommendations(userProfile: UserProfile): string[] {
    const recommendations: string[] = [];

    if (!userProfile.contributesToRetirement) {
      recommendations.push("Consider maximizing retirement contributions to reduce taxable income");
    }

    if (userProfile.hasBusinessIncome) {
      recommendations.push("Track all business expenses throughout the year for maximum deductions");
    }

    if (userProfile.dependents > 0) {
      recommendations.push("Explore education savings accounts (529 plans) for tax-advantaged college savings");
    }

    if (userProfile.hasStudentLoans) {
      recommendations.push("You may be eligible for student loan interest deduction up to $2,500");
    }

    return recommendations;
  }

  private static generateFollowUpQuestions(intents: string[], userProfile?: UserProfile): string[] {
    const questions: string[] = [];

    if (intents.includes('calculate')) {
      questions.push("What's your annual income?");
      questions.push("What's your filing status?");
      questions.push("Do you have any dependents?");
    }

    if (intents.includes('deductions')) {
      questions.push("Do you own a home with a mortgage?");
      questions.push("How much did you donate to charity this year?");
      questions.push("Do you have significant medical expenses?");
    }

    if (intents.includes('retirement')) {
      questions.push("Are you contributing to a 401(k) or IRA?");
      questions.push("What's your current contribution amount?");
    }

    return questions.slice(0, 3); // Limit to 3 questions
  }

  private static getRelatedTopics(intents: string[]): string[] {
    const topicMap: Record<string, string[]> = {
      calculate: ["Tax Planning", "Estimated Payments", "Withholding"],
      deductions: ["Itemizing vs Standard", "Business Expenses", "Charitable Giving"],
      retirement: ["401(k) Optimization", "IRA Conversions", "HSA Benefits"],
      credits: ["Child Tax Credit", "Education Credits", "EITC"],
      deadlines: ["Extensions", "Quarterly Payments", "Penalty Avoidance"]
    };

    const topics = new Set<string>();
    intents.forEach(intent => {
      if (topicMap[intent]) {
        topicMap[intent].forEach(topic => topics.add(topic));
      }
    });

    return Array.from(topics).slice(0, 4);
  }

  private static generateSampleCalculation(userProfile?: UserProfile): TaxCalculation | undefined {
    if (!userProfile) return undefined;

    // Generate a sample calculation based on user profile
    const sampleIncome = 75000;
    const sampleDeductions = {
      mortgage: userProfile.isFirstTimeHomeBuyer ? 12000 : 0,
      stateLocalTax: 8000,
      charitableContributions: 2000,
      medicalExpenses: 0,
      businessExpenses: userProfile.hasBusinessIncome ? 5000 : 0,
      educationExpenses: userProfile.hasStudentLoans ? 2500 : 0,
      retirementContributions: userProfile.contributesToRetirement ? 6000 : 0
    };

    return AdvancedTaxEngine.calculateComprehensiveTax(
      sampleIncome,
      userProfile.filingStatus,
      sampleDeductions,
      userProfile
    );
  }
}