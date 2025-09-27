export interface TaxTopic {
  id: string;
  title: string;
  description: string;
  keywords: string[];
  content: string;
}

export const TAX_KNOWLEDGE_BASE: TaxTopic[] = [
  {
    id: 'standard-deduction',
    title: 'Standard Deduction',
    description: 'Understanding the standard deduction for different filing statuses',
    keywords: ['standard deduction', 'deduction', 'filing status'],
    content: `The standard deduction is a fixed dollar amount that reduces your taxable income. For 2024:
    
    • Single: $14,600
    • Married Filing Jointly: $29,200
    • Married Filing Separately: $14,600
    • Head of Household: $21,900
    
    You can choose between the standard deduction or itemizing deductions, whichever is higher.`
  },
  {
    id: 'tax-brackets',
    title: 'Tax Brackets',
    description: 'How progressive tax brackets work',
    keywords: ['tax brackets', 'marginal rate', 'progressive tax'],
    content: `The US uses a progressive tax system with multiple brackets. You only pay the higher rate on income above each bracket threshold.
    
    2024 Tax Brackets (Single):
    • 10%: $0 - $11,000
    • 12%: $11,001 - $44,725
    • 22%: $44,726 - $95,375
    • 24%: $95,376 - $182,050
    • 32%: $182,051 - $231,250
    • 35%: $231,251 - $578,125
    • 37%: $578,126+`
  },
  {
    id: 'w2-form',
    title: 'W-2 Form',
    description: 'Understanding your W-2 wage and tax statement',
    keywords: ['w2', 'w-2', 'wages', 'withholding'],
    content: `Your W-2 shows your annual wages and tax withholdings. Key boxes:
    
    • Box 1: Wages, tips, other compensation
    • Box 2: Federal income tax withheld
    • Box 3: Social Security wages
    • Box 4: Social Security tax withheld
    • Box 5: Medicare wages and tips
    • Box 6: Medicare tax withheld
    
    You'll receive this from your employer by January 31st.`
  },
  {
    id: '1099-forms',
    title: '1099 Forms',
    description: 'Different types of 1099 forms and what they mean',
    keywords: ['1099', 'independent contractor', 'freelance', 'self-employed'],
    content: `1099 forms report various types of income:
    
    • 1099-NEC: Non-employee compensation (freelance work)
    • 1099-INT: Interest income
    • 1099-DIV: Dividend income
    • 1099-MISC: Miscellaneous income
    • 1099-R: Retirement distributions
    
    If you receive $600+ from a source, you should get a 1099.`
  },
  {
    id: 'deductions',
    title: 'Tax Deductions',
    description: 'Common tax deductions you can claim',
    keywords: ['deductions', 'itemized', 'business expenses'],
    content: `Common deductions include:
    
    • Mortgage interest
    • State and local taxes (SALT) - limited to $10,000
    • Charitable contributions
    • Medical expenses (over 7.5% of AGI)
    • Business expenses
    • Student loan interest
    • Retirement contributions
    
    Compare itemized vs. standard deduction to maximize savings.`
  },
  {
    id: 'credits',
    title: 'Tax Credits',
    description: 'Tax credits that directly reduce your tax bill',
    keywords: ['credits', 'child tax credit', 'earned income credit'],
    content: `Tax credits directly reduce your tax owed:
    
    • Child Tax Credit: Up to $2,000 per qualifying child
    • Earned Income Tax Credit: For lower-income workers
    • American Opportunity Credit: For education expenses
    • Lifetime Learning Credit: For continuing education
    • Child and Dependent Care Credit: For childcare expenses
    
    Credits are more valuable than deductions as they reduce tax dollar-for-dollar.`
  },
  {
    id: 'quarterly-payments',
    title: 'Quarterly Estimated Taxes',
    description: 'When and how to make quarterly tax payments',
    keywords: ['quarterly', 'estimated taxes', 'self-employed', '1040ES'],
    content: `You may need to make quarterly payments if:
    
    • You're self-employed
    • You have significant investment income
    • You don't have enough tax withheld from wages
    
    Due dates for 2024:
    • Q1: April 15, 2024
    • Q2: June 17, 2024
    • Q3: September 16, 2024
    • Q4: January 15, 2025
    
    Use Form 1040ES to calculate payments.`
  },
  {
    id: 'filing-status',
    title: 'Filing Status',
    description: 'Choosing the right filing status',
    keywords: ['filing status', 'single', 'married', 'head of household'],
    content: `Your filing status affects your tax rates and deductions:
    
    • Single: Unmarried with no dependents
    • Married Filing Jointly: Usually best for married couples
    • Married Filing Separately: Sometimes beneficial if one spouse has high medical expenses
    • Head of Household: Unmarried with qualifying dependents
    • Qualifying Widow(er): For recent widows/widowers with dependents
    
    Choose the status that gives you the lowest tax liability.`
  }
];

