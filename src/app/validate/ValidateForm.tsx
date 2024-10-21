"use client";
import React, { useState } from 'react';
import Link from 'next/link';

const ValidateForm: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<string | null>(null);

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

  const handleValidate = async () => {
    try {
      const response = await fetch('/api/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        //body: JSON.stringify({ text: inputText }),
        body: JSON.stringify({ text: "hard coded text" }),
      });
      console.log('Response status:', response.status);
      await logDebugInfo(`Response status: ${response.status}`);
      
      const data = await response.json();
      await logDebugInfo(`Response data: ${JSON.stringify(data)}`);
      
      setResult(data.result);
    } catch (error) {
      console.error('Error validating text:', error);
      await logDebugInfo(`Error validating text: ${error}`);
      setResult('An error occurred during validation.');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-800 p-2 mx-auto max-w-full">
  <Link href="/" className="text-white mb-4">← Back to Chat</Link>
  <div className="flex-grow flex flex-col items-center justify-center">
    <textarea
      className="w-full max-w-full h-80 p-4 mb-4 bg-gray-700 text-white rounded"
      value={inputText}
      onChange={(e) => setInputText(e.target.value)}
      placeholder="Enter ADR text to validate..."
    />
    <button
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      onClick={handleValidate}
    >
      Validate
    </button>
    {result && (
      <div className="mt-4 p-4 bg-gray-700 text-white rounded max-w-full w-full">
        <h2 className="text-xl font-bold mb-2">Validation Result:</h2>
        <p>{result}</p>
      </div>
    )}
  </div>
</div>

  );
};

export default ValidateForm;
