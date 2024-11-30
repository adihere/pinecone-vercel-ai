"use client";
import React, { useState, useCallback, useMemo } from 'react';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

const SplitViewADRForm: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [predictedQuestions, setPredictedQuestions] = useState<string[]>([]);

  // Memoized and debounced message send handler
  const handleSendMessage = useCallback(async (customText?: string) => {
    const textToSend = customText || inputText;
    if (!textToSend.trim()) return;

    setIsLoading(true);
    setError(null);
    NProgress.start();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000);

      const response = await fetch('/api/create', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text: textToSend,
          timestamp: new Date().toISOString() 
        }),
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error('Failed to generate ADR');
      }

      const data = await response.json();
      setResult(data.result);
      setInputText('');
      setChatHistory((prev) => [...prev, textToSend]);
      
      // Predictive question generation
      await updatePredictedQuestions(textToSend);

    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'An unexpected error occurred';
      
      setError(errorMessage);
      console.error('ADR Generation Error:', error);
    } finally {
      setIsLoading(false);
      NProgress.done();
    }
  }, [inputText]);

  // Optimize predicted questions generation
  const updatePredictedQuestions = useCallback(async (message: string) => {
    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: message }),
      });

      const data = await response.json();
      setPredictedQuestions(data.questions || []);
    } catch (error) {
      console.error('Predicted Questions Error:', error);
      setPredictedQuestions([]);
    }
  }, []);

  // Accessibility and keyboard support
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  // Performance optimization: Memoize expensive rendering
  const renderResult = useMemo(() => {
    if (isLoading) return <div className="shimmer text-white p-4">Generating ADR...</div>;
    if (error) return <div className="text-red-500 p-4">{error}</div>;
    return result ? (
      <pre className="text-white whitespace-pre-wrap">{result}</pre>
    ) : (
      <div className="text-gray-400 italic">The generated ADR will appear here...</div>
    );
  }, [result, isLoading, error]);

  return (
    <div className="flex h-[calc(100vh-200px)] gap-4 motion-safe:animate-fade-in">
      {/* Left side - Chat Interface */}
      <div className="flex flex-col w-1/2 bg-gray-900 rounded-lg p-4">
        {/* Chat History */}
        <div className="mb-4 flex-grow overflow-y-auto space-y-4">
          {chatHistory.map((message, index) => (
            <div
              key={index}
              className="bg-blue-600 rounded-lg p-3 self-end max-w-[80%] text-white"
            >
              {message}
            </div>
          ))}
        </div>

        {/* Predicted Questions */}
        <div className="mb-4">
          <h3 className="text-lg font-medium text-white mb-2">
            Suggested Next Steps
          </h3>
          <div className="space-y-2">
            {predictedQuestions.map((question, index) => (
              <button
                key={index}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg w-full text-left transition-colors"
                onClick={() => {
                  setInputText(question);
                  handleSendMessage(question);
                }}
              >
                {question}
              </button>
            ))}
          </div>
        </div>

        {/* Input Area with Enhanced Accessibility */}
        <div className="flex gap-2 mt-4">
          <textarea
            aria-label="ADR Description Input"
            className="flex-grow p-2 bg-gray-700 text-white rounded-lg resize-none focus:ring-2 focus:ring-blue-500 transition-all"
            rows={3}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your architectural decision in simple terms..."
            disabled={isLoading}
            aria-describedby="input-help"
          />
          <button
            className={`px-4 py-2 rounded-lg self-end transition-colors ${
              isLoading 
                ? 'bg-gray-500 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
            onClick={() => handleSendMessage()}
            disabled={isLoading}
            aria-busy={isLoading}
          >
            {isLoading ? 'Generating...' : 'Generate ADR'}
          </button>
        </div>
      </div>

      {/* Right side - Output Display */}
      <div className="w-1/2 bg-gray-900 rounded-lg p-4">
        <h2 className="text-xl font-bold mb-4 text-white">Generated ADR</h2>
        <div className="h-[90%] bg-gray-700 rounded-lg p-4 overflow-y-auto">
          {renderResult}
        </div>
      </div>
    </div>
  );
};

export default SplitViewADRForm;