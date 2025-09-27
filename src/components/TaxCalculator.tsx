import React, { useState, useEffect } from 'react';
import { Calculator, DollarSign, FileText, TrendingUp } from 'lucide-react';
import { calculateTax, formatCurrency, formatPercentage, getDeductionSuggestions } from '../utils/taxCalculations';
import { UserProfile, TaxCalculation } from '../types';

interface TaxCalculatorProps {
  onCalculationComplete: (calculation: TaxCalculation) => void;
}

export const TaxCalculator: React.FC<TaxCalculatorProps> = ({ onCalculationComplete }) => {
  const [income, setIncome] = useState<string>('');
  const [deductions, setDeductions] = useState<string>('');
  const [profile, setProfile] = useState<UserProfile>({
    filingStatus: 'single',
    dependents: 0,
    state: 'federal',
    taxYear: 2024
  });
  const [calculation, setCalculation] = useState<TaxCalculation | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (income && parseFloat(income) > 0) {
      const calc = calculateTax(
        parseFloat(income) || 0,
        parseFloat(deductions) || 0,
        profile
      );
      setCalculation(calc);
      onCalculationComplete(calc);
    }
  }, [income, deductions, profile, onCalculationComplete]);

  const suggestions = income ? getDeductionSuggestions(parseFloat(income), profile) : [];

  return (
    <div className="card space-y-6">
      <div className="flex items-center space-x-2">
        <Calculator className="w-5 h-5 text-primary-600" />
        <h3 className="text-lg font-semibold text-gray-900">Tax Calculator</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Annual Income
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="number"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              className="input pl-10"
              placeholder="75000"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Filing Status
          </label>
          <select
            value={profile.filingStatus}
            onChange={(e) => setProfile({ ...profile, filingStatus: e.target.value as any })}
            className="input"
          >
            <option value="single">Single</option>
            <option value="married_joint">Married Filing Jointly</option>
            <option value="married_separate">Married Filing Separately</option>
            <option value="head_of_household">Head of Household</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Additional Deductions (Optional)
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="number"
              value={deductions}
              onChange={(e) => setDeductions(e.target.value)}
              className="input pl-10"
              placeholder="0"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Leave blank to use standard deduction
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Dependents
          </label>
          <input
            type="number"
            value={profile.dependents}
            onChange={(e) => setProfile({ ...profile, dependents: parseInt(e.target.value) || 0 })}
            className="input"
            min="0"
            placeholder="0"
          />
        </div>
      </div>

      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="btn-secondary text-sm"
      >
        {showAdvanced ? 'Hide' : 'Show'} Advanced Options
      </button>

      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tax Year
            </label>
            <select
              value={profile.taxYear}
              onChange={(e) => setProfile({ ...profile, taxYear: parseInt(e.target.value) })}
              className="input"
            >
              <option value={2024}>2024</option>
              <option value={2023}>2023</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State
            </label>
            <select
              value={profile.state}
              onChange={(e) => setProfile({ ...profile, state: e.target.value })}
              className="input"
            >
              <option value="federal">Federal Only</option>
              <option value="ca">California</option>
              <option value="ny">New York</option>
              <option value="tx">Texas</option>
              <option value="fl">Florida</option>
            </select>
          </div>
        </div>
      )}

      {calculation && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-primary-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="w-4 h-4 text-primary-600" />
                <span className="text-sm font-medium text-primary-700">Estimated Tax</span>
              </div>
              <p className="text-2xl font-bold text-primary-900">
                {formatCurrency(calculation.estimatedTax)}
              </p>
            </div>

            <div className="bg-success-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <DollarSign className="w-4 h-4 text-success-600" />
                <span className="text-sm font-medium text-success-700">After-Tax Income</span>
              </div>
              <p className="text-2xl font-bold text-success-900">
                {formatCurrency(calculation.income - calculation.estimatedTax)}
              </p>
            </div>

            <div className="bg-warning-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <FileText className="w-4 h-4 text-warning-600" />
                <span className="text-sm font-medium text-warning-700">Effective Rate</span>
              </div>
              <p className="text-2xl font-bold text-warning-900">
                {formatPercentage(calculation.effectiveRate)}
              </p>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Tax Breakdown</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Gross Income:</span>
                <span className="font-medium">{formatCurrency(calculation.income)}</span>
              </div>
              <div className="flex justify-between">
                <span>Deductions:</span>
                <span className="font-medium">-{formatCurrency(calculation.deductions)}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span>Taxable Income:</span>
                <span className="font-medium">{formatCurrency(calculation.taxableIncome)}</span>
              </div>
              <div className="flex justify-between">
                <span>Federal Tax:</span>
                <span className="font-medium">{formatCurrency(calculation.estimatedTax)}</span>
              </div>
              <div className="flex justify-between">
                <span>Marginal Rate:</span>
                <span className="font-medium">{formatPercentage(calculation.marginalRate)}</span>
              </div>
            </div>
          </div>

          {suggestions.length > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">💡 Tax Optimization Tips</h4>
              <ul className="space-y-1 text-sm text-blue-800">
                {suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};