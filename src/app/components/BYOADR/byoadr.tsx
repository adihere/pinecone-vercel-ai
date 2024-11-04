"use client";
import React, { useState } from 'react';
import { Message } from 'ai';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const SplitViewADRForm: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  const logDebugInfo = async (info: string) => {
    try {
      await fetch('/api/log-debug', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ info }),
      });
    } catch (error) {
      console.error('Error sending debug info:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    // Add user message to chat history
    const newUserMessage: ChatMessage = {
      role: 'user',
      content: inputText,
      timestamp: new Date().toLocaleTimeString(),
    };
    setChatHistory(prev => [...prev, newUserMessage]);

    try {
      const response = await fetch('/api/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: inputText }),
      });
      
      console.log('Response status:', response.status);
      await logDebugInfo(`Response status: ${response.status}`);
      
      const data = await response.json();
      await logDebugInfo(`Response data: ${JSON.stringify(data)}`);
      
      // Add assistant response to chat history
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.result,
        timestamp: new Date().toLocaleTimeString(),
      };
      setChatHistory(prev => [...prev, assistantMessage]);
      
      // Update the result panel
      setResult(data.result);
      
      // Clear input after sending
      setInputText('');
      
    } catch (error) {
      console.error('Error creating text:', error);
      await logDebugInfo(`Error creating text: ${error}`);
      setResult('An error occurred during creation.');
    }
  };

  return (
    <div className="flex h-[calc(100vh-200px)] gap-4">
      {/* Left side - Chat Interface */}
      <div className="flex flex-col w-1/2 bg-gray-900 rounded-lg p-4">
        {/* Chat History */}
        <div className="flex-grow overflow-y-auto mb-4 space-y-4">
          {chatHistory.map((message, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-600 ml-auto max-w-[80%]'
                  : 'bg-gray-700 max-w-[80%]'
              }`}
            >
              <div className="text-sm text-gray-300 mb-1">
                {message.role === 'user' ? 'You' : 'Assistant'} • {message.timestamp}
              </div>
              <div className="text-white whitespace-pre-wrap">{message.content}</div>
            </div>
          ))}
        </div>
        
        {/* Input Area */}
        <div className="flex gap-2">
          <textarea
            className="flex-grow p-2 bg-gray-700 text-white rounded-lg resize-none"
            rows={3}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your message here..."
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <button
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg self-end"
            onClick={handleSendMessage}
          >
            Send
          </button>
        </div>
      </div>

      {/* Right side - Output Display */}
      <div className="w-1/2 bg-gray-900 rounded-lg p-4">
        <h2 className="text-xl font-bold mb-4 text-white">Generated ADR</h2>
        <div className="h-[90%] bg-gray-700 rounded-lg p-4 overflow-y-auto">
          {result ? (
            <pre className="text-white whitespace-pre-wrap">{result}</pre>
          ) : (
            <div className="text-gray-400 italic">
              The generated ADR will appear here...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SplitViewADRForm;