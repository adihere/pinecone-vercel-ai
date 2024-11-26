// app/api/createadr/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { getContext } from '../../utils/context';
import { openai } from '@ai-sdk/openai';

// IMPORTANT! Set the runtime to edge
export const runtime = 'edge';

const DEBUG = true;

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
    const { text: inputText } = await req.json();
    debugLog("CreateADR API - Input received", inputText);

    let messageString: string;
    messageString = typeof inputText === 'string' ? inputText : JSON.stringify(inputText);

    // Get the context from the input
    const contextADR = await getContext(messageString, '');
    debugLog("CreateADR API - Context retrieved", contextADR);

    const ADRExample = `EXAMPLE OF A WELL-FORMED ADR:

    # Use PostgreSQL as the Primary Database

    ## Status

    Accepted

    ## Context

    Our application requires a robust, scalable database solution to handle complex queries and large datasets. We need to choose between various relational and non-relational database options.

    ## Decision

    We have decided to use PostgreSQL as our primary database system.

    ## Consequences

    Positive:
    - PostgreSQL offers excellent performance for complex queries and large datasets.
    - It provides strong data integrity and ACID compliance.
    - PostgreSQL has a rich ecosystem of tools and extensions.
    - It supports both relational and non-relational (JSON) data structures.

    Negative:
    - There may be a learning curve for team members not familiar with PostgreSQL.
    - Horizontal scaling can be more challenging compared to some NoSQL alternatives.

    ## References

    - PostgreSQL official documentation: https://www.postgresql.org/docs/
    - Comparison of SQL and NoSQL databases: [Link to relevant article]
    `


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

    const systemPrompt = `You are an expert enterprise architect specializing in creating Architecture Decision Records (ADRs).
Given the following context and requirements, create a comprehensive ADR following the template below. 
Ensure the ADR is clear, concise, and follows industry best practices.

The ADR should:
1. Clearly state the architectural decision - the position you selected
2. Provide sufficient context
3. Explain the rationale behind the decision
4. Detail the consequences (both positive and negative)
5. Use professional and technical language
6. Be structured according to the template
7. Note the organisational constraints such as accepted technology standards, enterprise architecture, commonly employed patterns, and so on
8. Argument: Outline why you selected a position, including items such as implementation effort, time to market, and required development resources


TEMPLATE:
${ADRTemplate}

EXAMPLE OF A WELL-FORMED ADR:
${ADRExample}

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