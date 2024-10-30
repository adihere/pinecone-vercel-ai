import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
import { Loader } from 'lucide-react';

const ReactQuill = dynamic(() => import('react-quill'), { 
  ssr: false,
  loading: () => <div className="h-[45vh] w-[90vw] bg-gray-700 rounded animate-pulse" />
});

const ValidateFormClient: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const handleValidate = async () => {
    setIsValidating(true);

    try {
      const response = await fetch('/api/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: inputText }),
      });

      const data = await response.json();
      setResult(data.text);
    } catch (error) {
      console.error('Error validating text:', error);
      setResult('An error occurred during validation.');
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="w-full max-w-[90vw] mx-auto space-y-6">
      {/* Editor Container */}
      <div className="relative">
        <ReactQuill
          theme="snow"
          value={inputText}
          onChange={setInputText}
          placeholder="Enter ADR text to validate..."
          className="bg-white rounded" 
          modules={{
            toolbar: [
              [{ header: [1, 2, 3, false] }],
              ['bold', 'italic', 'underline', 'strike'],
              [{ list: 'ordered' }, { list: 'bullet' }],
              ['link', 'image'],
              ['clean']
            ],
          }}
          formats={[
            'header',
            'bold', 'italic', 'underline', 'strike',
            'list', 'bullet',
            'link', 'image'
          ]}
          style={{
            height: '45vh',
          }}
        />
      </div>

      {/* Validate Button */}
      <div className="flex justify-center py-4">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-200 ease-in-out transform hover:scale-105 flex items-center"
          onClick={handleValidate}
          disabled={isValidating}
        >
          {isValidating ? (
            <>
              <Loader className="mr-2 animate-spin" />
              Validating...
            </>
          ) : (
            'Validate'
          )}
        </button>
      </div>
      
      {/* Results Section */}
      {result && (
        <div className="mt-4 p-6 bg-gray-700 text-white rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-3">Validation Result:</h2>
          <p className="whitespace-pre-wrap">{result}</p>
        </div>
      )}
    </div>
  );
};

export default ValidateFormClient;