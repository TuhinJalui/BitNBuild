import React from 'react';
import { User, Bot, Paperclip, Download } from 'lucide-react';
import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.type === 'user';

  const formatContent = (content: string) => {
    // Simple markdown-like formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm">$1</code>')
      .replace(/\n/g, '<br>');
  };

  const downloadAttachment = (attachment: any) => {
    if (attachment.url) {
      window.open(attachment.url, '_blank');
    } else if (attachment.content) {
      const blob = new Blob([attachment.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = attachment.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser ? 'bg-primary-600' : 'bg-gray-200'
      }`}>
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-gray-600" />
        )}
      </div>
      
      <div className={`flex-1 max-w-3xl ${isUser ? 'text-right' : ''}`}>
        <div className={`message-bubble ${isUser ? 'message-user' : 'message-assistant'}`}>
          <div 
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: formatContent(message.content) }}
          />
          
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-3 space-y-2">
              {message.attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className={`flex items-center justify-between p-2 rounded-lg ${
                    isUser ? 'bg-primary-500' : 'bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Paperclip className={`w-4 h-4 ${isUser ? 'text-primary-100' : 'text-gray-500'}`} />
                    <span className={`text-sm ${isUser ? 'text-primary-100' : 'text-gray-700'}`}>
                      {attachment.name}
                    </span>
                    <span className={`text-xs ${isUser ? 'text-primary-200' : 'text-gray-500'}`}>
                      ({(attachment.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <button
                    onClick={() => downloadAttachment(attachment)}
                    className={`p-1 rounded hover:bg-opacity-20 hover:bg-gray-500 transition-colors ${
                      isUser ? 'text-primary-100' : 'text-gray-500'
                    }`}
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className={`mt-1 text-xs text-gray-500 ${isUser ? 'text-right' : ''}`}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};