import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Download, Trash2, Lightbulb, FileText, Calculator as CalcIcon } from 'lucide-react';
import { Message, FileAttachment, UserProfile, TaxCalculation } from '../types';
import { AITaxAdvisor } from '../utils/aiTaxAdvisor';
import { ChatMessage } from './ChatMessage';
import { TypingIndicator } from './TypingIndicator';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface EnhancedChatInterfaceProps {
  uploadedFiles: FileAttachment[];
  userProfile?: UserProfile;
  onCalculationRequest: () => void;
}

export const EnhancedChatInterface: React.FC<EnhancedChatInterfaceProps> = ({
  uploadedFiles,
  userProfile,
  onCalculationRequest
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "👋 Hello! I'm your AI Tax Assistant. I can help you with tax calculations, deductions, filing questions, and analyze your uploaded documents. What would you like to know about taxes today?",
      isBot: true,
      timestamp: new Date(),
      confidence: 1.0
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const quickActions = [
    { icon: CalcIcon, text: "Calculate my taxes", action: () => handleQuickAction("I want to calculate my tax liability") },
    { icon: FileText, text: "Explain deductions", action: () => handleQuickAction("What deductions can I claim?") },
    { icon: Lightbulb, text: "Tax saving tips", action: () => handleQuickAction("How can I save money on taxes?") },
    { icon: Bot, text: "Filing deadlines", action: () => handleQuickAction("What are the important tax deadlines?") }
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleQuickAction = (text: string) => {
    setInputText(text);
    handleSendMessage(text);
  };

  const handleSendMessage = async (messageText?: string) => {
    const text = messageText || inputText.trim();
    if (!text) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      // Generate AI response
      const aiResponse = await AITaxAdvisor.generateResponse(
        text,
        messages,
        userProfile,
        uploadedFiles
      );

      // Simulate typing delay
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse.message,
        isBot: true,
        timestamp: new Date(),
        confidence: aiResponse.confidence,
        suggestions: aiResponse.followUpQuestions,
        calculations: aiResponse.calculations
      };

      setMessages(prev => [...prev, botMessage]);

      // Show calculation request if relevant
      if (text.toLowerCase().includes('calculate') && !aiResponse.calculations) {
        setTimeout(() => {
          const calcMessage: Message = {
            id: (Date.now() + 2).toString(),
            text: "Would you like me to open the advanced tax calculator for a detailed calculation?",
            isBot: true,
            timestamp: new Date(),
            suggestions: ["Yes, open calculator", "No, continue chatting"]
          };
          setMessages(prev => [...prev, calcMessage]);
        }, 500);
      }

    } catch (error) {
      console.error('Error generating response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I apologize, but I encountered an error processing your request. Please try again or rephrase your question.",
        isBot: true,
        timestamp: new Date(),
        confidence: 0.1
      };
      setMessages(prev => [...prev, errorMessage]);
      toast.error('Error processing your message');
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (suggestion.toLowerCase().includes('calculator')) {
      onCalculationRequest();
      return;
    }
    handleQuickAction(suggestion);
  };

  const exportChat = () => {
    const chatData = {
      messages: messages.map(msg => ({
        ...msg,
        timestamp: msg.timestamp.toISOString()
      })),
      exportDate: new Date().toISOString(),
      userProfile
    };

    const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tax-chat-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Chat exported successfully!');
  };

  const clearChat = () => {
    setMessages([messages[0]]); // Keep welcome message
    toast.success('Chat cleared!');
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-xl shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">AI Tax Assistant</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isTyping ? 'Typing...' : 'Online'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={exportChat}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Export Chat"
          >
            <Download className="w-5 h-5" />
          </button>
          <button
            onClick={clearChat}
            className="p-2 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Clear Chat"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      {messages.length === 1 && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Quick actions:</p>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((action, index) => (
              <motion.button
                key={index}
                onClick={action.action}
                className="flex items-center space-x-2 p-3 text-left text-sm bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <action.icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-gray-700 dark:text-gray-300">{action.text}</span>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              onSuggestionClick={handleSuggestionClick}
            />
          ))}
        </AnimatePresence>
        
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask me anything about taxes..."
              className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              disabled={isTyping}
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim() || isTyping}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors duration-200"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {uploadedFiles.length > 0 && (
          <div className="mt-2 flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
            <FileText className="w-3 h-3" />
            <span>{uploadedFiles.length} file(s) available for analysis</span>
          </div>
        )}
      </div>
    </div>
  );
};