export const findRelevantTopics = (query: string): TaxTopic[] => {
  const queryLower = query.toLowerCase();
  
  return TAX_KNOWLEDGE_BASE.filter(topic => 
    topic.keywords.some(keyword => queryLower.includes(keyword.toLowerCase())) ||
    topic.title.toLowerCase().includes(queryLower) ||
    topic.description.toLowerCase().includes(queryLower)
  );
};

export const generateTaxResponse = (query: string, attachments?: any[]): string => {
  const queryLower = query.toLowerCase();
  
  // Handle file-related queries
  if (attachments && attachments.length > 0) {
    return generateFileBasedResponse(query, attachments);
  }
  
  // Handle calculation requests
  if (queryLower.includes('calculate') || queryLower.includes('estimate')) {
    return generateCalculationResponse(query);
  }
  
  // Handle specific tax topics
  const relevantTopics = findRelevantTopics(query);
  if (relevantTopics.length > 0) {
    return generateTopicResponse(relevantTopopics, query);
  }
  
  // Handle general questions
  if (queryLower.includes('deadline') || queryLower.includes('due date')) {
    return `Key tax deadlines for 2024:
    
    • Individual tax returns: April 15, 2025
    • Extension deadline: October 15, 2025
    • Quarterly payments: April 15, June 17, September 16, 2024, and January 15, 2025
    • Business returns (partnerships): March 15, 2025
    • Corporate returns: April 15, 2025
    
    Remember, an extension to file is not an extension to pay. You still need to pay estimated taxes by the original deadline.`;
  }
  
  if (queryLower.includes('refund')) {
    return `About tax refunds:
    
    • Most refunds are issued within 21 days of e-filing
    • Paper returns take 6-8 weeks to process
    • You can check your refund status on IRS.gov
    • Refunds may be delayed if there are errors or missing information
    • Consider adjusting your withholding if you get a large refund
    
    A large refund means you gave the government an interest-free loan. Consider adjusting your W-4 to have more money in your paycheck throughout the year.`;
  }
  
  // Default response with helpful suggestions
  return `I'd be happy to help with your tax question! I can assist with:
  
  • Tax calculations and estimates
  • Explaining tax forms and documents
  • Deduction and credit information
  • Filing requirements and deadlines
  • Document analysis and data extraction
  
  Could you please provide more specific details about what you'd like to know? You can also upload tax documents for analysis.`;
};

const generateFileBasedResponse = (query: string, attachments: any[]): string => {
  const fileTypes = attachments.map(att => att.name.split('.').pop()?.toLowerCase());
  
  let response = `I've analyzed your uploaded files. Here's what I found:\n\n`;
  
  attachments.forEach((attachment, index) => {
    response += `**${attachment.name}:**\n`;
    
    if (attachment.data) {
      response += `• File processed successfully\n`;
      response += `• Contains ${Array.isArray(attachment.data) ? attachment.data.length : 'structured'} data entries\n`;
    }
    
    if (attachment.content) {
      const extractedData = extractKeyTaxInfo(attachment.content);
      if (extractedData.length > 0) {
        response += `• Key information found: ${extractedData.join(', ')}\n`;
      }
    }
    
    response += '\n';
  });
  
  response += `Based on your files, I recommend:\n`;
  response += `• Double-check all amounts for accuracy\n`;
  response += `• Keep digital copies of all documents\n`;
  response += `• Consider consulting a tax professional for complex situations\n`;
  
  return response;
};

const generateCalculationResponse = (query: string): string => {
  return `I can help you with tax calculations! To provide accurate estimates, I'll need some information:

  • Your annual income
  • Filing status (single, married filing jointly, etc.)
  • Number of dependents
  • Estimated deductions
  
  You can also upload your tax documents (W-2, 1099s, etc.) and I'll extract the relevant information automatically.
  
  Would you like to provide this information so I can calculate your estimated taxes?`;
};

const generateTopicResponse = (topics: TaxTopic[], query: string): string => {
  if (topics.length === 1) {
    return topics[0].content;
  }
  
  let response = `Here's information about your tax question:\n\n`;
  
  topics.slice(0, 3).forEach(topic => {
    response += `**${topic.title}:**\n${topic.content}\n\n`;
  });
  
  if (topics.length > 3) {
    response += `I found ${topics.length - 3} more related topics. Would you like me to explain any specific area in more detail?`;
  }
  
  return response;
};

const extractKeyTaxInfo = (content: string): string[] => {
  const info: string[] = [];
  
  // Look for common tax-related patterns
  if (content.match(/\$[\d,]+\.?\d*/)) {
    info.push('monetary amounts');
  }
  
  if (content.match(/\d{2}-\d{7}|\d{3}-\d{2}-\d{4}/)) {
    info.push('tax ID numbers');
  }
  
  if (content.match(/wages|salary|income/i)) {
    info.push('income information');
  }
  
  if (content.match(/withholding|withheld/i)) {
    info.push('tax withholding');
  }
  
  if (content.match(/deduction|expense/i)) {
    info.push('deductions/expenses');
  }
  
  return info;
};