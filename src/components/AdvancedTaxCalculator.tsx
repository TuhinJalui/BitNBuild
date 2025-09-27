import React, { useState, useEffect } from 'react';
import { Calculator, TrendingUp, DollarSign, PieChart, Settings, Download } from 'lucide-react';
import { FilingStatus, TaxCalculation, UserProfile, Deductions } from '../types';
import { AdvancedTaxEngine } from '../utils/advancedTaxEngine';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface AdvancedTaxCalculatorProps {
  onCalculationComplete: (calculation: TaxCalculation) => void;
  userProfile?: UserProfile;
}

export const AdvancedTaxCalculator: React.FC<AdvancedTaxCalculatorProps> = ({
  onCalculationComplete,
  userProfile
}) => {
  const [income, setIncome] = useState<number>(75000);
  const [filingStatus, setFilingStatus] = useState<FilingStatus>('single');
  const [deductions, setDeductions] = useState<Partial<Deductions>>({
    mortgage: 0,
    stateLocalTax: 0,
    charitableContributions: 0,
    medicalExpenses: 0,
    businessExpenses: 0,
    educationExpenses: 0,
    retirementContributions: 0
  });
  const [calculation, setCalculation] = useState<TaxCalculation | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setFilingStatus(userProfile.filingStatus);
      if (userProfile.contributesToRetirement) {
        setDeductions(prev => ({ ...prev, retirementContributions: 6000 }));
      }
    }
  }, [userProfile]);

  const handleCalculate = async () => {
    setIsCalculating(true);
    
    // Simulate calculation delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      const result = AdvancedTaxEngine.calculateComprehensiveTax(
        income,
        filingStatus,
        deductions,
        userProfile
      );
      
      setCalculation(result);
      onCalculationComplete(result);
      toast.success('Tax calculation completed!');
    } catch (error) {
      toast.error('Error calculating taxes');
      console.error('Calculation error:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (rate: number): string => {
    return `${rate.toFixed(2)}%`;
  };

  const exportCalculation = () => {
    if (!calculation) return;
    
    const data = {
      calculation,
      timestamp: new Date().toISOString(),
      inputs: { income, filingStatus, deductions }
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tax-calculation-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Calculation exported successfully!');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Calculator className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Advanced Tax Calculator
          </h2>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            title="Advanced Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
          {calculation && (
            <button
              onClick={exportCalculation}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              title="Export Calculation"
            >
              <Download className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Basic Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Annual Income
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="number"
              value={income}
              onChange={(e) => setIncome(Number(e.target.value))}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="75000"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Filing Status
          </label>
          <select
            value={filingStatus}
            onChange={(e) => setFilingStatus(e.target.value as FilingStatus)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="single">Single</option>
            <option value="marriedFilingJointly">Married Filing Jointly</option>
            <option value="marriedFilingSeparately">Married Filing Separately</option>
            <option value="headOfHousehold">Head of Household</option>
            <option value="qualifyingWidow">Qualifying Widow(er)</option>
          </select>
        </div>
      </div>

      {/* Advanced Deductions */}
      {showAdvanced && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Itemized Deductions
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Mortgage Interest
              </label>
              <input
                type="number"
                value={deductions.mortgage || 0}
                onChange={(e) => setDeductions(prev => ({ ...prev, mortgage: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                State & Local Taxes
              </label>
              <input
                type="number"
                value={deductions.stateLocalTax || 0}
                onChange={(e) => setDeductions(prev => ({ ...prev, stateLocalTax: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="0"
              />
              <p className="text-xs text-gray-500 mt-1">Capped at $10,000</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Charitable Contributions
              </label>
              <input
                type="number"
                value={deductions.charitableContributions || 0}
                onChange={(e) => setDeductions(prev => ({ ...prev, charitableContributions: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Medical Expenses
              </label>
              <input
                type="number"
                value={deductions.medicalExpenses || 0}
                onChange={(e) => setDeductions(prev => ({ ...prev, medicalExpenses: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="0"
              />
              <p className="text-xs text-gray-500 mt-1">Only amount over 7.5% of AGI</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Business Expenses
              </label>
              <input
                type="number"
                value={deductions.businessExpenses || 0}
                onChange={(e) => setDeductions(prev => ({ ...prev, businessExpenses: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Retirement Contributions
              </label>
              <input
                type="number"
                value={deductions.retirementContributions || 0}
                onChange={(e) => setDeductions(prev => ({ ...prev, retirementContributions: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="0"
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Calculate Button */}
      <button
        onClick={handleCalculate}
        disabled={isCalculating}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
      >
        {isCalculating ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Calculating...</span>
          </>
        ) : (
          <>
            <Calculator className="w-4 h-4" />
            <span>Calculate Tax</span>
          </>
        )}
      </button>

      {/* Results */}
      {calculation && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 border-t border-gray-200 dark:border-gray-700 pt-6"
        >
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Tax Liability</p>
                  <p className="text-2xl font-bold">{formatCurrency(calculation.taxLiability)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-blue-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Effective Rate</p>
                  <p className="text-2xl font-bold">{formatPercentage(calculation.effectiveRate)}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Marginal Rate</p>
                  <p className="text-2xl font-bold">{formatPercentage(calculation.marginalRate)}</p>
                </div>
                <PieChart className="w-8 h-8 text-purple-200" />
              </div>
            </div>
          </div>

          {/* Tax Bracket Breakdown */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Tax Bracket Breakdown
            </h3>
            <div className="space-y-2">
              {calculation.breakdown.map((bracket, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-600 last:border-b-0">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {formatPercentage(bracket.rate * 100)} rate
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatCurrency(bracket.taxOwed)}
                    </div>
                    <div className="text-xs text-gray-500">
                      on {formatCurrency(bracket.income)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          {calculation.recommendations.length > 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-3">
                💡 Tax Optimization Recommendations
              </h3>
              <ul className="space-y-2">
                {calculation.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start space-x-2 text-sm text-yellow-700 dark:text-yellow-300">
                    <span className="text-yellow-500 mt-1">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Potential Savings */}
          {calculation.savings && calculation.savings.potentialSavings > 0 && (
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-3">
                💰 Potential Tax Savings: {formatCurrency(calculation.savings.potentialSavings)}
              </h3>
              <div className="space-y-3">
                {calculation.savings.strategies.map((strategy, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">{strategy.strategy}</p>
                      {strategy.deadline && (
                        <p className="text-sm text-gray-500">Deadline: {strategy.deadline}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600 dark:text-green-400">
                        {formatCurrency(strategy.savings)}
                      </p>
                      <p className="text-xs text-gray-500">{strategy.difficulty}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};