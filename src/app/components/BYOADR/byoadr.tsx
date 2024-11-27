"use client";
import React, { useState } from 'react';
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface PredictedQuestion {
  question: string;
  onClick: () => void;
}

const SplitViewADRForm: React.FC = () => {
  const API_TIMEOUT = 45000; // 45 seconds in milliseconds
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [predictedQuestions, setPredictedQuestions] = useState<PredictedQuestion[]>([]);

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

  
  const fetchWithTimeout = async (url: string, options: RequestInit, timeout: number = API_TIMEOUT) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(id);
      return response;
    } catch (error) {
      clearTimeout(id);
      throw new Error('Request timed out - please try again');
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const newUserMessage: ChatMessage = {
      role: 'user',
      content: inputText,
      timestamp: new Date().toLocaleTimeString(),
    };
    setChatHistory(prev => [...prev, newUserMessage]);

    try {
      NProgress.start();
      const response = await fetchWithTimeout('/api/create', {
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
      
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.result,
        timestamp: new Date().toLocaleTimeString(),
      };
      setChatHistory(prev => [...prev, assistantMessage]);
      
      setResult(data.result);
      setInputText('');
      
      // Fetch and update predicted questions
      await updatePredictedQuestions(inputText);
      NProgress.done();
      
    } catch (error) {
      console.error('Error creating text:', error);
      await logDebugInfo(`Error creating text: ${error}`);
      setResult('An error occurred during creation. Please try again.');
      NProgress.done();
    }
  };

  const updatePredictedQuestions = async (message: string) => {
    try {
      const response = await fetchWithTimeout('/api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: message }),
      });
      const data = await response.json();
      setPredictedQuestions(
        data.questions.map((q: string) => ({
          question: q,
          onClick: () => handlePredictedQuestionClick(q),
        }))
      );
    } catch (error) {
      console.error('Error fetching predicted questions:', error);
      setPredictedQuestions([]);
    }
  };
  

  const handlePredictedQuestionClick = (question: string) => {
    setInputText(" Update and refine the previously created  ADR Output based on the info provided here" + question);
    handleSendMessage();
  };

  return (
    <div className="flex h-[calc(100vh-200px)] gap-4">
      {/* Left side - Chat Interface */}
      <div className="flex flex-col w-1/2 bg-gray-900 rounded-lg p-4">
        {/* Predicted Questions */}
        <div className="mb-4">
          <h3 className="text-lg font-medium text-white mb-2"> Start with a simple english description of your ADR and iterate away !</h3>
          <div className="space-y-2">
            {predictedQuestions.map((q, index) => (
              <button
                key={index}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg w-full text-left"
                onClick={q.onClick}
              >
                {q.question}
              </button>
            ))}
          </div>
        </div>

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