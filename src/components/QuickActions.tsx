import React from 'react';
import { Calculator, FileText, Circle as HelpCircle, Calendar, DollarSign, TrendingUp } from 'lucide-react';

interface QuickActionsProps {
  onActionClick: (action: string) => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onActionClick }) => {
  const actions = [
    {
      id: 'calculate-tax',
      label: 'Calculate Tax',
      icon: Calculator,
      description: 'Estimate your tax liability',
      color: 'primary'
    },
    {
      id: 'upload-documents',
      label: 'Upload Documents',
      icon: FileText,
      description: 'Analyze tax documents',
      color: 'success'
    },
    {
      id: 'tax-deadlines',
      label: 'Tax Deadlines',
      icon: Calendar,
      description: 'Important dates to remember',
      color: 'warning'
    },
    {
      id: 'deductions',
      label: 'Find Deductions',
      icon: DollarSign,
      description: 'Maximize your deductions',
      color: 'primary'
    },
    {
      id: 'quarterly-payments',
      label: 'Quarterly Payments',
      icon: TrendingUp,
      description: 'Estimate quarterly taxes',
      color: 'success'
    },
    {
      id: 'tax-help',
      label: 'Tax Help',
      icon: HelpCircle,
      description: 'Get answers to tax questions',
      color: 'secondary'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      primary: 'bg-primary-50 hover:bg-primary-100 text-primary-700 border-primary-200',
      success: 'bg-success-50 hover:bg-success-100 text-success-700 border-success-200',
      warning: 'bg-warning-50 hover:bg-warning-100 text-warning-700 border-warning-200',
      secondary: 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
    };
    return colors[color as keyof typeof colors] || colors.secondary;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.id}
            onClick={() => onActionClick(action.id)}
            className={`p-4 rounded-xl border-2 transition-all duration-200 text-left hover:shadow-md ${getColorClasses(action.color)}`}
          >
            <div className="flex items-start space-x-3">
              <Icon className="w-6 h-6 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-sm">{action.label}</h3>
                <p className="text-xs opacity-75 mt-1">{action.description}</p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};