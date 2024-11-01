import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
import { Loader, ChevronDown } from 'lucide-react';

const ReactQuill = dynamic(() => import('react-quill'), { 
  ssr: false,
  loading: () => <div className="h-[45vh] w-[90vw] bg-gray-700 rounded animate-pulse" />
});

const ADR_TEMPLATES = {
  empty: {
    name: "Select a template...",
    content: ""
  },
  basic: {
    name: "Basic ADR Template",
    content: `# Title: [Brief title of solved problem and solution]

## Status
[Proposed | Accepted | Deprecated | Superseded]
If superseded, include a reference to the new ADR

## Context
[Description of the problem and alternative solutions considered]

## Decision
[Chosen solution and justification]

## Consequences
[Positive and negative repercussions of the decision]

## Links
[Optional: Links to related decisions and resources]`
  },
  detailed: {
    name: "Detailed ADR Template",
    content: `# Architecture Decision Record (ADR)

## Title: [Descriptive title for the architecture decision]

## Date: [YYYY-MM-DD]
Last Modified: [YYYY-MM-DD]

## Status
- [ ] Proposed
- [ ] Accepted
- [ ] Deprecated
- [ ] Superseded by ADR-XXX

## Problem Statement
[Clear, concise description of the issue that needs to be addressed]

## Context
### Background
[Relevant background information and current system state]

### Constraints
[Technical, business, or organizational constraints affecting the decision]

### Assumptions
[Key assumptions made during the decision process]

## Options Considered
### Option 1: [Name]
- Pros:
  - [List advantages]
- Cons:
  - [List disadvantages]
- Risks:
  - [List potential risks]

### Option 2: [Name]
[Similar structure to Option 1]

## Decision
### Chosen Option
[Clearly state which option was selected]

### Justification
[Detailed explanation of why this option was chosen]

## Implementation
### Action Items
- [ ] [List specific tasks needed to implement the decision]
- [ ] [Include timeline if applicable]

### Success Metrics
- [Define how success will be measured]

## Consequences
### Positive
- [List positive outcomes]

### Negative
- [List negative outcomes]

### Risks
- [List ongoing risks and mitigation strategies]

## Related Documents
- [Links to related ADRs]
- [Links to related documentation]
- [References to standards or patterns used]`
  },
  microservices: {
    name: "Microservices ADR Template",
    content: `# ADR: Microservice Architecture Decision

## Title: [Specific Microservice Component/Pattern Decision]

## Status
[Current status of the decision]

## Context
### Current Architecture
[Description of current system architecture]

### Business Drivers
- [List key business requirements]
- [Scale requirements]
- [Performance needs]

### Technical Requirements
- [Specific technical requirements]
- [Integration needs]
- [Data consistency requirements]

## Decision

### Service Boundaries
- Service Name:
- Responsibility:
- Data Ownership:
- APIs:
  - Endpoints:
  - Protocols:
  - Data Formats:

### Technical Stack
- Language/Framework:
- Database:
- Message Queue:
- API Gateway:
- Service Mesh:

### Patterns Used
- [Circuit Breaker]
- [CQRS]
- [Event Sourcing]
- [Saga Pattern]

## Consequences

### Operational Impact
- Deployment:
- Monitoring:
- Alerting:
- SLAs:

### Team Impact
- Team Structure:
- Skills Required:
- Training Needs:

### Cost Implications
- Infrastructure:
- Development:
- Maintenance:

## Implementation Strategy
- Phase 1:
- Phase 2:
- Phase 3:

## Success Criteria
- [Measurable outcomes]
- [Performance metrics]
- [Business metrics]`
  }
};

const ValidateFormClient: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('empty');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleTemplateSelect = (templateKey: string) => {
    setSelectedTemplate(templateKey);
    setInputText(ADR_TEMPLATES[templateKey as keyof typeof ADR_TEMPLATES].content);
    setIsDropdownOpen(false);
  };

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
      {/* Template Selector */}
      <div className="relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-full bg-gray-700 text-white p-3 rounded-lg flex justify-between items-center"
        >
          <span>{ADR_TEMPLATES[selectedTemplate as keyof typeof ADR_TEMPLATES].name}</span>
          <ChevronDown className={`transform transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isDropdownOpen && (
          <div className="absolute w-full mt-1 bg-gray-700 rounded-lg shadow-lg z-10">
            {Object.entries(ADR_TEMPLATES).map(([key, template]) => (
              <button
                key={key}
                className="w-full text-left px-4 py-2 text-white hover:bg-gray-600 first:rounded-t-lg last:rounded-b-lg"
                onClick={() => handleTemplateSelect(key)}
              >
                {template.name}
              </button>
            ))}
          </div>
        )}
      </div>

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
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-200 ease-in-out transform hover:scale-105 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleValidate}
          disabled={isValidating || !inputText.trim()}
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