// app/api/predict/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

// IMPORTANT! Set the runtime to edge
export const runtime = 'edge';

const DEBUG = true;

function debugLog(message: string, data: any = null) {
  if (DEBUG) {
    console.log(message);
    if (data !== null) {
      console.log(JSON.stringify(data, null, 2));
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const { text: inputText } = await req.json();
    debugLog("Predict Follow-up API - Input received", inputText);

    const predictPrompt = `
    ### ROLE ###
    You are an experienced enterprise architect reviewing Architecture Decision Records (ADRs) for a large enterprise.
    
    ### CONTEXT ###
    You are analyzing an ADR to suggest additions and improvements. Consider various aspects such as:
    - Non-functional requirements
    - Wider system context
    - DevOps practices
    - Site Reliability Engineering (SRE)
    - Observability
    - Testability
    - Business domain needs
    
    ### INPUT ###
    User message: ${inputText}
    
    ### TASK ###
    Generate 4 brief, relevant follow-up suggestions to improve the ADR document. Each suggestion should be:
    - Concise and open-ended
    - Practical and implementable
    - Encouraging further refinement of the topic
    - Effective in enhancing the overall architecture decision
    
    ### OUTPUT FORMAT ###
    - Provide 5 suggestions as bullet points
    - Each suggestion should be on a new line
    - Do not number the suggestions
    - After the suggestions, add a brief encouragement for the user to either choose one of the options or continue refining with their own ideas
    
    ### EXAMPLE OUTPUT ###
    • Consider the impact on system scalability
    • Evaluate potential security implications
    • Assess the alignment with current DevOps practices
    • Explore options for improved monitoring and alerting
    • Analyze the decision's effect on data governance
    
    Consider these suggestions as starting points. Feel free to choose one that resonates with you or continue refining the ADR with your own insights.
    `;
    
    const { text: predictedQuestions } = await generateText({
      model: openai("gpt-3.5-turbo"),
      prompt: predictPrompt,
      maxTokens: 150,
      temperature: 0.7,
    });

    debugLog("Predict Follow-up API - Predicted Questions", predictedQuestions);

    return new Response(JSON.stringify({ questions: predictedQuestions.split('\n').slice(1, 6) }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    debugLog("Error in Predict Follow-up API", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}