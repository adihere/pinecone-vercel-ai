// app/api/createadr/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { getContext } from '../../utils/context';
import { openai } from '@ai-sdk/openai';

// IMPORTANT! Set the runtime to edge
export const runtime = 'edge';
const DEBUG = true;

// Define a type for the ADR Types
const ADR_TYPES = [
  'Business-Oriented ADRs', 
  'Technology-Focused ADRs', 
  'Communication-Centric ADRs', 
  'Process-Oriented ADRs', 
  'Security and Compliance ADRs'
] as const;

type ADRType = typeof ADR_TYPES[number];

// Define context prompts for each ADR type
const ADR_TYPE_CONTEXTS: Record<ADRType, string> = {
  'Business-Oriented ADRs': `
Context for Business-Oriented ADRs:
- Focus on decisions that significantly impact business goals and strategies
- Emphasize strategic alignment with company objectives
- Provide clear cost-benefit analysis
- Highlight compliance with industry regulations
- Demonstrate potential impact on customer experience and satisfaction
  `,
  'Technology-Focused ADRs': `
Context for Technology-Focused ADRs:
- Detailed technical rationale for architectural choices
- In-depth analysis of technical trade-offs
- Comprehensive evaluation of technology stack components
- Performance, scalability, and maintainability considerations
- Technical constraints and opportunities
  `,
  'Communication-Centric ADRs': `
Context for Communication-Centric ADRs:
- Clear, jargon-free language for diverse stakeholders
- High-level overview of technical decisions
- Emphasis on translating technical choices into business value
- Visual representations of architectural concepts
- Bridging communication gaps between technical and non-technical teams
  `,
  'Process-Oriented ADRs': `
Context for Process-Oriented ADRs:
- Focus on development methodologies and practices
- Rationale for workflow and process improvements
- Impact on team productivity and efficiency
- Alignment with organizational development standards
- Long-term benefits of proposed process changes
  `,
  'Security and Compliance ADRs': `
Context for Security and Compliance ADRs:
- Detailed security risk assessment
- Comprehensive compliance strategy
- Explanation of security mechanisms and protocols
- Alignment with legal and regulatory requirements
- Mitigation strategies for potential security vulnerabilities
  `
};

function isValidADRType(type: string): type is ADRType {
  return (ADR_TYPES as readonly string[]).includes(type);
}

function textToJSON(text: string) {
  return { result: text }; // Changed from 'text' to 'result' to match the frontend expectations
}

function debugLog(message: string, data: any = null) {
  if (DEBUG) {
    console.log(message);
    if (data !== null) {
      console.log(JSON.stringify(data, null, 2));
    }
  }
}

export async function POST(req: Request) {
  try {
    const requestBody = await req.json();
    
    // Validate and set ADR type with type guard
    const adrType: ADRType = requestBody.adrType && isValidADRType(requestBody.adrType) 
      ? requestBody.adrType 
      : 'Technology-Focused ADRs';

    const inputText = requestBody.text;
    let messageString: string;
    messageString = typeof inputText === 'string' ? inputText : JSON.stringify(inputText);

    // Get the context from the input
    const contextADR = await getContext(messageString, '');
    console.log("CreateADR API - Context retrieved", contextADR);

    // Use the specific context for the selected ADR type
    const typeSpecificContext = ADR_TYPE_CONTEXTS[adrType];

    // Rest of the original implementation remains the same...
    const ADRTemplate = `# Title
[Short title of solved problem and solution]

## Status
[Proposed | Rejected | Accepted | Deprecated | Superseded]

## Context
[Description of the problem and context]

## Decision
[Description of the response to these forces]

## Consequences
[Description of the resulting context]

## Assumptions
[Clearly describe the underlying assumptions in the environment in which you are making the decision—cost, schedule, technology]

##Related decisions:
[Placeholder for links to related decision records]

## References
[Optional list of references]`;

    const systemPrompt = `### Instructions ### 
You are an expert enterprise architect specializing in creating Architecture Decision Records (ADRs) with a focus on ${adrType}.

Given the following context and requirements, create a comprehensive ADR following the template below. 
### Style ###
Ensure the ADR is clear, concise, and follows industry best practices.
The ADR should:
1. Clearly state the architectural decision - the position you selected
2. Provide sufficient context specifically tailored to ${adrType}
3. Explain the rationale behind the decision
4. Detail the consequences (both positive and negative)
5. Use professional and technical language appropriate to ${adrType}
6. Be structured according to the template
7. Note the organisational constraints relevant to ${adrType}
8. Argument: Outline why you selected a position, including items such as implementation effort, time to market, and required development resources

TEMPLATE:
${ADRTemplate}

CONTEXT BLOCK:
${contextADR}

USER REQUIREMENTS:
${messageString}

Generate a complete ADR based on the above context and requirements. Format it according to the template structure.`;

    const { text: generatedADR } = await generateText({
      model: openai("gpt-4"),
      prompt: systemPrompt,
      temperature: 0.7,
      maxTokens: 2000,
    });

    debugLog("CreateADR API - Generated ADR", generatedADR);

    return new Response(JSON.stringify(textToJSON(generatedADR)), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (e) {
    debugLog("Error in CreateADR API", e);
    return new Response(JSON.stringify({ 
      result: `Error creating ADR: ${(e as Error).message}`,
      error: true 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}