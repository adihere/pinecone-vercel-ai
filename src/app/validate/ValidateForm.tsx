"use client";

import React, { useState } from 'react';
import Header from "../components/Header";
import Link from 'next/link';

const ValidateForm: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<string | null>(null);

  const handleValidate = async () => {
    try {
      const response = await fetch('/api/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: inputText }),
      });
      const data = await response.json();
      setResult(data.result);
    } catch (error) {
      console.error('Error validating text:', error);
      setResult('An error occurred during validation.');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-800 p-2 mx-auto max-w-full">
      <Header className="my-5" />
      <Link href="/" className="text-white mb-4">← Back to Chat</Link>
      <div className="flex-grow flex flex-col items-center justify-center">
        <textarea
          className="w-full max-w-2xl h-40 p-2 mb-4 bg-gray-700 text-white rounded"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Enter text to validate..."
        />
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={handleValidate}
        >
          Validate
        </button>
        {result && (
          <div className="mt-4 p-4 bg-gray-700 text-white rounded max-w-2xl w-full">
            <h2 className="text-xl font-bold mb-2">Validation Result:</h2>
            <p>{result}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ValidateForm;

