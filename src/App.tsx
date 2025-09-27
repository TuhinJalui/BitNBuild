import React, { useState } from 'react';
import { Calculator, Upload, MessageCircle, User, Settings, TrendingUp } from 'lucide-react';
import { EnhancedFileUpload } from './components/EnhancedFileUpload';
import { AdvancedTaxCalculator } from './components/AdvancedTaxCalculator';
import { EnhancedChatInterface } from './components/EnhancedChatInterface';
import { FileAttachment, UserProfile, TaxCalculation } from './types';
import { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';

function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'calculator' | 'upload' | 'profile'>('chat');
  const [uploadedFiles, setUploadedFiles] = useState<FileAttachment[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    age: 35,
    filingStatus: 'single',
    dependents: 0,
    state: 'CA',
    occupation: 'Software Engineer',
    hasBusinessIncome: false,
    hasInvestmentIncome: false,
    hasRentalIncome: false,
    isFirstTimeHomeBuyer: false,
    hasStudentLoans: false,
    contributesToRetirement: true
  });
  const [latestCalculation, setLatestCalculation] = useState<TaxCalculation | null>(null);

  const handleFilesUploaded = (files: FileAttachment[]) => {
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const handleRemoveFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const handleCalculationComplete = (calculation: TaxCalculation) => {
    setLatestCalculation(calculation);
  };

  const handleCalculationRequest = () => {
    setActiveTab('calculator');
  };

  const tabs = [
    { id: 'chat' as const, label: 'AI Assistant', icon: MessageCircle },
    { id: 'calculator' as const, label: 'Tax Calculator', icon: Calculator },
    { id: 'upload' as const, label: 'Upload Documents', icon: Upload },
    { id: 'profile' as const, label: 'Profile', icon: User }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Calculator className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  AI Tax Assistant
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Professional Tax Guidance & Calculations
                </p>
              </div>
            </div>
            
            {latestCalculation && (
              <div className="hidden md:flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-2 px-3 py-1 bg-blue-100 dark:bg-blue-900 rounded-full">
                  <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-blue-800 dark:text-blue-200">
                    Tax Liability: ${latestCalculation.taxLiability.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 dark:bg-green-900 rounded-full">
                  <span className="text-green-800 dark:text-green-200">
                    Effective Rate: {latestCalculation.effectiveRate.toFixed(2)}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                  {tab.id === 'upload' && uploadedFiles.length > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {uploadedFiles.length}
                    </span>
                  )}
                </motion.button>
              ))}
            </nav>

            {/* Quick Stats */}
            <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Quick Stats
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Files Uploaded:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{uploadedFiles.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Filing Status:</span>
                  <span className="font-medium text-gray-900 dark:text-white capitalize">
                    {userProfile.filingStatus.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Dependents:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{userProfile.dependents}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              {activeTab === 'chat' && (
                <div className="h-[700px]">
                  <EnhancedChatInterface
                    uploadedFiles={uploadedFiles}
                    userProfile={userProfile}
                    onCalculationRequest={handleCalculationRequest}
                  />
                </div>
              )}

              {activeTab === 'calculator' && (
                <AdvancedTaxCalculator
                  onCalculationComplete={handleCalculationComplete}
                  userProfile={userProfile}
                />
              )}

              {activeTab === 'upload' && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <Upload className="w-6 h-6 text-blue-600" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Upload Tax Documents
                    </h2>
                  </div>
                  <EnhancedFileUpload
                    onFilesUploaded={handleFilesUploaded}
                    uploadedFiles={uploadedFiles}
                    onRemoveFile={handleRemoveFile}
                  />
                </div>
              )}

              {activeTab === 'profile' && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <User className="w-6 h-6 text-blue-600" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Tax Profile
                    </h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Age
                      </label>
                      <input
                        type="number"
                        value={userProfile.age}
                        onChange={(e) => setUserProfile(prev => ({ ...prev, age: Number(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Filing Status
                      </label>
                      <select
                        value={userProfile.filingStatus}
                        onChange={(e) => setUserProfile(prev => ({ ...prev, filingStatus: e.target.value as any }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="single">Single</option>
                        <option value="marriedFilingJointly">Married Filing Jointly</option>
                        <option value="marriedFilingSeparately">Married Filing Separately</option>
                        <option value="headOfHousehold">Head of Household</option>
                        <option value="qualifyingWidow">Qualifying Widow(er)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Number of Dependents
                      </label>
                      <input
                        type="number"
                        value={userProfile.dependents}
                        onChange={(e) => setUserProfile(prev => ({ ...prev, dependents: Number(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        State
                      </label>
                      <input
                        type="text"
                        value={userProfile.state}
                        onChange={(e) => setUserProfile(prev => ({ ...prev, state: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Occupation
                      </label>
                      <input
                        type="text"
                        value={userProfile.occupation}
                        onChange={(e) => setUserProfile(prev => ({ ...prev, occupation: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Income Sources & Situations
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { key: 'hasBusinessIncome', label: 'Business Income' },
                        { key: 'hasInvestmentIncome', label: 'Investment Income' },
                        { key: 'hasRentalIncome', label: 'Rental Income' },
                        { key: 'isFirstTimeHomeBuyer', label: 'First-Time Home Buyer' },
                        { key: 'hasStudentLoans', label: 'Student Loans' },
                        { key: 'contributesToRetirement', label: 'Retirement Contributions' }
                      ].map((item) => (
                        <label key={item.key} className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={userProfile[item.key as keyof UserProfile] as boolean}
                            onChange={(e) => setUserProfile(prev => ({ 
                              ...prev, 
                              [item.key]: e.target.checked 
                            }))}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;