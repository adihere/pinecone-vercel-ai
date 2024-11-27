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

    const ADRExample = `### Examples ###
    EXAMPLE 1 OF A WELL-FORMED ADR:
        Architectural Decision Record: Software Development Lifecycle Approach for ABC Application
    1. Decision
    We will adopt an adapted version of the GitFlow workflow for the development of the ABC application.
    2. Context
    The ABC application is a packaged solution designed for deployment in customer environments via a deployment package. Our development process needs to support a controllable feature, hotfix, and release pipeline.
    Key considerations:
    Packaged solution deployment
    Need for controllable feature development
    Requirement for efficient hotfix management
    Streamlined release process
    3. Rationale
    The adapted GitFlow workflow was chosen for the following reasons:
    Simplified branching strategy: We've eliminated hotfix/* and release/* branches to reduce complexity and improve responsiveness to production issues.
    Version control: The workflow enables effective management of release versioning for the ABC application.
    Flexibility: The adapted approach allows for quick bug fixes in production releases without compromising stability.
    Collaborative development: The use of protected branches and merge requests promotes code review and quality assurance.
    4. Consequences
    Positive
    Improved control over release versioning
    Enhanced collaboration through merge requests and code reviews
    Simplified hotfix process for quicker response to production issues
    Clear separation between ongoing development and stable releases
    Negative
    Increased complexity compared to trunk-based development or GitHub flow
    Additional overhead in branch management and merging processes
    5. Compliance
    To ensure adherence to this decision, the following measures must be implemented:
    Main and develop branches in each repository must be designated as protected.
    Changes to main and develop branches must be made through merge requests.
    A minimum of one approval is required for every merge request.
    6. Branching Strategy
    The adapted GitFlow workflow for ABC application consists of the following branches:
    main: Protected branch for tagging releases
    develop: Protected branch for ongoing development work
    feature/*: Branches for developing new features
    7. Organizational Constraints
    This decision aligns with the following organizational standards and practices:
    Accepted version control practices using Git
    Enterprise architecture guidelines for software development lifecycle
    Common branching patterns in software development
    Emphasis on code review and quality assurance processes
    8. Argument
    The adapted GitFlow workflow was selected based on the following considerations:
    Implementation effort: While more complex than simpler workflows, the benefits outweigh the initial setup and learning curve.
    Time to market: The streamlined approach allows for quicker releases and hotfixes compared to the full GitFlow model.
    Development resources: The workflow supports collaborative development and efficient code review processes, maximizing the effectiveness of our development team.
    Scalability: As the project grows, this workflow can accommodate increasing complexity and team size.
    By adopting this adapted GitFlow workflow, we strike a balance between structure and flexibility, enabling efficient development and release management for the ABC application.
    
    EXAMPLE 2 OF A WELL-FORMED ADR:

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

    const systemPrompt = `### Instructions ### 
You are an expert enterprise architect specializing in creating Architecture Decision Records (ADRs) and the output you create will be referred by stakeholders such as technology leaders , software engineers , solution architects , project managers and team leaders.

Given the following context and requirements, create a comprehensive ADR following the template below. 
### Style ###
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