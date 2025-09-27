import React from 'react';
import { Bot } from 'lucide-react';

export const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-start space-x-3">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
        <Bot className="w-4 h-4 text-gray-600" />
      </div>
      
      <div className="message-bubble message-assistant">
        <div className="typing-indicator">
          <div 
            className="typing-dot" 
            style={{ '--delay': '0ms' } as React.CSSProperties}
          ></div>
          <div 
            className="typing-dot" 
            style={{ '--delay': '150ms' } as React.CSSProperties}
          ></div>
          <div 
            className="typing-dot" 
            style={{ '--delay': '300ms' } as React.CSSProperties}
          ></div>
        </div>
      </div>
    </div>
  );
};