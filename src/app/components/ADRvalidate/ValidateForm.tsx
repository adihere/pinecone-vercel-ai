"use client";

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
// Import statement removed as it's causing issues
// import 'react-quill/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

const ValidateFormClient: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<string | null>(null);

  const handleValidate = async () => {
    console.log('Input text before fetch:', inputText);
    console.log('Input text length:', inputText.length);
    
    try {
      const response = await fetch('/api/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: inputText }),
      });
      
      const data = await response.json();
      
      // validate the JSON
      console.log('Response data FROM fORM:', data);  // New console log

      setResult(data.text);
    } catch (error) {
      console.error('Error validating text:', error);
      setResult('An error occurred during validation.');
    }
  };

  return (
    <>
      <ReactQuill
        theme="snow"
        value={inputText}
        onChange={setInputText}
        placeholder="Enter ADR text to validate..."
        className="mb-4 bg-gray-700 text-white rounded"
        modules={{
          toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{'list': 'ordered'}, {'list': 'bullet'}],
            ['link', 'image'],
            ['clean']
          ],
        }}
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
    </>
  );
};

export default ValidateFormClient;
